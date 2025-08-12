import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PricingWindow } from './entities/pricing-window.entity';
import { StationPrice } from './entities/station-price.entity';
import { CreatePricingWindowDto } from './dto/create-pricing-window.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { PricingWindowStatus } from '@omc-erp/shared-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingWindow)
    private readonly pricingWindowRepository: Repository<PricingWindow>,
    @InjectRepository(StationPrice)
    private readonly stationPriceRepository: Repository<StationPrice>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPricingWindow(
    createPricingWindowDto: CreatePricingWindowDto,
    tenantId: string,
    userId?: string,
  ): Promise<PricingWindow> {
    // Check if window already exists
    const existingWindow = await this.pricingWindowRepository.findOne({
      where: { windowId: createPricingWindowDto.windowId, tenantId },
    });

    if (existingWindow) {
      throw new ConflictException('Pricing window already exists');
    }

    // Validate dates
    const startDate = new Date(createPricingWindowDto.startDate);
    const endDate = new Date(createPricingWindowDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for overlapping windows
    const overlappingWindow = await this.pricingWindowRepository
      .createQueryBuilder('pw')
      .where('pw.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(pw.startDate <= :endDate AND pw.endDate >= :startDate)',
        { startDate, endDate }
      )
      .getOne();

    if (overlappingWindow) {
      throw new ConflictException('Pricing window overlaps with existing window');
    }

    const pricingWindow = this.pricingWindowRepository.create({
      ...createPricingWindowDto,
      tenantId,
      startDate,
      endDate,
      status: PricingWindowStatus.DRAFT,
      createdBy: userId,
    });

    const savedWindow = await this.pricingWindowRepository.save(pricingWindow);

    // Emit event
    this.eventEmitter.emit('pricing-window.created', {
      windowId: savedWindow.windowId,
      tenantId,
      startDate: savedWindow.startDate,
      endDate: savedWindow.endDate,
    });

    return savedWindow;
  }

  async findAllWindows(tenantId: string, status?: PricingWindowStatus): Promise<PricingWindow[]> {
    const query = this.pricingWindowRepository.createQueryBuilder('pw')
      .where('pw.tenantId = :tenantId', { tenantId })
      .orderBy('pw.startDate', 'DESC');

    if (status) {
      query.andWhere('pw.status = :status', { status });
    }

    return query.getMany();
  }

  async findWindow(windowId: string, tenantId: string): Promise<PricingWindow> {
    const window = await this.pricingWindowRepository.findOne({
      where: { windowId, tenantId },
      relations: ['stationPrices'],
    });

    if (!window) {
      throw new NotFoundException('Pricing window not found');
    }

    return window;
  }

  async getActiveWindow(tenantId: string): Promise<PricingWindow | null> {
    const now = new Date();
    return this.pricingWindowRepository.findOne({
      where: {
        tenantId,
        status: PricingWindowStatus.ACTIVE,
        startDate: { $lte: now } as any,
        endDate: { $gte: now } as any,
      },
    });
  }

  async activateWindow(windowId: string, tenantId: string, userId?: string): Promise<PricingWindow> {
    const window = await this.findWindow(windowId, tenantId);

    if (window.status !== PricingWindowStatus.DRAFT) {
      throw new BadRequestException('Only draft windows can be activated');
    }

    // Deactivate any currently active window
    await this.pricingWindowRepository.update(
      { tenantId, status: PricingWindowStatus.ACTIVE },
      { status: PricingWindowStatus.CLOSED }
    );

    // Activate the new window
    window.status = PricingWindowStatus.ACTIVE;
    window.approvedBy = userId;
    window.approvedAt = new Date();
    window.updatedAt = new Date();

    const savedWindow = await this.pricingWindowRepository.save(window);

    // Emit event
    this.eventEmitter.emit('pricing-window.activated', {
      windowId: savedWindow.windowId,
      tenantId,
      activatedBy: userId,
    });

    return savedWindow;
  }

  async calculateStationPrice(
    calculatePriceDto: CalculatePriceDto,
    tenantId: string,
    userId?: string,
  ): Promise<StationPrice> {
    const { stationId, productId, windowId } = calculatePriceDto;

    // Verify pricing window exists and is active
    const window = await this.findWindow(windowId, tenantId);

    // TODO: Integrate with PBU Components Service and Calculation Engine
    // For now, we'll create a mock calculation
    const mockBreakdown = {
      components: [
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
      ],
      totalPrice: 0,
      sourceDocuments: [window.npaGuidelineDocId || 'NPA-2025-W15-GUIDE'].filter(Boolean),
    };

    // Apply overrides if provided
    if (calculatePriceDto.overrides?.length) {
      calculatePriceDto.overrides.forEach(override => {
        const component = mockBreakdown.components.find(c => c.code === override.componentCode);
        if (component) {
          component.value = override.value;
        }
      });
    }

    // Calculate total price
    mockBreakdown.totalPrice = mockBreakdown.components.reduce((sum, comp) => sum + comp.value, 0);

    // Check if station price already exists for this window
    let stationPrice = await this.stationPriceRepository.findOne({
      where: { stationId, productId, windowId, tenantId },
    });

    if (stationPrice) {
      // Update existing price
      stationPrice.exPumpPrice = mockBreakdown.totalPrice;
      stationPrice.calcBreakdownJson = mockBreakdown;
      stationPrice.calculatedBy = userId;
      stationPrice.updatedAt = new Date();
    } else {
      // Create new price
      stationPrice = this.stationPriceRepository.create({
        id: uuidv4(),
        stationId,
        productId,
        windowId,
        exPumpPrice: mockBreakdown.totalPrice,
        calcBreakdownJson: mockBreakdown,
        tenantId,
        calculatedBy: userId,
      });
    }

    const savedPrice = await this.stationPriceRepository.save(stationPrice);

    // Emit event
    this.eventEmitter.emit('station-price.calculated', {
      stationId,
      productId,
      windowId,
      price: savedPrice.exPumpPrice,
      tenantId,
    });

    return savedPrice;
  }

  async publishStationPrice(
    stationId: string,
    productId: string,
    windowId: string,
    tenantId: string,
    userId?: string,
  ): Promise<StationPrice> {
    const stationPrice = await this.stationPriceRepository.findOne({
      where: { stationId, productId, windowId, tenantId },
    });

    if (!stationPrice) {
      throw new NotFoundException('Station price not found');
    }

    if (stationPrice.publishedAt) {
      throw new BadRequestException('Price already published');
    }

    stationPrice.publishedAt = new Date();
    stationPrice.publishedBy = userId;
    stationPrice.updatedAt = new Date();

    const savedPrice = await this.stationPriceRepository.save(stationPrice);

    // Emit event
    this.eventEmitter.emit('station-price.published', {
      stationId,
      productId,
      windowId,
      price: savedPrice.exPumpPrice,
      publishedAt: savedPrice.publishedAt,
      tenantId,
    });

    return savedPrice;
  }

  async getStationPrices(
    windowId: string,
    tenantId: string,
    stationId?: string,
    productId?: string,
  ): Promise<StationPrice[]> {
    const query = this.stationPriceRepository.createQueryBuilder('sp')
      .where('sp.windowId = :windowId AND sp.tenantId = :tenantId', { windowId, tenantId });

    if (stationId) {
      query.andWhere('sp.stationId = :stationId', { stationId });
    }

    if (productId) {
      query.andWhere('sp.productId = :productId', { productId });
    }

    return query
      .orderBy('sp.stationId', 'ASC')
      .addOrderBy('sp.productId', 'ASC')
      .getMany();
  }

  async calculateAllStationPrices(
    windowId: string,
    tenantId: string,
    stations: string[],
    products: string[],
    userId?: string,
  ): Promise<StationPrice[]> {
    const results: StationPrice[] = [];

    for (const stationId of stations) {
      for (const productId of products) {
        try {
          const calculateDto: CalculatePriceDto = {
            stationId,
            productId,
            windowId,
          };

          const price = await this.calculateStationPrice(calculateDto, tenantId, userId);
          results.push(price);
        } catch (error) {
          // Log error but continue with other calculations
          console.error(`Failed to calculate price for station ${stationId}, product ${productId}:`, error.message);
        }
      }
    }

    // Emit bulk calculation event
    this.eventEmitter.emit('pricing-window.bulk-calculated', {
      windowId,
      tenantId,
      calculatedPrices: results.length,
      totalRequested: stations.length * products.length,
    });

    return results;
  }

  // Scheduled task to check for expired windows
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredWindows(): Promise<void> {
    const now = new Date();
    
    const expiredWindows = await this.pricingWindowRepository.find({
      where: {
        status: PricingWindowStatus.ACTIVE,
        endDate: { $lt: now } as any,
      },
    });

    for (const window of expiredWindows) {
      window.status = PricingWindowStatus.CLOSED;
      await this.pricingWindowRepository.save(window);

      this.eventEmitter.emit('pricing-window.expired', {
        windowId: window.windowId,
        tenantId: window.tenantId,
      });
    }
  }

  // Generate NPA submission file
  async generateNPASubmissionFile(windowId: string, tenantId: string): Promise<any> {
    const window = await this.findWindow(windowId, tenantId);
    const prices = await this.getStationPrices(windowId, tenantId);

    // Group prices by station and product for NPA format
    const submissionData = {
      windowId,
      submissionDate: new Date().toISOString(),
      totalStations: new Set(prices.map(p => p.stationId)).size,
      totalProducts: new Set(prices.map(p => p.productId)).size,
      pricesByStation: prices.reduce((acc, price) => {
        const key = `${price.stationId}-${price.productId}`;
        acc[key] = {
          stationId: price.stationId,
          productId: price.productId,
          exPumpPrice: price.exPumpPrice,
          breakdown: price.calcBreakdownJson.components,
          calculatedAt: price.updatedAt,
          publishedAt: price.publishedAt,
        };
        return acc;
      }, {}),
    };

    return submissionData;
  }
}