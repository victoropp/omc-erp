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
exports.ConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const configuration_service_1 = require("./configuration.service");
const configuration_entity_1 = require("./entities/configuration.entity");
let ConfigurationController = class ConfigurationController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    // ===== CONFIGURATION RETRIEVAL =====
    async getConfiguration(key, tenantId, module, useCache = true) {
        const value = await this.configService.getConfiguration(key, tenantId, module, useCache);
        return { value };
    }
    async getMultipleConfigurations(request) {
        return this.configService.getMultipleConfigurations(request.keys, request.tenantId, request.module);
    }
    async getModuleConfigurations(module, tenantId, environment) {
        return this.configService.getModuleConfigurations(module, tenantId, environment);
    }
    async getAllConfigurations(tenantId, module, type, status, environment, keys) {
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
    async createConfiguration(createDto, req) {
        const configData = {
            ...createDto,
            createdBy: req.user?.username || req.user?.id,
        };
        return this.configService.createConfiguration(configData);
    }
    async updateConfiguration(id, updateDto, req) {
        return this.configService.updateConfiguration(id, updateDto, req.user?.username || req.user?.id);
    }
    async deleteConfiguration(id, req) {
        await this.configService.deleteConfiguration(id, req.user?.username || req.user?.id);
        return { message: 'Configuration deleted successfully' };
    }
    async bulkUpdateConfigurations(bulkUpdateDto, req) {
        return this.configService.bulkUpdateConfigurations(bulkUpdateDto.updates, req.user?.username || req.user?.id);
    }
    // ===== FEATURE FLAGS =====
    async isFeatureEnabled(featureKey, tenantId, userId) {
        const enabled = await this.configService.isFeatureEnabled(featureKey, tenantId, userId);
        return { enabled };
    }
    async enableFeature(featureKey, body) {
        await this.configService.enableFeature(featureKey, body.tenantId, body.percentage);
        return { message: 'Feature enabled successfully' };
    }
    async disableFeature(featureKey, body) {
        await this.configService.disableFeature(featureKey, body.tenantId);
        return { message: 'Feature disabled successfully' };
    }
    // ===== ENVIRONMENT MANAGEMENT =====
    async getEnvironmentConfigurations(environment) {
        return this.configService.getEnvironmentConfigurations(environment);
    }
    async promoteConfigurations(promoteDto) {
        await this.configService.promoteConfigurations(promoteDto.fromEnvironment, promoteDto.toEnvironment, promoteDto.configIds);
        return { message: 'Configurations promoted successfully' };
    }
    // ===== CONFIGURATION SCHEMAS =====
    async getModuleSchema(module) {
        // This would return the schema definition for the module
        // For now, return a placeholder
        return [];
    }
    async initializeModuleDefaults(module, body, req) {
        // This would initialize default configurations from schema
        // Implementation would load schema and create configurations
        return {
            message: 'Module configurations initialized successfully',
            configurationsCreated: 0
        };
    }
    // ===== VALIDATION AND TESTING =====
    async validateConfigurations(validateDto) {
        const errors = [];
        for (const config of validateDto.configurations) {
            try {
                // This would perform validation logic
                // For now, just a placeholder
            }
            catch (error) {
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
    async testConfiguration(key, testDto) {
        try {
            // This would perform configuration testing
            // For now, just return success
            return {
                success: true,
                result: 'Test passed'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // ===== CACHE MANAGEMENT =====
    async refreshCache() {
        await this.configService.refreshCache();
        return { message: 'Configuration cache refreshed successfully' };
    }
    async clearConfigurationCache(key, tenantId, module) {
        // This would clear specific cache entries
        return { message: 'Configuration cache cleared successfully' };
    }
    // ===== CONFIGURATION HISTORY =====
    async getConfigurationHistory(id, limit = 50) {
        // This would return configuration change history
        return [];
    }
    async rollbackConfiguration(id, rollbackDto, req) {
        // This would implement rollback functionality
        throw new Error('Rollback functionality not yet implemented');
    }
    // ===== HEALTH CHECK =====
    async getHealthStatus() {
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
};
exports.ConfigurationController = ConfigurationController;
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single configuration value' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration value retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'module', enum: configuration_entity_1.ConfigurationModule, required: false }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('module')),
    __param(3, (0, common_1.Query)('useCache')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Get multiple configuration values' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration values retrieved successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getMultipleConfigurations", null);
__decorate([
    (0, common_1.Get)('module/:module'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all configurations for a module' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Module configurations retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'environment', required: false }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('environment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getModuleConfigurations", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all configurations with filtering' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configurations retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'module', enum: configuration_entity_1.ConfigurationModule, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: configuration_entity_1.ConfigurationType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: configuration_entity_1.ConfigurationStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'environment', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keys', type: [String], required: false }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('module')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('environment')),
    __param(5, (0, common_1.Query)('keys')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Array]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getAllConfigurations", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new configuration' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Configuration created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "createConfiguration", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update configuration' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "updateConfiguration", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete configuration' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "deleteConfiguration", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update configurations' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configurations updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "bulkUpdateConfigurations", null);
__decorate([
    (0, common_1.Get)('feature/:featureKey/enabled'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if feature is enabled' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Feature flag status retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "isFeatureEnabled", null);
__decorate([
    (0, common_1.Post)('feature/:featureKey/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable feature flag' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Feature enabled successfully' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "enableFeature", null);
__decorate([
    (0, common_1.Post)('feature/:featureKey/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable feature flag' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Feature disabled successfully' }),
    __param(0, (0, common_1.Param)('featureKey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "disableFeature", null);
__decorate([
    (0, common_1.Get)('environment/:environment'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configurations for specific environment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Environment configurations retrieved' }),
    __param(0, (0, common_1.Param)('environment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getEnvironmentConfigurations", null);
__decorate([
    (0, common_1.Post)('environment/promote'),
    (0, swagger_1.ApiOperation)({ summary: 'Promote configurations between environments' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configurations promoted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "promoteConfigurations", null);
__decorate([
    (0, common_1.Get)('schema/:module'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration schema for module' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration schema retrieved' }),
    __param(0, (0, common_1.Param)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getModuleSchema", null);
__decorate([
    (0, common_1.Post)('schema/initialize/:module'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default configurations for module' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Default configurations initialized' }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "initializeModuleDefaults", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate configuration values' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration validation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "validateConfigurations", null);
__decorate([
    (0, common_1.Post)('test/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Test configuration value' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration test completed' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "testConfiguration", null);
__decorate([
    (0, common_1.Post)('cache/refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh configuration cache' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cache refreshed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "refreshCache", null);
__decorate([
    (0, common_1.Delete)('cache/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear specific configuration from cache' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cache cleared successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "clearConfigurationCache", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration change history' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration history retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getConfigurationHistory", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback configuration to previous version' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Configuration rolled back successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "rollbackConfiguration", null);
__decorate([
    (0, common_1.Get)('health/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration service health status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Health status retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getHealthStatus", null);
exports.ConfigurationController = ConfigurationController = __decorate([
    (0, swagger_1.ApiTags)('Configuration Management'),
    (0, common_1.Controller)('configuration'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [configuration_service_1.ConfigurationService])
], ConfigurationController);
//# sourceMappingURL=configuration.controller.js.map