import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccrualService } from './accrual.service';
import { AccrualController } from './accrual.controller';
import { AccrualReportingService } from './accrual-reporting.service';
import { AccrualAnalyticsService } from './accrual-analytics.service';
import { RecurringAccrualService } from './recurring-accrual.service';

// Accrual Entities
import { Accrual } from './entities/accrual.entity';
import { AccrualJournalEntry } from './entities/accrual-journal-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Accrual,
      AccrualJournalEntry,
    ]),
  ],
  controllers: [AccrualController],
  providers: [
    AccrualService,
    AccrualReportingService,
    AccrualAnalyticsService,
    RecurringAccrualService,
  ],
  exports: [
    AccrualService,
    AccrualReportingService,
    AccrualAnalyticsService,
    RecurringAccrualService,
  ],
})
export class AccrualModule {}