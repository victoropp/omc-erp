import { CacheService } from '../common/cache.service';
import { RegisterServiceDto, ServiceType } from './dto/register-service.dto';
import { ServiceInstance, ServiceHealth, ServiceMetrics } from './entities/service.entity';
export declare class ServiceRegistryService {
    private cacheService;
    private readonly logger;
    private readonly SERVICES_KEY;
    private readonly SERVICE_PREFIX;
    private readonly HEALTH_PREFIX;
    private readonly METRICS_PREFIX;
    constructor(cacheService: CacheService);
    /**
     * Register a new service instance
     */
    registerService(registerDto: RegisterServiceDto): Promise<ServiceInstance>;
    /**
     * Deregister a service
     */
    deregisterService(serviceId: string): Promise<boolean>;
    /**
     * Update service heartbeat
     */
    updateHeartbeat(serviceId: string): Promise<boolean>;
    /**
     * Get all registered services
     */
    getAllServices(): Promise<Record<string, ServiceInstance>>;
    /**
     * Get services by type
     */
    getServicesByType(type: ServiceType): Promise<ServiceInstance[]>;
    /**
     * Get healthy services by name
     */
    getHealthyServices(serviceName: string): Promise<ServiceInstance[]>;
    /**
     * Get service by ID
     */
    getService(serviceId: string): Promise<ServiceInstance | null>;
    /**
     * Update service health
     */
    updateServiceHealth(serviceId: string, health: ServiceHealth): Promise<void>;
    /**
     * Get service health
     */
    getServiceHealth(serviceId: string): Promise<ServiceHealth | null>;
    /**
     * Update service metrics
     */
    updateServiceMetrics(serviceId: string, metrics: ServiceMetrics): Promise<void>;
    /**
     * Get service metrics
     */
    getServiceMetrics(serviceId: string): Promise<ServiceMetrics | null>;
    /**
     * Load balance - get best available service instance
     */
    getBalancedService(serviceName: string): Promise<ServiceInstance | null>;
    /**
     * Scheduled health checks
     */
    performScheduledHealthChecks(): Promise<void>;
    /**
     * Clean up stale services
     */
    cleanupStaleServices(): Promise<void>;
    /**
     * Perform health check for a single service
     */
    private performHealthCheck;
    /**
     * Update service in cache
     */
    private updateService;
    /**
     * Generate unique service ID
     */
    private generateServiceId;
}
//# sourceMappingURL=service-registry.service.d.ts.map