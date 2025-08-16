import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
export declare class ProxyService {
    private readonly httpService;
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private serviceUrls;
    private serviceRegistry;
    constructor(httpService: HttpService, configService: ConfigService, cacheManager: Cache);
    forwardRequest(service: string, method: string, path: string, data?: any, headers?: any): Promise<any>;
    /**
     * Discover service using service registry
     */
    private discoverService;
    /**
     * Update service metrics in registry
     */
    private updateServiceMetrics;
    private generateRequestId;
    private handleProxyError;
}
//# sourceMappingURL=proxy.service.d.ts.map