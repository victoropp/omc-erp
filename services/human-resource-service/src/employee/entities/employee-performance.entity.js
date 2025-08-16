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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeePerformance = exports.DevelopmentPriority = exports.PerformanceRating = exports.PerformanceStatus = exports.PerformanceReviewType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var PerformanceReviewType;
(function (PerformanceReviewType) {
    PerformanceReviewType["ANNUAL"] = "ANNUAL";
    PerformanceReviewType["SEMI_ANNUAL"] = "SEMI_ANNUAL";
    PerformanceReviewType["QUARTERLY"] = "QUARTERLY";
    PerformanceReviewType["PROBATIONARY"] = "PROBATIONARY";
    PerformanceReviewType["PROJECT_BASED"] = "PROJECT_BASED";
    PerformanceReviewType["SPECIAL_REVIEW"] = "SPECIAL_REVIEW";
    PerformanceReviewType["EXIT_REVIEW"] = "EXIT_REVIEW";
    PerformanceReviewType["PROMOTION_REVIEW"] = "PROMOTION_REVIEW";
})(PerformanceReviewType || (exports.PerformanceReviewType = PerformanceReviewType = {}));
var PerformanceStatus;
(function (PerformanceStatus) {
    PerformanceStatus["DRAFT"] = "DRAFT";
    PerformanceStatus["SELF_ASSESSMENT_PENDING"] = "SELF_ASSESSMENT_PENDING";
    PerformanceStatus["SELF_ASSESSMENT_COMPLETE"] = "SELF_ASSESSMENT_COMPLETE";
    PerformanceStatus["MANAGER_REVIEW_PENDING"] = "MANAGER_REVIEW_PENDING";
    PerformanceStatus["MANAGER_REVIEW_COMPLETE"] = "MANAGER_REVIEW_COMPLETE";
    PerformanceStatus["CALIBRATION_PENDING"] = "CALIBRATION_PENDING";
    PerformanceStatus["FINALIZED"] = "FINALIZED";
    PerformanceStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    PerformanceStatus["DISPUTED"] = "DISPUTED";
    PerformanceStatus["CLOSED"] = "CLOSED";
})(PerformanceStatus || (exports.PerformanceStatus = PerformanceStatus = {}));
var PerformanceRating;
(function (PerformanceRating) {
    PerformanceRating["OUTSTANDING"] = "OUTSTANDING";
    PerformanceRating["EXCEEDS_EXPECTATIONS"] = "EXCEEDS_EXPECTATIONS";
    PerformanceRating["MEETS_EXPECTATIONS"] = "MEETS_EXPECTATIONS";
    PerformanceRating["NEEDS_IMPROVEMENT"] = "NEEDS_IMPROVEMENT";
    PerformanceRating["UNSATISFACTORY"] = "UNSATISFACTORY";
})(PerformanceRating || (exports.PerformanceRating = PerformanceRating = {}));
var DevelopmentPriority;
(function (DevelopmentPriority) {
    DevelopmentPriority["HIGH"] = "HIGH";
    DevelopmentPriority["MEDIUM"] = "MEDIUM";
    DevelopmentPriority["LOW"] = "LOW";
})(DevelopmentPriority || (exports.DevelopmentPriority = DevelopmentPriority = {}));
let EmployeePerformance = class EmployeePerformance {
    id;
    tenantId;
    employeeId;
    performanceReviewNumber;
    // Review Information
    reviewType;
    performanceStatus;
    reviewPeriod; // e.g., "2024-Q1", "2024-ANNUAL"
    reviewStartDate;
    reviewEndDate;
    dueDate;
    completedDate;
    // Employee Self Assessment
    selfAssessmentSubmitted;
    selfAssessmentDate;
    selfRatingOverall; // Out of 5
    selfAssessmentComments;
    keyAchievements;
    challengesFaced;
    developmentNeedsSelf;
    careerAspirations;
    // Manager Assessment
    managerId;
    managerName;
    managerAssessmentDate;
    managerRatingOverall;
    managerComments;
    managerFeedback;
    areasOfStrength;
    areasForImprovement;
    // Performance Metrics
    overallRating;
    overallScore; // Final calibrated score
    qualityOfWorkRating;
    productivityRating;
    teamworkRating;
    communicationRating;
    leadershipRating;
    innovationRating;
    problemSolvingRating;
    adaptabilityRating;
    // Ghana OMC Specific Competencies
    safetyComplianceRating;
    environmentalAwarenessRating;
    regulatoryKnowledgeRating;
    customerServiceRating;
    technicalCompetencyRating;
    petroleumIndustryKnowledge;
    localContentCompliance;
    // Goal Setting and Achievement
    goalsSetCount;
    goalsAchievedCount;
    goalsAchievementPercentage;
    kpisMetCount;
    kpisTotalCount;
    projectCompletionRate;
    deadlineAdherenceRate;
    // Behavioral Competencies
    attendanceRating;
    punctualityRating;
    initiativeRating;
    reliabilityRating;
    professionalismRating;
    integrityRating;
    // Development Planning
    developmentPlanCreated;
    trainingNeedsIdentified; // JSON array
    skillGaps;
    developmentGoals;
    developmentPriority;
    mentoringNeeded;
    coachingNeeded;
    stretchAssignments;
    // Career Development
    promotionReady;
    promotionTimeline; // 6_MONTHS, 1_YEAR, 2_YEARS, etc.
    successionPlanningCandidate;
    highPotentialEmployee;
    retentionRisk; // LOW, MEDIUM, HIGH
    flightRiskIndicators;
    // Performance Improvement
    performanceImprovementRequired;
    pipRecommended; // Performance Improvement Plan
    pipStartDate;
    pipDurationMonths;
    disciplinaryActionRequired;
    probationExtension;
    // Compensation Impact
    salaryIncreaseRecommended;
    salaryIncreasePercentage;
    bonusEligible;
    bonusAmount;
    stockOptionsEligible;
    specialRecognitionAward;
    // Calibration and Review
    calibrationSessionId;
    calibratedRating;
    calibrationNotes;
    ratingChangedInCalibration;
    previousRating;
    // Employee Acknowledgment
    employeeAcknowledged;
    employeeAcknowledgmentDate;
    employeeSignatureUrl;
    employeeDispute;
    employeeDisputeReason;
    disputeResolutionNotes;
    // Document Management
    reviewDocumentUrl;
    selfAssessmentDocument;
    supportingDocuments; // JSON array of URLs
    developmentPlanDocument;
    // Integration and Automation
    hrSystemSynced;
    payrollImpactProcessed;
    learningSystemUpdated;
    successionPlanningUpdated;
    // Analytics and Reporting
    performanceTrend; // IMPROVING, DECLINING, STABLE
    rankingInPeerGroup;
    percentileScore;
    departmentAverageScore;
    companyAverageScore;
    // Cost Center and Reporting
    costCenter;
    department;
    division;
    location;
    reviewerEmployeeId;
    reviewerName;
    // Notes and Comments
    additionalComments;
    hrNotes;
    confidentialNotes;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    employee;
    manager;
    reviewer;
};
exports.EmployeePerformance = EmployeePerformance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_review_number', length: 50, unique: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "performanceReviewNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'review_type',
        type: 'enum',
        enum: PerformanceReviewType
    }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "reviewType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'performance_status',
        type: 'enum',
        enum: PerformanceStatus,
        default: PerformanceStatus.DRAFT
    }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "performanceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_period', length: 20 }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "reviewPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_start_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "reviewStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_end_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "reviewEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "completedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'self_assessment_submitted', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "selfAssessmentSubmitted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'self_assessment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "selfAssessmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'self_rating_overall', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "selfRatingOverall", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'self_assessment_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "selfAssessmentComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_achievements', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "keyAchievements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'challenges_faced', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "challengesFaced", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'development_needs_self', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "developmentNeedsSelf", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'career_aspirations', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "careerAspirations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id' }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_name', length: 255 }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_assessment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "managerAssessmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_rating_overall', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "managerRatingOverall", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "managerComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "managerFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'areas_of_strength', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "areasOfStrength", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'areas_for_improvement', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "areasForImprovement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'overall_rating',
        type: 'enum',
        enum: PerformanceRating,
        nullable: true
    }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "overallRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_of_work_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "qualityOfWorkRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'productivity_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "productivityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'teamwork_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "teamworkRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'communication_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "communicationRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leadership_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "leadershipRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'innovation_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "innovationRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'problem_solving_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "problemSolvingRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adaptability_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "adaptabilityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'safety_compliance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "safetyComplianceRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'environmental_awareness_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "environmentalAwarenessRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_knowledge_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "regulatoryKnowledgeRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_service_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "customerServiceRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technical_competency_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "technicalCompetencyRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_industry_knowledge', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "petroleumIndustryKnowledge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_content_compliance', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "localContentCompliance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goals_set_count', default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "goalsSetCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goals_achieved_count', default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "goalsAchievedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goals_achievement_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "goalsAchievementPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpis_met_count', default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "kpisMetCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpis_total_count', default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "kpisTotalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "projectCompletionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deadline_adherence_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "deadlineAdherenceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "attendanceRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'punctuality_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "punctualityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'initiative_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "initiativeRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reliability_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "reliabilityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professionalism_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "professionalismRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'integrity_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "integrityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'development_plan_created', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "developmentPlanCreated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_needs_identified', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "trainingNeedsIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skill_gaps', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "skillGaps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'development_goals', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "developmentGoals", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'development_priority',
        type: 'enum',
        enum: DevelopmentPriority,
        default: DevelopmentPriority.MEDIUM
    }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "developmentPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mentoring_needed', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "mentoringNeeded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coaching_needed', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "coachingNeeded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stretch_assignments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "stretchAssignments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'promotion_ready', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "promotionReady", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'promotion_timeline', length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "promotionTimeline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'succession_planning_candidate', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "successionPlanningCandidate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'high_potential_employee', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "highPotentialEmployee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retention_risk', length: 20, default: 'LOW' }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "retentionRisk", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flight_risk_indicators', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "flightRiskIndicators", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_improvement_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "performanceImprovementRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pip_recommended', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "pipRecommended", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pip_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "pipStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pip_duration_months', nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "pipDurationMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disciplinary_action_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "disciplinaryActionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'probation_extension', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "probationExtension", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_increase_recommended', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "salaryIncreaseRecommended", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_increase_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "salaryIncreasePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bonus_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "bonusEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bonus_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "bonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_options_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "stockOptionsEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_recognition_award', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "specialRecognitionAward", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calibration_session_id', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "calibrationSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calibrated_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "calibratedRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calibration_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "calibrationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rating_changed_in_calibration', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "ratingChangedInCalibration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "previousRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_acknowledged', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "employeeAcknowledged", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_acknowledgment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "employeeAcknowledgmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_signature_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "employeeSignatureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_dispute', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "employeeDispute", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_dispute_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "employeeDisputeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dispute_resolution_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "disputeResolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "reviewDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'self_assessment_document', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "selfAssessmentDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'development_plan_document', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "developmentPlanDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_system_synced', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "hrSystemSynced", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_impact_processed', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "payrollImpactProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'learning_system_updated', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "learningSystemUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'succession_planning_updated', default: false }),
    __metadata("design:type", Boolean)
], EmployeePerformance.prototype, "successionPlanningUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_trend', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "performanceTrend", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ranking_in_peer_group', nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "rankingInPeerGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'percentile_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "percentileScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_average_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "departmentAverageScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_average_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeePerformance.prototype, "companyAverageScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'division', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewer_employee_id', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "reviewerEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewer_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "reviewerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'additional_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "additionalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "hrNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidential_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "confidentialNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], EmployeePerformance.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmployeePerformance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.performanceReviews),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeePerformance.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeePerformance.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewer_employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeePerformance.prototype, "reviewer", void 0);
exports.EmployeePerformance = EmployeePerformance = __decorate([
    (0, typeorm_1.Entity)('employee_performance'),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['tenantId', 'reviewPeriod']),
    (0, typeorm_1.Index)(['performanceStatus']),
    (0, typeorm_1.Index)(['overallRating'])
], EmployeePerformance);
//# sourceMappingURL=employee-performance.entity.js.map