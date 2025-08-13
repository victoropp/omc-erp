# Deployment Guide

## Ghana OMC ERP System - Production Deployment

### Overview
This guide covers the complete deployment process for the Ghana OMC ERP system, from development environment setup to production deployment on Kubernetes with Istio service mesh.

## Prerequisites

### System Requirements
**Minimum Production Requirements**:
- **Kubernetes Cluster**: 3 master nodes, 6 worker nodes
- **CPU**: 24 cores minimum (48 cores recommended)
- **Memory**: 64GB minimum (128GB recommended)  
- **Storage**: 2TB SSD minimum (with backup storage)
- **Network**: 1Gbps minimum bandwidth

**Development Environment**:
- **Docker**: 20.10+
- **Kubernetes**: 1.25+
- **Node.js**: 18+
- **Python**: 3.9+
- **npm/yarn**: Latest stable

### Required Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Istio
curl -L https://istio.io/downloadIstio | sh -
sudo mv istio-*/bin/istioctl /usr/local/bin/

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Development Setup

### 1. Local Environment Setup
```bash
# Clone repository
git clone https://github.com/victoropp/omc-erp.git
cd omc-erp

# Install dependencies
npm install
cd services && find . -name "package.json" -execdir npm install \;
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env.development
# Edit .env.development with local configuration
```

### 2. Database Setup
```bash
# Start PostgreSQL with Docker
docker run --name omc-postgres \
  -e POSTGRES_DB=omc_erp_dev \
  -e POSTGRES_USER=omc_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  -d postgres:15

# Start Redis
docker run --name omc-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Start TimescaleDB for IoT data
docker run --name omc-timescale \
  -e POSTGRES_DB=omc_iot_dev \
  -e POSTGRES_USER=timescale_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5433:5432 \
  -d timescale/timescaledb:latest-pg15

# Run database migrations
cd packages/database
npm run migrate:dev
```

### 3. Development Services
```bash
# Start core services
docker-compose -f docker-compose.dev.yml up -d

# Start individual services for development
cd services/auth-service && npm run dev &
cd services/pricing-service && npm run dev &
cd services/payment-service && npm run dev &

# Start AI/ML platform
cd services/ml-platform
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py --dev

# Start dashboard
cd apps/dashboard && npm run dev
```

### 4. Mobile App Development
```bash
# Setup React Native development
cd apps/mobile
npm install

# iOS development (macOS only)
cd ios && pod install && cd ..
npm run ios

# Android development
npm run android

# Web development
npm run web
```

## Production Deployment

### 1. Infrastructure Setup

#### Kubernetes Cluster Setup
```bash
# Create namespace
kubectl create namespace omc-erp
kubectl create namespace omc-erp-monitoring
kubectl create namespace istio-system

# Label namespace for Istio injection
kubectl label namespace omc-erp istio-injection=enabled
```

#### Istio Installation
```bash
# Install Istio
istioctl install --set values.global.meshID=omc-erp-mesh \
  --set values.global.multiCluster.clusterName=omc-erp-cluster \
  --set values.global.network=omc-erp-network

# Apply Istio operator configuration
kubectl apply -f infrastructure/istio/operator.yaml

# Verify installation
kubectl get pods -n istio-system
```

### 2. Database Deployment

#### PostgreSQL High Availability
```bash
# Deploy PostgreSQL operator
helm repo add postgres-operator https://opensource.zalando.com/postgres-operator/charts/postgres-operator/
helm install postgres-operator postgres-operator/postgres-operator

# Deploy PostgreSQL cluster
kubectl apply -f infrastructure/database/postgresql-cluster.yaml
```

**postgresql-cluster.yaml**:
```yaml
apiVersion: "acid.zalan.do/v1"
kind: postgresql
metadata:
  name: omc-postgres-cluster
  namespace: omc-erp
spec:
  teamId: "omc-team"
  volume:
    size: 500Gi
    storageClass: fast-ssd
  numberOfInstances: 3
  users:
    omc_user:
    - superuser
    - createdb
  databases:
    omc_erp: omc_user
  postgresql:
    version: "15"
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
  patroni:
    initdb:
      encoding: "UTF8"
      locale: "en_US.UTF-8"
      data-checksums: "true"
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

#### Redis Cluster
```bash
# Deploy Redis operator
helm repo add redis-operator https://spotahome.github.io/redis-operator
helm install redis-operator redis-operator/redis-operator

# Deploy Redis cluster
kubectl apply -f infrastructure/database/redis-cluster.yaml
```

#### TimescaleDB for IoT
```bash
# Deploy TimescaleDB
kubectl apply -f infrastructure/database/timescaledb.yaml
```

### 3. Message Queue Deployment

#### Kafka Cluster
```bash
# Deploy Strimzi Kafka operator
kubectl create -f 'https://strimzi.io/install/latest?namespace=omc-erp' -n omc-erp

# Deploy Kafka cluster
kubectl apply -f infrastructure/kafka/kafka-cluster.yaml
```

**kafka-cluster.yaml**:
```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: omc-kafka
  namespace: omc-erp
spec:
  kafka:
    version: 3.5.0
    replicas: 3
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
    storage:
      type: persistent-claim
      size: 100Gi
      class: fast-ssd
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 10Gi
      class: fast-ssd
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

### 4. Configuration & Secrets

#### ConfigMaps
```bash
# Apply configuration
kubectl apply -f infrastructure/kubernetes/configmap.yaml

# Verify configuration
kubectl get configmap -n omc-erp
kubectl describe configmap omc-erp-config -n omc-erp
```

#### Secrets Management
```bash
# Create secrets (replace with actual values)
kubectl create secret generic omc-erp-secrets \
  --from-literal=DB_PASSWORD='production_db_password' \
  --from-literal=JWT_SECRET='production_jwt_secret_key' \
  --from-literal=MTN_MOMO_API_KEY='mtn_production_api_key' \
  --from-literal=MTN_MOMO_API_SECRET='mtn_production_api_secret' \
  --from-literal=VODAFONE_API_KEY='vodafone_production_api_key' \
  --from-literal=AIRTEL_API_KEY='airtel_production_api_key' \
  --from-literal=UPPF_API_KEY='uppf_production_api_key' \
  --from-literal=NPA_API_KEY='npa_production_api_key' \
  --from-literal=GRA_API_KEY='gra_production_api_key' \
  --from-literal=GRAFANA_ADMIN_PASSWORD='grafana_admin_password' \
  -n omc-erp

# Create TLS certificates
kubectl create secret tls omc-erp-tls \
  --cert=certificates/omc-erp.crt \
  --key=certificates/omc-erp.key \
  -n omc-erp
```

### 5. Service Deployment

#### Core Services Deployment
```bash
# Deploy all services
kubectl apply -f infrastructure/kubernetes/services/

# Verify deployment
kubectl get pods -n omc-erp
kubectl get services -n omc-erp
```

#### Service-by-Service Deployment
```bash
# Authentication Service
kubectl apply -f infrastructure/kubernetes/services/auth-service.yaml
kubectl rollout status deployment/auth-service -n omc-erp

# Pricing Service
kubectl apply -f infrastructure/kubernetes/services/pricing-service.yaml
kubectl rollout status deployment/pricing-service -n omc-erp

# Payment Service (Critical for Ghana market)
kubectl apply -f infrastructure/kubernetes/services/payment-service.yaml
kubectl rollout status deployment/payment-service -n omc-erp

# AI/ML Platform
kubectl apply -f infrastructure/kubernetes/services/ml-platform.yaml
kubectl rollout status deployment/ml-platform -n omc-erp

# IoT Service
kubectl apply -f infrastructure/kubernetes/services/iot-service.yaml
kubectl rollout status deployment/iot-service -n omc-erp
```

### 6. Istio Service Mesh Configuration

#### Gateway and Virtual Services
```bash
# Deploy Istio gateway
kubectl apply -f infrastructure/istio/gateway.yaml

# Verify gateway
kubectl get gateway -n omc-erp
kubectl get virtualservice -n omc-erp
```

#### Security Policies
```bash
# Apply security policies
kubectl apply -f infrastructure/istio/security-policies.yaml

# Verify mTLS is enabled
istioctl authn tls-check auth-service.omc-erp.svc.cluster.local
```

#### Traffic Management
```bash
# Apply destination rules
kubectl apply -f infrastructure/istio/destination-rules.yaml

# Test circuit breaker
kubectl apply -f infrastructure/istio/circuit-breaker.yaml
```

### 7. Monitoring Setup

#### Prometheus & Grafana
```bash
# Install monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace omc-erp-monitoring \
  --values infrastructure/monitoring/prometheus-values.yaml

# Verify monitoring
kubectl get pods -n omc-erp-monitoring
```

#### MLflow Deployment
```bash
# Deploy MLflow tracking server
kubectl apply -f infrastructure/monitoring/mlflow.yaml

# Verify MLflow
kubectl port-forward service/mlflow-service 5000:5000 -n omc-erp
# Access at http://localhost:5000
```

### 8. Application Deployment

#### Dashboard Deployment
```bash
# Build and deploy dashboard
cd apps/dashboard
npm run build

# Create Docker image
docker build -t omc-erp/dashboard:latest .
docker push your-registry/omc-erp/dashboard:latest

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/apps/dashboard.yaml
```

#### Mobile App Deployment

**React Native Build**:
```bash
cd apps/mobile

# Build for Android
npm run build:android:release

# Build for iOS (requires macOS and Xcode)
npm run build:ios:release

# Deploy to app stores (requires certificates and signing)
```

**PWA Deployment**:
```bash
# PWA is served from the dashboard
# Service worker is automatically deployed with dashboard
```

### 9. AI/ML Model Deployment

#### Model Training Pipeline
```bash
# Deploy training jobs
kubectl apply -f infrastructure/ml/training-jobs.yaml

# Monitor training progress
kubectl logs -f job/demand-forecasting-training -n omc-erp
```

#### Model Serving
```bash
# Deploy model serving infrastructure
kubectl apply -f infrastructure/ml/model-serving.yaml

# Load pre-trained models
kubectl apply -f infrastructure/ml/model-configs.yaml
```

### 10. External Integrations

#### Mobile Money Setup
```bash
# Test MTN MoMo integration
curl -X POST https://api.omc-erp.com/api/v1/payments/mtn-momo/test \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "GHS",
    "phoneNumber": "233XXXXXXXXX",
    "description": "Test payment"
  }'

# Test Vodafone Cash integration
curl -X POST https://api.omc-erp.com/api/v1/payments/vodafone/test \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "GHS",
    "phoneNumber": "233XXXXXXXXX",
    "description": "Test payment"
  }'
```

#### UPPF Integration Testing
```bash
# Test UPPF claims submission
curl -X POST https://api.omc-erp.com/api/v1/uppf/test-claim \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "TEST_DEALER_001",
    "period": "2024-01",
    "volumesClaimed": {
      "petrol": 10000,
      "diesel": 15000,
      "kerosene": 5000
    }
  }'
```

## Health Checks & Verification

### 1. Service Health
```bash
# Check all pods are running
kubectl get pods -n omc-erp

# Check service endpoints
kubectl get endpoints -n omc-erp

# Test service connectivity
kubectl run test-pod --image=curlimages/curl -n omc-erp --rm -it -- /bin/sh
curl http://auth-service:3001/health
curl http://pricing-service:3002/health
curl http://payment-service:3005/health
```

### 2. Database Connectivity
```bash
# Test PostgreSQL
kubectl exec -it omc-postgres-cluster-0 -n omc-erp -- psql -U omc_user -d omc_erp -c "SELECT version();"

# Test Redis
kubectl exec -it redis-cluster-0 -n omc-erp -- redis-cli ping

# Test TimescaleDB
kubectl exec -it timescaledb-0 -n omc-erp -- psql -U timescale_user -d omc_iot -c "SELECT version();"
```

### 3. External API Testing
```bash
# Test external APIs (using test credentials)
kubectl create job api-test --image=omc-erp/api-tester:latest -n omc-erp
kubectl logs job/api-test -n omc-erp
```

### 4. Performance Testing
```bash
# Load test critical endpoints
kubectl apply -f infrastructure/testing/load-test.yaml

# Monitor performance
kubectl get pods -n omc-erp -w
kubectl top pods -n omc-erp
```

## Scaling Configuration

### 1. Horizontal Pod Autoscaler
```bash
# HPA is automatically applied with service deployments
# Check HPA status
kubectl get hpa -n omc-erp

# Test scaling
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh
while true; do wget -q -O- http://auth-service:3001/health; done
```

### 2. Cluster Autoscaler
```bash
# Configure cluster autoscaler (cloud-provider specific)
# Example for AWS EKS
kubectl apply -f infrastructure/autoscaling/cluster-autoscaler-aws.yaml
```

### 3. Vertical Pod Autoscaler
```bash
# Install VPA (optional)
helm install vpa-controller vpa/vpa --namespace kube-system
kubectl apply -f infrastructure/autoscaling/vpa-configs.yaml
```

## Backup & Disaster Recovery

### 1. Database Backup
```bash
# PostgreSQL backup
kubectl apply -f infrastructure/backup/postgres-backup.yaml

# Verify backup
kubectl get cronjob postgres-backup -n omc-erp
kubectl get pods -l job-name=postgres-backup -n omc-erp
```

### 2. Configuration Backup
```bash
# Backup all configurations
kubectl get all,configmap,secret -n omc-erp -o yaml > backup/k8s-config-$(date +%Y%m%d).yaml

# Store in version control
git add backup/k8s-config-$(date +%Y%m%d).yaml
git commit -m "Backup kubernetes configuration $(date)"
git push
```

### 3. Disaster Recovery Testing
```bash
# Test disaster recovery procedures
kubectl apply -f infrastructure/testing/disaster-recovery-test.yaml
```

## Maintenance Procedures

### 1. Rolling Updates
```bash
# Update service image
kubectl set image deployment/auth-service auth-service=omc-erp/auth-service:v1.1.0 -n omc-erp

# Monitor rollout
kubectl rollout status deployment/auth-service -n omc-erp

# Rollback if needed
kubectl rollout undo deployment/auth-service -n omc-erp
```

### 2. Database Maintenance
```bash
# Database maintenance window
kubectl apply -f infrastructure/maintenance/maintenance-mode.yaml

# Run maintenance tasks
kubectl apply -f infrastructure/maintenance/db-maintenance-job.yaml

# Exit maintenance mode
kubectl delete -f infrastructure/maintenance/maintenance-mode.yaml
```

### 3. Certificate Renewal
```bash
# Renew TLS certificates
kubectl apply -f infrastructure/certificates/cert-renewal.yaml

# Update Istio gateway
kubectl apply -f infrastructure/istio/gateway.yaml
```

## Troubleshooting

### 1. Common Issues

**Pod Stuck in Pending**:
```bash
kubectl describe pod <pod-name> -n omc-erp
# Check resource constraints and node capacity
```

**Service Unavailable**:
```bash
kubectl get endpoints <service-name> -n omc-erp
kubectl logs <pod-name> -n omc-erp
```

**Database Connection Issues**:
```bash
kubectl exec -it <pod-name> -n omc-erp -- env | grep DB_
kubectl port-forward service/postgres-service 5432:5432 -n omc-erp
```

### 2. Log Analysis
```bash
# Centralized logging
kubectl logs -f deployment/auth-service -n omc-erp
kubectl logs -f deployment/payment-service -n omc-erp

# Istio proxy logs
kubectl logs <pod-name> -c istio-proxy -n omc-erp
```

### 3. Performance Debugging
```bash
# Check resource usage
kubectl top pods -n omc-erp
kubectl describe node

# Network debugging
istioctl proxy-config routes <pod-name> -n omc-erp
istioctl proxy-status -n omc-erp
```

## Production Checklist

### Pre-Deployment
- [ ] All secrets configured with production values
- [ ] Database backups tested and verified
- [ ] SSL certificates installed and valid
- [ ] External API credentials verified
- [ ] Monitoring and alerting configured
- [ ] Disaster recovery procedures documented
- [ ] Performance testing completed
- [ ] Security scanning passed

### Post-Deployment
- [ ] All health checks passing
- [ ] Mobile money integrations tested
- [ ] UPPF integration verified
- [ ] IoT sensors connecting properly
- [ ] AI/ML models training successfully
- [ ] Monitoring dashboards showing data
- [ ] Backup procedures verified
- [ ] Load balancing working correctly
- [ ] SSL certificates valid and trusted
- [ ] Performance metrics within targets

### Go-Live Checklist
- [ ] DNS records updated
- [ ] CDN configured for Ghana regions
- [ ] Mobile apps submitted to stores
- [ ] User training completed
- [ ] Support documentation updated
- [ ] Incident response procedures in place
- [ ] Monitoring alerts configured
- [ ] Escalation procedures documented

---

**Deployment optimized for Ghana's infrastructure and regulatory requirements**