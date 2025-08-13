import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  Logger,
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import * as geolib from 'geolib';
import { ClaimsService } from './claims.service';
import { UPPFClaim } from './entities/uppf-claim.entity';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
import { EqualisationPoint } from './entities/equalisation-point.entity';
import { GPSTrace } from './entities/gps-trace.entity';
import { CreateUPPFClaimDto } from './dto/create-uppf-claim.dto';
import { UPPFClaimStatus } from '@omc-erp/shared-types';

// Mock geolib
jest.mock('geolib');
const mockedGeolib = geolib as jest.Mocked<typeof geolib>;

describe('ClaimsService', () => {
  let service: ClaimsService;
  let uppfClaimRepository: jest.Mocked<Repository<UPPFClaim>>;
  let deliveryRepository: jest.Mocked<Repository<DeliveryConsignment>>;
  let equalisationRepository: jest.Mocked<Repository<EqualisationPoint>>;
  let gpsTraceRepository: jest.Mocked<Repository<GPSTrace>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';
  const mockWindowId = 'PW-2024-W01';
  const mockRouteId = 'route-123';
  const mockDeliveryId = 'delivery-123';

  const mockDeliveryConsignment: DeliveryConsignment = {
    id: mockDeliveryId,
    consignmentNumber: 'DEL-2024-001',
    tenantId: mockTenantId,
    routeId: mockRouteId,
    litresLoaded: 40000,
    litresReceived: 39950,
    loadingDate: new Date('2024-01-15T08:00:00Z'),
    deliveryDate: new Date('2024-01-15T16:00:00Z'),
    driverName: 'John Doe',
    vehicleNumber: 'GH-1234-20',
    depotName: 'Tema Depot',
    stationName: 'Shell Accra Central',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as DeliveryConsignment;

  const mockEqualisationPoint: EqualisationPoint = {
    id: 'eq-point-123',
    routeId: mockRouteId,
    kmThreshold: 150, // 150km threshold
    tariffPerLitreKm: 0.02, // GHS 0.02 per litre per km
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    tenantId: mockTenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as EqualisationPoint;

  const mockGPSTrace: GPSTrace = {
    id: 'gps-trace-123',
    deliveryId: mockDeliveryId,
    tenantId: mockTenantId,
    startTime: new Date('2024-01-15T08:00:00Z'),
    endTime: new Date('2024-01-15T16:00:00Z'),
    totalKm: 180,
    routePoints: [
      { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
      { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T12:00:00Z' },
      { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T16:00:00Z' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as GPSTrace;

  const mockUPPFClaim: UPPFClaim = {
    id: 'claim-123',
    claimId: 'UPPF-PW-2024-W01-001',
    windowId: mockWindowId,
    deliveryId: mockDeliveryId,
    routeId: mockRouteId,
    kmBeyondEqualisation: 30, // 180km - 150km threshold
    litresMoved: 39950,
    tariffPerLitreKm: 0.02,
    amountDue: 23970, // 30km * 39950L * 0.02
    status: UPPFClaimStatus.DRAFT,
    evidenceLinks: ['gps-trace-123'],
    notes: null,
    tenantId: mockTenantId,
    createdBy: mockUserId,
    submittedAt: null,
    submittedBy: null,
    submissionReference: null,
    amountPaid: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UPPFClaim;

  const mockCreateClaimDto: CreateUPPFClaimDto = {
    windowId: mockWindowId,
    deliveryId: mockDeliveryId,
    routeId: mockRouteId,
    kmActual: 180,
    litresMoved: 39950,
    gpsTrace: [
      { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
      { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T12:00:00Z' },
      { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T16:00:00Z' },
    ],
    evidenceLinks: ['document-123'],
  };

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
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        {
          provide: getRepositoryToken(UPPFClaim),
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
          provide: getRepositoryToken(DeliveryConsignment),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EqualisationPoint),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GPSTrace),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => queryRunner),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
    uppfClaimRepository = module.get(getRepositoryToken(UPPFClaim));
    deliveryRepository = module.get(getRepositoryToken(DeliveryConsignment));
    equalisationRepository = module.get(getRepositoryToken(EqualisationPoint));
    gpsTraceRepository = module.get(getRepositoryToken(GPSTrace));
    dataSource = module.get(DataSource);
    eventEmitter = module.get(EventEmitter2);

    // Setup geolib mock
    mockedGeolib.getDistance.mockReturnValue(1000); // 1km between points
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClaim', () => {
    beforeEach(() => {
      deliveryRepository.findOne.mockResolvedValue(mockDeliveryConsignment);
      equalisationRepository.findOne.mockResolvedValue(mockEqualisationPoint);
      uppfClaimRepository.create.mockReturnValue(mockUPPFClaim);
      queryRunner.manager.save.mockResolvedValue(mockUPPFClaim);
      gpsTraceRepository.create.mockReturnValue(mockGPSTrace);
      gpsTraceRepository.save.mockResolvedValue(mockGPSTrace);
    });

    it('should create UPPF claim successfully', async () => {
      // Arrange
      const reconciliationSpy = jest.spyOn(service, 'performThreeWayReconciliation')
        .mockResolvedValue({
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
      const result = await service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result.claimId).toMatch(/^UPPF-PW-2024-W01-\d{6}-\d{3}$/);
      expect(result.kmBeyondEqualisation).toBe(30); // 180 - 150
      expect(result.amountDue).toBe(23970); // 30 * 39950 * 0.02
      expect(result.status).toBe(UPPFClaimStatus.READY_TO_SUBMIT);

      expect(deliveryRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDeliveryId, tenantId: mockTenantId },
      });
      expect(equalisationRepository.findOne).toHaveBeenCalledWith({
        where: { routeId: mockRouteId, tenantId: mockTenantId },
        order: { effectiveFrom: 'DESC' },
      });
      expect(reconciliationSpy).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claim.created', expect.any(Object));
    });

    it('should throw NotFoundException if delivery not found', async () => {
      // Arrange
      deliveryRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if equalisation point not found', async () => {
      // Arrange
      equalisationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no km excess', async () => {
      // Arrange
      const claimDtoNoExcess = { ...mockCreateClaimDto, kmActual: 100 }; // Below threshold
      
      // Act & Assert
      await expect(service.createClaim(claimDtoNoExcess, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should create GPS trace when GPS data provided', async () => {
      // Arrange
      const createGPSTraceSpy = jest.spyOn(service as any, 'createGPSTrace')
        .mockResolvedValue(mockGPSTrace);
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
      await service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId);

      // Assert
      expect(createGPSTraceSpy).toHaveBeenCalledWith(
        mockDeliveryId,
        mockCreateClaimDto.gpsTrace,
        mockTenantId
      );
    });

    it('should flag variances and set status to UNDER_REVIEW', async () => {
      // Arrange
      jest.spyOn(service, 'performThreeWayReconciliation').mockResolvedValue({
        hasVariances: true,
        variances: ['Volume variance exceeds tolerance'],
        reconciliation: {
          depotLoaded: 40000,
          stationReceived: 39800, // Large variance
          claimedMoved: 39950,
          volumeVariance: 200,
        },
      });

      const claimWithVariances = { ...mockUPPFClaim, status: UPPFClaimStatus.UNDER_REVIEW };
      queryRunner.manager.save.mockResolvedValue(claimWithVariances);

      // Act
      const result = await service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId);

      // Assert
      expect(result.status).toBe(UPPFClaimStatus.UNDER_REVIEW);
      expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claim.variance-flagged', expect.any(Object));
    });

    it('should calculate claim amount correctly', async () => {
      // Arrange
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
      const result = await service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId);

      // Assert
      // Expected: 30km excess * 39950L * 0.02 tariff = 23970
      expect(result.kmBeyondEqualisation).toBe(30);
      expect(result.litresMoved).toBe(39950);
      expect(result.tariffPerLitreKm).toBe(0.02);
      expect(result.amountDue).toBe(23970);
    });
  });

  describe('performThreeWayReconciliation', () => {
    it('should perform reconciliation without variances', async () => {
      // Arrange
      const claimData = { ...mockCreateClaimDto, litresMoved: 39950 };

      // Act
      const result = await service.performThreeWayReconciliation(mockDeliveryConsignment, claimData);

      // Assert
      expect(result.hasVariances).toBe(false);
      expect(result.variances).toHaveLength(0);
      expect(result.reconciliation.depotLoaded).toBe(40000);
      expect(result.reconciliation.stationReceived).toBe(39950);
      expect(result.reconciliation.claimedMoved).toBe(39950);
      expect(result.reconciliation.volumeVariance).toBe(50); // 40000 - 39950
    });

    it('should flag volume variances exceeding tolerance', async () => {
      // Arrange
      const deliveryWithLargeVariance = {
        ...mockDeliveryConsignment,
        litresReceived: 39800, // 200L variance
      };
      const claimData = { ...mockCreateClaimDto, litresMoved: 39950 };

      // Act
      const result = await service.performThreeWayReconciliation(deliveryWithLargeVariance, claimData);

      // Assert
      expect(result.hasVariances).toBe(true);
      expect(result.variances).toContain('Volume variance: 200.0L exceeds tolerance of 50L');
    });

    it('should flag claimed volume discrepancies', async () => {
      // Arrange
      const claimData = { ...mockCreateClaimDto, litresMoved: 39700 }; // 250L less than received

      // Act
      const result = await service.performThreeWayReconciliation(mockDeliveryConsignment, claimData);

      // Assert
      expect(result.hasVariances).toBe(true);
      expect(result.variances).toContain('Claimed litres (39700L) don\'t match delivery records');
    });

    it('should validate GPS distance when trace provided', async () => {
      // Arrange
      const claimDataWithGPS = {
        ...mockCreateClaimDto,
        kmActual: 200, // Claimed 200km
        gpsTrace: [
          { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
          { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T12:00:00Z' },
          { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T16:00:00Z' },
        ],
      };

      // Mock GPS distance calculation to return 180km (10% variance)
      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(180);

      // Act
      const result = await service.performThreeWayReconciliation(mockDeliveryConsignment, claimDataWithGPS);

      // Assert
      expect(result.reconciliation.distanceVariance).toBe(20); // 200 - 180
      expect(result.hasVariances).toBe(true); // 20km > 10% tolerance (20km)
      expect(result.variances).toContain('Distance variance: GPS trace shows 180.0km vs claimed 200km');
    });
  });

  describe('detectRouteAnomalies', () => {
    it('should detect insufficient GPS points', async () => {
      // Arrange
      const insufficientTrace = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
      ];

      // Act
      const result = await service.detectRouteAnomalies(insufficientTrace, mockRouteId, mockTenantId);

      // Assert
      expect(result.hasAnomalies).toBe(true);
      expect(result.anomalies).toContain('Insufficient GPS points for route validation');
      expect(result.confidence).toBe(0.9);
    });

    it('should detect excessive stationary time', async () => {
      // Arrange
      const traceWithLongStops = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T12:00:00Z' }, // 4 hours at same location
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T15:00:00Z' }, // 3 more hours
      ];

      mockedGeolib.getDistance.mockReturnValue(50); // Very close points

      // Act
      const result = await service.detectRouteAnomalies(traceWithLongStops, mockRouteId, mockTenantId);

      // Assert
      expect(result.hasAnomalies).toBe(true);
      expect(result.anomalies).toContain('Excessive stationary time detected - possible unauthorized stops');
    });

    it('should return no anomalies for normal route', async () => {
      // Arrange
      const normalTrace = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T10:00:00Z' },
        { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T12:00:00Z' },
      ];

      mockedGeolib.getDistance.mockReturnValue(5000); // Normal distance between points

      // Act
      const result = await service.detectRouteAnomalies(normalTrace, mockRouteId, mockTenantId);

      // Assert
      expect(result.hasAnomalies).toBe(false);
      expect(result.anomalies).toHaveLength(0);
    });
  });

  describe('batchSubmitClaims', () => {
    const readyToSubmitClaims = [
      { ...mockUPPFClaim, id: 'claim-1', claimId: 'UPPF-001', amountDue: 1000 },
      { ...mockUPPFClaim, id: 'claim-2', claimId: 'UPPF-002', amountDue: 1500 },
      { ...mockUPPFClaim, id: 'claim-3', claimId: 'UPPF-003', amountDue: 2000 },
    ];

    it('should batch submit claims successfully', async () => {
      // Arrange
      uppfClaimRepository.find.mockResolvedValue(readyToSubmitClaims);
      uppfClaimRepository.update.mockResolvedValue({ affected: 3 } as any);
      jest.spyOn(service as any, 'generateNPASubmissionPackage').mockResolvedValue({
        submissionReference: 'UPPF-PW-2024-W01-123456789',
        totalAmount: 4500,
      });

      // Act
      const result = await service.batchSubmitClaims(mockWindowId, mockTenantId, mockUserId);

      // Assert
      expect(result.submittedClaims).toHaveLength(3);
      expect(result.totalAmount).toBe(4500);
      expect(result.submissionReference).toMatch(/^UPPF-PW-2024-W01-\d+$/);

      expect(uppfClaimRepository.update).toHaveBeenCalledWith(
        { windowId: mockWindowId, tenantId: mockTenantId, status: UPPFClaimStatus.READY_TO_SUBMIT },
        expect.objectContaining({
          status: UPPFClaimStatus.SUBMITTED,
          submittedAt: expect.any(Date),
          submittedBy: mockUserId,
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claims.batch-submitted', expect.any(Object));
    });

    it('should throw BadRequestException if no claims ready to submit', async () => {
      // Arrange
      uppfClaimRepository.find.mockResolvedValue([]);

      // Act & Assert
      await expect(service.batchSubmitClaims(mockWindowId, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getVarianceDashboard', () => {
    it('should generate variance dashboard data', async () => {
      // Arrange
      const claimsData = [
        { ...mockUPPFClaim, status: UPPFClaimStatus.PAID, amountDue: 1000, amountPaid: 1000, submittedAt: new Date('2024-01-01') },
        { ...mockUPPFClaim, id: 'claim-2', status: UPPFClaimStatus.PAID, amountDue: 1500, amountPaid: 1200, submittedAt: new Date('2024-01-15') }, // Short pay
        { ...mockUPPFClaim, id: 'claim-3', status: UPPFClaimStatus.SUBMITTED, amountDue: 2000, submittedAt: new Date('2024-01-20') }, // Pending
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(claimsData),
      };

      uppfClaimRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getVarianceDashboard(mockTenantId);

      // Assert
      expect(result.summary.totalSubmitted).toBe(4500); // 1000 + 1500 + 2000
      expect(result.summary.totalPaid).toBe(2200); // 1000 + 1200
      expect(result.summary.totalPending).toBe(2000);
      expect(result.summary.shortPayAmount).toBe(300); // 1500 - 1200
      
      expect(result.paymentVariances).toHaveLength(1);
      expect(result.paymentVariances[0]).toEqual({
        claimId: expect.any(String),
        expected: 1500,
        received: 1200,
        variance: 300,
      });

      expect(result.aging.under30Days).toBe(1); // One pending claim from 2024-01-20
    });

    it('should categorize claims by aging correctly', async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 95); // 95 days ago

      const agingClaims = [
        { ...mockUPPFClaim, status: UPPFClaimStatus.SUBMITTED, amountDue: 1000, submittedAt: oldDate },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(agingClaims),
      };

      uppfClaimRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getVarianceDashboard(mockTenantId);

      // Assert
      expect(result.aging.over90Days).toBe(1);
    });
  });

  describe('checkAgingClaims (Cron Job)', () => {
    it('should emit alerts for aging claims', async () => {
      // Arrange
      const agingDate = new Date();
      agingDate.setDate(agingDate.getDate() - 35); // 35 days ago

      const agingClaims = [
        { ...mockUPPFClaim, status: UPPFClaimStatus.SUBMITTED, submittedAt: agingDate },
      ];

      uppfClaimRepository.find.mockResolvedValue(agingClaims);

      // Act
      await service.checkAgingClaims();

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith('uppf-claim.aging-alert', 
        expect.objectContaining({
          claimId: mockUPPFClaim.claimId,
          windowId: mockWindowId,
          amountDue: mockUPPFClaim.amountDue,
          daysAging: expect.any(Number),
          tenantId: mockTenantId,
        })
      );
    });

    it('should not emit alerts for recent claims', async () => {
      // Arrange
      const recentClaims = [
        { ...mockUPPFClaim, status: UPPFClaimStatus.SUBMITTED, submittedAt: new Date() }, // Today
      ];

      uppfClaimRepository.find.mockResolvedValue(recentClaims);

      // Act
      await service.checkAgingClaims();

      // Assert
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should generate unique claim IDs', () => {
      // Act
      const claimId1 = service['generateClaimId'](mockWindowId);
      const claimId2 = service['generateClaimId'](mockWindowId);

      // Assert
      expect(claimId1).toMatch(/^UPPF-PW-2024-W01-\d{6}-\d{3}$/);
      expect(claimId2).toMatch(/^UPPF-PW-2024-W01-\d{6}-\d{3}$/);
      expect(claimId1).not.toBe(claimId2);
    });

    it('should calculate GPS distance correctly', () => {
      // Arrange
      const gpsTrace = [
        { latitude: 5.6037, longitude: -0.1870 },
        { latitude: 5.6500, longitude: -0.2000 },
        { latitude: 5.7000, longitude: -0.2500 },
      ];

      mockedGeolib.getDistance
        .mockReturnValueOnce(5000) // 5km
        .mockReturnValueOnce(7000); // 7km

      // Act
      const result = service['calculateGPSDistance'](gpsTrace);

      // Assert
      expect(result).toBe(12); // (5000 + 7000) / 1000 = 12km
      expect(mockedGeolib.getDistance).toHaveBeenCalledTimes(2);
    });

    it('should create GPS trace successfully', async () => {
      // Arrange
      const gpsPoints = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T16:00:00Z' },
      ];

      gpsTraceRepository.create.mockReturnValue(mockGPSTrace);
      gpsTraceRepository.save.mockResolvedValue(mockGPSTrace);
      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(180);

      // Act
      const result = await service['createGPSTrace'](mockDeliveryId, gpsPoints, mockTenantId);

      // Assert
      expect(result).toBe(mockGPSTrace);
      expect(gpsTraceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryId: mockDeliveryId,
          tenantId: mockTenantId,
          totalKm: 180,
          routePoints: gpsPoints,
        })
      );
    });

    it('should generate NPA submission package', async () => {
      // Arrange
      const claims = [mockUPPFClaim];
      const submissionReference = 'UPPF-PW-2024-W01-123456789';

      // Act
      const result = await service['generateNPASubmissionPackage'](claims, submissionReference);

      // Assert
      expect(result).toEqual({
        submissionReference,
        submissionDate: expect.any(String),
        totalClaims: 1,
        totalAmount: mockUPPFClaim.amountDue,
        claims: [
          {
            claimId: mockUPPFClaim.claimId,
            windowId: mockUPPFClaim.windowId,
            routeId: mockUPPFClaim.routeId,
            kmBeyondEqualisation: mockUPPFClaim.kmBeyondEqualisation,
            litresMoved: mockUPPFClaim.litresMoved,
            tariffRate: mockUPPFClaim.tariffPerLitreKm,
            amountDue: mockUPPFClaim.amountDue,
            evidenceLinks: mockUPPFClaim.evidenceLinks,
          },
        ],
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database transaction rollback on error', async () => {
      // Arrange
      deliveryRepository.findOne.mockResolvedValue(mockDeliveryConsignment);
      equalisationRepository.findOne.mockResolvedValue(mockEqualisationPoint);
      queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createClaim(mockCreateClaimDto, mockTenantId, mockUserId))
        .rejects.toThrow('Database error');
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle missing GPS trace gracefully', async () => {
      // Arrange
      const claimDtoWithoutGPS = { ...mockCreateClaimDto, gpsTrace: undefined };
      deliveryRepository.findOne.mockResolvedValue(mockDeliveryConsignment);
      equalisationRepository.findOne.mockResolvedValue(mockEqualisationPoint);
      uppfClaimRepository.create.mockReturnValue(mockUPPFClaim);
      queryRunner.manager.save.mockResolvedValue(mockUPPFClaim);
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
      const result = await service.createClaim(claimDtoWithoutGPS, mockTenantId, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(gpsTraceRepository.create).not.toHaveBeenCalled();
    });

    it('should handle zero km beyond equalisation', async () => {
      // Arrange
      const exactEqualisationDto = { ...mockCreateClaimDto, kmActual: 150 }; // Exactly at threshold

      // Act & Assert
      await expect(service.createClaim(exactEqualisationDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle missing delivery data gracefully', async () => {
      // Arrange
      const deliveryWithoutReceived = { ...mockDeliveryConsignment, litresReceived: null };
      deliveryRepository.findOne.mockResolvedValue(deliveryWithoutReceived);
      equalisationRepository.findOne.mockResolvedValue(mockEqualisationPoint);

      // Act
      const result = await service.performThreeWayReconciliation(deliveryWithoutReceived, mockCreateClaimDto);

      // Assert
      expect(result.reconciliation.stationReceived).toBe(0);
      expect(result.reconciliation.volumeVariance).toBe(40000); // All loaded volume as variance
    });
  });

  describe('Performance and Scale Tests', () => {
    it('should handle large GPS traces efficiently', async () => {
      // Arrange
      const largeGPSTrace = Array.from({ length: 1000 }, (_, i) => ({
        latitude: 5.6037 + (i * 0.001),
        longitude: -0.1870 + (i * 0.001),
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
      }));

      mockedGeolib.getDistance.mockReturnValue(100); // 100m between points

      const startTime = Date.now();

      // Act
      const result = service['calculateGPSDistance'](largeGPSTrace);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result).toBe(99.9); // (999 * 100m) / 1000 = 99.9km
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle concurrent claim creation', async () => {
      // Arrange
      deliveryRepository.findOne.mockResolvedValue(mockDeliveryConsignment);
      equalisationRepository.findOne.mockResolvedValue(mockEqualisationPoint);
      uppfClaimRepository.create.mockReturnValue(mockUPPFClaim);
      queryRunner.manager.save.mockResolvedValue(mockUPPFClaim);
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

      const concurrentClaims = Array(5).fill(null).map((_, i) => 
        service.createClaim({
          ...mockCreateClaimDto,
          deliveryId: `delivery-${i}`,
        }, mockTenantId, mockUserId)
      );

      // Act
      const results = await Promise.all(concurrentClaims);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => expect(result).toBeDefined());
    });

    it('should efficiently process batch submissions', async () => {
      // Arrange
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        ...mockUPPFClaim,
        id: `claim-${i}`,
        claimId: `UPPF-${i.toString().padStart(3, '0')}`,
        amountDue: 1000 + i,
      }));

      uppfClaimRepository.find.mockResolvedValue(largeBatch);
      uppfClaimRepository.update.mockResolvedValue({ affected: 100 } as any);

      const startTime = Date.now();

      // Act
      const result = await service.batchSubmitClaims(mockWindowId, mockTenantId, mockUserId);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result.submittedClaims).toHaveLength(100);
      expect(result.totalAmount).toBe(104950); // Sum of 1000 + i for i=0 to 99
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});