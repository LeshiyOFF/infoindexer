# Stage 1: Builder
FROM node:20.18.0-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/admin-ui/package.json apps/admin-ui/
COPY apps/sync-worker/package.json apps/sync-worker/
COPY apps/egrul-sync-worker/package.json apps/egrul-sync-worker/
COPY apps/contacts-parser/package.json apps/contacts-parser/

# Install dependencies for both root and workspaces
# BuildKit cache: повторные сборки не перекачивают пакеты заново
# PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: workers/admin-ui не используют Playwright — экономия ~10–20 мин
# --ignore-scripts: postinstall пытается создать сертификаты до копирования кода
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
# Rebuild DuckDB native module (required after --ignore-scripts)
RUN npm rebuild duckdb

# Copy source code and build all
COPY . .
# Расширение httpfs не в git; подтягиваем при сборке (нужно сетевое соединение)
RUN apt-get update && apt-get install -y ca-certificates findutils && rm -rf /var/lib/apt/lists/*
RUN node scripts/docker-fetch-duckdb-httpfs.cjs
RUN npm run build --workspace=packages/shared
# Увеличиваем лимит памяти для Next.js сборки
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN npm run build --workspaces --if-present

# Stage 2: Runtime
FROM node:20.18.0-slim AS runtime
WORKDIR /app

# Copy ALL necessary workspace files for root 'npm start' to work
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Admin UI
COPY --from=builder /app/apps/admin-ui/.next ./apps/admin-ui/.next
COPY --from=builder /app/apps/admin-ui/public ./apps/admin-ui/public
COPY --from=builder /app/apps/admin-ui/package.json ./apps/admin-ui/package.json
COPY --from=builder /app/apps/admin-ui/next.config.mjs ./apps/admin-ui/next.config.mjs
COPY --from=builder /app/apps/admin-ui/regions.json ./apps/admin-ui/regions.json

# Sync Worker - complete dist + migrations + assets
COPY --from=builder /app/apps/sync-worker/dist ./apps/sync-worker/dist
COPY --from=builder /app/apps/sync-worker/src/core/infrastructure/migrations ./apps/sync-worker/dist/core/infrastructure/migrations
COPY --from=builder /app/apps/sync-worker/package.json ./apps/sync-worker/package.json
COPY --from=builder /app/apps/sync-worker/descriptive_names_dict.csv ./apps/sync-worker/descriptive_names_dict.csv
COPY --from=builder /app/apps/sync-worker/httpfs.duckdb_extension ./apps/sync-worker/httpfs.duckdb_extension

# EGRUL Sync Worker - complete dist + migrations
COPY --from=builder /app/apps/egrul-sync-worker/dist ./apps/egrul-sync-worker/dist
COPY --from=builder /app/apps/egrul-sync-worker/src/core/infrastructure/migrations ./apps/egrul-sync-worker/dist/core/infrastructure/migrations
COPY --from=builder /app/apps/egrul-sync-worker/package.json ./apps/egrul-sync-worker/package.json

# Contacts Parser - complete dist
COPY --from=builder /app/apps/contacts-parser/dist ./apps/contacts-parser/dist
COPY --from=builder /app/apps/contacts-parser/package.json ./apps/contacts-parser/package.json

ENV NODE_ENV=production
# Default command (will be overridden in docker-compose)
CMD ["npm", "start"]
