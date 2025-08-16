import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Configuration, ConfigurationType, ConfigurationStatus, ConfigurationModule } from './entities/configuration.entity';
interface ConfigurationQuery {
    tenantId?: string;
    module?: ConfigurationModule;
    type?: ConfigurationType;
    status?: ConfigurationStatus;
    environment?: string;
    keys?: string[];
}
interface ConfigurationUpdate {
    value?: string;
    status?: ConfigurationStatus;
    changeReason?: string;
    approvedBy?: string;
    effectiveDate?: Date;
    expiryDate?: Date;
}
export declare class ConfigurationService {
    private configRepository;
    private eventEmitter;
    private readonly logger;
    private readonly cache;
    private readonly encryptionKey;
    constructor(configRepository: Repository<Configuration>, eventEmitter: EventEmitter2);
    getConfiguration(key: string, tenantId?: string, module?: ConfigurationModule, useCache?: boolean): Promise<any>;
    getMultipleConfigurations(keys: string[], tenantId?: string, module?: ConfigurationModule): Promise<Record<string, any>>;
    getModuleConfigurations(module: ConfigurationModule, tenantId?: string, environment?: string): Promise<Record<string, any>>;
    getAllConfigurations(query?: ConfigurationQuery): Promise<Configuration[]>;
    createConfiguration(configData: Partial<Configuration>): Promise<Configuration>;
    updateConfiguration(id: string, updateData: ConfigurationUpdate, updatedBy?: string): Promise<Configuration>;
    deleteConfiguration(id: string, deletedBy?: string): Promise<void>;
    bulkUpdateConfigurations(updates: Array<{
        id: string;
        value: any;
        changeReason?: string;
    }>, updatedBy?: string): Promise<Configuration[]>;
    private validateConfigurationData;
    private validateConfigurationValue;
    isFeatureEnabled(featureKey: string, tenantId?: string, userId?: string): Promise<boolean>;
    enableFeature(featureKey: string, tenantId?: string, percentage?: number): Promise<void>;
    disableFeature(featureKey: string, tenantId?: string): Promise<void>;
    getEnvironmentConfigurations(environment: string): Promise<Configuration[]>;
    promoteConfigurations(fromEnvironment: string, toEnvironment: string, configIds: string[]): Promise<void>;
    refreshCache(): Promise<void>;
    private clearConfigurationCache;
    private buildCacheKey;
    private getConfigurationHierarchy;
    private resolveConfigurationValue;
    private groupConfigurationsByKey;
    private incrementAccessCount;
    private refreshDependentConfigurations;
    private encryptValue;
    private decryptValue;
}
export {};
//# sourceMappingURL=configuration.service.d.ts.map