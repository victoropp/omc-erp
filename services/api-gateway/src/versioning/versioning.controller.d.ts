import { VersioningService } from './versioning.service';
export declare class VersioningController {
    private versioningService;
    constructor(versioningService: VersioningService);
    getAllVersions(): {
        current_version: string;
        default_version: string;
        versions: import("./versioning.service").ApiVersion[];
        timestamp: string;
    };
    getSupportedVersions(): {
        current_version: string;
        supported_versions: import("./versioning.service").ApiVersion[];
        count: number;
        timestamp: string;
    };
    getVersionInfo(version: string): {
        error: string;
        requested_version: string;
        available_versions: string[];
        timestamp: string;
        version_info?: undefined;
        compatibility?: undefined;
    } | {
        version_info: import("./versioning.service").ApiVersion;
        compatibility: import("./versioning.service").VersionCompatibility;
        timestamp: string;
        error?: undefined;
        requested_version?: undefined;
        available_versions?: undefined;
    };
    checkCompatibility(version: string): {
        requested_version: string;
        compatibility: import("./versioning.service").VersionCompatibility;
        recommendations: string[];
        timestamp: string;
    };
    getMigrationGuide(fromVersion: string, toVersion: string): {
        error: string;
        from_version: string;
        to_version: string;
        available_versions: string[];
        timestamp: string;
        migration?: undefined;
    } | {
        migration: {
            from_version: string;
            to_version: string;
            breaking_changes: string[];
            new_features: string[];
            removed_features: string[];
            migration_steps: string[];
            estimated_effort: string;
        };
        timestamp: string;
        error?: undefined;
        from_version?: undefined;
        to_version?: undefined;
        available_versions?: undefined;
    };
    getChangelog(fromVersion?: string, limit?: string): {
        changelog: {
            version: string;
            release_date: string;
            features: string[];
            breaking_changes: string[];
            deprecation_status: {
                is_deprecated: boolean;
                deprecation_date: string | undefined;
                sunset_date: string | undefined;
            };
            migration_guide: string | undefined;
        }[];
        total_versions: number;
        showing: number;
        timestamp: string;
    };
    private getVersionRecommendations;
    private getNewFeatures;
    private getRemovedFeatures;
    private getMigrationSteps;
    private getEstimatedMigrationEffort;
    private getVersionReleaseDate;
}
//# sourceMappingURL=versioning.controller.d.ts.map