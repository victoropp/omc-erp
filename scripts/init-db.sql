-- Initialize OMC ERP Database
-- This script creates the initial database schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'regional_manager', 'station_manager', 'operator', 'accountant', 'auditor', 'driver');
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');
CREATE TYPE fuel_type AS ENUM ('PMS', 'AGO', 'IFO', 'LPG', 'KERO');
CREATE TYPE station_type AS ENUM ('retail', 'depot', 'terminal');
CREATE TYPE station_status AS ENUM ('active', 'inactive', 'maintenance', 'closed');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile_money', 'credit', 'voucher');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'failed', 'disputed');

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON DATABASE omc_erp_dev TO postgres;

-- Create schema for shared/reference data
CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS system;

-- Set search path
SET search_path TO public, shared, system;