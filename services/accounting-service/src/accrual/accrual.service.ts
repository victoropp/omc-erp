import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between, LessThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, addDays, addMonths, addYears, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';

import { Accrual, AccrualType, AccrualStatus, AccrualFrequency, AccrualBasis } from './entities/accrual.entity';
import { AccrualJournalEntry, JournalEntryType, JournalEntryStatus } from './entities/accrual-journal-entry.entity';

export interface AccrualData {
  tenantId: string;
  description: string;
  accrualType: AccrualType;
  accrualAmount: number;
  accrualDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  debitAccount: string;
  creditAccount: string;
  costCenter?: string;
  department?: string;
  projectId?: string;
  autoReverse?: boolean;
  createdBy: string;
}

export interface RecurringAccrualData extends AccrualData {
  isRecurring: true;
  accrualFrequency: AccrualFrequency;
  accrualBasis: AccrualBasis;
  totalOccurrences?: number;
  recurringUntilDate?: Date;
  baseAmount?: number;
  accrualRate?: number;
}

export interface AccrualSummary {
  tenantId: string;
  totalActiveAccruals: number;
  totalAccrualAmount: number;
  pendingReversals: number;
  overdueSettlements: number;
  monthlyAccrualTrend: Array<{
    period: string;
    accrualAmount: number;
    reversalAmount: number;
    netAccrual: number;
  }>;
}

export interface AccrualAnalytics {
  accuracyMetrics: {
    averageVariance: number;
    accuracyScore: number;
    totalVarianceAmount: number;
  };
  typeBreakdown: Array<{
    accrualType: AccrualType;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }>;
  agingAnalysis: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90Days: number;
  };
}

@Injectable()
export class AccrualService {
  private readonly logger = new Logger(AccrualService.name);

  constructor(
    @InjectRepository(Accrual)
    private accrualRepo: Repository<Accrual>,
    @InjectRepository(AccrualJournalEntry)
    private journalEntryRepo: Repository<AccrualJournalEntry>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== ACCRUAL MANAGEMENT =====

  async createAccrual(data: AccrualData | RecurringAccrualData): Promise<Accrual> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate accrual number
      const accrualNumber = await this.generateAccrualNumber(queryRunner, data.accrualDate);

      // Validate accounts exist
      await this.validateAccounts(data.debitAccount, data.creditAccount);

      // Create accrual
      const accrualData: any = {
        ...data,
        accrualNumber,
        outstandingBalance: data.accrualAmount,
        status: AccrualStatus.PENDING_APPROVAL,
        ifrsClassification: this.determineIFRSClassification(data.accrualType),
        currentVsNoncurrent: this.determineCurrentClassification(data.accrualType, data.periodEndDate),
        taxDeductible: this.determineTaxDeductibility(data.accrualType),
      };

      // Set auto-reversal settings
      if (data.autoReverse) {
        accrualData.autoReverse = true;
        accrualData.autoReverseDate = this.calculateAutoReverseDate(data.accrualDate, data.accrualType);
        accrualData.autoReversePeriod = 'NEXT_MONTH';
      }

      // Handle recurring accruals
      if ('isRecurring' in data && data.isRecurring) {
        accrualData.isRecurring = true;
        accrualData.accrualFrequency = data.accrualFrequency;
        accrualData.accrualBasis = data.accrualBasis;
        accrualData.nextAccrualDate = this.calculateNextAccrualDate(data.accrualDate, data.accrualFrequency);
        accrualData.totalOccurrences = data.totalOccurrences;
        accrualData.recurringUntilDate = data.recurringUntilDate;
        accrualData.baseAmount = data.baseAmount;
        accrualData.accrualRate = data.accrualRate;
      }

      const accrual = this.accrualRepo.create(accrualData);
      const savedAccrual = await queryRunner.manager.save(accrual);

      await queryRunner.commitTransaction();

      // Emit accrual created event
      this.eventEmitter.emit('accrual.created', {
        accrualId: savedAccrual.id,
        accrualNumber: savedAccrual.accrualNumber,
        accrualType: data.accrualType,
        amount: data.accrualAmount,
        tenantId: data.tenantId,
      });

      this.logger.log(`Accrual created: ${accrualNumber}, Type: ${data.accrualType}, Amount: GHS ${data.accrualAmount}`);
      return savedAccrual;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approveAccrual(
    accrualId: string,
    approvedBy: string,
    approvalComments?: string
  ): Promise<Accrual> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accrual = await this.accrualRepo.findOne({ where: { id: accrualId } });
      if (!accrual) {
        throw new NotFoundException('Accrual not found');
      }

      if (accrual.status !== AccrualStatus.PENDING_APPROVAL) {
        throw new BadRequestException('Accrual is not pending approval');
      }

      // Update accrual status
      accrual.status = AccrualStatus.ACTIVE;
      accrual.approvedBy = approvedBy;
      accrual.approvalDate = new Date();
      accrual.approvalComments = approvalComments;

      const updatedAccrual = await queryRunner.manager.save(accrual);

      // Create initial journal entry
      await this.createAccrualJournalEntry(queryRunner, updatedAccrual, JournalEntryType.ACCRUAL_ENTRY);

      await queryRunner.commitTransaction();

      // Emit approval event
      this.eventEmitter.emit('accrual.approved', {
        accrualId,
        approvedBy,
        accrualType: accrual.accrualType,
        amount: accrual.accrualAmount,
      });

      this.logger.log(`Accrual approved: ${accrual.accrualNumber} by ${approvedBy}`);
      return updatedAccrual;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reverseAccrual(
    accrualId: string,
    reversalAmount: number,
    reversalReason: string,
    reversedBy: string
  ): Promise<Accrual> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accrual = await this.accrualRepo.findOne({ where: { id: accrualId } });
      if (!accrual) {
        throw new NotFoundException('Accrual not found');
      }

      if (accrual.status !== AccrualStatus.ACTIVE) {
        throw new BadRequestException('Only active accruals can be reversed');
      }

      if (reversalAmount > accrual.outstandingBalance) {
        throw new BadRequestException('Reversal amount cannot exceed outstanding balance');
      }

      // Update accrual amounts
      const newReversedAmount = accrual.reversedAmount + reversalAmount;
      const newOutstandingBalance = accrual.outstandingBalance - reversalAmount;
      
      const newStatus = newOutstandingBalance <= 0.01 ? AccrualStatus.REVERSED : AccrualStatus.PARTIALLY_REVERSED;

      await queryRunner.manager.update(
        Accrual,
        { id: accrualId },
        {
          reversedAmount: newReversedAmount,
          outstandingBalance: newOutstandingBalance,
          status: newStatus,
          reversalDate: new Date(),
          reversed: newOutstandingBalance <= 0.01,
          updatedAt: new Date(),
        }
      );

      // Create reversal journal entry
      const reversalJournalEntry = await this.createReversalJournalEntry(
        queryRunner,
        accrual,
        reversalAmount,
        reversalReason,
        reversedBy
      );

      await queryRunner.commitTransaction();

      // Emit reversal event
      this.eventEmitter.emit('accrual.reversed', {
        accrualId,
        reversalAmount,
        remainingBalance: newOutstandingBalance,
        reversedBy,
      });

      this.logger.log(`Accrual reversed: ${accrual.accrualNumber}, Amount: GHS ${reversalAmount}`);
      
      const updatedAccrual = await this.accrualRepo.findOne({ where: { id: accrualId } });
      return updatedAccrual!;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async settleAccrual(
    accrualId: string,
    settlementAmount: number,
    actualSettlementDate: Date,
    settledBy: string,
    settlementNotes?: string
  ): Promise<Accrual> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accrual = await this.accrualRepo.findOne({ where: { id: accrualId } });
      if (!accrual) {
        throw new NotFoundException('Accrual not found');
      }

      const newSettledAmount = accrual.settledAmount + settlementAmount;
      const newOutstandingBalance = Math.max(0, accrual.outstandingBalance - settlementAmount);
      
      // Calculate accuracy metrics
      const variance = Math.abs(accrual.accrualAmount - newSettledAmount);
      const accuracyScore = Math.max(0, 100 - ((variance / accrual.accrualAmount) * 100));
      const variancePercentage = (variance / accrual.accrualAmount) * 100;

      await queryRunner.manager.update(
        Accrual,
        { id: accrualId },
        {
          settledAmount: newSettledAmount,
          outstandingBalance: newOutstandingBalance,
          actualSettlementDate,
          status: newOutstandingBalance <= 0.01 ? AccrualStatus.SETTLED : accrual.status,
          accuracyScore,
          variancePercentage,
          settlementNotes,
          updatedAt: new Date(),
        }
      );

      // Create settlement journal entry
      await this.createSettlementJournalEntry(
        queryRunner,
        accrual,
        settlementAmount,
        actualSettlementDate,
        settledBy
      );

      await queryRunner.commitTransaction();

      // Emit settlement event
      this.eventEmitter.emit('accrual.settled', {
        accrualId,
        settlementAmount,
        accuracyScore,
        variancePercentage,
      });

      this.logger.log(`Accrual settled: ${accrual.accrualNumber}, Amount: GHS ${settlementAmount}, Accuracy: ${accuracyScore.toFixed(2)}%`);
      
      const updatedAccrual = await this.accrualRepo.findOne({ where: { id: accrualId } });
      return updatedAccrual!;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== QUERY AND REPORTING =====

  async getAccruals(
    tenantId: string,
    status?: AccrualStatus,
    accrualType?: AccrualType,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Accrual[]> {
    const query = this.accrualRepo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .orderBy('a.accrualDate', 'DESC');

    if (status) {
      query.andWhere('a.status = :status', { status });
    }

    if (accrualType) {
      query.andWhere('a.accrualType = :accrualType', { accrualType });
    }

    if (fromDate && toDate) {
      query.andWhere('a.accrualDate BETWEEN :fromDate AND :toDate', { fromDate, toDate });
    }

    return query.getMany();
  }

  async getAccrualSummary(tenantId: string): Promise<AccrualSummary> {
    const activeAccruals = await this.accrualRepo.count({
      where: {
        tenantId,
        status: AccrualStatus.ACTIVE,
      }
    });

    const totalAccrualResult = await this.accrualRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.outstanding_balance), 0)', 'total')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.status = :status', { status: AccrualStatus.ACTIVE })
      .getRawOne();

    const pendingReversals = await this.accrualRepo.count({
      where: {
        tenantId,
        autoReverse: true,
        autoReverseDate: LessThanOrEqual(new Date()),
        reversed: false,
      }
    });

    const overdueSettlements = await this.accrualRepo.count({
      where: {
        tenantId,
        expectedSettlementDate: LessThanOrEqual(new Date()),
        status: AccrualStatus.ACTIVE,
      }
    });

    // Get monthly trend (last 12 months)
    const monthlyTrend = await this.getMonthlyAccrualTrend(tenantId);

    return {
      tenantId,
      totalActiveAccruals: activeAccruals,
      totalAccrualAmount: parseFloat(totalAccrualResult.total || 0),
      pendingReversals,
      overdueSettlements,
      monthlyAccrualTrend: monthlyTrend,
    };
  }

  async getAccrualAnalytics(tenantId: string): Promise<AccrualAnalytics> {
    // Get accuracy metrics
    const accuracyResult = await this.accrualRepo
      .createQueryBuilder('a')
      .select([
        'AVG(a.variance_percentage) as avg_variance',
        'AVG(a.accuracy_score) as avg_accuracy',
        'SUM(ABS(a.accrual_amount - a.settled_amount)) as total_variance'
      ])
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.status = :status', { status: AccrualStatus.SETTLED })
      .getRawOne();

    // Get type breakdown
    const typeBreakdown = await this.accrualRepo
      .createQueryBuilder('a')
      .select([
        'a.accrual_type as accrual_type',
        'COUNT(*) as count',
        'SUM(a.accrual_amount) as total_amount',
        'AVG(a.accrual_amount) as average_amount'
      ])
      .where('a.tenant_id = :tenantId', { tenantId })
      .groupBy('a.accrual_type')
      .getRawMany();

    // Get aging analysis
    const currentDate = new Date();
    const agingAnalysis = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90Days: 0,
    };

    const agingData = await this.accrualRepo.find({
      where: {
        tenantId,
        status: AccrualStatus.ACTIVE,
      }
    });

    agingData.forEach(accrual => {
      const daysDiff = Math.floor((currentDate.getTime() - accrual.accrualDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 30) agingAnalysis.current += accrual.outstandingBalance;
      else if (daysDiff <= 60) agingAnalysis.days30 += accrual.outstandingBalance;
      else if (daysDiff <= 90) agingAnalysis.days60 += accrual.outstandingBalance;
      else if (daysDiff <= 120) agingAnalysis.days90 += accrual.outstandingBalance;
      else agingAnalysis.over90Days += accrual.outstandingBalance;
    });

    return {
      accuracyMetrics: {
        averageVariance: parseFloat(accuracyResult.avg_variance || 0),
        accuracyScore: parseFloat(accuracyResult.avg_accuracy || 0),
        totalVarianceAmount: parseFloat(accuracyResult.total_variance || 0),
      },
      typeBreakdown: typeBreakdown.map(row => ({
        accrualType: row.accrual_type as AccrualType,
        count: parseInt(row.count),
        totalAmount: parseFloat(row.total_amount || 0),
        averageAmount: parseFloat(row.average_amount || 0),
      })),
      agingAnalysis,
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyAccrualProcesses(): Promise<void> {
    this.logger.log('Starting daily accrual processes');

    try {
      // Process auto-reversals
      await this.processAutoReversals();

      // Generate recurring accruals
      await this.processRecurringAccruals();

      // Check overdue settlements
      await this.checkOverdueSettlements();

      // Send expiry notifications
      await this.sendExpiryNotifications();

      this.logger.log('Daily accrual processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily accrual processes:', error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyAccrualProcesses(): Promise<void> {
    this.logger.log('Starting monthly accrual processes');

    try {
      // Generate monthly accrual reports
      await this.generateMonthlyAccrualReports();

      // Perform accuracy analysis
      await this.performAccuracyAnalysis();

      // Update accrual patterns
      await this.updateAccrualPatterns();

      // Review and update thresholds
      await this.reviewAccrualThresholds();

      this.logger.log('Monthly accrual processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly accrual processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private determineIFRSClassification(accrualType: AccrualType): string {
    const liabilityTypes = [
      AccrualType.EXPENSE_ACCRUAL,
      AccrualType.SALARY_ACCRUAL,
      AccrualType.UTILITY_ACCRUAL,
      AccrualType.TAX_ACCRUAL,
      AccrualType.BONUS_ACCRUAL,
      AccrualType.COMMISSION_ACCRUAL,
      AccrualType.WARRANTY_ACCRUAL,
    ];

    const assetTypes = [
      AccrualType.REVENUE_ACCRUAL,
      AccrualType.INTEREST_ACCRUAL,
    ];

    if (liabilityTypes.includes(accrualType)) return 'LIABILITY';
    if (assetTypes.includes(accrualType)) return 'ASSET';
    return 'EXPENSE';
  }

  private determineCurrentClassification(accrualType: AccrualType, periodEndDate: Date): string {
    const oneYearFromNow = addYears(new Date(), 1);
    return periodEndDate <= oneYearFromNow ? 'CURRENT' : 'NON_CURRENT';
  }

  private determineTaxDeductibility(accrualType: AccrualType): boolean {
    const nonDeductibleTypes = [AccrualType.PROVISION_ACCRUAL];
    return !nonDeductibleTypes.includes(accrualType);
  }

  private calculateAutoReverseDate(accrualDate: Date, accrualType: AccrualType): Date {
    // Most accruals reverse in the next month
    return addMonths(accrualDate, 1);
  }

  private calculateNextAccrualDate(currentDate: Date, frequency: AccrualFrequency): Date {
    switch (frequency) {
      case AccrualFrequency.DAILY:
        return addDays(currentDate, 1);
      case AccrualFrequency.WEEKLY:
        return addDays(currentDate, 7);
      case AccrualFrequency.MONTHLY:
        return addMonths(currentDate, 1);
      case AccrualFrequency.QUARTERLY:
        return addMonths(currentDate, 3);
      case AccrualFrequency.ANNUALLY:
        return addYears(currentDate, 1);
      default:
        return currentDate;
    }
  }

  private async generateAccrualNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM accruals WHERE accrual_number LIKE $1`,
      [`ACC-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `ACC-${yearMonth}-${sequence}`;
  }

  private async getMonthlyAccrualTrend(tenantId: string): Promise<any[]> {
    // Get last 12 months of data
    const endDate = new Date();
    const startDate = addMonths(endDate, -11);
    
    const monthlyData = await this.dataSource.query(`
      WITH RECURSIVE months AS (
        SELECT DATE_TRUNC('month', $2::date) AS month
        UNION ALL
        SELECT month + INTERVAL '1 month'
        FROM months
        WHERE month < DATE_TRUNC('month', $3::date)
      )
      SELECT 
        TO_CHAR(months.month, 'YYYY-MM') as period,
        COALESCE(SUM(CASE WHEN a.accrual_date >= months.month AND a.accrual_date < months.month + INTERVAL '1 month' THEN a.accrual_amount ELSE 0 END), 0) as accrual_amount,
        COALESCE(SUM(CASE WHEN a.reversal_date >= months.month AND a.reversal_date < months.month + INTERVAL '1 month' THEN a.reversed_amount ELSE 0 END), 0) as reversal_amount
      FROM months
      LEFT JOIN accruals a ON a.tenant_id = $1
      GROUP BY months.month
      ORDER BY months.month
    `, [tenantId, startDate, endDate]);

    return monthlyData.map((row: any) => ({
      period: row.period,
      accrualAmount: parseFloat(row.accrual_amount || 0),
      reversalAmount: parseFloat(row.reversal_amount || 0),
      netAccrual: parseFloat(row.accrual_amount || 0) - parseFloat(row.reversal_amount || 0),
    }));
  }

  // Placeholder methods for complex processes
  private async validateAccounts(debitAccount: string, creditAccount: string): Promise<void> {}
  private async createAccrualJournalEntry(queryRunner: QueryRunner, accrual: Accrual, entryType: JournalEntryType): Promise<AccrualJournalEntry> { return {} as AccrualJournalEntry; }
  private async createReversalJournalEntry(queryRunner: QueryRunner, accrual: Accrual, amount: number, reason: string, reversedBy: string): Promise<AccrualJournalEntry> { return {} as AccrualJournalEntry; }
  private async createSettlementJournalEntry(queryRunner: QueryRunner, accrual: Accrual, amount: number, date: Date, settledBy: string): Promise<AccrualJournalEntry> { return {} as AccrualJournalEntry; }
  private async processAutoReversals(): Promise<void> {}
  private async processRecurringAccruals(): Promise<void> {}
  private async checkOverdueSettlements(): Promise<void> {}
  private async sendExpiryNotifications(): Promise<void> {}
  private async generateMonthlyAccrualReports(): Promise<void> {}
  private async performAccuracyAnalysis(): Promise<void> {}
  private async updateAccrualPatterns(): Promise<void> {}
  private async reviewAccrualThresholds(): Promise<void> {}
}