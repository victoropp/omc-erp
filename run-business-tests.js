#!/usr/bin/env node

/**
 * BUSINESS LOGIC TEST RUNNER
 * 
 * This script executes comprehensive business logic tests for the Ghana OMC ERP System
 * It validates data integrity, calculation accuracy, workflow completion, and error handling
 * 
 * Usage: node run-business-tests.js [--quick] [--verbose] [--workflow=station|transaction|dealer|financial|uppf|inventory]
 */

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

// Configuration
const CONFIG = {
  services: [
    { name: 'API Gateway', port: 3001, path: 'services/api-gateway' },
    { name: 'Station Service', port: 3002, path: 'services/station-service' },
    { name: 'Transaction Service', port: 3003, path: 'services/transaction-service' },
    { name: 'Pricing Service', port: 3004, path: 'services/pricing-service' },
    { name: 'Accounting Service', port: 3005, path: 'services/accounting-service' },
    { name: 'UPPF Service', port: 3006, path: 'services/uppf-service' },
    { name: 'Dealer Service', port: 3007, path: 'services/dealer-service' },
    { name: 'Inventory Service', port: 3008, path: 'services/inventory-service' },
    { name: 'Daily Delivery Service', port: 3009, path: 'services/daily-delivery-service' }
  ],
  healthCheckTimeout: 30000,
  testTimeout: 300000, // 5 minutes
  maxRetries: 3
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  verbose: args.includes('--verbose'),
  workflow: args.find(arg => arg.startsWith('--workflow='))?.split('=')[1],
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
GHANA OMC ERP - BUSINESS LOGIC TEST RUNNER

Usage: node run-business-tests.js [options]

Options:
  --quick              Run basic tests only (faster execution)
  --verbose            Show detailed output from all tests
  --workflow=<name>    Run specific workflow tests only
                       Options: station, transaction, dealer, financial, uppf, inventory
  --help, -h          Show this help message

Examples:
  node run-business-tests.js                    # Run all comprehensive tests
  node run-business-tests.js --quick            # Run basic validation tests
  node run-business-tests.js --workflow=station # Run only station management tests
  node run-business-tests.js --verbose          # Show detailed test output

This script will:
1. Check if all required services are running
2. Validate service health endpoints
3. Execute comprehensive business logic tests
4. Generate detailed test reports
5. Validate 100% business rule compliance

Results are saved to business-logic-test-report.json
  `);
  process.exit(0);
}

console.log('\n🧪 GHANA OMC ERP - BUSINESS LOGIC TEST RUNNER');
console.log('='.repeat(80));
console.log(`Started at: ${new Date().toISOString()}`);
console.log(`Test Mode: ${options.quick ? 'Quick' : 'Comprehensive'}`);
if (options.workflow) {
  console.log(`Workflow Focus: ${options.workflow}`);
}
console.log('='.repeat(80));

/**
 * Check if a service is running on the specified port
 */
async function checkServiceHealth(service) {
  const maxAttempts = CONFIG.maxRetries;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`http://localhost:${service.port}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log(`✅ ${service.name} is healthy on port ${service.port}`);
        return true;
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        console.log(`❌ ${service.name} is not responding on port ${service.port}`);
        if (options.verbose) {
          console.log(`   Error: ${error.message}`);
        }
        return false;
      } else {
        console.log(`⏳ ${service.name} health check attempt ${attempt}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  return false;
}

/**
 * Check if all required services are running
 */
async function validateServiceAvailability() {
  console.log('\n🔍 CHECKING SERVICE AVAILABILITY');
  console.log('-'.repeat(50));
  
  const healthResults = await Promise.all(
    CONFIG.services.map(service => checkServiceHealth(service))
  );
  
  const healthyServices = healthResults.filter(Boolean).length;
  const totalServices = CONFIG.services.length;
  
  console.log(`\n📊 Service Health Summary: ${healthyServices}/${totalServices} services healthy`);
  
  if (healthyServices === 0) {
    console.log('\n❌ CRITICAL: No services are running!');
    console.log('\nTo start services, run:');
    console.log('  npm run start:all');
    console.log('  # or');
    console.log('  docker-compose up -d');
    process.exit(1);
  }
  
  if (healthyServices < totalServices) {
    console.log(`\n⚠️  WARNING: ${totalServices - healthyServices} services are not running`);
    console.log('Some tests may fail. Consider starting all services for complete testing.');
    
    const unhealthyServices = CONFIG.services.filter((service, index) => !healthResults[index]);
    unhealthyServices.forEach(service => {
      console.log(`   • ${service.name} (port ${service.port})`);
    });
    
    // Ask user if they want to continue
    if (!options.quick) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('\nContinue with partial service availability? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('Test execution cancelled.');
        process.exit(0);
      }
    }
  }
  
  return healthyServices;
}

/**
 * Execute the business logic tests
 */
async function runBusinessLogicTests() {
  console.log('\n🚀 EXECUTING BUSINESS LOGIC TESTS');
  console.log('-'.repeat(50));
  
  const testScript = path.join(__dirname, 'business-logic-tests.js');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('node', [testScript], {
      stdio: options.verbose ? 'inherit' : 'pipe',
      cwd: __dirname
    });
    
    let output = '';
    let errorOutput = '';
    
    if (!options.verbose) {
      testProcess.stdout?.on('data', (data) => {
        output += data.toString();
        // Show progress indicators
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.includes('✅') || line.includes('❌') || line.includes('⚠️')) {
            console.log(line);
          }
        });
      });
      
      testProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
    }
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Business logic tests completed successfully!');
        resolve({ success: true, output, errorOutput });
      } else {
        console.log(`\n❌ Business logic tests failed with exit code ${code}`);
        if (!options.verbose && errorOutput) {
          console.log('\nError Output:');
          console.log(errorOutput);
        }
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(`\n❌ Failed to start test process: ${error.message}`);
      reject(error);
    });
    
    // Set timeout
    setTimeout(() => {
      testProcess.kill('SIGTERM');
      reject(new Error('Test execution timed out'));
    }, CONFIG.testTimeout);
  });
}

/**
 * Generate and display test summary
 */
async function displayTestSummary() {
  try {
    const fs = require('fs');
    const reportPath = path.join(__dirname, 'business-logic-test-report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.log('\n⚠️  Test report not found. Tests may not have completed successfully.');
      return;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    console.log('\n📊 BUSINESS LOGIC TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${report.summary.total}`);
    console.log(`   Passed: ${report.summary.passed} ✅`);
    console.log(`   Failed: ${report.summary.failed} ❌`);
    console.log(`   Warnings: ${report.summary.warnings} ⚠️`);
    console.log(`   Success Rate: ${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%`);
    console.log(`   Coverage: ${report.summary.coverage.toFixed(1)}%`);
    console.log(`   Duration: ${(report.summary.duration / 1000).toFixed(2)} seconds`);
    
    if (report.workflowResults && Object.keys(report.workflowResults).length > 0) {
      console.log(`\n🏗️  Workflow Results:`);
      for (const [workflow, results] of Object.entries(report.workflowResults)) {
        const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0';
        const status = successRate >= 80 ? '✅' : successRate >= 60 ? '⚠️' : '❌';
        console.log(`   ${status} ${workflow}: ${results.passed}/${results.total} (${successRate}%)`);
      }
    }
    
    if (report.dataIntegrityChecks && report.dataIntegrityChecks.length > 0) {
      console.log(`\n🔒 Data Integrity Results:`);
      const integrityByWorkflow = {};
      report.dataIntegrityChecks.forEach(check => {
        if (!integrityByWorkflow[check.workflow]) {
          integrityByWorkflow[check.workflow] = { passed: 0, total: 0, issues: [] };
        }
        integrityByWorkflow[check.workflow].passed += check.checksPassed;
        integrityByWorkflow[check.workflow].total += check.checksPerformed;
        integrityByWorkflow[check.workflow].issues.push(...check.issues);
      });
      
      for (const [workflow, integrity] of Object.entries(integrityByWorkflow)) {
        const passRate = integrity.total > 0 ? ((integrity.passed / integrity.total) * 100).toFixed(1) : '0';
        const status = passRate >= 95 ? '✅' : passRate >= 80 ? '⚠️' : '❌';
        console.log(`   ${status} ${workflow}: ${integrity.passed}/${integrity.total} (${passRate}%)`);
        
        if (integrity.issues.length > 0) {
          console.log(`      Issues: ${integrity.issues.slice(0, 3).join(', ')}${integrity.issues.length > 3 ? '...' : ''}`);
        }
      }
    }
    
    // Performance metrics
    if (report.performanceMetrics && Object.keys(report.performanceMetrics).length > 0) {
      console.log(`\n⚡ Performance Highlights:`);
      const avgResponseTime = Object.values(report.performanceMetrics)
        .filter(m => m.responseTime)
        .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0);
      
      console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
      
      const slowestTest = Object.entries(report.performanceMetrics)
        .filter(([_, m]) => m.responseTime)
        .sort(([_, a], [__, b]) => b.responseTime - a.responseTime)[0];
      
      if (slowestTest) {
        console.log(`   Slowest Test: ${slowestTest[0]} (${slowestTest[1].responseTime}ms)`);
      }
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    
    if (report.summary.coverage < 90) {
      console.log(`   • Increase test coverage from ${report.summary.coverage.toFixed(1)}% to 90%+`);
    }
    
    if (report.summary.failed > 0) {
      console.log(`   • Address ${report.summary.failed} failing test(s)`);
    }
    
    if (report.summary.warnings > 0) {
      console.log(`   • Review ${report.summary.warnings} warning(s) for potential improvements`);
    }
    
    const overallScore = (
      (report.summary.passed / report.summary.total) * 0.6 +
      (report.summary.coverage / 100) * 0.2 +
      (report.dataIntegrityChecks.length > 0 ? 
        (report.dataIntegrityChecks.reduce((sum, check) => sum + check.checksPassed, 0) / 
         report.dataIntegrityChecks.reduce((sum, check) => sum + check.checksPerformed, 0)) * 0.2 : 0.8)
    ) * 100;
    
    console.log(`\n🎯 Overall Quality Score: ${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 90) {
      console.log('   🏆 EXCELLENT - Production ready!');
    } else if (overallScore >= 80) {
      console.log('   ✅ GOOD - Minor improvements needed');
    } else if (overallScore >= 70) {
      console.log('   ⚠️  FAIR - Significant improvements required');
    } else {
      console.log('   ❌ POOR - Major issues need attention');
    }
    
  } catch (error) {
    console.log(`\n⚠️  Failed to read test report: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const startTime = Date.now();
    
    // Step 1: Validate service availability
    const healthyServices = await validateServiceAvailability();
    
    // Step 2: Run business logic tests
    const testResults = await runBusinessLogicTests();
    
    // Step 3: Display test summary
    await displayTestSummary();
    
    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Total execution time: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`\n📁 Detailed results saved to: business-logic-test-report.json`);
    
    console.log('\n🎉 BUSINESS LOGIC VALIDATION COMPLETED');
    console.log('='.repeat(80));
    
    process.exit(0);
    
  } catch (error) {
    console.error(`\n❌ Test execution failed: ${error.message}`);
    
    if (options.verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure all services are running: npm run start:all');
    console.log('2. Check service logs for errors');
    console.log('3. Verify database connectivity');
    console.log('4. Run with --verbose for detailed output');
    
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test execution interrupted by user');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Test execution terminated');
  process.exit(143);
});

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});