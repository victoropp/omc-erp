"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionGuard = void 0;
const common_1 = require("@nestjs/common");
const versioning_service_1 = require("../versioning.service");
let ApiVersionGuard = class ApiVersionGuard {
    versioningService;
    constructor(versioningService) {
        this.versioningService = versioningService;
    }
    canActivate(context) {
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
            throw new common_1.HttpException({
                error: 'Unsupported API Version',
                message: `API version ${requestedVersion} is not supported`,
                supportedVersions: this.versioningService.getSupportedVersions().map(v => v.version),
                recommendedVersion: this.versioningService.getCurrentVersion(),
                warnings: compatibility.warnings,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        // Transform request if needed
        if (compatibility.transformationRequired && requestedVersion !== compatibility.supportedVersion) {
            this.versioningService.transformRequest(request, requestedVersion, compatibility.supportedVersion);
        }
        return true;
    }
    isStrictVersioningEnabled(request) {
        // Check if strict versioning is enabled via header or config
        return request.headers['x-strict-versioning'] === 'true' ||
            process.env.STRICT_API_VERSIONING === 'true';
    }
};
exports.ApiVersionGuard = ApiVersionGuard;
exports.ApiVersionGuard = ApiVersionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [versioning_service_1.VersioningService])
], ApiVersionGuard);
//# sourceMappingURL=api-version.guard.js.map