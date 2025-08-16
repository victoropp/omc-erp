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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.ConfigurationModule = exports.ConfigurationDataType = exports.ConfigurationStatus = exports.ConfigurationType = void 0;
const typeorm_1 = require("typeorm");
var ConfigurationType;
(function (ConfigurationType) {
    ConfigurationType["SYSTEM"] = "SYSTEM";
    ConfigurationType["TENANT"] = "TENANT";
    ConfigurationType["MODULE"] = "MODULE";
    ConfigurationType["USER"] = "USER";
    ConfigurationType["ENVIRONMENT"] = "ENVIRONMENT";
    ConfigurationType["FEATURE_FLAG"] = "FEATURE_FLAG";
    ConfigurationType["BUSINESS_RULE"] = "BUSINESS_RULE";
    ConfigurationType["INTEGRATION"] = "INTEGRATION";
})(ConfigurationType || (exports.ConfigurationType = ConfigurationType = {}));
var ConfigurationStatus;
(function (ConfigurationStatus) {
    ConfigurationStatus["ACTIVE"] = "ACTIVE";
    ConfigurationStatus["INACTIVE"] = "INACTIVE";
    ConfigurationStatus["DRAFT"] = "DRAFT";
    ConfigurationStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ConfigurationStatus["ARCHIVED"] = "ARCHIVED";
})(ConfigurationStatus || (exports.ConfigurationStatus = ConfigurationStatus = {}));
var ConfigurationDataType;
(function (ConfigurationDataType) {
    ConfigurationDataType["STRING"] = "STRING";
    ConfigurationDataType["NUMBER"] = "NUMBER";
    ConfigurationDataType["BOOLEAN"] = "BOOLEAN";
    ConfigurationDataType["JSON"] = "JSON";
    ConfigurationDataType["ARRAY"] = "ARRAY";
    ConfigurationDataType["DATE"] = "DATE";
    ConfigurationDataType["ENCRYPTED"] = "ENCRYPTED";
})(ConfigurationDataType || (exports.ConfigurationDataType = ConfigurationDataType = {}));
var ConfigurationModule;
(function (ConfigurationModule) {
    // Core Financial Modules
    ConfigurationModule["ACCOUNTING"] = "ACCOUNTING";
    ConfigurationModule["FIXED_ASSETS"] = "FIXED_ASSETS";
    ConfigurationModule["TAX_MANAGEMENT"] = "TAX_MANAGEMENT";
    ConfigurationModule["BUDGET_PLANNING"] = "BUDGET_PLANNING";
    ConfigurationModule["COST_MANAGEMENT"] = "COST_MANAGEMENT";
    ConfigurationModule["PROJECT_ACCOUNTING"] = "PROJECT_ACCOUNTING";
    ConfigurationModule["FINANCIAL_REPORTING"] = "FINANCIAL_REPORTING";
    // HR Modules
    ConfigurationModule["HUMAN_RESOURCES"] = "HUMAN_RESOURCES";
    ConfigurationModule["PAYROLL"] = "PAYROLL";
    ConfigurationModule["EMPLOYEE_MANAGEMENT"] = "EMPLOYEE_MANAGEMENT";
    ConfigurationModule["PERFORMANCE_MANAGEMENT"] = "PERFORMANCE_MANAGEMENT";
    ConfigurationModule["TRAINING_DEVELOPMENT"] = "TRAINING_DEVELOPMENT";
    // Supply Chain & Operations
    ConfigurationModule["SUPPLY_CHAIN"] = "SUPPLY_CHAIN";
    ConfigurationModule["INVENTORY_MANAGEMENT"] = "INVENTORY_MANAGEMENT";
    ConfigurationModule["PROCUREMENT"] = "PROCUREMENT";
    ConfigurationModule["VENDOR_MANAGEMENT"] = "VENDOR_MANAGEMENT";
    ConfigurationModule["FLEET_MANAGEMENT"] = "FLEET_MANAGEMENT";
    // Risk & Compliance
    ConfigurationModule["RISK_MANAGEMENT"] = "RISK_MANAGEMENT";
    ConfigurationModule["AUDIT_CONTROLS"] = "AUDIT_CONTROLS";
    ConfigurationModule["COMPLIANCE_MANAGEMENT"] = "COMPLIANCE_MANAGEMENT";
    ConfigurationModule["CONTRACT_MANAGEMENT"] = "CONTRACT_MANAGEMENT";
    ConfigurationModule["IFRS_COMPLIANCE"] = "IFRS_COMPLIANCE";
    // Customer & Sales
    ConfigurationModule["CRM"] = "CRM";
    ConfigurationModule["CUSTOMER_SERVICE"] = "CUSTOMER_SERVICE";
    ConfigurationModule["SALES_MANAGEMENT"] = "SALES_MANAGEMENT";
    ConfigurationModule["LOYALTY_PROGRAM"] = "LOYALTY_PROGRAM";
    ConfigurationModule["MARKETING_AUTOMATION"] = "MARKETING_AUTOMATION";
    // Technology & Infrastructure
    ConfigurationModule["IOT_MONITORING"] = "IOT_MONITORING";
    ConfigurationModule["TANK_MANAGEMENT"] = "TANK_MANAGEMENT";
    ConfigurationModule["ENVIRONMENTAL_MONITORING"] = "ENVIRONMENTAL_MONITORING";
    ConfigurationModule["SAFETY_MANAGEMENT"] = "SAFETY_MANAGEMENT";
    // Business Intelligence
    ConfigurationModule["ANALYTICS"] = "ANALYTICS";
    ConfigurationModule["BUSINESS_INTELLIGENCE"] = "BUSINESS_INTELLIGENCE";
    ConfigurationModule["REPORTING"] = "REPORTING";
    ConfigurationModule["DASHBOARD"] = "DASHBOARD";
    // Integration & External
    ConfigurationModule["PAYMENT_PROCESSING"] = "PAYMENT_PROCESSING";
    ConfigurationModule["MOBILE_MONEY"] = "MOBILE_MONEY";
    ConfigurationModule["BANKING_INTEGRATION"] = "BANKING_INTEGRATION";
    ConfigurationModule["REGULATORY_INTEGRATION"] = "REGULATORY_INTEGRATION";
    // System & Infrastructure
    ConfigurationModule["AUTHENTICATION"] = "AUTHENTICATION";
    ConfigurationModule["AUTHORIZATION"] = "AUTHORIZATION";
    ConfigurationModule["NOTIFICATION"] = "NOTIFICATION";
    ConfigurationModule["DOCUMENT_MANAGEMENT"] = "DOCUMENT_MANAGEMENT";
    ConfigurationModule["WORKFLOW"] = "WORKFLOW";
    ConfigurationModule["API_MANAGEMENT"] = "API_MANAGEMENT";
    ConfigurationModule["SECURITY"] = "SECURITY";
    ConfigurationModule["AUDIT_LOGGING"] = "AUDIT_LOGGING";
    // Ghana Specific
    ConfigurationModule["NPA_COMPLIANCE"] = "NPA_COMPLIANCE";
    ConfigurationModule["EPA_COMPLIANCE"] = "EPA_COMPLIANCE";
    ConfigurationModule["GRA_INTEGRATION"] = "GRA_INTEGRATION";
    ConfigurationModule["BOG_REPORTING"] = "BOG_REPORTING";
    ConfigurationModule["UPPF_MANAGEMENT"] = "UPPF_MANAGEMENT";
    ConfigurationModule["LOCAL_CONTENT"] = "LOCAL_CONTENT";
    // UPPF & Pricing Extensions
    ConfigurationModule["UPPF_CLAIMS"] = "UPPF_CLAIMS";
    ConfigurationModule["PRICING_BUILDUP"] = "PRICING_BUILDUP";
    ConfigurationModule["DEALER_MANAGEMENT"] = "DEALER_MANAGEMENT";
    ConfigurationModule["AUTOMATED_POSTING"] = "AUTOMATED_POSTING";
    ConfigurationModule["STATION_CONFIGURATION"] = "STATION_CONFIGURATION";
    ConfigurationModule["PRICE_COMPONENTS"] = "PRICE_COMPONENTS";
})(ConfigurationModule || (exports.ConfigurationModule = ConfigurationModule = {}));
let Configuration = class Configuration {
    id;
    tenantId; // null for system-wide configs
    key;
    name;
    description;
    module;
    subModule;
    type;
    dataType;
    status;
    // Configuration Value
    value;
    defaultValue;
    encryptedValue;
    jsonValue;
    // Validation and Constraints
    validationRules;
    allowedValues;
    minValue;
    maxValue;
    regexPattern;
    isRequired;
    isSensitive;
    isEncrypted;
    // Hierarchical Configuration
    parentId;
    inheritanceLevel; // 0=system, 1=tenant, 2=module, 3=user
    overrideAllowed;
    inheritsFromParent;
    // Environment and Deployment
    environment; // PRODUCTION, STAGING, DEVELOPMENT, ALL
    deploymentStage;
    featureFlag;
    featureFlagPercentage; // For gradual rollouts
    // Business Rules and Logic
    businessRuleExpression;
    conditionalLogic;
    dependencies; // Other config keys this depends on
    affects; // Other config keys affected by this
    // UI and Display
    uiComponent; // INPUT, SELECT, CHECKBOX, etc.
    uiGroup;
    uiOrder;
    uiLabel;
    uiHelpText;
    uiPlaceholder;
    isVisibleInUI;
    isEditableInUI;
    // Versioning and Change Management
    version;
    previousValue;
    changeReason;
    approvedBy;
    approvalDate;
    effectiveDate;
    expiryDate;
    // Change Tracking
    changeFrequency;
    lastChangedDate;
    lastAccessedDate;
    accessCount;
    // Performance and Caching
    cacheEnabled;
    cacheTtlSeconds;
    refreshFrequency; // REAL_TIME, HOURLY, DAILY, WEEKLY
    requiresRestart;
    // Security and Permissions
    readPermissions;
    writePermissions;
    adminOnly;
    encryptionKeyId;
    // Integration and External Systems
    externalSource;
    externalKey;
    syncEnabled;
    syncDirection; // INBOUND, OUTBOUND, BIDIRECTIONAL
    lastSyncDate;
    // Localization
    locale;
    localizedValues;
    timezone;
    currency;
    // Additional Metadata
    tags;
    category;
    priority; // 1=highest, 10=lowest
    impactLevel; // LOW, MEDIUM, HIGH, CRITICAL
    documentationUrl;
    notes;
    isActive;
    isSystemConfig;
    isRuntimeConfigurable;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated and helper methods
    calculateFields() {
        // Set inheritance level based on type
        if (this.type === ConfigurationType.SYSTEM) {
            this.inheritanceLevel = 0;
        }
        else if (this.type === ConfigurationType.TENANT) {
            this.inheritanceLevel = 1;
        }
        else if (this.type === ConfigurationType.MODULE) {
            this.inheritanceLevel = 2;
        }
        else if (this.type === ConfigurationType.USER) {
            this.inheritanceLevel = 3;
        }
        // Set system config flag
        this.isSystemConfig = this.type === ConfigurationType.SYSTEM;
        // Update change tracking
        if (this.value !== this.previousValue) {
            this.changeFrequency += 1;
            this.lastChangedDate = new Date();
            this.version += 1;
        }
        // Set effective date if not set
        if (!this.effectiveDate) {
            this.effectiveDate = new Date();
        }
        // Auto-encrypt sensitive values
        if (this.isSensitive && !this.isEncrypted && this.value) {
            // In real implementation, this would use proper encryption
            this.isEncrypted = true;
        }
    }
    // Helper method to get the effective value considering inheritance
    getEffectiveValue() {
        if (this.value !== null && this.value !== undefined) {
            return this.parseValue(this.value);
        }
        if (this.inheritsFromParent && this.defaultValue !== null) {
            return this.parseValue(this.defaultValue);
        }
        return this.parseValue(this.defaultValue);
    }
    // Helper method to parse value based on data type
    parseValue(value) {
        if (!value)
            return null;
        switch (this.dataType) {
            case ConfigurationDataType.BOOLEAN:
                return value.toLowerCase() === 'true';
            case ConfigurationDataType.NUMBER:
                return parseFloat(value);
            case ConfigurationDataType.JSON:
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            case ConfigurationDataType.ARRAY:
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value.split(',');
                }
            case ConfigurationDataType.DATE:
                return new Date(value);
            default:
                return value;
        }
    }
    // Helper method to check if configuration is currently effective
    isEffective(date = new Date()) {
        if (this.status !== ConfigurationStatus.ACTIVE || !this.isActive) {
            return false;
        }
        if (this.effectiveDate && this.effectiveDate > date) {
            return false;
        }
        if (this.expiryDate && this.expiryDate <= date) {
            return false;
        }
        return true;
    }
};
exports.Configuration = Configuration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Configuration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'configuration_key', length: 255 }),
    __metadata("design:type", String)
], Configuration.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'configuration_name', length: 500 }),
    __metadata("design:type", String)
], Configuration.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module', type: 'enum', enum: ConfigurationModule }),
    __metadata("design:type", String)
], Configuration.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'enum', enum: ConfigurationType }),
    __metadata("design:type", String)
], Configuration.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_type', type: 'enum', enum: ConfigurationDataType }),
    __metadata("design:type", String)
], Configuration.prototype, "dataType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: ConfigurationStatus, default: ConfigurationStatus.ACTIVE }),
    __metadata("design:type", String)
], Configuration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_value', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "defaultValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_value', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "encryptedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'json_value', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Configuration.prototype, "jsonValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validation_rules', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Configuration.prototype, "validationRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowed_values', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "allowedValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_value', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Configuration.prototype, "minValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_value', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Configuration.prototype, "maxValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regex_pattern', length: 500, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "regexPattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_sensitive', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isSensitive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_encrypted', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inheritance_level', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Configuration.prototype, "inheritanceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'override_allowed', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "overrideAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inherits_from_parent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "inheritsFromParent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'environment', length: 50, default: 'ALL' }),
    __metadata("design:type", String)
], Configuration.prototype, "environment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deployment_stage', length: 50, default: 'ALL' }),
    __metadata("design:type", String)
], Configuration.prototype, "deploymentStage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feature_flag', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "featureFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feature_flag_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Configuration.prototype, "featureFlagPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_rule_expression', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "businessRuleExpression", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conditional_logic', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Configuration.prototype, "conditionalLogic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dependencies', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "dependencies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affects', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "affects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_component', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "uiComponent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_group', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "uiGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_order', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Configuration.prototype, "uiOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_label', length: 255, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "uiLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_help_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "uiHelpText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ui_placeholder', length: 255, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "uiPlaceholder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_visible_in_ui', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isVisibleInUI", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_editable_in_ui', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isEditableInUI", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Configuration.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_value', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "previousValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'change_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "changeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'change_frequency', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Configuration.prototype, "changeFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_changed_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "lastChangedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_accessed_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "lastAccessedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Configuration.prototype, "accessCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cache_enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "cacheEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cache_ttl_seconds', type: 'int', default: 3600 }),
    __metadata("design:type", Number)
], Configuration.prototype, "cacheTtlSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_frequency', length: 50, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "refreshFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_restart', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "requiresRestart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_permissions', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "readPermissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'write_permissions', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "writePermissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_only', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "adminOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_key_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "encryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_source', length: 255, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "externalSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_key', length: 255, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "externalKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_enabled', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "syncEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_direction', length: 20, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "syncDirection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Configuration.prototype, "lastSyncDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locale', length: 10, default: 'en-GH' }),
    __metadata("design:type", String)
], Configuration.prototype, "locale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'localized_values', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Configuration.prototype, "localizedValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timezone', length: 50, default: 'Africa/Accra' }),
    __metadata("design:type", String)
], Configuration.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], Configuration.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Configuration.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], Configuration.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_level', length: 20, default: 'MEDIUM' }),
    __metadata("design:type", String)
], Configuration.prototype, "impactLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'documentation_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "documentationUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system_config', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isSystemConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_runtime_configurable', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Configuration.prototype, "isRuntimeConfigurable", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Configuration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Configuration.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Configuration.prototype, "calculateFields", null);
exports.Configuration = Configuration = __decorate([
    (0, typeorm_1.Entity)('configurations'),
    (0, typeorm_1.Index)(['tenantId', 'module', 'key'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'type']),
    (0, typeorm_1.Index)(['module', 'key'])
], Configuration);
//# sourceMappingURL=configuration.entity.js.map