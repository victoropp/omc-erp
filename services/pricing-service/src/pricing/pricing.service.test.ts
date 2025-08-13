import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  ConflictException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingWindow } from './entities/pricing-window.entity';
import { StationPrice } from './entities/station-price.entity';
import { CreatePricingWindowDto } from './dto/create-pricing-window.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { PricingWindowStatus } from '@omc-erp/shared-types';

describe('PricingService', () => {
  let service: PricingService;
  let pricingWindowRepository: jest.Mocked<Repository<PricingWindow>>;
  let stationPriceRepository: jest.Mocked<Repository<StationPrice>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';
  
  const mockPricingWindow: PricingWindow = {
    id: 'window-123',
    windowId: 'PW-2024-W01',
    name: 'Week 1 Pricing Window',
    description: 'First pricing window of 2024',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    status: PricingWindowStatus.DRAFT,
    tenantId: mockTenantId,
    createdBy: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    approvedBy: null,
    approvedAt: null,
    npaGuidelineDocId: 'NPA-2024-W01-GUIDE',
    stationPrices: [],
  } as PricingWindow;

  const mockStationPrice: StationPrice = {
    id: 'price-123',
    stationId: 'station-123',
    productId: 'product-123',
    windowId: 'PW-2024-W01',
    exPumpPrice: 11.304,
    calcBreakdownJson: {
      components: [
        { code: 'EXREF', name: 'Ex-Refinery Price', value: 8.904, unit: 'GHS_per_litre' },
        { code: 'UPPF', name: 'UPPF Margin', value: 0.200, unit: 'GHS_per_litre' },
        { code: 'OMC', name: 'OMC Margin', value: 0.300, unit: 'GHS_per_litre' },
      ],
      totalPrice: 11.304,
      sourceDocuments: ['NPA-2024-W01-GUIDE'],
    },
    tenantId: mockTenantId,
    calculatedBy: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    publishedBy: null,
  } as StationPrice;

  beforeEach(async () => {
    // Create query builder mock
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(PricingWindow),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
        {
          provide: getRepositoryToken(StationPrice),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
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

    service = module.get<PricingService>(PricingService);
    pricingWindowRepository = module.get(getRepositoryToken(PricingWindow));
    stationPriceRepository = module.get(getRepositoryToken(StationPrice));
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPricingWindow', () => {
    const createDto: CreatePricingWindowDto = {
      windowId: 'PW-2024-W02',
      name: 'Week 2 Pricing Window',
      description: 'Second pricing window of 2024',
      startDate: '2024-01-08T00:00:00.000Z',
      endDate: '2024-01-14T23:59:59.999Z',
    };

    it('should create pricing window successfully', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(null); // No existing window
      queryBuilder.getOne.mockResolvedValue(null); // No overlapping window
      pricingWindowRepository.create.mockReturnValue(mockPricingWindow);
      pricingWindowRepository.save.mockResolvedValue(mockPricingWindow);

      // Act
      const result = await service.createPricingWindow(createDto, mockTenantId, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result.windowId).toBe(mockPricingWindow.windowId);
      expect(result.status).toBe(PricingWindowStatus.DRAFT);
      expect(pricingWindowRepository.create).toHaveBeenCalled();
      expect(pricingWindowRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('pricing-window.created', expect.any(Object));
    });

    it('should throw ConflictException if window already exists', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);

      // Act & Assert
      await expect(service.createPricingWindow(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(ConflictException);

      expect(pricingWindowRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      // Arrange
      const invalidDto = {
        ...createDto,
        startDate: '2024-01-14T00:00:00.000Z',
        endDate: '2024-01-08T23:59:59.999Z',
      };
      pricingWindowRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createPricingWindow(invalidDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for overlapping windows', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(null);
      queryBuilder.getOne.mockResolvedValue(mockPricingWindow); // Overlapping window found

      // Act & Assert
      await expect(service.createPricingWindow(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findAllWindows', () => {
    it('should return all windows for tenant', async () => {
      // Arrange
      const windows = [mockPricingWindow];
      queryBuilder.getMany.mockResolvedValue(windows);

      // Act
      const result = await service.findAllWindows(mockTenantId);

      // Assert
      expect(result).toEqual(windows);
      expect(queryBuilder.where).toHaveBeenCalledWith('pw.tenantId = :tenantId', { tenantId: mockTenantId });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('pw.startDate', 'DESC');
    });

    it('should filter by status when provided', async () => {
      // Arrange
      const status = PricingWindowStatus.ACTIVE;
      queryBuilder.getMany.mockResolvedValue([mockPricingWindow]);

      // Act
      await service.findAllWindows(mockTenantId, status);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('pw.status = :status', { status });
    });
  });

  describe('findWindow', () => {
    it('should return window with relations', async () => {
      // Arrange
      const windowWithPrices = { ...mockPricingWindow, stationPrices: [mockStationPrice] };
      pricingWindowRepository.findOne.mockResolvedValue(windowWithPrices);

      // Act
      const result = await service.findWindow(mockPricingWindow.windowId, mockTenantId);

      // Assert
      expect(result).toEqual(windowWithPrices);
      expect(pricingWindowRepository.findOne).toHaveBeenCalledWith({
        where: { windowId: mockPricingWindow.windowId, tenantId: mockTenantId },
        relations: ['stationPrices'],
      });
    });

    it('should throw NotFoundException if window not found', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findWindow('nonexistent', mockTenantId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveWindow', () => {
    it('should return active window within date range', async () => {
      // Arrange
      const activeWindow = { ...mockPricingWindow, status: PricingWindowStatus.ACTIVE };
      pricingWindowRepository.findOne.mockResolvedValue(activeWindow);

      // Act
      const result = await service.getActiveWindow(mockTenantId);

      // Assert
      expect(result).toEqual(activeWindow);
      expect(pricingWindowRepository.findOne).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          status: PricingWindowStatus.ACTIVE,
          startDate: expect.any(Object),
          endDate: expect.any(Object),
        },
      });
    });

    it('should return null if no active window', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getActiveWindow(mockTenantId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('activateWindow', () => {
    it('should activate window successfully', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      pricingWindowRepository.update.mockResolvedValue({ affected: 1 } as any);
      const activatedWindow = { ...mockPricingWindow, status: PricingWindowStatus.ACTIVE };
      pricingWindowRepository.save.mockResolvedValue(activatedWindow);

      // Act
      const result = await service.activateWindow(mockPricingWindow.windowId, mockTenantId, mockUserId);

      // Assert
      expect(result.status).toBe(PricingWindowStatus.ACTIVE);
      expect(result.approvedBy).toBe(mockUserId);
      expect(result.approvedAt).toBeDefined();
      expect(pricingWindowRepository.update).toHaveBeenCalledWith(
        { tenantId: mockTenantId, status: PricingWindowStatus.ACTIVE },
        { status: PricingWindowStatus.CLOSED }
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('pricing-window.activated', expect.any(Object));
    });

    it('should throw BadRequestException if window is not draft', async () => {
      // Arrange
      const activeWindow = { ...mockPricingWindow, status: PricingWindowStatus.ACTIVE };
      pricingWindowRepository.findOne.mockResolvedValue(activeWindow);

      // Act & Assert
      await expect(service.activateWindow(mockPricingWindow.windowId, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateStationPrice', () => {
    const calculateDto: CalculatePriceDto = {
      stationId: 'station-123',
      productId: 'product-123',
      windowId: 'PW-2024-W01',
    };

    it('should calculate station price successfully', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(null); // No existing price
      stationPriceRepository.create.mockReturnValue(mockStationPrice);
      stationPriceRepository.save.mockResolvedValue(mockStationPrice);

      // Act
      const result = await service.calculateStationPrice(calculateDto, mockTenantId, mockUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result.exPumpPrice).toBeGreaterThan(0);
      expect(result.calcBreakdownJson).toBeDefined();
      expect(result.calcBreakdownJson.components).toHaveLength(10); // Standard components
      expect(eventEmitter.emit).toHaveBeenCalledWith('station-price.calculated', expect.any(Object));
    });

    it('should update existing station price', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(mockStationPrice);
      const updatedPrice = { ...mockStationPrice, exPumpPrice: 12.000 };
      stationPriceRepository.save.mockResolvedValue(updatedPrice);

      // Act
      const result = await service.calculateStationPrice(calculateDto, mockTenantId, mockUserId);

      // Assert
      expect(result.calculatedBy).toBe(mockUserId);
      expect(result.updatedAt).toBeDefined();
    });

    it('should apply price overrides correctly', async () => {
      // Arrange
      const dtoWithOverrides = {
        ...calculateDto,
        overrides: [
          { componentCode: 'OMC', value: 0.500 }, // Override OMC margin
        ],
      };
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(null);
      stationPriceRepository.create.mockReturnValue(mockStationPrice);
      stationPriceRepository.save.mockResolvedValue(mockStationPrice);

      // Act
      const result = await service.calculateStationPrice(dtoWithOverrides, mockTenantId, mockUserId);

      // Assert
      expect(result.calcBreakdownJson.components.find(c => c.code === 'OMC')?.value).toBe(0.500);
    });

    it('should throw NotFoundException if window not found', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.calculateStationPrice(calculateDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('publishStationPrice', () => {
    it('should publish station price successfully', async () => {
      // Arrange
      stationPriceRepository.findOne.mockResolvedValue(mockStationPrice);
      const publishedPrice = { ...mockStationPrice, publishedAt: new Date(), publishedBy: mockUserId };
      stationPriceRepository.save.mockResolvedValue(publishedPrice);

      // Act
      const result = await service.publishStationPrice(
        'station-123',
        'product-123',
        'PW-2024-W01',
        mockTenantId,
        mockUserId
      );

      // Assert
      expect(result.publishedAt).toBeDefined();
      expect(result.publishedBy).toBe(mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('station-price.published', expect.any(Object));
    });

    it('should throw NotFoundException if price not found', async () => {
      // Arrange
      stationPriceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.publishStationPrice('station-123', 'product-123', 'window', mockTenantId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if price already published', async () => {
      // Arrange
      const publishedPrice = { ...mockStationPrice, publishedAt: new Date() };
      stationPriceRepository.findOne.mockResolvedValue(publishedPrice);

      // Act & Assert
      await expect(service.publishStationPrice('station-123', 'product-123', 'window', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getStationPrices', () => {
    it('should return station prices with filters', async () => {
      // Arrange
      const prices = [mockStationPrice];
      queryBuilder.getMany.mockResolvedValue(prices);

      // Act
      const result = await service.getStationPrices('PW-2024-W01', mockTenantId, 'station-123', 'product-123');

      // Assert
      expect(result).toEqual(prices);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'sp.windowId = :windowId AND sp.tenantId = :tenantId',
        { windowId: 'PW-2024-W01', tenantId: mockTenantId }
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('sp.stationId = :stationId', { stationId: 'station-123' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('sp.productId = :productId', { productId: 'product-123' });
    });

    it('should return all prices without filters', async () => {
      // Arrange
      const prices = [mockStationPrice];
      queryBuilder.getMany.mockResolvedValue(prices);

      // Act
      const result = await service.getStationPrices('PW-2024-W01', mockTenantId);

      // Assert
      expect(result).toEqual(prices);
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith('sp.stationId = :stationId', expect.any(Object));
    });
  });

  describe('calculateAllStationPrices', () => {
    it('should calculate prices for all station-product combinations', async () => {
      // Arrange
      const stations = ['station-1', 'station-2'];
      const products = ['product-1', 'product-2'];
      
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(null);
      stationPriceRepository.create.mockReturnValue(mockStationPrice);
      stationPriceRepository.save.mockResolvedValue(mockStationPrice);

      // Act
      const result = await service.calculateAllStationPrices('PW-2024-W01', mockTenantId, stations, products, mockUserId);

      // Assert
      expect(result).toHaveLength(4); // 2 stations × 2 products
      expect(eventEmitter.emit).toHaveBeenCalledWith('pricing-window.bulk-calculated', expect.any(Object));
    });

    it('should handle calculation errors gracefully', async () => {
      // Arrange
      const stations = ['station-1', 'invalid-station'];
      const products = ['product-1'];
      
      pricingWindowRepository.findOne
        .mockResolvedValueOnce(mockPricingWindow) // First station succeeds
        .mockRejectedValueOnce(new Error('Station not found')); // Second station fails

      stationPriceRepository.findOne.mockResolvedValue(null);
      stationPriceRepository.create.mockReturnValue(mockStationPrice);
      stationPriceRepository.save.mockResolvedValue(mockStationPrice);

      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await service.calculateAllStationPrices('PW-2024-W01', mockTenantId, stations, products, mockUserId);

      // Assert
      expect(result).toHaveLength(1); // Only successful calculation
      expect(consoleSpy).toHaveBeenCalled(); // Error was logged
      
      consoleSpy.mockRestore();
    });
  });

  describe('checkExpiredWindows (Cron Job)', () => {
    it('should close expired active windows', async () => {
      // Arrange
      const expiredWindow = { ...mockPricingWindow, status: PricingWindowStatus.ACTIVE, endDate: new Date(Date.now() - 86400000) };
      pricingWindowRepository.find.mockResolvedValue([expiredWindow]);
      pricingWindowRepository.save.mockResolvedValue({ ...expiredWindow, status: PricingWindowStatus.CLOSED });

      // Act
      await service.checkExpiredWindows();

      // Assert
      expect(pricingWindowRepository.find).toHaveBeenCalledWith({
        where: {
          status: PricingWindowStatus.ACTIVE,
          endDate: expect.any(Object),
        },
      });
      expect(pricingWindowRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('pricing-window.expired', expect.any(Object));
    });

    it('should handle no expired windows', async () => {
      // Arrange
      pricingWindowRepository.find.mockResolvedValue([]);

      // Act
      await service.checkExpiredWindows();

      // Assert
      expect(pricingWindowRepository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('generateNPASubmissionFile', () => {
    it('should generate NPA submission format', async () => {
      // Arrange
      const windowWithPrices = { ...mockPricingWindow, stationPrices: [mockStationPrice] };
      pricingWindowRepository.findOne.mockResolvedValue(windowWithPrices);
      queryBuilder.getMany.mockResolvedValue([mockStationPrice]);

      // Act
      const result = await service.generateNPASubmissionFile('PW-2024-W01', mockTenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.windowId).toBe('PW-2024-W01');
      expect(result.submissionDate).toBeDefined();
      expect(result.totalStations).toBe(1);
      expect(result.totalProducts).toBe(1);
      expect(result.pricesByStation).toBeDefined();
    });

    it('should group prices by station and product correctly', async () => {
      // Arrange
      const multipleStationPrices = [
        { ...mockStationPrice, stationId: 'station-1', productId: 'product-1' },
        { ...mockStationPrice, stationId: 'station-1', productId: 'product-2' },
        { ...mockStationPrice, stationId: 'station-2', productId: 'product-1' },
      ];
      
      const windowWithPrices = { ...mockPricingWindow, stationPrices: multipleStationPrices };
      pricingWindowRepository.findOne.mockResolvedValue(windowWithPrices);
      queryBuilder.getMany.mockResolvedValue(multipleStationPrices);

      // Act
      const result = await service.generateNPASubmissionFile('PW-2024-W01', mockTenantId);

      // Assert
      expect(result.totalStations).toBe(2); // Unique stations
      expect(result.totalProducts).toBe(2); // Unique products
      expect(Object.keys(result.pricesByStation)).toHaveLength(3); // 3 combinations
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      pricingWindowRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.findWindow('window-123', mockTenantId))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle invalid date formats', async () => {
      // Arrange
      const invalidDto = {
        windowId: 'PW-2024-W02',
        name: 'Invalid Window',
        description: 'Test',
        startDate: 'invalid-date',
        endDate: 'also-invalid',
      };

      // Act & Assert
      await expect(service.createPricingWindow(invalidDto, mockTenantId, mockUserId))
        .rejects.toThrow(); // Should throw due to invalid date
    });

    it('should handle empty calculation results', async () => {
      // Arrange
      const calculateDto: CalculatePriceDto = {
        stationId: 'station-123',
        productId: 'product-123',
        windowId: 'PW-2024-W01',
      };
      
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(null);
      stationPriceRepository.create.mockReturnValue(null); // Simulate creation failure
      
      // Act & Assert
      await expect(service.calculateStationPrice(calculateDto, mockTenantId, mockUserId))
        .rejects.toThrow();
    });
  });

  describe('Performance and Concurrent Operations', () => {
    it('should handle concurrent pricing window creation', async () => {
      // Arrange
      const createDto1: CreatePricingWindowDto = {
        windowId: 'PW-2024-W03',
        name: 'Week 3 Pricing Window',
        description: 'Test',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-01-21T23:59:59.999Z',
      };
      
      const createDto2: CreatePricingWindowDto = {
        windowId: 'PW-2024-W04',
        name: 'Week 4 Pricing Window',
        description: 'Test',
        startDate: '2024-01-22T00:00:00.000Z',
        endDate: '2024-01-28T23:59:59.999Z',
      };

      pricingWindowRepository.findOne.mockResolvedValue(null);
      queryBuilder.getOne.mockResolvedValue(null);
      pricingWindowRepository.create.mockReturnValue(mockPricingWindow);
      pricingWindowRepository.save.mockResolvedValue(mockPricingWindow);

      // Act
      const promises = [
        service.createPricingWindow(createDto1, mockTenantId, mockUserId),
        service.createPricingWindow(createDto2, mockTenantId, mockUserId),
      ];
      
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(2);
      results.forEach(result => expect(result).toBeDefined());
    });

    it('should efficiently handle bulk price calculations', async () => {
      // Arrange
      const stations = Array.from({ length: 50 }, (_, i) => `station-${i}`);
      const products = Array.from({ length: 5 }, (_, i) => `product-${i}`);
      
      pricingWindowRepository.findOne.mockResolvedValue(mockPricingWindow);
      stationPriceRepository.findOne.mockResolvedValue(null);
      stationPriceRepository.create.mockReturnValue(mockStationPrice);
      stationPriceRepository.save.mockResolvedValue(mockStationPrice);

      const startTime = Date.now();

      // Act
      const result = await service.calculateAllStationPrices('PW-2024-W01', mockTenantId, stations, products, mockUserId);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result).toHaveLength(250); // 50 × 5
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});