-- Ghana OMC ERP - Initial Schema Migration
-- Migration: 001-initial-schema
-- Created: 2025-01-15
-- Description: Create core tables for tenants, users, stations, tanks, pumps, and basic transactions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table (multi-tenancy support)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address JSONB,
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(20) DEFAULT 'trial',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    status VARCHAR(20) DEFAULT 'active',
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stations table
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    location JSONB NOT NULL, -- {latitude, longitude, address, region}
    manager_name VARCHAR(200),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    operating_hours_start TIME,
    operating_hours_end TIME,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    facilities JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Tanks table
CREATE TABLE tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    tank_number VARCHAR(10) NOT NULL,
    fuel_type VARCHAR(10) NOT NULL, -- PMS, AGO, LPG, etc.
    tank_type VARCHAR(20) DEFAULT 'underground',
    capacity DECIMAL(10,3) NOT NULL, -- in liters
    current_volume DECIMAL(10,3) DEFAULT 0,
    reserved_volume DECIMAL(10,3) DEFAULT 0,
    minimum_level DECIMAL(10,3) NOT NULL DEFAULT 1000,
    maximum_level DECIMAL(10,3),
    last_calibration_date DATE,
    installation_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    sensor_id VARCHAR(100),
    is_monitored BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, tank_number)
);

-- Pumps table
CREATE TABLE pumps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    pump_number VARCHAR(10) NOT NULL,
    pump_type VARCHAR(20) DEFAULT 'dispensing',
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    last_calibration_date DATE,
    calibration_due_date DATE,
    nozzle_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    is_operational BOOLEAN DEFAULT true,
    current_totalizer DECIMAL(12,3) DEFAULT 0,
    maintenance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, pump_number)
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) NOT NULL,
    customer_type VARCHAR(20) DEFAULT 'individual', -- individual, corporate
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_litres DECIMAL(12,3) DEFAULT 0,
    preferred_fuel_type VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    registration_date DATE DEFAULT CURRENT_DATE,
    last_transaction_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, customer_number)
);

-- Shifts table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    attendant_id UUID NOT NULL REFERENCES users(id),
    shift_number VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash DECIMAL(12,2) DEFAULT 0,
    closing_cash DECIMAL(12,2),
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
    tank_id UUID NOT NULL REFERENCES tanks(id),
    attendant_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    shift_id UUID REFERENCES shifts(id),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    fuel_type VARCHAR(10) NOT NULL,
    quantity_liters DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(8,4) NOT NULL,
    sub_total DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- cash, card, mobile_money, credit, voucher
    payment_details JSONB,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(100),
    payment_processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    receipt_number VARCHAR(100),
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,
    pos_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table (for maintenance tracking)
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    equipment_type VARCHAR(50) NOT NULL, -- pump, tank, pos, generator, etc.
    equipment_name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    warranty_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 365,
    status VARCHAR(20) DEFAULT 'active',
    location_description TEXT,
    specifications JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- preventive, corrective, emergency
    scheduled_date DATE,
    completed_date DATE,
    technician_name VARCHAR(200),
    technician_contact VARCHAR(50),
    description TEXT NOT NULL,
    work_performed TEXT,
    parts_used JSONB DEFAULT '[]',
    cost DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    downtime_hours DECIMAL(6,2) DEFAULT 0,
    next_service_date DATE,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_stations_tenant_id ON stations(tenant_id);
CREATE INDEX idx_stations_code ON stations(code);
CREATE INDEX idx_stations_status ON stations(status);
CREATE INDEX idx_stations_location_gin ON stations USING GIN(location);

CREATE INDEX idx_tanks_station_id ON tanks(station_id);
CREATE INDEX idx_tanks_fuel_type ON tanks(fuel_type);
CREATE INDEX idx_tanks_status ON tanks(status);

CREATE INDEX idx_pumps_station_id ON pumps(station_id);
CREATE INDEX idx_pumps_tank_id ON pumps(tank_id);
CREATE INDEX idx_pumps_status ON pumps(status);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_station_id ON transactions(station_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_transaction_time ON transactions(transaction_time);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);

CREATE INDEX idx_shifts_station_id ON shifts(station_id);
CREATE INDEX idx_shifts_attendant_id ON shifts(attendant_id);
CREATE INDEX idx_shifts_start_time ON shifts(start_time);

CREATE INDEX idx_equipment_station_id ON equipment(station_id);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);

CREATE INDEX idx_maintenance_records_equipment_id ON maintenance_records(equipment_id);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_records_scheduled_date ON maintenance_records(scheduled_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON tanks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pumps_updated_at BEFORE UPDATE ON pumps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin tenant and user (for development)
INSERT INTO tenants (
    id,
    company_name,
    company_code,
    license_number,
    contact_email,
    subscription_plan,
    subscription_status,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'OMC ERP System Admin',
    'SYSTEM',
    'SYS-2025-001',
    'admin@omc-erp.com',
    'enterprise',
    'active',
    true
);

INSERT INTO users (
    id,
    tenant_id,
    username,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@omc-erp.com',
    '$2b$10$8Cq3QQlQJ1QJ1QJ1QJ1QJu2RQJ1QJ1QJ1QJ1QJ1QJ1QJ1QJ1QJ1QJ', -- password: admin123
    'System',
    'Administrator',
    'super_admin',
    'active',
    NOW()
);

COMMENT ON TABLE tenants IS 'Multi-tenant companies using the OMC ERP system';
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE stations IS 'Fuel stations managed by each tenant';
COMMENT ON TABLE tanks IS 'Fuel storage tanks at each station';
COMMENT ON TABLE pumps IS 'Fuel dispensing pumps connected to tanks';
COMMENT ON TABLE customers IS 'End customers who purchase fuel';
COMMENT ON TABLE transactions IS 'Fuel sale transactions with payment processing';
COMMENT ON TABLE shifts IS 'Work shifts for station attendants';
COMMENT ON TABLE equipment IS 'Equipment inventory for maintenance tracking';
COMMENT ON TABLE maintenance_records IS 'Equipment maintenance history and scheduling';

-- Migration completion marker
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('001', NOW())
ON CONFLICT (version) DO NOTHING;