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
