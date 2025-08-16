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
var ConfigurationInitializationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationInitializationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const configuration_entity_1 = require("../entities/configuration.entity");
const all_modules_config_schema_1 = require("../all-modules-config.schema");
let ConfigurationInitializationService = ConfigurationInitializationService_1 = class ConfigurationInitializationService {
    configRepository;
    eventEmitter;
    logger = new common_1.Logger(ConfigurationInitializationService_1.name);
    constructor(configRepository, eventEmitter) {
        this.configRepository = configRepository;
        this.eventEmitter = eventEmitter;
    }
    async onModuleInit() {
        await this.initializeSystemConfigurations();
    }
    /**
     * Initialize system-wide default configurations
     */
    async initializeSystemConfigurations() {
        this.logger.log('Initializing system configurations...');
        try {
            const systemConfigs = all_modules_config_schema_1.AllModulesConfigurationSchema.filter(config => config.type === configuration_entity_1.ConfigurationType.SYSTEM);
            let initializedCount = 0;
            for (const configSchema of systemConfigs) {
                const existingConfig = await this.configRepository.findOne({
                    where: {
                        key: configSchema.key,
                        tenantId: null, // System configs have no tenant
                        module: configSchema.module,
                    },
                });
                if (!existingConfig) {
                    const newConfig = this.configRepository.create({
                        ...configSchema,
                        tenantId: null,
                        createdBy: 'SYSTEM_INIT',
                    });
                    await this.configRepository.save(newConfig);
                    initializedCount++;
                    this.logger.debug(`Initialized system config: ${configSchema.key}`);
                }
            }
            this.logger.log(`System configurations initialized. Created ${initializedCount} new configurations.`);
            // Emit initialization complete event
            this.eventEmitter.emit('configuration.system.initialized', {
                configurationsCreated: initializedCount,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Failed to initialize system configurations: ${error.message}`);
            throw error;
        }
    }
    /**
     * Initialize default configurations for a specific tenant
     */
    async initializeTenantConfigurations(tenantId, modules, environment = 'PRODUCTION') {
        this.logger.log(`Initializing configurations for tenant: ${tenantId}`);
        const results = {
            configurationsCreated: 0,
            configurationsUpdated: 0,
            errors: [],
        };
        try {
            // Get tenant-specific configurations from schema
            let tenantConfigs = all_modules_config_schema_1.AllModulesConfigurationSchema.filter(config => config.type === configuration_entity_1.ConfigurationType.TENANT ||
                config.type === configuration_entity_1.ConfigurationType.MODULE);
            // Filter by specific modules if provided
            if (modules && modules.length > 0) {
                tenantConfigs = tenantConfigs.filter(config => modules.includes(config.module));
            }
            for (const configSchema of tenantConfigs) {
                try {
                    const existingConfig = await this.configRepository.findOne({
                        where: {
                            key: configSchema.key,
                            tenantId: tenantId,
                            module: configSchema.module,
                        },
                    });
                    if (!existingConfig) {
                        // Create new configuration
                        const newConfig = this.configRepository.create({
                            ...configSchema,
                            tenantId: tenantId,
                            environment: environment,
                            createdBy: 'TENANT_INIT',
                        });
                        await this.configRepository.save(newConfig);
                        results.configurationsCreated++;
                        this.logger.debug(`Created tenant config: ${configSchema.key} for tenant: ${tenantId}`);
                    }
                    else {
                        // Update existing configuration if needed
                        let shouldUpdate = false;
                        if (!existingConfig.defaultValue && configSchema.defaultValue) {
                            existingConfig.defaultValue = configSchema.defaultValue;
                            shouldUpdate = true;
                        }
                        if (!existingConfig.validationRules && configSchema.validationRules) {
                            existingConfig.validationRules = configSchema.validationRules;
                            shouldUpdate = true;
                        }
                        if (shouldUpdate) {
                            existingConfig.updatedBy = 'TENANT_INIT';
                            await this.configRepository.save(existingConfig);
                            results.configurationsUpdated++;
                        }
                    }
                }
                catch (error) {
                    const errorMessage = `Failed to initialize config ${configSchema.key} for tenant ${tenantId}: ${error.message}`;
                    this.logger.error(errorMessage);
                    results.errors.push(errorMessage);
                }
            }
            this.logger.log(`Tenant configurations initialized for ${tenantId}. ` +
                `Created: ${results.configurationsCreated}, Updated: ${results.configurationsUpdated}, Errors: ${results.errors.length}`);
            // Emit tenant initialization event
            this.eventEmitter.emit('configuration.tenant.initialized', {
                tenantId,
                configurationsCreated: results.configurationsCreated,
                configurationsUpdated: results.configurationsUpdated,
                errors: results.errors,
                timestamp: new Date(),
            });
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to initialize tenant configurations: ${error.message}`);
            throw error;
        }
    }
    /**
     * Initialize configurations for a specific module
     */
    async initializeModuleConfigurations(module, tenantId, environment = 'PRODUCTION') {
        this.logger.log(`Initializing configurations for module: ${module}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
        const results = {
            configurationsCreated: 0,
            configurationsSkipped: 0,
        };
        try {
            const moduleConfigs = all_modules_config_schema_1.AllModulesConfigurationSchema.filter(config => config.module === module);
            for (const configSchema of moduleConfigs) {
                // Skip system configs if tenantId is provided, and vice versa
                if (tenantId && configSchema.type === configuration_entity_1.ConfigurationType.SYSTEM) {
                    continue;
                }
                if (!tenantId && configSchema.type !== configuration_entity_1.ConfigurationType.SYSTEM) {
                    continue;
                }
                const existingConfig = await this.configRepository.findOne({
                    where: {
                        key: configSchema.key,
                        tenantId: tenantId || null,
                        module: configSchema.module,
                    },
                });
                if (!existingConfig) {
                    const newConfig = this.configRepository.create({
                        ...configSchema,
                        tenantId: tenantId || null,
                        environment: environment,
                        createdBy: 'MODULE_INIT',
                    });
                    await this.configRepository.save(newConfig);
                    results.configurationsCreated++;
                    this.logger.debug(`Created module config: ${configSchema.key} for module: ${module}`);
                }
                else {
                    results.configurationsSkipped++;
                }
            }
            this.logger.log(`Module configurations initialized for ${module}. ` +
                `Created: ${results.configurationsCreated}, Skipped: ${results.configurationsSkipped}`);
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to initialize module configurations: ${error.message}`);
            throw error;
        }
    }
    /**
     * Reset configurations to default values
     */
    async resetConfigurationsToDefaults(tenantId, modules, confirmationToken) {
        // Safety check - require confirmation token for reset operations
        if (confirmationToken !== 'CONFIRM_RESET_CONFIGURATIONS') {
            throw new Error('Invalid confirmation token. Reset operation cancelled for safety.');
        }
        this.logger.warn(`Resetting configurations to defaults for tenant: ${tenantId}`);
        const results = {
            configurationsReset: 0,
            errors: [],
        };
        try {
            // Get existing configurations
            const where = { tenantId };
            if (modules && modules.length > 0) {
                where.module = modules;
            }
            const existingConfigs = await this.configRepository.find({ where });
            for (const existingConfig of existingConfigs) {
                try {
                    // Find the schema definition
                    const schemaConfig = all_modules_config_schema_1.AllModulesConfigurationSchema.find(schema => schema.key === existingConfig.key &&
                        schema.module === existingConfig.module);
                    if (schemaConfig && schemaConfig.defaultValue) {
                        existingConfig.value = schemaConfig.defaultValue;
                        existingConfig.previousValue = existingConfig.value;
                        existingConfig.changeReason = 'Reset to default value';
                        existingConfig.updatedBy = 'SYSTEM_RESET';
                        existingConfig.version += 1;
                        await this.configRepository.save(existingConfig);
                        results.configurationsReset++;
                        this.logger.debug(`Reset config to default: ${existingConfig.key}`);
                    }
                }
                catch (error) {
                    const errorMessage = `Failed to reset config ${existingConfig.key}: ${error.message}`;
                    this.logger.error(errorMessage);
                    results.errors.push(errorMessage);
                }
            }
            this.logger.log(`Configurations reset completed for tenant ${tenantId}. ` +
                `Reset: ${results.configurationsReset}, Errors: ${results.errors.length}`);
            // Emit reset event
            this.eventEmitter.emit('configuration.reset.completed', {
                tenantId,
                modules,
                configurationsReset: results.configurationsReset,
                errors: results.errors,
                timestamp: new Date(),
            });
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to reset configurations: ${error.message}`);
            throw error;
        }
    }
    /**
     * Export configurations for backup or migration
     */
    async exportConfigurations(tenantId, modules, environment) {
        this.logger.log(`Exporting configurations${tenantId ? ` for tenant: ${tenantId}` : ''}`);
        try {
            const where = {};
            if (tenantId)
                where.tenantId = tenantId;
            if (environment)
                where.environment = environment;
            if (modules && modules.length > 0)
                where.module = modules;
            const configurations = await this.configRepository.find({
                where,
                order: { module: 'ASC', key: 'ASC' },
            });
            // Remove sensitive data from export
            const exportData = configurations.map(config => {
                const exportConfig = { ...config };
                // Don't export encrypted values in plain text
                if (config.isSensitive || config.isEncrypted) {
                    delete exportConfig.value;
                    delete exportConfig.encryptedValue;
                    exportConfig.isSensitiveDataRemoved = true;
                }
                return exportConfig;
            });
            const result = {
                configurations: exportData,
                metadata: {
                    exportDate: new Date(),
                    tenantId,
                    modules,
                    environment,
                    totalCount: configurations.length,
                },
            };
            this.logger.log(`Exported ${configurations.length} configurations`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to export configurations: ${error.message}`);
            throw error;
        }
    }
    /**
     * Import configurations from backup or migration
     */
    async importConfigurations(importData, options = {}) {
        this.logger.log(`Importing ${importData.configurations.length} configurations`);
        const results = {
            configurationsImported: 0,
            configurationsSkipped: 0,
            configurationsUpdated: 0,
            errors: [],
        };
        try {
            for (const configData of importData.configurations) {
                try {
                    // Override tenantId if provided in options
                    if (options.tenantId) {
                        configData.tenantId = options.tenantId;
                    }
                    const existingConfig = await this.configRepository.findOne({
                        where: {
                            key: configData.key,
                            tenantId: configData.tenantId,
                            module: configData.module,
                        },
                    });
                    if (existingConfig) {
                        if (options.overwriteExisting) {
                            // Update existing configuration
                            Object.assign(existingConfig, configData, {
                                id: existingConfig.id, // Keep original ID
                                createdAt: existingConfig.createdAt, // Keep original creation date
                                updatedBy: 'IMPORT_PROCESS',
                                changeReason: 'Imported from backup/migration',
                            });
                            await this.configRepository.save(existingConfig);
                            results.configurationsUpdated++;
                        }
                        else {
                            results.configurationsSkipped++;
                        }
                    }
                    else {
                        // Create new configuration
                        const newConfig = this.configRepository.create({
                            ...configData,
                            id: undefined, // Let TypeORM generate new ID
                            createdBy: 'IMPORT_PROCESS',
                            updatedBy: 'IMPORT_PROCESS',
                        });
                        await this.configRepository.save(newConfig);
                        results.configurationsImported++;
                    }
                }
                catch (error) {
                    const errorMessage = `Failed to import config ${configData.key}: ${error.message}`;
                    this.logger.error(errorMessage);
                    results.errors.push(errorMessage);
                }
            }
            this.logger.log(`Configuration import completed. ` +
                `Imported: ${results.configurationsImported}, ` +
                `Updated: ${results.configurationsUpdated}, ` +
                `Skipped: ${results.configurationsSkipped}, ` +
                `Errors: ${results.errors.length}`);
            // Emit import event
            this.eventEmitter.emit('configuration.import.completed', {
                ...results,
                timestamp: new Date(),
            });
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to import configurations: ${error.message}`);
            throw error;
        }
    }
};
exports.ConfigurationInitializationService = ConfigurationInitializationService;
exports.ConfigurationInitializationService = ConfigurationInitializationService = ConfigurationInitializationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuration_entity_1.Configuration)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], ConfigurationInitializationService);
//# sourceMappingURL=configuration-initialization.service.js.map