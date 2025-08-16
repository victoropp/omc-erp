import { ConfigService } from '@nestjs/config';
export interface ApiVersion {
    version: string;
    isSupported: boolean;
    isDeprecated: boolean;
    deprecationDate?: Date;
    sunsetDate?: Date;
    migrationGuide?: string;
    features: string[];
    breaking_changes?: string[];
}
export interface VersionCompatibility {
    requestedVersion: string;
    supportedVersion: string;
    isCompatible: boolean;
    transformationRequired: boolean;
    warnings: string[];
}
export declare class VersioningService {
    private configService;
    private readonly logger;
    private readonly supportedVersions;
    constructor(configService: ConfigService);
    getCurrentVersion(): string;
    getDefaultVersion(): string;
    getSupportedVersions(): ApiVersion[];
    getAllVersions(): ApiVersion[];
    getVersionInfo(version: string): ApiVersion | null;
    isVersionSupported(version: string): boolean;
    isVersionDeprecated(version: string): boolean;
    parseVersionFromRequest(request: any): string;
    validateVersionCompatibility(requestedVersion: string): VersionCompatibility;
    transformRequest(request: any, fromVersion: string, toVersion: string): any;
    transformResponse(response: any, fromVersion: string, toVersion: string): any;
    private transformV1ToV2Request;
    private transformV11ToV2Request;
    private transformV2ToV1Response;
    private transformV2ToV11Response;
    private convertDateFields;
    private isDateField;
    private convertDateFormat;
    getVersionHeaders(version: string): Record<string, string>;
}
//# sourceMappingURL=versioning.service.d.ts.map