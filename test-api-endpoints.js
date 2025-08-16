const axios = require('axios');

// Configuration
const API_GATEWAY_URL = 'http://localhost:3000/api/v1';
const DASHBOARD_URL = 'http://localhost:5000';

// Test configurations
const testConfig = {
  timeout: 5000,
  validateStatus: () => true, // Don't throw on HTTP errors
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  details: [],
};

async function testEndpoint(name, url, method = 'GET', data = null, expectedStatus = [200, 401, 403]) {
  try {
    console.log(`Testing ${name}...`);
    
    const config = {
      method,
      url,
      timeout: testConfig.timeout,
      validateStatus: testConfig.validateStatus,
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const status = response.status;
    const isExpected = expectedStatus.includes(status);
    
    const result = {
      name,
      url,
      method,
      status,
      success: isExpected,
      message: isExpected ? 'OK' : `Unexpected status: ${status}`,
      responseTime: response.config.timeout || 0,
    };
    
    testResults.details.push(result);
    
    if (isExpected) {
      testResults.passed++;
      console.log(`✅ ${name}: ${status}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}: ${status} (expected: ${expectedStatus.join(', ')})`);
    }
    
    return result;
  } catch (error) {
    const result = {
      name,
      url,
      method,
      status: 0,
      success: false,
      message: error.code || error.message,
      error: error.message,
    };
    
    testResults.details.push(result);
    testResults.failed++;
    console.log(`❌ ${name}: ${error.code || error.message}`);
    
    return result;
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  console.log(`API Gateway URL: ${API_GATEWAY_URL}`);
  console.log(`Dashboard URL: ${DASHBOARD_URL}\n`);

  // Test API Gateway Health
  await testEndpoint(
    'API Gateway Health Check',
    `${API_GATEWAY_URL}/health`,
    'GET',
    null,
    [200]
  );

  // Test Service Registry Health  
  await testEndpoint(
    'Service Registry Health',
    'http://localhost:3010/registry/health',
    'GET',
    null,
    [200]
  );

  // Test Authentication Endpoints
  await testEndpoint(
    'Auth Login Endpoint',
    `${API_GATEWAY_URL}/auth/login`,
    'POST',
    { email: 'test@example.com', password: 'password' },
    [200, 400, 401]
  );

  await testEndpoint(
    'Auth Register Endpoint',
    `${API_GATEWAY_URL}/auth/register`,
    'POST',
    { email: 'test@example.com', password: 'password', name: 'Test User' },
    [201, 400]
  );

  // Test Business Endpoints (expecting 401 without auth)
  await testEndpoint(
    'Transactions Endpoint',
    `${API_GATEWAY_URL}/transactions`,
    'GET',
    null,
    [200, 401]
  );

  await testEndpoint(
    'Stations Endpoint',
    `${API_GATEWAY_URL}/stations`,
    'GET',
    null,
    [200, 401]
  );

  await testEndpoint(
    'Inventory Endpoint',
    `${API_GATEWAY_URL}/inventory`,
    'GET',
    null,
    [200, 401]
  );

  await testEndpoint(
    'Financial Endpoint',
    `${API_GATEWAY_URL}/financial/chart-of-accounts`,
    'GET',
    null,
    [200, 401]
  );

  // Test Dashboard (should serve Next.js)
  await testEndpoint(
    'Dashboard Home Page',
    DASHBOARD_URL,
    'GET',
    null,
    [200, 404]
  );

  // Test API Documentation
  await testEndpoint(
    'API Documentation',
    `${API_GATEWAY_URL.replace('/api/v1', '')}/api/docs`,
    'GET',
    null,
    [200, 404]
  );

  // Test CORS (preflight)
  await testEndpoint(
    'CORS Preflight Check',
    `${API_GATEWAY_URL}/health`,
    'OPTIONS',
    null,
    [200, 204]
  );

  // Test Service Discovery
  await testEndpoint(
    'Service Discovery - Auth Service',
    'http://localhost:3010/registry/discovery/auth',
    'GET',
    null,
    [200, 404]
  );

  // Test WebSocket connection (simplified)
  await testEndpoint(
    'WebSocket Endpoint',
    'http://localhost:3010/ws',
    'GET',
    null,
    [200, 404, 426] // 426 = Upgrade Required for WebSocket
  );

  // Generate report
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%\n`);

  // Detailed results
  console.log('📋 Detailed Results:');
  testResults.details.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.status || 'ERROR';
    console.log(`${icon} ${result.name}: ${status} - ${result.message}`);
  });

  console.log('\n🔧 Configuration Issues Found:');
  const issues = [];

  // Check for common issues
  testResults.details.forEach(result => {
    if (result.message === 'ECONNREFUSED') {
      issues.push(`❌ Service not running: ${result.url}`);
    } else if (result.status === 404 && result.url.includes('api/v1')) {
      issues.push(`❌ API route not found: ${result.url}`);
    } else if (result.status === 500) {
      issues.push(`❌ Server error: ${result.url}`);
    }
  });

  if (issues.length > 0) {
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('✅ No major configuration issues detected');
  }

  console.log('\n🚀 Testing complete!');
  
  return testResults;
}

// Export for use in other scripts
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint, testResults };