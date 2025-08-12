#!/usr/bin/env node

/**
 * Ghana OMC ERP - Database Migration Runner
 * 
 * This script runs database migrations in sequential order.
 * It ensures each migration is applied only once and tracks
 * migration history for rollback capabilities.
 * 
 * Usage:
 *   node run-migrations.js [--env=development|staging|production]
 *   node run-migrations.js --rollback=003  # Rollback to specific version
 *   node run-migrations.js --status        # Show migration status
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationRunner {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'omc_erp_dev',
    };
    
    this.migrationsDir = path.join(__dirname, '..', 'migrations');
    this.client = new Client(this.dbConfig);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Ensure schema_migrations table exists
      await this.ensureMigrationsTable();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    }
  }

  async ensureMigrationsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(10) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64),
        execution_time_ms INTEGER
      );
    `;
    
    await this.client.query(createTableQuery);
  }

  async getAppliedMigrations() {
    const result = await this.client.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    return result.rows.map(row => row.version);
  }

  async getPendingMigrations() {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = this.getAllMigrationFiles();
    
    return allMigrations.filter(migration => 
      !appliedMigrations.includes(migration.version)
    );
  }

  getAllMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return files.map(file => {
      const version = file.split('-')[0];
      return {
        version,
        filename: file,
        filepath: path.join(this.migrationsDir, file),
      };
    });
  }

  async runMigration(migration) {
    console.log(`🔄 Running migration ${migration.version}: ${migration.filename}`);
    
    const startTime = Date.now();
    const sql = fs.readFileSync(migration.filepath, 'utf8');
    
    try {
      // Begin transaction
      await this.client.query('BEGIN');
      
      // Execute migration
      await this.client.query(sql);
      
      // Record migration as applied
      const executionTime = Date.now() - startTime;
      await this.client.query(
        'INSERT INTO schema_migrations (version, applied_at, execution_time_ms) VALUES ($1, NOW(), $2) ON CONFLICT (version) DO NOTHING',
        [migration.version, executionTime]
      );
      
      // Commit transaction
      await this.client.query('COMMIT');
      
      console.log(`✅ Migration ${migration.version} completed in ${executionTime}ms`);
    } catch (error) {
      // Rollback transaction on error
      await this.client.query('ROLLBACK');
      console.error(`❌ Migration ${migration.version} failed:`, error.message);
      throw error;
    }
  }

  async runAllPendingMigrations() {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations to run');
      return;
    }
    
    console.log(`📦 Found ${pendingMigrations.length} pending migration(s)`);
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }
    
    console.log('🎉 All migrations completed successfully!');
  }

  async showStatus() {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = this.getAllMigrationFiles();
    
    console.log('\n📊 Migration Status:');
    console.log('==================');
    
    for (const migration of allMigrations) {
      const isApplied = appliedMigrations.includes(migration.version);
      const status = isApplied ? '✅ Applied' : '⏳ Pending';
      console.log(`${migration.version}: ${migration.filename} - ${status}`);
    }
    
    const appliedCount = appliedMigrations.length;
    const totalCount = allMigrations.length;
    console.log(`\nTotal: ${appliedCount}/${totalCount} migrations applied`);
  }

  async rollbackToVersion(targetVersion) {
    console.log(`🔄 Rolling back to version ${targetVersion}`);
    
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationsToRollback = appliedMigrations.filter(version => version > targetVersion);
    
    if (migrationsToRollback.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }
    
    console.log(`📦 Rolling back ${migrationsToRollback.length} migration(s)`);
    
    // Note: This is a simple rollback that just removes from schema_migrations
    // In production, you might want rollback scripts for each migration
    for (const version of migrationsToRollback.reverse()) {
      try {
        await this.client.query('DELETE FROM schema_migrations WHERE version = $1', [version]);
        console.log(`✅ Rolled back migration ${version}`);
      } catch (error) {
        console.error(`❌ Failed to rollback migration ${version}:`, error.message);
        throw error;
      }
    }
    
    console.log('🎉 Rollback completed successfully!');
    console.log('⚠️  Note: This only removes migration records. Manual cleanup may be required for database objects.');
  }

  async disconnect() {
    await this.client.end();
    console.log('👋 Disconnected from database');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new MigrationRunner();
  
  try {
    await runner.connect();
    
    // Parse command line arguments
    if (args.includes('--status')) {
      await runner.showStatus();
    } else if (args.some(arg => arg.startsWith('--rollback='))) {
      const rollbackArg = args.find(arg => arg.startsWith('--rollback='));
      const targetVersion = rollbackArg.split('=')[1];
      await runner.rollbackToVersion(targetVersion);
    } else {
      // Default: run all pending migrations
      await runner.runAllPendingMigrations();
    }
    
  } catch (error) {
    console.error('💥 Migration process failed:', error.message);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = MigrationRunner;