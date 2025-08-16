import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceRegistryModule } from './service-registry/service-registry.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CacheModule } from './common/cache.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),

    // Global cache module (replaces @nestjs/cache-manager temporarily)
    CacheModule,

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