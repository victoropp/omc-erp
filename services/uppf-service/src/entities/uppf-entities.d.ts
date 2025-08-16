export declare enum UPPFClaimStatus {
    DRAFT = "draft",
    READY_TO_SUBMIT = "ready_to_submit",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    SETTLED = "settled",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare enum ClaimPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum AutomationLevel {
    FULL = "full",
    PARTIAL = "partial",
    MANUAL = "manual"
}
export declare enum ProductType {
    PMS = "PMS",
    AGO = "AGO",
    KEROSENE = "KEROSENE",
    LPG = "LPG",
    IFO = "IFO",
    LUBRICANTS = "LUBRICANTS"
}
export declare enum AnomalyType {
    GPS_DEVIATION = "GPS_DEVIATION",
    VOLUME_VARIANCE = "VOLUME_VARIANCE",
    TIME_ANOMALY = "TIME_ANOMALY",
    ROUTE_CHANGE = "ROUTE_CHANGE",
    DOCUMENTATION_ISSUE = "DOCUMENTATION_ISSUE",
    FUEL_LOSS = "FUEL_LOSS",
    SPEED_VIOLATION = "SPEED_VIOLATION",
    GEOFENCE_VIOLATION = "GEOFENCE_VIOLATION"
}
export declare enum AnomalySeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ReconciliationStatus {
    PENDING = "pending",
    MATCHED = "matched",
    VARIANCE_DETECTED = "variance_detected",
    DISPUTED = "disputed",
    RESOLVED = "resolved"
}
export declare enum SettlementStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    PARTIALLY_SETTLED = "partially_settled"
}
export declare class UPPFClaim {
    id: string;
    claimNumber: string;
    windowId: string;
    consignmentId: string;
    dealerId: string;
    dealerName: string;
    routeId: string;
    routeName: string;
    depotId: string;
    depotName: string;
    stationId: string;
    stationName: string;
    productType: ProductType;
    volumeLitres: number;
    kmActual: number;
    kmPlanned: number;
    equalisationKm: number;
    kmBeyondEqualisation: number;
    tariffPerLitreKm: number;
    baseClaimAmount: number;
    routeEfficiencyBonus: number;
    complianceBonus: number;
    totalClaimAmount: number;
    status: UPPFClaimStatus;
    priority: ClaimPriority;
    qualityScore: number;
    riskScore: number;
    gpsConfidence: number;
    evidenceScore: number;
    automationLevel: AutomationLevel;
    gpsValidated: boolean;
    threeWayReconciled: boolean;
    blockchainVerified: boolean;
    aiValidated: boolean;
    blockchainHash?: string;
    evidenceLinks?: {
        waybill?: string;
        gpsTrace?: string;
        grn?: string;
        tankDips?: string;
        weighbridge?: string;
        qualityCertificate?: string;
        photos?: string[];
    };
    metadata?: {
        gpsValidation?: any;
        routeOptimization?: any;
        fuelAnalysis?: any;
        complianceMetrics?: any;
        aiInsights?: any;
    };
    submissionDate?: Date;
    approvalDate?: Date;
    settlementDate?: Date;
    processingDays?: number;
    settlementAmount?: number;
    varianceAmount?: number;
    varianceReason?: string;
    submissionRef?: string;
    npaResponseRef?: string;
    notes?: string;
    createdBy: string;
    lastModifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    anomalies: ClaimAnomaly[];
    auditTrail: ClaimAuditEntry[];
    settlement?: UPPFSettlement;
    settlementId?: string;
    get efficiencyRating(): string;
    get riskRating(): string;
    get isHighValue(): boolean;
    get hasAnomalies(): boolean;
    get totalBonuses(): number;
    validateAndCalculate(): void;
}
export declare class ClaimAnomaly {
    id: string;
    claimId: string;
    type: AnomalyType;
    severity: AnomalySeverity;
    description: string;
    location?: {
        lat: number;
        lon: number;
        address?: string;
    };
    evidence?: {
        gpsTrace?: string;
        photos?: string[];
        documents?: string[];
        sensorData?: any;
    };
    resolved: boolean;
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    correctionSuggestion?: string;
    impactScore: number;
    detectedAt: Date;
    updatedAt: Date;
    claim: UPPFClaim;
}
export declare class ClaimAuditEntry {
    id: string;
    claimId: string;
    action: string;
    user: string;
    details: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    claim: UPPFClaim;
}
export declare class ThreeWayReconciliation {
    id: string;
    consignmentId: string;
    depotLoadedLitres: number;
    depotDocumentRef: string;
    transporterDeliveredLitres: number;
    transporterDocumentRef: string;
    stationReceivedLitres: number;
    stationDocumentRef: string;
    varianceDepotTransporter: number;
    varianceTransporterStation: number;
    varianceDepotStation: number;
    toleranceApplied: number;
    routeComplexityFactor: number;
    productVolatilityFactor: number;
    reconciliationStatus: ReconciliationStatus;
    confidence: number;
    riskScore: number;
    aiAnomalies?: string[];
    blockchainHash?: string;
    aiValidated: boolean;
    aiInsights?: {
        predictedVariance?: number;
        riskFactors?: string[];
        recommendations?: string[];
        confidence?: number;
    };
    reconciledBy?: string;
    reconciledAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    get isWithinTolerance(): boolean;
    get variancePercentage(): number;
    get isHighRisk(): boolean;
}
export declare class UPPFSettlement {
    id: string;
    settlementId: string;
    windowId: string;
    totalClaims: number;
    totalClaimAmount: number;
    totalSettledAmount: number;
    npaPenalties: number;
    performanceBonuses: number;
    netSettlement: number;
    status: SettlementStatus;
    settlementDate: Date;
    varianceAnalysis?: {
        claimId: string;
        originalAmount: number;
        settledAmount: number;
        varianceAmount: number;
        varianceReason: string;
        riskCategory: string;
        actionRequired: boolean;
    }[];
    performanceMetrics?: {
        successRate: number;
        averageProcessingDays: number;
        totalVarianceCost: number;
        complianceScore: number;
        efficiency: number;
    };
    npaSubmissionRef?: string;
    paymentReference?: string;
    bankTransactionRef?: string;
    processedBy: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    claims: UPPFClaim[];
    get settlementEfficiency(): number;
    get hasVariances(): boolean;
    get totalVarianceAmount(): number;
    get isCompleted(): boolean;
}
export declare class EqualisationPoint {
    id: string;
    routeId: string;
    depotId: string;
    depotName: string;
    stationId: string;
    stationName: string;
    routeName: string;
    kmThreshold: number;
    regionId: string;
    regionName: string;
    roadCategory?: string;
    trafficFactor: number;
    complexityFactor: number;
    routeConditions?: {
        roadQuality: string;
        trafficDensity: string;
        weatherImpact: string;
        seasonalFactors: string[];
        securityLevel: string;
    };
    isActive: boolean;
    effectiveDate: Date;
    expiryDate?: Date;
    createdBy: string;
    lastModifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    get adjustedThreshold(): number;
    get isExpired(): boolean;
    get isCurrentlyActive(): boolean;
}
export declare class GPSTrace {
    id: string;
    consignmentId: string;
    vehicleId: string;
    driverId: string;
    startTime: Date;
    endTime: Date;
    totalKm: number;
    plannedKm: number;
    averageSpeed: number;
    maxSpeed: number;
    stopCount: number;
    stopDurationMinutes: number;
    speedViolations: number;
    unexpectedStops: number;
    confidence: number;
    routeEfficiency: number;
    routePolyline?: string;
    gpsPoints?: {
        lat: number;
        lon: number;
        timestamp: Date;
        speed: number;
        heading: number;
        accuracy: number;
    }[];
    anomalies?: {
        type: string;
        description: string;
        location: {
            lat: number;
            lon: number;
        };
        timestamp: Date;
        severity: string;
    }[];
    fuelAnalysis?: {
        expectedConsumption: number;
        actualConsumption: number;
        efficiency: number;
        variance: number;
        isWithinTolerance: boolean;
        suspiciousActivity: boolean;
    };
    timeAnalysis?: {
        plannedDuration: number;
        actualDuration: number;
        drivingTime: number;
        stopTime: number;
        delayReason?: string;
        isReasonable: boolean;
    };
    validated: boolean;
    aiAnalyzed: boolean;
    validatedBy?: string;
    validatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    get deviationPercentage(): number;
    get hasAnomalies(): boolean;
    get durationHours(): number;
    get isHighConfidence(): boolean;
    get isEfficient(): boolean;
}
export declare const UPPFEntities: (typeof UPPFClaim | typeof ClaimAnomaly | typeof ClaimAuditEntry | typeof UPPFSettlement | typeof ThreeWayReconciliation | typeof EqualisationPoint | typeof GPSTrace)[];
export interface CreateUPPFClaimDto {
    consignmentId: string;
    dealerId: string;
    dealerName: string;
    routeId: string;
    productType: ProductType;
    volumeLitres: number;
    kmActual: number;
    kmPlanned: number;
    tariffPerLitreKm?: number;
    evidenceLinks?: any;
    createdBy: string;
    notes?: string;
}
export interface UpdateUPPFClaimDto {
    status?: UPPFClaimStatus;
    priority?: ClaimPriority;
    notes?: string;
    settlementAmount?: number;
    varianceReason?: string;
    lastModifiedBy: string;
}
export interface UPPFClaimQueryDto {
    windowId?: string;
    dealerId?: string;
    status?: UPPFClaimStatus[];
    priority?: ClaimPriority[];
    automationLevel?: AutomationLevel[];
    productType?: ProductType[];
    minAmount?: number;
    maxAmount?: number;
    minQualityScore?: number;
    hasAnomalies?: boolean;
    blockchainVerified?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface CreateThreeWayReconciliationDto {
    consignmentId: string;
    depotLoadedLitres: number;
    depotDocumentRef: string;
    transporterDeliveredLitres: number;
    transporterDocumentRef: string;
    stationReceivedLitres: number;
    stationDocumentRef: string;
    notes?: string;
}
export interface CreateUPPFSettlementDto {
    windowId: string;
    claimIds: string[];
    totalSettledAmount: number;
    npaPenalties?: number;
    performanceBonuses?: number;
    npaSubmissionRef?: string;
    paymentReference?: string;
    processedBy: string;
    notes?: string;
}
//# sourceMappingURL=uppf-entities.d.ts.map