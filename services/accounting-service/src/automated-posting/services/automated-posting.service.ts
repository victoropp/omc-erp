import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

// Entities
import { JournalEntryTemplate } from '../entities/journal-entry-template.entity';
import { AutomatedPostingRule } from '../entities/automated-posting-rule.entity';
import { AutomationAuditLog, AutomationEvent, AutomationStatus } from '../entities/automation-audit-log.entity';

// Services
import { TransactionTemplateService } from './transaction-template.service';
import { PostingRuleEngine } from './posting-rule-engine.service';
import { IFRSComplianceService } from './ifrs-compliance.service';
import { ToleranceCheckService } from './tolerance-check.service';
import { AuditTrailService } from './audit-trail.service';
import { ApprovalWorkflowService } from './approval-workflow.service';

// General Ledger entities (import from general-ledger module)
import { JournalEntry } from '../../general-ledger/entities/journal-entry.entity';
import { JournalEntryLine } from '../../general-ledger/entities/journal-entry-line.entity';

export interface TransactionEvent {
  eventType: string;
  transactionType: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  transactionData: Record<string, any>;
  stationId?: string;
  customerId?: string;
  timestamp: Date;
}

export interface ProcessingResult {
  success: boolean;
  journalEntryId?: string;
  errorMessage?: string;
  warningMessage?: string;
  approvalRequired?: boolean;
  workflowId?: string;
  auditLogId: string;
}

@Injectable()
export class AutomatedPostingService {
  private readonly logger = new Logger(AutomatedPostingService.name);

  constructor(
    @InjectRepository(JournalEntryTemplate)
    private templateRepository: Repository<JournalEntryTemplate>,
    @InjectRepository(AutomatedPostingRule)
    private ruleRepository: Repository<AutomatedPostingRule>,
    @InjectRepository(AutomationAuditLog)
    private auditLogRepository: Repository<AutomationAuditLog>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLineRepository: Repository<JournalEntryLine>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private templateService: TransactionTemplateService,
    private ruleEngine: PostingRuleEngine,
    private ifrsService: IFRSComplianceService,
    private toleranceService: ToleranceCheckService,
    private auditService: AuditTrailService,
    private approvalService: ApprovalWorkflowService,
  ) {}

  /**
   * Main entry point for automated journal posting
   */
  async processTransaction(event: TransactionEvent): Promise<ProcessingResult> {
    const startTime = Date.now();
    let auditLog: AutomationAuditLog;

    try {
      // Create audit log entry
      auditLog = await this.auditService.createAuditLog({
        event_type: AutomationEvent.RULE_TRIGGERED,
        status: AutomationStatus.PENDING,
        source_document_type: event.sourceDocumentType,
        source_document_id: event.sourceDocumentId,
        source_data: event.transactionData,
      });

      this.logger.log(`Processing transaction: ${event.eventType} for document ${event.sourceDocumentId}`);

      // Find applicable posting rules
      const applicableRules = await this.ruleEngine.findApplicableRules(event);
      
      if (applicableRules.length === 0) {
        this.logger.warn(`No applicable rules found for transaction type: ${event.transactionType}`);
        await this.auditService.updateAuditLog(auditLog.log_id, {
          status: AutomationStatus.FAILED,
          error_message: 'No applicable posting rules found',
          processing_time_ms: Date.now() - startTime,
        });
        return {
          success: false,
          errorMessage: 'No applicable posting rules found',
          auditLogId: auditLog.log_id,
        };
      }

      // Process rules in priority order
      const sortedRules = applicableRules.sort((a, b) => a.priority - b.priority);
      
      for (const rule of sortedRules) {
        const result = await this.processRule(rule, event, auditLog);
        if (result.success || result.approvalRequired) {
          return result;
        }
      }

      // If no rules succeeded
      await this.auditService.updateAuditLog(auditLog.log_id, {
        status: AutomationStatus.FAILED,
        error_message: 'All applicable rules failed to process',
        processing_time_ms: Date.now() - startTime,
      });

      return {
        success: false,
        errorMessage: 'All applicable rules failed to process',
        auditLogId: auditLog.log_id,
      };

    } catch (error) {
      this.logger.error(`Error processing transaction: ${error.message}`, error.stack);
      
      if (auditLog) {
        await this.auditService.updateAuditLog(auditLog.log_id, {
          status: AutomationStatus.FAILED,
          error_message: error.message,
          error_stack: error.stack,
          processing_time_ms: Date.now() - startTime,
        });
      }

      return {
        success: false,
        errorMessage: error.message,
        auditLogId: auditLog?.log_id,
      };
    }
  }

  /**
   * Process individual posting rule
   */
  private async processRule(
    rule: AutomatedPostingRule, 
    event: TransactionEvent, 
    auditLog: AutomationAuditLog
  ): Promise<ProcessingResult> {
    const template = await this.templateRepository.findOne({
      where: { template_id: rule.template_id },
    });

    if (!template || !template.is_active) {
      throw new Error(`Template not found or inactive: ${rule.template_id}`);
    }

    // Generate journal entries from template
    const journalData = await this.templateService.generateJournalEntries(
      template,
      event.transactionData,
      event
    );

    // Perform tolerance checks
    const toleranceResult = await this.toleranceService.checkTolerances(
      journalData,
      event.transactionType
    );

    // Check if approval is required
    const approvalRequired = template.approval_required || 
                            toleranceResult.requiresApproval ||
                            (template.approval_threshold && 
                             journalData.totalAmount > template.approval_threshold);

    if (approvalRequired) {
      const workflowId = await this.approvalService.initiateApproval({
        workflow_type: 'JOURNAL_ENTRY',
        source_document_type: event.sourceDocumentType,
        source_document_id: event.sourceDocumentId,
        amount: journalData.totalAmount,
        business_context: {
          template_code: template.template_code,
          transaction_type: event.transactionType,
          tolerance_violations: toleranceResult.violations,
        },
        approval_data: journalData,
      });

      await this.auditService.updateAuditLog(auditLog.log_id, {
        status: AutomationStatus.PENDING,
        workflow_id: workflowId,
        tolerance_checks: toleranceResult.violations,
      });

      return {
        success: false,
        approvalRequired: true,
        workflowId,
        auditLogId: auditLog.log_id,
      };
    }

    // Post journal entry
    const journalEntry = await this.postJournalEntry(journalData, template, event);

    // Process IFRS adjustments
    if (this.requiresIFRSProcessing(template)) {
      await this.ifrsService.processIFRSAdjustments(
        template,
        journalEntry,
        event.transactionData
      );
    }

    // Update audit log
    await this.auditService.updateAuditLog(auditLog.log_id, {
      status: AutomationStatus.SUCCESS,
      journal_entry_id: journalEntry.id,
      processed_data: journalData,
      generated_entries: journalData.lines,
      total_amount: journalData.totalAmount,
      processing_time_ms: Date.now() - parseInt(auditLog.created_at.getTime().toString()),
    });

    // Emit success event
    this.eventEmitter.emit('journal.posted', {
      journalEntryId: journalEntry.id,
      transactionEvent: event,
      template: template,
    });

    return {
      success: true,
      journalEntryId: journalEntry.id,
      auditLogId: auditLog.log_id,
    };
  }

  /**
   * Post journal entry to general ledger
   */
  private async postJournalEntry(
    journalData: any,
    template: JournalEntryTemplate,
    event: TransactionEvent
  ): Promise<JournalEntry> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Generate journal number
      const journalNumber = await this.generateJournalNumber(
        template.template_code,
        event.transactionData.transaction_date || new Date()
      );

      // Create journal entry header
      const journalEntry = manager.create(JournalEntry, {
        journal_number: journalNumber,
        journal_date: new Date(event.transactionData.transaction_date || Date.now()),
        posting_date: new Date(),
        journal_type: template.transaction_type,
        source_module: 'AUTOMATED_POSTING',
        source_document_type: event.sourceDocumentType,
        source_document_id: event.sourceDocumentId,
        description: `${template.name} - ${event.sourceDocumentId}`,
        total_debit: journalData.totalDebit,
        total_credit: journalData.totalCredit,
        status: 'POSTED',
        posted_at: new Date(),
        posted_by: 'SYSTEM',
        created_by: 'AUTOMATED_POSTING',
      });

      const savedJournalEntry = await manager.save(JournalEntry, journalEntry);

      // Create journal entry lines
      let lineNumber = 1;
      for (const line of journalData.lines) {
        const journalLine = manager.create(JournalEntryLine, {
          journal_entry_id: savedJournalEntry.id,
          line_number: lineNumber++,
          account_code: line.account_code,
          description: line.description,
          debit_amount: line.debit_amount || 0,
          credit_amount: line.credit_amount || 0,
          currency_code: line.currency_code || 'GHS',
          exchange_rate: line.exchange_rate || 1,
          base_debit_amount: (line.debit_amount || 0) * (line.exchange_rate || 1),
          base_credit_amount: (line.credit_amount || 0) * (line.exchange_rate || 1),
          station_id: event.stationId,
          customer_id: event.customerId,
          project_code: line.project_code,
          cost_center_code: line.cost_center_code,
        });

        await manager.save(JournalEntryLine, journalLine);
      }

      return savedJournalEntry;
    });
  }

  /**
   * Generate unique journal number
   */
  private async generateJournalNumber(templateCode: string, date: Date): Promise<string> {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `JV-${templateCode}-${dateStr}-${sequence}`;
  }

  /**
   * Check if IFRS processing is required
   */
  private requiresIFRSProcessing(template: JournalEntryTemplate): boolean {
    return template.ifrs15_revenue_recognition ||
           template.ifrs9_expected_credit_loss ||
           template.ifrs16_lease_accounting ||
           template.ias2_inventory_valuation;
  }

  /**
   * Process bulk transactions
   */
  async processBulkTransactions(events: TransactionEvent[]): Promise<ProcessingResult[]> {
    this.logger.log(`Processing bulk transactions: ${events.length} events`);
    
    const results: ProcessingResult[] = [];
    const batchId = crypto.randomUUID();

    // Group by transaction type for optimized processing
    const groupedEvents = this.groupEventsByType(events);

    for (const [transactionType, typeEvents] of groupedEvents) {
      this.logger.log(`Processing ${typeEvents.length} events of type: ${transactionType}`);
      
      for (const event of typeEvents) {
        try {
          const result = await this.processTransaction(event);
          results.push(result);
        } catch (error) {
          this.logger.error(`Error processing event ${event.sourceDocumentId}:`, error);
          results.push({
            success: false,
            errorMessage: error.message,
            auditLogId: batchId, // Use batch ID as fallback
          });
        }
      }
    }

    this.logger.log(`Bulk processing completed: ${results.length} results`);
    return results;
  }

  /**
   * Group events by transaction type for optimized processing
   */
  private groupEventsByType(events: TransactionEvent[]): Map<string, TransactionEvent[]> {
    const grouped = new Map<string, TransactionEvent[]>();
    
    events.forEach(event => {
      const key = event.transactionType;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(event);
    });

    return grouped;
  }

  /**
   * Event handlers for real-time processing
   */
  @OnEvent('fuel.transaction.completed')
  async handleFuelTransaction(payload: any) {
    const event: TransactionEvent = {
      eventType: 'fuel.transaction.completed',
      transactionType: 'FUEL_SALE',
      sourceDocumentType: 'FUEL_TRANSACTION',
      sourceDocumentId: payload.transactionId,
      transactionData: payload,
      stationId: payload.stationId,
      customerId: payload.customerId,
      timestamp: new Date(),
    };

    await this.processTransaction(event);
  }

  @OnEvent('inventory.receipt.approved')
  async handleInventoryReceipt(payload: any) {
    const event: TransactionEvent = {
      eventType: 'inventory.receipt.approved',
      transactionType: 'INVENTORY_RECEIPT',
      sourceDocumentType: 'STOCK_RECEIPT',
      sourceDocumentId: payload.receiptId,
      transactionData: payload,
      stationId: payload.stationId,
      timestamp: new Date(),
    };

    await this.processTransaction(event);
  }

  @OnEvent('uppf.claim.submitted')
  async handleUPPFClaim(payload: any) {
    const event: TransactionEvent = {
      eventType: 'uppf.claim.submitted',
      transactionType: 'UPPF_CLAIM',
      sourceDocumentType: 'UPPF_CLAIM',
      sourceDocumentId: payload.claimId,
      transactionData: payload,
      timestamp: new Date(),
    };

    await this.processTransaction(event);
  }

  @OnEvent('dealer.settlement.approved')
  async handleDealerSettlement(payload: any) {
    const event: TransactionEvent = {
      eventType: 'dealer.settlement.approved',
      transactionType: 'DEALER_SETTLEMENT',
      sourceDocumentType: 'DEALER_SETTLEMENT',
      sourceDocumentId: payload.settlementId,
      transactionData: payload,
      stationId: payload.stationId,
      timestamp: new Date(),
    };

    await this.processTransaction(event);
  }

  /**
   * Scheduled jobs for period-end processing
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyAutomations() {
    this.logger.log('Starting daily automation processing');
    
    // Process pending approvals that may have timed out
    await this.approvalService.processTimeoutApprovals();
    
    // Process scheduled IFRS adjustments
    await this.ifrsService.processDailyAdjustments();
    
    this.logger.log('Daily automation processing completed');
  }

  @Cron('0 0 1 * *') // First day of each month
  async processMonthlyAutomations() {
    this.logger.log('Starting monthly automation processing');
    
    // Process month-end accruals
    await this.processMonthEndAccruals();
    
    // Process lease accounting
    await this.ifrsService.processLeaseAccountingSchedule();
    
    // Process expected credit losses
    await this.ifrsService.processExpectedCreditLosses();
    
    this.logger.log('Monthly automation processing completed');
  }

  /**
   * Process month-end accruals
   */
  private async processMonthEndAccruals() {
    // Implementation for month-end accruals
    const accrualRules = await this.ruleRepository.find({
      where: { 
        trigger_event: 'MONTH_END_ACCRUAL',
        is_active: true,
      },
    });

    for (const rule of accrualRules) {
      try {
        const event: TransactionEvent = {
          eventType: 'period.end.accrual',
          transactionType: 'MONTH_END_ACCRUAL',
          sourceDocumentType: 'PERIOD_END',
          sourceDocumentId: `MONTH_END_${new Date().toISOString().slice(0, 7)}`,
          transactionData: {
            period_date: new Date(),
            accrual_type: 'MONTH_END',
          },
          timestamp: new Date(),
        };

        await this.processTransaction(event);
      } catch (error) {
        this.logger.error(`Error processing accrual rule ${rule.rule_id}:`, error);
      }
    }
  }
}