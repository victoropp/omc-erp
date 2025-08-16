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
var VersioningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersioningService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let VersioningService = VersioningService_1 = class VersioningService {
    configService;
    logger = new common_1.Logger(VersioningService_1.name);
    supportedVersions = [
        {
            version: '1.0',
            isSupported: true,
            isDeprecated: false,
            features: [
                'Basic authentication',
                'CRUD operations for stations',
                'Transaction management',
                'Basic reporting',
            ],
        },
        {
            version: '1.1',
            isSupported: true,
            isDeprecated: false,
            features: [
                'Enhanced authentication with MFA',
                'Advanced transaction analytics',
                'Inventory management',
                'Customer management',
                'Mobile Money integration',
            ],
        },
        {
            version: '2.0',
            isSupported: true,
            isDeprecated: false,
            features: [
                'Complete financial management',
                'HR management',
                'IoT integration',
                'Real-time dashboard',
                'Advanced analytics',
                'Ghana regulatory compliance',
                'GraphQL support',
                'Webhook subscriptions',
            ],
            breaking_changes: [
                'Authentication token format changed',
                'Response structure updated for transactions',
                'Date format standardized to ISO 8601',
                'Deprecated endpoints removed',
            ],
        },
        {
            version: '0.9',
            isSupported: false,
            isDeprecated: true,
            deprecationDate: new Date('2024-01-01'),
            sunsetDate: new Date('2025-06-01'),
            migrationGuide: 'https://docs.omcerp.com/migration/v0.9-to-v1.0',
            features: [
                'Legacy authentication',
                'Basic station management',
            ],
        },
    ];
    constructor(configService) {
        this.configService = configService;
    }
    getCurrentVersion() {
        return this.configService.get('API_VERSION', '2.0');
    }
    getDefaultVersion() {
        return '2.0';
    }
    getSupportedVersions() {
        return this.supportedVersions.filter(v => v.isSupported);
    }
    getAllVersions() {
        return this.supportedVersions;
    }
    getVersionInfo(version) {
        return this.supportedVersions.find(v => v.version === version) || null;
    }
    isVersionSupported(version) {
        const versionInfo = this.getVersionInfo(version);
        return versionInfo ? versionInfo.isSupported : false;
    }
    isVersionDeprecated(version) {
        const versionInfo = this.getVersionInfo(version);
        return versionInfo ? versionInfo.isDeprecated : false;
    }
    parseVersionFromRequest(request) {
        // Check various sources for version information
        let version = '';
        // 1. Check custom header (preferred)
        if (request.headers['x-api-version']) {
            version = request.headers['x-api-version'];
        }
        // 2. Check Accept header (RFC 6838)
        else if (request.headers['accept']) {
            const acceptHeader = request.headers['accept'];
            const versionMatch = acceptHeader.match(/application\/vnd\.omc\.v(\d+(?:\.\d+)?)\+json/);
            if (versionMatch) {
                version = versionMatch[1];
            }
        }
        // 3. Check URL path versioning
        else if (request.url.match(/^\/v(\d+(?:\.\d+)?)\//)) {
            const pathMatch = request.url.match(/^\/v(\d+(?:\.\d+)?)\//);
            if (pathMatch) {
                version = pathMatch[1];
            }
        }
        // 4. Check query parameter
        else if (request.query && request.query.version) {
            version = request.query.version;
        }
        // 5. Default version
        else {
            version = this.getDefaultVersion();
        }
        return version;
    }
    validateVersionCompatibility(requestedVersion) {
        const versionInfo = this.getVersionInfo(requestedVersion);
        const warnings = [];
        if (!versionInfo) {
            return {
                requestedVersion,
                supportedVersion: this.getDefaultVersion(),
                isCompatible: false,
                transformationRequired: true,
                warnings: [`Version ${requestedVersion} is not recognized. Falling back to ${this.getDefaultVersion()}.`],
            };
        }
        if (!versionInfo.isSupported) {
            const defaultVersion = this.getDefaultVersion();
            warnings.push(`Version ${requestedVersion} is no longer supported. Please migrate to version ${defaultVersion}.`);
            if (versionInfo.sunsetDate) {
                warnings.push(`This version will be completely removed on ${versionInfo.sunsetDate.toDateString()}.`);
            }
            return {
                requestedVersion,
                supportedVersion: defaultVersion,
                isCompatible: false,
                transformationRequired: true,
                warnings,
            };
        }
        if (versionInfo.isDeprecated) {
            warnings.push(`Version ${requestedVersion} is deprecated and will be removed soon.`);
            if (versionInfo.migrationGuide) {
                warnings.push(`Migration guide available at: ${versionInfo.migrationGuide}`);
            }
        }
        return {
            requestedVersion,
            supportedVersion: requestedVersion,
            isCompatible: true,
            transformationRequired: false,
            warnings,
        };
    }
    transformRequest(request, fromVersion, toVersion) {
        // This would contain version-specific transformation logic
        this.logger.debug(`Transforming request from version ${fromVersion} to ${toVersion}`);
        if (fromVersion === '1.0' && toVersion === '2.0') {
            return this.transformV1ToV2Request(request);
        }
        if (fromVersion === '1.1' && toVersion === '2.0') {
            return this.transformV11ToV2Request(request);
        }
        return request;
    }
    transformResponse(response, fromVersion, toVersion) {
        // This would contain version-specific transformation logic
        this.logger.debug(`Transforming response from version ${fromVersion} to ${toVersion}`);
        if (fromVersion === '2.0' && toVersion === '1.0') {
            return this.transformV2ToV1Response(response);
        }
        if (fromVersion === '2.0' && toVersion === '1.1') {
            return this.transformV2ToV11Response(response);
        }
        return response;
    }
    transformV1ToV2Request(request) {
        // Transform v1.0 request format to v2.0
        const transformed = { ...request };
        // Update date formats from DD/MM/YYYY to ISO 8601
        if (transformed.body) {
            this.convertDateFields(transformed.body, 'DD/MM/YYYY', 'ISO');
        }
        // Update authentication format
        if (transformed.headers && transformed.headers.authorization) {
            // Convert legacy token format
            const legacyToken = transformed.headers.authorization;
            if (legacyToken.startsWith('Token ')) {
                transformed.headers.authorization = `Bearer ${legacyToken.substring(6)}`;
            }
        }
        return transformed;
    }
    transformV11ToV2Request(request) {
        // Transform v1.1 request format to v2.0
        const transformed = { ...request };
        // v1.1 to v2.0 transformations are minimal as they're more compatible
        if (transformed.body) {
            this.convertDateFields(transformed.body, 'YYYY-MM-DD', 'ISO');
        }
        return transformed;
    }
    transformV2ToV1Response(response) {
        // Transform v2.0 response format to v1.0
        const transformed = { ...response };
        // Remove v2.0 specific fields
        if (transformed.data) {
            delete transformed.data.metadata;
            delete transformed.data.links;
            delete transformed.data.relationships;
        }
        // Convert date formats back to DD/MM/YYYY
        this.convertDateFields(transformed, 'ISO', 'DD/MM/YYYY');
        return transformed;
    }
    transformV2ToV11Response(response) {
        // Transform v2.0 response format to v1.1
        const transformed = { ...response };
        // Remove some v2.0 specific fields but keep more than v1.0
        if (transformed.data && transformed.data.metadata) {
            delete transformed.data.metadata.tracing;
            delete transformed.data.metadata.performance;
        }
        // Convert date formats to YYYY-MM-DD
        this.convertDateFields(transformed, 'ISO', 'YYYY-MM-DD');
        return transformed;
    }
    convertDateFields(obj, fromFormat, toFormat) {
        // This is a simplified version - in reality, you'd have more robust date conversion
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && this.isDateField(key)) {
                    obj[key] = this.convertDateFormat(obj[key], fromFormat, toFormat);
                }
                else if (typeof obj[key] === 'object') {
                    this.convertDateFields(obj[key], fromFormat, toFormat);
                }
            }
        }
    }
    isDateField(fieldName) {
        const dateFields = [
            'created_at', 'updated_at', 'deleted_at',
            'date', 'timestamp', 'time',
            'transaction_date', 'due_date', 'start_date', 'end_date',
        ];
        return dateFields.some(field => fieldName.toLowerCase().includes(field));
    }
    convertDateFormat(dateString, _fromFormat, toFormat) {
        // Simplified date conversion - in reality, use a proper date library
        try {
            const date = new Date(dateString);
            switch (toFormat) {
                case 'ISO':
                    return date.toISOString();
                case 'DD/MM/YYYY':
                    return date.toLocaleDateString('en-GB');
                case 'YYYY-MM-DD':
                    return date.toISOString().split('T')[0];
                default:
                    return dateString;
            }
        }
        catch (error) {
            this.logger.warn(`Failed to convert date format: ${dateString}`);
            return dateString;
        }
    }
    getVersionHeaders(version) {
        const versionInfo = this.getVersionInfo(version);
        const headers = {
            'X-API-Version': version,
            'X-API-Current-Version': this.getCurrentVersion(),
        };
        if (versionInfo?.isDeprecated) {
            headers['X-API-Deprecated'] = 'true';
            if (versionInfo.sunsetDate) {
                headers['X-API-Sunset'] = versionInfo.sunsetDate.toISOString();
            }
            if (versionInfo.migrationGuide) {
                headers['X-API-Migration-Guide'] = versionInfo.migrationGuide;
            }
        }
        return headers;
    }
};
exports.VersioningService = VersioningService;
exports.VersioningService = VersioningService = VersioningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VersioningService);
//# sourceMappingURL=versioning.service.js.map