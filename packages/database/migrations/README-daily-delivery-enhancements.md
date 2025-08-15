# Daily Delivery Database Schema Enhancements

## Overview

This document describes the database schema enhancements implemented for the Daily Delivery module to support station type configuration, price build-up snapshots, and enhanced AP/AR integration with automatic journal entry generation.

## Migration Details

**Migration File**: `018-daily-delivery-enhancements.sql`  
**Rollback File**: `018-daily-delivery-enhancements-rollback.sql`  
**Version**: 1.0.0  
**Date**: 2025-08-15  

## Schema Changes

### 1. New Enum Types

#### `station_type`
```sql
CREATE TYPE station_type AS ENUM (
    'COCO',        -- Company Owned Company Operated
    'DOCO',        -- Dealer Owned Company Operated
    'DODO',        -- Dealer Owned Dealer Operated
    'INDUSTRIAL',  -- Industrial/Commercial customers
    'COMMERCIAL'   -- Large commercial customers
);
```

#### `revenue_recognition_type`
```sql
CREATE TYPE revenue_recognition_type AS ENUM (
    'IMMEDIATE',   -- Recognize revenue immediately upon delivery
    'DEFERRED',    -- Defer revenue recognition based on contract terms
    'PROGRESS',    -- Progress-based revenue recognition
    'MILESTONE'    -- Milestone-based revenue recognition
);
```

#### `tax_type`
```sql
CREATE TYPE tax_type AS ENUM (
    'PETROLEUM_TAX',
    'ENERGY_FUND_LEVY',
    'ROAD_FUND_LEVY',
    'PRICE_STABILIZATION_LEVY',
    'UPPF_LEVY',
    'VAT',
    'WITHHOLDING_TAX',
    'CUSTOMS_DUTY'
);
```

### 2. Enhanced daily_deliveries Table

#### New Columns Added:
- `station_type` - Station type classification
- `price_build_up_snapshot` - JSONB snapshot of price components at transaction time
- `dealer_margin_snapshot` - Dealer margin amount at transaction time
- `uppf_levy_snapshot` - UPPF levy amount at transaction time
- `revenue_recognition_type` - IFRS revenue recognition method

#### New Indexes:
- `idx_daily_deliveries_station_type`
- `idx_daily_deliveries_price_snapshot` (GIN index for JSONB)
- `idx_daily_deliveries_revenue_type`

### 3. Enhanced delivery_line_items Table

#### New Columns Added:
- `base_unit_price` - Base price before taxes and margins
- `total_taxes` - Total tax amount for this line
- `total_levies` - Total levy amount for this line
- `total_margins` - Total margin amount for this line
- `price_components` - JSONB breakdown of price components
- `cost_center_code` - Cost center for accounting
- `profit_center_code` - Profit center for accounting
- `gl_account_code` - General ledger account code

#### New Indexes:
- `idx_delivery_line_items_price_components` (GIN index for JSONB)
- `idx_delivery_line_items_cost_center`
- `idx_delivery_line_items_gl_account`

### 4. New price_build_up_components Table

Dynamic price configuration table with effective dates:

```sql
CREATE TABLE price_build_up_components (
    id UUID PRIMARY KEY,
    component_code VARCHAR(50) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    product_grade VARCHAR(20) NOT NULL,
    station_type station_type NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    component_value DECIMAL(15,4) NOT NULL,
    value_type VARCHAR(20) NOT NULL DEFAULT 'FIXED',
    -- ... additional columns
);
```

**Features**:
- Time-based price component management
- Support for different station types and product grades
- Flexible value types (FIXED, PERCENTAGE, FORMULA)
- Regulatory compliance tracking

### 5. New tax_accruals Table

Tax obligation tracking per delivery:

```sql
CREATE TABLE tax_accruals (
    id UUID PRIMARY KEY,
    delivery_id UUID NOT NULL REFERENCES daily_deliveries(id),
    tax_type tax_type NOT NULL,
    tax_rate DECIMAL(8,4) NOT NULL,
    taxable_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    tax_account_code VARCHAR(20) NOT NULL,
    liability_account_code VARCHAR(20) NOT NULL,
    tax_authority VARCHAR(100),
    due_date DATE,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    -- ... additional columns
);
```

**Features**:
- Automatic tax accrual generation
- Payment tracking and status management
- Authority-specific tax management
- Overdue tax identification

## Stored Procedures

### 1. Automatic Journal Entry Generation

**Function**: `generate_delivery_journal_entries(UUID, station_type)`

Generates appropriate journal entries based on station type:
- **COCO**: Direct sales accounting
- **DOCO**: Consignment accounting  
- **DODO**: Wholesale accounting
- **INDUSTRIAL**: Industrial sales accounting
- **COMMERCIAL**: Commercial sales accounting

### 2. Tax Accrual Calculation

**Function**: `calculate_tax_accruals()`

Automatically creates tax accruals when delivery status changes to 'DELIVERED'.

### 3. Price Build-up Snapshot

**Function**: `update_price_buildup_snapshot()`

Automatically captures price component snapshot when delivery is created/updated.

## Triggers

### 1. Tax Accrual Generation
```sql
CREATE TRIGGER trg_calculate_tax_accruals
    AFTER UPDATE ON daily_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tax_accruals();
```

### 2. Journal Entry Generation
```sql
CREATE TRIGGER trg_auto_generate_journal_entries
    AFTER UPDATE ON daily_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_journal_entries();
```

### 3. Price Snapshot Update
```sql
CREATE TRIGGER trg_update_price_buildup_snapshot
    BEFORE INSERT OR UPDATE ON daily_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_price_buildup_snapshot();
```

## Sample Data

The migration includes sample price build-up components for:
- **PMS (Premium Motor Spirit)**: Base price, taxes, levies, margins
- **AGO (Automotive Gas Oil)**: Base price, taxes, levies, margins

## TypeORM Entity Updates

### 1. Enhanced DailyDelivery Entity
- Added new enums: `StationType`, `RevenueRecognitionType`
- Added relationships to `TaxAccrual`
- Added new fields for enhanced functionality
- Added helper methods for business logic

### 2. Enhanced DeliveryLineItem Entity
- Added price component breakdown fields
- Added accounting dimension fields
- Added helper methods for calculations

### 3. New PriceBuildUpComponent Entity
- Complete entity for dynamic price management
- Built-in validation and business logic
- Helper methods for effective date management

### 4. New TaxAccrual Entity
- Comprehensive tax management entity
- Payment tracking and status management
- Built-in overdue detection

## Business Benefits

### 1. Station Type Differentiation
- Different accounting treatment per station type
- Appropriate journal entries for each business model
- Enhanced reporting and analytics

### 2. Price Transparency
- Complete price build-up tracking
- Historical price component snapshots
- Regulatory compliance support

### 3. Tax Management
- Automatic tax accrual generation
- Payment tracking and compliance
- Overdue tax identification

### 4. Financial Integration
- Automatic journal entry generation
- Proper GL account mapping
- Enhanced AP/AR integration

### 5. Audit Trail
- Complete price history
- Tax payment tracking
- Compliance documentation

## Migration Instructions

### To Apply Migration:
```bash
# Run the migration
psql -d your_database -f 018-daily-delivery-enhancements.sql
```

### To Rollback Migration:
```bash
# Run the rollback
psql -d your_database -f 018-daily-delivery-enhancements-rollback.sql
```

### Verification Queries:
```sql
-- Check new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_deliveries' 
AND column_name IN ('station_type', 'price_build_up_snapshot', 'revenue_recognition_type');

-- Check new tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('price_build_up_components', 'tax_accruals');

-- Check sample data
SELECT COUNT(*) FROM price_build_up_components;
```

## Performance Considerations

1. **Indexes**: All new columns have appropriate indexes for query performance
2. **JSONB**: Uses GIN indexes for efficient JSON queries
3. **Triggers**: Optimized for minimal performance impact
4. **Constraints**: Database-level constraints ensure data integrity

## Security Considerations

1. **Permissions**: Follow existing permission model
2. **Audit Trail**: All new tables include audit columns
3. **Data Validation**: Comprehensive constraints and checks
4. **Access Control**: Role-based access to sensitive tax data

## Maintenance

1. **Price Components**: Regular review and updates
2. **Tax Rates**: Monitor for regulatory changes
3. **Performance**: Monitor trigger performance
4. **Archive**: Consider archiving old tax accruals

## Support

For questions or issues related to this migration:
1. Review the migration logs for any errors
2. Check the verification queries
3. Consult the database documentation
4. Contact the development team

---

**Note**: This migration is designed to be backward compatible and includes comprehensive rollback capabilities. All existing functionality remains unchanged while adding the new enhanced features.