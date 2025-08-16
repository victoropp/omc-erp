import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { DailyDelivery, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';
export interface UPPFClaimRequest {
    claimPeriod: {
        startDate: Date;
        endDate: Date;
    };
    dealerId: string;
    deliveryIds: string[];
    claimType: 'MONTHLY' | 'QUARTERLY' | 'INDIVIDUAL';
    totalEligibleVolume: number;
    totalClaimAmount: number;
    supportingDocuments: string[];
    submittedBy: string;
    urgentProcessing?: boolean;
    notes?: string;
}
export interface UPPFClaimResult {
    claimId: string;
    claimNumber: string;
    submissionDate: Date;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
    claimAmount: number;
    approvedAmount?: number;
    rejectionReason?: string;
    expectedPaymentDate?: Date;
    actualPaymentDate?: Date;
    processingTime: number;
    supportingDocuments: ClaimDocument[];
}
export interface ClaimDocument {
    documentId: string;
    documentType: 'DELIVERY_RECEIPT' | 'BILL_OF_LADING' | 'QUALITY_CERTIFICATE' | 'DEALER_LICENSE' | 'NPA_PERMIT' | 'PUMP_PRICE_EVIDENCE' | 'OTHER';
    fileName: string;
    uploadDate: Date;
    url: string;
    isRequired: boolean;
    validationStatus: 'PENDING' | 'VALID' | 'INVALID' | 'MISSING';
}
export interface UPPFEligibilityAssessment {
    dealerId: string;
    dealerName: string;
    assessmentDate: Date;
    overallEligible: boolean;
    eligibilityScore: number;
    eligibilityCriteria: EligibilityCriteria[];
    disqualifications: string[];
    conditionalRequirements: string[];
    nextReviewDate: Date;
    maximumClaimPerMonth: number;
    geographicRestrictions: string[];
}
export interface EligibilityCriteria {
    criteriaType: 'DEALER_REGISTRATION' | 'LICENSE_VALIDITY' | 'COMPLIANCE_HISTORY' | 'VOLUME_THRESHOLD' | 'PRICE_COMPLIANCE' | 'GEOGRAPHIC_LOCATION' | 'PAYMENT_HISTORY';
    criteriaName: string;
    status: 'MET' | 'NOT_MET' | 'PARTIAL' | 'UNDER_REVIEW';
    details: string;
    score: number;
    evidence?: string[];
    correctionActions?: string[];
    nextVerificationDate?: Date;
}
export interface DealerMarginStructure {
    dealerId: string;
    dealerName: string;
    effectiveDate: Date;
    expiryDate?: Date;
    marginStructure: {
        primaryDistribution: MarginComponent;
        marketing: MarginComponent;
        dealer: MarginComponent;
        uppfContribution: MarginComponent;
    };
    geographicZone: 'GREATER_ACCRA' | 'ASHANTI' | 'NORTHERN' | 'WESTERN' | 'EASTERN' | 'CENTRAL' | 'VOLTA' | 'BRONG_AHAFO' | 'UPPER_EAST' | 'UPPER_WEST';
    dealerCategory: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'RURAL' | 'URBAN' | 'HIGHWAY';
    specialConditions: string[];
    lastReviewDate: Date;
    nextReviewDate: Date;
}
export interface MarginComponent {
    componentName: string;
    amountPerLitre: number;
    percentage?: number;
    currency: string;
    taxable: boolean;
    uppfEligible: boolean;
    calculationBasis: 'PER_LITRE' | 'PERCENTAGE_OF_PRICE' | 'FIXED_AMOUNT';
    conditions: string[];
}
export interface UPPFPaymentRecord {
    paymentId: string;
    claimId: string;
    dealerId: string;
    paymentDate: Date;
    paymentAmount: number;
    paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'MOBILE_MONEY' | 'DIRECT_DEBIT';
    paymentReference: string;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        sortCode: string;
    };
    paymentStatus: 'PENDING' | 'PROCESSED' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    failureReason?: string;
    taxWithheld?: number;
    netPaymentAmount: number;
    paymentAdviceUrl?: string;
}
export interface UPPFStatistics {
    period: {
        startDate: Date;
        endDate: Date;
    };
    totalClaims: number;
    totalClaimAmount: number;
    totalPaid: number;
    averageProcessingDays: number;
    claimsByStatus: {
        [status: string]: number;
    };
    topDealersByClaim: DealerClaimSummary[];
    productDistribution: ProductClaimSummary[];
    regionalDistribution: RegionalClaimSummary[];
    monthlyTrends: MonthlyClaimTrend[];
}
export interface DealerClaimSummary {
    dealerId: string;
    dealerName: string;
    totalClaims: number;
    totalAmount: number;
    averageClaimAmount: number;
    successRate: number;
    lastClaimDate: Date;
}
export interface ProductClaimSummary {
    productType: ProductGrade;
    totalVolume: number;
    totalClaims: number;
    totalAmount: number;
    averageMarginPerLitre: number;
}
export interface RegionalClaimSummary {
    region: string;
    dealerCount: number;
    totalClaims: number;
    totalAmount: number;
    averageClaimPerDealer: number;
}
export interface MonthlyClaimTrend {
    month: string;
    year: number;
    totalClaims: number;
    totalAmount: number;
    averageProcessingDays: number;
    successRate: number;
}
export interface PumpPriceValidation {
    validationId: string;
    dealerId: string;
    stationLocation: string;
    productType: ProductGrade;
    validationDate: Date;
    regulatedPrice: number;
    actualSellingPrice: number;
    variance: number;
    variancePercentage: number;
    isCompliant: boolean;
    toleranceLimit: number;
    validationMethod: 'MANUAL_INSPECTION' | 'DIGITAL_MONITORING' | 'CUSTOMER_REPORT' | 'AUTOMATED_SYSTEM';
    inspector?: string;
    photographic_evidence?: string[];
    correctionRequired: boolean;
    correctionDeadline?: Date;
    penaltyApplicable: boolean;
    penaltyAmount?: number;
}
export declare class UPPFIntegrationService {
    private readonly deliveryRepository;
    private readonly dataSource;
    private readonly httpService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly UPPF_RATES;
    private readonly ZONE_MULTIPLIERS;
    constructor(deliveryRepository: Repository<DailyDelivery>, dataSource: DataSource, httpService: HttpService, eventEmitter: EventEmitter2);
    /**
     * Assess dealer eligibility for UPPF claims
     */
    assessDealerEligibility(dealerId: string): Promise<UPPFEligibilityAssessment>;
    /**
     * Submit UPPF claim
     */
    submitUPPFClaim(request: UPPFClaimRequest): Promise<UPPFClaimResult>;
    /**
     * Get dealer margin structure
     */
    getDealerMarginStructure(dealerId: string): Promise<DealerMarginStructure>;
    /**
     * Validate pump prices
     */
    validatePumpPrices(dealerId: string, productType: ProductGrade, reportedPrice: number): Promise<PumpPriceValidation>;
    /**
     * Get UPPF statistics
     */
    getUPPFStatistics(startDate: Date, endDate: Date): Promise<UPPFStatistics>;
    /**
     * Process monthly UPPF claims for all eligible dealers
     */
    processMonthlyUPPFClaims(month: Date, forceProcess?: boolean): Promise<{
        totalProcessed: number;
        totalSuccessful: number;
        totalFailed: number;
        totalAmount: number;
        results: Array<{
            dealerId: string;
            success: boolean;
            claimId?: string;
            error?: string;
            amount?: number;
        }>;
    }>;
    private getDealerInfo;
    private checkDealerRegistration;
    private checkDealerLicense;
    private checkComplianceHistory;
    private checkVolumeThreshold;
    private checkPriceCompliance;
    private checkGeographicEligibility;
    private checkPaymentHistory;
    private calculateMaximumClaim;
    private validateDeliveriesForClaim;
    private calculateClaimAmount;
    private generateClaimNumber;
    private prepareSupportingDocuments;
    private submitToUPPFSystem;
    private updateDeliveriesWithClaim;
    private storeEligibilityAssessment;
    private storeClaimRecord;
    private getDefaultMarginStructure;
    private getEligibleDealers;
    private getMonthlyDeliveries;
    private claimsRepository;
}
//# sourceMappingURL=uppf-integration.service.d.ts.map