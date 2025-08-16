import { Module, NestModule, MiddlewareConsumer, RequestMethod, Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServiceAuthMiddleware, ServiceAuthGuard } from '../../../packages/shared-types/src/service-auth';

// Simple cache service implementation for service auth
@Injectable()
export class SimpleCacheService {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expires = Date.now() + (ttl || 300000); // Default 5 minutes
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    SimpleCacheService,
    {
      provide: 'ICacheService',
      useExisting: SimpleCacheService,
    },
    {
      provide: APP_GUARD,
      useClass: ServiceAuthGuard,
    },
  ],
  exports: [SimpleCacheService],
})
export class ServiceAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply service authentication middleware to all routes except health checks
    consumer
      .apply(ServiceAuthMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.ALL },
        { path: 'metrics', method: RequestMethod.ALL },
        { path: 'ping', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}