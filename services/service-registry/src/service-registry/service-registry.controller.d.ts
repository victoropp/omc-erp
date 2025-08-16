import { ServiceRegistryService } from './service-registry.service';
import { RegisterServiceDto, ServiceStatus, ServiceType } from './dto/register-service.dto';
import { ServiceInstance, ServiceHealth, ServiceMetrics } from './entities/service.entity';
export declare class ServiceRegistryController {
    private readonly serviceRegistryService;
    constructor(serviceRegistryService: ServiceRegistryService);
    registerService(registerDto: RegisterServiceDto): Promise<ServiceInstance>;
    deregisterService(serviceId: string): Promise<{
        success: boolean;
    }>;
    updateHeartbeat(serviceId: string): Promise<{
        success: boolean;
    }>;
    getServices(type?: ServiceType, status?: ServiceStatus, name?: string): Promise<ServiceInstance[]>;
    getService(serviceId: string): Promise<ServiceInstance>;
    getServiceHealth(serviceId: string): Promise<ServiceHealth>;
    getServiceMetrics(serviceId: string): Promise<ServiceMetrics>;
    discoverService(serviceName: string, loadBalanced?: boolean): Promise<ServiceInstance | ServiceInstance[]>;
    getRegistryHealth(): Promise<{
        status: string;
        timestamp: Date;
        services: {
            total: number;
            healthy: number;
            unhealthy: number;
            starting: number;
        };
    }>;
}
//# sourceMappingURL=service-registry.controller.d.ts.map