import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
interface UppfClaim {
    claimId: string;
    claimNumber: string;
    windowId: string;
    consignmentId: string;
    routeId: string;
    kmBeyondEqualisation: number;
    litresMoved: number;
    tariffPerLitreKm: number;
    claimAmount: number;
    status: string;
    evidenceLinks?: any;
    threeWayReconciled: boolean;
    submissionDate?: Date;
    submissionRef?: string;
    npaResponseDate?: Date;
    npaResponseRef?: string;
    settlementDate?: Date;
    settlementAmount?: number;
    varianceAmount?: number;
    varianceReason?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
}
interface ThreeWayReconciliation {
    reconciliationId: string;
    consignmentId: string;
    depotLoadedLitres: number;
    depotDocumentRef: string;
    transporterDeliveredLitres: number;
    transporterDocumentRef: string;
    stationReceivedLitres: number;
    stationDocumentRef: string;
    varianceDepotTransporter?: number;
    varianceTransporterStation?: number;
    varianceDepotStation?: number;
    reconciliationStatus: string;
    reconciledBy?: string;
    reconciledAt?: Date;
    notes?: string;
    createdAt: Date;
}
export interface CreateUppfClaimDto {
    consignmentId: string;
    routeId: string;
    windowId: string;
    litresMoved: number;
    tariffPerLitreKm?: number;
    evidenceLinks?: any;
    createdBy: string;
}
export interface UppfClaimSummary {
    totalClaims: number;
    totalClaimAmount: number;
    totalSettledAmount: number;
    totalVarianceAmount: number;
    claimsByStatus: {
        [status: string]: number;
    };
    averageSettlementDays: number;
    settlementRate: number;
}
export interface UPPFPricingComponent {
    componentId: string;
    componentName: string;
    componentType: 'LEVY' | 'FUND' | 'TAX' | 'MARGIN';
    calculationMethod: 'PER_LITRE' | 'PERCENTAGE' | 'FIXED';
    baseRate: number;
    adjustmentFactors: PricingAdjustmentFactor[];
    applicableProducts: string[];
    geographicScope: string[];
    effectiveDate: Date;
    expiryDate?: Date;
    npaApproved: boolean;
    lastReviewDate: Date;
    nextReviewDate: Date;
}
export interface PricingAdjustmentFactor {
    factorType: 'ROUTE_COMPLEXITY' | 'PRODUCT_CATEGORY' | 'VOLUME_TIER' | 'SEASONAL' | 'COMPLIANCE_BONUS';
    factorName: string;
    multiplier: number;
    conditions: string[];
    isActive: boolean;
}
export interface PriceBuildup {
    productType: string;
    pricingWindow: string;
    basePrice: number;
    components: PriceBuildupComponent[];
    totalPrice: number;
    uppfComponent: UPPFPricingComponent;
    dealerMargin: number;
    omcMargin: number;
    calculationDate: Date;
    approvalStatus: string;
    varianceFromPrevious: number;
}
export interface PriceBuildupComponent {
    componentCode: string;
    componentName: string;
    amount: number;
    calculationBasis: string;
    sourceDocument: string;
    approvalReference: string;
}
export interface UPPFLevyCalculation {
    productType: string;
    volumeLitres: number;
    baseUppfRate: number;
    adjustedUppfRate: number;
    adjustmentFactors: {
        routeComplexity: number;
        productCategory: number;
        volumeTier: number;
        complianceBonus: number;
    };
    totalUppfLevy: number;
    claimableAmount: number;
    nonClaimableAmount: number;
    calculationBreakdown: any;
}
export interface AutomaticPricingIntegration {
    enabled: boolean;
    updateFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    npaDataSource: string;
    validationRules: PricingValidationRule[];
    alertThresholds: PricingAlertThreshold[];
    fallbackMechanism: FallbackMechanism;
}
export interface PricingValidationRule {
    ruleId: string;
    ruleName: string;
    ruleType: 'VARIANCE_CHECK' | 'APPROVAL_REQUIRED' | 'HISTORICAL_COMPARISON' | 'MARKET_BENCHMARK';
    parameters: any;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    autoCorrect: boolean;
}
export interface PricingAlertThreshold {
    thresholdType: 'VARIANCE_PERCENT' | 'ABSOLUTE_CHANGE' | 'VOLUME_IMPACT';
    thresholdValue: number;
    alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    notificationChannels: string[];
}
export interface FallbackMechanism {
    useHistoricalData: boolean;
    useMarketAverage: boolean;
    manualOverride: boolean;
    emergencyContact: string[];
}
export interface ThreeWayReconciliationDto {
    consignmentId: string;
    depotLoadedLitres: number;
    depotDocumentRef: string;
    transporterDeliveredLitres: number;
    transporterDocumentRef: string;
    stationReceivedLitres: number;
    stationDocumentRef: string;
    notes?: string;
}
export declare class UppfClaimsService {
    private readonly eventEmitter;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly UPPF_PRICING_CONFIG;
    private pricingIntegration;
    constructor(eventEmitter: EventEmitter2, httpService: HttpService, configService: ConfigService);
    private initializePricingIntegration;
    /**
     * Calculate UPPF levy with enhanced price build-up integration
     */
    calculateUPPFLevy(params: {
        productType: string;
        volumeLitres: number;
        routeComplexity: string;
        deliveryDate: Date;
        customPricingWindow?: string;
    }): Promise<UPPFLevyCalculation>;
    /**
     * Generate comprehensive price build-up with UPPF integration
     */
    generatePriceBuildup(params: {
        productType: string;
        pricingWindow?: string;
        includeProjections?: boolean;
        validationLevel?: 'BASIC' | 'ENHANCED' | 'COMPREHENSIVE';
    }): Promise<PriceBuildup>;
    /**
     * Automatically sync UPPF rates from NPA data sources
     */
    syncUPPFRatesFromNPA(): Promise<void>;
    /**
     * Create a new UPPF claim with automatic calculation (Enhanced)
     */
    createUppfClaim(dto: CreateUppfClaimDto): Promise<UppfClaim>;
    /**
     * Process three-way reconciliation for a delivery consignment
     */
    processThreeWayReconciliation(dto: ThreeWayReconciliationDto): Promise<ThreeWayReconciliation>;
    /**
     * Submit UPPF claims to NPA for a pricing window
     */
    submitClaimsToNpa(windowId: string, submittedBy: string, claimIds?: string[]): Promise<{
        submissionReference: string;
        totalClaims: number;
        totalAmount: number;
        submissionDate: Date;
    }>;
    /**
     * Process NPA response for submitted claims
     */
    processNpaResponse(submissionReference: string, responseData: {
        responseReference: string;
        responseStatus: string;
        approvedClaims: Array<{
            claimNumber: string;
            approvedAmount: number;
            settlementDate: Date;
        }>;
        rejectedClaims: Array<{
            claimNumber: string;
            rejectionReason: string;
        }>;
    }): Promise<void>;
    /**
     * Get UPPF claims summary for a pricing window
     */
    getClaimsSummary(windowId: string): Promise<UppfClaimSummary>;
    /**
     * Generate claims report for a specific period
     */
    generateClaimsReport(startDate: Date, endDate: Date, format?: 'summary' | 'detailed'): Promise<any>;
    private getConsignmentById;
    private getEqualisationPointById;
    private getThreeWayReconciliation;
    private generateClaimNumber;
    private generateUUID;
    private saveClaim;
    private saveReconciliation;
    private checkAutoCreateUppfClaim;
    private getClaimsForSubmission;
    private generateSubmissionReference;
    private updateClaimsStatus;
    private createNpaSubmissionRecord;
    private getClaimByNumber;
    private updateClaimStatus;
    private createAccountingEntry;
    private updateNpaSubmissionStatus;
    private getClaimsByWindow;
    private getClaimsInDateRange;
    private groupClaimsByWindow;
    private groupClaimsByStatus;
    private getTopRoutesByClaimsValue;
    private calculatePerformanceMetrics;
    private formatClaimForReport;
    private getCurrentUPPFComponent;
    private calculateVolumeTierFactor;
    private calculateComplianceBonus;
    private getClaimablePercentage;
    private getActivePricingWindow;
    private getAllPricingComponents;
    private getBasePrice;
    private calculateComponentAmount;
    private getDealerMargin;
    private getOMCMargin;
    private getPreviousPrice;
    private validatePriceBuildup;
    private applyPricingValidationRule;
    private determineApprovalStatus;
    private storePriceBuildup;
    private fetchNPAPricingData;
    private validateNPAData;
    private updateUPPFComponent;
    private generateRateChangeSummary;
    private checkAlertThresholds;
    private triggerAlert;
    private applyFallbackMechanism;
    private useHistoricalRates;
    private requestManualIntervention;
    private notifySyncFailure;
    private getComplianceScore;
}
export {};
//# sourceMappingURL=uppf-claims.service.d.ts.map