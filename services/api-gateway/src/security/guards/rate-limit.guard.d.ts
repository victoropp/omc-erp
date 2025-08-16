import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SecurityService } from '../security.service';
import { Cache } from 'cache-manager';
export declare class RateLimitGuard implements CanActivate {
    private securityService;
    private cacheManager;
    constructor(securityService: SecurityService, cacheManager: Cache);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getClientIdentifier;
    private checkRateLimit;
    private hashString;
}
//# sourceMappingURL=rate-limit.guard.d.ts.map