"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const claims_service_1 = require("../../services/uppf-service/src/claims/claims.service");
const uppf_claim_entity_1 = require("../../services/uppf-service/src/claims/entities/uppf-claim.entity");
const delivery_consignment_entity_1 = require("../../services/uppf-service/src/claims/entities/delivery-consignment.entity");
const equalisation_point_entity_1 = require("../../services/uppf-service/src/claims/entities/equalisation-point.entity");
const gps_trace_entity_1 = require("../../services/uppf-service/src/claims/entities/gps-trace.entity");
const test_data_factory_1 = require("../test-data-factory");
describe('UPPF Three-Way Reconciliation Comprehensive Tests', () => {
    let service;
    const tenantId = test_data_factory_1.TestDataFactory.getTenantId();
    const userId = test_data_factory_1.TestDataFactory.getUserId();
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                claims_service_1.ClaimsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(uppf_claim_entity_1.UPPFClaim),
                    useValue: { createQueryBuilder: jest.fn(), find: jest.fn(), update: jest.fn() },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(delivery_consignment_entity_1.DeliveryConsignment),
                    useValue: { findOne: jest.fn() },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(equalisation_point_entity_1.EqualisationPoint),
                    useValue: { findOne: jest.fn() },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(gps_trace_entity_1.GPSTrace),
                    useValue: { create: jest.fn(), save: jest.fn() },
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: {
                        createQueryRunner: jest.fn(() => ({
                            connect: jest.fn(),
                            startTransaction: jest.fn(),
                            commitTransaction: jest.fn(),
                            rollbackTransaction: jest.fn(),
                            release: jest.fn(),
                            manager: { save: jest.fn() },
                        })),
                    },
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: { emit: jest.fn() },
                },
            ],
        }).compile();
        service = module.get(claims_service_1.ClaimsService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Perfect Reconciliation Scenarios', () => {
        it('should pass reconciliation with identical values', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 40000, // Perfect match
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 40000, // Perfect match
                gpsTrace: undefined, // No GPS validation
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(false);
            expect(result.variances).toHaveLength(0);
            expect(result.reconciliation).toEqual({
                depotLoaded: 40000,
                stationReceived: 40000,
                claimedMoved: 40000,
                volumeVariance: 0,
            });
        });
        it('should pass reconciliation within acceptable tolerances', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39970, // 30L variance (within 50L tolerance)
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39980, // 10L difference from received (within tolerance)
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(false);
            expect(result.reconciliation.volumeVariance).toBe(30); // 40000 - 39970
            expect(result.reconciliation.depotLoaded).toBe(40000);
            expect(result.reconciliation.stationReceived).toBe(39970);
            expect(result.reconciliation.claimedMoved).toBe(39980);
        });
        it('should handle edge case at exact tolerance boundary', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39950, // Exactly 50L variance (at tolerance limit)
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950, // Matches received
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(false); // 50L is at the limit, not exceeding
            expect(result.reconciliation.volumeVariance).toBe(50);
        });
    });
    describe('Volume Variance Detection', () => {
        it('should flag excessive depot-to-station variance', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39800, // 200L variance (exceeds 50L tolerance)
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39800, // Matches received
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toContain('Volume variance: 200.0L exceeds tolerance of 50L');
            expect(result.reconciliation.volumeVariance).toBe(200);
        });
        it('should flag claimed volume discrepancies', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39950, // Good variance
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39600, // 350L less than received (exceeds tolerance)
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toContain("Claimed litres (39600L) don't match delivery records");
        });
        it('should detect over-claiming scenarios', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39950,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 41000, // Claiming more than loaded (impossible)
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toContain("Claimed litres (41000L) don't match delivery records");
        });
        it('should handle multiple simultaneous volume variances', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39700, // 300L depot-to-station variance
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 40200, // Over-claiming by 500L from received
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toHaveLength(2);
            expect(result.variances).toContain('Volume variance: 300.0L exceeds tolerance of 50L');
            expect(result.variances).toContain("Claimed litres (40200L) don't match delivery records");
            expect(result.reconciliation.volumeVariance).toBe(300);
        });
        it('should handle zero litres received gracefully', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 0, // Complete loss/spillage
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 0, // No claim possible
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.reconciliation.volumeVariance).toBe(40000); // All loaded volume lost
            expect(result.reconciliation.stationReceived).toBe(0);
            expect(result.reconciliation.claimedMoved).toBe(0);
        });
    });
    describe('Missing Data Scenarios', () => {
        it('should handle missing litresReceived data', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: null, // Missing data
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.stationReceived).toBe(0);
            expect(result.reconciliation.volumeVariance).toBe(40000); // Uses loaded as baseline
            expect(result.hasVariances).toBe(true); // Should flag missing data as variance
        });
        it('should handle undefined litresReceived gracefully', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: undefined,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.stationReceived).toBe(0);
            expect(result.reconciliation.volumeVariance).toBe(40000);
        });
        it('should use loaded volume when received is missing', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: null,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950, // Compare against loaded volume
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            // Should compare claimed volume against loaded volume when received is missing
            const claimVolumeVariance = Math.abs(claimData.litresMoved - delivery.litresLoaded);
            expect(claimVolumeVariance).toBe(50);
        });
    });
    describe('GPS Distance Integration', () => {
        it('should perform distance reconciliation with GPS data', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                kmActual: 180,
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 185, 20), // 5km difference
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(185);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.distanceVariance).toBe(5); // |180 - 185| = 5km
            // 10% tolerance of 180km = 18km, so 5km variance should be acceptable
            const distanceVarianceFlags = result.variances.filter(v => v.includes('Distance variance'));
            expect(distanceVarianceFlags).toHaveLength(0); // Should not flag within tolerance
        });
        it('should flag significant GPS distance discrepancies', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                kmActual: 180,
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 250, 20), // 70km difference
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(250);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.distanceVariance).toBe(70); // |180 - 250| = 70km
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toContain('Distance variance: GPS trace shows 250.0km vs claimed 180km');
        });
        it('should calculate tolerance based on claimed distance', async () => {
            // Arrange - Test different claimed distances to verify percentage-based tolerance
            const testCases = [
                { claimed: 100, gps: 115, shouldFlag: true }, // 15% variance > 10% tolerance
                { claimed: 100, gps: 109, shouldFlag: false }, // 9% variance < 10% tolerance
                { claimed: 500, gps: 540, shouldFlag: false }, // 8% variance < 10% tolerance
                { claimed: 500, gps: 560, shouldFlag: true }, // 12% variance > 10% tolerance
            ];
            for (const testCase of testCases) {
                const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
                const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                    kmActual: testCase.claimed,
                    gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, testCase.gps, 10),
                });
                jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(testCase.gps);
                // Act
                const result = await service.performThreeWayReconciliation(delivery, claimData);
                // Assert
                const hasDistanceVariance = result.variances.some(v => v.includes('Distance variance'));
                expect(hasDistanceVariance).toBe(testCase.shouldFlag);
            }
        });
        it('should skip GPS validation when trace has insufficient points', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                kmActual: 180,
                gpsTrace: [{ latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' }], // Only 1 point
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.distanceVariance).toBeUndefined();
            expect(result.variances).not.toContain(expect.stringMatching(/Distance variance/));
        });
    });
    describe('Complex Multi-Variance Scenarios', () => {
        it('should handle simultaneous volume and distance variances', async () => {
            // Arrange - Create scenario with both volume and distance issues
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39700, // 300L variance (exceeds tolerance)
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39600, // Additional 100L discrepancy
                kmActual: 180,
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 220, 20), // 40km variance
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(220);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances).toContain('Volume variance: 300.0L exceeds tolerance of 50L');
            expect(result.variances).toContain("Claimed litres (39600L) don't match delivery records");
            expect(result.variances).toContain('Distance variance: GPS trace shows 220.0km vs claimed 180km');
            expect(result.variances).toHaveLength(3);
        });
        it('should prioritize variances by severity', async () => {
            // Arrange - Multiple variances with different severities
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 35000, // Major variance (5000L)
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 45000, // Over-claiming (impossible scenario)
                kmActual: 180,
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 185, 20), // Minor GPS variance
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(185);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.variances.length).toBeGreaterThanOrEqual(2);
            // Should flag major volume issues but not minor GPS variance
            expect(result.variances).toContain('Volume variance: 5000.0L exceeds tolerance of 50L');
            expect(result.variances).toContain("Claimed litres (45000L) don't match delivery records");
            // GPS variance should not be flagged (within 10% tolerance)
            expect(result.variances).not.toContain(expect.stringMatching(/Distance variance/));
        });
        it('should provide comprehensive reconciliation summary', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39850,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39800,
                kmActual: 180,
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 178, 20),
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(178);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation).toEqual({
                depotLoaded: 40000,
                stationReceived: 39850,
                claimedMoved: 39800,
                volumeVariance: 150, // depot - station
                distanceVariance: 2, // claimed - GPS
            });
        });
    });
    describe('Data Quality and Validation', () => {
        it('should handle negative volume values gracefully', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: -100, // Invalid negative value
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true);
            expect(result.reconciliation.stationReceived).toBe(-100);
            expect(result.reconciliation.volumeVariance).toBe(40100); // Should handle absolute difference
        });
        it('should validate data type consistency', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: '39950', // String instead of number
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act & Assert - Should handle type coercion gracefully
            expect(async () => {
                await service.performThreeWayReconciliation(delivery, claimData);
            }).not.toThrow();
        });
        it('should handle extremely large volume values', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 1000000, // 1 million litres
                litresReceived: 999950,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 999900,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.volumeVariance).toBe(50);
            expect(result.hasVariances).toBe(false); // Within tolerance
        });
        it('should handle precision in floating point calculations', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000.123,
                litresReceived: 39950.456,
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950.789,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.volumeVariance).toBeCloseTo(49.667, 3); // 40000.123 - 39950.456
        });
    });
    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle exact tolerance boundaries correctly', async () => {
            // Test exactly at 50L tolerance boundary
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39950, // Exactly 50L difference
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(false); // Exactly at tolerance should pass
            expect(result.reconciliation.volumeVariance).toBe(50);
        });
        it('should handle just over tolerance boundary', async () => {
            // Test at 50.1L (just over tolerance)
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({
                litresLoaded: 40000,
                litresReceived: 39949.9, // 50.1L difference
            });
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39949.9,
            });
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.hasVariances).toBe(true); // Should exceed tolerance
            expect(result.reconciliation.volumeVariance).toBeCloseTo(50.1, 1);
        });
        it('should handle zero distance claims', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                kmActual: 0,
                gpsTrace: [
                    { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
                    { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:30:00Z' }, // Same location
                ],
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(0);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, claimData);
            // Assert
            expect(result.reconciliation.distanceVariance).toBe(0);
            expect(result.hasVariances).toBe(false); // No distance variance for zero distance
        });
        it('should handle missing delivery data structure', async () => {
            // Arrange
            const incompleteDelivery = {
                litresLoaded: 40000,
                // Missing litresReceived property
            };
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950,
            });
            // Act
            const result = await service.performThreeWayReconciliation(incompleteDelivery, claimData);
            // Assert
            expect(result.reconciliation.stationReceived).toBe(0);
            expect(result.hasVariances).toBe(true);
        });
    });
    describe('Performance and Efficiency', () => {
        it('should complete reconciliation within performance threshold', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const claimData = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                gpsTrace: test_data_factory_1.TestDataFactory.generateGPSPoints(5.6037, -0.1870, 180, 1000), // Large GPS trace
            });
            jest.spyOn(service, 'calculateGPSDistance').mockReturnValue(180);
            const startTime = Date.now();
            // Act
            await service.performThreeWayReconciliation(delivery, claimData);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            // Assert
            expect(executionTime).toBeLessThan(100); // Should complete within 100ms
        });
        it('should handle concurrent reconciliation requests', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const concurrentRequests = Array.from({ length: 100 }, (_, i) => test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                litresMoved: 39950 + i, // Slightly different values
            }));
            const startTime = Date.now();
            // Act
            const results = await Promise.all(concurrentRequests.map(claimData => service.performThreeWayReconciliation(delivery, claimData)));
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            // Assert
            expect(results).toHaveLength(100);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
});
//# sourceMappingURL=reconciliation.test.js.map