# Dashboard Frontend Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy workspace files
COPY package*.json pnpm-lock.yaml* ./
COPY turbo.json ./
COPY packages/ ./packages/

# Copy app specific files
COPY apps/dashboard/package*.json ./apps/dashboard/
COPY apps/dashboard/ ./apps/dashboard/

# Install dependencies
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build --filter=dashboard

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dashboard -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=dashboard:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=dashboard:nodejs /app/apps/dashboard/.next/static ./.next/static
COPY --from=builder --chown=dashboard:nodejs /app/apps/dashboard/public ./public

# Set user
USER dashboard

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]