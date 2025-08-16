export declare enum ConfigurationType {
    SYSTEM = "SYSTEM",
    TENANT = "TENANT",
    MODULE = "MODULE",
    USER = "USER",
    ENVIRONMENT = "ENVIRONMENT",
    FEATURE_FLAG = "FEATURE_FLAG",
    BUSINESS_RULE = "BUSINESS_RULE",
    INTEGRATION = "INTEGRATION"
}
export declare enum ConfigurationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    ARCHIVED = "ARCHIVED"
}
export declare enum ConfigurationDataType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    JSON = "JSON",
    ARRAY = "ARRAY",
    DATE = "DATE",
    ENCRYPTED = "ENCRYPTED"
}
export declare enum ConfigurationModule {
    ACCOUNTING = "ACCOUNTING",
    FIXED_ASSETS = "FIXED_ASSETS",
    TAX_MANAGEMENT = "TAX_MANAGEMENT",
    BUDGET_PLANNING = "BUDGET_PLANNING",
    COST_MANAGEMENT = "COST_MANAGEMENT",
    PROJECT_ACCOUNTING = "PROJECT_ACCOUNTING",
    FINANCIAL_REPORTING = "FINANCIAL_REPORTING",
    HUMAN_RESOURCES = "HUMAN_RESOURCES",
    PAYROLL = "PAYROLL",
    EMPLOYEE_MANAGEMENT = "EMPLOYEE_MANAGEMENT",
    PERFORMANCE_MANAGEMENT = "PERFORMANCE_MANAGEMENT",
    TRAINING_DEVELOPMENT = "TRAINING_DEVELOPMENT",
    SUPPLY_CHAIN = "SUPPLY_CHAIN",
    INVENTORY_MANAGEMENT = "INVENTORY_MANAGEMENT",
    PROCUREMENT = "PROCUREMENT",
    VENDOR_MANAGEMENT = "VENDOR_MANAGEMENT",
    FLEET_MANAGEMENT = "FLEET_MANAGEMENT",
    RISK_MANAGEMENT = "RISK_MANAGEMENT",
    AUDIT_CONTROLS = "AUDIT_CONTROLS",
    COMPLIANCE_MANAGEMENT = "COMPLIANCE_MANAGEMENT",
    CONTRACT_MANAGEMENT = "CONTRACT_MANAGEMENT",
    IFRS_COMPLIANCE = "IFRS_COMPLIANCE",
    CRM = "CRM",
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE",
    SALES_MANAGEMENT = "SALES_MANAGEMENT",
    LOYALTY_PROGRAM = "LOYALTY_PROGRAM",
    MARKETING_AUTOMATION = "MARKETING_AUTOMATION",
    IOT_MONITORING = "IOT_MONITORING",
    TANK_MANAGEMENT = "TANK_MANAGEMENT",
    ENVIRONMENTAL_MONITORING = "ENVIRONMENTAL_MONITORING",
    SAFETY_MANAGEMENT = "SAFETY_MANAGEMENT",
    ANALYTICS = "ANALYTICS",
    BUSINESS_INTELLIGENCE = "BUSINESS_INTELLIGENCE",
    REPORTING = "REPORTING",
    DASHBOARD = "DASHBOARD",
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING",
    MOBILE_MONEY = "MOBILE_MONEY",
    BANKING_INTEGRATION = "BANKING_INTEGRATION",
    REGULATORY_INTEGRATION = "REGULATORY_INTEGRATION",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    NOTIFICATION = "NOTIFICATION",
    DOCUMENT_MANAGEMENT = "DOCUMENT_MANAGEMENT",
    WORKFLOW = "WORKFLOW",
    API_MANAGEMENT = "API_MANAGEMENT",
    SECURITY = "SECURITY",
    AUDIT_LOGGING = "AUDIT_LOGGING",
    NPA_COMPLIANCE = "NPA_COMPLIANCE",
    EPA_COMPLIANCE = "EPA_COMPLIANCE",
    GRA_INTEGRATION = "GRA_INTEGRATION",
    BOG_REPORTING = "BOG_REPORTING",
    UPPF_MANAGEMENT = "UPPF_MANAGEMENT",
    LOCAL_CONTENT = "LOCAL_CONTENT",
    UPPF_CLAIMS = "UPPF_CLAIMS",
    PRICING_BUILDUP = "PRICING_BUILDUP",
    DEALER_MANAGEMENT = "DEALER_MANAGEMENT",
    AUTOMATED_POSTING = "AUTOMATED_POSTING",
    STATION_CONFIGURATION = "STATION_CONFIGURATION",
    PRICE_COMPONENTS = "PRICE_COMPONENTS"
}
export declare class Configuration {
    id: string;
    tenantId: string;
    key: string;
    name: string;
    description: string;
    module: ConfigurationModule;
    subModule: string;
    type: ConfigurationType;
    dataType: ConfigurationDataType;
    status: ConfigurationStatus;
    value: string;
    defaultValue: string;
    encryptedValue: string;
    jsonValue: any;
    validationRules: any;
    allowedValues: string[];
    minValue: number;
    maxValue: number;
    regexPattern: string;
    isRequired: boolean;
    isSensitive: boolean;
    isEncrypted: boolean;
    parentId: string;
    inheritanceLevel: number;
    overrideAllowed: boolean;
    inheritsFromParent: boolean;
    environment: string;
    deploymentStage: string;
    featureFlag: boolean;
    featureFlagPercentage: number;
    businessRuleExpression: string;
    conditionalLogic: any;
    dependencies: string[];
    affects: string[];
    uiComponent: string;
    uiGroup: string;
    uiOrder: number;
    uiLabel: string;
    uiHelpText: string;
    uiPlaceholder: string;
    isVisibleInUI: boolean;
    isEditableInUI: boolean;
    version: number;
    previousValue: string;
    changeReason: string;
    approvedBy: string;
    approvalDate: Date;
    effectiveDate: Date;
    expiryDate: Date;
    changeFrequency: number;
    lastChangedDate: Date;
    lastAccessedDate: Date;
    accessCount: number;
    cacheEnabled: boolean;
    cacheTtlSeconds: number;
    refreshFrequency: string;
    requiresRestart: boolean;
    readPermissions: string[];
    writePermissions: string[];
    adminOnly: boolean;
    encryptionKeyId: string;
    externalSource: string;
    externalKey: string;
    syncEnabled: boolean;
    syncDirection: string;
    lastSyncDate: Date;
    locale: string;
    localizedValues: any;
    timezone: string;
    currency: string;
    tags: string[];
    category: string;
    priority: number;
    impactLevel: string;
    documentationUrl: string;
    notes: string;
    isActive: boolean;
    isSystemConfig: boolean;
    isRuntimeConfigurable: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
    getEffectiveValue(): any;
    private parseValue;
    isEffective(date?: Date): boolean;
}
//# sourceMappingURL=configuration.entity.d.ts.map