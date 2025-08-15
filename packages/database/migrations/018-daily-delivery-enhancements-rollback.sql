-- =====================================================
-- DAILY DELIVERY MODULE ENHANCEMENTS ROLLBACK
-- Version: 1.0.0
-- Description: Rollback script for Station Type Configuration, Price Build-up Snapshots, and AP/AR Integration
-- Author: Backend Database Agent
-- Date: 2025-08-15
-- =====================================================

BEGIN;

-- =====================================================
-- DROP TRIGGERS
-- =====================================================

-- Drop triggers in reverse order
DROP TRIGGER IF EXISTS trg_update_price_buildup_snapshot ON daily_deliveries;
DROP TRIGGER IF EXISTS trg_auto_generate_journal_entries ON daily_deliveries;
DROP TRIGGER IF EXISTS trg_calculate_tax_accruals ON daily_deliveries;
DROP TRIGGER IF EXISTS update_tax_accruals_updated_at ON tax_accruals;
DROP TRIGGER IF EXISTS update_price_build_up_components_updated_at ON price_build_up_components;

-- =====================================================
-- DROP FUNCTIONS
-- =====================================================

-- Drop stored procedures and functions
DROP FUNCTION IF EXISTS update_price_buildup_snapshot();
DROP FUNCTION IF EXISTS auto_generate_journal_entries();
DROP FUNCTION IF EXISTS calculate_tax_accruals();
DROP FUNCTION IF EXISTS create_commercial_journal_lines(UUID, RECORD, INTEGER);
DROP FUNCTION IF EXISTS create_industrial_journal_lines(UUID, RECORD, INTEGER);
DROP FUNCTION IF EXISTS create_dodo_journal_lines(UUID, RECORD, INTEGER);
DROP FUNCTION IF EXISTS create_doco_journal_lines(UUID, RECORD, INTEGER);
DROP FUNCTION IF EXISTS create_coco_journal_lines(UUID, RECORD, INTEGER);
DROP FUNCTION IF EXISTS generate_delivery_journal_entries(UUID, station_type);

-- =====================================================
-- REMOVE COLUMNS FROM DELIVERY_LINE_ITEMS
-- =====================================================

-- Remove price component breakdown columns from delivery_line_items
ALTER TABLE delivery_line_items 
DROP COLUMN IF EXISTS gl_account_code,
DROP COLUMN IF EXISTS profit_center_code,
DROP COLUMN IF EXISTS cost_center_code,
DROP COLUMN IF EXISTS price_components,
DROP COLUMN IF EXISTS total_margins,
DROP COLUMN IF EXISTS total_levies,
DROP COLUMN IF EXISTS total_taxes,
DROP COLUMN IF EXISTS base_unit_price;

-- Drop indexes for enhanced line item queries
DROP INDEX IF EXISTS idx_delivery_line_items_gl_account;
DROP INDEX IF EXISTS idx_delivery_line_items_cost_center;
DROP INDEX IF EXISTS idx_delivery_line_items_price_components;

-- =====================================================
-- DROP TABLES
-- =====================================================

-- Drop tax_accruals table
DROP TABLE IF EXISTS tax_accruals;

-- Drop price_build_up_components table
DROP TABLE IF EXISTS price_build_up_components;

-- =====================================================
-- REMOVE COLUMNS FROM DAILY_DELIVERIES
-- =====================================================

-- Remove enhanced columns from daily_deliveries
ALTER TABLE daily_deliveries 
DROP COLUMN IF EXISTS revenue_recognition_type,
DROP COLUMN IF EXISTS uppf_levy_snapshot,
DROP COLUMN IF EXISTS dealer_margin_snapshot,
DROP COLUMN IF EXISTS price_build_up_snapshot,
DROP COLUMN IF EXISTS station_type;

-- Drop indexes for new columns
DROP INDEX IF EXISTS idx_daily_deliveries_revenue_type;
DROP INDEX IF EXISTS idx_daily_deliveries_price_snapshot;
DROP INDEX IF EXISTS idx_daily_deliveries_station_type;

-- =====================================================
-- DROP ENUM TYPES
-- =====================================================

-- Drop enum types in reverse order
DROP TYPE IF EXISTS tax_type;
DROP TYPE IF EXISTS revenue_recognition_type;
DROP TYPE IF EXISTS station_type;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify rollback completed successfully
DO $$
BEGIN
    -- Check if station_type column was removed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_deliveries' AND column_name = 'station_type'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: station_type column still exists in daily_deliveries';
    END IF;
    
    -- Check if price_build_up_components table was dropped
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'price_build_up_components'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: price_build_up_components table still exists';
    END IF;
    
    -- Check if tax_accruals table was dropped
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tax_accruals'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: tax_accruals table still exists';
    END IF;
    
    -- Check if station_type enum was dropped
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'station_type'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: station_type enum still exists';
    END IF;
    
    RAISE NOTICE 'Rollback completed successfully - all enhancements reverted';
END $$;

COMMIT;