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
set -e
cd /root/infoindexer
git pull origin master
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker image prune -af --filter "until=24h"
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
