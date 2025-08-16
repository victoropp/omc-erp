import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache.service';
import { ServiceRegistryService } from '../service-registry/service-registry.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { ServiceInstance, ServiceHealth } from '../service-registry/entities/service.entity';
export interface SystemHealthMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        temperature?: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    disk: {
        used: number;
        total: number;
        percentage: number;
    };
    network: {
        rx_bytes: number;
        tx_bytes: number;
        rx_sec: number;
        tx_sec: number;
    };
    services: {
        total: number;
        healthy: number;
        unhealthy: number;
        critical: number;
    };
    database: {
        postgresql: HealthStatus;
        redis: HealthStatus;
        mongodb: HealthStatus;
    };
    external: {
        [key: string]: HealthStatus;
    };
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
    details?: any;
}
export interface HealthCheckResult {
    service: ServiceInstance;
    health: ServiceHealth;
    previousStatus?: string;
    statusChanged: boolean;
}
export declare class HealthCheckService {
    private readonly configService;
    private readonly cacheService;
    private readonly serviceRegistryService;
    private readonly eventBusService;
    private readonly logger;
    private readonly HEALTH_METRICS_KEY;
    constructor(configService: ConfigService, cacheService: CacheService, serviceRegistryService: ServiceRegistryService, eventBusService: EventBusService);
    /**
     * Perform comprehensive health check of all services
     */
    performServiceHealthChecks(): Promise<HealthCheckResult[]>;
    /**
     * Collect and store system health metrics
     */
    collectSystemMetrics(): Promise<SystemHealthMetrics>;
    /**
     * Get current system health metrics
     */
    getSystemMetrics(): Promise<SystemHealthMetrics | null>;
    /**
     * Check health of a specific service
     */
    checkServiceHealth(service: ServiceInstance): Promise<HealthCheckResult | null>;
    /**
     * Check database health
     */
    private checkDatabaseHealth;
    /**
     * Check PostgreSQL health
     */
    private checkPostgresHealth;
    /**
     * Check Redis health
     */
    private checkRedisHealth;
    /**
     * Check MongoDB health
     */
    private checkMongoHealth;
    /**
     * Check external services health
     */
    private checkExternalServices;
    /**
     * Check individual external service health
     */
    private checkExternalServiceHealth;
    /**
     * Check for system alerts based on metrics
     */
    private checkSystemAlerts;
}
//# sourceMappingURL=health-check.service.d.ts.map