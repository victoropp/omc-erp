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
var ComprehensiveValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprehensiveValidationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = require("decimal.js");
const date_fns_1 = require("date-fns");
let ComprehensiveValidationService = ComprehensiveValidationService_1 = class ComprehensiveValidationService {
    eventEmitter;
    logger = new common_1.Logger(ComprehensiveValidationService_1.name);
    // Field validation rules for Daily Delivery
    FIELD_VALIDATION_RULES = [
        {
            fieldName: 'deliveryNumber',
            required: true,
            dataType: 'string',
            minLength: 5,
            maxLength: 50,
            pattern: /^DD-\d{8}-[A-Z0-9]{6}$/,
            businessRules: ['UNIQUE_DELIVERY_NUMBER'],
        },
        {
            fieldName: 'deliveryDate',
            required: true,
            dataType: 'date',
            businessRules: ['VALID_DELIVERY_DATE_RANGE'],
        },
        {
            fieldName: 'supplierId',
            required: true,
            dataType: 'string',
            businessRules: ['VALID_SUPPLIER_ID', 'ACTIVE_SUPPLIER'],
        },
        {
            fieldName: 'customerId',
            required: true,
            dataType: 'string',
            businessRules: ['VALID_CUSTOMER_ID', 'ACTIVE_CUSTOMER'],
        },
        {
            fieldName: 'customerName',
            required: true,
            dataType: 'string',
            minLength: 2,
            maxLength: 255,
        },
        {
            fieldName: 'productType',
            required: true,
            dataType: 'string',
            allowedValues: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
        },
        {
            fieldName: 'quantityLitres',
            required: true,
            dataType: 'number',
            minValue: 0.01,
            maxValue: 100000,
            businessRules: ['REASONABLE_QUANTITY'],
        },
        {
            fieldName: 'unitPrice',
            required: true,
            dataType: 'number',
            minValue: 0.01,
            maxValue: 50,
            businessRules: ['REASONABLE_UNIT_PRICE'],
        },
        {
            fieldName: 'totalValue',
            required: true,
            dataType: 'number',
            minValue: 0.01,
            businessRules: ['CORRECT_TOTAL_CALCULATION'],
        },
        {
            fieldName: 'psaNumber',
            required: true,
            dataType: 'string',
            minLength: 5,
            maxLength: 50,
            complianceRequirements: ['GHANA_NPA_COMPLIANCE'],
        },
        {
            fieldName: 'waybillNumber',
            required: true,
            dataType: 'string',
            minLength: 5,
            maxLength: 50,
            complianceRequirements: ['TRANSPORT_COMPLIANCE'],
        },
        {
            fieldName: 'npaPermitNumber',
            required: false,
            dataType: 'string',
            complianceRequirements: ['GHANA_NPA_PERMIT'],
        },
        {
            fieldName: 'customsEntryNumber',
            required: false,
            dataType: 'string',
            complianceRequirements: ['GHANA_CUSTOMS_COMPLIANCE'],
        },
    ];
    // Business rules for validation
    BUSINESS_RULES = [
        {
            ruleId: 'UNIQUE_DELIVERY_NUMBER',
            ruleName: 'Unique Delivery Number',
            ruleDescription: 'Each delivery must have a unique delivery number',
            ruleType: 'VALIDATION',
            conditions: [
                {
                    conditionType: 'FIELD_VALUE',
                    fieldName: 'deliveryNumber',
                    operator: 'IS_NOT_EMPTY',
                },
            ],
            actions: [
                {
                    actionType: 'ERROR',
                    errorMessage: 'Delivery number must be unique',
                    correctionAction: 'Generate new unique delivery number',
                },
            ],
            isActive: true,
            priority: 1,
            applicableScenarios: ['CREATE', 'UPDATE'],
        },
        {
            ruleId: 'CORRECT_TOTAL_CALCULATION',
            ruleName: 'Correct Total Value Calculation',
            ruleDescription: 'Total value must equal quantity × unit price',
            ruleType: 'CALCULATION',
            conditions: [
                {
                    conditionType: 'CALCULATION',
                    customLogic: (context) => {
                        const { quantityLitres, unitPrice, totalValue } = context;
                        const expectedTotal = new decimal_js_1.Decimal(quantityLitres).mul(unitPrice).toNumber();
                        const variance = Math.abs(totalValue - expectedTotal) / expectedTotal;
                        return variance > 0.01; // 1% tolerance
                    },
                },
            ],
            actions: [
                {
                    actionType: 'ERROR',
                    errorMessage: 'Total value does not match quantity × unit price',
                    correctionAction: 'Recalculate total value',
                },
            ],
            isActive: true,
            priority: 2,
            applicableScenarios: ['CREATE', 'UPDATE', 'CALCULATION'],
        },
    ];
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    /**
     * Comprehensive validation of daily delivery
     */
    async validateDelivery(delivery, context = {}) {
        const startTime = Date.now();
        this.logger.log(`Starting comprehensive validation for delivery ${delivery.deliveryNumber || 'NEW'}`);
        const result = {
            isValid: true,
            validationScore: 100,
            errors: [],
            warnings: [],
            criticalIssues: [],
            businessRuleViolations: [],
            dataQualityIssues: [],
            complianceIssues: [],
            recommendations: [],
            validationSummary: {
                totalChecksPerformed: 0,
                passedChecks: 0,
                failedChecks: 0,
                warningsGenerated: 0,
                overallValidationStatus: 'EXCELLENT',
                validationCompletionTime: 0,
                validationDateTime: new Date(),
                validatedBy: context.userId || 'SYSTEM',
                nextValidationRecommended: (0, date_fns_1.addDays)(new Date(), 30),
            },
        };
        try {
            // 1. Field-level validation
            await this.performFieldValidation(delivery, result);
            // 2. Business rule validation
            await this.performBusinessRuleValidation(delivery, result, context);
            // 3. Data quality assessment
            await this.performDataQualityAssessment(delivery, result);
            // 4. Compliance validation
            await this.performComplianceValidation(delivery, result);
            // 5. Cross-field validation
            await this.performCrossFieldValidation(delivery, result);
            // 6. External data validation
            await this.performExternalDataValidation(delivery, result, context);
            // 7. Calculate overall validation score
            this.calculateValidationScore(result);
            // 8. Generate recommendations
            this.generateRecommendations(result, delivery);
            // 9. Finalize validation summary
            this.finalizeValidationSummary(result, startTime);
            // Emit validation event
            this.eventEmitter.emit('validation.completed', {
                deliveryId: delivery.id,
                deliveryNumber: delivery.deliveryNumber,
                validationResult: result,
            });
            this.logger.log(`Validation completed for delivery ${delivery.deliveryNumber || 'NEW'}: Score ${result.validationScore}, Status: ${result.validationSummary.overallValidationStatus}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Validation failed for delivery ${delivery.deliveryNumber || 'NEW'}:`, error);
            // Add system error
            result.errors.push({
                errorCode: 'VALIDATION_SYSTEM_ERROR',
                errorType: 'SYSTEM_ERROR',
                errorMessage: `Validation system error: ${error.message}`,
                severity: 'CRITICAL',
                correctionAction: 'Contact system administrator',
                impactDescription: 'Cannot complete validation process',
                validationCategory: 'SYSTEM',
            });
            result.isValid = false;
            result.validationScore = 0;
            result.validationSummary.overallValidationStatus = 'FAILED';
            result.validationSummary.validationCompletionTime = Date.now() - startTime;
            return result;
        }
    }
    /**
     * Validate multiple deliveries in batch
     */
    async validateDeliveryBatch(deliveries, context = {}) {
        const startTime = Date.now();
        this.logger.log(`Starting batch validation for ${deliveries.length} deliveries`);
        const results = [];
        let validCount = 0;
        let invalidCount = 0;
        let totalScore = 0;
        for (const delivery of deliveries) {
            try {
                const validationResult = await this.validateDelivery(delivery, context);
                results.push({
                    deliveryId: delivery.id,
                    result: validationResult,
                });
                if (validationResult.isValid) {
                    validCount++;
                }
                else {
                    invalidCount++;
                }
                totalScore += validationResult.validationScore;
            }
            catch (error) {
                this.logger.error(`Batch validation failed for delivery ${delivery.id}:`, error);
                invalidCount++;
            }
        }
        const averageValidationScore = deliveries.length > 0 ? totalScore / deliveries.length : 0;
        const overallValid = invalidCount === 0;
        const batchSummary = {
            batchId: `BATCH_${Date.now()}`,
            validationStartTime: new Date(startTime),
            validationEndTime: new Date(),
            totalProcessingTime: Date.now() - startTime,
            deliveriesProcessed: deliveries.length,
            validDeliveries: validCount,
            invalidDeliveries: invalidCount,
            averageScore: Math.round(averageValidationScore),
            commonIssues: this.identifyCommonIssues(results),
            recommendedActions: this.generateBatchRecommendations(results),
        };
        // Emit batch validation event
        this.eventEmitter.emit('validation.batch_completed', {
            batchSummary,
            overallValid,
        });
        return {
            overallValid,
            totalValidated: deliveries.length,
            validCount,
            invalidCount,
            averageValidationScore: Math.round(averageValidationScore),
            results,
            batchSummary,
        };
    }
    /**
     * Real-time field validation
     */
    async validateField(fieldName, fieldValue, delivery, context = {}) {
        const rule = this.FIELD_VALIDATION_RULES.find(r => r.fieldName === fieldName);
        if (!rule) {
            return {
                isValid: true,
                errors: [],
                warnings: [],
            };
        }
        const errors = [];
        const warnings = [];
        let suggestedValue;
        let autoCorrection;
        // Required field check
        if (rule.required && (fieldValue === null || fieldValue === undefined || fieldValue === '')) {
            errors.push({
                errorCode: 'REQUIRED_FIELD_MISSING',
                errorType: 'REQUIRED_FIELD',
                fieldName,
                errorMessage: `${fieldName} is required`,
                severity: 'HIGH',
                currentValue: fieldValue,
                correctionAction: `Provide a valid value for ${fieldName}`,
                impactDescription: 'Cannot proceed without this required field',
                validationCategory: 'FIELD_VALIDATION',
            });
        }
        // Data type validation
        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            const typeValidation = this.validateDataType(fieldValue, rule.dataType, rule);
            errors.push(...typeValidation.errors);
            warnings.push(...typeValidation.warnings);
            if (typeValidation.suggestedValue !== undefined) {
                suggestedValue = typeValidation.suggestedValue;
            }
            if (typeValidation.autoCorrection !== undefined) {
                autoCorrection = typeValidation.autoCorrection;
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestedValue,
            autoCorrection,
        };
    }
    // Private validation methods
    async performFieldValidation(delivery, result) {
        for (const rule of this.FIELD_VALIDATION_RULES) {
            result.validationSummary.totalChecksPerformed++;
            const fieldValue = delivery[rule.fieldName];
            const fieldValidation = await this.validateField(rule.fieldName, fieldValue, delivery);
            result.errors.push(...fieldValidation.errors);
            result.warnings.push(...fieldValidation.warnings);
            if (fieldValidation.errors.length === 0) {
                result.validationSummary.passedChecks++;
            }
            else {
                result.validationSummary.failedChecks++;
            }
            result.validationSummary.warningsGenerated += fieldValidation.warnings.length;
        }
    }
    async performBusinessRuleValidation(delivery, result, context) {
        for (const rule of this.BUSINESS_RULES) {
            if (!rule.isActive)
                continue;
            result.validationSummary.totalChecksPerformed++;
            const ruleViolation = this.evaluateBusinessRule(rule, delivery, context);
            if (ruleViolation) {
                result.businessRuleViolations.push(ruleViolation);
                result.validationSummary.failedChecks++;
                // Convert to errors if mandatory
                if (ruleViolation.violationType === 'MANDATORY') {
                    result.errors.push({
                        errorCode: rule.ruleId,
                        errorType: 'BUSINESS_RULE',
                        errorMessage: ruleViolation.violationDetails,
                        severity: 'HIGH',
                        correctionAction: ruleViolation.correctionSteps.join(', '),
                        impactDescription: ruleViolation.businessImpact,
                        validationCategory: 'BUSINESS_RULE',
                    });
                }
            }
            else {
                result.validationSummary.passedChecks++;
            }
        }
    }
    async performDataQualityAssessment(delivery, result) {
        // Check for missing optional data
        const optionalFields = ['driverName', 'driverLicenseNumber', 'temperatureAtLoading', 'densityAtLoading'];
        for (const field of optionalFields) {
            if (!delivery[field]) {
                result.dataQualityIssues.push({
                    issueType: 'MISSING_DATA',
                    fieldName: field,
                    issueDescription: `Optional field ${field} is missing`,
                    dataQualityScore: 70,
                    impactOnProcessing: 'Reduced data richness for analytics',
                    suggestedImprovement: `Collect ${field} during delivery process`,
                    autoCorrectPossible: false,
                });
            }
        }
        // Check for data consistency
        if (delivery.loadingStartTime && delivery.loadingEndTime) {
            if (delivery.loadingStartTime >= delivery.loadingEndTime) {
                result.dataQualityIssues.push({
                    issueType: 'INCONSISTENT_DATA',
                    fieldName: 'loadingTimes',
                    issueDescription: 'Loading start time is not before end time',
                    dataQualityScore: 30,
                    impactOnProcessing: 'Cannot calculate loading duration accurately',
                    suggestedImprovement: 'Verify and correct loading times',
                    autoCorrectPossible: false,
                });
            }
        }
        // Check for outlier values
        if (delivery.quantityLitres) {
            const isOutlier = this.isQuantityOutlier(delivery.quantityLitres, delivery.productType);
            if (isOutlier) {
                result.dataQualityIssues.push({
                    issueType: 'OUTLIER_VALUE',
                    fieldName: 'quantityLitres',
                    issueDescription: `Quantity ${delivery.quantityLitres}L is unusually ${isOutlier} for ${delivery.productType}`,
                    dataQualityScore: 60,
                    impactOnProcessing: 'May indicate data entry error',
                    suggestedImprovement: 'Verify quantity is correct',
                    autoCorrectPossible: false,
                });
            }
        }
    }
    async performComplianceValidation(delivery, result) {
        // NPA compliance
        if (!delivery.npaPermitNumber && delivery.productType !== 'LUBRICANTS') {
            result.complianceIssues.push({
                complianceType: 'GHANA_NPA',
                issueCode: 'MISSING_NPA_PERMIT',
                issueDescription: 'NPA permit number is missing',
                complianceRequirement: 'All petroleum product deliveries require valid NPA permit',
                violationSeverity: 'MAJOR',
                regulatoryRisk: 'Regulatory penalty and delivery suspension',
                remedialActions: ['Obtain valid NPA permit', 'Update delivery record'],
                complianceDeadline: (0, date_fns_1.addDays)(new Date(), 7),
                penaltyRisk: 'GHS 5,000 - GHS 50,000 fine',
            });
        }
        // Customs compliance for imports
        if (delivery.customsDutyPaid > 0 && !delivery.customsEntryNumber) {
            result.complianceIssues.push({
                complianceType: 'GHANA_CUSTOMS',
                issueCode: 'MISSING_CUSTOMS_ENTRY',
                issueDescription: 'Customs entry number missing for imported product',
                complianceRequirement: 'Imported products must have valid customs entry',
                violationSeverity: 'CRITICAL',
                regulatoryRisk: 'Customs seizure and significant penalties',
                remedialActions: ['Provide customs entry number', 'Submit customs documentation'],
                complianceDeadline: (0, date_fns_1.addDays)(new Date(), 3),
                penaltyRisk: 'Product seizure and heavy fines',
            });
        }
        // Tax compliance
        const expectedTaxes = this.calculateExpectedTaxes(delivery);
        const actualTaxes = delivery.getTotalTaxes();
        const taxVariance = Math.abs(expectedTaxes - actualTaxes) / expectedTaxes;
        if (taxVariance > 0.05) { // 5% tolerance
            result.complianceIssues.push({
                complianceType: 'TAX_COMPLIANCE',
                issueCode: 'INCORRECT_TAX_CALCULATION',
                issueDescription: `Tax calculation variance: Expected ${expectedTaxes}, Actual ${actualTaxes}`,
                complianceRequirement: 'Taxes must be calculated according to current rates',
                violationSeverity: 'MODERATE',
                regulatoryRisk: 'Tax audit and penalties',
                remedialActions: ['Recalculate taxes with current rates', 'Update delivery record'],
                complianceDeadline: (0, date_fns_1.addDays)(new Date(), 14),
                penaltyRisk: 'Interest and penalties on tax difference',
            });
        }
    }
    async performCrossFieldValidation(delivery, result) {
        // Vehicle and driver relationship
        if (delivery.vehicleRegistrationNumber && delivery.driverName) {
            const isValidCombination = await this.validateVehicleDriverCombination(delivery.vehicleRegistrationNumber, delivery.driverId || delivery.driverName);
            if (!isValidCombination) {
                result.warnings.push({
                    warningCode: 'INVALID_VEHICLE_DRIVER_COMBO',
                    warningType: 'BUSINESS_LOGIC',
                    fieldName: 'vehicleDriver',
                    warningMessage: 'Vehicle and driver combination may be invalid',
                    currentValue: `${delivery.vehicleRegistrationNumber} - ${delivery.driverName}`,
                    recommendedAction: 'Verify vehicle is assigned to this driver',
                    potentialImpact: 'Delivery tracking and insurance issues',
                });
            }
        }
        // Product and destination compatibility
        if (delivery.productType === 'LPG' && !delivery.specialHandlingRequirements) {
            result.warnings.push({
                warningCode: 'MISSING_SPECIAL_HANDLING',
                warningType: 'COMPLIANCE',
                fieldName: 'specialHandlingRequirements',
                warningMessage: 'LPG deliveries should specify special handling requirements',
                recommendedAction: 'Add special handling requirements for LPG',
                potentialImpact: 'Safety and compliance risks',
            });
        }
        // Quantity and vehicle capacity
        if (delivery.quantityLitres > 40000) { // Standard tanker capacity
            result.warnings.push({
                warningCode: 'QUANTITY_EXCEEDS_STANDARD_CAPACITY',
                warningType: 'DATA_QUALITY',
                fieldName: 'quantityLitres',
                warningMessage: 'Quantity exceeds standard tanker capacity',
                currentValue: delivery.quantityLitres,
                recommendedValue: 40000,
                recommendedAction: 'Verify quantity or use multiple vehicles',
                potentialImpact: 'Operational inefficiency',
            });
        }
    }
    async performExternalDataValidation(delivery, result, context) {
        // This would typically involve external API calls
        // For now, we'll simulate some external validations
        // Customer credit check
        if (context.checkCreditLimit && delivery.totalValue > 10000) {
            const creditCheckPassed = await this.simulateCreditCheck(delivery.customerId, delivery.totalValue);
            if (!creditCheckPassed) {
                result.warnings.push({
                    warningCode: 'CREDIT_LIMIT_CONCERN',
                    warningType: 'BUSINESS_LOGIC',
                    warningMessage: 'Delivery amount may exceed customer credit limit',
                    recommendedAction: 'Verify customer credit status before proceeding',
                    potentialImpact: 'Payment collection risk',
                });
            }
        }
        // Price validation against market rates
        const marketPrice = await this.simulateMarketPriceCheck(delivery.productType);
        const priceVariance = Math.abs(delivery.unitPrice - marketPrice) / marketPrice;
        if (priceVariance > 0.1) { // 10% variance threshold
            result.warnings.push({
                warningCode: 'PRICE_VARIANCE_HIGH',
                warningType: 'DATA_QUALITY',
                fieldName: 'unitPrice',
                warningMessage: `Unit price varies significantly from market rate (Market: ${marketPrice})`,
                currentValue: delivery.unitPrice,
                recommendedValue: marketPrice,
                recommendedAction: 'Verify pricing is correct',
                potentialImpact: 'Profitability concern or pricing error',
            });
        }
    }
    calculateValidationScore(result) {
        let score = 100;
        // Deduct points for errors
        for (const error of result.errors) {
            switch (error.severity) {
                case 'CRITICAL':
                    score -= 25;
                    result.criticalIssues.push(error);
                    break;
                case 'HIGH':
                    score -= 15;
                    break;
                case 'MEDIUM':
                    score -= 10;
                    break;
                case 'LOW':
                    score -= 5;
                    break;
            }
        }
        // Deduct points for compliance issues
        for (const issue of result.complianceIssues) {
            switch (issue.violationSeverity) {
                case 'CRITICAL':
                    score -= 20;
                    break;
                case 'MAJOR':
                    score -= 15;
                    break;
                case 'MODERATE':
                    score -= 10;
                    break;
                case 'MINOR':
                    score -= 5;
                    break;
            }
        }
        // Deduct points for data quality issues
        for (const issue of result.dataQualityIssues) {
            score -= (100 - issue.dataQualityScore) / 10;
        }
        // Deduct points for business rule violations
        score -= result.businessRuleViolations.length * 5;
        // Minimum score is 0
        result.validationScore = Math.max(0, Math.round(score));
        result.isValid = result.criticalIssues.length === 0 && result.validationScore >= 70;
        // Determine overall status
        if (result.validationScore >= 90) {
            result.validationSummary.overallValidationStatus = 'EXCELLENT';
        }
        else if (result.validationScore >= 80) {
            result.validationSummary.overallValidationStatus = 'GOOD';
        }
        else if (result.validationScore >= 70) {
            result.validationSummary.overallValidationStatus = 'ACCEPTABLE';
        }
        else if (result.validationScore >= 50) {
            result.validationSummary.overallValidationStatus = 'POOR';
        }
        else {
            result.validationSummary.overallValidationStatus = 'FAILED';
        }
    }
    generateRecommendations(result, delivery) {
        // Generate recommendations based on validation results
        if (result.criticalIssues.length > 0) {
            result.recommendations.push({
                recommendationType: 'COMPLIANCE_UPDATE',
                priority: 'URGENT',
                title: 'Address Critical Issues Immediately',
                description: 'Critical validation issues must be resolved before proceeding',
                expectedBenefit: 'Avoid regulatory penalties and operational disruptions',
                implementationEffort: 'HIGH',
                implementationSteps: result.criticalIssues.map(issue => issue.correctionAction),
                estimatedTimeframe: 'Immediate',
            });
        }
        if (result.dataQualityIssues.length > 3) {
            result.recommendations.push({
                recommendationType: 'DATA_IMPROVEMENT',
                priority: 'HIGH',
                title: 'Improve Data Collection Process',
                description: 'Multiple data quality issues detected, consider process improvements',
                expectedBenefit: 'Better analytics and decision making',
                implementationEffort: 'MEDIUM',
                implementationSteps: [
                    'Review data collection procedures',
                    'Implement data validation at entry point',
                    'Train staff on data quality importance',
                ],
                estimatedTimeframe: '2-4 weeks',
            });
        }
        if (result.complianceIssues.length > 0) {
            result.recommendations.push({
                recommendationType: 'COMPLIANCE_UPDATE',
                priority: 'HIGH',
                title: 'Strengthen Compliance Procedures',
                description: 'Compliance gaps identified that need attention',
                expectedBenefit: 'Reduced regulatory risk and penalties',
                implementationEffort: 'MEDIUM',
                implementationSteps: [
                    'Update compliance checklists',
                    'Implement automated compliance checks',
                    'Schedule regular compliance training',
                ],
                estimatedTimeframe: '1-2 weeks',
            });
        }
    }
    finalizeValidationSummary(result, startTime) {
        result.validationSummary.validationCompletionTime = Date.now() - startTime;
        // Set next validation recommendation based on score
        const daysToNext = result.validationScore >= 90 ? 30 : result.validationScore >= 70 ? 14 : 7;
        result.validationSummary.nextValidationRecommended = (0, date_fns_1.addDays)(new Date(), daysToNext);
    }
    // Helper methods
    validateDataType(value, expectedType, rule) {
        const errors = [];
        const warnings = [];
        let suggestedValue;
        let autoCorrection;
        switch (expectedType) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push({
                        errorCode: 'INVALID_STRING_TYPE',
                        errorType: 'INVALID_FORMAT',
                        fieldName: rule.fieldName,
                        errorMessage: `${rule.fieldName} must be a string`,
                        severity: 'MEDIUM',
                        currentValue: value,
                        expectedValue: 'string',
                        correctionAction: 'Convert value to string',
                        impactDescription: 'Data type mismatch may cause processing errors',
                        validationCategory: 'DATA_TYPE',
                    });
                    autoCorrection = String(value);
                }
                else {
                    // Length validation
                    if (rule.minLength && value.length < rule.minLength) {
                        errors.push({
                            errorCode: 'STRING_TOO_SHORT',
                            errorType: 'INVALID_FORMAT',
                            fieldName: rule.fieldName,
                            errorMessage: `${rule.fieldName} is too short (minimum ${rule.minLength} characters)`,
                            severity: 'MEDIUM',
                            currentValue: value,
                            correctionAction: `Provide at least ${rule.minLength} characters`,
                            impactDescription: 'Field does not meet minimum length requirement',
                            validationCategory: 'LENGTH_VALIDATION',
                        });
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        errors.push({
                            errorCode: 'STRING_TOO_LONG',
                            errorType: 'INVALID_FORMAT',
                            fieldName: rule.fieldName,
                            errorMessage: `${rule.fieldName} is too long (maximum ${rule.maxLength} characters)`,
                            severity: 'MEDIUM',
                            currentValue: value,
                            correctionAction: `Limit to ${rule.maxLength} characters`,
                            impactDescription: 'Field exceeds maximum length requirement',
                            validationCategory: 'LENGTH_VALIDATION',
                        });
                        suggestedValue = value.substring(0, rule.maxLength);
                    }
                    // Pattern validation
                    if (rule.pattern && !rule.pattern.test(value)) {
                        errors.push({
                            errorCode: 'INVALID_PATTERN',
                            errorType: 'INVALID_FORMAT',
                            fieldName: rule.fieldName,
                            errorMessage: `${rule.fieldName} does not match required pattern`,
                            severity: 'HIGH',
                            currentValue: value,
                            correctionAction: 'Provide value in correct format',
                            impactDescription: 'Field format is incorrect',
                            validationCategory: 'PATTERN_VALIDATION',
                        });
                    }
                }
                break;
            case 'number':
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                if (isNaN(numValue)) {
                    errors.push({
                        errorCode: 'INVALID_NUMBER_TYPE',
                        errorType: 'INVALID_FORMAT',
                        fieldName: rule.fieldName,
                        errorMessage: `${rule.fieldName} must be a valid number`,
                        severity: 'HIGH',
                        currentValue: value,
                        expectedValue: 'number',
                        correctionAction: 'Provide a valid numeric value',
                        impactDescription: 'Cannot perform calculations with invalid number',
                        validationCategory: 'DATA_TYPE',
                    });
                }
                else {
                    // Range validation
                    if (rule.minValue !== undefined && numValue < rule.minValue) {
                        errors.push({
                            errorCode: 'NUMBER_TOO_SMALL',
                            errorType: 'INVALID_FORMAT',
                            fieldName: rule.fieldName,
                            errorMessage: `${rule.fieldName} must be at least ${rule.minValue}`,
                            severity: 'MEDIUM',
                            currentValue: numValue,
                            expectedValue: `>= ${rule.minValue}`,
                            correctionAction: `Provide value >= ${rule.minValue}`,
                            impactDescription: 'Value is below acceptable minimum',
                            validationCategory: 'RANGE_VALIDATION',
                        });
                    }
                    if (rule.maxValue !== undefined && numValue > rule.maxValue) {
                        errors.push({
                            errorCode: 'NUMBER_TOO_LARGE',
                            errorType: 'INVALID_FORMAT',
                            fieldName: rule.fieldName,
                            errorMessage: `${rule.fieldName} must not exceed ${rule.maxValue}`,
                            severity: 'MEDIUM',
                            currentValue: numValue,
                            expectedValue: `<= ${rule.maxValue}`,
                            correctionAction: `Provide value <= ${rule.maxValue}`,
                            impactDescription: 'Value exceeds acceptable maximum',
                            validationCategory: 'RANGE_VALIDATION',
                        });
                    }
                }
                break;
            case 'date':
                const dateValue = new Date(value);
                if (!(0, date_fns_1.isValid)(dateValue)) {
                    errors.push({
                        errorCode: 'INVALID_DATE',
                        errorType: 'INVALID_FORMAT',
                        fieldName: rule.fieldName,
                        errorMessage: `${rule.fieldName} must be a valid date`,
                        severity: 'HIGH',
                        currentValue: value,
                        correctionAction: 'Provide a valid date',
                        impactDescription: 'Cannot process invalid date value',
                        validationCategory: 'DATA_TYPE',
                    });
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    errors.push({
                        errorCode: 'INVALID_ARRAY_TYPE',
                        errorType: 'INVALID_FORMAT',
                        fieldName: rule.fieldName,
                        errorMessage: `${rule.fieldName} must be an array`,
                        severity: 'MEDIUM',
                        currentValue: value,
                        expectedValue: 'array',
                        correctionAction: 'Provide array value',
                        impactDescription: 'Data structure mismatch',
                        validationCategory: 'DATA_TYPE',
                    });
                }
                break;
        }
        // Allowed values validation
        if (rule.allowedValues && rule.allowedValues.length > 0 && !rule.allowedValues.includes(value)) {
            errors.push({
                errorCode: 'INVALID_ALLOWED_VALUE',
                errorType: 'INVALID_FORMAT',
                fieldName: rule.fieldName,
                errorMessage: `${rule.fieldName} must be one of: ${rule.allowedValues.join(', ')}`,
                severity: 'MEDIUM',
                currentValue: value,
                expectedValue: rule.allowedValues.join(' | '),
                correctionAction: `Select from allowed values: ${rule.allowedValues.join(', ')}`,
                impactDescription: 'Value not in acceptable range',
                validationCategory: 'ALLOWED_VALUES',
            });
        }
        return { errors, warnings, suggestedValue, autoCorrection };
    }
    evaluateBusinessRule(rule, delivery, context) {
        // Evaluate rule conditions
        let conditionsMet = true;
        for (const condition of rule.conditions) {
            if (!this.evaluateRuleCondition(condition, delivery, context)) {
                conditionsMet = false;
                break;
            }
        }
        if (conditionsMet) {
            return {
                ruleCode: rule.ruleId,
                ruleName: rule.ruleName,
                ruleDescription: rule.ruleDescription,
                violationType: 'MANDATORY', // This should be configurable
                affectedFields: rule.conditions.filter(c => c.fieldName).map(c => c.fieldName),
                violationDetails: `Rule violation: ${rule.ruleDescription}`,
                businessImpact: 'Business process integrity compromised',
                correctionSteps: rule.actions.filter(a => a.correctionAction).map(a => a.correctionAction),
                exemptionPossible: false,
            };
        }
        return null;
    }
    evaluateRuleCondition(condition, delivery, context) {
        if (condition.customLogic) {
            return condition.customLogic({ ...delivery, ...context });
        }
        if (condition.fieldName) {
            const fieldValue = delivery[condition.fieldName];
            switch (condition.operator) {
                case 'EQUALS':
                    return fieldValue === condition.expectedValue;
                case 'NOT_EQUALS':
                    return fieldValue !== condition.expectedValue;
                case 'GREATER_THAN':
                    return fieldValue > condition.expectedValue;
                case 'LESS_THAN':
                    return fieldValue < condition.expectedValue;
                case 'IS_EMPTY':
                    return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
                case 'IS_NOT_EMPTY':
                    return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
                case 'CONTAINS':
                    return String(fieldValue).includes(String(condition.expectedValue));
                case 'IN_RANGE':
                    if (Array.isArray(condition.expectedValue) && condition.expectedValue.length === 2) {
                        return fieldValue >= condition.expectedValue[0] && fieldValue <= condition.expectedValue[1];
                    }
                    return false;
                default:
                    return true;
            }
        }
        return true;
    }
    isQuantityOutlier(quantity, productType) {
        // Typical quantity ranges by product type (in litres)
        const typicalRanges = {
            'PMS': { min: 1000, max: 40000 },
            'AGO': { min: 1000, max: 40000 },
            'IFO': { min: 5000, max: 50000 },
            'LPG': { min: 500, max: 20000 },
            'KEROSENE': { min: 1000, max: 30000 },
            'LUBRICANTS': { min: 200, max: 10000 },
        };
        const range = typicalRanges[productType];
        if (!range)
            return null;
        if (quantity < range.min)
            return 'low';
        if (quantity > range.max)
            return 'high';
        return null;
    }
    calculateExpectedTaxes(delivery) {
        // This is a simplified calculation - in practice, this would use current tax rates
        const baseAmount = delivery.totalValue;
        return baseAmount * 0.4; // Simplified 40% total tax rate
    }
    async validateVehicleDriverCombination(vehicleRegNumber, driverInfo) {
        // Simulate external validation
        return true; // In practice, this would check against fleet management system
    }
    async simulateCreditCheck(customerId, amount) {
        // Simulate credit check
        return Math.random() > 0.1; // 90% pass rate
    }
    async simulateMarketPriceCheck(productType) {
        // Simulate market price lookup
        const basePrices = {
            'PMS': 6.50,
            'AGO': 6.80,
            'IFO': 5.20,
            'LPG': 8.50,
            'KEROSENE': 5.80,
            'LUBRICANTS': 15.00,
        };
        return basePrices[productType] || 6.00;
    }
    identifyCommonIssues(results) {
        const issueFrequency = new Map();
        for (const { result } of results) {
            for (const error of result.errors) {
                const count = issueFrequency.get(error.errorCode) || 0;
                issueFrequency.set(error.errorCode, count + 1);
            }
        }
        // Return issues that appear in more than 10% of deliveries
        const threshold = results.length * 0.1;
        return Array.from(issueFrequency.entries())
            .filter(([_, count]) => count >= threshold)
            .map(([errorCode, _]) => errorCode);
    }
    generateBatchRecommendations(results) {
        const recommendations = [];
        const totalResults = results.length;
        // Calculate failure rate
        const failedResults = results.filter(r => !r.result.isValid).length;
        const failureRate = failedResults / totalResults;
        if (failureRate > 0.2) {
            recommendations.push('High failure rate detected - review data collection procedures');
        }
        // Check for common compliance issues
        const complianceIssues = results.flatMap(r => r.result.complianceIssues);
        if (complianceIssues.length > totalResults * 0.5) {
            recommendations.push('Widespread compliance issues - conduct compliance training');
        }
        // Check for data quality patterns
        const dataQualityIssues = results.flatMap(r => r.result.dataQualityIssues);
        if (dataQualityIssues.length > totalResults) {
            recommendations.push('Implement automated data validation at entry point');
        }
        return recommendations;
    }
};
exports.ComprehensiveValidationService = ComprehensiveValidationService;
exports.ComprehensiveValidationService = ComprehensiveValidationService = ComprehensiveValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], ComprehensiveValidationService);
//# sourceMappingURL=comprehensive-validation.service.js.map