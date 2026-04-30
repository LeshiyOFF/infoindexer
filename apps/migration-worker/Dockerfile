# Migration Worker Dockerfile
#
# @remarks
# Multi-stage build для минимизации размера образа.
# Stage 1 собирает shared и migration-worker, Stage 2 использует результат.

# Stage 1: Build shared package and migration-worker
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy shared and migration-worker source
COPY packages/shared ./packages/shared
COPY apps/migration-worker ./apps/migration-worker

# Install dependencies and build
RUN npm ci --ignore-scripts
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/migration-worker

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json ./
COPY apps/migration-worker/package.json ./apps/migration-worker/

# Copy built shared package from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# Install dependencies
RUN npm install --production --ignore-scripts

# Copy migration-worker dist from builder
COPY --from=builder /app/apps/migration-worker/dist ./apps/migration-worker/dist

# Copy SQL migration files
COPY packages/shared/infrastructure/migrations/files ./packages/shared/infrastructure/migrations/files

# Set migrations directory
ENV MIGRATIONS_BASE_DIR=/app/packages/shared/infrastructure/migrations/files

# Run migration worker
CMD ["node", "apps/migration-worker/dist/index.js"]
