import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

// Feature Modules
import { DealerOnboardingModule } from './onboarding/dealer-onboarding.module';
import { DealerMarginModule } from './margins/dealer-margin.module';
import { LoanManagementModule } from './loans/loan-management.module';
import { SettlementProcessingModule } from './settlements/settlement-processing.module';
import { DealerAnalyticsModule } from './analytics/dealer-analytics.module';
import { HealthModule } from './health/health.module';

// Shared Modules
import { DatabaseModule } from './database/database.module';
import { NotificationModule } from './notifications/notification.module';

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
        port: config.get('DB_PORT', 5432),
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

    // Core modules
    DatabaseModule,
    HealthModule,
    NotificationModule,

    // Feature modules
    DealerOnboardingModule,
    DealerMarginModule,
    LoanManagementModule,
    SettlementProcessingModule,
    DealerAnalyticsModule,
  ],
})
export class AppModule {}