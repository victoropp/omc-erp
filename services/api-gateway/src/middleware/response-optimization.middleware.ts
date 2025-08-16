import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as compression from 'compression';

interface OptimizedResponse extends Response {
  responseCache?: {
    data: any;
    etag: string;
    lastModified: Date;
    ttl: number;
  };
}

@Injectable()
export class ResponseOptimizationMiddleware implements NestMiddleware {
  private responseCache = new Map<string, any>();
  private compressionMiddleware = compression({
    filter: (req, res) => {
      // Don't compress responses with this request header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Fallback to standard filter function
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (0-9)
  });

  use(req: Request, res: OptimizedResponse, next: NextFunction) {
    // Apply compression
    this.compressionMiddleware(req, res, () => {
      // Add performance optimization headers
      this.addPerformanceHeaders(req, res);
      
      // Add ETag support
      this.addEtagSupport(req, res);
      
      // Add cache control
      this.addCacheControl(req, res);
      
      // Add response time tracking
      this.addResponseTimeTracking(req, res);
      
      // Add payload optimization
      this.addPayloadOptimization(req, res);
      
      next();
    });
  }

  private addPerformanceHeaders(req: Request, res: OptimizedResponse): void {
    // Add standard performance headers
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Add custom performance tracking headers
    res.setHeader('X-Response-Time', Date.now().toString());
    res.setHeader('X-Gateway-Version', '1.0.0');
    
    // Add request correlation ID
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    res.setHeader('X-Correlation-ID', correlationId);
  }

  private addEtagSupport(req: Request, res: OptimizedResponse): void {
    const originalSend = res.send;
    
    res.send = function(body: any) {
      if (body && typeof body === 'object') {
        // Generate ETag for JSON responses
        const etag = crypto
          .createHash('md5')
          .update(JSON.stringify(body))
          .digest('hex');
        
        res.setHeader('ETag', `"${etag}"`);
        
        // Check if client has cached version
        const clientEtag = req.headers['if-none-match'];
        if (clientEtag && clientEtag === `"${etag}"`) {
          res.status(304);
          return originalSend.call(this, '');
        }
        
        // Set Last-Modified header
        res.setHeader('Last-Modified', new Date().toUTCString());
      }
      
      return originalSend.call(this, body);
    };
  }

  private addCacheControl(req: Request, res: OptimizedResponse): void {
    const method = req.method.toLowerCase();
    const path = req.path;
    
    // Set cache control based on endpoint type
    if (method === 'get') {
      if (path.includes('/static/') || path.includes('/assets/')) {
        // Static assets - cache for 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.includes('/api/v1/stations') || path.includes('/api/v1/customers')) {
        // Master data - cache for 1 hour
        res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
      } else if (path.includes('/api/v1/transactions')) {
        // Transaction data - cache for 5 minutes
        res.setHeader('Cache-Control', 'private, max-age=300, must-revalidate');
      } else if (path.includes('/api/v1/pricing')) {
        // Pricing data - cache for 30 minutes
        res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=900');
      } else {
        // Default - cache for 1 minute
        res.setHeader('Cache-Control', 'private, max-age=60, must-revalidate');
      }
    } else {
      // Non-GET requests - no cache
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }

  private addResponseTimeTracking(req: Request, res: OptimizedResponse): void {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      
      // Log slow responses
      if (responseTime > 1000) {
        console.warn(`Slow response detected: ${req.method} ${req.path} - ${responseTime}ms`);
      }
    });
  }

  private addPayloadOptimization(req: Request, res: OptimizedResponse): void {
    const originalJson = res.json;
    
    res.json = function(obj: any) {
      // Apply field filtering based on query parameters
      const fields = req.query.fields as string;
      if (fields && obj && typeof obj === object) {
        obj = this.filterFields(obj, fields.split(','));
      }
      
      // Apply pagination metadata
      if (Array.isArray(obj) && req.query.page) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const total = obj.length;
        
        obj = {
          data: obj,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        };
      }
      
      // Compress large responses
      if (JSON.stringify(obj).length > 50000) { // 50KB threshold
        res.setHeader('Content-Encoding', 'gzip');
      }
      
      return originalJson.call(this, obj);
    }.bind(this);
  }

  private filterFields(obj: any, fields: string[]): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.filterFields(item, fields));
    }
    
    if (obj && typeof obj === 'object') {
      const filtered: any = {};
      fields.forEach(field => {
        if (field.includes('.')) {
          // Handle nested fields
          const [parent, ...rest] = field.split('.');
          if (obj[parent]) {
            filtered[parent] = this.filterFields(obj[parent], [rest.join('.')]);
          }
        } else if (obj.hasOwnProperty(field)) {
          filtered[field] = obj[field];
        }
      });
      return filtered;
    }
    
    return obj;
  }
}

/**
 * Performance optimization decorators
 */

export function CacheResponse(ttl: number = 300) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const req = args.find(arg => arg && arg.method);
      const res = args.find(arg => arg && arg.setHeader);
      
      if (req && res) {
        const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
        
        // Check cache
        const cached = this.getCachedResponse?.(cacheKey);
        if (cached && cached.expires > Date.now()) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-TTL', Math.floor((cached.expires - Date.now()) / 1000));
          return res.json(cached.data);
        }
        
        // Execute original method
        const result = await originalMethod.apply(this, args);
        
        // Cache the result
        if (this.setCachedResponse) {
          this.setCachedResponse(cacheKey, {
            data: result,
            expires: Date.now() + (ttl * 1000),
          });
        }
        
        res.setHeader('X-Cache', 'MISS');
        return result;
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

export function CompressResponse(threshold: number = 1024) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Find response object
      const res = args.find(arg => arg && arg.setHeader);
      if (res && result) {
        const size = JSON.stringify(result).length;
        if (size > threshold) {
          res.setHeader('X-Original-Size', size.toString());
          res.setHeader('X-Compression-Applied', 'true');
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
}

export function OptimizePayload(options: { 
  fields?: string[];
  excludeFields?: string[];
  maxSize?: number;
} = {}) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      if (result && typeof result === 'object') {
        let optimized = result;
        
        // Apply field filtering
        if (options.fields) {
          optimized = this.filterFields(optimized, options.fields);
        }
        
        // Exclude fields
        if (options.excludeFields) {
          optimized = this.excludeFields(optimized, options.excludeFields);
        }
        
        // Check size limit
        if (options.maxSize) {
          const size = JSON.stringify(optimized).length;
          if (size > options.maxSize) {
            console.warn(`Response size (${size}) exceeds limit (${options.maxSize})`);
          }
        }
        
        return optimized;
      }
      
      return result;
    };
    
    return descriptor;
  };
}

export function RateLimit(options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
} = { windowMs: 60000, max: 100 }) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const req = args.find(arg => arg && arg.method);
      const res = args.find(arg => arg && arg.setHeader);
      
      if (req && res) {
        const key = options.keyGenerator ? 
          options.keyGenerator(req) : 
          req.ip || req.connection.remoteAddress;
        
        const now = Date.now();
        const windowData = requests.get(key);
        
        if (!windowData || now > windowData.resetTime) {
          requests.set(key, {
            count: 1,
            resetTime: now + options.windowMs,
          });
        } else {
          windowData.count++;
          
          if (windowData.count > options.max) {
            res.status(429).json({
              error: 'Too Many Requests',
              retryAfter: Math.ceil((windowData.resetTime - now) / 1000),
            });
            return;
          }
        }
        
        const remaining = Math.max(0, options.max - (windowData?.count || 0));
        res.setHeader('X-RateLimit-Limit', options.max.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Math.ceil(windowData?.resetTime || now / 1000).toString());
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}