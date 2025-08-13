import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { Employee } from './employee.entity';

export enum TrainingType {
  ORIENTATION = 'ORIENTATION',
  TECHNICAL_TRAINING = 'TECHNICAL_TRAINING',
  SAFETY_TRAINING = 'SAFETY_TRAINING',
  COMPLIANCE_TRAINING = 'COMPLIANCE_TRAINING',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LEADERSHIP_DEVELOPMENT = 'LEADERSHIP_DEVELOPMENT',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  CERTIFICATION = 'CERTIFICATION',
  REFRESHER_TRAINING = 'REFRESHER_TRAINING',
  MANDATORY_TRAINING = 'MANDATORY_TRAINING',
  SKILLS_UPGRADE = 'SKILLS_UPGRADE',
  CROSS_TRAINING = 'CROSS_TRAINING'
}

export enum TrainingStatus {
  PLANNED = 'PLANNED',
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  DEFERRED = 'DEFERRED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum TrainingDeliveryMethod {
  CLASSROOM = 'CLASSROOM',
  ONLINE = 'ONLINE',
  BLENDED = 'BLENDED',
  ON_THE_JOB = 'ON_THE_JOB',
  VIRTUAL_CLASSROOM = 'VIRTUAL_CLASSROOM',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  CONFERENCE = 'CONFERENCE',
  MENTORING = 'MENTORING',
  SELF_STUDY = 'SELF_STUDY'
}

export enum TrainingPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

@Entity('employee_training')
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'trainingStatus'])
@Index(['trainingType'])
@Index(['scheduledStartDate', 'scheduledEndDate'])
export class EmployeeTraining {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'training_record_number', length: 50, unique: true })
  trainingRecordNumber: string;

  // Training Information
  @Column({ 
    name: 'training_type', 
    type: 'enum', 
    enum: TrainingType 
  })
  trainingType: TrainingType;

  @Column({ 
    name: 'training_status', 
    type: 'enum', 
    enum: TrainingStatus,
    default: TrainingStatus.PLANNED
  })
  trainingStatus: TrainingStatus;

  @Column({ name: 'training_title', length: 255 })
  trainingTitle: string;

  @Column({ name: 'training_description', type: 'text', nullable: true })
  trainingDescription: string;

  @Column({ name: 'training_code', length: 50, nullable: true })
  trainingCode: string;

  @Column({ name: 'training_category', length: 100, nullable: true })
  trainingCategory: string;

  @Column({ name: 'training_subcategory', length: 100, nullable: true })
  trainingSubcategory: string;

  // Training Details
  @Column({ 
    name: 'delivery_method', 
    type: 'enum', 
    enum: TrainingDeliveryMethod 
  })
  deliveryMethod: TrainingDeliveryMethod;

  @Column({ name: 'training_provider', length: 255, nullable: true })
  trainingProvider: string;

  @Column({ name: 'training_provider_contact', length: 255, nullable: true })
  trainingProviderContact: string;

  @Column({ name: 'trainer_name', length: 255, nullable: true })
  trainerName: string;

  @Column({ name: 'training_location', length: 255, nullable: true })
  trainingLocation: string;

  @Column({ name: 'training_venue', length: 255, nullable: true })
  trainingVenue: string;

  @Column({ name: 'online_platform', length: 100, nullable: true })
  onlinePlatform: string;

  // Scheduling
  @Column({ name: 'scheduled_start_date', type: 'date' })
  scheduledStartDate: Date;

  @Column({ name: 'scheduled_end_date', type: 'date' })
  scheduledEndDate: Date;

  @Column({ name: 'actual_start_date', type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'scheduled_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  scheduledHours: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  actualHours: number;

  @Column({ name: 'training_days', default: 1 })
  trainingDays: number;

  @Column({ name: 'daily_hours', type: 'decimal', precision: 4, scale: 2, default: 8 })
  dailyHours: number;

  // Registration and Enrollment
  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: Date;

  @Column({ name: 'enrollment_date', type: 'date', nullable: true })
  enrollmentDate: Date;

  @Column({ name: 'enrollment_deadline', type: 'date', nullable: true })
  enrollmentDeadline: Date;

  @Column({ name: 'waitlist_position', nullable: true })
  waitlistPosition: number;

  @Column({ name: 'capacity_limit', nullable: true })
  capacityLimit: number;

  @Column({ name: 'enrolled_participants', default: 0 })
  enrolledParticipants: number;

  // Training Requirements
  @Column({ name: 'mandatory_training', default: false })
  mandatoryTraining: boolean;

  @Column({ name: 'prerequisite_training', type: 'text', nullable: true })
  prerequisiteTraining: string; // JSON array of training IDs

  @Column({ name: 'prerequisites_met', default: true })
  prerequisitesMet: boolean;

  @Column({ name: 'recurring_training', default: false })
  recurringTraining: boolean;

  @Column({ name: 'recurrence_frequency_months', nullable: true })
  recurrenceFrequencyMonths: number;

  @Column({ name: 'next_due_date', type: 'date', nullable: true })
  nextDueDate: Date;

  @Column({ 
    name: 'training_priority', 
    type: 'enum', 
    enum: TrainingPriority,
    default: TrainingPriority.MEDIUM
  })
  trainingPriority: TrainingPriority;

  // Ghana OMC Specific Training
  @Column({ name: 'petroleum_safety_training', default: false })
  petroleumSafetyTraining: boolean;

  @Column({ name: 'hse_training', default: false })
  hseTraining: boolean;

  @Column({ name: 'environmental_training', default: false })
  environmentalTraining: boolean;

  @Column({ name: 'npa_compliance_training', default: false })
  npaComplianceTraining: boolean;

  @Column({ name: 'fire_safety_training', default: false })
  fireSafetyTraining: boolean;

  @Column({ name: 'first_aid_training', default: false })
  firstAidTraining: boolean;

  @Column({ name: 'hazmat_training', default: false })
  hazmatTraining: boolean;

  @Column({ name: 'confined_space_training', default: false })
  confinedSpaceTraining: boolean;

  @Column({ name: 'working_at_height_training', default: false })
  workingAtHeightTraining: boolean;

  @Column({ name: 'local_content_training', default: false })
  localContentTraining: boolean;

  // Certification and Assessment
  @Column({ name: 'certification_required', default: false })
  certificationRequired: boolean;

  @Column({ name: 'certificate_number', length: 100, nullable: true })
  certificateNumber: string;

  @Column({ name: 'certificate_issued_date', type: 'date', nullable: true })
  certificateIssuedDate: Date;

  @Column({ name: 'certificate_expiry_date', type: 'date', nullable: true })
  certificateExpiryDate: Date;

  @Column({ name: 'certificate_url', length: 500, nullable: true })
  certificateUrl: string;

  @Column({ name: 'assessment_required', default: false })
  assessmentRequired: boolean;

  @Column({ name: 'assessment_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  assessmentScore: number; // Out of 100

  @Column({ name: 'passing_score', type: 'decimal', precision: 5, scale: 2, default: 70 })
  passingScore: number;

  @Column({ name: 'assessment_passed', nullable: true })
  assessmentPassed: boolean;

  @Column({ name: 'assessment_attempts', default: 0 })
  assessmentAttempts: number;

  @Column({ name: 'max_assessment_attempts', default: 3 })
  maxAssessmentAttempts: number;

  // Feedback and Evaluation
  @Column({ name: 'training_evaluation_completed', default: false })
  trainingEvaluationCompleted: boolean;

  @Column({ name: 'overall_satisfaction_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  overallSatisfactionRating: number; // Out of 5

  @Column({ name: 'content_quality_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  contentQualityRating: number;

  @Column({ name: 'trainer_effectiveness_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  trainerEffectivenessRating: number;

  @Column({ name: 'training_relevance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  trainingRelevanceRating: number;

  @Column({ name: 'recommendation_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  recommendationScore: number;

  @Column({ name: 'employee_feedback', type: 'text', nullable: true })
  employeeFeedback: string;

  @Column({ name: 'trainer_feedback', type: 'text', nullable: true })
  trainerFeedback: string;

  @Column({ name: 'suggestions_for_improvement', type: 'text', nullable: true })
  suggestionsForImprovement: string;

  // Learning Outcomes
  @Column({ name: 'learning_objectives', type: 'text', nullable: true })
  learningObjectives: string; // JSON array

  @Column({ name: 'learning_outcomes_achieved', type: 'text', nullable: true })
  learningOutcomesAchieved: string; // JSON array

  @Column({ name: 'skills_gained', type: 'text', nullable: true })
  skillsGained: string; // JSON array

  @Column({ name: 'competencies_developed', type: 'text', nullable: true })
  competenciesDeveloped: string; // JSON array

  @Column({ name: 'knowledge_retention_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  knowledgeRetentionScore: number;

  @Column({ name: 'practical_application_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  practicalApplicationScore: number;

  // Cost and Budget
  @Column({ name: 'training_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  trainingCost: number;

  @Column({ name: 'registration_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  registrationFee: number;

  @Column({ name: 'travel_expenses', type: 'decimal', precision: 15, scale: 2, default: 0 })
  travelExpenses: number;

  @Column({ name: 'accommodation_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  accommodationCost: number;

  @Column({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  mealAllowance: number;

  @Column({ name: 'materials_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  materialsCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'budget_code', length: 20, nullable: true })
  budgetCode: string;

  @Column({ name: 'approved_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedBudget: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  // Approval and Authorization
  @Column({ name: 'manager_approval_required', default: true })
  managerApprovalRequired: boolean;

  @Column({ name: 'manager_approved', nullable: true })
  managerApproved: boolean;

  @Column({ name: 'manager_approval_date', type: 'date', nullable: true })
  managerApprovalDate: Date;

  @Column({ name: 'manager_id', nullable: true })
  managerId: string;

  @Column({ name: 'manager_name', length: 255, nullable: true })
  managerName: string;

  @Column({ name: 'hr_approval_required', default: false })
  hrApprovalRequired: boolean;

  @Column({ name: 'hr_approved', nullable: true })
  hrApproved: boolean;

  @Column({ name: 'hr_approval_date', type: 'date', nullable: true })
  hrApprovalDate: Date;

  @Column({ name: 'hr_approved_by', length: 255, nullable: true })
  hrApprovedBy: string;

  // Attendance and Participation
  @Column({ name: 'attendance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  attendancePercentage: number;

  @Column({ name: 'sessions_attended', default: 0 })
  sessionsAttended: number;

  @Column({ name: 'total_sessions', default: 1 })
  totalSessions: number;

  @Column({ name: 'late_arrivals', default: 0 })
  lateArrivals: number;

  @Column({ name: 'early_departures', default: 0 })
  earlyDepartures: number;

  @Column({ name: 'participation_level', length: 20, default: 'ACTIVE' })
  participationLevel: string; // ACTIVE, MODERATE, PASSIVE

  @Column({ name: 'engagement_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  engagementScore: number;

  // Post-Training Follow-up
  @Column({ name: 'follow_up_required', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_completed', default: false })
  followUpCompleted: boolean;

  @Column({ name: 'knowledge_transfer_session', default: false })
  knowledgeTransferSession: boolean;

  @Column({ name: 'practical_application_assessment', default: false })
  practicalApplicationAssessment: boolean;

  @Column({ name: 'refresher_training_due', type: 'date', nullable: true })
  refresherTrainingDue: Date;

  // Integration and Reporting
  @Column({ name: 'lms_integration', default: false })
  lmsIntegration: boolean; // Learning Management System

  @Column({ name: 'lms_course_id', length: 100, nullable: true })
  lmsCourseId: string;

  @Column({ name: 'lms_completion_status', length: 50, nullable: true })
  lmsCompletionStatus: string;

  @Column({ name: 'compliance_tracking_updated', default: false })
  complianceTrackingUpdated: boolean;

  @Column({ name: 'performance_impact_tracked', default: false })
  performanceImpactTracked: boolean;

  // Document Management
  @Column({ name: 'training_materials_url', length: 500, nullable: true })
  trainingMaterialsUrl: string;

  @Column({ name: 'attendance_record_url', length: 500, nullable: true })
  attendanceRecordUrl: string;

  @Column({ name: 'assessment_record_url', length: 500, nullable: true })
  assessmentRecordUrl: string;

  @Column({ name: 'evaluation_form_url', length: 500, nullable: true })
  evaluationFormUrl: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  // Cost Center and Reporting
  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'division', length: 100, nullable: true })
  division: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  // Notes and Comments
  @Column({ name: 'training_notes', type: 'text', nullable: true })
  trainingNotes: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'deferral_reason', type: 'text', nullable: true })
  deferralReason: string;

  @Column({ name: 'additional_comments', type: 'text', nullable: true })
  additionalComments: string;

  // Audit Fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Employee, employee => employee.trainings)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Employee, employee => employee.id, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;
}