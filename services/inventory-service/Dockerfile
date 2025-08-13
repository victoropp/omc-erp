# inventory-service Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy workspace files
COPY package*.json pnpm-lock.yaml* ./
COPY turbo.json ./
COPY packages/ ./packages/

# Copy service specific files
COPY services/inventory-service/package*.json ./services/inventory-service/
COPY services/inventory-service/ ./services/inventory-service/

# Install dependencies
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build --filter=@omc-erp/inventory-service

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S inventory-service -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=inventory-service:nodejs /app/services/inventory-service/dist ./dist
COPY --from=builder --chown=inventory-service:nodejs /app/services/inventory-service/package*.json ./
COPY --from=builder --chown=inventory-service:nodejs /app/node_modules ./node_modules

# Set user
USER inventory-service

# Expose port
EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3009/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
