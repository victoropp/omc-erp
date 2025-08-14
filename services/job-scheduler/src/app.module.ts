import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { JobSchedulerModule } from './job-scheduler/job-scheduler.module';
import { JobQueueModule } from './job-queue/job-queue.module';
import { CronJobModule } from './cron-job/cron-job.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),

    // Redis Cache
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300, // 5 minutes default
    }),

    // Bull Queue with Redis
    BullModule.forRootAsync({
      useFactory: async () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 50,
          removeOnFail: 50,
        },
      }),
    }),

    // Cron scheduler
    ScheduleModule.forRoot(),

    // Application modules
    JobSchedulerModule,
    JobQueueModule,
    CronJobModule,
    MonitoringModule,
  ],
})
export class AppModule {}