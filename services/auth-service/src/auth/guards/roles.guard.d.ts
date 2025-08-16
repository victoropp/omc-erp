import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private rbacService;
    constructor(reflector: Reflector, rbacService: RbacService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=roles.guard.d.ts.map