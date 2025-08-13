import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { StationsModule } from './stations/stations.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { FinancialModule } from './financial/financial.module';
import { HumanResourceModule } from './human-resource/human-resource.module';
import { InventoryModule } from './inventory/inventory.module';
import { CustomerModule } from './customer/customer.module';
import { ComplianceModule } from './compliance/compliance.module';
import { RegulatoryModule } from './regulatory/regulatory.module';
import { IoTModule } from './iot/iot.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MobileModule } from './mobile/mobile.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { GraphQLModule } from './graphql/graphql.module';
import { MetricsModule } from './metrics/metrics.module';
import { SecurityModule } from './security/security.module';
import { ApiVersioningModule } from './versioning/versioning.module';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';
import { RequestTraceMiddleware } from './middleware/request-trace.middleware';
import { CompressionMiddleware } from './middleware/compression.middleware';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),

    // Caching with Redis
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes default TTL
      max: 1000, // max items in cache
    }),

    // Advanced Rate limiting with multiple strategies
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 300, // 300 requests per minute
      },
      {
        name: 'daily',
        ttl: 86400000, // 24 hours
        limit: 10000, // 10k requests per day
      }
    ]),

    // Core modules
    LoggerModule,
    HealthModule,
    MetricsModule,
    SecurityModule,
    ApiVersioningModule,

    // Business modules (proxies to microservices)
    ProxyModule,
    AuthModule,
    FinancialModule,
    HumanResourceModule,
    TransactionsModule,
    InventoryModule,
    StationsModule,
    CustomerModule,
    ComplianceModule,
    RegulatoryModule,
    IoTModule,
    RealtimeModule,
    MobileModule,
    IntegrationsModule,
    GraphQLModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware, RequestTraceMiddleware, CompressionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}