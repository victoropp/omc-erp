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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersioningController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const versioning_service_1 = require("./versioning.service");
let VersioningController = class VersioningController {
    versioningService;
    constructor(versioningService) {
        this.versioningService = versioningService;
    }
    getAllVersions() {
        const versions = this.versioningService.getAllVersions();
        return {
            current_version: this.versioningService.getCurrentVersion(),
            default_version: this.versioningService.getDefaultVersion(),
            versions,
            timestamp: new Date().toISOString(),
        };
    }
    getSupportedVersions() {
        const versions = this.versioningService.getSupportedVersions();
        return {
            current_version: this.versioningService.getCurrentVersion(),
            supported_versions: versions,
            count: versions.length,
            timestamp: new Date().toISOString(),
        };
    }
    getVersionInfo(version) {
        const versionInfo = this.versioningService.getVersionInfo(version);
        if (!versionInfo) {
            return {
                error: 'Version not found',
                requested_version: version,
                available_versions: this.versioningService.getAllVersions().map(v => v.version),
                timestamp: new Date().toISOString(),
            };
        }
        return {
            version_info: versionInfo,
            compatibility: this.versioningService.validateVersionCompatibility(version),
            timestamp: new Date().toISOString(),
        };
    }
    checkCompatibility(version) {
        const compatibility = this.versioningService.validateVersionCompatibility(version);
        return {
            requested_version: version,
            compatibility,
            recommendations: this.getVersionRecommendations(version),
            timestamp: new Date().toISOString(),
        };
    }
    getMigrationGuide(fromVersion, toVersion) {
        const fromVersionInfo = this.versioningService.getVersionInfo(fromVersion);
        const toVersionInfo = this.versioningService.getVersionInfo(toVersion);
        if (!fromVersionInfo || !toVersionInfo) {
            return {
                error: 'One or both versions not found',
                from_version: fromVersion,
                to_version: toVersion,
                available_versions: this.versioningService.getAllVersions().map(v => v.version),
                timestamp: new Date().toISOString(),
            };
        }
        return {
            migration: {
                from_version: fromVersion,
                to_version: toVersion,
                breaking_changes: toVersionInfo.breaking_changes || [],
                new_features: this.getNewFeatures(fromVersionInfo, toVersionInfo),
                removed_features: this.getRemovedFeatures(fromVersionInfo, toVersionInfo),
                migration_steps: this.getMigrationSteps(fromVersion, toVersion),
                estimated_effort: this.getEstimatedMigrationEffort(fromVersion, toVersion),
            },
            timestamp: new Date().toISOString(),
        };
    }
    getChangelog(fromVersion, limit) {
        const allVersions = this.versioningService.getAllVersions();
        const limitNum = limit ? parseInt(limit, 10) : 10;
        let filteredVersions = allVersions;
        if (fromVersion) {
            const fromIndex = allVersions.findIndex(v => v.version === fromVersion);
            if (fromIndex >= 0) {
                filteredVersions = allVersions.slice(0, fromIndex + 1);
            }
        }
        const changelog = filteredVersions.slice(0, limitNum).map(version => ({
            version: version.version,
            release_date: this.getVersionReleaseDate(version.version),
            features: version.features,
            breaking_changes: version.breaking_changes || [],
            deprecation_status: {
                is_deprecated: version.isDeprecated,
                deprecation_date: version.deprecationDate?.toISOString(),
                sunset_date: version.sunsetDate?.toISOString(),
            },
            migration_guide: version.migrationGuide,
        }));
        return {
            changelog,
            total_versions: allVersions.length,
            showing: changelog.length,
            timestamp: new Date().toISOString(),
        };
    }
    getVersionRecommendations(version) {
        const versionInfo = this.versioningService.getVersionInfo(version);
        const recommendations = [];
        if (!versionInfo) {
            recommendations.push(`Version ${version} does not exist. Use ${this.versioningService.getCurrentVersion()} instead.`);
            return recommendations;
        }
        if (versionInfo.isDeprecated) {
            recommendations.push(`Version ${version} is deprecated. Consider migrating to ${this.versioningService.getCurrentVersion()}.`);
            if (versionInfo.sunsetDate) {
                const daysUntilSunset = Math.ceil((versionInfo.sunsetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysUntilSunset > 0) {
                    recommendations.push(`This version will be sunset in ${daysUntilSunset} days.`);
                }
                else {
                    recommendations.push('This version has been sunset and is no longer supported.');
                }
            }
        }
        if (!versionInfo.isSupported) {
            recommendations.push(`Version ${version} is no longer supported. Upgrade immediately.`);
        }
        if (version !== this.versioningService.getCurrentVersion()) {
            recommendations.push(`Latest version ${this.versioningService.getCurrentVersion()} includes new features and bug fixes.`);
        }
        return recommendations;
    }
    getNewFeatures(fromVersion, toVersion) {
        // Calculate new features by comparing feature lists
        const fromFeatures = new Set(fromVersion.features || []);
        const toFeatures = toVersion.features || [];
        return toFeatures.filter(feature => !fromFeatures.has(feature));
    }
    getRemovedFeatures(fromVersion, toVersion) {
        // Calculate removed features by comparing feature lists
        const toFeatures = new Set(toVersion.features || []);
        const fromFeatures = fromVersion.features || [];
        return fromFeatures.filter(feature => !toFeatures.has(feature));
    }
    getMigrationSteps(fromVersion, toVersion) {
        // Define migration steps between versions
        const migrationSteps = {
            '1.0->2.0': [
                'Update authentication tokens to Bearer format',
                'Convert date formats to ISO 8601',
                'Update transaction response structure handling',
                'Implement new error handling format',
                'Test all integrations thoroughly',
            ],
            '1.1->2.0': [
                'Update date formats to ISO 8601',
                'Review breaking changes in transaction APIs',
                'Update error handling for new format',
                'Test webhook subscriptions if used',
            ],
            '0.9->1.0': [
                'Replace legacy authentication system',
                'Update all API endpoints to new format',
                'Implement proper error handling',
                'Complete regression testing',
            ],
        };
        const key = `${fromVersion}->${toVersion}`;
        return migrationSteps[key] || [
            'Review version changelog for breaking changes',
            'Update client code to handle new response formats',
            'Test all API integrations',
            'Deploy with rollback plan',
        ];
    }
    getEstimatedMigrationEffort(fromVersion, toVersion) {
        // Estimate migration effort based on version differences
        const majorVersionChange = fromVersion.split('.')[0] !== toVersion.split('.')[0];
        if (majorVersionChange) {
            return 'High - Major version change with breaking changes';
        }
        const fromVersionInfo = this.versioningService.getVersionInfo(fromVersion);
        if (fromVersionInfo?.isDeprecated) {
            return 'Medium - Deprecated version with compatibility layer';
        }
        return 'Low - Minor version change with backward compatibility';
    }
    getVersionReleaseDate(version) {
        // Mock release dates - in real implementation, this would come from a database
        const releaseDates = {
            '2.0': '2024-01-15',
            '1.1': '2023-09-01',
            '1.0': '2023-06-01',
            '0.9': '2023-01-01',
        };
        return releaseDates[version] || 'Unknown';
    }
};
exports.VersioningController = VersioningController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all supported API versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all API versions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "getAllVersions", null);
__decorate([
    (0, common_1.Get)('supported'),
    (0, swagger_1.ApiOperation)({ summary: 'Get currently supported API versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of supported API versions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "getSupportedVersions", null);
__decorate([
    (0, common_1.Get)(':version'),
    (0, swagger_1.ApiOperation)({ summary: 'Get information about a specific API version' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version information retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Version not found' }),
    (0, swagger_1.ApiParam)({ name: 'version', description: 'API version (e.g., 1.0, 2.0)', example: '2.0' }),
    __param(0, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "getVersionInfo", null);
__decorate([
    (0, common_1.Get)(':version/compatibility'),
    (0, swagger_1.ApiOperation)({ summary: 'Check version compatibility' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version compatibility information' }),
    (0, swagger_1.ApiParam)({ name: 'version', description: 'API version to check', example: '1.0' }),
    __param(0, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "checkCompatibility", null);
__decorate([
    (0, common_1.Get)('migration/guide'),
    (0, swagger_1.ApiOperation)({ summary: 'Get migration guide between versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Migration guide information' }),
    (0, swagger_1.ApiQuery)({ name: 'from', description: 'Source version', example: '1.0' }),
    (0, swagger_1.ApiQuery)({ name: 'to', description: 'Target version', example: '2.0' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "getMigrationGuide", null);
__decorate([
    (0, common_1.Get)('changelog'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API changelog' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API changelog' }),
    (0, swagger_1.ApiQuery)({ name: 'from_version', required: false, description: 'Starting version for changelog' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of versions to include', example: '5' }),
    __param(0, (0, common_1.Query)('from_version')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VersioningController.prototype, "getChangelog", null);
exports.VersioningController = VersioningController = __decorate([
    (0, swagger_1.ApiTags)('API Versioning'),
    (0, common_1.Controller)('versions'),
    __metadata("design:paramtypes", [versioning_service_1.VersioningService])
], VersioningController);
//# sourceMappingURL=versioning.controller.js.map