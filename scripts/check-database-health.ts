#!/usr/bin/env ts-node

import { databaseHealthChecker } from '../packages/database/src/health-check';
import { initializeDatabase } from '../packages/database/src/data-source';

async function main() {
  console.log('🔍 Checking database health...\n');
  
  try {
    // Initialize main database connection
    await initializeDatabase();
    console.log('✅ Main database initialized\n');
    
    // Check all database health
    const healthStatus = await databaseHealthChecker.checkAllDatabases();
    
    console.log('📊 Database Health Report:');
    console.log('========================\n');
    
    // PostgreSQL
    console.log(`🐘 PostgreSQL: ${healthStatus.postgres.status === 'healthy' ? '✅' : '❌'} ${healthStatus.postgres.status.toUpperCase()}`);
    if (healthStatus.postgres.latency) {
      console.log(`   Latency: ${healthStatus.postgres.latency}ms`);
    }
    if (healthStatus.postgres.error) {
      console.log(`   Error: ${healthStatus.postgres.error}`);
    }
    
    // TimescaleDB
    console.log(`⏰ TimescaleDB: ${healthStatus.timescale.status === 'healthy' ? '✅' : '❌'} ${healthStatus.timescale.status.toUpperCase()}`);
    if (healthStatus.timescale.latency) {
      console.log(`   Latency: ${healthStatus.timescale.latency}ms`);
    }
    if (healthStatus.timescale.error) {
      console.log(`   Error: ${healthStatus.timescale.error}`);
    }
    
    // Redis
    console.log(`🔴 Redis: ${healthStatus.redis.status === 'healthy' ? '✅' : '❌'} ${healthStatus.redis.status.toUpperCase()}`);
    if (healthStatus.redis.latency) {
      console.log(`   Latency: ${healthStatus.redis.latency}ms`);
    }
    if (healthStatus.redis.error) {
      console.log(`   Error: ${healthStatus.redis.error}`);
    }
    
    // MongoDB
    console.log(`🍃 MongoDB: ${healthStatus.mongodb.status === 'healthy' ? '✅' : '❌'} ${healthStatus.mongodb.status.toUpperCase()}`);
    if (healthStatus.mongodb.latency) {
      console.log(`   Latency: ${healthStatus.mongodb.latency}ms`);
    }
    if (healthStatus.mongodb.error) {
      console.log(`   Error: ${healthStatus.mongodb.error}`);
    }
    
    // Overall
    console.log(`\n🎯 Overall Status: ${healthStatus.overall === 'healthy' ? '✅' : healthStatus.overall === 'degraded' ? '⚠️' : '❌'} ${healthStatus.overall.toUpperCase()}`);
    
    if (healthStatus.overall !== 'healthy') {
      console.log('\n⚠️  Some databases are experiencing issues. Please check the logs above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All databases are healthy!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  }
}

main();