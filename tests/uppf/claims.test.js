"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const common_1 = require("@nestjs/common");
const geolib = __importStar(require("geolib"));
const claims_service_1 = require("../../services/uppf-service/src/claims/claims.service");
const uppf_claim_entity_1 = require("../../services/uppf-service/src/claims/entities/uppf-claim.entity");
const delivery_consignment_entity_1 = require("../../services/uppf-service/src/claims/entities/delivery-consignment.entity");
const equalisation_point_entity_1 = require("../../services/uppf-service/src/claims/entities/equalisation-point.entity");
const gps_trace_entity_1 = require("../../services/uppf-service/src/claims/entities/gps-trace.entity");
const shared_types_1 = require("@omc-erp/shared-types");
const test_data_factory_1 = require("../test-data-factory");
jest.mock('geolib');
const mockedGeolib = geolib;
describe('UPPF Claims Comprehensive Test Suite', () => {
    let service;
    let uppfClaimRepository;
    let deliveryRepository;
    let equalisationRepository;
    let gpsTraceRepository;
    let dataSource;
    let queryRunner;
    let eventEmitter;
    const tenantId = test_data_factory_1.TestDataFactory.getTenantId();
    const userId = test_data_factory_1.TestDataFactory.getUserId();
    beforeEach(async () => {
        queryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                save: jest.fn(),
            },
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                claims_service_1.ClaimsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(uppf_claim_entity_1.UPPFClaim),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(delivery_consignment_entity_1.DeliveryConsignment),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(equalisation_point_entity_1.EqualisationPoint),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(gps_trace_entity_1.GPSTrace),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: {
                        createQueryRunner: jest.fn(() => queryRunner),
                    },
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(claims_service_1.ClaimsService);
        uppfClaimRepository = module.get((0, typeorm_1.getRepositoryToken)(uppf_claim_entity_1.UPPFClaim));
        deliveryRepository = module.get((0, typeorm_1.getRepositoryToken)(delivery_consignment_entity_1.DeliveryConsignment));
        equalisationRepository = module.get((0, typeorm_1.getRepositoryToken)(equalisation_point_entity_1.EqualisationPoint));
        gpsTraceRepository = module.get((0, typeorm_1.getRepositoryToken)(gps_trace_entity_1.GPSTrace));
        dataSource = module.get(typeorm_2.DataSource);
        eventEmitter = module.get(event_emitter_1.EventEmitter2);
        mockedGeolib.getDistance.mockReturnValue(1000);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Claim Creation - Comprehensive Scenarios', () => {
        it('should create UPPF claim with exact equalisation threshold', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint({ kmThreshold: 180 });
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ kmActual: 185 }); // 5km over
            const expectedClaim = test_data_factory_1.TestDataFactory.createTestClaim({ kmBeyondEqualisation: 5 });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(expectedClaim);
            queryRunner.manager.save.mockResolvedValue(expectedClaim);
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(result.kmBeyondEqualisation).toBe(5);
            expect(result.amountDue).toBe(5 * createClaimDto.litresMoved * equalisationPoint.tariffPerLitreKm);
            expect(result.status).toBe(shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT);
            expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claim.created', expect.any(Object));
        });
        it('should handle fractional kilometres correctly', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint({ kmThreshold: 150.5 });
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ kmActual: 152.3 }); // 1.8km over
            const expectedClaim = test_data_factory_1.TestDataFactory.createTestClaim({ kmBeyondEqualisation: 1.8 });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(expectedClaim);
            queryRunner.manager.save.mockResolvedValue(expectedClaim);
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(result.kmBeyondEqualisation).toBe(1.8);
            expect(result.amountDue).toBeCloseTo(1.8 * createClaimDto.litresMoved * equalisationPoint.tariffPerLitreKm, 2);
        });
        it('should create claim with high-volume delivery', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({ litresLoaded: 80000, litresReceived: 79800 });
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint();
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                kmActual: 200,
                litresMoved: 79800
            });
            const expectedAmount = 50 * 79800 * 0.02; // 50km over * 79800L * 0.02
            const expectedClaim = test_data_factory_1.TestDataFactory.createTestClaim({
                kmBeyondEqualisation: 50,
                litresMoved: 79800,
                amountDue: expectedAmount,
            });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(expectedClaim);
            queryRunner.manager.save.mockResolvedValue(expectedClaim);
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 80000,
                    stationReceived: 79800,
                    claimedMoved: 79800,
                    volumeVariance: 200,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(result.litresMoved).toBe(79800);
            expect(result.amountDue).toBe(expectedAmount);
        });
        it('should reject claim with zero distance', async () => {
            // Arrange
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ kmActual: 0 });
            // Act & Assert
            await expect(service.createClaim(createClaimDto, tenantId, userId))
                .rejects.toThrow(common_1.BadRequestException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        });
        it('should handle multiple routes with different equalisation points', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint({
                routeId: 'route-kumasi-tamale',
                kmThreshold: 250,
                tariffPerLitreKm: 0.025
            });
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({
                routeId: 'route-kumasi-tamale',
                kmActual: 280
            });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(test_data_factory_1.TestDataFactory.createTestClaim());
            queryRunner.manager.save.mockResolvedValue(test_data_factory_1.TestDataFactory.createTestClaim());
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(equalisationRepository.findOne).toHaveBeenCalledWith({
                where: { routeId: 'route-kumasi-tamale', tenantId },
                order: { effectiveFrom: 'DESC' },
            });
            expect(result).toBeDefined();
        });
        it('should calculate claim for minimum viable distance', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint({ kmThreshold: 149.99 });
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ kmActual: 150 }); // 0.01km over
            const expectedClaim = test_data_factory_1.TestDataFactory.createTestClaim({ kmBeyondEqualisation: 0.01 });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(expectedClaim);
            queryRunner.manager.save.mockResolvedValue(expectedClaim);
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(result.kmBeyondEqualisation).toBe(0.01);
            expect(result.amountDue).toBeCloseTo(0.01 * createClaimDto.litresMoved * equalisationPoint.tariffPerLitreKm, 4);
        });
    });
    describe('Batch Claims Processing', () => {
        it('should process large batch of claims successfully', async () => {
            // Arrange
            const windowId = 'PW-2024-W01';
            const batchSize = 500;
            const readyToSubmitClaims = test_data_factory_1.TestDataFactory.createBulkClaims(batchSize, {
                windowId,
                status: shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT,
            });
            const expectedTotal = readyToSubmitClaims.reduce((sum, claim) => sum + claim.amountDue, 0);
            uppfClaimRepository.find.mockResolvedValue(readyToSubmitClaims);
            uppfClaimRepository.update.mockResolvedValue({ affected: batchSize });
            jest.spyOn(service, 'generateNPASubmissionPackage').mockResolvedValue({
                submissionReference: `UPPF-${windowId}-${Date.now()}`,
                totalAmount: expectedTotal,
            });
            // Act
            const startTime = Date.now();
            const result = await service.batchSubmitClaims(windowId, tenantId, userId);
            const endTime = Date.now();
            // Assert
            expect(result.submittedClaims).toHaveLength(batchSize);
            expect(result.totalAmount).toBe(expectedTotal);
            expect(result.submissionReference).toMatch(/^UPPF-PW-2024-W01-\d+$/);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
            expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claims.batch-submitted', expect.any(Object));
        });
        it('should handle mixed status claims in batch', async () => {
            // Arrange
            const windowId = 'PW-2024-W01';
            const readyToSubmitClaims = test_data_factory_1.TestDataFactory.createBulkClaims(10, {
                windowId,
                status: shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT,
            });
            uppfClaimRepository.find.mockResolvedValue(readyToSubmitClaims);
            uppfClaimRepository.update.mockResolvedValue({ affected: 10 });
            jest.spyOn(service, 'generateNPASubmissionPackage').mockResolvedValue({});
            // Act
            const result = await service.batchSubmitClaims(windowId, tenantId, userId);
            // Assert
            expect(uppfClaimRepository.find).toHaveBeenCalledWith({
                where: {
                    windowId,
                    tenantId,
                    status: shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT,
                },
            });
            expect(result.submittedClaims).toHaveLength(10);
        });
        it('should generate NPA-compliant submission package', async () => {
            // Arrange
            const claims = test_data_factory_1.TestDataFactory.createBulkClaims(5);
            const submissionReference = 'UPPF-TEST-REF-123';
            // Act
            const result = await service['generateNPASubmissionPackage'](claims, submissionReference);
            // Assert
            expect(result).toEqual({
                submissionReference,
                submissionDate: expect.any(String),
                totalClaims: 5,
                totalAmount: claims.reduce((sum, claim) => sum + claim.amountDue, 0),
                claims: expect.arrayContaining([
                    expect.objectContaining({
                        claimId: expect.any(String),
                        windowId: expect.any(String),
                        routeId: expect.any(String),
                        kmBeyondEqualisation: expect.any(Number),
                        litresMoved: expect.any(Number),
                        tariffRate: expect.any(Number),
                        amountDue: expect.any(Number),
                        evidenceLinks: expect.any(Array),
                    })
                ]),
            });
        });
    });
    describe('Variance Dashboard and Analytics', () => {
        it('should generate comprehensive variance dashboard', async () => {
            // Arrange
            const paymentVarianceScenario = test_data_factory_1.TestDataFactory.createPaymentVarianceScenario();
            const agingClaimsScenario = test_data_factory_1.TestDataFactory.createAgingClaimsScenario();
            const allClaims = [...paymentVarianceScenario, ...agingClaimsScenario];
            const queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(allClaims),
            };
            uppfClaimRepository.createQueryBuilder.mockReturnValue(queryBuilder);
            // Act
            const result = await service.getVarianceDashboard(tenantId);
            // Assert
            expect(result.summary).toEqual({
                totalSubmitted: expect.any(Number),
                totalPaid: expect.any(Number),
                totalPending: expect.any(Number),
                shortPayAmount: expect.any(Number),
            });
            expect(result.aging).toEqual({
                under30Days: expect.any(Number),
                days30to60: expect.any(Number),
                days60to90: expect.any(Number),
                over90Days: expect.any(Number),
            });
            expect(result.paymentVariances).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    claimId: expect.any(String),
                    expected: expect.any(Number),
                    received: expect.any(Number),
                    variance: expect.any(Number),
                })
            ]));
        });
        it('should calculate aging correctly for different time periods', async () => {
            // Arrange
            const agingClaims = test_data_factory_1.TestDataFactory.createAgingClaimsScenario();
            const queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(agingClaims),
            };
            uppfClaimRepository.createQueryBuilder.mockReturnValue(queryBuilder);
            // Act
            const result = await service.getVarianceDashboard(tenantId);
            // Assert
            expect(result.aging.under30Days).toBe(1); // Recent claim
            expect(result.aging.days30to60).toBe(1); // 30 days ago
            expect(result.aging.days60to90).toBe(1); // 60 days ago  
            expect(result.aging.over90Days).toBe(1); // 90+ days ago
        });
        it('should identify short payments accurately', async () => {
            // Arrange
            const paymentVarianceScenario = test_data_factory_1.TestDataFactory.createPaymentVarianceScenario();
            const queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(paymentVarianceScenario),
            };
            uppfClaimRepository.createQueryBuilder.mockReturnValue(queryBuilder);
            // Act
            const result = await service.getVarianceDashboard(tenantId);
            // Assert
            const shortPayments = result.paymentVariances.filter(v => v.variance > 0);
            expect(shortPayments.length).toBeGreaterThan(0);
            const totalShortPay = shortPayments.reduce((sum, v) => sum + v.variance, 0);
            expect(result.summary.shortPayAmount).toBe(totalShortPay);
        });
    });
    describe('Aging Claims Monitoring', () => {
        it('should emit alerts for aging claims exceeding threshold', async () => {
            // Arrange
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 35); // 35 days ago
            const agingClaims = [test_data_factory_1.TestDataFactory.createTestClaim({
                    status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                    submittedAt: cutoffDate,
                    amountDue: 50000,
                })];
            uppfClaimRepository.find.mockResolvedValue(agingClaims);
            // Act
            await service.checkAgingClaims();
            // Assert
            expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claim.aging-alert', expect.objectContaining({
                claimId: expect.any(String),
                windowId: expect.any(String),
                amountDue: 50000,
                daysAging: expect.any(Number),
                tenantId,
            }));
        });
        it('should not alert for recently submitted claims', async () => {
            // Arrange
            const recentClaims = [test_data_factory_1.TestDataFactory.createTestClaim({
                    status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                    submittedAt: new Date(), // Today
                })];
            uppfClaimRepository.find.mockResolvedValue(recentClaims);
            // Act
            await service.checkAgingClaims();
            // Assert
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
        it('should handle multiple aging claims efficiently', async () => {
            // Arrange
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 45);
            const agingClaims = Array.from({ length: 100 }, (_, i) => test_data_factory_1.TestDataFactory.createTestClaim({
                id: `aging-claim-${i}`,
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: new Date(cutoffDate.getTime() - (i * 24 * 60 * 60 * 1000)), // Different dates
            }));
            uppfClaimRepository.find.mockResolvedValue(agingClaims);
            const startTime = Date.now();
            // Act
            await service.checkAgingClaims();
            const endTime = Date.now();
            // Assert
            expect(eventEmitter.emit).toHaveBeenCalledTimes(100);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
    describe('Edge Cases and Error Handling', () => {
        it('should handle claims with zero litres moved', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery({ litresReceived: 0 });
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint();
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ litresMoved: 0 });
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            // Act
            const result = await service.performThreeWayReconciliation(delivery, createClaimDto);
            // Assert
            expect(result.reconciliation.claimedMoved).toBe(0);
            expect(result.hasVariances).toBe(true); // Should flag zero litres as variance
        });
        it('should handle expired equalisation points gracefully', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const expiredEqualisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint({
                effectiveTo: new Date('2023-12-31'), // Expired
            });
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto();
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(expiredEqualisationPoint);
            // Note: The service should still use the expired point but might flag it
            uppfClaimRepository.create.mockReturnValue(test_data_factory_1.TestDataFactory.createTestClaim());
            queryRunner.manager.save.mockResolvedValue(test_data_factory_1.TestDataFactory.createTestClaim());
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: true,
                variances: ['Using expired equalisation point'],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            // Act
            const result = await service.createClaim(createClaimDto, tenantId, userId);
            // Assert
            expect(result).toBeDefined();
        });
        it('should handle database connection failures', async () => {
            // Arrange
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto();
            queryRunner.connect.mockRejectedValue(new Error('Database connection failed'));
            // Act & Assert
            await expect(service.createClaim(createClaimDto, tenantId, userId))
                .rejects.toThrow('Database connection failed');
        });
        it('should handle concurrent claim submissions for same delivery', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint();
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto();
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(test_data_factory_1.TestDataFactory.createTestClaim());
            queryRunner.manager.save.mockResolvedValue(test_data_factory_1.TestDataFactory.createTestClaim());
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            const concurrentClaims = Array(5).fill(createClaimDto).map(dto => service.createClaim(dto, tenantId, userId));
            // Act
            const results = await Promise.all(concurrentClaims);
            // Assert
            expect(results).toHaveLength(5);
            results.forEach(result => expect(result).toBeDefined());
        });
        it('should validate tenant isolation', async () => {
            // Arrange
            const differentTenantId = 'different-tenant-456';
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto();
            deliveryRepository.findOne.mockResolvedValue(null); // No delivery found for different tenant
            // Act & Assert
            await expect(service.createClaim(createClaimDto, differentTenantId, userId))
                .rejects.toThrow(common_1.NotFoundException);
            expect(deliveryRepository.findOne).toHaveBeenCalledWith({
                where: { id: createClaimDto.deliveryId, tenantId: differentTenantId },
            });
        });
    });
    describe('Performance Benchmarks', () => {
        it('should meet SLA for single claim creation', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint();
            const createClaimDto = test_data_factory_1.TestDataFactory.createTestCreateClaimDto();
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(test_data_factory_1.TestDataFactory.createTestClaim());
            queryRunner.manager.save.mockResolvedValue(test_data_factory_1.TestDataFactory.createTestClaim());
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            const startTime = Date.now();
            // Act
            await service.createClaim(createClaimDto, tenantId, userId);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            // Assert
            expect(executionTime).toBeLessThan(500); // Should complete within 500ms
        });
        it('should handle 1000 concurrent claims within performance threshold', async () => {
            // Arrange
            const delivery = test_data_factory_1.TestDataFactory.createTestDelivery();
            const equalisationPoint = test_data_factory_1.TestDataFactory.createTestEqualisationPoint();
            deliveryRepository.findOne.mockResolvedValue(delivery);
            equalisationRepository.findOne.mockResolvedValue(equalisationPoint);
            uppfClaimRepository.create.mockReturnValue(test_data_factory_1.TestDataFactory.createTestClaim());
            queryRunner.manager.save.mockResolvedValue(test_data_factory_1.TestDataFactory.createTestClaim());
            jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
                hasVariances: false,
                variances: [],
                reconciliation: {
                    depotLoaded: 40000,
                    stationReceived: 39950,
                    claimedMoved: 39950,
                    volumeVariance: 50,
                },
            });
            const concurrentClaims = Array.from({ length: 1000 }, (_, i) => service.createClaim(test_data_factory_1.TestDataFactory.createTestCreateClaimDto({ deliveryId: `delivery-${i}` }), tenantId, userId));
            const startTime = Date.now();
            // Act
            const results = await Promise.all(concurrentClaims);
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            // Assert
            expect(results).toHaveLength(1000);
            expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
        });
    });
});
//# sourceMappingURL=claims.test.js.map