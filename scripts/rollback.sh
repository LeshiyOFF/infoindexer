#!/bin/bash
# Rollback INFOINDEXER to previous version
# Run on the server

set -e

echo "=== INFOINDEXER Rollback ==="

cd /root/infoindexer

# Show current version
echo "Current commit:"
git log -1 --oneline

# Show recent versions
echo ""
echo "Recent versions:"
git log --oneline -10

# Prompt for commit hash
read -p "Enter commit hash to rollback to (or Ctrl+C to cancel): " COMMIT_HASH

if [ -z "$COMMIT_HASH" ]; then
    echo "No commit specified. Aborting."
    exit 1
fi

# Confirm
echo ""
echo "Will rollback to: $COMMIT_HASH"
git log -1 --oneline $COMMIT_HASH
read -p "Confirm? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 1
fi

# Rollback
echo "Rolling back..."
git reset --hard $COMMIT_HASH

# Restart services
echo "Restarting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "✓ Rollback complete"
