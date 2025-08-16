export declare enum RiskCategory {
    OPERATIONAL = "OPERATIONAL",
    FINANCIAL = "FINANCIAL",
    STRATEGIC = "STRATEGIC",
    COMPLIANCE = "COMPLIANCE",
    REPUTATIONAL = "REPUTATIONAL",
    ENVIRONMENTAL = "ENVIRONMENTAL",
    SAFETY = "SAFETY",
    CYBER_SECURITY = "CYBER_SECURITY",
    MARKET = "MARKET",
    CREDIT = "CREDIT",
    LIQUIDITY = "LIQUIDITY",
    FOREIGN_EXCHANGE = "FOREIGN_EXCHANGE"
}
export declare enum RiskStatus {
    IDENTIFIED = "IDENTIFIED",
    ASSESSED = "ASSESSED",
    MITIGATED = "MITIGATED",
    ACCEPTED = "ACCEPTED",
    TRANSFERRED = "TRANSFERRED",
    AVOIDED = "AVOIDED",
    MONITORING = "MONITORING",
    CLOSED = "CLOSED",
    ESCALATED = "ESCALATED"
}
export declare enum RiskLikelihood {
    RARE = "RARE",// 1
    UNLIKELY = "UNLIKELY",// 2
    POSSIBLE = "POSSIBLE",// 3
    LIKELY = "LIKELY",// 4
    ALMOST_CERTAIN = "ALMOST_CERTAIN"
}
export declare enum RiskImpact {
    NEGLIGIBLE = "NEGLIGIBLE",// 1
    MINOR = "MINOR",// 2
    MODERATE = "MODERATE",// 3
    MAJOR = "MAJOR",// 4
    CATASTROPHIC = "CATASTROPHIC"
}
export declare enum RiskLevel {
    LOW = "LOW",// 1-4
    MEDIUM = "MEDIUM",// 5-9
    HIGH = "HIGH",// 10-16
    CRITICAL = "CRITICAL"
}
export declare enum RiskTrend {
    INCREASING = "INCREASING",
    STABLE = "STABLE",
    DECREASING = "DECREASING",
    VOLATILE = "VOLATILE"
}
export declare class Risk {
    id: string;
    tenantId: string;
    riskCode: string;
    riskTitle: string;
    riskDescription: string;
    category: RiskCategory;
    subCategory: string;
    status: RiskStatus;
    riskType: string;
    likelihood: RiskLikelihood;
    likelihoodScore: number;
    impact: RiskImpact;
    impactScore: number;
    inherentRiskScore: number;
    inherentRiskLevel: RiskLevel;
    residualLikelihood: RiskLikelihood;
    residualImpact: RiskImpact;
    residualRiskScore: number;
    residualRiskLevel: RiskLevel;
    riskAppetite: RiskLevel;
    riskTolerance: number;
    riskVelocity: string;
    riskTrend: RiskTrend;
    detectionDifficulty: string;
    controlEffectiveness: number;
    potentialLossAmount: number;
    actualLossAmount: number;
    mitigationCost: number;
    currency: string;
    probabilityPercentage: number;
    riskSource: string;
    riskTriggers: string[];
    earlyWarningIndicators: string[];
    affectedDepartments: string[];
    affectedProcesses: string[];
    affectedSystems: string[];
    regulatoryBody: string;
    regulatoryRequirement: string;
    complianceDeadline: Date;
    politicalRiskFactor: boolean;
    forexExposure: number;
    petroleumPriceSensitivity: number;
    riskOwnerId: string;
    riskOwnerName: string;
    riskOwnerDepartment: string;
    riskChampionId: string;
    riskChampionName: string;
    escalationContact: string;
    mitigationStrategy: string;
    mitigationActions: any[];
    controlMeasures: any[];
    contingencyPlan: string;
    recoveryPlan: string;
    insuranceCoverage: boolean;
    insurancePolicyNumber: string;
    insuranceCoverageAmount: number;
    identificationDate: Date;
    assessmentDate: Date;
    mitigationStartDate: Date;
    mitigationTargetDate: Date;
    mitigationCompletionDate: Date;
    lastReviewDate: Date;
    nextReviewDate: Date;
    closureDate: Date;
    monitoringFrequency: string;
    kriMetrics: any[];
    kriThresholdBreached: boolean;
    incidentsCount: number;
    nearMissesCount: number;
    lastIncidentDate: Date;
    boardReportable: boolean;
    regulatoryReportable: boolean;
    reportedToBoardDate: Date;
    reportedToRegulatorDate: Date;
    externalAuditFinding: boolean;
    internalAuditFinding: boolean;
    relatedRisks: string[];
    parentRiskId: string;
    causesRisks: string[];
    causedByRisks: string[];
    riskRegisterEntry: boolean;
    supportingDocuments: string[];
    assessmentMethodology: string;
    dataSources: string[];
    scoreHistory: any[];
    assessmentHistory: any[];
    businessImpactAnalysis: string;
    stakeholderImpact: string;
    lessonsLearned: string;
    notes: string;
    tags: string[];
    isActive: boolean;
    isCritical: boolean;
    requiresImmediateAction: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=risk.entity.d.ts.map