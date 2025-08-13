import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between, LessThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, addDays, addMonths, addYears, differenceInDays, differenceInMonths, isBefore, startOfMonth, endOfMonth } from 'date-fns';

import { Prepayment, PrepaymentType, PrepaymentStatus, AmortizationMethod } from './entities/prepayment.entity';
import { PrepaymentAmortization, AmortizationStatus } from './entities/prepayment-amortization.entity';

export interface PrepaymentData {
  tenantId: string;
  description: string;
  prepaymentType: PrepaymentType;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  paymentDate: Date;
  prepaymentAccount: string;
  expenseAccount: string;
  vendorId?: string;
  contractNumber?: string;
  createdBy: string;
}

export interface PrepaymentSummary {
  tenantId: string;
  totalPrepayments: number;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  monthlyAmortization: number;
  upcomingExpirations: Array<{
    id: string;
    description: string;
    endDate: Date;
    remainingBalance: number;
  }>;
}

export interface AmortizationSchedule {
  prepaymentId: string;
  totalPeriods: number;
  amountPerPeriod: number;
  schedule: Array<{
    periodNumber: number;
    amortizationDate: Date;
    periodStartDate: Date;
    periodEndDate: Date;
    scheduledAmount: number;
    remainingBalance: number;
  }>;
}

@Injectable()
export class PrepaymentService {
  private readonly logger = new Logger(PrepaymentService.name);

  constructor(
    @InjectRepository(Prepayment)
    private prepaymentRepo: Repository<Prepayment>,
    @InjectRepository(PrepaymentAmortization)
    private amortizationRepo: Repository<PrepaymentAmortization>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== PREPAYMENT MANAGEMENT =====

  async createPrepayment(data: PrepaymentData): Promise<Prepayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate prepayment number
      const prepaymentNumber = await this.generatePrepaymentNumber(queryRunner, data.paymentDate);

      // Calculate amortization details
      const amortizationDetails = this.calculateAmortizationDetails(
        data.startDate,
        data.endDate,
        data.totalAmount
      );

      // Create prepayment
      const prepayment = this.prepaymentRepo.create({
        ...data,
        prepaymentNumber,
        remainingBalance: data.totalAmount,
        amortizedAmount: 0,
        totalPeriods: amortizationDetails.totalPeriods,
        amountPerPeriod: amortizationDetails.amountPerPeriod,
        nextAmortizationDate: amortizationDetails.firstAmortizationDate,
        amortizationFrequency: 'MONTHLY',
        amortizationMethod: AmortizationMethod.STRAIGHT_LINE,
        status: PrepaymentStatus.PENDING_APPROVAL,
        autoAmortize: true,
        ifrsClassification: this.determineIFRSClassification(data.startDate, data.endDate),
        taxDeductible: this.determineTaxDeductibility(data.prepaymentType),
      });

      const savedPrepayment = await queryRunner.manager.save(prepayment);

      // Generate amortization schedule
      await this.generateAmortizationSchedule(queryRunner, savedPrepayment);

      // Create initial GL entry for prepayment recognition
      await this.createPrepaymentGLEntry(queryRunner, savedPrepayment);

      await queryRunner.commitTransaction();

      // Emit prepayment created event
      this.eventEmitter.emit('prepayment.created', {
        prepaymentId: savedPrepayment.id,
        prepaymentNumber: savedPrepayment.prepaymentNumber,
        totalAmount: data.totalAmount,
        tenantId: data.tenantId,
      });

      this.logger.log(`Prepayment created: ${prepaymentNumber}, Amount: GHS ${data.totalAmount}`);
      return savedPrepayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approvePrepayment(
    prepaymentId: string,
    approvedBy: string,
    approvalComments?: string
  ): Promise<Prepayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prepayment = await this.prepaymentRepo.findOne({ where: { id: prepaymentId } });
      if (!prepayment) {
        throw new NotFoundException('Prepayment not found');
      }

      if (prepayment.status !== PrepaymentStatus.PENDING_APPROVAL) {
        throw new BadRequestException('Prepayment is not pending approval');
      }

      // Update prepayment status
      prepayment.status = PrepaymentStatus.ACTIVE;
      prepayment.approvedBy = approvedBy;
      prepayment.approvalDate = new Date();
      prepayment.approvalComments = approvalComments;

      const updatedPrepayment = await queryRunner.manager.save(prepayment);

      // Activate amortization schedule
      await this.activateAmortizationSchedule(queryRunner, prepaymentId);

      await queryRunner.commitTransaction();

      // Emit approval event
      this.eventEmitter.emit('prepayment.approved', {
        prepaymentId,
        approvedBy,
        totalAmount: prepayment.totalAmount,
      });

      this.logger.log(`Prepayment approved: ${prepayment.prepaymentNumber} by ${approvedBy}`);
      return updatedPrepayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPrepayments(
    tenantId: string,
    status?: PrepaymentStatus,
    prepaymentType?: PrepaymentType,
    activeOnly: boolean = false
  ): Promise<Prepayment[]> {
    const query = this.prepaymentRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .orderBy('p.createdAt', 'DESC');

    if (status) {
      query.andWhere('p.status = :status', { status });
    }

    if (prepaymentType) {
      query.andWhere('p.prepaymentType = :prepaymentType', { prepaymentType });
    }

    if (activeOnly) {
      query.andWhere('p.status = :activeStatus', { activeStatus: PrepaymentStatus.ACTIVE });
      query.andWhere('p.remainingBalance > 0');
    }

    return query.getMany();
  }

  // ===== AMORTIZATION PROCESSING =====

  async processAmortization(
    amortizationId: string,
    processedBy: string,
    actualAmount?: number
  ): Promise<PrepaymentAmortization> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amortization = await this.amortizationRepo.findOne({
        where: { id: amortizationId },
        relations: ['prepayment']
      });

      if (!amortization) {
        throw new NotFoundException('Amortization entry not found');
      }

      if (amortization.status !== AmortizationStatus.SCHEDULED) {
        throw new BadRequestException('Amortization entry is not scheduled');
      }

      const finalAmount = actualAmount || amortization.scheduledAmount;

      // Update amortization entry
      amortization.status = AmortizationStatus.PROCESSED;
      amortization.actualAmount = finalAmount;
      amortization.processedDate = new Date();
      amortization.processedBy = processedBy;

      const savedAmortization = await queryRunner.manager.save(amortization);

      // Update prepayment balances
      const newAmortizedAmount = amortization.prepayment.amortizedAmount + finalAmount;
      const newRemainingBalance = amortization.prepayment.totalAmount - newAmortizedAmount;
      const newPeriodsCompleted = amortization.prepayment.periodsCompleted + 1;

      await queryRunner.manager.update(
        Prepayment,
        { id: amortization.prepaymentId },
        {
          amortizedAmount: newAmortizedAmount,
          remainingBalance: newRemainingBalance,
          periodsCompleted: newPeriodsCompleted,
          lastAmortizationDate: new Date(),
          nextAmortizationDate: this.calculateNextAmortizationDate(amortization.amortizationDate),
          status: newRemainingBalance <= 0.01 ? PrepaymentStatus.FULLY_AMORTIZED : PrepaymentStatus.ACTIVE,
          updatedAt: new Date(),
        }
      );

      // Create GL journal entry for amortization
      await this.createAmortizationGLEntry(queryRunner, savedAmortization);

      await queryRunner.commitTransaction();

      // Emit amortization processed event
      this.eventEmitter.emit('prepayment.amortized', {
        amortizationId: savedAmortization.id,
        prepaymentId: amortization.prepaymentId,
        amount: finalAmount,
        remainingBalance: newRemainingBalance,
      });

      this.logger.log(`Amortization processed: ${amortization.amortizationNumber}, Amount: GHS ${finalAmount}`);
      return savedAmortization;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAmortizationSchedule(prepaymentId: string): Promise<AmortizationSchedule> {
    const prepayment = await this.prepaymentRepo.findOne({ where: { id: prepaymentId } });
    if (!prepayment) {
      throw new NotFoundException('Prepayment not found');
    }

    const amortizations = await this.amortizationRepo.find({
      where: { prepaymentId },
      order: { periodNumber: 'ASC' }
    });

    const schedule = amortizations.map(amt => ({
      periodNumber: amt.periodNumber,
      amortizationDate: amt.amortizationDate,
      periodStartDate: amt.periodStartDate,
      periodEndDate: amt.periodEndDate,
      scheduledAmount: amt.scheduledAmount,
      remainingBalance: amt.remainingBalance,
    }));

    return {
      prepaymentId,
      totalPeriods: prepayment.totalPeriods,
      amountPerPeriod: prepayment.amountPerPeriod,
      schedule,
    };
  }

  // ===== USAGE-BASED AMORTIZATION =====

  async recordUsage(
    prepaymentId: string,
    usageUnits: number,
    usagePeriod: Date,
    recordedBy: string
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prepayment = await this.prepaymentRepo.findOne({ where: { id: prepaymentId } });
      if (!prepayment) {
        throw new NotFoundException('Prepayment not found');
      }

      if (prepayment.amortizationMethod !== AmortizationMethod.USAGE_BASED) {
        throw new BadRequestException('Prepayment is not configured for usage-based amortization');
      }

      // Update used units
      const newUsedUnits = prepayment.usedUnits + usageUnits;
      const utilizationPercentage = prepayment.totalUsageUnits ? 
        (newUsedUnits / prepayment.totalUsageUnits) * 100 : 0;

      // Calculate amortization amount based on usage
      const amortizationAmount = usageUnits * (prepayment.costPerUnit || 0);

      await queryRunner.manager.update(
        Prepayment,
        { id: prepaymentId },
        {
          usedUnits: newUsedUnits,
          utilizationPercentage,
          updatedAt: new Date(),
        }
      );

      // Create usage-based amortization entry if amount > 0
      if (amortizationAmount > 0) {
        await this.createUsageBasedAmortization(
          queryRunner,
          prepayment,
          usageUnits,
          amortizationAmount,
          usagePeriod,
          recordedBy
        );
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Usage recorded for prepayment ${prepayment.prepaymentNumber}: ${usageUnits} units`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== REPORTING AND ANALYTICS =====

  async getPrepaymentSummary(tenantId: string): Promise<PrepaymentSummary> {
    const allPrepayments = await this.prepaymentRepo.find({
      where: {
        tenantId,
        status: PrepaymentStatus.ACTIVE,
      }
    });

    const currentDate = new Date();
    const oneYearFromNow = addYears(currentDate, 1);

    const totalPrepayments = allPrepayments.length;
    const totalValue = allPrepayments.reduce((sum, p) => sum + p.remainingBalance, 0);

    // Classify as current vs non-current assets (IFRS)
    const currentAssets = allPrepayments
      .filter(p => p.endDate <= oneYearFromNow)
      .reduce((sum, p) => sum + p.remainingBalance, 0);

    const nonCurrentAssets = totalValue - currentAssets;

    // Calculate monthly amortization
    const monthlyAmortization = await this.calculateMonthlyAmortization(tenantId);

    // Get upcoming expirations (next 90 days)
    const upcomingExpirations = allPrepayments
      .filter(p => p.endDate <= addDays(currentDate, 90))
      .map(p => ({
        id: p.id,
        description: p.description,
        endDate: p.endDate,
        remainingBalance: p.remainingBalance,
      }));

    return {
      tenantId,
      totalPrepayments,
      totalCurrentAssets: currentAssets,
      totalNonCurrentAssets: nonCurrentAssets,
      monthlyAmortization,
      upcomingExpirations,
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyPrepaymentProcesses(): Promise<void> {
    this.logger.log('Starting daily prepayment processes');

    try {
      // Process due amortizations
      await this.processDueAmortizations();

      // Check for expiring prepayments
      await this.checkExpiringPrepayments();

      // Calculate utilization metrics
      await this.calculateUtilizationMetrics();

      this.logger.log('Daily prepayment processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily prepayment processes:', error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyPrepaymentProcesses(): Promise<void> {
    this.logger.log('Starting monthly prepayment processes');

    try {
      // Generate monthly amortization reports
      await this.generateMonthlyAmortizationReports();

      // Perform impairment testing
      await this.performImpairmentTesting();

      // Update ROI calculations
      await this.updateROICalculations();

      this.logger.log('Monthly prepayment processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly prepayment processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private calculateAmortizationDetails(startDate: Date, endDate: Date, totalAmount: number) {
    const totalDays = differenceInDays(endDate, startDate);
    const totalMonths = differenceInMonths(endDate, startDate) || 1;
    
    // Default to monthly amortization
    const totalPeriods = totalMonths;
    const amountPerPeriod = totalAmount / totalPeriods;
    const firstAmortizationDate = addMonths(startDate, 1);

    return {
      totalPeriods,
      amountPerPeriod,
      firstAmortizationDate,
    };
  }

  private determineIFRSClassification(startDate: Date, endDate: Date): string {
    const oneYearFromNow = addYears(new Date(), 1);
    return endDate <= oneYearFromNow ? 'CURRENT_ASSET' : 'NON_CURRENT_ASSET';
  }

  private determineTaxDeductibility(prepaymentType: PrepaymentType): boolean {
    // Ghana tax rules - most prepayments are deductible when amortized
    const nonDeductibleTypes = [PrepaymentType.BOND_PREMIUM];
    return !nonDeductibleTypes.includes(prepaymentType);
  }

  private calculateNextAmortizationDate(currentDate: Date): Date {
    return addMonths(currentDate, 1);
  }

  private async generatePrepaymentNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM prepayments WHERE prepayment_number LIKE $1`,
      [`PP-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `PP-${yearMonth}-${sequence}`;
  }

  private async calculateMonthlyAmortization(tenantId: string): Promise<number> {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const result = await this.amortizationRepo
      .createQueryBuilder('pa')
      .select('COALESCE(SUM(pa.scheduled_amount), 0)', 'total')
      .where('pa.tenant_id = :tenantId', { tenantId })
      .andWhere('pa.amortization_date BETWEEN :monthStart AND :monthEnd', { monthStart, monthEnd })
      .andWhere('pa.status = :status', { status: AmortizationStatus.SCHEDULED })
      .getRawOne();

    return parseFloat(result.total || 0);
  }

  // Placeholder methods for complex processes
  private async generateAmortizationSchedule(queryRunner: QueryRunner, prepayment: Prepayment): Promise<void> {}
  private async createPrepaymentGLEntry(queryRunner: QueryRunner, prepayment: Prepayment): Promise<void> {}
  private async activateAmortizationSchedule(queryRunner: QueryRunner, prepaymentId: string): Promise<void> {}
  private async createAmortizationGLEntry(queryRunner: QueryRunner, amortization: PrepaymentAmortization): Promise<void> {}
  private async createUsageBasedAmortization(queryRunner: QueryRunner, prepayment: Prepayment, units: number, amount: number, period: Date, recordedBy: string): Promise<void> {}
  private async processDueAmortizations(): Promise<void> {}
  private async checkExpiringPrepayments(): Promise<void> {}
  private async calculateUtilizationMetrics(): Promise<void> {}
  private async generateMonthlyAmortizationReports(): Promise<void> {}
  private async performImpairmentTesting(): Promise<void> {}
  private async updateROICalculations(): Promise<void> {}
}