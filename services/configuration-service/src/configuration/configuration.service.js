"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ConfigurationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const crypto = __importStar(require("crypto"));
const NodeCache = __importStar(require("node-cache"));
const configuration_entity_1 = require("./entities/configuration.entity");
let ConfigurationService = ConfigurationService_1 = class ConfigurationService {
    configRepository;
    eventEmitter;
    logger = new common_1.Logger(ConfigurationService_1.name);
    cache = new NodeCache({
        stdTTL: 3600, // 1 hour default
        checkperiod: 600, // Check for expired keys every 10 minutes
        useClones: false
    });
    encryptionKey = process.env.CONFIG_ENCRYPTION_KEY || 'default-key-change-in-production';
    constructor(configRepository, eventEmitter) {
        this.configRepository = configRepository;
        this.eventEmitter = eventEmitter;
    }
    // ===== CONFIGURATION RETRIEVAL =====
    async getConfiguration(key, tenantId, module, useCache = true) {
        const cacheKey = this.buildCacheKey(key, tenantId, module);
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (cached !== undefined) {
                await this.incrementAccessCount(key, tenantId, module);
                return cached;
            }
        }
        // Get configuration hierarchy
        const configs = await this.getConfigurationHierarchy(key, tenantId, module);
        const effectiveValue = this.resolveConfigurationValue(configs);
        // Cache the result
        if (useCache) {
            const config = configs.find(c => c.key === key);
            const ttl = config?.cacheTtlSeconds || 3600;
            this.cache.set(cacheKey, effectiveValue, ttl);
        }
        // Update access tracking
        await this.incrementAccessCount(key, tenantId, module);
        return effectiveValue;
    }
    async getMultipleConfigurations(keys, tenantId, module) {
        const results = {};
        // Batch fetch configurations
        const where = {
            key: (0, typeorm_2.In)(keys),
            status: configuration_entity_1.ConfigurationStatus.ACTIVE,
            isActive: true,
        };
        if (tenantId)
            where.tenantId = tenantId;
        if (module)
            where.module = module;
        const configs = await this.configRepository.find({
            where,
            order: { inheritanceLevel: 'ASC', version: 'DESC' },
        });
        // Resolve each configuration
        for (const key of keys) {
            const keyConfigs = configs.filter(c => c.key === key);
            if (keyConfigs.length > 0) {
                results[key] = this.resolveConfigurationValue(keyConfigs);
            }
        }
        return results;
    }
    async getModuleConfigurations(module, tenantId, environment) {
        const where = {
            module,
            status: configuration_entity_1.ConfigurationStatus.ACTIVE,
            isActive: true,
        };
        if (tenantId)
            where.tenantId = tenantId;
        if (environment)
            where.environment = environment;
        const configs = await this.configRepository.find({
            where,
            order: { uiGroup: 'ASC', uiOrder: 'ASC' },
        });
        const result = {};
        const groupedByKey = this.groupConfigurationsByKey(configs);
        for (const [key, keyConfigs] of Object.entries(groupedByKey)) {
            result[key] = this.resolveConfigurationValue(keyConfigs);
        }
        return result;
    }
    async getAllConfigurations(query = {}) {
        const where = {
            isActive: true,
        };
        if (query.tenantId)
            where.tenantId = query.tenantId;
        if (query.module)
            where.module = query.module;
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        if (query.environment)
            where.environment = query.environment;
        if (query.keys)
            where.key = (0, typeorm_2.In)(query.keys);
        return this.configRepository.find({
            where,
            order: { module: 'ASC', key: 'ASC', inheritanceLevel: 'ASC' },
        });
    }
    // ===== CONFIGURATION MANAGEMENT =====
    async createConfiguration(configData) {
        try {
            // Validate required fields
            this.validateConfigurationData(configData);
            // Check for existing configuration
            const existing = await this.configRepository.findOne({
                where: {
                    key: configData.key,
                    tenantId: configData.tenantId || null,
                    module: configData.module,
                },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Configuration ${configData.key} already exists for this tenant/module`);
            }
            // Create configuration
            const config = this.configRepository.create(configData);
            // Handle sensitive/encrypted values
            if (config.isSensitive && config.value) {
                config.encryptedValue = this.encryptValue(config.value);
                config.value = null; // Clear plain text value
                config.isEncrypted = true;
            }
            const savedConfig = await this.configRepository.save(config);
            // Clear related cache entries
            this.clearConfigurationCache(savedConfig.key, savedConfig.tenantId, savedConfig.module);
            // Emit event
            this.eventEmitter.emit('configuration.created', {
                configurationId: savedConfig.id,
                key: savedConfig.key,
                module: savedConfig.module,
                tenantId: savedConfig.tenantId,
            });
            this.logger.log(`Configuration created: ${savedConfig.key}`);
            return savedConfig;
        }
        catch (error) {
            this.logger.error(`Failed to create configuration: ${error.message}`);
            throw error;
        }
    }
    async updateConfiguration(id, updateData, updatedBy) {
        const config = await this.configRepository.findOne({ where: { id } });
        if (!config) {
            throw new common_1.NotFoundException(`Configuration ${id} not found`);
        }
        // Store previous value for auditing
        config.previousValue = config.value || config.encryptedValue;
        config.updatedBy = updatedBy;
        // Update fields
        if (updateData.value !== undefined) {
            if (config.isSensitive) {
                config.encryptedValue = this.encryptValue(updateData.value);
                config.value = null;
            }
            else {
                config.value = updateData.value;
            }
        }
        if (updateData.status)
            config.status = updateData.status;
        if (updateData.changeReason)
            config.changeReason = updateData.changeReason;
        if (updateData.approvedBy)
            config.approvedBy = updateData.approvedBy;
        if (updateData.effectiveDate)
            config.effectiveDate = updateData.effectiveDate;
        if (updateData.expiryDate)
            config.expiryDate = updateData.expiryDate;
        // Validate the new value
        this.validateConfigurationValue(config);
        const updatedConfig = await this.configRepository.save(config);
        // Clear cache
        this.clearConfigurationCache(config.key, config.tenantId, config.module);
        // Emit events
        this.eventEmitter.emit('configuration.updated', {
            configurationId: updatedConfig.id,
            key: updatedConfig.key,
            module: updatedConfig.module,
            tenantId: updatedConfig.tenantId,
            previousValue: config.previousValue,
            newValue: updateData.value,
        });
        // If this affects other configurations, refresh them
        if (config.affects && config.affects.length > 0) {
            await this.refreshDependentConfigurations(config.affects);
        }
        this.logger.log(`Configuration updated: ${updatedConfig.key}`);
        return updatedConfig;
    }
    async deleteConfiguration(id, deletedBy) {
        const config = await this.configRepository.findOne({ where: { id } });
        if (!config) {
            throw new common_1.NotFoundException(`Configuration ${id} not found`);
        }
        // Soft delete
        config.isActive = false;
        config.status = configuration_entity_1.ConfigurationStatus.ARCHIVED;
        config.updatedBy = deletedBy;
        await this.configRepository.save(config);
        // Clear cache
        this.clearConfigurationCache(config.key, config.tenantId, config.module);
        // Emit event
        this.eventEmitter.emit('configuration.deleted', {
            configurationId: config.id,
            key: config.key,
            module: config.module,
            tenantId: config.tenantId,
        });
        this.logger.log(`Configuration deleted: ${config.key}`);
    }
    async bulkUpdateConfigurations(updates, updatedBy) {
        const results = [];
        for (const update of updates) {
            try {
                const result = await this.updateConfiguration(update.id, {
                    value: update.value?.toString(),
                    changeReason: update.changeReason
                }, updatedBy);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to update configuration ${update.id}: ${error.message}`);
            }
        }
        return results;
    }
    // ===== VALIDATION AND SECURITY =====
    validateConfigurationData(configData) {
        if (!configData.key) {
            throw new common_1.BadRequestException('Configuration key is required');
        }
        if (!configData.name) {
            throw new common_1.BadRequestException('Configuration name is required');
        }
        if (!configData.module) {
            throw new common_1.BadRequestException('Configuration module is required');
        }
        if (!configData.type) {
            throw new common_1.BadRequestException('Configuration type is required');
        }
        if (!configData.dataType) {
            throw new common_1.BadRequestException('Configuration data type is required');
        }
    }
    validateConfigurationValue(config) {
        const value = config.value || (config.isEncrypted ? this.decryptValue(config.encryptedValue) : null);
        if (!value && config.isRequired) {
            throw new common_1.BadRequestException(`Configuration ${config.key} is required`);
        }
        if (!value)
            return;
        // Validate based on data type
        switch (config.dataType) {
            case configuration_entity_1.ConfigurationDataType.NUMBER:
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    throw new common_1.BadRequestException(`Configuration ${config.key} must be a valid number`);
                }
                if (config.minValue !== null && numValue < config.minValue) {
                    throw new common_1.BadRequestException(`Configuration ${config.key} must be >= ${config.minValue}`);
                }
                if (config.maxValue !== null && numValue > config.maxValue) {
                    throw new common_1.BadRequestException(`Configuration ${config.key} must be <= ${config.maxValue}`);
                }
                break;
            case configuration_entity_1.ConfigurationDataType.BOOLEAN:
                if (!['true', 'false'].includes(value.toLowerCase())) {
                    throw new common_1.BadRequestException(`Configuration ${config.key} must be true or false`);
                }
                break;
            case configuration_entity_1.ConfigurationDataType.JSON:
                try {
                    JSON.parse(value);
                }
                catch {
                    throw new common_1.BadRequestException(`Configuration ${config.key} must be valid JSON`);
                }
                break;
            case configuration_entity_1.ConfigurationDataType.STRING:
                if (config.allowedValues && config.allowedValues.length > 0) {
                    if (!config.allowedValues.includes(value)) {
                        throw new common_1.BadRequestException(`Configuration ${config.key} must be one of: ${config.allowedValues.join(', ')}`);
                    }
                }
                if (config.regexPattern) {
                    const regex = new RegExp(config.regexPattern);
                    if (!regex.test(value)) {
                        throw new common_1.BadRequestException(`Configuration ${config.key} does not match required pattern`);
                    }
                }
                break;
        }
    }
    // ===== FEATURE FLAGS =====
    async isFeatureEnabled(featureKey, tenantId, userId) {
        const config = await this.getConfigurationHierarchy(featureKey, tenantId);
        const featureConfig = config.find(c => c.featureFlag);
        if (!featureConfig) {
            return false;
        }
        const isEnabled = featureConfig.getEffectiveValue();
        // Handle gradual rollout
        if (featureConfig.featureFlagPercentage && featureConfig.featureFlagPercentage < 100) {
            const hash = crypto.createHash('md5')
                .update(`${featureKey}:${tenantId || 'system'}:${userId || 'anonymous'}`)
                .digest('hex');
            const percentage = parseInt(hash.substring(0, 8), 16) % 100;
            return percentage < featureConfig.featureFlagPercentage;
        }
        return Boolean(isEnabled);
    }
    async enableFeature(featureKey, tenantId, percentage) {
        const config = await this.configRepository.findOne({
            where: { key: featureKey, tenantId, featureFlag: true },
        });
        if (config) {
            await this.updateConfiguration(config.id, {
                value: 'true',
                changeReason: `Feature enabled${percentage ? ` for ${percentage}% rollout` : ''}`
            });
            if (percentage) {
                config.featureFlagPercentage = percentage;
                await this.configRepository.save(config);
            }
        }
    }
    async disableFeature(featureKey, tenantId) {
        const config = await this.configRepository.findOne({
            where: { key: featureKey, tenantId, featureFlag: true },
        });
        if (config) {
            await this.updateConfiguration(config.id, {
                value: 'false',
                changeReason: 'Feature disabled'
            });
        }
    }
    // ===== ENVIRONMENT AND DEPLOYMENT =====
    async getEnvironmentConfigurations(environment) {
        return this.configRepository.find({
            where: [
                { environment },
                { environment: 'ALL' },
            ],
            order: { module: 'ASC', key: 'ASC' },
        });
    }
    async promoteConfigurations(fromEnvironment, toEnvironment, configIds) {
        const configs = await this.configRepository.find({
            where: { id: (0, typeorm_2.In)(configIds), environment: fromEnvironment },
        });
        for (const config of configs) {
            const newConfig = { ...config };
            newConfig.id = undefined; // Let TypeORM generate new ID
            newConfig.environment = toEnvironment;
            newConfig.status = configuration_entity_1.ConfigurationStatus.PENDING_APPROVAL;
            await this.configRepository.save(newConfig);
        }
        this.logger.log(`Promoted ${configs.length} configurations from ${fromEnvironment} to ${toEnvironment}`);
    }
    // ===== CACHING AND PERFORMANCE =====
    async refreshCache() {
        this.logger.log('Refreshing configuration cache');
        // Get all active configurations
        const configs = await this.configRepository.find({
            where: {
                isActive: true,
                status: configuration_entity_1.ConfigurationStatus.ACTIVE,
                refreshFrequency: 'REAL_TIME'
            },
        });
        // Update cache for real-time configurations
        for (const config of configs) {
            const cacheKey = this.buildCacheKey(config.key, config.tenantId, config.module);
            const value = config.getEffectiveValue();
            this.cache.set(cacheKey, value, config.cacheTtlSeconds || 3600);
        }
    }
    clearConfigurationCache(key, tenantId, module) {
        const patterns = [
            this.buildCacheKey(key, tenantId, module),
            this.buildCacheKey(key, tenantId),
            this.buildCacheKey(key, undefined, module),
            this.buildCacheKey(key),
        ];
        patterns.forEach(pattern => {
            this.cache.del(pattern);
        });
    }
    buildCacheKey(key, tenantId, module) {
        return `config:${key}:${tenantId || 'system'}:${module || 'global'}`;
    }
    // ===== HELPER METHODS =====
    async getConfigurationHierarchy(key, tenantId, module) {
        const where = [
            { key, tenantId: null, module }, // System level
        ];
        if (tenantId) {
            where.push({ key, tenantId, module }); // Tenant level
        }
        if (module) {
            where.push({ key, tenantId: null, module: undefined }); // Global system
            if (tenantId) {
                where.push({ key, tenantId, module: undefined }); // Global tenant
            }
        }
        return this.configRepository.find({
            where,
            order: { inheritanceLevel: 'ASC', version: 'DESC' },
        });
    }
    resolveConfigurationValue(configs) {
        if (configs.length === 0)
            return null;
        // Sort by inheritance level (highest priority last)
        const sortedConfigs = configs.sort((a, b) => a.inheritanceLevel - b.inheritanceLevel);
        // Find the highest priority active configuration
        for (let i = sortedConfigs.length - 1; i >= 0; i--) {
            const config = sortedConfigs[i];
            if (config.status === configuration_entity_1.ConfigurationStatus.ACTIVE && config.isActive) {
                const now = new Date();
                // Check if configuration is effective
                if (config.effectiveDate && config.effectiveDate > now)
                    continue;
                if (config.expiryDate && config.expiryDate < now)
                    continue;
                return config.getEffectiveValue();
            }
        }
        return null;
    }
    groupConfigurationsByKey(configs) {
        return configs.reduce((groups, config) => {
            if (!groups[config.key]) {
                groups[config.key] = [];
            }
            groups[config.key].push(config);
            return groups;
        }, {});
    }
    async incrementAccessCount(key, tenantId, module) {
        // Update access count asynchronously
        setImmediate(async () => {
            try {
                await this.configRepository.increment({ key, tenantId, module }, 'accessCount', 1);
                await this.configRepository.update({ key, tenantId, module }, { lastAccessedDate: new Date() });
            }
            catch (error) {
                // Ignore errors in access tracking
            }
        });
    }
    async refreshDependentConfigurations(dependentKeys) {
        for (const key of dependentKeys) {
            this.cache.del(`config:${key}:*`);
        }
    }
    encryptValue(value) {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    decryptValue(encryptedValue) {
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
        let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.ConfigurationService = ConfigurationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigurationService.prototype, "refreshCache", null);
exports.ConfigurationService = ConfigurationService = ConfigurationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuration_entity_1.Configuration)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], ConfigurationService);
//# sourceMappingURL=configuration.service.js.map