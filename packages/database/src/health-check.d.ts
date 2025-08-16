export interface DatabaseHealthStatus {
    postgres: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    };
    timescale: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    };
    redis: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    };
    mongodb: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    };
    overall: 'healthy' | 'degraded' | 'unhealthy';
}
export declare class DatabaseHealthChecker {
    checkPostgres(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }>;
    checkTimescale(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }>;
    checkRedis(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }>;
    checkMongoDB(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }>;
    checkAllDatabases(): Promise<DatabaseHealthStatus>;
}
export declare const databaseHealthChecker: DatabaseHealthChecker;
//# sourceMappingURL=health-check.d.ts.map