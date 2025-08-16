export declare enum AuditType {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
    REGULATORY = "REGULATORY",
    FINANCIAL = "FINANCIAL",
    OPERATIONAL = "OPERATIONAL",
    COMPLIANCE = "COMPLIANCE",
    IT_SYSTEMS = "IT_SYSTEMS",
    QUALITY = "QUALITY",
    SAFETY = "SAFETY",
    ENVIRONMENTAL = "ENVIRONMENTAL",
    SPECIAL_INVESTIGATION = "SPECIAL_INVESTIGATION",
    FORENSIC = "FORENSIC"
}
export declare enum AuditStatus {
    PLANNED = "PLANNED",
    IN_PREPARATION = "IN_PREPARATION",
    IN_PROGRESS = "IN_PROGRESS",
    FIELDWORK_COMPLETE = "FIELDWORK_COMPLETE",
    DRAFT_REPORT = "DRAFT_REPORT",
    MANAGEMENT_RESPONSE = "MANAGEMENT_RESPONSE",
    FINAL_REPORT = "FINAL_REPORT",
    CLOSED = "CLOSED",
    FOLLOW_UP = "FOLLOW_UP",
    CANCELLED = "CANCELLED"
}
export declare enum FindingSeverity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    OBSERVATION = "OBSERVATION"
}
export declare enum ControlRating {
    EFFECTIVE = "EFFECTIVE",
    PARTIALLY_EFFECTIVE = "PARTIALLY_EFFECTIVE",
    INEFFECTIVE = "INEFFECTIVE",
    NOT_TESTED = "NOT_TESTED"
}
export declare enum AuditOpinion {
    UNQUALIFIED = "UNQUALIFIED",
    QUALIFIED = "QUALIFIED",
    ADVERSE = "ADVERSE",
    DISCLAIMER = "DISCLAIMER",
    SATISFACTORY = "SATISFACTORY",
    NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
    UNSATISFACTORY = "UNSATISFACTORY"
}
export declare class Audit {
    id: string;
    tenantId: string;
    auditNumber: string;
    auditTitle: string;
    auditType: AuditType;
    status: AuditStatus;
    auditObjective: string;
    auditScope: string;
    auditCriteria: string;
    auditMethodology: string;
    departmentsCovered: string[];
    processesReviewed: string[];
    systemsReviewed: string[];
    locationsCovered: string[];
    auditPeriodFrom: Date;
    auditPeriodTo: Date;
    plannedStartDate: Date;
    plannedEndDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    fieldworkStartDate: Date;
    fieldworkEndDate: Date;
    reportIssueDate: Date;
    leadAuditorId: string;
    leadAuditorName: string;
    auditTeamMembers: any[];
    externalAuditorFirm: string;
    auditPartner: string;
    auditManager: string;
    budgetedHours: number;
    actualHours: number;
    budgetedCost: number;
    actualCost: number;
    currency: string;
    riskAssessmentCompleted: boolean;
    inherentRiskLevel: string;
    controlRiskLevel: string;
    detectionRiskLevel: string;
    auditRiskLevel: string;
    materialityThreshold: number;
    totalFindings: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    observationsCount: number;
    recommendationsCount: number;
    acceptedRecommendations: number;
    implementedRecommendations: number;
    controlsTested: number;
    controlsEffective: number;
    controlsPartiallyEffective: number;
    controlsIneffective: number;
    controlEffectivenessRate: number;
    complianceRate: number;
    regulationsReviewed: string[];
    policiesReviewed: string[];
    complianceViolations: number;
    npaComplianceChecked: boolean;
    graComplianceChecked: boolean;
    epaComplianceChecked: boolean;
    bogComplianceChecked: boolean;
    localContentCompliance: boolean;
    auditOpinion: AuditOpinion;
    overallRating: string;
    executiveSummary: string;
    keyConclusions: string;
    managementResponseReceived: boolean;
    managementResponseDate: Date;
    managementActionPlan: string;
    disagreementsWithManagement: string;
    followUpRequired: boolean;
    followUpDate: Date;
    followUpStatus: string;
    issuesResolved: number;
    issuesOutstanding: number;
    errorsIdentifiedAmount: number;
    recoveriesIdentified: number;
    costSavingsIdentified: number;
    revenueEnhancementIdentified: number;
    fraudAmountIdentified: number;
    sampleSize: number;
    populationSize: number;
    samplingMethod: string;
    confidenceLevel: number;
    errorRate: number;
    auditProgramRef: string;
    workingPapersRef: string;
    draftReportUrl: string;
    finalReportUrl: string;
    managementLetterUrl: string;
    supportingDocuments: string[];
    qualityReviewCompleted: boolean;
    qualityReviewer: string;
    qualityReviewDate: Date;
    qualityReviewComments: string;
    reportedToBoard: boolean;
    boardPresentationDate: Date;
    reportedToRegulator: boolean;
    regulatorSubmissionDate: Date;
    publicDisclosureRequired: boolean;
    previousAuditRef: string;
    nextAuditDate: Date;
    lessonsLearned: string;
    bestPracticesIdentified: string;
    notes: string;
    tags: string[];
    isActive: boolean;
    isConfidential: boolean;
    requiresCeoAttention: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=audit.entity.d.ts.map