import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceRegistryModule } from './service-registry/service-registry.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { WebSocketModule } from './websocket/websocket.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),

    // Redis Cache for service data
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 60, // 1 minute default TTL for service data
      max: 1000,
    }),

    // Scheduled tasks for health checks
    ScheduleModule.forRoot(),

    // Core modules
    ServiceRegistryModule,
    ServiceDiscoveryModule,
    HealthCheckModule,
    EventBusModule,
    WebSocketModule,
  ],
})
export class AppModule {}