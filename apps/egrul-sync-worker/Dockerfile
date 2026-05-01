FROM node:20.18.0-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY apps/egrul-sync-worker apps/egrul-sync-worker
COPY scripts scripts/

RUN npm ci --ignore-scripts --os=linux --cpu=x64
RUN npm rebuild duckdb

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=egrul-sync-worker

FROM node:20.18.0-slim AS runtime

WORKDIR /app

# Копируем всё из builder включая node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/egrul-sync-worker/dist ./apps/egrul-sync-worker/dist
COPY --from=builder /app/apps/egrul-sync-worker/src/core/infrastructure/migrations ./apps/egrul-sync-worker/dist/src/core/infrastructure/migrations

ENV NODE_ENV=production

CMD ["node", "apps/egrul-sync-worker/dist/src/index.js"]
