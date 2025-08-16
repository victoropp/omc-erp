import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface UPPFClaimCalculation {
    routeId: string;
    depotId: string;
    stationId: string;
    productType: string;
    litresMoved: number;
    kmActual: number;
    kmPlanned: number;
    equalisationKm: number;
    kmBeyondEqualisation: number;
    uppfTariff: number;
    claimAmount: number;
    gpsValidated: boolean;
    threeWayReconciled: boolean;
    evidenceScore: number;
}
export interface EnhancedGPSValidation {
    isValid: boolean;
    confidence: number;
    anomalies: GPSAnomaly[];
    routeEfficiency: number;
    fuelConsumptionAnalysis: FuelAnalysis;
    timeAnalysis: TimeAnalysis;
    speedAnalysis: SpeedAnalysis;
    geofenceViolations: GeofenceViolation[];
}
export interface GPSAnomaly {
    type: 'ROUTE_DEVIATION' | 'SPEED_VIOLATION' | 'STOP_DURATION' | 'FUEL_DISCREPANCY' | 'TIME_ANOMALY' | 'GEOFENCE_VIOLATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    location: {
        lat: number;
        lon: number;
    };
    timestamp: Date;
    evidenceUrl?: string;
    correctionSuggestion?: string;
}
export interface FuelAnalysis {
    expectedConsumption: number;
    actualConsumption: number;
    efficiency: number;
    variance: number;
    isWithinTolerance: boolean;
    suspiciousActivity: boolean;
}
export interface TimeAnalysis {
    plannedDuration: number;
    actualDuration: number;
    drivingTime: number;
    stopTime: number;
    delayReason?: string;
    isReasonable: boolean;
}
export interface SpeedAnalysis {
    averageSpeed: number;
    maxSpeed: number;
    speedViolations: number;
    trafficComplianceScore: number;
    fuelEfficiencyImpact: number;
}
export interface GeofenceViolation {
    type: 'UNAUTHORIZED_STOP' | 'ROUTE_DEVIATION' | 'PROHIBITED_AREA';
    location: {
        lat: number;
        lon: number;
    };
    timestamp: Date;
    duration: number;
    riskLevel: string;
}
export interface UPPFSettlementResult {
    settlementId: string;
    windowId: string;
    totalClaims: number;
    totalClaimAmount: number;
    totalSettledAmount: number;
    npaPenalties: number;
    netSettlement: number;
    settlementDate: Date;
    varianceAnalysis: VarianceAnalysis[];
    performanceMetrics: SettlementMetrics;
}
export interface VarianceAnalysis {
    claimId: string;
    originalAmount: number;
    settledAmount: number;
    varianceAmount: number;
    varianceReason: string;
    riskCategory: string;
    actionRequired: boolean;
}
export interface SettlementMetrics {
    successRate: number;
    averageProcessingDays: number;
    totalVarianceCost: number;
    complianceScore: number;
    efficiency: number;
}
export declare class UPPFClaimsService {
    private deliveryRepository;
    private claimsRepository;
    private equalisationRepository;
    private gpsRepository;
    private reconciliationRepository;
    private settlementsRepository;
    private routeOptimizationRepository;
    private pricingWindowsRepository;
    private eventEmitter;
    private httpService;
    private configService;
    private readonly logger;
    private readonly UPPF_BASE_RATES;
    private readonly ROUTE_MULTIPLIERS;
    private readonly GPS_THRESHOLDS;
    constructor(deliveryRepository: Repository<any>, claimsRepository: Repository<any>, equalisationRepository: Repository<any>, gpsRepository: Repository<any>, reconciliationRepository: Repository<any>, settlementsRepository: Repository<any>, routeOptimizationRepository: Repository<any>, pricingWindowsRepository: Repository<any>, eventEmitter: EventEmitter2, httpService: HttpService, configService: ConfigService);
    /**
     * Enhanced UPPF claim generation with comprehensive validation
     * Implements blueprint logic: km_excess = max(0, km_actual - equalisation_points.km_threshold)
     * Includes GPS validation, route optimization, and evidence collection
     */
    generateUPPFClaim(consignmentId: string, options?: {
        skipGPSValidation?: boolean;
        forceGeneration?: boolean;
        evidenceRequirement?: 'MINIMAL' | 'STANDARD' | 'COMPREHENSIVE';
    }): Promise<any>;
    /**
     * Enhanced three-way reconciliation with AI validation and blockchain verification
     * Compare Depot → Transporter → Station records with anomaly detection
     */
    performEnhancedThreeWayReconciliation(consignmentId: string, options?: {
        aiValidation?: boolean;
        anomalyDetection?: boolean;
        blockchainVerification?: boolean;
    }): Promise<{
        isValid: boolean;
        variances: any;
        status: string;
        confidence: number;
        anomalies: string[];
        blockchainHash?: string;
        aiInsights?: any;
    }>;
    /**
     * Enhanced GPS validation with comprehensive anomaly detection and AI analysis
     */
    performEnhancedGPSValidation(consignmentId: string, options?: {
        skipValidation?: boolean;
        requireHighConfidence?: boolean;
    }): Promise<EnhancedGPSValidation>;
    /**
     * Submit UPPF claims to NPA
     */
    submitClaimsToNPA(windowId: string): Promise<{
        submissionId: string;
        claimsCount: number;
        totalAmount: number;
    }>;
    /**
     * Process UPPF settlement from NPA
     */
    processUPPFSettlement(settlementData: {
        submissionRef: string;
        settlementAmount: number;
        settlementDate: Date;
        paymentReference: string;
    }): Promise<void>;
    /**
     * Scheduled job to auto-generate claims
     */
    autoGenerateClaims(): Promise<void>;
    private generateClaimNumber;
    private generateSubmissionId;
    private getCurrentUPPFTariff;
    private getCurrentPricingWindow;
    private getTransporterVolume;
    private collectClaimEvidence;
    /**
     * Calculate enhanced UPPF claim with route optimization and bonuses
     */
    private calculateEnhancedClaim;
    /**
     * Collect comprehensive evidence with automatic scoring
     */
    private collectComprehensiveEvidence;
    /**
     * Generate enhanced claim number with metadata
     */
    private generateEnhancedClaimNumber;
    /**
     * Determine claim status based on validation results
     */
    private determineClaimStatus;
    /**
     * Calculate claim risk score
     */
    private calculateClaimRiskScore;
    /**
     * Calculate submission priority
     */
    private calculateSubmissionPriority;
    /**
     * Schedule claim follow-up tasks
     */
    private scheduleClaimFollowUp;
    private detectAIAnomalies;
    private sendToNPAAPI;
    /**
     * Process UPPF settlement with comprehensive analysis
     */
    processUPPFSettlementEnhanced(windowId: string, settlementData: {
        totalSettlement: number;
        claimAdjustments: Array<{
            claimId: string;
            originalAmount: number;
            settledAmount: number;
            adjustmentReason: string;
        }>;
        npaPenalties: number;
        performanceBonuses: number;
    }): Promise<UPPFSettlementResult>;
    private postSettlementToGL;
    /**
     * Post enhanced GL entries with detailed breakdown
     */
    private postEnhancedSettlementToGL;
    private getNextClaimSequence;
    private calculateComplianceScore;
    private getRouteComplexityFactor;
    private getProductVolatilityFactor;
    private categorizeVarianceRisk;
    private calculateAverageProcessingDays;
    private calculateSettlementEfficiency;
    private performAIVarianceAnalysis;
    private createBlockchainRecord;
    private calculateReconciliationRiskScore;
    private predictVarianceForRoute;
    private identifyRiskFactors;
    private generateRecommendations;
    private getRouteHistory;
    private getVehicleProfile;
}
//# sourceMappingURL=uppf-claims.service.d.ts.map