# ClickHouse Init Container
#
# Image for database initialization
# Implements IDatabaseInitializer port adapter
#
# Responsibility: Create ClickHouse database on startup
# Follows SRP: single purpose, no extra dependencies
#
# Base image: clickhouse/clickhouse-server (same version as main service)
# Contains clickhouse-client needed for database operations

FROM clickhouse/clickhouse-server:24.3

# Labels for metadata
LABEL maintainer="infoindexer"
LABEL description="ClickHouse database initialization adapter"
LABEL version="1.0.0"

# Copy entrypoint script
COPY --chmod=755 entrypoint.sh /docker-entrypoint-initdb.d/01-init-database.sh

# Set as entrypoint
ENTRYPOINT ["/bin/bash", "/docker-entrypoint-initdb.d/01-init-database.sh"]

# Health check (optional, for debugging)
HEALTHCHECK --interval=5s --timeout=3s --retries=1 \
  CMD clickhouse-client --query "SELECT 1" || exit 1
