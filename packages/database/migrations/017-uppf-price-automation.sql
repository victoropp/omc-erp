-- UPPF Price Build-Up and Automation Complete Database Schema
-- Implements all requirements from blueprint document
-- Ghana OMC ERP System - World-Class Implementation

-- =====================================================
-- PRICE BUILD-UP COMPONENTS (NPA STRUCTURE)
-- =====================================================

CREATE TABLE IF NOT EXISTS pbu_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'levy', 'regulatory_margin', 'distribution_margin', 
        'omc_margin', 'dealer_margin', 'other'
    )),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('GHS_per_litre', 'percentage', 'fixed')),
    rate_value DECIMAL(12, 6) NOT NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    source_doc_id UUID,
    approval_ref VARCHAR(100),
    npa_circular_ref VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Core NPA Components
INSERT INTO pbu_components (component_code, name, category, unit, rate_value, effective_from, created_by) VALUES
    ('EXREF', 'Ex-Refinery Price', 'other', 'GHS_per_litre', 0.0, '2025-01-01', 'SYSTEM'),
    ('ESRL', 'Energy Sector Recovery Levy', 'levy', 'GHS_per_litre', 0.20, '2025-01-01', 'SYSTEM'),
    ('PSRL', 'Price Stabilisation & Recovery Levy', 'levy', 'GHS_per_litre', 0.16, '2025-01-01', 'SYSTEM'),
    ('ROAD', 'Road Fund Levy', 'levy', 'GHS_per_litre', 0.48, '2025-01-01', 'SYSTEM'),
    ('EDRL', 'Energy Debt Recovery Levy', 'levy', 'GHS_per_litre', 0.49, '2025-01-01', 'SYSTEM'),
    ('BOST', 'BOST Margin', 'regulatory_margin', 'GHS_per_litre', 0.09, '2025-01-01', 'SYSTEM'),
    ('UPPF', 'UPPF Margin', 'regulatory_margin', 'GHS_per_litre', 0.10, '2025-01-01', 'SYSTEM'),
    ('MARK', 'Fuel Marking Margin', 'regulatory_margin', 'GHS_per_litre', 0.01, '2025-01-01', 'SYSTEM'),
    ('PRIM', 'Primary Distribution Margin', 'distribution_margin', 'GHS_per_litre', 0.08, '2025-01-01', 'SYSTEM'),
    ('OMC', 'OMC Margin', 'omc_margin', 'GHS_per_litre', 0.30, '2025-01-01', 'SYSTEM'),
    ('DEAL', 'Dealer/Retailer Margin', 'dealer_margin', 'GHS_per_litre', 0.35, '2025-01-01', 'SYSTEM');

-- =====================================================
-- PRICING WINDOWS MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_windows (
    window_id VARCHAR(50) PRIMARY KEY,
    window_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    npa_guideline_doc_id UUID,
    submission_deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'
    )),
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    published_at TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(year, window_number),
    CONSTRAINT valid_window_dates CHECK (end_date > start_date)
);

-- =====================================================
-- STATION PRICES WITH FULL PBU BREAKDOWN
-- =====================================================

CREATE TABLE IF NOT EXISTS station_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id),
    product_id VARCHAR(50) NOT NULL,
    window_id VARCHAR(50) NOT NULL REFERENCES pricing_windows(window_id),
    ex_pump_price DECIMAL(12, 4) NOT NULL,
    ex_refinery_price DECIMAL(12, 4) NOT NULL,
    total_taxes_levies DECIMAL(12, 4) NOT NULL,
    total_regulatory_margins DECIMAL(12, 4) NOT NULL,
    omc_margin DECIMAL(12, 4) NOT NULL,
    dealer_margin DECIMAL(12, 4) NOT NULL,
    calc_breakdown_json JSONB NOT NULL, -- Complete component breakdown
    published_date TIMESTAMP NOT NULL,
    first_sale_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(station_id, product_id, window_id)
);

-- =====================================================
-- UPPF CLAIMS MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS equalisation_points (
    route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    depot_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id),
    route_name VARCHAR(200) NOT NULL,
    km_threshold DECIMAL(10, 2) NOT NULL,
    region_id VARCHAR(50) NOT NULL,
    road_category VARCHAR(50),
    traffic_factor DECIMAL(5, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(depot_id, station_id)
);

CREATE TABLE IF NOT EXISTS delivery_consignments (
    consignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number VARCHAR(100) UNIQUE NOT NULL,
    depot_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id),
    product_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    litres_loaded DECIMAL(12, 2) NOT NULL,
    litres_received DECIMAL(12, 2),
    loading_temp DECIMAL(5, 2),
    receiving_temp DECIMAL(5, 2),
    dispatch_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP,
    route_id UUID REFERENCES equalisation_points(route_id),
    km_planned DECIMAL(10, 2),
    km_actual DECIMAL(10, 2),
    gps_trace_id UUID,
    waybill_number VARCHAR(100),
    seal_numbers VARCHAR(200),
    status VARCHAR(50) DEFAULT 'IN_TRANSIT',
    variance_litres DECIMAL(12, 2),
    variance_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gps_traces (
    trace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID REFERENCES delivery_consignments(consignment_id),
    vehicle_id VARCHAR(50) NOT NULL,
    start_coords POINT NOT NULL,
    end_coords POINT,
    route_polyline TEXT, -- Encoded polyline of actual route
    total_km DECIMAL(10, 2),
    actual_travel_time INTERVAL,
    planned_travel_time INTERVAL,
    max_speed_kmh DECIMAL(6, 2),
    avg_speed_kmh DECIMAL(6, 2),
    stop_count INTEGER DEFAULT 0,
    stop_duration_minutes INTEGER DEFAULT 0,
    anomalies_detected JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uppf_claims (
    claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    window_id VARCHAR(50) NOT NULL REFERENCES pricing_windows(window_id),
    consignment_id UUID NOT NULL REFERENCES delivery_consignments(consignment_id),
    route_id UUID NOT NULL REFERENCES equalisation_points(route_id),
    km_beyond_equalisation DECIMAL(10, 2) NOT NULL CHECK (km_beyond_equalisation >= 0),
    litres_moved DECIMAL(12, 2) NOT NULL,
    tariff_per_litre_km DECIMAL(8, 6) NOT NULL,
    claim_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'READY_TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW',
        'APPROVED', 'REJECTED', 'SETTLED', 'DISPUTED'
    )),
    evidence_links JSONB, -- Links to supporting documents
    three_way_reconciled BOOLEAN DEFAULT false,
    submission_date TIMESTAMP,
    submission_ref VARCHAR(100),
    npa_response_date TIMESTAMP,
    npa_response_ref VARCHAR(100),
    settlement_date TIMESTAMP,
    settlement_amount DECIMAL(12, 2),
    variance_amount DECIMAL(12, 2),
    variance_reason TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- =====================================================
-- THREE-WAY RECONCILIATION
-- =====================================================

CREATE TABLE IF NOT EXISTS three_way_reconciliation (
    reconciliation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consignment_id UUID NOT NULL REFERENCES delivery_consignments(consignment_id),
    depot_loaded_litres DECIMAL(12, 2) NOT NULL,
    depot_document_ref VARCHAR(100),
    transporter_delivered_litres DECIMAL(12, 2) NOT NULL,
    transporter_document_ref VARCHAR(100),
    station_received_litres DECIMAL(12, 2) NOT NULL,
    station_document_ref VARCHAR(100),
    variance_depot_transporter DECIMAL(12, 2),
    variance_transporter_station DECIMAL(12, 2),
    variance_depot_station DECIMAL(12, 2),
    reconciliation_status VARCHAR(50) DEFAULT 'PENDING',
    reconciled_by VARCHAR(100),
    reconciled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEALER MANAGEMENT AND SETTLEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS dealer_loans (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(100) UNIQUE NOT NULL,
    dealer_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id),
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN (
        'WORKING_CAPITAL', 'EQUIPMENT', 'INFRASTRUCTURE', 'OTHER'
    )),
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenor_months INTEGER NOT NULL,
    repayment_frequency VARCHAR(50) NOT NULL CHECK (repayment_frequency IN (
        'DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY'
    )),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amortization_method VARCHAR(50) DEFAULT 'EQUAL_INSTALLMENT',
    grace_period_months INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    guarantor_info JSONB,
    collateral_info JSONB,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_schedules (
    schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES dealer_loans(loan_id),
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_amount DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_date DATE,
    payment_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loan_id, installment_number)
);

CREATE TABLE IF NOT EXISTS dealer_settlements (
    settlement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_number VARCHAR(100) UNIQUE NOT NULL,
    dealer_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id),
    window_id VARCHAR(50) NOT NULL REFERENCES pricing_windows(window_id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Earnings
    gross_dealer_margin DECIMAL(15, 2) NOT NULL,
    volume_sold_litres DECIMAL(12, 2) NOT NULL,
    other_income DECIMAL(12, 2) DEFAULT 0,
    
    -- Deductions
    loan_deduction DECIMAL(12, 2) DEFAULT 0,
    shortage_deduction DECIMAL(12, 2) DEFAULT 0,
    damage_deduction DECIMAL(12, 2) DEFAULT 0,
    advance_deduction DECIMAL(12, 2) DEFAULT 0,
    tax_deduction DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    
    -- Net Settlement
    total_deductions DECIMAL(15, 2) NOT NULL,
    net_payable DECIMAL(15, 2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    approval_status VARCHAR(50),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_date DATE,
    payment_reference VARCHAR(100),
    
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- =====================================================
-- AUTOMATED JOURNAL ENTRY TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entry_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    transaction_type VARCHAR(100) NOT NULL,
    account_mapping_rules JSONB NOT NULL,
    approval_required BOOLEAN DEFAULT false,
    approval_threshold DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Insert standard templates for UPPF automation
INSERT INTO journal_entry_templates (template_code, name, transaction_type, account_mapping_rules, created_by) VALUES
    ('FUEL_SALE', 'Fuel Sale with UPPF', 'SALE', 
     '{"debit": [{"account": "1200", "amount": "total"}], 
       "credit": [
         {"account": "4100", "amount": "base_price"},
         {"account": "2310", "amount": "uppf_component"},
         {"account": "2320", "amount": "vat_component"},
         {"account": "2330", "amount": "nhil_component"},
         {"account": "2340", "amount": "getfund_component"},
         {"account": "1400", "amount": "fuel_cost"}
       ]}', 'SYSTEM'),
    
    ('UPPF_CLAIM', 'UPPF Claim Recognition', 'UPPF_CLAIM',
     '{"debit": [{"account": "1250", "amount": "claim_amount"}],
       "credit": [{"account": "4200", "amount": "claim_amount"}]}', 'SYSTEM'),
    
    ('DEALER_MARGIN', 'Dealer Margin Accrual', 'DEALER_MARGIN',
     '{"debit": [{"account": "5200", "amount": "margin_amount"}],
       "credit": [{"account": "2400", "amount": "margin_amount"}]}', 'SYSTEM'),
    
    ('DEALER_SETTLEMENT', 'Dealer Settlement with Loan', 'DEALER_SETTLEMENT',
     '{"debit": [
         {"account": "2400", "amount": "gross_margin"},
         {"account": "4300", "amount": "interest_component"}
       ],
       "credit": [
         {"account": "1260", "amount": "loan_principal"},
         {"account": "1000", "amount": "net_payment"},
         {"account": "2350", "amount": "tax_withheld"}
       ]}', 'SYSTEM');

CREATE TABLE IF NOT EXISTS automated_posting_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    template_id UUID REFERENCES journal_entry_templates(template_id),
    conditions JSONB,
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REGULATORY DOCUMENTS AND NPA INTEGRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS regulatory_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'pricing_guideline', 'pbu_template', 'circular', 'directive', 'other'
    )),
    document_number VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    issuing_authority VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    file_url VARCHAR(500),
    file_hash VARCHAR(256),
    metadata JSONB,
    is_processed BOOLEAN DEFAULT false,
    processed_date TIMESTAMP,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS npa_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN (
        'PRICE_SUBMISSION', 'UPPF_CLAIMS', 'COMPLIANCE_REPORT', 'OTHER'
    )),
    window_id VARCHAR(50) REFERENCES pricing_windows(window_id),
    submission_date TIMESTAMP NOT NULL,
    submission_reference VARCHAR(100) UNIQUE NOT NULL,
    document_count INTEGER NOT NULL,
    total_claims INTEGER,
    total_amount DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    response_date TIMESTAMP,
    response_reference VARCHAR(100),
    response_status VARCHAR(50),
    response_notes TEXT,
    submitted_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERFORMANCE INDEXES FOR OPTIMIZATION
-- =====================================================

CREATE INDEX idx_pbu_components_active ON pbu_components(is_active, effective_from, effective_to);
CREATE INDEX idx_pricing_windows_status ON pricing_windows(status, start_date, end_date);
CREATE INDEX idx_station_prices_lookup ON station_prices(station_id, product_id, window_id, is_active);
CREATE INDEX idx_delivery_consignments_status ON delivery_consignments(status, dispatch_datetime);
CREATE INDEX idx_uppf_claims_status ON uppf_claims(status, window_id, submission_date);
CREATE INDEX idx_uppf_claims_settlement ON uppf_claims(settlement_date, status);
CREATE INDEX idx_dealer_settlements_period ON dealer_settlements(station_id, period_start, period_end);
CREATE INDEX idx_three_way_recon_status ON three_way_reconciliation(reconciliation_status, consignment_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger to automatically calculate UPPF claim amount
CREATE OR REPLACE FUNCTION calculate_uppf_claim() RETURNS TRIGGER AS $$
BEGIN
    -- Calculate km beyond equalisation
    NEW.km_beyond_equalisation = GREATEST(0, 
        (SELECT dc.km_actual - ep.km_threshold
         FROM delivery_consignments dc
         JOIN equalisation_points ep ON ep.route_id = dc.route_id
         WHERE dc.consignment_id = NEW.consignment_id)
    );
    
    -- Calculate claim amount
    NEW.claim_amount = NEW.km_beyond_equalisation * NEW.litres_moved * NEW.tariff_per_litre_km;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_uppf_claim
    BEFORE INSERT OR UPDATE ON uppf_claims
    FOR EACH ROW
    EXECUTE FUNCTION calculate_uppf_claim();

-- Trigger for three-way reconciliation variances
CREATE OR REPLACE FUNCTION calculate_reconciliation_variances() RETURNS TRIGGER AS $$
BEGIN
    NEW.variance_depot_transporter = NEW.depot_loaded_litres - NEW.transporter_delivered_litres;
    NEW.variance_transporter_station = NEW.transporter_delivered_litres - NEW.station_received_litres;
    NEW.variance_depot_station = NEW.depot_loaded_litres - NEW.station_received_litres;
    
    -- Set status based on variance thresholds (2% tolerance)
    IF ABS(NEW.variance_depot_station) / NEW.depot_loaded_litres <= 0.02 THEN
        NEW.reconciliation_status = 'MATCHED';
    ELSE
        NEW.reconciliation_status = 'VARIANCE_DETECTED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_reconciliation_variances
    BEFORE INSERT OR UPDATE ON three_way_reconciliation
    FOR EACH ROW
    EXECUTE FUNCTION calculate_reconciliation_variances();

-- =====================================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- =====================================================

CREATE OR REPLACE VIEW v_uppf_claims_summary AS
SELECT 
    pw.window_id,
    pw.start_date,
    pw.end_date,
    COUNT(uc.claim_id) as total_claims,
    SUM(uc.claim_amount) as total_claim_amount,
    SUM(uc.settlement_amount) as total_settled_amount,
    SUM(uc.variance_amount) as total_variance,
    COUNT(CASE WHEN uc.status = 'SETTLED' THEN 1 END) as settled_claims,
    COUNT(CASE WHEN uc.status = 'REJECTED' THEN 1 END) as rejected_claims,
    COUNT(CASE WHEN uc.status = 'DISPUTED' THEN 1 END) as disputed_claims
FROM pricing_windows pw
LEFT JOIN uppf_claims uc ON uc.window_id = pw.window_id
GROUP BY pw.window_id, pw.start_date, pw.end_date;

CREATE OR REPLACE VIEW v_dealer_performance AS
SELECT 
    ds.dealer_id,
    ds.station_id,
    COUNT(ds.settlement_id) as total_settlements,
    SUM(ds.volume_sold_litres) as total_volume,
    SUM(ds.gross_dealer_margin) as total_margin_earned,
    SUM(ds.loan_deduction) as total_loan_deductions,
    SUM(ds.net_payable) as total_net_payments,
    AVG(ds.gross_dealer_margin / NULLIF(ds.volume_sold_litres, 0)) as avg_margin_per_litre
FROM dealer_settlements ds
WHERE ds.status = 'COMPLETED'
GROUP BY ds.dealer_id, ds.station_id;

-- =====================================================
-- STORED PROCEDURES FOR AUTOMATION
-- =====================================================

CREATE OR REPLACE PROCEDURE sp_process_pricing_window(
    p_window_id VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_station RECORD;
    v_product RECORD;
    v_ex_pump_price DECIMAL(12, 4);
    v_breakdown JSONB;
BEGIN
    -- Process each station and product combination
    FOR v_station IN SELECT id FROM stations WHERE is_active = true
    LOOP
        FOR v_product IN SELECT DISTINCT product_code FROM products WHERE is_fuel = true
        LOOP
            -- Calculate ex-pump price with all components
            SELECT 
                SUM(CASE 
                    WHEN pc.unit = 'GHS_per_litre' THEN pc.rate_value
                    WHEN pc.unit = 'percentage' THEN pc.rate_value / 100 * ex_ref.rate_value
                    ELSE 0
                END) as total_price,
                jsonb_build_object(
                    'ex_refinery', ex_ref.rate_value,
                    'components', jsonb_agg(
                        jsonb_build_object(
                            'code', pc.component_code,
                            'name', pc.name,
                            'value', pc.rate_value
                        )
                    )
                ) as breakdown
            INTO v_ex_pump_price, v_breakdown
            FROM pbu_components pc
            CROSS JOIN (
                SELECT rate_value 
                FROM pbu_components 
                WHERE component_code = 'EXREF' 
                AND is_active = true
            ) ex_ref
            WHERE pc.is_active = true
            AND CURRENT_TIMESTAMP BETWEEN pc.effective_from 
                AND COALESCE(pc.effective_to, '9999-12-31'::timestamp);
            
            -- Insert or update station price
            INSERT INTO station_prices (
                station_id, product_id, window_id, ex_pump_price,
                ex_refinery_price, total_taxes_levies, total_regulatory_margins,
                omc_margin, dealer_margin, calc_breakdown_json, published_date
            ) VALUES (
                v_station.id, v_product.product_code, p_window_id, v_ex_pump_price,
                (v_breakdown->>'ex_refinery')::decimal, 0, 0, 0, 0,
                v_breakdown, CURRENT_TIMESTAMP
            )
            ON CONFLICT (station_id, product_id, window_id) 
            DO UPDATE SET
                ex_pump_price = EXCLUDED.ex_pump_price,
                calc_breakdown_json = EXCLUDED.calc_breakdown_json,
                updated_at = CURRENT_TIMESTAMP;
        END LOOP;
    END LOOP;
    
    -- Update window status
    UPDATE pricing_windows 
    SET status = 'ACTIVE', published_at = CURRENT_TIMESTAMP
    WHERE window_id = p_window_id;
END;
$$;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO omc_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO omc_app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO omc_app_user;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO omc_app_user;