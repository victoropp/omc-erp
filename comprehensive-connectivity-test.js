const axios = require('axios');
const { spawn } = require('child_process');

class ConnectivityTester {
  constructor() {
    this.results = {
      services: {},
      connectivity: {},
      cors: {},
      authentication: {},
      issues: [],
      recommendations: []
    };
  }

  async testService(name, url, expectedType = 'service') {
    console.log(`Testing ${name} at ${url}...`);
    
    try {
      const response = await axios.get(url, { 
        timeout: 5000,
        validateStatus: () => true // Don't throw on HTTP errors
      });
      
      const isHtml = response.data && response.data.includes('<html');
      const isJson = response.headers['content-type']?.includes('application/json');
      const isApi = response.data && (
        typeof response.data === 'object' || 
        response.data.includes('api') || 
        response.data.includes('service')
      );

      let serviceType = 'unknown';
      if (isHtml) serviceType = 'web-app';
      else if (isJson || isApi) serviceType = 'api-service';

      this.results.services[name] = {
        url,
        status: 'RUNNING',
        httpStatus: response.status,
        serviceType,
        responseTime: response.headers.date ? new Date() - new Date(response.headers.date) : 'N/A',
        contentType: response.headers['content-type'],
        isHealthy: response.status >= 200 && response.status < 400
      };

      console.log(`✅ ${name}: ${response.status} (${serviceType})`);
      return true;
    } catch (error) {
      this.results.services[name] = {
        url,
        status: 'ERROR',
        error: error.code || error.message,
        isHealthy: false
      };
      console.log(`❌ ${name}: ${error.code || error.message}`);
      return false;
    }
  }

  async testConnectivity(frontendUrl, backendUrl) {
    console.log(`\nTesting connectivity from ${frontendUrl} to ${backendUrl}...`);
    
    try {
      // Test CORS preflight
      const corsResponse = await axios.options(backendUrl, {
        headers: {
          'Origin': frontendUrl,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        },
        timeout: 5000
      });

      this.results.cors[`${frontendUrl}->${backendUrl}`] = {
        preflightSuccess: true,
        allowedOrigins: corsResponse.headers['access-control-allow-origin'],
        allowedMethods: corsResponse.headers['access-control-allow-methods'],
        allowedHeaders: corsResponse.headers['access-control-allow-headers']
      };

      console.log(`✅ CORS preflight successful`);
    } catch (error) {
      this.results.cors[`${frontendUrl}->${backendUrl}`] = {
        preflightSuccess: false,
        error: error.message
      };
      console.log(`❌ CORS preflight failed: ${error.message}`);
    }

    // Test actual connectivity
    try {
      const connectivityResponse = await axios.get(backendUrl, {
        headers: { 'Origin': frontendUrl },
        timeout: 5000
      });

      this.results.connectivity[`${frontendUrl}->${backendUrl}`] = {
        success: true,
        status: connectivityResponse.status
      };
      console.log(`✅ Direct connectivity successful`);
    } catch (error) {
      this.results.connectivity[`${frontendUrl}->${backendUrl}`] = {
        success: false,
        error: error.message
      };
      console.log(`❌ Direct connectivity failed: ${error.message}`);
    }
  }

  async testAuthentication(authUrl) {
    console.log(`\nTesting authentication at ${authUrl}...`);
    
    try {
      // Test login endpoint
      const loginResponse = await axios.post(`${authUrl}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword'
      }, {
        timeout: 5000,
        validateStatus: () => true
      });

      this.results.authentication.login = {
        endpointExists: loginResponse.status !== 404,
        status: loginResponse.status,
        acceptsRequests: loginResponse.status !== 405,
        response: loginResponse.status < 500 ? 'Server responding' : 'Server error'
      };

      console.log(`✅ Auth login endpoint: ${loginResponse.status}`);
    } catch (error) {
      this.results.authentication.login = {
        endpointExists: false,
        error: error.message
      };
      console.log(`❌ Auth login endpoint: ${error.message}`);
    }
  }

  analyzeIssues() {
    console.log('\n🔍 Analyzing Issues...');

    // Check for port conflicts
    const runningServices = Object.entries(this.results.services)
      .filter(([name, service]) => service.status === 'RUNNING');

    const portConflicts = {};
    runningServices.forEach(([name, service]) => {
      const port = service.url.match(/:(\d+)/)?.[1];
      if (port) {
        if (!portConflicts[port]) portConflicts[port] = [];
        portConflicts[port].push({ name, serviceType: service.serviceType });
      }
    });

    Object.entries(portConflicts).forEach(([port, services]) => {
      if (services.length > 1) {
        this.results.issues.push({
          type: 'PORT_CONFLICT',
          port,
          services: services.map(s => s.name),
          description: `Port ${port} has multiple services: ${services.map(s => `${s.name} (${s.serviceType})`).join(', ')}`
        });
      }
    });

    // Check for missing API endpoints
    const hasApiGateway = runningServices.some(([name, service]) => 
      service.serviceType === 'api-service' && name.toLowerCase().includes('gateway')
    );

    if (!hasApiGateway) {
      this.results.issues.push({
        type: 'MISSING_API_GATEWAY',
        description: 'No API Gateway detected - frontend cannot communicate with backend services'
      });
    }

    // Check for service registry
    const hasServiceRegistry = runningServices.some(([name]) => 
      name.toLowerCase().includes('registry')
    );

    if (!hasServiceRegistry) {
      this.results.issues.push({
        type: 'MISSING_SERVICE_REGISTRY',
        description: 'Service Registry not running - services cannot discover each other'
      });
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');

    // Check current state
    const dashboardOnPort3000 = this.results.services['Port 3000']?.serviceType === 'web-app';
    const noApiGateway = !Object.values(this.results.services).some(s => 
      s.serviceType === 'api-service' && s.url.includes('3000')
    );

    if (dashboardOnPort3000 && noApiGateway) {
      this.results.recommendations.push({
        priority: 'HIGH',
        title: 'Fix Port Configuration',
        description: 'Dashboard is running on port 3000 instead of API Gateway',
        actions: [
          'Stop current services',
          'Ensure API Gateway starts on port 3000',
          'Ensure Dashboard starts on port 5000',
          'Update service startup configuration'
        ]
      });
    }

    if (this.results.issues.some(i => i.type === 'MISSING_SERVICE_REGISTRY')) {
      this.results.recommendations.push({
        priority: 'HIGH',
        title: 'Start Service Registry',
        description: 'Service Registry is required for service discovery',
        actions: [
          'Navigate to services/service-registry directory',
          'Run: npm install',
          'Run: npm run dev',
          'Verify service starts on port 3010'
        ]
      });
    }

    // CORS recommendations
    if (Object.values(this.results.cors).some(c => !c.preflightSuccess)) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        title: 'Configure CORS',
        description: 'CORS configuration needs to be properly set up',
        actions: [
          'Ensure API Gateway allows origin http://localhost:5000',
          'Configure Access-Control-Allow-Headers for Authorization',
          'Enable credentials if needed for authentication'
        ]
      });
    }
  }

  generateReport() {
    console.log('\n📊 COMPREHENSIVE API CONNECTIVITY REPORT');
    console.log('=' .repeat(60));

    // Services Status
    console.log('\n🎯 SERVICES STATUS:');
    Object.entries(this.results.services).forEach(([name, service]) => {
      const status = service.isHealthy ? '✅' : '❌';
      const type = service.serviceType ? `(${service.serviceType})` : '';
      console.log(`${status} ${name}: ${service.status} ${type}`);
      if (service.httpStatus) {
        console.log(`   HTTP Status: ${service.httpStatus}`);
      }
      if (service.error) {
        console.log(`   Error: ${service.error}`);
      }
    });

    // Connectivity Status
    console.log('\n🔗 CONNECTIVITY STATUS:');
    Object.entries(this.results.connectivity).forEach(([connection, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${connection}: ${result.success ? 'Connected' : result.error}`);
    });

    // CORS Status
    console.log('\n🌐 CORS STATUS:');
    Object.entries(this.results.cors).forEach(([connection, result]) => {
      const status = result.preflightSuccess ? '✅' : '❌';
      console.log(`${status} ${connection}: ${result.preflightSuccess ? 'Configured' : result.error}`);
    });

    // Issues
    console.log('\n⚠️  ISSUES FOUND:');
    if (this.results.issues.length === 0) {
      console.log('✅ No major issues detected');
    } else {
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }

    // Recommendations
    console.log('\n🚀 RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log('   Actions:');
      rec.actions.forEach(action => console.log(`   • ${action}`));
    });

    // Summary
    const totalServices = Object.keys(this.results.services).length;
    const healthyServices = Object.values(this.results.services).filter(s => s.isHealthy).length;
    const successRate = totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 0;

    console.log('\n📈 SUMMARY:');
    console.log(`• Services Tested: ${totalServices}`);
    console.log(`• Healthy Services: ${healthyServices}`);
    console.log(`• Success Rate: ${successRate}%`);
    console.log(`• Critical Issues: ${this.results.issues.filter(i => i.type.includes('MISSING')).length}`);
    console.log(`• High Priority Recommendations: ${this.results.recommendations.filter(r => r.priority === 'HIGH').length}`);

    return this.results;
  }
}

async function runComprehensiveTest() {
  const tester = new ConnectivityTester();

  console.log('🚀 Starting Comprehensive API Connectivity Test\n');

  // Test all potential service endpoints
  await tester.testService('API Gateway (Port 3000)', 'http://localhost:3000');
  await tester.testService('API Gateway Health', 'http://localhost:3000/api/v1/health');
  await tester.testService('Dashboard (Port 3001)', 'http://localhost:3001');
  await tester.testService('Auth Service (Port 3002)', 'http://localhost:3002');
  await tester.testService('Service Registry (Port 9999)', 'http://localhost:9999');
  await tester.testService('Service Registry Health', 'http://localhost:9999/registry/health');
  await tester.testService('Financial Service Health', 'http://localhost:3000/api/v1/financial/health');

  // Test connectivity between frontend and backend
  await tester.testConnectivity('http://localhost:3001', 'http://localhost:3000');
  await tester.testConnectivity('http://localhost:3001', 'http://localhost:3000/api/v1/health');

  // Test authentication
  await tester.testAuthentication('http://localhost:3000/api/v1');

  // Analyze and generate report
  tester.analyzeIssues();
  const report = tester.generateReport();

  return report;
}

if (require.main === module) {
  runComprehensiveTest().catch(console.error);
}

module.exports = { runComprehensiveTest, ConnectivityTester };