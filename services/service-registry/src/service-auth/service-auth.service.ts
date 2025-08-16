import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CacheService } from '../common/cache.service';
import {
  ServiceApiKey,
  ServiceIdentity,
  ServiceTokenPayload,
  ServiceAuthRequest,
  ServiceAuthResponse,
  IServiceAuthService,
} from '../../../packages/shared-types/src/interfaces';

@Injectable()
export class ServiceAuthService implements IServiceAuthService {
  private readonly logger = new Logger(ServiceAuthService.name);
  private readonly API_KEY_PREFIX = 'omc_sk_';
  private readonly CACHE_PREFIX = 'service_auth:';
  private readonly TOKEN_EXPIRY = '1h';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.initializeDefaultServiceKeys();
  }

  async generateApiKey(serviceName: string): Promise<ServiceApiKey> {
    try {
      const apiKeyId = this.generateId();
      const rawApiKey = this.generateRawApiKey();
      const hashedKey = this.hashApiKey(rawApiKey);
      const displayKey = `${this.API_KEY_PREFIX}${rawApiKey}`;

      const serviceApiKey: ServiceApiKey = {
        id: apiKeyId,
        serviceName,
        apiKey: displayKey,
        hashedKey,
        permissions: this.getDefaultPermissions(serviceName),
        rateLimit: this.getDefaultRateLimit(serviceName),
        isActive: true,
        createdAt: new Date(),
        expiresAt: this.getExpirationDate(),
      };

      // Store in cache with longer TTL for API keys
      await this.cacheService.set(
        `${this.CACHE_PREFIX}api_key:${hashedKey}`,
        serviceApiKey,
        86400000 // 24 hours
      );

      // Store by service name for lookup
      await this.cacheService.set(
        `${this.CACHE_PREFIX}service:${serviceName}:api_key`,
        serviceApiKey,
        86400000
      );

      // Store in a list for management
      const existingKeys = await this.cacheService.get<string[]>(`${this.CACHE_PREFIX}all_keys`) || [];
      existingKeys.push(hashedKey);
      await this.cacheService.set(`${this.CACHE_PREFIX}all_keys`, existingKeys, 86400000);

      this.logger.log(`Generated API key for service: ${serviceName} (ID: ${apiKeyId})`);
      return serviceApiKey;
    } catch (error) {
      this.logger.error(`Failed to generate API key for ${serviceName}:`, error);
      throw new Error(`API key generation failed: ${error.message}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<ServiceIdentity | null> {
    try {
      if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
        return null;
      }

      const rawKey = apiKey.substring(this.API_KEY_PREFIX.length);
      const hashedKey = this.hashApiKey(rawKey);

      const serviceApiKey = await this.cacheService.get<ServiceApiKey>(
        `${this.CACHE_PREFIX}api_key:${hashedKey}`
      );

      if (!serviceApiKey || !serviceApiKey.isActive) {
        return null;
      }

      // Check expiration
      if (serviceApiKey.expiresAt && new Date() > serviceApiKey.expiresAt) {
        await this.revokeApiKey(apiKey);
        return null;
      }

      // Update last used timestamp
      serviceApiKey.lastUsedAt = new Date();
      await this.cacheService.set(
        `${this.CACHE_PREFIX}api_key:${hashedKey}`,
        serviceApiKey,
        86400000
      );

      // Convert to ServiceIdentity
      const serviceIdentity: ServiceIdentity = {
        id: serviceApiKey.id,
        serviceName: serviceApiKey.serviceName,
        version: '1.0.0',
        environment: this.configService.get('NODE_ENV', 'development'),
        permissions: serviceApiKey.permissions,
        metadata: {
          rateLimit: serviceApiKey.rateLimit,
          lastUsed: serviceApiKey.lastUsedAt,
          apiKeyId: serviceApiKey.id,
        },
        isActive: serviceApiKey.isActive,
        registeredAt: serviceApiKey.createdAt,
        lastAuthAt: new Date(),
      };

      return serviceIdentity;
    } catch (error) {
      this.logger.error('API key validation failed:', error);
      return null;
    }
  }

  async generateServiceToken(serviceId: string, permissions: string[]): Promise<string> {
    try {
      const jwtSecret = this.getJwtSecret();
      const now = Math.floor(Date.now() / 1000);
      const serviceName = this.extractServiceName(serviceId);

      const payload: ServiceTokenPayload = {
        sub: serviceId,
        serviceName,
        permissions,
        environment: this.configService.get('NODE_ENV', 'development'),
        iat: now,
        exp: now + this.getTokenExpirySeconds(),
        iss: 'omc-erp-service-registry',
        aud: 'all',
      };

      const token = jwt.sign(payload, jwtSecret, {
        algorithm: 'HS256',
        noTimestamp: false,
      });

      // Cache the token for quick validation
      await this.cacheService.set(
        `${this.CACHE_PREFIX}token:${this.hashToken(token)}`,
        payload,
        this.getTokenExpirySeconds() * 1000
      );

      this.logger.debug(`Generated service token for: ${serviceName} (${serviceId})`);
      return token;
    } catch (error) {
      this.logger.error(`Service token generation failed for ${serviceId}:`, error);
      throw new Error(`Service token generation failed: ${error.message}`);
    }
  }

  async validateServiceToken(token: string): Promise<ServiceTokenPayload | null> {
    try {
      const jwtSecret = this.getJwtSecret();

      // First check cache for performance
      const tokenHash = this.hashToken(token);
      const cachedPayload = await this.cacheService.get<ServiceTokenPayload>(
        `${this.CACHE_PREFIX}token:${tokenHash}`
      );

      if (cachedPayload) {
        // Verify it's not expired
        const now = Math.floor(Date.now() / 1000);
        if (cachedPayload.exp > now) {
          return cachedPayload;
        }
        // Remove expired token from cache
        await this.cacheService.del(`${this.CACHE_PREFIX}token:${tokenHash}`);
      }

      // Verify JWT
      const payload = jwt.verify(token, jwtSecret) as ServiceTokenPayload;
      
      // Validate payload structure
      if (!this.isValidTokenPayload(payload)) {
        return null;
      }

      // Verify environment
      const currentEnv = this.configService.get('NODE_ENV', 'development');
      if (payload.environment !== currentEnv) {
        this.logger.warn(`Environment mismatch: token env ${payload.environment}, current env ${currentEnv}`);
        return null;
      }

      // Cache valid token
      await this.cacheService.set(
        `${this.CACHE_PREFIX}token:${tokenHash}`,
        payload,
        (payload.exp - Math.floor(Date.now() / 1000)) * 1000
      );

      return payload;
    } catch (error) {
      this.logger.debug(`Service token validation failed: ${error.message}`);
      return null;
    }
  }

  async revokeApiKey(apiKey: string): Promise<void> {
    try {
      if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
        return;
      }

      const rawKey = apiKey.substring(this.API_KEY_PREFIX.length);
      const hashedKey = this.hashApiKey(rawKey);

      const serviceApiKey = await this.cacheService.get<ServiceApiKey>(
        `${this.CACHE_PREFIX}api_key:${hashedKey}`
      );

      if (serviceApiKey) {
        serviceApiKey.isActive = false;
        
        // Update in cache
        await this.cacheService.set(
          `${this.CACHE_PREFIX}api_key:${hashedKey}`,
          serviceApiKey,
          86400000
        );

        // Remove from service lookup
        await this.cacheService.del(
          `${this.CACHE_PREFIX}service:${serviceApiKey.serviceName}:api_key`
        );

        // Remove from all keys list
        const allKeys = await this.cacheService.get<string[]>(`${this.CACHE_PREFIX}all_keys`) || [];
        const updatedKeys = allKeys.filter(key => key !== hashedKey);
        await this.cacheService.set(`${this.CACHE_PREFIX}all_keys`, updatedKeys, 86400000);

        this.logger.log(`Revoked API key for service: ${serviceApiKey.serviceName}`);
      }
    } catch (error) {
      this.logger.error('Failed to revoke API key:', error);
      throw new Error(`API key revocation failed: ${error.message}`);
    }
  }

  async refreshServiceToken(token: string): Promise<string> {
    try {
      const payload = await this.validateServiceToken(token);
      if (!payload) {
        throw new Error('Invalid token for refresh');
      }

      // Generate new token with extended expiry
      return await this.generateServiceToken(payload.sub, payload.permissions);
    } catch (error) {
      this.logger.error('Service token refresh failed:', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Service authentication workflow
  async authenticateService(request: ServiceAuthRequest): Promise<ServiceAuthResponse> {
    try {
      // Validate API key
      const serviceIdentity = await this.validateApiKey(request.apiKey);
      if (!serviceIdentity) {
        return {
          success: false,
          error: 'Invalid API key',
        };
      }

      // Verify service ID matches (if provided)
      if (request.serviceId && serviceIdentity.id !== request.serviceId) {
        return {
          success: false,
          error: 'Service ID mismatch',
        };
      }

      // Generate service token
      const serviceToken = await this.generateServiceToken(
        serviceIdentity.id,
        serviceIdentity.permissions
      );

      const expirySeconds = this.getTokenExpirySeconds();

      return {
        success: true,
        serviceToken,
        expiresIn: expirySeconds,
        permissions: serviceIdentity.permissions,
      };
    } catch (error) {
      this.logger.error('Service authentication failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk operations for service management
  async generateServiceCredentials(serviceName: string): Promise<{
    apiKey: ServiceApiKey;
    initialToken: string;
  }> {
    const apiKey = await this.generateApiKey(serviceName);
    const initialToken = await this.generateServiceToken(apiKey.id, apiKey.permissions);

    return {
      apiKey,
      initialToken,
    };
  }

  async listServiceApiKeys(serviceName?: string): Promise<ServiceApiKey[]> {
    try {
      const allKeys = await this.cacheService.get<string[]>(`${this.CACHE_PREFIX}all_keys`) || [];
      const apiKeys: ServiceApiKey[] = [];

      for (const hashedKey of allKeys) {
        const apiKey = await this.cacheService.get<ServiceApiKey>(`${this.CACHE_PREFIX}api_key:${hashedKey}`);
        if (apiKey && (!serviceName || apiKey.serviceName === serviceName)) {
          // Remove sensitive data
          const sanitizedApiKey = { ...apiKey };
          delete sanitizedApiKey.apiKey; // Don't return the actual key
          apiKeys.push(sanitizedApiKey);
        }
      }

      return apiKeys;
    } catch (error) {
      this.logger.error('Failed to list API keys:', error);
      return [];
    }
  }

  async updateServicePermissions(serviceId: string, permissions: string[]): Promise<boolean> {
    try {
      // Find the API key by service ID
      const allKeys = await this.cacheService.get<string[]>(`${this.CACHE_PREFIX}all_keys`) || [];
      
      for (const hashedKey of allKeys) {
        const apiKey = await this.cacheService.get<ServiceApiKey>(`${this.CACHE_PREFIX}api_key:${hashedKey}`);
        if (apiKey && apiKey.id === serviceId) {
          apiKey.permissions = permissions;
          await this.cacheService.set(`${this.CACHE_PREFIX}api_key:${hashedKey}`, apiKey, 86400000);
          
          this.logger.log(`Updated permissions for ${serviceId}: ${permissions.join(', ')}`);
          return true;
        }
      }

      this.logger.warn(`Service ID ${serviceId} not found for permission update`);
      return false;
    } catch (error) {
      this.logger.error(`Failed to update permissions for ${serviceId}:`, error);
      return false;
    }
  }

  // Initialize default service API keys for system services
  private async initializeDefaultServiceKeys(): Promise<void> {
    try {
      const defaultServices = [
        'api-gateway',
        'auth-service',
        'transaction-service',
        'station-service',
        'accounting-service',
        'pricing-service',
        'uppf-service',
        'dealer-service',
        'configuration-service',
        'daily-delivery-service',
      ];

      for (const serviceName of defaultServices) {
        // Check if service already has an API key
        const existingKey = await this.cacheService.get(`${this.CACHE_PREFIX}service:${serviceName}:api_key`);
        if (!existingKey) {
          await this.generateApiKey(serviceName);
          this.logger.log(`Generated default API key for ${serviceName}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize default service keys:', error);
    }
  }

  // Private helper methods
  private generateRawApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateId(): string {
    return `srv_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private extractServiceName(serviceId: string): string {
    // Extract service name from service ID (assuming format: serviceName-host-port-uuid)
    const parts = serviceId.split('-');
    return parts[0] || 'unknown';
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SERVICE_SECRET');
    if (!secret) {
      throw new Error('JWT service secret not configured. Please set JWT_SERVICE_SECRET environment variable.');
    }
    return secret;
  }

  private getDefaultPermissions(serviceName: string): string[] {
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
      'daily-delivery-service': ['delivery:*', 'accounting:read'],
    };

    return servicePermissions[serviceName] || ['read'];
  }

  private getDefaultRateLimit(serviceName: string): { requestsPerMinute: number; burstLimit: number } {
    const rateLimits: Record<string, { requestsPerMinute: number; burstLimit: number }> = {
      'api-gateway': { requestsPerMinute: 1000, burstLimit: 2000 },
      'auth-service': { requestsPerMinute: 500, burstLimit: 1000 },
      'transaction-service': { requestsPerMinute: 200, burstLimit: 400 },
      'station-service': { requestsPerMinute: 100, burstLimit: 200 },
      'accounting-service': { requestsPerMinute: 100, burstLimit: 200 },
      'pricing-service': { requestsPerMinute: 300, burstLimit: 600 },
      'uppf-service': { requestsPerMinute: 50, burstLimit: 100 },
      'dealer-service': { requestsPerMinute: 100, burstLimit: 200 },
      'configuration-service': { requestsPerMinute: 50, burstLimit: 100 },
      'service-registry': { requestsPerMinute: 200, burstLimit: 400 },
      'daily-delivery-service': { requestsPerMinute: 80, burstLimit: 160 },
    };

    return rateLimits[serviceName] || { requestsPerMinute: 60, burstLimit: 120 };
  }

  private getExpirationDate(): Date {
    // API keys expire in 90 days by default
    const expiryDays = this.configService.get<number>('SERVICE_API_KEY_EXPIRY_DAYS', 90);
    return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  }

  private getTokenExpirySeconds(): number {
    const expiry = this.configService.get<string>('SERVICE_TOKEN_EXPIRY', this.TOKEN_EXPIRY);
    
    // Parse expiry string (e.g., '1h', '30m', '3600s')
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

  private isValidTokenPayload(payload: any): payload is ServiceTokenPayload {
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
}