const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
const AUTH_BASE = 'http://localhost:3002/api/v1';

// Mock test data
const testData = {
  station: {
    name: 'Test Station',
    code: 'TS001',
    address: '123 Test Street, Accra',
    phone: '+233500000000',
    type: 'COCO',
    location: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  customer: {
    name: 'Test Customer Ltd',
    email: 'customer@test.com',
    phone: '+233500000001',
    type: 'COMMERCIAL'
  },
  transaction: {
    productType: 'PMS',
    quantity: 1000,
    unitPrice: 8.50,
    paymentMethod: 'CASH'
  },
  user: {
    email: 'admin@omc-erp.com',
    password: 'admin123'
  }
};

let authToken = null;

async function authenticate() {
  console.log('🔐 Testing Authentication...');
  
  try {
    // Try API Gateway first
    const response = await axios.post(`${API_BASE}/auth/login`, testData.user);
    authToken = response.data.access_token || response.data.token;
    console.log('✅ Authentication via API Gateway successful');
    return true;
  } catch (error) {
    console.log('❌ API Gateway auth failed, trying direct auth service...');
    
    try {
      // Try direct auth service
      const response = await axios.post(`${AUTH_BASE}/auth/login`, testData.user);
      authToken = response.data.access_token || response.data.token;
      console.log('✅ Authentication via Auth Service successful');
      return true;
    } catch (authError) {
      console.log('❌ Authentication failed entirely');
      console.log('Gateway error:', error.response?.data || error.message);
      console.log('Auth service error:', authError.response?.data || authError.message);
      return false;
    }
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': authToken ? `Bearer ${authToken}` : '',
    'X-Tenant-ID': 'default'
  };
}

async function testStationManagement() {
  console.log('\n🏢 Testing Station Management...');
  
  try {
    // 1. Create a station
    console.log('   Creating new station...');
    const createResponse = await axios.post(`${API_BASE}/stations`, testData.station, {
      headers: getHeaders()
    });
    
    const stationId = createResponse.data.id;
    console.log(`   ✅ Station created with ID: ${stationId}`);
    
    // 2. Retrieve the station
    console.log('   Retrieving station...');
    const getResponse = await axios.get(`${API_BASE}/stations/${stationId}`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Station retrieved: ${getResponse.data.name}`);
    
    // 3. List all stations
    console.log('   Listing all stations...');
    const listResponse = await axios.get(`${API_BASE}/stations`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Found ${listResponse.data.length} stations`);
    
    // 4. Update the station
    console.log('   Updating station...');
    const updateData = { ...testData.station, name: 'Updated Test Station' };
    const updateResponse = await axios.put(`${API_BASE}/stations/${stationId}`, updateData, {
      headers: getHeaders()
    });
    console.log(`   ✅ Station updated: ${updateResponse.data.name}`);
    
    return { success: true, stationId };
  } catch (error) {
    console.log(`   ❌ Station management failed: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testTransactionWorkflow(stationId) {
  console.log('\n💳 Testing Transaction Workflow...');
  
  try {
    // 1. Create a transaction
    console.log('   Creating new transaction...');
    const transactionData = {
      ...testData.transaction,
      stationId,
      totalAmount: testData.transaction.quantity * testData.transaction.unitPrice
    };
    
    const createResponse = await axios.post(`${API_BASE}/transactions`, transactionData, {
      headers: getHeaders()
    });
    
    const transactionId = createResponse.data.id;
    console.log(`   ✅ Transaction created with ID: ${transactionId}`);
    
    // 2. Retrieve the transaction
    console.log('   Retrieving transaction...');
    const getResponse = await axios.get(`${API_BASE}/transactions/${transactionId}`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Transaction retrieved: ${getResponse.data.totalAmount} GHS`);
    
    // 3. Update transaction status
    console.log('   Updating transaction status...');
    const updateResponse = await axios.patch(`${API_BASE}/transactions/${transactionId}`, {
      status: 'COMPLETED'
    }, {
      headers: getHeaders()
    });
    console.log(`   ✅ Transaction status updated: ${updateResponse.data.status}`);
    
    return { success: true, transactionId };
  } catch (error) {
    console.log(`   ❌ Transaction workflow failed: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testInventoryUpdates(stationId) {
  console.log('\n📦 Testing Inventory Updates...');
  
  try {
    // 1. Check current inventory
    console.log('   Checking current inventory...');
    const inventoryResponse = await axios.get(`${API_BASE}/inventory/station/${stationId}`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Retrieved inventory for station`);
    
    // 2. Update inventory levels
    console.log('   Updating inventory levels...');
    const updateData = {
      productType: 'PMS',
      quantity: 5000,
      operation: 'ADD'
    };
    
    const updateResponse = await axios.post(`${API_BASE}/inventory/station/${stationId}/update`, updateData, {
      headers: getHeaders()
    });
    console.log(`   ✅ Inventory updated`);
    
    return { success: true };
  } catch (error) {
    console.log(`   ❌ Inventory update failed: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testFinancialCalculations(transactionId) {
  console.log('\n💰 Testing Financial Calculations...');
  
  try {
    // 1. Calculate margins
    console.log('   Calculating dealer margins...');
    const marginResponse = await axios.get(`${API_BASE}/financial/margins/transaction/${transactionId}`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Margin calculation completed`);
    
    // 2. Generate financial summary
    console.log('   Generating financial summary...');
    const summaryResponse = await axios.get(`${API_BASE}/financial/summary/daily`, {
      headers: getHeaders(),
      params: { date: new Date().toISOString().split('T')[0] }
    });
    console.log(`   ✅ Financial summary generated`);
    
    return { success: true };
  } catch (error) {
    console.log(`   ❌ Financial calculations failed: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testUPPFIntegration(transactionId) {
  console.log('\n🏛️ Testing UPPF Integration...');
  
  try {
    // 1. Submit UPPF claim
    console.log('   Submitting UPPF claim...');
    const claimData = {
      transactionId,
      claimType: 'STANDARD',
      amount: 500.00
    };
    
    const claimResponse = await axios.post(`${API_BASE}/uppf/claims`, claimData, {
      headers: getHeaders()
    });
    console.log(`   ✅ UPPF claim submitted`);
    
    // 2. Check claim status
    console.log('   Checking claim status...');
    const statusResponse = await axios.get(`${API_BASE}/uppf/claims/${claimResponse.data.id}`, {
      headers: getHeaders()
    });
    console.log(`   ✅ Claim status: ${statusResponse.data.status}`);
    
    return { success: true };
  } catch (error) {
    console.log(`   ❌ UPPF integration failed: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testRealTimeUpdates() {
  console.log('\n🔄 Testing Real-time Updates...');
  
  try {
    // Test WebSocket connection for real-time updates
    const WebSocket = require('ws');
    
    return new Promise((resolve) => {
      const ws = new WebSocket('ws://localhost:3010/ws');
      
      ws.on('open', () => {
        console.log('   ✅ WebSocket connection established');
        
        // Subscribe to station updates
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'station-updates'
        }));
        
        setTimeout(() => {
          ws.close();
          resolve({ success: true });
        }, 2000);
      });
      
      ws.on('message', (data) => {
        console.log('   ✅ Received real-time update:', JSON.parse(data));
      });
      
      ws.on('error', (error) => {
        console.log(`   ❌ WebSocket error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      
      setTimeout(() => {
        ws.close();
        resolve({ success: false, error: 'Connection timeout' });
      }, 5000);
    });
  } catch (error) {
    console.log(`   ❌ Real-time updates failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runBusinessWorkflowTests() {
  console.log('🚀 STARTING BUSINESS WORKFLOW INTEGRATION TESTS\n');
  console.log('='.repeat(60));
  
  const results = [];
  let stationId, transactionId;
  
  // 1. Authentication
  const authResult = await authenticate();
  if (!authResult) {
    console.log('\n❌ CRITICAL: Authentication failed. Cannot proceed with business tests.');
    return { overallSuccess: false, authenticationWorking: false };
  }
  
  // 2. Station Management
  const stationResult = await testStationManagement();
  results.push({ name: 'Station Management', ...stationResult });
  if (stationResult.success) {
    stationId = stationResult.stationId;
  }
  
  // 3. Transaction Workflow
  const transactionResult = await testTransactionWorkflow(stationId);
  results.push({ name: 'Transaction Workflow', ...transactionResult });
  if (transactionResult.success) {
    transactionId = transactionResult.transactionId;
  }
  
  // 4. Inventory Updates
  if (stationId) {
    const inventoryResult = await testInventoryUpdates(stationId);
    results.push({ name: 'Inventory Management', ...inventoryResult });
  }
  
  // 5. Financial Calculations
  if (transactionId) {
    const financialResult = await testFinancialCalculations(transactionId);
    results.push({ name: 'Financial Calculations', ...financialResult });
  }
  
  // 6. UPPF Integration
  if (transactionId) {
    const uppfResult = await testUPPFIntegration(transactionId);
    results.push({ name: 'UPPF Integration', ...uppfResult });
  }
  
  // 7. Real-time Updates
  const realtimeResult = await testRealTimeUpdates();
  results.push({ name: 'Real-time Updates', ...realtimeResult });
  
  // Generate Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 BUSINESS WORKFLOW TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = Math.round((successful / total) * 100);
  
  console.log(`\n🎯 BUSINESS WORKFLOW INTEGRATION: ${percentage}%`);
  console.log(`✅ Successful Workflows: ${successful}/${total}`);
  console.log(`❌ Failed Workflows: ${total - successful}/${total}`);
  
  console.log('\n📋 WORKFLOW RESULTS:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.success ? '✅' : '❌'} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🔧 BUSINESS CAPABILITIES STATUS:');
  console.log(`🔐 Authentication: ${authResult ? 'WORKING' : 'FAILED'}`);
  console.log(`🏢 Station Management: ${results.find(r => r.name === 'Station Management')?.success ? 'WORKING' : 'FAILED'}`);
  console.log(`💳 Transaction Processing: ${results.find(r => r.name === 'Transaction Workflow')?.success ? 'WORKING' : 'FAILED'}`);
  console.log(`📦 Inventory Tracking: ${results.find(r => r.name === 'Inventory Management')?.success ? 'WORKING' : 'FAILED'}`);
  console.log(`💰 Financial Calculations: ${results.find(r => r.name === 'Financial Calculations')?.success ? 'WORKING' : 'FAILED'}`);
  console.log(`🏛️ UPPF Integration: ${results.find(r => r.name === 'UPPF Integration')?.success ? 'WORKING' : 'FAILED'}`);
  console.log(`🔄 Real-time Updates: ${results.find(r => r.name === 'Real-time Updates')?.success ? 'WORKING' : 'FAILED'}`);
  
  return {
    overallSuccess: percentage >= 70,
    percentage,
    successful,
    total,
    authenticationWorking: authResult,
    results
  };
}

// Run the tests
if (require.main === module) {
  runBusinessWorkflowTests()
    .then((summary) => {
      console.log(`\n🎉 Business workflow testing completed. Success rate: ${summary.percentage}%`);
      process.exit(summary.overallSuccess ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Business workflow testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runBusinessWorkflowTests };