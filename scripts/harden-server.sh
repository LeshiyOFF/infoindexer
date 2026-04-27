#!/bin/bash
# Server Hardening Script - Итерация 2
# Run with: ./scripts/harden-server.sh
# Creates backups and applies security settings

set -e

BACKUP_DIR="/root/backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "=== Server Hardening - Итерация 2 ==="
echo "Timestamp: $TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ============================================
# PHASE 0: Backups
# ============================================
echo "[0/4] Creating backups..."
cp /etc/ssh/sshd_config "$BACKUP_DIR/sshd_config.backup-$TIMESTAMP"
cp /etc/passwd /etc/shadow "$BACKUP_DIR/"
dpkg -l > "$BACKUP_DIR/packages-list.txt"
echo "✓ Backups created in $BACKUP_DIR"

# ============================================
# PHASE 1: SSH Hardening
# ============================================
echo "[1/4] Hardening SSH..."
cat > /etc/ssh/sshd_config.d/security.conf << 'EOF'
# SSH Hardening - Итерация 2
PasswordAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
KbdInteractiveAuthentication no
EOF

# Test syntax
sshd -t || { echo "✗ SSH syntax error!"; exit 1; }

# Create watchdog
cat > /tmp/ssh-watchdog.sh << 'WATCHDOG_EOF'
#!/bin/bash
sleep 120
echo "Watchdog: Rolling back SSH..."
cp /root/backup/sshd_config.backup-* /etc/ssh/sshd_config
rm -f /etc/ssh/sshd_config.d/security.conf
systemctl restart sshd
echo "Rolled back"
WATCHDOG_EOF
chmod +x /tmp/ssh-watchdog.sh
nohup /tmp/ssh-watchdog.sh > /tmp/watchdog.log 2>&1 &
WATCHDOG_PID=$!

# Restart SSH
systemctl restart sshd
sleep 3

# Verify access
if ssh -i ~/.ssh/server_deploy -o StrictHostKeyChecking=no root@localhost "echo 'OK'" 2>/dev/null; then
    kill $WATCHDOG_PID 2>/dev/null
    echo "✓ SSH hardening applied"
else
    echo "✗ SSH access lost! Watchdog will rollback in 2 minutes..."
    exit 1
fi

# ============================================
# PHASE 2: Firewall (UFW)
# ============================================
echo "[2/4] Configuring firewall..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Create watchdog
cat > /tmp/firewall-watchdog.sh << 'WATCHDOG_EOF'
#!/bin/bash
sleep 120
echo "Watchdog: Disabling firewall..."
ufw --force disable
ufw --force reset
echo "Firewall disabled"
WATCHDOG_EOF
chmod +x /tmp/firewall-watchdog.sh
nohup /tmp/firewall-watchdog.sh > /tmp/fw-watchdog.log 2>&1 &
FW_PID=$!

# Enable firewall
ufw --force enable
sleep 3

# Verify access
if ssh -i ~/.ssh/server_deploy -o StrictHostKeyChecking=no root@localhost "echo 'OK'" 2>/dev/null; then
    kill $FW_PID 2>/dev/null
    echo "✓ Firewall enabled"
else
    echo "✗ Firewall blocked access! Watchdog will rollback..."
    exit 1
fi

# ============================================
# PHASE 3: Fail2Ban
# ============================================
echo "[3/4] Installing Fail2Ban..."
apt update > /dev/null 2>&1
apt install -y fail2ban > /dev/null 2>&1

# Configure
mkdir -p /etc/fail2ban/jail.d
cat > /etc/fail2ban/jail.d/custom.conf << 'EOF'
[DEFAULT]
bantime = 24h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
EOF

systemctl restart fail2ban
systemctl enable fail2ban > /dev/null 2>&1
echo "✓ Fail2Ban configured"

# ============================================
# PHASE 4: Monitoring
# ============================================
echo "[4/4] Setting up monitoring..."

# Health check script
cat > /usr/local/bin/server-health.sh << 'EOF'
#!/bin/bash
echo '=== Server Health ==='
echo "Disk: $(df -h / | tail -1 | awk '{print $5}') used"
echo "Memory: $(free | grep Mem | awk '{print $3/$2 * 100.0}')% used"
echo "Docker: $(docker ps --format '{{.State}}' | grep -c running)/$(docker ps -a | wc -l) running"
echo "SSH: $(systemctl is-active sshd)"
echo "UFW: $(ufw status | grep -c 'ALLOW') rules active"
echo "Fail2Ban: $(systemctl is-active fail2ban)"
date
EOF
chmod +x /usr/local/bin/server-health.sh

# Logrotate
cat > /etc/logrotate.d/docker-compose << 'EOF'
/root/infoindexer/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF

echo "✓ Monitoring configured"

# ============================================
# Summary
# ============================================
echo ""
echo "=== Hardening Complete ==="
echo ""
echo "Security Status:"
echo "  SSH: Password auth DISABLED"
echo "  Root: prohibit-password (key only)"
echo "  Firewall: ACTIVE (22, 80, 443)"
echo "  Fail2Ban: ACTIVE (3 failures → 24h ban)"
echo ""
echo "Commands:"
echo "  Check health: /usr/local/bin/server-health.sh"
echo "  View firewall: ufw status"
echo "  View bans: fail2ban-client status sshd"
echo ""
echo "Backups in: $BACKUP_DIR"
echo ""
/usr/local/bin/server-health.sh
