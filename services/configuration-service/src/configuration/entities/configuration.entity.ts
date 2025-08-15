import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum ConfigurationType {
  SYSTEM = 'SYSTEM',
  TENANT = 'TENANT',
  MODULE = 'MODULE',
  USER = 'USER',
  ENVIRONMENT = 'ENVIRONMENT',
  FEATURE_FLAG = 'FEATURE_FLAG',
  BUSINESS_RULE = 'BUSINESS_RULE',
  INTEGRATION = 'INTEGRATION',
}

export enum ConfigurationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ARCHIVED = 'ARCHIVED',
}

export enum ConfigurationDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
  DATE = 'DATE',
  ENCRYPTED = 'ENCRYPTED',
}

export enum ConfigurationModule {
  // Core Financial Modules
  ACCOUNTING = 'ACCOUNTING',
  FIXED_ASSETS = 'FIXED_ASSETS',
  TAX_MANAGEMENT = 'TAX_MANAGEMENT',
  BUDGET_PLANNING = 'BUDGET_PLANNING',
  COST_MANAGEMENT = 'COST_MANAGEMENT',
  PROJECT_ACCOUNTING = 'PROJECT_ACCOUNTING',
  FINANCIAL_REPORTING = 'FINANCIAL_REPORTING',
  
  // HR Modules
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  PAYROLL = 'PAYROLL',
  EMPLOYEE_MANAGEMENT = 'EMPLOYEE_MANAGEMENT',
  PERFORMANCE_MANAGEMENT = 'PERFORMANCE_MANAGEMENT',
  TRAINING_DEVELOPMENT = 'TRAINING_DEVELOPMENT',
  
  // Supply Chain & Operations
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  PROCUREMENT = 'PROCUREMENT',
  VENDOR_MANAGEMENT = 'VENDOR_MANAGEMENT',
  FLEET_MANAGEMENT = 'FLEET_MANAGEMENT',
  
  // Risk & Compliance
  RISK_MANAGEMENT = 'RISK_MANAGEMENT',
  AUDIT_CONTROLS = 'AUDIT_CONTROLS',
  COMPLIANCE_MANAGEMENT = 'COMPLIANCE_MANAGEMENT',
  CONTRACT_MANAGEMENT = 'CONTRACT_MANAGEMENT',
  IFRS_COMPLIANCE = 'IFRS_COMPLIANCE',
  
  // Customer & Sales
  CRM = 'CRM',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  SALES_MANAGEMENT = 'SALES_MANAGEMENT',
  LOYALTY_PROGRAM = 'LOYALTY_PROGRAM',
  MARKETING_AUTOMATION = 'MARKETING_AUTOMATION',
  
  // Technology & Infrastructure
  IOT_MONITORING = 'IOT_MONITORING',
  TANK_MANAGEMENT = 'TANK_MANAGEMENT',
  ENVIRONMENTAL_MONITORING = 'ENVIRONMENTAL_MONITORING',
  SAFETY_MANAGEMENT = 'SAFETY_MANAGEMENT',
  
  // Business Intelligence
  ANALYTICS = 'ANALYTICS',
  BUSINESS_INTELLIGENCE = 'BUSINESS_INTELLIGENCE',
  REPORTING = 'REPORTING',
  DASHBOARD = 'DASHBOARD',
  
  // Integration & External
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANKING_INTEGRATION = 'BANKING_INTEGRATION',
  REGULATORY_INTEGRATION = 'REGULATORY_INTEGRATION',
  
  // System & Infrastructure
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOTIFICATION = 'NOTIFICATION',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  WORKFLOW = 'WORKFLOW',
  API_MANAGEMENT = 'API_MANAGEMENT',
  SECURITY = 'SECURITY',
  AUDIT_LOGGING = 'AUDIT_LOGGING',
  
  // Ghana Specific
  NPA_COMPLIANCE = 'NPA_COMPLIANCE',
  EPA_COMPLIANCE = 'EPA_COMPLIANCE',
  GRA_INTEGRATION = 'GRA_INTEGRATION',
  BOG_REPORTING = 'BOG_REPORTING',
  UPPF_MANAGEMENT = 'UPPF_MANAGEMENT',
  LOCAL_CONTENT = 'LOCAL_CONTENT',
  
  // UPPF & Pricing Extensions
  UPPF_CLAIMS = 'UPPF_CLAIMS',
  PRICING_BUILDUP = 'PRICING_BUILDUP',
  DEALER_MANAGEMENT = 'DEALER_MANAGEMENT',
  AUTOMATED_POSTING = 'AUTOMATED_POSTING',
  STATION_CONFIGURATION = 'STATION_CONFIGURATION',
  PRICE_COMPONENTS = 'PRICE_COMPONENTS',
}

@Entity('configurations')
@Index(['tenantId', 'module', 'key'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'type'])
@Index(['module', 'key'])
export class Configuration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50, nullable: true })
  tenantId: string; // null for system-wide configs

  @Column({ name: 'configuration_key', length: 255 })
  key: string;

  @Column({ name: 'configuration_name', length: 500 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'module', type: 'enum', enum: ConfigurationModule })
  module: ConfigurationModule;

  @Column({ name: 'sub_module', length: 100, nullable: true })
  subModule: string;

  @Column({ name: 'type', type: 'enum', enum: ConfigurationType })
  type: ConfigurationType;

  @Column({ name: 'data_type', type: 'enum', enum: ConfigurationDataType })
  dataType: ConfigurationDataType;

  @Column({ name: 'status', type: 'enum', enum: ConfigurationStatus, default: ConfigurationStatus.ACTIVE })
  status: ConfigurationStatus;

  // Configuration Value
  @Column({ name: 'value', type: 'text', nullable: true })
  value: string;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue: string;

  @Column({ name: 'encrypted_value', type: 'text', nullable: true })
  encryptedValue: string;

  @Column({ name: 'json_value', type: 'simple-json', nullable: true })
  jsonValue: any;

  // Validation and Constraints
  @Column({ name: 'validation_rules', type: 'simple-json', nullable: true })
  validationRules: any;

  @Column({ name: 'allowed_values', type: 'simple-array', nullable: true })
  allowedValues: string[];

  @Column({ name: 'min_value', type: 'decimal', precision: 15, scale: 4, nullable: true })
  minValue: number;

  @Column({ name: 'max_value', type: 'decimal', precision: 15, scale: 4, nullable: true })
  maxValue: number;

  @Column({ name: 'regex_pattern', length: 500, nullable: true })
  regexPattern: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'is_sensitive', type: 'boolean', default: false })
  isSensitive: boolean;

  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted: boolean;

  // Hierarchical Configuration
  @Column({ name: 'parent_id', length: 50, nullable: true })
  parentId: string;

  @Column({ name: 'inheritance_level', type: 'int', default: 0 })
  inheritanceLevel: number; // 0=system, 1=tenant, 2=module, 3=user

  @Column({ name: 'override_allowed', type: 'boolean', default: true })
  overrideAllowed: boolean;

  @Column({ name: 'inherits_from_parent', type: 'boolean', default: false })
  inheritsFromParent: boolean;

  // Environment and Deployment
  @Column({ name: 'environment', length: 50, default: 'ALL' })
  environment: string; // PRODUCTION, STAGING, DEVELOPMENT, ALL

  @Column({ name: 'deployment_stage', length: 50, default: 'ALL' })
  deploymentStage: string;

  @Column({ name: 'feature_flag', type: 'boolean', default: false })
  featureFlag: boolean;

  @Column({ name: 'feature_flag_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  featureFlagPercentage: number; // For gradual rollouts

  // Business Rules and Logic
  @Column({ name: 'business_rule_expression', type: 'text', nullable: true })
  businessRuleExpression: string;

  @Column({ name: 'conditional_logic', type: 'simple-json', nullable: true })
  conditionalLogic: any;

  @Column({ name: 'dependencies', type: 'simple-array', nullable: true })
  dependencies: string[]; // Other config keys this depends on

  @Column({ name: 'affects', type: 'simple-array', nullable: true })
  affects: string[]; // Other config keys affected by this

  // UI and Display
  @Column({ name: 'ui_component', length: 100, nullable: true })
  uiComponent: string; // INPUT, SELECT, CHECKBOX, etc.

  @Column({ name: 'ui_group', length: 100, nullable: true })
  uiGroup: string;

  @Column({ name: 'ui_order', type: 'int', nullable: true })
  uiOrder: number;

  @Column({ name: 'ui_label', length: 255, nullable: true })
  uiLabel: string;

  @Column({ name: 'ui_help_text', type: 'text', nullable: true })
  uiHelpText: string;

  @Column({ name: 'ui_placeholder', length: 255, nullable: true })
  uiPlaceholder: string;

  @Column({ name: 'is_visible_in_ui', type: 'boolean', default: true })
  isVisibleInUI: boolean;

  @Column({ name: 'is_editable_in_ui', type: 'boolean', default: true })
  isEditableInUI: boolean;

  // Versioning and Change Management
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'previous_value', type: 'text', nullable: true })
  previousValue: string;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'approved_by', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'effective_date', type: 'timestamp', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  // Change Tracking
  @Column({ name: 'change_frequency', type: 'int', default: 0 })
  changeFrequency: number;

  @Column({ name: 'last_changed_date', type: 'timestamp', nullable: true })
  lastChangedDate: Date;

  @Column({ name: 'last_accessed_date', type: 'timestamp', nullable: true })
  lastAccessedDate: Date;

  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount: number;

  // Performance and Caching
  @Column({ name: 'cache_enabled', type: 'boolean', default: true })
  cacheEnabled: boolean;

  @Column({ name: 'cache_ttl_seconds', type: 'int', default: 3600 })
  cacheTtlSeconds: number;

  @Column({ name: 'refresh_frequency', length: 50, nullable: true })
  refreshFrequency: string; // REAL_TIME, HOURLY, DAILY, WEEKLY

  @Column({ name: 'requires_restart', type: 'boolean', default: false })
  requiresRestart: boolean;

  // Security and Permissions
  @Column({ name: 'read_permissions', type: 'simple-array', nullable: true })
  readPermissions: string[];

  @Column({ name: 'write_permissions', type: 'simple-array', nullable: true })
  writePermissions: string[];

  @Column({ name: 'admin_only', type: 'boolean', default: false })
  adminOnly: boolean;

  @Column({ name: 'encryption_key_id', length: 100, nullable: true })
  encryptionKeyId: string;

  // Integration and External Systems
  @Column({ name: 'external_source', length: 255, nullable: true })
  externalSource: string;

  @Column({ name: 'external_key', length: 255, nullable: true })
  externalKey: string;

  @Column({ name: 'sync_enabled', type: 'boolean', default: false })
  syncEnabled: boolean;

  @Column({ name: 'sync_direction', length: 20, nullable: true })
  syncDirection: string; // INBOUND, OUTBOUND, BIDIRECTIONAL

  @Column({ name: 'last_sync_date', type: 'timestamp', nullable: true })
  lastSyncDate: Date;

  // Localization
  @Column({ name: 'locale', length: 10, default: 'en-GH' })
  locale: string;

  @Column({ name: 'localized_values', type: 'simple-json', nullable: true })
  localizedValues: any;

  @Column({ name: 'timezone', length: 50, default: 'Africa/Accra' })
  timezone: string;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  // Additional Metadata
  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'category', length: 100, nullable: true })
  category: string;

  @Column({ name: 'priority', type: 'int', default: 5 })
  priority: number; // 1=highest, 10=lowest

  @Column({ name: 'impact_level', length: 20, default: 'MEDIUM' })
  impactLevel: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'documentation_url', length: 500, nullable: true })
  documentationUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_system_config', type: 'boolean', default: false })
  isSystemConfig: boolean;

  @Column({ name: 'is_runtime_configurable', type: 'boolean', default: true })
  isRuntimeConfigurable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  // Calculated and helper methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateFields() {
    // Set inheritance level based on type
    if (this.type === ConfigurationType.SYSTEM) {
      this.inheritanceLevel = 0;
    } else if (this.type === ConfigurationType.TENANT) {
      this.inheritanceLevel = 1;
    } else if (this.type === ConfigurationType.MODULE) {
      this.inheritanceLevel = 2;
    } else if (this.type === ConfigurationType.USER) {
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
  getEffectiveValue(): any {
    if (this.value !== null && this.value !== undefined) {
      return this.parseValue(this.value);
    }
    
    if (this.inheritsFromParent && this.defaultValue !== null) {
      return this.parseValue(this.defaultValue);
    }
    
    return this.parseValue(this.defaultValue);
  }

  // Helper method to parse value based on data type
  private parseValue(value: string): any {
    if (!value) return null;
    
    switch (this.dataType) {
      case ConfigurationDataType.BOOLEAN:
        return value.toLowerCase() === 'true';
      case ConfigurationDataType.NUMBER:
        return parseFloat(value);
      case ConfigurationDataType.JSON:
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case ConfigurationDataType.ARRAY:
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',');
        }
      case ConfigurationDataType.DATE:
        return new Date(value);
      default:
        return value;
    }
  }

  // Helper method to check if configuration is currently effective
  isEffective(date: Date = new Date()): boolean {
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
}