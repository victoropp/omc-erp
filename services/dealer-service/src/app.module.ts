import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

// Entities
import { DealerLoan } from './entities/dealer-loan.entity';
import { DealerLoanPayment } from './entities/dealer-loan-payment.entity';
import { DealerMarginAccrual } from './entities/dealer-margin-accrual.entity';
import { DealerSettlement } from './entities/dealer-settlement.entity';

// Services
import { DealerSettlementService } from './services/dealer-settlement.service';
import { DealerLoanManagementService } from './services/dealer-loan-management.service';
import { DealerMarginAccrualService } from './services/dealer-margin-accrual.service';
import { DealerPerformanceService } from './services/dealer-performance.service';
import { DealerSettlementStatementService } from './services/dealer-settlement-statement.service';
import { DealerPaymentAutomationService } from './services/dealer-payment-automation.service';

// Controllers
import { DealerManagementController } from './controllers/dealer-management.controller';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5434),
        username: config.get('DB_USERNAME', 'omc_erp'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME', 'omc_erp'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Scheduling for automated tasks
    ScheduleModule.forRoot(),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Redis/Bull for job queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // TypeORM for entities
    TypeOrmModule.forFeature([
      DealerLoan,
      DealerLoanPayment,
      DealerMarginAccrual,
      DealerSettlement,
    ]),

  ],
  
  controllers: [
    DealerManagementController,
  ],
  
  providers: [
    DealerSettlementService,
    DealerLoanManagementService,
    DealerMarginAccrualService,
    DealerPerformanceService,
    DealerSettlementStatementService,
    DealerPaymentAutomationService,
  ],
  
  exports: [
    DealerSettlementService,
    DealerLoanManagementService,
    DealerMarginAccrualService,
    DealerPerformanceService,
    DealerSettlementStatementService,
    DealerPaymentAutomationService,
  ],
})
export class AppModule {}