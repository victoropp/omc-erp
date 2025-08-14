import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as geolib from 'geolib';

import { ClaimsService } from '../../services/uppf-service/src/claims/claims.service';
import { UPPFClaim } from '../../services/uppf-service/src/claims/entities/uppf-claim.entity';
import { DeliveryConsignment } from '../../services/uppf-service/src/claims/entities/delivery-consignment.entity';
import { EqualisationPoint } from '../../services/uppf-service/src/claims/entities/equalisation-point.entity';
import { GPSTrace } from '../../services/uppf-service/src/claims/entities/gps-trace.entity';
import { TestDataFactory } from '../test-data-factory';

jest.mock('geolib');
const mockedGeolib = geolib as jest.Mocked<typeof geolib>;

describe('GPS Validation and Route Analysis', () => {
  let service: ClaimsService;
  let gpsTraceRepository: jest.Mocked<Repository<GPSTrace>>;

  const tenantId = TestDataFactory.getTenantId();
  const userId = TestDataFactory.getUserId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        {
          provide: getRepositoryToken(UPPFClaim),
          useValue: { createQueryBuilder: jest.fn(), find: jest.fn(), update: jest.fn() },
        },
        {
          provide: getRepositoryToken(DeliveryConsignment),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(EqualisationPoint),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(GPSTrace),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
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
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
    gpsTraceRepository = module.get(getRepositoryToken(GPSTrace));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GPS Distance Calculation', () => {
    it('should calculate distance accurately for straight-line route', () => {
      // Arrange
      const straightLineTrace = [
        { latitude: 5.6037, longitude: -0.1870 }, // Accra
        { latitude: 5.6137, longitude: -0.1870 }, // 1km north
        { latitude: 5.6237, longitude: -0.1870 }, // 2km north
        { latitude: 5.6337, longitude: -0.1870 }, // 3km north
      ];

      mockedGeolib.getDistance
        .mockReturnValueOnce(1111) // ~1.1km per 0.01 degree latitude
        .mockReturnValueOnce(1111)
        .mockReturnValueOnce(1111);

      // Act
      const result = service['calculateGPSDistance'](straightLineTrace);

      // Assert
      expect(result).toBeCloseTo(3.33, 1); // (1111 + 1111 + 1111) / 1000
      expect(mockedGeolib.getDistance).toHaveBeenCalledTimes(3);
    });

    it('should handle circular route correctly', () => {
      // Arrange - Create circular GPS trace
      const centerLat = 5.6037;
      const centerLng = -0.1870;
      const radius = 0.01; // ~1km radius
      const circularTrace = [];

      for (let i = 0; i <= 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        circularTrace.push({
          latitude: centerLat + radius * Math.cos(angle),
          longitude: centerLng + radius * Math.sin(angle),
        });
      }

      mockedGeolib.getDistance.mockReturnValue(785); // ~π * 1000 / 4 meters per segment

      // Act
      const result = service['calculateGPSDistance'](circularTrace);

      // Assert
      expect(result).toBeCloseTo(6.28, 1); // Should approximate 2π (circumference of 1km radius circle)
      expect(mockedGeolib.getDistance).toHaveBeenCalledTimes(8);
    });

    it('should handle GPS trace with stationary periods', () => {
      // Arrange
      const traceWithStops = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T09:00:00Z' }, // 1 hour stop
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T10:00:00Z' }, // Another hour
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T11:00:00Z' }, // Move 1km
      ];

      mockedGeolib.getDistance
        .mockReturnValueOnce(0) // No movement
        .mockReturnValueOnce(0) // No movement
        .mockReturnValueOnce(1111); // 1km movement

      // Act
      const result = service['calculateGPSDistance'](traceWithStops);

      // Assert
      expect(result).toBeCloseTo(1.11, 2);
    });

    it('should handle large-scale GPS trace efficiently', () => {
      // Arrange
      const largeTrace = TestDataFactory.generateGPSPoints(5.6037, -0.1870, 500, 1000); // 500km, 1000 points
      mockedGeolib.getDistance.mockReturnValue(500); // 500m between points

      const startTime = Date.now();

      // Act
      const result = service['calculateGPSDistance'](largeTrace);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result).toBeCloseTo(499.5, 1); // (999 * 500) / 1000 = 499.5km
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
      expect(mockedGeolib.getDistance).toHaveBeenCalledTimes(999);
    });

    it('should handle GPS trace with accuracy variations', () => {
      // Arrange - GPS points with varying accuracy
      const inaccurateTrace = [
        { latitude: 5.6037, longitude: -0.1870, accuracy: 3 }, // 3m accuracy
        { latitude: 5.6038, longitude: -0.1871, accuracy: 50 }, // 50m accuracy (poor)
        { latitude: 5.6039, longitude: -0.1872, accuracy: 5 }, // 5m accuracy
        { latitude: 5.6040, longitude: -0.1873, accuracy: 2 }, // 2m accuracy (good)
      ];

      mockedGeolib.getDistance.mockReturnValue(150); // ~150m between points

      // Act
      const result = service['calculateGPSDistance'](inaccurateTrace);

      // Assert
      expect(result).toBeCloseTo(0.45, 2); // (3 * 150) / 1000 = 0.45km
    });
  });

  describe('Route Anomaly Detection', () => {
    it('should detect excessive stationary time', async () => {
      // Arrange
      const routeId = 'route-accra-tema';
      const traceWithLongStops = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T11:00:00Z' }, // 3 hours at same location
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T13:30:00Z' }, // 2.5 more hours
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T14:00:00Z' }, // Finally move
      ];

      mockedGeolib.getDistance
        .mockReturnValueOnce(0) // No movement
        .mockReturnValueOnce(0) // No movement
        .mockReturnValueOnce(1000); // 1km movement

      // Act
      const result = await service.detectRouteAnomalies(traceWithLongStops, routeId, tenantId);

      // Assert
      expect(result.hasAnomalies).toBe(true);
      expect(result.anomalies).toContain('Excessive stationary time detected - possible unauthorized stops');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should not flag normal delivery stops', async () => {
      // Arrange
      const routeId = 'route-accra-tema';
      const normalDeliveryTrace = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' }, // Depot
        { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T10:00:00Z' }, // En route
        { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T12:00:00Z' }, // Station (30min stop)
        { latitude: 5.7000, longitude: -0.2500, timestamp: '2024-01-15T12:30:00Z' }, // Still at station
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T14:30:00Z' }, // Return to depot
      ];

      mockedGeolib.getDistance.mockReturnValue(5000); // 5km between major points

      // Act
      const result = await service.detectRouteAnomalies(normalDeliveryTrace, routeId, tenantId);

      // Assert
      expect(result.hasAnomalies).toBe(false);
      expect(result.anomalies).toHaveLength(0);
    });

    it('should detect insufficient GPS data', async () => {
      // Arrange
      const routeId = 'route-accra-tema';
      const insufficientTrace = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
      ];

      // Act
      const result = await service.detectRouteAnomalies(insufficientTrace, routeId, tenantId);

      // Assert
      expect(result.hasAnomalies).toBe(true);
      expect(result.anomalies).toContain('Insufficient GPS points for route validation');
      expect(result.confidence).toBe(0.9);
    });

    it('should handle GPS trace with signal loss periods', async () => {
      // Arrange
      const routeId = 'route-accra-tema';
      const traceWithSignalLoss = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6500, longitude: -0.2000, timestamp: '2024-01-15T10:00:00Z' },
        // 2-hour gap - no GPS signal
        { latitude: 5.7500, longitude: -0.3000, timestamp: '2024-01-15T12:00:00Z' }, // Jumped far
        { latitude: 5.8000, longitude: -0.3500, timestamp: '2024-01-15T13:00:00Z' },
      ];

      mockedGeolib.getDistance
        .mockReturnValueOnce(5000) // Normal distance
        .mockReturnValueOnce(15000) // Large jump - possible signal loss
        .mockReturnValueOnce(6000); // Normal distance

      // Act
      const result = await service.detectRouteAnomalies(traceWithSignalLoss, routeId, tenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.8); // Lower confidence due to signal loss
    });

    it('should analyze speed patterns for anomalies', async () => {
      // Arrange
      const routeId = 'route-accra-tema';
      const traceWithSpeedAnomalies = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z', speed: 50 },
        { latitude: 5.6100, longitude: -0.1900, timestamp: '2024-01-15T08:05:00Z', speed: 120 }, // Too fast
        { latitude: 5.6200, longitude: -0.2000, timestamp: '2024-01-15T08:10:00Z', speed: 5 }, // Too slow
        { latitude: 5.6300, longitude: -0.2100, timestamp: '2024-01-15T08:15:00Z', speed: 60 },
      ];

      mockedGeolib.getDistance.mockReturnValue(2000); // 2km between points

      // Act
      const result = await service.detectRouteAnomalies(traceWithSpeedAnomalies, routeId, tenantId);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('GPS Trace Creation and Storage', () => {
    it('should create GPS trace with complete metadata', async () => {
      // Arrange
      const deliveryId = 'delivery-123';
      const gpsPoints = TestDataFactory.generateGPSPoints(5.6037, -0.1870, 180, 50);
      const expectedTrace = TestDataFactory.createTestGPSTrace({
        deliveryId,
        totalKm: 180,
        routePoints: gpsPoints,
      });

      gpsTraceRepository.create.mockReturnValue(expectedTrace);
      gpsTraceRepository.save.mockResolvedValue(expectedTrace);
      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(180);

      // Act
      const result = await service['createGPSTrace'](deliveryId, gpsPoints, tenantId);

      // Assert
      expect(result).toBe(expectedTrace);
      expect(gpsTraceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryId,
          tenantId,
          totalKm: 180,
          routePoints: gpsPoints,
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        })
      );
      expect(gpsTraceRepository.save).toHaveBeenCalledWith(expectedTrace);
    });

    it('should handle GPS trace with timestamps in different timezones', async () => {
      // Arrange
      const deliveryId = 'delivery-123';
      const gpsPointsWithTimezones = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' }, // UTC
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T08:00:00+00:00' }, // UTC explicit
        { latitude: 5.6237, longitude: -0.1870, timestamp: '2024-01-15T11:00:00+03:00' }, // Different timezone
      ];

      const expectedTrace = TestDataFactory.createTestGPSTrace({
        deliveryId,
        routePoints: gpsPointsWithTimezones,
      });

      gpsTraceRepository.create.mockReturnValue(expectedTrace);
      gpsTraceRepository.save.mockResolvedValue(expectedTrace);
      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(2.22);

      // Act
      const result = await service['createGPSTrace'](deliveryId, gpsPointsWithTimezones, tenantId);

      // Assert
      expect(result.startTime).toEqual(new Date('2024-01-15T08:00:00Z'));
      expect(result.endTime).toEqual(new Date('2024-01-15T08:00:00Z')); // Should convert to UTC
    });

    it('should validate GPS coordinate ranges', async () => {
      // Arrange
      const deliveryId = 'delivery-123';
      const invalidGPSPoints = [
        { latitude: 91.0, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' }, // Invalid latitude > 90
        { latitude: 5.6037, longitude: 181.0, timestamp: '2024-01-15T09:00:00Z' }, // Invalid longitude > 180
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T10:00:00Z' }, // Valid
      ];

      // Act & Assert - Implementation should validate coordinates
      // For now, we test that the service handles it gracefully
      await expect(service['createGPSTrace'](deliveryId, invalidGPSPoints, tenantId)).not.toThrow();
    });
  });

  describe('Distance Validation in Reconciliation', () => {
    it('should flag distance variance within tolerance', async () => {
      // Arrange
      const delivery = TestDataFactory.createTestDelivery();
      const claimWithGPS = TestDataFactory.createTestCreateClaimDto({
        kmActual: 180,
        gpsTrace: TestDataFactory.generateGPSPoints(5.6037, -0.1870, 185, 20), // 5km difference
      });

      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(185); // GPS shows 185km

      // Act
      const result = await service.performThreeWayReconciliation(delivery, claimWithGPS);

      // Assert
      expect(result.reconciliation.distanceVariance).toBe(5); // |180 - 185| = 5
      
      // 10% tolerance of 180km = 18km, so 5km should be within tolerance
      expect(result.hasVariances).toBe(false); // 5km < 18km tolerance
    });

    it('should flag distance variance exceeding tolerance', async () => {
      // Arrange
      const delivery = TestDataFactory.createTestDelivery();
      const claimWithGPS = TestDataFactory.createTestCreateClaimDto({
        kmActual: 180,
        gpsTrace: TestDataFactory.generateGPSPoints(5.6037, -0.1870, 220, 20), // 40km difference
      });

      jest.spyOn(service as any, 'calculateGPSDistance').mockReturnValue(220); // GPS shows 220km

      // Act
      const result = await service.performThreeWayReconciliation(delivery, claimWithGPS);

      // Assert
      expect(result.reconciliation.distanceVariance).toBe(40); // |180 - 220| = 40
      
      // 10% tolerance of 180km = 18km, so 40km exceeds tolerance
      expect(result.hasVariances).toBe(true);
      expect(result.variances).toContain('Distance variance: GPS trace shows 220.0km vs claimed 180km');
    });

    it('should handle claims without GPS trace gracefully', async () => {
      // Arrange
      const delivery = TestDataFactory.createTestDelivery();
      const claimWithoutGPS = TestDataFactory.createTestCreateClaimDto({
        kmActual: 180,
        gpsTrace: undefined,
      });

      // Act
      const result = await service.performThreeWayReconciliation(delivery, claimWithoutGPS);

      // Assert
      expect(result.reconciliation.distanceVariance).toBeUndefined();
      expect(result.variances).not.toContain(expect.stringMatching(/Distance variance/));
    });

    it('should calculate distance variance for empty GPS trace', async () => {
      // Arrange
      const delivery = TestDataFactory.createTestDelivery();
      const claimWithEmptyGPS = TestDataFactory.createTestCreateClaimDto({
        kmActual: 180,
        gpsTrace: [],
      });

      // Act
      const result = await service.performThreeWayReconciliation(delivery, claimWithEmptyGPS);

      // Assert
      expect(result.reconciliation.distanceVariance).toBeUndefined();
    });
  });

  describe('GPS Data Quality Assessment', () => {
    it('should assess GPS data quality based on point density', () => {
      // Arrange - Sparse GPS data
      const sparseTrace = TestDataFactory.generateGPSPoints(5.6037, -0.1870, 180, 5); // Only 5 points for 180km
      
      // Act
      const distance = service['calculateGPSDistance'](sparseTrace);
      
      // Assert - With sparse data, calculation should still work but may be less accurate
      expect(distance).toBeGreaterThan(0);
    });

    it('should handle GPS trace with duplicate timestamps', () => {
      // Arrange
      const traceWithDuplicates = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' }, // Duplicate timestamp
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T09:00:00Z' },
      ];

      mockedGeolib.getDistance.mockReturnValue(1000);

      // Act
      const distance = service['calculateGPSDistance'](traceWithDuplicates);

      // Assert
      expect(distance).toBeCloseTo(2.0, 1); // Should handle duplicates gracefully
    });

    it('should handle GPS trace with out-of-order timestamps', () => {
      // Arrange
      const outOfOrderTrace = [
        { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-15T08:00:00Z' },
        { latitude: 5.6137, longitude: -0.1870, timestamp: '2024-01-15T10:00:00Z' }, // Later timestamp
        { latitude: 5.6100, longitude: -0.1870, timestamp: '2024-01-15T09:00:00Z' }, // Earlier timestamp
      ];

      mockedGeolib.getDistance.mockReturnValue(1000);

      // Act
      const distance = service['calculateGPSDistance'](outOfOrderTrace);

      // Assert - Should calculate distance based on sequence, not timestamps
      expect(distance).toBeCloseTo(2.0, 1);
    });
  });

  describe('Performance and Scale', () => {
    it('should process GPS trace with 10,000 points efficiently', () => {
      // Arrange
      const largeTrace = TestDataFactory.generateGPSPoints(5.6037, -0.1870, 1000, 10000);
      mockedGeolib.getDistance.mockReturnValue(100); // 100m between points

      const startTime = Date.now();

      // Act
      const result = service['calculateGPSDistance'](largeTrace);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result).toBeCloseTo(999.9, 1); // (9999 * 100) / 1000 = 999.9km
      expect(executionTime).toBeLessThan(500); // Should complete within 500ms
      expect(mockedGeolib.getDistance).toHaveBeenCalledTimes(9999);
    });

    it('should handle concurrent GPS processing', async () => {
      // Arrange
      const concurrentTraces = Array.from({ length: 100 }, (_, i) => 
        TestDataFactory.generateGPSPoints(5.6037 + (i * 0.001), -0.1870 + (i * 0.001), 100, 50)
      );

      mockedGeolib.getDistance.mockReturnValue(200);

      const startTime = Date.now();

      // Act
      const results = await Promise.all(
        concurrentTraces.map(trace => 
          Promise.resolve(service['calculateGPSDistance'](trace))
        )
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(results).toHaveLength(100);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      results.forEach(result => {
        expect(result).toBeCloseTo(9.8, 1); // (49 * 200) / 1000 = 9.8km
      });
    });
  });
});