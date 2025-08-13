import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from '../security.service';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const clientId = this.getClientIdentifier(request);
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    
    // Check different rate limit tiers
    const rateLimits = [
      { key: 'short', windowMs: 1000, limit: 10 }, // 10 per second
      { key: 'medium', windowMs: 10000, limit: 50 }, // 50 per 10 seconds  
      { key: 'long', windowMs: 60000, limit: 300 }, // 300 per minute
      { key: 'daily', windowMs: 86400000, limit: 10000 }, // 10k per day
    ];

    for (const rateLimit of rateLimits) {
      const allowed = await this.checkRateLimit(
        clientId,
        endpoint,
        rateLimit.key,
        rateLimit.windowMs,
        rateLimit.limit,
      );

      if (!allowed) {
        this.securityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          clientId,
          endpoint,
          tier: rateLimit.key,
          limit: rateLimit.limit,
          window: rateLimit.windowMs,
        }, request);

        response.header('X-RateLimit-Limit', rateLimit.limit.toString());
        response.header('X-RateLimit-Remaining', '0');
        response.header('X-RateLimit-Reset', new Date(Date.now() + rateLimit.windowMs).toISOString());

        throw new HttpException(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Limit: ${rateLimit.limit} per ${rateLimit.windowMs / 1000}s`,
            tier: rateLimit.key,
            retryAfter: Math.ceil(rateLimit.windowMs / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private getClientIdentifier(request: any): string {
    // Use API key if available, otherwise use IP + User Agent combo
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      const keyData = this.securityService.validateApiKey(apiKey);
      if (keyData) {
        return `api:${keyData.userId}`;
      }
    }

    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'] || 'unknown';
    return `ip:${ip}:${this.hashString(userAgent)}`;
  }

  private async checkRateLimit(
    clientId: string,
    endpoint: string,
    tier: string,
    windowMs: number,
    limit: number,
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const cacheKey = `rate_limit:${tier}:${clientId}:${endpoint}:${windowStart}`;

    const current = await this.cacheManager.get<number>(cacheKey) || 0;

    if (current >= limit) {
      return false;
    }

    // Increment counter with TTL
    const ttlMs = windowMs + (now - windowStart);
    await this.cacheManager.set(cacheKey, current + 1, ttlMs);

    return true;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}