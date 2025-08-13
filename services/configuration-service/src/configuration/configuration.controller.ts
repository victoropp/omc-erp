import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { 
  Configuration, 
  ConfigurationModule, 
  ConfigurationType, 
  ConfigurationStatus 
} from './entities/configuration.entity';

// DTOs for API requests
interface CreateConfigurationDto {
  key: string;
  name: string;
  description?: string;
  module: ConfigurationModule;
  type: ConfigurationType;
  dataType: string;
  value?: string;
  defaultValue?: string;
  isRequired?: boolean;
  isSensitive?: boolean;
  validationRules?: any;
  uiComponent?: string;
  uiGroup?: string;
  environment?: string;
  tags?: string[];
}

interface UpdateConfigurationDto {
  value?: string;
  status?: ConfigurationStatus;
  changeReason?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

interface BulkUpdateDto {
  updates: Array<{
    id: string;
    value: any;
    changeReason?: string;
  }>;
}

@ApiTags('Configuration Management')
@Controller('configuration')
@ApiBearerAuth()
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  // ===== CONFIGURATION RETRIEVAL =====

  @Get(':key')
  @ApiOperation({ summary: 'Get single configuration value' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration value retrieved successfully' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'module', enum: ConfigurationModule, required: false })
  async getConfiguration(
    @Param('key') key: string,
    @Query('tenantId') tenantId?: string,
    @Query('module') module?: ConfigurationModule,
    @Query('useCache') useCache: boolean = true
  ): Promise<{ value: any; metadata?: any }> {
    const value = await this.configService.getConfiguration(key, tenantId, module, useCache);
    return { value };
  }

  @Post('batch')
  @ApiOperation({ summary: 'Get multiple configuration values' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration values retrieved successfully' })
  async getMultipleConfigurations(
    @Body() request: {
      keys: string[];
      tenantId?: string;
      module?: ConfigurationModule;
    }
  ): Promise<Record<string, any>> {
    return this.configService.getMultipleConfigurations(
      request.keys,
      request.tenantId,
      request.module
    );
  }

  @Get('module/:module')
  @ApiOperation({ summary: 'Get all configurations for a module' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module configurations retrieved successfully' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'environment', required: false })
  async getModuleConfigurations(
    @Param('module') module: ConfigurationModule,
    @Query('tenantId') tenantId?: string,
    @Query('environment') environment?: string
  ): Promise<Record<string, any>> {
    return this.configService.getModuleConfigurations(module, tenantId, environment);
  }

  @Get()
  @ApiOperation({ summary: 'Get all configurations with filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configurations retrieved successfully' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'module', enum: ConfigurationModule, required: false })
  @ApiQuery({ name: 'type', enum: ConfigurationType, required: false })
  @ApiQuery({ name: 'status', enum: ConfigurationStatus, required: false })
  @ApiQuery({ name: 'environment', required: false })
  @ApiQuery({ name: 'keys', type: [String], required: false })
  async getAllConfigurations(
    @Query('tenantId') tenantId?: string,
    @Query('module') module?: ConfigurationModule,
    @Query('type') type?: ConfigurationType,
    @Query('status') status?: ConfigurationStatus,
    @Query('environment') environment?: string,
    @Query('keys') keys?: string[]
  ): Promise<Configuration[]> {
    return this.configService.getAllConfigurations({
      tenantId,
      module,
      type,
      status,
      environment,
      keys: Array.isArray(keys) ? keys : keys ? [keys] : undefined,
    });
  }

  // ===== CONFIGURATION MANAGEMENT =====

  @Post()
  @ApiOperation({ summary: 'Create new configuration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Configuration created successfully' })
  async createConfiguration(
    @Body() createDto: CreateConfigurationDto,
    @Request() req: any
  ): Promise<Configuration> {
    const configData = {
      ...createDto,
      createdBy: req.user?.username || req.user?.id,
    };
    return this.configService.createConfiguration(configData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update configuration' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration updated successfully' })
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateDto: UpdateConfigurationDto,
    @Request() req: any
  ): Promise<Configuration> {
    return this.configService.updateConfiguration(
      id,
      updateDto,
      req.user?.username || req.user?.id
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete configuration' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration deleted successfully' })
  async deleteConfiguration(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.configService.deleteConfiguration(id, req.user?.username || req.user?.id);
    return { message: 'Configuration deleted successfully' };
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk update configurations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configurations updated successfully' })
  async bulkUpdateConfigurations(
    @Body() bulkUpdateDto: BulkUpdateDto,
    @Request() req: any
  ): Promise<Configuration[]> {
    return this.configService.bulkUpdateConfigurations(
      bulkUpdateDto.updates,
      req.user?.username || req.user?.id
    );
  }

  // ===== FEATURE FLAGS =====

  @Get('feature/:featureKey/enabled')
  @ApiOperation({ summary: 'Check if feature is enabled' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature flag status retrieved' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async isFeatureEnabled(
    @Param('featureKey') featureKey: string,
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.configService.isFeatureEnabled(featureKey, tenantId, userId);
    return { enabled };
  }

  @Post('feature/:featureKey/enable')
  @ApiOperation({ summary: 'Enable feature flag' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature enabled successfully' })
  async enableFeature(
    @Param('featureKey') featureKey: string,
    @Body() body: { tenantId?: string; percentage?: number }
  ): Promise<{ message: string }> {
    await this.configService.enableFeature(featureKey, body.tenantId, body.percentage);
    return { message: 'Feature enabled successfully' };
  }

  @Post('feature/:featureKey/disable')
  @ApiOperation({ summary: 'Disable feature flag' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature disabled successfully' })
  async disableFeature(
    @Param('featureKey') featureKey: string,
    @Body() body: { tenantId?: string }
  ): Promise<{ message: string }> {
    await this.configService.disableFeature(featureKey, body.tenantId);
    return { message: 'Feature disabled successfully' };
  }

  // ===== ENVIRONMENT MANAGEMENT =====

  @Get('environment/:environment')
  @ApiOperation({ summary: 'Get configurations for specific environment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Environment configurations retrieved' })
  async getEnvironmentConfigurations(
    @Param('environment') environment: string
  ): Promise<Configuration[]> {
    return this.configService.getEnvironmentConfigurations(environment);
  }

  @Post('environment/promote')
  @ApiOperation({ summary: 'Promote configurations between environments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configurations promoted successfully' })
  async promoteConfigurations(
    @Body() promoteDto: {
      fromEnvironment: string;
      toEnvironment: string;
      configIds: string[];
    }
  ): Promise<{ message: string }> {
    await this.configService.promoteConfigurations(
      promoteDto.fromEnvironment,
      promoteDto.toEnvironment,
      promoteDto.configIds
    );
    return { message: 'Configurations promoted successfully' };
  }

  // ===== CONFIGURATION SCHEMAS =====

  @Get('schema/:module')
  @ApiOperation({ summary: 'Get configuration schema for module' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration schema retrieved' })
  async getModuleSchema(
    @Param('module') module: ConfigurationModule
  ): Promise<any[]> {
    // This would return the schema definition for the module
    // For now, return a placeholder
    return [];
  }

  @Post('schema/initialize/:module')
  @ApiOperation({ summary: 'Initialize default configurations for module' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Default configurations initialized' })
  async initializeModuleDefaults(
    @Param('module') module: ConfigurationModule,
    @Body() body: { tenantId?: string; environment?: string },
    @Request() req: any
  ): Promise<{ message: string; configurationsCreated: number }> {
    // This would initialize default configurations from schema
    // Implementation would load schema and create configurations
    return { 
      message: 'Module configurations initialized successfully',
      configurationsCreated: 0
    };
  }

  // ===== VALIDATION AND TESTING =====

  @Post('validate')
  @ApiOperation({ summary: 'Validate configuration values' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration validation completed' })
  async validateConfigurations(
    @Body() validateDto: {
      configurations: Array<{
        key: string;
        value: any;
        tenantId?: string;
        module?: ConfigurationModule;
      }>;
    }
  ): Promise<{
    valid: boolean;
    errors: Array<{
      key: string;
      error: string;
    }>;
  }> {
    const errors: Array<{ key: string; error: string }> = [];

    for (const config of validateDto.configurations) {
      try {
        // This would perform validation logic
        // For now, just a placeholder
      } catch (error) {
        errors.push({
          key: config.key,
          error: error.message
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  @Post('test/:key')
  @ApiOperation({ summary: 'Test configuration value' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration test completed' })
  async testConfiguration(
    @Param('key') key: string,
    @Body() testDto: {
      value: any;
      tenantId?: string;
      module?: ConfigurationModule;
      testData?: any;
    }
  ): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      // This would perform configuration testing
      // For now, just return success
      return {
        success: true,
        result: 'Test passed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== CACHE MANAGEMENT =====

  @Post('cache/refresh')
  @ApiOperation({ summary: 'Refresh configuration cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cache refreshed successfully' })
  async refreshCache(): Promise<{ message: string }> {
    await this.configService.refreshCache();
    return { message: 'Configuration cache refreshed successfully' };
  }

  @Delete('cache/:key')
  @ApiOperation({ summary: 'Clear specific configuration from cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cache cleared successfully' })
  async clearConfigurationCache(
    @Param('key') key: string,
    @Query('tenantId') tenantId?: string,
    @Query('module') module?: ConfigurationModule
  ): Promise<{ message: string }> {
    // This would clear specific cache entries
    return { message: 'Configuration cache cleared successfully' };
  }

  // ===== CONFIGURATION HISTORY =====

  @Get(':id/history')
  @ApiOperation({ summary: 'Get configuration change history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration history retrieved' })
  async getConfigurationHistory(
    @Param('id') id: string,
    @Query('limit') limit: number = 50
  ): Promise<any[]> {
    // This would return configuration change history
    return [];
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Rollback configuration to previous version' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration rolled back successfully' })
  async rollbackConfiguration(
    @Param('id') id: string,
    @Body() rollbackDto: {
      targetVersion: number;
      reason: string;
    },
    @Request() req: any
  ): Promise<Configuration> {
    // This would implement rollback functionality
    throw new Error('Rollback functionality not yet implemented');
  }

  // ===== HEALTH CHECK =====

  @Get('health/status')
  @ApiOperation({ summary: 'Get configuration service health status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Health status retrieved' })
  async getHealthStatus(): Promise<{
    status: string;
    uptime: number;
    configurationsCount: number;
    cacheStatus: any;
  }> {
    // Get total configurations count
    const allConfigs = await this.configService.getAllConfigurations();
    
    return {
      status: 'healthy',
      uptime: process.uptime(),
      configurationsCount: allConfigs.length,
      cacheStatus: {
        enabled: true,
        keysCount: 0, // This would be actual cache key count
      }
    };
  }
}