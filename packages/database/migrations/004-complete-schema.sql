-- =====================================================
-- COMPLETE OMC ERP DATABASE SCHEMA
-- Version: 2.0.0
-- Description: Comprehensive schema with GL, inventory, transactions, and IoT
-- =====================================================

-- =====================================================
-- SYSTEM CONFIGURATION TABLES
-- =====================================================

-- System configuration for avoiding hardcoded values
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL,
    config_key VARCHAR(200) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'array'
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    validation_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(module_name, config_key)
);

-- Configuration audit trail
CREATE TABLE IF NOT EXISTS configuration_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES system_configurations(id),
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES users(id)
);

-- =====================================================
-- GENERAL LEDGER & ACCOUNTING TABLES
-- =====================================================

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    parent_account_code VARCHAR(20),
    account_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
    account_category VARCHAR(100), -- 'CURRENT_ASSET', 'FIXED_ASSET', 'CURRENT_LIABILITY', etc.
    normal_balance VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
    is_control_account BOOLEAN DEFAULT FALSE,
    is_bank_account BOOLEAN DEFAULT FALSE,
    is_reconcilable BOOLEAN DEFAULT FALSE,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    opening_balance DECIMAL(20, 2) DEFAULT 0,
    current_balance DECIMAL(20, 2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_account_code) REFERENCES chart_of_accounts(account_code)
);

-- Accounting Periods
CREATE TABLE IF NOT EXISTS accounting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_date TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    is_year_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fiscal_year, period_number)
);

-- Journal Entry Headers
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_number VARCHAR(50) UNIQUE NOT NULL,
    journal_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    period_id UUID REFERENCES accounting_periods(id),
    journal_type VARCHAR(50) NOT NULL, -- 'GENERAL', 'SALES', 'PURCHASE', 'CASH_RECEIPT', 'CASH_PAYMENT', 'INVENTORY'
    source_module VARCHAR(50), -- 'SALES', 'INVENTORY', 'PAYROLL', 'FIXED_ASSETS'
    source_document_type VARCHAR(50),
    source_document_id UUID,
    description TEXT NOT NULL,
    total_debit DECIMAL(20, 2) NOT NULL,
    total_credit DECIMAL(20, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'POSTED', 'REVERSED'
    is_reversed BOOLEAN DEFAULT FALSE,
    reversed_by UUID REFERENCES journal_entries(id),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    CHECK (total_debit = total_credit)
);

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    description TEXT,
    debit_amount DECIMAL(20, 2) DEFAULT 0,
    credit_amount DECIMAL(20, 2) DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10, 6) DEFAULT 1,
    base_debit_amount DECIMAL(20, 2) DEFAULT 0,
    base_credit_amount DECIMAL(20, 2) DEFAULT 0,
    station_id UUID REFERENCES stations(id),
    customer_id UUID,
    supplier_id UUID,
    employee_id UUID,
    project_code VARCHAR(50),
    cost_center_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0)),
    UNIQUE(journal_entry_id, line_number)
);

-- General Ledger (Posted Transactions)
CREATE TABLE IF NOT EXISTS general_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
    journal_line_id UUID NOT NULL REFERENCES journal_entry_lines(id),
    transaction_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    period_id UUID REFERENCES accounting_periods(id),
    description TEXT,
    debit_amount DECIMAL(20, 2) DEFAULT 0,
    credit_amount DECIMAL(20, 2) DEFAULT 0,
    running_balance DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10, 6) DEFAULT 1,
    base_amount DECIMAL(20, 2) NOT NULL,
    station_id UUID REFERENCES stations(id),
    reference_type VARCHAR(50),
    reference_id UUID,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciliation_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gl_account_date (account_code, transaction_date),
    INDEX idx_gl_period (period_id),
    INDEX idx_gl_station (station_id)
);

-- Trial Balance Snapshots
CREATE TABLE IF NOT EXISTS trial_balance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES accounting_periods(id),
    snapshot_date DATE NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    opening_debit DECIMAL(20, 2) DEFAULT 0,
    opening_credit DECIMAL(20, 2) DEFAULT 0,
    period_debit DECIMAL(20, 2) DEFAULT 0,
    period_credit DECIMAL(20, 2) DEFAULT 0,
    closing_debit DECIMAL(20, 2) DEFAULT 0,
    closing_credit DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_id, account_code)
);

-- =====================================================
-- CUSTOMER MANAGEMENT TABLES
-- =====================================================

-- Customer Categories
CREATE TABLE IF NOT EXISTS customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    credit_limit DECIMAL(20, 2) DEFAULT 0,
    payment_terms_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    customer_type VARCHAR(20) NOT NULL, -- 'INDIVIDUAL', 'CORPORATE', 'GOVERNMENT'
    category_id UUID REFERENCES customer_categories(id),
    company_name VARCHAR(200),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(200),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    tin_number VARCHAR(50),
    business_registration_number VARCHAR(100),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Ghana',
    gps_coordinates JSONB,
    credit_limit DECIMAL(20, 2) DEFAULT 0,
    current_balance DECIMAL(20, 2) DEFAULT 0,
    payment_terms_days INTEGER DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    account_receivable_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'BRONZE', -- 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'
    preferred_payment_method VARCHAR(50),
    preferred_station_id UUID REFERENCES stations(id),
    sales_rep_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_credit_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    INDEX idx_customer_type (customer_type),
    INDEX idx_customer_email (email),
    INDEX idx_customer_phone (phone_primary)
);

-- Customer Vehicles (for fleet customers)
CREATE TABLE IF NOT EXISTS customer_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    fuel_type VARCHAR(20), -- 'PETROL', 'DIESEL', 'LPG'
    tank_capacity DECIMAL(10, 2),
    average_consumption DECIMAL(10, 2), -- liters per 100km
    driver_name VARCHAR(200),
    driver_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(100) NOT NULL,
    program_code VARCHAR(20) UNIQUE NOT NULL,
    points_per_liter DECIMAL(10, 2) DEFAULT 1,
    points_per_cedi DECIMAL(10, 2) DEFAULT 1,
    redemption_rate DECIMAL(10, 4), -- cedis per point
    tier_rules JSONB, -- defines tier upgrade/downgrade rules
    reward_catalog JSONB, -- available rewards and point costs
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED'
    points_amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    description TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ENHANCED TRANSACTION TABLES
-- =====================================================

-- Payment Methods Configuration
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_code VARCHAR(20) UNIQUE NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    method_type VARCHAR(50) NOT NULL, -- 'CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'CREDIT'
    provider_name VARCHAR(100), -- 'MTN', 'VODAFONE', 'AIRTEL_TIGO', etc.
    api_endpoint VARCHAR(500),
    api_credentials JSONB, -- encrypted
    settlement_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    transaction_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    transaction_fee_fixed DECIMAL(10, 2) DEFAULT 0,
    minimum_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Transactions (Partitioned by month)
CREATE TABLE IF NOT EXISTS fuel_transactions (
    id UUID DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    pump_id UUID NOT NULL REFERENCES pumps(id),
    shift_id UUID REFERENCES shifts(id),
    attendant_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    vehicle_id UUID REFERENCES customer_vehicles(id),
    product_type VARCHAR(50) NOT NULL, -- 'PETROL', 'DIESEL', 'KEROSENE', 'LPG'
    quantity_liters DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 4) NOT NULL,
    total_amount DECIMAL(20, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(20, 2) NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED', 'REVERSED'
    payment_reference VARCHAR(200),
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,
    pos_receipt_number VARCHAR(100),
    pump_reading_start DECIMAL(20, 2),
    pump_reading_end DECIMAL(20, 2),
    is_credit_sale BOOLEAN DEFAULT FALSE,
    credit_approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, transaction_date)
) PARTITION BY RANGE (transaction_date);

-- Create partitions for 2025
CREATE TABLE IF NOT EXISTS fuel_transactions_2025_01 PARTITION OF fuel_transactions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS fuel_transactions_2025_02 PARTITION OF fuel_transactions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS fuel_transactions_2025_03 PARTITION OF fuel_transactions
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
-- Add more partitions as needed...

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL, -- 'SALE', 'REFUND', 'SETTLEMENT'
    reference_type VARCHAR(50) NOT NULL, -- 'FUEL_TRANSACTION', 'INVOICE', 'CREDIT_NOTE'
    reference_id UUID NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'
    provider_reference VARCHAR(200),
    provider_response JSONB,
    mobile_money_number VARCHAR(20),
    card_last_four VARCHAR(4),
    bank_reference VARCHAR(100),
    processing_fee DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(20, 2),
    initiated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    INDEX idx_payment_status (status),
    INDEX idx_payment_reference (reference_type, reference_id)
);

-- Transaction Reconciliation
CREATE TABLE IF NOT EXISTS transaction_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_date DATE NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    shift_id UUID REFERENCES shifts(id),
    reconciliation_type VARCHAR(50) NOT NULL, -- 'DAILY', 'SHIFT', 'PUMP', 'PAYMENT_METHOD'
    expected_amount DECIMAL(20, 2) NOT NULL,
    actual_amount DECIMAL(20, 2) NOT NULL,
    variance_amount DECIMAL(20, 2) NOT NULL,
    variance_percentage DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'DISPUTED', 'RESOLVED'
    reconciled_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    supporting_documents JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    UNIQUE(reconciliation_date, station_id, reconciliation_type)
);

-- =====================================================
-- INVENTORY MANAGEMENT TABLES
-- =====================================================

-- Products Master
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(50) NOT NULL, -- 'FUEL', 'LUBRICANT', 'CONSUMABLE'
    product_type VARCHAR(50) NOT NULL, -- 'PETROL', 'DIESEL', 'ENGINE_OIL', etc.
    unit_of_measure VARCHAR(20) NOT NULL, -- 'LITERS', 'GALLONS', 'PIECES'
    density DECIMAL(10, 4), -- for volume/weight conversions
    reorder_level DECIMAL(10, 2),
    reorder_quantity DECIMAL(10, 2),
    minimum_stock DECIMAL(10, 2),
    maximum_stock DECIMAL(10, 2),
    inventory_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    cost_of_sales_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    sales_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Stock Receipts (Deliveries)
CREATE TABLE IF NOT EXISTS stock_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    receipt_date TIMESTAMPTZ NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    delivery_note_number VARCHAR(100),
    waybill_number VARCHAR(100),
    truck_number VARCHAR(50),
    driver_name VARCHAR(200),
    driver_license VARCHAR(100),
    total_quantity DECIMAL(20, 2) NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'ACCEPTED', 'REJECTED'
    received_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    temperature_readings JSONB,
    quality_certificates JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
);

-- Stock Receipt Items
CREATE TABLE IF NOT EXISTS stock_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES stock_receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    tank_id UUID REFERENCES tanks(id),
    ordered_quantity DECIMAL(20, 2) NOT NULL,
    delivered_quantity DECIMAL(20, 2) NOT NULL,
    accepted_quantity DECIMAL(20, 2),
    variance_quantity DECIMAL(20, 2),
    unit_cost DECIMAL(10, 4) NOT NULL,
    total_cost DECIMAL(20, 2) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    temperature_celsius DECIMAL(5, 2),
    density_reading DECIMAL(10, 4),
    quality_status VARCHAR(20), -- 'PASSED', 'FAILED', 'PENDING'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_date TIMESTAMPTZ NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- 'RECEIPT', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'LOSS'
    station_id UUID NOT NULL REFERENCES stations(id),
    product_id UUID NOT NULL REFERENCES products(id),
    tank_id UUID REFERENCES tanks(id),
    source_document_type VARCHAR(50),
    source_document_id UUID,
    quantity DECIMAL(20, 2) NOT NULL, -- positive for IN, negative for OUT
    unit_cost DECIMAL(10, 4),
    total_cost DECIMAL(20, 2),
    balance_before DECIMAL(20, 2),
    balance_after DECIMAL(20, 2),
    created_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movement_date (movement_date),
    INDEX idx_movement_station_product (station_id, product_id)
);

-- Stock Levels (Current Inventory)
CREATE TABLE IF NOT EXISTS stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id),
    product_id UUID NOT NULL REFERENCES products(id),
    tank_id UUID REFERENCES tanks(id),
    current_quantity DECIMAL(20, 2) NOT NULL,
    reserved_quantity DECIMAL(20, 2) DEFAULT 0,
    available_quantity DECIMAL(20, 2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    last_receipt_date TIMESTAMPTZ,
    last_sale_date TIMESTAMPTZ,
    average_daily_sales DECIMAL(10, 2),
    days_of_stock DECIMAL(10, 2),
    reorder_alert_sent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(station_id, product_id, tank_id)
);

-- Tank Readings (IoT Integration)
CREATE TABLE IF NOT EXISTS tank_readings (
    time TIMESTAMPTZ NOT NULL,
    tank_id UUID NOT NULL REFERENCES tanks(id),
    station_id UUID NOT NULL REFERENCES stations(id),
    product_id UUID REFERENCES products(id),
    level_percentage DECIMAL(5, 2) NOT NULL,
    volume_liters DECIMAL(20, 2) NOT NULL,
    temperature_celsius DECIMAL(5, 2),
    water_level_mm DECIMAL(10, 2),
    density_reading DECIMAL(10, 4),
    sensor_status VARCHAR(20), -- 'ONLINE', 'OFFLINE', 'ERROR'
    alert_triggered BOOLEAN DEFAULT FALSE,
    alert_type VARCHAR(50), -- 'LOW_LEVEL', 'HIGH_WATER', 'TEMPERATURE', 'LEAK'
    PRIMARY KEY (time, tank_id)
);

-- Create hypertable for time-series data (requires TimescaleDB)
-- SELECT create_hypertable('tank_readings', 'time');

-- Stock Take (Physical Count)
CREATE TABLE IF NOT EXISTS stock_takes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_take_number VARCHAR(50) UNIQUE NOT NULL,
    stock_take_date DATE NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'APPROVED'
    initiated_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    total_variance_value DECIMAL(20, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
);

-- Stock Take Details
CREATE TABLE IF NOT EXISTS stock_take_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_take_id UUID NOT NULL REFERENCES stock_takes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    tank_id UUID REFERENCES tanks(id),
    system_quantity DECIMAL(20, 2) NOT NULL,
    physical_quantity DECIMAL(20, 2) NOT NULL,
    variance_quantity DECIMAL(20, 2) NOT NULL,
    unit_cost DECIMAL(10, 4),
    variance_value DECIMAL(20, 2),
    adjustment_posted BOOLEAN DEFAULT FALSE,
    counted_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INVOICING & BILLING TABLES
-- =====================================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    station_id UUID REFERENCES stations(id),
    invoice_type VARCHAR(20) NOT NULL, -- 'STANDARD', 'CREDIT_NOTE', 'DEBIT_NOTE'
    reference_number VARCHAR(100),
    subtotal_amount DECIMAL(20, 2) NOT NULL,
    discount_amount DECIMAL(20, 2) DEFAULT 0,
    tax_amount DECIMAL(20, 2) DEFAULT 0,
    total_amount DECIMAL(20, 2) NOT NULL,
    paid_amount DECIMAL(20, 2) DEFAULT 0,
    balance_amount DECIMAL(20, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    INDEX idx_invoice_customer (customer_id),
    INDEX idx_invoice_status (status),
    INDEX idx_invoice_date (invoice_date)
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 4) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    line_total DECIMAL(20, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(invoice_id, line_number)
);

-- =====================================================
-- AUTOMATED JOURNAL ENTRY TRIGGERS
-- =====================================================

-- Function to create journal entries for fuel transactions
CREATE OR REPLACE FUNCTION create_fuel_transaction_journal()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_journal_number VARCHAR(50);
    v_period_id UUID;
    v_cash_account VARCHAR(20);
    v_revenue_account VARCHAR(20);
    v_tax_account VARCHAR(20);
BEGIN
    -- Only process completed transactions
    IF NEW.payment_status != 'COMPLETED' THEN
        RETURN NEW;
    END IF;
    
    -- Get current accounting period
    SELECT id INTO v_period_id
    FROM accounting_periods
    WHERE NEW.transaction_date::date BETWEEN start_date AND end_date
    AND is_closed = FALSE
    LIMIT 1;
    
    -- Get account codes from configuration
    SELECT config_value->>'cash_account' INTO v_cash_account
    FROM system_configurations
    WHERE module_name = 'ACCOUNTING' AND config_key = 'DEFAULT_ACCOUNTS';
    
    -- Generate journal number
    v_journal_number := 'JV-FUEL-' || TO_CHAR(NEW.transaction_date, 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
    
    -- Create journal entry header
    INSERT INTO journal_entries (
        journal_number, journal_date, posting_date, period_id,
        journal_type, source_module, source_document_type, source_document_id,
        description, total_debit, total_credit, status
    ) VALUES (
        v_journal_number, NEW.transaction_date::date, CURRENT_DATE, v_period_id,
        'SALES', 'FUEL_SALES', 'FUEL_TRANSACTION', NEW.id,
        'Fuel sale - ' || NEW.transaction_number,
        NEW.total_amount, NEW.total_amount, 'POSTED'
    ) RETURNING id INTO v_journal_id;
    
    -- Debit: Cash/Bank or Accounts Receivable
    IF NEW.is_credit_sale THEN
        INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_code, description,
            debit_amount, credit_amount, station_id, customer_id
        )
        SELECT 
            v_journal_id, 1, c.account_receivable_code,
            'Credit sale to ' || c.customer_code,
            NEW.net_amount, 0, NEW.station_id, NEW.customer_id
        FROM customers c WHERE c.id = NEW.customer_id;
    ELSE
        INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_code, description,
            debit_amount, credit_amount, station_id
        )
        SELECT 
            v_journal_id, 1, pm.settlement_account_code,
            'Payment via ' || pm.method_name,
            NEW.net_amount, 0, NEW.station_id
        FROM payment_methods pm WHERE pm.id = NEW.payment_method_id;
    END IF;
    
    -- Credit: Revenue
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, station_id
    ) VALUES (
        v_journal_id, 2, '4000', -- Revenue account
        'Fuel revenue - ' || NEW.product_type,
        0, NEW.total_amount - NEW.tax_amount, NEW.station_id
    );
    
    -- Credit: Tax Payable (if applicable)
    IF NEW.tax_amount > 0 THEN
        INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_code, description,
            debit_amount, credit_amount, station_id
        ) VALUES (
            v_journal_id, 3, '2300', -- Tax payable account
            'VAT/NHIL on fuel sale',
            0, NEW.tax_amount, NEW.station_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automated journal entries
CREATE TRIGGER trigger_fuel_transaction_journal
    AFTER INSERT OR UPDATE ON fuel_transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_fuel_transaction_journal();

-- Function to create journal entries for inventory receipts
CREATE OR REPLACE FUNCTION create_inventory_receipt_journal()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_journal_number VARCHAR(50);
    v_period_id UUID;
BEGIN
    -- Only process approved receipts
    IF NEW.status != 'APPROVED' THEN
        RETURN NEW;
    END IF;
    
    -- Get current accounting period
    SELECT id INTO v_period_id
    FROM accounting_periods
    WHERE NEW.receipt_date::date BETWEEN start_date AND end_date
    AND is_closed = FALSE
    LIMIT 1;
    
    -- Generate journal number
    v_journal_number := 'JV-INV-' || TO_CHAR(NEW.receipt_date, 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
    
    -- Create journal entry header
    INSERT INTO journal_entries (
        journal_number, journal_date, posting_date, period_id,
        journal_type, source_module, source_document_type, source_document_id,
        description, total_debit, total_credit, status
    ) VALUES (
        v_journal_number, NEW.receipt_date::date, CURRENT_DATE, v_period_id,
        'PURCHASE', 'INVENTORY', 'STOCK_RECEIPT', NEW.id,
        'Stock receipt - ' || NEW.receipt_number,
        NEW.total_value, NEW.total_value, 'POSTED'
    ) RETURNING id INTO v_journal_id;
    
    -- Debit: Inventory
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, station_id
    ) VALUES (
        v_journal_id, 1, '1300', -- Inventory account
        'Fuel inventory receipt',
        NEW.total_value, 0, NEW.station_id
    );
    
    -- Credit: Accounts Payable
    INSERT INTO journal_entry_lines (
        journal_entry_id, line_number, account_code, description,
        debit_amount, credit_amount, station_id
    )
    SELECT 
        v_journal_id, 2, '2100', -- Accounts payable
        'Payable to ' || s.name,
        0, NEW.total_value, NEW.station_id
    FROM suppliers s WHERE s.id = NEW.supplier_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory receipts
CREATE TRIGGER trigger_inventory_receipt_journal
    AFTER UPDATE ON stock_receipts
    FOR EACH ROW
    WHEN (OLD.status != 'APPROVED' AND NEW.status = 'APPROVED')
    EXECUTE FUNCTION create_inventory_receipt_journal();

-- =====================================================
-- IOT MONITORING & ALERTS
-- =====================================================

-- IoT Devices
CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'TANK_SENSOR', 'PUMP_METER', 'POS_TERMINAL'
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(200),
    firmware_version VARCHAR(50),
    station_id UUID REFERENCES stations(id),
    tank_id UUID REFERENCES tanks(id),
    pump_id UUID REFERENCES pumps(id),
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY'
    last_ping_at TIMESTAMPTZ,
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'THRESHOLD', 'ANOMALY', 'SCHEDULED'
    module VARCHAR(50) NOT NULL, -- 'INVENTORY', 'SALES', 'MAINTENANCE'
    condition_expression TEXT NOT NULL, -- SQL or formula
    threshold_value DECIMAL(20, 2),
    comparison_operator VARCHAR(10), -- '>', '<', '>=', '<=', '=', '!='
    alert_severity VARCHAR(20) NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
    notification_channels JSONB, -- ['EMAIL', 'SMS', 'PUSH', 'DASHBOARD']
    recipient_roles JSONB,
    recipient_users JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Alert History
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID REFERENCES alert_rules(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    station_id UUID REFERENCES stations(id),
    reference_type VARCHAR(50),
    reference_id UUID,
    metric_value DECIMAL(20, 2),
    threshold_value DECIMAL(20, 2),
    status VARCHAR(20) DEFAULT 'NEW', -- 'NEW', 'ACKNOWLEDGED', 'RESOLVED', 'IGNORED'
    acknowledged_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    INDEX idx_alert_status (status),
    INDEX idx_alert_severity (severity),
    INDEX idx_alert_station (station_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_journal_entries_date ON journal_entries(journal_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_code);
CREATE INDEX idx_fuel_transactions_date ON fuel_transactions(transaction_date);
CREATE INDEX idx_fuel_transactions_station ON fuel_transactions(station_id);
CREATE INDEX idx_fuel_transactions_customer ON fuel_transactions(customer_id);
CREATE INDEX idx_stock_receipts_station ON stock_receipts(station_id);
CREATE INDEX idx_stock_receipts_date ON stock_receipts(receipt_date);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(initiated_at);

-- =====================================================
-- DEFAULT DATA FOR SYSTEM CONFIGURATION
-- =====================================================

-- Insert default system configurations
INSERT INTO system_configurations (module_name, config_key, config_value, config_type, description) VALUES
('GENERAL', 'COMPANY_NAME', '"Ghana Oil Marketing Company"', 'string', 'Company name for reports'),
('GENERAL', 'FISCAL_YEAR_START', '"01-01"', 'string', 'Fiscal year start date (MM-DD)'),
('GENERAL', 'DEFAULT_CURRENCY', '"GHS"', 'string', 'Default currency code'),
('ACCOUNTING', 'DEFAULT_ACCOUNTS', '{
    "cash_account": "1100",
    "bank_account": "1200",
    "accounts_receivable": "1210",
    "accounts_payable": "2100",
    "inventory_account": "1300",
    "revenue_account": "4000",
    "cost_of_sales": "5000",
    "tax_payable": "2300"
}', 'json', 'Default GL accounts for automated entries'),
('INVENTORY', 'LOW_STOCK_THRESHOLD', '20', 'number', 'Percentage threshold for low stock alerts'),
('INVENTORY', 'CRITICAL_STOCK_THRESHOLD', '10', 'number', 'Percentage threshold for critical stock alerts'),
('SALES', 'DEFAULT_PAYMENT_TERMS', '30', 'number', 'Default payment terms in days'),
('SALES', 'LOYALTY_POINTS_ENABLED', 'true', 'boolean', 'Enable loyalty points system'),
('PAYMENT', 'MTN_MOMO_CONFIG', '{
    "api_url": "https://sandbox.momodeveloper.mtn.com",
    "api_key": "encrypted_key_here",
    "environment": "sandbox"
}', 'json', 'MTN Mobile Money configuration'),
('PAYMENT', 'VODAFONE_CASH_CONFIG', '{
    "api_url": "https://api.vodafone.com.gh",
    "merchant_id": "merchant_id_here",
    "api_key": "encrypted_key_here"
}', 'json', 'Vodafone Cash configuration'),
('IOT', 'TANK_READING_INTERVAL', '300', 'number', 'Tank reading interval in seconds'),
('IOT', 'ALERT_COOLDOWN_PERIOD', '3600', 'number', 'Alert cooldown period in seconds')
ON CONFLICT (module_name, config_key) DO NOTHING;

-- Insert default Chart of Accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, account_category, normal_balance) VALUES
-- Assets
('1000', 'Assets', 'ASSET', 'ASSET', 'DEBIT'),
('1100', 'Cash and Cash Equivalents', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1110', 'Petty Cash', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1120', 'Cash in Bank - Operating', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1200', 'Accounts Receivable', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1210', 'Trade Receivables', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1300', 'Inventory', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1310', 'Fuel Inventory', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1320', 'Lubricants Inventory', 'ASSET', 'CURRENT_ASSET', 'DEBIT'),
('1500', 'Fixed Assets', 'ASSET', 'FIXED_ASSET', 'DEBIT'),
('1510', 'Land and Buildings', 'ASSET', 'FIXED_ASSET', 'DEBIT'),
('1520', 'Equipment and Machinery', 'ASSET', 'FIXED_ASSET', 'DEBIT'),
('1530', 'Vehicles', 'ASSET', 'FIXED_ASSET', 'DEBIT'),
-- Liabilities
('2000', 'Liabilities', 'LIABILITY', 'LIABILITY', 'CREDIT'),
('2100', 'Accounts Payable', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
('2110', 'Trade Payables', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
('2200', 'Accrued Expenses', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
('2300', 'Tax Payable', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
('2310', 'VAT Payable', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
('2320', 'NHIL Payable', 'LIABILITY', 'CURRENT_LIABILITY', 'CREDIT'),
-- Equity
('3000', 'Equity', 'EQUITY', 'EQUITY', 'CREDIT'),
('3100', 'Share Capital', 'EQUITY', 'EQUITY', 'CREDIT'),
('3200', 'Retained Earnings', 'EQUITY', 'EQUITY', 'CREDIT'),
-- Revenue
('4000', 'Revenue', 'REVENUE', 'REVENUE', 'CREDIT'),
('4100', 'Fuel Sales', 'REVENUE', 'REVENUE', 'CREDIT'),
('4110', 'Petrol Sales', 'REVENUE', 'REVENUE', 'CREDIT'),
('4120', 'Diesel Sales', 'REVENUE', 'REVENUE', 'CREDIT'),
('4200', 'Lubricant Sales', 'REVENUE', 'REVENUE', 'CREDIT'),
('4300', 'Service Revenue', 'REVENUE', 'REVENUE', 'CREDIT'),
-- Expenses
('5000', 'Cost of Sales', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('5100', 'Fuel Cost', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('5200', 'Lubricant Cost', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6000', 'Operating Expenses', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6100', 'Salaries and Wages', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6200', 'Rent Expense', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6300', 'Utilities', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6400', 'Transportation', 'EXPENSE', 'EXPENSE', 'DEBIT'),
('6500', 'Marketing and Advertising', 'EXPENSE', 'EXPENSE', 'DEBIT')
ON CONFLICT (account_code) DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (method_code, method_name, method_type, provider_name, settlement_account_code) VALUES
('CASH', 'Cash', 'CASH', NULL, '1110'),
('MTN_MOMO', 'MTN Mobile Money', 'MOBILE_MONEY', 'MTN', '1120'),
('VODAFONE_CASH', 'Vodafone Cash', 'MOBILE_MONEY', 'VODAFONE', '1120'),
('AIRTEL_MONEY', 'AirtelTigo Money', 'MOBILE_MONEY', 'AIRTEL_TIGO', '1120'),
('VISA', 'Visa Card', 'CARD', 'VISA', '1120'),
('MASTERCARD', 'Mastercard', 'CARD', 'MASTERCARD', '1120'),
('BANK_TRANSFER', 'Bank Transfer', 'BANK_TRANSFER', NULL, '1120'),
('CREDIT', 'Credit Sale', 'CREDIT', NULL, '1210')
ON CONFLICT (method_code) DO NOTHING;

-- Insert default products
INSERT INTO products (product_code, product_name, product_category, product_type, unit_of_measure, inventory_account_code, cost_of_sales_account_code, sales_account_code) VALUES
('PETROL-95', 'Petrol RON 95', 'FUEL', 'PETROL', 'LITERS', '1310', '5100', '4110'),
('PETROL-91', 'Petrol RON 91', 'FUEL', 'PETROL', 'LITERS', '1310', '5100', '4110'),
('DIESEL', 'Diesel', 'FUEL', 'DIESEL', 'LITERS', '1310', '5100', '4120'),
('KEROSENE', 'Kerosene', 'FUEL', 'KEROSENE', 'LITERS', '1310', '5100', '4100'),
('LPG', 'LPG', 'FUEL', 'LPG', 'KILOGRAMS', '1310', '5100', '4100')
ON CONFLICT (product_code) DO NOTHING;

-- Create initial accounting period
INSERT INTO accounting_periods (period_name, start_date, end_date, fiscal_year, period_number) VALUES
('January 2025', '2025-01-01', '2025-01-31', 2025, 1),
('February 2025', '2025-02-01', '2025-02-28', 2025, 2),
('March 2025', '2025-03-01', '2025-03-31', 2025, 3)
ON CONFLICT (fiscal_year, period_number) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Complete OMC ERP schema created successfully with General Ledger, Inventory, Transactions, and IoT monitoring!';
END $$;