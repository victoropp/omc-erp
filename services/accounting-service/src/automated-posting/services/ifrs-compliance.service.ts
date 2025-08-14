import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, MoreThan, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { JournalEntryTemplate } from '../entities/journal-entry-template.entity';
import { IFRSAdjustment, IFRSStandard, AdjustmentType } from '../entities/ifrs-adjustment.entity';
import { RevenueRecognitionSchedule, RecognitionMethod, ScheduleStatus } from '../entities/revenue-recognition-schedule.entity';
import { ExpectedCreditLoss, ECLStage, ECLMethod } from '../entities/expected-credit-loss.entity';
import { LeaseAccounting, LeaseType, LeaseStatus } from '../entities/lease-accounting.entity';
import { JournalEntry } from '../../general-ledger/entities/journal-entry.entity';
import { JournalEntryLine } from '../../general-ledger/entities/journal-entry-line.entity';

export interface IFRS15Contract {
  contract_id: string;
  customer_id: string;
  contract_value: number;
  commencement_date: Date;
  performance_obligations: Array<{
    obligation_id: string;
    description: string;
    allocated_value: number;
    satisfaction_method: RecognitionMethod;
    expected_completion_date: Date;
  }>;
}

export interface IFRS9Assessment {
  customer_id: string;
  portfolio_segment: string;
  gross_carrying_amount: number;
  current_stage: ECLStage;
  days_past_due: number;
  credit_rating: string;
  macroeconomic_indicators: Record<string, number>;
}

@Injectable()
export class IFRSComplianceService {
  private readonly logger = new Logger(IFRSComplianceService.name);

  constructor(
    @InjectRepository(IFRSAdjustment)
    private ifrsAdjustmentRepository: Repository<IFRSAdjustment>,
    @InjectRepository(RevenueRecognitionSchedule)
    private revenueScheduleRepository: Repository<RevenueRecognitionSchedule>,
    @InjectRepository(ExpectedCreditLoss)
    private eclRepository: Repository<ExpectedCreditLoss>,
    @InjectRepository(LeaseAccounting)
    private leaseRepository: Repository<LeaseAccounting>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLineRepository: Repository<JournalEntryLine>,
    private dataSource: DataSource,
  ) {}

  /**
   * Process IFRS adjustments for a journal entry
   */
  async processIFRSAdjustments(
    template: JournalEntryTemplate,
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    try {
      if (template.ifrs15_revenue_recognition) {
        await this.processIFRS15RevenueRecognition(journalEntry, transactionData);
      }

      if (template.ifrs9_expected_credit_loss) {
        await this.processIFRS9ExpectedCreditLoss(journalEntry, transactionData);
      }

      if (template.ifrs16_lease_accounting) {
        await this.processIFRS16LeaseAccounting(journalEntry, transactionData);
      }

      if (template.ias2_inventory_valuation) {
        await this.processIAS2InventoryValuation(journalEntry, transactionData);
      }

      this.logger.log(`IFRS adjustments processed for journal entry ${journalEntry.id}`);

    } catch (error) {
      this.logger.error(`Error processing IFRS adjustments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * IFRS 15 - Revenue from Contracts with Customers
   */
  async processIFRS15RevenueRecognition(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    try {
      // For fuel sales, revenue is typically recognized at point in time
      if (transactionData.transaction_type === 'FUEL_SALE') {
        await this.createPointInTimeRevenueRecognition(journalEntry, transactionData);
      }
      
      // For contracts with multiple performance obligations
      if (transactionData.contract_id) {
        await this.createPerformanceObligationSchedule(journalEntry, transactionData);
      }

    } catch (error) {
      this.logger.error(`IFRS 15 processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create point-in-time revenue recognition for fuel sales
   */
  private async createPointInTimeRevenueRecognition(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    const revenueSchedule = this.revenueScheduleRepository.create({
      contract_id: transactionData.transaction_id || journalEntry.id,
      performance_obligation_id: journalEntry.id,
      description: `Fuel sale revenue recognition - ${transactionData.product_type}`,
      total_contract_value: transactionData.total_amount,
      allocated_amount: transactionData.total_amount,
      recognition_method: RecognitionMethod.POINT_IN_TIME,
      start_date: journalEntry.journal_date,
      end_date: journalEntry.journal_date,
      recognition_date: journalEntry.journal_date,
      recognized_amount: transactionData.total_amount,
      cumulative_recognized: transactionData.total_amount,
      remaining_amount: 0,
      completion_percentage: 100,
      status: ScheduleStatus.COMPLETED,
      journal_entry_id: journalEntry.id,
      is_posted: true,
      posted_at: new Date(),
      created_by: 'IFRS15_AUTOMATION',
    });

    await this.revenueScheduleRepository.save(revenueSchedule);

    // Create IFRS adjustment record
    await this.createIFRSAdjustment({
      ifrs_standard: IFRSStandard.IFRS15,
      adjustment_type: AdjustmentType.REVENUE_RECOGNITION,
      description: 'Point-in-time revenue recognition',
      source_document_id: journalEntry.id,
      journal_entry_id: journalEntry.id,
      account_code: '4000', // Revenue account
      adjustment_amount: transactionData.total_amount,
      effective_date: journalEntry.journal_date,
      calculation_details: {
        recognition_method: 'POINT_IN_TIME',
        performance_obligations: 1,
        satisfaction_date: journalEntry.journal_date,
      },
    });
  }

  /**
   * Create performance obligation schedule for complex contracts
   */
  private async createPerformanceObligationSchedule(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    const contract: IFRS15Contract = transactionData.contract_details;
    
    for (const obligation of contract.performance_obligations) {
      const schedule = this.revenueScheduleRepository.create({
        contract_id: contract.contract_id,
        performance_obligation_id: obligation.obligation_id,
        description: obligation.description,
        total_contract_value: contract.contract_value,
        allocated_amount: obligation.allocated_value,
        recognition_method: obligation.satisfaction_method,
        start_date: contract.commencement_date,
        end_date: obligation.expected_completion_date,
        recognition_date: this.calculateNextRecognitionDate(obligation.satisfaction_method, contract.commencement_date),
        recognized_amount: 0,
        cumulative_recognized: 0,
        remaining_amount: obligation.allocated_value,
        status: ScheduleStatus.ACTIVE,
        created_by: 'IFRS15_AUTOMATION',
      });

      await this.revenueScheduleRepository.save(schedule);
    }
  }

  /**
   * IFRS 9 - Expected Credit Loss
   */
  async processIFRS9ExpectedCreditLoss(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    try {
      // Process only for credit sales
      if (!transactionData.is_credit_sale || !transactionData.customer_id) {
        return;
      }

      const assessment: IFRS9Assessment = {
        customer_id: transactionData.customer_id,
        portfolio_segment: transactionData.customer_category || 'RETAIL',
        gross_carrying_amount: transactionData.total_amount,
        current_stage: ECLStage.STAGE_1, // Default to Stage 1
        days_past_due: 0,
        credit_rating: transactionData.credit_rating || 'STANDARD',
        macroeconomic_indicators: this.getCurrentMacroeconomicIndicators(),
      };

      const eclCalculation = await this.calculateExpectedCreditLoss(assessment);
      
      if (eclCalculation.ecl_provision > 0) {
        await this.createECLProvisionEntry(journalEntry, eclCalculation, transactionData);
      }

    } catch (error) {
      this.logger.error(`IFRS 9 processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate Expected Credit Loss
   */
  private async calculateExpectedCreditLoss(assessment: IFRS9Assessment): Promise<ExpectedCreditLoss> {
    const basePD = this.getBaseProbabilityOfDefault(assessment.credit_rating, assessment.portfolio_segment);
    const lgd = this.getLossGivenDefault(assessment.portfolio_segment);
    const macroAdjustment = this.getMacroeconomicAdjustment(assessment.macroeconomic_indicators);
    
    // Adjust PD based on macroeconomic factors
    const adjustedPD = basePD * macroAdjustment;
    
    // Calculate ECL based on stage
    let eclAmount: number;
    let eclMethod: ECLMethod;

    switch (assessment.current_stage) {
      case ECLStage.STAGE_1:
        eclAmount = assessment.gross_carrying_amount * adjustedPD * lgd * (12/12); // 12-month ECL
        eclMethod = ECLMethod.PROVISION_MATRIX;
        break;
      case ECLStage.STAGE_2:
        eclAmount = assessment.gross_carrying_amount * adjustedPD * lgd; // Lifetime ECL
        eclMethod = ECLMethod.DISCOUNTED_CASH_FLOW;
        break;
      case ECLStage.STAGE_3:
        eclAmount = assessment.gross_carrying_amount * lgd; // Full impairment
        eclMethod = ECLMethod.PROBABILITY_WEIGHTED;
        break;
      default:
        eclAmount = 0;
        eclMethod = ECLMethod.PROVISION_MATRIX;
    }

    const ecl = this.eclRepository.create({
      customer_id: assessment.customer_id,
      portfolio_segment: assessment.portfolio_segment,
      as_of_date: new Date(),
      ecl_stage: assessment.current_stage,
      calculation_method: eclMethod,
      gross_carrying_amount: assessment.gross_carrying_amount,
      ecl_provision: eclAmount,
      net_carrying_amount: assessment.gross_carrying_amount - eclAmount,
      probability_of_default: adjustedPD,
      loss_given_default: lgd,
      exposure_at_default: assessment.gross_carrying_amount,
      days_past_due: assessment.days_past_due,
      ecl_movement: eclAmount, // New provision
      created_by: 'IFRS9_AUTOMATION',
    });

    return await this.eclRepository.save(ecl);
  }

  /**
   * Create ECL provision journal entry
   */
  private async createECLProvisionEntry(
    originalEntry: JournalEntry,
    eclCalculation: ExpectedCreditLoss,
    transactionData: Record<string, any>
  ): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Create ECL provision journal entry
      const eclJournalNumber = `ECL-${originalEntry.journal_number}`;
      
      const eclJournal = manager.create(JournalEntry, {
        journal_number: eclJournalNumber,
        journal_date: originalEntry.journal_date,
        posting_date: new Date(),
        journal_type: 'ECL_PROVISION',
        source_module: 'IFRS9_AUTOMATION',
        source_document_type: 'ECL_CALCULATION',
        source_document_id: eclCalculation.ecl_id,
        description: `ECL provision for credit sale ${originalEntry.journal_number}`,
        total_debit: eclCalculation.ecl_provision,
        total_credit: eclCalculation.ecl_provision,
        status: 'POSTED',
        posted_at: new Date(),
        created_by: 'IFRS9_AUTOMATION',
      });

      const savedEclJournal = await manager.save(JournalEntry, eclJournal);

      // Debit: Credit Loss Expense
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedEclJournal.id,
        line_number: 1,
        account_code: '6500', // Credit Loss Expense
        description: 'Expected credit loss provision',
        debit_amount: eclCalculation.ecl_provision,
        credit_amount: 0,
      });

      // Credit: Allowance for Credit Losses
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedEclJournal.id,
        line_number: 2,
        account_code: '1215', // Allowance for Credit Losses (contra-asset)
        description: 'Allowance for expected credit losses',
        debit_amount: 0,
        credit_amount: eclCalculation.ecl_provision,
      });

      // Update ECL record with journal entry ID
      await manager.update(ExpectedCreditLoss, eclCalculation.ecl_id, {
        journal_entry_id: savedEclJournal.id,
        is_posted: true,
      });
    });

    // Create IFRS adjustment record
    await this.createIFRSAdjustment({
      ifrs_standard: IFRSStandard.IFRS9,
      adjustment_type: AdjustmentType.EXPECTED_CREDIT_LOSS,
      description: 'Expected credit loss provision',
      source_document_id: originalEntry.id,
      account_code: '1215',
      adjustment_amount: eclCalculation.ecl_provision,
      effective_date: originalEntry.journal_date,
      calculation_details: {
        ecl_stage: eclCalculation.ecl_stage,
        probability_of_default: eclCalculation.probability_of_default,
        loss_given_default: eclCalculation.loss_given_default,
        exposure_at_default: eclCalculation.exposure_at_default,
      },
    });
  }

  /**
   * IFRS 16 - Lease Accounting
   */
  async processIFRS16LeaseAccounting(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    try {
      // Process lease-related transactions
      if (transactionData.lease_contract_id) {
        await this.processLeasePayment(journalEntry, transactionData);
      }

    } catch (error) {
      this.logger.error(`IFRS 16 processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process lease payment and calculate ROU asset depreciation and interest
   */
  private async processLeasePayment(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    const lease = await this.leaseRepository.findOne({
      where: { lease_contract_id: transactionData.lease_contract_id },
    });

    if (!lease || lease.status !== LeaseStatus.ACTIVE) {
      return;
    }

    // Calculate interest expense
    const interestExpense = lease.lease_liability * (lease.discount_rate / 12);
    
    // Calculate principal reduction
    const principalReduction = lease.monthly_payment - interestExpense;
    
    // Calculate depreciation
    const monthlyDepreciation = lease.right_of_use_asset / lease.lease_term_months;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Create lease payment journal entry
      const leaseJournalNumber = `LEASE-${journalEntry.journal_number}`;
      
      const leaseJournal = manager.create(JournalEntry, {
        journal_number: leaseJournalNumber,
        journal_date: journalEntry.journal_date,
        posting_date: new Date(),
        journal_type: 'LEASE_PAYMENT',
        source_module: 'IFRS16_AUTOMATION',
        source_document_type: 'LEASE_PAYMENT',
        source_document_id: lease.lease_id,
        description: `Lease payment and depreciation - ${lease.lease_description}`,
        total_debit: lease.monthly_payment + monthlyDepreciation,
        total_credit: lease.monthly_payment + monthlyDepreciation,
        status: 'POSTED',
        posted_at: new Date(),
        created_by: 'IFRS16_AUTOMATION',
      });

      const savedLeaseJournal = await manager.save(JournalEntry, leaseJournal);

      let lineNumber = 1;

      // Debit: Interest Expense
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedLeaseJournal.id,
        line_number: lineNumber++,
        account_code: lease.interest_expense_account || '6300',
        description: 'Lease interest expense',
        debit_amount: interestExpense,
        credit_amount: 0,
      });

      // Debit: Lease Liability (Principal)
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedLeaseJournal.id,
        line_number: lineNumber++,
        account_code: lease.lease_liability_account || '2500',
        description: 'Lease liability reduction',
        debit_amount: principalReduction,
        credit_amount: 0,
      });

      // Credit: Cash
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedLeaseJournal.id,
        line_number: lineNumber++,
        account_code: '1100',
        description: 'Lease payment',
        debit_amount: 0,
        credit_amount: lease.monthly_payment,
      });

      // Debit: Depreciation Expense
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedLeaseJournal.id,
        line_number: lineNumber++,
        account_code: lease.depreciation_expense_account || '6400',
        description: 'ROU asset depreciation',
        debit_amount: monthlyDepreciation,
        credit_amount: 0,
      });

      // Credit: Accumulated Depreciation - ROU Asset
      await manager.save(JournalEntryLine, {
        journal_entry_id: savedLeaseJournal.id,
        line_number: lineNumber++,
        account_code: '1502', // Accumulated depreciation for ROU assets
        description: 'Accumulated depreciation - ROU asset',
        debit_amount: 0,
        credit_amount: monthlyDepreciation,
      });

      // Update lease balances
      await manager.update(LeaseAccounting, lease.lease_id, {
        lease_liability: lease.lease_liability - principalReduction,
        accumulated_depreciation: lease.accumulated_depreciation + monthlyDepreciation,
        accumulated_interest: lease.accumulated_interest + interestExpense,
        next_payment_date: new Date(lease.next_payment_date.getTime() + (30 * 24 * 60 * 60 * 1000)), // Add 30 days
      });
    });
  }

  /**
   * IAS 2 - Inventory Valuation
   */
  async processIAS2InventoryValuation(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    try {
      // Process inventory-related adjustments
      if (transactionData.inventory_adjustment_required) {
        await this.processInventoryValuationAdjustment(journalEntry, transactionData);
      }

    } catch (error) {
      this.logger.error(`IAS 2 processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process inventory valuation adjustment (lower of cost or NRV)
   */
  private async processInventoryValuationAdjustment(
    journalEntry: JournalEntry,
    transactionData: Record<string, any>
  ): Promise<void> {
    const cost = transactionData.inventory_cost || 0;
    const netRealizableValue = transactionData.net_realizable_value || 0;
    
    if (netRealizableValue < cost) {
      const writeDownAmount = cost - netRealizableValue;
      
      await this.dataSource.transaction(async (manager: EntityManager) => {
        const adjustmentJournalNumber = `INV-ADJ-${journalEntry.journal_number}`;
        
        const adjustmentJournal = manager.create(JournalEntry, {
          journal_number: adjustmentJournalNumber,
          journal_date: journalEntry.journal_date,
          posting_date: new Date(),
          journal_type: 'INVENTORY_ADJUSTMENT',
          source_module: 'IAS2_AUTOMATION',
          source_document_type: 'INVENTORY_WRITEDOWN',
          source_document_id: transactionData.inventory_id || journalEntry.id,
          description: `Inventory write-down to NRV - ${transactionData.product_type}`,
          total_debit: writeDownAmount,
          total_credit: writeDownAmount,
          status: 'POSTED',
          posted_at: new Date(),
          created_by: 'IAS2_AUTOMATION',
        });

        const savedAdjustmentJournal = await manager.save(JournalEntry, adjustmentJournal);

        // Debit: Inventory Write-down Expense
        await manager.save(JournalEntryLine, {
          journal_entry_id: savedAdjustmentJournal.id,
          line_number: 1,
          account_code: '5300', // Inventory write-down expense
          description: 'Inventory write-down to NRV',
          debit_amount: writeDownAmount,
          credit_amount: 0,
        });

        // Credit: Inventory
        await manager.save(JournalEntryLine, {
          journal_entry_id: savedAdjustmentJournal.id,
          line_number: 2,
          account_code: '1300', // Inventory account
          description: 'Inventory valuation adjustment',
          debit_amount: 0,
          credit_amount: writeDownAmount,
        });
      });

      // Create IFRS adjustment record
      await this.createIFRSAdjustment({
        ifrs_standard: IFRSStandard.IAS2,
        adjustment_type: AdjustmentType.INVENTORY_VALUATION,
        description: 'Inventory write-down to net realizable value',
        source_document_id: journalEntry.id,
        account_code: '1300',
        adjustment_amount: -writeDownAmount, // Negative because it's a reduction
        effective_date: journalEntry.journal_date,
        calculation_details: {
          cost_basis: cost,
          net_realizable_value: netRealizableValue,
          write_down_amount: writeDownAmount,
        },
        cost_of_completion: transactionData.cost_of_completion,
        selling_costs: transactionData.selling_costs,
      });
    }
  }

  /**
   * Create IFRS adjustment record
   */
  private async createIFRSAdjustment(adjustmentData: Partial<IFRSAdjustment>): Promise<IFRSAdjustment> {
    const adjustment = this.ifrsAdjustmentRepository.create({
      ...adjustmentData,
      created_by: adjustmentData.created_by || 'IFRS_AUTOMATION',
      status: 'ACTIVE',
    });

    return await this.ifrsAdjustmentRepository.save(adjustment);
  }

  /**
   * Scheduled job for daily IFRS processing
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processDailyAdjustments(): Promise<void> {
    this.logger.log('Starting daily IFRS adjustments processing');
    
    try {
      // Process revenue recognition schedules
      await this.processScheduledRevenueRecognition();
      
      // Process lease accounting
      await this.processDailyLeaseAccounting();
      
      // Update ECL calculations if needed
      await this.updateExpectedCreditLosses();
      
      this.logger.log('Daily IFRS adjustments processing completed');
      
    } catch (error) {
      this.logger.error('Error in daily IFRS processing:', error);
    }
  }

  /**
   * Process scheduled revenue recognition
   */
  private async processScheduledRevenueRecognition(): Promise<void> {
    const schedules = await this.revenueScheduleRepository.find({
      where: {
        status: ScheduleStatus.ACTIVE,
        recognition_date: LessThanOrEqual(new Date()),
        is_posted: false,
      },
    });

    for (const schedule of schedules) {
      try {
        await this.processRevenueRecognitionSchedule(schedule);
      } catch (error) {
        this.logger.error(`Error processing revenue schedule ${schedule.schedule_id}:`, error);
      }
    }
  }

  /**
   * Process individual revenue recognition schedule
   */
  private async processRevenueRecognitionSchedule(schedule: RevenueRecognitionSchedule): Promise<void> {
    // Implementation for processing scheduled revenue recognition
    // This would create the appropriate journal entries
    // and update the schedule status
  }

  /**
   * Process daily lease accounting
   */
  async processLeaseAccountingSchedule(): Promise<void> {
    const leases = await this.leaseRepository.find({
      where: {
        status: LeaseStatus.ACTIVE,
        next_payment_date: LessThanOrEqual(new Date()),
      },
    });

    for (const lease of leases) {
      try {
        // Create lease payment transaction data
        const transactionData = {
          lease_contract_id: lease.lease_contract_id,
          payment_amount: lease.monthly_payment,
          payment_date: new Date(),
        };

        // Create dummy journal entry for processing
        const dummyJournal = this.journalEntryRepository.create({
          journal_number: `LEASE-SCHED-${lease.lease_id}`,
          journal_date: new Date(),
          posting_date: new Date(),
          journal_type: 'LEASE_SCHEDULE',
          description: 'Scheduled lease processing',
          total_debit: 0,
          total_credit: 0,
          status: 'POSTED',
          created_by: 'IFRS16_SCHEDULER',
        });

        await this.processLeasePayment(dummyJournal, transactionData);
        
      } catch (error) {
        this.logger.error(`Error processing lease ${lease.lease_id}:`, error);
      }
    }
  }

  /**
   * Process expected credit losses
   */
  async processExpectedCreditLosses(): Promise<void> {
    // This would run monthly to update ECL calculations
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get all customers with outstanding receivables
    // Calculate updated ECL provisions
    // Create adjustment entries if needed
    
    this.logger.log('ECL processing completed');
  }

  /**
   * Helper methods for ECL calculations
   */
  private getBaseProbabilityOfDefault(creditRating: string, portfolioSegment: string): number {
    const pdMatrix: Record<string, Record<string, number>> = {
      'CORPORATE': {
        'AAA': 0.0001,
        'AA': 0.0003,
        'A': 0.0010,
        'BBB': 0.0030,
        'BB': 0.0100,
        'B': 0.0300,
        'CCC': 0.1000,
        'STANDARD': 0.0050,
      },
      'RETAIL': {
        'EXCELLENT': 0.0020,
        'GOOD': 0.0050,
        'FAIR': 0.0150,
        'POOR': 0.0500,
        'STANDARD': 0.0100,
      },
      'SME': {
        'HIGH': 0.0030,
        'MEDIUM': 0.0100,
        'LOW': 0.0300,
        'STANDARD': 0.0150,
      }
    };

    return pdMatrix[portfolioSegment]?.[creditRating] || 0.0100;
  }

  private getLossGivenDefault(portfolioSegment: string): number {
    const lgdMap: Record<string, number> = {
      'CORPORATE': 0.45,
      'RETAIL': 0.60,
      'SME': 0.55,
    };

    return lgdMap[portfolioSegment] || 0.50;
  }

  private getCurrentMacroeconomicIndicators(): Record<string, number> {
    // In production, this would fetch real macroeconomic data
    return {
      gdp_growth: 0.035,
      inflation_rate: 0.08,
      unemployment_rate: 0.12,
      oil_price_change: 0.15,
      exchange_rate_volatility: 0.25,
    };
  }

  private getMacroeconomicAdjustment(indicators: Record<string, number>): number {
    // Simplified macro adjustment calculation
    // In practice, this would use more sophisticated models
    let adjustment = 1.0;
    
    // Positive GDP growth reduces PD
    adjustment *= (1 - indicators.gdp_growth * 0.5);
    
    // High inflation increases PD
    adjustment *= (1 + indicators.inflation_rate * 0.3);
    
    // High unemployment increases PD
    adjustment *= (1 + indicators.unemployment_rate * 0.4);
    
    return Math.max(0.5, Math.min(2.0, adjustment)); // Cap between 0.5x and 2.0x
  }

  private calculateNextRecognitionDate(method: RecognitionMethod, startDate: Date): Date {
    const nextDate = new Date(startDate);
    
    switch (method) {
      case RecognitionMethod.OVER_TIME:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecognitionMethod.POINT_IN_TIME:
        // Recognition date is the same as start date
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  }

  private async updateExpectedCreditLosses(): Promise<void> {
    // Monthly ECL update process
    this.logger.log('Updating expected credit losses');
    
    // Implementation would include:
    // 1. Fetch all active credit customers
    // 2. Assess stage migrations
    // 3. Recalculate ECL provisions
    // 4. Create adjustment journal entries
  }
}