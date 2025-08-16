const axios = require('axios');

// Test specific endpoints to determine what's actually running
async function testSpecificEndpoints() {
  console.log('🔍 Testing Specific Endpoints to Identify Services\n');

  const tests = [
    {
      name: 'Port 3000 - Check if API Gateway or Dashboard',
      url: 'http://localhost:3000',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          if (response.data.includes('Next.js') || response.data.includes('dashboard')) {
            return { service: 'Next.js Dashboard', status: 'RUNNING', data: 'HTML page detected' };
          } else if (response.data.includes('API') || response.data.includes('gateway')) {
            return { service: 'API Gateway', status: 'RUNNING', data: response.data };
          } else {
            return { service: 'Unknown', status: 'RUNNING', data: 'Unknown service' };
          }
        } catch (error) {
          return { service: 'Not Running', status: 'ERROR', data: error.message };
        }
      }
    },
    {
      name: 'Port 3000/api/v1/health - API Gateway Health',
      url: 'http://localhost:3000/api/v1/health',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          return { service: 'API Gateway Health', status: 'RUNNING', data: response.data };
        } catch (error) {
          return { service: 'API Gateway Health', status: 'ERROR', data: error.message };
        }
      }
    },
    {
      name: 'Port 5000 - Dashboard',
      url: 'http://localhost:5000',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          if (response.data.includes('dashboard') || response.data.includes('Next.js')) {
            return { service: 'Dashboard', status: 'RUNNING', data: 'Dashboard detected' };
          } else {
            return { service: 'Unknown', status: 'RUNNING', data: 'Unknown service' };
          }
        } catch (error) {
          return { service: 'Dashboard', status: 'ERROR', data: error.message };
        }
      }
    },
    {
      name: 'Port 3001 - Auth Service',
      url: 'http://localhost:3001',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          return { service: 'Auth Service', status: 'RUNNING', data: response.data };
        } catch (error) {
          return { service: 'Auth Service', status: 'ERROR', data: error.message };
        }
      }
    },
    {
      name: 'Port 3010 - Service Registry',
      url: 'http://localhost:3010',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          return { service: 'Service Registry', status: 'RUNNING', data: response.data };
        } catch (error) {
          return { service: 'Service Registry', status: 'ERROR', data: error.message };
        }
      }
    },
    {
      name: 'Port 3010/registry/health - Service Registry Health',
      url: 'http://localhost:3010/registry/health',
      test: async (url) => {
        try {
          const response = await axios.get(url, { timeout: 3000 });
          return { service: 'Service Registry Health', status: 'RUNNING', data: response.data };
        } catch (error) {
          return { service: 'Service Registry Health', status: 'ERROR', data: error.message };
        }
      }
    }
  ];

  console.log('Port Analysis:');
  for (const test of tests) {
    console.log(`\nTesting ${test.name}...`);
    const result = await test.test(test.url);
    const status = result.status === 'RUNNING' ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.status}`);
    if (result.data && typeof result.data === 'string' && result.data.length < 200) {
      console.log(`   Data: ${result.data}`);
    }
  }

  // Test CORS
  console.log('\n\nCORS Testing:');
  try {
    const corsResponse = await axios.options('http://localhost:3000', {
      headers: {
        'Origin': 'http://localhost:5000',
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 3000
    });
    console.log('✅ CORS preflight successful');
    console.log('   Headers:', corsResponse.headers);
  } catch (error) {
    console.log('❌ CORS preflight failed:', error.message);
  }

  // Check if we can reach the API through different routes
  console.log('\n\nAPI Route Testing:');
  const apiRoutes = [
    'http://localhost:3000/api',
    'http://localhost:3000/api/v1',
    'http://localhost:3000/health',
    'http://localhost:3000/docs'
  ];

  for (const route of apiRoutes) {
    try {
      const response = await axios.get(route, { timeout: 3000 });
      console.log(`✅ ${route}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route}: ${error.response?.status || error.message}`);
    }
  }
}

if (require.main === module) {
  testSpecificEndpoints().catch(console.error);
}

module.exports = { testSpecificEndpoints };