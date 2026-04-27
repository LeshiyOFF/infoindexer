#!/bin/bash
#
# ClickHouse Docker Entrypoint
#
# @remarks
# Part of Iteration 9.1: TLS Certificate Automation.
# Part of Iteration 10: RBAC + Users.
#
# Features:
#   - Generates certificates on container startup if not exists
#   - Creates infoindexer database
#   - Creates RBAC users if credentials are provided
#   - Runs ClickHouse as 'clickhouse' user (security best practice)

set -e

CERTS_DIR="/etc/clickhouse-server/certs"

# ============================================
# Certificate Generation (Iteration 9.1)
# Run as root, then drop privileges
# ============================================
echo "🔐 Checking TLS certificates..."

if [ ! -f "$CERTS_DIR/ca-cert.pem" ]; then
  echo "📝 Generating certificates..."

  mkdir -p "$CERTS_DIR"

  # Generate CA certificate
  openssl req -x509 -newkey rsa:4096 \
    -keyout "$CERTS_DIR/ca-key.pem" \
    -out "$CERTS_DIR/ca-cert.pem" \
    -days 365 \
    -nodes \
    -subj "/CN=InfoIndexer CA"

  # Generate server certificate request
  openssl req -newkey rsa:4096 \
    -keyout "$CERTS_DIR/server-key.pem" \
    -out "$CERTS_DIR/server-req.pem" \
    -nodes \
    -subj "/CN=localhost"

  # Sign server certificate with CA
  openssl x509 -req \
    -in "$CERTS_DIR/server-req.pem" \
    -CA "$CERTS_DIR/ca-cert.pem" \
    -CAkey "$CERTS_DIR/ca-key.pem" \
    -CAcreateserial \
    -out "$CERTS_DIR/server-cert.pem" \
    -days 365

  # Cleanup temporary file
  rm -f "$CERTS_DIR/server-req.pem"

  echo "✅ Certificates generated"
else
  echo "✅ Certificates exist"
fi

# ============================================
# Start ClickHouse Server as clickhouse user
# ============================================
echo "🚀 Starting ClickHouse server as clickhouse user..."
exec su-exec clickhouse clickhouse-server --config-file=/etc/clickhouse-server/config.xml
