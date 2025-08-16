const { spawn } = require('child_process');
const path = require('path');

// Service configurations
const services = [
  {
    name: 'Infrastructure (Docker)',
    command: 'docker-compose',
    args: ['up', '-d', 'postgres', 'redis', 'mongodb'],
    cwd: __dirname,
    color: '\x1b[36m', // Cyan
    wait: 10000, // Wait 10s for databases to start
  },
  {
    name: 'Service Registry',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'service-registry'),
    port: 3010,
    color: '\x1b[35m', // Magenta
    wait: 3000,
  },
  {
    name: 'Auth Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'auth-service'),
    port: 3001,
    color: '\x1b[33m', // Yellow
    wait: 2000,
  },
  {
    name: 'API Gateway',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'api-gateway'),
    port: 3000,
    color: '\x1b[32m', // Green
    wait: 2000,
  },
  {
    name: 'Transaction Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'transaction-service'),
    port: 3002,
    color: '\x1b[34m', // Blue
    wait: 2000,
  },
  {
    name: 'Station Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'station-service'),
    port: 3003,
    color: '\x1b[31m', // Red
    wait: 2000,
  },
  {
    name: 'Pricing Service',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'services', 'pricing-service'),
    port: 3006,
    color: '\x1b[37m', // White
    wait: 2000,
  },
  {
    name: 'Dashboard',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'apps', 'dashboard'),
    port: 5000,
    color: '\x1b[36m', // Cyan
    wait: 2000,
  },
];

const runningProcesses = [];
let isShuttingDown = false;

function log(serviceName, message, color = '\x1b[37m') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${serviceName}:\x1b[0m ${message}`);
}

function startService(service) {
  return new Promise((resolve, reject) => {
    log(service.name, `Starting on port ${service.port || 'N/A'}...`, service.color);

    const process = spawn(service.command, service.args, {
      cwd: service.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    runningProcesses.push({
      name: service.name,
      process,
      port: service.port,
    });

    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log(service.name, message, service.color);
      }
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('Warning:')) {
        log(service.name, `ERROR: ${message}`, '\x1b[31m');
      }
    });

    process.on('close', (code) => {
      if (!isShuttingDown) {
        log(service.name, `Exited with code ${code}`, '\x1b[31m');
      }
    });

    process.on('error', (error) => {
      log(service.name, `Failed to start: ${error.message}`, '\x1b[31m');
      reject(error);
    });

    // Consider the service started after a brief delay
    setTimeout(() => {
      log(service.name, 'Started successfully', '\x1b[32m');
      resolve();
    }, service.wait || 1000);
  });
}

async function startAllServices() {
  console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Ghana OMC ERP System...\n');

  try {
    for (const service of services) {
      await startService(service);
      
      // Wait a bit between services
      if (service.wait) {
        log('System', `Waiting ${service.wait}ms for ${service.name} to initialize...`, '\x1b[90m');
        await new Promise(resolve => setTimeout(resolve, service.wait));
      }
    }

    console.log('\n\x1b[32m%s\x1b[0m', '✅ All services started successfully!');
    console.log('\n📊 Service Status:');
    runningProcesses.forEach(p => {
      const port = p.port ? `:${p.port}` : '';
      console.log(`   • ${p.name}: http://localhost${port}`);
    });

    console.log('\n🌐 Quick Links:');
    console.log('   • Dashboard: http://localhost:5000');
    console.log('   • API Gateway: http://localhost:3000/api/v1');
    console.log('   • API Docs: http://localhost:3000/api/docs');
    console.log('   • Service Registry: http://localhost:3010/registry/health');
    
    console.log('\n💡 Tips:');
    console.log('   • Press Ctrl+C to stop all services');
    console.log('   • Run "node test-api-endpoints.js" to test connectivity');
    console.log('   • Check logs above for any errors');

  } catch (error) {
    console.error('\n❌ Failed to start services:', error.message);
    process.exit(1);
  }
}

function shutdownAllServices() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('\n\x1b[33m%s\x1b[0m', '⚠️  Shutting down all services...');

  runningProcesses.forEach(({ name, process }) => {
    log(name, 'Shutting down...', '\x1b[33m');
    try {
      process.kill('SIGTERM');
    } catch (error) {
      log(name, `Error shutting down: ${error.message}`, '\x1b[31m');
    }
  });

  setTimeout(() => {
    console.log('\x1b[32m%s\x1b[0m', '✅ All services stopped.');
    process.exit(0);
  }, 3000);
}

// Handle graceful shutdown
process.on('SIGINT', shutdownAllServices);
process.on('SIGTERM', shutdownAllServices);

// Start services
if (require.main === module) {
  startAllServices().catch(console.error);
}

module.exports = { startAllServices, shutdownAllServices };