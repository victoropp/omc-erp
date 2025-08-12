# UPPF and Price Build-Up Implementation Plan

## Overview
Implementation of Ghana's Uniform Pump Price Fund (UPPF) system and Price Build-Up (PBU) components for regulatory compliance and automated settlement workflows.

## System Architecture

### Core Components
1. **Pricing Service** - Handles PBU calculations and price window management
2. **UPPF Service** - Manages claims, settlements, and transport cost equalization
3. **Dealer Service** - Handles dealer management, loans, and settlements
4. **Regulatory Service** - Manages NPA documents, compliance, and audit trails

## Database Schema Extensions

### Master/Reference Tables

#### `pbu_components`
```sql
- id: UUID (PK)
- component_code: VARCHAR(10) -- EDRL, PSRL, BOST, UPPF, etc.
- name: VARCHAR(100)
- category: ENUM(levy, regulatory_margin, distribution_margin, omc_margin, dealer_margin, other)
- unit: ENUM(GHS_per_litre, percentage)
- rate_value: DECIMAL(10,4)
- effective_from: TIMESTAMP
- effective_to: TIMESTAMP
- source_doc_id: UUID (FK to regulatory_docs)
- approval_ref: VARCHAR(50)
- is_active: BOOLEAN
- tenant_id: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `pricing_windows`
```sql
- window_id: VARCHAR(20) (PK) -- 2025W15 format
- start_date: DATE
- end_date: DATE
- npa_guideline_doc_id: UUID (FK to regulatory_docs)
- status: ENUM(draft, active, closed, archived)
- tenant_id: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `equalisation_points`
```sql
- id: UUID (PK)
- route_id: VARCHAR(50)
- route_name: VARCHAR(200)
- depot_id: UUID (FK to depots)
- km_threshold: DECIMAL(8,2)
- tariff_per_litre_km: DECIMAL(8,6)
- effective_from: DATE
- effective_to: DATE
- tenant_id: UUID
```

#### `regulatory_docs`
```sql
- doc_id: UUID (PK)
- type: ENUM(pricing_guideline, pbu_template, circular, act, regulation)
- title: VARCHAR(200)
- file_url: TEXT
- file_hash: VARCHAR(64)
- upload_date: TIMESTAMP
- effective_date: DATE
- tenant_id: UUID
- uploaded_by: UUID (FK to users)
```

### Transactional Tables

#### `station_prices`
```sql
- id: UUID (PK)
- station_id: UUID (FK)
- product_id: VARCHAR(10) -- PMS, AGO, LPG
- window_id: VARCHAR(20) (FK)
- ex_pump_price: DECIMAL(8,4)
- calc_breakdown_json: JSONB -- Component breakdown
- published_at: TIMESTAMP
- tenant_id: UUID
```

#### `delivery_consignments`
```sql
- id: UUID (PK)
- consignment_number: VARCHAR(50)
- depot_id: UUID (FK)
- station_id: UUID (FK)
- product_id: VARCHAR(10)
- route_id: VARCHAR(50)
- litres_loaded: DECIMAL(12,3)
- litres_received: DECIMAL(12,3)
- km_planned: DECIMAL(8,2)
- km_actual: DECIMAL(8,2)
- dispatch_date: TIMESTAMP
- arrival_date: TIMESTAMP
- gps_trace_id: UUID
- waybill_number: VARCHAR(50)
- status: ENUM(loaded, in_transit, delivered, variance_flagged)
- tenant_id: UUID
```

#### `uppf_claims`
```sql
- claim_id: UUID (PK)
- window_id: VARCHAR(20) (FK)
- delivery_id: UUID (FK to delivery_consignments)
- route_id: VARCHAR(50)
- km_beyond_equalisation: DECIMAL(8,2)
- litres_moved: DECIMAL(12,3)
- tariff_per_litre_km: DECIMAL(8,6)
- amount_due: DECIMAL(12,2)
- status: ENUM(draft, ready_to_submit, submitted, approved, paid, rejected)
- evidence_links: JSONB -- Links to supporting documents
- submitted_at: TIMESTAMP
- approved_at: TIMESTAMP
- paid_at: TIMESTAMP
- tenant_id: UUID
```

#### `dealer_loans`
```sql
- loan_id: UUID (PK)
- station_id: UUID (FK)
- dealer_id: UUID (FK to users)
- principal_amount: DECIMAL(15,2)
- interest_rate: DECIMAL(5,4)
- tenor_months: INTEGER
- repayment_frequency: ENUM(daily, weekly, bi_weekly, monthly)
- amortization_method: ENUM(reducing_balance, straight_line)
- start_date: DATE
- maturity_date: DATE
- status: ENUM(active, completed, defaulted, restructured)
- outstanding_balance: DECIMAL(15,2)
- tenant_id: UUID
```

#### `dealer_settlements`
```sql
- id: UUID (PK)
- station_id: UUID (FK)
- window_id: VARCHAR(20) (FK)
- settlement_date: DATE
- total_litres_sold: DECIMAL(12,3)
- gross_dealer_margin: DECIMAL(12,2)
- loan_deduction: DECIMAL(12,2)
- other_deductions: DECIMAL(12,2)
- net_payable: DECIMAL(12,2)
- status: ENUM(calculated, approved, paid)
- payment_date: DATE
- payment_reference: VARCHAR(100)
- tenant_id: UUID
```

## Service Implementation Structure

### 1. Pricing Service (`services/pricing-service/`)
```
src/
├── pricing/
│   ├── dto/
│   │   ├── create-price-window.dto.ts
│   │   ├── update-pbu-component.dto.ts
│   │   └── calculate-price.dto.ts
│   ├── pricing.controller.ts
│   ├── pricing.service.ts
│   └── pricing.module.ts
├── pbu-components/
│   ├── pbu-components.controller.ts
│   ├── pbu-components.service.ts
│   └── pbu-components.module.ts
└── calculation-engine/
    ├── price-calculator.service.ts
    └── pbu-validator.service.ts
```

### 2. UPPF Service (`services/uppf-service/`)
```
src/
├── claims/
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   └── claims.module.ts
├── settlements/
│   ├── settlements.controller.ts
│   ├── settlements.service.ts
│   └── settlements.module.ts
├── delivery/
│   ├── delivery.controller.ts
│   ├── delivery.service.ts
│   └── delivery.module.ts
└── gps-tracking/
    ├── gps.service.ts
    └── route-analyzer.service.ts
```

### 3. Dealer Service (`services/dealer-service/`)
```
src/
├── dealers/
│   ├── dealers.controller.ts
│   ├── dealers.service.ts
│   └── dealers.module.ts
├── loans/
│   ├── loans.controller.ts
│   ├── loans.service.ts
│   └── loans.module.ts
└── settlements/
    ├── dealer-settlements.controller.ts
    ├── dealer-settlements.service.ts
    └── dealer-settlements.module.ts
```

### 4. Regulatory Service (`services/regulatory-service/`)
```
src/
├── documents/
│   ├── regulatory-docs.controller.ts
│   ├── regulatory-docs.service.ts
│   └── regulatory-docs.module.ts
├── compliance/
│   ├── compliance.controller.ts
│   ├── compliance.service.ts
│   └── compliance.module.ts
└── audit/
    ├── audit.controller.ts
    ├── audit.service.ts
    └── audit.module.ts
```

## Key API Endpoints

### Pricing APIs
- `GET /api/pricing/{window_id}/stations/{station_id}/products/{product_id}/ex-pump`
- `POST /api/pricing/windows/{window_id}/calculate-all-prices`
- `POST /api/pricing/pbu-components/bulk-update`
- `GET /api/pricing/windows/{window_id}/submission-file`

### UPPF APIs
- `POST /api/uppf/claims` - Create claim from delivery
- `GET /api/uppf/claims/{claim_id}/evidence-pack`
- `POST /api/uppf/claims/batch-submit/{window_id}`
- `GET /api/uppf/settlements/variance-report`

### Dealer APIs
- `POST /api/dealers/{station_id}/settlements/close`
- `GET /api/dealers/{dealer_id}/loan-schedule`
- `POST /api/dealers/loans/{loan_id}/reschedule`

## Business Rules Implementation

### 1. Price Calculation Engine
```typescript
ExPumpPrice = ExRefinery 
            + Σ(Taxes_Levies)        // EDRL, PSRL, Road Fund
            + Σ(Regulatory_Margins)  // BOST, UPPF, Fuel Marking
            + OMC_Margin
            + Dealer_Margin
```

### 2. UPPF Claim Calculation
```typescript
km_excess = max(0, km_actual - equalisation_threshold)
claim_amount = km_excess * litres_delivered * tariff_per_litre_km
```

### 3. Dealer Settlement
```typescript
net_payable = gross_dealer_margin 
            - loan_installment_due 
            - other_deductions
            + adjustments
```

## Compliance & Audit Features

### 1. Document Management
- Hash verification for all regulatory documents
- Version control for pricing templates
- Audit trail for all price changes

### 2. Evidence Management
- GPS trace validation
- Three-way matching (depot load vs station received vs transporter trip)
- Automated variance flagging

### 3. Regulatory Reporting
- NPA submission file generation
- Compliance dashboard
- Variance analysis reports

## AI/ML Enhancement Opportunities

### 1. Fraud Detection
- Route anomaly detection using GPS patterns
- Volume variance analysis
- Delivery time optimization

### 2. Predictive Analytics
- Dealer cash flow forecasting
- Optimal loan repayment scheduling
- Price impact analysis

### 3. Process Automation
- Automatic document parsing from NPA updates
- Smart routing optimization
- Predictive maintenance for pricing anomalies

## Implementation Timeline

### Phase 1: Core Infrastructure (2 weeks)
- Database schema implementation
- Basic entity models and repositories
- Core service scaffolding

### Phase 2: Pricing System (2 weeks)
- PBU component management
- Price calculation engine
- Pricing window operations

### Phase 3: UPPF System (2 weeks)
- Delivery management
- Claims generation and processing
- GPS integration and route analysis

### Phase 4: Dealer Management (1 week)
- Loan management system
- Settlement calculations
- Payment processing

### Phase 5: Regulatory & Compliance (1 week)
- Document management
- Audit trails
- Compliance reporting

### Phase 6: Integration & Testing (1 week)
- End-to-end workflow testing
- Performance optimization
- Documentation completion

## Risk Mitigation

### 1. Data Accuracy
- Implement multiple validation layers
- Cross-reference with external data sources
- Real-time variance monitoring

### 2. Regulatory Compliance
- Automated compliance checks
- Regular audit capabilities
- Comprehensive documentation

### 3. System Performance
- Optimized calculation engines
- Caching strategies for frequently accessed data
- Scalable architecture design

## Success Metrics

### 1. Operational Efficiency
- Reduction in manual price calculation time
- Automated claim processing rate
- Settlement processing speed

### 2. Compliance Accuracy
- Zero pricing discrepancies with NPA guidelines
- 100% audit trail completeness
- Timely regulatory submissions

### 3. Financial Impact
- Accurate UPPF claim recovery
- Optimized dealer loan management
- Reduced settlement disputes