import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, addDays, startOfMonth, endOfMonth, addMonths, isBefore } from 'date-fns';

import { TaxConfiguration, TaxType, TaxFrequency } from './entities/tax-configuration.entity';
import { TaxCalculation, TaxCalculationStatus } from './entities/tax-calculation.entity';
import { TaxPayment, TaxPaymentStatus } from './entities/tax-payment.entity';
import { TaxReturn, TaxReturnStatus } from './entities/tax-return.entity';

export interface TaxConfigurationData {
  tenantId: string;
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  taxRate: number;
  effectiveDate: Date;
  createdBy: string;
}

export interface TaxCalculationData {
  tenantId: string;
  taxConfigurationId: string;
  periodStartDate: Date;
  periodEndDate: Date;
  grossIncome: number;
  deductibleExpenses?: number;
  exemptIncome?: number;
}

export interface TaxPaymentData {
  taxCalculationId: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccountId?: string;
}

export interface CorporateTaxSummary {
  tenantId: string;
  financialYear: string;
  totalGrossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  corporateIncomeTax: number;
  totalTaxLiability: number;
  totalPayments: number;
  balanceOutstanding: number;
}

@Injectable()
export class TaxManagementService {
  private readonly logger = new Logger(TaxManagementService.name);

  constructor(
    @InjectRepository(TaxConfiguration)
    private taxConfigRepo: Repository<TaxConfiguration>,
    @InjectRepository(TaxCalculation)
    private taxCalculationRepo: Repository<TaxCalculation>,
    @InjectRepository(TaxPayment)
    private taxPaymentRepo: Repository<TaxPayment>,
    @InjectRepository(TaxReturn)
    private taxReturnRepo: Repository<TaxReturn>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== TAX CONFIGURATION MANAGEMENT =====

  async createTaxConfiguration(data: TaxConfigurationData): Promise<TaxConfiguration> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for existing active configuration
      const existingConfig = await this.taxConfigRepo.findOne({
        where: { 
          tenantId: data.tenantId,
          taxType: data.taxType,
          isActive: true
        }
      });

      if (existingConfig) {
        // Deactivate existing configuration
        existingConfig.isActive = false;
        existingConfig.expiryDate = data.effectiveDate;
        await queryRunner.manager.save(existingConfig);
      }

      // Create Ghana-specific tax configuration with current rates
      const taxConfig = this.taxConfigRepo.create({
        ...data,
        corporateTaxRate: this.getGhanaCorporateTaxRate(data.taxType),
        vatRate: 12.50,
        nhilRate: 2.50,
        getfRate: 2.50,
        covidLevyRate: 1.00,
        withholdingTaxRate: this.getGhanaWithholdingTaxRate(data.taxType),
        filingFrequency: this.getDefaultFilingFrequency(data.taxType),
        paymentFrequency: this.getDefaultPaymentFrequency(data.taxType),
        taxPayableAccount: this.getDefaultTaxPayableAccount(data.taxType),
        taxExpenseAccount: this.getDefaultTaxExpenseAccount(data.taxType),
        graTaxTypeCode: this.getGRATaxTypeCode(data.taxType),
        isActive: true,
        appliesToOilCompanies: true,
        autoCalculate: true,
        autoProvision: true,
      });

      const savedConfig = await queryRunner.manager.save(taxConfig);

      await queryRunner.commitTransaction();

      // Emit tax configuration created event
      this.eventEmitter.emit('tax-configuration.created', {
        configurationId: savedConfig.id,
        taxType: data.taxType,
        tenantId: data.tenantId,
      });

      this.logger.log(`Tax configuration ${data.taxCode} created for ${data.taxType}`);
      return savedConfig;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTaxConfigurations(
    tenantId: string,
    taxType?: TaxType,
    activeOnly: boolean = true
  ): Promise<TaxConfiguration[]> {
    const query = this.taxConfigRepo.createQueryBuilder('tc')
      .where('tc.tenantId = :tenantId', { tenantId })
      .orderBy('tc.taxType', 'ASC');

    if (taxType) {
      query.andWhere('tc.taxType = :taxType', { taxType });
    }

    if (activeOnly) {
      query.andWhere('tc.isActive = :isActive', { isActive: true });
    }

    return query.getMany();
  }

  // ===== TAX CALCULATION AND PROCESSING =====

  async calculateCorporateIncomeTax(data: TaxCalculationData): Promise<TaxCalculation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taxConfig = await this.taxConfigRepo.findOne({
        where: { id: data.taxConfigurationId }
      });

      if (!taxConfig) {
        throw new NotFoundException('Tax configuration not found');
      }

      // Generate calculation number
      const calculationNumber = await this.generateCalculationNumber(
        queryRunner,
        data.periodStartDate
      );

      // Get financial data for the period
      const financialData = await this.getFinancialDataForPeriod(
        data.tenantId,
        data.periodStartDate,
        data.periodEndDate
      );

      // Calculate taxable income
      const exemptIncome = data.exemptIncome || 0;
      const deductibleExpenses = data.deductibleExpenses || financialData.totalExpenses;
      const capitalAllowances = await this.calculateCapitalAllowances(
        data.tenantId,
        data.periodStartDate,
        data.periodEndDate
      );
      const lossBroughtForward = await this.getLossBroughtForward(
        data.tenantId,
        data.periodStartDate.getFullYear().toString()
      );

      const taxableIncome = Math.max(0, 
        data.grossIncome - exemptIncome - deductibleExpenses - capitalAllowances - lossBroughtForward
      );

      // Calculate corporate income tax (25% in Ghana)
      const corporateIncomeTax = taxableIncome * (taxConfig.corporateTaxRate / 100);

      // Calculate minimum tax (1% of gross turnover in Ghana)
      const minimumTaxAmount = data.grossIncome * 0.01;
      const minimumTaxApplicable = corporateIncomeTax < minimumTaxAmount;
      const finalTaxAmount = minimumTaxApplicable ? minimumTaxAmount : corporateIncomeTax;

      // Get withholding tax credits
      const withholdingTaxCredits = await this.getWithholdingTaxCredits(
        data.tenantId,
        data.periodStartDate,
        data.periodEndDate
      );

      // Calculate net tax payable
      const netTaxPayable = Math.max(0, finalTaxAmount - withholdingTaxCredits);

      // Create tax calculation
      const taxCalculation = this.taxCalculationRepo.create({
        tenantId: data.tenantId,
        calculationNumber,
        taxConfigurationId: data.taxConfigurationId,
        periodType: this.getPeriodType(data.periodStartDate, data.periodEndDate),
        periodStartDate: data.periodStartDate,
        periodEndDate: data.periodEndDate,
        taxPeriod: data.periodStartDate,
        financialYear: data.periodStartDate.getFullYear().toString(),
        grossIncome: data.grossIncome,
        exemptIncome,
        deductibleExpenses,
        capitalAllowances,
        lossBroughtForward,
        taxableIncome,
        taxRateApplied: taxConfig.corporateTaxRate,
        taxBeforeCredits: finalTaxAmount,
        withholdingTaxCredits,
        netTaxPayable,
        corporateIncomeTax: finalTaxAmount,
        minimumTaxApplicable,
        minimumTaxAmount,
        grossTurnover: data.grossIncome,
        dueDate: this.calculateDueDate(data.periodEndDate, taxConfig.filingFrequency),
        balanceOutstanding: netTaxPayable,
        totalAmountDue: netTaxPayable,
        status: TaxCalculationStatus.CALCULATED,
        calculatedDate: new Date(),
        calculatedBy: 'system',
        autoCalculated: true,
        createdBy: 'system',
      });

      const savedCalculation = await queryRunner.manager.save(taxCalculation);

      // Create tax provision journal entry
      await this.createTaxProvisionJournalEntry(queryRunner, savedCalculation, taxConfig);

      await queryRunner.commitTransaction();

      // Emit tax calculation event
      this.eventEmitter.emit('tax.calculated', {
        calculationId: savedCalculation.id,
        taxType: taxConfig.taxType,
        taxAmount: netTaxPayable,
        tenantId: data.tenantId,
      });

      this.logger.log(`Corporate income tax calculated: ${calculationNumber}, Amount: GHS ${netTaxPayable}`);
      return savedCalculation;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processTaxPayment(data: TaxPaymentData): Promise<TaxPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taxCalculation = await this.taxCalculationRepo.findOne({
        where: { id: data.taxCalculationId },
        relations: ['taxConfiguration']
      });

      if (!taxCalculation) {
        throw new NotFoundException('Tax calculation not found');
      }

      // Generate payment number
      const paymentNumber = await this.generatePaymentNumber(queryRunner, data.paymentDate);

      // Create tax payment
      const taxPayment = this.taxPaymentRepo.create({
        tenantId: taxCalculation.tenantId,
        paymentNumber,
        taxCalculationId: data.taxCalculationId,
        taxConfigurationId: taxCalculation.taxConfigurationId,
        paymentDate: data.paymentDate,
        paymentAmount: data.paymentAmount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        bankAccountId: data.bankAccountId,
        principalAmount: Math.min(data.paymentAmount, taxCalculation.balanceOutstanding),
        status: TaxPaymentStatus.PROCESSED,
        processingDate: new Date(),
        createdBy: 'system',
      });

      const savedPayment = await queryRunner.manager.save(taxPayment);

      // Update tax calculation balance
      const newBalance = Math.max(0, taxCalculation.balanceOutstanding - data.paymentAmount);
      const amountPaid = taxCalculation.amountPaid + data.paymentAmount;

      await queryRunner.manager.update(
        TaxCalculation,
        { id: data.taxCalculationId },
        {
          amountPaid,
          balanceOutstanding: newBalance,
          status: newBalance === 0 ? TaxCalculationStatus.PAID : taxCalculation.status,
          updatedAt: new Date(),
        }
      );

      // Create payment journal entry
      await this.createTaxPaymentJournalEntry(queryRunner, savedPayment, taxCalculation);

      await queryRunner.commitTransaction();

      // Emit payment processed event
      this.eventEmitter.emit('tax-payment.processed', {
        paymentId: savedPayment.id,
        calculationId: data.taxCalculationId,
        amount: data.paymentAmount,
        tenantId: taxCalculation.tenantId,
      });

      this.logger.log(`Tax payment processed: ${paymentNumber}, Amount: GHS ${data.paymentAmount}`);
      return savedPayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== TAX RETURNS =====

  async generateTaxReturn(
    tenantId: string,
    taxConfigurationId: string,
    periodStartDate: Date,
    periodEndDate: Date
  ): Promise<TaxReturn> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taxConfig = await this.taxConfigRepo.findOne({
        where: { id: taxConfigurationId }
      });

      if (!taxConfig) {
        throw new NotFoundException('Tax configuration not found');
      }

      // Get all calculations for the period
      const calculations = await this.taxCalculationRepo.find({
        where: {
          tenantId,
          taxConfigurationId,
          periodStartDate: Between(periodStartDate, periodEndDate),
          status: TaxCalculationStatus.APPROVED,
        }
      });

      if (calculations.length === 0) {
        throw new BadRequestException('No approved tax calculations found for the period');
      }

      // Generate return number
      const returnNumber = await this.generateReturnNumber(queryRunner, periodStartDate);

      // Aggregate calculation data
      const totalGrossIncome = calculations.reduce((sum, calc) => sum + calc.grossIncome, 0);
      const totalTaxableIncome = calculations.reduce((sum, calc) => sum + calc.taxableIncome, 0);
      const totalTaxPayable = calculations.reduce((sum, calc) => sum + calc.netTaxPayable, 0);
      const totalTaxPaid = calculations.reduce((sum, calc) => sum + calc.amountPaid, 0);
      const totalDeductions = calculations.reduce((sum, calc) => sum + calc.deductibleExpenses, 0);

      // Create tax return
      const taxReturn = this.taxReturnRepo.create({
        tenantId,
        returnNumber,
        taxConfigurationId,
        returnType: this.getReturnTypeFromTaxType(taxConfig.taxType),
        returnPeriod: periodStartDate,
        periodStartDate,
        periodEndDate,
        financialYear: periodStartDate.getFullYear().toString(),
        filingDueDate: this.calculateFilingDueDate(periodEndDate, taxConfig.filingFrequency),
        grossIncome: totalGrossIncome,
        taxableIncome: totalTaxableIncome,
        totalDeductions,
        taxPayable: totalTaxPayable,
        taxPaid: totalTaxPaid,
        balanceDue: Math.max(0, totalTaxPayable - totalTaxPaid),
        refundAmount: Math.max(0, totalTaxPaid - totalTaxPayable),
        corporateIncomeTax: totalTaxPayable,
        status: TaxReturnStatus.PREPARED,
        preparedBy: 'system',
        preparationDate: new Date(),
        autoGenerated: true,
        requiresManualReview: true,
        createdBy: 'system',
      });

      const savedReturn = await queryRunner.manager.save(taxReturn);

      await queryRunner.commitTransaction();

      // Emit tax return generated event
      this.eventEmitter.emit('tax-return.generated', {
        returnId: savedReturn.id,
        returnNumber,
        taxType: taxConfig.taxType,
        tenantId,
      });

      this.logger.log(`Tax return generated: ${returnNumber} for period ${format(periodStartDate, 'yyyy-MM-dd')} to ${format(periodEndDate, 'yyyy-MM-dd')}`);
      return savedReturn;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== REPORTING AND ANALYTICS =====

  async getCorporateTaxSummary(
    tenantId: string,
    financialYear: string
  ): Promise<CorporateTaxSummary> {
    const yearStart = new Date(`${financialYear}-01-01`);
    const yearEnd = new Date(`${financialYear}-12-31`);

    // Get corporate income tax configuration
    const taxConfig = await this.taxConfigRepo.findOne({
      where: {
        tenantId,
        taxType: TaxType.CORPORATE_INCOME_TAX,
        isActive: true,
      }
    });

    if (!taxConfig) {
      throw new NotFoundException('Corporate income tax configuration not found');
    }

    // Get all calculations for the year
    const calculations = await this.taxCalculationRepo.find({
      where: {
        tenantId,
        taxConfigurationId: taxConfig.id,
        periodStartDate: Between(yearStart, yearEnd),
      }
    });

    // Get all payments for the year
    const payments = await this.taxPaymentRepo.find({
      where: {
        tenantId,
        taxConfigurationId: taxConfig.id,
        paymentDate: Between(yearStart, yearEnd),
        status: TaxPaymentStatus.CLEARED,
      }
    });

    const totalGrossIncome = calculations.reduce((sum, calc) => sum + calc.grossIncome, 0);
    const totalDeductions = calculations.reduce((sum, calc) => sum + calc.deductibleExpenses + calc.capitalAllowances, 0);
    const taxableIncome = calculations.reduce((sum, calc) => sum + calc.taxableIncome, 0);
    const corporateIncomeTax = calculations.reduce((sum, calc) => sum + calc.corporateIncomeTax, 0);
    const totalTaxLiability = calculations.reduce((sum, calc) => sum + calc.netTaxPayable, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
    const balanceOutstanding = totalTaxLiability - totalPayments;

    return {
      tenantId,
      financialYear,
      totalGrossIncome,
      totalDeductions,
      taxableIncome,
      corporateIncomeTax,
      totalTaxLiability,
      totalPayments,
      balanceOutstanding,
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyTaxProcesses(): Promise<void> {
    this.logger.log('Starting monthly tax processes');

    try {
      // Generate monthly VAT calculations
      await this.generateMonthlyVATCalculations();

      // Generate monthly withholding tax calculations
      await this.generateMonthlyWithholdingTaxCalculations();

      // Calculate penalties and interest
      await this.calculatePenaltiesAndInterest();

      // Generate payment reminders
      await this.generateTaxPaymentReminders();

      this.logger.log('Monthly tax processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly tax processes:', error);
    }
  }

  @Cron('0 0 1 1,4,7,10 *') // Quarterly on 1st day of quarter months
  async quarterlyTaxProcesses(): Promise<void> {
    this.logger.log('Starting quarterly tax processes');

    try {
      // Generate quarterly corporate income tax calculations
      await this.generateQuarterlyCorporateIncomeTax();

      // Generate quarterly tax returns
      await this.generateQuarterlyTaxReturns();

      this.logger.log('Quarterly tax processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete quarterly tax processes:', error);
    }
  }

  @Cron('0 0 1 1 *') // Annually on January 1st
  async annualTaxProcesses(): Promise<void> {
    this.logger.log('Starting annual tax processes');

    try {
      // Generate annual corporate income tax returns
      await this.generateAnnualTaxReturns();

      // Calculate capital allowances for the new year
      await this.calculateAnnualCapitalAllowances();

      // Update tax rates for new year
      await this.updateTaxRatesForNewYear();

      this.logger.log('Annual tax processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete annual tax processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private getGhanaCorporateTaxRate(taxType: TaxType): number {
    switch (taxType) {
      case TaxType.CORPORATE_INCOME_TAX:
        return 25.00; // Standard Ghana CIT rate
      case TaxType.PETROLEUM_TAX:
        return 35.00; // Petroleum companies
      default:
        return 25.00;
    }
  }

  private getGhanaWithholdingTaxRate(taxType: TaxType): number {
    switch (taxType) {
      case TaxType.WITHHOLDING_TAX:
        return 5.00; // Standard Ghana WHT rate
      default:
        return 0.00;
    }
  }

  private getDefaultFilingFrequency(taxType: TaxType): TaxFrequency {
    switch (taxType) {
      case TaxType.CORPORATE_INCOME_TAX:
        return TaxFrequency.QUARTERLY;
      case TaxType.VALUE_ADDED_TAX:
        return TaxFrequency.MONTHLY;
      case TaxType.WITHHOLDING_TAX:
        return TaxFrequency.MONTHLY;
      default:
        return TaxFrequency.MONTHLY;
    }
  }

  private getDefaultPaymentFrequency(taxType: TaxType): TaxFrequency {
    return this.getDefaultFilingFrequency(taxType);
  }

  private getDefaultTaxPayableAccount(taxType: TaxType): string {
    switch (taxType) {
      case TaxType.CORPORATE_INCOME_TAX:
        return '2301';
      case TaxType.VALUE_ADDED_TAX:
        return '2302';
      case TaxType.WITHHOLDING_TAX:
        return '2303';
      default:
        return '2300';
    }
  }

  private getDefaultTaxExpenseAccount(taxType: TaxType): string {
    switch (taxType) {
      case TaxType.CORPORATE_INCOME_TAX:
        return '8001';
      case TaxType.VALUE_ADDED_TAX:
        return '8002';
      default:
        return '8000';
    }
  }

  private getGRATaxTypeCode(taxType: TaxType): string {
    switch (taxType) {
      case TaxType.CORPORATE_INCOME_TAX:
        return 'CIT';
      case TaxType.VALUE_ADDED_TAX:
        return 'VAT';
      case TaxType.WITHHOLDING_TAX:
        return 'WHT';
      case TaxType.NATIONAL_HEALTH_INSURANCE_LEVY:
        return 'NHIL';
      case TaxType.GHANA_EDUCATION_TRUST_FUND:
        return 'GETF';
      default:
        return taxType;
    }
  }

  // Placeholder methods for complex processes
  private async generateCalculationNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM tax_calculations WHERE calculation_number LIKE $1`,
      [`TAX-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `TAX-${yearMonth}-${sequence}`;
  }

  private async generatePaymentNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM tax_payments WHERE payment_number LIKE $1`,
      [`TAXPAY-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `TAXPAY-${yearMonth}-${sequence}`;
  }

  private async generateReturnNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM tax_returns WHERE return_number LIKE $1`,
      [`RET-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `RET-${yearMonth}-${sequence}`;
  }

  // Additional placeholder methods
  private async getFinancialDataForPeriod(tenantId: string, startDate: Date, endDate: Date): Promise<any> { return { totalExpenses: 0 }; }
  private async calculateCapitalAllowances(tenantId: string, startDate: Date, endDate: Date): Promise<number> { return 0; }
  private async getLossBroughtForward(tenantId: string, financialYear: string): Promise<number> { return 0; }
  private async getWithholdingTaxCredits(tenantId: string, startDate: Date, endDate: Date): Promise<number> { return 0; }
  private getPeriodType(startDate: Date, endDate: Date): any { return 'MONTHLY'; }
  private calculateDueDate(periodEnd: Date, frequency: TaxFrequency): Date { return addDays(periodEnd, 15); }
  private calculateFilingDueDate(periodEnd: Date, frequency: TaxFrequency): Date { return addDays(periodEnd, 30); }
  private getReturnTypeFromTaxType(taxType: TaxType): any { return 'CORPORATE_INCOME_TAX'; }
  private async createTaxProvisionJournalEntry(queryRunner: QueryRunner, calculation: TaxCalculation, config: TaxConfiguration): Promise<void> {}
  private async createTaxPaymentJournalEntry(queryRunner: QueryRunner, payment: TaxPayment, calculation: TaxCalculation): Promise<void> {}
  private async generateMonthlyVATCalculations(): Promise<void> {}
  private async generateMonthlyWithholdingTaxCalculations(): Promise<void> {}
  private async calculatePenaltiesAndInterest(): Promise<void> {}
  private async generateTaxPaymentReminders(): Promise<void> {}
  private async generateQuarterlyCorporateIncomeTax(): Promise<void> {}
  private async generateQuarterlyTaxReturns(): Promise<void> {}
  private async generateAnnualTaxReturns(): Promise<void> {}
  private async calculateAnnualCapitalAllowances(): Promise<void> {}
  private async updateTaxRatesForNewYear(): Promise<void> {}
}