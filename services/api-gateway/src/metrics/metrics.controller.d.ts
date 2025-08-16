import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private metricsService;
    constructor(metricsService: MetricsService);
    getSystemMetrics(): Promise<{
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
    }>;
    getBusinessMetrics(): Promise<{
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
    }>;
    getApiStats(): Promise<{
        prometheus_format: string;
        timestamp: string;
    }>;
    getDetailedHealth(): Promise<{
        status: string;
        version: string;
        environment: "development" | "production" | "test";
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
        business: {
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
        services: {
            database: string;
            redis: string;
            external_apis: string;
        };
        timestamp: string;
    }>;
    resetMetrics(): Promise<{
        message: string;
        timestamp: string;
    }>;
    getPrometheusMetrics(): string;
}
//# sourceMappingURL=metrics.controller.d.ts.map