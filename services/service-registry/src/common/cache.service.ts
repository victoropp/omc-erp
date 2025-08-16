import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { value: any; expiry: number }>();

  async get<T = any>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl: number = 60000): Promise<void> {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());
    if (!pattern) {
      return keys;
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  // Cleanup expired entries periodically
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Start cleanup interval
  constructor() {
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }
}