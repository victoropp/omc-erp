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
exports.EmployeeTraining = exports.TrainingPriority = exports.TrainingDeliveryMethod = exports.TrainingStatus = exports.TrainingType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var TrainingType;
(function (TrainingType) {
    TrainingType["ORIENTATION"] = "ORIENTATION";
    TrainingType["TECHNICAL_TRAINING"] = "TECHNICAL_TRAINING";
    TrainingType["SAFETY_TRAINING"] = "SAFETY_TRAINING";
    TrainingType["COMPLIANCE_TRAINING"] = "COMPLIANCE_TRAINING";
    TrainingType["SOFT_SKILLS"] = "SOFT_SKILLS";
    TrainingType["LEADERSHIP_DEVELOPMENT"] = "LEADERSHIP_DEVELOPMENT";
    TrainingType["PROFESSIONAL_DEVELOPMENT"] = "PROFESSIONAL_DEVELOPMENT";
    TrainingType["CERTIFICATION"] = "CERTIFICATION";
    TrainingType["REFRESHER_TRAINING"] = "REFRESHER_TRAINING";
    TrainingType["MANDATORY_TRAINING"] = "MANDATORY_TRAINING";
    TrainingType["SKILLS_UPGRADE"] = "SKILLS_UPGRADE";
    TrainingType["CROSS_TRAINING"] = "CROSS_TRAINING";
})(TrainingType || (exports.TrainingType = TrainingType = {}));
var TrainingStatus;
(function (TrainingStatus) {
    TrainingStatus["PLANNED"] = "PLANNED";
    TrainingStatus["ENROLLED"] = "ENROLLED";
    TrainingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TrainingStatus["COMPLETED"] = "COMPLETED";
    TrainingStatus["FAILED"] = "FAILED";
    TrainingStatus["CANCELLED"] = "CANCELLED";
    TrainingStatus["NO_SHOW"] = "NO_SHOW";
    TrainingStatus["DEFERRED"] = "DEFERRED";
    TrainingStatus["EXPIRED"] = "EXPIRED";
    TrainingStatus["WITHDRAWN"] = "WITHDRAWN";
})(TrainingStatus || (exports.TrainingStatus = TrainingStatus = {}));
var TrainingDeliveryMethod;
(function (TrainingDeliveryMethod) {
    TrainingDeliveryMethod["CLASSROOM"] = "CLASSROOM";
    TrainingDeliveryMethod["ONLINE"] = "ONLINE";
    TrainingDeliveryMethod["BLENDED"] = "BLENDED";
    TrainingDeliveryMethod["ON_THE_JOB"] = "ON_THE_JOB";
    TrainingDeliveryMethod["VIRTUAL_CLASSROOM"] = "VIRTUAL_CLASSROOM";
    TrainingDeliveryMethod["WORKSHOP"] = "WORKSHOP";
    TrainingDeliveryMethod["SEMINAR"] = "SEMINAR";
    TrainingDeliveryMethod["CONFERENCE"] = "CONFERENCE";
    TrainingDeliveryMethod["MENTORING"] = "MENTORING";
    TrainingDeliveryMethod["SELF_STUDY"] = "SELF_STUDY";
})(TrainingDeliveryMethod || (exports.TrainingDeliveryMethod = TrainingDeliveryMethod = {}));
var TrainingPriority;
(function (TrainingPriority) {
    TrainingPriority["CRITICAL"] = "CRITICAL";
    TrainingPriority["HIGH"] = "HIGH";
    TrainingPriority["MEDIUM"] = "MEDIUM";
    TrainingPriority["LOW"] = "LOW";
})(TrainingPriority || (exports.TrainingPriority = TrainingPriority = {}));
let EmployeeTraining = class EmployeeTraining {
    id;
    tenantId;
    employeeId;
    trainingRecordNumber;
    // Training Information
    trainingType;
    trainingStatus;
    trainingTitle;
    trainingDescription;
    trainingCode;
    trainingCategory;
    trainingSubcategory;
    // Training Details
    deliveryMethod;
    trainingProvider;
    trainingProviderContact;
    trainerName;
    trainingLocation;
    trainingVenue;
    onlinePlatform;
    // Scheduling
    scheduledStartDate;
    scheduledEndDate;
    actualStartDate;
    actualEndDate;
    scheduledHours;
    actualHours;
    trainingDays;
    dailyHours;
    // Registration and Enrollment
    registrationDate;
    enrollmentDate;
    enrollmentDeadline;
    waitlistPosition;
    capacityLimit;
    enrolledParticipants;
    // Training Requirements
    mandatoryTraining;
    prerequisiteTraining; // JSON array of training IDs
    prerequisitesMet;
    recurringTraining;
    recurrenceFrequencyMonths;
    nextDueDate;
    trainingPriority;
    // Ghana OMC Specific Training
    petroleumSafetyTraining;
    hseTraining;
    environmentalTraining;
    npaComplianceTraining;
    fireSafetyTraining;
    firstAidTraining;
    hazmatTraining;
    confinedSpaceTraining;
    workingAtHeightTraining;
    localContentTraining;
    // Certification and Assessment
    certificationRequired;
    certificateNumber;
    certificateIssuedDate;
    certificateExpiryDate;
    certificateUrl;
    assessmentRequired;
    assessmentScore; // Out of 100
    passingScore;
    assessmentPassed;
    assessmentAttempts;
    maxAssessmentAttempts;
    // Feedback and Evaluation
    trainingEvaluationCompleted;
    overallSatisfactionRating; // Out of 5
    contentQualityRating;
    trainerEffectivenessRating;
    trainingRelevanceRating;
    recommendationScore;
    employeeFeedback;
    trainerFeedback;
    suggestionsForImprovement;
    // Learning Outcomes
    learningObjectives; // JSON array
    learningOutcomesAchieved; // JSON array
    skillsGained; // JSON array
    competenciesDeveloped; // JSON array
    knowledgeRetentionScore;
    practicalApplicationScore;
    // Cost and Budget
    trainingCost;
    registrationFee;
    travelExpenses;
    accommodationCost;
    mealAllowance;
    materialsCost;
    totalCost;
    budgetCode;
    approvedBudget;
    currency;
    // Approval and Authorization
    managerApprovalRequired;
    managerApproved;
    managerApprovalDate;
    managerId;
    managerName;
    hrApprovalRequired;
    hrApproved;
    hrApprovalDate;
    hrApprovedBy;
    // Attendance and Participation
    attendancePercentage;
    sessionsAttended;
    totalSessions;
    lateArrivals;
    earlyDepartures;
    participationLevel; // ACTIVE, MODERATE, PASSIVE
    engagementScore;
    // Post-Training Follow-up
    followUpRequired;
    followUpDate;
    followUpCompleted;
    knowledgeTransferSession;
    practicalApplicationAssessment;
    refresherTrainingDue;
    // Integration and Reporting
    lmsIntegration; // Learning Management System
    lmsCourseId;
    lmsCompletionStatus;
    complianceTrackingUpdated;
    performanceImpactTracked;
    // Document Management
    trainingMaterialsUrl;
    attendanceRecordUrl;
    assessmentRecordUrl;
    evaluationFormUrl;
    supportingDocuments; // JSON array of document URLs
    // Cost Center and Reporting
    costCenter;
    department;
    division;
    location;
    // Notes and Comments
    trainingNotes;
    cancellationReason;
    deferralReason;
    additionalComments;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    employee;
    manager;
};
exports.EmployeeTraining = EmployeeTraining;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_record_number', length: 50, unique: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingRecordNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'training_type',
        type: 'enum',
        enum: TrainingType
    }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'training_status',
        type: 'enum',
        enum: TrainingStatus,
        default: TrainingStatus.PLANNED
    }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_title', length: 255 }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_category', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_subcategory', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingSubcategory", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'delivery_method',
        type: 'enum',
        enum: TrainingDeliveryMethod
    }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "deliveryMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_provider', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_provider_contact', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingProviderContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trainer_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_location', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_venue', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingVenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'online_platform', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "onlinePlatform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_start_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "scheduledStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_end_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "scheduledEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "scheduledHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "actualHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_days', default: 1 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "trainingDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_hours', type: 'decimal', precision: 4, scale: 2, default: 8 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "dailyHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrollment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "enrollmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrollment_deadline', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "enrollmentDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waitlist_position', nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "waitlistPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'capacity_limit', nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "capacityLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrolled_participants', default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "enrolledParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mandatory_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "mandatoryTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prerequisite_training', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "prerequisiteTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prerequisites_met', default: true }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "prerequisitesMet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurring_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "recurringTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurrence_frequency_months', nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "recurrenceFrequencyMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "nextDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'training_priority',
        type: 'enum',
        enum: TrainingPriority,
        default: TrainingPriority.MEDIUM
    }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_safety_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "petroleumSafetyTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hse_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "hseTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'environmental_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "environmentalTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_compliance_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "npaComplianceTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fire_safety_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "fireSafetyTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_aid_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "firstAidTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hazmat_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "hazmatTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confined_space_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "confinedSpaceTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_at_height_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "workingAtHeightTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_content_training', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "localContentTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certification_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "certificationRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificate_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "certificateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificate_issued_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "certificateIssuedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificate_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "certificateExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificate_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "certificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "assessmentRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "assessmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'passing_score', type: 'decimal', precision: 5, scale: 2, default: 70 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "passingScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_passed', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "assessmentPassed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_attempts', default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "assessmentAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_assessment_attempts', default: 3 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "maxAssessmentAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_evaluation_completed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "trainingEvaluationCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_satisfaction_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "overallSatisfactionRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_quality_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "contentQualityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trainer_effectiveness_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "trainerEffectivenessRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_relevance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "trainingRelevanceRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommendation_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "recommendationScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "employeeFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trainer_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainerFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suggestions_for_improvement', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "suggestionsForImprovement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'learning_objectives', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "learningObjectives", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'learning_outcomes_achieved', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "learningOutcomesAchieved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skills_gained', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "skillsGained", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competencies_developed', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "competenciesDeveloped", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'knowledge_retention_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "knowledgeRetentionScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'practical_application_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "practicalApplicationScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_cost', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "trainingCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_fee', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "registrationFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'travel_expenses', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "travelExpenses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accommodation_cost', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "accommodationCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "mealAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'materials_cost', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "materialsCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "budgetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_budget', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "approvedBudget", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approval_required', default: true }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "managerApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approved', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "managerApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "managerApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "hrApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approved', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "hrApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "hrApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "attendancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sessions_attended', default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "sessionsAttended", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_sessions', default: 1 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "totalSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'late_arrivals', default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "lateArrivals", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'early_departures', default: 0 }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "earlyDepartures", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'participation_level', length: 20, default: 'ACTIVE' }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "participationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engagement_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeTraining.prototype, "engagementScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "followUpRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "followUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_completed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "followUpCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'knowledge_transfer_session', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "knowledgeTransferSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'practical_application_assessment', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "practicalApplicationAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresher_training_due', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "refresherTrainingDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lms_integration', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "lmsIntegration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lms_course_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "lmsCourseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lms_completion_status', length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "lmsCompletionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_tracking_updated', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "complianceTrackingUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_impact_tracked', default: false }),
    __metadata("design:type", Boolean)
], EmployeeTraining.prototype, "performanceImpactTracked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_materials_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingMaterialsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendance_record_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "attendanceRecordUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_record_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "assessmentRecordUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evaluation_form_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "evaluationFormUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'division', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "trainingNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deferral_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "deferralReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'additional_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "additionalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], EmployeeTraining.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmployeeTraining.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.trainings),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeTraining.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeTraining.prototype, "manager", void 0);
exports.EmployeeTraining = EmployeeTraining = __decorate([
    (0, typeorm_1.Entity)('employee_training'),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['tenantId', 'trainingStatus']),
    (0, typeorm_1.Index)(['trainingType']),
    (0, typeorm_1.Index)(['scheduledStartDate', 'scheduledEndDate'])
], EmployeeTraining);
//# sourceMappingURL=employee-training.entity.js.map