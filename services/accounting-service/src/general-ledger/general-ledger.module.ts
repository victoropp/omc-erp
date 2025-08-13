import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralLedgerController } from './general-ledger.controller';
import { GeneralLedgerService } from './general-ledger.service';
import { JournalEntryService } from './journal-entry.service';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { AccountingPeriodService } from './accounting-period.service';

// Entities
import { ChartOfAccount } from './entities/chart-of-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { GeneralLedgerEntry } from './entities/general-ledger-entry.entity';
import { AccountingPeriod } from './entities/accounting-period.entity';
import { TrialBalanceSnapshot } from './entities/trial-balance-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChartOfAccount,
      JournalEntry,
      JournalEntryLine,
      GeneralLedgerEntry,
      AccountingPeriod,
      TrialBalanceSnapshot,
    ]),
  ],
  controllers: [GeneralLedgerController],
  providers: [
    GeneralLedgerService,
    JournalEntryService,
    ChartOfAccountsService,
    AccountingPeriodService,
  ],
  exports: [
    GeneralLedgerService,
    JournalEntryService,
    ChartOfAccountsService,
    AccountingPeriodService,
  ],
})
export class GeneralLedgerModule {}