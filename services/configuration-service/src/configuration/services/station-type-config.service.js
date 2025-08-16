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
var StationTypeConfigurationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationTypeConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const configuration_entity_1 = require("../entities/configuration.entity");
const price_buildup_entity_1 = require("../entities/price-buildup.entity");
let StationTypeConfigurationService = StationTypeConfigurationService_1 = class StationTypeConfigurationService {
    configRepository;
    eventEmitter;
    entityManager;
    logger = new common_1.Logger(StationTypeConfigurationService_1.name);
    constructor(configRepository, eventEmitter, entityManager) {
        this.configRepository = configRepository;
        this.eventEmitter = eventEmitter;
        this.entityManager = entityManager;
    }
    // ===== STATION TYPE CONFIGURATION MANAGEMENT =====
    async createStationTypeConfiguration(stationTypeDto, createdBy) {
        return this.entityManager.transaction(async (manager) => {
            try {
                // Check if station type configuration already exists
                const existing = await this.getStationTypeConfiguration(stationTypeDto.stationType);
                if (existing) {
                    throw new common_1.BadRequestException(`Station type configuration for ${stationTypeDto.stationType} already exists`);
                }
                // Create base station type configuration
                const baseConfig = await this.createBaseStationTypeConfig(manager, stationTypeDto, createdBy);
                // Create specific configurations for the station type
                await this.createStationTypeSpecificConfigs(manager, stationTypeDto, createdBy);
                // Create default price component configurations
                await this.createDefaultPriceComponentConfigs(manager, stationTypeDto, createdBy);
                this.logger.log(`Created station type configuration for ${stationTypeDto.stationType}`);
                // Emit event
                this.eventEmitter.emit('station-type-config.created', {
                    stationType: stationTypeDto.stationType,
                    createdBy,
                });
                return this.getStationTypeConfiguration(stationTypeDto.stationType);
            }
            catch (error) {
                this.logger.error(`Failed to create station type configuration: ${error.message}`);
                throw error;
            }
        });
    }
    async updateStationTypeConfiguration(stationType, updateDto, updatedBy) {
        return this.entityManager.transaction(async (manager) => {
            const existing = await this.getStationTypeConfiguration(stationType);
            if (!existing) {
                throw new common_1.NotFoundException(`Station type configuration for ${stationType} not found`);
            }
            // Update configurations
            for (const [key, value] of Object.entries(updateDto)) {
                if (key === 'stationType')
                    continue; // Skip station type change
                const configKey = `station_type.${stationType.toLowerCase()}.${key}`;
                await this.updateConfigurationValue(manager, configKey, value, updatedBy);
            }
            this.logger.log(`Updated station type configuration for ${stationType}`);
            // Emit event
            this.eventEmitter.emit('station-type-config.updated', {
                stationType,
                updatedBy,
                changes: updateDto,
            });
            return this.getStationTypeConfiguration(stationType);
        });
    }
    async getStationTypeConfiguration(stationType) {
        try {
            const configs = await this.configRepository.find({
                where: {
                    module: configuration_entity_1.ConfigurationModule.STATION_CONFIGURATION,
                    key: `station_type.${stationType.toLowerCase()}%`,
                    status: configuration_entity_1.ConfigurationStatus.ACTIVE,
                    isActive: true,
                },
            });
            if (configs.length === 0) {
                return null;
            }
            return this.buildStationTypeConfiguration(stationType, configs);
        }
        catch (error) {
            this.logger.error(`Failed to get station type configuration for ${stationType}: ${error.message}`);
            return null;
        }
    }
    async getAllStationTypeConfigurations() {
        const stationTypes = Object.values(price_buildup_entity_1.StationType);
        const configurations = [];
        for (const stationType of stationTypes) {
            const config = await this.getStationTypeConfiguration(stationType);
            if (config) {
                configurations.push(config);
            }
        }
        return configurations;
    }
    async getStationTypesByProduct(productType) {
        const allConfigs = await this.getAllStationTypeConfigurations();
        return allConfigs
            .filter(config => config.supportedProducts.includes(productType))
            .map(config => config.stationType);
    }
    async getApplicableComponentsForStationType(stationType) {
        const config = await this.getStationTypeConfiguration(stationType);
        return config?.applicableComponents || [];
    }
    async validateStationTypeForProduct(stationType, productType) {
        const config = await this.getStationTypeConfiguration(stationType);
        if (!config) {
            return false;
        }
        return config.isActive && config.supportedProducts.includes(productType);
    }
    // ===== INITIALIZATION AND DEFAULTS =====
    async initializeDefaultStationTypeConfigurations(createdBy) {
        const defaultConfigurations = this.getDefaultStationTypeConfigurations();
        for (const stationTypeDto of defaultConfigurations) {
            try {
                const existing = await this.getStationTypeConfiguration(stationTypeDto.stationType);
                if (!existing) {
                    await this.createStationTypeConfiguration(stationTypeDto, createdBy);
                }
            }
            catch (error) {
                this.logger.error(`Failed to initialize ${stationTypeDto.stationType} configuration: ${error.message}`);
            }
        }
        this.logger.log('Initialized default station type configurations');
    }
    // ===== PRIVATE HELPER METHODS =====
    async createBaseStationTypeConfig(manager, stationTypeDto, createdBy) {
        const baseConfigKey = `station_type.${stationTypeDto.stationType.toLowerCase()}.base`;
        const baseConfig = manager.create(configuration_entity_1.Configuration, {
            key: baseConfigKey,
            name: `${stationTypeDto.stationTypeName} Base Configuration`,
            description: stationTypeDto.description,
            module: configuration_entity_1.ConfigurationModule.STATION_CONFIGURATION,
            type: configuration_entity_1.ConfigurationType.SYSTEM,
            dataType: configuration_entity_1.ConfigurationDataType.JSON,
            status: configuration_entity_1.ConfigurationStatus.ACTIVE,
            jsonValue: {
                stationType: stationTypeDto.stationType,
                stationTypeName: stationTypeDto.stationTypeName,
                description: stationTypeDto.description,
                isActive: stationTypeDto.isActive !== false,
            },
            isRequired: true,
            isSystemConfig: true,
            createdBy,
        });
        return manager.save(baseConfig);
    }
    async createStationTypeSpecificConfigs(manager, stationTypeDto, createdBy) {
        const stationTypeKey = stationTypeDto.stationType.toLowerCase();
        const specificConfigs = [
            {
                key: `station_type.${stationTypeKey}.applicable_components`,
                name: `${stationTypeDto.stationTypeName} Applicable Components`,
                dataType: configuration_entity_1.ConfigurationDataType.ARRAY,
                value: JSON.stringify(stationTypeDto.applicableComponents || this.getDefaultApplicableComponents(stationTypeDto.stationType)),
                description: 'Price components applicable to this station type',
            },
            {
                key: `station_type.${stationTypeKey}.supported_products`,
                name: `${stationTypeDto.stationTypeName} Supported Products`,
                dataType: configuration_entity_1.ConfigurationDataType.ARRAY,
                value: JSON.stringify(stationTypeDto.supportedProducts || Object.values(price_buildup_entity_1.ProductType)),
                description: 'Product types supported by this station type',
            },
            {
                key: `station_type.${stationTypeKey}.base_dealer_margin`,
                name: `${stationTypeDto.stationTypeName} Base Dealer Margin`,
                dataType: configuration_entity_1.ConfigurationDataType.NUMBER,
                value: (stationTypeDto.baseDealerMargin || this.getDefaultDealerMargin(stationTypeDto.stationType)).toString(),
                description: 'Base dealer margin for this station type',
            },
            {
                key: `station_type.${stationTypeKey}.base_transport_cost`,
                name: `${stationTypeDto.stationTypeName} Base Transport Cost`,
                dataType: configuration_entity_1.ConfigurationDataType.NUMBER,
                value: (stationTypeDto.baseTransportCost || 0).toString(),
                description: 'Base transport cost for this station type',
            },
            {
                key: `station_type.${stationTypeKey}.regulatory_compliance`,
                name: `${stationTypeDto.stationTypeName} Regulatory Compliance`,
                dataType: configuration_entity_1.ConfigurationDataType.STRING,
                value: stationTypeDto.regulatoryCompliance || this.getDefaultRegulatoryCompliance(stationTypeDto.stationType),
                description: 'Regulatory compliance requirements',
            },
            {
                key: `station_type.${stationTypeKey}.operating_model`,
                name: `${stationTypeDto.stationTypeName} Operating Model`,
                dataType: configuration_entity_1.ConfigurationDataType.STRING,
                value: stationTypeDto.operatingModel || this.getDefaultOperatingModel(stationTypeDto.stationType),
                description: 'Operating model description',
            },
            {
                key: `station_type.${stationTypeKey}.requires_special_pricing`,
                name: `${stationTypeDto.stationTypeName} Requires Special Pricing`,
                dataType: configuration_entity_1.ConfigurationDataType.BOOLEAN,
                value: (stationTypeDto.requiresSpecialPricing || false).toString(),
                description: 'Whether this station type requires special pricing considerations',
            },
        ];
        for (const configData of specificConfigs) {
            const config = manager.create(configuration_entity_1.Configuration, {
                ...configData,
                module: configuration_entity_1.ConfigurationModule.STATION_CONFIGURATION,
                type: configuration_entity_1.ConfigurationType.SYSTEM,
                status: configuration_entity_1.ConfigurationStatus.ACTIVE,
                isRequired: true,
                isSystemConfig: true,
                createdBy,
            });
            await manager.save(config);
        }
    }
    async createDefaultPriceComponentConfigs(manager, stationTypeDto, createdBy) {
        const stationTypeKey = stationTypeDto.stationType.toLowerCase();
        const applicableComponents = stationTypeDto.applicableComponents || this.getDefaultApplicableComponents(stationTypeDto.stationType);
        for (const componentType of applicableComponents) {
            const componentKey = componentType.toLowerCase();
            const configKey = `station_type.${stationTypeKey}.component.${componentKey}`;
            const componentConfig = manager.create(configuration_entity_1.Configuration, {
                key: `${configKey}.enabled`,
                name: `${stationTypeDto.stationTypeName} ${componentType} Enabled`,
                description: `Whether ${componentType} is enabled for ${stationTypeDto.stationTypeName}`,
                module: configuration_entity_1.ConfigurationModule.PRICE_COMPONENTS,
                type: configuration_entity_1.ConfigurationType.SYSTEM,
                dataType: configuration_entity_1.ConfigurationDataType.BOOLEAN,
                status: configuration_entity_1.ConfigurationStatus.ACTIVE,
                value: 'true',
                isRequired: true,
                isSystemConfig: true,
                createdBy,
            });
            await manager.save(componentConfig);
        }
    }
    async updateConfigurationValue(manager, configKey, value, updatedBy) {
        const config = await manager.findOne(configuration_entity_1.Configuration, {
            where: { key: configKey, module: configuration_entity_1.ConfigurationModule.STATION_CONFIGURATION },
        });
        if (config) {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            await manager.update(configuration_entity_1.Configuration, config.id, {
                value: stringValue,
                jsonValue: typeof value === 'object' ? value : null,
                updatedBy,
            });
        }
    }
    buildStationTypeConfiguration(stationType, configs) {
        const configMap = configs.reduce((map, config) => {
            const keyParts = config.key.split('.');
            const lastPart = keyParts[keyParts.length - 1];
            map[lastPart] = config.getEffectiveValue();
            return map;
        }, {});
        const baseConfig = configs.find(c => c.key.endsWith('.base'))?.jsonValue || {};
        return {
            stationType,
            stationTypeName: baseConfig.stationTypeName || stationType,
            description: baseConfig.description || '',
            isActive: baseConfig.isActive !== false,
            applicableComponents: configMap.applicable_components || [],
            supportedProducts: configMap.supported_products || [],
            baseDealerMargin: parseFloat(configMap.base_dealer_margin || '0'),
            baseTransportCost: parseFloat(configMap.base_transport_cost || '0'),
            regulatoryCompliance: configMap.regulatory_compliance || '',
            operatingModel: configMap.operating_model || '',
            requiresSpecialPricing: configMap.requires_special_pricing || false,
            configurations: configMap,
        };
    }
    getDefaultStationTypeConfigurations() {
        return [
            {
                stationType: price_buildup_entity_1.StationType.COCO,
                stationTypeName: 'Company Owned Company Operated',
                description: 'Stations owned and operated by the company',
                isActive: true,
                baseDealerMargin: 0.15, // 15 pesewas
                regulatoryCompliance: 'Full company compliance responsibility',
                operatingModel: 'Direct company operation with employed staff',
                requiresSpecialPricing: false,
            },
            {
                stationType: price_buildup_entity_1.StationType.DOCO,
                stationTypeName: 'Dealer Owned Company Operated',
                description: 'Stations owned by dealers but operated by the company',
                isActive: true,
                baseDealerMargin: 0.20, // 20 pesewas
                regulatoryCompliance: 'Shared compliance between dealer and company',
                operatingModel: 'Company operation with dealer ownership',
                requiresSpecialPricing: false,
            },
            {
                stationType: price_buildup_entity_1.StationType.DODO,
                stationTypeName: 'Dealer Owned Dealer Operated',
                description: 'Stations owned and operated by independent dealers',
                isActive: true,
                baseDealerMargin: 0.25, // 25 pesewas
                regulatoryCompliance: 'Dealer primary responsibility with company oversight',
                operatingModel: 'Independent dealer operation',
                requiresSpecialPricing: true,
            },
            {
                stationType: price_buildup_entity_1.StationType.INDUSTRIAL,
                stationTypeName: 'Industrial Customer',
                description: 'Large industrial customers with bulk fuel requirements',
                isActive: true,
                baseDealerMargin: 0.05, // 5 pesewas
                regulatoryCompliance: 'Industrial customer compliance requirements',
                operatingModel: 'Direct industrial supply',
                requiresSpecialPricing: true,
            },
            {
                stationType: price_buildup_entity_1.StationType.COMMERCIAL,
                stationTypeName: 'Commercial Customer',
                description: 'Commercial customers including transport companies',
                isActive: true,
                baseDealerMargin: 0.10, // 10 pesewas
                regulatoryCompliance: 'Commercial customer compliance requirements',
                operatingModel: 'Commercial bulk supply',
                requiresSpecialPricing: true,
            },
            {
                stationType: price_buildup_entity_1.StationType.BULK_CONSUMER,
                stationTypeName: 'Bulk Consumer',
                description: 'Large volume consumers requiring special pricing',
                isActive: true,
                baseDealerMargin: 0.03, // 3 pesewas
                regulatoryCompliance: 'Bulk consumer regulatory framework',
                operatingModel: 'Direct bulk supply arrangement',
                requiresSpecialPricing: true,
            },
        ];
    }
    getDefaultApplicableComponents(stationType) {
        const baseComponents = [
            price_buildup_entity_1.PriceComponentType.EX_REFINERY_PRICE,
            price_buildup_entity_1.PriceComponentType.ENERGY_DEBT_RECOVERY_LEVY,
            price_buildup_entity_1.PriceComponentType.ROAD_FUND_LEVY,
            price_buildup_entity_1.PriceComponentType.PRICE_STABILIZATION_LEVY,
            price_buildup_entity_1.PriceComponentType.SPECIAL_PETROLEUM_TAX,
            price_buildup_entity_1.PriceComponentType.FUEL_MARKING_LEVY,
            price_buildup_entity_1.PriceComponentType.PRIMARY_DISTRIBUTION_MARGIN,
            price_buildup_entity_1.PriceComponentType.BOST_MARGIN,
            price_buildup_entity_1.PriceComponentType.UPPF_MARGIN,
            price_buildup_entity_1.PriceComponentType.FUEL_MARKING_MARGIN,
            price_buildup_entity_1.PriceComponentType.OMC_MARGIN,
        ];
        switch (stationType) {
            case price_buildup_entity_1.StationType.COCO:
            case price_buildup_entity_1.StationType.DOCO:
            case price_buildup_entity_1.StationType.DODO:
                return [...baseComponents, price_buildup_entity_1.PriceComponentType.DEALER_MARGIN, price_buildup_entity_1.PriceComponentType.TRANSPORT_COST];
            case price_buildup_entity_1.StationType.INDUSTRIAL:
            case price_buildup_entity_1.StationType.BULK_CONSUMER:
                return baseComponents.filter(c => c !== price_buildup_entity_1.PriceComponentType.DEALER_MARGIN);
            case price_buildup_entity_1.StationType.COMMERCIAL:
                return [...baseComponents, price_buildup_entity_1.PriceComponentType.TRANSPORT_COST];
            default:
                return baseComponents;
        }
    }
    getDefaultDealerMargin(stationType) {
        switch (stationType) {
            case price_buildup_entity_1.StationType.COCO: return 0.15;
            case price_buildup_entity_1.StationType.DOCO: return 0.20;
            case price_buildup_entity_1.StationType.DODO: return 0.25;
            case price_buildup_entity_1.StationType.INDUSTRIAL: return 0.05;
            case price_buildup_entity_1.StationType.COMMERCIAL: return 0.10;
            case price_buildup_entity_1.StationType.BULK_CONSUMER: return 0.03;
            default: return 0.15;
        }
    }
    getDefaultRegulatoryCompliance(stationType) {
        switch (stationType) {
            case price_buildup_entity_1.StationType.COCO:
                return 'Full company compliance responsibility including NPA licensing, EPA permits, fire safety, and operational standards';
            case price_buildup_entity_1.StationType.DOCO:
                return 'Shared compliance between dealer (licensing, permits) and company (operational standards, safety protocols)';
            case price_buildup_entity_1.StationType.DODO:
                return 'Dealer primary responsibility with company oversight for brand standards and fuel quality compliance';
            case price_buildup_entity_1.StationType.INDUSTRIAL:
                return 'Industrial customer compliance including bulk storage regulations, environmental permits, and safety standards';
            case price_buildup_entity_1.StationType.COMMERCIAL:
                return 'Commercial customer compliance including transport regulations and bulk handling requirements';
            case price_buildup_entity_1.StationType.BULK_CONSUMER:
                return 'Bulk consumer regulatory framework including volume thresholds and special permit requirements';
            default:
                return 'Standard regulatory compliance requirements';
        }
    }
    getDefaultOperatingModel(stationType) {
        switch (stationType) {
            case price_buildup_entity_1.StationType.COCO:
                return 'Direct company operation with employed staff, full operational control, company-owned assets';
            case price_buildup_entity_1.StationType.DOCO:
                return 'Company operation with dealer ownership, shared operational responsibility, dealer asset ownership';
            case price_buildup_entity_1.StationType.DODO:
                return 'Independent dealer operation, dealer operational control, company brand and fuel quality oversight';
            case price_buildup_entity_1.StationType.INDUSTRIAL:
                return 'Direct industrial supply with bulk delivery, storage management, and industrial-grade service levels';
            case price_buildup_entity_1.StationType.COMMERCIAL:
                return 'Commercial bulk supply with flexible delivery schedules and volume-based pricing structures';
            case price_buildup_entity_1.StationType.BULK_CONSUMER:
                return 'Direct bulk supply arrangement with special pricing, large volume commitments, and dedicated service';
            default:
                return 'Standard operating model';
        }
    }
};
exports.StationTypeConfigurationService = StationTypeConfigurationService;
exports.StationTypeConfigurationService = StationTypeConfigurationService = StationTypeConfigurationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuration_entity_1.Configuration)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object, typeorm_2.EntityManager])
], StationTypeConfigurationService);
//# sourceMappingURL=station-type-config.service.js.map