const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3003',
  credentials: true
}));

app.use(express.json());

// Sample API endpoints for the ERP system
const sampleData = {
  metrics: {
    totalRevenue: 2847325,
    totalStations: 12,
    activeClaims: 23,
    pendingSettlements: 5
  },
  claims: [
    { id: 1, station: 'Accra Main', amount: 45000, status: 'Pending', date: '2025-08-13' },
    { id: 2, station: 'Kumasi Central', amount: 38500, status: 'Approved', date: '2025-08-12' },
    { id: 3, station: 'Tema Harbor', amount: 52000, status: 'Processing', date: '2025-08-11' }
  ],
  dealers: [
    { id: 1, name: 'Ghana Oil Ltd', status: 'Active', creditScore: 85, totalLoans: 245000 },
    { id: 2, name: 'Petro Ghana', status: 'Active', creditScore: 92, totalLoans: 180000 },
    { id: 3, name: 'Shell Ghana', status: 'Active', creditScore: 88, totalLoans: 320000 }
  ],
  pricing: {
    currentWindow: 'PW-2025-08-001',
    petrolPrice: 15.28,
    dieselPrice: 14.95,
    lastUpdated: '2025-08-13T10:30:00Z'
  }
};

// Dashboard endpoints
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({ success: true, data: sampleData.metrics });
});

app.get('/api/dashboard/real-time-metrics', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      timestamp: new Date().toISOString(),
      metrics: sampleData.metrics,
      charts: {
        revenue: [120000, 135000, 142000, 158000, 147000, 165000, 173000],
        claims: [12, 15, 8, 23, 19, 14, 18]
      }
    }
  });
});

// UPPF endpoints
app.get('/api/uppf/claims', (req, res) => {
  res.json({ success: true, data: sampleData.claims });
});

app.get('/api/uppf/metrics', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalClaims: 156,
      approvedClaims: 134,
      pendingClaims: 23,
      totalAmount: 8450000,
      approvalRate: 86
    }
  });
});

// Pricing endpoints
app.get('/api/pricing/current', (req, res) => {
  res.json({ success: true, data: sampleData.pricing });
});

app.get('/api/pricing/analytics', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      trends: [14.2, 14.5, 14.8, 15.1, 15.3, 15.0, 15.28],
      volatility: 3.2,
      margin: 8.5,
      recommendations: ['Monitor crude oil prices', 'Review margin settings']
    }
  });
});

// Dealer endpoints
app.get('/api/dealers', (req, res) => {
  res.json({ success: true, data: sampleData.dealers });
});

app.get('/api/dealers/:id/performance', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      revenue: 1250000,
      volume: 85000,
      settlements: 12,
      compliance: 94
    }
  });
});

// Financial endpoints
app.get('/api/financial/summary', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalAssets: 15750000,
      totalLiabilities: 8450000,
      equity: 7300000,
      revenue: 28473250,
      netIncome: 3420000
    }
  });
});

// HR endpoints
app.get('/api/hr/employees', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'Kwame Asante', department: 'Operations', position: 'Manager', status: 'Active' },
      { id: 2, name: 'Akosua Boateng', department: 'Finance', position: 'Accountant', status: 'Active' },
      { id: 3, name: 'Kofi Mensah', department: 'IT', position: 'Developer', status: 'Active' }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      database: 'connected',
      redis: 'connected'
    }
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ghana OMC ERP API Gateway running at http://localhost:${PORT}`);
  console.log(`📊 Sample endpoints available:`);
  console.log(`   - Dashboard: http://localhost:${PORT}/api/dashboard/metrics`);
  console.log(`   - UPPF: http://localhost:${PORT}/api/uppf/claims`);
  console.log(`   - Pricing: http://localhost:${PORT}/api/pricing/current`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend Dashboard: http://localhost:3003`);
});