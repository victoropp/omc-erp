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
var GhanaComplianceService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhanaComplianceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
const decimal_js_1 = require("decimal.js");
const date_fns_1 = require("date-fns");
let GhanaComplianceService = GhanaComplianceService_1 = class GhanaComplianceService {
    httpService;
    eventEmitter;
    logger = new common_1.Logger(GhanaComplianceService_1.name);
    // Ghana-specific tax rates (these should be configurable)
    GHANA_TAX_RATES = {
        PETROLEUM_TAX: 0.17, // 17% petroleum tax
        ENERGY_FUND_LEVY: 0.05, // 5% energy fund levy
        ROAD_FUND_LEVY: 0.18, // 18% road fund levy
        PRICE_STABILIZATION_LEVY: 0.00, // Variable based on market conditions
        UPPF_LEVY: 0.46, // GHS 0.46 per litre for petrol/diesel
        VAT: 0.125, // 12.5% VAT
        WITHHOLDING_TAX: 0.05, // 5% withholding tax
        CUSTOMS_DUTY: 0.00, // Variable based on product and origin
    };
    // Tolerance limits for tax calculations
    TAX_TOLERANCE = {
        PETROLEUM_TAX: 0.02, // 2%
        ENERGY_FUND_LEVY: 0.02, // 2%
        ROAD_FUND_LEVY: 0.02, // 2%
        PRICE_STABILIZATION_LEVY: 0.05, // 5%
        UPPF_LEVY: 0.01, // 1%
        VAT: 0.01, // 1%
        WITHHOLDING_TAX: 0.01, // 1%
        CUSTOMS_DUTY: 0.02, // 2%
    };
    constructor(httpService, eventEmitter) {
        this.httpService = httpService;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Comprehensive compliance validation for delivery
     */
    async validateDeliveryCompliance(delivery) {
        this.logger.log(`Starting compliance validation for delivery ${delivery.deliveryNumber}`);
        const validationResults = [];
        const missingDocuments = [];
        const correctionRequired = [];
        const warnings = [];
        const recommendations = [];
        try {
            // NPA Permit Validation
            if (delivery.npaPermitNumber) {
                const npaResult = await this.validateNPAPermit(delivery.npaPermitNumber, delivery.productType, delivery.quantityLitres);
                validationResults.push(this.mapNPAValidationToCheckResult(npaResult));
                if (!npaResult.isValid) {
                    correctionRequired.push('NPA permit validation failed');
                }
                if (npaResult.warnings.length > 0) {
                    warnings.push(...npaResult.warnings);
                }
            }
            else {
                missingDocuments.push('NPA Permit Number');
                validationResults.push({
                    checkType: 'NPA_PERMIT',
                    checkName: 'NPA Permit Validation',
                    status: 'FAILED',
                    details: 'NPA permit number not provided',
                    score: 0,
                    lastChecked: new Date(),
                    checkedBy: 'SYSTEM',
                    ghanaSpecific: true,
                });
            }
            // Customs Entry Validation
            if (delivery.customsEntryNumber) {
                const customsResult = await this.validateCustomsEntry(delivery.customsEntryNumber, delivery.productType, delivery.quantityLitres);
                validationResults.push(this.mapCustomsValidationToCheckResult(customsResult));
                if (!customsResult.isValid) {
                    correctionRequired.push('Customs entry validation failed');
                }
            }
            else {
                missingDocuments.push('Customs Entry Number');
                validationResults.push({
                    checkType: 'CUSTOMS_ENTRY',
                    checkName: 'Customs Entry Validation',
                    status: 'FAILED',
                    details: 'Customs entry number not provided',
                    score: 0,
                    lastChecked: new Date(),
                    checkedBy: 'SYSTEM',
                    ghanaSpecific: true,
                });
            }
            // Tax Calculation Validation
            const taxValidation = await this.validateTaxCalculations(delivery);
            validationResults.push(this.mapTaxValidationToCheckResult(taxValidation));
            if (!taxValidation.isValid) {
                correctionRequired.push('Tax calculation discrepancies found');
            }
            // Environmental Compliance
            const environmentalCompliance = await this.validateEnvironmentalCompliance(delivery);
            validationResults.push(this.mapEnvironmentalToCheckResult(environmentalCompliance));
            // Quality Standards Compliance
            const qualityCompliance = await this.validateQualityStandards(delivery);
            validationResults.push(this.mapQualityToCheckResult(qualityCompliance));
            // UPPF Eligibility Check
            if (delivery.unifiedPetroleumPriceFundLevy > 0) {
                const uppfCheck = await this.checkUPPFEligibility(delivery.customerId, delivery.productType, delivery.quantityLitres);
                validationResults.push(this.mapUPPFToCheckResult(uppfCheck));
            }
            // Calculate overall compliance score
            const totalScore = validationResults.reduce((sum, result) => sum + result.score, 0);
            const complianceScore = validationResults.length > 0 ? Math.round(totalScore / validationResults.length) : 0;
            // Determine certification status
            const certificationStatus = this.assessCertificationStatus(validationResults);
            // Generate recommendations
            recommendations.push(...this.generateComplianceRecommendations(validationResults));
            const result = {
                isCompliant: complianceScore >= 85 && correctionRequired.length === 0,
                complianceScore,
                validationResults,
                missingDocuments,
                correctionRequired,
                warnings,
                recommendations,
                nextValidationDate: (0, date_fns_1.addDays)(new Date(), 90), // Quarterly validation
                certificationStatus,
            };
            // Emit compliance validation event
            this.eventEmitter.emit('compliance.validation_completed', {
                deliveryId: delivery.id,
                deliveryNumber: delivery.deliveryNumber,
                complianceResult: result,
            });
            this.logger.log(`Compliance validation completed for delivery ${delivery.deliveryNumber}: Score ${complianceScore}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Compliance validation failed for delivery ${delivery.deliveryNumber}:`, error);
            // Return failed validation result
            return {
                isCompliant: false,
                complianceScore: 0,
                validationResults: [{
                        checkType: 'NPA_PERMIT',
                        checkName: 'System Error',
                        status: 'FAILED',
                        details: `Compliance validation system error: ${error.message}`,
                        score: 0,
                        lastChecked: new Date(),
                        checkedBy: 'SYSTEM',
                        ghanaSpecific: false,
                    }],
                missingDocuments: [],
                correctionRequired: ['System error - manual compliance review required'],
                warnings: [],
                recommendations: ['Contact compliance team for manual review'],
                certificationStatus: {
                    npaPermitValid: false,
                    customsEntryValid: false,
                    environmentalPermitValid: false,
                    qualityCertificationValid: false,
                    overallCertificationStatus: 'INVALID',
                },
            };
        }
    }
    /**
     * Validate NPA permit
     */
    async validateNPAPermit(permitNumber, productType, quantity) {
        try {
            this.logger.log(`Validating NPA permit: ${permitNumber}`);
            // Call NPA validation service
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/ghana/npa/permits/${permitNumber}/validate`, {
                params: {
                    productType,
                    quantity,
                    validationDate: new Date().toISOString(),
                },
                timeout: 30000, // 30 second timeout
            }));
            const permitData = response.data;
            // Perform additional validation logic
            const validationDetails = {
                permitExists: !!permitData.exists,
                permitActive: permitData.status === 'ACTIVE',
                permitNotExpired: permitData.expiryDate ? (0, date_fns_1.isAfter)(new Date(permitData.expiryDate), new Date()) : false,
                holderVerified: !!permitData.holderVerified,
                productAuthorized: productType ? permitData.authorizedProducts?.includes(productType) : true,
                volumeWithinLimits: this.checkVolumeLimit(permitData.volumeLimits, productType, quantity),
            };
            const isValid = Object.values(validationDetails).every(Boolean);
            const errors = [];
            const warnings = [];
            // Generate error messages
            if (!validationDetails.permitExists)
                errors.push('Permit not found in NPA database');
            if (!validationDetails.permitActive)
                errors.push('Permit is not active');
            if (!validationDetails.permitNotExpired)
                errors.push('Permit has expired');
            if (!validationDetails.holderVerified)
                errors.push('Permit holder verification failed');
            if (!validationDetails.productAuthorized)
                errors.push(`Product ${productType} not authorized on permit`);
            if (!validationDetails.volumeWithinLimits)
                errors.push('Quantity exceeds permit volume limits');
            // Generate warnings
            if (permitData.expiryDate && (0, date_fns_1.differenceInDays)(new Date(permitData.expiryDate), new Date()) <= 30) {
                warnings.push('Permit expires within 30 days');
            }
            return {
                isValid,
                permitNumber,
                permitType: permitData.permitType || 'TRANSPORT',
                issueDate: new Date(permitData.issueDate),
                expiryDate: new Date(permitData.expiryDate),
                holderName: permitData.holderName,
                productTypes: permitData.authorizedProducts || [],
                volumeLimits: permitData.volumeLimits || {},
                validationDetails,
                errors,
                warnings,
            };
        }
        catch (error) {
            this.logger.error(`NPA permit validation failed for ${permitNumber}:`, error);
            return {
                isValid: false,
                permitNumber,
                permitType: 'TRANSPORT',
                issueDate: new Date(),
                expiryDate: new Date(),
                holderName: 'Unknown',
                productTypes: [],
                volumeLimits: {},
                validationDetails: {
                    permitExists: false,
                    permitActive: false,
                    permitNotExpired: false,
                    holderVerified: false,
                    productAuthorized: false,
                    volumeWithinLimits: false,
                },
                errors: [`NPA validation service error: ${error.message}`],
                warnings: [],
            };
        }
    }
    /**
     * Validate customs entry
     */
    async validateCustomsEntry(entryNumber, productType, quantity) {
        try {
            this.logger.log(`Validating customs entry: ${entryNumber}`);
            // Call Ghana Customs validation service
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/ghana/customs/entries/${entryNumber}/validate`, {
                params: {
                    productType,
                    quantity,
                    validationDate: new Date().toISOString(),
                },
                timeout: 30000,
            }));
            const entryData = response.data;
            const validationDetails = {
                entryExists: !!entryData.exists,
                clearanceCompleted: entryData.status === 'CLEARED',
                dutiesPaid: entryData.dutiesAndTaxesPaid === true,
                documentsComplete: entryData.documentsComplete === true,
                quantityMatches: this.validateQuantityMatch(entryData.declaredQuantity, quantity),
                productClassificationCorrect: this.validateProductClassification(entryData.productCode, productType),
            };
            const isValid = Object.values(validationDetails).every(Boolean);
            const errors = [];
            const warnings = [];
            if (!validationDetails.entryExists)
                errors.push('Customs entry not found');
            if (!validationDetails.clearanceCompleted)
                errors.push('Customs clearance not completed');
            if (!validationDetails.dutiesPaid)
                errors.push('Duties and taxes not fully paid');
            if (!validationDetails.documentsComplete)
                errors.push('Required customs documents incomplete');
            if (!validationDetails.quantityMatches)
                warnings.push('Declared quantity differs from delivery quantity');
            if (!validationDetails.productClassificationCorrect)
                errors.push('Product classification mismatch');
            return {
                isValid,
                entryNumber,
                entryType: entryData.entryType || 'IMPORT',
                declarationDate: new Date(entryData.declarationDate),
                clearanceDate: entryData.clearanceDate ? new Date(entryData.clearanceDate) : undefined,
                dutyPaid: entryData.dutyPaid || 0,
                taxesPaid: entryData.taxesPaid || 0,
                productDetails: entryData.productDetails || [],
                validationDetails,
                errors,
                warnings,
            };
        }
        catch (error) {
            this.logger.error(`Customs entry validation failed for ${entryNumber}:`, error);
            return {
                isValid: false,
                entryNumber,
                entryType: 'IMPORT',
                declarationDate: new Date(),
                dutyPaid: 0,
                taxesPaid: 0,
                productDetails: [],
                validationDetails: {
                    entryExists: false,
                    clearanceCompleted: false,
                    dutiesPaid: false,
                    documentsComplete: false,
                    quantityMatches: false,
                    productClassificationCorrect: false,
                },
                errors: [`Customs validation service error: ${error.message}`],
                warnings: [],
            };
        }
    }
    /**
     * Validate tax calculations
     */
    async validateTaxCalculations(delivery) {
        const calculationDetails = [];
        const discrepancies = [];
        let totalCalculatedTax = 0;
        let totalActualTax = 0;
        let complianceScore = 100;
        // Validate each tax type
        const taxValidations = [
            {
                type: 'PETROLEUM_TAX',
                name: 'Petroleum Tax',
                rate: this.GHANA_TAX_RATES.PETROLEUM_TAX,
                taxableAmount: delivery.totalValue,
                actualAmount: delivery.petroleumTaxAmount,
            },
            {
                type: 'ENERGY_FUND_LEVY',
                name: 'Energy Fund Levy',
                rate: this.GHANA_TAX_RATES.ENERGY_FUND_LEVY,
                taxableAmount: delivery.totalValue,
                actualAmount: delivery.energyFundLevy,
            },
            {
                type: 'ROAD_FUND_LEVY',
                name: 'Road Fund Levy',
                rate: this.GHANA_TAX_RATES.ROAD_FUND_LEVY,
                taxableAmount: delivery.totalValue,
                actualAmount: delivery.roadFundLevy,
            },
            {
                type: 'PRICE_STABILIZATION_LEVY',
                name: 'Price Stabilization Levy',
                rate: this.GHANA_TAX_RATES.PRICE_STABILIZATION_LEVY,
                taxableAmount: delivery.totalValue,
                actualAmount: delivery.priceStabilizationLevy,
            },
            {
                type: 'UPPF_LEVY',
                name: 'UPPF Levy',
                rate: this.GHANA_TAX_RATES.UPPF_LEVY,
                taxableAmount: delivery.quantityLitres, // Per litre
                actualAmount: delivery.unifiedPetroleumPriceFundLevy,
            },
        ];
        for (const validation of taxValidations) {
            const calculatedAmount = new decimal_js_1.Decimal(validation.taxableAmount).mul(validation.rate).toNumber();
            const variance = new decimal_js_1.Decimal(validation.actualAmount).minus(calculatedAmount).toNumber();
            const variancePercentage = calculatedAmount > 0 ? Math.abs(variance / calculatedAmount) * 100 : 0;
            const toleranceLimit = this.TAX_TOLERANCE[validation.type] * 100; // Convert to percentage
            const isWithinTolerance = variancePercentage <= toleranceLimit;
            const detail = {
                taxType: validation.type,
                taxName: validation.name,
                taxRate: validation.rate,
                taxableAmount: validation.taxableAmount,
                calculatedAmount,
                actualAmount: validation.actualAmount,
                variance,
                variancePercentage,
                isWithinTolerance,
                toleranceLimit: toleranceLimit / 100, // Convert back to decimal
                calculationMethod: 'PERCENTAGE_OF_VALUE',
                effectiveDate: new Date(),
                rateSource: 'GHANA_REVENUE_AUTHORITY',
            };
            calculationDetails.push(detail);
            totalCalculatedTax += calculatedAmount;
            totalActualTax += validation.actualAmount;
            // Track discrepancies
            if (!isWithinTolerance) {
                const severity = variancePercentage > 10 ? 'CRITICAL' :
                    variancePercentage > 5 ? 'HIGH' :
                        variancePercentage > 2 ? 'MEDIUM' : 'LOW';
                discrepancies.push({
                    taxType: validation.name,
                    expectedAmount: calculatedAmount,
                    actualAmount: validation.actualAmount,
                    variance,
                    severity,
                    explanation: `Tax calculation variance of ${variancePercentage.toFixed(2)}% exceeds tolerance of ${toleranceLimit}%`,
                    correctionAction: `Recalculate ${validation.name} based on current rate of ${(validation.rate * 100).toFixed(2)}%`,
                });
                // Reduce compliance score based on severity
                const scoreReduction = severity === 'CRITICAL' ? 25 : severity === 'HIGH' ? 15 : severity === 'MEDIUM' ? 10 : 5;
                complianceScore = Math.max(0, complianceScore - scoreReduction);
            }
        }
        return {
            isValid: discrepancies.length === 0,
            calculationDetails,
            totalTaxAmount: totalActualTax,
            discrepancies,
            complianceScore,
        };
    }
    /**
     * Validate environmental compliance
     */
    async validateEnvironmentalCompliance(delivery) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/ghana/environmental/compliance/${delivery.productType}`, {
                params: {
                    quantity: delivery.quantityLitres,
                    location: delivery.deliveryLocation,
                },
                timeout: 15000,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Environmental compliance check failed:', error);
            // Return default compliance status
            return {
                isCompliant: true, // Assume compliant if service unavailable
                environmentalImpactScore: 75,
                permits: [],
                assessments: [],
                violations: [],
                mitigationMeasures: [],
            };
        }
    }
    /**
     * Validate quality standards
     */
    async validateQualityStandards(delivery) {
        const isCompliant = !!(delivery.qualityCertificateUrl || delivery.netStandardVolume);
        return {
            isCompliant,
            standardsApplicable: await this.getApplicableQualityStandards(delivery.productType),
            testResults: [],
            certifications: [],
            nonConformances: [],
        };
    }
    /**
     * Check UPPF eligibility
     */
    async checkUPPFEligibility(customerId, productType, quantity) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/ghana/uppf/eligibility/${customerId}`, {
                params: {
                    productType,
                    quantity,
                },
                timeout: 15000,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('UPPF eligibility check failed:', error);
            return {
                isEligible: false,
                eligibilityDetails: {
                    dealerRegistered: false,
                    licenseValid: false,
                    complianceHistoryGood: false,
                    volumeEligible: false,
                    priceComplianceGood: false,
                    geographicEligibility: false,
                },
                claimableAmount: 0,
                restrictions: ['UPPF service unavailable'],
                nextReviewDate: (0, date_fns_1.addDays)(new Date(), 30),
            };
        }
    }
    // Private helper methods
    checkVolumeLimit(volumeLimits, productType, quantity) {
        if (!productType || !quantity || !volumeLimits)
            return true;
        const limit = volumeLimits[productType];
        return !limit || quantity <= limit;
    }
    validateQuantityMatch(declaredQuantity, actualQuantity) {
        if (!declaredQuantity || !actualQuantity)
            return true;
        const tolerance = 0.05; // 5% tolerance
        const variance = Math.abs(declaredQuantity - actualQuantity) / declaredQuantity;
        return variance <= tolerance;
    }
    validateProductClassification(declaredProductCode, actualProductType) {
        if (!declaredProductCode || !actualProductType)
            return true;
        const productCodes = {
            'PMS': ['2710.12.11', '2710.12.19'],
            'AGO': ['2710.20.11', '2710.20.19'],
            'IFO': ['2710.20.31', '2710.20.39'],
            'LPG': ['2711.12.00', '2711.13.00'],
            'KEROSENE': ['2710.19.11', '2710.19.19'],
            'LUBRICANTS': ['2710.19.99', '2710.20.90'],
        };
        return productCodes[actualProductType]?.includes(declaredProductCode) || false;
    }
    async getApplicableQualityStandards(productType) {
        const ghanaStandards = [
            {
                standardId: 'GS_304',
                standardName: 'Ghana Standard GS 304 - Automotive Gasoline',
                applicableProducts: ['PMS'],
                parameters: [
                    { parameterName: 'Octane Rating (RON)', specification: 'Min 91.0', minimumValue: 91.0, testMethod: 'ASTM D2699', frequency: 'Every batch', criticality: 'CRITICAL' },
                    { parameterName: 'Lead Content', specification: 'Max 0.005 g/L', maximumValue: 0.005, testMethod: 'ASTM D3237', frequency: 'Every batch', criticality: 'CRITICAL' },
                    { parameterName: 'Sulphur Content', specification: 'Max 150 mg/kg', maximumValue: 150, testMethod: 'ASTM D4294', frequency: 'Every batch', criticality: 'HIGH' },
                ],
                isGhanaSpecific: true,
                regulatoryBody: 'Ghana Standards Authority',
            },
            {
                standardId: 'GS_69',
                standardName: 'Ghana Standard GS 69 - Automotive Gas Oil (Diesel)',
                applicableProducts: ['AGO'],
                parameters: [
                    { parameterName: 'Cetane Number', specification: 'Min 48.0', minimumValue: 48.0, testMethod: 'ASTM D613', frequency: 'Every batch', criticality: 'CRITICAL' },
                    { parameterName: 'Sulphur Content', specification: 'Max 500 mg/kg', maximumValue: 500, testMethod: 'ASTM D4294', frequency: 'Every batch', criticality: 'HIGH' },
                    { parameterName: 'Water Content', specification: 'Max 200 mg/kg', maximumValue: 200, testMethod: 'ASTM D6304', frequency: 'Every batch', criticality: 'MEDIUM' },
                ],
                isGhanaSpecific: true,
                regulatoryBody: 'Ghana Standards Authority',
            },
        ];
        return ghanaStandards.filter(standard => standard.applicableProducts.includes(productType));
    }
    mapNPAValidationToCheckResult(npaResult) {
        return {
            checkType: 'NPA_PERMIT',
            checkName: 'NPA Permit Validation',
            status: npaResult.isValid ? 'PASSED' : 'FAILED',
            details: npaResult.isValid ?
                `Valid permit ${npaResult.permitNumber} until ${npaResult.expiryDate.toDateString()}` :
                npaResult.errors.join('; '),
            score: npaResult.isValid ? 100 : 0,
            evidence: npaResult.isValid ? [npaResult.permitNumber] : [],
            correctionActions: npaResult.errors.map(error => `Resolve: ${error}`),
            validUntil: npaResult.expiryDate,
            lastChecked: new Date(),
            checkedBy: 'NPA_SERVICE',
            ghanaSpecific: true,
        };
    }
    mapCustomsValidationToCheckResult(customsResult) {
        return {
            checkType: 'CUSTOMS_ENTRY',
            checkName: 'Customs Entry Validation',
            status: customsResult.isValid ? 'PASSED' : 'FAILED',
            details: customsResult.isValid ?
                `Valid customs entry ${customsResult.entryNumber}` :
                customsResult.errors.join('; '),
            score: customsResult.isValid ? 100 : 0,
            evidence: customsResult.isValid ? [customsResult.entryNumber] : [],
            correctionActions: customsResult.errors.map(error => `Resolve: ${error}`),
            lastChecked: new Date(),
            checkedBy: 'CUSTOMS_SERVICE',
            ghanaSpecific: true,
        };
    }
    mapTaxValidationToCheckResult(taxResult) {
        return {
            checkType: 'TAX_CALCULATION',
            checkName: 'Tax Calculation Validation',
            status: taxResult.isValid ? 'PASSED' : 'FAILED',
            details: taxResult.isValid ?
                'All tax calculations within tolerance' :
                `${taxResult.discrepancies.length} tax calculation discrepancies found`,
            score: taxResult.complianceScore,
            correctionActions: taxResult.discrepancies.map(disc => disc.correctionAction),
            lastChecked: new Date(),
            checkedBy: 'TAX_CALCULATION_ENGINE',
            ghanaSpecific: true,
        };
    }
    mapEnvironmentalToCheckResult(envResult) {
        return {
            checkType: 'ENVIRONMENTAL',
            checkName: 'Environmental Compliance Check',
            status: envResult.isCompliant ? 'PASSED' : 'WARNING',
            details: `Environmental impact score: ${envResult.environmentalImpactScore}`,
            score: envResult.environmentalImpactScore,
            lastChecked: new Date(),
            checkedBy: 'ENVIRONMENTAL_SERVICE',
            ghanaSpecific: true,
        };
    }
    mapQualityToCheckResult(qualityResult) {
        return {
            checkType: 'QUALITY_STANDARD',
            checkName: 'Quality Standards Compliance',
            status: qualityResult.isCompliant ? 'PASSED' : 'WARNING',
            details: qualityResult.isCompliant ?
                'Quality standards met' :
                `${qualityResult.nonConformances.length} non-conformances found`,
            score: qualityResult.isCompliant ? 100 : 75,
            lastChecked: new Date(),
            checkedBy: 'QUALITY_SYSTEM',
            ghanaSpecific: true,
        };
    }
    mapUPPFToCheckResult(uppfResult) {
        return {
            checkType: 'UPPF_ELIGIBILITY',
            checkName: 'UPPF Eligibility Check',
            status: uppfResult.isEligible ? 'PASSED' : 'NOT_APPLICABLE',
            details: uppfResult.isEligible ?
                `Eligible for GHS ${uppfResult.claimableAmount.toFixed(2)} UPPF claim` :
                `Not eligible: ${uppfResult.restrictions.join(', ')}`,
            score: uppfResult.isEligible ? 100 : 50,
            lastChecked: new Date(),
            checkedBy: 'UPPF_SERVICE',
            ghanaSpecific: true,
        };
    }
    assessCertificationStatus(validationResults) {
        const npaResult = validationResults.find(r => r.checkType === 'NPA_PERMIT');
        const customsResult = validationResults.find(r => r.checkType === 'CUSTOMS_ENTRY');
        const envResult = validationResults.find(r => r.checkType === 'ENVIRONMENTAL');
        const qualityResult = validationResults.find(r => r.checkType === 'QUALITY_STANDARD');
        const npaValid = npaResult?.status === 'PASSED';
        const customsValid = customsResult?.status === 'PASSED';
        const envValid = envResult?.status === 'PASSED' || envResult?.status === 'WARNING';
        const qualityValid = qualityResult?.status === 'PASSED' || qualityResult?.status === 'WARNING';
        let overallStatus;
        if (npaValid && customsValid && envValid && qualityValid) {
            // Check if any certificates are expiring soon
            const hasExpiringCerts = validationResults.some(r => r.validUntil && (0, date_fns_1.differenceInDays)(r.validUntil, new Date()) <= 30);
            overallStatus = hasExpiringCerts ? 'EXPIRING_SOON' : 'VALID';
        }
        else {
            overallStatus = 'INVALID';
        }
        return {
            npaPermitValid: npaValid,
            npaPermitExpiry: npaResult?.validUntil,
            customsEntryValid: customsValid,
            customsEntryExpiry: customsResult?.validUntil,
            environmentalPermitValid: envValid,
            environmentalPermitExpiry: envResult?.validUntil,
            qualityCertificationValid: qualityValid,
            qualityCertificationExpiry: qualityResult?.validUntil,
            overallCertificationStatus: overallStatus,
        };
    }
    generateComplianceRecommendations(validationResults) {
        const recommendations = [];
        for (const result of validationResults) {
            if (result.status === 'FAILED') {
                recommendations.push(`Address ${result.checkName} failures before proceeding`);
            }
            else if (result.status === 'WARNING') {
                recommendations.push(`Review ${result.checkName} warnings and take preventive action`);
            }
            if (result.validUntil && (0, date_fns_1.differenceInDays)(result.validUntil, new Date()) <= 60) {
                recommendations.push(`Renew ${result.checkName} certification before ${result.validUntil.toDateString()}`);
            }
            if (result.score < 90) {
                recommendations.push(`Improve ${result.checkName} compliance score (currently ${result.score}%)`);
            }
        }
        // Add general recommendations
        recommendations.push('Implement regular compliance monitoring and review processes');
        recommendations.push('Maintain up-to-date documentation for all Ghana regulatory requirements');
        recommendations.push('Establish automated alerts for permit and certificate expiry dates');
        return [...new Set(recommendations)]; // Remove duplicates
    }
};
exports.GhanaComplianceService = GhanaComplianceService;
exports.GhanaComplianceService = GhanaComplianceService = GhanaComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, event_emitter_1.EventEmitter2])
], GhanaComplianceService);
//# sourceMappingURL=ghana-compliance.service.js.map