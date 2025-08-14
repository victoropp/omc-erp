#!/usr/bin/env node

/**
 * Ghana OMC ERP - Complete System Startup
 * 
 * Starts the entire OMC ERP system including:
 * - Docker infrastructure
 * - All microservices
 * - API Gateway
 * - Frontend dashboard
 * - Health monitoring
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Ghana OMC ERP Complete System...');
console.log('='.repeat(60));

const processes = [];

function startProcess(name, command, args = [], options = {}) {
  console.log(`🔄 Starting ${name}...`);
  
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options
  });
  
  proc.on('error', (error) => {
    console.error(`❌ Failed to start ${name}:`, error.message);
  });
  
  processes.push({ name, process: proc });
  return proc;
}

async function startSystem() {
  try {
    // 1. Start Docker Infrastructure
    console.log('📦 Starting Docker infrastructure...');
    startProcess('Docker Infrastructure', 'docker-compose', ['up', '-d']);
    
    // Wait for Docker to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 2. Run Database Migrations
    console.log('🗄️  Running database migrations...');
    startProcess('Database Migrations', 'node', ['packages/database/scripts/run-migrations.js']);
    
    // Wait for migrations
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Start All Microservices
    console.log('🔧 Starting microservices...');
    startProcess('All Microservices', 'node', ['start-services.js']);
    
    // Wait for services to start
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // 4. Start API Gateway
    console.log('🌐 Starting API Gateway...');
    startProcess('API Gateway', 'node', ['simple-gateway.js']);
    
    // Wait for gateway
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. Start Frontend Dashboard (if not already running)
    console.log('🖥️  Starting Frontend Dashboard...');
    startProcess('Frontend Dashboard', 'npm', ['run', 'dev'], { 
      cwd: path.join(__dirname, 'apps', 'dashboard') 
    });
    
    // Wait for frontend
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 6. Run Health Check
    console.log('🏥 Running health check...');
    startProcess('Health Check', 'node', ['health-monitor.js']);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\\n' + '='.repeat(60));
    console.log('✅ Ghana OMC ERP System Started Successfully!');
    console.log('='.repeat(60));
    console.log('🌐 System URLs:');
    console.log('  • Frontend Dashboard: http://localhost:3000');
    console.log('  • API Gateway: http://localhost:3020');
    console.log('  • Health Monitor: ./health-dashboard.html');
    console.log('\\n🔧 Microservices:');
    console.log('  • Configuration Service: http://localhost:3011/api/health');
    console.log('  • Auth Service: http://localhost:3012/api/auth/health');
    console.log('  • Pricing Service: http://localhost:3014/api/pricing/health');
    console.log('  • UPPF Service: http://localhost:3015/api/uppf/health');
    console.log('  • Dealer Service: http://localhost:3016/api/dealers/health');
    console.log('  • Accounting Service: http://localhost:3017/api/accounting/health');
    console.log('  • IFRS Service: http://localhost:3018/api/ifrs/health');
    console.log('  • Transaction Service: http://localhost:3019/api/transactions/health');
    console.log('\\n💾 Infrastructure:');
    console.log('  • PostgreSQL: localhost:5432');
    console.log('  • TimescaleDB: localhost:5434');
    console.log('  • Redis: localhost:6379');
    console.log('  • MongoDB: localhost:27017');
    console.log('  • Kafka: localhost:9094');
    console.log('  • MinIO: localhost:9002');
    console.log('  • Adminer: http://localhost:8081');
    console.log('\\n🛑 Press Ctrl+C to stop all services');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 Failed to start system:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Ghana OMC ERP System...');
  
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill('SIGINT');
  });
  
  // Stop Docker containers
  console.log('Stopping Docker containers...');
  spawn('docker-compose', ['down'], { stdio: 'inherit', shell: true });
  
  setTimeout(() => {
    console.log('✅ Ghana OMC ERP System stopped');
    process.exit(0);
  }, 5000);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Terminating Ghana OMC ERP System...');
  
  processes.forEach(({ name, process }) => {
    console.log(`Terminating ${name}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('✅ Ghana OMC ERP System terminated');
    process.exit(0);
  }, 5000);
});

// Start the system
startSystem().catch(console.error);