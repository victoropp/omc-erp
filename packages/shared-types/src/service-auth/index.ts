// Service Authentication Module
// Comprehensive service-to-service authentication for OMC ERP

export * from './service-auth.middleware';
export * from './service-auth.guard';
export * from './service-auth.service';

// Re-export authentication interfaces
export {
  IServiceAuthService,
  ServiceApiKey,
  ServiceIdentity,
  ServiceTokenPayload,
  ServiceAuthRequest,
  ServiceAuthResponse,
  InterServiceRequest,
  ServiceRateLimit,
  ServiceAuthAudit,
  ServiceSecurityConfig,
} from '../interfaces';

// Common authentication utilities
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export class ServiceAuthUtils {
  /**
   * Generate a secure random API key
   */
  static generateApiKey(prefix = 'omc_sk_', length = 32): string {
    const randomBytes = crypto.randomBytes(length).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  /**
   * Hash an API key for secure storage
   */
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Generate a unique request ID
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate a unique service ID
   */
  static generateServiceId(serviceName: string, host: string, port: number): string {
    const baseId = `${serviceName}-${host}-${port}`;
    const uuid = crypto.randomBytes(4).toString('hex');
    return `${baseId}-${uuid}`;
  }

  /**
   * Validate JWT token without verification (for structure checking)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * Extract service name from service ID
   */
  static extractServiceName(serviceId: string): string {
    return serviceId.split('-')[0] || 'unknown';
  }

  /**
   * Generate a correlation ID for request tracing
   */
  static generateCorrelationId(): string {
    return `cor_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Validate service token payload structure
   */
  static isValidServiceTokenPayload(payload: any): boolean {
    return payload &&
           typeof payload.sub === 'string' &&
           typeof payload.serviceName === 'string' &&
           Array.isArray(payload.permissions) &&
           typeof payload.environment === 'string' &&
           typeof payload.iat === 'number' &&
           typeof payload.exp === 'number' &&
           typeof payload.iss === 'string' &&
           typeof payload.aud === 'string';
  }

  /**
   * Check if a permission matches a required permission (supports wildcards)
   */
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Admin or wildcard permissions
    if (userPermissions.includes('*') || userPermissions.includes('admin')) {
      return true;
    }

    // Exact match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Wildcard match (e.g., 'transactions:*' matches 'transactions:read')
    const [resource] = requiredPermission.split(':');
    if (userPermissions.includes(`${resource}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * Sanitize headers for logging (remove sensitive information)
   */
  static sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveKeys = [
      'x-api-key',
      'x-service-token',
      'service-token',
      'authorization',
      'cookie',
      'set-cookie',
    ];

    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Create a standardized error response for authentication failures
   */
  static createAuthErrorResponse(
    statusCode: number,
    message: string,
    path: string,
    requestId?: string
  ): Record<string, any> {
    return {
      statusCode,
      message,
      error: statusCode === 401 ? 'Unauthorized' : 'Forbidden',
      timestamp: new Date().toISOString(),
      path,
      requestId: requestId || this.generateRequestId(),
    };
  }

  /**
   * Validate rate limit configuration
   */
  static validateRateLimit(config: { requestsPerMinute: number; burstLimit: number }): boolean {
    return config.requestsPerMinute > 0 && 
           config.burstLimit >= config.requestsPerMinute &&
           config.requestsPerMinute <= 10000 && // Reasonable upper limit
           config.burstLimit <= 20000;
  }

  /**
   * Parse token expiry string to seconds
   */
  static parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([hms])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 3600;
      case 'm': return value * 60;
      case 's': return value;
      default: return 3600;
    }
  }

  /**
   * Create service authentication headers for inter-service requests
   */
  static createServiceHeaders(
    serviceToken: string,
    sourceService: string,
    requestId?: string
  ): Record<string, string> {
    return {
      'X-Service-Token': serviceToken,
      'X-Source-Service': sourceService,
      'X-Request-ID': requestId || this.generateRequestId(),
      'X-Gateway': 'omc-erp-service-auth',
      'Content-Type': 'application/json',
    };
  }
}

// Constants for service authentication
export const SERVICE_AUTH_CONSTANTS = {
  HEADERS: {
    API_KEY: 'x-api-key',
    SERVICE_TOKEN: 'x-service-token',
    SOURCE_SERVICE: 'x-source-service',
    REQUEST_ID: 'x-request-id',
    CORRELATION_ID: 'x-correlation-id',
  },
  PREFIXES: {
    API_KEY: 'omc_sk_',
    SERVICE_ID: 'srv_',
    REQUEST_ID: 'req_',
    CORRELATION_ID: 'cor_',
    AUDIT_ID: 'audit_',
  },
  PERMISSIONS: {
    ADMIN: 'admin',
    WILDCARD: '*',
    READ_SUFFIX: ':read',
    WRITE_SUFFIX: ':write',
    CREATE_SUFFIX: ':create',
    UPDATE_SUFFIX: ':update',
    DELETE_SUFFIX: ':delete',
    ALL_SUFFIX: ':*',
  },
  CACHE_KEYS: {
    API_KEY: 'service_auth:api_key:',
    TOKEN: 'service_auth:token:',
    SERVICE: 'service_auth:service:',
    RATE_LIMIT: 'service_auth:rate_limit:',
    AUDIT: 'service_auth:audit:',
  },
  RATE_LIMITS: {
    DEFAULT_REQUESTS_PER_MINUTE: 60,
    DEFAULT_BURST_LIMIT: 120,
    WINDOW_MS: 60000, // 1 minute
  },
  TOKEN: {
    DEFAULT_EXPIRY: '1h',
    GRACE_PERIOD_SECONDS: 60,
    ISSUER: 'omc-erp-service-registry',
    DEFAULT_AUDIENCE: 'all',
  },
} as const;

// Type guards for runtime type checking
export class ServiceAuthTypeGuards {
  static isServiceTokenPayload(obj: any): obj is ServiceTokenPayload {
    return ServiceAuthUtils.isValidServiceTokenPayload(obj);
  }

  static isServiceApiKey(obj: any): obj is ServiceApiKey {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.serviceName === 'string' &&
           typeof obj.apiKey === 'string' &&
           typeof obj.hashedKey === 'string' &&
           Array.isArray(obj.permissions) &&
           typeof obj.isActive === 'boolean' &&
           obj.createdAt instanceof Date;
  }

  static isServiceIdentity(obj: any): obj is ServiceIdentity {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.serviceName === 'string' &&
           typeof obj.version === 'string' &&
           typeof obj.environment === 'string' &&
           Array.isArray(obj.permissions) &&
           typeof obj.isActive === 'boolean' &&
           obj.registeredAt instanceof Date &&
           obj.lastAuthAt instanceof Date;
  }
}