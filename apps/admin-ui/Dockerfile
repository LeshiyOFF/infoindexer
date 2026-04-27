# Multi-stage Dockerfile for Next.js 14 Production
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ../../package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/admin-ui/package*.json ./apps/admin-ui/

# Install dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

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
WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/apps/admin-ui/.next/standalone ./
COPY --from=builder /app/apps/admin-ui/.next/static ./.next/static
COPY --from=builder /app/apps/admin-ui/public ./public

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "server.js"]
