import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyDelivery, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';
export interface GhanaComplianceValidationResult {
    isCompliant: boolean;
    complianceScore: number;
    validationResults: ComplianceCheckResult[];
    missingDocuments: string[];
    correctionRequired: string[];
    warnings: string[];
    recommendations: string[];
    nextValidationDate?: Date;
    certificationStatus: CertificationStatus;
}
export interface ComplianceCheckResult {
    checkType: 'NPA_PERMIT' | 'CUSTOMS_ENTRY' | 'TAX_CALCULATION' | 'ENVIRONMENTAL' | 'QUALITY_STANDARD' | 'UPPF_ELIGIBILITY' | 'DEALER_LICENSE';
    checkName: string;
    status: 'PASSED' | 'FAILED' | 'WARNING' | 'NOT_APPLICABLE';
    details: string;
    score: number;
    evidence?: string[];
    correctionActions?: string[];
    validUntil?: Date;
    lastChecked: Date;
    checkedBy: string;
    ghanaSpecific: boolean;
}
export interface CertificationStatus {
    npaPermitValid: boolean;
    npaPermitExpiry?: Date;
    customsEntryValid: boolean;
    customsEntryExpiry?: Date;
    environmentalPermitValid: boolean;
    environmentalPermitExpiry?: Date;
    qualityCertificationValid: boolean;
    qualityCertificationExpiry?: Date;
    overallCertificationStatus: 'VALID' | 'EXPIRED' | 'EXPIRING_SOON' | 'INVALID';
}
export interface NPAPermitValidation {
    isValid: boolean;
    permitNumber: string;
    permitType: 'TRANSPORT' | 'STORAGE' | 'RETAIL' | 'WHOLESALE' | 'BULK_BREAKING';
    issueDate: Date;
    expiryDate: Date;
    holderName: string;
    productTypes: ProductGrade[];
    volumeLimits: {
        [key in ProductGrade]?: number;
    };
    validationDetails: {
        permitExists: boolean;
        permitActive: boolean;
        permitNotExpired: boolean;
        holderVerified: boolean;
        productAuthorized: boolean;
        volumeWithinLimits: boolean;
    };
    errors: string[];
    warnings: string[];
}
export interface CustomsEntryValidation {
    isValid: boolean;
    entryNumber: string;
    entryType: 'IMPORT' | 'EXPORT' | 'TRANSIT' | 'TEMPORARY_ADMISSION';
    declarationDate: Date;
    clearanceDate?: Date;
    dutyPaid: number;
    taxesPaid: number;
    productDetails: CustomsProductDetail[];
    validationDetails: {
        entryExists: boolean;
        clearanceCompleted: boolean;
        dutiesPaid: boolean;
        documentsComplete: boolean;
        quantityMatches: boolean;
        productClassificationCorrect: boolean;
    };
    errors: string[];
    warnings: string[];
}
export interface CustomsProductDetail {
    productCode: string;
    productDescription: string;
    harmonizedCode: string;
    quantity: number;
    unitOfMeasure: string;
    unitValue: number;
    totalValue: number;
    dutyRate: number;
    dutyAmount: number;
    taxAmount: number;
    originCountry: string;
}
export interface TaxCalculationValidation {
    isValid: boolean;
    calculationDetails: TaxCalculationDetail[];
    totalTaxAmount: number;
    discrepancies: TaxDiscrepancy[];
    complianceScore: number;
}
export interface TaxCalculationDetail {
    taxType: 'PETROLEUM_TAX' | 'ENERGY_FUND_LEVY' | 'ROAD_FUND_LEVY' | 'PRICE_STABILIZATION_LEVY' | 'UPPF_LEVY' | 'VAT' | 'WITHHOLDING_TAX' | 'CUSTOMS_DUTY';
    taxName: string;
    taxRate: number;
    taxableAmount: number;
    calculatedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    isWithinTolerance: boolean;
    toleranceLimit: number;
    calculationMethod: string;
    effectiveDate: Date;
    rateSource: string;
}
export interface TaxDiscrepancy {
    taxType: string;
    expectedAmount: number;
    actualAmount: number;
    variance: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    explanation: string;
    correctionAction: string;
}
export interface EnvironmentalCompliance {
    isCompliant: boolean;
    environmentalImpactScore: number;
    permits: EnvironmentalPermit[];
    assessments: EnvironmentalAssessment[];
    violations: EnvironmentalViolation[];
    mitigationMeasures: string[];
}
export interface EnvironmentalPermit {
    permitId: string;
    permitType: 'ENVIRONMENTAL_IMPACT' | 'WASTE_DISPOSAL' | 'AIR_EMISSION' | 'WATER_DISCHARGE';
    issueDate: Date;
    expiryDate: Date;
    status: 'VALID' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
    conditions: string[];
    monitoringRequirements: string[];
}
export interface EnvironmentalAssessment {
    assessmentId: string;
    assessmentType: 'AIR_QUALITY' | 'WATER_QUALITY' | 'SOIL_CONTAMINATION' | 'NOISE_POLLUTION';
    assessmentDate: Date;
    results: {
        [parameter: string]: number;
    };
    limits: {
        [parameter: string]: number;
    };
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'MARGINAL';
    nextAssessmentDue: Date;
}
export interface EnvironmentalViolation {
    violationId: string;
    violationType: string;
    violationDate: Date;
    severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
    description: string;
    correctionDeadline: Date;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
    fineAmount?: number;
}
export interface QualityStandardCompliance {
    isCompliant: boolean;
    standardsApplicable: QualityStandard[];
    testResults: QualityTestResult[];
    certifications: QualityCertification[];
    nonConformances: QualityNonConformance[];
}
export interface QualityStandard {
    standardId: string;
    standardName: string;
    applicableProducts: ProductGrade[];
    parameters: QualityParameter[];
    isGhanaSpecific: boolean;
    regulatoryBody: string;
}
export interface QualityParameter {
    parameterName: string;
    specification: string;
    minimumValue?: number;
    maximumValue?: number;
    testMethod: string;
    frequency: string;
    criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface QualityTestResult {
    testId: string;
    testDate: Date;
    productType: ProductGrade;
    parameterResults: {
        [parameter: string]: number;
    };
    overallResult: 'PASS' | 'FAIL' | 'MARGINAL';
    certificateNumber?: string;
    testLaboratory: string;
    validityPeriod: number;
}
export interface QualityCertification {
    certificationId: string;
    certificationType: 'PRODUCT_QUALITY' | 'PROCESS_QUALITY' | 'LABORATORY_ACCREDITATION';
    issueDate: Date;
    expiryDate: Date;
    status: 'VALID' | 'EXPIRED' | 'SUSPENDED';
    certifyingBody: string;
    scope: string[];
}
export interface QualityNonConformance {
    nonConformanceId: string;
    detectionDate: Date;
    productType: ProductGrade;
    parameter: string;
    specificationLimit: number;
    actualValue: number;
    severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
    rootCause?: string;
    correctionAction: string;
    preventiveAction: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    closureDate?: Date;
}
export interface UPPFEligibilityCheck {
    isEligible: boolean;
    eligibilityDetails: {
        dealerRegistered: boolean;
        licenseValid: boolean;
        complianceHistoryGood: boolean;
        volumeEligible: boolean;
        priceComplianceGood: boolean;
        geographicEligibility: boolean;
    };
    claimableAmount: number;
    restrictions: string[];
    nextReviewDate: Date;
}
export declare class GhanaComplianceService {
    private readonly httpService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly GHANA_TAX_RATES;
    private readonly TAX_TOLERANCE;
    constructor(httpService: HttpService, eventEmitter: EventEmitter2);
    /**
     * Comprehensive compliance validation for delivery
     */
    validateDeliveryCompliance(delivery: DailyDelivery): Promise<GhanaComplianceValidationResult>;
    /**
     * Validate NPA permit
     */
    validateNPAPermit(permitNumber: string, productType?: ProductGrade, quantity?: number): Promise<NPAPermitValidation>;
    /**
     * Validate customs entry
     */
    validateCustomsEntry(entryNumber: string, productType?: ProductGrade, quantity?: number): Promise<CustomsEntryValidation>;
    /**
     * Validate tax calculations
     */
    validateTaxCalculations(delivery: DailyDelivery): Promise<TaxCalculationValidation>;
    /**
     * Validate environmental compliance
     */
    validateEnvironmentalCompliance(delivery: DailyDelivery): Promise<EnvironmentalCompliance>;
    /**
     * Validate quality standards
     */
    validateQualityStandards(delivery: DailyDelivery): Promise<QualityStandardCompliance>;
    /**
     * Check UPPF eligibility
     */
    checkUPPFEligibility(customerId: string, productType: ProductGrade, quantity: number): Promise<UPPFEligibilityCheck>;
    private checkVolumeLimit;
    private validateQuantityMatch;
    private validateProductClassification;
    private getApplicableQualityStandards;
    private mapNPAValidationToCheckResult;
    private mapCustomsValidationToCheckResult;
    private mapTaxValidationToCheckResult;
    private mapEnvironmentalToCheckResult;
    private mapQualityToCheckResult;
    private mapUPPFToCheckResult;
    private assessCertificationStatus;
    private generateComplianceRecommendations;
}
//# sourceMappingURL=ghana-compliance.service.d.ts.map