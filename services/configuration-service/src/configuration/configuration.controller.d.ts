import { ConfigurationService } from './configuration.service';
import { Configuration, ConfigurationModule, ConfigurationType, ConfigurationStatus } from './entities/configuration.entity';
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
export declare class ConfigurationController {
    private readonly configService;
    constructor(configService: ConfigurationService);
    getConfiguration(key: string, tenantId?: string, module?: ConfigurationModule, useCache?: boolean): Promise<{
        value: any;
        metadata?: any;
    }>;
    getMultipleConfigurations(request: {
        keys: string[];
        tenantId?: string;
        module?: ConfigurationModule;
    }): Promise<Record<string, any>>;
    getModuleConfigurations(module: ConfigurationModule, tenantId?: string, environment?: string): Promise<Record<string, any>>;
    getAllConfigurations(tenantId?: string, module?: ConfigurationModule, type?: ConfigurationType, status?: ConfigurationStatus, environment?: string, keys?: string[]): Promise<Configuration[]>;
    createConfiguration(createDto: CreateConfigurationDto, req: any): Promise<Configuration>;
    updateConfiguration(id: string, updateDto: UpdateConfigurationDto, req: any): Promise<Configuration>;
    deleteConfiguration(id: string, req: any): Promise<{
        message: string;
    }>;
    bulkUpdateConfigurations(bulkUpdateDto: BulkUpdateDto, req: any): Promise<Configuration[]>;
    isFeatureEnabled(featureKey: string, tenantId?: string, userId?: string): Promise<{
        enabled: boolean;
    }>;
    enableFeature(featureKey: string, body: {
        tenantId?: string;
        percentage?: number;
    }): Promise<{
        message: string;
    }>;
    disableFeature(featureKey: string, body: {
        tenantId?: string;
    }): Promise<{
        message: string;
    }>;
    getEnvironmentConfigurations(environment: string): Promise<Configuration[]>;
    promoteConfigurations(promoteDto: {
        fromEnvironment: string;
        toEnvironment: string;
        configIds: string[];
    }): Promise<{
        message: string;
    }>;
    getModuleSchema(module: ConfigurationModule): Promise<any[]>;
    initializeModuleDefaults(module: ConfigurationModule, body: {
        tenantId?: string;
        environment?: string;
    }, req: any): Promise<{
        message: string;
        configurationsCreated: number;
    }>;
    validateConfigurations(validateDto: {
        configurations: Array<{
            key: string;
            value: any;
            tenantId?: string;
            module?: ConfigurationModule;
        }>;
    }): Promise<{
        valid: boolean;
        errors: Array<{
            key: string;
            error: string;
        }>;
    }>;
    testConfiguration(key: string, testDto: {
        value: any;
        tenantId?: string;
        module?: ConfigurationModule;
        testData?: any;
    }): Promise<{
        success: boolean;
        result?: any;
        error?: string;
    }>;
    refreshCache(): Promise<{
        message: string;
    }>;
    clearConfigurationCache(key: string, tenantId?: string, module?: ConfigurationModule): Promise<{
        message: string;
    }>;
    getConfigurationHistory(id: string, limit?: number): Promise<any[]>;
    rollbackConfiguration(id: string, rollbackDto: {
        targetVersion: number;
        reason: string;
    }, req: any): Promise<Configuration>;
    getHealthStatus(): Promise<{
        status: string;
        uptime: number;
        configurationsCount: number;
        cacheStatus: any;
    }>;
}
export {};
//# sourceMappingURL=configuration.controller.d.ts.map