#!/usr/bin/env node

/**
 * Ghana OMC ERP - API Gateway
 * 
 * Routes requests to appropriate microservices and handles authentication
 */

const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.GATEWAY_PORT || 3020;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service configurations
const services = {
  auth: 'http://localhost:3012',
  configuration: 'http://localhost:3011',
  pricing: 'http://localhost:3014',
  uppf: 'http://localhost:3015',
  dealers: 'http://localhost:3016',
  accounting: 'http://localhost:3017',
  ifrs: 'http://localhost:3018',
  transactions: 'http://localhost:3019'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'API Gateway',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    upstreamServices: Object.keys(services)
  });
});

// Gateway info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Ghana OMC ERP - API Gateway',
    description: 'Central API Gateway for all microservices',
    version: '1.0.0',
    port: PORT,
    services: services,
    endpoints: {
      '/api/auth/*': 'Auth Service',
      '/api/config/*': 'Configuration Service',
      '/api/pricing/*': 'Pricing Service',
      '/api/uppf/*': 'UPPF Service',
      '/api/dealers/*': 'Dealer Service',
      '/api/accounting/*': 'Accounting Service',
      '/api/ifrs/*': 'IFRS Service',
      '/api/transactions/*': 'Transaction Service'
    }
  });
});

// Simple authentication middleware (for demonstration)
function authenticateRequest(req, res, next) {
  // Skip auth for health checks and public endpoints
  if (req.path.includes('/health') || req.path.includes('/info')) {
    return next();
  }

  // For demo purposes, accept any request with Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader && !req.path.includes('/api/auth/')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header required',
      path: req.path
    });
  }

  next();
}

// Apply authentication middleware
app.use(authenticateRequest);

// Proxy middleware function
function createProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target: target,
    changeOrigin: true,
    pathRewrite: pathRewrite || {},
    onError: (err, req, res) => {
      console.error(`Proxy Error for ${req.url}:`, err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Service temporarily unavailable',
        service: target,
        path: req.url
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log successful proxied requests
      console.log(`✅ Proxied: ${req.method} ${req.url} -> ${target} (${proxyRes.statusCode})`);
    }
  });
}

// Route configuration
const routes = [
  {
    path: '/api/auth',
    target: services.auth,
    pathRewrite: { '^/api/auth': '/api/auth' }
  },
  {
    path: '/api/config',
    target: services.configuration,
    pathRewrite: { '^/api/config': '/api' }
  },
  {
    path: '/api/pricing',
    target: services.pricing,
    pathRewrite: { '^/api/pricing': '/api/pricing' }
  },
  {
    path: '/api/uppf',
    target: services.uppf,
    pathRewrite: { '^/api/uppf': '/api/uppf' }
  },
  {
    path: '/api/dealers',
    target: services.dealers,
    pathRewrite: { '^/api/dealers': '/api/dealers' }
  },
  {
    path: '/api/accounting',
    target: services.accounting,
    pathRewrite: { '^/api/accounting': '/api/accounting' }
  },
  {
    path: '/api/ifrs',
    target: services.ifrs,
    pathRewrite: { '^/api/ifrs': '/api/ifrs' }
  },
  {
    path: '/api/transactions',
    target: services.transactions,
    pathRewrite: { '^/api/transactions': '/api/transactions' }
  }
];

// Set up proxy routes
routes.forEach(route => {
  console.log(`🔗 Setting up route: ${route.path}/* -> ${route.target}`);
  app.use(route.path, createProxy(route.target, route.pathRewrite));
});

// Catch all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint not found',
    path: req.originalUrl,
    availableRoutes: routes.map(r => r.path),
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🌐 Ghana OMC ERP API Gateway running on port ${PORT}`);
  console.log(`📊 Gateway Info: http://localhost:${PORT}/api/info`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('📡 Configured Routes:');
  routes.forEach(route => {
    console.log(`  ${route.path}/* -> ${route.target}`);
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