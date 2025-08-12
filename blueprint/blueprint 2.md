# Ghana Oil Marketing Company SaaS ERP System: Comprehensive Technical Blueprint

## SECTION 1: SYSTEM ARCHITECTURE OVERVIEW

### Complete System Architecture

The Ghana OMC SaaS ERP system employs a **microservices architecture** built on cloud-native principles, designed to handle 500+ fuel stations with real-time IoT integration, regulatory compliance, and 24/7 availability.

#### Core Architecture Components

**1. Microservices Layer**
- **6 Bounded Contexts** following Domain-Driven Design:
  - Fuel Procurement Context (supplier management, purchase orders)
  - Depot Management Context (storage, inventory, distribution)
  - Retail Operations Context (fuel stations, sales, customer management)
  - Vehicle Fleet Management Context (transport, maintenance, routing)
  - Regulatory Reporting Context (NPA, GRA, EPA compliance)
  - Financial Management Context (accounting, budgeting, profitability)

**2. API Gateway Layer**
- **Kong Gateway** for API management with rate limiting, authentication, and routing
- **GraphQL Federation** using Apollo Gateway for unified data access
- **REST APIs** for third-party integrations and partner systems

**3. Event Streaming Backbone**
- **Apache Kafka** for event-driven architecture and real-time data streaming
- **Debezium** for Change Data Capture from databases
- **Event sourcing** for audit trails and regulatory compliance

**4. Data Architecture**
- **Polyglot Persistence**:
  - PostgreSQL 15+ for transactional data
  - TimescaleDB for IoT time-series data
  - Redis 7.0+ for caching and session management
  - MongoDB for document storage
  - ClickHouse for real-time analytics
- **Apache Iceberg** for data lake implementation on S3

**5. Infrastructure Layer**
- **Kubernetes (EKS)** for container orchestration
- **Istio Service Mesh** for service-to-service communication
- **ArgoCD** for GitOps-based deployments
- **Multi-region deployment**: Africa (af-south-1 primary), Europe (eu-west-1 DR)

### Technology Stack Decisions

**Backend Services**
- **Primary Language**: Python with FastAPI for high-performance APIs
- **Secondary**: Node.js for real-time services (WebSocket connections)
- **Message Queue**: RabbitMQ for task queuing, Kafka for event streaming
- **Authentication**: OAuth 2.1 with JWT tokens, FIDO2 for passwordless

**Frontend Applications**
- **Framework**: React 19 with Next.js 14 (App Router)
- **State Management**: Zustand for client state, TanStack Query for server state
- **UI Components**: Tailwind CSS with custom design system
- **PWA Features**: Service workers for offline capability

**AI/ML Infrastructure**
- **MLOps Platform**: MLflow for experiment tracking and model registry
- **Model Serving**: NVIDIA Triton for high-performance inference
- **Vector Database**: Weaviate for RAG implementation
- **LLM Integration**: LangChain for orchestration

**DevOps & Monitoring**
- **CI/CD**: GitHub Actions with ArgoCD for GitOps
- **IaC**: Terraform for infrastructure management
- **Monitoring**: OpenTelemetry with Grafana stack (Prometheus, Loki, Tempo)
- **APM**: Datadog for comprehensive application monitoring

### Data Flow Architecture

**Real-time Transaction Flow**
1. Fuel pump initiates transaction via Modbus protocol
2. Edge gateway processes and validates transaction
3. Transaction published to Kafka topic
4. Payment service processes via MTN MoMo/Stripe
5. Inventory service updates fuel levels
6. Analytics service processes for real-time dashboards
7. Regulatory service generates compliance reports

**IoT Sensor Data Pipeline**
1. Tank sensors transmit data via MQTT
2. IoT gateway performs edge processing
3. TimescaleDB ingests time-series data
4. Stream processing via Kafka Streams
5. Real-time alerts for threshold violations
6. ClickHouse aggregates for analytics dashboards

### Security Architecture

**Zero-Trust Implementation**
- Never trust, always verify principle
- Microsegmentation of network resources
- Context-aware access control
- Continuous security validation

**Defense in Depth**
- WAF (Web Application Firewall) at edge
- API rate limiting and DDoS protection
- End-to-end encryption (TLS 1.3)
- Data encryption at rest (AES-256)
- Regular security scanning and penetration testing

## SECTION 2: DETAILED TECHNICAL SPECIFICATIONS

### Microservices Breakdown

#### Fuel Procurement Service
```yaml
name: fuel-procurement-service
technology: Python FastAPI
database: PostgreSQL
apis:
  - POST /api/v1/purchase-orders
  - GET /api/v1/suppliers
  - PUT /api/v1/contracts/{id}
  - POST /api/v1/quality-tests
events:
  publishes:
    - procurement.contract.negotiated
    - procurement.order.created
  subscribes:
    - depot.inventory.low
    - finance.payment.approved
```

#### Depot Management Service
```yaml
name: depot-management-service
technology: Python FastAPI
database: PostgreSQL + TimescaleDB
apis:
  - GET /api/v1/inventory/current
  - POST /api/v1/receipts
  - POST /api/v1/loading-operations
  - GET /api/v1/tank-levels
events:
  publishes:
    - depot.inventory.updated
    - depot.loading.completed
  subscribes:
    - procurement.delivery.scheduled
    - retail.order.placed
```

#### Retail Operations Service
```yaml
name: retail-operations-service
technology: Node.js Express
database: PostgreSQL
apis:
  - POST /api/v1/transactions
  - GET /api/v1/stations/{id}
  - POST /api/v1/loyalty/points
  - GET /api/v1/pricing/current
events:
  publishes:
    - retail.transaction.completed
    - retail.inventory.request
  subscribes:
    - pricing.update.approved
    - depot.delivery.completed
```

### Database Schema Design

#### Core Transaction Table
```sql
CREATE TABLE fuel_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id),
    pump_id INTEGER NOT NULL REFERENCES pumps(id),
    customer_id INTEGER REFERENCES customers(id),
    fuel_type_id INTEGER NOT NULL REFERENCES fuel_types(id),
    quantity_liters DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(8,4) NOT NULL,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity_liters * unit_price) STORED,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    transaction_time TIMESTAMPTZ DEFAULT NOW(),
    shift_id INTEGER REFERENCES shifts(id),
    cashier_id INTEGER REFERENCES employees(id),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (transaction_time);

CREATE INDEX idx_transactions_station_time ON fuel_transactions(station_id, transaction_time DESC);
CREATE INDEX idx_transactions_customer ON fuel_transactions(customer_id) WHERE customer_id IS NOT NULL;
```

#### IoT Time-Series Schema (TimescaleDB)
```sql
CREATE TABLE tank_readings (
    time TIMESTAMPTZ NOT NULL,
    tank_id INTEGER NOT NULL,
    fuel_level DECIMAL(10,3) NOT NULL,
    temperature DECIMAL(5,2),
    pressure DECIMAL(8,2),
    water_level DECIMAL(6,3),
    density DECIMAL(6,4),
    location_id INTEGER REFERENCES locations(id),
    sensor_status VARCHAR(20),
    PRIMARY KEY (time, tank_id)
);

SELECT create_hypertable('tank_readings', 'time', chunk_time_interval => INTERVAL '1 day');
CREATE INDEX ON tank_readings (tank_id, time DESC);
```

### AI/ML Model Architecture

#### Demand Forecasting Model
```python
class DemandForecastingPipeline:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=1000,
            max_depth=8,
            learning_rate=0.01,
            subsample=0.8
        )
        self.feature_pipeline = Pipeline([
            ('temporal', TemporalFeatureExtractor()),
            ('weather', WeatherFeatureExtractor()),
            ('economic', EconomicIndicatorExtractor()),
            ('scaler', StandardScaler())
        ])
    
    def train(self, data):
        features = self.feature_pipeline.fit_transform(data)
        self.model.fit(features, data['target'])
        mlflow.sklearn.log_model(self.model, "demand_forecast")
```

#### Fraud Detection System
```python
class FraudDetectionEnsemble:
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.01)
        self.autoencoder = self.build_autoencoder()
        self.rules_engine = RulesBasedDetector()
    
    def detect(self, transaction):
        isolation_score = self.isolation_forest.decision_function([transaction])
        reconstruction_error = self.autoencoder.predict(transaction)
        rules_violations = self.rules_engine.check(transaction)
        
        return self.ensemble_decision(
            isolation_score, 
            reconstruction_error, 
            rules_violations
        )
```

### Frontend Component Architecture

#### Main Application Structure
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navigation />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

// app/providers.tsx
'use client'
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // 1 minute
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  )
}
```

## SECTION 3: STEP-BY-STEP IMPLEMENTATION GUIDE

### Phase 1: Project Foundation (Weeks 1-4)

#### Step 1: Repository Setup
```bash
# Create monorepo structure
mkdir ghana-omc-erp && cd ghana-omc-erp
npx create-nx-workspace@latest --preset=nest --appName=api-gateway

# Add microservices
nx g @nrwl/nest:app fuel-procurement-service
nx g @nrwl/nest:app depot-management-service
nx g @nrwl/nest:app retail-operations-service

# Add frontend applications
nx g @nrwl/next:app admin-dashboard
nx g @nrwl/react-native:app mobile-app

# Add shared libraries
nx g @nrwl/workspace:lib shared/types
nx g @nrwl/workspace:lib shared/utils
```

#### Step 2: Database Setup
```sql
-- Create databases
CREATE DATABASE omc_procurement;
CREATE DATABASE omc_depot;
CREATE DATABASE omc_retail;
CREATE DATABASE omc_finance;

-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Setup replication
ALTER SYSTEM SET wal_level = logical;
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET max_wal_senders = 10;
```

#### Step 3: Infrastructure as Code
```hcl
# terraform/main.tf
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block = "10.0.0.0/16"
  region = "af-south-1"
  environment = "production"
}

module "eks" {
  source = "./modules/eks"
  
  cluster_name = "omc-erp-cluster"
  node_groups = {
    general = {
      instance_types = ["m5.xlarge"]
      min_size = 3
      max_size = 10
      desired_size = 5
    }
  }
}

module "rds" {
  source = "./modules/rds"
  
  engine = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"
  allocated_storage = 100
  multi_az = true
}
```

### Phase 2: Core Services Implementation (Weeks 5-12)

#### Step 4: Implement Authentication Service
```python
# services/auth/main.py
from fastapi import FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from passlib.context import CryptContext

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/api/v1/auth/login")
async def login(credentials: LoginCredentials):
    user = await authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(status_code=401)
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/api/v1/auth/refresh")
async def refresh(refresh_token: str):
    payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
    new_access_token = create_access_token(payload["sub"])
    return {"access_token": new_access_token}
```

#### Step 5: Implement Transaction Processing
```python
# services/retail/transaction_processor.py
class TransactionProcessor:
    def __init__(self):
        self.kafka_producer = KafkaProducer()
        self.payment_gateway = PaymentGateway()
        self.inventory_service = InventoryService()
    
    async def process_transaction(self, transaction_data: TransactionRequest):
        # Validate transaction
        await self.validate_transaction(transaction_data)
        
        # Process payment
        payment_result = await self.payment_gateway.process_payment(
            amount=transaction_data.amount,
            method=transaction_data.payment_method,
            reference=transaction_data.reference
        )
        
        if payment_result.success:
            # Update inventory
            await self.inventory_service.update_fuel_level(
                station_id=transaction_data.station_id,
                fuel_type=transaction_data.fuel_type,
                quantity=transaction_data.quantity
            )
            
            # Publish event
            await self.kafka_producer.send(
                "fuel.transaction.completed",
                transaction_data.dict()
            )
            
            return TransactionResponse(
                transaction_id=generate_transaction_id(),
                status="completed",
                receipt_number=generate_receipt_number()
            )
```

### Phase 3: Integration Development (Weeks 13-20)

#### Step 6: Mobile Money Integration
```python
# integrations/mtn_momo.py
class MTNMoMoIntegration:
    def __init__(self):
        self.base_url = "https://proxy.momoapi.mtn.com"
        self.api_key = os.getenv("MTN_MOMO_API_KEY")
        self.user_id = os.getenv("MTN_MOMO_USER_ID")
    
    async def request_payment(self, amount: float, phone: str, reference: str):
        headers = {
            "X-API-Key": self.api_key,
            "X-Reference-Id": reference,
            "X-Target-Environment": "production"
        }
        
        payload = {
            "amount": str(amount),
            "currency": "GHS",
            "externalId": reference,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": phone
            },
            "payerMessage": "Fuel payment",
            "payeeNote": "Payment received"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/collection/v1_0/requesttopay",
                headers=headers,
                json=payload
            )
            
        return response.json()
```

#### Step 7: IoT Data Processing
```python
# services/iot/sensor_processor.py
class SensorDataProcessor:
    def __init__(self):
        self.timescale_conn = TimescaleDBConnection()
        self.kafka_producer = KafkaProducer()
        self.alert_service = AlertService()
    
    async def process_sensor_reading(self, reading: SensorReading):
        # Store in TimescaleDB
        await self.timescale_conn.insert(
            "tank_readings",
            time=reading.timestamp,
            tank_id=reading.tank_id,
            fuel_level=reading.fuel_level,
            temperature=reading.temperature
        )
        
        # Check thresholds
        if reading.fuel_level < CRITICAL_LEVEL:
            await self.alert_service.send_alert(
                AlertType.LOW_FUEL,
                station_id=reading.station_id,
                tank_id=reading.tank_id,
                current_level=reading.fuel_level
            )
        
        # Stream to Kafka for real-time processing
        await self.kafka_producer.send(
            "iot.sensor.reading",
            reading.dict()
        )
```

### Phase 4: Frontend Development (Weeks 21-28)

#### Step 8: Admin Dashboard Implementation
```typescript
// app/dashboard/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { FuelInventoryChart, TransactionMetrics, StationMap } from '@/components'

export default function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000 // 30 seconds
  })

  const { data: stations } = useQuery({
    queryKey: ['station-status'],
    queryFn: fetchStationStatus,
    refetchInterval: 60000 // 1 minute
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TransactionMetrics data={metrics?.transactions} />
      <FuelInventoryChart data={metrics?.inventory} />
      <StationMap stations={stations} />
      
      <div className="col-span-full">
        <RealtimeAlerts />
      </div>
    </div>
  )
}
```

## SECTION 4: DEVELOPMENT ENVIRONMENT SETUP

### Local Development Configuration

#### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: omc_user
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: omc_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  timescale:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_PASSWORD: timescale_password
    ports:
      - "5433:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin_password
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  postgres_data:
  timescale_data:
  mongo_data:
```

#### Kubernetes Development Cluster
```bash
# Install required tools
brew install kubectl helm minikube

# Start local Kubernetes cluster
minikube start --cpus=4 --memory=8192 --driver=docker

# Install Istio service mesh
istioctl install --set profile=demo -y
kubectl label namespace default istio-injection=enabled

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack
```

### CI/CD Pipeline Configuration

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth, procurement, depot, retail]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd services/${{ matrix.service }}
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-asyncio
    
    - name: Run tests
      run: |
        cd services/${{ matrix.service }}
        pytest --cov=./ --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./services/${{ matrix.service }}/coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker images
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Kubernetes
      run: |
        # Update ArgoCD application
        kubectl patch app omc-erp -n argocd \
          --type json \
          -p='[{"op": "replace", "path": "/spec/source/targetRevision", "value":"'$GITHUB_SHA'"}]'
```

## SECTION 5: DEPLOYMENT AND OPERATIONS

### Production Deployment Architecture

#### Multi-Region Infrastructure
```hcl
# terraform/environments/production/main.tf
module "africa_primary" {
  source = "../../modules/regional_infrastructure"
  
  region = "af-south-1"
  environment = "production"
  
  vpc_cidr = "10.0.0.0/16"
  
  eks_config = {
    cluster_version = "1.28"
    node_groups = {
      general = {
        instance_types = ["m5.2xlarge"]
        min_size = 5
        max_size = 20
        desired_size = 10
      }
      spot = {
        instance_types = ["m5.xlarge", "m5a.xlarge"]
        capacity_type = "SPOT"
        min_size = 3
        max_size = 15
        desired_size = 6
      }
    }
  }
  
  rds_config = {
    engine = "postgres"
    engine_version = "15.4"
    instance_class = "db.r6g.2xlarge"
    multi_az = true
    backup_retention_period = 30
    read_replicas = 2
  }
}

module "europe_dr" {
  source = "../../modules/regional_infrastructure"
  
  region = "eu-west-1"
  environment = "production-dr"
  
  vpc_cidr = "10.1.0.0/16"
  
  eks_config = {
    cluster_version = "1.28"
    node_groups = {
      general = {
        instance_types = ["m5.large"]
        min_size = 2
        max_size = 10
        desired_size = 3
      }
    }
  }
}
```

### Monitoring and Alerting Setup

#### Prometheus Configuration
```yaml
# monitoring/prometheus-values.yaml
alertmanager:
  config:
    global:
      resolve_timeout: 5m
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 12h
      receiver: 'team-slack'
      routes:
      - match:
          severity: critical
        receiver: team-pagerduty
    receivers:
    - name: 'team-slack'
      slack_configs:
      - api_url: '$SLACK_WEBHOOK_URL'
        channel: '#omc-alerts'
    - name: 'team-pagerduty'
      pagerduty_configs:
      - service_key: '$PAGERDUTY_SERVICE_KEY'

serverFiles:
  alerting_rules.yml:
    groups:
    - name: omc-critical
      interval: 30s
      rules:
      - alert: HighTransactionFailureRate
        expr: rate(transaction_failures_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High transaction failure rate detected"
          description: "Transaction failure rate is {{ $value }} (threshold: 0.01)"
      
      - alert: LowFuelInventory
        expr: fuel_inventory_liters < 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low fuel inventory at station {{ $labels.station_id }}"
```

### Backup and Disaster Recovery

#### Automated Backup Strategy
```bash
#!/bin/bash
# backup-strategy.sh

# Database backups
pg_dump -h $DB_HOST -U $DB_USER -d omc_production | \
  gzip | \
  aws s3 cp - s3://omc-backups/postgres/$(date +%Y%m%d-%H%M%S).sql.gz

# Kubernetes state backup
velero backup create production-$(date +%Y%m%d) \
  --include-namespaces omc-production \
  --ttl 720h

# Application data backup
aws s3 sync /data/uploads s3://omc-backups/uploads/ --delete

# Verify backup integrity
aws s3api head-object --bucket omc-backups \
  --key postgres/$(date +%Y%m%d)*.sql.gz || \
  alert_team "Backup verification failed"
```

### Security Hardening Checklist

```yaml
# security/hardening-checklist.yaml
security_controls:
  network:
    - enable_network_policies: true
    - restrict_egress_traffic: true
    - implement_service_mesh_mtls: true
    
  authentication:
    - enforce_mfa: true
    - implement_oauth2_oidc: true
    - rotate_api_keys_quarterly: true
    
  data_protection:
    - encrypt_at_rest: true
    - encrypt_in_transit: true
    - implement_data_tokenization: true
    
  compliance:
    - enable_audit_logging: true
    - implement_gdpr_controls: true
    - maintain_pci_dss_compliance: true
    
  vulnerability_management:
    - container_scanning: true
    - dependency_scanning: true
    - weekly_security_updates: true
```

## SECTION 6: AI CODING AGENT INSTRUCTIONS

### Phase-by-Phase Development Instructions

#### Phase 1 Instructions: Foundation Setup
```markdown
## AI Agent Task: Initialize Ghana OMC ERP Project

### Objective
Create the foundational project structure for a Ghana Oil Marketing Company SaaS ERP system.

### Step 1: Project Initialization
1. Create a new directory called `ghana-omc-erp`
2. Initialize a monorepo using Nx: `npx create-nx-workspace@latest`
3. Choose the following options:
   - Workspace name: ghana-omc-erp
   - Preset: integrated
   - Apps directory: apps
   - Enable distributed caching: Yes

### Step 2: Service Generation
Generate the following microservices:
```bash
nx g @nrwl/nest:app auth-service
nx g @nrwl/nest:app procurement-service
nx g @nrwl/nest:app depot-service
nx g @nrwl/nest:app retail-service
nx g @nrwl/nest:app fleet-service
nx g @nrwl/nest:app regulatory-service
nx g @nrwl/nest:app finance-service
```

### Step 3: Frontend Applications
Generate frontend applications:
```bash
nx g @nrwl/next:app admin-dashboard
nx g @nrwl/react-native:app field-mobile-app
nx g @nrwl/next:app customer-portal
```

### Step 4: Shared Libraries
Create shared libraries:
```bash
nx g @nrwl/workspace:lib shared/types
nx g @nrwl/workspace:lib shared/utils
nx g @nrwl/workspace:lib shared/database
nx g @nrwl/workspace:lib shared/auth
```

### Step 5: Docker Configuration
Create `docker-compose.yml` with all required services (PostgreSQL, Redis, Kafka, TimescaleDB, MongoDB).

### Validation Criteria
- All services should build successfully: `nx run-many --target=build --all`
- Docker services should start: `docker-compose up -d`
- Basic health checks pass for all services
```

#### Phase 2 Instructions: Core Service Implementation
```markdown
## AI Agent Task: Implement Core Business Logic

### Authentication Service Implementation
1. Install required dependencies:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

2. Create the following modules:
   - AuthModule with JWT strategy
   - UserModule with user management
   - Create OAuth 2.0 implementation with refresh tokens

3. Implement endpoints:
   - POST /auth/login
   - POST /auth/refresh
   - POST /auth/logout
   - GET /auth/profile

### Transaction Processing Service
1. Create TransactionModule in retail-service
2. Implement transaction validation logic
3. Integrate with Kafka for event publishing
4. Add payment gateway abstraction layer

### Database Schema Implementation
1. Create migration files for each service
2. Implement the provided schema designs
3. Set up database seeding scripts
4. Configure database connection pooling

### Error Handling
- Implement global exception filters
- Add request/response logging
- Create standardized error response format
- Implement retry logic for external services

### Testing Requirements
- Unit tests for all business logic (minimum 80% coverage)
- Integration tests for API endpoints
- Create test fixtures and mocks
```

#### Phase 3 Instructions: Integration Development
```markdown
## AI Agent Task: Implement External Integrations

### Mobile Money Integration
1. Create MTN MoMo integration service:
   - Implement OAuth authentication
   - Create payment request endpoint
   - Handle webhook callbacks
   - Implement retry logic with exponential backoff

2. Add Vodafone Cash integration:
   - Similar structure to MTN MoMo
   - Handle different response formats
   - Implement fallback mechanisms

### Government API Integration
1. NPA (National Petroleum Authority):
   - Price update synchronization
   - Quality reporting submission
   - License verification

2. GRA (Ghana Revenue Authority):
   - Tax calculation service
   - Automated VAT reporting
   - Invoice generation compliance

### IoT Integration
1. Implement MQTT broker connection
2. Create sensor data ingestion pipeline
3. Add real-time alerting system
4. Implement edge computing logic

### Testing Checklist
- Mock external APIs for testing
- Implement circuit breaker patterns
- Add comprehensive error handling
- Create integration test suite
```

#### Phase 4 Instructions: Frontend Development
```markdown
## AI Agent Task: Build User Interfaces

### Admin Dashboard Development
1. Setup Next.js 14 with App Router
2. Implement authentication flow
3. Create dashboard components:
   - Real-time metrics display
   - Fuel inventory management
   - Transaction monitoring
   - Station management interface

### Mobile App Development
1. Setup React Native with Expo
2. Implement offline-first architecture
3. Create features:
   - Fuel reading submission
   - Photo capture for inspections
   - GPS tracking
   - Push notifications

### Component Library
1. Create reusable UI components
2. Implement design system with Tailwind CSS
3. Add accessibility features (WCAG 2.1 AA)
4. Create storybook documentation

### Performance Optimization
- Implement code splitting
- Add progressive web app features
- Optimize images and assets
- Implement caching strategies
```

### Code Generation Guidelines

#### Naming Conventions
```typescript
// File naming
auth.service.ts         // Services
user.controller.ts      // Controllers
transaction.entity.ts   // Entities
create-user.dto.ts     // DTOs
fuel-level.interface.ts // Interfaces

// Variable naming
const userId: string            // camelCase for variables
const MAX_RETRY_ATTEMPTS = 3   // UPPER_SNAKE_CASE for constants
class TransactionProcessor {}   // PascalCase for classes
function calculateFuelPrice() {} // camelCase for functions
```

#### Error Handling Standards
```typescript
// Standard error handling pattern
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, context });
  
  if (error instanceof BusinessLogicError) {
    throw new BadRequestException(error.message);
  }
  
  if (error instanceof ExternalServiceError) {
    // Implement retry logic
    return await retryWithExponentialBackoff(riskyOperation);
  }
  
  // Log to monitoring service
  await monitoringService.logError(error);
  
  throw new InternalServerErrorException('An unexpected error occurred');
}
```

#### API Response Standards
```typescript
// Successful response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Station Alpha"
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "quantity",
        "message": "Must be greater than 0"
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Testing and Validation Procedures

#### Unit Testing Template
```typescript
describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<Repository<Transaction>>;

  beforeEach(() => {
    const module = Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    mockRepository = module.get(getRepositoryToken(Transaction));
  });

  describe('processTransaction', () => {
    it('should process a valid transaction', async () => {
      // Arrange
      const transactionData = createMockTransaction();
      mockRepository.save.mockResolvedValue(transactionData);

      // Act
      const result = await service.processTransaction(transactionData);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(mockRepository.save).toHaveBeenCalledWith(transactionData);
    });

    it('should handle payment failure', async () => {
      // Test payment failure scenario
    });
  });
});
```

#### Integration Testing
```typescript
describe('Fuel Station API Integration', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a new transaction', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .send({
          stationId: 'STN001',
          fuelType: 'DIESEL',
          quantity: 1000,
          amount: 5000
        })
        .expect(201);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.status).toBe('completed');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Quality Assurance Checkpoints

#### Code Review Checklist
- [ ] Code follows established naming conventions
- [ ] All functions have proper error handling
- [ ] Complex logic includes inline comments
- [ ] No hardcoded values or credentials
- [ ] All database queries are parameterized
- [ ] API endpoints have input validation
- [ ] Unit test coverage >= 80%
- [ ] Integration tests cover critical paths
- [ ] Performance tests pass requirements
- [ ] Security scan shows no critical vulnerabilities

#### Deployment Readiness Checklist
- [ ] All tests passing in CI/CD pipeline
- [ ] Docker images built and scanned
- [ ] Kubernetes manifests validated
- [ ] Database migrations tested
- [ ] Monitoring and alerting configured
- [ ] Backup procedures verified
- [ ] Security hardening completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Rollback procedures tested

### Documentation Generation Requirements

#### API Documentation
```yaml
# Generate OpenAPI documentation for all endpoints
openapi: 3.0.0
info:
  title: Ghana OMC ERP API
  version: 1.0.0
  description: API documentation for Oil Marketing Company ERP system

paths:
  /api/v1/transactions:
    post:
      summary: Create a new fuel transaction
      tags:
        - Transactions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTransactionDto'
      responses:
        201:
          description: Transaction created successfully
        400:
          description: Invalid input
        500:
          description: Internal server error
```

#### System Documentation Structure
```markdown
# Ghana OMC ERP System Documentation

## Table of Contents
1. System Overview
2. Architecture Documentation
3. API Reference
4. Database Schema
5. Deployment Guide
6. Operations Manual
7. Troubleshooting Guide
8. Security Documentation
9. Integration Guides
10. Developer Onboarding

## Quick Start Guide
[Step-by-step instructions for new developers]

## API Endpoints
[Complete API documentation with examples]

## Configuration Reference
[All configuration options and environment variables]

## Monitoring and Alerts
[Guide to system monitoring and alert management]
```

### Performance Optimization Guidelines

#### Database Query Optimization
```sql
-- Use appropriate indexes
CREATE INDEX idx_transactions_station_date 
ON transactions(station_id, transaction_date DESC);

-- Optimize complex queries with materialized views
CREATE MATERIALIZED VIEW daily_station_summary AS
SELECT 
  station_id,
  DATE(transaction_date) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_revenue,
  AVG(quantity) as avg_quantity
FROM transactions
GROUP BY station_id, DATE(transaction_date);

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_station_summary;
```

#### Caching Strategy
```typescript
// Implement multi-layer caching
class CacheService {
  async get(key: string): Promise<any> {
    // L1: In-memory cache
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult) return memoryResult;
    
    // L2: Redis cache
    const redisResult = await this.redis.get(key);
    if (redisResult) {
      this.memoryCache.set(key, redisResult);
      return redisResult;
    }
    
    // L3: Database
    const dbResult = await this.fetchFromDatabase(key);
    await this.updateCaches(key, dbResult);
    return dbResult;
  }
}
```

### Final Validation and Deployment

#### Pre-Production Checklist
```bash
#!/bin/bash
# pre-production-validation.sh

echo "Running pre-production validation..."

# Run all tests
nx run-many --target=test --all --coverage

# Check code quality
nx run-many --target=lint --all

# Security scanning
npm audit --audit-level=moderate
trivy image ghana-omc-erp:latest

# Performance testing
k6 run performance-tests/load-test.js

# Database migration dry-run
npm run migration:dry-run

# Generate reports
npm run generate:test-report
npm run generate:coverage-report
npm run generate:security-report

echo "Validation complete. Check reports directory for results."
```

This comprehensive technical blueprint provides all the necessary details for an AI coding agent to build a complete Ghana Oil Marketing Company SaaS ERP system. The blueprint includes detailed architecture specifications, step-by-step implementation guides, code examples, testing procedures, and deployment instructions. Following these instructions systematically will result in a production-ready, enterprise-grade system capable of managing 500+ fuel stations with real-time IoT integration, regulatory compliance, and high availability.