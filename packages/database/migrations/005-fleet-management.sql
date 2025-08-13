-- =====================================================
-- BRV/FLEET MANAGEMENT SYSTEM
-- Description: Complete fleet and vehicle management with GPS tracking
-- =====================================================

-- Fleet Categories
CREATE TABLE IF NOT EXISTS fleet_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_capacity_liters DECIMAL(10, 2),
    compartment_count INTEGER DEFAULT 1,
    permit_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Manufacturers
CREATE TABLE IF NOT EXISTS vehicle_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_name VARCHAR(100) UNIQUE NOT NULL,
    country_origin VARCHAR(100),
    contact_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Vehicles (BRVs)
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    chassis_number VARCHAR(100) UNIQUE NOT NULL,
    engine_number VARCHAR(100),
    manufacturer_id UUID REFERENCES vehicle_manufacturers(id),
    fleet_category_id UUID REFERENCES fleet_categories(id),
    model VARCHAR(100),
    year_manufactured INTEGER,
    year_registered INTEGER,
    color VARCHAR(50),
    
    -- Capacity and Technical Specs
    total_capacity_liters DECIMAL(10, 2) NOT NULL,
    compartment_configuration JSONB, -- [{compartment: 1, capacity: 5000, product_type: 'PETROL'}]
    gross_vehicle_weight DECIMAL(10, 2),
    unladen_weight DECIMAL(10, 2),
    fuel_type VARCHAR(20), -- Vehicle's own fuel type
    engine_capacity DECIMAL(8, 2),
    
    -- Regulatory and Compliance
    npa_certificate_number VARCHAR(100),
    npa_certificate_expiry DATE,
    road_worthy_certificate VARCHAR(100),
    road_worthy_expiry DATE,
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    dvla_registration_number VARCHAR(50),
    
    -- GPS and Tracking
    gps_device_id VARCHAR(100),
    gps_device_imei VARCHAR(20),
    gps_enabled BOOLEAN DEFAULT FALSE,
    tracker_provider VARCHAR(100),
    
    -- Ownership and Assignment
    owner_type VARCHAR(20) NOT NULL, -- 'COMPANY', 'CONTRACTOR', 'DEALER'
    owner_id UUID, -- References companies/contractors table
    assigned_station_id UUID REFERENCES stations(id),
    primary_driver_id UUID,
    secondary_driver_id UUID,
    
    -- Status and Operations
    operational_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'MAINTENANCE', 'RETIRED', 'ACCIDENT'
    last_inspection_date DATE,
    next_inspection_due DATE,
    current_mileage DECIMAL(10, 2),
    
    -- Financial
    purchase_cost DECIMAL(20, 2),
    purchase_date DATE,
    depreciation_rate DECIMAL(5, 2),
    current_book_value DECIMAL(20, 2),
    
    -- Location and Status
    current_location JSONB, -- {lat, lng, address, timestamp}
    last_location_update TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_chassis_number (chassis_number),
    INDEX idx_gps_device (gps_device_id),
    INDEX idx_operational_status (operational_status)
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_code VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(50),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    national_id VARCHAR(50),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    email VARCHAR(200),
    
    -- Address
    residential_address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- License and Certifications
    driving_license_number VARCHAR(50) NOT NULL,
    license_class VARCHAR(20) NOT NULL, -- 'A', 'B', 'C', 'D', 'E', etc.
    license_issue_date DATE,
    license_expiry_date DATE,
    hazmat_certification VARCHAR(50),
    hazmat_expiry_date DATE,
    
    -- Medical and Training
    medical_certificate_number VARCHAR(50),
    medical_certificate_expiry DATE,
    training_certificates JSONB, -- [{'certificate': 'Defensive Driving', 'expiry': '2025-12-31'}]
    
    -- Employment
    employment_type VARCHAR(20), -- 'EMPLOYEE', 'CONTRACTOR', 'OWNER_OPERATOR'
    hire_date DATE,
    employment_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'TERMINATED'
    salary_structure JSONB,
    
    -- Performance and Safety
    safety_score DECIMAL(5, 2) DEFAULT 100.00,
    total_violations INTEGER DEFAULT 0,
    total_accidents INTEGER DEFAULT 0,
    total_distance_km DECIMAL(15, 2) DEFAULT 0,
    
    -- Vehicle Assignment
    assigned_vehicles JSONB, -- [vehicle_id1, vehicle_id2]
    current_vehicle_id UUID REFERENCES fleet_vehicles(id),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_driver_code (driver_code),
    INDEX idx_license_number (driving_license_number),
    INDEX idx_employment_status (employment_status)
);

-- Trip/Delivery Management
CREATE TABLE IF NOT EXISTS vehicle_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Basic Trip Information
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id),
    primary_driver_id UUID NOT NULL REFERENCES drivers(id),
    secondary_driver_id UUID REFERENCES drivers(id),
    
    -- Trip Details
    origin_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    origin_address TEXT,
    destination_address TEXT,
    origin_coordinates JSONB, -- {lat, lng}
    destination_coordinates JSONB,
    
    -- Timing
    planned_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    planned_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Load Information
    total_load_liters DECIMAL(10, 2),
    load_manifest JSONB, -- [{'product': 'PETROL', 'quantity': 5000, 'compartment': 1}]
    
    -- Route and Navigation
    planned_route JSONB, -- GPS coordinates array
    actual_route JSONB,
    planned_distance_km DECIMAL(10, 2),
    actual_distance_km DECIMAL(10, 2),
    route_optimization_applied BOOLEAN DEFAULT FALSE,
    
    -- Status and Tracking
    trip_status VARCHAR(20) DEFAULT 'PLANNED', -- 'PLANNED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    current_location JSONB,
    last_update TIMESTAMPTZ,
    
    -- Financial
    estimated_cost DECIMAL(20, 2),
    actual_cost DECIMAL(20, 2),
    fuel_consumed_liters DECIMAL(10, 2),
    fuel_cost DECIMAL(20, 2),
    driver_allowance DECIMAL(20, 2),
    
    -- Delivery Confirmation
    delivery_confirmation JSONB, -- Proof of delivery data
    recipient_name VARCHAR(200),
    recipient_signature BYTEA,
    delivery_notes TEXT,
    
    -- Safety and Compliance
    incidents_reported INTEGER DEFAULT 0,
    speed_violations INTEGER DEFAULT 0,
    route_deviations INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    INDEX idx_trip_number (trip_number),
    INDEX idx_trip_status (trip_status),
    INDEX idx_vehicle_date (vehicle_id, planned_departure),
    INDEX idx_driver_date (primary_driver_id, planned_departure)
);

-- GPS Tracking Data (Time-series)
CREATE TABLE IF NOT EXISTS vehicle_gps_tracks (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id),
    trip_id UUID REFERENCES vehicle_trips(id),
    
    -- Location Data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    accuracy_meters DECIMAL(8, 2),
    
    -- Movement Data
    speed_kmh DECIMAL(6, 2),
    heading_degrees INTEGER, -- 0-360
    
    -- Vehicle Status
    engine_status BOOLEAN,
    fuel_level_percentage DECIMAL(5, 2),
    odometer_reading DECIMAL(15, 2),
    
    -- Environmental Data
    external_temperature DECIMAL(5, 2),
    
    -- Alerts and Events
    event_type VARCHAR(50), -- 'NORMAL', 'SPEEDING', 'HARSH_BRAKING', 'ACCELERATION', 'GEOFENCE'
    alert_triggered BOOLEAN DEFAULT FALSE,
    
    -- Device Info
    device_battery_level INTEGER,
    signal_strength INTEGER,
    
    PRIMARY KEY (time, vehicle_id)
);

-- Create hypertable for GPS data (TimescaleDB)
-- SELECT create_hypertable('vehicle_gps_tracks', 'time', 'vehicle_id', 4);

-- Vehicle Maintenance
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id),
    
    -- Maintenance Details
    maintenance_type VARCHAR(50) NOT NULL, -- 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION'
    maintenance_category VARCHAR(50), -- 'ENGINE', 'TRANSMISSION', 'BRAKES', 'ELECTRICAL', 'BODYWORK'
    description TEXT NOT NULL,
    
    -- Scheduling
    scheduled_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    estimated_duration_hours DECIMAL(6, 2),
    actual_duration_hours DECIMAL(6, 2),
    
    -- Service Provider
    service_provider_type VARCHAR(20), -- 'INTERNAL', 'EXTERNAL'
    service_provider_name VARCHAR(200),
    technician_name VARCHAR(200),
    
    -- Parts and Labor
    parts_used JSONB, -- [{'part_name': 'Oil Filter', 'quantity': 1, 'cost': 45.00}]
    labor_hours DECIMAL(6, 2),
    labor_rate DECIMAL(10, 2),
    
    -- Costs
    parts_cost DECIMAL(20, 2),
    labor_cost DECIMAL(20, 2),
    other_costs DECIMAL(20, 2),
    total_cost DECIMAL(20, 2),
    
    -- Status and Quality
    maintenance_status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    quality_rating INTEGER, -- 1-5 stars
    warranty_period_days INTEGER,
    warranty_expiry_date DATE,
    
    -- Mileage
    mileage_at_service DECIMAL(10, 2),
    next_service_mileage DECIMAL(10, 2),
    next_service_date DATE,
    
    -- Documentation
    work_order_number VARCHAR(50),
    invoice_number VARCHAR(50),
    service_report TEXT,
    photos JSONB, -- Array of photo URLs
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    INDEX idx_maintenance_vehicle (vehicle_id),
    INDEX idx_maintenance_date (scheduled_date),
    INDEX idx_maintenance_status (maintenance_status)
);

-- Route Optimization Cache
CREATE TABLE IF NOT EXISTS route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_coordinates JSONB NOT NULL,
    destination_coordinates JSONB NOT NULL,
    
    -- Optimization Parameters
    vehicle_type VARCHAR(50),
    cargo_weight DECIMAL(10, 2),
    time_window JSONB, -- {'start': '08:00', 'end': '17:00'}
    optimization_criteria VARCHAR(20), -- 'FASTEST', 'SHORTEST', 'FUEL_EFFICIENT'
    
    -- Results
    optimized_route JSONB, -- Array of GPS coordinates
    estimated_distance_km DECIMAL(10, 2),
    estimated_duration_minutes INTEGER,
    estimated_fuel_consumption DECIMAL(8, 2),
    
    -- Traffic and Conditions
    traffic_conditions JSONB,
    road_conditions JSONB,
    weather_conditions JSONB,
    
    -- Caching
    computed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    cache_hit_count INTEGER DEFAULT 0,
    
    INDEX idx_route_cache (origin_coordinates, destination_coordinates),
    INDEX idx_route_expiry (expires_at)
);

-- Fleet Performance Analytics
CREATE TABLE IF NOT EXISTS fleet_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calculation_date DATE NOT NULL,
    vehicle_id UUID REFERENCES fleet_vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    
    -- Distance and Usage
    total_distance_km DECIMAL(10, 2),
    total_driving_hours DECIMAL(8, 2),
    total_trips INTEGER,
    average_trip_distance DECIMAL(8, 2),
    
    -- Fuel Efficiency
    fuel_consumed_liters DECIMAL(10, 2),
    fuel_efficiency_km_per_liter DECIMAL(6, 2),
    fuel_cost DECIMAL(20, 2),
    
    -- Performance Metrics
    on_time_delivery_rate DECIMAL(5, 2), -- Percentage
    average_speed_kmh DECIMAL(6, 2),
    idle_time_hours DECIMAL(8, 2),
    utilization_rate DECIMAL(5, 2), -- Percentage
    
    -- Safety Metrics
    speed_violations INTEGER,
    harsh_braking_events INTEGER,
    rapid_acceleration_events INTEGER,
    accident_count INTEGER,
    safety_score DECIMAL(5, 2),
    
    -- Financial Metrics
    revenue_generated DECIMAL(20, 2),
    operating_cost DECIMAL(20, 2),
    profit_margin DECIMAL(5, 2),
    cost_per_km DECIMAL(10, 4),
    
    -- Maintenance Metrics
    maintenance_cost DECIMAL(20, 2),
    downtime_hours DECIMAL(8, 2),
    maintenance_frequency INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(calculation_date, vehicle_id, driver_id),
    INDEX idx_performance_date (calculation_date),
    INDEX idx_performance_vehicle (vehicle_id)
);

-- Geofences (Virtual boundaries)
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fence_name VARCHAR(200) NOT NULL,
    fence_type VARCHAR(50) NOT NULL, -- 'STATION', 'DEPOT', 'RESTRICTED_AREA', 'CUSTOMER_SITE'
    
    -- Geographic Boundary
    boundary_polygon JSONB NOT NULL, -- Array of coordinate points defining polygon
    center_coordinates JSONB,
    radius_meters DECIMAL(10, 2),
    
    -- Associated Entities
    station_id UUID REFERENCES stations(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Rules and Alerts
    entry_alert_enabled BOOLEAN DEFAULT FALSE,
    exit_alert_enabled BOOLEAN DEFAULT FALSE,
    dwell_time_alert_minutes INTEGER,
    speed_limit_kmh DECIMAL(6, 2),
    
    -- Active Times
    active_days JSONB, -- ['MON', 'TUE', 'WED', 'THU', 'FRI']
    active_hours JSONB, -- {'start': '06:00', 'end': '22:00'}
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_geofence_type (fence_type),
    INDEX idx_geofence_station (station_id)
);

-- Driver Performance and Behavior
CREATE TABLE IF NOT EXISTS driver_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    vehicle_id UUID REFERENCES fleet_vehicles(id),
    trip_id UUID REFERENCES vehicle_trips(id),
    
    -- Driving Behavior Metrics
    harsh_acceleration_events INTEGER DEFAULT 0,
    harsh_braking_events INTEGER DEFAULT 0,
    harsh_cornering_events INTEGER DEFAULT 0,
    speed_violations INTEGER DEFAULT 0,
    idle_time_minutes DECIMAL(8, 2) DEFAULT 0,
    
    -- Speed Analysis
    max_speed_kmh DECIMAL(6, 2),
    average_speed_kmh DECIMAL(6, 2),
    time_over_speed_limit_minutes DECIMAL(8, 2),
    
    -- Route Compliance
    route_deviations INTEGER DEFAULT 0,
    unauthorized_stops INTEGER DEFAULT 0,
    geofence_violations INTEGER DEFAULT 0,
    
    -- Time Management
    early_departures INTEGER DEFAULT 0,
    late_departures INTEGER DEFAULT 0,
    extended_breaks INTEGER DEFAULT 0,
    overtime_hours DECIMAL(6, 2) DEFAULT 0,
    
    -- Fuel Efficiency
    fuel_consumption_liters DECIMAL(8, 2),
    fuel_efficiency_score DECIMAL(5, 2), -- 1-100
    eco_driving_score DECIMAL(5, 2),
    
    -- Overall Scores
    safety_score DECIMAL(5, 2), -- 1-100
    compliance_score DECIMAL(5, 2),
    efficiency_score DECIMAL(5, 2),
    overall_performance_score DECIMAL(5, 2),
    
    -- Recommendations
    improvement_recommendations JSONB,
    training_requirements JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_date, driver_id, trip_id),
    INDEX idx_behavior_date (analysis_date),
    INDEX idx_behavior_driver (driver_id),
    INDEX idx_behavior_scores (safety_score, efficiency_score)
);

-- Vehicle Expenses and Operating Costs
CREATE TABLE IF NOT EXISTS vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id),
    
    -- Expense Details
    expense_date DATE NOT NULL,
    expense_category VARCHAR(50) NOT NULL, -- 'FUEL', 'MAINTENANCE', 'INSURANCE', 'REGISTRATION', 'PARKING', 'TOLLS'
    expense_type VARCHAR(50), -- Specific type within category
    description TEXT,
    
    -- Financial Information
    amount DECIMAL(20, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'GHS',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    base_amount DECIMAL(20, 2),
    
    -- Vendor Information
    vendor_name VARCHAR(200),
    vendor_contact JSONB,
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    
    -- Trip Association
    trip_id UUID REFERENCES vehicle_trips(id),
    mileage_at_expense DECIMAL(10, 2),
    
    -- Approval and Processing
    approval_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'PAID'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Accounting Integration
    journal_entry_id UUID,
    account_code VARCHAR(20),
    cost_center VARCHAR(50),
    
    -- Documentation
    receipt_image_url VARCHAR(500),
    supporting_documents JSONB,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    INDEX idx_expense_vehicle (vehicle_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_expense_category (expense_category),
    INDEX idx_expense_status (approval_status)
);

-- =====================================================
-- DEFAULT DATA FOR FLEET MANAGEMENT
-- =====================================================

-- Insert fleet categories
INSERT INTO fleet_categories (category_code, category_name, description, max_capacity_liters, compartment_count) VALUES
('BRV-SMALL', 'Small BRV', 'Bulk Road Vehicle - Small (5,000L)', 5000, 1),
('BRV-MEDIUM', 'Medium BRV', 'Bulk Road Vehicle - Medium (10,000L)', 10000, 2),
('BRV-LARGE', 'Large BRV', 'Bulk Road Vehicle - Large (20,000L)', 20000, 3),
('BRV-MULTI', 'Multi-Product BRV', 'Multi-compartment for different products', 15000, 4),
('DELIVERY-VAN', 'Delivery Van', 'Small delivery vehicle for lubricants', 500, 1),
('SERVICE-TRUCK', 'Service Truck', 'Maintenance and service vehicle', 0, 0)
ON CONFLICT (category_code) DO NOTHING;

-- Insert vehicle manufacturers
INSERT INTO vehicle_manufacturers (manufacturer_name, country_origin) VALUES
('ISUZU', 'Japan'),
('MERCEDES-BENZ', 'Germany'),
('MAN', 'Germany'),
('SCANIA', 'Sweden'),
('VOLVO', 'Sweden'),
('DAF', 'Netherlands'),
('IVECO', 'Italy'),
('HYUNDAI', 'South Korea'),
('FORD', 'USA'),
('TOYOTA', 'Japan')
ON CONFLICT (manufacturer_name) DO NOTHING;

-- Insert sample geofences for Accra stations
INSERT INTO geofences (fence_name, fence_type, boundary_polygon, center_coordinates, radius_meters, entry_alert_enabled, exit_alert_enabled) VALUES
(
    'Tema Oil Refinery',
    'DEPOT',
    '[{"lat": 5.6667, "lng": -0.0167}, {"lat": 5.6700, "lng": -0.0100}, {"lat": 5.6650, "lng": -0.0050}, {"lat": 5.6600, "lng": -0.0150}]',
    '{"lat": 5.6667, "lng": -0.0167}',
    1000,
    true,
    true
),
(
    'Airport Shell Station',
    'STATION',
    '[{"lat": 5.6037, "lng": -0.1870}, {"lat": 5.6050, "lng": -0.1850}, {"lat": 5.6020, "lng": -0.1820}, {"lat": 5.6000, "lng": -0.1890}]',
    '{"lat": 5.6037, "lng": -0.1870}',
    200,
    true,
    true
)
ON CONFLICT (fence_name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Fleet Management System schema created successfully with BRV tracking, GPS monitoring, and performance analytics!';
END $$;