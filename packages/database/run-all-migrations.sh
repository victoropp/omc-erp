#!/bin/bash

# Ghana OMC ERP - Run All Database Migrations
# This script executes all SQL migration files in order

set -e  # Exit on any error

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="postgres"
DB_NAME="omc_erp_dev"
CONTAINER_NAME="omc-erp-postgres"

echo "🚀 Starting database migrations for OMC ERP"
echo "============================================="

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ PostgreSQL container '$CONTAINER_NAME' is not running!"
    echo "Please start it with: docker-compose up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL container is running"

# Create schema_migrations table if it doesn't exist
echo "📋 Ensuring schema_migrations table exists..."
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time_ms INTEGER
);"

echo "✅ Schema migrations table ready"

# Get list of migration files
MIGRATION_DIR="migrations"
echo "📁 Looking for migration files in $MIGRATION_DIR/"

# List of all migration files in order
MIGRATIONS=(
    "001-initial-schema.sql"
    "002-uppf-pricing-tables.sql"
    "003-regulatory-documents.sql"
    "004-complete-schema.sql"
    "005-fleet-management.sql"
    "006-hr-payroll-system.sql"
    "007-supply-chain-procurement.sql"
    "008-crm-customer-service.sql"
    "009-compliance-risk-management.sql"
    "010-ghana-regulatory-compliance.sql"
    "011-advanced-financial-management.sql"
    "012-technology-iot-analytics.sql"
    "013-database-views-reports.sql"
    "014-stored-procedures-regulatory-reporting.sql"
    "015-database-indexes-performance.sql"
    "016-audit-trail-security-tables.sql"
    "017-uppf-price-automation.sql"
)

# Check which migrations have already been applied
echo "📊 Checking migration status..."

for migration in "${MIGRATIONS[@]}"; do
    version="${migration%%-*}"
    
    # Check if migration was already applied
    applied=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version';")
    applied=$(echo "$applied" | xargs)  # Trim whitespace
    
    if [ "$applied" = "1" ]; then
        echo "✅ Migration $version ($migration) - Already applied"
    else
        echo "⏳ Migration $version ($migration) - Pending"
        
        if [ -f "$MIGRATION_DIR/$migration" ]; then
            echo "🔄 Running migration $version..."
            
            # Record start time
            start_time=$(date +%s%3N)
            
            # Execute the migration
            if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$MIGRATION_DIR/$migration"; then
                # Record end time and calculate execution time
                end_time=$(date +%s%3N)
                execution_time=$((end_time - start_time))
                
                # Mark migration as completed
                docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
                INSERT INTO schema_migrations (version, applied_at, execution_time_ms) 
                VALUES ('$version', NOW(), $execution_time) 
                ON CONFLICT (version) DO NOTHING;"
                
                echo "✅ Migration $version completed in ${execution_time}ms"
            else
                echo "❌ Migration $version failed!"
                exit 1
            fi
        else
            echo "❌ Migration file not found: $MIGRATION_DIR/$migration"
            exit 1
        fi
    fi
done

echo ""
echo "🎉 All database migrations completed successfully!"
echo "============================================="

# Show final status
echo "📊 Final migration status:"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    version,
    applied_at,
    execution_time_ms 
FROM schema_migrations 
ORDER BY version;"

echo ""
echo "🏗️  Database schema is ready for OMC ERP system!"