#!/usr/bin/env node

/**
 * Ghana OMC ERP - Health Monitor & Service Status Dashboard
 * 
 * Monitors all services and provides real-time status dashboard
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

// Service configurations
const services = [
  { name: 'PostgreSQL Database', url: 'http://localhost:5432', type: 'database', port: 5432 },
  { name: 'TimescaleDB', url: 'http://localhost:5434', type: 'database', port: 5434 },
  { name: 'Redis Cache', url: 'http://localhost:6379', type: 'cache', port: 6379 },
  { name: 'MongoDB', url: 'http://localhost:27017', type: 'database', port: 27017 },
  { name: 'Kafka', url: 'http://localhost:9094', type: 'messaging', port: 9094 },
  { name: 'MinIO', url: 'http://localhost:9002', type: 'storage', port: 9002 },
  { name: 'Configuration Service', url: 'http://localhost:3011/api/health', type: 'service', port: 3011 },
  { name: 'Auth Service', url: 'http://localhost:3012/api/auth/health', type: 'service', port: 3012 },
  { name: 'Pricing Service', url: 'http://localhost:3014/api/pricing/health', type: 'service', port: 3014 },
  { name: 'UPPF Service', url: 'http://localhost:3015/api/uppf/health', type: 'service', port: 3015 },
  { name: 'Dealer Service', url: 'http://localhost:3016/api/dealers/health', type: 'service', port: 3016 },
  { name: 'Accounting Service', url: 'http://localhost:3017/api/accounting/health', type: 'service', port: 3017 },
  { name: 'IFRS Service', url: 'http://localhost:3018/api/ifrs/health', type: 'service', port: 3018 },
  { name: 'Transaction Service', url: 'http://localhost:3019/api/transactions/health', type: 'service', port: 3019 },
  { name: 'API Gateway', url: 'http://localhost:3020/api/health', type: 'gateway', port: 3020 },
  { name: 'Frontend Dashboard', url: 'http://localhost:3000', type: 'frontend', port: 3000 }
];

// Store service statuses
const serviceStatuses = new Map();

function checkHTTPService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = httpModule.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode < 400 ? 'healthy' : 'unhealthy',
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          data: data
        });
      });
    });

    const startTime = Date.now();
    req.on('error', (error) => {
      resolve({
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'timeout',
        error: 'Request timeout',
        responseTime: 5000
      });
    });

    req.end();
  });
}

function checkTCPPort(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const client = new net.Socket();
    const startTime = Date.now();

    client.setTimeout(3000);

    client.connect(port, host, () => {
      client.destroy();
      resolve({
        status: 'healthy',
        responseTime: Date.now() - startTime
      });
    });

    client.on('error', (error) => {
      resolve({
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });

    client.on('timeout', () => {
      client.destroy();
      resolve({
        status: 'timeout',
        error: 'Connection timeout',
        responseTime: 3000
      });
    });
  });
}

async function checkService(service) {
  const timestamp = new Date().toISOString();
  
  try {
    let result;
    
    if (service.type === 'database' || service.type === 'cache' || service.type === 'messaging' || service.type === 'storage') {
      // For infrastructure services, check TCP port
      result = await checkTCPPort('localhost', service.port);
    } else {
      // For HTTP services, check HTTP endpoint
      result = await checkHTTPService(service);
    }
    
    return {
      name: service.name,
      type: service.type,
      port: service.port,
      url: service.url,
      timestamp,
      ...result
    };
  } catch (error) {
    return {
      name: service.name,
      type: service.type,
      port: service.port,
      url: service.url,
      timestamp,
      status: 'error',
      error: error.message
    };
  }
}

async function checkAllServices() {
  console.log('🔍 Checking all services...');
  
  const results = await Promise.all(
    services.map(service => checkService(service))
  );
  
  // Update status map
  results.forEach(result => {
    serviceStatuses.set(result.name, result);
  });
  
  return results;
}

function generateStatusReport(results) {
  const healthy = results.filter(r => r.status === 'healthy');
  const unhealthy = results.filter(r => r.status === 'unhealthy' || r.status === 'error' || r.status === 'timeout');
  
  console.log('\\n' + '='.repeat(80));
  console.log('🏥 Ghana OMC ERP - Health Status Report');
  console.log('='.repeat(80));
  console.log(`📊 Overall Status: ${unhealthy.length === 0 ? '✅ ALL HEALTHY' : '⚠️  ISSUES DETECTED'}`);
  console.log(`📈 Services: ${healthy.length}/${results.length} healthy (${Math.round(healthy.length/results.length*100)}%)`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  console.log('\\n📋 Service Details:');
  console.log('-'.repeat(80));
  
  // Group by type
  const grouped = results.reduce((acc, service) => {
    if (!acc[service.type]) acc[service.type] = [];
    acc[service.type].push(service);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([type, services]) => {
    console.log(`\\n🔧 ${type.toUpperCase()} SERVICES:`);
    services.forEach(service => {
      const statusIcon = service.status === 'healthy' ? '✅' : 
                        service.status === 'timeout' ? '⏱️' : '❌';
      const responseTime = service.responseTime ? ` (${service.responseTime}ms)` : '';
      const error = service.error ? ` - ${service.error}` : '';
      
      console.log(`  ${statusIcon} ${service.name}:${service.port}${responseTime}${error}`);
    });
  });
  
  if (unhealthy.length > 0) {
    console.log('\\n🚨 ATTENTION REQUIRED:');
    console.log('-'.repeat(80));
    unhealthy.forEach(service => {
      console.log(`❌ ${service.name}:${service.port} - ${service.error || 'Service unavailable'}`);
    });
  }
  
  console.log('\\n🔗 Service URLs:');
  console.log('-'.repeat(80));
  results.filter(s => s.type === 'service' || s.type === 'gateway' || s.type === 'frontend').forEach(service => {
    if (service.status === 'healthy') {
      console.log(`✅ ${service.name}: ${service.url}`);
    }
  });
  
  console.log('\\n💾 Infrastructure:');
  console.log('-'.repeat(80));
  results.filter(s => s.type === 'database' || s.type === 'cache' || s.type === 'messaging' || s.type === 'storage').forEach(service => {
    const status = service.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${service.name}:${service.port}`);
  });
  
  console.log('='.repeat(80));
}

function generateHTMLDashboard(results) {
  const healthy = results.filter(r => r.status === 'healthy');
  const timestamp = new Date().toISOString();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ghana OMC ERP - Service Health Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 10px 0;
            font-size: 1.1em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
        }
        .stat-card.healthy {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .service-group {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border-left: 5px solid #667eea;
        }
        .service-group h3 {
            color: #333;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            font-size: 1.1em;
            letter-spacing: 1px;
        }
        .service-item {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 10px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #ddd;
            transition: all 0.3s ease;
        }
        .service-item:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .service-item.healthy {
            border-left-color: #28a745;
        }
        .service-item.unhealthy {
            border-left-color: #dc3545;
        }
        .service-item.timeout {
            border-left-color: #ffc107;
        }
        .status-icon {
            font-size: 1.5em;
            margin-right: 10px;
            min-width: 30px;
        }
        .service-details {
            flex: 1;
        }
        .service-name {
            font-weight: bold;
            color: #333;
        }
        .service-url {
            font-size: 0.9em;
            color: #666;
            word-break: break-all;
        }
        .service-meta {
            font-size: 0.8em;
            color: #999;
            margin-top: 5px;
        }
        .error-message {
            color: #dc3545;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
        }
        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            margin: 20px;
            transition: transform 0.2s;
        }
        .refresh-btn:hover {
            transform: scale(1.05);
        }
        .auto-refresh {
            color: #28a745;
            font-weight: bold;
            margin: 10px;
        }
    </style>
    <meta http-equiv="refresh" content="30">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Ghana OMC ERP</h1>
            <p>Service Health Dashboard</p>
            <p class="auto-refresh">🔄 Auto-refreshing every 30 seconds</p>
        </div>
        
        <div class="stats">
            <div class="stat-card ${healthy.length === results.length ? 'healthy' : ''}">
                <h3>${healthy.length}/${results.length}</h3>
                <p>Services Healthy</p>
            </div>
            <div class="stat-card">
                <h3>${Math.round(healthy.length/results.length*100)}%</h3>
                <p>Overall Health</p>
            </div>
            <div class="stat-card">
                <h3>${results.length}</h3>
                <p>Total Services</p>
            </div>
            <div class="stat-card">
                <h3>${new Date().toLocaleTimeString()}</h3>
                <p>Last Check</p>
            </div>
        </div>
        
        <div class="services-grid">
            ${Object.entries(results.reduce((acc, service) => {
                if (!acc[service.type]) acc[service.type] = [];
                acc[service.type].push(service);
                return acc;
            }, {})).map(([type, services]) => `
                <div class="service-group">
                    <h3>${type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</h3>
                    ${services.map(service => `
                        <div class="service-item ${service.status}">
                            <div class="status-icon">
                                ${service.status === 'healthy' ? '✅' : 
                                  service.status === 'timeout' ? '⏱️' : '❌'}
                            </div>
                            <div class="service-details">
                                <div class="service-name">${service.name}</div>
                                <div class="service-url">${service.url}</div>
                                <div class="service-meta">
                                    Port: ${service.port}
                                    ${service.responseTime ? ` | Response: ${service.responseTime}ms` : ''}
                                </div>
                                ${service.error ? `<div class="error-message">❌ ${service.error}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <button class="refresh-btn" onclick="window.location.reload()">🔄 Refresh Now</button>
            <p>Last updated: ${timestamp}</p>
            <p>© 2025 Ghana OMC ERP System</p>
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync('./health-dashboard.html', html);
  console.log('\\n📊 HTML Dashboard generated: ./health-dashboard.html');
}

async function runHealthCheck() {
  const results = await checkAllServices();
  generateStatusReport(results);
  generateHTMLDashboard(results);
  
  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    overall: {
      healthy: results.filter(r => r.status === 'healthy').length,
      total: results.length,
      percentage: Math.round(results.filter(r => r.status === 'healthy').length / results.length * 100)
    },
    services: results
  };
  
  fs.writeFileSync('./health-report.json', JSON.stringify(report, null, 2));
  console.log('💾 JSON Report saved: ./health-report.json');
  
  return results;
}

// Run health check
console.log('🚀 Starting Ghana OMC ERP Health Monitor...');
console.log('='.repeat(80));

runHealthCheck().then(results => {
  const unhealthy = results.filter(r => r.status !== 'healthy');
  if (unhealthy.length === 0) {
    console.log('\\n🎉 All services are healthy!');
    process.exit(0);
  } else {
    console.log(`\\n⚠️  ${unhealthy.length} service(s) need attention.`);
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Health check failed:', error);
  process.exit(1);
});