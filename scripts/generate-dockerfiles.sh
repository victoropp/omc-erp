#!/bin/bash

# Generate Dockerfiles for all services
SERVICES=(
  "transaction-service:3002"
  "station-service:3003"
  "pricing-service:3004"
  "uppf-service:3005"
  "regulatory-service:3006"
  "configuration-service:3007"
  "accounting-service:3008"
  "inventory-service:3009"
  "customer-service:3010"
  "fleet-service:3011"
  "payment-service:3012"
  "ai-forecasting-service:3013"
  "iot-service:3014"
  "fraud-detection-service:3015"
  "forex-service:3016"
)

for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r service_name port <<< "$service_info"
  
  cat > "services/${service_name}/Dockerfile" << EOF
# ${service_name} Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy workspace files
COPY package*.json pnpm-lock.yaml* ./
COPY turbo.json ./
COPY packages/ ./packages/

# Copy service specific files
COPY services/${service_name}/package*.json ./services/${service_name}/
COPY services/${service_name}/ ./services/${service_name}/

# Install dependencies
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build --filter=@omc-erp/${service_name}

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \\
    apk add --no-cache dumb-init curl ca-certificates && \\
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S ${service_name} -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=${service_name}:nodejs /app/services/${service_name}/dist ./dist
COPY --from=builder --chown=${service_name}:nodejs /app/services/${service_name}/package*.json ./
COPY --from=builder --chown=${service_name}:nodejs /app/node_modules ./node_modules

# Set user
USER ${service_name}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
EOF

  echo "Created Dockerfile for ${service_name}"
done

# Special case for ML Platform (Python service)
cat > "services/ml-platform/Dockerfile" << 'EOF'
# ML Platform Dockerfile
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY services/ml-platform/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim AS production

# Install security updates and runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN useradd --create-home --shell /bin/bash --uid 1001 ml-platform

# Copy installed packages from builder
COPY --from=builder /root/.local /home/ml-platform/.local

# Copy application
COPY --chown=ml-platform:ml-platform services/ml-platform/ /app/

WORKDIR /app

# Set user
USER ml-platform

# Add local packages to PATH
ENV PATH="/home/ml-platform/.local/bin:$PATH"

# Expose port
EXPOSE 3017

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3017/health || exit 1

# Start application
CMD ["python", "src/main.py"]
EOF

echo "Created Dockerfile for ml-platform"
echo "All Dockerfiles generated successfully!"