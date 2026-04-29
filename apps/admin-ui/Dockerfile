# Multi-stage Dockerfile for Next.js 14 Production
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/admin-ui/package*.json ./apps/admin-ui/

# Install all workspace dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts --workspaces=false && \
    npm install --legacy-peer-deps --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/admin-ui ./apps/admin-ui
COPY tsconfig.json ./
COPY package*.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build admin-ui with standalone output
WORKDIR /app/apps/admin-ui
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# WORKDIR points to app directory in monorepo
WORKDIR /app/apps/admin-ui

# Copy standalone contents (using ./ to copy contents, not the directory itself)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/standalone/apps/admin-ui/. ./

# Copy node_modules from standalone (workspace dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/standalone/node_modules /app/apps/admin-ui/node_modules/

# Copy static files (OFFICIAL Next.js method)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/public ./public/
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/static ./.next/static/

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# server.js is now at WORKDIR root
CMD ["node", "server.js"]
