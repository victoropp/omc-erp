-- =====================================================
-- ADVANCED FINANCIAL MANAGEMENT SYSTEM
-- Version: 1.0.0
-- Description: Fixed Assets, Project Accounting, IFRS Compliance, Advanced Financial Management
-- =====================================================

-- =====================================================
-- FIXED ASSETS MANAGEMENT
-- =====================================================

-- Asset Categories
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id UUID REFERENCES asset_categories(id),
    description TEXT,
    
    -- Depreciation Configuration
    default_depreciation_method VARCHAR(50), -- 'STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION'
    default_useful_life_years INTEGER,
    default_salvage_rate DECIMAL(5, 2) DEFAULT 5.0, -- Percentage
    
    -- Account Integration
    asset_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    accumulated_depreciation_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    depreciation_expense_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    disposal_gain_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    disposal_loss_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Insurance and Maintenance
    requires_insurance BOOLEAN DEFAULT FALSE,
    requires_maintenance_schedule BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fixed Assets Register
CREATE TABLE IF NOT EXISTS fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_number VARCHAR(50) UNIQUE NOT NULL,
    asset_category_id UUID NOT NULL REFERENCES asset_categories(id),
    
    -- Asset Identification
    asset_name VARCHAR(200) NOT NULL,
    asset_description TEXT,
    asset_tag VARCHAR(100), -- Physical tag number
    serial_number VARCHAR(200),
    model_number VARCHAR(200),
    manufacturer VARCHAR(200),
    
    -- Location and Custody
    station_id UUID REFERENCES stations(id),
    department_id UUID REFERENCES departments(id),
    custodian_employee_id UUID REFERENCES employees(id),
    physical_location VARCHAR(200),
    
    -- Financial Information
    acquisition_cost DECIMAL(20, 2) NOT NULL,
    additional_costs DECIMAL(20, 2) DEFAULT 0, -- Installation, delivery, etc.
    total_cost DECIMAL(20, 2) GENERATED ALWAYS AS (acquisition_cost + additional_costs) STORED,
    salvage_value DECIMAL(20, 2),
    depreciable_amount DECIMAL(20, 2),
    
    -- Acquisition Details
    acquisition_date DATE NOT NULL,
    acquisition_method VARCHAR(50), -- 'PURCHASE', 'LEASE', 'DONATION', 'CONSTRUCTION'
    supplier_id UUID REFERENCES suppliers(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    invoice_number VARCHAR(100),
    
    -- Depreciation Configuration
    depreciation_method VARCHAR(50) NOT NULL,
    useful_life_years INTEGER NOT NULL,
    useful_life_months INTEGER,
    units_of_production_total INTEGER, -- For units of production method
    
    -- Depreciation Status
    depreciation_start_date DATE,
    accumulated_depreciation DECIMAL(20, 2) DEFAULT 0,
    net_book_value DECIMAL(20, 2),
    last_depreciation_date DATE,
    
    -- Asset Status
    asset_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISPOSED', 'FULLY_DEPRECIATED'
    condition_rating VARCHAR(20), -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
    
    -- Disposal Information
    disposal_date DATE,
    disposal_method VARCHAR(50), -- 'SALE', 'SCRAP', 'DONATION', 'TRADE_IN'
    disposal_proceeds DECIMAL(20, 2),
    disposal_gain_loss DECIMAL(20, 2),
    
    -- Insurance Information
    insured BOOLEAN DEFAULT FALSE,
    insurance_policy_number VARCHAR(100),
    insurance_value DECIMAL(20, 2),
    insurance_expiry_date DATE,
    
    -- Maintenance Information
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    maintenance_cost_ytd DECIMAL(15, 2) DEFAULT 0,
    
    -- IFRS/GAAP Compliance
    impairment_tested BOOLEAN DEFAULT FALSE,
    impairment_loss DECIMAL(20, 2) DEFAULT 0,
    revaluation_surplus DECIMAL(20, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_asset_number (asset_number),
    INDEX idx_asset_category (asset_category_id),
    INDEX idx_asset_station (station_id),
    INDEX idx_asset_status (asset_status),
    INDEX idx_asset_acquisition_date (acquisition_date),
    INDEX idx_asset_custodian (custodian_employee_id)
);

-- Asset Depreciation Schedule
CREATE TABLE IF NOT EXISTS asset_depreciation_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixed_asset_id UUID NOT NULL REFERENCES fixed_assets(id),
    
    -- Schedule Period
    depreciation_year INTEGER NOT NULL,
    depreciation_month INTEGER NOT NULL,
    depreciation_period DATE NOT NULL,
    
    -- Depreciation Calculation
    opening_book_value DECIMAL(20, 2) NOT NULL,
    depreciation_amount DECIMAL(20, 2) NOT NULL,
    accumulated_depreciation DECIMAL(20, 2) NOT NULL,
    closing_book_value DECIMAL(20, 2) NOT NULL,
    
    -- Units of Production (if applicable)
    period_units_produced INTEGER,
    total_units_to_date INTEGER,
    
    -- Status
    depreciation_posted BOOLEAN DEFAULT FALSE,
    journal_entry_id UUID REFERENCES journal_entries(id),
    posted_date DATE,
    posted_by UUID REFERENCES users(id),
    
    -- Reversal Information
    reversed BOOLEAN DEFAULT FALSE,
    reversal_reason TEXT,
    reversal_journal_entry_id UUID REFERENCES journal_entries(id),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fixed_asset_id, depreciation_year, depreciation_month),
    INDEX idx_depreciation_asset (fixed_asset_id),
    INDEX idx_depreciation_period (depreciation_period),
    INDEX idx_depreciation_posted (depreciation_posted)
);

-- Asset Maintenance Records
CREATE TABLE IF NOT EXISTS asset_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixed_asset_id UUID NOT NULL REFERENCES fixed_assets(id),
    
    -- Maintenance Details
    maintenance_number VARCHAR(50) UNIQUE NOT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50), -- 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'UPGRADE'
    description TEXT NOT NULL,
    
    -- Service Provider
    service_provider_type VARCHAR(20), -- 'INTERNAL', 'EXTERNAL'
    service_provider_name VARCHAR(200),
    technician_name VARCHAR(200),
    
    -- Cost Information
    labor_cost DECIMAL(15, 2) DEFAULT 0,
    parts_cost DECIMAL(15, 2) DEFAULT 0,
    other_costs DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) NOT NULL,
    
    -- Work Details
    work_performed TEXT,
    parts_replaced JSONB,
    duration_hours DECIMAL(6, 2),
    
    -- Asset Condition
    condition_before VARCHAR(20),
    condition_after VARCHAR(20),
    performance_improvement TEXT,
    
    -- Next Maintenance
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER,
    
    -- Documentation
    work_order_number VARCHAR(50),
    invoice_reference VARCHAR(100),
    warranty_period_days INTEGER,
    photos JSONB,
    
    -- Status
    maintenance_status VARCHAR(20) DEFAULT 'COMPLETED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_maintenance_asset (fixed_asset_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_maintenance_status (maintenance_status)
);

-- Asset Transfers
CREATE TABLE IF NOT EXISTS asset_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    fixed_asset_id UUID NOT NULL REFERENCES fixed_assets(id),
    
    -- Transfer Details
    transfer_date DATE NOT NULL,
    transfer_reason TEXT,
    
    -- From Location
    from_station_id UUID REFERENCES stations(id),
    from_department_id UUID REFERENCES departments(id),
    from_custodian_id UUID REFERENCES employees(id),
    from_location VARCHAR(200),
    
    -- To Location
    to_station_id UUID REFERENCES stations(id),
    to_department_id UUID REFERENCES departments(id),
    to_custodian_id UUID REFERENCES employees(id),
    to_location VARCHAR(200),
    
    -- Transfer Process
    transfer_initiated_by UUID REFERENCES users(id),
    transfer_approved_by UUID REFERENCES users(id),
    asset_received_by UUID REFERENCES users(id),
    
    -- Condition Assessment
    condition_at_transfer VARCHAR(20),
    transfer_notes TEXT,
    
    -- Status
    transfer_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'
    completed_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_transfer_asset (fixed_asset_id),
    INDEX idx_transfer_number (transfer_number),
    INDEX idx_transfer_date (transfer_date),
    INDEX idx_transfer_status (transfer_status)
);

-- =====================================================
-- PROJECT ACCOUNTING
-- =====================================================

-- Project Types
CREATE TABLE IF NOT EXISTS project_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Project Configuration
    requires_budget BOOLEAN DEFAULT TRUE,
    requires_work_breakdown BOOLEAN DEFAULT FALSE,
    default_duration_months INTEGER,
    
    -- Financial Configuration
    revenue_recognition_method VARCHAR(50), -- 'COMPLETED_CONTRACT', 'PERCENTAGE_COMPLETION', 'MILESTONE'
    cost_allocation_method VARCHAR(50), -- 'ACTUAL', 'PERCENTAGE', 'ACTIVITY_BASED'
    
    -- Approval Requirements
    approval_hierarchy JSONB,
    budget_approval_required BOOLEAN DEFAULT TRUE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_type_id UUID REFERENCES project_types(id),
    
    -- Project Details
    project_description TEXT,
    project_objectives TEXT,
    business_justification TEXT,
    
    -- Project Hierarchy
    parent_project_id UUID REFERENCES projects(id),
    project_level INTEGER DEFAULT 1,
    
    -- Customer/Sponsor Information
    customer_id UUID REFERENCES customers(id),
    internal_sponsor_id UUID REFERENCES employees(id),
    project_manager_id UUID REFERENCES employees(id),
    
    -- Timeline
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Financial Information
    total_budget DECIMAL(20, 2),
    approved_budget DECIMAL(20, 2),
    budget_currency VARCHAR(3) DEFAULT 'GHS',
    
    -- Cost Tracking
    total_actual_cost DECIMAL(20, 2) DEFAULT 0,
    total_committed_cost DECIMAL(20, 2) DEFAULT 0,
    budget_variance DECIMAL(20, 2) DEFAULT 0,
    budget_variance_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Revenue Information
    contract_value DECIMAL(20, 2),
    recognized_revenue DECIMAL(20, 2) DEFAULT 0,
    billed_amount DECIMAL(20, 2) DEFAULT 0,
    collected_amount DECIMAL(20, 2) DEFAULT 0,
    
    -- Progress Tracking
    completion_percentage DECIMAL(5, 2) DEFAULT 0,
    milestones_completed INTEGER DEFAULT 0,
    total_milestones INTEGER,
    
    -- Status
    project_status VARCHAR(20) DEFAULT 'PLANNING', -- 'PLANNING', 'APPROVED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'
    status_reason TEXT,
    
    -- Risk and Quality
    risk_rating VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH'
    quality_rating VARCHAR(20),
    
    -- Location
    primary_location VARCHAR(200),
    station_ids JSONB, -- Array of station IDs involved
    
    -- Approval Information
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_code (project_code),
    INDEX idx_project_type (project_type_id),
    INDEX idx_project_manager (project_manager_id),
    INDEX idx_project_status (project_status),
    INDEX idx_project_dates (planned_start_date, planned_end_date),
    INDEX idx_project_customer (customer_id)
);

-- Work Breakdown Structure (WBS)
CREATE TABLE IF NOT EXISTS project_wbs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    wbs_code VARCHAR(50) NOT NULL,
    
    -- WBS Hierarchy
    parent_wbs_id UUID REFERENCES project_wbs(id),
    wbs_level INTEGER NOT NULL,
    wbs_name VARCHAR(200) NOT NULL,
    wbs_description TEXT,
    
    -- Work Package Details
    is_work_package BOOLEAN DEFAULT FALSE,
    estimated_hours DECIMAL(10, 2),
    estimated_cost DECIMAL(20, 2),
    
    -- Assignment
    responsible_employee_id UUID REFERENCES employees(id),
    department_id UUID REFERENCES departments(id),
    
    -- Timeline
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Progress
    completion_percentage DECIMAL(5, 2) DEFAULT 0,
    actual_hours DECIMAL(10, 2) DEFAULT 0,
    actual_cost DECIMAL(20, 2) DEFAULT 0,
    
    -- Status
    wbs_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(project_id, wbs_code),
    INDEX idx_wbs_project (project_id),
    INDEX idx_wbs_parent (parent_wbs_id),
    INDEX idx_wbs_responsible (responsible_employee_id),
    INDEX idx_wbs_level (wbs_level)
);

-- Project Budgets
CREATE TABLE IF NOT EXISTS project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    wbs_id UUID REFERENCES project_wbs(id),
    
    -- Budget Details
    budget_category VARCHAR(100) NOT NULL, -- 'LABOR', 'MATERIALS', 'EQUIPMENT', 'OVERHEAD', 'OTHER'
    budget_description TEXT,
    account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Budget Amounts
    original_budget DECIMAL(20, 2) NOT NULL,
    revised_budget DECIMAL(20, 2),
    current_budget DECIMAL(20, 2),
    
    -- Actual vs Budget
    actual_cost DECIMAL(20, 2) DEFAULT 0,
    committed_cost DECIMAL(20, 2) DEFAULT 0,
    available_budget DECIMAL(20, 2) GENERATED ALWAYS AS (current_budget - actual_cost - committed_cost) STORED,
    
    -- Variance Analysis
    budget_variance DECIMAL(20, 2) DEFAULT 0,
    variance_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Timeline
    budget_period_start DATE,
    budget_period_end DATE,
    
    -- Approval
    budget_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_budget_project (project_id),
    INDEX idx_project_budget_wbs (wbs_id),
    INDEX idx_project_budget_category (budget_category),
    INDEX idx_project_budget_account (account_code)
);

-- Project Transactions (Cost and Revenue Tracking)
CREATE TABLE IF NOT EXISTS project_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    wbs_id UUID REFERENCES project_wbs(id),
    
    -- Transaction Details
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'COST', 'REVENUE', 'COMMITMENT', 'ADJUSTMENT'
    transaction_category VARCHAR(100),
    description TEXT,
    
    -- Financial Information
    transaction_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    base_amount DECIMAL(20, 2),
    
    -- Cost Allocation
    allocation_method VARCHAR(50), -- 'DIRECT', 'ALLOCATED', 'OVERHEAD'
    allocation_basis VARCHAR(100),
    allocation_percentage DECIMAL(5, 2),
    
    -- Source Information
    source_document_type VARCHAR(50), -- 'INVOICE', 'TIMESHEET', 'EXPENSE_REPORT', 'PURCHASE_ORDER'
    source_document_id UUID,
    source_document_number VARCHAR(100),
    
    -- GL Integration
    account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- Labor Information (if applicable)
    employee_id UUID REFERENCES employees(id),
    hours_worked DECIMAL(8, 2),
    hourly_rate DECIMAL(10, 4),
    
    -- Vendor Information (if applicable)
    supplier_id UUID REFERENCES suppliers(id),
    
    -- Approval and Processing
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_trans_number (transaction_number),
    INDEX idx_project_trans_project (project_id),
    INDEX idx_project_trans_wbs (wbs_id),
    INDEX idx_project_trans_date (transaction_date),
    INDEX idx_project_trans_type (transaction_type),
    INDEX idx_project_trans_employee (employee_id)
);

-- Project Revenue Recognition
CREATE TABLE IF NOT EXISTS project_revenue_recognition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Recognition Period
    recognition_period DATE NOT NULL,
    recognition_method VARCHAR(50) NOT NULL, -- 'PERCENTAGE_COMPLETION', 'COMPLETED_CONTRACT', 'MILESTONE'
    
    -- Progress Measurement
    total_contract_value DECIMAL(20, 2),
    total_estimated_cost DECIMAL(20, 2),
    completion_percentage DECIMAL(5, 2),
    milestone_achieved VARCHAR(200),
    
    -- Cost Information
    cumulative_cost_to_date DECIMAL(20, 2),
    current_period_cost DECIMAL(20, 2),
    estimated_cost_to_complete DECIMAL(20, 2),
    
    -- Revenue Calculation
    cumulative_revenue_earned DECIMAL(20, 2),
    previous_revenue_recognized DECIMAL(20, 2),
    current_period_revenue DECIMAL(20, 2),
    
    -- Billing and Collection
    cumulative_billings DECIMAL(20, 2),
    current_period_billing DECIMAL(20, 2),
    unbilled_revenue DECIMAL(20, 2),
    
    -- Profitability Analysis
    estimated_gross_profit DECIMAL(20, 2),
    gross_profit_percentage DECIMAL(5, 2),
    
    -- Journal Entry
    journal_entry_id UUID REFERENCES journal_entries(id),
    recognized_by UUID REFERENCES users(id),
    recognition_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(project_id, recognition_period),
    INDEX idx_revenue_recognition_project (project_id),
    INDEX idx_revenue_recognition_period (recognition_period)
);

-- =====================================================
-- IFRS COMPLIANCE
-- =====================================================

-- IFRS Standards Mapping
CREATE TABLE IF NOT EXISTS ifrs_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_code VARCHAR(20) UNIQUE NOT NULL,
    standard_name VARCHAR(200) NOT NULL,
    effective_date DATE,
    
    -- Standard Details
    description TEXT,
    key_requirements JSONB,
    disclosure_requirements JSONB,
    
    -- Implementation
    implementation_guidance TEXT,
    transitional_provisions TEXT,
    
    -- System Integration
    affected_modules JSONB, -- ['FIXED_ASSETS', 'REVENUE', 'LEASES', 'FINANCIAL_INSTRUMENTS']
    automated_compliance BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- IFRS Adjustments
CREATE TABLE IF NOT EXISTS ifrs_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    ifrs_standard_id UUID REFERENCES ifrs_standards(id),
    
    -- Adjustment Details
    adjustment_date DATE NOT NULL,
    adjustment_period VARCHAR(20), -- 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    adjustment_type VARCHAR(50), -- 'INITIAL_RECOGNITION', 'REMEASUREMENT', 'RECLASSIFICATION', 'IMPAIRMENT'
    
    -- Description
    adjustment_description TEXT NOT NULL,
    business_rationale TEXT,
    ifrs_reference TEXT,
    
    -- Financial Impact
    adjustment_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    
    -- GL Accounts Affected
    debit_account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    credit_account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    
    -- Supporting Information
    calculation_methodology TEXT,
    assumptions_used JSONB,
    supporting_documents JSONB,
    
    -- Approval and Processing
    prepared_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    
    -- Journal Entry
    journal_entry_id UUID REFERENCES journal_entries(id),
    posted_date DATE,
    
    -- Reversal Information
    reversed BOOLEAN DEFAULT FALSE,
    reversal_date DATE,
    reversal_reason TEXT,
    reversal_journal_entry_id UUID REFERENCES journal_entries(id),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ifrs_adjustment_number (adjustment_number),
    INDEX idx_ifrs_adjustment_standard (ifrs_standard_id),
    INDEX idx_ifrs_adjustment_date (adjustment_date),
    INDEX idx_ifrs_adjustment_type (adjustment_type)
);

-- IFRS Asset Impairment Testing
CREATE TABLE IF NOT EXISTS ifrs_asset_impairment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    impairment_test_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Asset Information
    fixed_asset_id UUID REFERENCES fixed_assets(id),
    cash_generating_unit VARCHAR(200), -- For CGU-level testing
    
    -- Testing Details
    test_date DATE NOT NULL,
    test_trigger VARCHAR(50), -- 'ANNUAL_TEST', 'IMPAIRMENT_INDICATOR', 'REGULATORY_REQUIREMENT'
    test_level VARCHAR(20), -- 'INDIVIDUAL_ASSET', 'CGU', 'GROUP_OF_ASSETS'
    
    -- Carrying Amount
    carrying_amount DECIMAL(20, 2) NOT NULL,
    
    -- Value in Use Calculation
    discount_rate DECIMAL(8, 4), -- WACC or appropriate discount rate
    cash_flow_projections JSONB, -- Future cash flows
    terminal_value DECIMAL(20, 2),
    value_in_use DECIMAL(20, 2),
    
    -- Fair Value Less Costs to Sell
    fair_value DECIMAL(20, 2),
    costs_to_sell DECIMAL(15, 2),
    fair_value_less_costs_to_sell DECIMAL(20, 2),
    
    -- Recoverable Amount
    recoverable_amount DECIMAL(20, 2), -- Higher of value in use and fair value less costs to sell
    
    -- Impairment Loss
    impairment_loss DECIMAL(20, 2) DEFAULT 0,
    impairment_required BOOLEAN DEFAULT FALSE,
    
    -- Allocation (for CGU testing)
    impairment_allocation JSONB, -- How impairment is allocated among assets
    
    -- Documentation
    assumptions_used JSONB,
    sensitivity_analysis JSONB,
    external_valuations JSONB,
    
    -- Approval and Processing
    performed_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    
    -- Journal Entry (if impairment recognized)
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_impairment_test_number (impairment_test_number),
    INDEX idx_impairment_asset (fixed_asset_id),
    INDEX idx_impairment_date (test_date),
    INDEX idx_impairment_required (impairment_required)
);

-- IFRS Lease Accounting (IFRS 16)
CREATE TABLE IF NOT EXISTS ifrs_leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Lease Details
    lease_description VARCHAR(200) NOT NULL,
    lessor_name VARCHAR(200) NOT NULL,
    lease_type VARCHAR(20), -- 'OPERATING', 'FINANCE' (under old standard), 'RIGHT_OF_USE' (IFRS 16)
    
    -- Lease Term
    commencement_date DATE NOT NULL,
    lease_term_months INTEGER NOT NULL,
    end_date DATE,
    renewal_options JSONB,
    termination_options JSONB,
    
    -- Financial Terms
    monthly_lease_payment DECIMAL(15, 2) NOT NULL,
    total_lease_payments DECIMAL(20, 2),
    variable_payments JSONB,
    prepaid_amounts DECIMAL(15, 2) DEFAULT 0,
    
    -- IFRS 16 Calculations
    incremental_borrowing_rate DECIMAL(8, 4), -- IBR used for discounting
    present_value_of_payments DECIMAL(20, 2),
    initial_direct_costs DECIMAL(15, 2) DEFAULT 0,
    
    -- Right-of-Use Asset
    rou_asset_initial_value DECIMAL(20, 2),
    rou_asset_current_value DECIMAL(20, 2),
    rou_asset_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Lease Liability
    lease_liability_initial DECIMAL(20, 2),
    lease_liability_current DECIMAL(20, 2),
    lease_liability_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Depreciation and Interest
    rou_depreciation_method VARCHAR(50) DEFAULT 'STRAIGHT_LINE',
    monthly_depreciation DECIMAL(15, 2),
    accumulated_depreciation DECIMAL(20, 2) DEFAULT 0,
    
    -- Asset Information
    underlying_asset_type VARCHAR(100), -- 'PROPERTY', 'VEHICLE', 'EQUIPMENT'
    asset_description TEXT,
    location VARCHAR(200),
    
    -- Status
    lease_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'TERMINATED', 'EXPIRED'
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_lease_number (lease_number),
    INDEX idx_lease_commencement (commencement_date),
    INDEX idx_lease_end_date (end_date),
    INDEX idx_lease_status (lease_status)
);

-- IFRS Lease Payment Schedule
CREATE TABLE IF NOT EXISTS ifrs_lease_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ifrs_lease_id UUID NOT NULL REFERENCES ifrs_leases(id),
    
    -- Payment Period
    payment_date DATE NOT NULL,
    period_number INTEGER NOT NULL,
    
    -- Payment Breakdown
    lease_payment DECIMAL(15, 2) NOT NULL,
    interest_expense DECIMAL(15, 2) NOT NULL,
    principal_reduction DECIMAL(15, 2) NOT NULL,
    
    -- Balance Information
    opening_liability_balance DECIMAL(20, 2) NOT NULL,
    closing_liability_balance DECIMAL(20, 2) NOT NULL,
    
    -- ROU Asset Depreciation
    depreciation_expense DECIMAL(15, 2) NOT NULL,
    accumulated_depreciation DECIMAL(20, 2) NOT NULL,
    rou_asset_net_value DECIMAL(20, 2) NOT NULL,
    
    -- Journal Entry References
    payment_journal_entry_id UUID REFERENCES journal_entries(id),
    depreciation_journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- Status
    payment_made BOOLEAN DEFAULT FALSE,
    payment_date_actual DATE,
    depreciation_posted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ifrs_lease_id, period_number),
    INDEX idx_lease_schedule_lease (ifrs_lease_id),
    INDEX idx_lease_schedule_date (payment_date)
);

-- =====================================================
-- COST MANAGEMENT AND ALLOCATION
-- =====================================================

-- Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_center_code VARCHAR(50) UNIQUE NOT NULL,
    cost_center_name VARCHAR(200) NOT NULL,
    parent_cost_center_id UUID REFERENCES cost_centers(id),
    
    -- Cost Center Details
    cost_center_type VARCHAR(50), -- 'PROFIT_CENTER', 'COST_CENTER', 'INVESTMENT_CENTER'
    responsible_manager_id UUID REFERENCES employees(id),
    department_id UUID REFERENCES departments(id),
    station_id UUID REFERENCES stations(id),
    
    -- Budget Information
    annual_budget DECIMAL(20, 2),
    current_budget DECIMAL(20, 2),
    budget_currency VARCHAR(3) DEFAULT 'GHS',
    
    -- Cost Allocation
    allocation_basis VARCHAR(50), -- 'HEADCOUNT', 'SQUARE_FOOTAGE', 'REVENUE', 'DIRECT_COSTS'
    allocation_percentage DECIMAL(5, 2),
    receives_allocations BOOLEAN DEFAULT TRUE,
    allocates_costs BOOLEAN DEFAULT FALSE,
    
    -- Performance Metrics
    target_cost_per_unit DECIMAL(15, 4),
    actual_cost_per_unit DECIMAL(15, 4),
    efficiency_percentage DECIMAL(5, 2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cost_center_code (cost_center_code),
    INDEX idx_cost_center_manager (responsible_manager_id),
    INDEX idx_cost_center_department (department_id),
    INDEX idx_cost_center_station (station_id)
);

-- Cost Allocation Rules
CREATE TABLE IF NOT EXISTS cost_allocation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    
    -- Source Cost Center (allocating from)
    source_cost_center_id UUID NOT NULL REFERENCES cost_centers(id),
    source_account_codes JSONB, -- Array of account codes to allocate
    
    -- Allocation Method
    allocation_method VARCHAR(50) NOT NULL, -- 'PERCENTAGE', 'DRIVER_BASED', 'FORMULA'
    allocation_driver VARCHAR(100), -- 'HEADCOUNT', 'REVENUE', 'SQUARE_FOOTAGE', 'TRANSACTIONS'
    
    -- Allocation Frequency
    allocation_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    
    -- Target Cost Centers
    target_allocations JSONB NOT NULL, -- [{'cost_center_id': 'uuid', 'percentage': 25.0}]
    
    -- Calculation Details
    allocation_formula TEXT,
    driver_source VARCHAR(100), -- Where to get driver data from
    
    -- Effective Period
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Automation
    auto_process BOOLEAN DEFAULT FALSE,
    process_day_of_month INTEGER DEFAULT 1,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_allocation_rule_source (source_cost_center_id),
    INDEX idx_allocation_rule_method (allocation_method),
    INDEX idx_allocation_rule_frequency (allocation_frequency)
);

-- Cost Allocations (Actual allocations processed)
CREATE TABLE IF NOT EXISTS cost_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_number VARCHAR(50) UNIQUE NOT NULL,
    cost_allocation_rule_id UUID NOT NULL REFERENCES cost_allocation_rules(id),
    
    -- Allocation Period
    allocation_date DATE NOT NULL,
    allocation_period VARCHAR(20), -- '2025-01', 'Q1-2025', '2025'
    
    -- Source Information
    source_cost_center_id UUID NOT NULL REFERENCES cost_centers(id),
    total_amount_to_allocate DECIMAL(20, 2) NOT NULL,
    allocation_driver_total DECIMAL(20, 2), -- Total driver amount (e.g., total headcount)
    
    -- Processing Status
    allocation_status VARCHAR(20) DEFAULT 'CALCULATED', -- 'CALCULATED', 'POSTED', 'REVERSED'
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    calculated_by UUID REFERENCES users(id),
    
    -- Journal Entry
    journal_entry_id UUID REFERENCES journal_entries(id),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES users(id),
    
    -- Reversal
    reversed BOOLEAN DEFAULT FALSE,
    reversal_reason TEXT,
    reversal_journal_entry_id UUID REFERENCES journal_entries(id),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_allocation_number (allocation_number),
    INDEX idx_allocation_rule (cost_allocation_rule_id),
    INDEX idx_allocation_source (source_cost_center_id),
    INDEX idx_allocation_date (allocation_date),
    INDEX idx_allocation_status (allocation_status)
);

-- Cost Allocation Details
CREATE TABLE IF NOT EXISTS cost_allocation_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_allocation_id UUID NOT NULL REFERENCES cost_allocations(id),
    
    -- Target Information
    target_cost_center_id UUID NOT NULL REFERENCES cost_centers(id),
    target_account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    
    -- Allocation Calculation
    driver_value DECIMAL(20, 2), -- e.g., headcount for this cost center
    allocation_percentage DECIMAL(8, 4), -- Percentage of total allocation
    allocated_amount DECIMAL(20, 2) NOT NULL,
    
    -- Additional Information
    allocation_basis_description TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_allocation_detail_allocation (cost_allocation_id),
    INDEX idx_allocation_detail_target (target_cost_center_id)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default asset categories
INSERT INTO asset_categories (category_code, category_name, description, default_useful_life_years, asset_account_code, accumulated_depreciation_account_code, depreciation_expense_account_code) VALUES
('BUILDINGS', 'Buildings and Structures', 'Buildings, fuel stations, and structures', 25, '1510', '1511', '6610'),
('EQUIPMENT', 'Equipment and Machinery', 'Fuel dispensers, pumps, and equipment', 10, '1520', '1521', '6620'),
('VEHICLES', 'Vehicles and Fleet', 'Company vehicles and fleet assets', 5, '1530', '1531', '6630'),
('IT_EQUIPMENT', 'IT Equipment', 'Computers, servers, and IT infrastructure', 3, '1540', '1541', '6640'),
('FURNITURE', 'Furniture and Fixtures', 'Office furniture and fixtures', 7, '1550', '1551', '6650'),
('SAFETY_EQUIPMENT', 'Safety Equipment', 'Fire safety and emergency equipment', 10, '1560', '1561', '6660')
ON CONFLICT (category_code) DO NOTHING;

-- Insert default project types
INSERT INTO project_types (type_code, type_name, description, default_duration_months) VALUES
('CONSTRUCTION', 'Construction Project', 'New station construction and major renovations', 12),
('UPGRADE', 'System Upgrade', 'Equipment and system upgrade projects', 6),
('MAINTENANCE', 'Maintenance Project', 'Major maintenance and refurbishment projects', 3),
('COMPLIANCE', 'Compliance Project', 'Regulatory compliance implementation projects', 6),
('IT_PROJECT', 'IT Project', 'Information technology and systems projects', 8),
('EXPANSION', 'Business Expansion', 'Market expansion and growth projects', 18)
ON CONFLICT (type_code) DO NOTHING;

-- Insert default IFRS standards
INSERT INTO ifrs_standards (standard_code, standard_name, description, effective_date, affected_modules) VALUES
('IFRS_16', 'IFRS 16 - Leases', 'Lease accounting standard requiring recognition of lease assets and liabilities', '2019-01-01', '["FIXED_ASSETS", "LIABILITIES"]'),
('IFRS_15', 'IFRS 15 - Revenue from Contracts', 'Revenue recognition from contracts with customers', '2018-01-01', '["REVENUE", "PROJECTS"]'),
('IAS_16', 'IAS 16 - Property, Plant and Equipment', 'Accounting for property, plant and equipment', '2005-01-01', '["FIXED_ASSETS"]'),
('IAS_36', 'IAS 36 - Impairment of Assets', 'Impairment testing and recognition requirements', '2004-03-31', '["FIXED_ASSETS"]'),
('IFRS_9', 'IFRS 9 - Financial Instruments', 'Financial instruments recognition and measurement', '2018-01-01', '["FINANCIAL_INSTRUMENTS"]')
ON CONFLICT (standard_code) DO NOTHING;

-- Insert default cost centers
INSERT INTO cost_centers (cost_center_code, cost_center_name, cost_center_type) VALUES
('CC-ADMIN', 'Administration', 'COST_CENTER'),
('CC-SALES', 'Sales and Marketing', 'PROFIT_CENTER'),
('CC-OPS', 'Operations', 'COST_CENTER'),
('CC-MAINT', 'Maintenance', 'COST_CENTER'),
('CC-IT', 'Information Technology', 'COST_CENTER'),
('CC-HR', 'Human Resources', 'COST_CENTER')
ON CONFLICT (cost_center_code) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Advanced Financial Management System schema created successfully with Fixed Assets, Project Accounting, and IFRS compliance!';
END $$;