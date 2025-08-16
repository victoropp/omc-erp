import { Employee } from './employee.entity';
export declare enum PerformanceReviewType {
    ANNUAL = "ANNUAL",
    SEMI_ANNUAL = "SEMI_ANNUAL",
    QUARTERLY = "QUARTERLY",
    PROBATIONARY = "PROBATIONARY",
    PROJECT_BASED = "PROJECT_BASED",
    SPECIAL_REVIEW = "SPECIAL_REVIEW",
    EXIT_REVIEW = "EXIT_REVIEW",
    PROMOTION_REVIEW = "PROMOTION_REVIEW"
}
export declare enum PerformanceStatus {
    DRAFT = "DRAFT",
    SELF_ASSESSMENT_PENDING = "SELF_ASSESSMENT_PENDING",
    SELF_ASSESSMENT_COMPLETE = "SELF_ASSESSMENT_COMPLETE",
    MANAGER_REVIEW_PENDING = "MANAGER_REVIEW_PENDING",
    MANAGER_REVIEW_COMPLETE = "MANAGER_REVIEW_COMPLETE",
    CALIBRATION_PENDING = "CALIBRATION_PENDING",
    FINALIZED = "FINALIZED",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    DISPUTED = "DISPUTED",
    CLOSED = "CLOSED"
}
export declare enum PerformanceRating {
    OUTSTANDING = "OUTSTANDING",
    EXCEEDS_EXPECTATIONS = "EXCEEDS_EXPECTATIONS",
    MEETS_EXPECTATIONS = "MEETS_EXPECTATIONS",
    NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
    UNSATISFACTORY = "UNSATISFACTORY"
}
export declare enum DevelopmentPriority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class EmployeePerformance {
    id: string;
    tenantId: string;
    employeeId: string;
    performanceReviewNumber: string;
    reviewType: PerformanceReviewType;
    performanceStatus: PerformanceStatus;
    reviewPeriod: string;
    reviewStartDate: Date;
    reviewEndDate: Date;
    dueDate: Date;
    completedDate: Date;
    selfAssessmentSubmitted: boolean;
    selfAssessmentDate: Date;
    selfRatingOverall: number;
    selfAssessmentComments: string;
    keyAchievements: string;
    challengesFaced: string;
    developmentNeedsSelf: string;
    careerAspirations: string;
    managerId: string;
    managerName: string;
    managerAssessmentDate: Date;
    managerRatingOverall: number;
    managerComments: string;
    managerFeedback: string;
    areasOfStrength: string;
    areasForImprovement: string;
    overallRating: PerformanceRating;
    overallScore: number;
    qualityOfWorkRating: number;
    productivityRating: number;
    teamworkRating: number;
    communicationRating: number;
    leadershipRating: number;
    innovationRating: number;
    problemSolvingRating: number;
    adaptabilityRating: number;
    safetyComplianceRating: number;
    environmentalAwarenessRating: number;
    regulatoryKnowledgeRating: number;
    customerServiceRating: number;
    technicalCompetencyRating: number;
    petroleumIndustryKnowledge: number;
    localContentCompliance: number;
    goalsSetCount: number;
    goalsAchievedCount: number;
    goalsAchievementPercentage: number;
    kpisMetCount: number;
    kpisTotalCount: number;
    projectCompletionRate: number;
    deadlineAdherenceRate: number;
    attendanceRating: number;
    punctualityRating: number;
    initiativeRating: number;
    reliabilityRating: number;
    professionalismRating: number;
    integrityRating: number;
    developmentPlanCreated: boolean;
    trainingNeedsIdentified: string;
    skillGaps: string;
    developmentGoals: string;
    developmentPriority: DevelopmentPriority;
    mentoringNeeded: boolean;
    coachingNeeded: boolean;
    stretchAssignments: string;
    promotionReady: boolean;
    promotionTimeline: string;
    successionPlanningCandidate: boolean;
    highPotentialEmployee: boolean;
    retentionRisk: string;
    flightRiskIndicators: string;
    performanceImprovementRequired: boolean;
    pipRecommended: boolean;
    pipStartDate: Date;
    pipDurationMonths: number;
    disciplinaryActionRequired: boolean;
    probationExtension: boolean;
    salaryIncreaseRecommended: boolean;
    salaryIncreasePercentage: number;
    bonusEligible: boolean;
    bonusAmount: number;
    stockOptionsEligible: boolean;
    specialRecognitionAward: boolean;
    calibrationSessionId: string;
    calibratedRating: number;
    calibrationNotes: string;
    ratingChangedInCalibration: boolean;
    previousRating: number;
    employeeAcknowledged: boolean;
    employeeAcknowledgmentDate: Date;
    employeeSignatureUrl: string;
    employeeDispute: boolean;
    employeeDisputeReason: string;
    disputeResolutionNotes: string;
    reviewDocumentUrl: string;
    selfAssessmentDocument: string;
    supportingDocuments: string;
    developmentPlanDocument: string;
    hrSystemSynced: boolean;
    payrollImpactProcessed: boolean;
    learningSystemUpdated: boolean;
    successionPlanningUpdated: boolean;
    performanceTrend: string;
    rankingInPeerGroup: number;
    percentileScore: number;
    departmentAverageScore: number;
    companyAverageScore: number;
    costCenter: string;
    department: string;
    division: string;
    location: string;
    reviewerEmployeeId: string;
    reviewerName: string;
    additionalComments: string;
    hrNotes: string;
    confidentialNotes: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    manager: Employee;
    reviewer: Employee;
}
//# sourceMappingURL=employee-performance.entity.d.ts.map