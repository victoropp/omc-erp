import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from '../security.service';
export declare class CSPGuard implements CanActivate {
    private securityService;
    constructor(securityService: SecurityService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
//# sourceMappingURL=csp.guard.d.ts.map