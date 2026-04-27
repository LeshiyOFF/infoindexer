#!/bin/bash
#
# generate-certs.sh
#
# @remarks
# Generates CA and server certificates for ClickHouse TLS.
# Run once before starting ClickHouse with TLS enabled.
#
# Usage:
#   ./generate-certs.sh
#
# Files created:
#   - ca-cert.pem     CA certificate (public)
#   - ca-key.pem      CA private key (SECRET)
#   - server-cert.pem Server certificate (public)
#   - server-key.pem  Server private key (SECRET)
#   - ca-cert.srl     CA serial number file
#
# Security:
#   - .pem files are in .gitignore (secrets)
#   - 4096-bit RSA keys
#   - 365 days validity
#
# Architecture:
#   Part of Iteration 9: TLS/SSL + Certificates
#   See: PLAN_NADEZHNOSTI_BD.md

set -e

# ============================================
# CONFIGURATION
# ============================================

CERTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CA_SUBJECT="/CN=InfoIndexer CA"
SERVER_SUBJECT="/CN=localhost"
DAYS_VALID=365

# ============================================
# GENERATION
# ============================================

echo "Generating ClickHouse TLS certificates..."

# CA Certificate (self-signed)
echo "[1/4] Generating CA certificate..."
openssl req -x509 -newkey rsa:4096 \
  -keyout "$CERTS_DIR/ca-key.pem" \
  -out "$CERTS_DIR/ca-cert.pem" \
  -days "$DAYS_VALID" \
  -nodes \
  -subj "$CA_SUBJECT"

# Server Certificate Signing Request
echo "[2/4] Generating server certificate request..."
openssl req -newkey rsa:4096 \
  -keyout "$CERTS_DIR/server-key.pem" \
  -out "$CERTS_DIR/server-req.pem" \
  -nodes \
  -subj "$SERVER_SUBJECT"

# Server Certificate (signed by CA)
echo "[3/4] Signing server certificate with CA..."
openssl x509 -req \
  -in "$CERTS_DIR/server-req.pem" \
  -CA "$CERTS_DIR/ca-cert.pem" \
  -CAkey "$CERTS_DIR/ca-key.pem" \
  -CAcreateserial \
  -out "$CERTS_DIR/server-cert.pem" \
  -days "$DAYS_VALID"

# Cleanup temporary file
echo "[4/4] Cleaning up temporary files..."
rm -f "$CERTS_DIR/server-req.pem"

# ============================================
# SUMMARY
# ============================================

echo ""
echo "✓ Certificates generated successfully!"
echo ""
echo "Created files:"
echo "  - $CERTS_DIR/ca-cert.pem      (CA certificate)"
echo "  - $CERTS_DIR/ca-key.pem       (CA private key - SECRET)"
echo "  - $CERTS_DIR/server-cert.pem  (Server certificate)"
echo "  - $CERTS_DIR/server-key.pem   (Server private key - SECRET)"
echo ""
echo "To enable TLS in ClickHouse:"
echo "  1. Set CLICKHOUSE_SECURE=true in docker-compose.yml"
echo "  2. Restart: docker-compose down && docker-compose up -d"
echo ""
echo "⚠️  WARNING: Never commit .pem files to git!"
