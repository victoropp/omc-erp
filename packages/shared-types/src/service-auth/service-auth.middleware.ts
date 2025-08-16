import { Injectable, NestMiddleware, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { 
  ServiceTokenPayload, 
  ServiceAuthAudit, 
  ServiceRateLimit,
  ServiceIdentity
} from '../interfaces';

interface AuthenticatedServiceRequest extends Request {
  serviceAuth?: {
    serviceId: string;
    serviceName: string;
    permissions: string[];
    environment: string;
    tokenPayload: ServiceTokenPayload;
  };
  requestId?: string;
}

@Injectable()
export class ServiceAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ServiceAuthMiddleware.name);
  private readonly rateLimitMap = new Map<string, ServiceRateLimit>();
  private readonly auditQueue: ServiceAuthAudit[] = [];
  
  constructor(
    private readonly configService: ConfigService,
  ) {
    // Start audit processing
    this.processAuditQueue();
  }

  async use(req: AuthenticatedServiceRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    req.requestId = requestId;

    try {
      // Extract authentication headers
      const apiKey = req.headers['x-api-key'] as string;
      const serviceToken = req.headers['x-service-token'] as string;
      const sourceService = req.headers['x-source-service'] as string;

      // Skip authentication for health checks and internal endpoints
      if (this.shouldSkipAuth(req.path)) {
        return next();
      }

      // Validate service authentication
      let serviceAuth: ServiceTokenPayload;
      
      if (serviceToken) {
        // JWT token authentication (preferred for inter-service calls)
        serviceAuth = await this.validateServiceToken(serviceToken);
      } else if (apiKey && sourceService) {
        // API key authentication (fallback)
        const serviceIdentity = await this.validateApiKey(apiKey, sourceService);
        serviceAuth = this.convertToTokenPayload(serviceIdentity);
      } else {
        throw new UnauthorizedException('Missing service authentication credentials');
      }

      // Rate limiting check
      await this.checkRateLimit(serviceAuth.sub, req.path);

      // Permission check
      if (!this.hasPermission(serviceAuth, req.method, req.path)) {
        throw new ForbiddenException('Insufficient permissions for this operation');
      }

      // Attach service auth to request
      req.serviceAuth = {
        serviceId: serviceAuth.sub,
        serviceName: serviceAuth.serviceName,
        permissions: serviceAuth.permissions,
        environment: serviceAuth.environment,
        tokenPayload: serviceAuth,
      };

      // Log successful authentication
      this.auditServiceAuth({
        id: this.generateAuditId(),
        serviceId: serviceAuth.sub,
        operation: `${req.method} ${req.path}`,
        success: true,
        requestId,
        timestamp: new Date(),
        metadata: {
          responseTime: Date.now() - startTime,
          userAgent: req.headers['user-agent'],
        },
      });

      next();
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed authentication
      this.auditServiceAuth({
        id: this.generateAuditId(),
        serviceId: 'unknown',
        operation: `${req.method} ${req.path}`,
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date(),
        metadata: {
          responseTime,
          userAgent: req.headers['user-agent'],
        },
      });

      this.logger.error(`Service authentication failed for ${req.path}: ${error.message}`, {
        requestId,
        path: req.path,
        method: req.method,
        headers: this.sanitizeHeaders(req.headers),
        responseTime,
      });

      // Return appropriate error response
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
          error: error.name,
          timestamp: new Date().toISOString(),
          path: req.path,
          requestId,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          message: 'Internal authentication error',
          error: 'InternalServerError',
          timestamp: new Date().toISOString(),
          path: req.path,
          requestId,
        });
      }
    }
  }

  private async validateServiceToken(token: string): Promise<ServiceTokenPayload> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SERVICE_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT service secret not configured');
      }

      const payload = jwt.verify(token, jwtSecret) as ServiceTokenPayload;
      
      // Validate token structure
      if (!payload.sub || !payload.serviceName || !payload.permissions) {
        throw new Error('Invalid token payload structure');
      }

      // Check environment match
      const currentEnv = this.configService.get<string>('NODE_ENV', 'development');
      if (payload.environment !== currentEnv) {
        throw new Error('Environment mismatch');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Service token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid service token');
      } else {
        throw new UnauthorizedException(`Token validation failed: ${error.message}`);
      }
    }
  }

  private async validateApiKey(apiKey: string, serviceName: string): Promise<ServiceIdentity> {
    try {
      // Hash the provided API key for comparison
      const hashedKey = this.hashApiKey(apiKey);
      
      // In a real implementation, this would query a database or cache
      // For now, we'll use environment variables for service API keys
      const envKey = `SERVICE_API_KEY_${serviceName.toUpperCase().replace('-', '_')}`;
      const expectedHashedKey = this.configService.get<string>(envKey);
      
      if (!expectedHashedKey || hashedKey !== expectedHashedKey) {
        throw new Error('Invalid API key');
      }

      // Return basic service identity (in production, this would come from database)
      return {
        id: `${serviceName}-${Date.now()}`,
        serviceName,
        version: '1.0.0',
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        permissions: this.getDefaultServicePermissions(serviceName),
        metadata: {},
        isActive: true,
        registeredAt: new Date(),
        lastAuthAt: new Date(),
      };
    } catch (error) {
      throw new UnauthorizedException(`API key validation failed: ${error.message}`);
    }
  }

  private convertToTokenPayload(serviceIdentity: ServiceIdentity): ServiceTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    return {
      sub: serviceIdentity.id,
      serviceName: serviceIdentity.serviceName,
      permissions: serviceIdentity.permissions,
      environment: serviceIdentity.environment,
      iat: now,
      exp: now + expiresIn,
      iss: 'omc-erp-service-registry',
      aud: 'all',
    };
  }

  private async checkRateLimit(serviceId: string, endpoint: string): Promise<void> {
    const key = `${serviceId}:${endpoint}`;
    const now = new Date();
    const windowMs = 60000; // 1 minute window
    const maxRequests = this.getServiceRateLimit(serviceId);

    let rateLimit = this.rateLimitMap.get(key);
    
    if (!rateLimit) {
      rateLimit = {
        serviceId,
        endpoint,
        requestsPerMinute: maxRequests,
        burstLimit: maxRequests * 2,
        currentRequests: 0,
        windowStart: now,
        isBlocked: false,
      };
      this.rateLimitMap.set(key, rateLimit);
    }

    // Reset window if expired
    if (now.getTime() - rateLimit.windowStart.getTime() >= windowMs) {
      rateLimit.currentRequests = 0;
      rateLimit.windowStart = now;
      rateLimit.isBlocked = false;
    }

    // Check rate limit
    if (rateLimit.currentRequests >= rateLimit.requestsPerMinute) {
      rateLimit.isBlocked = true;
      throw new ForbiddenException(`Rate limit exceeded for service ${serviceId}`);
    }

    rateLimit.currentRequests++;
  }

  private hasPermission(serviceAuth: ServiceTokenPayload, method: string, path: string): boolean {
    // Define permission rules
    const requiredPermission = this.getRequiredPermission(method, path);
    
    if (!requiredPermission) {
      return true; // No specific permission required
    }

    return serviceAuth.permissions.includes(requiredPermission) || 
           serviceAuth.permissions.includes('*') ||
           serviceAuth.permissions.includes('admin');
  }

  private getRequiredPermission(method: string, path: string): string | null {
    // Map HTTP methods and paths to permissions
    const pathSegments = path.split('/').filter(Boolean);
    const resource = pathSegments[0] || 'unknown';
    
    switch (method.toUpperCase()) {
      case 'GET':
        return `${resource}:read`;
      case 'POST':
        return `${resource}:create`;
      case 'PUT':
      case 'PATCH':
        return `${resource}:update`;
      case 'DELETE':
        return `${resource}:delete`;
      default:
        return `${resource}:access`;
    }
  }

  private shouldSkipAuth(path: string): boolean {
    const skipPaths = [
      '/health',
      '/metrics',
      '/ping',
      '/.well-known',
      '/docs',
      '/api-docs',
    ];

    return skipPaths.some(skipPath => path.startsWith(skipPath));
  }

  private getDefaultServicePermissions(serviceName: string): string[] {
    const servicePermissions: Record<string, string[]> = {
      'api-gateway': ['*'],
      'auth-service': ['auth:*', 'users:*'],
      'transaction-service': ['transactions:*', 'payments:read'],
      'station-service': ['stations:*', 'inventory:read'],
      'accounting-service': ['accounting:*', 'financial:*'],
      'pricing-service': ['pricing:*', 'inventory:read'],
      'uppf-service': ['uppf:*', 'transactions:read'],
      'dealer-service': ['dealers:*', 'pricing:read'],
      'configuration-service': ['config:*'],
      'service-registry': ['registry:*', 'health:*'],
    };

    return servicePermissions[serviceName] || ['read'];
  }

  private getServiceRateLimit(serviceId: string): number {
    // Default rate limits per service per minute
    const rateLimits: Record<string, number> = {
      'api-gateway': 1000,
      'auth-service': 500,
      'transaction-service': 200,
      'station-service': 100,
      'accounting-service': 100,
      'pricing-service': 300,
      'uppf-service': 50,
      'dealer-service': 100,
      'configuration-service': 50,
      'service-registry': 200,
    };

    const serviceName = serviceId.split('-')[0];
    return rateLimits[serviceName] || 60; // Default 60 requests per minute
  }

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized['x-api-key'];
    delete sanitized['x-service-token'];
    delete sanitized['authorization'];
    return sanitized;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  }

  private auditServiceAuth(audit: ServiceAuthAudit): void {
    this.auditQueue.push(audit);
    
    // Log immediately for critical failures
    if (!audit.success) {
      this.logger.warn(`Service auth failure: ${audit.operation}`, {
        serviceId: audit.serviceId,
        error: audit.error,
        requestId: audit.requestId,
      });
    }
  }

  private async processAuditQueue(): Promise<void> {
    setInterval(async () => {
      if (this.auditQueue.length === 0) return;

      const batch = this.auditQueue.splice(0, 100); // Process in batches
      
      try {
        // In production, send to audit service or database
        this.logger.debug(`Processing ${batch.length} service auth audit records`);
        
        // For now, just log statistics
        const successful = batch.filter(a => a.success).length;
        const failed = batch.filter(a => !a.success).length;
        
        if (failed > 0) {
          this.logger.warn(`Service auth batch: ${successful} successful, ${failed} failed`);
        }
      } catch (error) {
        this.logger.error('Failed to process audit queue', error);
        // Re-add failed records to queue
        this.auditQueue.unshift(...batch);
      }
    }, 5000); // Process every 5 seconds
  }
}

// Export decorator for easy use
export function ServiceAuth() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // This decorator can be used to mark methods that require service authentication
    // The actual implementation would be in a guard or interceptor
    Reflect.defineMetadata('serviceAuth', true, target, propertyKey);
  };
}

// Export helper function to check service permissions
export function hasServicePermission(req: AuthenticatedServiceRequest, permission: string): boolean {
  return req.serviceAuth?.permissions.includes(permission) ||
         req.serviceAuth?.permissions.includes('*') ||
         req.serviceAuth?.permissions.includes('admin') ||
         false;
}