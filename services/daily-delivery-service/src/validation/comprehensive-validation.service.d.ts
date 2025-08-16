import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
export interface ValidationResult {
    isValid: boolean;
    validationScore: number;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    criticalIssues: ValidationError[];
    businessRuleViolations: BusinessRuleViolation[];
    dataQualityIssues: DataQualityIssue[];
    complianceIssues: ComplianceIssue[];
    recommendations: ValidationRecommendation[];
    validationSummary: ValidationSummary;
}
export interface ValidationError {
    errorCode: string;
    errorType: 'REQUIRED_FIELD' | 'INVALID_FORMAT' | 'BUSINESS_RULE' | 'DATA_INTEGRITY' | 'COMPLIANCE' | 'SYSTEM_ERROR';
    fieldName?: string;
    errorMessage: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    currentValue?: any;
    expectedValue?: any;
    correctionAction: string;
    impactDescription: string;
    validationCategory: string;
}
export interface ValidationWarning {
    warningCode: string;
    warningType: 'DATA_QUALITY' | 'BUSINESS_LOGIC' | 'COMPLIANCE' | 'PERFORMANCE' | 'SECURITY';
    fieldName?: string;
    warningMessage: string;
    currentValue?: any;
    recommendedValue?: any;
    recommendedAction: string;
    potentialImpact: string;
}
export interface BusinessRuleViolation {
    ruleCode: string;
    ruleName: string;
    ruleDescription: string;
    violationType: 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL';
    affectedFields: string[];
    violationDetails: string;
    businessImpact: string;
    correctionSteps: string[];
    exemptionPossible: boolean;
}
export interface DataQualityIssue {
    issueType: 'MISSING_DATA' | 'INCONSISTENT_DATA' | 'INVALID_FORMAT' | 'DUPLICATE_DATA' | 'OUTLIER_VALUE' | 'STALE_DATA';
    fieldName: string;
    issueDescription: string;
    dataQualityScore: number;
    impactOnProcessing: string;
    suggestedImprovement: string;
    autoCorrectPossible: boolean;
    autoCorrectAction?: string;
}
export interface ComplianceIssue {
    complianceType: 'GHANA_NPA' | 'GHANA_CUSTOMS' | 'TAX_COMPLIANCE' | 'ENVIRONMENTAL' | 'QUALITY_STANDARD' | 'UPPF' | 'IFRS';
    issueCode: string;
    issueDescription: string;
    complianceRequirement: string;
    violationSeverity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
    regulatoryRisk: string;
    remedialActions: string[];
    complianceDeadline?: Date;
    penaltyRisk?: string;
}
export interface ValidationRecommendation {
    recommendationType: 'DATA_IMPROVEMENT' | 'PROCESS_ENHANCEMENT' | 'COMPLIANCE_UPDATE' | 'SYSTEM_OPTIMIZATION' | 'TRAINING';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    title: string;
    description: string;
    expectedBenefit: string;
    implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
    implementationSteps: string[];
    estimatedTimeframe: string;
}
export interface ValidationSummary {
    totalChecksPerformed: number;
    passedChecks: number;
    failedChecks: number;
    warningsGenerated: number;
    overallValidationStatus: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'FAILED';
    validationCompletionTime: number;
    validationDateTime: Date;
    validatedBy: string;
    nextValidationRecommended: Date;
}
export interface FieldValidationRule {
    fieldName: string;
    required: boolean;
    dataType: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: RegExp;
    allowedValues?: any[];
    customValidator?: (value: any, context: any) => ValidationResult;
    businessRules?: string[];
    complianceRequirements?: string[];
}
export interface BusinessRule {
    ruleId: string;
    ruleName: string;
    ruleDescription: string;
    ruleType: 'VALIDATION' | 'CALCULATION' | 'WORKFLOW' | 'COMPLIANCE';
    conditions: RuleCondition[];
    actions: RuleAction[];
    isActive: boolean;
    priority: number;
    applicableScenarios: string[];
}
export interface RuleCondition {
    conditionType: 'FIELD_VALUE' | 'CALCULATION' | 'EXTERNAL_DATA' | 'DATE_RANGE' | 'COMPLEX_LOGIC';
    fieldName?: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN_RANGE' | 'IS_EMPTY' | 'IS_NOT_EMPTY';
    expectedValue?: any;
    customLogic?: (context: any) => boolean;
}
export interface RuleAction {
    actionType: 'ERROR' | 'WARNING' | 'AUTO_CORRECT' | 'NOTIFY' | 'LOG' | 'CALCULATE';
    errorMessage?: string;
    correctionAction?: string;
    calculationFormula?: string;
    notificationRecipients?: string[];
}
export declare class ComprehensiveValidationService {
    private readonly eventEmitter;
    private readonly logger;
    private readonly FIELD_VALIDATION_RULES;
    private readonly BUSINESS_RULES;
    constructor(eventEmitter: EventEmitter2);
    /**
     * Comprehensive validation of daily delivery
     */
    validateDelivery(delivery: DailyDelivery, context?: any): Promise<ValidationResult>;
    /**
     * Validate multiple deliveries in batch
     */
    validateDeliveryBatch(deliveries: DailyDelivery[], context?: any): Promise<{
        overallValid: boolean;
        totalValidated: number;
        validCount: number;
        invalidCount: number;
        averageValidationScore: number;
        results: Array<{
            deliveryId: string;
            result: ValidationResult;
        }>;
        batchSummary: BatchValidationSummary;
    }>;
    /**
     * Real-time field validation
     */
    validateField(fieldName: string, fieldValue: any, delivery: Partial<DailyDelivery>, context?: any): Promise<{
        isValid: boolean;
        errors: ValidationError[];
        warnings: ValidationWarning[];
        suggestedValue?: any;
        autoCorrection?: any;
    }>;
    private performFieldValidation;
    private performBusinessRuleValidation;
    private performDataQualityAssessment;
    private performComplianceValidation;
    private performCrossFieldValidation;
    private performExternalDataValidation;
    private calculateValidationScore;
    private generateRecommendations;
    private finalizeValidationSummary;
    private validateDataType;
    private evaluateBusinessRule;
    private evaluateRuleCondition;
    private isQuantityOutlier;
    private calculateExpectedTaxes;
    private validateVehicleDriverCombination;
    private simulateCreditCheck;
    private simulateMarketPriceCheck;
    private identifyCommonIssues;
    private generateBatchRecommendations;
}
export interface BatchValidationSummary {
    batchId: string;
    validationStartTime: Date;
    validationEndTime: Date;
    totalProcessingTime: number;
    deliveriesProcessed: number;
    validDeliveries: number;
    invalidDeliveries: number;
    averageScore: number;
    commonIssues: string[];
    recommendedActions: string[];
}
//# sourceMappingURL=comprehensive-validation.service.d.ts.map