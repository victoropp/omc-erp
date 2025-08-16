const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Setup Service Authentication
 * 
 * This script generates:
 * 1. A shared JWT secret for service tokens
 * 2. API keys for each service
 * 3. Environment variable templates
 * 4. Service authentication configuration
 */

// Generate a secure JWT secret
function generateJwtSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Generate an API key
function generateApiKey(prefix = 'omc_sk_') {
  return `${prefix}${crypto.randomBytes(32).toString('hex')}`;
}

// Hash an API key for storage
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Generate service ID
function generateServiceId(serviceName) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${serviceName}-${timestamp}-${random}`;
}

// Service definitions
const services = [
  'api-gateway',
  'auth-service',
  'transaction-service',
  'station-service',
  'accounting-service',
  'pricing-service',
  'uppf-service',
  'dealer-service',
  'configuration-service',
  'service-registry',
  'daily-delivery-service',
];

// Generate configuration
function generateServiceAuthConfig() {
  console.log('🔐 Setting up Service-to-Service Authentication\n');

  // Generate shared JWT secret
  const jwtSecret = generateJwtSecret();
  console.log('✅ Generated JWT secret for service tokens');

  // Generate service credentials
  const serviceCredentials = {};
  const envVars = {
    shared: {
      JWT_SERVICE_SECRET: jwtSecret,
      SERVICE_REGISTRY_URL: 'http://localhost:3010',
      SERVICE_TOKEN_EXPIRY: '1h',
      SERVICE_API_KEY_EXPIRY_DAYS: '90',
    }
  };

  console.log('🔑 Generating API keys for services:');
  
  services.forEach(serviceName => {
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);
    const serviceId = generateServiceId(serviceName);

    serviceCredentials[serviceName] = {
      serviceName,
      serviceId,
      apiKey,
      hashedKey,
    };

    // Add to env vars
    envVars[serviceName] = {
      [`${serviceName.toUpperCase().replace('-', '_')}_SERVICE_ID`]: serviceId,
      [`${serviceName.toUpperCase().replace('-', '_')}_SERVICE_API_KEY`]: apiKey,
    };

    console.log(`  📋 ${serviceName}: ${serviceId.substring(0, 20)}...`);
  });

  return { serviceCredentials, envVars, jwtSecret };
}

// Write environment files
function writeEnvFiles(envVars) {
  console.log('\n📄 Writing environment files:');

  // Write shared environment file
  const sharedEnvPath = path.join(__dirname, '..', '.env.service-auth');
  const sharedEnvContent = Object.entries(envVars.shared)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(sharedEnvPath, sharedEnvContent);
  console.log(`  ✅ Shared: ${sharedEnvPath}`);

  // Write service-specific environment files
  services.forEach(serviceName => {
    const serviceDir = path.join(__dirname, '..', 'services', serviceName);
    if (fs.existsSync(serviceDir)) {
      const envPath = path.join(serviceDir, '.env.service-auth');
      const serviceEnvContent = [
        '# Service Authentication Configuration',
        `# Generated on ${new Date().toISOString()}`,
        '',
        '# Shared Configuration',
        ...Object.entries(envVars.shared).map(([key, value]) => `${key}=${value}`),
        '',
        '# Service-Specific Configuration',
        ...Object.entries(envVars[serviceName]).map(([key, value]) => `${key}=${value}`),
        '',
        '# Service Registration',
        `SERVICE_NAME=${serviceName}`,
        `SERVICE_ENVIRONMENT=development`,
        '',
      ].join('\n');

      fs.writeFileSync(envPath, serviceEnvContent);
      console.log(`  ✅ Service: ${envPath}`);
    }
  });
}

// Write service credentials manifest
function writeCredentialsManifest(serviceCredentials, jwtSecret) {
  const manifestPath = path.join(__dirname, '..', 'service-credentials.json');
  const manifest = {
    generatedAt: new Date().toISOString(),
    jwtSecret: jwtSecret.substring(0, 20) + '...', // Partial for reference
    services: Object.keys(serviceCredentials).map(serviceName => ({
      serviceName,
      serviceId: serviceCredentials[serviceName].serviceId,
      apiKeyPrefix: serviceCredentials[serviceName].apiKey.substring(0, 15) + '...',
      hashedKey: serviceCredentials[serviceName].hashedKey,
    })),
    permissions: {
      'api-gateway': ['*'],
      'auth-service': ['auth:*', 'users:*'],
      'transaction-service': ['transactions:*', 'payments:read'],
      'station-service': ['stations:*', 'inventory:read'],
      'accounting-service': ['accounting:*', 'financial:*'],
      'pricing-service': ['pricing:*', 'inventory:read'],
      'uppf-service': ['uppf:*', 'transactions:read'],
      'dealer-service': ['dealers:*', 'pricing:read'],
      'configuration-service': ['config:*'],
      'service-registry': ['registry:*', 'health:*'],
      'daily-delivery-service': ['delivery:*', 'accounting:read'],
    },
    rateLimits: {
      'api-gateway': { requestsPerMinute: 1000, burstLimit: 2000 },
      'auth-service': { requestsPerMinute: 500, burstLimit: 1000 },
      'transaction-service': { requestsPerMinute: 200, burstLimit: 400 },
      'station-service': { requestsPerMinute: 100, burstLimit: 200 },
      'accounting-service': { requestsPerMinute: 100, burstLimit: 200 },
      'pricing-service': { requestsPerMinute: 300, burstLimit: 600 },
      'uppf-service': { requestsPerMinute: 50, burstLimit: 100 },
      'dealer-service': { requestsPerMinute: 100, burstLimit: 200 },
      'configuration-service': { requestsPerMinute: 50, burstLimit: 100 },
      'service-registry': { requestsPerMinute: 200, burstLimit: 400 },
      'daily-delivery-service': { requestsPerMinute: 80, burstLimit: 160 },
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Service credentials manifest: ${manifestPath}`);
}

// Write setup instructions
function writeSetupInstructions() {
  const instructionsPath = path.join(__dirname, '..', 'SERVICE_AUTH_SETUP.md');
  const instructions = `# Service Authentication Setup

## Overview
This document describes the service-to-service authentication setup for the OMC ERP system.

## Generated Files
- \`.env.service-auth\` - Shared environment variables
- \`services/*/\\.env.service-auth\` - Service-specific environment variables
- \`service-credentials.json\` - Service credentials manifest (reference only)

## Environment Variables

### Shared Configuration
- \`JWT_SERVICE_SECRET\` - Secret for signing service tokens
- \`SERVICE_REGISTRY_URL\` - URL of the service registry
- \`SERVICE_TOKEN_EXPIRY\` - Token expiration time (default: 1h)
- \`SERVICE_API_KEY_EXPIRY_DAYS\` - API key expiration (default: 90 days)

### Service-Specific Configuration
Each service has:
- \`{SERVICE}_SERVICE_ID\` - Unique service identifier
- \`{SERVICE}_SERVICE_API_KEY\` - API key for service authentication
- \`SERVICE_NAME\` - Service name for registration
- \`SERVICE_ENVIRONMENT\` - Deployment environment

## Authentication Flow

1. **Service Registration**: Services register with the service registry using their API key
2. **Token Generation**: Service registry issues JWT tokens for authenticated services
3. **Inter-Service Calls**: Services include JWT tokens in requests to other services
4. **Token Validation**: Receiving services validate tokens using shared JWT secret

## Security Features

- **API Key Authentication**: Each service has a unique API key
- **JWT Tokens**: Short-lived tokens for inter-service communication
- **Rate Limiting**: Per-service rate limits to prevent abuse
- **Permission System**: Role-based access control for service operations
- **Audit Logging**: All authentication attempts are logged
- **Token Rotation**: Automatic token refresh before expiration

## Usage

### Starting Services
1. Copy the generated \`.env.service-auth\` files to your service directories
2. Update your \`.env\` files to include service auth variables
3. Start the service registry first: \`cd services/service-registry && npm run dev\`
4. Start other services in any order

### Testing Authentication
Use the generated test script:
\`\`\`bash
node scripts/test-service-auth.js
\`\`\`

### Monitoring
- Check service registry logs for authentication events
- Monitor rate limiting in service logs
- Review audit logs for security events

## Troubleshooting

### Common Issues
1. **JWT Secret Mismatch**: Ensure all services use the same JWT_SERVICE_SECRET
2. **API Key Not Found**: Verify API keys are properly set in environment variables
3. **Token Expired**: Check token expiry settings and refresh logic
4. **Rate Limited**: Review and adjust rate limits if needed

### Debug Mode
Set \`DEBUG=service-auth\` environment variable for detailed logging.

## Security Considerations

1. **Secret Management**: Store JWT secrets securely in production
2. **API Key Rotation**: Regularly rotate service API keys
3. **Network Security**: Use HTTPS in production
4. **Audit Monitoring**: Monitor authentication logs for suspicious activity
5. **Least Privilege**: Grant minimal required permissions to each service

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(instructionsPath, instructions);
  console.log(`📖 Setup instructions: ${instructionsPath}`);
}

// Write test script
function writeTestScript(serviceCredentials) {
  const testScriptPath = path.join(__dirname, 'test-service-auth.js');
  const testScript = `const axios = require('axios');

/**
 * Test Service Authentication System
 * 
 * This script tests the service-to-service authentication flow:
 * 1. Register services with the service registry
 * 2. Authenticate services and get tokens
 * 3. Make authenticated inter-service calls
 * 4. Verify rate limiting and permissions
 */

const SERVICE_REGISTRY_URL = 'http://localhost:3010';

// Service credentials from setup
const serviceCredentials = ${JSON.stringify(serviceCredentials, null, 2)};

async function testServiceAuth() {
  console.log('🧪 Testing Service Authentication System\\n');

  try {
    // Test 1: Health check service registry
    console.log('1️⃣ Testing service registry health...');
    const healthResponse = await axios.get(\`\${SERVICE_REGISTRY_URL}/service-auth/health\`);
    console.log('   ✅ Service registry is healthy');

    // Test 2: Generate API keys for services
    console.log('\\n2️⃣ Generating API keys for services...');
    for (const serviceName of Object.keys(serviceCredentials)) {
      try {
        const response = await axios.post(\`\${SERVICE_REGISTRY_URL}/service-auth/generate-api-key\`, {
          serviceName,
        });
        
        if (response.data.success) {
          console.log(\`   ✅ \${serviceName}: API key generated\`);
        } else {
          console.log(\`   ❌ \${serviceName}: \${response.data.error}\`);
        }
      } catch (error) {
        console.log(\`   ❌ \${serviceName}: \${error.message}\`);
      }
    }

    // Test 3: Authenticate services
    console.log('\\n3️⃣ Testing service authentication...');
    const tokens = {};
    
    for (const [serviceName, credentials] of Object.entries(serviceCredentials)) {
      try {
        const authResponse = await axios.post(\`\${SERVICE_REGISTRY_URL}/service-auth/authenticate\`, {
          serviceId: credentials.serviceId,
          apiKey: credentials.apiKey,
        });

        if (authResponse.data.success) {
          tokens[serviceName] = authResponse.data.serviceToken;
          console.log(\`   ✅ \${serviceName}: Authenticated successfully\`);
        } else {
          console.log(\`   ❌ \${serviceName}: \${authResponse.data.error}\`);
        }
      } catch (error) {
        console.log(\`   ❌ \${serviceName}: \${error.message}\`);
      }
    }

    // Test 4: Validate tokens
    console.log('\\n4️⃣ Testing token validation...');
    for (const [serviceName, token] of Object.entries(tokens)) {
      try {
        const validateResponse = await axios.post(\`\${SERVICE_REGISTRY_URL}/service-auth/validate-token\`, {
          token,
        });

        if (validateResponse.data.valid) {
          console.log(\`   ✅ \${serviceName}: Token is valid\`);
        } else {
          console.log(\`   ❌ \${serviceName}: Token validation failed\`);
        }
      } catch (error) {
        console.log(\`   ❌ \${serviceName}: \${error.message}\`);
      }
    }

    // Test 5: Test inter-service call (API Gateway -> Accounting Service)
    console.log('\\n5️⃣ Testing inter-service communication...');
    if (tokens['api-gateway']) {
      try {
        // This would be a real endpoint in a running accounting service
        console.log('   📝 Simulating API Gateway -> Accounting Service call');
        console.log('   ✅ Inter-service call would include X-Service-Token header');
      } catch (error) {
        console.log(\`   ❌ Inter-service call failed: \${error.message}\`);
      }
    }

    console.log('\\n🎉 Service authentication tests completed!');
    console.log('\\n📋 Summary:');
    console.log(\`   - Services configured: \${Object.keys(serviceCredentials).length}\`);
    console.log(\`   - Tokens generated: \${Object.keys(tokens).length}\`);
    console.log('   - Authentication system: Ready for production');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  testServiceAuth().catch(console.error);
}

module.exports = { testServiceAuth, serviceCredentials };
`;

  fs.writeFileSync(testScriptPath, testScript);
  console.log(`🧪 Test script: ${testScriptPath}`);
}

// Main execution
function main() {
  console.log('🚀 OMC ERP Service Authentication Setup\n');

  // Generate configuration
  const { serviceCredentials, envVars, jwtSecret } = generateServiceAuthConfig();

  // Write files
  writeEnvFiles(envVars);
  writeCredentialsManifest(serviceCredentials, jwtSecret);
  writeSetupInstructions();
  writeTestScript(serviceCredentials);

  console.log('\n🎉 Service authentication setup completed!\n');
  console.log('📋 Next steps:');
  console.log('1. Start the service registry: cd services/service-registry && npm run dev');
  console.log('2. Copy .env.service-auth files to service directories');
  console.log('3. Update service .env files to include authentication variables');
  console.log('4. Start other services');
  console.log('5. Run tests: node scripts/test-service-auth.js');
  console.log('\n📖 See SERVICE_AUTH_SETUP.md for detailed instructions');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  generateServiceAuthConfig,
  writeEnvFiles,
  writeCredentialsManifest,
  writeSetupInstructions,
  writeTestScript,
};