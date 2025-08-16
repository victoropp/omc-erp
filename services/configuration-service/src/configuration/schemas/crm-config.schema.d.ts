import { ConfigurationModule, ConfigurationType, ConfigurationDataType } from '../entities/configuration.entity';
export declare const CRMConfigurationSchema: ({
    key: string;
    name: string;
    description: string;
    module: ConfigurationModule;
    type: ConfigurationType;
    dataType: ConfigurationDataType;
    defaultValue: string;
    uiComponent: string;
    uiGroup: string;
    uiOrder: number;
    allowedValues?: undefined;
    minValue?: undefined;
    maxValue?: undefined;
} | {
    key: string;
    name: string;
    description: string;
    module: ConfigurationModule;
    type: ConfigurationType;
    dataType: ConfigurationDataType;
    defaultValue: string;
    uiComponent: string;
    uiGroup: string;
    uiOrder: number;
    allowedValues: string[];
    minValue?: undefined;
    maxValue?: undefined;
} | {
    key: string;
    name: string;
    description: string;
    module: ConfigurationModule;
    type: ConfigurationType;
    dataType: ConfigurationDataType;
    defaultValue: string;
    minValue: number;
    maxValue: number;
    uiComponent: string;
    uiGroup: string;
    uiOrder: number;
    allowedValues?: undefined;
} | {
    key: string;
    name: string;
    description: string;
    module: ConfigurationModule;
    type: ConfigurationType;
    dataType: ConfigurationDataType;
    defaultValue: string;
    minValue: number;
    uiComponent: string;
    uiGroup: string;
    uiOrder: number;
    allowedValues?: undefined;
    maxValue?: undefined;
})[];
//# sourceMappingURL=crm-config.schema.d.ts.map