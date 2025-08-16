export declare enum ServiceStatus {
    STARTING = "starting",
    HEALTHY = "healthy",
    UNHEALTHY = "unhealthy",
    CRITICAL = "critical",
    MAINTENANCE = "maintenance",
    SHUTDOWN = "shutdown"
}
export declare enum ServiceType {
    API = "api",
    WORKER = "worker",
    DATABASE = "database",
    CACHE = "cache",
    GATEWAY = "gateway",
    EXTERNAL = "external"
}
export declare class RegisterServiceDto {
    name: string;
    version: string;
    host: string;
    port: number;
    type: ServiceType;
    healthEndpoint?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    dependencies?: string[];
    weight?: number;
    environment?: string;
}
//# sourceMappingURL=register-service.dto.d.ts.map