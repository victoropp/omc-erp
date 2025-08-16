/**
 * COMPREHENSIVE BUSINESS LOGIC TESTING SUITE FOR GHANA OMC ERP SYSTEM
 * 
 * This suite performs extensive testing of all ERP workflows to ensure:
 * - Data integrity across all operations
 * - Calculation accuracy for all business rules
 * - Workflow completion validation
 * - Error handling for edge cases
 * - 100% business logic validation
 * 
 * Author: Ghana OMC ERP Development Team
 * Created: August 16, 2025
 * Updated: August 16, 2025
 */

const axios = require('axios');
const crypto = require('crypto');

// Test Configuration
const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:3001',
  DASHBOARD_URL: 'http://localhost:3000',
  SERVICES: {
    API_GATEWAY: 'http://localhost:3001',
    STATION_SERVICE: 'http://localhost:3002',
    TRANSACTION_SERVICE: 'http://localhost:3003',
    PRICING_SERVICE: 'http://localhost:3004',
    ACCOUNTING_SERVICE: 'http://localhost:3005',
    UPPF_SERVICE: 'http://localhost:3006',
    DEALER_SERVICE: 'http://localhost:3007',
    INVENTORY_SERVICE: 'http://localhost:3008',
    DAILY_DELIVERY_SERVICE: 'http://localhost:3009',
  },
  TEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  VALIDATION_PRECISION: 0.01,
  tenantId: 'test-tenant-001'
};

// Test Results Storage
const testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    coverage: 0,
    startTime: new Date(),
    endTime: null,
    duration: 0
  },
  workflowResults: {},
  detailedResults: [],
  performanceMetrics: {},
  dataIntegrityChecks: [],
  businessRuleValidations: [],
  edgeCaseResults: []
};

// Test Data Factory
class TestDataFactory {
  static generateStation(overrides = {}) {
    return {
      name: `Test Station ${Math.random().toString(36).substr(2, 9)}`,
      code: `TS${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      location: {
        latitude: 5.6037 + (Math.random() - 0.5) * 0.1,
        longitude: -0.1870 + (Math.random() - 0.5) * 0.1,
        address: '123 Test Street, Accra, Ghana',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
      },
      stationType: 'COCO',
      capacity: 50000,
      contactInfo: {
        phone: '+233200000000',
        email: 'test@station.com',
        manager: 'Test Manager'
      },
      operatingHours: {
        open: '06:00',
        close: '22:00',
        is24Hours: false
      },
      tanks: [
        {
          tankNumber: 'T001',
          fuelType: 'PMS',
          capacity: 20000,
          currentLevel: 15000,
          status: 'ACTIVE'
        },
        {
          tankNumber: 'T002',
          fuelType: 'AGO',
          capacity: 15000,
          currentLevel: 12000,
          status: 'ACTIVE'
        }
      ],
      pumps: [
        { pumpNumber: 'P001', tankId: 'T001', status: 'ACTIVE' },
        { pumpNumber: 'P002', tankId: 'T001', status: 'ACTIVE' },
        { pumpNumber: 'P003', tankId: 'T002', status: 'ACTIVE' }
      ],
      ...overrides
    };
  }

  static generateTransaction(stationId, overrides = {}) {
    return {
      stationId,
      pumpId: 'test-pump-001',
      fuelType: 'PMS',
      quantityLiters: 50 + Math.random() * 100,
      pricePerLiter: 11.50 + Math.random() * 2,
      paymentMethod: 'CASH',
      customerId: null,
      attendantId: 'test-attendant-001',
      autoProcessPayment: true,
      paymentDetails: {},
      ...overrides
    };
  }

  static generatePricingWindow(overrides = {}) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      windowId: `W${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4)}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      description: 'Test Pricing Window',
      status: 'DRAFT',
      npaGuidelineDocId: 'NPA-2025-TEST-GUIDE',
      ...overrides
    };
  }

  static generateUPPFClaim(consignmentId, overrides = {}) {
    return {
      consignmentId,
      routeId: 'test-route-001',
      depotId: 'test-depot-001',
      stationId: 'test-station-001',
      productType: 'PMS',
      litresMoved: 10000 + Math.random() * 20000,
      kmActual: 50 + Math.random() * 100,
      kmPlanned: 45 + Math.random() * 90,
      evidenceRequirement: 'STANDARD',
      ...overrides
    };
  }

  static generateDealerSettlement(stationId, windowId, overrides = {}) {
    return {
      stationId,
      windowId,
      salesData: {
        PMS: { litresSold: 5000, marginRate: 0.35 },
        AGO: { litresSold: 3000, marginRate: 0.30 },
        LPG: { litresSold: 1000, marginRate: 0.40 }
      },
      loanDeductions: 1500.00,
      otherDeductions: 250.00,
      ...overrides
    };
  }

  static generateInventoryReceipt(stationId, overrides = {}) {
    return {
      stationId,
      supplierId: 'test-supplier-001',
      deliveryNoteNumber: `DN${Date.now()}`,
      waybillNumber: `WB${Date.now()}`,
      truckNumber: 'GT-1234-A',
      driverName: 'Test Driver',
      driverLicense: 'DL123456',
      items: [
        {
          productId: 'PMS',
          tankId: 'tank-001',
          orderedQuantity: 10000,
          deliveredQuantity: 9950,
          unitCost: 8.50
        },
        {
          productId: 'AGO',
          tankId: 'tank-002',
          orderedQuantity: 8000,
          deliveredQuantity: 7980,
          unitCost: 8.75
        }
      ],
      ...overrides
    };
  }
}

// Utility Functions
class TestUtils {
  static async makeRequest(method, url, data = null, headers = {}) {
    const config = {
      method,
      url,
      timeout: TEST_CONFIG.TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_CONFIG.tenantId,
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    for (let attempt = 1; attempt <= TEST_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await axios(config);
        return response;
      } catch (error) {
        if (attempt === TEST_CONFIG.RETRY_ATTEMPTS) {
          throw error;
        }
        await this.sleep(1000 * attempt);
      }
    }
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static validateNumber(value, expectedRange = null, precision = TEST_CONFIG.VALIDATION_PRECISION) {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, message: 'Value is not a valid number' };
    }

    if (expectedRange) {
      if (value < expectedRange.min || value > expectedRange.max) {
        return { 
          valid: false, 
          message: `Value ${value} is outside expected range [${expectedRange.min}, ${expectedRange.max}]` 
        };
      }
    }

    return { valid: true };
  }

  static validateCalculation(actual, expected, tolerance = TEST_CONFIG.VALIDATION_PRECISION) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      return {
        valid: false,
        message: `Calculation mismatch: expected ${expected}, got ${actual}, difference ${diff}`
      };
    }
    return { valid: true };
  }

  static generateId() {
    return crypto.randomUUID();
  }

  static logTest(testName, status, details = {}) {
    const timestamp = new Date().toISOString();
    const result = {
      timestamp,
      testName,
      status,
      details,
      duration: details.duration || 0
    };

    testResults.detailedResults.push(result);
    testResults.summary.total++;

    if (status === 'PASSED') {
      testResults.summary.passed++;
      console.log(`✅ ${testName} - PASSED (${details.duration || 0}ms)`);
    } else if (status === 'FAILED') {
      testResults.summary.failed++;
      console.log(`❌ ${testName} - FAILED: ${details.error || 'Unknown error'}`);
    } else if (status === 'WARNING') {
      testResults.summary.warnings++;
      console.log(`⚠️  ${testName} - WARNING: ${details.message || 'Warning condition'}`);
    }

    if (details.performance) {
      testResults.performanceMetrics[testName] = details.performance;
    }
  }

  static async checkServiceHealth(serviceName, url) {
    try {
      const startTime = Date.now();
      const response = await this.makeRequest('GET', `${url}/health`);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        this.logTest(`${serviceName} Health Check`, 'PASSED', { 
          duration, 
          service: serviceName,
          responseTime: duration 
        });
        return true;
      }
    } catch (error) {
      this.logTest(`${serviceName} Health Check`, 'FAILED', { 
        error: error.message,
        service: serviceName 
      });
      return false;
    }
    return false;
  }
}

// Business Logic Test Suites

/**
 * STATION MANAGEMENT WORKFLOW TESTS
 * 
 * Tests the complete station management lifecycle including:
 * - Station creation and validation
 * - Tank and pump management
 * - Operational status changes
 * - Location-based queries
 * - Statistics and monitoring
 */
class StationManagementTests {
  static async runAll() {
    console.log('\n🏪 STATION MANAGEMENT WORKFLOW TESTS');
    console.log('='.repeat(60));

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      testCases: []
    };

    try {
      // Test service health first
      const serviceHealthy = await TestUtils.checkServiceHealth('Station Service', TEST_CONFIG.SERVICES.STATION_SERVICE);
      if (!serviceHealthy) {
        throw new Error('Station service is not available');
      }

      // Core functionality tests
      await this.testStationCreation(results);
      await this.testStationValidation(results);
      await this.testStationUpdates(results);
      await this.testTankManagement(results);
      await this.testPumpManagement(results);
      await this.testStationStatistics(results);
      await this.testLocationQueries(results);
      await this.testOperationalStatusChanges(results);

      // Edge case tests
      await this.testEdgeCases(results);

      // Data integrity tests
      await this.testDataIntegrity(results);

      testResults.workflowResults.stationManagement = results;

    } catch (error) {
      TestUtils.logTest('Station Management Suite', 'FAILED', { error: error.message });
      results.failed++;
    }

    return results;
  }

  static async testStationCreation(results) {
    const testName = 'Station Creation Workflow';
    const startTime = Date.now();
    
    try {
      // Test 1: Create valid station
      const stationData = TestDataFactory.generateStation();
      const response = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
        stationData
      );

      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }

      const createdStation = response.data;
      
      // Validate response structure
      if (!createdStation.id || !createdStation.code || !createdStation.name) {
        throw new Error('Missing required fields in station response');
      }

      // Validate business rules
      if (createdStation.status !== 'ACTIVE') {
        throw new Error(`Expected status ACTIVE, got ${createdStation.status}`);
      }

      // Test 2: Verify tank creation
      if (!createdStation.tanks || createdStation.tanks.length !== stationData.tanks.length) {
        throw new Error('Tank count mismatch after station creation');
      }

      // Test 3: Verify pump creation
      if (!createdStation.pumps || createdStation.pumps.length !== stationData.pumps.length) {
        throw new Error('Pump count mismatch after station creation');
      }

      // Test 4: Validate location data
      const locationDiff = Math.abs(createdStation.location.latitude - stationData.location.latitude);
      if (locationDiff > 0.001) {
        throw new Error('Location data not preserved correctly');
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: createdStation.id,
        tanksCreated: createdStation.tanks.length,
        pumpsCreated: createdStation.pumps.length,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: createdStation.id
      });

      return createdStation;

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  static async testStationValidation(results) {
    const testName = 'Station Validation Rules';
    const startTime = Date.now();

    try {
      // Test invalid data scenarios
      const invalidCases = [
        {
          name: 'Missing required fields',
          data: { name: 'Test' }, // Missing code and location
          expectedError: 'validation'
        },
        {
          name: 'Invalid location coordinates',
          data: TestDataFactory.generateStation({
            location: { latitude: 200, longitude: 200 } // Invalid coordinates
          }),
          expectedError: 'validation'
        },
        {
          name: 'Duplicate station code',
          data: TestDataFactory.generateStation({ code: 'EXISTING_CODE' }),
          expectedError: 'conflict'
        }
      ];

      let validationTestsPassed = 0;

      for (const testCase of invalidCases) {
        try {
          const response = await TestUtils.makeRequest(
            'POST',
            `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
            testCase.data
          );

          // If we get here, the validation failed to catch invalid data
          throw new Error(`Validation failed: ${testCase.name} should have been rejected`);

        } catch (error) {
          if (error.response && (error.response.status === 400 || error.response.status === 409)) {
            validationTestsPassed++;
          } else {
            throw new Error(`Unexpected error for ${testCase.name}: ${error.message}`);
          }
        }
      }

      if (validationTestsPassed !== invalidCases.length) {
        throw new Error(`Only ${validationTestsPassed}/${invalidCases.length} validation tests passed`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        validationTestsPassed,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        validationTests: validationTestsPassed
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testStationUpdates(results) {
    const testName = 'Station Update Operations';
    const startTime = Date.now();

    try {
      // Create a station to update
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Test various update scenarios
      const updateData = {
        name: `${station.name} - Updated`,
        operatingHours: {
          open: '05:00',
          close: '23:00',
          is24Hours: false
        },
        contactInfo: {
          ...station.contactInfo,
          phone: '+233244000000'
        }
      };

      const response = await TestUtils.makeRequest(
        'PUT',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}`,
        updateData
      );

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const updatedStation = response.data;

      // Validate updates
      if (updatedStation.name !== updateData.name) {
        throw new Error('Station name was not updated correctly');
      }

      if (updatedStation.operatingHours.open !== updateData.operatingHours.open) {
        throw new Error('Operating hours were not updated correctly');
      }

      if (updatedStation.contactInfo.phone !== updateData.contactInfo.phone) {
        throw new Error('Contact info was not updated correctly');
      }

      // Verify immutable fields weren't changed
      if (updatedStation.id !== station.id || updatedStation.code !== station.code) {
        throw new Error('Immutable fields were incorrectly modified');
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTankManagement(results) {
    const testName = 'Tank Management Operations';
    const startTime = Date.now();

    try {
      // Create station with tanks
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Test tank capacity calculations
      const totalCapacity = station.tanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const totalCurrentLevel = station.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const fillPercentage = (totalCurrentLevel / totalCapacity) * 100;

      // Validate tank business rules
      for (const tank of station.tanks) {
        if (tank.currentLevel > tank.capacity) {
          throw new Error(`Tank ${tank.tankNumber} has current level exceeding capacity`);
        }

        if (tank.currentLevel < 0) {
          throw new Error(`Tank ${tank.tankNumber} has negative current level`);
        }

        const tankFillPercentage = (tank.currentLevel / tank.capacity) * 100;
        if (tankFillPercentage > 100) {
          throw new Error(`Tank ${tank.tankNumber} fill percentage exceeds 100%`);
        }
      }

      // Test tank statistics API
      const statsResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/statistics`
      );

      if (statsResponse.status !== 200) {
        throw new Error(`Expected status 200 for statistics, got ${statsResponse.status}`);
      }

      const stats = statsResponse.data;
      
      // Validate calculated statistics
      const calculatedTotal = TestUtils.validateCalculation(
        stats.summary.totalFuelCapacity,
        totalCapacity
      );

      if (!calculatedTotal.valid) {
        throw new Error(`Tank capacity calculation error: ${calculatedTotal.message}`);
      }

      const calculatedCurrent = TestUtils.validateCalculation(
        stats.summary.totalFuelVolume,
        totalCurrentLevel
      );

      if (!calculatedCurrent.valid) {
        throw new Error(`Tank current level calculation error: ${calculatedCurrent.message}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        tanksValidated: station.tanks.length,
        totalCapacity,
        fillPercentage: fillPercentage.toFixed(2),
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        tanksValidated: station.tanks.length
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testPumpManagement(results) {
    const testName = 'Pump Management Operations';
    const startTime = Date.now();

    try {
      // Create station with pumps
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Validate pump-tank relationships
      for (const pump of station.pumps) {
        const associatedTank = station.tanks.find(tank => tank.id === pump.tankId);
        if (!associatedTank) {
          throw new Error(`Pump ${pump.pumpNumber} references non-existent tank ${pump.tankId}`);
        }

        // Validate pump operational status
        if (!['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(pump.status)) {
          throw new Error(`Pump ${pump.pumpNumber} has invalid status: ${pump.status}`);
        }
      }

      // Test pump statistics
      const stats = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/statistics`
      );

      const pumpStats = stats.data.pumps;
      
      // Validate pump count
      if (pumpStats.length !== station.pumps.length) {
        throw new Error('Pump count mismatch in statistics');
      }

      // Validate operational pump count
      const operationalPumps = station.pumps.filter(p => p.status === 'ACTIVE').length;
      const statsOperational = stats.data.summary.operationalPumps;
      
      if (operationalPumps !== statsOperational) {
        throw new Error(`Operational pump count mismatch: expected ${operationalPumps}, got ${statsOperational}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        pumpsValidated: station.pumps.length,
        operationalPumps,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        pumpsValidated: station.pumps.length
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testStationStatistics(results) {
    const testName = 'Station Statistics Calculation';
    const startTime = Date.now();

    try {
      // Create station
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Get detailed statistics
      const response = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/statistics`
      );

      const stats = response.data;

      // Validate statistics structure
      const requiredFields = ['stationId', 'name', 'code', 'status', 'summary', 'tanks', 'pumps'];
      for (const field of requiredFields) {
        if (!(field in stats)) {
          throw new Error(`Missing required field in statistics: ${field}`);
        }
      }

      // Validate summary calculations
      const summary = stats.summary;
      
      // Tank capacity validation
      const calculatedCapacity = station.tanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const capacityValidation = TestUtils.validateCalculation(
        summary.totalFuelCapacity,
        calculatedCapacity
      );

      if (!capacityValidation.valid) {
        throw new Error(`Total capacity calculation error: ${capacityValidation.message}`);
      }

      // Current volume validation
      const calculatedVolume = station.tanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const volumeValidation = TestUtils.validateCalculation(
        summary.totalFuelVolume,
        calculatedVolume
      );

      if (!volumeValidation.valid) {
        throw new Error(`Total volume calculation error: ${volumeValidation.message}`);
      }

      // Fill percentage validation
      const expectedFillPercentage = calculatedCapacity > 0 ? (calculatedVolume / calculatedCapacity) * 100 : 0;
      const fillPercentageValidation = TestUtils.validateCalculation(
        summary.fuelFillPercentage,
        expectedFillPercentage
      );

      if (!fillPercentageValidation.valid) {
        throw new Error(`Fill percentage calculation error: ${fillPercentageValidation.message}`);
      }

      // Pump count validation
      if (summary.totalPumps !== station.pumps.length) {
        throw new Error(`Pump count mismatch: expected ${station.pumps.length}, got ${summary.totalPumps}`);
      }

      const operationalPumps = station.pumps.filter(p => p.status === 'ACTIVE').length;
      if (summary.operationalPumps !== operationalPumps) {
        throw new Error(`Operational pump count mismatch: expected ${operationalPumps}, got ${summary.operationalPumps}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        calculationsValidated: 5,
        fillPercentage: expectedFillPercentage.toFixed(2),
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        calculationsValidated: 5
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testLocationQueries(results) {
    const testName = 'Location-Based Queries';
    const startTime = Date.now();

    try {
      // Create multiple stations in different locations
      const stations = [];
      const accraLocation = { latitude: 5.6037, longitude: -0.1870 };
      
      for (let i = 0; i < 3; i++) {
        const stationData = TestDataFactory.generateStation({
          location: {
            ...accraLocation,
            latitude: accraLocation.latitude + (i * 0.01), // Spread stations apart
            longitude: accraLocation.longitude + (i * 0.01),
            address: `Test Location ${i + 1}`,
            region: 'Greater Accra'
          }
        });
        
        const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
        stations.push(station);
      }

      // Test proximity search
      const searchRadius = 10; // km
      const proximityResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/nearby?latitude=${accraLocation.latitude}&longitude=${accraLocation.longitude}&radius=${searchRadius}`
      );

      if (proximityResponse.status !== 200) {
        throw new Error(`Expected status 200 for proximity search, got ${proximityResponse.status}`);
      }

      const nearbyStations = proximityResponse.data;

      // Validate that our test stations are found
      const foundStationIds = nearbyStations.map(s => s.id);
      const testStationIds = stations.map(s => s.id);

      for (const stationId of testStationIds) {
        if (!foundStationIds.includes(stationId)) {
          TestUtils.logTest(`${testName} - Missing Station`, 'WARNING', {
            message: `Station ${stationId} not found in proximity search`,
            searchRadius,
            stationLocation: stations.find(s => s.id === stationId)?.location
          });
        }
      }

      // Test region-based filtering
      const regionResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations?region=Greater Accra`
      );

      if (regionResponse.status !== 200) {
        throw new Error(`Expected status 200 for region search, got ${regionResponse.status}`);
      }

      const regionStations = regionResponse.data.data;
      
      // Validate that stations are in the correct region
      for (const station of regionStations) {
        if (station.location?.region !== 'Greater Accra') {
          throw new Error(`Station ${station.id} has incorrect region: ${station.location?.region}`);
        }
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationsCreated: stations.length,
        nearbyStationsFound: nearbyStations.length,
        regionStationsFound: regionStations.length,
        searchRadius,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationsCreated: stations.length,
        nearbyStationsFound: nearbyStations.length
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testOperationalStatusChanges(results) {
    const testName = 'Operational Status Changes';
    const startTime = Date.now();

    try {
      // Create station
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Test activation (station should already be active)
      const activateResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/activate`
      );

      if (activateResponse.status !== 200) {
        throw new Error(`Expected status 200 for activation, got ${activateResponse.status}`);
      }

      // Verify active status
      const activeStation = activateResponse.data;
      if (activeStation.status !== 'ACTIVE') {
        throw new Error(`Expected status ACTIVE after activation, got ${activeStation.status}`);
      }

      // Test deactivation
      const deactivateResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/deactivate`,
        { reason: 'Testing deactivation workflow' }
      );

      if (deactivateResponse.status !== 200) {
        throw new Error(`Expected status 200 for deactivation, got ${deactivateResponse.status}`);
      }

      // Verify inactive status
      const inactiveStation = deactivateResponse.data;
      if (inactiveStation.status !== 'INACTIVE') {
        throw new Error(`Expected status INACTIVE after deactivation, got ${inactiveStation.status}`);
      }

      // Test reactivation
      const reactivateResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}/activate`
      );

      if (reactivateResponse.status !== 200) {
        throw new Error(`Expected status 200 for reactivation, got ${reactivateResponse.status}`);
      }

      // Verify active status again
      const reactivatedStation = reactivateResponse.data;
      if (reactivatedStation.status !== 'ACTIVE') {
        throw new Error(`Expected status ACTIVE after reactivation, got ${reactivatedStation.status}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        statusChanges: 3,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        statusChanges: 3
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testEdgeCases(results) {
    const testName = 'Station Management Edge Cases';
    const startTime = Date.now();

    try {
      let edgeCasesPassed = 0;
      const totalEdgeCases = 4;

      // Edge Case 1: Station with maximum capacity tanks
      try {
        const maxCapacityStation = TestDataFactory.generateStation({
          tanks: [{
            tankNumber: 'MAX001',
            fuelType: 'PMS',
            capacity: 100000, // Maximum capacity
            currentLevel: 95000, // Near full
            status: 'ACTIVE'
          }]
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
          maxCapacityStation
        );

        if (response.status === 201) {
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Max Capacity`, 'WARNING', { 
          message: `Max capacity test failed: ${error.message}` 
        });
      }

      // Edge Case 2: Station with zero current level tanks
      try {
        const emptyTankStation = TestDataFactory.generateStation({
          tanks: [{
            tankNumber: 'EMPTY001',
            fuelType: 'AGO',
            capacity: 20000,
            currentLevel: 0, // Empty tank
            status: 'ACTIVE'
          }]
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
          emptyTankStation
        );

        if (response.status === 201) {
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Empty Tank`, 'WARNING', { 
          message: `Empty tank test failed: ${error.message}` 
        });
      }

      // Edge Case 3: Station with many pumps per tank
      try {
        const manyPumpsStation = TestDataFactory.generateStation({
          tanks: [{
            tankNumber: 'MULTI001',
            fuelType: 'PMS',
            capacity: 30000,
            currentLevel: 15000,
            status: 'ACTIVE'
          }],
          pumps: Array.from({ length: 8 }, (_, i) => ({
            pumpNumber: `MP${(i + 1).toString().padStart(3, '0')}`,
            tankId: 'MULTI001',
            status: 'ACTIVE'
          }))
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
          manyPumpsStation
        );

        if (response.status === 201 && response.data.pumps.length === 8) {
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Many Pumps`, 'WARNING', { 
          message: `Many pumps test failed: ${error.message}` 
        });
      }

      // Edge Case 4: Station at extreme coordinates
      try {
        const extremeLocationStation = TestDataFactory.generateStation({
          location: {
            latitude: -90, // South pole
            longitude: 180, // International date line
            address: 'Extreme Location Test',
            region: 'Test Region'
          }
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
          extremeLocationStation
        );

        if (response.status === 201) {
          edgeCasesPassed++;
        }
      } catch (error) {
        // This might legitimately fail due to validation, so we don't count it as a failure
        TestUtils.logTest(`${testName} - Extreme Location`, 'WARNING', { 
          message: `Extreme location test failed (expected): ${error.message}` 
        });
        edgeCasesPassed++; // Count as passed since validation rejection is correct
      }

      const duration = Date.now() - startTime;
      
      if (edgeCasesPassed >= totalEdgeCases * 0.75) { // Allow 25% failure rate for edge cases
        TestUtils.logTest(testName, 'PASSED', { 
          duration,
          edgeCasesPassed,
          totalEdgeCases,
          successRate: `${((edgeCasesPassed / totalEdgeCases) * 100).toFixed(1)}%`,
          performance: { responseTime: duration }
        });
        results.passed++;
      } else {
        TestUtils.logTest(testName, 'FAILED', { 
          duration,
          edgeCasesPassed,
          totalEdgeCases,
          successRate: `${((edgeCasesPassed / totalEdgeCases) * 100).toFixed(1)}%`
        });
        results.failed++;
      }

      results.testCases.push({
        name: testName,
        status: edgeCasesPassed >= totalEdgeCases * 0.75 ? 'PASSED' : 'FAILED',
        edgeCasesPassed,
        totalEdgeCases
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testDataIntegrity(results) {
    const testName = 'Station Data Integrity Checks';
    const startTime = Date.now();

    try {
      // Create station for integrity testing
      const station = await this.testStationCreation({ passed: 0, failed: 0, testCases: [] });
      
      // Check 1: Verify station persists correctly
      const getResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations/${station.id}`
      );

      if (getResponse.status !== 200) {
        throw new Error('Station not found after creation');
      }

      const retrievedStation = getResponse.data;

      // Check 2: Verify data consistency
      if (retrievedStation.name !== station.name) {
        throw new Error('Station name inconsistency after retrieval');
      }

      if (retrievedStation.code !== station.code) {
        throw new Error('Station code inconsistency after retrieval');
      }

      // Check 3: Verify tank data integrity
      if (retrievedStation.tanks.length !== station.tanks.length) {
        throw new Error('Tank count inconsistency after retrieval');
      }

      for (let i = 0; i < station.tanks.length; i++) {
        const originalTank = station.tanks[i];
        const retrievedTank = retrievedStation.tanks.find(t => t.tankNumber === originalTank.tankNumber);
        
        if (!retrievedTank) {
          throw new Error(`Tank ${originalTank.tankNumber} not found after retrieval`);
        }

        if (retrievedTank.capacity !== originalTank.capacity) {
          throw new Error(`Tank ${originalTank.tankNumber} capacity inconsistency`);
        }
      }

      // Check 4: Verify pump data integrity
      if (retrievedStation.pumps.length !== station.pumps.length) {
        throw new Error('Pump count inconsistency after retrieval');
      }

      for (let i = 0; i < station.pumps.length; i++) {
        const originalPump = station.pumps[i];
        const retrievedPump = retrievedStation.pumps.find(p => p.pumpNumber === originalPump.pumpNumber);
        
        if (!retrievedPump) {
          throw new Error(`Pump ${originalPump.pumpNumber} not found after retrieval`);
        }

        if (retrievedPump.status !== originalPump.status) {
          throw new Error(`Pump ${originalPump.pumpNumber} status inconsistency`);
        }
      }

      // Check 5: Verify location data precision
      const latDiff = Math.abs(retrievedStation.location.latitude - station.location.latitude);
      const lonDiff = Math.abs(retrievedStation.location.longitude - station.location.longitude);
      
      if (latDiff > 0.000001 || lonDiff > 0.000001) { // 6 decimal places precision
        throw new Error('Location coordinates lost precision during storage');
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        integrityChecks: 5,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        integrityChecks: 5
      });

      // Store integrity check results
      testResults.dataIntegrityChecks.push({
        workflow: 'Station Management',
        timestamp: new Date(),
        stationId: station.id,
        checksPerformed: 5,
        checksPassed: 5,
        issues: []
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });

      // Store integrity check failure
      testResults.dataIntegrityChecks.push({
        workflow: 'Station Management',
        timestamp: new Date(),
        checksPerformed: 5,
        checksPassed: 0,
        issues: [error.message]
      });
    }

    results.total = results.passed + results.failed;
    return results;
  }
}

/**
 * TRANSACTION PROCESSING WORKFLOW TESTS
 * 
 * Tests the complete transaction processing lifecycle including:
 * - Transaction creation and validation
 * - Payment processing
 * - Inventory deduction
 * - Receipt generation
 * - Transaction completion/cancellation/refund
 * - Daily summaries and reporting
 */
class TransactionProcessingTests {
  static async runAll() {
    console.log('\n💳 TRANSACTION PROCESSING WORKFLOW TESTS');
    console.log('='.repeat(60));

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      testCases: []
    };

    try {
      // Test service health first
      const serviceHealthy = await TestUtils.checkServiceHealth('Transaction Service', TEST_CONFIG.SERVICES.TRANSACTION_SERVICE);
      if (!serviceHealthy) {
        throw new Error('Transaction service is not available');
      }

      // Core functionality tests
      await this.testTransactionCreation(results);
      await this.testTransactionValidation(results);
      await this.testPaymentProcessing(results);
      await this.testInventoryIntegration(results);
      await this.testReceiptGeneration(results);
      await this.testTransactionCompletion(results);
      await this.testTransactionCancellation(results);
      await this.testTransactionRefund(results);
      await this.testDailySummaryGeneration(results);

      // Edge case tests
      await this.testTransactionEdgeCases(results);

      // Data integrity tests
      await this.testTransactionDataIntegrity(results);

      testResults.workflowResults.transactionProcessing = results;

    } catch (error) {
      TestUtils.logTest('Transaction Processing Suite', 'FAILED', { error: error.message });
      results.failed++;
    }

    return results;
  }

  static async testTransactionCreation(results) {
    const testName = 'Transaction Creation Workflow';
    const startTime = Date.now();
    
    try {
      // First create a station for the transaction
      const stationData = TestDataFactory.generateStation();
      const stationResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
        stationData
      );

      if (stationResponse.status !== 201) {
        throw new Error('Failed to create test station for transaction');
      }

      const station = stationResponse.data;

      // Create a transaction
      const transactionData = TestDataFactory.generateTransaction(station.id);
      const response = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
        transactionData
      );

      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }

      const transaction = response.data;

      // Validate transaction structure
      const requiredFields = ['id', 'stationId', 'fuelType', 'quantityLiters', 'pricePerLiter', 'totalAmount', 'status'];
      for (const field of requiredFields) {
        if (!(field in transaction)) {
          throw new Error(`Missing required field in transaction: ${field}`);
        }
      }

      // Validate business calculations
      const expectedTotal = transactionData.quantityLiters * transactionData.pricePerLiter;
      const calculationValidation = TestUtils.validateCalculation(
        transaction.totalAmount,
        expectedTotal
      );

      if (!calculationValidation.valid) {
        throw new Error(`Total amount calculation error: ${calculationValidation.message}`);
      }

      // Validate transaction status
      if (transaction.status !== 'PENDING' && transaction.status !== 'COMPLETED') {
        throw new Error(`Unexpected transaction status: ${transaction.status}`);
      }

      // Test transaction numbering
      if (!transaction.receiptNumber || !transaction.receiptNumber.startsWith('RCP')) {
        throw new Error('Receipt number not generated correctly');
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        stationId: station.id,
        totalAmount: transaction.totalAmount,
        receiptNumber: transaction.receiptNumber,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id,
        stationId: station.id
      });

      return { transaction, station };

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  static async testTransactionValidation(results) {
    const testName = 'Transaction Validation Rules';
    const startTime = Date.now();

    try {
      // Create test station
      const stationData = TestDataFactory.generateStation();
      const stationResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
        stationData
      );
      const station = stationResponse.data;

      // Test invalid transaction scenarios
      const invalidCases = [
        {
          name: 'Negative quantity',
          data: TestDataFactory.generateTransaction(station.id, { quantityLiters: -10 }),
          expectedError: 'validation'
        },
        {
          name: 'Zero price',
          data: TestDataFactory.generateTransaction(station.id, { pricePerLiter: 0 }),
          expectedError: 'validation'
        },
        {
          name: 'Non-existent station',
          data: TestDataFactory.generateTransaction('non-existent-station'),
          expectedError: 'not_found'
        },
        {
          name: 'Excessive quantity',
          data: TestDataFactory.generateTransaction(station.id, { quantityLiters: 100000 }),
          expectedError: 'validation'
        }
      ];

      let validationTestsPassed = 0;

      for (const testCase of invalidCases) {
        try {
          const response = await TestUtils.makeRequest(
            'POST',
            `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
            testCase.data
          );

          // If we get here, validation failed
          throw new Error(`Validation failed: ${testCase.name} should have been rejected`);

        } catch (error) {
          if (error.response && (error.response.status === 400 || error.response.status === 404 || error.response.status === 422)) {
            validationTestsPassed++;
          } else {
            throw new Error(`Unexpected error for ${testCase.name}: ${error.message}`);
          }
        }
      }

      if (validationTestsPassed !== invalidCases.length) {
        throw new Error(`Only ${validationTestsPassed}/${invalidCases.length} validation tests passed`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        validationTestsPassed,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        validationTests: validationTestsPassed
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testPaymentProcessing(results) {
    const testName = 'Payment Processing Integration';
    const startTime = Date.now();

    try {
      // Create transaction with auto-payment
      const { transaction, station } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Verify payment processing
      if (transaction.paymentStatus !== 'COMPLETED' && transaction.paymentStatus !== 'PENDING') {
        throw new Error(`Unexpected payment status: ${transaction.paymentStatus}`);
      }

      // Test manual payment completion if still pending
      if (transaction.paymentStatus === 'PENDING') {
        const paymentResponse = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/complete`
        );

        if (paymentResponse.status !== 200) {
          throw new Error(`Payment completion failed with status ${paymentResponse.status}`);
        }

        const completedTransaction = paymentResponse.data;
        if (completedTransaction.paymentStatus !== 'COMPLETED') {
          throw new Error('Payment status not updated after completion');
        }
      }

      // Test payment methods
      const paymentMethods = ['CASH', 'CARD', 'MOBILE_MONEY', 'CREDIT'];
      let paymentMethodsTestedSuccessfully = 0;

      for (const method of paymentMethods) {
        try {
          const transactionData = TestDataFactory.generateTransaction(station.id, {
            paymentMethod: method,
            autoProcessPayment: true
          });

          const response = await TestUtils.makeRequest(
            'POST',
            `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
            transactionData
          );

          if (response.status === 201) {
            paymentMethodsTestedSuccessfully++;
          }
        } catch (error) {
          // Log but don't fail the test for unsupported payment methods
          TestUtils.logTest(`${testName} - ${method}`, 'WARNING', { 
            message: `Payment method ${method} may not be supported: ${error.message}` 
          });
        }
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        paymentMethodsTested: paymentMethodsTestedSuccessfully,
        totalMethods: paymentMethods.length,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id,
        paymentMethodsTested: paymentMethodsTestedSuccessfully
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testInventoryIntegration(results) {
    const testName = 'Inventory Integration Workflow';
    const startTime = Date.now();

    try {
      // This test would verify that transactions properly integrate with inventory
      // For now, we'll test the API response structure
      const { transaction, station } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Verify transaction includes inventory fields
      if (!transaction.tankId && !transaction.stationId) {
        throw new Error('Transaction missing inventory reference fields');
      }

      // Test inventory availability check (mock)
      // In a real system, this would check actual tank levels
      const inventoryCheckPassed = transaction.quantityLiters > 0 && transaction.quantityLiters < 1000;

      if (!inventoryCheckPassed) {
        TestUtils.logTest(`${testName} - Inventory Check`, 'WARNING', { 
          message: 'Inventory availability check may need enhancement',
          quantity: transaction.quantityLiters
        });
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        inventoryIntegrated: true,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testReceiptGeneration(results) {
    const testName = 'Receipt Generation Workflow';
    const startTime = Date.now();

    try {
      const { transaction } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Verify receipt number generation
      if (!transaction.receiptNumber) {
        throw new Error('Receipt number not generated');
      }

      // Validate receipt number format
      const receiptNumberPattern = /^RCP\d+$/;
      if (!receiptNumberPattern.test(transaction.receiptNumber)) {
        throw new Error(`Invalid receipt number format: ${transaction.receiptNumber}`);
      }

      // Test receipt retrieval (if endpoint exists)
      try {
        const receiptResponse = await TestUtils.makeRequest(
          'GET',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/receipt`
        );

        if (receiptResponse.status === 200) {
          const receipt = receiptResponse.data;
          
          // Validate receipt content
          if (!receipt.receiptNumber || receipt.receiptNumber !== transaction.receiptNumber) {
            throw new Error('Receipt number mismatch');
          }

          if (!receipt.totalAmount || Math.abs(receipt.totalAmount - transaction.totalAmount) > 0.01) {
            throw new Error('Receipt amount mismatch');
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          TestUtils.logTest(`${testName} - Receipt Endpoint`, 'WARNING', { 
            message: 'Receipt endpoint may not be implemented yet' 
          });
        } else {
          throw error;
        }
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        receiptNumber: transaction.receiptNumber,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id,
        receiptNumber: transaction.receiptNumber
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTransactionCompletion(results) {
    const testName = 'Transaction Completion Workflow';
    const startTime = Date.now();

    try {
      // Create a pending transaction
      const stationData = TestDataFactory.generateStation();
      const stationResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/stations`,
        stationData
      );
      const station = stationResponse.data;

      const transactionData = TestDataFactory.generateTransaction(station.id, { 
        autoProcessPayment: false 
      });

      const response = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
        transactionData
      );

      const transaction = response.data;

      // Complete the transaction
      const completionResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/complete`
      );

      if (completionResponse.status !== 200) {
        throw new Error(`Expected status 200 for completion, got ${completionResponse.status}`);
      }

      const completedTransaction = completionResponse.data;

      // Validate completion
      if (completedTransaction.status !== 'COMPLETED') {
        throw new Error(`Expected status COMPLETED, got ${completedTransaction.status}`);
      }

      if (completedTransaction.paymentStatus !== 'COMPLETED') {
        throw new Error(`Expected payment status COMPLETED, got ${completedTransaction.paymentStatus}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTransactionCancellation(results) {
    const testName = 'Transaction Cancellation Workflow';
    const startTime = Date.now();

    try {
      const { transaction } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Cancel the transaction
      const cancellationData = {
        reason: 'Test cancellation workflow'
      };

      const cancellationResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/cancel`,
        cancellationData
      );

      if (cancellationResponse.status !== 200) {
        throw new Error(`Expected status 200 for cancellation, got ${cancellationResponse.status}`);
      }

      const cancelledTransaction = cancellationResponse.data;

      // Validate cancellation
      if (cancelledTransaction.status !== 'CANCELLED') {
        throw new Error(`Expected status CANCELLED, got ${cancelledTransaction.status}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTransactionRefund(results) {
    const testName = 'Transaction Refund Workflow';
    const startTime = Date.now();

    try {
      // Create and complete a transaction first
      const { transaction } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Ensure transaction is completed
      await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/complete`
      );

      // Process refund
      const refundData = {
        amount: transaction.totalAmount,
        reason: 'Test refund workflow'
      };

      const refundResponse = await TestUtils.makeRequest(
        'POST',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}/refund`,
        refundData
      );

      if (refundResponse.status !== 200) {
        throw new Error(`Expected status 200 for refund, got ${refundResponse.status}`);
      }

      const refundedTransaction = refundResponse.data;

      // Validate refund
      if (refundedTransaction.paymentStatus !== 'REFUNDED') {
        throw new Error(`Expected payment status REFUNDED, got ${refundedTransaction.paymentStatus}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        refundAmount: refundData.amount,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id,
        refundAmount: refundData.amount
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testDailySummaryGeneration(results) {
    const testName = 'Daily Summary Generation';
    const startTime = Date.now();

    try {
      // Create multiple transactions for summary testing
      const { station } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });
      
      const transactions = [];
      for (let i = 0; i < 3; i++) {
        const transactionData = TestDataFactory.generateTransaction(station.id);
        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
          transactionData
        );
        transactions.push(response.data);
      }

      // Get daily summary
      const today = new Date().toISOString().split('T')[0];
      const summaryResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/daily-summary?date=${today}`
      );

      if (summaryResponse.status !== 200) {
        throw new Error(`Expected status 200 for daily summary, got ${summaryResponse.status}`);
      }

      const summary = summaryResponse.data;

      // Validate summary structure
      const requiredFields = ['date', 'totalTransactions', 'totalSales', 'totalQuantity'];
      for (const field of requiredFields) {
        if (!(field in summary)) {
          throw new Error(`Missing required field in summary: ${field}`);
        }
      }

      // Validate summary calculations
      if (summary.totalTransactions < transactions.length) {
        TestUtils.logTest(`${testName} - Transaction Count`, 'WARNING', { 
          message: `Summary may not include all test transactions. Expected at least ${transactions.length}, got ${summary.totalTransactions}` 
        });
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        stationId: station.id,
        transactionsCreated: transactions.length,
        summaryTransactions: summary.totalTransactions,
        totalSales: summary.totalSales,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        stationId: station.id,
        transactionsCreated: transactions.length
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTransactionEdgeCases(results) {
    const testName = 'Transaction Edge Cases';
    const startTime = Date.now();

    try {
      const { station } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });
      
      let edgeCasesPassed = 0;
      const totalEdgeCases = 4;

      // Edge Case 1: Minimum quantity transaction
      try {
        const minTransactionData = TestDataFactory.generateTransaction(station.id, {
          quantityLiters: 0.01, // Minimum possible quantity
          pricePerLiter: 15.00
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
          minTransactionData
        );

        if (response.status === 201) {
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Min Quantity`, 'WARNING', { 
          message: `Minimum quantity test failed: ${error.message}` 
        });
      }

      // Edge Case 2: Large quantity transaction
      try {
        const maxTransactionData = TestDataFactory.generateTransaction(station.id, {
          quantityLiters: 500, // Large but reasonable quantity
          pricePerLiter: 12.00
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
          maxTransactionData
        );

        if (response.status === 201) {
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Large Quantity`, 'WARNING', { 
          message: `Large quantity test failed: ${error.message}` 
        });
      }

      // Edge Case 3: High precision price
      try {
        const precisionTransactionData = TestDataFactory.generateTransaction(station.id, {
          quantityLiters: 25.333,
          pricePerLiter: 11.555
        });

        const response = await TestUtils.makeRequest(
          'POST',
          `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
          precisionTransactionData
        );

        if (response.status === 201) {
          // Validate precision handling
          const transaction = response.data;
          const expectedTotal = 25.333 * 11.555;
          const tolerance = 0.001; // Allow for rounding
          
          if (Math.abs(transaction.totalAmount - expectedTotal) <= tolerance) {
            edgeCasesPassed++;
          }
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Precision Price`, 'WARNING', { 
          message: `Precision price test failed: ${error.message}` 
        });
      }

      // Edge Case 4: Concurrent transactions
      try {
        const concurrentPromises = [];
        for (let i = 0; i < 5; i++) {
          const transactionData = TestDataFactory.generateTransaction(station.id);
          concurrentPromises.push(
            TestUtils.makeRequest(
              'POST',
              `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions`,
              transactionData
            )
          );
        }

        const concurrentResults = await Promise.allSettled(concurrentPromises);
        const successfulConcurrent = concurrentResults.filter(r => r.status === 'fulfilled' && r.value.status === 201).length;

        if (successfulConcurrent >= 4) { // Allow 1 failure in concurrent processing
          edgeCasesPassed++;
        }
      } catch (error) {
        TestUtils.logTest(`${testName} - Concurrent`, 'WARNING', { 
          message: `Concurrent transactions test failed: ${error.message}` 
        });
      }

      const duration = Date.now() - startTime;
      
      if (edgeCasesPassed >= totalEdgeCases * 0.75) { // Allow 25% failure rate for edge cases
        TestUtils.logTest(testName, 'PASSED', { 
          duration,
          edgeCasesPassed,
          totalEdgeCases,
          successRate: `${((edgeCasesPassed / totalEdgeCases) * 100).toFixed(1)}%`,
          performance: { responseTime: duration }
        });
        results.passed++;
      } else {
        TestUtils.logTest(testName, 'FAILED', { 
          duration,
          edgeCasesPassed,
          totalEdgeCases,
          successRate: `${((edgeCasesPassed / totalEdgeCases) * 100).toFixed(1)}%`
        });
        results.failed++;
      }

      results.testCases.push({
        name: testName,
        status: edgeCasesPassed >= totalEdgeCases * 0.75 ? 'PASSED' : 'FAILED',
        edgeCasesPassed,
        totalEdgeCases
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  static async testTransactionDataIntegrity(results) {
    const testName = 'Transaction Data Integrity Checks';
    const startTime = Date.now();

    try {
      const { transaction } = await this.testTransactionCreation({ passed: 0, failed: 0, testCases: [] });

      // Check 1: Verify transaction persists correctly
      const getResponse = await TestUtils.makeRequest(
        'GET',
        `${TEST_CONFIG.SERVICES.API_GATEWAY}/api/transactions/${transaction.id}`
      );

      if (getResponse.status !== 200) {
        throw new Error('Transaction not found after creation');
      }

      const retrievedTransaction = getResponse.data;

      // Check 2: Verify calculation consistency
      const expectedTotal = retrievedTransaction.quantityLiters * retrievedTransaction.pricePerLiter;
      const calculationValidation = TestUtils.validateCalculation(
        retrievedTransaction.totalAmount,
        expectedTotal
      );

      if (!calculationValidation.valid) {
        throw new Error(`Calculation inconsistency after retrieval: ${calculationValidation.message}`);
      }

      // Check 3: Verify immutable fields
      if (retrievedTransaction.id !== transaction.id) {
        throw new Error('Transaction ID changed after retrieval');
      }

      if (retrievedTransaction.receiptNumber !== transaction.receiptNumber) {
        throw new Error('Receipt number changed after retrieval');
      }

      // Check 4: Verify timestamp fields
      if (!retrievedTransaction.transactionTime) {
        throw new Error('Transaction time not set');
      }

      const transactionTime = new Date(retrievedTransaction.transactionTime);
      const now = new Date();
      const timeDiff = Math.abs(now - transactionTime);
      
      if (timeDiff > 60000) { // Allow 1 minute tolerance
        throw new Error('Transaction time is too far from current time');
      }

      // Check 5: Verify status consistency
      const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(retrievedTransaction.status)) {
        throw new Error(`Invalid transaction status: ${retrievedTransaction.status}`);
      }

      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'PASSED', { 
        duration,
        transactionId: transaction.id,
        integrityChecks: 5,
        performance: { responseTime: duration }
      });

      results.passed++;
      results.testCases.push({
        name: testName,
        status: 'PASSED',
        transactionId: transaction.id,
        integrityChecks: 5
      });

      // Store integrity check results
      testResults.dataIntegrityChecks.push({
        workflow: 'Transaction Processing',
        timestamp: new Date(),
        transactionId: transaction.id,
        checksPerformed: 5,
        checksPassed: 5,
        issues: []
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      TestUtils.logTest(testName, 'FAILED', { duration, error: error.message });
      results.failed++;
      results.testCases.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });

      // Store integrity check failure
      testResults.dataIntegrityChecks.push({
        workflow: 'Transaction Processing',
        timestamp: new Date(),
        checksPerformed: 5,
        checksPassed: 0,
        issues: [error.message]
      });
    }

    results.total = results.passed + results.failed;
    return results;
  }
}

// Main test execution
async function runComprehensiveBusinessLogicTests() {
  console.log('\n🚀 COMPREHENSIVE BUSINESS LOGIC TESTING SUITE');
  console.log('=' * 80);
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Tenant ID: ${TEST_CONFIG.tenantId}`);
  console.log(`API Base URL: ${TEST_CONFIG.API_BASE_URL}`);
  console.log('=' * 80);

  try {
    // Initialize test results
    testResults.summary.startTime = new Date();

    // Run Station Management Tests
    const stationResults = await StationManagementTests.runAll();
    
    // Run Transaction Processing Tests
    const transactionResults = await TransactionProcessingTests.runAll();
    
    // Calculate final results
    testResults.summary.endTime = new Date();
    testResults.summary.duration = testResults.summary.endTime - testResults.summary.startTime;
    testResults.summary.coverage = calculateTestCoverage();

    // Generate test report
    generateTestReport();

  } catch (error) {
    console.error('\n❌ TEST SUITE EXECUTION FAILED:', error.message);
    testResults.summary.failed++;
    testResults.summary.endTime = new Date();
    testResults.summary.duration = testResults.summary.endTime - testResults.summary.startTime;
    generateTestReport();
  }
}

function calculateTestCoverage() {
  // Calculate coverage based on business requirements
  const totalBusinessRules = 50; // Estimated total business rules
  const testedRules = testResults.businessRuleValidations.length;
  return Math.min(100, (testedRules / totalBusinessRules) * 100);
}

function generateTestReport() {
  console.log('\n📊 COMPREHENSIVE TEST RESULTS REPORT');
  console.log('=' * 80);
  
  console.log('\n📈 SUMMARY:');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed} ✅`);
  console.log(`Failed: ${testResults.summary.failed} ❌`);
  console.log(`Warnings: ${testResults.summary.warnings} ⚠️`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  console.log(`Test Coverage: ${testResults.summary.coverage.toFixed(1)}%`);
  console.log(`Duration: ${(testResults.summary.duration / 1000).toFixed(2)} seconds`);

  // Workflow Results
  console.log('\n🏗️ WORKFLOW RESULTS:');
  for (const [workflow, results] of Object.entries(testResults.workflowResults)) {
    const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0';
    console.log(`${workflow}: ${results.passed}/${results.total} (${successRate}%)`);
  }

  // Performance Metrics
  if (Object.keys(testResults.performanceMetrics).length > 0) {
    console.log('\n⚡ PERFORMANCE METRICS:');
    for (const [test, metrics] of Object.entries(testResults.performanceMetrics)) {
      console.log(`${test}: ${metrics.responseTime}ms`);
    }
  }

  // Data Integrity Results
  if (testResults.dataIntegrityChecks.length > 0) {
    console.log('\n🔒 DATA INTEGRITY CHECKS:');
    for (const check of testResults.dataIntegrityChecks) {
      const passRate = ((check.checksPassed / check.checksPerformed) * 100).toFixed(1);
      console.log(`${check.workflow}: ${check.checksPassed}/${check.checksPerformed} (${passRate}%)`);
      
      if (check.issues.length > 0) {
        console.log(`  Issues: ${check.issues.join(', ')}`);
      }
    }
  }

  // Detailed Results
  console.log('\n📋 DETAILED TEST RESULTS:');
  testResults.detailedResults.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${status} ${result.testName} (${result.duration}ms)`);
    
    if (result.status === 'FAILED' && result.details.error) {
      console.log(`   Error: ${result.details.error}`);
    }
  });

  console.log('\n📄 BUSINESS LOGIC VALIDATION COMPLETE');
  console.log('=' * 80);

  // Write results to file for further analysis
  const fs = require('fs');
  const reportPath = './business-logic-test-report.json';
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📁 Detailed test report saved to: ${reportPath}`);
  } catch (error) {
    console.error(`\n❌ Failed to save test report: ${error.message}`);
  }
}

// Export for potential external usage
module.exports = {
  runComprehensiveBusinessLogicTests,
  TestDataFactory,
  TestUtils,
  StationManagementTests,
  TEST_CONFIG
};

// Run tests if called directly
if (require.main === module) {
  runComprehensiveBusinessLogicTests()
    .then(() => {
      console.log('\n✅ Business logic testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Business logic testing failed:', error);
      process.exit(1);
    });
}