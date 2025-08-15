import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DealerSettlement, DealerSettlementStatus } from '../entities/dealer-settlement.entity';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentRule {
  ruleId: string;
  ruleName: string;
  description: string;
  isActive: boolean;
  priority: number;
  
  // Conditions
  conditions: {
    minSettlementAmount: number;
    maxSettlementAmount: number;
    dealerCreditRating: string[];
    settlementStatus: DealerSettlementStatus[];
    daysFromApproval: number;
    requiresApproval: boolean;
    blacklistCheck: boolean;
  };

  // Payment Configuration
  paymentConfig: {
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH';
    processingDelay: number; // Hours
    batchPayment: boolean;
    approvalRequired: boolean;
    approvalWorkflow: string;
  };

  // Risk Controls
  riskControls: {
    dailyLimit: number;
    monthlyLimit: number;
    velocityCheck: boolean;
    duplicateCheck: boolean;
    fraudCheck: boolean;
  };

  tenantId: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface PaymentBatch {
  batchId: string;
  batchNumber: string;
  batchDate: Date;
  totalAmount: number;
  totalSettlements: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  
  settlements: Array<{
    settlementId: string;
    stationId: string;
    dealerId: string;
    amount: number;
    paymentReference: string;
    bankDetails: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      bankCode: string;
    };
  }>;

  processingDetails?: {
    startedAt: Date;
    completedAt?: Date;
    processedBy: string;
    bankReference?: string;
    confirmationCode?: string;
  };

  tenantId: string;
}

export interface PaymentInstruction {
  instructionId: string;
  settlementId: string;
  paymentAmount: number;
  paymentMethod: string;
  recipientDetails: {
    name: string;
    accountNumber: string;
    bankCode: string;
    reference: string;
  };
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  scheduledDate: Date;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  tenantId: string;
}

export interface PaymentReport {
  reportId: string;
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  
  summary: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageProcessingTime: number; // Hours
  };

  byPaymentMethod: Record<string, {
    count: number;
    amount: number;
    successRate: number;
  }>;

  byDealer: Array<{
    dealerId: string;
    stationId: string;
    paymentsCount: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
  }>;

  failureAnalysis: {
    reasonBreakdown: Record<string, number>;
    topFailedDealers: Array<{
      dealerId: string;
      failureCount: number;
      commonReason: string;
    }>;
  };

  compliance: {
    slaCompliance: number; // Percentage of payments within SLA
    averageDelay: number; // Hours beyond expected
    escalations: number;
  };

  recommendations: string[];
}

@Injectable()
export class DealerPaymentAutomationService {
  private readonly logger = new Logger(DealerPaymentAutomationService.name);

  constructor(
    @InjectRepository(DealerSettlement)
    private readonly settlementRepository: Repository<DealerSettlement>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process automated payments for approved settlements
   * Blueprint: "Automate dealer payment processing"
   */
  async processAutomatedPayments(
    tenantId: string,
    maxBatchSize: number = 50,
    dryRun: boolean = false,
  ): Promise<{
    batchesCreated: PaymentBatch[];
    totalAmount: number;
    totalSettlements: number;
    skippedSettlements: Array<{ settlementId: string; reason: string }>;
  }> {
    this.logger.log(`Processing automated payments for tenant ${tenantId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    if (!dryRun) {
      await queryRunner.startTransaction();
    }

    try {
      // Get payment rules
      const paymentRules = await this.getActivePaymentRules(tenantId);
      
      // Get eligible settlements
      const eligibleSettlements = await this.getEligibleSettlements(tenantId);
      
      if (eligibleSettlements.length === 0) {
        this.logger.log('No eligible settlements found for automated payment');
        return {
          batchesCreated: [],
          totalAmount: 0,
          totalSettlements: 0,
          skippedSettlements: [],
        };
      }

      // Apply payment rules and group settlements
      const { processableSettlements, skippedSettlements } = await this.applyPaymentRules(
        eligibleSettlements,
        paymentRules
      );

      if (processableSettlements.length === 0) {
        return {
          batchesCreated: [],
          totalAmount: 0,
          totalSettlements: 0,
          skippedSettlements,
        };
      }

      // Group settlements into batches by payment method
      const settlementBatches = this.groupSettlementsIntoBatches(
        processableSettlements,
        maxBatchSize
      );

      const batchesCreated: PaymentBatch[] = [];
      let totalAmount = 0;
      let totalSettlements = 0;

      // Create and process payment batches
      for (const batchData of settlementBatches) {
        const batch = await this.createPaymentBatch(batchData, tenantId);
        
        if (!dryRun) {
          // Update settlement statuses
          await queryRunner.manager.update(
            DealerSettlement,
            { id: In(batchData.settlements.map(s => s.id)) },
            { status: DealerSettlementStatus.PAID, paymentDate: new Date() }
          );

          // Emit batch created event
          this.eventEmitter.emit('dealer.payment.batch.created', {
            batchId: batch.batchId,
            settlementCount: batch.totalSettlements,
            totalAmount: batch.totalAmount,
            tenantId,
          });
        }

        batchesCreated.push(batch);
        totalAmount += batch.totalAmount;
        totalSettlements += batch.totalSettlements;
      }

      if (!dryRun) {
        await queryRunner.commitTransaction();
      }

      // Emit automated payment processed event
      this.eventEmitter.emit('dealer.payment.automated.processed', {
        batchesCreated: batchesCreated.length,
        totalAmount,
        totalSettlements,
        skippedCount: skippedSettlements.length,
        tenantId,
      });

      this.logger.log(`Automated payment processing completed: ${batchesCreated.length} batches, ${totalSettlements} settlements, GHS ${totalAmount.toFixed(2)}`);

      return {
        batchesCreated,
        totalAmount,
        totalSettlements,
        skippedSettlements,
      };
    } catch (error) {
      if (!dryRun) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute payment batch
   */
  async executePaymentBatch(
    batchId: string,
    tenantId: string,
    userId: string,
  ): Promise<{
    batchId: string;
    status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
    successfulPayments: number;
    failedPayments: number;
    totalAmount: number;
    errors: Array<{ settlementId: string; error: string }>;
  }> {
    this.logger.log(`Executing payment batch ${batchId}`);

    // This would integrate with actual banking/payment APIs
    // For now, simulate payment processing
    
    const batch = await this.getPaymentBatch(batchId, tenantId);
    if (!batch) {
      throw new NotFoundException('Payment batch not found');
    }

    if (batch.status !== 'PENDING') {
      throw new BadRequestException('Batch is not in pending status');
    }

    const results = {
      batchId,
      status: 'COMPLETED' as const,
      successfulPayments: 0,
      failedPayments: 0,
      totalAmount: batch.totalAmount,
      errors: [] as Array<{ settlementId: string; error: string }>,
    };

    // Simulate payment processing
    for (const settlement of batch.settlements) {
      try {
        // Simulate payment API call
        await this.processPayment({
          amount: settlement.amount,
          recipientAccount: settlement.bankDetails.accountNumber,
          recipientName: settlement.bankDetails.accountName,
          bankCode: settlement.bankDetails.bankCode,
          reference: settlement.paymentReference,
          paymentMethod: batch.paymentMethod,
        });

        results.successfulPayments++;

        // Emit individual payment success event
        this.eventEmitter.emit('dealer.payment.completed', {
          settlementId: settlement.settlementId,
          stationId: settlement.stationId,
          amount: settlement.amount,
          paymentReference: settlement.paymentReference,
          tenantId,
        });

      } catch (error) {
        results.failedPayments++;
        results.errors.push({
          settlementId: settlement.settlementId,
          error: error.message,
        });

        this.logger.error(`Payment failed for settlement ${settlement.settlementId}:`, error);
      }
    }

    // Determine overall batch status
    if (results.failedPayments === 0) {
      results.status = 'COMPLETED';
    } else if (results.successfulPayments > 0) {
      results.status = 'PARTIALLY_COMPLETED';
    } else {
      results.status = 'FAILED';
    }

    // Update batch status (would save to database)
    await this.updatePaymentBatchStatus(batchId, results.status, {
      completedAt: new Date(),
      processedBy: userId,
      successfulPayments: results.successfulPayments,
      failedPayments: results.failedPayments,
    });

    // Emit batch completion event
    this.eventEmitter.emit('dealer.payment.batch.completed', {
      batchId,
      status: results.status,
      successfulPayments: results.successfulPayments,
      failedPayments: results.failedPayments,
      tenantId,
    });

    return results;
  }

  /**
   * Create payment instructions for manual processing
   */
  async createPaymentInstructions(
    settlementIds: string[],
    tenantId: string,
    priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL',
  ): Promise<PaymentInstruction[]> {
    this.logger.log(`Creating payment instructions for ${settlementIds.length} settlements`);

    const settlements = await this.settlementRepository.find({
      where: {
        id: In(settlementIds),
        tenantId,
        status: DealerSettlementStatus.APPROVED,
      },
    });

    if (settlements.length === 0) {
      throw new NotFoundException('No approved settlements found');
    }

    const instructions: PaymentInstruction[] = [];

    for (const settlement of settlements) {
      const instruction: PaymentInstruction = {
        instructionId: uuidv4(),
        settlementId: settlement.id,
        paymentAmount: settlement.netPayable,
        paymentMethod: settlement.paymentMethod || 'BANK_TRANSFER',
        recipientDetails: {
          name: settlement.bankAccountDetails?.accountName || 'TBD',
          accountNumber: settlement.bankAccountDetails?.accountNumber || 'TBD',
          bankCode: settlement.bankAccountDetails?.bankCode || 'TBD',
          reference: `SETT-${settlement.stationId}-${settlement.windowId}`,
        },
        priority,
        scheduledDate: new Date(),
        status: 'QUEUED',
        createdAt: new Date(),
        tenantId,
      };

      instructions.push(instruction);
    }

    // Save instructions (would save to database)
    await this.savePaymentInstructions(instructions);

    // Emit instructions created event
    this.eventEmitter.emit('dealer.payment.instructions.created', {
      instructionCount: instructions.length,
      totalAmount: instructions.reduce((sum, i) => sum + i.paymentAmount, 0),
      priority,
      tenantId,
    });

    return instructions;
  }

  /**
   * Generate payment report
   */
  async generatePaymentReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PaymentReport> {
    this.logger.log(`Generating payment report for period ${periodStart.toDateString()} - ${periodEnd.toDateString()}`);

    // Get payments data for the period
    const payments = await this.getPaymentsForPeriod(tenantId, periodStart, periodEnd);

    const report: PaymentReport = {
      reportId: uuidv4(),
      reportDate: new Date(),
      periodStart,
      periodEnd,
      summary: this.calculatePaymentSummary(payments),
      byPaymentMethod: this.groupPaymentsByMethod(payments),
      byDealer: this.groupPaymentsByDealer(payments),
      failureAnalysis: this.analyzePaymentFailures(payments),
      compliance: this.calculateComplianceMetrics(payments),
      recommendations: this.generateRecommendations(payments),
    };

    // Emit report generated event
    this.eventEmitter.emit('dealer.payment.report.generated', {
      reportId: report.reportId,
      totalPayments: report.summary.totalPayments,
      totalAmount: report.summary.totalAmount,
      successRate: (report.summary.successfulPayments / report.summary.totalPayments) * 100,
      tenantId,
    });

    return report;
  }

  /**
   * Retry failed payments
   */
  async retryFailedPayments(
    batchId: string,
    tenantId: string,
    userId: string,
  ): Promise<{
    retriedCount: number;
    successfulRetries: number;
    stillFailedCount: number;
    errors: Array<{ settlementId: string; error: string }>;
  }> {
    this.logger.log(`Retrying failed payments for batch ${batchId}`);

    const batch = await this.getPaymentBatch(batchId, tenantId);
    if (!batch) {
      throw new NotFoundException('Payment batch not found');
    }

    // Get failed payment records
    const failedPayments = await this.getFailedPaymentsFromBatch(batchId);

    const results = {
      retriedCount: failedPayments.length,
      successfulRetries: 0,
      stillFailedCount: 0,
      errors: [] as Array<{ settlementId: string; error: string }>,
    };

    for (const payment of failedPayments) {
      try {
        await this.processPayment({
          amount: payment.amount,
          recipientAccount: payment.bankDetails.accountNumber,
          recipientName: payment.bankDetails.accountName,
          bankCode: payment.bankDetails.bankCode,
          reference: payment.paymentReference,
          paymentMethod: batch.paymentMethod,
        });

        results.successfulRetries++;

        // Update payment status
        await this.updatePaymentStatus(payment.settlementId, 'COMPLETED');

        this.eventEmitter.emit('dealer.payment.retry.success', {
          settlementId: payment.settlementId,
          amount: payment.amount,
          tenantId,
        });

      } catch (error) {
        results.stillFailedCount++;
        results.errors.push({
          settlementId: payment.settlementId,
          error: error.message,
        });

        this.logger.error(`Payment retry failed for settlement ${payment.settlementId}:`, error);
      }
    }

    // Emit retry completion event
    this.eventEmitter.emit('dealer.payment.retry.completed', {
      batchId,
      retriedCount: results.retriedCount,
      successfulRetries: results.successfulRetries,
      stillFailedCount: results.stillFailedCount,
      tenantId,
    });

    return results;
  }

  // Private helper methods

  private async getEligibleSettlements(tenantId: string): Promise<DealerSettlement[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.settlementRepository.find({
      where: {
        tenantId,
        status: DealerSettlementStatus.APPROVED,
        netPayable: this.dataSource.createQueryBuilder()
          .select()
          .where('netPayable > 0')
          .getQuery(),
        approvedAt: this.dataSource.createQueryBuilder()
          .select()
          .where('approvedAt <= :threeDaysAgo', { threeDaysAgo })
          .getQuery(),
      },
      order: { approvedAt: 'ASC' },
    });
  }

  private async getActivePaymentRules(tenantId: string): Promise<PaymentRule[]> {
    // This would get payment rules from database
    // For now, return default rules
    return [
      {
        ruleId: 'default-rule',
        ruleName: 'Standard Payment Rule',
        description: 'Default rule for automated payments',
        isActive: true,
        priority: 1,
        conditions: {
          minSettlementAmount: 100,
          maxSettlementAmount: 50000,
          dealerCreditRating: ['GOOD', 'EXCELLENT'],
          settlementStatus: [DealerSettlementStatus.APPROVED],
          daysFromApproval: 3,
          requiresApproval: false,
          blacklistCheck: true,
        },
        paymentConfig: {
          paymentMethod: 'BANK_TRANSFER',
          processingDelay: 2, // Hours
          batchPayment: true,
          approvalRequired: false,
          approvalWorkflow: 'none',
        },
        riskControls: {
          dailyLimit: 1000000, // GHS 1M daily limit
          monthlyLimit: 10000000, // GHS 10M monthly limit
          velocityCheck: true,
          duplicateCheck: true,
          fraudCheck: true,
        },
        tenantId,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];
  }

  private async applyPaymentRules(
    settlements: DealerSettlement[],
    rules: PaymentRule[],
  ): Promise<{
    processableSettlements: DealerSettlement[];
    skippedSettlements: Array<{ settlementId: string; reason: string }>;
  }> {
    const processableSettlements: DealerSettlement[] = [];
    const skippedSettlements: Array<{ settlementId: string; reason: string }> = [];

    for (const settlement of settlements) {
      let canProcess = false;
      let skipReason = 'No matching payment rule';

      for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
        if (!rule.isActive) continue;

        // Check conditions
        const meetsConditions = this.checkRuleConditions(settlement, rule);
        
        if (meetsConditions) {
          // Check risk controls
          const passesRiskControls = await this.checkRiskControls(settlement, rule);
          
          if (passesRiskControls) {
            canProcess = true;
            break;
          } else {
            skipReason = 'Failed risk control checks';
          }
        }
      }

      if (canProcess) {
        processableSettlements.push(settlement);
      } else {
        skippedSettlements.push({
          settlementId: settlement.id,
          reason: skipReason,
        });
      }
    }

    return { processableSettlements, skippedSettlements };
  }

  private checkRuleConditions(settlement: DealerSettlement, rule: PaymentRule): boolean {
    // Amount check
    if (settlement.netPayable < rule.conditions.minSettlementAmount ||
        settlement.netPayable > rule.conditions.maxSettlementAmount) {
      return false;
    }

    // Status check
    if (!rule.conditions.settlementStatus.includes(settlement.status)) {
      return false;
    }

    // Days from approval check
    if (settlement.approvedAt) {
      const daysSinceApproval = Math.floor(
        (new Date().getTime() - settlement.approvedAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSinceApproval < rule.conditions.daysFromApproval) {
        return false;
      }
    }

    return true;
  }

  private async checkRiskControls(settlement: DealerSettlement, rule: PaymentRule): Promise<boolean> {
    // Check daily limit
    const todayTotal = await this.getTodayPaymentTotal(settlement.tenantId);
    if (todayTotal + settlement.netPayable > rule.riskControls.dailyLimit) {
      return false;
    }

    // Check monthly limit
    const monthlyTotal = await this.getMonthlyPaymentTotal(settlement.tenantId);
    if (monthlyTotal + settlement.netPayable > rule.riskControls.monthlyLimit) {
      return false;
    }

    // Duplicate check
    if (rule.riskControls.duplicateCheck) {
      const hasDuplicate = await this.checkForDuplicatePayment(settlement);
      if (hasDuplicate) {
        return false;
      }
    }

    // Fraud check (simplified)
    if (rule.riskControls.fraudCheck) {
      const isSuspicious = await this.checkForFraudIndicators(settlement);
      if (isSuspicious) {
        return false;
      }
    }

    return true;
  }

  private groupSettlementsIntoBatches(
    settlements: DealerSettlement[],
    maxBatchSize: number,
  ): Array<{ paymentMethod: string; settlements: DealerSettlement[] }> {
    // Group by payment method
    const groupedByMethod = settlements.reduce((groups, settlement) => {
      const method = settlement.paymentMethod || 'BANK_TRANSFER';
      if (!groups[method]) {
        groups[method] = [];
      }
      groups[method].push(settlement);
      return groups;
    }, {} as Record<string, DealerSettlement[]>);

    const batches: Array<{ paymentMethod: string; settlements: DealerSettlement[] }> = [];

    // Split each payment method group into batches
    for (const [method, methodSettlements] of Object.entries(groupedByMethod)) {
      for (let i = 0; i < methodSettlements.length; i += maxBatchSize) {
        const batchSettlements = methodSettlements.slice(i, i + maxBatchSize);
        batches.push({
          paymentMethod: method,
          settlements: batchSettlements,
        });
      }
    }

    return batches;
  }

  private async createPaymentBatch(
    batchData: { paymentMethod: string; settlements: DealerSettlement[] },
    tenantId: string,
  ): Promise<PaymentBatch> {
    const batchId = uuidv4();
    const batchNumber = `PB-${Date.now()}-${batchId.slice(-6)}`;
    const totalAmount = batchData.settlements.reduce((sum, s) => sum + s.netPayable, 0);

    const batch: PaymentBatch = {
      batchId,
      batchNumber,
      batchDate: new Date(),
      totalAmount,
      totalSettlements: batchData.settlements.length,
      paymentMethod: batchData.paymentMethod,
      status: 'PENDING',
      settlements: batchData.settlements.map(settlement => ({
        settlementId: settlement.id,
        stationId: settlement.stationId,
        dealerId: settlement.stationId, // Assuming stationId maps to dealerId
        amount: settlement.netPayable,
        paymentReference: `SETT-${settlement.stationId}-${settlement.windowId}`,
        bankDetails: {
          accountName: settlement.bankAccountDetails?.accountName || 'TBD',
          accountNumber: settlement.bankAccountDetails?.accountNumber || 'TBD',
          bankName: settlement.bankAccountDetails?.bankName || 'TBD',
          bankCode: settlement.bankAccountDetails?.bankCode || 'TBD',
        },
      })),
      tenantId,
    };

    // Save batch to database (mock)
    await this.savePaymentBatch(batch);

    return batch;
  }

  private async processPayment(paymentData: {
    amount: number;
    recipientAccount: string;
    recipientName: string;
    bankCode: string;
    reference: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Mock payment processing - would integrate with actual banking APIs
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      throw new Error('Payment failed - Insufficient funds or invalid account');
    }
  }

  // Mock data helper methods

  private async getTodayPaymentTotal(tenantId: string): Promise<number> {
    // Mock implementation - would query actual payment totals
    return 50000; // GHS 50k processed today
  }

  private async getMonthlyPaymentTotal(tenantId: string): Promise<number> {
    // Mock implementation - would query actual monthly totals
    return 500000; // GHS 500k processed this month
  }

  private async checkForDuplicatePayment(settlement: DealerSettlement): Promise<boolean> {
    // Mock implementation - would check for duplicate payments
    return false;
  }

  private async checkForFraudIndicators(settlement: DealerSettlement): Promise<boolean> {
    // Mock implementation - would check fraud indicators
    return false;
  }

  private async getPaymentBatch(batchId: string, tenantId: string): Promise<PaymentBatch | null> {
    // Mock implementation - would get from database
    return null;
  }

  private async savePaymentBatch(batch: PaymentBatch): Promise<void> {
    // Mock implementation - would save to database
    this.logger.log(`Payment batch saved: ${batch.batchNumber}`);
  }

  private async updatePaymentBatchStatus(batchId: string, status: string, details: any): Promise<void> {
    // Mock implementation - would update database
    this.logger.log(`Payment batch ${batchId} status updated to ${status}`);
  }

  private async savePaymentInstructions(instructions: PaymentInstruction[]): Promise<void> {
    // Mock implementation - would save to database
    this.logger.log(`${instructions.length} payment instructions saved`);
  }

  private async getPaymentsForPeriod(tenantId: string, periodStart: Date, periodEnd: Date): Promise<any[]> {
    // Mock implementation - would get actual payment data
    return [];
  }

  private async getFailedPaymentsFromBatch(batchId: string): Promise<any[]> {
    // Mock implementation - would get failed payments
    return [];
  }

  private async updatePaymentStatus(settlementId: string, status: string): Promise<void> {
    // Mock implementation - would update payment status
    this.logger.log(`Payment status for settlement ${settlementId} updated to ${status}`);
  }

  // Report generation helper methods

  private calculatePaymentSummary(payments: any[]): any {
    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      successfulPayments: payments.filter(p => p.status === 'COMPLETED').length,
      failedPayments: payments.filter(p => p.status === 'FAILED').length,
      pendingPayments: payments.filter(p => p.status === 'PENDING').length,
      averageProcessingTime: 2.5, // Mock average
    };
  }

  private groupPaymentsByMethod(payments: any[]): Record<string, any> {
    return {
      'BANK_TRANSFER': { count: 100, amount: 500000, successRate: 95 },
      'MOBILE_MONEY': { count: 20, amount: 50000, successRate: 90 },
    };
  }

  private groupPaymentsByDealer(payments: any[]): any[] {
    return [
      {
        dealerId: 'DEALER-001',
        stationId: 'STATION-001',
        paymentsCount: 5,
        totalAmount: 25000,
        averageAmount: 5000,
        successRate: 100,
      },
    ];
  }

  private analyzePaymentFailures(payments: any[]): any {
    return {
      reasonBreakdown: {
        'Invalid account': 5,
        'Insufficient funds': 2,
        'Network error': 1,
      },
      topFailedDealers: [
        {
          dealerId: 'DEALER-002',
          failureCount: 3,
          commonReason: 'Invalid account',
        },
      ],
    };
  }

  private calculateComplianceMetrics(payments: any[]): any {
    return {
      slaCompliance: 92, // 92% within SLA
      averageDelay: 0.5, // 0.5 hours average delay
      escalations: 2,
    };
  }

  private generateRecommendations(payments: any[]): string[] {
    return [
      'Consider increasing batch processing frequency to improve payment turnaround',
      'Review dealer account details to reduce payment failures',
      'Implement real-time account validation to prevent invalid account errors',
    ];
  }

  /**
   * Scheduled task for automated payment processing
   * Blueprint: runs automatically based on configured schedule
   */
  @Cron('0 */2 * * * *') // Every 2 hours
  async scheduledAutomatedPayments(): Promise<void> {
    this.logger.log('Running scheduled automated payment processing');

    try {
      // Get all active tenants (would query from configuration)
      const activeTenants = await this.getActiveTenants();

      for (const tenant of activeTenants) {
        try {
          const result = await this.processAutomatedPayments(tenant.tenantId, 50, false);
          
          if (result.batchesCreated.length > 0) {
            this.logger.log(`Processed automated payments for tenant ${tenant.tenantId}: ${result.batchesCreated.length} batches, GHS ${result.totalAmount.toFixed(2)}`);
          }
        } catch (error) {
          this.logger.error(`Failed to process automated payments for tenant ${tenant.tenantId}:`, error);
        }
      }

      this.logger.log('Scheduled automated payment processing completed');
      
    } catch (error) {
      this.logger.error('Failed to run scheduled automated payments:', error);
    }
  }

  private async getActiveTenants(): Promise<Array<{ tenantId: string }>> {
    // Mock implementation - would get from configuration service
    return [{ tenantId: 'default-tenant' }];
  }
}