import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VersioningService } from './versioning.service';

@ApiTags('API Versioning')
@Controller('versions')
export class VersioningController {
  constructor(private versioningService: VersioningService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supported API versions' })
  @ApiResponse({ status: 200, description: 'List of all API versions' })
  getAllVersions() {
    const versions = this.versioningService.getAllVersions();
    return {
      current_version: this.versioningService.getCurrentVersion(),
      default_version: this.versioningService.getDefaultVersion(),
      versions,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('supported')
  @ApiOperation({ summary: 'Get currently supported API versions' })
  @ApiResponse({ status: 200, description: 'List of supported API versions' })
  getSupportedVersions() {
    const versions = this.versioningService.getSupportedVersions();
    return {
      current_version: this.versioningService.getCurrentVersion(),
      supported_versions: versions,
      count: versions.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':version')
  @ApiOperation({ summary: 'Get information about a specific API version' })
  @ApiResponse({ status: 200, description: 'Version information retrieved' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  @ApiParam({ name: 'version', description: 'API version (e.g., 1.0, 2.0)', example: '2.0' })
  getVersionInfo(@Param('version') version: string) {
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

  @Get(':version/compatibility')
  @ApiOperation({ summary: 'Check version compatibility' })
  @ApiResponse({ status: 200, description: 'Version compatibility information' })
  @ApiParam({ name: 'version', description: 'API version to check', example: '1.0' })
  checkCompatibility(@Param('version') version: string) {
    const compatibility = this.versioningService.validateVersionCompatibility(version);
    
    return {
      requested_version: version,
      compatibility,
      recommendations: this.getVersionRecommendations(version),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('migration/guide')
  @ApiOperation({ summary: 'Get migration guide between versions' })
  @ApiResponse({ status: 200, description: 'Migration guide information' })
  @ApiQuery({ name: 'from', description: 'Source version', example: '1.0' })
  @ApiQuery({ name: 'to', description: 'Target version', example: '2.0' })
  getMigrationGuide(
    @Query('from') fromVersion: string,
    @Query('to') toVersion: string,
  ) {
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

  @Get('changelog')
  @ApiOperation({ summary: 'Get API changelog' })
  @ApiResponse({ status: 200, description: 'API changelog' })
  @ApiQuery({ name: 'from_version', required: false, description: 'Starting version for changelog' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of versions to include', example: '5' })
  getChangelog(
    @Query('from_version') fromVersion?: string,
    @Query('limit') limit?: string,
  ) {
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

  private getVersionRecommendations(version: string): string[] {
    const versionInfo = this.versioningService.getVersionInfo(version);
    const recommendations: string[] = [];

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
        } else {
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

  private getNewFeatures(fromVersion: any, toVersion: any): string[] {
    // Calculate new features by comparing feature lists
    const fromFeatures = new Set(fromVersion.features || []);
    const toFeatures = toVersion.features || [];
    
    return toFeatures.filter(feature => !fromFeatures.has(feature));
  }

  private getRemovedFeatures(fromVersion: any, toVersion: any): string[] {
    // Calculate removed features by comparing feature lists
    const toFeatures = new Set(toVersion.features || []);
    const fromFeatures = fromVersion.features || [];
    
    return fromFeatures.filter(feature => !toFeatures.has(feature));
  }

  private getMigrationSteps(fromVersion: string, toVersion: string): string[] {
    // Define migration steps between versions
    const migrationSteps: Record<string, string[]> = {
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

  private getEstimatedMigrationEffort(fromVersion: string, toVersion: string): string {
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

  private getVersionReleaseDate(version: string): string {
    // Mock release dates - in real implementation, this would come from a database
    const releaseDates: Record<string, string> = {
      '2.0': '2024-01-15',
      '1.1': '2023-09-01',
      '1.0': '2023-06-01',
      '0.9': '2023-01-01',
    };

    return releaseDates[version] || 'Unknown';
  }
}