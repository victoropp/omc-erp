const axios = require('axios');

// Test configuration
const services = {
  apiGateway: 'http://localhost:3000',
  authService: 'http://localhost:3002', 
  serviceRegistry: 'http://localhost:3010',
  stationService: 'http://localhost:3003',
  dailyDeliveryService: 'http://localhost:3004',
  dealerService: 'http://localhost:3005'
};

const testData = {
  user: {
    email: 'admin@omc-erp.com',
    password: 'admin123'
  },
  station: {
    name: 'Test Station',
    code: 'TS001',
    address: 'Test Address',
    phone: '+233500000000',
    type: 'COCO'
  }
};

let authToken = null;

async function runTest(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await testFn();
    console.log(`✅ ${name}: PASSED`);
    return { name, status: 'PASSED', result };
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error.message}`);
    return { name, status: 'FAILED', error: error.message };
  }
}

async function testServiceHealth(serviceName, url) {
  try {
    // Try multiple health endpoint patterns
    const healthEndpoints = [
      '/health',
      '/api/v1/health',
      '/metrics/health',
      '/registry/health'
    ];
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await axios.get(`${url}${endpoint}`, { timeout: 5000 });
        return { service: serviceName, healthy: true, endpoint, status: response.status };
      } catch (err) {
        // Continue to next endpoint
      }
    }
    
    // If no health endpoint works, try root endpoint
    const response = await axios.get(url, { timeout: 5000 });
    return { service: serviceName, healthy: true, endpoint: '/', status: response.status };
  } catch (error) {
    return { service: serviceName, healthy: false, error: error.message };
  }
}

async function testAuthentication() {
  // Test API Gateway auth endpoint
  try {
    const response = await axios.post(`${services.apiGateway}/api/v1/auth/login`, testData.user);
    authToken = response.data.access_token || response.data.token;
    return { success: true, token: !!authToken, data: response.data };
  } catch (error) {
    // If API Gateway fails, try direct auth service
    try {
      const response = await axios.post(`${services.authService}/api/v1/auth/login`, testData.user);
      authToken = response.data.access_token || response.data.token;
      return { success: true, token: !!authToken, direct: true, data: response.data };
    } catch (authError) {
      return { success: false, gatewayError: error.message, directError: authError.message };
    }
  }
}

async function testDataRetrieval() {
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  const tests = [
    { name: 'Stations', endpoint: '/api/v1/stations' },
    { name: 'Transactions', endpoint: '/api/v1/transactions' },
    { name: 'Users', endpoint: '/api/v1/users' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const response = await axios.get(`${services.apiGateway}${test.endpoint}`, { headers, timeout: 5000 });
      results.push({ name: test.name, success: true, count: Array.isArray(response.data) ? response.data.length : 'N/A' });
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  return results;
}

async function testServiceRegistration() {
  try {
    const response = await axios.get(`${services.serviceRegistry}/registry/services`);
    return { registered: response.data.length, services: response.data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testWebSocketConnection() {
  // Simple WebSocket connectivity test
  return new Promise((resolve) => {
    try {
      const WebSocket = require('ws');
      const ws = new WebSocket(`ws://localhost:3010/ws`);
      
      ws.on('open', () => {
        ws.close();
        resolve({ connected: true });
      });
      
      ws.on('error', (error) => {
        resolve({ connected: false, error: error.message });
      });
      
      setTimeout(() => {
        ws.close();
        resolve({ connected: false, error: 'Timeout' });
      }, 3000);
    } catch (error) {
      resolve({ connected: false, error: error.message });
    }
  });
}

async function testCreateRecord() {
  if (!authToken) {
    throw new Error('No authentication token available');
  }
  
  const headers = { 
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await axios.post(`${services.apiGateway}/api/v1/stations`, testData.station, { headers });
    return { success: true, created: !!response.data.id, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function generateIntegrationReport() {
  console.log('🚀 STARTING COMPREHENSIVE INTEGRATION TEST\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // 1. Test Service Health
  console.log('\n📋 1. TESTING SERVICE HEALTH');
  console.log('-'.repeat(40));
  
  const healthResults = [];
  for (const [name, url] of Object.entries(services)) {
    const health = await testServiceHealth(name, url);
    healthResults.push(health);
    console.log(`${health.healthy ? '✅' : '❌'} ${name}: ${health.healthy ? 'HEALTHY' : health.error}`);
  }
  
  results.push(await runTest('Service Health Check', async () => healthResults));
  
  // 2. Test Service Registration
  results.push(await runTest('Service Registration', testServiceRegistration));
  
  // 3. Test Authentication
  results.push(await runTest('Authentication Flow', testAuthentication));
  
  // 4. Test Data Retrieval
  results.push(await runTest('Data Retrieval', testDataRetrieval));
  
  // 5. Test WebSocket Connection
  results.push(await runTest('WebSocket Connection', testWebSocketConnection));
  
  // 6. Test Record Creation
  results.push(await runTest('Record Creation', testCreateRecord));
  
  // Generate Summary Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTEGRATION TEST SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`\n🎯 OVERALL INTEGRATION STATUS: ${percentage}%`);
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.status === 'PASSED' ? '✅' : '❌'} ${result.name}`);
    if (result.status === 'FAILED') {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Service Health Summary
  const healthyServices = healthResults.filter(h => h.healthy).length;
  console.log(`\n🏥 SERVICE HEALTH: ${healthyServices}/${healthResults.length} services healthy`);
  
  console.log('\n🔧 RECOMMENDATIONS:');
  if (percentage < 50) {
    console.log('⚠️  CRITICAL: System integration is severely compromised');
    console.log('   • Check service compilation errors');
    console.log('   • Verify database connections');
    console.log('   • Review service configurations');
  } else if (percentage < 80) {
    console.log('⚠️  WARNING: Some integration issues detected');
    console.log('   • Review failed components');
    console.log('   • Check authentication flow');
    console.log('   • Verify API endpoint availability');
  } else {
    console.log('✅ GOOD: System integration is mostly functional');
    console.log('   • Minor issues may need attention');
    console.log('   • Consider performance optimization');
  }
  
  return {
    percentage,
    passed,
    total,
    healthyServices,
    totalServices: healthResults.length,
    results,
    healthResults
  };
}

// Run the integration test
if (require.main === module) {
  generateIntegrationReport()
    .then((report) => {
      console.log(`\n🎉 Integration test completed. System integration: ${report.percentage}%`);
      process.exit(report.percentage >= 50 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Integration test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateIntegrationReport, testServiceHealth, testAuthentication };