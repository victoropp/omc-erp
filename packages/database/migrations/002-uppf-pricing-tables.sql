-- Ghana OMC ERP - UPPF and Pricing Tables Migration
-- Migration: 002-uppf-pricing-tables
-- Created: 2025-01-15
-- Description: Create tables for UPPF claims, pricing windows, PBU components, and dealer settlements

-- Schema migrations tracking table (if not exists from previous migration)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PBU Components table (Price Build-Up components from NPA templates)
CREATE TABLE pbu_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    component_code VARCHAR(10) NOT NULL, -- EDRL, PSRL, BOST, UPPF, etc.
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- levy, regulatory_margin, distribution_margin, omc_margin, dealer_margin, other
    unit VARCHAR(20) NOT NULL, -- GHS_per_litre, percentage
    rate_value DECIMAL(10,6) NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    source_doc_id UUID, -- FK to regulatory_docs (will be created later)
    approval_ref VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Windows table (bi-weekly pricing cycles)
CREATE TABLE pricing_windows (
    window_id VARCHAR(20) PRIMARY KEY, -- 2025W15 format
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    npa_guideline_doc_id UUID, -- FK to regulatory_docs
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, closed, archived
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station Prices table (calculated ex-pump prices per station/product/window)
CREATE TABLE station_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    product_id VARCHAR(10) NOT NULL, -- PMS, AGO, LPG
    window_id VARCHAR(20) NOT NULL REFERENCES pricing_windows(window_id),
    ex_pump_price DECIMAL(8,4) NOT NULL,
    calc_breakdown_json JSONB NOT NULL, -- Component breakdown with values
    published_at TIMESTAMP WITH TIME ZONE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    calculated_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, product_id, window_id)
);

-- Equalisation Points table (UPPF distance thresholds by route)
CREATE TABLE equalisation_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id VARCHAR(50) NOT NULL,
    route_name VARCHAR(200) NOT NULL,
    depot_id UUID, -- Could reference a depots table if created
    km_threshold DECIMAL(8,2) NOT NULL,
    tariff_per_litre_km DECIMAL(8,6) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Consignments table (fuel delivery tracking)
CREATE TABLE delivery_consignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignment_number VARCHAR(50) NOT NULL,
    depot_id UUID, -- Reference to depot
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    product_id VARCHAR(10) NOT NULL, -- PMS, AGO, LPG
    route_id VARCHAR(50) NOT NULL,
    litres_loaded DECIMAL(12,3) NOT NULL,
    litres_received DECIMAL(12,3),
    km_planned DECIMAL(8,2) NOT NULL,
    km_actual DECIMAL(8,2),
    dispatch_date TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_date TIMESTAMP WITH TIME ZONE,
    gps_trace_id UUID, -- FK to gps_traces table
    waybill_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'loaded', -- loaded, in_transit, delivered, variance_flagged, disputed
    variance_notes TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPS Traces table (route tracking data)
CREATE TABLE gps_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES delivery_consignments(id) ON DELETE CASCADE,
    vehicle_id UUID, -- Could reference vehicles table
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_km DECIMAL(8,2) NOT NULL,
    route_points JSONB NOT NULL, -- Array of GPS coordinates with timestamps
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UPPF Claims table (distance-based reimbursement claims)
CREATE TABLE uppf_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(50) UNIQUE NOT NULL,
    window_id VARCHAR(20) NOT NULL REFERENCES pricing_windows(window_id),
    delivery_id UUID NOT NULL REFERENCES delivery_consignments(id) ON DELETE CASCADE,
    route_id VARCHAR(50) NOT NULL,
    km_beyond_equalisation DECIMAL(8,2) NOT NULL,
    litres_moved DECIMAL(12,3) NOT NULL,
    tariff_per_litre_km DECIMAL(8,6) NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'draft', -- draft, ready_to_submit, submitted, approved, paid, rejected, under_review
    evidence_links JSONB DEFAULT '[]', -- Array of document references
    submission_reference VARCHAR(100),
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer Loans table (loan management for dealers)
CREATE TABLE dealer_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id VARCHAR(50) UNIQUE NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    dealer_id UUID NOT NULL REFERENCES users(id), -- Dealer user account
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL, -- Annual percentage rate
    tenor_months INTEGER NOT NULL,
    repayment_frequency VARCHAR(20) NOT NULL, -- daily, weekly, bi_weekly, monthly
    amortization_method VARCHAR(20) DEFAULT 'reducing_balance',
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, defaulted, restructured, suspended
    outstanding_balance DECIMAL(15,2) NOT NULL,
    total_paid DECIMAL(15,2) DEFAULT 0,
    last_payment_date DATE,
    next_payment_date DATE,
    loan_agreement_doc_id UUID, -- Reference to document
    collateral_details JSONB,
    guarantor_details JSONB,
    notes TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer Settlements table (automated settlement calculations)
CREATE TABLE dealer_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    window_id VARCHAR(20) NOT NULL REFERENCES pricing_windows(window_id),
    settlement_date DATE NOT NULL,
    total_litres_sold DECIMAL(12,3) NOT NULL,
    gross_dealer_margin DECIMAL(12,2) NOT NULL,
    loan_deduction DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    net_payable DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'calculated', -- calculated, approved, paid, disputed
    payment_date DATE,
    payment_reference VARCHAR(100),
    calculation_details JSONB, -- Detailed breakdown of calculations
    settlement_statement_url VARCHAR(500),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    paid_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, window_id)
);

-- Inventory Movements table (enhanced for UPPF tracking)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    delivery_id UUID REFERENCES delivery_consignments(id),
    movement_type VARCHAR(20) NOT NULL, -- purchase, sale, transfer, adjustment, loss, reserved, released, refund, spillage, evaporation
    quantity DECIMAL(12,3) NOT NULL, -- Positive for inward, negative for outward
    previous_level DECIMAL(12,3) NOT NULL,
    new_level DECIMAL(12,3) NOT NULL,
    unit_cost DECIMAL(8,4),
    total_cost DECIMAL(12,2),
    reference_number VARCHAR(100),
    notes TEXT,
    quality_test_results JSONB,
    temperature DECIMAL(5,2),
    density DECIMAL(6,4),
    water_content DECIMAL(5,3),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes table (predefined delivery routes)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id VARCHAR(50) UNIQUE NOT NULL,
    route_name VARCHAR(200) NOT NULL,
    depot_id UUID, -- Reference to depot
    station_ids JSONB NOT NULL, -- Array of station IDs on this route
    total_km DECIMAL(8,2) NOT NULL,
    estimated_travel_time INTEGER, -- in minutes
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, under_review, suspended
    route_coordinates JSONB, -- Geographic route definition
    toll_points JSONB, -- Toll plaza locations and costs
    rest_stops JSONB, -- Approved rest/fuel stops
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for UPPF and pricing tables
CREATE INDEX idx_pbu_components_tenant_effective ON pbu_components(tenant_id, effective_from, effective_to);
CREATE INDEX idx_pbu_components_code_active ON pbu_components(component_code, is_active);
CREATE INDEX idx_pbu_components_category ON pbu_components(category);

CREATE INDEX idx_pricing_windows_tenant_status ON pricing_windows(tenant_id, status);
CREATE INDEX idx_pricing_windows_dates ON pricing_windows(start_date, end_date);

CREATE INDEX idx_station_prices_station_window ON station_prices(station_id, window_id);
CREATE INDEX idx_station_prices_product ON station_prices(product_id);
CREATE INDEX idx_station_prices_published ON station_prices(published_at) WHERE published_at IS NOT NULL;

CREATE INDEX idx_equalisation_points_route ON equalisation_points(route_id, effective_from);

CREATE INDEX idx_delivery_consignments_station_date ON delivery_consignments(station_id, dispatch_date);
CREATE INDEX idx_delivery_consignments_route ON delivery_consignments(route_id);
CREATE INDEX idx_delivery_consignments_status ON delivery_consignments(status);

CREATE INDEX idx_uppf_claims_window ON uppf_claims(window_id);
CREATE INDEX idx_uppf_claims_status ON uppf_claims(status);
CREATE INDEX idx_uppf_claims_submitted_at ON uppf_claims(submitted_at) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_uppf_claims_route ON uppf_claims(route_id);

CREATE INDEX idx_dealer_loans_station ON dealer_loans(station_id);
CREATE INDEX idx_dealer_loans_dealer ON dealer_loans(dealer_id);
CREATE INDEX idx_dealer_loans_status ON dealer_loans(status);
CREATE INDEX idx_dealer_loans_next_payment ON dealer_loans(next_payment_date) WHERE status = 'active';

CREATE INDEX idx_dealer_settlements_station_window ON dealer_settlements(station_id, window_id);
CREATE INDEX idx_dealer_settlements_status ON dealer_settlements(status);
CREATE INDEX idx_dealer_settlements_payment_due ON dealer_settlements(payment_date) WHERE status = 'approved';

CREATE INDEX idx_inventory_movements_tank_date ON inventory_movements(tank_id, created_at);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_transaction ON inventory_movements(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_inventory_movements_delivery ON inventory_movements(delivery_id) WHERE delivery_id IS NOT NULL;

CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_depot ON routes(depot_id) WHERE depot_id IS NOT NULL;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_pbu_components_updated_at BEFORE UPDATE ON pbu_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_windows_updated_at BEFORE UPDATE ON pricing_windows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_station_prices_updated_at BEFORE UPDATE ON station_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equalisation_points_updated_at BEFORE UPDATE ON equalisation_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_consignments_updated_at BEFORE UPDATE ON delivery_consignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gps_traces_updated_at BEFORE UPDATE ON gps_traces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uppf_claims_updated_at BEFORE UPDATE ON uppf_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_loans_updated_at BEFORE UPDATE ON dealer_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_settlements_updated_at BEFORE UPDATE ON dealer_settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample PBU components (Ghana standard components as of 2025)
INSERT INTO pbu_components (tenant_id, component_code, name, category, unit, rate_value, effective_from, is_active) VALUES
-- Levies and Taxes
('00000000-0000-0000-0000-000000000001', 'EDRL', 'Energy Debt Recovery Levy', 'levy', 'GHS_per_litre', 0.490000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'ROAD', 'Road Fund Levy', 'levy', 'GHS_per_litre', 0.840000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'PSRL', 'Price Stabilisation Recovery Levy', 'levy', 'GHS_per_litre', 0.160000, '2025-01-01', true),

-- Regulatory Margins
('00000000-0000-0000-0000-000000000001', 'BOST', 'BOST Margin', 'regulatory_margin', 'GHS_per_litre', 0.150000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'UPPF', 'Uniform Pump Price Fund', 'regulatory_margin', 'GHS_per_litre', 0.200000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'MARK', 'Fuel Marking Levy', 'regulatory_margin', 'GHS_per_litre', 0.080000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'PRIM', 'Primary Distribution Margin', 'distribution_margin', 'GHS_per_litre', 0.220000, '2025-01-01', true),

-- Marketing Margins
('00000000-0000-0000-0000-000000000001', 'OMC', 'OMC Marketing Margin', 'omc_margin', 'GHS_per_litre', 0.300000, '2025-01-01', true),
('00000000-0000-0000-0000-000000000001', 'DEAL', 'Dealer/Retailer Margin', 'dealer_margin', 'GHS_per_litre', 0.350000, '2025-01-01', true);

-- Insert sample equalisation points for major routes
INSERT INTO equalisation_points (route_id, route_name, km_threshold, tariff_per_litre_km, effective_from, tenant_id) VALUES
('R-TEMA-KUMASI', 'Tema to Kumasi Route', 250.0, 0.0025, '2025-01-01', '00000000-0000-0000-0000-000000000001'),
('R-TEMA-TAMALE', 'Tema to Tamale Route', 450.0, 0.0025, '2025-01-01', '00000000-0000-0000-0000-000000000001'),
('R-TEMA-BOLGA', 'Tema to Bolgatanga Route', 650.0, 0.0025, '2025-01-01', '00000000-0000-0000-0000-000000000001'),
('R-TEMA-WA', 'Tema to Wa Route', 700.0, 0.0025, '2025-01-01', '00000000-0000-0000-0000-000000000001');

-- Insert current pricing window (2025W03 - third week of 2025)
INSERT INTO pricing_windows (window_id, tenant_id, start_date, end_date, status) VALUES
('2025W03', '00000000-0000-0000-0000-000000000001', '2025-01-13', '2025-01-26', 'active');

-- Add table comments
COMMENT ON TABLE pbu_components IS 'Price Build-Up components from NPA templates (EDRL, PSRL, BOST, UPPF, etc.)';
COMMENT ON TABLE pricing_windows IS 'Bi-weekly pricing windows as per NPA guidelines';
COMMENT ON TABLE station_prices IS 'Calculated ex-pump prices per station/product/window';
COMMENT ON TABLE equalisation_points IS 'UPPF distance thresholds and tariff rates by route';
COMMENT ON TABLE delivery_consignments IS 'Fuel delivery tracking for UPPF claims';
COMMENT ON TABLE gps_traces IS 'GPS route tracking data for delivery verification';
COMMENT ON TABLE uppf_claims IS 'UPPF distance-based reimbursement claims';
COMMENT ON TABLE dealer_loans IS 'Dealer loan management and repayment tracking';
COMMENT ON TABLE dealer_settlements IS 'Automated dealer settlement calculations';
COMMENT ON TABLE inventory_movements IS 'Enhanced inventory tracking with delivery correlation';
COMMENT ON TABLE routes IS 'Predefined delivery routes with equalisation data';

-- Migration completion marker
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('002', NOW())
ON CONFLICT (version) DO NOTHING;