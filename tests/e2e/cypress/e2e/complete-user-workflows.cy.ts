/// <reference types="cypress" />

/**
 * Complete User Workflows E2E Tests
 * Tests end-to-end user journeys for Ghana OMC ERP System
 */

describe('Complete User Workflows', () => {
  const testUser = {
    email: 'workflow-test@omc-erp.com',
    password: 'WorkflowTest123!',
    firstName: 'Workflow',
    lastName: 'Test',
    username: 'workflowtest',
    role: 'PRICING_MANAGER',
    tenantId: Cypress.env('testTenantId')
  };

  const testStation = {
    name: 'Shell Accra Central',
    code: 'SAC001',
    location: {
      latitude: Cypress.env('ghanaTestData').testStationLocation.latitude,
      longitude: Cypress.env('ghanaTestData').testStationLocation.longitude,
      address: Cypress.env('ghanaTestData').testStationLocation.address
    },
    licenseNumber: Cypress.env('ghanaTestData').validLicense
  };

  beforeEach(() => {
    // Clean up test data before each test
    cy.task('cleanupTestData', testUser.tenantId);
    
    // Seed required test data
    cy.task('seedTestData', {
      user: testUser,
      station: testStation,
      products: Cypress.env('ghanaTestData').sampleProducts
    });

    // Visit the application
    cy.visit('/');
    
    // Set up network monitoring
    cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/v1/pricing/windows').as('getPricingWindows');
    cy.intercept('POST', '**/api/v1/pricing/windows').as('createPricingWindow');
    cy.intercept('POST', '**/api/v1/transactions').as('createTransaction');
    cy.intercept('POST', '**/api/v1/uppf/claims').as('createUPPFClaim');
  });

  describe('Complete Business Operations Workflow', () => {
    it('should complete full business cycle: Login → Create Pricing → Process Transaction → Generate Claims', () => {
      // Step 1: User Registration and Login
      cy.log('🔐 Step 1: User Authentication');
      
      // Navigate to login page
      cy.get('[data-cy=login-button]').click();
      cy.url().should('include', '/auth/login');
      
      // Perform login
      cy.get('[data-cy=username-input]').type(testUser.username);
      cy.get('[data-cy=password-input]').type(testUser.password);
      cy.get('[data-cy=tenant-select]').select(testUser.tenantId);
      cy.get('[data-cy=login-submit]').click();
      
      // Wait for login to complete
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=user-menu]').should('contain', testUser.firstName);
      
      // Verify dashboard loads with correct data
      cy.get('[data-cy=dashboard-title]').should('be.visible');
      cy.get('[data-cy=tenant-indicator]').should('contain', testUser.tenantId);

      // Step 2: Create Pricing Window
      cy.log('💰 Step 2: Create Pricing Window');
      
      // Navigate to pricing module
      cy.get('[data-cy=nav-pricing]').click();
      cy.url().should('include', '/pricing');
      
      // Wait for pricing windows to load
      cy.wait('@getPricingWindows');
      
      // Create new pricing window
      cy.get('[data-cy=create-pricing-window]').click();
      
      const pricingWindow = {
        windowId: `E2E-PW-${Date.now()}`,
        name: 'E2E Test Pricing Window',
        description: 'End-to-end test pricing window',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      // Fill pricing window form
      cy.get('[data-cy=window-id-input]').type(pricingWindow.windowId);
      cy.get('[data-cy=window-name-input]').type(pricingWindow.name);
      cy.get('[data-cy=window-description-input]').type(pricingWindow.description);
      cy.get('[data-cy=window-start-date]').type(pricingWindow.startDate);
      cy.get('[data-cy=window-end-date]').type(pricingWindow.endDate);
      
      // Submit pricing window
      cy.get('[data-cy=create-window-submit]').click();
      cy.wait('@createPricingWindow').its('response.statusCode').should('eq', 201);
      
      // Verify pricing window created
      cy.get('[data-cy=success-message]').should('contain', 'Pricing window created successfully');
      cy.get(`[data-cy=window-${pricingWindow.windowId}]`).should('be.visible');
      
      // Step 3: Calculate Station Prices
      cy.log('🏪 Step 3: Calculate Station Prices');
      
      // Open pricing window details
      cy.get(`[data-cy=window-${pricingWindow.windowId}]`).click();
      
      // Calculate prices for all products
      Cypress.env('ghanaTestData').sampleProducts.forEach((product, index) => {
        cy.get('[data-cy=calculate-station-price]').click();
        cy.get('[data-cy=station-select]').select(testStation.code);
        cy.get('[data-cy=product-select]').select(product);
        cy.get('[data-cy=calculate-price-submit]').click();
        
        // Verify price calculation
        cy.get('[data-cy=price-calculation-result]').should('be.visible');
        cy.get('[data-cy=calculated-price]').should('not.be.empty');
        cy.get('[data-cy=price-breakdown]').should('be.visible');
        
        // Verify Ghana-specific components are present
        cy.get('[data-cy=component-EXREF]').should('be.visible'); // Ex-Refinery Price
        cy.get('[data-cy=component-UPPF]').should('be.visible'); // UPPF Margin
        cy.get('[data-cy=component-OMC]').should('be.visible'); // OMC Margin
        cy.get('[data-cy=component-DEAL]').should('be.visible'); // Dealer Margin
      });
      
      // Activate pricing window
      cy.get('[data-cy=activate-pricing-window]').click();
      cy.get('[data-cy=confirm-activation]').click();
      
      // Verify activation
      cy.get('[data-cy=window-status]').should('contain', 'ACTIVE');

      // Step 4: Process Fuel Transaction
      cy.log('⛽ Step 4: Process Fuel Transaction');
      
      // Navigate to transaction module
      cy.get('[data-cy=nav-transactions]').click();
      cy.url().should('include', '/transactions');
      
      // Create new transaction
      cy.get('[data-cy=create-transaction]').click();
      
      const transaction = {
        stationId: testStation.code,
        fuelType: 'PETROL',
        quantity: 50, // 50 liters
        paymentMethod: 'MOBILE_MONEY'
      };
      
      // Fill transaction form
      cy.get('[data-cy=transaction-station-select]').select(transaction.stationId);
      cy.get('[data-cy=pump-select]').select('PUMP-001'); // First available pump
      cy.get('[data-cy=fuel-type-select]').select(transaction.fuelType);
      cy.get('[data-cy=quantity-input]').type(transaction.quantity.toString());
      cy.get('[data-cy=payment-method-select]').select(transaction.paymentMethod);
      
      // Add customer if loyalty program enabled
      cy.get('[data-cy=add-customer-toggle]').click();
      cy.get('[data-cy=customer-phone]').type('+233541234567');
      
      // Submit transaction
      cy.get('[data-cy=create-transaction-submit]').click();
      cy.wait('@createTransaction').its('response.statusCode').should('eq', 201);
      
      // Verify transaction processing
      cy.get('[data-cy=transaction-success]').should('be.visible');
      cy.get('[data-cy=receipt-number]').should('not.be.empty');
      cy.get('[data-cy=transaction-total]').should('contain', 'GHS');
      
      // Verify receipt details
      cy.get('[data-cy=receipt-details]').within(() => {
        cy.get('[data-cy=receipt-station]').should('contain', testStation.name);
        cy.get('[data-cy=receipt-fuel-type]').should('contain', transaction.fuelType);
        cy.get('[data-cy=receipt-quantity]').should('contain', transaction.quantity);
        cy.get('[data-cy=receipt-payment-method]').should('contain', transaction.paymentMethod);
      });
      
      // Test mobile money payment flow
      if (transaction.paymentMethod === 'MOBILE_MONEY') {
        cy.get('[data-cy=mobile-money-prompt]').should('be.visible');
        cy.get('[data-cy=momo-phone-number]').should('contain', '+233541234567');
        
        // Simulate payment completion (mock payment gateway response)
        cy.get('[data-cy=simulate-payment-success]').click();
        cy.get('[data-cy=payment-status]').should('contain', 'COMPLETED');
      }

      // Step 5: Generate UPPF Claim (if applicable)
      cy.log('🚛 Step 5: Generate UPPF Claim');
      
      // Navigate to UPPF module
      cy.get('[data-cy=nav-uppf]').click();
      cy.url().should('include', '/uppf');
      
      // Create delivery consignment for UPPF claim
      cy.get('[data-cy=create-uppf-claim]').click();
      
      const uppfClaim = {
        windowId: pricingWindow.windowId,
        routeId: Cypress.env('ghanaTestData').testRoutes[1].id, // ACCRA-KUMASI route
        kmActual: 280, // 30km beyond equalisation threshold
        litresMoved: 39950
      };
      
      // Fill UPPF claim form
      cy.get('[data-cy=uppf-window-select]').select(uppfClaim.windowId);
      cy.get('[data-cy=uppf-route-select]').select(uppfClaim.routeId);
      cy.get('[data-cy=km-actual-input]').type(uppfClaim.kmActual.toString());
      cy.get('[data-cy=litres-moved-input]').type(uppfClaim.litresMoved.toString());
      
      // Add GPS trace data
      cy.get('[data-cy=upload-gps-trace]').click();
      cy.fixture('sample-gps-trace.json').then((gpsData) => {
        cy.get('[data-cy=gps-trace-data]').type(JSON.stringify(gpsData));
      });
      
      // Submit UPPF claim
      cy.get('[data-cy=create-uppf-claim-submit]').click();
      cy.wait('@createUPPFClaim').its('response.statusCode').should('eq', 201);
      
      // Verify UPPF claim calculation
      cy.get('[data-cy=uppf-claim-success]').should('be.visible');
      cy.get('[data-cy=claim-id]').should('not.be.empty');
      cy.get('[data-cy=claim-amount]').should('contain', 'GHS');
      cy.get('[data-cy=km-beyond-equalisation]').should('contain', '30'); // Expected excess km
      
      // Verify three-way reconciliation
      cy.get('[data-cy=reconciliation-results]').within(() => {
        cy.get('[data-cy=depot-loaded]').should('be.visible');
        cy.get('[data-cy=station-received]').should('be.visible');
        cy.get('[data-cy=claimed-moved]').should('be.visible');
        cy.get('[data-cy=variance-status]').should('be.visible');
      });

      // Step 6: Generate Reports and Dashboard Views
      cy.log('📊 Step 6: Generate Reports and Dashboard Views');
      
      // Navigate to reports
      cy.get('[data-cy=nav-reports]').click();
      cy.url().should('include', '/reports');
      
      // Generate daily sales report
      cy.get('[data-cy=daily-sales-report]').click();
      cy.get('[data-cy=report-date]').type(new Date().toISOString().split('T')[0]);
      cy.get('[data-cy=generate-report]').click();
      
      // Verify report generation
      cy.get('[data-cy=report-results]').should('be.visible');
      cy.get('[data-cy=total-sales]').should('not.be.empty');
      cy.get('[data-cy=total-transactions]').should('contain', '1'); // Our test transaction
      
      // Generate UPPF claims report
      cy.get('[data-cy=uppf-claims-report]').click();
      cy.get('[data-cy=uppf-report-window]').select(pricingWindow.windowId);
      cy.get('[data-cy=generate-uppf-report]').click();
      
      // Verify UPPF report
      cy.get('[data-cy=uppf-report-results]').should('be.visible');
      cy.get('[data-cy=total-claims]').should('contain', '1');
      cy.get('[data-cy=total-claim-amount]').should('contain', 'GHS');

      // Step 7: Test Real-time Features
      cy.log('⚡ Step 7: Test Real-time Features');
      
      // Navigate back to dashboard
      cy.get('[data-cy=nav-dashboard]').click();
      
      // Verify real-time updates
      cy.get('[data-cy=real-time-sales]').should('be.visible');
      cy.get('[data-cy=active-transactions]').should('be.visible');
      cy.get('[data-cy=station-status]').should('be.visible');
      
      // Test WebSocket connection
      cy.window().its('WebSocket').should('exist');
      
      // Simulate real-time transaction update
      cy.get('[data-cy=simulate-new-transaction]').click();
      cy.get('[data-cy=real-time-notification]').should('be.visible');

      // Step 8: Test Mobile Responsiveness
      cy.log('📱 Step 8: Test Mobile Responsiveness');
      
      // Test mobile viewport
      cy.viewport('iphone-x');
      
      // Verify mobile navigation
      cy.get('[data-cy=mobile-menu-toggle]').should('be.visible').click();
      cy.get('[data-cy=mobile-nav-menu]').should('be.visible');
      
      // Test key mobile interactions
      cy.get('[data-cy=mobile-nav-transactions]').click();
      cy.get('[data-cy=transaction-list]').should('be.visible');
      cy.get('[data-cy=mobile-transaction-card]').should('have.length.at.least', 1);
      
      // Restore desktop viewport
      cy.viewport(1280, 720);

      // Step 9: Test Offline Capabilities (PWA)
      cy.log('🌐 Step 9: Test PWA and Offline Capabilities');
      
      // Verify service worker registration
      cy.window().its('navigator.serviceWorker.ready').should('exist');
      
      // Test offline transaction storage
      cy.get('[data-cy=simulate-offline]').click();
      cy.get('[data-cy=offline-indicator]').should('be.visible');
      
      // Create transaction while offline
      cy.get('[data-cy=create-transaction]').click();
      cy.get('[data-cy=offline-transaction-form]').should('be.visible');
      // ... fill form similar to step 4 ...
      cy.get('[data-cy=queue-offline-transaction]').click();
      
      // Verify transaction is queued
      cy.get('[data-cy=offline-queue-count]').should('contain', '1');
      
      // Restore online status
      cy.get('[data-cy=simulate-online]').click();
      cy.get('[data-cy=online-indicator]').should('be.visible');
      
      // Verify queued transaction syncs
      cy.get('[data-cy=sync-status]').should('contain', 'Synced');
      cy.get('[data-cy=offline-queue-count]').should('contain', '0');

      // Step 10: Logout and Session Management
      cy.log('🚪 Step 10: Logout and Session Management');
      
      // Test session timeout warning
      cy.get('[data-cy=simulate-session-timeout]').click();
      cy.get('[data-cy=session-timeout-warning]').should('be.visible');
      cy.get('[data-cy=extend-session]').click();
      
      // Perform logout
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      cy.get('[data-cy=confirm-logout]').click();
      
      // Verify successful logout
      cy.url().should('include', '/auth/login');
      cy.get('[data-cy=login-form]').should('be.visible');
      
      // Verify session is cleared
      cy.window().its('localStorage').invoke('getItem', 'access_token').should('be.null');
      cy.window().its('sessionStorage').invoke('getItem', 'user_data').should('be.null');
      
      // Verify protected routes are inaccessible
      cy.visit('/dashboard');
      cy.url().should('include', '/auth/login');

      // Final verification - all workflow steps completed successfully
      cy.log('✅ Complete workflow test passed successfully');
    });
  });

  describe('Error Handling and Recovery Workflows', () => {
    it('should handle network failures gracefully and recover', () => {
      // Login first
      cy.login(testUser);
      
      // Simulate network failure during transaction
      cy.intercept('POST', '**/api/v1/transactions', { forceNetworkError: true }).as('failedTransaction');
      
      // Attempt to create transaction
      cy.get('[data-cy=create-transaction]').click();
      // ... fill form ...
      cy.get('[data-cy=create-transaction-submit]').click();
      
      // Verify error handling
      cy.get('[data-cy=network-error-message]').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible');
      
      // Restore network and retry
      cy.intercept('POST', '**/api/v1/transactions').as('successfulTransaction');
      cy.get('[data-cy=retry-button]').click();
      
      // Verify successful retry
      cy.wait('@successfulTransaction');
      cy.get('[data-cy=transaction-success]').should('be.visible');
    });

    it('should handle validation errors and guide user correction', () => {
      cy.login(testUser);
      
      // Attempt to create pricing window with invalid data
      cy.get('[data-cy=nav-pricing]').click();
      cy.get('[data-cy=create-pricing-window]').click();
      
      // Submit with missing required fields
      cy.get('[data-cy=create-window-submit]').click();
      
      // Verify validation errors
      cy.get('[data-cy=validation-error-window-id]').should('be.visible');
      cy.get('[data-cy=validation-error-name]').should('be.visible');
      
      // Correct the errors
      cy.get('[data-cy=window-id-input]').type('VALID-WINDOW-ID');
      cy.get('[data-cy=window-name-input]').type('Valid Window Name');
      
      // Verify errors are cleared
      cy.get('[data-cy=validation-error-window-id]').should('not.exist');
      cy.get('[data-cy=validation-error-name]').should('not.exist');
    });
  });

  describe('Performance and Load Scenarios', () => {
    it('should handle multiple concurrent user actions', () => {
      // Login with multiple user contexts
      cy.login(testUser);
      
      // Simulate concurrent operations
      const operations = [
        () => cy.get('[data-cy=nav-pricing]').click(),
        () => cy.get('[data-cy=nav-transactions]').click(),
        () => cy.get('[data-cy=nav-reports]').click(),
        () => cy.get('[data-cy=nav-uppf]').click()
      ];
      
      // Execute operations rapidly
      operations.forEach((operation, index) => {
        cy.wait(index * 100); // Staggered execution
        operation();
      });
      
      // Verify all modules load successfully
      cy.get('[data-cy=module-loading-indicator]').should('not.exist');
      cy.get('[data-cy=error-boundary]').should('not.exist');
    });

    it('should maintain performance under data load', () => {
      // Seed large dataset
      cy.task('seedTestData', {
        transactions: 1000,
        pricingWindows: 50,
        uppfClaims: 100
      });
      
      cy.login(testUser);
      
      // Measure page load performance
      cy.visit('/dashboard');
      cy.window().then((win) => {
        const perfData = win.performance.getEntriesByType('navigation')[0];
        expect(perfData.loadEventEnd - perfData.loadEventStart).to.be.lessThan(Cypress.env('maxLoadTime'));
      });
      
      // Test pagination and filtering performance
      cy.get('[data-cy=nav-transactions]').click();
      
      const startTime = Date.now();
      cy.get('[data-cy=transaction-filter-input]').type('PETROL');
      cy.get('[data-cy=filter-results]').should('be.visible');
      
      const endTime = Date.now();
      expect(endTime - startTime).to.be.lessThan(1000); // Filter should be fast
      
      // Test large data export
      cy.get('[data-cy=export-all-transactions]').click();
      cy.get('[data-cy=export-progress]').should('be.visible');
      cy.get('[data-cy=download-link]', { timeout: 30000 }).should('be.visible');
    });
  });

  // Custom commands for reusable workflow steps
  Cypress.Commands.add('login', (user) => {
    cy.visit('/auth/login');
    cy.get('[data-cy=username-input]').type(user.username);
    cy.get('[data-cy=password-input]').type(user.password);
    cy.get('[data-cy=tenant-select]').select(user.tenantId);
    cy.get('[data-cy=login-submit]').click();
    cy.url().should('include', '/dashboard');
  });

  Cypress.Commands.add('createPricingWindow', (windowData) => {
    cy.get('[data-cy=nav-pricing]').click();
    cy.get('[data-cy=create-pricing-window]').click();
    
    Object.entries(windowData).forEach(([key, value]) => {
      cy.get(`[data-cy=${key}-input]`).type(value);
    });
    
    cy.get('[data-cy=create-window-submit]').click();
    cy.get('[data-cy=success-message]').should('be.visible');
  });

  Cypress.Commands.add('processTransaction', (transactionData) => {
    cy.get('[data-cy=nav-transactions]').click();
    cy.get('[data-cy=create-transaction]').click();
    
    Object.entries(transactionData).forEach(([key, value]) => {
      const inputType = typeof value === 'number' ? 'type' : 'select';
      cy.get(`[data-cy=${key}-${inputType === 'type' ? 'input' : 'select'}]`)[inputType](value.toString());
    });
    
    cy.get('[data-cy=create-transaction-submit]').click();
    cy.get('[data-cy=transaction-success]').should('be.visible');
  });
});