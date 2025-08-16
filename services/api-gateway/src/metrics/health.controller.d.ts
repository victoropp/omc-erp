import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { MetricsService } from './metrics.service';
export declare class HealthController {
    private health;
    private typeorm;
    private memory;
    private disk;
    private metricsService;
    constructor(health: HealthCheckService, typeorm: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, metricsService: MetricsService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        message: string;
    }>;
    ready(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    startup(): Promise<{
        status: string;
        uptime: number;
        message: string;
        timestamp: string;
    }>;
    checkDependencies(): Promise<{
        overall_status: string;
        dependencies: {
            name: string;
            status: string;
            response_time_ms: number;
            last_checked: string;
        }[];
        timestamp: string;
    }>;
    getStatus(): Promise<{
        service: string;
        version: string;
        environment: "development" | "production" | "test";
        health: import("@nestjs/terminus").HealthCheckResult;
        metrics: {
            daily: {
                requests: {};
                errors: {};
                errorRate: string | number;
            };
            hourly: {
                requests: {};
                errors: {};
                errorRate: string | number;
            };
            timestamp: string;
            error?: undefined;
        } | {
            daily: {
                requests: number;
                errors: number;
                errorRate: number;
            };
            hourly: {
                requests: number;
                errors: number;
                errorRate: number;
            };
            timestamp: string;
            error: string;
        };
        system: {
            system: {
                uptime: number;
                memory: {
                    rss: number;
                    heapUsed: number;
                    heapTotal: number;
                    external: number;
                };
                cpu: {
                    usage: NodeJS.CpuUsage;
                };
            };
            nodejs: {
                version: string;
                platform: NodeJS.Platform;
                arch: NodeJS.Architecture;
            };
            timestamp: string;
        };
        timestamp: string;
    }>;
}
//# sourceMappingURL=health.controller.d.ts.map