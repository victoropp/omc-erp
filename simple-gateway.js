#!/usr/bin/env node

/**
 * Ghana OMC ERP - Simple API Gateway
 * 
 * Routes requests to appropriate microservices using native HTTP
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.GATEWAY_PORT || 3020;

// Service configurations
const services = {
  'auth': 'http://localhost:3012',
  'config': 'http://localhost:3011',
  'pricing': 'http://localhost:3014',
  'uppf': 'http://localhost:3015',
  'dealers': 'http://localhost:3016',
  'accounting': 'http://localhost:3017',
  'ifrs': 'http://localhost:3018',
  'transactions': 'http://localhost:3019'
};

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

function proxyRequest(targetUrl, originalReq, originalRes, body) {
  const parsedUrl = url.parse(targetUrl);
  const isHttps = parsedUrl.protocol === 'https:';
  const httpModule = isHttps ? https : http;
  
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isHttps ? 443 : 80),
    path: parsedUrl.path + (originalReq.url.includes('?') ? originalReq.url.substring(originalReq.url.indexOf('?')) : ''),
    method: originalReq.method,
    headers: {
      ...originalReq.headers,
      host: parsedUrl.host,
      'x-forwarded-for': originalReq.connection.remoteAddress,
      'x-forwarded-proto': 'http',
      'x-forwarded-host': originalReq.headers.host
    }
  };

  const proxyReq = httpModule.request(options, (proxyRes) => {
    // Copy response headers
    originalRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe response
    proxyRes.pipe(originalRes, { end: true });
    
    console.log(`✅ Proxied: ${originalReq.method} ${originalReq.url} -> ${targetUrl} (${proxyRes.statusCode})`);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ Proxy Error for ${originalReq.url}:`, error.message);
    originalRes.writeHead(502, { 'Content-Type': 'application/json' });
    originalRes.end(JSON.stringify({
      error: 'Bad Gateway',
      message: 'Service temporarily unavailable',
      service: targetUrl,
      path: originalReq.url
    }));
  });

  // Write request body if present
  if (body) {
    proxyReq.write(body);
  }
  
  proxyReq.end();
}

function handleCORS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`📥 Incoming: ${req.method} ${pathname}`);
  
  // Health check endpoint
  if (pathname === '/api/health' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'API Gateway',
      port: PORT,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      upstreamServices: Object.keys(services)
    }));
    return;
  }
  
  // Gateway info endpoint
  if (pathname === '/api/info' || pathname === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Ghana OMC ERP - API Gateway',
      description: 'Central API Gateway for all microservices',
      version: '1.0.0',
      port: PORT,
      services: services,
      routes: {
        '/api/auth/*': services.auth,
        '/api/config/*': services.config,
        '/api/pricing/*': services.pricing,
        '/api/uppf/*': services.uppf,
        '/api/dealers/*': services.dealers,
        '/api/accounting/*': services.accounting,
        '/api/ifrs/*': services.ifrs,
        '/api/transactions/*': services.transactions
      }
    }));
    return;
  }
  
  // Parse request body for POST/PUT requests
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await parseRequestBody(req) : '';
  
  // Route to appropriate service
  let targetService = null;
  let targetPath = pathname;
  
  if (pathname.startsWith('/api/auth/')) {
    targetService = services.auth;
  } else if (pathname.startsWith('/api/config/')) {
    targetService = services.config;
    targetPath = pathname.replace('/api/config', '/api');
  } else if (pathname.startsWith('/api/pricing/')) {
    targetService = services.pricing;
  } else if (pathname.startsWith('/api/uppf/')) {
    targetService = services.uppf;
  } else if (pathname.startsWith('/api/dealers/')) {
    targetService = services.dealers;
  } else if (pathname.startsWith('/api/accounting/')) {
    targetService = services.accounting;
  } else if (pathname.startsWith('/api/ifrs/')) {
    targetService = services.ifrs;
  } else if (pathname.startsWith('/api/transactions/')) {
    targetService = services.transactions;
  }
  
  if (targetService) {
    // Build target URL
    const targetUrl = targetService + targetPath;
    proxyRequest(targetUrl, req, res, body);
  } else {
    // Route not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'API endpoint not found',
      path: pathname,
      availableRoutes: Object.keys(services).map(s => `/api/${s}/`),
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Ghana OMC ERP Simple API Gateway running on port ${PORT}`);
  console.log(`📊 Gateway Info: http://localhost:${PORT}/api/info`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('📡 Configured Routes:');
  Object.entries(services).forEach(([key, url]) => {
    console.log(`  /api/${key}/* -> ${url}`);
  });
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API Gateway...');
  server.close(() => {
    console.log('✅ API Gateway stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating API Gateway...');
  server.close(() => {
    console.log('✅ API Gateway terminated');
    process.exit(0);
  });
});