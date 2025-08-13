import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

// Job Services
import { DepreciationJobService } from './depreciation-job.service';
import { PeriodEndJobService } from './period-end-job.service';
import { TrialBalanceJobService } from './trial-balance-job.service';
import { ReconciliationJobService } from './reconciliation-job.service';
import { ReportGenerationJobService } from './report-generation-job.service';
import { DataIntegrityJobService } from './data-integrity-job.service';
import { BackupJobService } from './backup-job.service';
import { AlertJobService } from './alert-job.service';
import { TaxCalculationJobService } from './tax-calculation-job.service';
import { IFRSComplianceJobService } from './ifrs-compliance-job.service';

// Import entities from other modules
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';
import { AssetDepreciation } from '../fixed-assets/entities/asset-depreciation.entity';
import { JournalEntry } from '../general-ledger/entities/journal-entry.entity';
import { GeneralLedgerEntry } from '../general-ledger/entities/general-ledger-entry.entity';
import { AccountingPeriod } from '../general-ledger/entities/accounting-period.entity';
import { TrialBalanceSnapshot } from '../general-ledger/entities/trial-balance-snapshot.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      FixedAsset,
      AssetDepreciation,
      JournalEntry,
      GeneralLedgerEntry,
      AccountingPeriod,
      TrialBalanceSnapshot,
    ]),
  ],
  providers: [
    DepreciationJobService,
    PeriodEndJobService,
    TrialBalanceJobService,
    ReconciliationJobService,
    ReportGenerationJobService,
    DataIntegrityJobService,
    BackupJobService,
    AlertJobService,
    TaxCalculationJobService,
    IFRSComplianceJobService,
  ],
  exports: [
    DepreciationJobService,
    PeriodEndJobService,
    TrialBalanceJobService,
    ReconciliationJobService,
    ReportGenerationJobService,
    DataIntegrityJobService,
    BackupJobService,
    AlertJobService,
    TaxCalculationJobService,
    IFRSComplianceJobService,
  ],
})
export class AccountingJobsModule {}