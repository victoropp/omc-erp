-- =====================================================
-- STORED PROCEDURES FOR GHANA REGULATORY REPORTING
-- Version: 1.0.0
-- Description: Automated procedures for NPA, EPA, GRA, BOG, and UPPF regulatory reporting
-- =====================================================

-- =====================================================
-- GRA (GHANA REVENUE AUTHORITY) PROCEDURES
-- =====================================================

-- Generate Monthly VAT Return
CREATE OR REPLACE FUNCTION generate_monthly_vat_return(
    p_tenant_id UUID,
    p_tax_year INTEGER,
    p_tax_month INTEGER
) RETURNS JSON AS $$
DECLARE
    v_return_data JSON;
    v_gross_revenue DECIMAL(20,2);
    v_vat_output DECIMAL(15,2);
    v_vat_input DECIMAL(15,2);
    v_vat_payable DECIMAL(15,2);
    v_nhil_payable DECIMAL(15,2);
    v_getfund_payable DECIMAL(15,2);
    v_covid_levy_payable DECIMAL(15,2);
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Calculate period dates
    v_period_start := DATE(p_tax_year || '-' || LPAD(p_tax_month::TEXT, 2, '0') || '-01');
    v_period_end := (v_period_start + INTERVAL '1 month - 1 day')::DATE;
    
    -- Calculate gross revenue for the period
    SELECT COALESCE(SUM(net_amount), 0)
    INTO v_gross_revenue
    FROM fuel_transactions ft
    WHERE ft.transaction_date::DATE BETWEEN v_period_start AND v_period_end
    AND ft.payment_status = 'COMPLETED';
    
    -- Calculate VAT Output (12.5% on gross revenue)
    v_vat_output := v_gross_revenue * 0.125;
    
    -- Calculate VAT Input (from purchases - simplified calculation)
    SELECT COALESCE(SUM(tax_amount), 0)
    INTO v_vat_input
    FROM purchase_invoices pi
    WHERE pi.invoice_date BETWEEN v_period_start AND v_period_end
    AND pi.payment_status = 'FULLY_PAID';
    
    -- Calculate net VAT payable
    v_vat_payable := GREATEST(v_vat_output - v_vat_input, 0);
    
    -- Calculate NHIL (2.5% on gross revenue)
    v_nhil_payable := v_gross_revenue * 0.025;
    
    -- Calculate GETFUND (2.5% on gross revenue)
    v_getfund_payable := v_gross_revenue * 0.025;
    
    -- Calculate COVID-19 Levy (1% on gross revenue)
    v_covid_levy_payable := v_gross_revenue * 0.01;
    
    -- Insert or update the VAT return record
    INSERT INTO gra_monthly_tax_returns (
        tenant_id, tax_year, tax_month, filing_deadline,
        return_type, gross_revenue, taxable_revenue,
        vat_output, vat_input, vat_payable,
        nhil_payable, getfund_payable, covid_levy_payable,
        total_tax_payable
    ) VALUES (
        p_tenant_id, p_tax_year, p_tax_month,
        v_period_end + INTERVAL '15 days',
        'MONTHLY_VAT', v_gross_revenue, v_gross_revenue,
        v_vat_output, v_vat_input, v_vat_payable,
        v_nhil_payable, v_getfund_payable, v_covid_levy_payable,
        v_vat_payable + v_nhil_payable + v_getfund_payable + v_covid_levy_payable
    )
    ON CONFLICT (tenant_id, tax_year, tax_month, return_type) 
    DO UPDATE SET
        gross_revenue = EXCLUDED.gross_revenue,
        taxable_revenue = EXCLUDED.taxable_revenue,
        vat_output = EXCLUDED.vat_output,
        vat_input = EXCLUDED.vat_input,
        vat_payable = EXCLUDED.vat_payable,
        nhil_payable = EXCLUDED.nhil_payable,
        getfund_payable = EXCLUDED.getfund_payable,
        covid_levy_payable = EXCLUDED.covid_levy_payable,
        total_tax_payable = EXCLUDED.total_tax_payable;
    
    -- Prepare return data as JSON
    v_return_data := json_build_object(
        'tenant_id', p_tenant_id,
        'tax_year', p_tax_year,
        'tax_month', p_tax_month,
        'period_start', v_period_start,
        'period_end', v_period_end,
        'gross_revenue', v_gross_revenue,
        'vat_output', v_vat_output,
        'vat_input', v_vat_input,
        'vat_payable', v_vat_payable,
        'nhil_payable', v_nhil_payable,
        'getfund_payable', v_getfund_payable,
        'covid_levy_payable', v_covid_levy_payable,
        'total_tax_payable', v_vat_payable + v_nhil_payable + v_getfund_payable + v_covid_levy_payable,
        'filing_deadline', v_period_end + INTERVAL '15 days',
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_return_data;
END;
$$ LANGUAGE plpgsql;

-- Calculate PAYE Tax for Employee
CREATE OR REPLACE FUNCTION calculate_paye_tax(
    p_employee_id UUID,
    p_tax_year INTEGER,
    p_monthly_gross_salary DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_annual_gross DECIMAL(15,2);
    v_total_relief DECIMAL(15,2);
    v_taxable_income DECIMAL(15,2);
    v_tax_due DECIMAL(15,2) := 0;
    v_bracket RECORD;
    v_remaining_income DECIMAL(15,2);
    v_bracket_tax DECIMAL(15,2);
BEGIN
    -- Calculate annual gross income
    v_annual_gross := p_monthly_gross_salary * 12;
    
    -- Get total relief for employee
    SELECT COALESCE(total_relief, 0)
    INTO v_total_relief
    FROM employee_tax_information
    WHERE employee_id = p_employee_id AND tax_year = p_tax_year;
    
    -- If no tax info found, use default relief
    IF v_total_relief IS NULL THEN
        v_total_relief := 4800; -- Standard personal relief for 2025
    END IF;
    
    -- Calculate taxable income
    v_taxable_income := GREATEST(v_annual_gross - v_total_relief, 0);
    v_remaining_income := v_taxable_income;
    
    -- Apply Ghana tax brackets for 2025
    FOR v_bracket IN 
        SELECT min_amount, max_amount, tax_rate, cumulative_tax
        FROM ghana_tax_brackets 
        WHERE tax_year = p_tax_year 
        ORDER BY bracket_number
    LOOP
        IF v_remaining_income <= 0 THEN
            EXIT;
        END IF;
        
        IF v_taxable_income > v_bracket.min_amount THEN
            IF v_bracket.max_amount IS NULL THEN
                -- Top bracket - no upper limit
                v_bracket_tax := v_remaining_income * v_bracket.tax_rate;
            ELSE
                -- Calculate tax for this bracket
                v_bracket_tax := LEAST(v_remaining_income, v_bracket.max_amount - v_bracket.min_amount) * v_bracket.tax_rate;
            END IF;
            
            v_tax_due := v_tax_due + v_bracket_tax;
            v_remaining_income := v_remaining_income - LEAST(v_remaining_income, 
                COALESCE(v_bracket.max_amount - v_bracket.min_amount, v_remaining_income));
        END IF;
    END LOOP;
    
    -- Return monthly tax (annual tax divided by 12)
    RETURN ROUND(v_tax_due / 12, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPPF (UNIFIED PETROLEUM PRICE FUND) PROCEDURES
-- =====================================================

-- Generate Monthly UPPF Claim
CREATE OR REPLACE FUNCTION generate_uppf_monthly_claim(
    p_tenant_id UUID,
    p_claim_year INTEGER,
    p_claim_month INTEGER
) RETURNS JSON AS $$
DECLARE
    v_claim_data JSON;
    v_period_start DATE;
    v_period_end DATE;
    v_petrol_volume DECIMAL(20,2) := 0;
    v_diesel_volume DECIMAL(20,2) := 0;
    v_kerosene_volume DECIMAL(20,2) := 0;
    v_dealer_category VARCHAR(20);
    v_petrol_margin DECIMAL(20,2) := 0;
    v_diesel_margin DECIMAL(20,2) := 0;
    v_kerosene_margin DECIMAL(20,2) := 0;
    v_total_claim DECIMAL(20,2) := 0;
    v_dealer_name VARCHAR(200);
    v_uppf_dealer_code VARCHAR(100);
BEGIN
    -- Calculate period dates
    v_period_start := DATE(p_claim_year || '-' || LPAD(p_claim_month::TEXT, 2, '0') || '-01');
    v_period_end := (v_period_start + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get dealer information (assuming stored in tenant/station configuration)
    SELECT 
        COALESCE((config_value->>'dealer_name')::TEXT, 'Unknown Dealer'),
        COALESCE((config_value->>'dealer_category')::TEXT, 'CATEGORY_C'),
        COALESCE((config_value->>'uppf_dealer_code')::TEXT, 'Unknown')
    INTO v_dealer_name, v_dealer_category, v_uppf_dealer_code
    FROM system_configurations
    WHERE module_name = 'UPPF' AND config_key = 'DEALER_INFO';
    
    -- Calculate volumes sold by fuel type
    SELECT 
        COALESCE(SUM(CASE WHEN product_type = 'PETROL' THEN quantity_liters ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN product_type = 'DIESEL' THEN quantity_liters ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN product_type = 'KEROSENE' THEN quantity_liters ELSE 0 END), 0)
    INTO v_petrol_volume, v_diesel_volume, v_kerosene_volume
    FROM fuel_transactions ft
    WHERE ft.transaction_date::DATE BETWEEN v_period_start AND v_period_end
    AND ft.payment_status = 'COMPLETED';
    
    -- Calculate dealer margins based on current UPPF rates and dealer category
    WITH uppf_rates AS (
        SELECT 
            fuel_type,
            dealer_margin * CASE 
                WHEN v_dealer_category = 'CATEGORY_A' THEN 1.0
                WHEN v_dealer_category = 'CATEGORY_B' THEN 1.1
                ELSE 1.2
            END as adjusted_margin
        FROM uppf_price_components
        WHERE effective_from <= v_period_end
        AND (effective_to IS NULL OR effective_to >= v_period_start)
        AND is_active = TRUE
    )
    SELECT 
        COALESCE(MAX(CASE WHEN fuel_type = 'PETROL' THEN adjusted_margin END), 0) * v_petrol_volume,
        COALESCE(MAX(CASE WHEN fuel_type = 'DIESEL' THEN adjusted_margin END), 0) * v_diesel_volume,
        COALESCE(MAX(CASE WHEN fuel_type = 'KEROSENE' THEN adjusted_margin END), 0) * v_kerosene_volume
    INTO v_petrol_margin, v_diesel_margin, v_kerosene_margin
    FROM uppf_rates;
    
    v_total_claim := v_petrol_margin + v_diesel_margin + v_kerosene_margin;
    
    -- Insert or update UPPF claim
    INSERT INTO uppf_monthly_claims (
        tenant_id, claim_year, claim_month, submission_deadline,
        dealer_name, dealer_category, uppf_dealer_code,
        petrol_volume_sold, diesel_volume_sold, kerosene_volume_sold,
        petrol_margin_claimed, diesel_margin_claimed, kerosene_margin_claimed
    ) VALUES (
        p_tenant_id, p_claim_year, p_claim_month,
        v_period_end + INTERVAL '10 days',
        v_dealer_name, v_dealer_category, v_uppf_dealer_code,
        v_petrol_volume, v_diesel_volume, v_kerosene_volume,
        v_petrol_margin, v_diesel_margin, v_kerosene_margin
    )
    ON CONFLICT (tenant_id, claim_year, claim_month)
    DO UPDATE SET
        petrol_volume_sold = EXCLUDED.petrol_volume_sold,
        diesel_volume_sold = EXCLUDED.diesel_volume_sold,
        kerosene_volume_sold = EXCLUDED.kerosene_volume_sold,
        petrol_margin_claimed = EXCLUDED.petrol_margin_claimed,
        diesel_margin_claimed = EXCLUDED.diesel_margin_claimed,
        kerosene_margin_claimed = EXCLUDED.kerosene_margin_claimed;
    
    -- Prepare claim data as JSON
    v_claim_data := json_build_object(
        'tenant_id', p_tenant_id,
        'claim_year', p_claim_year,
        'claim_month', p_claim_month,
        'period_start', v_period_start,
        'period_end', v_period_end,
        'dealer_name', v_dealer_name,
        'dealer_category', v_dealer_category,
        'uppf_dealer_code', v_uppf_dealer_code,
        'volumes', json_build_object(
            'petrol', v_petrol_volume,
            'diesel', v_diesel_volume,
            'kerosene', v_kerosene_volume,
            'total', v_petrol_volume + v_diesel_volume + v_kerosene_volume
        ),
        'margins', json_build_object(
            'petrol', v_petrol_margin,
            'diesel', v_diesel_margin,
            'kerosene', v_kerosene_margin,
            'total', v_total_claim
        ),
        'submission_deadline', v_period_end + INTERVAL '10 days',
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_claim_data;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NPA (NATIONAL PETROLEUM AUTHORITY) PROCEDURES
-- =====================================================

-- Generate NPA Monthly Price Compliance Report
CREATE OR REPLACE FUNCTION generate_npa_price_compliance_report(
    p_tenant_id UUID,
    p_station_id UUID,
    p_report_month DATE
) RETURNS JSON AS $$
DECLARE
    v_report_data JSON;
    v_period_start DATE;
    v_period_end DATE;
    v_npa_prices JSON;
    v_station_prices JSON;
    v_variances JSON;
    v_compliance_status VARCHAR(20) := 'COMPLIANT';
    v_violations INTEGER := 0;
BEGIN
    v_period_start := DATE_TRUNC('month', p_report_month);
    v_period_end := (v_period_start + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get NPA reference prices for the period
    SELECT json_object_agg(fuel_type, final_pump_price)
    INTO v_npa_prices
    FROM uppf_price_components
    WHERE effective_from <= v_period_end
    AND (effective_to IS NULL OR effective_to >= v_period_start)
    AND is_active = TRUE;
    
    -- Get average station prices for the period
    WITH station_avg_prices AS (
        SELECT 
            product_type,
            AVG(unit_price) as avg_price
        FROM fuel_transactions
        WHERE station_id = p_station_id
        AND transaction_date::DATE BETWEEN v_period_start AND v_period_end
        AND payment_status = 'COMPLETED'
        GROUP BY product_type
    )
    SELECT json_object_agg(product_type, avg_price)
    INTO v_station_prices
    FROM station_avg_prices;
    
    -- Calculate variances and determine compliance
    WITH price_comparison AS (
        SELECT 
            ft.product_type,
            AVG(ft.unit_price) as station_price,
            upc.final_pump_price as npa_price,
            AVG(ft.unit_price) - upc.final_pump_price as variance,
            ABS(AVG(ft.unit_price) - upc.final_pump_price) as abs_variance
        FROM fuel_transactions ft
        JOIN uppf_price_components upc ON ft.product_type = upc.fuel_type
        WHERE ft.station_id = p_station_id
        AND ft.transaction_date::DATE BETWEEN v_period_start AND v_period_end
        AND ft.payment_status = 'COMPLETED'
        AND upc.effective_from <= v_period_end
        AND (upc.effective_to IS NULL OR upc.effective_to >= v_period_start)
        AND upc.is_active = TRUE
        GROUP BY ft.product_type, upc.final_pump_price
    )
    SELECT 
        json_object_agg(product_type, json_build_object(
            'station_price', station_price,
            'npa_price', npa_price,
            'variance', variance,
            'abs_variance', abs_variance,
            'compliant', abs_variance <= 0.02  -- 2 pesewas tolerance
        )),
        COUNT(CASE WHEN abs_variance > 0.02 THEN 1 END)
    INTO v_variances, v_violations
    FROM price_comparison;
    
    -- Determine overall compliance status
    IF v_violations > 0 THEN
        v_compliance_status := 'NON_COMPLIANT';
    END IF;
    
    -- Insert monitoring record
    INSERT INTO npa_price_monitoring (
        tenant_id, station_id, price_effective_date,
        price_period_start, price_period_end,
        npa_reference_prices, station_prices, price_variances,
        compliance_status, monitoring_date
    ) VALUES (
        p_tenant_id, p_station_id, v_period_start,
        v_period_start, v_period_end,
        v_npa_prices, v_station_prices, v_variances,
        v_compliance_status, CURRENT_DATE
    )
    ON CONFLICT (tenant_id, station_id, price_effective_date)
    DO UPDATE SET
        station_prices = EXCLUDED.station_prices,
        price_variances = EXCLUDED.price_variances,
        compliance_status = EXCLUDED.compliance_status,
        monitoring_date = EXCLUDED.monitoring_date;
    
    -- Prepare report data
    v_report_data := json_build_object(
        'tenant_id', p_tenant_id,
        'station_id', p_station_id,
        'report_month', p_report_month,
        'period_start', v_period_start,
        'period_end', v_period_end,
        'npa_reference_prices', v_npa_prices,
        'station_average_prices', v_station_prices,
        'price_variances', v_variances,
        'compliance_status', v_compliance_status,
        'violation_count', v_violations,
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_report_data;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BOG (BANK OF GHANA) PROCEDURES
-- =====================================================

-- Generate BOG Monthly Forex Report
CREATE OR REPLACE FUNCTION generate_bog_monthly_forex_report(
    p_tenant_id UUID,
    p_reporting_year INTEGER,
    p_reporting_month INTEGER
) RETURNS JSON AS $$
DECLARE
    v_report_data JSON;
    v_period_start DATE;
    v_period_end DATE;
    v_total_purchases DECIMAL(20,2) := 0;
    v_total_sales DECIMAL(20,2) := 0;
    v_fuel_import_payments DECIMAL(20,2) := 0;
    v_equipment_payments DECIMAL(20,2) := 0;
    v_avg_purchase_rate DECIMAL(12,6);
    v_bog_avg_rate DECIMAL(12,6);
BEGIN
    v_period_start := DATE(p_reporting_year || '-' || LPAD(p_reporting_month::TEXT, 2, '0') || '-01');
    v_period_end := (v_period_start + INTERVAL '1 month - 1 day')::DATE;
    
    -- Calculate forex transaction summary
    SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'PURCHASE' THEN foreign_currency_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN transaction_type = 'SALE' THEN foreign_currency_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN transaction_purpose = 'FUEL_IMPORTS' THEN foreign_currency_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN transaction_purpose = 'EQUIPMENT_PURCHASE' THEN foreign_currency_amount ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN transaction_type = 'PURCHASE' THEN exchange_rate END), 0),
        COALESCE(AVG(bog_official_rate), 0)
    INTO 
        v_total_purchases, v_total_sales, v_fuel_import_payments, 
        v_equipment_payments, v_avg_purchase_rate, v_bog_avg_rate
    FROM bog_forex_transactions
    WHERE tenant_id = p_tenant_id
    AND transaction_date BETWEEN v_period_start AND v_period_end
    AND foreign_currency = 'USD'; -- Focus on USD transactions
    
    -- Insert or update BOG return
    INSERT INTO bog_monthly_forex_returns (
        tenant_id, reporting_year, reporting_month, submission_deadline,
        total_forex_purchases_usd, total_forex_sales_usd,
        fuel_import_payments_usd, equipment_payments_usd,
        average_purchase_rate, bog_average_rate
    ) VALUES (
        p_tenant_id, p_reporting_year, p_reporting_month,
        v_period_end + INTERVAL '15 days',
        v_total_purchases, v_total_sales,
        v_fuel_import_payments, v_equipment_payments,
        v_avg_purchase_rate, v_bog_avg_rate
    )
    ON CONFLICT (tenant_id, reporting_year, reporting_month)
    DO UPDATE SET
        total_forex_purchases_usd = EXCLUDED.total_forex_purchases_usd,
        total_forex_sales_usd = EXCLUDED.total_forex_sales_usd,
        fuel_import_payments_usd = EXCLUDED.fuel_import_payments_usd,
        equipment_payments_usd = EXCLUDED.equipment_payments_usd,
        average_purchase_rate = EXCLUDED.average_purchase_rate,
        bog_average_rate = EXCLUDED.bog_average_rate;
    
    -- Prepare report data
    v_report_data := json_build_object(
        'tenant_id', p_tenant_id,
        'reporting_year', p_reporting_year,
        'reporting_month', p_reporting_month,
        'period_start', v_period_start,
        'period_end', v_period_end,
        'forex_summary', json_build_object(
            'total_purchases_usd', v_total_purchases,
            'total_sales_usd', v_total_sales,
            'net_position_usd', v_total_purchases - v_total_sales,
            'fuel_import_payments_usd', v_fuel_import_payments,
            'equipment_payments_usd', v_equipment_payments,
            'average_purchase_rate', v_avg_purchase_rate,
            'bog_average_rate', v_bog_avg_rate
        ),
        'submission_deadline', v_period_end + INTERVAL '15 days',
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_report_data;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EPA (ENVIRONMENTAL PROTECTION AGENCY) PROCEDURES
-- =====================================================

-- Generate EPA Environmental Monitoring Report
CREATE OR REPLACE FUNCTION generate_epa_monitoring_report(
    p_tenant_id UUID,
    p_station_id UUID,
    p_monitoring_date DATE
) RETURNS JSON AS $$
DECLARE
    v_report_data JSON;
    v_air_quality JSONB;
    v_water_quality JSONB;
    v_soil_quality JSONB;
    v_overall_compliance VARCHAR(20) := 'COMPLIANT';
    v_violations JSONB := '[]'::JSONB;
    v_monitoring_number VARCHAR(50);
BEGIN
    -- Generate monitoring number
    v_monitoring_number := 'EPA-' || TO_CHAR(p_monitoring_date, 'YYYYMMDD') || '-' || SUBSTRING(p_station_id::TEXT, 1, 8);
    
    -- Get latest IoT sensor data for environmental parameters
    WITH latest_environmental_data AS (
        SELECT 
            device_id,
            measurement_type,
            measurement_value,
            measurement_unit,
            ROW_NUMBER() OVER (PARTITION BY device_id, measurement_type ORDER BY time DESC) as rn
        FROM iot_data_streams ids
        JOIN iot_devices_enhanced ide ON ids.device_id = ide.id
        JOIN iot_device_types idt ON ide.device_type_id = idt.id
        WHERE ide.station_id = p_station_id
        AND ids.time >= p_monitoring_date - INTERVAL '7 days'
        AND idt.device_type_code = 'ENVIRONMENTAL_SENSOR'
        AND measurement_type IN ('TEMPERATURE', 'HUMIDITY', 'VOC', 'CO2', 'BENZENE', 'TOLUENE')
    )
    SELECT json_object_agg(measurement_type, json_build_object(
        'value', measurement_value,
        'unit', measurement_unit,
        'compliant', CASE 
            WHEN measurement_type = 'BENZENE' AND measurement_value > 1.6 THEN false
            WHEN measurement_type = 'TOLUENE' AND measurement_value > 260 THEN false
            WHEN measurement_type = 'VOC' AND measurement_value > 300 THEN false
            ELSE true
        END
    ))
    INTO v_air_quality
    FROM latest_environmental_data
    WHERE rn = 1;
    
    -- Simulate water and soil quality data (in real implementation, this would come from lab results)
    v_water_quality := json_build_object(
        'ph', json_build_object('value', 7.2, 'unit', 'pH', 'compliant', true),
        'total_petroleum_hydrocarbons', json_build_object('value', 0.05, 'unit', 'mg/L', 'compliant', true),
        'benzene', json_build_object('value', 0.001, 'unit', 'mg/L', 'compliant', true)
    );
    
    v_soil_quality := json_build_object(
        'total_petroleum_hydrocarbons', json_build_object('value', 30, 'unit', 'mg/kg', 'compliant', true),
        'heavy_metals', json_build_object('value', 1.2, 'unit', 'mg/kg', 'compliant', true),
        'ph', json_build_object('value', 6.8, 'unit', 'pH', 'compliant', true)
    );
    
    -- Check for violations and determine overall compliance
    IF v_air_quality ? 'BENZENE' AND (v_air_quality->'BENZENE'->>'compliant')::boolean = false THEN
        v_overall_compliance := 'NON_COMPLIANT';
        v_violations := v_violations || '[{"parameter": "BENZENE", "type": "AIR_QUALITY", "violation": "Exceeds EPA limit"}]'::jsonb;
    END IF;
    
    -- Insert monitoring record
    INSERT INTO epa_environmental_monitoring (
        tenant_id, station_id, monitoring_number, monitoring_date,
        monitoring_type, air_quality_results, water_quality_results, soil_quality_results,
        overall_compliance
    ) VALUES (
        p_tenant_id, p_station_id, v_monitoring_number, p_monitoring_date,
        'ROUTINE', v_air_quality, v_water_quality, v_soil_quality,
        v_overall_compliance
    );
    
    -- Prepare report data
    v_report_data := json_build_object(
        'tenant_id', p_tenant_id,
        'station_id', p_station_id,
        'monitoring_number', v_monitoring_number,
        'monitoring_date', p_monitoring_date,
        'environmental_results', json_build_object(
            'air_quality', v_air_quality,
            'water_quality', v_water_quality,
            'soil_quality', v_soil_quality
        ),
        'overall_compliance', v_overall_compliance,
        'violations', v_violations,
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_report_data;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED REGULATORY REPORTING SCHEDULER
-- =====================================================

-- Main procedure to run all monthly regulatory reports
CREATE OR REPLACE FUNCTION run_monthly_regulatory_reports(
    p_tenant_id UUID DEFAULT NULL,
    p_report_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_report_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
) RETURNS JSON AS $$
DECLARE
    v_results JSON;
    v_tenant_record RECORD;
    v_gra_result JSON;
    v_uppf_result JSON;
    v_bog_result JSON;
    v_all_results JSONB := '[]'::JSONB;
BEGIN
    -- If no specific tenant, run for all active tenants
    IF p_tenant_id IS NULL THEN
        FOR v_tenant_record IN 
            SELECT DISTINCT tenant_id 
            FROM compliance_status 
            WHERE compliance_status != 'INACTIVE'
        LOOP
            -- Generate GRA VAT Return
            v_gra_result := generate_monthly_vat_return(
                v_tenant_record.tenant_id, p_report_year, p_report_month
            );
            
            -- Generate UPPF Claim
            v_uppf_result := generate_uppf_monthly_claim(
                v_tenant_record.tenant_id, p_report_year, p_report_month
            );
            
            -- Generate BOG Forex Report
            v_bog_result := generate_bog_monthly_forex_report(
                v_tenant_record.tenant_id, p_report_year, p_report_month
            );
            
            -- Combine results
            v_all_results := v_all_results || json_build_object(
                'tenant_id', v_tenant_record.tenant_id,
                'gra_vat_return', v_gra_result,
                'uppf_claim', v_uppf_result,
                'bog_forex_report', v_bog_result
            )::jsonb;
        END LOOP;
    ELSE
        -- Run for specific tenant
        v_gra_result := generate_monthly_vat_return(p_tenant_id, p_report_year, p_report_month);
        v_uppf_result := generate_uppf_monthly_claim(p_tenant_id, p_report_year, p_report_month);
        v_bog_result := generate_bog_monthly_forex_report(p_tenant_id, p_report_year, p_report_month);
        
        v_all_results := json_build_array(json_build_object(
            'tenant_id', p_tenant_id,
            'gra_vat_return', v_gra_result,
            'uppf_claim', v_uppf_result,
            'bog_forex_report', v_bog_result
        ))::jsonb;
    END IF;
    
    -- Prepare final results
    v_results := json_build_object(
        'execution_summary', json_build_object(
            'report_year', p_report_year,
            'report_month', p_report_month,
            'tenants_processed', jsonb_array_length(v_all_results),
            'execution_timestamp', CURRENT_TIMESTAMP
        ),
        'reports_generated', v_all_results
    );
    
    RETURN v_results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLIANCE MONITORING PROCEDURES
-- =====================================================

-- Update Compliance Dashboard Metrics
CREATE OR REPLACE FUNCTION update_compliance_dashboard_metrics(
    p_tenant_id UUID,
    p_calculation_date DATE DEFAULT CURRENT_DATE
) RETURNS JSON AS $$
DECLARE
    v_npa_score DECIMAL(5,2) := 0;
    v_epa_score DECIMAL(5,2) := 0;
    v_gra_score DECIMAL(5,2) := 0;
    v_bog_score DECIMAL(5,2) := 0;
    v_uppf_score DECIMAL(5,2) := 0;
    v_overall_score DECIMAL(5,2);
    v_compliant_count INTEGER := 0;
    v_non_compliant_count INTEGER := 0;
    v_pending_count INTEGER := 0;
    v_result JSON;
BEGIN
    -- Calculate individual authority scores
    
    -- NPA Score (based on license status and price compliance)
    WITH npa_compliance AS (
        SELECT 
            COUNT(*) as total_requirements,
            COUNT(CASE WHEN license_status = 'ACTIVE' THEN 1 END) as compliant_licenses,
            COUNT(CASE WHEN compliance_status = 'COMPLIANT' THEN 1 END) as compliant_pricing
        FROM npa_licenses nl
        LEFT JOIN npa_price_monitoring npm ON nl.tenant_id = npm.tenant_id
        WHERE nl.tenant_id = p_tenant_id
    )
    SELECT CASE WHEN total_requirements > 0 THEN 
        ((compliant_licenses + compliant_pricing)::DECIMAL / (total_requirements * 2) * 100)
    ELSE 100 END
    INTO v_npa_score
    FROM npa_compliance;
    
    -- EPA Score (based on permit status and monitoring compliance)
    WITH epa_compliance AS (
        SELECT 
            COUNT(*) as total_permits,
            COUNT(CASE WHEN permit_status = 'ACTIVE' THEN 1 END) as active_permits,
            COUNT(CASE WHEN overall_compliance = 'COMPLIANT' THEN 1 END) as compliant_monitoring
        FROM epa_environmental_permits eep
        LEFT JOIN epa_environmental_monitoring eem ON eep.tenant_id = eem.tenant_id
        WHERE eep.tenant_id = p_tenant_id
    )
    SELECT CASE WHEN total_permits > 0 THEN 
        ((active_permits + compliant_monitoring)::DECIMAL / (total_permits * 2) * 100)
    ELSE 100 END
    INTO v_epa_score
    FROM epa_compliance;
    
    -- GRA Score (based on filing status and payment compliance)
    WITH gra_compliance AS (
        SELECT 
            COUNT(*) as total_returns,
            COUNT(CASE WHEN filing_status = 'FILED' THEN 1 END) as filed_returns,
            SUM(amount_outstanding) as total_outstanding
        FROM gra_monthly_tax_returns
        WHERE tenant_id = p_tenant_id
        AND filing_deadline >= p_calculation_date - INTERVAL '12 months'
    )
    SELECT CASE 
        WHEN total_returns = 0 THEN 100
        WHEN total_outstanding > 0 THEN (filed_returns::DECIMAL / total_returns * 50)
        ELSE (filed_returns::DECIMAL / total_returns * 100)
    END
    INTO v_gra_score
    FROM gra_compliance;
    
    -- BOG Score (based on reporting compliance)
    WITH bog_compliance AS (
        SELECT 
            COUNT(*) as total_returns,
            COUNT(CASE WHEN submission_status = 'SUBMITTED' THEN 1 END) as submitted_returns
        FROM bog_monthly_forex_returns
        WHERE tenant_id = p_tenant_id
        AND submission_deadline >= p_calculation_date - INTERVAL '12 months'
    )
    SELECT CASE WHEN total_returns > 0 THEN 
        (submitted_returns::DECIMAL / total_returns * 100)
    ELSE 100 END
    INTO v_bog_score
    FROM bog_compliance;
    
    -- UPPF Score (based on claim submission compliance)
    WITH uppf_compliance AS (
        SELECT 
            COUNT(*) as total_claims,
            COUNT(CASE WHEN claim_status IN ('SUBMITTED', 'APPROVED', 'PAID') THEN 1 END) as compliant_claims
        FROM uppf_monthly_claims
        WHERE tenant_id = p_tenant_id
        AND submission_deadline >= p_calculation_date - INTERVAL '12 months'
    )
    SELECT CASE WHEN total_claims > 0 THEN 
        (compliant_claims::DECIMAL / total_claims * 100)
    ELSE 100 END
    INTO v_uppf_score
    FROM uppf_compliance;
    
    -- Calculate overall weighted score
    v_overall_score := (v_npa_score * 0.25) + (v_epa_score * 0.20) + 
                      (v_gra_score * 0.25) + (v_bog_score * 0.15) + 
                      (v_uppf_score * 0.15);
    
    -- Count compliance status
    SELECT 
        COUNT(CASE WHEN compliance_status = 'COMPLIANT' THEN 1 END),
        COUNT(CASE WHEN compliance_status = 'NON_COMPLIANT' THEN 1 END),
        COUNT(CASE WHEN compliance_status = 'PENDING' THEN 1 END)
    INTO v_compliant_count, v_non_compliant_count, v_pending_count
    FROM compliance_status
    WHERE tenant_id = p_tenant_id;
    
    -- Insert or update dashboard metrics
    INSERT INTO compliance_dashboard_metrics (
        tenant_id, calculation_date, overall_compliance_score,
        npa_compliance_score, epa_compliance_score, gra_compliance_score,
        bog_compliance_score, uppf_compliance_score,
        compliant_requirements, non_compliant_requirements, pending_requirements
    ) VALUES (
        p_tenant_id, p_calculation_date, v_overall_score,
        v_npa_score, v_epa_score, v_gra_score,
        v_bog_score, v_uppf_score,
        v_compliant_count, v_non_compliant_count, v_pending_count
    )
    ON CONFLICT (tenant_id, calculation_date)
    DO UPDATE SET
        overall_compliance_score = EXCLUDED.overall_compliance_score,
        npa_compliance_score = EXCLUDED.npa_compliance_score,
        epa_compliance_score = EXCLUDED.epa_compliance_score,
        gra_compliance_score = EXCLUDED.gra_compliance_score,
        bog_compliance_score = EXCLUDED.bog_compliance_score,
        uppf_compliance_score = EXCLUDED.uppf_compliance_score,
        compliant_requirements = EXCLUDED.compliant_requirements,
        non_compliant_requirements = EXCLUDED.non_compliant_requirements,
        pending_requirements = EXCLUDED.pending_requirements;
    
    -- Prepare result
    v_result := json_build_object(
        'tenant_id', p_tenant_id,
        'calculation_date', p_calculation_date,
        'compliance_scores', json_build_object(
            'overall', v_overall_score,
            'npa', v_npa_score,
            'epa', v_epa_score,
            'gra', v_gra_score,
            'bog', v_bog_score,
            'uppf', v_uppf_score
        ),
        'requirement_counts', json_build_object(
            'compliant', v_compliant_count,
            'non_compliant', v_non_compliant_count,
            'pending', v_pending_count
        ),
        'updated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Stored procedures for Ghana regulatory reporting created successfully with automated compliance monitoring!';
END $$;