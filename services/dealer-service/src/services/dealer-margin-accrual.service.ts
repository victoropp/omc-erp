import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, Raw } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DealerMarginAccrual, AccrualStatus } from '../entities/dealer-margin-accrual.entity';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionData {
  transactionId: string;
  stationId: string;
  productType: string;
  litresSold: number;
  exPumpPrice: number;
  transactionDate: Date;
  windowId: string;
}

export interface PricingWindowComponent {
  componentCode: string;
  name: string;
  category: 'dealer_margin' | 'omc_margin' | 'regulatory_margin' | 'levy' | 'other';
  unit: 'GHS_per_litre' | '%';
  rateValue: number;
  productType: string;
  effectiveFrom: Date;
  effectiveTo: Date;
}

export interface DailyMarginAccrualDto {
  stationId: string;
  dealerId: string;
  accrualDate: Date;
  transactions: TransactionData[];
  windowId: string;
  tenantId: string;
  processedBy?: string;
}

export interface MarginAccrualSummary {
  stationId: string;
  accrualDate: Date;
  windowId: string;
  totalLitresSold: number;
  grossMarginEarned: number;
  productBreakdown: Record<string, {
    litres: number;
    marginRate: number;
    marginAmount: number;
    exPumpPrice: number;
  }>;
  accrualStatus: AccrualStatus;
  createdAt: Date;
}

export interface WindowAccrualSummary {
  windowId: string;
  stationId: string;
  periodStart: Date;
  periodEnd: Date;
  totalDays: number;
  accruedDays: number;
  totalLitresSold: number;
  totalMarginAccrued: number;
  averageMarginPerLitre: number;
  productBreakdown: Record<string, {
    totalLitres: number;
    totalMargin: number;
    averageMarginRate: number;
    daysWithSales: number;
  }>;
  dailyAccruals: MarginAccrualSummary[];
}

@Injectable()
export class DealerMarginAccrualService {
  private readonly logger = new Logger(DealerMarginAccrualService.name);

  constructor(
    @InjectRepository(DealerMarginAccrual)
    private readonly marginAccrualRepository: Repository<DealerMarginAccrual>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process daily margin accrual for a dealer station
   * Blueprint: "Calculate daily dealer margins from sales"
   */
  async processDailyMarginAccrual(dto: DailyMarginAccrualDto): Promise<DealerMarginAccrual[]> {
    this.logger.log(`Processing daily margin accrual for station ${dto.stationId}, date ${dto.accrualDate.toDateString()}`);

    if (dto.transactions.length === 0) {
      this.logger.warn(`No transactions provided for station ${dto.stationId} on ${dto.accrualDate.toDateString()}`);
      return [];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if accrual already exists for this date
      const existingAccruals = await this.marginAccrualRepository.find({
        where: {
          stationId: dto.stationId,
          accrualDate: dto.accrualDate,
          windowId: dto.windowId,
          tenantId: dto.tenantId,
        },
      });

      if (existingAccruals.length > 0 && existingAccruals.some(a => a.status !== AccrualStatus.PENDING)) {
        throw new BadRequestException('Margin accrual already processed for this date');
      }

      // Delete existing pending accruals for re-processing
      if (existingAccruals.length > 0) {
        await queryRunner.manager.remove(existingAccruals);
      }

      // Get pricing window components for margin rates
      const pricingComponents = await this.getPricingWindowComponents(dto.windowId);
      
      // Group transactions by product type
      const transactionsByProduct = this.groupTransactionsByProduct(dto.transactions);
      
      const accruals: DealerMarginAccrual[] = [];
      let cumulativeLitres = 0;
      let cumulativeMargin = 0;

      for (const [productType, transactions] of Object.entries(transactionsByProduct)) {
        const dealerMarginComponent = pricingComponents.find(
          c => c.category === 'dealer_margin' && c.productType === productType
        );

        if (!dealerMarginComponent) {
          this.logger.warn(`No dealer margin component found for product ${productType} in window ${dto.windowId}`);
          continue;
        }

        // Calculate totals for this product
        const totalLitres = transactions.reduce((sum, t) => sum + t.litresSold, 0);
        const averageExPumpPrice = transactions.reduce((sum, t) => sum + (t.exPumpPrice * t.litresSold), 0) / totalLitres;
        const marginRate = dealerMarginComponent.rateValue;
        const marginAmount = totalLitres * marginRate;

        cumulativeLitres += totalLitres;
        cumulativeMargin += marginAmount;

        // Create margin accrual record
        const accrual = this.marginAccrualRepository.create({
          id: uuidv4(),
          stationId: dto.stationId,
          dealerId: dto.dealerId,
          productType,
          accrualDate: dto.accrualDate,
          windowId: dto.windowId,
          litresSold: totalLitres,
          marginRate,
          marginAmount,
          exPumpPrice: averageExPumpPrice,
          cumulativeLitres,
          cumulativeMargin,
          status: AccrualStatus.ACCRUED,
          calculationDetails: {
            transactionIds: transactions.map(t => t.transactionId),
            pbuBreakdown: this.extractPBUBreakdown(pricingComponents, productType),
            adjustments: [],
          },
          tenantId: dto.tenantId,
          processedBy: dto.processedBy,
        });

        accruals.push(accrual);
      }

      // Save all accruals
      const savedAccruals = await queryRunner.manager.save(accruals);

      await queryRunner.commitTransaction();

      // Emit accrual processed event
      this.eventEmitter.emit('dealer.margin.accrued', {
        stationId: dto.stationId,
        dealerId: dto.dealerId,
        accrualDate: dto.accrualDate,
        windowId: dto.windowId,
        totalLitres: cumulativeLitres,
        totalMargin: cumulativeMargin,
        productCount: accruals.length,
        tenantId: dto.tenantId,
      });

      this.logger.log(`Processed ${accruals.length} margin accruals for station ${dto.stationId}: Total margin GHS ${cumulativeMargin.toFixed(2)}`);
      
      return savedAccruals;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process batch margin accruals from transaction service
   * Blueprint: Integration with daily delivery to track dealer margins
   */
  async processBatchMarginAccruals(
    accrualData: DailyMarginAccrualDto[],
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ stationId: string; date: string; error: string }>;
  }> {
    this.logger.log(`Processing batch margin accruals for ${accrualData.length} station-days`);

    let successful = 0;
    let failed = 0;
    const errors: Array<{ stationId: string; date: string; error: string }> = [];

    for (const data of accrualData) {
      try {
        await this.processDailyMarginAccrual(data);
        successful++;
      } catch (error) {
        failed++;
        errors.push({
          stationId: data.stationId,
          date: data.accrualDate.toDateString(),
          error: error.message,
        });
        this.logger.error(`Failed to process margin accrual for station ${data.stationId}:`, error);
      }
    }

    this.eventEmitter.emit('dealer.margin.batch.processed', {
      totalProcessed: accrualData.length,
      successful,
      failed,
      errorCount: errors.length,
    });

    this.logger.log(`Batch processing completed: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, errors };
  }

  /**
   * Get daily margin accrual summary
   */
  async getDailyMarginSummary(
    stationId: string,
    accrualDate: Date,
    tenantId: string,
  ): Promise<MarginAccrualSummary | null> {
    const accruals = await this.marginAccrualRepository.find({
      where: {
        stationId,
        accrualDate,
        tenantId,
        status: AccrualStatus.ACCRUED,
      },
      order: { productType: 'ASC' },
    });

    if (accruals.length === 0) {
      return null;
    }

    const totalLitresSold = accruals.reduce((sum, a) => sum + a.litresSold, 0);
    const grossMarginEarned = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
    
    const productBreakdown: Record<string, any> = {};
    for (const accrual of accruals) {
      productBreakdown[accrual.productType] = {
        litres: accrual.litresSold,
        marginRate: accrual.marginRate,
        marginAmount: accrual.marginAmount,
        exPumpPrice: accrual.exPumpPrice,
      };
    }

    return {
      stationId,
      accrualDate,
      windowId: accruals[0].windowId,
      totalLitresSold,
      grossMarginEarned,
      productBreakdown,
      accrualStatus: accruals[0].status,
      createdAt: accruals[0].createdAt,
    };
  }

  /**
   * Get window-level margin accrual summary
   */
  async getWindowMarginSummary(
    stationId: string,
    windowId: string,
    tenantId: string,
  ): Promise<WindowAccrualSummary | null> {
    const windowDates = await this.getPricingWindowDates(windowId);
    if (!windowDates) {
      throw new NotFoundException(`Pricing window ${windowId} not found`);
    }

    const accruals = await this.marginAccrualRepository.find({
      where: {
        stationId,
        windowId,
        tenantId,
        accrualDate: Between(windowDates.startDate, windowDates.endDate),
        status: AccrualStatus.ACCRUED,
      },
      order: { accrualDate: 'ASC', productType: 'ASC' },
    });

    if (accruals.length === 0) {
      return null;
    }

    // Calculate summary metrics
    const totalLitresSold = accruals.reduce((sum, a) => sum + a.litresSold, 0);
    const totalMarginAccrued = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
    const averageMarginPerLitre = totalLitresSold > 0 ? totalMarginAccrued / totalLitresSold : 0;

    // Group by date for daily summaries
    const dailyAccruals = this.groupAccrualsByDate(accruals);

    // Calculate product breakdown
    const productBreakdown: Record<string, any> = {};
    for (const accrual of accruals) {
      const product = accrual.productType;
      if (!productBreakdown[product]) {
        productBreakdown[product] = {
          totalLitres: 0,
          totalMargin: 0,
          averageMarginRate: 0,
          daysWithSales: new Set(),
        };
      }

      productBreakdown[product].totalLitres += accrual.litresSold;
      productBreakdown[product].totalMargin += accrual.marginAmount;
      productBreakdown[product].daysWithSales.add(accrual.accrualDate.toDateString());
    }

    // Finalize product breakdown
    for (const product in productBreakdown) {
      const data = productBreakdown[product];
      data.averageMarginRate = data.totalLitres > 0 ? data.totalMargin / data.totalLitres : 0;
      data.daysWithSales = data.daysWithSales.size;
    }

    const totalDays = Math.ceil((windowDates.endDate.getTime() - windowDates.startDate.getTime()) / (24 * 60 * 60 * 1000));
    const accruedDays = new Set(accruals.map(a => a.accrualDate.toDateString())).size;

    return {
      windowId,
      stationId,
      periodStart: windowDates.startDate,
      periodEnd: windowDates.endDate,
      totalDays,
      accruedDays,
      totalLitresSold,
      totalMarginAccrued,
      averageMarginPerLitre,
      productBreakdown,
      dailyAccruals,
    };
  }

  /**
   * Adjust margin accrual (for corrections or adjustments)
   */
  async adjustMarginAccrual(
    accrualId: string,
    adjustmentAmount: number,
    adjustmentReason: string,
    tenantId: string,
    userId?: string,
  ): Promise<DealerMarginAccrual> {
    const accrual = await this.marginAccrualRepository.findOne({
      where: { id: accrualId, tenantId },
    });

    if (!accrual) {
      throw new NotFoundException('Margin accrual not found');
    }

    if (accrual.status === AccrualStatus.POSTED_TO_GL) {
      throw new BadRequestException('Cannot adjust accrual that has been posted to GL');
    }

    // Create adjustment record
    const adjustment = {
      type: 'manual_adjustment',
      amount: adjustmentAmount,
      reason: adjustmentReason,
      adjustedBy: userId,
      adjustedAt: new Date(),
    };

    // Update accrual
    accrual.marginAmount += adjustmentAmount;
    accrual.calculationDetails = {
      ...accrual.calculationDetails,
      adjustments: [...(accrual.calculationDetails?.adjustments || []), adjustment],
    };

    const savedAccrual = await this.marginAccrualRepository.save(accrual);

    // Emit adjustment event
    this.eventEmitter.emit('dealer.margin.adjusted', {
      accrualId,
      stationId: accrual.stationId,
      adjustmentAmount,
      newMarginAmount: accrual.marginAmount,
      adjustmentReason,
      tenantId,
    });

    return savedAccrual;
  }

  /**
   * Post margin accruals to general ledger
   */
  async postAccrualsToGL(
    stationId: string,
    windowId: string,
    tenantId: string,
    userId?: string,
  ): Promise<{
    postedCount: number;
    totalAmount: number;
    journalEntryId: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accruals = await this.marginAccrualRepository.find({
        where: {
          stationId,
          windowId,
          tenantId,
          status: AccrualStatus.ACCRUED,
        },
      });

      if (accruals.length === 0) {
        throw new NotFoundException('No accrued margins found to post');
      }

      const totalAmount = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
      const journalEntryId = uuidv4();

      // Update accrual statuses
      for (const accrual of accruals) {
        accrual.status = AccrualStatus.POSTED_TO_GL;
        accrual.journalEntryId = journalEntryId;
        accrual.glAccountCode = '4100'; // Revenue account for dealer margins
        accrual.costCenter = stationId;
      }

      await queryRunner.manager.save(accruals);
      await queryRunner.commitTransaction();

      // Emit GL posting event
      this.eventEmitter.emit('dealer.margin.posted.gl', {
        stationId,
        windowId,
        journalEntryId,
        totalAmount,
        accrualCount: accruals.length,
        tenantId,
      });

      // Emit accounting event for journal entry creation
      this.eventEmitter.emit('accounting.journal.create', {
        templateCode: 'DEALER_MARGIN_ACCRUAL',
        referenceId: journalEntryId,
        amount: totalAmount,
        description: `Dealer margin accrual - Station ${stationId} - Window ${windowId}`,
        stationId,
        windowId,
        tenantId,
        createdBy: userId,
      });

      this.logger.log(`Posted ${accruals.length} margin accruals to GL: Total GHS ${totalAmount.toFixed(2)}`);
      
      return {
        postedCount: accruals.length,
        totalAmount,
        journalEntryId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get margin accruals for a period
   */
  async getMarginAccruals(
    stationId: string,
    tenantId: string,
    options?: {
      fromDate?: Date;
      toDate?: Date;
      windowId?: string;
      productType?: string;
      status?: AccrualStatus;
      limit?: number;
    },
  ): Promise<DealerMarginAccrual[]> {
    const query = this.marginAccrualRepository.createQueryBuilder('accrual')
      .where('accrual.stationId = :stationId', { stationId })
      .andWhere('accrual.tenantId = :tenantId', { tenantId });

    if (options?.fromDate) {
      query.andWhere('accrual.accrualDate >= :fromDate', { fromDate: options.fromDate });
    }

    if (options?.toDate) {
      query.andWhere('accrual.accrualDate <= :toDate', { toDate: options.toDate });
    }

    if (options?.windowId) {
      query.andWhere('accrual.windowId = :windowId', { windowId: options.windowId });
    }

    if (options?.productType) {
      query.andWhere('accrual.productType = :productType', { productType: options.productType });
    }

    if (options?.status) {
      query.andWhere('accrual.status = :status', { status: options.status });
    }

    query.orderBy('accrual.accrualDate', 'DESC')
         .addOrderBy('accrual.productType', 'ASC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return query.getMany();
  }

  /**
   * Get margin accrual trends
   */
  async getMarginAccrualTrends(
    stationId: string,
    tenantId: string,
    periodDays: number = 30,
  ): Promise<{
    dailyTrends: Array<{
      date: string;
      totalLitres: number;
      totalMargin: number;
      marginPerLitre: number;
      productMix: Record<string, number>;
    }>;
    summary: {
      totalDays: number;
      averageDailyLitres: number;
      averageDailyMargin: number;
      averageMarginPerLitre: number;
      bestDay: { date: string; margin: number };
      worstDay: { date: string; margin: number };
    };
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - periodDays);

    const accruals = await this.marginAccrualRepository.find({
      where: {
        stationId,
        tenantId,
        accrualDate: Between(startDate, endDate),
        status: AccrualStatus.ACCRUED,
      },
      order: { accrualDate: 'ASC' },
    });

    // Group by date
    const dailyData = new Map<string, {
      totalLitres: number;
      totalMargin: number;
      productMix: Record<string, number>;
    }>();

    for (const accrual of accruals) {
      const dateKey = accrual.accrualDate.toISOString().split('T')[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          totalLitres: 0,
          totalMargin: 0,
          productMix: {},
        });
      }

      const dayData = dailyData.get(dateKey)!;
      dayData.totalLitres += accrual.litresSold;
      dayData.totalMargin += accrual.marginAmount;
      dayData.productMix[accrual.productType] = (dayData.productMix[accrual.productType] || 0) + accrual.litresSold;
    }

    // Convert to trends array
    const dailyTrends = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      totalLitres: data.totalLitres,
      totalMargin: data.totalMargin,
      marginPerLitre: data.totalLitres > 0 ? data.totalMargin / data.totalLitres : 0,
      productMix: data.productMix,
    }));

    // Calculate summary
    const totalDays = dailyTrends.length;
    const totalLitres = dailyTrends.reduce((sum, d) => sum + d.totalLitres, 0);
    const totalMargin = dailyTrends.reduce((sum, d) => sum + d.totalMargin, 0);

    const bestDay = dailyTrends.reduce((best, day) => 
      day.totalMargin > best.margin ? { date: day.date, margin: day.totalMargin } : best,
      { date: '', margin: 0 }
    );

    const worstDay = dailyTrends.reduce((worst, day) => 
      day.totalMargin < worst.margin || worst.margin === 0 ? { date: day.date, margin: day.totalMargin } : worst,
      { date: '', margin: Infinity }
    );

    return {
      dailyTrends,
      summary: {
        totalDays,
        averageDailyLitres: totalDays > 0 ? totalLitres / totalDays : 0,
        averageDailyMargin: totalDays > 0 ? totalMargin / totalDays : 0,
        averageMarginPerLitre: totalLitres > 0 ? totalMargin / totalLitres : 0,
        bestDay,
        worstDay: worstDay.margin === Infinity ? { date: '', margin: 0 } : worstDay,
      },
    };
  }

  // Private helper methods

  private groupTransactionsByProduct(transactions: TransactionData[]): Record<string, TransactionData[]> {
    return transactions.reduce((groups, transaction) => {
      const product = transaction.productType;
      if (!groups[product]) {
        groups[product] = [];
      }
      groups[product].push(transaction);
      return groups;
    }, {} as Record<string, TransactionData[]>);
  }

  private async getPricingWindowComponents(windowId: string): Promise<PricingWindowComponent[]> {
    // This would integrate with pricing service to get actual components
    // For now, return mock data
    return [
      {
        componentCode: 'DEAL',
        name: 'Dealer Margin',
        category: 'dealer_margin',
        unit: 'GHS_per_litre',
        rateValue: 0.35,
        productType: 'PMS',
        effectiveFrom: new Date(),
        effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        componentCode: 'DEAL',
        name: 'Dealer Margin',
        category: 'dealer_margin',
        unit: 'GHS_per_litre',
        rateValue: 0.30,
        productType: 'AGO',
        effectiveFrom: new Date(),
        effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        componentCode: 'DEAL',
        name: 'Dealer Margin',
        category: 'dealer_margin',
        unit: 'GHS_per_litre',
        rateValue: 0.40,
        productType: 'LPG',
        effectiveFrom: new Date(),
        effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  private extractPBUBreakdown(components: PricingWindowComponent[], productType: string): Record<string, number> {
    // Extract all PBU components for this product
    const breakdown: Record<string, number> = {};
    
    for (const component of components) {
      if (component.productType === productType) {
        breakdown[component.componentCode] = component.rateValue;
      }
    }

    return breakdown;
  }

  private async getPricingWindowDates(windowId: string): Promise<{ startDate: Date; endDate: Date } | null> {
    // This would integrate with pricing service to get actual window dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const endDate = new Date();
    
    return { startDate, endDate };
  }

  private groupAccrualsByDate(accruals: DealerMarginAccrual[]): MarginAccrualSummary[] {
    const dailyGroups = new Map<string, DealerMarginAccrual[]>();

    for (const accrual of accruals) {
      const dateKey = accrual.accrualDate.toISOString().split('T')[0];
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      dailyGroups.get(dateKey)!.push(accrual);
    }

    return Array.from(dailyGroups.entries()).map(([dateStr, dayAccruals]) => {
      const totalLitresSold = dayAccruals.reduce((sum, a) => sum + a.litresSold, 0);
      const grossMarginEarned = dayAccruals.reduce((sum, a) => sum + a.marginAmount, 0);
      
      const productBreakdown: Record<string, any> = {};
      for (const accrual of dayAccruals) {
        productBreakdown[accrual.productType] = {
          litres: accrual.litresSold,
          marginRate: accrual.marginRate,
          marginAmount: accrual.marginAmount,
          exPumpPrice: accrual.exPumpPrice,
        };
      }

      return {
        stationId: dayAccruals[0].stationId,
        accrualDate: dayAccruals[0].accrualDate,
        windowId: dayAccruals[0].windowId,
        totalLitresSold,
        grossMarginEarned,
        productBreakdown,
        accrualStatus: dayAccruals[0].status,
        createdAt: dayAccruals[0].createdAt,
      };
    });
  }

  /**
   * Scheduled task to process daily margin accruals automatically
   */
  @Cron('0 3 * * *') // Daily at 3 AM (after daily sales are finalized)
  async processAutomatedDailyAccruals(): Promise<void> {
    this.logger.log('Starting automated daily margin accrual processing');
    
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // This would get sales data from transaction service
      const salesData = await this.getDailySalesData(yesterday);
      
      if (salesData.length === 0) {
        this.logger.log('No sales data found for automated accrual processing');
        return;
      }

      // Group sales data by station
      const stationGroups = new Map<string, any[]>();
      for (const sale of salesData) {
        if (!stationGroups.has(sale.stationId)) {
          stationGroups.set(sale.stationId, []);
        }
        stationGroups.get(sale.stationId)!.push(sale);
      }

      let processedCount = 0;
      let errorCount = 0;

      // Process accruals for each station
      for (const [stationId, stationSales] of stationGroups) {
        try {
          const accrualDto: DailyMarginAccrualDto = {
            stationId,
            dealerId: stationId, // Assuming stationId maps to dealerId
            accrualDate: yesterday,
            transactions: stationSales.map(sale => ({
              transactionId: sale.id,
              stationId: sale.stationId,
              productType: sale.productType,
              litresSold: sale.litres,
              exPumpPrice: sale.price,
              transactionDate: sale.date,
              windowId: sale.windowId,
            })),
            windowId: stationSales[0].windowId,
            tenantId: stationSales[0].tenantId,
            processedBy: 'system',
          };

          await this.processDailyMarginAccrual(accrualDto);
          processedCount++;
          
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to process automated accrual for station ${stationId}:`, error);
        }
      }

      this.eventEmitter.emit('dealer.margin.automated.completed', {
        processedDate: yesterday,
        stationsProcessed: processedCount,
        errors: errorCount,
        completedAt: new Date(),
      });

      this.logger.log(`Automated accrual processing completed: ${processedCount} stations processed, ${errorCount} errors`);
      
    } catch (error) {
      this.logger.error('Failed to process automated daily accruals:', error);
    }
  }

  private async getDailySalesData(date: Date): Promise<any[]> {
    // This would integrate with transaction service to get actual sales data
    // For now, return empty array
    return [];
  }
}