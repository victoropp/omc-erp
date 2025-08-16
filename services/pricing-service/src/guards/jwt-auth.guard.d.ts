import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private extractTokenFromHeader;
}
//# sourceMappingURL=jwt-auth.guard.d.ts.map