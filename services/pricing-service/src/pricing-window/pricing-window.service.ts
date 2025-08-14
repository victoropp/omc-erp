import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PricingWindow } from '../pricing/entities/pricing-window.entity';
import { StationPrice } from '../pricing/entities/station-price.entity';
import { PriceCalculationService } from '../price-buildup/price-calculation.service';

export interface CreatePricingWindowDto {
  windowNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  submissionDeadline: Date;
  npaGuidelineDocId?: string;
  createdBy: string;
}

export interface PricingWindowSummary {
  windowId: string;
  windowNumber: number;
  year: number;
  status: string;
  startDate: Date;
  endDate: Date;
  totalStations: number;
  publishedStations: number;
  totalClaimsValue: number;
  averagePriceChange: number;
}

export interface WindowTransitionResult {
  previousWindow: PricingWindow;
  newWindow: PricingWindow;
  transitionDate: Date;
  impactedStations: number;
  priceChanges: any[];
}

@Injectable()
export class PricingWindowService {
  private readonly logger = new Logger(PricingWindowService.name);

  // Ghana bi-weekly pricing window schedule (every 2 weeks)
  private readonly WINDOW_DURATION_DAYS = 14;
  private readonly SUBMISSION_LEAD_DAYS = 2;

  constructor(
    @InjectRepository(PricingWindow)
    private readonly pricingWindowRepository: Repository<PricingWindow>,
    @InjectRepository(StationPrice)
    private readonly stationPriceRepository: Repository<StationPrice>,
    private readonly priceCalculationService: PriceCalculationService
  ) {}

  /**
   * Create a new pricing window manually
   */
  async createPricingWindow(dto: CreatePricingWindowDto): Promise<PricingWindow> {
    this.logger.log(`Creating pricing window ${dto.year}-${dto.windowNumber.toString().padStart(2, '0')}`);

    // Validate window dates
    await this.validateWindowDates(dto.startDate, dto.endDate, dto.year, dto.windowNumber);

    // Generate window ID
    const windowId = this.generateWindowId(dto.year, dto.windowNumber);

    // Check for duplicate windows
    const existingWindow = await this.pricingWindowRepository.findOne({
      where: { windowId }
    });

    if (existingWindow) {
      throw new BadRequestException(`Pricing window ${windowId} already exists`);
    }

    // Create the window
    const newWindow = this.pricingWindowRepository.create({
      windowId,
      windowNumber: dto.windowNumber,
      year: dto.year,
      startDate: dto.startDate,
      endDate: dto.endDate,
      submissionDeadline: dto.submissionDeadline,
      npaGuidelineDocId: dto.npaGuidelineDocId,
      status: 'DRAFT',
      approvalStatus: 'PENDING',
      createdBy: dto.createdBy
    });

    const savedWindow = await this.pricingWindowRepository.save(newWindow);
    
    this.logger.log(`Pricing window ${windowId} created successfully`);
    return savedWindow;
  }

  /**
   * Automated bi-weekly pricing window creation
   * Runs every Monday at 6:00 AM Ghana Time
   */
  @Cron('0 6 * * 1', {
    timeZone: 'Africa/Accra'
  })
  async createBiWeeklyWindow(): Promise<PricingWindow> {
    this.logger.log('Starting automated bi-weekly window creation');

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      
      // Calculate window number based on current date
      const windowNumber = this.calculateWindowNumber(currentDate);
      
      // Calculate window dates (current window starts today)
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + this.WINDOW_DURATION_DAYS - 1);
      endDate.setHours(23, 59, 59, 999);
      
      // Submission deadline is 2 days before window end
      const submissionDeadline = new Date(endDate);
      submissionDeadline.setDate(submissionDeadline.getDate() - this.SUBMISSION_LEAD_DAYS);
      submissionDeadline.setHours(17, 0, 0, 0); // 5 PM deadline

      // Check if window already exists
      const windowId = this.generateWindowId(year, windowNumber);
      const existingWindow = await this.pricingWindowRepository.findOne({
        where: { windowId }
      });

      if (existingWindow) {
        this.logger.log(`Window ${windowId} already exists, skipping creation`);
        return existingWindow;
      }

      // Close previous active window
      await this.closePreviousWindow();

      // Create new window
      const newWindow = await this.createPricingWindow({
        windowNumber,
        year,
        startDate,
        endDate,
        submissionDeadline,
        createdBy: 'SYSTEM_AUTOMATED'
      });

      // Auto-calculate prices for new window
      await this.calculateAndPublishPrices(newWindow.windowId, 'SYSTEM_AUTOMATED');

      this.logger.log(`Automated window creation completed: ${windowId}`);
      return newWindow;

    } catch (error) {
      this.logger.error('Automated window creation failed:', error);
      throw error;
    }
  }

  /**
   * Calculate and publish prices for a pricing window
   */
  async calculateAndPublishPrices(
    windowId: string, 
    publishedBy: string,
    overrides?: any[]
  ): Promise<{
    windowId: string;
    totalStationsUpdated: number;
    priceResults: any;
  }> {
    this.logger.log(`Calculating and publishing prices for window: ${windowId}`);

    // Calculate prices using price calculation service
    const priceResults = await this.priceCalculationService.calculatePricesForWindow(
      windowId, 
      overrides
    );

    if (!priceResults.isValid) {
      throw new BadRequestException(
        `Price calculation failed: ${priceResults.validationErrors.join(', ')}`
      );
    }

    // Get all active stations
    const activeStations = await this.getActiveStations();
    
    let totalStationsUpdated = 0;

    // Publish prices to each station for each product
    for (const station of activeStations) {
      for (const product of priceResults.products) {
        await this.publishStationPrice({
          stationId: station.id,
          productId: product.productCode,
          windowId,
          exPumpPrice: product.exPumpPrice,
          exRefineryPrice: product.exRefineryPrice,
          totalTaxesLevies: product.totalTaxesLevies,
          totalRegulatoryMargins: product.totalRegulatoryMargins,
          omcMargin: product.omcMargin,
          dealerMargin: product.dealerMargin,
          calcBreakdownJson: product.components,
          publishedDate: new Date()
        });
      }
      totalStationsUpdated++;
    }

    // Update window status to ACTIVE
    await this.pricingWindowRepository.update(
      { windowId },
      { 
        status: 'ACTIVE',
        publishedAt: new Date()
      }
    );

    this.logger.log(`Prices published to ${totalStationsUpdated} stations for window ${windowId}`);

    return {
      windowId,
      totalStationsUpdated,
      priceResults
    };
  }

  /**
   * Transition from current window to next window
   */
  async transitionWindow(
    currentWindowId: string,
    nextWindowId: string
  ): Promise<WindowTransitionResult> {
    this.logger.log(`Transitioning from window ${currentWindowId} to ${nextWindowId}`);

    const [currentWindow, nextWindow] = await Promise.all([
      this.pricingWindowRepository.findOne({ where: { windowId: currentWindowId } }),
      this.pricingWindowRepository.findOne({ where: { windowId: nextWindowId } })
    ]);

    if (!currentWindow || !nextWindow) {
      throw new BadRequestException('Invalid window IDs for transition');
    }

    // Close current window
    currentWindow.status = 'CLOSED';
    await this.pricingWindowRepository.save(currentWindow);

    // Activate next window
    nextWindow.status = 'ACTIVE';
    await this.pricingWindowRepository.save(nextWindow);

    // Calculate price changes between windows
    const priceChanges = await this.priceCalculationService.comparePriceWindows(
      nextWindowId,
      currentWindowId
    );

    // Count impacted stations
    const impactedStations = await this.stationPriceRepository.count({
      where: { windowId: nextWindowId }
    });

    const transitionResult: WindowTransitionResult = {
      previousWindow: currentWindow,
      newWindow: nextWindow,
      transitionDate: new Date(),
      impactedStations,
      priceChanges: priceChanges.productComparisons
    };

    this.logger.log(`Window transition completed: ${impactedStations} stations impacted`);
    return transitionResult;
  }

  /**
   * Get current active pricing window
   */
  async getCurrentActiveWindow(): Promise<PricingWindow | null> {
    return await this.pricingWindowRepository.findOne({
      where: { 
        status: 'ACTIVE',
        startDate: Between(new Date(Date.now() - 86400000), new Date()),
        endDate: Between(new Date(), new Date(Date.now() + 86400000 * 14))
      },
      order: { startDate: 'DESC' }
    });
  }

  /**
   * Get pricing windows within a date range
   */
  async getWindowsInDateRange(startDate: Date, endDate: Date): Promise<PricingWindow[]> {
    return await this.pricingWindowRepository.find({
      where: {
        startDate: Between(startDate, endDate)
      },
      order: { startDate: 'ASC' }
    });
  }

  /**
   * Get window summary with statistics
   */
  async getWindowSummary(windowId: string): Promise<PricingWindowSummary> {
    const window = await this.pricingWindowRepository.findOne({
      where: { windowId }
    });

    if (!window) {
      throw new BadRequestException(`Pricing window ${windowId} not found`);
    }

    // Get station statistics
    const stationStats = await this.stationPriceRepository
      .createQueryBuilder('sp')
      .select('COUNT(DISTINCT sp.stationId)', 'publishedStations')
      .where('sp.windowId = :windowId', { windowId })
      .getRawOne();

    // Calculate average price change (compared to previous window)
    let averagePriceChange = 0;
    const previousWindow = await this.getPreviousWindow(window);
    
    if (previousWindow) {
      const comparison = await this.priceCalculationService.comparePriceWindows(
        windowId,
        previousWindow.windowId
      );
      
      averagePriceChange = comparison.productComparisons.reduce(
        (sum: number, comp: any) => sum + comp.percentageChange, 0
      ) / comparison.productComparisons.length;
    }

    return {
      windowId: window.windowId,
      windowNumber: window.windowNumber,
      year: window.year,
      status: window.status,
      startDate: window.startDate,
      endDate: window.endDate,
      totalStations: await this.getTotalActiveStationsCount(),
      publishedStations: parseInt(stationStats.publishedStations) || 0,
      totalClaimsValue: await this.getTotalClaimsValue(windowId),
      averagePriceChange: Math.round(averagePriceChange * 100) / 100
    };
  }

  /**
   * Archive old pricing windows
   */
  async archiveOldWindows(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.pricingWindowRepository
      .createQueryBuilder()
      .update(PricingWindow)
      .set({ status: 'ARCHIVED' })
      .where('endDate < :cutoffDate', { cutoffDate })
      .andWhere('status != :status', { status: 'ARCHIVED' })
      .execute();

    this.logger.log(`Archived ${result.affected} pricing windows older than ${olderThanDays} days`);
    return result.affected || 0;
  }

  // Private helper methods

  private generateWindowId(year: number, windowNumber: number): string {
    return `${year}-W${windowNumber.toString().padStart(2, '0')}`;
  }

  private calculateWindowNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.ceil(dayOfYear / this.WINDOW_DURATION_DAYS);
  }

  private async validateWindowDates(
    startDate: Date, 
    endDate: Date, 
    year: number, 
    windowNumber: number
  ): Promise<void> {
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate.getFullYear() !== year) {
      throw new BadRequestException('Start date year must match window year');
    }

    // Check for overlapping windows
    const overlapping = await this.pricingWindowRepository
      .createQueryBuilder('pw')
      .where('pw.year = :year', { year })
      .andWhere('pw.windowNumber != :windowNumber', { windowNumber })
      .andWhere(
        '(pw.startDate BETWEEN :startDate AND :endDate) OR ' +
        '(pw.endDate BETWEEN :startDate AND :endDate) OR ' +
        '(pw.startDate <= :startDate AND pw.endDate >= :endDate)',
        { startDate, endDate }
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException(
        `Window dates overlap with existing window ${overlapping.windowId}`
      );
    }
  }

  private async closePreviousWindow(): Promise<void> {
    await this.pricingWindowRepository
      .createQueryBuilder()
      .update(PricingWindow)
      .set({ status: 'CLOSED' })
      .where('status = :status', { status: 'ACTIVE' })
      .execute();
  }

  private async publishStationPrice(priceData: any): Promise<void> {
    await this.stationPriceRepository.save(
      this.stationPriceRepository.create(priceData)
    );
  }

  private async getActiveStations(): Promise<any[]> {
    // This would typically query the stations service
    // For now, returning mock data structure
    return [
      { id: 'STATION-001' },
      { id: 'STATION-002' }
      // In real implementation, fetch from stations service
    ];
  }

  private async getTotalActiveStationsCount(): Promise<number> {
    // Mock implementation - would integrate with stations service
    return 150;
  }

  private async getTotalClaimsValue(windowId: string): Promise<number> {
    // Mock implementation - would integrate with UPPF claims service
    return 0;
  }

  private async getPreviousWindow(currentWindow: PricingWindow): Promise<PricingWindow | null> {
    return await this.pricingWindowRepository.findOne({
      where: {
        year: currentWindow.year,
        windowNumber: currentWindow.windowNumber - 1
      }
    });
  }
}