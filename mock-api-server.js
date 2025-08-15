const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: '1',
      username: req.body.username || 'admin',
      email: 'admin@omc-erp.com',
      role: 'admin',
      permissions: ['all']
    }
  });
});

// Mock daily deliveries with correct structure
app.get('/api/daily-deliveries', (req, res) => {
  res.json([
    {
      id: '1',
      deliveryNumber: 'DD-2024-001',
      date: new Date().toISOString(),
      supplierCode: 'SUP001',
      depotCode: 'DEP001',
      customerName: 'Shell Ghana',
      location: 'Accra',
      psaNumber: 'PSA-2024-001',
      wbillNumber: 'WB-2024-001',
      invoiceNumber: 'INV-2024-001',
      vehicleRegNumber: 'GR-1234-24',
      transporterCode: 'TR001',
      productType: 'petrol',
      productGrade: 'Premium',
      quantity: 45000,
      unitPrice: 5.50,
      currency: 'GHS',
      totalAmount: 247500,
      status: 'delivered',
      approvalStatus: 'approved',
      notes: 'Delivered successfully'
    },
    {
      id: '2',
      deliveryNumber: 'DD-2024-002',
      date: new Date().toISOString(),
      supplierCode: 'SUP002',
      depotCode: 'DEP002',
      customerName: 'Total Energies',
      location: 'Tema',
      psaNumber: 'PSA-2024-002',
      wbillNumber: 'WB-2024-002',
      invoiceNumber: 'INV-2024-002',
      vehicleRegNumber: 'GR-5678-24',
      transporterCode: 'TR002',
      productType: 'diesel',
      productGrade: 'Regular',
      quantity: 38000,
      unitPrice: 5.25,
      currency: 'GHS',
      totalAmount: 199500,
      status: 'in_transit',
      approvalStatus: 'pending',
      notes: 'En route to customer'
    }
  ]);
});

// Mock suppliers
app.get('/api/suppliers', (req, res) => {
  res.json([
    { id: '1', code: 'SUP001', name: 'Ghana Oil Company', status: 'active' },
    { id: '2', code: 'SUP002', name: 'Tema Oil Refinery', status: 'active' }
  ]);
});

// Mock depots
app.get('/api/depots', (req, res) => {
  res.json([
    { id: '1', code: 'DEP001', name: 'Accra Depot', location: 'Accra', capacity: 500000 },
    { id: '2', code: 'DEP002', name: 'Tema Depot', location: 'Tema', capacity: 1000000 }
  ]);
});

// Mock transporters
app.get('/api/transporters', (req, res) => {
  res.json([
    { id: '1', code: 'TR001', name: 'Fast Logistics', status: 'active' },
    { id: '2', code: 'TR002', name: 'Ghana Transport Co', status: 'active' }
  ]);
});

// Mock stations
app.get('/api/stations', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Accra Main Station',
        location: 'Accra',
        capacity: 500000,
        currentStock: 350000,
        status: 'operational'
      },
      {
        id: '2',
        name: 'Tema Depot',
        location: 'Tema',
        capacity: 1000000,
        currentStock: 750000,
        status: 'operational'
      }
    ]
  });
});

// Mock dealers
app.get('/api/dealers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Premier Petroleum',
        code: 'PP001',
        status: 'active',
        creditLimit: 5000000,
        currentBalance: 2500000
      },
      {
        id: '2',
        name: 'Energy Solutions Ltd',
        code: 'ES002',
        status: 'active',
        creditLimit: 3000000,
        currentBalance: 1500000
      }
    ]
  });
});

// Mock transactions
app.get('/api/transactions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        transactionId: 'TXN-2024-001',
        date: new Date().toISOString(),
        type: 'sale',
        customer: 'Shell Ghana',
        amount: 250000,
        status: 'completed'
      },
      {
        id: '2',
        transactionId: 'TXN-2024-002',
        date: new Date().toISOString(),
        type: 'sale',
        customer: 'Total Energies',
        amount: 195000,
        status: 'pending'
      }
    ]
  });
});

// Mock inventory
app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        product: 'Premium Gasoline',
        quantity: 850000,
        unit: 'liters',
        value: 4250000,
        location: 'Tema Depot'
      },
      {
        id: '2',
        product: 'Diesel',
        quantity: 650000,
        unit: 'liters',
        value: 3250000,
        location: 'Tema Depot'
      },
      {
        id: '3',
        product: 'Kerosene',
        quantity: 150000,
        unit: 'liters',
        value: 600000,
        location: 'Accra Main Station'
      }
    ]
  });
});

// Mock analytics data
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 15750000,
      totalVolume: 1650000,
      activeCustomers: 45,
      pendingOrders: 12,
      monthlyGrowth: 8.5,
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        revenue: [2100000, 2350000, 2500000, 2450000, 2650000, 2850000],
        volume: [250000, 275000, 290000, 285000, 295000, 310000]
      }
    }
  });
});

// Mock UPPF claims
app.get('/api/uppf/claims', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        claimNumber: 'UPPF-2024-001',
        period: 'January 2024',
        amount: 125000,
        status: 'approved',
        submittedDate: '2024-02-05'
      },
      {
        id: '2',
        claimNumber: 'UPPF-2024-002',
        period: 'February 2024',
        amount: 135000,
        status: 'pending',
        submittedDate: '2024-03-05'
      }
    ]
  });
});

// Mock pricing data
app.get('/api/pricing/windows', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        windowId: 'PW-2024-03-01',
        effectiveDate: '2024-03-01',
        expiryDate: '2024-03-15',
        products: [
          { name: 'Premium Gasoline', price: 5.50, currency: 'GHS' },
          { name: 'Diesel', price: 5.25, currency: 'GHS' },
          { name: 'Kerosene', price: 4.00, currency: 'GHS' }
        ],
        status: 'active'
      }
    ]
  });
});

// Mock fleet data
app.get('/api/fleet/vehicles', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        registrationNumber: 'GR-1234-24',
        type: 'Tanker',
        capacity: 45000,
        status: 'on_delivery',
        driver: 'John Mensah',
        lastLocation: 'Tema Highway'
      },
      {
        id: '2',
        registrationNumber: 'GR-5678-24',
        type: 'Tanker',
        capacity: 38000,
        status: 'available',
        driver: 'Kwame Asante',
        lastLocation: 'Depot'
      }
    ]
  });
});

// Mock user profile
app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      username: 'admin',
      email: 'admin@omc-erp.com',
      fullName: 'System Administrator',
      role: 'admin',
      department: 'IT',
      permissions: ['all']
    }
  });
});

// Mock financial data
app.get('/api/financial/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalAssets: 125000000,
      totalLiabilities: 45000000,
      equity: 80000000,
      revenue: {
        daily: 525000,
        weekly: 3675000,
        monthly: 15750000,
        yearly: 189000000
      },
      expenses: {
        daily: 425000,
        weekly: 2975000,
        monthly: 12750000,
        yearly: 153000000
      }
    }
  });
});

// Catch all for other routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.json({
      success: true,
      data: [],
      message: 'Mock API endpoint'
    });
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Serving mock data for Ghana OMC ERP System');
});