import { Repository, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Configuration } from '../entities/configuration.entity';
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
export declare class StationTypeConfigurationService {
    private configRepository;
    private eventEmitter;
    private entityManager;
    private readonly logger;
    constructor(configRepository: Repository<Configuration>, eventEmitter: EventEmitter2, entityManager: EntityManager);
    createStationTypeConfiguration(stationTypeDto: StationTypeConfigurationDto, createdBy: string): Promise<StationTypeConfiguration>;
    updateStationTypeConfiguration(stationType: StationType, updateDto: Partial<StationTypeConfigurationDto>, updatedBy: string): Promise<StationTypeConfiguration>;
    getStationTypeConfiguration(stationType: StationType): Promise<StationTypeConfiguration | null>;
    getAllStationTypeConfigurations(): Promise<StationTypeConfiguration[]>;
    getStationTypesByProduct(productType: ProductType): Promise<StationType[]>;
    getApplicableComponentsForStationType(stationType: StationType): Promise<PriceComponentType[]>;
    validateStationTypeForProduct(stationType: StationType, productType: ProductType): Promise<boolean>;
    initializeDefaultStationTypeConfigurations(createdBy: string): Promise<void>;
    private createBaseStationTypeConfig;
    private createStationTypeSpecificConfigs;
    private createDefaultPriceComponentConfigs;
    private updateConfigurationValue;
    private buildStationTypeConfiguration;
    private getDefaultStationTypeConfigurations;
    private getDefaultApplicableComponents;
    private getDefaultDealerMargin;
    private getDefaultRegulatoryCompliance;
    private getDefaultOperatingModel;
}
export {};
//# sourceMappingURL=station-type-config.service.d.ts.map