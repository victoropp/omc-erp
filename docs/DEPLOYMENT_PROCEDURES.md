# Ghana OMC SaaS ERP - Deployment Procedures

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup Configuration](#backup-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Deployment Overview

### Deployment Architecture
- **Infrastructure**: AWS with multi-region setup
- **Container Orchestration**: Amazon EKS (Kubernetes)
- **CI/CD**: GitHub Actions + ArgoCD
- **Infrastructure as Code**: Terraform
- **Configuration Management**: Helm Charts
- **Secrets Management**: AWS Secrets Manager

### Deployment Environments

```yaml
Development:
  - Region: us-east-1
  - Cluster: omc-erp-dev
  - Database: RDS PostgreSQL (t3.medium)
  - Cache: ElastiCache (cache.t3.micro)
  
Staging:
  - Region: af-south-1
  - Cluster: omc-erp-staging
  - Database: RDS PostgreSQL (r5.large)
  - Cache: ElastiCache (cache.r5.large)
  
Production:
  - Primary Region: af-south-1
  - Secondary Region: eu-west-1
  - Cluster: omc-erp-prod (Primary), omc-erp-dr (DR)
  - Database: RDS PostgreSQL (r5.2xlarge) with Multi-AZ
  - Cache: ElastiCache Cluster Mode (cache.r5.xlarge)
```

---

## Infrastructure Setup

### Prerequisites

#### Required Tools
```bash
# Install required CLI tools
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Helm
curl https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# ArgoCD CLI
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
```

#### AWS Configuration
```bash
# Configure AWS credentials
aws configure set aws_access_key_id YOUR_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_SECRET_KEY
aws configure set region af-south-1
aws configure set output json

# Verify access
aws sts get-caller-identity
aws eks list-clusters --region af-south-1
```

### 1. VPC and Network Setup

#### Terraform Configuration (`infrastructure/terraform/vpc.tf`)
```hcl
# VPC Configuration
resource "aws_vpc" "omc_erp_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "omc-erp-vpc-${var.environment}"
    Environment = var.environment
    Project     = "omc-erp"
  }
}

# Public Subnets (for Load Balancers)
resource "aws_subnet" "public_subnets" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.omc_erp_vpc.id
  cidr_block        = element(var.public_subnet_cidrs, count.index)
  availability_zone = element(var.availability_zones, count.index)
  
  map_public_ip_on_launch = true

  tags = {
    Name = "omc-erp-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets (for Application and Database)
resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.omc_erp_vpc.id
  cidr_block        = element(var.private_subnet_cidrs, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name = "omc-erp-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "omc_erp_igw" {
  vpc_id = aws_vpc.omc_erp_vpc.id

  tags = {
    Name = "omc-erp-igw-${var.environment}"
  }
}

# NAT Gateway
resource "aws_eip" "nat_eip" {
  count  = length(var.public_subnet_cidrs)
  domain = "vpc"

  tags = {
    Name = "omc-erp-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "omc_erp_nat" {
  count         = length(var.public_subnet_cidrs)
  allocation_id = aws_eip.nat_eip[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "omc-erp-nat-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.omc_erp_igw]
}
```

#### Deploy VPC Infrastructure
```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/${ENVIRONMENT}.tfvars"

# Deploy infrastructure
terraform apply -var-file="environments/${ENVIRONMENT}.tfvars" -auto-approve

# Save outputs
terraform output > ../outputs/${ENVIRONMENT}_outputs.txt
```

### 2. EKS Cluster Setup

#### EKS Cluster Configuration (`infrastructure/terraform/eks.tf`)
```hcl
# EKS Cluster
resource "aws_eks_cluster" "omc_erp_cluster" {
  name     = "omc-erp-${var.environment}"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = concat(aws_subnet.private_subnets[*].id, aws_subnet.public_subnets[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = var.cluster_endpoint_public_access_cidrs
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_cluster.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_cloudwatch_log_group.eks_cluster,
  ]

  tags = {
    Name        = "omc-erp-${var.environment}"
    Environment = var.environment
  }
}

# Node Groups
resource "aws_eks_node_group" "omc_erp_node_group" {
  cluster_name    = aws_eks_cluster.omc_erp_cluster.name
  node_group_name = "omc-erp-nodes-${var.environment}"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  instance_types = var.node_instance_types
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  remote_access {
    ec2_ssh_key = var.node_ssh_key
    source_security_group_ids = [aws_security_group.node_group_remote_access.id]
  }

  tags = {
    Name        = "omc-erp-nodes-${var.environment}"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
}
```

#### Deploy EKS Cluster
```bash
# Deploy EKS cluster
terraform apply -target=aws_eks_cluster.omc_erp_cluster -var-file="environments/${ENVIRONMENT}.tfvars"

# Configure kubectl
aws eks update-kubeconfig --region af-south-1 --name omc-erp-${ENVIRONMENT}

# Verify cluster access
kubectl get nodes
kubectl get pods --all-namespaces
```

### 3. Database Setup

#### RDS PostgreSQL Configuration (`infrastructure/terraform/rds.tf`)
```hcl
# RDS Subnet Group
resource "aws_db_subnet_group" "omc_erp_db_subnet_group" {
  name       = "omc-erp-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id

  tags = {
    Name        = "omc-erp-db-subnet-group-${var.environment}"
    Environment = var.environment
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "omc_erp_db_params" {
  family = "postgres15"
  name   = "omc-erp-db-params-${var.environment}"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,pg_cron,timescaledb"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "max_connections"
    value = var.db_max_connections
  }
}

# RDS Instance
resource "aws_db_instance" "omc_erp_db" {
  identifier     = "omc-erp-db-${var.environment}"
  engine         = "postgres"
  engine_version = var.postgres_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.omc_erp_db_subnet_group.name
  parameter_group_name   = aws_db_parameter_group.omc_erp_db_params.name
  vpc_security_group_ids = [aws_security_group.database.id]

  backup_retention_period = var.db_backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az               = var.environment == "production" ? true : false
  publicly_accessible    = false
  auto_minor_version_upgrade = true

  deletion_protection = var.environment == "production" ? true : false
  skip_final_snapshot = var.environment != "production"

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_enhanced_monitoring.arn

  tags = {
    Name        = "omc-erp-db-${var.environment}"
    Environment = var.environment
  }
}
```

#### Deploy Database
```bash
# Deploy RDS instance
terraform apply -target=aws_db_instance.omc_erp_db -var-file="environments/${ENVIRONMENT}.tfvars"

# Get database endpoint
DB_ENDPOINT=$(terraform output -raw database_endpoint)
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id omc-erp-db-password-${ENVIRONMENT} --query SecretString --output text)

# Test database connection
psql -h $DB_ENDPOINT -U postgres -d omc_erp_${ENVIRONMENT} -c "SELECT version();"
```

---

## Environment Configuration

### 1. Kubernetes Namespaces

#### Create Namespaces
```bash
# Create application namespaces
kubectl create namespace omc-erp-${ENVIRONMENT}
kubectl create namespace monitoring
kubectl create namespace ingress-nginx
kubectl create namespace argocd

# Label namespaces
kubectl label namespace omc-erp-${ENVIRONMENT} environment=${ENVIRONMENT}
kubectl label namespace omc-erp-${ENVIRONMENT} project=omc-erp
```

### 2. Secrets Management

#### Database Secrets
```bash
# Create database secret from AWS Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id omc-erp-db-password-${ENVIRONMENT} \
  --query SecretString --output text)

kubectl create secret generic database-credentials \
  --namespace=omc-erp-${ENVIRONMENT} \
  --from-literal=host=${DB_ENDPOINT} \
  --from-literal=database=omc_erp_${ENVIRONMENT} \
  --from-literal=username=postgres \
  --from-literal=password=${DB_PASSWORD}
```

#### Application Secrets
```bash
# JWT secrets
kubectl create secret generic jwt-secrets \
  --namespace=omc-erp-${ENVIRONMENT} \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=refresh-secret=$(openssl rand -base64 32)

# External API keys
kubectl create secret generic external-apis \
  --namespace=omc-erp-${ENVIRONMENT} \
  --from-literal=mtn-momo-key=${MTN_MOMO_API_KEY} \
  --from-literal=vodafone-cash-key=${VODAFONE_CASH_KEY} \
  --from-literal=aws-access-key=${AWS_ACCESS_KEY} \
  --from-literal=aws-secret-key=${AWS_SECRET_ACCESS_KEY}

# TLS certificates
kubectl create secret tls omc-erp-tls \
  --namespace=omc-erp-${ENVIRONMENT} \
  --cert=certificates/omc-erp.crt \
  --key=certificates/omc-erp.key
```

### 3. ConfigMaps

#### Application Configuration
```bash
# Create application config
kubectl create configmap app-config \
  --namespace=omc-erp-${ENVIRONMENT} \
  --from-file=config/app-${ENVIRONMENT}.yaml

# Database migration config
kubectl create configmap db-migrations \
  --namespace=omc-erp-${ENVIRONMENT} \
  --from-file=migrations/
```

---

## Database Setup

### 1. Initial Database Setup

#### Run Database Migrations
```bash
# Create migration job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-${ENVIRONMENT}
  namespace: omc-erp-${ENVIRONMENT}
spec:
  template:
    spec:
      containers:
      - name: migration
        image: omc-erp/migration-runner:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: connection-string
        command: ["npm", "run", "migrate:up"]
      restartPolicy: Never
  backoffLimit: 3
EOF

# Monitor migration progress
kubectl logs -f job/db-migration-${ENVIRONMENT} -n omc-erp-${ENVIRONMENT}

# Verify migration completed
kubectl get jobs -n omc-erp-${ENVIRONMENT}
```

#### Install Extensions
```sql
-- Connect to database and install required extensions
\c omc_erp_production

-- TimescaleDB for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- PostGIS for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. Initial Data Load

#### Master Data Setup
```bash
# Load reference data
kubectl create job master-data-loader \
  --image=omc-erp/data-loader:latest \
  --namespace=omc-erp-${ENVIRONMENT} \
  -- npm run load:master-data

# Load sample tenant data (non-production only)
if [ "$ENVIRONMENT" != "production" ]; then
  kubectl create job sample-data-loader \
    --image=omc-erp/data-loader:latest \
    --namespace=omc-erp-${ENVIRONMENT} \
    -- npm run load:sample-data
fi
```

---

## Application Deployment

### 1. Install ArgoCD

#### Deploy ArgoCD
```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=600s deployment/argocd-server -n argocd

# Get initial admin password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "ArgoCD Admin Password: $ARGOCD_PASSWORD"

# Port forward to access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### 2. Configure ArgoCD Applications

#### Main Application Definition
```yaml
# argocd/applications/omc-erp-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: omc-erp-${ENVIRONMENT}
  namespace: argocd
  labels:
    environment: ${ENVIRONMENT}
spec:
  project: default
  source:
    repoURL: https://github.com/omc-erp/k8s-manifests
    targetRevision: ${ENVIRONMENT}
    path: applications/omc-erp
    helm:
      valueFiles:
        - values-${ENVIRONMENT}.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: omc-erp-${ENVIRONMENT}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

#### Deploy ArgoCD Applications
```bash
# Apply all applications
find argocd/applications -name "*.yaml" -exec kubectl apply -f {} \;

# Verify applications are synced
argocd app list
argocd app sync omc-erp-${ENVIRONMENT}
```

### 3. Helm Chart Deployment

#### Main Application Helm Chart (`helm/omc-erp/values.yaml`)
```yaml
# Global configuration
global:
  environment: production
  imageRegistry: 123456789.dkr.ecr.af-south-1.amazonaws.com
  imagePullSecrets:
    - name: ecr-registry-secret

# Microservices configuration
services:
  authService:
    enabled: true
    replicaCount: 3
    image:
      repository: omc-erp/auth-service
      tag: v1.0.0
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    autoscaling:
      enabled: true
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilizationPercentage: 70

  supplyChainService:
    enabled: true
    replicaCount: 2
    image:
      repository: omc-erp/supply-chain-service
      tag: v1.0.0

  retailService:
    enabled: true
    replicaCount: 3
    image:
      repository: omc-erp/retail-service
      tag: v1.0.0

  fleetService:
    enabled: true
    replicaCount: 2
    image:
      repository: omc-erp/fleet-service
      tag: v1.0.0

# Database configuration
postgresql:
  enabled: false  # Using external RDS
  external:
    host: omc-erp-db-production.cluster-xyz.af-south-1.rds.amazonaws.com
    port: 5432
    database: omc_erp_production

# Redis configuration
redis:
  enabled: false  # Using external ElastiCache
  external:
    host: omc-erp-cache-production.abc123.cache.amazonaws.com
    port: 6379

# Ingress configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: 100m
  hosts:
    - host: api.omc-erp.com
      paths:
        - path: /
          pathType: Prefix
          service: api-gateway
    - host: app.omc-erp.com
      paths:
        - path: /
          pathType: Prefix
          service: admin-dashboard
  tls:
    - secretName: omc-erp-tls
      hosts:
        - api.omc-erp.com
        - app.omc-erp.com
```

#### Deploy with Helm
```bash
# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install NGINX Ingress Controller
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Install cert-manager for TLS
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy main application
helm upgrade --install omc-erp ./helm/omc-erp \
  --namespace omc-erp-${ENVIRONMENT} \
  --create-namespace \
  --values helm/omc-erp/values-${ENVIRONMENT}.yaml \
  --wait --timeout=10m
```

---

## Post-Deployment Verification

### 1. Health Checks

#### Verify All Services
```bash
# Check all pods are running
kubectl get pods -n omc-erp-${ENVIRONMENT}

# Check service endpoints
kubectl get svc -n omc-erp-${ENVIRONMENT}

# Verify ingress is configured
kubectl get ingress -n omc-erp-${ENVIRONMENT}

# Check horizontal pod autoscaler
kubectl get hpa -n omc-erp-${ENVIRONMENT}
```

#### Service Health Checks
```bash
# Internal health check script
#!/bin/bash
NAMESPACE="omc-erp-${ENVIRONMENT}"
SERVICES=("auth-service" "supply-chain-service" "retail-service" "fleet-service")

for service in "${SERVICES[@]}"; do
  echo "Checking $service..."
  
  # Port forward to service
  kubectl port-forward svc/$service 8080:8080 -n $NAMESPACE &
  PID=$!
  sleep 5
  
  # Check health endpoint
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✓ $service is healthy"
  else
    echo "✗ $service health check failed (HTTP $HTTP_CODE)"
  fi
  
  # Kill port forward
  kill $PID 2>/dev/null
  sleep 2
done
```

### 2. Database Connectivity

#### Test Database Access
```bash
# Create database test pod
kubectl run db-test --image=postgres:15 --rm -it --restart=Never \
  --namespace=omc-erp-${ENVIRONMENT} \
  --env="DATABASE_URL=$(kubectl get secret database-credentials -o jsonpath='{.data.connection-string}' | base64 -d)" \
  -- psql $DATABASE_URL -c "SELECT version();"

# Test application database queries
kubectl exec -it deployment/auth-service -n omc-erp-${ENVIRONMENT} \
  -- npm run db:test-connection
```

### 3. External Integrations

#### Test External APIs
```bash
# Test mobile money integration
kubectl exec -it deployment/retail-service -n omc-erp-${ENVIRONMENT} \
  -- npm run test:integrations

# Verify IoT connectivity
kubectl logs deployment/iot-service -n omc-erp-${ENVIRONMENT} | grep "MQTT connected"
```

---

## Monitoring Setup

### 1. Install Prometheus and Grafana

#### Deploy Monitoring Stack
```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus Operator
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus-values.yaml \
  --wait

# Verify installation
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```

#### Configure Service Monitors
```yaml
# monitoring/service-monitors/omc-erp-services.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: omc-erp-services
  namespace: monitoring
  labels:
    app: omc-erp
spec:
  selector:
    matchLabels:
      app: omc-erp
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

### 2. Logging Setup

#### Deploy ELK Stack
```bash
# Install Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace monitoring \
  --values monitoring/elasticsearch-values.yaml

# Install Kibana
helm install kibana elastic/kibana \
  --namespace monitoring \
  --values monitoring/kibana-values.yaml

# Install Filebeat for log collection
helm install filebeat elastic/filebeat \
  --namespace monitoring \
  --values monitoring/filebeat-values.yaml
```

### 3. Alerting Configuration

#### Alert Rules (`monitoring/alerts/omc-erp-alerts.yaml`)
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: omc-erp-alerts
  namespace: monitoring
spec:
  groups:
  - name: omc-erp.rules
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }} for {{ $labels.service }}"
    
    - alert: DatabaseConnectionFailure
      expr: up{job="postgres-exporter"} == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Database connection failed"
        description: "Cannot connect to PostgreSQL database"
```

---

## Backup Configuration

### 1. Database Backups

#### Automated Backup CronJob
```yaml
# backups/db-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
  namespace: omc-erp-${ENVIRONMENT}
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: pg-dump
            image: postgres:15
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: password
            command:
            - /bin/bash
            - -c
            - |
              DATE=$(date +%Y%m%d_%H%M%S)
              pg_dump -h $DB_HOST -U postgres -d $DB_NAME \
                --format=custom --compress=9 \
                --file=/backups/omc_erp_backup_$DATE.backup
              aws s3 cp /backups/omc_erp_backup_$DATE.backup \
                s3://omc-erp-backups/${ENVIRONMENT}/database/
            volumeMounts:
            - name: backup-storage
              mountPath: /backups
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

### 2. Application State Backup

#### Velero Installation
```bash
# Install Velero for cluster backups
wget https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz
tar -xzf velero-v1.12.0-linux-amd64.tar.gz
sudo mv velero-v1.12.0-linux-amd64/velero /usr/local/bin/

# Install Velero with AWS plugin
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket omc-erp-velero-backups \
  --secret-file ./aws-credentials \
  --backup-location-config region=af-south-1

# Create daily backup schedule
velero schedule create daily-backup \
  --schedule="0 1 * * *" \
  --include-namespaces omc-erp-${ENVIRONMENT}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Pod Startup Issues

```bash
# Check pod status
kubectl get pods -n omc-erp-${ENVIRONMENT}

# Describe problematic pod
kubectl describe pod <pod-name> -n omc-erp-${ENVIRONMENT}

# Check pod logs
kubectl logs <pod-name> -n omc-erp-${ENVIRONMENT} --previous

# Check resource constraints
kubectl top pods -n omc-erp-${ENVIRONMENT}
```

#### 2. Database Connection Issues

```bash
# Test database connectivity from cluster
kubectl run db-test --image=postgres:15 --rm -it --restart=Never \
  --env="PGHOST=<db-host>" \
  --env="PGUSER=postgres" \
  --env="PGPASSWORD=<password>" \
  -- psql -d omc_erp_${ENVIRONMENT} -c "SELECT 1;"

# Check security groups and network ACLs
aws ec2 describe-security-groups --group-ids <database-sg-id>

# Verify RDS instance status
aws rds describe-db-instances --db-instance-identifier omc-erp-db-${ENVIRONMENT}
```

#### 3. Load Balancer Issues

```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx
kubectl logs deployment/ingress-nginx-controller -n ingress-nginx

# Verify ingress configuration
kubectl get ingress -n omc-erp-${ENVIRONMENT} -o yaml

# Check AWS Load Balancer status
aws elbv2 describe-load-balancers --names <load-balancer-name>
```

#### 4. Service Discovery Issues

```bash
# Check service endpoints
kubectl get endpoints -n omc-erp-${ENVIRONMENT}

# Test service DNS resolution
kubectl run dns-test --image=busybox --rm -it --restart=Never \
  -- nslookup auth-service.omc-erp-${ENVIRONMENT}.svc.cluster.local

# Verify service selectors
kubectl get services -n omc-erp-${ENVIRONMENT} -o yaml
```

### Performance Issues

#### 1. High CPU/Memory Usage

```bash
# Check resource usage
kubectl top pods -n omc-erp-${ENVIRONMENT}
kubectl top nodes

# Check HPA status
kubectl get hpa -n omc-erp-${ENVIRONMENT}

# Scale deployment manually if needed
kubectl scale deployment auth-service --replicas=5 -n omc-erp-${ENVIRONMENT}
```

#### 2. Database Performance

```sql
-- Check for slow queries
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check for blocking queries
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## Rollback Procedures

### 1. Application Rollback

#### Using ArgoCD
```bash
# List previous application revisions
argocd app history omc-erp-${ENVIRONMENT}

# Rollback to previous version
argocd app rollback omc-erp-${ENVIRONMENT} <revision-id>

# Verify rollback
argocd app get omc-erp-${ENVIRONMENT}
```

#### Using Helm
```bash
# List releases
helm list -n omc-erp-${ENVIRONMENT}

# Rollback to previous release
helm rollback omc-erp <revision> -n omc-erp-${ENVIRONMENT}

# Check rollback status
helm status omc-erp -n omc-erp-${ENVIRONMENT}
```

### 2. Database Rollback

#### Point-in-Time Recovery
```bash
# Create RDS point-in-time recovery instance
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier omc-erp-db-${ENVIRONMENT} \
  --target-db-instance-identifier omc-erp-db-${ENVIRONMENT}-recovery \
  --restore-time 2025-01-12T14:30:00.000Z \
  --subnet-group-name omc-erp-db-subnet-group-${ENVIRONMENT} \
  --vpc-security-group-ids <security-group-id>

# Update application to point to recovery database
kubectl patch secret database-credentials \
  -n omc-erp-${ENVIRONMENT} \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/host", "value": "'$(echo -n new-db-host | base64)'"}]'

# Restart affected services
kubectl rollout restart deployment -n omc-erp-${ENVIRONMENT}
```

### 3. Infrastructure Rollback

#### Terraform Rollback
```bash
# Check current state
terraform plan -var-file="environments/${ENVIRONMENT}.tfvars"

# Rollback to previous state file
aws s3 cp s3://omc-erp-terraform-state/backup/terraform.tfstate.backup ./terraform.tfstate

# Apply previous configuration
terraform apply -var-file="environments/${ENVIRONMENT}.tfvars"
```

### 4. Complete Environment Rollback

#### Emergency Rollback Script
```bash
#!/bin/bash
# emergency-rollback.sh

ENVIRONMENT=${1:-staging}
ROLLBACK_TARGET=${2:-previous}

echo "Starting emergency rollback for environment: $ENVIRONMENT"
echo "Rollback target: $ROLLBACK_TARGET"

# 1. Rollback application
echo "Rolling back application..."
argocd app rollback omc-erp-${ENVIRONMENT} $ROLLBACK_TARGET

# 2. Scale down current deployment
echo "Scaling down current deployment..."
kubectl scale deployment --all --replicas=0 -n omc-erp-${ENVIRONMENT}

# 3. Wait for pods to terminate
echo "Waiting for pods to terminate..."
kubectl wait --for=delete pods --all -n omc-erp-${ENVIRONMENT} --timeout=300s

# 4. Apply rollback configuration
echo "Applying rollback configuration..."
argocd app sync omc-erp-${ENVIRONMENT}

# 5. Wait for new pods to be ready
echo "Waiting for new pods to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment --all -n omc-erp-${ENVIRONMENT}

# 6. Verify rollback
echo "Verifying rollback..."
kubectl get pods -n omc-erp-${ENVIRONMENT}
kubectl get svc -n omc-erp-${ENVIRONMENT}

# 7. Run health checks
echo "Running health checks..."
./scripts/health-check.sh $ENVIRONMENT

echo "Emergency rollback completed for environment: $ENVIRONMENT"
```

---

## Security Hardening

### 1. Network Policies

#### Default Deny Policy
```yaml
# security/network-policies/default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: omc-erp-${ENVIRONMENT}
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

#### Service-to-Service Communication
```yaml
# security/network-policies/service-communication.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-service-communication
  namespace: omc-erp-${ENVIRONMENT}
spec:
  podSelector:
    matchLabels:
      app: omc-erp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: omc-erp
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: omc-erp
    ports:
    - protocol: TCP
      port: 8080
  - to: []  # Allow DNS resolution
    ports:
    - protocol: UDP
      port: 53
```

### 2. Pod Security Standards

#### Pod Security Policy
```yaml
# security/pod-security/restricted-psp.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### 3. RBAC Configuration

#### Service Account and Roles
```yaml
# security/rbac/omc-erp-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: omc-erp-service-account
  namespace: omc-erp-${ENVIRONMENT}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: omc-erp-${ENVIRONMENT}
  name: omc-erp-role
rules:
- apiGroups: [""]
  resources: ["secrets", "configmaps"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: omc-erp-role-binding
  namespace: omc-erp-${ENVIRONMENT}
subjects:
- kind: ServiceAccount
  name: omc-erp-service-account
  namespace: omc-erp-${ENVIRONMENT}
roleRef:
  kind: Role
  name: omc-erp-role
  apiGroup: rbac.authorization.k8s.io
```

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: Quarterly*