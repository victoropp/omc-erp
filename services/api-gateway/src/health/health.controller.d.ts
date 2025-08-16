import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private memory;
    constructor(health: HealthCheckService, memory: MemoryHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    ready(): {
        status: string;
        timestamp: string;
    };
    live(): {
        status: string;
        timestamp: string;
    };
}
//# sourceMappingURL=health.controller.d.ts.map