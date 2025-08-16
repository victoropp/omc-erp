import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Core Accounting Modules
import { GeneralLedgerModule } from './general-ledger/general-ledger.module';
import { AccountsPayableModule } from './accounts-payable/accounts-payable.module';
import { AccountsReceivableModule } from './accounts-receivable/accounts-receivable.module';
import { BankCashModule } from './bank-cash/bank-cash.module';
import { FinancialReportingModule } from './financial-reporting/financial-reporting.module';
import { CostManagementModule } from './cost-management/cost-management.module';
import { TaxManagementModule } from './tax-management/tax-management.module';
import { ProjectAccountingModule } from './project-accounting/project-accounting.module';
import { IFRSComplianceModule } from './ifrs-compliance/ifrs-compliance.module';
import { PrepaymentModule } from './prepayment/prepayment.module';
import { AccrualModule } from './accrual/accrual.module';

// Additional Modules
import { FixedAssetsModule } from './fixed-assets/fixed-assets.module';
import { BudgetModule } from './budget/budget.module';
import { ClosingProceduresModule } from './closing-procedures/closing-procedures.module';
import { ConsolidationModule } from './consolidation/consolidation.module';
import { IntercompanyModule } from './intercompany/intercompany.module';

// Background Jobs
import { AccountingJobsModule } from './jobs/accounting-jobs.module';

// Automated Posting System
import { AutomatedPostingModule } from './automated-posting/automated-posting.module';

// WebSocket for Real-time Updates
import { AccountingGateway } from './gateways/accounting.gateway';

// Service Authentication
import { ServiceAuthModule } from './auth/service-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5434),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'omc_erp'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    
    // Service Authentication
    ServiceAuthModule,
    
    // Core Accounting Modules
    GeneralLedgerModule,
    AccountsPayableModule,
    AccountsReceivableModule,
    BankCashModule,
    FinancialReportingModule,
    CostManagementModule,
    TaxManagementModule,
    ProjectAccountingModule,
    IFRSComplianceModule,
    PrepaymentModule,
    AccrualModule,
    
    // Additional Modules
    FixedAssetsModule,
    BudgetModule,
    ClosingProceduresModule,
    ConsolidationModule,
    IntercompanyModule,
    
    // Background Jobs
    AccountingJobsModule,
    
    // Automated Posting System
    AutomatedPostingModule,
  ],
  providers: [AccountingGateway],
})
export class AppModule {}