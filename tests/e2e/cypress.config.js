const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base configuration
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/e2e/cypress/fixtures',
    screenshotsFolder: 'tests/e2e/cypress/screenshots',
    videosFolder: 'tests/e2e/cypress/videos',
    downloadsFolder: 'tests/e2e/cypress/downloads',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test execution settings
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Video and screenshot settings
    video: true,
    videoCompression: 32,
    videoUploadOnPasses: false,
    screenshotOnRunFailure: true,
    
    // Retry settings
    retries: {
      runMode: 2, // Retry failed tests twice in headless mode
      openMode: 0, // Don't retry in interactive mode
    },
    
    // Environment variables
    env: {
      // API endpoints
      apiUrl: 'http://localhost:3001/api/v1',
      authUrl: 'http://localhost:3001/api/v1/auth',
      pricingUrl: 'http://localhost:3001/api/v1/pricing',
      transactionUrl: 'http://localhost:3001/api/v1/transactions',
      uppfUrl: 'http://localhost:3001/api/v1/uppf',
      
      // Test data
      testTenantId: 'e2e-test-tenant',
      testUserEmail: 'e2e-test@omc-erp.com',
      testUserPassword: 'E2ETestPassword123!',
      
      // Feature flags for conditional testing
      enablePricingModule: true,
      enableUPPFModule: true,
      enableMobileMoneyPayments: true,
      enableGPSTracking: true,
      
      // Performance thresholds
      maxLoadTime: 3000,
      maxApiResponseTime: 2000,
      
      // Ghana-specific test data
      ghanaTestData: {
        validLicense: 'NPA/LIC/2024/001',
        testStationLocation: {
          latitude: 5.6037,
          longitude: -0.1870,
          address: 'Accra Central, Ghana'
        },
        sampleProducts: ['PETROL', 'DIESEL', 'KEROSENE'],
        testRoutes: [
          { id: 'TEMA-ACCRA', distance: 25 },
          { id: 'ACCRA-KUMASI', distance: 250 }
        ]
      }
    },

    setupNodeEvents(on, config) {
      // Custom task implementations
      on('task', {
        // Database seeding and cleanup
        seedTestData: async (data) => {
          const { seedDatabase } = require('./support/database-helper');
          return await seedDatabase(data);
        },
        
        cleanupTestData: async (tenantId) => {
          const { cleanupDatabase } = require('./support/database-helper');
          return await cleanupDatabase(tenantId);
        },
        
        // API utilities
        makeApiCall: async ({ method, url, headers, body }) => {
          const axios = require('axios');
          try {
            const response = await axios({
              method,
              url,
              headers,
              data: body,
              timeout: 10000
            });
            return { status: response.status, data: response.data };
          } catch (error) {
            return { 
              status: error.response?.status || 500, 
              error: error.message,
              data: error.response?.data 
            };
          }
        },
        
        // File operations
        generateTestFile: async ({ type, data, filename }) => {
          const fs = require('fs');
          const path = require('path');
          
          const filePath = path.join(config.fixturesFolder, filename);
          
          switch (type) {
            case 'csv':
              const csv = require('csv-stringify');
              return new Promise((resolve, reject) => {
                csv(data, (err, output) => {
                  if (err) reject(err);
                  fs.writeFileSync(filePath, output);
                  resolve(filePath);
                });
              });
              
            case 'json':
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              return filePath;
              
            default:
              throw new Error(`Unsupported file type: ${type}`);
          }
        },
        
        // Screenshot comparison
        compareScreenshots: async ({ baseline, current, threshold = 0.1 }) => {
          const pixelmatch = require('pixelmatch');
          const PNG = require('pngjs').PNG;
          const fs = require('fs');
          
          const img1 = PNG.sync.read(fs.readFileSync(baseline));
          const img2 = PNG.sync.read(fs.readFileSync(current));
          const { width, height } = img1;
          const diff = new PNG({ width, height });
          
          const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
            threshold: threshold
          });
          
          return {
            totalPixels: width * height,
            diffPixels: numDiffPixels,
            percentDiff: (numDiffPixels / (width * height)) * 100
          };
        },
        
        // Performance monitoring
        measurePerformance: async (url) => {
          const { performance } = require('perf_hooks');
          const axios = require('axios');
          
          const startTime = performance.now();
          try {
            await axios.get(url);
            const endTime = performance.now();
            return {
              success: true,
              responseTime: endTime - startTime
            };
          } catch (error) {
            const endTime = performance.now();
            return {
              success: false,
              responseTime: endTime - startTime,
              error: error.message
            };
          }
        },

        // Email testing utilities
        getTestEmails: async (criteria) => {
          // Integration with email testing service (e.g., Mailhog, MailCatcher)
          const mailService = require('./support/mail-helper');
          return await mailService.getEmails(criteria);
        },

        // Log analysis
        analyzeLogs: async ({ logFile, pattern, timeRange }) => {
          const fs = require('fs');
          const logs = fs.readFileSync(logFile, 'utf8');
          const lines = logs.split('\n');
          
          return lines
            .filter(line => {
              if (pattern && !line.match(new RegExp(pattern))) return false;
              if (timeRange) {
                // Implement time range filtering logic
                return true; // Simplified for example
              }
              return true;
            })
            .map(line => {
              // Parse log entry
              const timestamp = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/)?.[1];
              const level = line.match(/\[(ERROR|WARN|INFO|DEBUG)\]/)?.[1];
              return { timestamp, level, message: line };
            });
        }
      });

      // Browser customization
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // Chrome-specific optimizations
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--allow-running-insecure-content');
          
          // Enable additional Chrome features for testing
          launchOptions.args.push('--enable-features=NetworkService,NetworkServiceLogging');
        }
        
        return launchOptions;
      });

      // Test result processing
      on('after:spec', (spec, results) => {
        // Log test results
        console.log(`Spec: ${spec.name}`);
        console.log(`Tests: ${results.stats.tests}`);
        console.log(`Passes: ${results.stats.passes}`);
        console.log(`Failures: ${results.stats.failures}`);
        console.log(`Duration: ${results.stats.duration}ms`);
        
        // Custom reporting or notifications can be added here
        if (results.stats.failures > 0) {
          console.log('❌ Test failures detected in:', spec.name);
        }
      });

      // Plugin integrations
      require('cypress-terminal-report/src/installLogsPrinter')(on, {
        printLogsToConsole: 'onFail',
        printLogsToFile: 'always',
        outputRoot: config.videosFolder,
        outputTarget: {
          'cypress-logs.txt': 'txt',
          'cypress-logs.json': 'json',
        }
      });

      // Code coverage integration
      require('@cypress/code-coverage/task')(on, config);

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'tests/e2e/cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/component.ts',
    indexHtmlFile: 'tests/e2e/support/component-index.html'
  },

  // Global configuration
  experimentalStudio: true, // Enable Cypress Studio for test recording
  experimentalMemoryManagement: true, // Better memory handling
  chromeWebSecurity: false, // Disable web security for cross-origin testing
  modifyObstructiveCode: true, // Handle obstructive code in apps
  numTestsKeptInMemory: 10, // Limit memory usage
  watchForFileChanges: true, // Auto-reload tests on file changes
  
  // Reporter configuration for CI/CD
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'tests/e2e/cypress/reporter-config.json',
  },
});