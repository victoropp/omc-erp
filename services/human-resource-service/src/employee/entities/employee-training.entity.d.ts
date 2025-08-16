import { Employee } from './employee.entity';
export declare enum TrainingType {
    ORIENTATION = "ORIENTATION",
    TECHNICAL_TRAINING = "TECHNICAL_TRAINING",
    SAFETY_TRAINING = "SAFETY_TRAINING",
    COMPLIANCE_TRAINING = "COMPLIANCE_TRAINING",
    SOFT_SKILLS = "SOFT_SKILLS",
    LEADERSHIP_DEVELOPMENT = "LEADERSHIP_DEVELOPMENT",
    PROFESSIONAL_DEVELOPMENT = "PROFESSIONAL_DEVELOPMENT",
    CERTIFICATION = "CERTIFICATION",
    REFRESHER_TRAINING = "REFRESHER_TRAINING",
    MANDATORY_TRAINING = "MANDATORY_TRAINING",
    SKILLS_UPGRADE = "SKILLS_UPGRADE",
    CROSS_TRAINING = "CROSS_TRAINING"
}
export declare enum TrainingStatus {
    PLANNED = "PLANNED",
    ENROLLED = "ENROLLED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    DEFERRED = "DEFERRED",
    EXPIRED = "EXPIRED",
    WITHDRAWN = "WITHDRAWN"
}
export declare enum TrainingDeliveryMethod {
    CLASSROOM = "CLASSROOM",
    ONLINE = "ONLINE",
    BLENDED = "BLENDED",
    ON_THE_JOB = "ON_THE_JOB",
    VIRTUAL_CLASSROOM = "VIRTUAL_CLASSROOM",
    WORKSHOP = "WORKSHOP",
    SEMINAR = "SEMINAR",
    CONFERENCE = "CONFERENCE",
    MENTORING = "MENTORING",
    SELF_STUDY = "SELF_STUDY"
}
export declare enum TrainingPriority {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class EmployeeTraining {
    id: string;
    tenantId: string;
    employeeId: string;
    trainingRecordNumber: string;
    trainingType: TrainingType;
    trainingStatus: TrainingStatus;
    trainingTitle: string;
    trainingDescription: string;
    trainingCode: string;
    trainingCategory: string;
    trainingSubcategory: string;
    deliveryMethod: TrainingDeliveryMethod;
    trainingProvider: string;
    trainingProviderContact: string;
    trainerName: string;
    trainingLocation: string;
    trainingVenue: string;
    onlinePlatform: string;
    scheduledStartDate: Date;
    scheduledEndDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    scheduledHours: number;
    actualHours: number;
    trainingDays: number;
    dailyHours: number;
    registrationDate: Date;
    enrollmentDate: Date;
    enrollmentDeadline: Date;
    waitlistPosition: number;
    capacityLimit: number;
    enrolledParticipants: number;
    mandatoryTraining: boolean;
    prerequisiteTraining: string;
    prerequisitesMet: boolean;
    recurringTraining: boolean;
    recurrenceFrequencyMonths: number;
    nextDueDate: Date;
    trainingPriority: TrainingPriority;
    petroleumSafetyTraining: boolean;
    hseTraining: boolean;
    environmentalTraining: boolean;
    npaComplianceTraining: boolean;
    fireSafetyTraining: boolean;
    firstAidTraining: boolean;
    hazmatTraining: boolean;
    confinedSpaceTraining: boolean;
    workingAtHeightTraining: boolean;
    localContentTraining: boolean;
    certificationRequired: boolean;
    certificateNumber: string;
    certificateIssuedDate: Date;
    certificateExpiryDate: Date;
    certificateUrl: string;
    assessmentRequired: boolean;
    assessmentScore: number;
    passingScore: number;
    assessmentPassed: boolean;
    assessmentAttempts: number;
    maxAssessmentAttempts: number;
    trainingEvaluationCompleted: boolean;
    overallSatisfactionRating: number;
    contentQualityRating: number;
    trainerEffectivenessRating: number;
    trainingRelevanceRating: number;
    recommendationScore: number;
    employeeFeedback: string;
    trainerFeedback: string;
    suggestionsForImprovement: string;
    learningObjectives: string;
    learningOutcomesAchieved: string;
    skillsGained: string;
    competenciesDeveloped: string;
    knowledgeRetentionScore: number;
    practicalApplicationScore: number;
    trainingCost: number;
    registrationFee: number;
    travelExpenses: number;
    accommodationCost: number;
    mealAllowance: number;
    materialsCost: number;
    totalCost: number;
    budgetCode: string;
    approvedBudget: number;
    currency: string;
    managerApprovalRequired: boolean;
    managerApproved: boolean;
    managerApprovalDate: Date;
    managerId: string;
    managerName: string;
    hrApprovalRequired: boolean;
    hrApproved: boolean;
    hrApprovalDate: Date;
    hrApprovedBy: string;
    attendancePercentage: number;
    sessionsAttended: number;
    totalSessions: number;
    lateArrivals: number;
    earlyDepartures: number;
    participationLevel: string;
    engagementScore: number;
    followUpRequired: boolean;
    followUpDate: Date;
    followUpCompleted: boolean;
    knowledgeTransferSession: boolean;
    practicalApplicationAssessment: boolean;
    refresherTrainingDue: Date;
    lmsIntegration: boolean;
    lmsCourseId: string;
    lmsCompletionStatus: string;
    complianceTrackingUpdated: boolean;
    performanceImpactTracked: boolean;
    trainingMaterialsUrl: string;
    attendanceRecordUrl: string;
    assessmentRecordUrl: string;
    evaluationFormUrl: string;
    supportingDocuments: string;
    costCenter: string;
    department: string;
    division: string;
    location: string;
    trainingNotes: string;
    cancellationReason: string;
    deferralReason: string;
    additionalComments: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    manager: Employee;
}
//# sourceMappingURL=employee-training.entity.d.ts.map