#!/bin/bash
# ClickHouse Database Init Adapter
#
# Implements IDatabaseInitializer port for ClickHouse
# Following Hexagonal Architecture: this is an Adapter
#
# Responsibilities:
# - Create database if not exists
# - Verify database is accessible
# - Exit with proper status code

set -euo pipefail

# ============================================================================
# Configuration (from environment)
# ============================================================================

readonly CLICKHOUSE_HOST="${CLICKHOUSE_HOST:-clickhouse}"
readonly CLICKHOUSE_PORT="${CLICKHOUSE_PORT:-9000}"
readonly CLICKHOUSE_HTTP_PORT="${CLICKHOUSE_HTTP_PORT:-8123}"
readonly DATABASE="${CLICKHOUSE_DB:-infoindexer}"
readonly CLICKHOUSE_USER="${CLICKHOUSE_USER:-default}"
readonly CLICKHOUSE_PASSWORD="${CLICKHOUSE_PASSWORD:-}"
readonly MAX_RETRIES="${MAX_RETRIES:-30}"
readonly RETRY_INTERVAL="${RETRY_INTERVAL:-2}"

# ============================================================================
# Logging
# ============================================================================

log_info() {
  echo "[INFO] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
}

log_success() {
  echo "[SUCCESS] $*" >&2
}

# ============================================================================
# Health Check
# ============================================================================

wait_for_clickhouse() {
  local retries=0

  log_info "Waiting for ClickHouse to be ready..."

  while [[ $retries -lt $MAX_RETRIES ]]; do
    if clickhouse-client \
      --host "$CLICKHOUSE_HOST" \
      --port "$CLICKHOUSE_HTTP_PORT" \
      --user "$CLICKHOUSE_USER" \
      --password "$CLICKHOUSE_PASSWORD" \
      --query "SELECT 1" &>/dev/null; then
      log_success "ClickHouse is ready"
      return 0
    fi

    retries=$((retries + 1))
    log_info "Retry $retries/$MAX_RETRIES..."
    sleep "$RETRY_INTERVAL"
  done

  log_error "ClickHouse is not ready after $MAX_RETRIES attempts"
  return 1
}

# ============================================================================
# Database Operations
# ============================================================================

create_database() {
  log_info "Creating database: $DATABASE"

  clickhouse-client \
    --host "$CLICKHOUSE_HOST" \
    --port "$CLICKHOUSE_HTTP_PORT" \
    --user "$CLICKHOUSE_USER" \
    --password "$CLICKHOUSE_PASSWORD" \
    --multiquery \
    --query "CREATE DATABASE IF NOT EXISTS ${DATABASE};"

  log_success "Database '$DATABASE' created or already exists"
}

verify_database() {
  log_info "Verifying database: $DATABASE"

  local result
  result=$(clickhouse-client \
    --host "$CLICKHOUSE_HOST" \
    --port "$CLICKHOUSE_HTTP_PORT" \
    --user "$CLICKHOUSE_USER" \
    --password "$CLICKHOUSE_PASSWORD" \
    --format "TSV" \
    --query "EXISTS DATABASE ${DATABASE};")

  if [[ "$result" == "1" ]]; then
    log_success "Database '$DATABASE' verified"
    return 0
  else
    log_error "Database '$DATABASE' does not exist after creation"
    return 1
  fi
}

# ============================================================================
# Main Orchestration
# ============================================================================

main() {
  log_info "Starting ClickHouse database initialization..."
  log_info "Target database: $DATABASE"
  log_info "ClickHouse host: $CLICKHOUSE_HOST:$CLICKHOUSE_HTTP_PORT"

  # Step 1: Wait for ClickHouse
  if ! wait_for_clickhouse; then
    log_error "Failed to connect to ClickHouse"
    return 1
  fi

  # Step 2: Create database
  if ! create_database; then
    log_error "Failed to create database"
    return 1
  fi

  # Step 3: Verify database
  if ! verify_database; then
    log_error "Database verification failed"
    return 1
  fi

  log_success "Database initialization completed successfully"
  return 0
}

# ============================================================================
# Entry Point
# ============================================================================

main "$@"
