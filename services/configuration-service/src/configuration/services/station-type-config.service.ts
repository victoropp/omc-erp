import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Configuration, ConfigurationModule, ConfigurationType, ConfigurationDataType, ConfigurationStatus } from '../entities/configuration.entity';
import { StationType, ProductType, PriceComponentType } from '../entities/price-buildup.entity';
import { StationTypeConfigurationDto } from '../dto/price-buildup.dto';

interface StationTypeConfiguration {
  stationType: StationType;
  stationTypeName: string;
  description: string;
  isActive: boolean;
  applicableComponents: PriceComponentType[];
  supportedProducts: ProductType[];
  baseDealerMargin: number;
  baseTransportCost: number;
  regulatoryCompliance: string;
  operatingModel: string;
  requiresSpecialPricing: boolean;
  configurations: {
    [key: string]: any;
  };
}

@Injectable()
export class StationTypeConfigurationService {
  private readonly logger = new Logger(StationTypeConfigurationService.name);

  constructor(
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    private eventEmitter: EventEmitter2,
    private entityManager: EntityManager,
  ) {}

  // ===== STATION TYPE CONFIGURATION MANAGEMENT =====

  async createStationTypeConfiguration(
    stationTypeDto: StationTypeConfigurationDto,
    createdBy: string
  ): Promise<StationTypeConfiguration> {
    return this.entityManager.transaction(async (manager) => {
      try {
        // Check if station type configuration already exists
        const existing = await this.getStationTypeConfiguration(stationTypeDto.stationType);
        if (existing) {
          throw new BadRequestException(`Station type configuration for ${stationTypeDto.stationType} already exists`);
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
      } catch (error) {
        this.logger.error(`Failed to create station type configuration: ${error.message}`);
        throw error;
      }
    });
  }

  async updateStationTypeConfiguration(
    stationType: StationType,
    updateDto: Partial<StationTypeConfigurationDto>,
    updatedBy: string
  ): Promise<StationTypeConfiguration> {
    return this.entityManager.transaction(async (manager) => {
      const existing = await this.getStationTypeConfiguration(stationType);
      if (!existing) {
        throw new NotFoundException(`Station type configuration for ${stationType} not found`);
      }

      // Update configurations
      for (const [key, value] of Object.entries(updateDto)) {
        if (key === 'stationType') continue; // Skip station type change

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

  async getStationTypeConfiguration(stationType: StationType): Promise<StationTypeConfiguration | null> {
    try {
      const configs = await this.configRepository.find({
        where: {
          module: ConfigurationModule.STATION_CONFIGURATION,
          key: `station_type.${stationType.toLowerCase()}%`,
          status: ConfigurationStatus.ACTIVE,
          isActive: true,
        },
      });

      if (configs.length === 0) {
        return null;
      }

      return this.buildStationTypeConfiguration(stationType, configs);
    } catch (error) {
      this.logger.error(`Failed to get station type configuration for ${stationType}: ${error.message}`);
      return null;
    }
  }

  async getAllStationTypeConfigurations(): Promise<StationTypeConfiguration[]> {
    const stationTypes = Object.values(StationType);
    const configurations: StationTypeConfiguration[] = [];

    for (const stationType of stationTypes) {
      const config = await this.getStationTypeConfiguration(stationType);
      if (config) {
        configurations.push(config);
      }
    }

    return configurations;
  }

  async getStationTypesByProduct(productType: ProductType): Promise<StationType[]> {
    const allConfigs = await this.getAllStationTypeConfigurations();
    
    return allConfigs
      .filter(config => config.supportedProducts.includes(productType))
      .map(config => config.stationType);
  }

  async getApplicableComponentsForStationType(stationType: StationType): Promise<PriceComponentType[]> {
    const config = await this.getStationTypeConfiguration(stationType);
    return config?.applicableComponents || [];
  }

  async validateStationTypeForProduct(
    stationType: StationType,
    productType: ProductType
  ): Promise<boolean> {
    const config = await this.getStationTypeConfiguration(stationType);
    if (!config) {
      return false;
    }

    return config.isActive && config.supportedProducts.includes(productType);
  }

  // ===== INITIALIZATION AND DEFAULTS =====

  async initializeDefaultStationTypeConfigurations(createdBy: string): Promise<void> {
    const defaultConfigurations = this.getDefaultStationTypeConfigurations();

    for (const stationTypeDto of defaultConfigurations) {
      try {
        const existing = await this.getStationTypeConfiguration(stationTypeDto.stationType);
        if (!existing) {
          await this.createStationTypeConfiguration(stationTypeDto, createdBy);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize ${stationTypeDto.stationType} configuration: ${error.message}`);
      }
    }

    this.logger.log('Initialized default station type configurations');
  }

  // ===== PRIVATE HELPER METHODS =====

  private async createBaseStationTypeConfig(
    manager: EntityManager,
    stationTypeDto: StationTypeConfigurationDto,
    createdBy: string
  ): Promise<Configuration> {
    const baseConfigKey = `station_type.${stationTypeDto.stationType.toLowerCase()}.base`;
    
    const baseConfig = manager.create(Configuration, {
      key: baseConfigKey,
      name: `${stationTypeDto.stationTypeName} Base Configuration`,
      description: stationTypeDto.description,
      module: ConfigurationModule.STATION_CONFIGURATION,
      type: ConfigurationType.SYSTEM,
      dataType: ConfigurationDataType.JSON,
      status: ConfigurationStatus.ACTIVE,
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

  private async createStationTypeSpecificConfigs(
    manager: EntityManager,
    stationTypeDto: StationTypeConfigurationDto,
    createdBy: string
  ): Promise<void> {
    const stationTypeKey = stationTypeDto.stationType.toLowerCase();
    
    const specificConfigs = [
      {
        key: `station_type.${stationTypeKey}.applicable_components`,
        name: `${stationTypeDto.stationTypeName} Applicable Components`,
        dataType: ConfigurationDataType.ARRAY,
        value: JSON.stringify(stationTypeDto.applicableComponents || this.getDefaultApplicableComponents(stationTypeDto.stationType)),
        description: 'Price components applicable to this station type',
      },
      {
        key: `station_type.${stationTypeKey}.supported_products`,
        name: `${stationTypeDto.stationTypeName} Supported Products`,
        dataType: ConfigurationDataType.ARRAY,
        value: JSON.stringify(stationTypeDto.supportedProducts || Object.values(ProductType)),
        description: 'Product types supported by this station type',
      },
      {
        key: `station_type.${stationTypeKey}.base_dealer_margin`,
        name: `${stationTypeDto.stationTypeName} Base Dealer Margin`,
        dataType: ConfigurationDataType.NUMBER,
        value: (stationTypeDto.baseDealerMargin || this.getDefaultDealerMargin(stationTypeDto.stationType)).toString(),
        description: 'Base dealer margin for this station type',
      },
      {
        key: `station_type.${stationTypeKey}.base_transport_cost`,
        name: `${stationTypeDto.stationTypeName} Base Transport Cost`,
        dataType: ConfigurationDataType.NUMBER,
        value: (stationTypeDto.baseTransportCost || 0).toString(),
        description: 'Base transport cost for this station type',
      },
      {
        key: `station_type.${stationTypeKey}.regulatory_compliance`,
        name: `${stationTypeDto.stationTypeName} Regulatory Compliance`,
        dataType: ConfigurationDataType.STRING,
        value: stationTypeDto.regulatoryCompliance || this.getDefaultRegulatoryCompliance(stationTypeDto.stationType),
        description: 'Regulatory compliance requirements',
      },
      {
        key: `station_type.${stationTypeKey}.operating_model`,
        name: `${stationTypeDto.stationTypeName} Operating Model`,
        dataType: ConfigurationDataType.STRING,
        value: stationTypeDto.operatingModel || this.getDefaultOperatingModel(stationTypeDto.stationType),
        description: 'Operating model description',
      },
      {
        key: `station_type.${stationTypeKey}.requires_special_pricing`,
        name: `${stationTypeDto.stationTypeName} Requires Special Pricing`,
        dataType: ConfigurationDataType.BOOLEAN,
        value: (stationTypeDto.requiresSpecialPricing || false).toString(),
        description: 'Whether this station type requires special pricing considerations',
      },
    ];

    for (const configData of specificConfigs) {
      const config = manager.create(Configuration, {
        ...configData,
        module: ConfigurationModule.STATION_CONFIGURATION,
        type: ConfigurationType.SYSTEM,
        status: ConfigurationStatus.ACTIVE,
        isRequired: true,
        isSystemConfig: true,
        createdBy,
      });

      await manager.save(config);
    }
  }

  private async createDefaultPriceComponentConfigs(
    manager: EntityManager,
    stationTypeDto: StationTypeConfigurationDto,
    createdBy: string
  ): Promise<void> {
    const stationTypeKey = stationTypeDto.stationType.toLowerCase();
    const applicableComponents = stationTypeDto.applicableComponents || this.getDefaultApplicableComponents(stationTypeDto.stationType);

    for (const componentType of applicableComponents) {
      const componentKey = componentType.toLowerCase();
      const configKey = `station_type.${stationTypeKey}.component.${componentKey}`;

      const componentConfig = manager.create(Configuration, {
        key: `${configKey}.enabled`,
        name: `${stationTypeDto.stationTypeName} ${componentType} Enabled`,
        description: `Whether ${componentType} is enabled for ${stationTypeDto.stationTypeName}`,
        module: ConfigurationModule.PRICE_COMPONENTS,
        type: ConfigurationType.SYSTEM,
        dataType: ConfigurationDataType.BOOLEAN,
        status: ConfigurationStatus.ACTIVE,
        value: 'true',
        isRequired: true,
        isSystemConfig: true,
        createdBy,
      });

      await manager.save(componentConfig);
    }
  }

  private async updateConfigurationValue(
    manager: EntityManager,
    configKey: string,
    value: any,
    updatedBy: string
  ): Promise<void> {
    const config = await manager.findOne(Configuration, {
      where: { key: configKey, module: ConfigurationModule.STATION_CONFIGURATION },
    });

    if (config) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await manager.update(Configuration, config.id, {
        value: stringValue,
        jsonValue: typeof value === 'object' ? value : null,
        updatedBy,
      });
    }
  }

  private buildStationTypeConfiguration(
    stationType: StationType,
    configs: Configuration[]
  ): StationTypeConfiguration {
    const configMap = configs.reduce((map, config) => {
      const keyParts = config.key.split('.');
      const lastPart = keyParts[keyParts.length - 1];
      map[lastPart] = config.getEffectiveValue();
      return map;
    }, {} as Record<string, any>);

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

  private getDefaultStationTypeConfigurations(): StationTypeConfigurationDto[] {
    return [
      {
        stationType: StationType.COCO,
        stationTypeName: 'Company Owned Company Operated',
        description: 'Stations owned and operated by the company',
        isActive: true,
        baseDealerMargin: 0.15, // 15 pesewas
        regulatoryCompliance: 'Full company compliance responsibility',
        operatingModel: 'Direct company operation with employed staff',
        requiresSpecialPricing: false,
      },
      {
        stationType: StationType.DOCO,
        stationTypeName: 'Dealer Owned Company Operated',
        description: 'Stations owned by dealers but operated by the company',
        isActive: true,
        baseDealerMargin: 0.20, // 20 pesewas
        regulatoryCompliance: 'Shared compliance between dealer and company',
        operatingModel: 'Company operation with dealer ownership',
        requiresSpecialPricing: false,
      },
      {
        stationType: StationType.DODO,
        stationTypeName: 'Dealer Owned Dealer Operated',
        description: 'Stations owned and operated by independent dealers',
        isActive: true,
        baseDealerMargin: 0.25, // 25 pesewas
        regulatoryCompliance: 'Dealer primary responsibility with company oversight',
        operatingModel: 'Independent dealer operation',
        requiresSpecialPricing: true,
      },
      {
        stationType: StationType.INDUSTRIAL,
        stationTypeName: 'Industrial Customer',
        description: 'Large industrial customers with bulk fuel requirements',
        isActive: true,
        baseDealerMargin: 0.05, // 5 pesewas
        regulatoryCompliance: 'Industrial customer compliance requirements',
        operatingModel: 'Direct industrial supply',
        requiresSpecialPricing: true,
      },
      {
        stationType: StationType.COMMERCIAL,
        stationTypeName: 'Commercial Customer',
        description: 'Commercial customers including transport companies',
        isActive: true,
        baseDealerMargin: 0.10, // 10 pesewas
        regulatoryCompliance: 'Commercial customer compliance requirements',
        operatingModel: 'Commercial bulk supply',
        requiresSpecialPricing: true,
      },
      {
        stationType: StationType.BULK_CONSUMER,
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

  private getDefaultApplicableComponents(stationType: StationType): PriceComponentType[] {
    const baseComponents = [
      PriceComponentType.EX_REFINERY_PRICE,
      PriceComponentType.ENERGY_DEBT_RECOVERY_LEVY,
      PriceComponentType.ROAD_FUND_LEVY,
      PriceComponentType.PRICE_STABILIZATION_LEVY,
      PriceComponentType.SPECIAL_PETROLEUM_TAX,
      PriceComponentType.FUEL_MARKING_LEVY,
      PriceComponentType.PRIMARY_DISTRIBUTION_MARGIN,
      PriceComponentType.BOST_MARGIN,
      PriceComponentType.UPPF_MARGIN,
      PriceComponentType.FUEL_MARKING_MARGIN,
      PriceComponentType.OMC_MARGIN,
    ];

    switch (stationType) {
      case StationType.COCO:
      case StationType.DOCO:
      case StationType.DODO:
        return [...baseComponents, PriceComponentType.DEALER_MARGIN, PriceComponentType.TRANSPORT_COST];
      
      case StationType.INDUSTRIAL:
      case StationType.BULK_CONSUMER:
        return baseComponents.filter(c => c !== PriceComponentType.DEALER_MARGIN);
      
      case StationType.COMMERCIAL:
        return [...baseComponents, PriceComponentType.TRANSPORT_COST];
      
      default:
        return baseComponents;
    }
  }

  private getDefaultDealerMargin(stationType: StationType): number {
    switch (stationType) {
      case StationType.COCO: return 0.15;
      case StationType.DOCO: return 0.20;
      case StationType.DODO: return 0.25;
      case StationType.INDUSTRIAL: return 0.05;
      case StationType.COMMERCIAL: return 0.10;
      case StationType.BULK_CONSUMER: return 0.03;
      default: return 0.15;
    }
  }

  private getDefaultRegulatoryCompliance(stationType: StationType): string {
    switch (stationType) {
      case StationType.COCO:
        return 'Full company compliance responsibility including NPA licensing, EPA permits, fire safety, and operational standards';
      case StationType.DOCO:
        return 'Shared compliance between dealer (licensing, permits) and company (operational standards, safety protocols)';
      case StationType.DODO:
        return 'Dealer primary responsibility with company oversight for brand standards and fuel quality compliance';
      case StationType.INDUSTRIAL:
        return 'Industrial customer compliance including bulk storage regulations, environmental permits, and safety standards';
      case StationType.COMMERCIAL:
        return 'Commercial customer compliance including transport regulations and bulk handling requirements';
      case StationType.BULK_CONSUMER:
        return 'Bulk consumer regulatory framework including volume thresholds and special permit requirements';
      default:
        return 'Standard regulatory compliance requirements';
    }
  }

  private getDefaultOperatingModel(stationType: StationType): string {
    switch (stationType) {
      case StationType.COCO:
        return 'Direct company operation with employed staff, full operational control, company-owned assets';
      case StationType.DOCO:
        return 'Company operation with dealer ownership, shared operational responsibility, dealer asset ownership';
      case StationType.DODO:
        return 'Independent dealer operation, dealer operational control, company brand and fuel quality oversight';
      case StationType.INDUSTRIAL:
        return 'Direct industrial supply with bulk delivery, storage management, and industrial-grade service levels';
      case StationType.COMMERCIAL:
        return 'Commercial bulk supply with flexible delivery schedules and volume-based pricing structures';
      case StationType.BULK_CONSUMER:
        return 'Direct bulk supply arrangement with special pricing, large volume commitments, and dedicated service';
      default:
        return 'Standard operating model';
    }
  }
}