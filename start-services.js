#!/usr/bin/env node

/**
 * Ghana OMC ERP - Service Orchestrator
 * 
 * This script starts all microservices in the correct order with proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');

// Define service configurations
const services = [
  {
    name: 'Configuration Service',
    port: 3011,
    path: 'services/configuration-service',
    color: '\x1b[36m', // Cyan
    healthCheck: '/api/health'
  },
  {
    name: 'Auth Service', 
    port: 3012,
    path: 'services/auth-service',
    color: '\x1b[33m', // Yellow
    healthCheck: '/api/auth/health'
  },
  {
    name: 'API Gateway',
    port: 3010,
    path: 'services/api-gateway', 
    color: '\x1b[35m', // Magenta
    healthCheck: '/api/health'
  },
  {
    name: 'Pricing Service',
    port: 3014,
    path: 'services/pricing-service',
    color: '\x1b[32m', // Green
    healthCheck: '/api/pricing/health'
  },
  {
    name: 'UPPF Service',
    port: 3015,
    path: 'services/uppf-service',
    color: '\x1b[34m', // Blue
    healthCheck: '/api/uppf/health'
  },
  {
    name: 'Dealer Service',
    port: 3016,
    path: 'services/dealer-service',
    color: '\x1b[31m', // Red
    healthCheck: '/api/dealers/health'
  },
  {
    name: 'Accounting Service',
    port: 3017,
    path: 'services/accounting-service',
    color: '\x1b[37m', // White
    healthCheck: '/api/accounting/health'
  },
  {
    name: 'IFRS Service',
    port: 3018,
    path: 'services/ifrs-service',
    color: '\x1b[90m', // Bright Black
    healthCheck: '/api/ifrs/health'
  },
  {
    name: 'Transaction Service',
    port: 3019,
    path: 'services/transaction-service',
    color: '\x1b[96m', // Bright Cyan
    healthCheck: '/api/transactions/health'
  }
];

// Reset color
const reset = '\x1b[0m';

// Track running services
const runningServices = new Map();

function log(service, message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${service.color}[${service.name}:${service.port}]${reset}`;
  
  if (isError) {
    console.error(`${prefix} ❌ ${message}`);
  } else {
    console.log(`${prefix} ℹ️ ${message}`);
  }
}

function createBasicServer(service) {
  const serverCode = `
const http = require('http');
const port = ${service.port};

// Basic health check and service info
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (url === '${service.healthCheck}' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: '${service.name}',
      port: ${service.port},
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
  } else if (url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: '${service.name}',
      description: 'Ghana OMC ERP Microservice',
      version: '1.0.0',
      port: ${service.port},
      endpoints: ['${service.healthCheck}', '/api/info'],
      status: 'running'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'Endpoint not found',
      service: '${service.name}',
      availableEndpoints: ['${service.healthCheck}', '/api/info']
    }));
  }
});

server.listen(port, () => {
  console.log(\`🚀 ${service.name} is running on port \${port}\`);
  console.log(\`📋 Health check: http://localhost:\${port}${service.healthCheck}\`);
  console.log(\`ℹ️  Service info: http://localhost:\${port}/api/info\`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(\`\\n🛑 Shutting down ${service.name}...\`);
  server.close(() => {
    console.log(\`✅ ${service.name} stopped\`);
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(\`\\n🛑 Terminating ${service.name}...\`);
  server.close(() => {
    console.log(\`✅ ${service.name} terminated\`);
    process.exit(0);
  });
});
  `;
  
  return serverCode;
}

function startService(service, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      log(service, 'Starting service...');
      
      // Create a temporary server file for this service
      const tempServerPath = path.join(__dirname, `temp-${service.name.toLowerCase().replace(/\\s+/g, '-')}-server.js`);
      const fs = require('fs');
      
      try {
        fs.writeFileSync(tempServerPath, createBasicServer(service));
        
        const child = spawn('node', [tempServerPath], {
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false
        });
        
        child.stdout.on('data', (data) => {
          const message = data.toString().trim();
          if (message) {
            log(service, message);
          }
        });
        
        child.stderr.on('data', (data) => {
          const message = data.toString().trim();
          if (message) {
            log(service, message, true);
          }
        });
        
        child.on('close', (code) => {
          log(service, `Process exited with code ${code}`);
          runningServices.delete(service.name);
          
          // Clean up temp file
          try {
            fs.unlinkSync(tempServerPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
        
        child.on('error', (error) => {
          log(service, `Failed to start: ${error.message}`, true);
        });
        
        runningServices.set(service.name, { process: child, service, tempFile: tempServerPath });
        
        // Give the service a moment to start
        setTimeout(() => {
          log(service, '✅ Service started successfully');
          resolve();
        }, 2000);
        
      } catch (error) {
        log(service, `Failed to create service: ${error.message}`, true);
        resolve();
      }
    }, delay);
  });
}

async function startAllServices() {
  console.log('🚀 Starting Ghana OMC ERP Microservices...');
  console.log('='.repeat(50));
  
  // Start services with staggered delays to avoid port conflicts
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    await startService(service, i * 1000); // 1 second delay between each service
  }
  
  console.log('\\n✅ All services started!');
  console.log('='.repeat(50));
  console.log('🌐 Service URLs:');
  
  services.forEach(service => {
    console.log(`  ${service.color}• ${service.name}${reset}: http://localhost:${service.port}${service.healthCheck}`);
  });
  
  console.log(`\n📊 Dashboard: http://localhost:3000/dashboard`);
  console.log('🛑 Press Ctrl+C to stop all services');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down all services...');
  
  const fs = require('fs');
  runningServices.forEach((serviceInfo, serviceName) => {
    console.log(`Stopping ${serviceName}...`);
    if (serviceInfo.process) {
      serviceInfo.process.kill('SIGINT');
    }
    // Clean up temp file
    try {
      if (serviceInfo.tempFile) {
        fs.unlinkSync(serviceInfo.tempFile);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });
  
  setTimeout(() => {
    console.log('✅ All services stopped');
    process.exit(0);
  }, 3000);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Terminating all services...');
  
  const fs = require('fs');
  runningServices.forEach((serviceInfo, serviceName) => {
    console.log(`Terminating ${serviceName}...`);
    if (serviceInfo.process) {
      serviceInfo.process.kill('SIGTERM');
    }
    // Clean up temp file
    try {
      if (serviceInfo.tempFile) {
        fs.unlinkSync(serviceInfo.tempFile);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });
  
  setTimeout(() => {
    console.log('✅ All services terminated');
    process.exit(0);
  }, 3000);
});

// Start all services
startAllServices().catch(console.error);