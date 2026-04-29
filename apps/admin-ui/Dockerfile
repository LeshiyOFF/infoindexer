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
# WORKDIR points to app directory in monorepo
WORKDIR /app/apps/admin-ui

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output to /app (preserves monorepo structure)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/standalone /app/

# Copy static files (OFFICIAL Next.js method: cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/public /app/apps/admin-ui/public/
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/static /app/apps/admin-ui/.next/static/

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# server.js is now at WORKDIR root
CMD ["node", "server.js"]
