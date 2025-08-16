import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache.service';
import { ServiceRegistryService } from '../service-registry/service-registry.service';
import { ServiceInstance } from '../service-registry/entities/service.entity';
export interface ServiceDiscoveryConfig {
    enableLoadBalancing: boolean;
    strategy: 'round-robin' | 'weighted' | 'least-connections' | 'random';
    healthCheckInterval: number;
    circuitBreakerThreshold: number;
}
export interface LoadBalancerState {
    [serviceName: string]: {
        currentIndex: number;
        connections: {
            [serviceId: string]: number;
        };
        failureCount: {
            [serviceId: string]: number;
        };
        lastUsed: {
            [serviceId: string]: Date;
        };
    };
}
export declare class ServiceDiscoveryService {
    private readonly configService;
    private readonly cacheService;
    private readonly serviceRegistryService;
    private readonly logger;
    private readonly DISCOVERY_CACHE_KEY;
    private readonly LOAD_BALANCER_STATE_KEY;
    private loadBalancerState;
    constructor(configService: ConfigService, cacheService: CacheService, serviceRegistryService: ServiceRegistryService);
    /**
     * Discover services by name with load balancing
     */
    discoverService(serviceName: string, options?: {
        version?: string;
        tags?: string[];
        excludeUnhealthy?: boolean;
    }): Promise<ServiceInstance | null>;
    /**
     * Discover all instances of a service
     */
    discoverAllServices(serviceName: string, options?: {
        version?: string;
        tags?: string[];
        excludeUnhealthy?: boolean;
    }): Promise<ServiceInstance[]>;
    /**
     * Get service URL for HTTP requests
     */
    getServiceUrl(serviceName: string, path?: string, options?: {
        version?: string;
        tags?: string[];
        protocol?: 'http' | 'https';
    }): Promise<string | null>;
    /**
     * Get all available services
     */
    getAvailableServices(): Promise<{
        [serviceName: string]: ServiceInstance[];
    }>;
    /**
     * Report service call success/failure for load balancing
     */
    reportServiceCall(serviceId: string, success: boolean, responseTime?: number): Promise<void>;
    /**
     * Get service instances with filtering
     */
    private getServiceInstances;
    /**
     * Select service instance using load balancing strategy
     */
    private selectServiceInstance;
    /**
     * Round-robin load balancing
     */
    private roundRobinSelection;
    /**
     * Weighted load balancing (based on inverse failure rate)
     */
    private weightedSelection;
    /**
     * Least connections load balancing
     */
    private leastConnectionsSelection;
    /**
     * Initialize load balancer state
     */
    private initializeLoadBalancerState;
    /**
     * Initialize state for a service
     */
    private initializeServiceState;
    /**
     * Get discovery configuration
     */
    private getDiscoveryConfig;
    /**
     * Clear discovery cache
     */
    clearDiscoveryCache(): Promise<void>;
}
//# sourceMappingURL=service-discovery.service.d.ts.map