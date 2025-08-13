-- =====================================================
-- SUPPLY CHAIN AND PROCUREMENT MANAGEMENT SYSTEM
-- Version: 1.0.0
-- Description: Complete supply chain, procurement, and vendor management system
-- =====================================================

-- =====================================================
-- VENDOR/SUPPLIER MANAGEMENT
-- =====================================================

-- Vendor Categories
CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Risk Assessment
    risk_level VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    approval_required BOOLEAN DEFAULT TRUE,
    
    -- Payment Terms
    default_payment_terms_days INTEGER DEFAULT 30,
    credit_limit_default DECIMAL(20, 2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers/Vendors (Enhanced from existing)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_type VARCHAR(20) NOT NULL, -- 'LOCAL', 'INTERNATIONAL', 'GOVERNMENT'
    vendor_category_id UUID REFERENCES vendor_categories(id),
    
    -- Company Information
    company_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),
    business_registration_number VARCHAR(100),
    tax_identification_number VARCHAR(50),
    vat_registration_number VARCHAR(50),
    
    -- Contact Information
    primary_contact_name VARCHAR(200),
    primary_contact_title VARCHAR(100),
    primary_contact_email VARCHAR(200),
    primary_contact_phone VARCHAR(20),
    secondary_contact_name VARCHAR(200),
    secondary_contact_phone VARCHAR(20),
    
    -- Address Information
    registered_address TEXT,
    billing_address TEXT,
    delivery_address TEXT,
    country VARCHAR(100) DEFAULT 'Ghana',
    region VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    gps_coordinates JSONB,
    
    -- Business Details
    years_in_business INTEGER,
    annual_turnover DECIMAL(20, 2),
    employee_count INTEGER,
    business_sector VARCHAR(100),
    products_services JSONB, -- Array of products/services offered
    
    -- Financial Information
    credit_limit DECIMAL(20, 2) DEFAULT 0,
    payment_terms_days INTEGER DEFAULT 30,
    preferred_payment_method VARCHAR(50),
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_branch VARCHAR(100),
    
    -- Compliance and Certifications
    iso_certifications JSONB,
    regulatory_licenses JSONB,
    insurance_details JSONB,
    tax_compliance_status VARCHAR(20) DEFAULT 'COMPLIANT',
    
    -- Performance Metrics
    performance_rating DECIMAL(3, 2) DEFAULT 0.00, -- Out of 5.0
    on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage
    quality_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_order_value DECIMAL(20, 2) DEFAULT 0,
    
    -- Status and Approval
    supplier_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'SUSPENDED', 'BLOCKED'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_supplier_name (company_name),
    INDEX idx_supplier_status (supplier_status),
    INDEX idx_supplier_category (vendor_category_id)
);

-- Supplier Contacts (Additional contacts)
CREATE TABLE IF NOT EXISTS supplier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Contact Details
    contact_name VARCHAR(200) NOT NULL,
    contact_title VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(200),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    
    -- Contact Type
    contact_type VARCHAR(50), -- 'SALES', 'TECHNICAL', 'BILLING', 'GENERAL'
    is_primary_contact BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_contact_type (contact_type),
    INDEX idx_supplier_contact_supplier (supplier_id)
);

-- Supplier Products/Services
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    product_id UUID REFERENCES products(id),
    
    -- Product Information
    supplier_product_code VARCHAR(100),
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(100),
    description TEXT,
    specifications JSONB,
    
    -- Pricing Information
    unit_price DECIMAL(15, 4),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    price_per_unit VARCHAR(20), -- 'LITER', 'KILOGRAM', 'PIECE'
    minimum_order_quantity DECIMAL(15, 2),
    lead_time_days INTEGER,
    
    -- Terms and Conditions
    payment_terms VARCHAR(200),
    warranty_period VARCHAR(100),
    delivery_terms VARCHAR(200),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_preferred BOOLEAN DEFAULT FALSE,
    
    -- Price History (for tracking)
    last_price_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    price_valid_from DATE,
    price_valid_to DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_product_supplier (supplier_id),
    INDEX idx_supplier_product_category (product_category),
    INDEX idx_supplier_product_active (is_active)
);

-- Supplier Performance Evaluations
CREATE TABLE IF NOT EXISTS supplier_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    evaluator_id UUID NOT NULL REFERENCES users(id),
    
    -- Performance Metrics (1-5 scale)
    quality_rating DECIMAL(3, 2) NOT NULL,
    delivery_rating DECIMAL(3, 2) NOT NULL,
    service_rating DECIMAL(3, 2) NOT NULL,
    price_competitiveness DECIMAL(3, 2) NOT NULL,
    communication_rating DECIMAL(3, 2) NOT NULL,
    
    -- Calculated Metrics
    on_time_delivery_rate DECIMAL(5, 2),
    defect_rate DECIMAL(5, 2),
    response_time_hours DECIMAL(8, 2),
    
    -- Overall Assessment
    overall_rating DECIMAL(3, 2) NOT NULL,
    recommendation VARCHAR(20), -- 'EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'POOR'
    
    -- Comments and Feedback
    strengths TEXT,
    weaknesses TEXT,
    improvement_areas TEXT,
    evaluator_comments TEXT,
    
    -- Actions Required
    action_required BOOLEAN DEFAULT FALSE,
    corrective_actions TEXT,
    follow_up_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_evaluation_supplier (supplier_id),
    INDEX idx_evaluation_period (evaluation_period_start, evaluation_period_end),
    INDEX idx_evaluation_rating (overall_rating)
);

-- =====================================================
-- PROCUREMENT MANAGEMENT
-- =====================================================

-- Purchase Request Types
CREATE TABLE IF NOT EXISTS purchase_request_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Approval Configuration
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_levels INTEGER DEFAULT 1,
    auto_create_po BOOLEAN DEFAULT FALSE,
    
    -- Budget Control
    budget_control_required BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Requisitions/Requests
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    request_type_id UUID REFERENCES purchase_request_types(id),
    
    -- Request Details
    requested_by UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    station_id UUID REFERENCES stations(id),
    
    -- Dates
    request_date DATE DEFAULT CURRENT_DATE,
    required_by_date DATE,
    
    -- Purpose and Justification
    purpose TEXT NOT NULL,
    justification TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    
    -- Budget Information
    budget_code VARCHAR(50),
    estimated_total DECIMAL(20, 2),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    budget_approved BOOLEAN DEFAULT FALSE,
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED_TO_PO'
    current_approval_level INTEGER DEFAULT 0,
    
    -- Conversion to Purchase Order
    converted_to_po BOOLEAN DEFAULT FALSE,
    purchase_order_id UUID, -- Will reference purchase_orders
    
    -- Rejection Information
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_purchase_request_number (request_number),
    INDEX idx_purchase_request_requestor (requested_by),
    INDEX idx_purchase_request_status (status),
    INDEX idx_purchase_request_date (request_date)
);

-- Purchase Request Items
CREATE TABLE IF NOT EXISTS purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    
    -- Item Details
    product_id UUID REFERENCES products(id),
    item_description TEXT NOT NULL,
    specifications TEXT,
    
    -- Quantity and Pricing
    quantity_requested DECIMAL(15, 2) NOT NULL,
    unit_of_measure VARCHAR(20),
    estimated_unit_price DECIMAL(15, 4),
    estimated_total_price DECIMAL(20, 2),
    
    -- Delivery Information
    delivery_location VARCHAR(200),
    required_by_date DATE,
    
    -- Suggested Suppliers
    preferred_supplier_id UUID REFERENCES suppliers(id),
    alternative_suppliers JSONB, -- Array of supplier IDs
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(purchase_request_id, line_number),
    INDEX idx_pr_item_request (purchase_request_id),
    INDEX idx_pr_item_product (product_id)
);

-- Purchase Request Approvals
CREATE TABLE IF NOT EXISTS purchase_request_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id),
    approval_level INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    
    -- Approval Details
    approval_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    approved_at TIMESTAMPTZ,
    comments TEXT,
    
    -- Delegation
    delegated_to UUID REFERENCES users(id),
    delegated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(purchase_request_id, approval_level)
);

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Reference Information
    purchase_request_id UUID REFERENCES purchase_requests(id),
    quotation_reference VARCHAR(100),
    
    -- Order Details
    order_date DATE DEFAULT CURRENT_DATE,
    required_delivery_date DATE,
    delivery_location VARCHAR(200),
    delivery_instructions TEXT,
    
    -- Financial Information
    subtotal_amount DECIMAL(20, 2) NOT NULL,
    discount_amount DECIMAL(20, 2) DEFAULT 0,
    tax_amount DECIMAL(20, 2) DEFAULT 0,
    shipping_amount DECIMAL(20, 2) DEFAULT 0,
    total_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    
    -- Payment Terms
    payment_terms_days INTEGER DEFAULT 30,
    payment_method VARCHAR(50),
    down_payment_percentage DECIMAL(5, 2) DEFAULT 0,
    down_payment_amount DECIMAL(20, 2) DEFAULT 0,
    
    -- Terms and Conditions
    delivery_terms VARCHAR(200),
    warranty_terms VARCHAR(200),
    penalty_clauses TEXT,
    special_instructions TEXT,
    
    -- Status and Workflow
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SENT', 'ACKNOWLEDGED', 'CONFIRMED', 'PARTIALLY_DELIVERED', 'FULLY_DELIVERED', 'CLOSED', 'CANCELLED'
    
    -- Important Dates
    sent_to_supplier_at TIMESTAMPTZ,
    acknowledged_by_supplier_at TIMESTAMPTZ,
    confirmed_by_supplier_at TIMESTAMPTZ,
    
    -- Delivery Tracking
    expected_delivery_date DATE,
    partial_deliveries_allowed BOOLEAN DEFAULT TRUE,
    over_delivery_allowed BOOLEAN DEFAULT FALSE,
    over_delivery_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Approval Information
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_po_number (po_number),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_status (status),
    INDEX idx_po_order_date (order_date),
    INDEX idx_po_delivery_date (required_delivery_date)
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    
    -- Item References
    product_id UUID REFERENCES products(id),
    purchase_request_item_id UUID REFERENCES purchase_request_items(id),
    
    -- Item Details
    item_description TEXT NOT NULL,
    supplier_product_code VARCHAR(100),
    specifications TEXT,
    
    -- Quantity and Pricing
    quantity_ordered DECIMAL(15, 2) NOT NULL,
    quantity_received DECIMAL(15, 2) DEFAULT 0,
    quantity_remaining DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_ordered - quantity_received) STORED,
    unit_of_measure VARCHAR(20),
    unit_price DECIMAL(15, 4) NOT NULL,
    total_price DECIMAL(20, 2) NOT NULL,
    
    -- Delivery Status
    delivery_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PARTIALLY_DELIVERED', 'FULLY_DELIVERED', 'OVER_DELIVERED'
    required_delivery_date DATE,
    
    -- Quality Requirements
    quality_standards TEXT,
    inspection_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(purchase_order_id, line_number),
    INDEX idx_po_item_po (purchase_order_id),
    INDEX idx_po_item_product (product_id),
    INDEX idx_po_item_delivery_status (delivery_status)
);

-- =====================================================
-- GOODS RECEIPT AND INSPECTION
-- =====================================================

-- Goods Receipt Notes (GRN)
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Receipt Details
    receipt_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    delivery_note_number VARCHAR(100),
    waybill_number VARCHAR(100),
    invoice_number VARCHAR(100),
    
    -- Delivery Information
    received_by UUID NOT NULL REFERENCES users(id),
    delivery_location VARCHAR(200),
    truck_number VARCHAR(50),
    driver_name VARCHAR(200),
    driver_phone VARCHAR(20),
    
    -- Receipt Status
    receipt_type VARCHAR(20) DEFAULT 'FULL', -- 'FULL', 'PARTIAL', 'OVER_DELIVERY'
    inspection_required BOOLEAN DEFAULT FALSE,
    inspection_completed BOOLEAN DEFAULT FALSE,
    
    -- Quality Check
    quality_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PASSED', 'FAILED', 'CONDITIONAL'
    quality_checked_by UUID REFERENCES users(id),
    quality_check_date DATE,
    quality_notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'RECEIVED', 'INSPECTED', 'ACCEPTED', 'REJECTED'
    
    -- Acceptance/Rejection
    accepted_by UUID REFERENCES users(id),
    accepted_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Notes
    general_notes TEXT,
    special_handling_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_grn_number (grn_number),
    INDEX idx_grn_po (purchase_order_id),
    INDEX idx_grn_supplier (supplier_id),
    INDEX idx_grn_date (receipt_date),
    INDEX idx_grn_status (status)
);

-- Goods Receipt Items
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id UUID NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    po_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
    line_number INTEGER NOT NULL,
    
    -- Item Details
    product_id UUID REFERENCES products(id),
    item_description TEXT,
    
    -- Quantities
    ordered_quantity DECIMAL(15, 2) NOT NULL,
    delivered_quantity DECIMAL(15, 2) NOT NULL,
    accepted_quantity DECIMAL(15, 2),
    rejected_quantity DECIMAL(15, 2) DEFAULT 0,
    variance_quantity DECIMAL(15, 2) GENERATED ALWAYS AS (delivered_quantity - ordered_quantity) STORED,
    
    -- Measurements and Quality
    unit_of_measure VARCHAR(20),
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    manufacturing_date DATE,
    
    -- Physical Inspection
    physical_condition VARCHAR(50), -- 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'
    packaging_condition VARCHAR(50),
    temperature_at_receipt DECIMAL(5, 2),
    
    -- Quality Test Results
    quality_test_results JSONB,
    quality_certificates JSONB,
    
    -- Rejection Details
    rejection_reason TEXT,
    corrective_action_required TEXT,
    
    -- Storage Information
    storage_location VARCHAR(100),
    storage_instructions TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(grn_id, line_number),
    INDEX idx_grn_item_grn (grn_id),
    INDEX idx_grn_item_po_item (po_item_id),
    INDEX idx_grn_item_product (product_id)
);

-- =====================================================
-- SUPPLIER INVOICING AND PAYMENTS
-- =====================================================

-- Purchase Invoices (from suppliers)
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL, -- Supplier's invoice number
    internal_reference VARCHAR(50) UNIQUE, -- Our internal reference
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES goods_receipt_notes(id),
    
    -- Invoice Details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms_days INTEGER,
    
    -- Financial Information
    subtotal_amount DECIMAL(20, 2) NOT NULL,
    discount_amount DECIMAL(20, 2) DEFAULT 0,
    tax_amount DECIMAL(20, 2) DEFAULT 0,
    shipping_amount DECIMAL(20, 2) DEFAULT 0,
    other_charges DECIMAL(20, 2) DEFAULT 0,
    total_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    
    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PARTIALLY_PAID', 'FULLY_PAID', 'OVERDUE'
    paid_amount DECIMAL(20, 2) DEFAULT 0,
    outstanding_amount DECIMAL(20, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- Processing Status
    processing_status VARCHAR(20) DEFAULT 'RECEIVED', -- 'RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'HOLD'
    
    -- Approval Workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Document References
    delivery_note_number VARCHAR(100),
    waybill_number VARCHAR(100),
    receipt_voucher_number VARCHAR(100),
    
    -- Notes
    supplier_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_purchase_invoice_number (invoice_number),
    INDEX idx_purchase_invoice_supplier (supplier_id),
    INDEX idx_purchase_invoice_status (payment_status),
    INDEX idx_purchase_invoice_due_date (due_date),
    INDEX idx_purchase_invoice_po (purchase_order_id)
);

-- Purchase Invoice Items
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    po_item_id UUID REFERENCES purchase_order_items(id),
    line_number INTEGER NOT NULL,
    
    -- Item Details
    product_id UUID REFERENCES products(id),
    item_description TEXT NOT NULL,
    supplier_product_code VARCHAR(100),
    
    -- Quantity and Pricing
    quantity DECIMAL(15, 2) NOT NULL,
    unit_of_measure VARCHAR(20),
    unit_price DECIMAL(15, 4) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    line_total DECIMAL(20, 2) NOT NULL,
    
    -- Matching Information
    po_line_matched BOOLEAN DEFAULT FALSE,
    grn_line_matched BOOLEAN DEFAULT FALSE,
    price_variance DECIMAL(20, 2) DEFAULT 0,
    quantity_variance DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(purchase_invoice_id, line_number),
    INDEX idx_purchase_invoice_item_invoice (purchase_invoice_id),
    INDEX idx_purchase_invoice_item_product (product_id)
);

-- Supplier Payments
CREATE TABLE IF NOT EXISTS supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Payment Details
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL, -- 'BANK_TRANSFER', 'CHECK', 'CASH', 'MOBILE_MONEY'
    payment_reference VARCHAR(100),
    
    -- Financial Information
    payment_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    
    -- Bank Information
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    check_number VARCHAR(50),
    transaction_reference VARCHAR(100),
    
    -- Status
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Processing
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    
    -- Notes
    payment_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_supplier_payment_number (payment_number),
    INDEX idx_supplier_payment_supplier (supplier_id),
    INDEX idx_supplier_payment_date (payment_date),
    INDEX idx_supplier_payment_status (payment_status)
);

-- Payment Allocations (Which invoices this payment covers)
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_payment_id UUID NOT NULL REFERENCES supplier_payments(id),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id),
    
    -- Allocation Details
    allocated_amount DECIMAL(20, 2) NOT NULL,
    discount_taken DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_allocation_payment (supplier_payment_id),
    INDEX idx_payment_allocation_invoice (purchase_invoice_id)
);

-- =====================================================
-- CONTRACTS MANAGEMENT
-- =====================================================

-- Contract Types
CREATE TABLE IF NOT EXISTS contract_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Default Terms
    default_duration_months INTEGER,
    requires_legal_review BOOLEAN DEFAULT FALSE,
    requires_board_approval BOOLEAN DEFAULT FALSE,
    
    -- Template Information
    contract_template TEXT,
    mandatory_clauses JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Contracts
CREATE TABLE IF NOT EXISTS supplier_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    contract_type_id UUID NOT NULL REFERENCES contract_types(id),
    
    -- Contract Details
    contract_title VARCHAR(200) NOT NULL,
    contract_description TEXT,
    
    -- Dates
    contract_date DATE NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    notice_period_days INTEGER DEFAULT 30,
    
    -- Financial Terms
    contract_value DECIMAL(20, 2),
    currency_code VARCHAR(3) DEFAULT 'GHS',
    payment_terms TEXT,
    price_escalation_clause TEXT,
    
    -- Performance Terms
    service_level_agreements JSONB,
    key_performance_indicators JSONB,
    penalty_clauses TEXT,
    bonus_clauses TEXT,
    
    -- Legal Terms
    governing_law VARCHAR(100) DEFAULT 'Ghana',
    dispute_resolution_method VARCHAR(100),
    termination_clauses TEXT,
    intellectual_property_clauses TEXT,
    
    -- Status
    contract_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRED', 'TERMINATED'
    
    -- Approval and Signing
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    signed_by_supplier BOOLEAN DEFAULT FALSE,
    signed_by_company BOOLEAN DEFAULT FALSE,
    fully_executed_date DATE,
    
    -- Document Management
    contract_document_path VARCHAR(500),
    amendments JSONB,
    
    -- Renewal Information
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_notice_days INTEGER DEFAULT 90,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_contract_number (contract_number),
    INDEX idx_contract_supplier (supplier_id),
    INDEX idx_contract_status (contract_status),
    INDEX idx_contract_dates (effective_from, effective_to)
);

-- =====================================================
-- QUOTATIONS AND RFQs
-- =====================================================

-- Request for Quotations (RFQ)
CREATE TABLE IF NOT EXISTS request_for_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_request_id UUID REFERENCES purchase_requests(id),
    
    -- RFQ Details
    rfq_title VARCHAR(200) NOT NULL,
    rfq_description TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    submission_deadline TIMESTAMPTZ NOT NULL,
    
    -- Requirements
    technical_specifications TEXT,
    commercial_terms TEXT,
    delivery_requirements TEXT,
    quality_requirements TEXT,
    
    -- Evaluation Criteria
    evaluation_criteria JSONB,
    price_weight_percentage DECIMAL(5, 2) DEFAULT 40,
    technical_weight_percentage DECIMAL(5, 2) DEFAULT 30,
    delivery_weight_percentage DECIMAL(5, 2) DEFAULT 20,
    service_weight_percentage DECIMAL(5, 2) DEFAULT 10,
    
    -- Status
    rfq_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'ISSUED', 'RECEIVING_QUOTES', 'EVALUATION', 'COMPLETED', 'CANCELLED'
    
    -- Results
    total_suppliers_invited INTEGER DEFAULT 0,
    total_quotes_received INTEGER DEFAULT 0,
    winning_quote_id UUID, -- Will reference supplier_quotations
    
    -- Process Information
    issued_by UUID REFERENCES users(id),
    issued_at TIMESTAMPTZ,
    evaluation_completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rfq_number (rfq_number),
    INDEX idx_rfq_status (rfq_status),
    INDEX idx_rfq_deadline (submission_deadline)
);

-- RFQ Suppliers (Who was invited to quote)
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES request_for_quotations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Invitation Details
    invitation_sent_at TIMESTAMPTZ,
    invitation_method VARCHAR(50), -- 'EMAIL', 'PORTAL', 'PHYSICAL'
    
    -- Response Status
    response_status VARCHAR(20) DEFAULT 'INVITED', -- 'INVITED', 'VIEWED', 'SUBMITTED', 'NO_RESPONSE'
    quote_submitted_at TIMESTAMPTZ,
    
    UNIQUE(rfq_id, supplier_id),
    INDEX idx_rfq_supplier_rfq (rfq_id),
    INDEX idx_rfq_supplier_response (response_status)
);

-- Supplier Quotations
CREATE TABLE IF NOT EXISTS supplier_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    rfq_id UUID REFERENCES request_for_quotations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Quote Details
    quote_date DATE DEFAULT CURRENT_DATE,
    validity_period_days INTEGER DEFAULT 30,
    valid_until DATE,
    
    -- Financial Information
    total_quote_amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    payment_terms VARCHAR(200),
    delivery_cost DECIMAL(15, 2) DEFAULT 0,
    
    -- Commercial Terms
    delivery_time_days INTEGER,
    warranty_period VARCHAR(100),
    service_level_commitments TEXT,
    
    -- Evaluation Scores
    price_score DECIMAL(5, 2),
    technical_score DECIMAL(5, 2),
    delivery_score DECIMAL(5, 2),
    service_score DECIMAL(5, 2),
    overall_score DECIMAL(5, 2),
    
    -- Status
    quote_status VARCHAR(20) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'UNDER_EVALUATION', 'ACCEPTED', 'REJECTED', 'EXPIRED'
    
    -- Evaluation Results
    evaluation_comments TEXT,
    rejection_reason TEXT,
    
    -- Award Information
    awarded BOOLEAN DEFAULT FALSE,
    awarded_at TIMESTAMPTZ,
    po_created BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_quote_number (quote_number),
    INDEX idx_quote_supplier (supplier_id),
    INDEX idx_quote_rfq (rfq_id),
    INDEX idx_quote_status (quote_status)
);

-- Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES supplier_quotations(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    
    -- Item Details
    product_id UUID REFERENCES products(id),
    item_description TEXT NOT NULL,
    supplier_product_code VARCHAR(100),
    specifications TEXT,
    
    -- Quantity and Pricing
    quantity DECIMAL(15, 2) NOT NULL,
    unit_of_measure VARCHAR(20),
    unit_price DECIMAL(15, 4) NOT NULL,
    total_price DECIMAL(20, 2) NOT NULL,
    
    -- Terms
    delivery_time_days INTEGER,
    warranty_terms VARCHAR(200),
    technical_compliance_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(quotation_id, line_number),
    INDEX idx_quote_item_quote (quotation_id),
    INDEX idx_quote_item_product (product_id)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default vendor categories
INSERT INTO vendor_categories (category_code, category_name, description, risk_level) VALUES
('FUEL_SUPPLIER', 'Fuel Suppliers', 'Primary fuel suppliers (TOR, BDCs)', 'HIGH'),
('LOGISTICS', 'Logistics Providers', 'Transportation and logistics companies', 'MEDIUM'),
('EQUIPMENT', 'Equipment Suppliers', 'Fuel dispensers, tanks, and equipment', 'MEDIUM'),
('SERVICES', 'Service Providers', 'Maintenance, IT, professional services', 'LOW'),
('CONSUMABLES', 'Consumables', 'Office supplies, consumables', 'LOW'),
('CONSTRUCTION', 'Construction Contractors', 'Construction and civil works', 'HIGH')
ON CONFLICT (category_code) DO NOTHING;

-- Insert default purchase request types
INSERT INTO purchase_request_types (type_code, type_name, description, approval_levels) VALUES
('FUEL', 'Fuel Purchase', 'Purchase of petroleum products', 2),
('EQUIPMENT', 'Equipment Purchase', 'Purchase of equipment and machinery', 2),
('SERVICES', 'Services', 'Professional and technical services', 1),
('CONSUMABLES', 'Consumables', 'Office supplies and consumables', 1),
('MAINTENANCE', 'Maintenance', 'Maintenance and repair services', 1),
('CAPITAL', 'Capital Expenditure', 'Major capital investments', 3)
ON CONFLICT (type_code) DO NOTHING;

-- Insert default contract types
INSERT INTO contract_types (type_code, type_name, description, default_duration_months, requires_legal_review) VALUES
('SUPPLY', 'Supply Agreement', 'Product supply contracts', 12, true),
('SERVICE', 'Service Agreement', 'Service provider contracts', 12, false),
('MAINTENANCE', 'Maintenance Contract', 'Equipment maintenance contracts', 12, false),
('CONSTRUCTION', 'Construction Contract', 'Construction and civil works', 6, true),
('LEASE', 'Lease Agreement', 'Equipment and facility leases', 36, true),
('NDA', 'Non-Disclosure Agreement', 'Confidentiality agreements', 12, false)
ON CONFLICT (type_code) DO NOTHING;

-- Add foreign key constraint after tables are created
ALTER TABLE purchase_requests ADD CONSTRAINT fk_pr_converted_po 
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);

ALTER TABLE request_for_quotations ADD CONSTRAINT fk_rfq_winning_quote 
    FOREIGN KEY (winning_quote_id) REFERENCES supplier_quotations(id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Supply Chain and Procurement Management System schema created successfully!';
END $$;