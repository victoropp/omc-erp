import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VersioningService } from '../versioning.service';
export declare class ApiVersionGuard implements CanActivate {
    private versioningService;
    constructor(versioningService: VersioningService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private isStrictVersioningEnabled;
}
//# sourceMappingURL=api-version.guard.d.ts.map