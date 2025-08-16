import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { MobileMoneyModule } from './mobile-money/mobile-money.module';
import { SettlementModule } from './settlement/settlement.module';
import { ForexModule } from './forex/forex.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { WebhookModule } from './webhook/webhook.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5434,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'omc_erp',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 100,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    MobileMoneyModule,
    SettlementModule,
    ForexModule,
    ReconciliationModule,
    WebhookModule,
    NotificationModule,
  ],
})
export class PaymentModule {}