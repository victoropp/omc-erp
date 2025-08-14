import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Services
import { AutomatedPostingService } from './services/automated-posting.service';
import { TransactionTemplateService } from './services/transaction-template.service';
import { PostingRuleEngine } from './services/posting-rule-engine.service';
import { IFRSComplianceService } from './services/ifrs-compliance.service';
import { ToleranceCheckService } from './services/tolerance-check.service';
import { AuditTrailService } from './services/audit-trail.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';

// Controllers
import { AutomatedPostingController } from './controllers/automated-posting.controller';
import { TransactionTemplateController } from './controllers/transaction-template.controller';
import { PostingRuleController } from './controllers/posting-rule.controller';

// Entities
import { JournalEntryTemplate } from './entities/journal-entry-template.entity';
import { AutomatedPostingRule } from './entities/automated-posting-rule.entity';
import { PostingTolerance } from './entities/posting-tolerance.entity';
import { AutomationAuditLog } from './entities/automation-audit-log.entity';
import { ApprovalWorkflow } from './entities/approval-workflow.entity';
import { WorkflowApproval } from './entities/workflow-approval.entity';
import { IFRSAdjustment } from './entities/ifrs-adjustment.entity';
import { RevenueRecognitionSchedule } from './entities/revenue-recognition-schedule.entity';
import { ExpectedCreditLoss } from './entities/expected-credit-loss.entity';
import { LeaseAccounting } from './entities/lease-accounting.entity';

// Event Handlers
import { TransactionEventHandler } from './handlers/transaction-event.handler';
import { InventoryEventHandler } from './handlers/inventory-event.handler';
import { UppfEventHandler } from './handlers/uppf-event.handler';
import { DealerEventHandler } from './handlers/dealer-event.handler';
import { PeriodEndEventHandler } from './handlers/period-end-event.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntryTemplate,
      AutomatedPostingRule,
      PostingTolerance,
      AutomationAuditLog,
      ApprovalWorkflow,
      WorkflowApproval,
      IFRSAdjustment,
      RevenueRecognitionSchedule,
      ExpectedCreditLoss,
      LeaseAccounting,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    AutomatedPostingController,
    TransactionTemplateController,
    PostingRuleController,
  ],
  providers: [
    AutomatedPostingService,
    TransactionTemplateService,
    PostingRuleEngine,
    IFRSComplianceService,
    ToleranceCheckService,
    AuditTrailService,
    ApprovalWorkflowService,
    
    // Event Handlers
    TransactionEventHandler,
    InventoryEventHandler,
    UppfEventHandler,
    DealerEventHandler,
    PeriodEndEventHandler,
  ],
  exports: [
    AutomatedPostingService,
    TransactionTemplateService,
    PostingRuleEngine,
    IFRSComplianceService,
  ],
})
export class AutomatedPostingModule {}