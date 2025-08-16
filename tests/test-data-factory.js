"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataFactory = void 0;
const uuid_1 = require("uuid");
const shared_types_1 = require("@omc-erp/shared-types");
/**
 * Test Data Factory for OMC ERP System
 * Provides comprehensive test data generation for all UPPF features
 */
class TestDataFactory {
    static DEFAULT_TENANT_ID = 'test-tenant-123';
    static DEFAULT_USER_ID = 'test-user-123';
    // UPPF Test Data Generators
    static createTestDelivery(overrides = {}) {
        return {
            id: (0, uuid_1.v4)(),
            consignmentNumber: `DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tenantId: this.DEFAULT_TENANT_ID,
            routeId: overrides.routeId || 'route-accra-tema',
            litresLoaded: overrides.litresLoaded || 40000,
            litresReceived: overrides.litresReceived || (overrides.litresLoaded || 40000) - Math.floor(Math.random() * 100), // Small variance
            loadingDate: overrides.loadingDate || new Date('2024-01-15T08:00:00Z'),
            deliveryDate: overrides.deliveryDate || new Date('2024-01-15T16:00:00Z'),
            driverName: overrides.driverName || 'John Doe',
            vehicleNumber: overrides.vehicleNumber || `GH-${Math.floor(Math.random() * 9999)}-20`,
            depotName: overrides.depotName || 'Tema Depot',
            stationName: overrides.stationName || 'Shell Accra Central',
            productType: overrides.productType || 'petrol',
            tankNumber: overrides.tankNumber || 'TK-001',
            temperature: overrides.temperature || 25,
            density: overrides.density || 0.745,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestEqualisationPoint(overrides = {}) {
        return {
            id: (0, uuid_1.v4)(),
            routeId: overrides.routeId || 'route-accra-tema',
            kmThreshold: overrides.kmThreshold || 150, // 150km threshold
            tariffPerLitreKm: overrides.tariffPerLitreKm || 0.02, // GHS 0.02 per litre per km
            effectiveFrom: overrides.effectiveFrom || new Date('2024-01-01'),
            effectiveTo: overrides.effectiveTo || null,
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            notes: overrides.notes || 'Standard equalisation point for Accra-Tema route',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestClaim(overrides = {}) {
        const windowId = overrides.windowId || 'PW-2024-W01';
        const deliveryId = overrides.deliveryId || (0, uuid_1.v4)();
        const routeId = overrides.routeId || 'route-accra-tema';
        const kmBeyondEqualisation = overrides.kmBeyondEqualisation || 30;
        const litresMoved = overrides.litresMoved || 39950;
        const tariffPerLitreKm = overrides.tariffPerLitreKm || 0.02;
        return {
            id: (0, uuid_1.v4)(),
            claimId: `UPPF-${windowId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            windowId,
            deliveryId,
            routeId,
            kmBeyondEqualisation,
            litresMoved,
            tariffPerLitreKm,
            amountDue: kmBeyondEqualisation * litresMoved * tariffPerLitreKm,
            status: overrides.status || shared_types_1.UPPFClaimStatus.DRAFT,
            evidenceLinks: overrides.evidenceLinks || [`gps-trace-${deliveryId}`],
            notes: overrides.notes || null,
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            submittedAt: overrides.submittedAt || null,
            submittedBy: overrides.submittedBy || null,
            submissionReference: overrides.submissionReference || null,
            amountPaid: overrides.amountPaid || null,
            paidAt: overrides.paidAt || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestGPSTrace(overrides = {}) {
        const deliveryId = overrides.deliveryId || (0, uuid_1.v4)();
        const baseLatitude = 5.6037; // Accra coordinates
        const baseLongitude = -0.1870;
        const routePoints = overrides.routePoints || this.generateGPSPoints(baseLatitude, baseLongitude, 180); // 180km route
        return {
            id: (0, uuid_1.v4)(),
            deliveryId,
            tenantId: this.DEFAULT_TENANT_ID,
            startTime: overrides.startTime || new Date('2024-01-15T08:00:00Z'),
            endTime: overrides.endTime || new Date('2024-01-15T16:00:00Z'),
            totalKm: overrides.totalKm || 180,
            routePoints,
            anomaliesDetected: overrides.anomaliesDetected || [],
            confidenceScore: overrides.confidenceScore || 0.95,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestCreateClaimDto(overrides = {}) {
        return {
            windowId: overrides.windowId || 'PW-2024-W01',
            deliveryId: overrides.deliveryId || (0, uuid_1.v4)(),
            routeId: overrides.routeId || 'route-accra-tema',
            kmActual: overrides.kmActual || 180,
            litresMoved: overrides.litresMoved || 39950,
            gpsTrace: overrides.gpsTrace || this.generateGPSPoints(5.6037, -0.1870, overrides.kmActual || 180),
            evidenceLinks: overrides.evidenceLinks || ['document-123'],
            ...overrides,
        };
    }
    // Pricing Test Data Generators
    static createTestPricingWindow(overrides = {}) {
        const windowId = overrides.windowId || `PW-2024-W${String(Math.floor(Math.random() * 52) + 1).padStart(2, '0')}`;
        return {
            id: (0, uuid_1.v4)(),
            windowId,
            title: overrides.title || `Pricing Window ${windowId}`,
            startDate: overrides.startDate || new Date('2024-01-15T00:00:00Z'),
            endDate: overrides.endDate || new Date('2024-01-21T23:59:59Z'),
            status: overrides.status || shared_types_1.PricingWindowStatus.DRAFT,
            npaGuidelineDocId: overrides.npaGuidelineDocId || `NPA-2024-${windowId}-GUIDE`,
            effectiveRegions: overrides.effectiveRegions || ['Greater Accra', 'Ashanti'],
            approvalRequiredBy: overrides.approvalRequiredBy || new Date('2024-01-14T23:59:59Z'),
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            approvedBy: overrides.approvedBy || null,
            approvedAt: overrides.approvedAt || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestStationPrice(overrides = {}) {
        const stationId = overrides.stationId || 'station-accra-001';
        const productId = overrides.productId || 'petrol-95';
        const windowId = overrides.windowId || 'PW-2024-W01';
        // Generate realistic PBU breakdown
        const components = [
            { code: 'EXREF', name: 'Ex-Refinery Price', value: 8.904, unit: 'GHS_per_litre' },
            { code: 'EDRL', name: 'Energy Debt Recovery Levy', value: 0.490, unit: 'GHS_per_litre' },
            { code: 'ROAD', name: 'Road Fund Levy', value: 0.840, unit: 'GHS_per_litre' },
            { code: 'PSRL', name: 'Price Stabilisation Recovery Levy', value: 0.160, unit: 'GHS_per_litre' },
            { code: 'BOST', name: 'BOST Margin', value: 0.150, unit: 'GHS_per_litre' },
            { code: 'UPPF', name: 'UPPF Margin', value: 0.200, unit: 'GHS_per_litre' },
            { code: 'MARK', name: 'Fuel Marking', value: 0.080, unit: 'GHS_per_litre' },
            { code: 'PRIM', name: 'Primary Distribution', value: 0.220, unit: 'GHS_per_litre' },
            { code: 'OMC', name: 'OMC Margin', value: 0.300, unit: 'GHS_per_litre' },
            { code: 'DEAL', name: 'Dealer Margin', value: 0.350, unit: 'GHS_per_litre' },
        ];
        const totalPrice = components.reduce((sum, comp) => sum + comp.value, 0);
        return {
            id: (0, uuid_1.v4)(),
            stationId,
            productId,
            windowId,
            exPumpPrice: overrides.exPumpPrice || totalPrice,
            calcBreakdownJson: overrides.calcBreakdownJson || {
                components,
                totalPrice,
                sourceDocuments: [`NPA-2024-${windowId}-GUIDE`],
                calculatedAt: new Date().toISOString(),
            },
            publishedAt: overrides.publishedAt || null,
            publishedBy: overrides.publishedBy || null,
            tenantId: this.DEFAULT_TENANT_ID,
            calculatedBy: this.DEFAULT_USER_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    // Dealer Test Data Generators
    static createTestDealer(overrides = {}) {
        return {
            id: (0, uuid_1.v4)(),
            dealerCode: overrides.dealerCode || `DLR-${Math.floor(Math.random() * 10000)}`,
            businessName: overrides.businessName || `${['Quick', 'Star', 'Gold', 'Prime', 'Elite'][Math.floor(Math.random() * 5)]} Fuel Station`,
            contactPerson: overrides.contactPerson || 'John Mensah',
            phoneNumber: overrides.phoneNumber || '+233244123456',
            emailAddress: overrides.emailAddress || 'dealer@example.com',
            physicalAddress: overrides.physicalAddress || 'Accra, Ghana',
            gpsCoordinates: overrides.gpsCoordinates || '5.6037,-0.1870',
            regionId: overrides.regionId || 'greater-accra',
            districtId: overrides.districtId || 'accra-metro',
            licenseNumber: overrides.licenseNumber || `LIC-${Date.now()}`,
            licenseExpiryDate: overrides.licenseExpiryDate || new Date('2025-12-31'),
            creditLimit: overrides.creditLimit || 500000, // GHS 500,000
            currentBalance: overrides.currentBalance || 50000, // GHS 50,000 outstanding
            marginPercentage: overrides.marginPercentage || 5.5, // 5.5%
            isActive: overrides.isActive ?? true,
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestDealerSettlement(overrides = {}) {
        const dealerCode = overrides.dealerCode || 'DLR-001';
        const settlementId = overrides.settlementId || `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return {
            id: (0, uuid_1.v4)(),
            settlementId,
            dealerCode,
            windowId: overrides.windowId || 'PW-2024-W01',
            settlementPeriodStart: overrides.settlementPeriodStart || new Date('2024-01-15T00:00:00Z'),
            settlementPeriodEnd: overrides.settlementPeriodEnd || new Date('2024-01-21T23:59:59Z'),
            totalSales: overrides.totalSales || 150000, // GHS 150,000
            totalMargin: overrides.totalMargin || 8250, // 5.5% of sales
            creditRepayment: overrides.creditRepayment || 25000, // GHS 25,000
            netPayment: overrides.netPayment || -16750, // Negative = owe dealer
            status: overrides.status || shared_types_1.DealerSettlementStatus.PENDING,
            generatedAt: overrides.generatedAt || new Date(),
            processedAt: overrides.processedAt || null,
            processedBy: overrides.processedBy || null,
            paymentReference: overrides.paymentReference || null,
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    // IFRS Test Data Generators
    static createTestRevenueTransaction(overrides = {}) {
        return {
            id: (0, uuid_1.v4)(),
            transactionId: overrides.transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            dealerCode: overrides.dealerCode || 'DLR-001',
            stationId: overrides.stationId || 'station-accra-001',
            productId: overrides.productId || 'petrol-95',
            quantity: overrides.quantity || 1000, // 1000 litres
            unitPrice: overrides.unitPrice || 12.5, // GHS 12.50 per litre
            totalAmount: overrides.totalAmount || 12500, // GHS 12,500
            transactionDate: overrides.transactionDate || new Date(),
            performanceObligationMet: overrides.performanceObligationMet ?? true,
            revenueRecognitionDate: overrides.revenueRecognitionDate || new Date(),
            ifrsCategory: overrides.ifrsCategory || 'FUEL_SALES',
            contractAssetValue: overrides.contractAssetValue || 0,
            contractLiabilityValue: overrides.contractLiabilityValue || 0,
            tenantId: this.DEFAULT_TENANT_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static createTestECLAssessment(overrides = {}) {
        return {
            id: (0, uuid_1.v4)(),
            assessmentId: overrides.assessmentId || `ECL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            dealerCode: overrides.dealerCode || 'DLR-001',
            assessmentDate: overrides.assessmentDate || new Date(),
            outstandingAmount: overrides.outstandingAmount || 50000, // GHS 50,000
            daysPastDue: overrides.daysPastDue || 30,
            riskCategory: overrides.riskCategory || 'STAGE_1', // STAGE_1, STAGE_2, STAGE_3
            probabilityOfDefault: overrides.probabilityOfDefault || 0.05, // 5%
            lossGivenDefault: overrides.lossGivenDefault || 0.4, // 40%
            exposureAtDefault: overrides.exposureAtDefault || 50000,
            expectedCreditLoss: overrides.expectedCreditLoss || 1000, // 5% * 40% * 50000 = 1000
            forwardLookingAdjustment: overrides.forwardLookingAdjustment || 1.1, // 10% increase
            finalECLAmount: overrides.finalECLAmount || 1100, // 1000 * 1.1
            tenantId: this.DEFAULT_TENANT_ID,
            createdBy: this.DEFAULT_USER_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    // Utility Functions
    static generateGPSPoints(startLat, startLng, totalKm, pointsCount = 10) {
        const points = [];
        const kmPerPoint = totalKm / (pointsCount - 1);
        const degreePerKm = 0.009; // Rough conversion for Ghana region
        for (let i = 0; i < pointsCount; i++) {
            const progress = i / (pointsCount - 1);
            const currentTime = new Date(Date.now() + (i * 30 * 60 * 1000)); // 30 minutes apart
            // Add some realistic GPS noise and route curvature
            const latOffset = (progress * totalKm * degreePerKm) + (Math.random() - 0.5) * 0.001;
            const lngOffset = (progress * totalKm * degreePerKm * 0.8) + (Math.random() - 0.5) * 0.001;
            points.push({
                latitude: startLat + latOffset,
                longitude: startLng + lngOffset,
                timestamp: currentTime.toISOString(),
                speed: Math.random() * 60 + 40, // 40-100 km/h
                heading: Math.random() * 360,
            });
        }
        return points;
    }
    static createBulkClaims(count, overrides = {}) {
        return Array.from({ length: count }, (_, i) => this.createTestClaim({
            ...overrides,
            claimId: `UPPF-BULK-${i.toString().padStart(4, '0')}`,
            amountDue: 1000 + (i * 100), // Varying amounts
            kmBeyondEqualisation: 10 + i, // Varying distances
        }));
    }
    static createBulkDeliveries(count, overrides = {}) {
        return Array.from({ length: count }, (_, i) => this.createTestDelivery({
            ...overrides,
            consignmentNumber: `BULK-DEL-${i.toString().padStart(4, '0')}`,
            litresLoaded: 35000 + (i * 1000), // Varying volumes
        }));
    }
    static createConcurrentTestScenario() {
        return {
            claims: this.createBulkClaims(1000),
            deliveries: this.createBulkDeliveries(1000),
            pricingWindows: Array.from({ length: 12 }, (_, i) => this.createTestPricingWindow({ windowId: `PW-2024-W${String(i + 1).padStart(2, '0')}` })),
            dealers: Array.from({ length: 50 }, (_, i) => this.createTestDealer({ dealerCode: `DLR-${String(i + 1).padStart(3, '0')}` })),
        };
    }
    // Helper methods for test scenarios
    static createVarianceScenario() {
        return {
            delivery: this.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39800, // 200L variance - exceeds tolerance
            }),
            claim: this.createTestCreateClaimDto({
                litresMoved: 39950, // Doesn't match received
                kmActual: 200, // Will be validated against GPS
            }),
        };
    }
    static createAgingClaimsScenario() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return [
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: new Date(), // Recent
                amountDue: 15000,
            }),
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: thirtyDaysAgo,
                amountDue: 25000,
            }),
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: sixtyDaysAgo,
                amountDue: 35000,
            }),
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: ninetyDaysAgo,
                amountDue: 45000,
            }),
        ];
    }
    static createPaymentVarianceScenario() {
        return [
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.PAID,
                amountDue: 10000,
                amountPaid: 10000, // Full payment
                paidAt: new Date(),
            }),
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.PAID,
                amountDue: 15000,
                amountPaid: 12000, // Short payment
                paidAt: new Date(),
            }),
            this.createTestClaim({
                status: shared_types_1.UPPFClaimStatus.PAID,
                amountDue: 20000,
                amountPaid: 18500, // Slight underpayment
                paidAt: new Date(),
            }),
        ];
    }
    static getTenantId() {
        return this.DEFAULT_TENANT_ID;
    }
    static getUserId() {
        return this.DEFAULT_USER_ID;
    }
}
exports.TestDataFactory = TestDataFactory;
//# sourceMappingURL=test-data-factory.js.map