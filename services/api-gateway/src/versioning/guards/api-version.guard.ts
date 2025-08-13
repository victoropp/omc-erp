import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VersioningService } from '../versioning.service';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private versioningService: VersioningService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Parse version from request
    const requestedVersion = this.versioningService.parseVersionFromRequest(request);
    
    // Validate version compatibility
    const compatibility = this.versioningService.validateVersionCompatibility(requestedVersion);
    
    // Add version to request for downstream use
    request.apiVersion = compatibility.supportedVersion;
    request.versionCompatibility = compatibility;

    // Set version headers in response
    const versionHeaders = this.versioningService.getVersionHeaders(compatibility.supportedVersion);
    Object.entries(versionHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    // Add warnings to response headers
    if (compatibility.warnings.length > 0) {
      response.setHeader('X-API-Warnings', compatibility.warnings.join('; '));
    }

    // If version is not supported and transformation is not possible, reject
    if (!compatibility.isCompatible && this.isStrictVersioningEnabled(request)) {
      throw new HttpException(
        {
          error: 'Unsupported API Version',
          message: `API version ${requestedVersion} is not supported`,
          supportedVersions: this.versioningService.getSupportedVersions().map(v => v.version),
          recommendedVersion: this.versioningService.getCurrentVersion(),
          warnings: compatibility.warnings,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Transform request if needed
    if (compatibility.transformationRequired && requestedVersion !== compatibility.supportedVersion) {
      this.versioningService.transformRequest(request, requestedVersion, compatibility.supportedVersion);
    }

    return true;
  }

  private isStrictVersioningEnabled(request: any): boolean {
    // Check if strict versioning is enabled via header or config
    return request.headers['x-strict-versioning'] === 'true' || 
           process.env.STRICT_API_VERSIONING === 'true';
  }
}