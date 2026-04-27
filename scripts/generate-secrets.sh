#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SECRETS_DIR="$PROJECT_ROOT/secrets"

echo "Generating secrets for InfoIndexer..."

mkdir -p "$SECRETS_DIR"

openssl rand -base64 32 > "$SECRETS_DIR/admin_password.txt"
openssl rand -base64 32 > "$SECRETS_DIR/worker_password.txt"
openssl rand -base64 32 > "$SECRETS_DIR/api_password.txt"

chmod 600 "$SECRETS_DIR"/*

echo "Secrets generated in ./secrets/"
echo ""
echo "Files created:"
echo "  - secrets/admin_password.txt"
echo "  - secrets/worker_password.txt"
echo "  - secrets/api_password.txt"
echo ""
echo "Security: All files have chmod 600 permissions"
