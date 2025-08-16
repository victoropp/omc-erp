import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  refresh?: boolean; // Force refresh cache
  tags?: string[]; // Cache tags for invalidation
  compression?: boolean; // Enable compression for large objects
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  memoryUsage: number;
  keyCount: number;
}

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redisClient: RedisClient;
  private readonly defaultTTL = 300; // 5 minutes
  private statistics: CacheStatistics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
    memoryUsage: 0,
    keyCount: 0,
  };

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private async initializeRedis(): Promise<void> {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      showFriendlyErrorStack: true,
      family: 4, // IPv4
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    this.redisClient = new Redis(redisConfig);

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis successfully');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis client is ready');
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.warn('Reconnecting to Redis...');
    });

    try {
      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(this.prefixKey(key));
      
      if (value === null) {
        this.statistics.misses++;
        return null;
      }

      this.statistics.hits++;
      this.updateHitRate();
      
      return this.deserialize<T>(value);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      this.statistics.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = this.serialize(value, options.compression);
      
      if (options.tags) {
        // Store tags for cache invalidation
        await this.setTags(key, options.tags);
      }

      await this.redisClient.setex(this.prefixKey(key), ttl, serializedValue);
      this.statistics.sets++;
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set value in cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    if (!options.refresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Fetch fresh data
    const value = await fetcher();
    
    // Store in cache
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.del(this.prefixKey(key));
      if (result > 0) {
        this.statistics.deletes++;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<number> {
    try {
      const prefixedKeys = keys.map(key => this.prefixKey(key));
      const result = await this.redisClient.del(...prefixedKeys);
      this.statistics.deletes += result;
      return result;
    } catch (error) {
      this.logger.error('Error deleting multiple cache keys:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking if cache key exists ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration for key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(this.prefixKey(key), ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiration for cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error getting TTL for cache key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.redisClient.incrby(this.prefixKey(key), value);
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Cache warming strategies
   */
  async warmCache(warmers: Array<{ key: string; fetcher: () => Promise<any>; options?: CacheOptions }>): Promise<void> {
    this.logger.log(`Warming cache with ${warmers.length} items...`);
    
    const promises = warmers.map(async ({ key, fetcher, options }) => {
      try {
        const value = await fetcher();
        await this.set(key, value, options);
        return { key, success: true };
      } catch (error) {
        this.logger.error(`Failed to warm cache for key ${key}:`, error);
        return { key, success: false };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    this.logger.log(`Cache warming completed: ${successful}/${warmers.length} items cached`);
  }

  /**
   * Cache invalidation by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    
    for (const tag of tags) {
      const keys = await this.redisClient.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        const deleted = await this.delMany(keys);
        totalDeleted += deleted;
        
        // Remove the tag set
        await this.redisClient.del(`tag:${tag}`);
      }
    }
    
    this.logger.log(`Invalidated ${totalDeleted} cache entries for tags: ${tags.join(', ')}`);
    return totalDeleted;
  }

  /**
   * Cache invalidation patterns
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisClient.keys(this.prefixKey(pattern));
      if (keys.length > 0) {
        const result = await this.redisClient.del(...keys);
        this.statistics.deletes += result;
        return result;
      }
      return 0;
    } catch (error) {
      this.logger.error(`Error invalidating pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Bulk operations for better performance
   */
  async mget(keys: string[]): Promise<Record<string, any>> {
    try {
      const prefixedKeys = keys.map(key => this.prefixKey(key));
      const values = await this.redisClient.mget(...prefixedKeys);
      
      const result: Record<string, any> = {};
      keys.forEach((key, index) => {
        const value = values[index];
        if (value !== null) {
          result[key] = this.deserialize(value);
          this.statistics.hits++;
        } else {
          this.statistics.misses++;
        }
      });
      
      this.updateHitRate();
      return result;
    } catch (error) {
      this.logger.error('Error in bulk get operation:', error);
      return {};
    }
  }

  async mset(data: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      const pipeline = this.redisClient.pipeline();
      
      Object.entries(data).forEach(([key, value]) => {
        const serializedValue = this.serialize(value);
        if (ttl) {
          pipeline.setex(this.prefixKey(key), ttl, serializedValue);
        } else {
          pipeline.set(this.prefixKey(key), serializedValue);
        }
      });
      
      await pipeline.exec();
      this.statistics.sets += Object.keys(data).length;
      return true;
    } catch (error) {
      this.logger.error('Error in bulk set operation:', error);
      return false;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await this.redisClient.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getStatistics(): Promise<CacheStatistics> {
    try {
      const info = await this.redisClient.info('memory');
      const memoryUsage = this.parseMemoryInfo(info);
      const keyCount = await this.redisClient.dbsize();
      
      return {
        ...this.statistics,
        memoryUsage,
        keyCount,
      };
    } catch (error) {
      this.logger.error('Error getting cache statistics:', error);
      return this.statistics;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await this.redisClient.flushdb();
      this.resetStatistics();
      return true;
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private prefixKey(key: string): string {
    const prefix = this.configService.get<string>('CACHE_PREFIX', 'omc:erp');
    return `${prefix}:${key}`;
  }

  private serialize<T>(value: T, compress: boolean = false): string {
    const serialized = JSON.stringify(value);
    
    if (compress && serialized.length > 1024) {
      // Implement compression here if needed
      // For now, just return the serialized value
    }
    
    return serialized;
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Error deserializing cache value:', error);
      return null;
    }
  }

  private async setTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    
    tags.forEach(tag => {
      pipeline.sadd(`tag:${tag}`, key);
    });
    
    await pipeline.exec();
  }

  private updateHitRate(): void {
    const total = this.statistics.hits + this.statistics.misses;
    this.statistics.hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;
  }

  private parseMemoryInfo(info: string): number {
    const lines = info.split('\r\n');
    const usedMemoryLine = lines.find(line => line.startsWith('used_memory:'));
    
    if (usedMemoryLine) {
      const value = usedMemoryLine.split(':')[1];
      return parseInt(value, 10);
    }
    
    return 0;
  }

  private resetStatistics(): void {
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      memoryUsage: 0,
      keyCount: 0,
    };
  }
}

/**
 * Cache decorators for automatic caching
 */
export function Cacheable(options: CacheOptions & { key?: string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService: RedisCacheService = this.cacheService || this.redis;
      
      if (!cacheService) {
        return originalMethod.apply(this, args);
      }
      
      // Generate cache key
      const cacheKey = options.key || `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      return cacheService.getOrSet(cacheKey, async () => {
        return originalMethod.apply(this, args);
      }, options);
    };
    
    return descriptor;
  };
}

export function CacheEvict(options: { key?: string; pattern?: string; tags?: string[] } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      const cacheService: RedisCacheService = this.cacheService || this.redis;
      
      if (cacheService) {
        if (options.tags) {
          await cacheService.invalidateByTags(options.tags);
        } else if (options.pattern) {
          await cacheService.invalidatePattern(options.pattern);
        } else if (options.key) {
          await cacheService.del(options.key);
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
}