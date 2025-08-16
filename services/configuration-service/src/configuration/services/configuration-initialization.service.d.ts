import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Configuration, ConfigurationModule } from '../entities/configuration.entity';
export declare class ConfigurationInitializationService implements OnModuleInit {
    private configRepository;
    private eventEmitter;
    private readonly logger;
    constructor(configRepository: Repository<Configuration>, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    /**
     * Initialize system-wide default configurations
     */
    initializeSystemConfigurations(): Promise<void>;
    /**
     * Initialize default configurations for a specific tenant
     */
    initializeTenantConfigurations(tenantId: string, modules?: ConfigurationModule[], environment?: string): Promise<{
        configurationsCreated: number;
        configurationsUpdated: number;
        errors: string[];
    }>;
    /**
     * Initialize configurations for a specific module
     */
    initializeModuleConfigurations(module: ConfigurationModule, tenantId?: string, environment?: string): Promise<{
        configurationsCreated: number;
        configurationsSkipped: number;
    }>;
    /**
     * Reset configurations to default values
     */
    resetConfigurationsToDefaults(tenantId: string, modules?: ConfigurationModule[], confirmationToken?: string): Promise<{
        configurationsReset: number;
        errors: string[];
    }>;
    /**
     * Export configurations for backup or migration
     */
    exportConfigurations(tenantId?: string, modules?: ConfigurationModule[], environment?: string): Promise<{
        configurations: any[];
        metadata: {
            exportDate: Date;
            tenantId?: string;
            modules?: ConfigurationModule[];
            environment?: string;
            totalCount: number;
        };
    }>;
    /**
     * Import configurations from backup or migration
     */
    importConfigurations(importData: {
        configurations: any[];
        metadata: any;
    }, options?: {
        overwriteExisting?: boolean;
        skipValidation?: boolean;
        tenantId?: string;
    }): Promise<{
        configurationsImported: number;
        configurationsSkipped: number;
        configurationsUpdated: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=configuration-initialization.service.d.ts.map