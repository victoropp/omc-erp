import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import axios from 'axios';

interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  status: string;
  weight: number;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private serviceUrls: Map<string, string>;
  private serviceRegistry: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.serviceRegistry = this.configService.get('SERVICE_REGISTRY_URL', 'http://localhost:3010');
    
    // Fallback static URLs for development
    this.serviceUrls = new Map([
      ['auth', this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001')],
      ['transactions', this.configService.get('TRANSACTION_SERVICE_URL', 'http://localhost:3002')],
      ['stations', this.configService.get('STATION_SERVICE_URL', 'http://localhost:3003')],
      ['fleet', this.configService.get('FLEET_SERVICE_URL', 'http://localhost:3004')],
      ['finance', this.configService.get('FINANCE_SERVICE_URL', 'http://localhost:3005')],
      ['pricing', this.configService.get('PRICING_SERVICE_URL', 'http://localhost:3006')],
      ['inventory', this.configService.get('INVENTORY_SERVICE_URL', 'http://localhost:3007')],
      ['uppf', this.configService.get('UPPF_SERVICE_URL', 'http://localhost:3008')],
      ['dealer', this.configService.get('DEALER_SERVICE_URL', 'http://localhost:3009')],
      ['accounting', this.configService.get('ACCOUNTING_SERVICE_URL', 'http://localhost:3011')],
      ['configuration', this.configService.get('CONFIGURATION_SERVICE_URL', 'http://localhost:3012')],
    ]);
  }

  async forwardRequest(
    service: string,
    method: string,
    path: string,
    data?: any,
    headers?: any,
  ): Promise<any> {
    const requestId = headers?.['x-request-id'] || this.generateRequestId();
    const startTime = Date.now();

    try {
      // First try service discovery
      const serviceInstance = await this.discoverService(service);
      
      let baseUrl: string;
      if (serviceInstance) {
        baseUrl = `http://${serviceInstance.host}:${serviceInstance.port}`;
        this.logger.debug(`Using discovered service: ${service} at ${baseUrl}`);
      } else {
        // Fallback to static configuration
        baseUrl = this.serviceUrls.get(service);
        if (!baseUrl) {
          throw new Error(`Unknown service: ${service}`);
        }
        this.logger.debug(`Using static service URL: ${service} at ${baseUrl}`);
      }

      // Get service token for authentication
      const serviceToken = await this.getServiceToken();

      const config: AxiosRequestConfig = {
        method,
        url: `${baseUrl}${path}`,
        data,
        timeout: 30000, // 30 seconds timeout
        headers: {
          ...headers,
          'X-Forwarded-For': headers?.['x-forwarded-for'] || headers?.['x-real-ip'],
          'X-Request-ID': requestId,
          'X-Gateway': 'omc-erp-api-gateway',
          'X-Service-Token': serviceToken,
          'X-Source-Service': 'api-gateway',
        },
      };

      const response = await firstValueFrom(this.httpService.request(config));
      
      // Log successful request
      const duration = Date.now() - startTime;
      this.logger.debug(`Request ${requestId} to ${service} completed in ${duration}ms`);
      
      // Update service metrics if available
      if (serviceInstance) {
        await this.updateServiceMetrics(serviceInstance.id, true, duration);
      }

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Request ${requestId} to ${service} failed after ${duration}ms: ${(error as any)?.message || error}`);
      
      // Update service metrics on error
      const serviceInstance = await this.discoverService(service);
      if (serviceInstance) {
        await this.updateServiceMetrics(serviceInstance.id, false, duration);
      }

      this.handleProxyError(error, service, requestId);
    }
  }

  /**
   * Discover service using service registry
   */
  private async discoverService(serviceName: string): Promise<ServiceInstance | null> {
    const cacheKey = `service_discovery:${serviceName}`;
    
    try {
      // Check cache first
      let cachedService = await this.cacheManager.get<ServiceInstance>(cacheKey);
      if (cachedService) {
        return cachedService;
      }

      // Query service registry
      const response = await axios.get(
        `${this.serviceRegistry}/registry/discovery/${serviceName}?loadBalanced=true`,
        { timeout: 5000 }
      );

      const serviceInstance = response.data;
      
      // Cache for 30 seconds
      await this.cacheManager.set(cacheKey, serviceInstance, 30000);
      
      return serviceInstance;
    } catch (error) {
      this.logger.warn(`Service discovery failed for ${serviceName}: ${(error as any)?.message || error}`);
      return null;
    }
  }

  /**
   * Update service metrics in registry
   */
  private async updateServiceMetrics(serviceId: string, success: boolean, responseTime: number): Promise<void> {
    try {
      const metricsData = {
        serviceId,
        timestamp: new Date(),
        metrics: {
          requestsPerSecond: 1, // Would be calculated properly in production
          averageResponseTime: responseTime,
          errorRate: success ? 0 : 1,
          memoryUsage: 0,
          cpuUsage: 0,
        },
      };

      // Fire and forget - don't wait for response
      axios.post(`${this.serviceRegistry}/registry/services/${serviceId}/metrics`, metricsData, {
        timeout: 2000,
      }).catch(error => {
        this.logger.debug(`Failed to update metrics for ${serviceId}: ${error.message}`);
      });
    } catch (error) {
      // Silent fail for metrics
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or refresh service token for authenticated inter-service calls
   */
  private async getServiceToken(): Promise<string> {
    const cacheKey = 'api_gateway_service_token';
    
    try {
      // Check if we have a cached valid token
      let cachedToken = await this.cacheManager.get<string>(cacheKey);
      if (cachedToken) {
        // Verify token is still valid (not expired)
        if (this.isTokenValid(cachedToken)) {
          return cachedToken;
        }
        // Remove expired token from cache
        await this.cacheManager.del(cacheKey);
      }

      // Get new token from service registry
      const newToken = await this.authenticateWithServiceRegistry();
      
      // Cache the new token (with 50 minutes TTL for 1-hour tokens to allow refresh)
      await this.cacheManager.set(cacheKey, newToken, 3000000); // 50 minutes
      
      return newToken;
    } catch (error) {
      this.logger.error('Failed to get service token:', error);
      // Return empty string - the receiving service should handle missing tokens gracefully
      return '';
    }
  }

  /**
   * Authenticate with service registry to get a service token
   */
  private async authenticateWithServiceRegistry(): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('API_GATEWAY_SERVICE_API_KEY');
      if (!apiKey) {
        throw new Error('API Gateway service API key not configured');
      }

      const serviceId = this.configService.get<string>('API_GATEWAY_SERVICE_ID', 'api-gateway-default');
      
      const authRequest = {
        serviceId,
        apiKey,
        targetService: 'all',
        operation: 'proxy_requests',
      };

      const response = await axios.post(
        `${this.serviceRegistry}/service-auth/authenticate`,
        authRequest,
        { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OMC-ERP-API-Gateway/1.0',
          }
        }
      );

      if (response.data.success && response.data.serviceToken) {
        this.logger.debug('Successfully authenticated with service registry');
        return response.data.serviceToken;
      } else {
        throw new Error(`Authentication failed: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error('Service registry authentication failed:', error);
      throw new Error(`Service authentication failed: ${error.message}`);
    }
  }

  /**
   * Check if a JWT token is still valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      const gracePeriod = 300; // 5 minutes grace period
      
      return payload.exp > (now + gracePeriod);
    } catch {
      return false;
    }
  }

  private handleProxyError(error: any, service: string, requestId: string): never {
    if (error.response) {
      // The service responded with an error
      const errorResponse = {
        statusCode: error.response.status,
        message: error.response.data?.message || 'Service error',
        error: error.response.data?.error || 'Unknown error',
        service,
        requestId,
        timestamp: new Date().toISOString(),
      };
      
      this.logger.error(`Service ${service} error: ${JSON.stringify(errorResponse)}`);
      throw errorResponse;
    } else if (error.request) {
      // Service didn't respond
      const errorResponse = {
        statusCode: 503,
        message: `Service '${service}' unavailable`,
        error: 'Service did not respond',
        service,
        requestId,
        timestamp: new Date().toISOString(),
      };
      
      this.logger.error(`Service ${service} unavailable: ${JSON.stringify(errorResponse)}`);
      throw errorResponse;
    } else {
      // Request setup error
      const errorResponse = {
        statusCode: 500,
        message: 'Internal gateway error',
        error: error.message || 'Unknown error',
        service,
        requestId,
        timestamp: new Date().toISOString(),
      };
      
      this.logger.error(`Gateway error for service ${service}: ${JSON.stringify(errorResponse)}`);
      throw errorResponse;
    }
  }
}