import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { RegisterServiceDto, ServiceStatus, ServiceType } from './dto/register-service.dto';
import { ServiceInstance, ServiceHealth, ServiceMetrics } from './entities/service.entity';

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private readonly SERVICES_KEY = 'services:registry';
  private readonly SERVICE_PREFIX = 'service:';
  private readonly HEALTH_PREFIX = 'health:';
  private readonly METRICS_PREFIX = 'metrics:';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Register a new service instance
   */
  async registerService(registerDto: RegisterServiceDto): Promise<ServiceInstance> {
    const serviceId = this.generateServiceId(registerDto.name, registerDto.host, registerDto.port);
    
    const service: ServiceInstance = {
      id: serviceId,
      ...registerDto,
      status: ServiceStatus.STARTING,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      healthCheckCount: 0,
      consecutiveFailures: 0,
    };

    // Store in cache
    await this.cacheManager.set(`${this.SERVICE_PREFIX}${serviceId}`, service, 3600000); // 1 hour TTL
    
    // Add to services registry
    const services = await this.getAllServices();
    services[serviceId] = service;
    await this.cacheManager.set(this.SERVICES_KEY, services, 3600000);

    this.logger.log(`Service registered: ${service.name} (${serviceId})`);
    
    // Perform initial health check
    this.performHealthCheck(service).catch(err => 
      this.logger.warn(`Initial health check failed for ${service.name}: ${err.message}`)
    );

    return service;
  }

  /**
   * Deregister a service
   */
  async deregisterService(serviceId: string): Promise<boolean> {
    const service = await this.getService(serviceId);
    if (!service) {
      return false;
    }

    // Update status to shutdown
    service.status = ServiceStatus.SHUTDOWN;
    await this.updateService(service);

    // Remove from registry after grace period
    setTimeout(async () => {
      await this.cacheManager.del(`${this.SERVICE_PREFIX}${serviceId}`);
      await this.cacheManager.del(`${this.HEALTH_PREFIX}${serviceId}`);
      await this.cacheManager.del(`${this.METRICS_PREFIX}${serviceId}`);
      
      const services = await this.getAllServices();
      delete services[serviceId];
      await this.cacheManager.set(this.SERVICES_KEY, services, 3600000);
    }, 30000); // 30 seconds grace period

    this.logger.log(`Service deregistered: ${service.name} (${serviceId})`);
    return true;
  }

  /**
   * Update service heartbeat
   */
  async updateHeartbeat(serviceId: string): Promise<boolean> {
    const service = await this.getService(serviceId);
    if (!service) {
      return false;
    }

    service.lastHeartbeat = new Date();
    if (service.status === ServiceStatus.STARTING || service.status === ServiceStatus.UNHEALTHY) {
      service.status = ServiceStatus.HEALTHY;
    }

    await this.updateService(service);
    return true;
  }

  /**
   * Get all registered services
   */
  async getAllServices(): Promise<Record<string, ServiceInstance>> {
    const services = await this.cacheManager.get<Record<string, ServiceInstance>>(this.SERVICES_KEY);
    return services || {};
  }

  /**
   * Get services by type
   */
  async getServicesByType(type: ServiceType): Promise<ServiceInstance[]> {
    const services = await this.getAllServices();
    return Object.values(services).filter(service => service.type === type);
  }

  /**
   * Get healthy services by name
   */
  async getHealthyServices(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.getAllServices();
    return Object.values(services).filter(
      service => 
        service.name === serviceName && 
        service.status === ServiceStatus.HEALTHY
    );
  }

  /**
   * Get service by ID
   */
  async getService(serviceId: string): Promise<ServiceInstance | null> {
    return await this.cacheManager.get(`${this.SERVICE_PREFIX}${serviceId}`);
  }

  /**
   * Update service health
   */
  async updateServiceHealth(serviceId: string, health: ServiceHealth): Promise<void> {
    await this.cacheManager.set(`${this.HEALTH_PREFIX}${serviceId}`, health, 300000); // 5 minutes TTL
    
    const service = await this.getService(serviceId);
    if (service) {
      service.status = health.status;
      service.healthCheckCount++;
      
      if (health.status === ServiceStatus.HEALTHY) {
        service.consecutiveFailures = 0;
      } else {
        service.consecutiveFailures++;
      }

      await this.updateService(service);
    }
  }

  /**
   * Get service health
   */
  async getServiceHealth(serviceId: string): Promise<ServiceHealth | null> {
    return await this.cacheManager.get(`${this.HEALTH_PREFIX}${serviceId}`);
  }

  /**
   * Update service metrics
   */
  async updateServiceMetrics(serviceId: string, metrics: ServiceMetrics): Promise<void> {
    await this.cacheManager.set(`${this.METRICS_PREFIX}${serviceId}`, metrics, 300000); // 5 minutes TTL
  }

  /**
   * Get service metrics
   */
  async getServiceMetrics(serviceId: string): Promise<ServiceMetrics | null> {
    return await this.cacheManager.get(`${this.METRICS_PREFIX}${serviceId}`);
  }

  /**
   * Load balance - get best available service instance
   */
  async getBalancedService(serviceName: string): Promise<ServiceInstance | null> {
    const healthyServices = await this.getHealthyServices(serviceName);
    
    if (healthyServices.length === 0) {
      return null;
    }

    // Simple weighted random selection
    const totalWeight = healthyServices.reduce((sum, service) => sum + service.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const service of healthyServices) {
      currentWeight += service.weight;
      if (random <= currentWeight) {
        return service;
      }
    }

    // Fallback to first service
    return healthyServices[0];
  }

  /**
   * Scheduled health checks
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async performScheduledHealthChecks(): Promise<void> {
    const services = await this.getAllServices();
    const serviceInstances = Object.values(services);

    this.logger.debug(`Performing health checks for ${serviceInstances.length} services`);

    const healthCheckPromises = serviceInstances
      .filter(service => service.status !== ServiceStatus.SHUTDOWN)
      .map(service => this.performHealthCheck(service));

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Clean up stale services
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupStaleServices(): Promise<void> {
    const services = await this.getAllServices();
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [serviceId, service] of Object.entries(services)) {
      const timeSinceLastHeartbeat = now.getTime() - service.lastHeartbeat.getTime();
      
      if (timeSinceLastHeartbeat > staleThreshold && service.status !== ServiceStatus.SHUTDOWN) {
        this.logger.warn(`Service ${service.name} (${serviceId}) is stale, marking as unhealthy`);
        service.status = ServiceStatus.UNHEALTHY;
        await this.updateService(service);
      }

      // Remove shutdown services after extended period
      const extendedThreshold = 30 * 60 * 1000; // 30 minutes
      if (timeSinceLastHeartbeat > extendedThreshold && service.status === ServiceStatus.SHUTDOWN) {
        this.logger.log(`Removing stale shutdown service: ${service.name} (${serviceId})`);
        await this.deregisterService(serviceId);
      }
    }
  }

  /**
   * Perform health check for a single service
   */
  private async performHealthCheck(service: ServiceInstance): Promise<void> {
    const startTime = Date.now();
    
    try {
      const healthUrl = `http://${service.host}:${service.port}${service.healthEndpoint}`;
      const response = await axios.get(healthUrl, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'OMC-ERP-ServiceRegistry/1.0',
        }
      });

      const responseTime = Date.now() - startTime;
      
      const health: ServiceHealth = {
        serviceId: service.id,
        status: response.status === 200 ? ServiceStatus.HEALTHY : ServiceStatus.UNHEALTHY,
        timestamp: new Date(),
        responseTime,
        details: response.data || {},
      };

      await this.updateServiceHealth(service.id, health);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const health: ServiceHealth = {
        serviceId: service.id,
        status: ServiceStatus.UNHEALTHY,
        timestamp: new Date(),
        responseTime,
        error: error.message,
      };

      await this.updateServiceHealth(service.id, health);
      
      this.logger.warn(`Health check failed for ${service.name}: ${error.message}`);
    }
  }

  /**
   * Update service in cache
   */
  private async updateService(service: ServiceInstance): Promise<void> {
    await this.cacheManager.set(`${this.SERVICE_PREFIX}${service.id}`, service, 3600000);
    
    const services = await this.getAllServices();
    services[service.id] = service;
    await this.cacheManager.set(this.SERVICES_KEY, services, 3600000);
  }

  /**
   * Generate unique service ID
   */
  private generateServiceId(name: string, host: string, port: number): string {
    const baseId = `${name}-${host}-${port}`;
    const uuid = uuidv4().split('-')[0];
    return `${baseId}-${uuid}`;
  }
}