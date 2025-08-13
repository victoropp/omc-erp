-- =====================================================
-- TECHNOLOGY, IOT AND ANALYTICS SYSTEM
-- Version: 1.0.0
-- Description: Complete IoT monitoring, analytics, business intelligence, and technology management
-- =====================================================

-- =====================================================
-- IOT DEVICE MANAGEMENT (Enhanced)
-- =====================================================

-- IoT Device Types
CREATE TABLE IF NOT EXISTS iot_device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_code VARCHAR(20) UNIQUE NOT NULL,
    device_type_name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    description TEXT,
    
    -- Technical Specifications
    communication_protocol VARCHAR(50), -- 'LORAWAN', 'WIFI', 'CELLULAR', 'ZIGBEE', 'BLUETOOTH'
    power_source VARCHAR(50), -- 'BATTERY', 'SOLAR', 'MAINS', 'HYBRID'
    operating_temperature_min DECIMAL(5, 2),
    operating_temperature_max DECIMAL(5, 2),
    ip_rating VARCHAR(10), -- IP65, IP67, etc.
    
    -- Data Specifications
    measurement_parameters JSONB, -- ['TEMPERATURE', 'PRESSURE', 'LEVEL', 'FLOW', 'VIBRATION']
    measurement_units JSONB, -- {'TEMPERATURE': 'CELSIUS', 'PRESSURE': 'BAR'}
    measurement_ranges JSONB, -- {'TEMPERATURE': {'min': -40, 'max': 125}}
    data_transmission_frequency INTEGER, -- seconds between transmissions
    
    -- Lifecycle Information
    typical_lifespan_years INTEGER,
    maintenance_interval_months INTEGER,
    calibration_interval_months INTEGER,
    
    -- Cost Information
    unit_cost DECIMAL(15, 2),
    installation_cost DECIMAL(15, 2),
    annual_maintenance_cost DECIMAL(15, 2),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- IoT Devices (Enhanced from existing)
CREATE TABLE IF NOT EXISTS iot_devices_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(100) UNIQUE NOT NULL,
    device_type_id UUID NOT NULL REFERENCES iot_device_types(id),
    
    -- Device Identity
    device_name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(200) UNIQUE,
    mac_address VARCHAR(17),
    imei VARCHAR(15), -- For cellular devices
    device_key VARCHAR(500), -- Encryption key for secure communication
    
    -- Installation Details
    station_id UUID REFERENCES stations(id),
    tank_id UUID REFERENCES tanks(id),
    pump_id UUID REFERENCES pumps(id),
    installation_location VARCHAR(200),
    installation_date DATE,
    installer_name VARCHAR(200),
    
    -- Network Configuration
    ip_address INET,
    gateway_id UUID REFERENCES iot_devices_enhanced(id), -- Reference to gateway device
    network_id VARCHAR(100),
    
    -- Device Configuration
    firmware_version VARCHAR(50),
    configuration_parameters JSONB,
    calibration_parameters JSONB,
    alert_thresholds JSONB,
    data_collection_interval INTEGER DEFAULT 300, -- seconds
    
    -- Status and Health
    device_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY', 'OFFLINE'
    last_communication_at TIMESTAMPTZ,
    signal_strength INTEGER, -- RSSI or signal quality indicator
    battery_level_percentage INTEGER,
    
    -- Maintenance
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    calibration_due_date DATE,
    warranty_expiry_date DATE,
    
    -- Monitoring
    uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
    data_quality_score DECIMAL(5, 2) DEFAULT 100.00, -- Based on data validation
    alert_count_ytd INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_iot_device_code (device_code),
    INDEX idx_iot_device_type (device_type_id),
    INDEX idx_iot_device_station (station_id),
    INDEX idx_iot_device_status (device_status),
    INDEX idx_iot_device_tank (tank_id),
    INDEX idx_iot_device_pump (pump_id)
);

-- IoT Data Streams (Time-series data)
CREATE TABLE IF NOT EXISTS iot_data_streams (
    time TIMESTAMPTZ NOT NULL,
    device_id UUID NOT NULL REFERENCES iot_devices_enhanced(id),
    
    -- Measurement Data
    measurement_type VARCHAR(50) NOT NULL, -- 'TEMPERATURE', 'LEVEL', 'PRESSURE', 'FLOW', 'VIBRATION'
    measurement_value DECIMAL(15, 6) NOT NULL,
    measurement_unit VARCHAR(20),
    
    -- Data Quality
    data_quality VARCHAR(20) DEFAULT 'GOOD', -- 'GOOD', 'QUESTIONABLE', 'BAD', 'SUBSTITUTED'
    data_source VARCHAR(50) DEFAULT 'SENSOR', -- 'SENSOR', 'CALCULATED', 'MANUAL', 'ESTIMATED'
    validation_status VARCHAR(20) DEFAULT 'VALID', -- 'VALID', 'INVALID', 'PENDING'
    
    -- Context Information
    station_id UUID,
    tank_id UUID,
    pump_id UUID,
    
    -- Device Status at Time of Reading
    device_battery_level INTEGER,
    device_signal_strength INTEGER,
    device_temperature DECIMAL(5, 2),
    
    -- Alerts and Anomalies
    alert_triggered BOOLEAN DEFAULT FALSE,
    alert_type VARCHAR(50),
    anomaly_detected BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(5, 2),
    
    -- Processing Information
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    processing_flags JSONB,
    
    PRIMARY KEY (time, device_id, measurement_type)
);

-- Create hypertable for time-series data (TimescaleDB extension)
-- SELECT create_hypertable('iot_data_streams', 'time', 'device_id', 4);

-- IoT Alerts and Notifications
CREATE TABLE IF NOT EXISTS iot_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_number VARCHAR(50) UNIQUE NOT NULL,
    device_id UUID NOT NULL REFERENCES iot_devices_enhanced(id),
    
    -- Alert Details
    alert_timestamp TIMESTAMPTZ NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'THRESHOLD_EXCEEDED', 'DEVICE_OFFLINE', 'BATTERY_LOW', 'COMMUNICATION_FAILURE'
    severity VARCHAR(20) NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT,
    
    -- Context Information
    station_id UUID,
    tank_id UUID,
    pump_id UUID,
    measurement_type VARCHAR(50),
    trigger_value DECIMAL(15, 6),
    threshold_value DECIMAL(15, 6),
    
    -- Alert Rules
    alert_rule_id UUID,
    rule_condition TEXT,
    consecutive_violations INTEGER DEFAULT 1,
    
    -- Status and Response
    alert_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalation_level INTEGER DEFAULT 1,
    escalated_to UUID REFERENCES users(id),
    escalated_at TIMESTAMPTZ,
    
    -- Notifications Sent
    notifications_sent JSONB, -- ['EMAIL', 'SMS', 'PUSH'] with timestamps
    
    -- Related Incidents
    incident_id UUID, -- Reference to maintenance or operational incident
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_iot_alert_number (alert_number),
    INDEX idx_iot_alert_device (device_id),
    INDEX idx_iot_alert_timestamp (alert_timestamp),
    INDEX idx_iot_alert_status (alert_status),
    INDEX idx_iot_alert_severity (severity),
    INDEX idx_iot_alert_station (station_id)
);

-- =====================================================
-- BUSINESS INTELLIGENCE AND ANALYTICS
-- =====================================================

-- Analytics Data Marts
CREATE TABLE IF NOT EXISTS analytics_data_marts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mart_name VARCHAR(100) UNIQUE NOT NULL,
    mart_description TEXT,
    
    -- Data Source Configuration
    source_tables JSONB, -- Tables included in this mart
    refresh_frequency VARCHAR(50), -- 'REAL_TIME', 'HOURLY', 'DAILY', 'WEEKLY'
    last_refresh_time TIMESTAMPTZ,
    next_refresh_time TIMESTAMPTZ,
    
    -- Data Retention
    retention_period_days INTEGER,
    archival_enabled BOOLEAN DEFAULT FALSE,
    
    -- Performance
    row_count BIGINT DEFAULT 0,
    size_mb DECIMAL(10, 2) DEFAULT 0,
    avg_query_time_ms INTEGER,
    
    -- Access Control
    access_roles JSONB, -- Roles that can access this mart
    security_classification VARCHAR(20), -- 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL'
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sales Analytics (Aggregated daily sales data)
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL,
    
    -- Dimensions
    tenant_id UUID NOT NULL,
    station_id UUID REFERENCES stations(id),
    customer_id UUID REFERENCES customers(id),
    product_type VARCHAR(50),
    payment_method VARCHAR(50),
    customer_segment VARCHAR(50),
    
    -- Time Dimensions
    year INTEGER,
    quarter INTEGER,
    month INTEGER,
    week_of_year INTEGER,
    day_of_week INTEGER,
    day_of_month INTEGER,
    
    -- Volume Metrics
    total_transactions INTEGER DEFAULT 0,
    total_quantity_liters DECIMAL(20, 2) DEFAULT 0,
    avg_quantity_per_transaction DECIMAL(10, 2) DEFAULT 0,
    
    -- Revenue Metrics
    gross_revenue DECIMAL(20, 2) DEFAULT 0,
    net_revenue DECIMAL(20, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    avg_revenue_per_transaction DECIMAL(15, 2) DEFAULT 0,
    avg_revenue_per_liter DECIMAL(10, 4) DEFAULT 0,
    
    -- Customer Metrics
    unique_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    loyalty_points_issued INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,
    
    -- Operational Metrics
    peak_hour_transactions INTEGER DEFAULT 0,
    peak_hour VARCHAR(20),
    average_queue_time_minutes DECIMAL(6, 2),
    pump_utilization_percentage DECIMAL(5, 2),
    
    -- Profitability Metrics
    cost_of_goods_sold DECIMAL(20, 2) DEFAULT 0,
    gross_profit DECIMAL(20, 2) DEFAULT 0,
    gross_margin_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Comparative Metrics
    previous_day_revenue DECIMAL(20, 2),
    revenue_growth_percentage DECIMAL(5, 2),
    previous_month_same_day_revenue DECIMAL(20, 2),
    month_over_month_growth DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_date, tenant_id, station_id, customer_id, product_type, payment_method),
    INDEX idx_sales_analytics_date (analysis_date),
    INDEX idx_sales_analytics_station (station_id),
    INDEX idx_sales_analytics_customer (customer_id),
    INDEX idx_sales_analytics_product (product_type),
    INDEX idx_sales_analytics_time_dims (year, quarter, month)
);

-- Inventory Analytics
CREATE TABLE IF NOT EXISTS inventory_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL,
    
    -- Dimensions
    tenant_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES stations(id),
    product_id UUID NOT NULL REFERENCES products(id),
    tank_id UUID REFERENCES tanks(id),
    
    -- Inventory Levels
    opening_stock_liters DECIMAL(20, 2) NOT NULL,
    receipts_liters DECIMAL(20, 2) DEFAULT 0,
    sales_liters DECIMAL(20, 2) DEFAULT 0,
    adjustments_liters DECIMAL(20, 2) DEFAULT 0,
    closing_stock_liters DECIMAL(20, 2) NOT NULL,
    
    -- Inventory Values
    opening_stock_value DECIMAL(20, 2) NOT NULL,
    receipts_value DECIMAL(20, 2) DEFAULT 0,
    cost_of_sales DECIMAL(20, 2) DEFAULT 0,
    closing_stock_value DECIMAL(20, 2) NOT NULL,
    
    -- Inventory Metrics
    days_of_stock DECIMAL(8, 2), -- Days of inventory remaining
    inventory_turnover DECIMAL(8, 4), -- Annual turnover rate
    stock_out_hours INTEGER DEFAULT 0, -- Hours when stock was zero
    overstock_liters DECIMAL(20, 2) DEFAULT 0, -- Stock above maximum level
    
    -- Efficiency Metrics
    demand_forecast_accuracy DECIMAL(5, 2), -- Percentage
    stock_level_variance DECIMAL(20, 2), -- Difference from target stock
    carrying_cost DECIMAL(15, 2), -- Estimated carrying cost
    
    -- Loss and Shrinkage
    shrinkage_liters DECIMAL(15, 2) DEFAULT 0,
    shrinkage_percentage DECIMAL(5, 4) DEFAULT 0,
    evaporation_loss_liters DECIMAL(15, 2) DEFAULT 0,
    spillage_loss_liters DECIMAL(15, 2) DEFAULT 0,
    
    -- Quality Metrics
    quality_test_results JSONB,
    contamination_incidents INTEGER DEFAULT 0,
    
    -- Supplier Performance
    supplier_id UUID REFERENCES suppliers(id),
    delivery_timeliness_score DECIMAL(5, 2),
    quality_score DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_date, tenant_id, station_id, product_id, tank_id),
    INDEX idx_inventory_analytics_date (analysis_date),
    INDEX idx_inventory_analytics_station (station_id),
    INDEX idx_inventory_analytics_product (product_id),
    INDEX idx_inventory_analytics_supplier (supplier_id)
);

-- Customer Analytics
CREATE TABLE IF NOT EXISTS customer_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Customer Profile
    customer_segment VARCHAR(50),
    customer_category VARCHAR(50),
    registration_date DATE,
    customer_age_days INTEGER,
    
    -- Transaction Metrics
    total_transactions_lifetime INTEGER DEFAULT 0,
    total_transactions_ytd INTEGER DEFAULT 0,
    total_transactions_mtd INTEGER DEFAULT 0,
    avg_transactions_per_month DECIMAL(8, 2),
    
    -- Volume Metrics
    total_volume_lifetime DECIMAL(20, 2) DEFAULT 0,
    total_volume_ytd DECIMAL(20, 2) DEFAULT 0,
    total_volume_mtd DECIMAL(20, 2) DEFAULT 0,
    avg_volume_per_transaction DECIMAL(10, 2),
    
    -- Revenue Metrics
    total_revenue_lifetime DECIMAL(20, 2) DEFAULT 0,
    total_revenue_ytd DECIMAL(20, 2) DEFAULT 0,
    total_revenue_mtd DECIMAL(20, 2) DEFAULT 0,
    avg_revenue_per_transaction DECIMAL(15, 2),
    avg_revenue_per_visit DECIMAL(15, 2),
    
    -- Behavioral Metrics
    preferred_station_id UUID REFERENCES stations(id),
    preferred_fuel_type VARCHAR(50),
    preferred_payment_method VARCHAR(50),
    preferred_visit_time VARCHAR(20), -- 'MORNING', 'AFTERNOON', 'EVENING'
    preferred_days JSONB, -- ['MON', 'TUE', 'WED']
    
    -- Frequency Metrics
    visit_frequency_days DECIMAL(8, 2), -- Average days between visits
    last_visit_date DATE,
    days_since_last_visit INTEGER,
    
    -- Loyalty Metrics
    loyalty_tier VARCHAR(20),
    loyalty_points_balance INTEGER DEFAULT 0,
    loyalty_points_earned_ytd INTEGER DEFAULT 0,
    loyalty_points_redeemed_ytd INTEGER DEFAULT 0,
    loyalty_engagement_score DECIMAL(5, 2),
    
    -- Profitability Metrics
    customer_lifetime_value DECIMAL(20, 2),
    customer_acquisition_cost DECIMAL(15, 2),
    customer_profitability_score DECIMAL(5, 2),
    
    -- Risk Metrics
    churn_risk_score DECIMAL(5, 2), -- 0-100, higher = more likely to churn
    credit_risk_score DECIMAL(5, 2),
    payment_behavior_score DECIMAL(5, 2),
    
    -- Satisfaction Metrics
    average_satisfaction_rating DECIMAL(3, 2), -- 1-5 scale
    complaints_count_ytd INTEGER DEFAULT 0,
    compliments_count_ytd INTEGER DEFAULT 0,
    survey_response_rate DECIMAL(5, 2),
    
    -- Prediction Metrics
    predicted_monthly_revenue DECIMAL(15, 2),
    predicted_churn_probability DECIMAL(5, 2),
    next_visit_prediction DATE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_date, customer_id),
    INDEX idx_customer_analytics_date (analysis_date),
    INDEX idx_customer_analytics_customer (customer_id),
    INDEX idx_customer_analytics_segment (customer_segment),
    INDEX idx_customer_analytics_churn_risk (churn_risk_score),
    INDEX idx_customer_analytics_clv (customer_lifetime_value)
);

-- Financial Analytics
CREATE TABLE IF NOT EXISTS financial_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL,
    
    -- Dimensions
    tenant_id UUID NOT NULL,
    station_id UUID REFERENCES stations(id),
    account_code VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    cost_center_code VARCHAR(50),
    
    -- Time Dimensions
    fiscal_year INTEGER,
    fiscal_period INTEGER,
    calendar_year INTEGER,
    calendar_month INTEGER,
    
    -- P&L Metrics
    revenue DECIMAL(20, 2) DEFAULT 0,
    cost_of_sales DECIMAL(20, 2) DEFAULT 0,
    gross_profit DECIMAL(20, 2) DEFAULT 0,
    operating_expenses DECIMAL(20, 2) DEFAULT 0,
    ebitda DECIMAL(20, 2) DEFAULT 0,
    net_income DECIMAL(20, 2) DEFAULT 0,
    
    -- Margin Analysis
    gross_margin_percentage DECIMAL(5, 2),
    operating_margin_percentage DECIMAL(5, 2),
    net_margin_percentage DECIMAL(5, 2),
    
    -- Balance Sheet Metrics
    total_assets DECIMAL(20, 2) DEFAULT 0,
    current_assets DECIMAL(20, 2) DEFAULT 0,
    fixed_assets DECIMAL(20, 2) DEFAULT 0,
    total_liabilities DECIMAL(20, 2) DEFAULT 0,
    current_liabilities DECIMAL(20, 2) DEFAULT 0,
    equity DECIMAL(20, 2) DEFAULT 0,
    
    -- Liquidity Ratios
    current_ratio DECIMAL(8, 4),
    quick_ratio DECIMAL(8, 4),
    cash_ratio DECIMAL(8, 4),
    
    -- Efficiency Ratios
    asset_turnover DECIMAL(8, 4),
    inventory_turnover DECIMAL(8, 4),
    receivables_turnover DECIMAL(8, 4),
    
    -- Cash Flow Metrics
    operating_cash_flow DECIMAL(20, 2) DEFAULT 0,
    investing_cash_flow DECIMAL(20, 2) DEFAULT 0,
    financing_cash_flow DECIMAL(20, 2) DEFAULT 0,
    net_cash_flow DECIMAL(20, 2) DEFAULT 0,
    
    -- Variance Analysis
    budget_amount DECIMAL(20, 2),
    actual_amount DECIMAL(20, 2),
    variance_amount DECIMAL(20, 2),
    variance_percentage DECIMAL(5, 2),
    
    -- Forecast Metrics
    forecasted_amount DECIMAL(20, 2),
    forecast_accuracy DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_date, tenant_id, station_id, account_code),
    INDEX idx_financial_analytics_date (analysis_date),
    INDEX idx_financial_analytics_station (station_id),
    INDEX idx_financial_analytics_account (account_code),
    INDEX idx_financial_analytics_fiscal (fiscal_year, fiscal_period)
);

-- =====================================================
-- MACHINE LEARNING AND PREDICTIVE ANALYTICS
-- =====================================================

-- ML Models Registry
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(200) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'REGRESSION', 'CLASSIFICATION', 'TIME_SERIES', 'CLUSTERING'
    model_purpose VARCHAR(100), -- 'DEMAND_FORECASTING', 'CHURN_PREDICTION', 'PRICE_OPTIMIZATION'
    
    -- Model Details
    algorithm VARCHAR(100), -- 'LINEAR_REGRESSION', 'RANDOM_FOREST', 'NEURAL_NETWORK', 'ARIMA'
    framework VARCHAR(50), -- 'SCIKIT_LEARN', 'TENSORFLOW', 'PYTORCH', 'PROPHET'
    model_version VARCHAR(20),
    
    -- Training Information
    training_data_source VARCHAR(200),
    training_period_start DATE,
    training_period_end DATE,
    training_samples INTEGER,
    features_used JSONB,
    target_variable VARCHAR(100),
    
    -- Model Performance
    accuracy_score DECIMAL(8, 4),
    precision_score DECIMAL(8, 4),
    recall_score DECIMAL(8, 4),
    f1_score DECIMAL(8, 4),
    rmse_score DECIMAL(12, 4),
    mae_score DECIMAL(12, 4),
    
    -- Model Artifacts
    model_file_path VARCHAR(500),
    model_parameters JSONB,
    feature_importance JSONB,
    
    -- Deployment Information
    deployment_status VARCHAR(20) DEFAULT 'DEVELOPMENT', -- 'DEVELOPMENT', 'TESTING', 'PRODUCTION', 'RETIRED'
    deployed_at TIMESTAMPTZ,
    last_retrained_at TIMESTAMPTZ,
    next_retraining_due TIMESTAMPTZ,
    
    -- Usage Statistics
    prediction_count_total INTEGER DEFAULT 0,
    prediction_count_monthly INTEGER DEFAULT 0,
    avg_inference_time_ms DECIMAL(8, 2),
    
    -- Model Monitoring
    performance_threshold DECIMAL(8, 4), -- Minimum acceptable performance
    drift_detection_enabled BOOLEAN DEFAULT TRUE,
    last_performance_check TIMESTAMPTZ,
    performance_degradation_detected BOOLEAN DEFAULT FALSE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ml_model_name (model_name),
    INDEX idx_ml_model_type (model_type),
    INDEX idx_ml_model_purpose (model_purpose),
    INDEX idx_ml_model_status (deployment_status)
);

-- ML Model Predictions
CREATE TABLE IF NOT EXISTS ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id),
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Prediction Request
    prediction_timestamp TIMESTAMPTZ NOT NULL,
    input_features JSONB NOT NULL,
    prediction_horizon VARCHAR(50), -- '1_DAY', '1_WEEK', '1_MONTH', '1_QUARTER'
    
    -- Prediction Results
    predicted_value DECIMAL(20, 6),
    prediction_confidence DECIMAL(5, 4), -- 0-1 confidence score
    prediction_intervals JSONB, -- Upper and lower confidence intervals
    
    -- Context Information
    entity_type VARCHAR(50), -- 'STATION', 'CUSTOMER', 'PRODUCT', 'OVERALL'
    entity_id UUID,
    business_context JSONB,
    
    -- Actual Outcome (for model evaluation)
    actual_value DECIMAL(20, 6),
    actual_recorded_at TIMESTAMPTZ,
    prediction_error DECIMAL(20, 6),
    absolute_error DECIMAL(20, 6),
    
    -- Feedback and Adjustments
    human_feedback VARCHAR(20), -- 'ACCURATE', 'INACCURATE', 'PARTIALLY_ACCURATE'
    feedback_notes TEXT,
    model_adjustment_applied BOOLEAN DEFAULT FALSE,
    
    -- Usage Information
    used_in_decision BOOLEAN DEFAULT FALSE,
    decision_outcome TEXT,
    business_impact_value DECIMAL(20, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ml_prediction_id (prediction_id),
    INDEX idx_ml_prediction_model (model_id),
    INDEX idx_ml_prediction_timestamp (prediction_timestamp),
    INDEX idx_ml_prediction_entity (entity_type, entity_id),
    INDEX idx_ml_prediction_actual_recorded (actual_recorded_at)
);

-- Demand Forecasting
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Forecast Scope
    station_id UUID REFERENCES stations(id),
    product_type VARCHAR(50),
    forecast_date DATE NOT NULL,
    forecast_horizon_days INTEGER NOT NULL,
    
    -- Forecast Period
    forecast_period_start DATE NOT NULL,
    forecast_period_end DATE NOT NULL,
    
    -- Historical Context
    historical_avg_demand DECIMAL(20, 2),
    historical_trend DECIMAL(8, 4), -- Daily change rate
    seasonality_factor DECIMAL(8, 4),
    
    -- External Factors
    weather_impact_factor DECIMAL(6, 4) DEFAULT 1.0,
    economic_impact_factor DECIMAL(6, 4) DEFAULT 1.0,
    promotional_impact_factor DECIMAL(6, 4) DEFAULT 1.0,
    competitor_impact_factor DECIMAL(6, 4) DEFAULT 1.0,
    
    -- Forecast Results
    forecasted_demand_liters DECIMAL(20, 2) NOT NULL,
    forecast_confidence_level DECIMAL(5, 2), -- Percentage
    forecast_lower_bound DECIMAL(20, 2),
    forecast_upper_bound DECIMAL(20, 2),
    
    -- Model Information
    model_used VARCHAR(100),
    model_accuracy_score DECIMAL(8, 4),
    
    -- Actual vs Forecast
    actual_demand_liters DECIMAL(20, 2),
    forecast_error DECIMAL(20, 2),
    forecast_accuracy_percentage DECIMAL(5, 2),
    
    -- Business Actions
    recommended_stock_level DECIMAL(20, 2),
    recommended_order_quantity DECIMAL(20, 2),
    reorder_point DECIMAL(20, 2),
    safety_stock DECIMAL(20, 2),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_demand_forecast_id (forecast_id),
    INDEX idx_demand_forecast_station (station_id),
    INDEX idx_demand_forecast_product (product_type),
    INDEX idx_demand_forecast_date (forecast_date),
    INDEX idx_demand_forecast_period (forecast_period_start, forecast_period_end)
);

-- =====================================================
-- SYSTEM CONFIGURATION AND INTEGRATION
-- =====================================================

-- API Integrations
CREATE TABLE IF NOT EXISTS api_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_name VARCHAR(200) UNIQUE NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- 'REST_API', 'SOAP', 'WEBHOOK', 'GRAPHQL'
    
    -- Integration Details
    provider_name VARCHAR(200),
    base_url VARCHAR(500),
    api_version VARCHAR(20),
    authentication_method VARCHAR(50), -- 'API_KEY', 'OAUTH2', 'BASIC_AUTH', 'JWT'
    
    -- Configuration
    configuration JSONB,
    credentials_encrypted BYTEA,
    headers JSONB,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    
    -- Rate Limiting
    rate_limit_requests INTEGER,
    rate_limit_period_seconds INTEGER,
    
    -- Health Monitoring
    is_active BOOLEAN DEFAULT TRUE,
    health_check_enabled BOOLEAN DEFAULT TRUE,
    health_check_endpoint VARCHAR(200),
    health_check_interval_minutes INTEGER DEFAULT 5,
    last_health_check TIMESTAMPTZ,
    health_status VARCHAR(20) DEFAULT 'UNKNOWN', -- 'HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN'
    
    -- Usage Statistics
    total_requests_made INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(8, 2),
    
    -- Error Tracking
    consecutive_failures INTEGER DEFAULT 0,
    last_failure_time TIMESTAMPTZ,
    last_failure_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_api_integration_name (integration_name),
    INDEX idx_api_integration_type (integration_type),
    INDEX idx_api_integration_health (health_status),
    INDEX idx_api_integration_active (is_active)
);

-- Data Processing Jobs
CREATE TABLE IF NOT EXISTS data_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(200) UNIQUE NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'ETL', 'ANALYTICS', 'ML_TRAINING', 'DATA_SYNC', 'CLEANUP'
    
    -- Job Configuration
    job_description TEXT,
    job_schedule VARCHAR(100), -- Cron expression
    job_parameters JSONB,
    timeout_minutes INTEGER DEFAULT 60,
    
    -- Processing Details
    source_tables JSONB,
    target_tables JSONB,
    transformation_logic TEXT,
    
    -- Resource Requirements
    cpu_cores INTEGER DEFAULT 1,
    memory_mb INTEGER DEFAULT 1024,
    max_parallel_instances INTEGER DEFAULT 1,
    
    -- Status and Monitoring
    is_active BOOLEAN DEFAULT TRUE,
    is_running BOOLEAN DEFAULT FALSE,
    last_execution_time TIMESTAMPTZ,
    next_execution_time TIMESTAMPTZ,
    average_duration_minutes DECIMAL(8, 2),
    
    -- Success/Failure Tracking
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Error Handling
    max_retries INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 5,
    failure_notification_emails JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_data_job_name (job_name),
    INDEX idx_data_job_type (job_type),
    INDEX idx_data_job_active (is_active),
    INDEX idx_data_job_running (is_running),
    INDEX idx_data_job_next_execution (next_execution_time)
);

-- Job Execution History
CREATE TABLE IF NOT EXISTS job_execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES data_processing_jobs(id),
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Execution Details
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes DECIMAL(8, 2),
    execution_status VARCHAR(20), -- 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT'
    
    -- Processing Statistics
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Resource Usage
    cpu_usage_percentage DECIMAL(5, 2),
    memory_usage_mb DECIMAL(10, 2),
    disk_io_mb DECIMAL(15, 2),
    
    -- Error Information
    error_message TEXT,
    error_stack_trace TEXT,
    error_category VARCHAR(100),
    
    -- Output and Logs
    execution_logs TEXT,
    output_files JSONB,
    performance_metrics JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_job_execution_job (job_id),
    INDEX idx_job_execution_id (execution_id),
    INDEX idx_job_execution_start_time (start_time),
    INDEX idx_job_execution_status (execution_status)
);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default IoT device types
INSERT INTO iot_device_types (device_type_code, device_type_name, description, communication_protocol, measurement_parameters) VALUES
('TANK_LEVEL_SENSOR', 'Tank Level Sensor', 'Ultrasonic or radar level sensors for fuel tanks', 'LORAWAN', '["LEVEL", "TEMPERATURE"]'),
('FUEL_QUALITY_SENSOR', 'Fuel Quality Sensor', 'Multi-parameter fuel quality monitoring', 'WIFI', '["DENSITY", "WATER_CONTENT", "TEMPERATURE"]'),
('PUMP_FLOW_METER', 'Pump Flow Meter', 'Flow measurement and totalizer for fuel pumps', 'CELLULAR', '["FLOW_RATE", "TOTAL_VOLUME", "PRESSURE"]'),
('ENVIRONMENTAL_SENSOR', 'Environmental Monitor', 'Air quality and environmental monitoring', 'WIFI', '["TEMPERATURE", "HUMIDITY", "VOC", "CO2"]'),
('VIBRATION_SENSOR', 'Vibration Monitor', 'Equipment vibration and condition monitoring', 'ZIGBEE', '["VIBRATION", "TEMPERATURE", "FREQUENCY"]'),
('POWER_METER', 'Power Meter', 'Electrical power consumption monitoring', 'CELLULAR', '["POWER", "VOLTAGE", "CURRENT", "FREQUENCY"]')
ON CONFLICT (device_type_code) DO NOTHING;

-- Insert sample analytics data marts
INSERT INTO analytics_data_marts (mart_name, mart_description, refresh_frequency) VALUES
('SALES_MART', 'Daily sales analytics and KPIs', 'DAILY'),
('INVENTORY_MART', 'Inventory levels and movements analysis', 'HOURLY'),
('CUSTOMER_MART', 'Customer behavior and segmentation analytics', 'DAILY'),
('FINANCIAL_MART', 'Financial performance and profitability analysis', 'DAILY'),
('OPERATIONAL_MART', 'Operational efficiency and performance metrics', 'HOURLY')
ON CONFLICT (mart_name) DO NOTHING;

-- Insert sample ML models
INSERT INTO ml_models (model_name, model_type, model_purpose, algorithm, deployment_status) VALUES
('DEMAND_FORECAST_V1', 'TIME_SERIES', 'DEMAND_FORECASTING', 'PROPHET', 'PRODUCTION'),
('CUSTOMER_CHURN_V2', 'CLASSIFICATION', 'CHURN_PREDICTION', 'RANDOM_FOREST', 'PRODUCTION'),
('PRICE_OPTIMIZATION_V1', 'REGRESSION', 'PRICE_OPTIMIZATION', 'NEURAL_NETWORK', 'TESTING'),
('EQUIPMENT_MAINTENANCE_V1', 'CLASSIFICATION', 'PREDICTIVE_MAINTENANCE', 'GRADIENT_BOOSTING', 'DEVELOPMENT')
ON CONFLICT (model_name) DO NOTHING;

-- Insert default API integrations
INSERT INTO api_integrations (integration_name, integration_type, provider_name, is_active) VALUES
('NPA_PRICE_API', 'REST_API', 'National Petroleum Authority', TRUE),
('WEATHER_API', 'REST_API', 'Ghana Meteorological Agency', TRUE),
('BANK_OF_GHANA_RATES', 'REST_API', 'Bank of Ghana', TRUE),
('MTN_MOMO_API', 'REST_API', 'MTN Mobile Money', TRUE),
('VODAFONE_CASH_API', 'REST_API', 'Vodafone Cash', TRUE)
ON CONFLICT (integration_name) DO NOTHING;

-- Insert default data processing jobs
INSERT INTO data_processing_jobs (job_name, job_type, job_description, job_schedule) VALUES
('DAILY_SALES_ANALYTICS', 'ANALYTICS', 'Generate daily sales analytics and KPIs', '0 1 * * *'),
('HOURLY_INVENTORY_SYNC', 'DATA_SYNC', 'Sync inventory levels from IoT sensors', '0 * * * *'),
('WEEKLY_CUSTOMER_SEGMENTATION', 'ANALYTICS', 'Update customer segmentation and RFM analysis', '0 2 * * 1'),
('MONTHLY_FINANCIAL_REPORTING', 'ETL', 'Generate monthly financial reports and statements', '0 6 1 * *'),
('DEMAND_FORECAST_UPDATE', 'ML_TRAINING', 'Update demand forecasting models with recent data', '0 3 * * 1')
ON CONFLICT (job_name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Technology, IoT and Analytics System schema created successfully with comprehensive monitoring and ML capabilities!';
END $$;