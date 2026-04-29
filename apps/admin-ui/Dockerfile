# Multi-stage Dockerfile for Next.js 14 Production
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/admin-ui/package*.json ./apps/admin-ui/

# Install all workspace dependencies (prod + dev for build)
RUN npm ci --legacy-peer-deps --ignore-scripts

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

# Build shared package from root (PATH remains correct for workspaces)
RUN npm run build --workspace=shared

# Build admin-ui with standalone output from root
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=admin-ui

# Stage 3: Production Runner
# Based on official Turborepo example: https://github.com/vercel/turborepo/blob/main/examples/with-docker/apps/web/Dockerfile
FROM node:20-alpine AS runner

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs

WORKDIR /app

# Copy standalone (preserves monorepo structure with node_modules at root)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/standalone ./

# Copy static files (official Next.js method)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/public ./apps/admin-ui/public/
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/static ./apps/admin-ui/.next/static/

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

EXPOSE 3000

# Official Turborepo pattern: full path in CMD
CMD ["node", "apps/admin-ui/server.js"]
