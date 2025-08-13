# OMC ERP System Architecture

## System Overview

The OMC ERP System is built using a **microservices architecture** designed specifically for Ghana Oil Marketing Companies. The system emphasizes scalability, maintainability, and regulatory compliance while providing enterprise-grade functionality.

## 🏗️ Architecture Principles

### 1. Microservices Design
- **Service Independence**: Each service can be developed, deployed, and scaled independently
- **Domain-Driven Design**: Services are organized around business domains
- **API-First**: All inter-service communication through well-defined APIs
- **Data Ownership**: Each service owns its data and database

### 2. Event-Driven Architecture
- **Asynchronous Communication**: Services communicate via events for loose coupling
- **Event Sourcing**: Critical business events are stored for audit and replay
- **CQRS Pattern**: Separate read and write operations for optimal performance

### 3. Scalability & Performance
- **Horizontal Scaling**: Auto-scaling based on load and demand
- **Caching Strategy**: Multi-level caching with Redis
- **Database Optimization**: Read replicas and connection pooling
- **Load Balancing**: Intelligent traffic distribution

## 🔧 Technical Stack

### Backend Technologies
```yaml
Runtime: Node.js 18+ with TypeScript
Framework: NestJS (Enterprise-grade)
ORM: TypeORM with PostgreSQL
Authentication: JWT with refresh tokens
API Documentation: Swagger/OpenAPI 3.0
Testing: Jest for unit/integration tests
Validation: Class-validator with DTOs
```

### Database Architecture
```yaml
Primary Database: PostgreSQL 14+
  - ACID compliance for financial transactions
  - Advanced indexing for performance
  - Row-level security for multi-tenancy
  
Cache Layer: Redis 6+
  - Session management
  - Application-level caching
  - Rate limiting
  
Time-Series Data: TimescaleDB
  - IoT sensor data
  - Performance metrics
  - Audit logs
```

### Infrastructure
```yaml
Containerization: Docker
Orchestration: Kubernetes (optional)
Monitoring: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
CI/CD: GitHub Actions
Cloud: Multi-cloud ready (AWS, Azure, GCP)
```

## 📊 Service Architecture

### Core Financial Services

#### 1. Accounting Service
```
Path: services/accounting-service/
Database: accounting_db
Key Features:
  - General Ledger with multi-dimensional analysis
  - Chart of Accounts with IFRS classification
  - Journal entry processing with automated posting
  - Real-time financial reporting
  - Multi-currency support with exchange rate management
```

#### 2. Fixed Assets Service
```
Path: services/fixed-assets-service/
Database: fixed_assets_db
Key Features:
  - Asset lifecycle management
  - IFRS 16 lease accounting
  - Depreciation calculations (multiple methods)
  - Asset transfer and disposal tracking
  - Maintenance scheduling
```

#### 3. Tax Service
```
Path: services/tax-service/
Database: tax_db
Key Features:
  - Ghana Revenue Authority integration
  - Automated tax calculations
  - VAT, Income Tax, and Withholding Tax
  - Tax filing and compliance reporting
  - Electronic filing capabilities
```

### Operations Management Services

#### 4. Inventory Service
```
Path: services/inventory-service/
Database: inventory_db
Key Features:
  - Real-time inventory tracking
  - Multi-location inventory management
  - Automatic reorder points
  - Inventory valuation (FIFO, LIFO, Weighted Average)
  - Loss control and variance analysis
```

#### 5. Fleet Service
```
Path: services/fleet-service/
Database: fleet_db
Key Features:
  - Vehicle and equipment management
  - Maintenance scheduling and tracking
  - Fuel consumption monitoring
  - Driver assignment and tracking
  - Insurance and registration management
```

#### 6. Customer Service
```
Path: services/customer-service/
Database: customer_db
Key Features:
  - Customer master data management
  - Credit limit and payment terms
  - Customer segmentation and analytics
  - Loyalty program management
  - Communication history
```

### Human Resources Services

#### 7. Human Resource Service
```
Path: services/human-resource-service/
Database: hr_db
Key Features:
  - Employee lifecycle management
  - Ghana labor law compliance
  - Performance management
  - Training and development
  - Leave management
```

#### 8. Payroll Service
```
Path: services/human-resource-service/src/payroll/
Database: hr_db (shared)
Key Features:
  - Ghana tax bracket calculations
  - SSNIT and pension contributions
  - Automated payslip generation
  - Year-to-date calculations
  - Statutory reporting
```

### Project & Cost Management Services

#### 9. Cost Management Service
```
Path: services/accounting-service/src/cost-management/
Database: accounting_db (shared)
Key Features:
  - Activity-Based Costing (ABC)
  - Cost center hierarchy
  - Driver-based allocations
  - Profitability analysis
  - Budget variance reporting
```

#### 10. Project Accounting Service
```
Path: services/accounting-service/src/project-accounting/
Database: accounting_db (shared)
Key Features:
  - Work Breakdown Structure (WBS)
  - Earned Value Management (EVM)
  - Revenue recognition
  - Project budgeting and control
  - Local content tracking
```

### Compliance & Configuration Services

#### 11. IFRS Compliance Service
```
Path: services/ifrs-compliance-service/
Database: compliance_db
Key Features:
  - Automated compliance checking
  - Standard-specific validation (IAS, IFRS)
  - Compliance reporting
  - Automated corrections
  - Risk assessment
```

#### 12. Configuration Service
```
Path: services/configuration-service/
Database: config_db
Key Features:
  - System-wide configuration management
  - Multi-tenant settings
  - Feature flags and toggles
  - Business rule engine
  - Workflow configuration
```

### Transaction Processing Services

#### 13. Transaction Service
```
Path: services/transaction-service/
Database: transaction_db
Key Features:
  - Point-of-sale integration
  - Payment processing
  - Transaction reconciliation
  - Fraud detection
  - Real-time transaction monitoring
```

## 🗄️ Database Design

### Database Per Service Pattern
Each microservice owns its database to ensure:
- **Data Isolation**: No direct database access between services
- **Technology Freedom**: Each service can choose optimal database technology
- **Independent Scaling**: Databases can be scaled independently
- **Failure Isolation**: Database failures don't cascade across services

### Shared Data Patterns
For data that needs to be accessed across services:
- **Event Publishing**: Services publish events when data changes
- **API Composition**: Services expose APIs for data access
- **CQRS Views**: Materialized views for complex queries

### Database Schema Examples

#### Chart of Accounts (Accounting Service)
```sql
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR NOT NULL,
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type account_type_enum NOT NULL,
  ifrs_classification VARCHAR(50),
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Employee Entity (HR Service)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR NOT NULL,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  ghana_card_number VARCHAR(20) UNIQUE,
  ssnit VARCHAR(20) UNIQUE,
  basic_salary DECIMAL(15,2),
  status employee_status_enum DEFAULT 'PROBATION',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Data Flow Architecture

### Synchronous Communication
```
Client Request → API Gateway → Service API → Database
                                    ↓
                              Response Data
```

### Asynchronous Communication
```
Service A → Event Bus → Service B
    ↓
Database A              Database B
```

### Event Flow Example
```
1. Payroll Calculated Event
   └── Published by: Payroll Service
   └── Consumed by: 
       ├── Accounting Service (Journal Entries)
       ├── Tax Service (Tax Calculations)
       └── Reporting Service (Analytics)
```

## 📡 API Design

### RESTful API Standards
```yaml
Base URL: https://api.omc-erp.com/v1/
Authentication: Bearer JWT Token
Content-Type: application/json
Rate Limiting: 1000 requests/hour per user
```

### API Versioning Strategy
```
v1: /api/v1/ - Current stable version
v2: /api/v2/ - Next version (parallel deployment)
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Must be greater than 0"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🔐 Security Architecture

### Authentication & Authorization
```
1. User Login → JWT Token (Access + Refresh)
2. API Request → Token Validation → Role/Permission Check
3. Service Communication → Service-to-Service Authentication
```

### Multi-Tenant Security
```yaml
Tenant Isolation:
  - Row-Level Security (RLS) in PostgreSQL
  - Tenant-specific encryption keys
  - API-level tenant validation

Data Protection:
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - PII data masking in logs
```

### Audit Trail
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Monitoring & Observability

### Application Metrics
```yaml
Performance Metrics:
  - API response times
  - Database query performance
  - Service availability
  - Error rates

Business Metrics:
  - Transaction volume
  - Revenue tracking
  - User activity
  - Compliance scores
```

### Logging Strategy
```yaml
Log Levels:
  - ERROR: System errors and exceptions
  - WARN: Performance issues and deprecations
  - INFO: Business events and workflows
  - DEBUG: Detailed execution traces

Log Format:
  timestamp: ISO 8601
  level: LOG_LEVEL
  service: service-name
  traceId: distributed-trace-id
  tenantId: tenant-identifier
  userId: user-identifier
  message: log-message
  metadata: additional-context
```

### Health Checks
```typescript
// Health check endpoint for each service
@Get('health')
async health(): Promise<HealthCheckResult> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    databaseConnections: {
      primary: 'connected',
      replica: 'connected'
    },
    dependencies: {
      redis: 'connected',
      eventBus: 'connected'
    }
  };
}
```

## 🚀 Deployment Architecture

### Container Strategy
```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Configuration
```yaml
Development:
  - Docker Compose for local development
  - Hot reload for rapid iteration
  - Mock external services

Staging:
  - Kubernetes cluster
  - Production-like data
  - Integration testing

Production:
  - Auto-scaling groups
  - Load balancers
  - Multi-AZ deployment
  - Backup and disaster recovery
```

## 📈 Scalability Patterns

### Horizontal Scaling
```yaml
Auto-scaling Triggers:
  - CPU utilization > 70%
  - Memory utilization > 80%
  - Request queue depth > 100
  - Response time > 500ms

Scaling Limits:
  - Min instances: 2
  - Max instances: 20
  - Scale-up cooldown: 300s
  - Scale-down cooldown: 900s
```

### Caching Strategy
```yaml
L1 Cache: Application Memory
  - Frequently accessed reference data
  - TTL: 5 minutes

L2 Cache: Redis
  - Session data
  - Query results
  - TTL: 1 hour

L3 Cache: CDN
  - Static assets
  - API responses
  - TTL: 24 hours
```

### Database Optimization
```sql
-- Example: Optimized query with proper indexing
CREATE INDEX CONCURRENTLY idx_journal_entries_date_tenant
ON journal_entries (tenant_id, transaction_date);

CREATE INDEX CONCURRENTLY idx_employees_status_tenant
ON employees (tenant_id, status) 
WHERE status = 'ACTIVE';
```

## 🔄 Data Consistency Patterns

### Eventually Consistent Operations
```typescript
// Example: Order processing with eventual consistency
async processPayrollCalculation(payrollData: PayrollData) {
  // 1. Calculate payroll (immediate)
  const payroll = await this.calculatePayroll(payrollData);
  
  // 2. Emit event for downstream processing (async)
  await this.eventBus.emit('payroll.calculated', {
    payrollId: payroll.id,
    employeeId: payroll.employeeId,
    amount: payroll.netPay
  });
  
  return payroll;
}
```

### Saga Pattern for Distributed Transactions
```typescript
class PayrollProcessingSaga {
  async execute(payrollData: PayrollData) {
    try {
      // Step 1: Calculate payroll
      const payroll = await this.payrollService.calculate(payrollData);
      
      // Step 2: Create journal entries
      const journalEntries = await this.accountingService.createEntries(payroll);
      
      // Step 3: Process payments
      const payment = await this.paymentService.processPayment(payroll);
      
      return { success: true, payroll, journalEntries, payment };
    } catch (error) {
      // Compensating actions for rollback
      await this.compensate(error);
      throw error;
    }
  }
}
```

## 🛡️ Disaster Recovery

### Backup Strategy
```yaml
Database Backups:
  - Full backup: Daily at 2 AM GMT
  - Incremental backup: Every 4 hours
  - Transaction log backup: Every 15 minutes
  - Retention: 30 days
  - Cross-region replication: Enabled

Application Data:
  - Configuration backups: Daily
  - File storage backup: Daily
  - Backup verification: Weekly
```

### Recovery Procedures
```yaml
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 15 minutes

Recovery Steps:
  1. Declare disaster
  2. Activate DR site
  3. Restore database from backup
  4. Deploy application services
  5. Redirect traffic
  6. Validate system functionality
```

This architecture ensures the OMC ERP system is scalable, maintainable, secure, and compliant with Ghana's regulatory requirements while providing enterprise-grade functionality for oil marketing companies.