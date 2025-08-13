const newman = require('newman');
const path = require('path');
const fs = require('fs');

/**
 * Automated API Testing Runner for OMC ERP System
 * Runs comprehensive API tests using Newman (Postman CLI)
 */

class NewmanTestRunner {
  constructor() {
    this.collectionsDir = path.join(__dirname, 'postman-collections');
    this.environmentsDir = path.join(__dirname, 'environments');
    this.reportsDir = path.join(__dirname, 'reports');
    this.dataDir = path.join(__dirname, 'test-data');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.reportsDir, this.dataDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Run authentication API tests
   */
  async runAuthTests(environment = 'local') {
    console.log('🔐 Running Authentication API Tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-auth-api.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'htmlextra', 'json'],
        reporter: {
          htmlextra: {
            export: path.join(this.reportsDir, `auth-api-report-${Date.now()}.html`),
            template: path.join(__dirname, 'templates', 'htmlextra-template.hbs'),
            title: 'OMC ERP Authentication API Test Report',
            titleSize: 4,
            logs: true,
            skipHeaders: 'Authorization',
            hideRequestBody: ['password', 'refreshToken'],
            hideResponseBody: ['accessToken', 'refreshToken']
          },
          json: {
            export: path.join(this.reportsDir, `auth-api-results-${Date.now()}.json`)
          }
        },
        iterationData: path.join(this.dataDir, 'auth-test-data.json'),
        timeout: 30000,
        timeoutRequest: 5000,
        timeoutScript: 2000,
        delayRequest: 100, // 100ms delay between requests
        insecure: true, // Allow self-signed certificates in dev
        bail: false, // Continue on failures
        color: 'on',
        verbose: true
      }, (err, summary) => {
        if (err) {
          console.error('❌ Authentication API tests failed:', err);
          reject(err);
        } else {
          this.logSummary('Authentication API', summary);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run pricing API tests
   */
  async runPricingTests(environment = 'local') {
    console.log('💰 Running Pricing API Tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-pricing-api.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'htmlextra', 'json'],
        reporter: {
          htmlextra: {
            export: path.join(this.reportsDir, `pricing-api-report-${Date.now()}.html`),
            title: 'OMC ERP Pricing API Test Report',
            logs: true,
            skipHeaders: 'Authorization'
          },
          json: {
            export: path.join(this.reportsDir, `pricing-api-results-${Date.now()}.json`)
          }
        },
        timeout: 45000, // Longer timeout for complex pricing calculations
        timeoutRequest: 10000,
        bail: false
      }, (err, summary) => {
        if (err) {
          console.error('❌ Pricing API tests failed:', err);
          reject(err);
        } else {
          this.logSummary('Pricing API', summary);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run transaction API tests
   */
  async runTransactionTests(environment = 'local') {
    console.log('🛒 Running Transaction API Tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-transaction-api.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'htmlextra', 'json'],
        reporter: {
          htmlextra: {
            export: path.join(this.reportsDir, `transaction-api-report-${Date.now()}.html`),
            title: 'OMC ERP Transaction API Test Report',
            logs: true
          },
          json: {
            export: path.join(this.reportsDir, `transaction-api-results-${Date.now()}.json`)
          }
        },
        timeout: 60000, // Longer timeout for transaction processing
        timeoutRequest: 15000,
        bail: false
      }, (err, summary) => {
        if (err) {
          console.error('❌ Transaction API tests failed:', err);
          reject(err);
        } else {
          this.logSummary('Transaction API', summary);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run UPPF Claims API tests
   */
  async runUPPFTests(environment = 'local') {
    console.log('🚛 Running UPPF Claims API Tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-uppf-api.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'htmlextra', 'json'],
        reporter: {
          htmlextra: {
            export: path.join(this.reportsDir, `uppf-api-report-${Date.now()}.html`),
            title: 'OMC ERP UPPF Claims API Test Report',
            logs: true
          },
          json: {
            export: path.join(this.reportsDir, `uppf-api-results-${Date.now()}.json`)
          }
        },
        timeout: 120000, // Very long timeout for GPS processing and calculations
        timeoutRequest: 30000,
        bail: false
      }, (err, summary) => {
        if (err) {
          console.error('❌ UPPF Claims API tests failed:', err);
          reject(err);
        } else {
          this.logSummary('UPPF Claims API', summary);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run load tests with high concurrency
   */
  async runLoadTests(environment = 'local', iterations = 100) {
    console.log(`⚡ Running Load Tests with ${iterations} iterations...`);
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-load-test.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'json'],
        reporter: {
          json: {
            export: path.join(this.reportsDir, `load-test-results-${Date.now()}.json`)
          }
        },
        iterationCount: iterations,
        timeout: 300000, // 5 minutes total timeout
        timeoutRequest: 5000,
        bail: false,
        delayRequest: 50 // Minimal delay for load testing
      }, (err, summary) => {
        if (err) {
          console.error('❌ Load tests failed:', err);
          reject(err);
        } else {
          this.logLoadTestSummary(summary, iterations);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run security tests
   */
  async runSecurityTests(environment = 'local') {
    console.log('🔒 Running Security API Tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: path.join(this.collectionsDir, 'omc-erp-security-tests.postman_collection.json'),
        environment: path.join(this.environmentsDir, `${environment}.postman_environment.json`),
        reporters: ['cli', 'htmlextra', 'json'],
        reporter: {
          htmlextra: {
            export: path.join(this.reportsDir, `security-test-report-${Date.now()}.html`),
            title: 'OMC ERP Security Test Report',
            logs: true,
            skipSensitiveData: true
          },
          json: {
            export: path.join(this.reportsDir, `security-test-results-${Date.now()}.json`)
          }
        },
        timeout: 30000,
        timeoutRequest: 10000,
        bail: false
      }, (err, summary) => {
        if (err) {
          console.error('❌ Security tests failed:', err);
          reject(err);
        } else {
          this.logSummary('Security Tests', summary);
          resolve(summary);
        }
      });
    });
  }

  /**
   * Run all API tests in sequence
   */
  async runAllTests(environment = 'local') {
    console.log('🚀 Starting Comprehensive API Test Suite...');
    console.log(`Environment: ${environment}`);
    console.log('=' .repeat(50));

    const startTime = Date.now();
    const results = {
      auth: null,
      pricing: null,
      transactions: null,
      uppf: null,
      security: null,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        totalTime: 0,
        averageResponseTime: 0
      }
    };

    try {
      // Run tests in dependency order
      results.auth = await this.runAuthTests(environment);
      results.pricing = await this.runPricingTests(environment);
      results.transactions = await this.runTransactionTests(environment);
      results.uppf = await this.runUPPFTests(environment);
      results.security = await this.runSecurityTests(environment);

      // Calculate summary
      const allSummaries = [
        results.auth,
        results.pricing,
        results.transactions,
        results.uppf,
        results.security
      ].filter(Boolean);

      results.summary = this.calculateOverallSummary(allSummaries);
      results.summary.totalTime = Date.now() - startTime;

      console.log('\n' + '=' .repeat(50));
      console.log('🎉 ALL API TESTS COMPLETED');
      console.log('=' .repeat(50));
      this.logOverallSummary(results.summary);

      // Generate combined report
      await this.generateCombinedReport(results);

      return results;

    } catch (error) {
      console.error('💥 API Test Suite Failed:', error);
      throw error;
    }
  }

  /**
   * Run parallel load tests for performance validation
   */
  async runParallelLoadTests(environment = 'local') {
    console.log('🚀 Running Parallel Load Tests...');
    
    const testPromises = [
      this.runLoadTests(environment, 50), // Auth load test
      this.runLoadTests(environment, 30), // Pricing load test
      this.runLoadTests(environment, 40), // Transaction load test
    ];

    try {
      const results = await Promise.all(testPromises);
      console.log('✅ Parallel load tests completed successfully');
      
      const combinedResults = this.calculateOverallSummary(results);
      this.logOverallSummary(combinedResults);
      
      return results;
    } catch (error) {
      console.error('❌ Parallel load tests failed:', error);
      throw error;
    }
  }

  /**
   * Log test summary
   */
  logSummary(testType, summary) {
    const { run } = summary;
    const stats = run.stats;
    
    console.log(`\n📊 ${testType} Test Results:`);
    console.log(`   Total Tests: ${stats.tests.total}`);
    console.log(`   ✅ Passed: ${stats.tests.total - stats.tests.failed}`);
    console.log(`   ❌ Failed: ${stats.tests.failed}`);
    console.log(`   ⏱️  Total Time: ${run.timings.completed - run.timings.started}ms`);
    console.log(`   📈 Avg Response: ${Math.round(stats.responseAverage)}ms`);
    
    if (stats.tests.failed > 0) {
      console.log('\n❌ Failed Tests:');
      run.failures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.error.test} - ${failure.error.message}`);
      });
    }
  }

  /**
   * Log load test summary with performance metrics
   */
  logLoadTestSummary(summary, iterations) {
    const { run } = summary;
    const stats = run.stats;
    const totalTime = run.timings.completed - run.timings.started;
    const throughput = (stats.requests.total / totalTime) * 1000; // requests per second

    console.log(`\n⚡ Load Test Results (${iterations} iterations):`);
    console.log(`   Total Requests: ${stats.requests.total}`);
    console.log(`   ✅ Successful: ${stats.requests.total - stats.requests.failed}`);
    console.log(`   ❌ Failed: ${stats.requests.failed}`);
    console.log(`   ⏱️  Total Time: ${totalTime}ms`);
    console.log(`   📈 Avg Response: ${Math.round(stats.responseAverage)}ms`);
    console.log(`   🚀 Throughput: ${throughput.toFixed(2)} req/sec`);
    
    // Performance thresholds
    if (stats.responseAverage > 1000) {
      console.log('⚠️  WARNING: Average response time above 1 second');
    }
    
    if (throughput < 10) {
      console.log('⚠️  WARNING: Low throughput detected');
    }
  }

  /**
   * Calculate overall summary from multiple test runs
   */
  calculateOverallSummary(summaries) {
    return summaries.reduce((overall, summary) => {
      const stats = summary.run.stats;
      
      return {
        totalTests: overall.totalTests + stats.tests.total,
        passedTests: overall.passedTests + (stats.tests.total - stats.tests.failed),
        failedTests: overall.failedTests + stats.tests.failed,
        skippedTests: overall.skippedTests + (stats.tests.skipped || 0),
        totalRequests: (overall.totalRequests || 0) + stats.requests.total,
        avgResponseTime: overall.averageResponseTime 
          ? (overall.averageResponseTime + stats.responseAverage) / 2 
          : stats.responseAverage
      };
    }, {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalRequests: 0,
      averageResponseTime: 0
    });
  }

  /**
   * Log overall test summary
   */
  logOverallSummary(summary) {
    const passRate = (summary.passedTests / summary.totalTests * 100).toFixed(1);
    
    console.log(`\n📋 Overall Test Summary:`);
    console.log(`   🧪 Total Tests: ${summary.totalTests}`);
    console.log(`   ✅ Passed: ${summary.passedTests} (${passRate}%)`);
    console.log(`   ❌ Failed: ${summary.failedTests}`);
    console.log(`   ⏭️  Skipped: ${summary.skippedTests}`);
    console.log(`   📊 Total Requests: ${summary.totalRequests || 'N/A'}`);
    console.log(`   ⚡ Avg Response Time: ${Math.round(summary.avgResponseTime)}ms`);
    console.log(`   ⏰ Total Duration: ${Math.round(summary.totalTime / 1000)}s`);

    // Quality gates
    if (passRate < 95) {
      console.log('\n🚨 QUALITY GATE FAILURE: Pass rate below 95%');
      process.exit(1);
    }

    if (summary.avgResponseTime > 2000) {
      console.log('\n⚠️  PERFORMANCE WARNING: Average response time above 2 seconds');
    }

    console.log(`\n🎯 Test Quality: ${passRate >= 99 ? 'EXCELLENT' : passRate >= 95 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
  }

  /**
   * Generate combined HTML report
   */
  async generateCombinedReport(results) {
    const reportPath = path.join(this.reportsDir, `combined-api-report-${Date.now()}.html`);
    
    const htmlReport = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>OMC ERP API Test Suite - Combined Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
            .summary { background: #ecf0f1; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .test-section { margin: 20px 0; border: 1px solid #bdc3c7; border-radius: 5px; overflow: hidden; }
            .test-header { background: #3498db; color: white; padding: 15px; }
            .test-results { padding: 15px; }
            .passed { color: #27ae60; font-weight: bold; }
            .failed { color: #e74c3c; font-weight: bold; }
            .metric { display: inline-block; margin: 10px 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>OMC ERP API Test Suite - Combined Report</h1>
            <p>Generated: ${new Date().toISOString()}</p>
        </div>
        
        <div class="summary">
            <h2>Overall Summary</h2>
            <div class="metric">Total Tests: <strong>${results.summary.totalTests}</strong></div>
            <div class="metric passed">Passed: ${results.summary.passedTests}</div>
            <div class="metric failed">Failed: ${results.summary.failedTests}</div>
            <div class="metric">Pass Rate: <strong>${(results.summary.passedTests / results.summary.totalTests * 100).toFixed(1)}%</strong></div>
            <div class="metric">Avg Response: <strong>${Math.round(results.summary.avgResponseTime)}ms</strong></div>
        </div>
        
        ${this.generateTestSectionHtml('Authentication API', results.auth)}
        ${this.generateTestSectionHtml('Pricing API', results.pricing)}
        ${this.generateTestSectionHtml('Transaction API', results.transactions)}
        ${this.generateTestSectionHtml('UPPF Claims API', results.uppf)}
        ${this.generateTestSectionHtml('Security Tests', results.security)}
    </body>
    </html>
    `;
    
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`📊 Combined report generated: ${reportPath}`);
  }

  generateTestSectionHtml(name, result) {
    if (!result) return `<div class="test-section"><div class="test-header">${name}</div><div class="test-results">No results available</div></div>`;
    
    const stats = result.run.stats;
    const passed = stats.tests.total - stats.tests.failed;
    
    return `
    <div class="test-section">
        <div class="test-header">${name}</div>
        <div class="test-results">
            <div class="metric">Total: <strong>${stats.tests.total}</strong></div>
            <div class="metric passed">Passed: ${passed}</div>
            <div class="metric failed">Failed: ${stats.tests.failed}</div>
            <div class="metric">Avg Response: <strong>${Math.round(stats.responseAverage)}ms</strong></div>
        </div>
    </div>
    `;
  }
}

// CLI Integration
if (require.main === module) {
  const runner = new NewmanTestRunner();
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  const environment = args[1] || 'local';

  (async () => {
    try {
      switch (command) {
        case 'auth':
          await runner.runAuthTests(environment);
          break;
        case 'pricing':
          await runner.runPricingTests(environment);
          break;
        case 'transactions':
          await runner.runTransactionTests(environment);
          break;
        case 'uppf':
          await runner.runUPPFTests(environment);
          break;
        case 'security':
          await runner.runSecurityTests(environment);
          break;
        case 'load':
          await runner.runParallelLoadTests(environment);
          break;
        case 'all':
        default:
          await runner.runAllTests(environment);
          break;
      }
      process.exit(0);
    } catch (error) {
      console.error('Test execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = NewmanTestRunner;