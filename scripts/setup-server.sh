#!/bin/bash
# Setup server for INFOINDEXER deployment
# Run as root on the server

set -e

echo "=== INFOINDEXER Server Setup ==="

# 1. Create deploy user
echo "[1/6] Creating deploy user..."
if ! id -u deploy > /dev/null 2>&1; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    echo "✓ User 'deploy' created"
else
    echo "✓ User 'deploy' already exists"
fi

# 2. Generate SSH keys for deploy user
echo "[2/6] Generating SSH keys..."
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

if [ ! -f /home/deploy/.ssh/github_actions ]; then
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f /home/deploy/.ssh/github_actions -N ""
    cat /home/deploy/.ssh/github_actions.pub >> /home/deploy/.ssh/authorized_keys
    chmod 600 /home/deploy/.ssh/authorized_keys
    chown -R deploy:deploy /home/deploy/.ssh
    echo "✓ SSH keys generated"
    echo ""
    echo "=== ADD THIS TO GITHUB SECRETS ==="
    echo "Secret name: DEPLOY_SSH_KEY"
    cat /home/deploy/.ssh/github_actions
    echo "==================================="
else
    echo "✓ SSH keys already exist"
    echo "Public key:"
    cat /home/deploy/.ssh/github_actions.pub
fi

# 3. Setup sudoers for deploy user
echo "[3/6] Configuring sudoers..."
if ! grep -q "deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose" /etc/sudoers; then
    echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" >> /etc/sudoers.d/deploy
    chmod 440 /etc/sudoers.d/deploy
    echo "✓ Sudoers configured"
else
    echo "✓ Sudoers already configured"
fi

# 4. Clone repository
echo "[4/6] Setting up repository..."
if [ ! -d /root/infoindexer ]; then
    if [ -z "$REPO_URL" ]; then
        REPO_URL="https://github.com/LeshiyOFF/infoindexer.git"
    fi
    git clone "$REPO_URL" /root/infoindexer
    echo "✓ Repository cloned"
else
    echo "✓ Repository already exists"
fi

# 5. Create .env from example if not exists
echo "[5/6] Setting up environment..."
cd /root/infoindexer
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠ .env created from example - please configure manually!"
    echo "  Edit: /root/infoindexer/.env"
else
    echo "✓ .env already exists"
fi

# 6. Setup deployment script
echo "[6/6] Creating deployment script..."
cat > /usr/local/bin/infoindexer-deploy << 'DEPLOY_SCRIPT'
#!/bin/bash
set -euo pipefail

DEPLOY_DIR="/root/infoindexer"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
PROJECT_NAME="infoindexer"

cd "$DEPLOY_DIR"

# Pull latest code
git config core.sshCommand "ssh -i /root/.ssh/deploy_github -o StrictHostKeyChecking=no"
git fetch origin
git reset --hard origin/master
git clean -fd

# Pull latest images
docker compose $COMPOSE_FILES pull

# Ensure network exists
if ! docker network inspect "${PROJECT_NAME}_infoindexer_net" &>/dev/null; then
  docker network create "${PROJECT_NAME}_infoindexer_net"
fi

# Sequential Recreate: shutdown all
docker compose $COMPOSE_FILES down --remove-orphans

# Start core services
docker compose $COMPOSE_FILES up -d clickhouse redis

# Wait for core services health
echo "Waiting for ClickHouse..."
timeout 60s bash -c 'until docker compose $COMPOSE_FILES exec -T clickhouse clickhouse-client --query "SELECT 1" &>/dev/null; do sleep 1; done' || {
  echo "ClickHouse healthcheck failed"
  exit 1
}

echo "Waiting for Redis..."
timeout 30s bash -c 'until docker compose $COMPOSE_FILES exec -T redis redis-cli ping &>/dev/null; do sleep 1; done' || {
  echo "Redis healthcheck failed"
  exit 1
}

# Start all services
docker compose $COMPOSE_FILES up -d

# Cleanup old images
docker image prune -af --filter "until=24h"

echo "Deployment completed successfully"
DEPLOY_SCRIPT

chmod +x /usr/local/bin/infoindexer-deploy
echo "✓ Deployment script created: /usr/local/bin/infoindexer-deploy"

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Add DEPLOY_SSH_KEY to GitHub Secrets (see above)"
echo "2. Add SERVER_HOST=$(hostname -I | awk '{print $1}') to GitHub Secrets"
echo "3. Add SERVER_USER=root to GitHub Secrets"
echo "4. Configure /root/infoindexer/.env"
echo "5. Run: cd /root/infoindexer && docker compose up -d"
