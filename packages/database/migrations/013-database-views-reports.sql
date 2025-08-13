-- =====================================================
-- DATABASE VIEWS FOR COMPLEX REPORTING QUERIES
-- Version: 1.0.0
-- Description: Comprehensive views for reporting, dashboards, and business intelligence
-- =====================================================

-- =====================================================
-- FINANCIAL REPORTING VIEWS
-- =====================================================

-- Comprehensive Trial Balance View
CREATE OR REPLACE VIEW v_trial_balance AS
SELECT 
    tb.period_id,
    ap.period_name,
    ap.start_date,
    ap.end_date,
    ap.fiscal_year,
    tb.account_code,
    coa.account_name,
    coa.account_type,
    coa.account_category,
    coa.normal_balance,
    tb.opening_debit,
    tb.opening_credit,
    tb.period_debit,
    tb.period_credit,
    tb.closing_debit,
    tb.closing_credit,
    -- Calculate net movement
    CASE 
        WHEN coa.normal_balance = 'DEBIT' THEN 
            (tb.closing_debit - tb.closing_credit) - (tb.opening_debit - tb.opening_credit)
        ELSE 
            (tb.closing_credit - tb.closing_debit) - (tb.opening_credit - tb.opening_debit)
    END AS net_movement,
    -- Calculate closing balance
    CASE 
        WHEN coa.normal_balance = 'DEBIT' THEN 
            tb.closing_debit - tb.closing_credit
        ELSE 
            tb.closing_credit - tb.closing_debit
    END AS closing_balance
FROM trial_balance_snapshots tb
JOIN accounting_periods ap ON tb.period_id = ap.id
JOIN chart_of_accounts coa ON tb.account_code = coa.account_code
WHERE coa.is_active = TRUE;

-- Profit and Loss Statement View
CREATE OR REPLACE VIEW v_profit_loss_statement AS
SELECT 
    ap.id AS period_id,
    ap.period_name,
    ap.start_date,
    ap.end_date,
    ap.fiscal_year,
    
    -- Revenue
    SUM(CASE WHEN coa.account_type = 'REVENUE' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) AS total_revenue,
    
    -- Cost of Sales
    SUM(CASE WHEN coa.account_category = 'EXPENSE' AND coa.account_code LIKE '5%' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS cost_of_sales,
    
    -- Gross Profit
    SUM(CASE WHEN coa.account_type = 'REVENUE' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) -
    SUM(CASE WHEN coa.account_category = 'EXPENSE' AND coa.account_code LIKE '5%' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS gross_profit,
    
    -- Operating Expenses
    SUM(CASE WHEN coa.account_category = 'EXPENSE' AND coa.account_code LIKE '6%' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS operating_expenses,
    
    -- Net Income
    SUM(CASE WHEN coa.account_type = 'REVENUE' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0)
    WHEN coa.account_type = 'EXPENSE' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0)
    ELSE 0 END) AS net_income
    
FROM accounting_periods ap
LEFT JOIN general_ledger gl ON ap.id = gl.period_id
LEFT JOIN chart_of_accounts coa ON gl.account_code = coa.account_code
WHERE ap.is_closed = FALSE
GROUP BY ap.id, ap.period_name, ap.start_date, ap.end_date, ap.fiscal_year;

-- Balance Sheet View
CREATE OR REPLACE VIEW v_balance_sheet AS
SELECT 
    ap.id AS period_id,
    ap.period_name,
    ap.end_date AS balance_sheet_date,
    ap.fiscal_year,
    
    -- Current Assets
    SUM(CASE WHEN coa.account_type = 'ASSET' AND coa.account_category = 'CURRENT_ASSET' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS current_assets,
    
    -- Fixed Assets
    SUM(CASE WHEN coa.account_type = 'ASSET' AND coa.account_category = 'FIXED_ASSET' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS fixed_assets,
    
    -- Total Assets
    SUM(CASE WHEN coa.account_type = 'ASSET' THEN 
        COALESCE(gl.debit_amount, 0) - COALESCE(gl.credit_amount, 0) ELSE 0 END) AS total_assets,
    
    -- Current Liabilities
    SUM(CASE WHEN coa.account_type = 'LIABILITY' AND coa.account_category = 'CURRENT_LIABILITY' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) AS current_liabilities,
    
    -- Long-term Liabilities
    SUM(CASE WHEN coa.account_type = 'LIABILITY' AND coa.account_category = 'LONG_TERM_LIABILITY' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) AS long_term_liabilities,
    
    -- Total Liabilities
    SUM(CASE WHEN coa.account_type = 'LIABILITY' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) AS total_liabilities,
    
    -- Equity
    SUM(CASE WHEN coa.account_type = 'EQUITY' THEN 
        COALESCE(gl.credit_amount, 0) - COALESCE(gl.debit_amount, 0) ELSE 0 END) AS total_equity
    
FROM accounting_periods ap
LEFT JOIN general_ledger gl ON ap.id = gl.period_id
LEFT JOIN chart_of_accounts coa ON gl.account_code = coa.account_code
GROUP BY ap.id, ap.period_name, ap.end_date, ap.fiscal_year;

-- =====================================================
-- SALES AND REVENUE REPORTING VIEWS
-- =====================================================

-- Daily Sales Summary View
CREATE OR REPLACE VIEW v_daily_sales_summary AS
SELECT 
    ft.transaction_date::DATE AS sales_date,
    s.id AS station_id,
    s.station_name,
    s.region,
    ft.product_type,
    pm.method_name AS payment_method,
    
    -- Volume Metrics
    COUNT(*) AS transaction_count,
    SUM(ft.quantity_liters) AS total_volume_liters,
    AVG(ft.quantity_liters) AS avg_volume_per_transaction,
    
    -- Revenue Metrics
    SUM(ft.total_amount) AS gross_revenue,
    SUM(ft.net_amount) AS net_revenue,
    SUM(ft.tax_amount) AS total_tax,
    SUM(ft.discount_amount) AS total_discounts,
    AVG(ft.unit_price) AS avg_unit_price,
    
    -- Customer Metrics
    COUNT(DISTINCT ft.customer_id) AS unique_customers,
    SUM(ft.loyalty_points_earned) AS loyalty_points_issued,
    SUM(ft.loyalty_points_redeemed) AS loyalty_points_redeemed
    
FROM fuel_transactions ft
JOIN stations s ON ft.station_id = s.id
LEFT JOIN payment_methods pm ON ft.payment_method_id = pm.id
WHERE ft.payment_status = 'COMPLETED'
GROUP BY 
    ft.transaction_date::DATE,
    s.id, s.station_name, s.region,
    ft.product_type,
    pm.method_name;

-- Customer Sales Analysis View
CREATE OR REPLACE VIEW v_customer_sales_analysis AS
SELECT 
    c.id AS customer_id,
    c.customer_code,
    c.company_name,
    c.customer_type,
    cc.category_name AS customer_category,
    c.loyalty_tier,
    
    -- Transaction Metrics (Last 12 Months)
    COUNT(ft.id) AS transactions_12m,
    SUM(ft.quantity_liters) AS volume_12m,
    SUM(ft.net_amount) AS revenue_12m,
    AVG(ft.net_amount) AS avg_transaction_value,
    
    -- Frequency Metrics
    EXTRACT(DAYS FROM (MAX(ft.transaction_date) - MIN(ft.transaction_date))) / 
        NULLIF(COUNT(ft.id) - 1, 0) AS avg_days_between_visits,
    MAX(ft.transaction_date) AS last_purchase_date,
    CURRENT_DATE - MAX(ft.transaction_date::DATE) AS days_since_last_purchase,
    
    -- Product Preferences
    MODE() WITHIN GROUP (ORDER BY ft.product_type) AS preferred_fuel_type,
    MODE() WITHIN GROUP (ORDER BY ft.station_id) AS preferred_station_id,
    MODE() WITHIN GROUP (ORDER BY ft.payment_method_id) AS preferred_payment_method,
    
    -- Profitability
    c.current_balance AS account_balance,
    c.credit_limit,
    c.loyalty_points,
    
    -- Risk Indicators
    CASE 
        WHEN CURRENT_DATE - MAX(ft.transaction_date::DATE) > 90 THEN 'HIGH'
        WHEN CURRENT_DATE - MAX(ft.transaction_date::DATE) > 30 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS churn_risk_level
    
FROM customers c
LEFT JOIN customer_categories cc ON c.category_id = cc.id
LEFT JOIN fuel_transactions ft ON c.id = ft.customer_id 
    AND ft.transaction_date >= CURRENT_DATE - INTERVAL '12 months'
    AND ft.payment_status = 'COMPLETED'
GROUP BY 
    c.id, c.customer_code, c.company_name, c.customer_type,
    cc.category_name, c.loyalty_tier, c.current_balance, 
    c.credit_limit, c.loyalty_points;

-- Monthly Revenue Trends View
CREATE OR REPLACE VIEW v_monthly_revenue_trends AS
SELECT 
    DATE_TRUNC('month', ft.transaction_date) AS revenue_month,
    s.id AS station_id,
    s.station_name,
    s.region,
    ft.product_type,
    
    -- Current Month Metrics
    SUM(ft.net_amount) AS monthly_revenue,
    SUM(ft.quantity_liters) AS monthly_volume,
    COUNT(*) AS monthly_transactions,
    COUNT(DISTINCT ft.customer_id) AS unique_customers,
    
    -- Growth Calculations (vs Previous Month)
    LAG(SUM(ft.net_amount), 1) OVER (
        PARTITION BY s.id, ft.product_type 
        ORDER BY DATE_TRUNC('month', ft.transaction_date)
    ) AS prev_month_revenue,
    
    -- Year-over-Year Comparison
    LAG(SUM(ft.net_amount), 12) OVER (
        PARTITION BY s.id, ft.product_type 
        ORDER BY DATE_TRUNC('month', ft.transaction_date)
    ) AS same_month_last_year_revenue
    
FROM fuel_transactions ft
JOIN stations s ON ft.station_id = s.id
WHERE ft.payment_status = 'COMPLETED'
GROUP BY 
    DATE_TRUNC('month', ft.transaction_date),
    s.id, s.station_name, s.region,
    ft.product_type;

-- =====================================================
-- INVENTORY REPORTING VIEWS
-- =====================================================

-- Current Inventory Status View
CREATE OR REPLACE VIEW v_current_inventory_status AS
SELECT 
    s.id AS station_id,
    s.station_name,
    s.region,
    p.id AS product_id,
    p.product_name,
    p.product_type,
    t.id AS tank_id,
    t.tank_name,
    t.capacity_liters AS tank_capacity,
    
    -- Current Stock Levels
    sl.current_quantity,
    sl.reserved_quantity,
    sl.available_quantity,
    
    -- Stock Level Percentages
    ROUND((sl.current_quantity / t.capacity_liters * 100), 2) AS fill_percentage,
    
    -- Stock Status Classification
    CASE 
        WHEN sl.current_quantity <= (p.minimum_stock * 0.5) THEN 'CRITICAL'
        WHEN sl.current_quantity <= p.minimum_stock THEN 'LOW'
        WHEN sl.current_quantity >= p.maximum_stock THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END AS stock_status,
    
    -- Reorder Information
    p.reorder_level,
    p.reorder_quantity,
    sl.days_of_stock,
    sl.average_daily_sales,
    
    -- Last Activity
    sl.last_receipt_date,
    sl.last_sale_date,
    CURRENT_DATE - sl.last_receipt_date AS days_since_receipt,
    CURRENT_DATE - sl.last_sale_date AS days_since_sale,
    
    -- Alert Status
    sl.reorder_alert_sent,
    sl.updated_at AS last_updated
    
FROM stock_levels sl
JOIN stations s ON sl.station_id = s.id
JOIN products p ON sl.product_id = p.id
JOIN tanks t ON sl.tank_id = t.id
WHERE s.is_active = TRUE AND p.is_active = TRUE;

-- Inventory Movement Analysis View
CREATE OR REPLACE VIEW v_inventory_movement_analysis AS
SELECT 
    DATE_TRUNC('month', im.movement_date) AS movement_month,
    s.station_name,
    p.product_name,
    im.movement_type,
    
    -- Movement Quantities
    SUM(CASE WHEN im.quantity > 0 THEN im.quantity ELSE 0 END) AS total_receipts,
    SUM(CASE WHEN im.quantity < 0 THEN ABS(im.quantity) ELSE 0 END) AS total_issues,
    SUM(im.quantity) AS net_movement,
    
    -- Movement Values
    SUM(CASE WHEN im.quantity > 0 THEN im.total_cost ELSE 0 END) AS receipts_value,
    SUM(CASE WHEN im.quantity < 0 THEN ABS(im.total_cost) ELSE 0 END) AS issues_value,
    
    -- Transaction Counts
    COUNT(*) AS movement_count,
    COUNT(CASE WHEN im.quantity > 0 THEN 1 END) AS receipt_count,
    COUNT(CASE WHEN im.quantity < 0 THEN 1 END) AS issue_count,
    
    -- Average Values
    AVG(CASE WHEN im.quantity > 0 THEN im.unit_cost END) AS avg_receipt_cost,
    AVG(CASE WHEN im.quantity < 0 THEN im.unit_cost END) AS avg_issue_cost
    
FROM inventory_movements im
JOIN stations s ON im.station_id = s.id
JOIN products p ON im.product_id = p.id
GROUP BY 
    DATE_TRUNC('month', im.movement_date),
    s.station_name,
    p.product_name,
    im.movement_type;

-- Stock Aging Analysis View
CREATE OR REPLACE VIEW v_stock_aging_analysis AS
SELECT 
    s.station_name,
    p.product_name,
    t.tank_name,
    sl.current_quantity,
    
    -- Aging Buckets based on last receipt
    CASE 
        WHEN sl.last_receipt_date >= CURRENT_DATE - INTERVAL '30 days' THEN '0-30 Days'
        WHEN sl.last_receipt_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 Days'
        WHEN sl.last_receipt_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 Days'
        WHEN sl.last_receipt_date >= CURRENT_DATE - INTERVAL '180 days' THEN '91-180 Days'
        ELSE 'Over 180 Days'
    END AS aging_bucket,
    
    CURRENT_DATE - sl.last_receipt_date AS days_since_receipt,
    sl.last_receipt_date,
    sl.average_daily_sales,
    
    -- Calculate estimated value using FIFO assumption
    sl.current_quantity * 
    COALESCE((
        SELECT AVG(sri.unit_cost) 
        FROM stock_receipt_items sri 
        JOIN stock_receipts sr ON sri.receipt_id = sr.id
        WHERE sr.station_id = sl.station_id 
        AND sri.product_id = sl.product_id
        AND sr.receipt_date >= CURRENT_DATE - INTERVAL '90 days'
    ), 0) AS estimated_value
    
FROM stock_levels sl
JOIN stations s ON sl.station_id = s.id
JOIN products p ON sl.product_id = p.id
JOIN tanks t ON sl.tank_id = t.id
WHERE sl.current_quantity > 0;

-- =====================================================
-- HUMAN RESOURCES REPORTING VIEWS
-- =====================================================

-- Employee Summary Dashboard View
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT 
    d.department_name,
    jp.position_title,
    ec.category_name AS employee_category,
    
    -- Employee Counts
    COUNT(*) AS total_employees,
    COUNT(CASE WHEN e.employment_status = 'ACTIVE' THEN 1 END) AS active_employees,
    COUNT(CASE WHEN e.employment_status = 'SUSPENDED' THEN 1 END) AS suspended_employees,
    COUNT(CASE WHEN e.employment_status = 'TERMINATED' THEN 1 END) AS terminated_employees,
    
    -- Employment Type Breakdown
    COUNT(CASE WHEN e.employment_type = 'PERMANENT' THEN 1 END) AS permanent_employees,
    COUNT(CASE WHEN e.employment_type = 'CONTRACT' THEN 1 END) AS contract_employees,
    COUNT(CASE WHEN e.employment_type = 'CASUAL' THEN 1 END) AS casual_employees,
    
    -- Demographics
    COUNT(CASE WHEN e.gender = 'MALE' THEN 1 END) AS male_count,
    COUNT(CASE WHEN e.gender = 'FEMALE' THEN 1 END) AS female_count,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(e.date_of_birth))), 1) AS average_age,
    
    -- Tenure Analysis
    ROUND(AVG(EXTRACT(YEAR FROM AGE(e.hire_date))), 1) AS average_tenure_years,
    COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END) AS new_hires_ytd,
    
    -- Compensation
    AVG(e.basic_salary) AS average_salary,
    MIN(e.basic_salary) AS min_salary,
    MAX(e.basic_salary) AS max_salary
    
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN job_positions jp ON e.position_id = jp.id
LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
GROUP BY d.department_name, jp.position_title, ec.category_name;

-- Payroll Summary View
CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT 
    pp.period_name,
    pp.period_start_date,
    pp.period_end_date,
    d.department_name,
    
    -- Employee Counts
    COUNT(ep.id) AS employees_paid,
    
    -- Gross Pay Summary
    SUM(ep.gross_earnings) AS total_gross_pay,
    AVG(ep.gross_earnings) AS average_gross_pay,
    
    -- Deductions Summary
    SUM(ep.total_deductions) AS total_deductions,
    SUM(ep.paye_tax) AS total_paye_tax,
    SUM(ep.ssnit_employee) AS total_ssnit_employee,
    SUM(ep.tier3_pension) AS total_tier3_pension,
    
    -- Employer Contributions
    SUM(ep.ssnit_employer) AS total_ssnit_employer,
    SUM(ep.employer_contributions) AS total_employer_contributions,
    
    -- Net Pay
    SUM(ep.net_pay) AS total_net_pay,
    AVG(ep.net_pay) AS average_net_pay,
    
    -- Total Employment Cost
    SUM(ep.gross_earnings + ep.employer_contributions) AS total_employment_cost
    
FROM employee_payrolls ep
JOIN payroll_periods pp ON ep.payroll_period_id = pp.id
JOIN employees e ON ep.employee_id = e.id
JOIN departments d ON e.department_id = d.id
GROUP BY 
    pp.id, pp.period_name, pp.period_start_date, pp.period_end_date,
    d.department_name;

-- Leave Analysis View
CREATE OR REPLACE VIEW v_leave_analysis AS
SELECT 
    e.employee_number,
    e.first_name || ' ' || e.last_name AS employee_name,
    d.department_name,
    lt.leave_name,
    
    -- Leave Balance Information
    elb.leave_year,
    elb.opening_balance,
    elb.accrued_balance,
    elb.used_balance,
    elb.current_balance,
    
    -- Leave Usage This Year
    COUNT(la.id) AS leave_applications_ytd,
    SUM(CASE WHEN la.status = 'APPROVED' THEN la.total_days ELSE 0 END) AS approved_days_ytd,
    SUM(CASE WHEN la.status = 'PENDING' THEN la.total_days ELSE 0 END) AS pending_days,
    
    -- Leave Patterns
    AVG(la.total_days) AS avg_leave_duration,
    MAX(la.end_date) AS last_leave_date,
    
    -- Balance Utilization
    CASE 
        WHEN elb.opening_balance + elb.accrued_balance = 0 THEN 0
        ELSE ROUND((elb.used_balance / (elb.opening_balance + elb.accrued_balance) * 100), 2)
    END AS utilization_percentage
    
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN employee_leave_balances elb ON e.id = elb.employee_id
JOIN leave_types lt ON elb.leave_type_id = lt.id
LEFT JOIN leave_applications la ON e.id = la.employee_id 
    AND elb.leave_type_id = la.leave_type_id
    AND la.application_date >= DATE_TRUNC('year', CURRENT_DATE)
WHERE e.employment_status = 'ACTIVE'
GROUP BY 
    e.id, e.employee_number, e.first_name, e.last_name,
    d.department_name, lt.leave_name,
    elb.leave_year, elb.opening_balance, elb.accrued_balance, 
    elb.used_balance, elb.current_balance;

-- =====================================================
-- COMPLIANCE REPORTING VIEWS
-- =====================================================

-- Compliance Status Dashboard
CREATE OR REPLACE VIEW v_compliance_status_dashboard AS
SELECT 
    ra.authority_name,
    cr.requirement_title,
    cr.compliance_frequency,
    cs.compliance_status,
    cs.current_compliance_score,
    cs.next_assessment_due,
    cs.last_assessment_date,
    
    -- Risk Assessment
    CASE 
        WHEN cs.next_assessment_due < CURRENT_DATE THEN 'OVERDUE'
        WHEN cs.next_assessment_due <= CURRENT_DATE + INTERVAL '30 days' THEN 'DUE_SOON'
        WHEN cs.compliance_status = 'NON_COMPLIANT' THEN 'NON_COMPLIANT'
        ELSE 'COMPLIANT'
    END AS risk_status,
    
    -- Days to Next Assessment
    cs.next_assessment_due - CURRENT_DATE AS days_to_assessment,
    
    -- Violation History
    cs.violation_count_ytd,
    cs.last_violation_date
    
FROM compliance_status cs
JOIN compliance_requirements cr ON cs.compliance_requirement_id = cr.id
JOIN regulatory_authorities ra ON cr.regulatory_authority_id = ra.id
WHERE cr.is_active = TRUE;

-- Ghana Tax Compliance Summary
CREATE OR REPLACE VIEW v_ghana_tax_compliance AS
SELECT 
    gtr.tax_year,
    gtr.tax_month,
    gtr.return_type,
    
    -- Filing Status
    COUNT(*) AS total_returns,
    COUNT(CASE WHEN gtr.filing_status = 'FILED' THEN 1 END) AS filed_returns,
    COUNT(CASE WHEN gtr.filing_status = 'OVERDUE' THEN 1 END) AS overdue_returns,
    
    -- Financial Summary
    SUM(gtr.gross_revenue) AS total_gross_revenue,
    SUM(gtr.taxable_revenue) AS total_taxable_revenue,
    SUM(gtr.total_tax_payable) AS total_tax_payable,
    SUM(gtr.payment_made) AS total_payments_made,
    SUM(gtr.amount_outstanding) AS total_outstanding,
    
    -- Compliance Metrics
    SUM(gtr.penalty_amount) AS total_penalties,
    SUM(gtr.interest_charged) AS total_interest,
    AVG(gtr.overdue_days) AS avg_overdue_days
    
FROM gra_monthly_tax_returns gtr
GROUP BY gtr.tax_year, gtr.tax_month, gtr.return_type;

-- =====================================================
-- OPERATIONAL ANALYTICS VIEWS
-- =====================================================

-- Station Performance Dashboard
CREATE OR REPLACE VIEW v_station_performance AS
SELECT 
    s.id AS station_id,
    s.station_name,
    s.region,
    s.station_type,
    
    -- Sales Performance (Last 30 Days)
    COUNT(ft.id) AS transactions_30d,
    SUM(ft.quantity_liters) AS volume_30d,
    SUM(ft.net_amount) AS revenue_30d,
    COUNT(DISTINCT ft.customer_id) AS unique_customers_30d,
    
    -- Average Metrics
    AVG(ft.net_amount) AS avg_transaction_value,
    AVG(ft.quantity_liters) AS avg_transaction_volume,
    
    -- Operational Metrics
    COUNT(DISTINCT DATE(ft.transaction_date)) AS operating_days_30d,
    SUM(ft.net_amount) / NULLIF(COUNT(DISTINCT DATE(ft.transaction_date)), 0) AS avg_daily_revenue,
    
    -- Product Mix
    SUM(CASE WHEN ft.product_type = 'PETROL' THEN ft.quantity_liters ELSE 0 END) AS petrol_volume,
    SUM(CASE WHEN ft.product_type = 'DIESEL' THEN ft.quantity_liters ELSE 0 END) AS diesel_volume,
    
    -- Customer Segments
    COUNT(CASE WHEN c.customer_type = 'INDIVIDUAL' THEN ft.id END) AS individual_transactions,
    COUNT(CASE WHEN c.customer_type = 'CORPORATE' THEN ft.id END) AS corporate_transactions,
    
    -- Payment Methods
    COUNT(CASE WHEN pm.method_type = 'CASH' THEN ft.id END) AS cash_transactions,
    COUNT(CASE WHEN pm.method_type = 'MOBILE_MONEY' THEN ft.id END) AS mobile_money_transactions,
    COUNT(CASE WHEN pm.method_type = 'CARD' THEN ft.id END) AS card_transactions
    
FROM stations s
LEFT JOIN fuel_transactions ft ON s.id = ft.station_id 
    AND ft.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    AND ft.payment_status = 'COMPLETED'
LEFT JOIN customers c ON ft.customer_id = c.id
LEFT JOIN payment_methods pm ON ft.payment_method_id = pm.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.station_name, s.region, s.station_type;

-- IoT Device Status Summary
CREATE OR REPLACE VIEW v_iot_device_status AS
SELECT 
    s.station_name,
    idt.device_type_name,
    
    -- Device Counts
    COUNT(iod.id) AS total_devices,
    COUNT(CASE WHEN iod.device_status = 'ACTIVE' THEN 1 END) AS active_devices,
    COUNT(CASE WHEN iod.device_status = 'OFFLINE' THEN 1 END) AS offline_devices,
    COUNT(CASE WHEN iod.device_status = 'FAULTY' THEN 1 END) AS faulty_devices,
    COUNT(CASE WHEN iod.device_status = 'MAINTENANCE' THEN 1 END) AS maintenance_devices,
    
    -- Performance Metrics
    AVG(iod.uptime_percentage) AS avg_uptime,
    AVG(iod.data_quality_score) AS avg_data_quality,
    AVG(iod.battery_level_percentage) AS avg_battery_level,
    
    -- Alert Metrics
    SUM(iod.alert_count_ytd) AS total_alerts_ytd,
    
    -- Communication Status
    COUNT(CASE WHEN iod.last_communication_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) AS devices_online_1h,
    COUNT(CASE WHEN iod.last_communication_at < CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) AS devices_offline_24h,
    
    -- Maintenance Status
    COUNT(CASE WHEN iod.next_maintenance_due <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) AS maintenance_due_30d,
    COUNT(CASE WHEN iod.calibration_due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) AS calibration_due_30d
    
FROM iot_devices_enhanced iod
JOIN iot_device_types idt ON iod.device_type_id = idt.id
LEFT JOIN stations s ON iod.station_id = s.id
GROUP BY s.station_name, idt.device_type_name;

-- =====================================================
-- EXECUTIVE DASHBOARD VIEWS
-- =====================================================

-- Executive Summary Dashboard
CREATE OR REPLACE VIEW v_executive_dashboard AS
SELECT 
    CURRENT_DATE AS dashboard_date,
    
    -- Today's Performance
    (SELECT COUNT(*) FROM fuel_transactions 
     WHERE transaction_date::DATE = CURRENT_DATE AND payment_status = 'COMPLETED') AS today_transactions,
    (SELECT SUM(net_amount) FROM fuel_transactions 
     WHERE transaction_date::DATE = CURRENT_DATE AND payment_status = 'COMPLETED') AS today_revenue,
    (SELECT SUM(quantity_liters) FROM fuel_transactions 
     WHERE transaction_date::DATE = CURRENT_DATE AND payment_status = 'COMPLETED') AS today_volume,
    
    -- Month-to-Date Performance
    (SELECT COUNT(*) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'COMPLETED') AS mtd_transactions,
    (SELECT SUM(net_amount) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'COMPLETED') AS mtd_revenue,
    (SELECT SUM(quantity_liters) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'COMPLETED') AS mtd_volume,
    
    -- Year-to-Date Performance
    (SELECT COUNT(*) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('year', CURRENT_DATE) AND payment_status = 'COMPLETED') AS ytd_transactions,
    (SELECT SUM(net_amount) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('year', CURRENT_DATE) AND payment_status = 'COMPLETED') AS ytd_revenue,
    (SELECT SUM(quantity_liters) FROM fuel_transactions 
     WHERE transaction_date >= DATE_TRUNC('year', CURRENT_DATE) AND payment_status = 'COMPLETED') AS ytd_volume,
    
    -- Active Entities
    (SELECT COUNT(*) FROM stations WHERE is_active = TRUE) AS active_stations,
    (SELECT COUNT(*) FROM customers WHERE is_active = TRUE) AS active_customers,
    (SELECT COUNT(*) FROM employees WHERE employment_status = 'ACTIVE') AS active_employees,
    
    -- Compliance Status
    (SELECT COUNT(*) FROM compliance_status WHERE compliance_status = 'COMPLIANT') AS compliant_requirements,
    (SELECT COUNT(*) FROM compliance_status WHERE compliance_status = 'NON_COMPLIANT') AS non_compliant_requirements,
    (SELECT COUNT(*) FROM compliance_status WHERE next_assessment_due <= CURRENT_DATE + INTERVAL '30 days') AS assessments_due_30d,
    
    -- Inventory Alerts
    (SELECT COUNT(*) FROM stock_levels sl JOIN products p ON sl.product_id = p.id 
     WHERE sl.current_quantity <= p.minimum_stock) AS low_stock_alerts,
    (SELECT COUNT(*) FROM iot_alerts WHERE alert_status = 'ACTIVE' AND severity IN ('CRITICAL', 'EMERGENCY')) AS critical_iot_alerts;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database views for complex reporting created successfully with comprehensive business intelligence!';
END $$;