import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from '../security.service';
export declare class CorsGuard implements CanActivate {
    private securityService;
    constructor(securityService: SecurityService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private setCorsHeaders;
}
//# sourceMappingURL=cors.guard.d.ts.map