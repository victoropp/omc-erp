-- =====================================================
-- GHANA-SPECIFIC REGULATORY COMPLIANCE SYSTEM
-- Version: 1.0.0
-- Description: Complete Ghana regulatory compliance including NPA, EPA, GRA, BOG, UPPF
-- =====================================================

-- =====================================================
-- NPA (NATIONAL PETROLEUM AUTHORITY) COMPLIANCE
-- =====================================================

-- NPA Licenses and Permits
CREATE TABLE IF NOT EXISTS npa_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID REFERENCES stations(id),
    
    -- License Details
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_type VARCHAR(50) NOT NULL, -- 'OMC', 'FILLING_STATION', 'DEPOT', 'TRANSPORT', 'LPG_MARKETING'
    license_category VARCHAR(50), -- 'CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C'
    
    -- License Information
    licensee_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),
    business_registration_number VARCHAR(100),
    
    -- Validity Period
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    renewal_date DATE,
    
    -- License Conditions
    authorized_products JSONB, -- ['PETROL', 'DIESEL', 'KEROSENE', 'LPG']
    storage_capacity_liters DECIMAL(15, 2),
    dispensing_capacity_liters_per_day DECIMAL(15, 2),
    operational_conditions JSONB,
    special_conditions TEXT,
    
    -- Geographic Authorization
    authorized_regions JSONB,
    specific_locations JSONB,
    
    -- Status
    license_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED', 'PENDING_RENEWAL'
    status_effective_date DATE,
    status_reason TEXT,
    
    -- Compliance History
    violations_count INTEGER DEFAULT 0,
    last_inspection_date DATE,
    next_inspection_due DATE,
    
    -- Renewal Information
    renewal_notice_sent BOOLEAN DEFAULT FALSE,
    renewal_notice_date DATE,
    renewal_application_submitted BOOLEAN DEFAULT FALSE,
    renewal_application_date DATE,
    renewal_fee_paid BOOLEAN DEFAULT FALSE,
    renewal_fee_amount DECIMAL(15, 2),
    
    -- Supporting Documents
    license_certificate_path VARCHAR(500),
    supporting_documents JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_npa_license_number (license_number),
    INDEX idx_npa_license_tenant (tenant_id),
    INDEX idx_npa_license_station (station_id),
    INDEX idx_npa_license_type (license_type),
    INDEX idx_npa_license_status (license_status),
    INDEX idx_npa_license_expiry (expiry_date)
);

-- NPA Price Monitoring and Compliance
CREATE TABLE IF NOT EXISTS npa_price_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID REFERENCES stations(id),
    
    -- Price Period
    price_effective_date DATE NOT NULL,
    price_period_start DATE NOT NULL,
    price_period_end DATE NOT NULL,
    
    -- NPA Reference Prices (National Uniform Pricing)
    npa_reference_prices JSONB NOT NULL, -- {'PETROL': 15.99, 'DIESEL': 15.49, 'KEROSENE': 13.50}
    
    -- Station Actual Prices
    station_prices JSONB NOT NULL, -- {'PETROL': 15.99, 'DIESEL': 15.49, 'KEROSENE': 13.50}
    
    -- Price Compliance Analysis
    price_variances JSONB, -- {'PETROL': 0.00, 'DIESEL': 0.00, 'KEROSENE': 0.00}
    compliance_status VARCHAR(20) DEFAULT 'COMPLIANT', -- 'COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW'
    
    -- Variance Explanations (for non-compliance)
    variance_reasons JSONB,
    corrective_actions_taken TEXT,
    
    -- Monitoring Information
    monitoring_date DATE DEFAULT CURRENT_DATE,
    monitored_by VARCHAR(200), -- NPA inspector or system
    monitoring_method VARCHAR(50), -- 'PHYSICAL_INSPECTION', 'SYSTEM_REPORT', 'CUSTOMER_COMPLAINT'
    
    -- NPA Response
    npa_notified BOOLEAN DEFAULT FALSE,
    npa_notification_date DATE,
    npa_response TEXT,
    penalty_imposed DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, station_id, price_effective_date),
    INDEX idx_npa_price_tenant (tenant_id),
    INDEX idx_npa_price_station (station_id),
    INDEX idx_npa_price_date (price_effective_date),
    INDEX idx_npa_price_compliance (compliance_status)
);

-- NPA Fuel Quality Testing
CREATE TABLE IF NOT EXISTS npa_fuel_quality_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    tank_id UUID REFERENCES tanks(id),
    
    -- Test Information
    test_number VARCHAR(50) UNIQUE NOT NULL,
    test_date DATE NOT NULL,
    test_type VARCHAR(50), -- 'ROUTINE', 'COMPLAINT_BASED', 'RANDOM', 'FOLLOW_UP'
    fuel_type VARCHAR(20) NOT NULL, -- 'PETROL', 'DIESEL', 'KEROSENE'
    
    -- Sample Information
    sample_number VARCHAR(100),
    sample_collection_date DATE,
    sample_collector VARCHAR(200),
    laboratory_name VARCHAR(200),
    laboratory_certification VARCHAR(100),
    
    -- Ghana Fuel Quality Standards (NPA specifications)
    test_results JSONB NOT NULL, -- {
    --   "octane_rating": 91.5,
    --   "sulphur_content_ppm": 50,
    --   "density_kg_m3": 750,
    --   "flash_point_celsius": -43,
    --   "water_content_percent": 0.02,
    --   "sediment_content_percent": 0.001,
    --   "gum_content_mg_100ml": 4,
    --   "benzene_content_percent": 1.0,
    --   "aromatics_content_percent": 35
    -- }
    
    -- Compliance Assessment
    npa_standards JSONB NOT NULL, -- NPA specifications for comparison
    compliance_results JSONB, -- Which parameters passed/failed
    overall_compliance_status VARCHAR(20), -- 'PASSED', 'FAILED', 'MARGINAL'
    
    -- Non-Compliance Details
    failed_parameters JSONB,
    failure_severity VARCHAR(20), -- 'MINOR', 'MAJOR', 'CRITICAL'
    health_safety_risk VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH'
    
    -- Actions Required
    immediate_actions_required TEXT,
    corrective_actions TEXT,
    timeline_for_correction INTERVAL,
    
    -- NPA Actions
    npa_notified BOOLEAN DEFAULT FALSE,
    npa_notification_date DATE,
    npa_enforcement_action VARCHAR(100),
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Remediation
    remediation_completed BOOLEAN DEFAULT FALSE,
    remediation_date DATE,
    retest_required BOOLEAN DEFAULT FALSE,
    retest_date DATE,
    
    -- Certificate
    certificate_number VARCHAR(100),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_valid_until DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_npa_quality_test_number (test_number),
    INDEX idx_npa_quality_tenant (tenant_id),
    INDEX idx_npa_quality_station (station_id),
    INDEX idx_npa_quality_date (test_date),
    INDEX idx_npa_quality_compliance (overall_compliance_status)
);

-- NPA Operational Compliance Monitoring
CREATE TABLE IF NOT EXISTS npa_operational_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    
    -- Inspection Details
    inspection_number VARCHAR(50) UNIQUE NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_type VARCHAR(50), -- 'ROUTINE', 'COMPLAINT_BASED', 'FOLLOW_UP', 'SPECIAL'
    inspector_name VARCHAR(200),
    inspector_id_number VARCHAR(100),
    
    -- Areas Inspected
    areas_inspected JSONB, -- ['DISPENSERS', 'STORAGE_TANKS', 'SAFETY_EQUIPMENT', 'DOCUMENTATION']
    
    -- Compliance Checklist Results
    dispensing_equipment_compliance JSONB, -- Detailed checklist results
    storage_facilities_compliance JSONB,
    safety_equipment_compliance JSONB,
    environmental_compliance JSONB,
    documentation_compliance JSONB,
    staff_training_compliance JSONB,
    
    -- Overall Assessment
    overall_compliance_score DECIMAL(5, 2), -- 0-100
    compliance_grade VARCHAR(10), -- 'A', 'B', 'C', 'D', 'F'
    compliance_status VARCHAR(20), -- 'EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'POOR'
    
    -- Violations Identified
    violations_found JSONB,
    critical_violations INTEGER DEFAULT 0,
    major_violations INTEGER DEFAULT 0,
    minor_violations INTEGER DEFAULT 0,
    
    -- Corrective Actions
    corrective_actions_required TEXT,
    timeline_for_corrections JSONB,
    responsible_personnel JSONB,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    
    -- Penalties and Sanctions
    penalty_imposed DECIMAL(15, 2) DEFAULT 0,
    sanctions_applied TEXT,
    
    -- Certification
    certificate_status VARCHAR(20), -- 'ISSUED', 'SUSPENDED', 'REVOKED', 'PENDING'
    certificate_valid_from DATE,
    certificate_valid_until DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_npa_operational_inspection (inspection_number),
    INDEX idx_npa_operational_tenant (tenant_id),
    INDEX idx_npa_operational_station (station_id),
    INDEX idx_npa_operational_date (inspection_date),
    INDEX idx_npa_operational_compliance (compliance_status)
);

-- =====================================================
-- EPA (ENVIRONMENTAL PROTECTION AGENCY) COMPLIANCE
-- =====================================================

-- EPA Environmental Permits
CREATE TABLE IF NOT EXISTS epa_environmental_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    
    -- Permit Details
    permit_number VARCHAR(100) UNIQUE NOT NULL,
    permit_type VARCHAR(50) NOT NULL, -- 'ENVIRONMENTAL_PERMIT', 'WASTE_DISCHARGE_PERMIT', 'AIR_EMISSION_PERMIT'
    permit_class VARCHAR(20), -- 'CLASS_I', 'CLASS_II', 'CLASS_III' (based on environmental impact)
    
    -- Permit Information
    applicant_name VARCHAR(200) NOT NULL,
    facility_name VARCHAR(200),
    facility_location TEXT,
    
    -- Validity Period
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    
    -- Environmental Impact Assessment
    eia_required BOOLEAN DEFAULT FALSE,
    eia_certificate_number VARCHAR(100),
    eia_approval_date DATE,
    
    -- Permitted Activities
    permitted_activities JSONB, -- ['FUEL_STORAGE', 'FUEL_DISPENSING', 'WASTE_GENERATION']
    storage_capacity_authorized DECIMAL(15, 2),
    waste_types_authorized JSONB,
    emission_limits JSONB,
    
    -- Environmental Conditions
    environmental_conditions JSONB,
    monitoring_requirements JSONB,
    reporting_requirements JSONB,
    
    -- Status
    permit_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'
    status_reason TEXT,
    
    -- Compliance Monitoring
    last_inspection_date DATE,
    next_inspection_due DATE,
    violations_count INTEGER DEFAULT 0,
    
    -- Renewal
    renewal_application_submitted BOOLEAN DEFAULT FALSE,
    renewal_application_date DATE,
    renewal_fee_paid BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_epa_permit_number (permit_number),
    INDEX idx_epa_permit_tenant (tenant_id),
    INDEX idx_epa_permit_station (station_id),
    INDEX idx_epa_permit_type (permit_type),
    INDEX idx_epa_permit_status (permit_status),
    INDEX idx_epa_permit_expiry (expiry_date)
);

-- EPA Environmental Monitoring
CREATE TABLE IF NOT EXISTS epa_environmental_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    
    -- Monitoring Details
    monitoring_number VARCHAR(50) UNIQUE NOT NULL,
    monitoring_date DATE NOT NULL,
    monitoring_type VARCHAR(50), -- 'ROUTINE', 'COMPLAINT_INVESTIGATION', 'INCIDENT_RESPONSE', 'FOLLOW_UP'
    monitoring_parameters JSONB, -- ['AIR_QUALITY', 'WATER_QUALITY', 'SOIL_QUALITY', 'WASTE_MANAGEMENT']
    
    -- Air Quality Monitoring
    air_quality_results JSONB, -- {
    --   "benzene_ppm": 0.5,
    --   "toluene_ppm": 2.1,
    --   "xylene_ppm": 1.8,
    --   "particulate_matter_ug_m3": 45,
    --   "voc_total_ppm": 5.2
    -- }
    
    -- Water Quality Monitoring
    water_quality_results JSONB, -- {
    --   "ph": 7.2,
    --   "total_petroleum_hydrocarbons_mg_l": 0.1,
    --   "benzene_mg_l": 0.001,
    --   "chemical_oxygen_demand_mg_l": 15
    -- }
    
    -- Soil Quality Monitoring
    soil_quality_results JSONB, -- {
    --   "total_petroleum_hydrocarbons_mg_kg": 50,
    --   "heavy_metals_mg_kg": 2.5,
    --   "ph": 6.8
    -- }
    
    -- Waste Management Assessment
    waste_management_assessment JSONB,
    
    -- EPA Standards Comparison
    epa_standards JSONB, -- Standards for each parameter
    compliance_results JSONB, -- Which parameters are within limits
    overall_compliance VARCHAR(20), -- 'COMPLIANT', 'NON_COMPLIANT', 'MARGINAL'
    
    -- Non-Compliance Actions
    violations_identified JSONB,
    environmental_risk_level VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    immediate_actions_required TEXT,
    
    -- EPA Response
    epa_notified BOOLEAN DEFAULT FALSE,
    epa_enforcement_action TEXT,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    permit_suspension BOOLEAN DEFAULT FALSE,
    
    -- Remediation
    remediation_plan TEXT,
    remediation_deadline DATE,
    remediation_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_epa_monitoring_number (monitoring_number),
    INDEX idx_epa_monitoring_tenant (tenant_id),
    INDEX idx_epa_monitoring_station (station_id),
    INDEX idx_epa_monitoring_date (monitoring_date),
    INDEX idx_epa_monitoring_compliance (overall_compliance)
);

-- EPA Waste Management Records
CREATE TABLE IF NOT EXISTS epa_waste_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    
    -- Waste Generation Record
    record_date DATE NOT NULL,
    reporting_period VARCHAR(20), -- 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    
    -- Waste Types and Quantities
    hazardous_waste_generated JSONB, -- {
    --   "contaminated_soil_kg": 150,
    --   "oily_water_liters": 500,
    --   "used_filters_kg": 25,
    --   "contaminated_rags_kg": 10
    -- }
    
    non_hazardous_waste_generated JSONB,
    
    -- Waste Management Methods
    waste_treatment_methods JSONB,
    waste_disposal_facilities JSONB,
    licensed_waste_contractors JSONB,
    
    -- Documentation
    waste_manifests JSONB,
    disposal_certificates JSONB,
    
    -- EPA Compliance
    waste_permit_compliance BOOLEAN DEFAULT TRUE,
    reporting_requirements_met BOOLEAN DEFAULT TRUE,
    
    -- Environmental Impact
    environmental_impact_assessment TEXT,
    mitigation_measures TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_epa_waste_tenant (tenant_id),
    INDEX idx_epa_waste_station (station_id),
    INDEX idx_epa_waste_date (record_date)
);

-- =====================================================
-- GRA (GHANA REVENUE AUTHORITY) COMPLIANCE
-- =====================================================

-- GRA Tax Registration and Status
CREATE TABLE IF NOT EXISTS gra_tax_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Tax Registration Details
    tin_number VARCHAR(50) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),
    
    -- Registration Information
    registration_date DATE NOT NULL,
    business_commencement_date DATE,
    registration_type VARCHAR(50), -- 'NEW_REGISTRATION', 'TRANSFER', 'BRANCH'
    
    -- Tax Types Registered For
    income_tax_registered BOOLEAN DEFAULT TRUE,
    vat_registered BOOLEAN DEFAULT FALSE,
    vat_registration_number VARCHAR(50),
    vat_registration_date DATE,
    nhil_registered BOOLEAN DEFAULT TRUE,
    getfund_registered BOOLEAN DEFAULT TRUE,
    covid_levy_registered BOOLEAN DEFAULT TRUE,
    
    -- Business Classification
    business_sector VARCHAR(100),
    annual_turnover_range VARCHAR(50),
    employee_count_range VARCHAR(50),
    
    -- Tax Status
    tax_compliance_status VARCHAR(20) DEFAULT 'COMPLIANT', -- 'COMPLIANT', 'NON_COMPLIANT', 'UNDER_AUDIT'
    compliance_rating VARCHAR(10), -- 'A', 'B', 'C', 'D'
    
    -- Compliance History
    last_filing_date DATE,
    last_payment_date DATE,
    outstanding_tax_liability DECIMAL(20, 2) DEFAULT 0,
    
    -- Contact Information for GRA
    tax_agent_name VARCHAR(200),
    tax_agent_tin VARCHAR(50),
    primary_contact_person VARCHAR(200),
    
    -- Status
    registration_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'CANCELLED'
    status_effective_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_gra_tin (tin_number),
    INDEX idx_gra_tenant (tenant_id),
    INDEX idx_gra_vat_number (vat_registration_number),
    INDEX idx_gra_compliance_status (tax_compliance_status)
);

-- GRA Monthly Tax Returns
CREATE TABLE IF NOT EXISTS gra_monthly_tax_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Return Period
    tax_year INTEGER NOT NULL,
    tax_month INTEGER NOT NULL, -- 1-12
    filing_deadline DATE NOT NULL,
    
    -- Return Details
    return_type VARCHAR(50), -- 'MONTHLY_VAT', 'MONTHLY_PAYE', 'QUARTERLY_INCOME'
    return_reference_number VARCHAR(100),
    filing_date DATE,
    filed_by VARCHAR(200),
    
    -- Financial Summary
    gross_revenue DECIMAL(20, 2) NOT NULL,
    exempt_revenue DECIMAL(20, 2) DEFAULT 0,
    taxable_revenue DECIMAL(20, 2) NOT NULL,
    
    -- Tax Calculations
    vat_output DECIMAL(15, 2) DEFAULT 0, -- VAT on sales
    vat_input DECIMAL(15, 2) DEFAULT 0,  -- VAT on purchases
    vat_payable DECIMAL(15, 2) GENERATED ALWAYS AS (vat_output - vat_input) STORED,
    
    nhil_payable DECIMAL(15, 2) DEFAULT 0, -- 2.5%
    getfund_payable DECIMAL(15, 2) DEFAULT 0, -- 2.5%
    covid_levy_payable DECIMAL(15, 2) DEFAULT 0, -- 1%
    
    total_tax_payable DECIMAL(20, 2) NOT NULL,
    
    -- Payment Information
    payment_made DECIMAL(20, 2) DEFAULT 0,
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Outstanding/Refund
    amount_outstanding DECIMAL(20, 2) DEFAULT 0,
    refund_due DECIMAL(15, 2) DEFAULT 0,
    
    -- Filing Status
    filing_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'FILED', 'OVERDUE', 'AMENDED', 'AUDITED'
    overdue_days INTEGER DEFAULT 0,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    interest_charged DECIMAL(15, 2) DEFAULT 0,
    
    -- Electronic Filing
    filed_electronically BOOLEAN DEFAULT TRUE,
    electronic_receipt_number VARCHAR(100),
    
    -- Supporting Documents
    supporting_documents JSONB,
    
    -- GRA Processing
    gra_acknowledged BOOLEAN DEFAULT FALSE,
    gra_acknowledgment_date DATE,
    gra_assessment_notice TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, tax_year, tax_month, return_type),
    INDEX idx_gra_returns_tenant (tenant_id),
    INDEX idx_gra_returns_period (tax_year, tax_month),
    INDEX idx_gra_returns_status (filing_status),
    INDEX idx_gra_returns_deadline (filing_deadline)
);

-- GRA Tax Audit Records
CREATE TABLE IF NOT EXISTS gra_tax_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Audit Details
    audit_reference_number VARCHAR(100) UNIQUE NOT NULL,
    audit_type VARCHAR(50), -- 'DESK_AUDIT', 'FIELD_AUDIT', 'COMPREHENSIVE_AUDIT', 'SPECIAL_AUDIT'
    audit_scope VARCHAR(100), -- 'INCOME_TAX', 'VAT', 'PAYE', 'COMPREHENSIVE'
    
    -- Audit Period
    audit_period_from DATE NOT NULL,
    audit_period_to DATE NOT NULL,
    
    -- Audit Timeline
    audit_notification_date DATE,
    audit_commencement_date DATE,
    audit_completion_date DATE,
    
    -- GRA Audit Team
    lead_auditor_name VARCHAR(200),
    audit_team_members JSONB,
    gra_office VARCHAR(100),
    
    -- Audit Findings
    total_additional_assessment DECIMAL(20, 2) DEFAULT 0,
    income_tax_assessment DECIMAL(20, 2) DEFAULT 0,
    vat_assessment DECIMAL(20, 2) DEFAULT 0,
    penalty_assessment DECIMAL(20, 2) DEFAULT 0,
    interest_assessment DECIMAL(20, 2) DEFAULT 0,
    
    -- Key Findings
    major_findings TEXT,
    discrepancies_identified JSONB,
    supporting_evidence JSONB,
    
    -- Taxpayer Response
    objection_filed BOOLEAN DEFAULT FALSE,
    objection_date DATE,
    objection_grounds TEXT,
    additional_documents_provided JSONB,
    
    -- Resolution
    audit_status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'OBJECTION_PENDING', 'RESOLVED'
    final_assessment DECIMAL(20, 2) DEFAULT 0,
    payment_agreement BOOLEAN DEFAULT FALSE,
    payment_schedule JSONB,
    
    -- Appeal Process
    appeal_filed BOOLEAN DEFAULT FALSE,
    appeal_date DATE,
    appeal_tribunal_decision TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_gra_audit_reference (audit_reference_number),
    INDEX idx_gra_audit_tenant (tenant_id),
    INDEX idx_gra_audit_type (audit_type),
    INDEX idx_gra_audit_status (audit_status),
    INDEX idx_gra_audit_period (audit_period_from, audit_period_to)
);

-- =====================================================
-- BOG (BANK OF GHANA) COMPLIANCE
-- =====================================================

-- BOG Foreign Exchange Transactions
CREATE TABLE IF NOT EXISTS bog_forex_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Transaction Details
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50), -- 'PURCHASE', 'SALE', 'TRANSFER'
    
    -- Currency Details
    base_currency VARCHAR(3) DEFAULT 'GHS',
    foreign_currency VARCHAR(3) NOT NULL, -- 'USD', 'EUR', 'GBP'
    
    -- Transaction Amounts
    foreign_currency_amount DECIMAL(20, 2) NOT NULL,
    ghs_equivalent DECIMAL(20, 2) NOT NULL,
    exchange_rate DECIMAL(12, 6) NOT NULL,
    
    -- BOG Official Rate Comparison
    bog_official_rate DECIMAL(12, 6),
    rate_variance_percentage DECIMAL(5, 2),
    within_acceptable_variance BOOLEAN DEFAULT TRUE,
    
    -- Transaction Purpose
    transaction_purpose VARCHAR(100), -- 'FUEL_IMPORTS', 'EQUIPMENT_PURCHASE', 'SERVICE_PAYMENT'
    transaction_description TEXT,
    
    -- Banking Details
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_transaction_reference VARCHAR(100),
    
    -- BOG Reporting Requirements
    reporting_threshold_exceeded BOOLEAN DEFAULT FALSE, -- GHS equivalent > threshold
    bog_reporting_required BOOLEAN DEFAULT FALSE,
    bog_report_submitted BOOLEAN DEFAULT FALSE,
    bog_report_submission_date DATE,
    bog_report_reference VARCHAR(100),
    
    -- Compliance Status
    compliance_status VARCHAR(20) DEFAULT 'COMPLIANT', -- 'COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW'
    compliance_notes TEXT,
    
    -- Supporting Documentation
    supporting_documents JSONB,
    commercial_invoice_number VARCHAR(100),
    import_declaration_number VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_bog_forex_reference (transaction_reference),
    INDEX idx_bog_forex_tenant (tenant_id),
    INDEX idx_bog_forex_date (transaction_date),
    INDEX idx_bog_forex_currency (foreign_currency),
    INDEX idx_bog_forex_reporting (bog_reporting_required),
    INDEX idx_bog_forex_compliance (compliance_status)
);

-- BOG Monthly Forex Returns
CREATE TABLE IF NOT EXISTS bog_monthly_forex_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Reporting Period
    reporting_year INTEGER NOT NULL,
    reporting_month INTEGER NOT NULL,
    submission_deadline DATE NOT NULL,
    
    -- Return Summary
    total_forex_purchases_usd DECIMAL(20, 2) DEFAULT 0,
    total_forex_sales_usd DECIMAL(20, 2) DEFAULT 0,
    net_forex_position_usd DECIMAL(20, 2) DEFAULT 0,
    
    -- Purpose Breakdown
    fuel_import_payments_usd DECIMAL(20, 2) DEFAULT 0,
    equipment_payments_usd DECIMAL(20, 2) DEFAULT 0,
    service_payments_usd DECIMAL(20, 2) DEFAULT 0,
    other_payments_usd DECIMAL(20, 2) DEFAULT 0,
    
    -- Average Exchange Rates
    average_purchase_rate DECIMAL(12, 6),
    average_sale_rate DECIMAL(12, 6),
    bog_average_rate DECIMAL(12, 6),
    
    -- Submission Status
    submission_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUBMITTED', 'OVERDUE', 'ACKNOWLEDGED'
    submitted_date DATE,
    submitted_by VARCHAR(200),
    bog_acknowledgment_date DATE,
    bog_reference_number VARCHAR(100),
    
    -- Compliance
    compliance_issues JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, reporting_year, reporting_month),
    INDEX idx_bog_returns_tenant (tenant_id),
    INDEX idx_bog_returns_period (reporting_year, reporting_month),
    INDEX idx_bog_returns_status (submission_status),
    INDEX idx_bog_returns_deadline (submission_deadline)
);

-- =====================================================
-- UPPF (UNIFIED PETROLEUM PRICE FUND) COMPLIANCE
-- =====================================================

-- UPPF Price Build-up Components
CREATE TABLE IF NOT EXISTS uppf_price_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Effective Period
    effective_from DATE NOT NULL,
    effective_to DATE,
    fuel_type VARCHAR(20) NOT NULL, -- 'PETROL', 'DIESEL', 'KEROSENE'
    
    -- International Market Prices (USD per barrel)
    crude_oil_price_usd DECIMAL(10, 4),
    product_price_fob_usd DECIMAL(10, 4),
    
    -- Local Market Factors (GHS per litre)
    exchange_rate DECIMAL(10, 6),
    import_parity_price DECIMAL(10, 4),
    
    -- Price Build-up Components (GHS per litre)
    crude_cost_per_litre DECIMAL(10, 4),
    refinery_margin_per_litre DECIMAL(10, 4),
    primary_distribution_cost DECIMAL(10, 4),
    marketing_margin DECIMAL(10, 4),
    dealer_margin DECIMAL(10, 4),
    
    -- Levies and Taxes (GHS per litre)
    uppf_levy DECIMAL(10, 4),
    road_fund_levy DECIMAL(10, 4),
    energy_fund_levy DECIMAL(10, 4),
    price_stabilization_levy DECIMAL(10, 4),
    special_petroleum_tax DECIMAL(10, 4),
    
    -- Final Consumer Price
    pump_price_before_taxes DECIMAL(10, 4),
    total_levies DECIMAL(10, 4),
    final_pump_price DECIMAL(10, 4),
    
    -- UPPF Subsidy Calculation
    international_market_price DECIMAL(10, 4),
    domestic_price_cap DECIMAL(10, 4),
    uppf_subsidy_per_litre DECIMAL(10, 4),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(200),
    approval_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(effective_from, fuel_type),
    INDEX idx_uppf_components_date (effective_from, effective_to),
    INDEX idx_uppf_components_fuel (fuel_type),
    INDEX idx_uppf_components_active (is_active)
);

-- UPPF Monthly Claims
CREATE TABLE IF NOT EXISTS uppf_monthly_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Claim Period
    claim_year INTEGER NOT NULL,
    claim_month INTEGER NOT NULL,
    submission_deadline DATE NOT NULL,
    
    -- Dealer Information
    dealer_name VARCHAR(200) NOT NULL,
    dealer_category VARCHAR(20), -- 'CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C'
    uppf_dealer_code VARCHAR(100),
    
    -- Volume Data (Litres)
    petrol_volume_sold DECIMAL(20, 2) DEFAULT 0,
    diesel_volume_sold DECIMAL(20, 2) DEFAULT 0,
    kerosene_volume_sold DECIMAL(20, 2) DEFAULT 0,
    total_volume_sold DECIMAL(20, 2) GENERATED ALWAYS AS (
        petrol_volume_sold + diesel_volume_sold + kerosene_volume_sold
    ) STORED,
    
    -- Pricing Information (per litre)
    petrol_pump_price DECIMAL(10, 4),
    diesel_pump_price DECIMAL(10, 4),
    kerosene_pump_price DECIMAL(10, 4),
    
    -- UPPF Subsidy Claims (GHS)
    petrol_subsidy_claimed DECIMAL(20, 2) DEFAULT 0,
    diesel_subsidy_claimed DECIMAL(20, 2) DEFAULT 0,
    kerosene_subsidy_claimed DECIMAL(20, 2) DEFAULT 0,
    total_subsidy_claimed DECIMAL(20, 2) GENERATED ALWAYS AS (
        petrol_subsidy_claimed + diesel_subsidy_claimed + kerosene_subsidy_claimed
    ) STORED,
    
    -- Dealer Margin Claims
    petrol_margin_claimed DECIMAL(20, 2) DEFAULT 0,
    diesel_margin_claimed DECIMAL(20, 2) DEFAULT 0,
    kerosene_margin_claimed DECIMAL(20, 2) DEFAULT 0,
    total_margin_claimed DECIMAL(20, 2) GENERATED ALWAYS AS (
        petrol_margin_claimed + diesel_margin_claimed + kerosene_margin_claimed
    ) STORED,
    
    -- Total Claim Amount
    total_claim_amount DECIMAL(20, 2) GENERATED ALWAYS AS (
        total_subsidy_claimed + total_margin_claimed
    ) STORED,
    
    -- Supporting Data
    opening_stock_volumes JSONB,
    receipts_volumes JSONB,
    closing_stock_volumes JSONB,
    
    -- Submission Status
    claim_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'
    submitted_date DATE,
    submitted_by VARCHAR(200),
    
    -- UPPF Review
    uppf_review_date DATE,
    uppf_reviewer VARCHAR(200),
    uppf_comments TEXT,
    
    -- Approval and Payment
    approved_amount DECIMAL(20, 2),
    approval_date DATE,
    payment_voucher_number VARCHAR(100),
    payment_date DATE,
    payment_amount DECIMAL(20, 2),
    
    -- Supporting Documents
    sales_invoices_attached BOOLEAN DEFAULT FALSE,
    stock_receipt_vouchers_attached BOOLEAN DEFAULT FALSE,
    pump_reading_sheets_attached BOOLEAN DEFAULT FALSE,
    supporting_documents JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, claim_year, claim_month),
    INDEX idx_uppf_claims_tenant (tenant_id),
    INDEX idx_uppf_claims_period (claim_year, claim_month),
    INDEX idx_uppf_claims_status (claim_status),
    INDEX idx_uppf_claims_deadline (submission_deadline)
);

-- UPPF Dealer Performance Monitoring
CREATE TABLE IF NOT EXISTS uppf_dealer_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Performance Period
    assessment_year INTEGER NOT NULL,
    assessment_month INTEGER,
    assessment_type VARCHAR(50), -- 'MONTHLY', 'QUARTERLY', 'ANNUAL'
    
    -- Volume Performance
    target_volume_litres DECIMAL(20, 2),
    actual_volume_litres DECIMAL(20, 2),
    volume_achievement_percentage DECIMAL(5, 2),
    
    -- Market Share
    local_market_size_litres DECIMAL(20, 2),
    market_share_percentage DECIMAL(5, 2),
    
    -- Pricing Compliance
    pricing_compliance_score DECIMAL(5, 2), -- 0-100
    pricing_violations_count INTEGER DEFAULT 0,
    
    -- Operational Performance
    station_count INTEGER,
    operational_stations INTEGER,
    operational_efficiency DECIMAL(5, 2),
    
    -- Financial Performance
    revenue_generated DECIMAL(20, 2),
    subsidy_efficiency DECIMAL(5, 2), -- Subsidy vs. volume ratio
    
    -- Dealer Classification
    current_category VARCHAR(20),
    recommended_category VARCHAR(20),
    category_change_justification TEXT,
    
    -- Performance Rating
    overall_performance_score DECIMAL(5, 2), -- 0-100
    performance_grade VARCHAR(10), -- 'A', 'B', 'C', 'D'
    performance_trend VARCHAR(20), -- 'IMPROVING', 'STABLE', 'DECLINING'
    
    -- Recommendations
    uppf_recommendations TEXT,
    improvement_areas JSONB,
    action_plan TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, assessment_year, assessment_month, assessment_type),
    INDEX idx_uppf_performance_tenant (tenant_id),
    INDEX idx_uppf_performance_period (assessment_year, assessment_month),
    INDEX idx_uppf_performance_score (overall_performance_score)
);

-- =====================================================
-- INTEGRATION AND AUTOMATION TABLES
-- =====================================================

-- Regulatory Reporting Schedule
CREATE TABLE IF NOT EXISTS regulatory_reporting_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Reporting Requirement
    regulatory_authority VARCHAR(10) NOT NULL, -- 'NPA', 'EPA', 'GRA', 'BOG', 'UPPF'
    report_type VARCHAR(100) NOT NULL,
    report_frequency VARCHAR(20) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
    
    -- Next Submission
    next_due_date DATE NOT NULL,
    submission_window_days INTEGER DEFAULT 7,
    
    -- Automation Configuration
    auto_generate BOOLEAN DEFAULT FALSE,
    auto_submit BOOLEAN DEFAULT FALSE,
    notification_days_before INTEGER DEFAULT 7,
    
    -- Responsible Parties
    responsible_user_id UUID REFERENCES users(id),
    backup_user_id UUID REFERENCES users(id),
    approval_required BOOLEAN DEFAULT TRUE,
    approver_user_id UUID REFERENCES users(id),
    
    -- Status Tracking
    last_submission_date DATE,
    last_submission_status VARCHAR(20),
    consecutive_late_submissions INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_regulatory_schedule_tenant (tenant_id),
    INDEX idx_regulatory_schedule_authority (regulatory_authority),
    INDEX idx_regulatory_schedule_due_date (next_due_date),
    INDEX idx_regulatory_schedule_active (is_active)
);

-- Compliance Dashboard Metrics
CREATE TABLE IF NOT EXISTS compliance_dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    calculation_date DATE DEFAULT CURRENT_DATE,
    
    -- Overall Compliance Score (0-100)
    overall_compliance_score DECIMAL(5, 2),
    
    -- Individual Authority Scores
    npa_compliance_score DECIMAL(5, 2),
    epa_compliance_score DECIMAL(5, 2),
    gra_compliance_score DECIMAL(5, 2),
    bog_compliance_score DECIMAL(5, 2),
    uppf_compliance_score DECIMAL(5, 2),
    
    -- Status Counts
    compliant_requirements INTEGER DEFAULT 0,
    non_compliant_requirements INTEGER DEFAULT 0,
    pending_requirements INTEGER DEFAULT 0,
    
    -- Risk Assessment
    high_risk_issues INTEGER DEFAULT 0,
    medium_risk_issues INTEGER DEFAULT 0,
    low_risk_issues INTEGER DEFAULT 0,
    
    -- Financial Impact
    total_penalties_ytd DECIMAL(20, 2) DEFAULT 0,
    potential_financial_exposure DECIMAL(20, 2) DEFAULT 0,
    
    -- Trends
    compliance_trend VARCHAR(20), -- 'IMPROVING', 'STABLE', 'DECLINING'
    trend_percentage_change DECIMAL(5, 2),
    
    -- Actions Required
    critical_actions_required INTEGER DEFAULT 0,
    overdue_actions INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, calculation_date),
    INDEX idx_compliance_metrics_tenant (tenant_id),
    INDEX idx_compliance_metrics_date (calculation_date),
    INDEX idx_compliance_metrics_score (overall_compliance_score)
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Ghana Regulatory Compliance System schema created successfully with NPA, EPA, GRA, BOG, and UPPF modules!';
END $$;