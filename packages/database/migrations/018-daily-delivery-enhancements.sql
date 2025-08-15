-- =====================================================
-- DAILY DELIVERY MODULE ENHANCEMENTS
-- Version: 1.0.0
-- Description: Station Type Configuration, Price Build-up Snapshots, and AP/AR Integration
-- Author: Backend Database Agent
-- Date: 2025-08-15
-- =====================================================

BEGIN;

-- =====================================================
-- CREATE ENUM TYPES
-- =====================================================

-- Station Type Enum for different station configurations
CREATE TYPE station_type AS ENUM (
    'COCO',        -- Company Owned Company Operated
    'DOCO',        -- Dealer Owned Company Operated
    'DODO',        -- Dealer Owned Dealer Operated
    'INDUSTRIAL',  -- Industrial/Commercial customers
    'COMMERCIAL'   -- Large commercial customers
);

-- Revenue Recognition Type Enum for IFRS compliance
CREATE TYPE revenue_recognition_type AS ENUM (
    'IMMEDIATE',   -- Recognize revenue immediately upon delivery
    'DEFERRED',    -- Defer revenue recognition based on contract terms
    'PROGRESS',    -- Progress-based revenue recognition
    'MILESTONE'    -- Milestone-based revenue recognition
);

-- Tax Type Enum for tax accruals
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

-- =====================================================
-- ADD STATION TYPE TO DAILY DELIVERIES
-- =====================================================

-- Add station_type field to daily_deliveries table
ALTER TABLE daily_deliveries 
ADD COLUMN station_type station_type;

-- Add index for station type queries
CREATE INDEX idx_daily_deliveries_station_type ON daily_deliveries(station_type);

-- =====================================================
-- ADD PRICE BUILD-UP SNAPSHOT COLUMNS
-- =====================================================

-- Add price build-up snapshot to store complete price breakdown at transaction time
ALTER TABLE daily_deliveries 
ADD COLUMN price_build_up_snapshot JSONB,
ADD COLUMN dealer_margin_snapshot DECIMAL(15,2) DEFAULT 0,
ADD COLUMN uppf_levy_snapshot DECIMAL(15,2) DEFAULT 0,
ADD COLUMN revenue_recognition_type revenue_recognition_type DEFAULT 'IMMEDIATE';

-- Add indexes for price build-up queries
CREATE INDEX idx_daily_deliveries_price_snapshot ON daily_deliveries USING GIN (price_build_up_snapshot);
CREATE INDEX idx_daily_deliveries_revenue_type ON daily_deliveries(revenue_recognition_type);

-- =====================================================
-- CREATE PRICE BUILD-UP COMPONENTS TABLE
-- =====================================================

-- Price build-up components for dynamic configuration with effective dates
CREATE TABLE price_build_up_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_code VARCHAR(50) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- 'BASE_PRICE', 'TAX', 'LEVY', 'MARGIN', 'MARKUP'
    product_grade VARCHAR(20) NOT NULL,
    station_type station_type NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    component_value DECIMAL(15,4) NOT NULL,
    value_type VARCHAR(20) NOT NULL DEFAULT 'FIXED', -- 'FIXED', 'PERCENTAGE', 'FORMULA'
    calculation_formula TEXT,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    is_active BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    description TEXT,
    regulatory_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT chk_component_value_positive CHECK (component_value >= 0),
    CONSTRAINT chk_effective_date_before_expiry CHECK (expiry_date IS NULL OR effective_date <= expiry_date),
    CONSTRAINT chk_value_type_valid CHECK (value_type IN ('FIXED', 'PERCENTAGE', 'FORMULA'))
);

-- Create indexes for price component queries
CREATE INDEX idx_price_components_product_station ON price_build_up_components(product_grade, station_type);
CREATE INDEX idx_price_components_effective_date ON price_build_up_components(effective_date);
CREATE INDEX idx_price_components_code ON price_build_up_components(component_code);
CREATE INDEX idx_price_components_type ON price_build_up_components(component_type);

-- Create unique constraint for active components
CREATE UNIQUE INDEX uk_price_components_active 
ON price_build_up_components(component_code, product_grade, station_type, effective_date)
WHERE is_active = true AND expiry_date IS NULL;

-- =====================================================
-- CREATE TAX ACCRUALS TABLE
-- =====================================================

-- Tax accruals table to track tax obligations per delivery
CREATE TABLE tax_accruals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES daily_deliveries(id) ON DELETE CASCADE,
    tax_type tax_type NOT NULL,
    tax_rate DECIMAL(8,4) NOT NULL,
    taxable_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    tax_account_code VARCHAR(20) NOT NULL,
    liability_account_code VARCHAR(20) NOT NULL,
    tax_authority VARCHAR(100),
    due_date DATE,
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE'
    payment_date DATE,
    payment_reference VARCHAR(100),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    base_tax_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT chk_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT chk_taxable_amount_positive CHECK (taxable_amount >= 0),
    CONSTRAINT chk_tax_amount_positive CHECK (tax_amount >= 0),
    CONSTRAINT chk_payment_date_after_creation CHECK (payment_date IS NULL OR payment_date >= DATE(created_at))
);

-- Create indexes for tax accrual queries
CREATE INDEX idx_tax_accruals_delivery_id ON tax_accruals(delivery_id);
CREATE INDEX idx_tax_accruals_tax_type ON tax_accruals(tax_type);
CREATE INDEX idx_tax_accruals_due_date ON tax_accruals(due_date);
CREATE INDEX idx_tax_accruals_payment_status ON tax_accruals(payment_status);
CREATE INDEX idx_tax_accruals_tax_authority ON tax_accruals(tax_authority);

-- =====================================================
-- UPDATE DELIVERY LINE ITEMS WITH PRICE BREAKDOWN
-- =====================================================

-- Add price component breakdown columns to delivery_line_items
ALTER TABLE delivery_line_items 
ADD COLUMN base_unit_price DECIMAL(15,4) DEFAULT 0,
ADD COLUMN total_taxes DECIMAL(15,2) DEFAULT 0,
ADD COLUMN total_levies DECIMAL(15,2) DEFAULT 0,
ADD COLUMN total_margins DECIMAL(15,2) DEFAULT 0,
ADD COLUMN price_components JSONB,
ADD COLUMN cost_center_code VARCHAR(50),
ADD COLUMN profit_center_code VARCHAR(50),
ADD COLUMN gl_account_code VARCHAR(20);

-- Add indexes for enhanced line item queries
CREATE INDEX idx_delivery_line_items_price_components ON delivery_line_items USING GIN (price_components);
CREATE INDEX idx_delivery_line_items_cost_center ON delivery_line_items(cost_center_code);
CREATE INDEX idx_delivery_line_items_gl_account ON delivery_line_items(gl_account_code);

-- =====================================================
-- CREATE STORED PROCEDURES FOR JOURNAL ENTRIES
-- =====================================================

-- Function to generate automatic journal entries based on station type
CREATE OR REPLACE FUNCTION generate_delivery_journal_entries(
    p_delivery_id UUID,
    p_station_type station_type
) RETURNS UUID AS $$
DECLARE
    v_journal_entry_id UUID;
    v_delivery_record RECORD;
    v_journal_number VARCHAR(50);
    v_line_number INTEGER := 1;
BEGIN
    -- Get delivery details
    SELECT * INTO v_delivery_record 
    FROM daily_deliveries 
    WHERE id = p_delivery_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Delivery not found: %', p_delivery_id;
    END IF;
    
    -- Generate journal number
    v_journal_number := 'DD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                        LPAD(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT, 10, '0');
    
    -- Create journal entry header
    INSERT INTO journal_entries (
        id, journal_number, journal_date, posting_date, journal_type,
        source_module, source_document_type, source_document_id,
        description, total_debit, total_credit, status, created_by
    ) VALUES (
        gen_random_uuid(), v_journal_number, v_delivery_record.delivery_date,
        v_delivery_record.delivery_date, 'SALES', 'DAILY_DELIVERY',
        'DELIVERY', p_delivery_id,
        'Automatic journal entry for delivery: ' || v_delivery_record.delivery_number,
        v_delivery_record.total_value, v_delivery_record.total_value,
        'DRAFT', v_delivery_record.created_by
    ) RETURNING id INTO v_journal_entry_id;
    
    -- Generate journal entry lines based on station type
    CASE p_station_type
        WHEN 'COCO' THEN
            -- Company Owned Company Operated: Direct sales accounting
            PERFORM create_coco_journal_lines(v_journal_entry_id, v_delivery_record, v_line_number);
        WHEN 'DOCO' THEN
            -- Dealer Owned Company Operated: Consignment accounting
            PERFORM create_doco_journal_lines(v_journal_entry_id, v_delivery_record, v_line_number);
        WHEN 'DODO' THEN
            -- Dealer Owned Dealer Operated: Wholesale accounting
            PERFORM create_dodo_journal_lines(v_journal_entry_id, v_delivery_record, v_line_number);
        WHEN 'INDUSTRIAL' THEN
            -- Industrial customers: Direct industrial sales
            PERFORM create_industrial_journal_lines(v_journal_entry_id, v_delivery_record, v_line_number);
        WHEN 'COMMERCIAL' THEN
            -- Commercial customers: Commercial sales accounting
            PERFORM create_commercial_journal_lines(v_journal_entry_id, v_delivery_record, v_line_number);
    END CASE;
    
    -- Update journal entry totals
    UPDATE journal_entries 
    SET total_debit = (
        SELECT COALESCE(SUM(debit_amount), 0) 
        FROM journal_entry_lines 
        WHERE journal_entry_id = v_journal_entry_id
    ),
    total_credit = (
        SELECT COALESCE(SUM(credit_amount), 0) 
        FROM journal_entry_lines 
        WHERE journal_entry_id = v_journal_entry_id
    )
    WHERE id = v_journal_entry_id;
    
    RETURN v_journal_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create COCO journal lines
CREATE OR REPLACE FUNCTION create_coco_journal_lines(
    p_journal_entry_id UUID,
    p_delivery RECORD,
    INOUT p_line_number INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Debit: Accounts Receivable
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, customer_id
    ) VALUES (
        p_journal_entry_id, p_line_number, '1200',
        'Sales - ' || p_delivery.customer_name,
        p_delivery.total_value, 0, p_delivery.customer_id::UUID
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Sales Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '4100',
        'Sales Revenue - ' || p_delivery.product_type,
        0, p_delivery.total_value
    );
    p_line_number := p_line_number + 1;
    
    -- Debit: Cost of Goods Sold
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '5100',
        'Cost of Goods Sold - ' || p_delivery.product_type,
        p_delivery.unit_price * p_delivery.quantity_litres, 0
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Inventory
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '1300',
        'Inventory Reduction - ' || p_delivery.product_type,
        0, p_delivery.unit_price * p_delivery.quantity_litres
    );
    p_line_number := p_line_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create DOCO journal lines
CREATE OR REPLACE FUNCTION create_doco_journal_lines(
    p_journal_entry_id UUID,
    p_delivery RECORD,
    INOUT p_line_number INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Debit: Consignment Receivable
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, customer_id
    ) VALUES (
        p_journal_entry_id, p_line_number, '1250',
        'Consignment Sales - ' || p_delivery.customer_name,
        p_delivery.total_value, 0, p_delivery.customer_id::UUID
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Consignment Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '4150',
        'Consignment Revenue - ' || p_delivery.product_type,
        0, p_delivery.total_value
    );
    p_line_number := p_line_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create DODO journal lines
CREATE OR REPLACE FUNCTION create_dodo_journal_lines(
    p_journal_entry_id UUID,
    p_delivery RECORD,
    INOUT p_line_number INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Debit: Trade Receivables
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, customer_id
    ) VALUES (
        p_journal_entry_id, p_line_number, '1210',
        'Wholesale Sales - ' || p_delivery.customer_name,
        p_delivery.total_value, 0, p_delivery.customer_id::UUID
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Wholesale Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '4200',
        'Wholesale Revenue - ' || p_delivery.product_type,
        0, p_delivery.total_value
    );
    p_line_number := p_line_number + 1;
    
    -- Debit: Cost of Goods Sold
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '5200',
        'Wholesale COGS - ' || p_delivery.product_type,
        p_delivery.unit_price * p_delivery.quantity_litres, 0
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Inventory
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '1300',
        'Inventory Reduction - ' || p_delivery.product_type,
        0, p_delivery.unit_price * p_delivery.quantity_litres
    );
    p_line_number := p_line_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create Industrial journal lines
CREATE OR REPLACE FUNCTION create_industrial_journal_lines(
    p_journal_entry_id UUID,
    p_delivery RECORD,
    INOUT p_line_number INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Debit: Industrial Receivables
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, customer_id
    ) VALUES (
        p_journal_entry_id, p_line_number, '1220',
        'Industrial Sales - ' || p_delivery.customer_name,
        p_delivery.total_value, 0, p_delivery.customer_id::UUID
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Industrial Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '4300',
        'Industrial Revenue - ' || p_delivery.product_type,
        0, p_delivery.total_value
    );
    p_line_number := p_line_number + 1;
    
    -- Debit: Cost of Goods Sold
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '5300',
        'Industrial COGS - ' || p_delivery.product_type,
        p_delivery.unit_price * p_delivery.quantity_litres, 0
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Inventory
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '1300',
        'Inventory Reduction - ' || p_delivery.product_type,
        0, p_delivery.unit_price * p_delivery.quantity_litres
    );
    p_line_number := p_line_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create Commercial journal lines
CREATE OR REPLACE FUNCTION create_commercial_journal_lines(
    p_journal_entry_id UUID,
    p_delivery RECORD,
    INOUT p_line_number INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Debit: Commercial Receivables
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, customer_id
    ) VALUES (
        p_journal_entry_id, p_line_number, '1230',
        'Commercial Sales - ' || p_delivery.customer_name,
        p_delivery.total_value, 0, p_delivery.customer_id::UUID
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Commercial Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '4400',
        'Commercial Revenue - ' || p_delivery.product_type,
        0, p_delivery.total_value
    );
    p_line_number := p_line_number + 1;
    
    -- Debit: Cost of Goods Sold
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '5400',
        'Commercial COGS - ' || p_delivery.product_type,
        p_delivery.unit_price * p_delivery.quantity_litres, 0
    );
    p_line_number := p_line_number + 1;
    
    -- Credit: Inventory
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount
    ) VALUES (
        p_journal_entry_id, p_line_number, '1300',
        'Inventory Reduction - ' || p_delivery.product_type,
        0, p_delivery.unit_price * p_delivery.quantity_litres
    );
    p_line_number := p_line_number + 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TAX ACCRUAL CALCULATION TRIGGERS
-- =====================================================

-- Function to calculate and create tax accruals
CREATE OR REPLACE FUNCTION calculate_tax_accruals() RETURNS TRIGGER AS $$
DECLARE
    v_tax_record RECORD;
BEGIN
    -- Only calculate for delivered status
    IF NEW.status = 'DELIVERED' AND (OLD.status IS NULL OR OLD.status != 'DELIVERED') THEN
        
        -- Delete existing tax accruals for this delivery
        DELETE FROM tax_accruals WHERE delivery_id = NEW.id;
        
        -- Create tax accruals based on delivery amounts
        
        -- Petroleum Tax
        IF NEW.petroleum_tax_amount > 0 THEN
            INSERT INTO tax_accruals (
                delivery_id, tax_type, tax_rate, taxable_amount, tax_amount,
                tax_account_code, liability_account_code, tax_authority,
                due_date, base_tax_amount, created_by
            ) VALUES (
                NEW.id, 'PETROLEUM_TAX', 0, NEW.total_value, NEW.petroleum_tax_amount,
                '5500', '2300', 'Ghana Revenue Authority',
                NEW.delivery_date + INTERVAL '30 days', NEW.petroleum_tax_amount, NEW.updated_by
            );
        END IF;
        
        -- Energy Fund Levy
        IF NEW.energy_fund_levy > 0 THEN
            INSERT INTO tax_accruals (
                delivery_id, tax_type, tax_rate, taxable_amount, tax_amount,
                tax_account_code, liability_account_code, tax_authority,
                due_date, base_tax_amount, created_by
            ) VALUES (
                NEW.id, 'ENERGY_FUND_LEVY', 0, NEW.total_value, NEW.energy_fund_levy,
                '5510', '2310', 'Energy Commission',
                NEW.delivery_date + INTERVAL '30 days', NEW.energy_fund_levy, NEW.updated_by
            );
        END IF;
        
        -- Road Fund Levy
        IF NEW.road_fund_levy > 0 THEN
            INSERT INTO tax_accruals (
                delivery_id, tax_type, tax_rate, taxable_amount, tax_amount,
                tax_account_code, liability_account_code, tax_authority,
                due_date, base_tax_amount, created_by
            ) VALUES (
                NEW.id, 'ROAD_FUND_LEVY', 0, NEW.total_value, NEW.road_fund_levy,
                '5520', '2320', 'Ministry of Roads and Highways',
                NEW.delivery_date + INTERVAL '30 days', NEW.road_fund_levy, NEW.updated_by
            );
        END IF;
        
        -- Price Stabilization Levy
        IF NEW.price_stabilization_levy > 0 THEN
            INSERT INTO tax_accruals (
                delivery_id, tax_type, tax_rate, taxable_amount, tax_amount,
                tax_account_code, liability_account_code, tax_authority,
                due_date, base_tax_amount, created_by
            ) VALUES (
                NEW.id, 'PRICE_STABILIZATION_LEVY', 0, NEW.total_value, NEW.price_stabilization_levy,
                '5530', '2330', 'Ministry of Energy',
                NEW.delivery_date + INTERVAL '30 days', NEW.price_stabilization_levy, NEW.updated_by
            );
        END IF;
        
        -- UPPF Levy
        IF NEW.unified_petroleum_price_fund_levy > 0 THEN
            INSERT INTO tax_accruals (
                delivery_id, tax_type, tax_rate, taxable_amount, tax_amount,
                tax_account_code, liability_account_code, tax_authority,
                due_date, base_tax_amount, created_by
            ) VALUES (
                NEW.id, 'UPPF_LEVY', 0, NEW.total_value, NEW.unified_petroleum_price_fund_levy,
                '5540', '2340', 'National Petroleum Authority',
                NEW.delivery_date + INTERVAL '15 days', NEW.unified_petroleum_price_fund_levy, NEW.updated_by
            );
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tax accrual calculation
CREATE TRIGGER trg_calculate_tax_accruals
    AFTER UPDATE ON daily_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tax_accruals();

-- =====================================================
-- CREATE DELIVERY STATUS UPDATE TRIGGER
-- =====================================================

-- Function to generate journal entries when delivery is completed
CREATE OR REPLACE FUNCTION auto_generate_journal_entries() RETURNS TRIGGER AS $$
DECLARE
    v_journal_entry_id UUID;
BEGIN
    -- Generate journal entries when status changes to DELIVERED
    IF NEW.status = 'DELIVERED' AND (OLD.status IS NULL OR OLD.status != 'DELIVERED') THEN
        IF NEW.station_type IS NOT NULL THEN
            v_journal_entry_id := generate_delivery_journal_entries(NEW.id, NEW.station_type);
            
            -- Update delivery with generated journal entry reference
            UPDATE daily_deliveries 
            SET integration_flags = COALESCE(integration_flags::jsonb, '{}'::jsonb) || 
                jsonb_build_object('auto_journal_entry_id', v_journal_entry_id::text)
            WHERE id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic journal entry generation
CREATE TRIGGER trg_auto_generate_journal_entries
    AFTER UPDATE ON daily_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_journal_entries();

-- =====================================================
-- CREATE PRICE BUILD-UP AUDIT TRIGGERS
-- =====================================================

-- Function to update price build-up snapshot
CREATE OR REPLACE FUNCTION update_price_buildup_snapshot() RETURNS TRIGGER AS $$
DECLARE
    v_snapshot JSONB;
    v_component RECORD;
BEGIN
    -- Build price snapshot from current components
    v_snapshot := '{}'::jsonb;
    
    FOR v_component IN 
        SELECT * FROM price_build_up_components 
        WHERE product_grade = NEW.product_type::text
        AND station_type = NEW.station_type
        AND effective_date <= NEW.delivery_date
        AND (expiry_date IS NULL OR expiry_date >= NEW.delivery_date)
        AND is_active = true
        ORDER BY display_order
    LOOP
        v_snapshot := v_snapshot || jsonb_build_object(
            v_component.component_code,
            jsonb_build_object(
                'name', v_component.component_name,
                'type', v_component.component_type,
                'value', v_component.component_value,
                'value_type', v_component.value_type,
                'effective_date', v_component.effective_date
            )
        );
    END LOOP;
    
    NEW.price_build_up_snapshot := v_snapshot;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price build-up snapshot updates
CREATE TRIGGER trg_update_price_buildup_snapshot
    BEFORE INSERT OR UPDATE ON daily_deliveries
    FOR EACH ROW
    WHEN (NEW.station_type IS NOT NULL AND NEW.product_type IS NOT NULL)
    EXECUTE FUNCTION update_price_buildup_snapshot();

-- =====================================================
-- CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Create trigger for price_build_up_components updated_at
CREATE TRIGGER update_price_build_up_components_updated_at
    BEFORE UPDATE ON price_build_up_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tax_accruals updated_at
CREATE TRIGGER update_tax_accruals_updated_at
    BEFORE UPDATE ON tax_accruals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE PRICE BUILD-UP COMPONENTS
-- =====================================================

-- Sample price components for PMS (Premium Motor Spirit)
INSERT INTO price_build_up_components (
    component_code, component_name, component_type, product_grade, station_type,
    effective_date, component_value, value_type, is_mandatory, display_order,
    description, created_by
) VALUES
    ('BASE_PRICE_PMS', 'Base Price - PMS', 'BASE_PRICE', 'PMS', 'COCO', '2025-01-16', 8.5000, 'FIXED', true, 1, 'Base price for Premium Motor Spirit', (SELECT id FROM users LIMIT 1)),
    ('PETROLEUM_TAX_PMS', 'Petroleum Tax', 'TAX', 'PMS', 'COCO', '2025-01-16', 0.4600, 'FIXED', true, 2, 'Petroleum tax levy', (SELECT id FROM users LIMIT 1)),
    ('ENERGY_LEVY_PMS', 'Energy Fund Levy', 'LEVY', 'PMS', 'COCO', '2025-01-16', 0.0500, 'FIXED', true, 3, 'Energy development fund levy', (SELECT id FROM users LIMIT 1)),
    ('ROAD_LEVY_PMS', 'Road Fund Levy', 'LEVY', 'PMS', 'COCO', '2025-01-16', 0.4500, 'FIXED', true, 4, 'Road infrastructure levy', (SELECT id FROM users LIMIT 1)),
    ('PRICE_STAB_PMS', 'Price Stabilization Levy', 'LEVY', 'PMS', 'COCO', '2025-01-16', 0.0000, 'FIXED', false, 5, 'Price stabilization mechanism', (SELECT id FROM users LIMIT 1)),
    ('PRIMARY_DIST_PMS', 'Primary Distribution Margin', 'MARGIN', 'PMS', 'COCO', '2025-01-16', 0.2879, 'FIXED', true, 6, 'Primary distribution margin', (SELECT id FROM users LIMIT 1)),
    ('MARKETING_PMS', 'Marketing Margin', 'MARGIN', 'PMS', 'COCO', '2025-01-16', 0.2300, 'FIXED', true, 7, 'Marketing company margin', (SELECT id FROM users LIMIT 1)),
    ('DEALER_MARGIN_PMS', 'Dealer Margin', 'MARGIN', 'PMS', 'COCO', '2025-01-16', 0.4500, 'FIXED', true, 8, 'Dealer operational margin', (SELECT id FROM users LIMIT 1)),
    ('UPPF_LEVY_PMS', 'UPPF Levy', 'LEVY', 'PMS', 'COCO', '2025-01-16', 0.0800, 'FIXED', true, 9, 'Unified Petroleum Price Fund levy', (SELECT id FROM users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Sample price components for AGO (Automotive Gas Oil)
INSERT INTO price_build_up_components (
    component_code, component_name, component_type, product_grade, station_type,
    effective_date, component_value, value_type, is_mandatory, display_order,
    description, created_by
) VALUES
    ('BASE_PRICE_AGO', 'Base Price - AGO', 'BASE_PRICE', 'AGO', 'COCO', '2025-01-16', 8.2000, 'FIXED', true, 1, 'Base price for Automotive Gas Oil', (SELECT id FROM users LIMIT 1)),
    ('PETROLEUM_TAX_AGO', 'Petroleum Tax', 'TAX', 'AGO', 'COCO', '2025-01-16', 0.2300, 'FIXED', true, 2, 'Petroleum tax levy', (SELECT id FROM users LIMIT 1)),
    ('ENERGY_LEVY_AGO', 'Energy Fund Levy', 'LEVY', 'AGO', 'COCO', '2025-01-16', 0.0500, 'FIXED', true, 3, 'Energy development fund levy', (SELECT id FROM users LIMIT 1)),
    ('ROAD_LEVY_AGO', 'Road Fund Levy', 'LEVY', 'AGO', 'COCO', '2025-01-16', 0.4500, 'FIXED', true, 4, 'Road infrastructure levy', (SELECT id FROM users LIMIT 1)),
    ('PRICE_STAB_AGO', 'Price Stabilization Levy', 'LEVY', 'AGO', 'COCO', '2025-01-16', 0.0000, 'FIXED', false, 5, 'Price stabilization mechanism', (SELECT id FROM users LIMIT 1)),
    ('PRIMARY_DIST_AGO', 'Primary Distribution Margin', 'MARGIN', 'AGO', 'COCO', '2025-01-16', 0.2879, 'FIXED', true, 6, 'Primary distribution margin', (SELECT id FROM users LIMIT 1)),
    ('MARKETING_AGO', 'Marketing Margin', 'MARGIN', 'AGO', 'COCO', '2025-01-16', 0.2300, 'FIXED', true, 7, 'Marketing company margin', (SELECT id FROM users LIMIT 1)),
    ('DEALER_MARGIN_AGO', 'Dealer Margin', 'MARGIN', 'AGO', 'COCO', '2025-01-16', 0.4500, 'FIXED', true, 8, 'Dealer operational margin', (SELECT id FROM users LIMIT 1)),
    ('UPPF_LEVY_AGO', 'UPPF Levy', 'LEVY', 'AGO', 'COCO', '2025-01-16', 0.0800, 'FIXED', true, 9, 'Unified Petroleum Price Fund levy', (SELECT id FROM users LIMIT 1))
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- =====================================================

-- Check if all new columns were added successfully
DO $$
BEGIN
    -- Verify station_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_deliveries' AND column_name = 'station_type'
    ) THEN
        RAISE EXCEPTION 'station_type column not added to daily_deliveries';
    END IF;
    
    -- Verify price_build_up_snapshot column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_deliveries' AND column_name = 'price_build_up_snapshot'
    ) THEN
        RAISE EXCEPTION 'price_build_up_snapshot column not added to daily_deliveries';
    END IF;
    
    -- Verify price_build_up_components table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'price_build_up_components'
    ) THEN
        RAISE EXCEPTION 'price_build_up_components table not created';
    END IF;
    
    -- Verify tax_accruals table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tax_accruals'
    ) THEN
        RAISE EXCEPTION 'tax_accruals table not created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully - all schema changes verified';
END $$;