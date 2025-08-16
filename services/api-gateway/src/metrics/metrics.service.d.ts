import { Counter, Histogram, Gauge } from 'prom-client';
import { Cache } from 'cache-manager';
export declare class MetricsService {
    private cacheManager;
    private readonly logger;
    httpRequestsTotal: Counter<string>;
    httpRequestDuration: Histogram<string>;
    httpRequestSize: Histogram<string>;
    httpResponseSize: Histogram<string>;
    apiErrorsTotal: Counter<string>;
    databaseConnections: Gauge<string>;
    cacheOperationsTotal: Counter<string>;
    externalApiCallsTotal: Counter<string>;
    constructor(cacheManager: Cache);
    private initializeMetrics;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number, requestSize: number, responseSize: number, userType?: string): void;
    recordApiError(errorType: string, service: string, endpoint: string): void;
    recordCacheOperation(operation: 'get' | 'set' | 'del', result: 'hit' | 'miss' | 'success' | 'error'): void;
    recordExternalApiCall(service: string, endpoint: string, status: string): void;
    updateDatabaseConnections(database: string, activeConnections: number, idleConnections: number): void;
    getSystemStats(): Promise<{
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
    incrementBusinessMetric(metric: string, period?: 'daily' | 'hourly'): Promise<void>;
    getApiEndpointStats(): Promise<string>;
    resetMetrics(): Promise<void>;
}
//# sourceMappingURL=metrics.service.d.ts.map