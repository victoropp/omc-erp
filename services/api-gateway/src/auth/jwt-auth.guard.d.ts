import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class JwtAuthGuard implements CanActivate {
    private reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private extractTokenFromHeader;
}
export declare const Public: () => (target: any, _key?: string, descriptor?: PropertyDescriptor) => void;
//# sourceMappingURL=jwt-auth.guard.d.ts.map