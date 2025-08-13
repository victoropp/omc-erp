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

export enum PerformanceReviewType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  QUARTERLY = 'QUARTERLY',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT_BASED = 'PROJECT_BASED',
  SPECIAL_REVIEW = 'SPECIAL_REVIEW',
  EXIT_REVIEW = 'EXIT_REVIEW',
  PROMOTION_REVIEW = 'PROMOTION_REVIEW'
}

export enum PerformanceStatus {
  DRAFT = 'DRAFT',
  SELF_ASSESSMENT_PENDING = 'SELF_ASSESSMENT_PENDING',
  SELF_ASSESSMENT_COMPLETE = 'SELF_ASSESSMENT_COMPLETE',
  MANAGER_REVIEW_PENDING = 'MANAGER_REVIEW_PENDING',
  MANAGER_REVIEW_COMPLETE = 'MANAGER_REVIEW_COMPLETE',
  CALIBRATION_PENDING = 'CALIBRATION_PENDING',
  FINALIZED = 'FINALIZED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  DISPUTED = 'DISPUTED',
  CLOSED = 'CLOSED'
}

export enum PerformanceRating {
  OUTSTANDING = 'OUTSTANDING',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY'
}

export enum DevelopmentPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

@Entity('employee_performance')
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'reviewPeriod'])
@Index(['performanceStatus'])
@Index(['overallRating'])
export class EmployeePerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'performance_review_number', length: 50, unique: true })
  performanceReviewNumber: string;

  // Review Information
  @Column({ 
    name: 'review_type', 
    type: 'enum', 
    enum: PerformanceReviewType 
  })
  reviewType: PerformanceReviewType;

  @Column({ 
    name: 'performance_status', 
    type: 'enum', 
    enum: PerformanceStatus,
    default: PerformanceStatus.DRAFT
  })
  performanceStatus: PerformanceStatus;

  @Column({ name: 'review_period', length: 20 })
  reviewPeriod: string; // e.g., "2024-Q1", "2024-ANNUAL"

  @Column({ name: 'review_start_date', type: 'date' })
  reviewStartDate: Date;

  @Column({ name: 'review_end_date', type: 'date' })
  reviewEndDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  // Employee Self Assessment
  @Column({ name: 'self_assessment_submitted', default: false })
  selfAssessmentSubmitted: boolean;

  @Column({ name: 'self_assessment_date', type: 'date', nullable: true })
  selfAssessmentDate: Date;

  @Column({ name: 'self_rating_overall', type: 'decimal', precision: 3, scale: 2, nullable: true })
  selfRatingOverall: number; // Out of 5

  @Column({ name: 'self_assessment_comments', type: 'text', nullable: true })
  selfAssessmentComments: string;

  @Column({ name: 'key_achievements', type: 'text', nullable: true })
  keyAchievements: string;

  @Column({ name: 'challenges_faced', type: 'text', nullable: true })
  challengesFaced: string;

  @Column({ name: 'development_needs_self', type: 'text', nullable: true })
  developmentNeedsSelf: string;

  @Column({ name: 'career_aspirations', type: 'text', nullable: true })
  careerAspirations: string;

  // Manager Assessment
  @Column({ name: 'manager_id' })
  managerId: string;

  @Column({ name: 'manager_name', length: 255 })
  managerName: string;

  @Column({ name: 'manager_assessment_date', type: 'date', nullable: true })
  managerAssessmentDate: Date;

  @Column({ name: 'manager_rating_overall', type: 'decimal', precision: 3, scale: 2, nullable: true })
  managerRatingOverall: number;

  @Column({ name: 'manager_comments', type: 'text', nullable: true })
  managerComments: string;

  @Column({ name: 'manager_feedback', type: 'text', nullable: true })
  managerFeedback: string;

  @Column({ name: 'areas_of_strength', type: 'text', nullable: true })
  areasOfStrength: string;

  @Column({ name: 'areas_for_improvement', type: 'text', nullable: true })
  areasForImprovement: string;

  // Performance Metrics
  @Column({ 
    name: 'overall_rating', 
    type: 'enum', 
    enum: PerformanceRating,
    nullable: true
  })
  overallRating: PerformanceRating;

  @Column({ name: 'overall_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  overallScore: number; // Final calibrated score

  @Column({ name: 'quality_of_work_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  qualityOfWorkRating: number;

  @Column({ name: 'productivity_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  productivityRating: number;

  @Column({ name: 'teamwork_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  teamworkRating: number;

  @Column({ name: 'communication_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  communicationRating: number;

  @Column({ name: 'leadership_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  leadershipRating: number;

  @Column({ name: 'innovation_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  innovationRating: number;

  @Column({ name: 'problem_solving_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  problemSolvingRating: number;

  @Column({ name: 'adaptability_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  adaptabilityRating: number;

  // Ghana OMC Specific Competencies
  @Column({ name: 'safety_compliance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  safetyComplianceRating: number;

  @Column({ name: 'environmental_awareness_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  environmentalAwarenessRating: number;

  @Column({ name: 'regulatory_knowledge_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  regulatoryKnowledgeRating: number;

  @Column({ name: 'customer_service_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  customerServiceRating: number;

  @Column({ name: 'technical_competency_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  technicalCompetencyRating: number;

  @Column({ name: 'petroleum_industry_knowledge', type: 'decimal', precision: 3, scale: 2, nullable: true })
  petroleumIndustryKnowledge: number;

  @Column({ name: 'local_content_compliance', type: 'decimal', precision: 3, scale: 2, nullable: true })
  localContentCompliance: number;

  // Goal Setting and Achievement
  @Column({ name: 'goals_set_count', default: 0 })
  goalsSetCount: number;

  @Column({ name: 'goals_achieved_count', default: 0 })
  goalsAchievedCount: number;

  @Column({ name: 'goals_achievement_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  goalsAchievementPercentage: number;

  @Column({ name: 'kpis_met_count', default: 0 })
  kpisMetCount: number;

  @Column({ name: 'kpis_total_count', default: 0 })
  kpisTotalCount: number;

  @Column({ name: 'project_completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  projectCompletionRate: number;

  @Column({ name: 'deadline_adherence_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  deadlineAdherenceRate: number;

  // Behavioral Competencies
  @Column({ name: 'attendance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  attendanceRating: number;

  @Column({ name: 'punctuality_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  punctualityRating: number;

  @Column({ name: 'initiative_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  initiativeRating: number;

  @Column({ name: 'reliability_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  reliabilityRating: number;

  @Column({ name: 'professionalism_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  professionalismRating: number;

  @Column({ name: 'integrity_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  integrityRating: number;

  // Development Planning
  @Column({ name: 'development_plan_created', default: false })
  developmentPlanCreated: boolean;

  @Column({ name: 'training_needs_identified', type: 'text', nullable: true })
  trainingNeedsIdentified: string; // JSON array

  @Column({ name: 'skill_gaps', type: 'text', nullable: true })
  skillGaps: string;

  @Column({ name: 'development_goals', type: 'text', nullable: true })
  developmentGoals: string;

  @Column({ 
    name: 'development_priority', 
    type: 'enum', 
    enum: DevelopmentPriority,
    default: DevelopmentPriority.MEDIUM
  })
  developmentPriority: DevelopmentPriority;

  @Column({ name: 'mentoring_needed', default: false })
  mentoringNeeded: boolean;

  @Column({ name: 'coaching_needed', default: false })
  coachingNeeded: boolean;

  @Column({ name: 'stretch_assignments', type: 'text', nullable: true })
  stretchAssignments: string;

  // Career Development
  @Column({ name: 'promotion_ready', default: false })
  promotionReady: boolean;

  @Column({ name: 'promotion_timeline', length: 50, nullable: true })
  promotionTimeline: string; // 6_MONTHS, 1_YEAR, 2_YEARS, etc.

  @Column({ name: 'succession_planning_candidate', default: false })
  successionPlanningCandidate: boolean;

  @Column({ name: 'high_potential_employee', default: false })
  highPotentialEmployee: boolean;

  @Column({ name: 'retention_risk', length: 20, default: 'LOW' })
  retentionRisk: string; // LOW, MEDIUM, HIGH

  @Column({ name: 'flight_risk_indicators', type: 'text', nullable: true })
  flightRiskIndicators: string;

  // Performance Improvement
  @Column({ name: 'performance_improvement_required', default: false })
  performanceImprovementRequired: boolean;

  @Column({ name: 'pip_recommended', default: false })
  pipRecommended: boolean; // Performance Improvement Plan

  @Column({ name: 'pip_start_date', type: 'date', nullable: true })
  pipStartDate: Date;

  @Column({ name: 'pip_duration_months', nullable: true })
  pipDurationMonths: number;

  @Column({ name: 'disciplinary_action_required', default: false })
  disciplinaryActionRequired: boolean;

  @Column({ name: 'probation_extension', default: false })
  probationExtension: boolean;

  // Compensation Impact
  @Column({ name: 'salary_increase_recommended', default: false })
  salaryIncreaseRecommended: boolean;

  @Column({ name: 'salary_increase_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryIncreasePercentage: number;

  @Column({ name: 'bonus_eligible', default: false })
  bonusEligible: boolean;

  @Column({ name: 'bonus_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  bonusAmount: number;

  @Column({ name: 'stock_options_eligible', default: false })
  stockOptionsEligible: boolean;

  @Column({ name: 'special_recognition_award', default: false })
  specialRecognitionAward: boolean;

  // Calibration and Review
  @Column({ name: 'calibration_session_id', nullable: true })
  calibrationSessionId: string;

  @Column({ name: 'calibrated_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  calibratedRating: number;

  @Column({ name: 'calibration_notes', type: 'text', nullable: true })
  calibrationNotes: string;

  @Column({ name: 'rating_changed_in_calibration', default: false })
  ratingChangedInCalibration: boolean;

  @Column({ name: 'previous_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  previousRating: number;

  // Employee Acknowledgment
  @Column({ name: 'employee_acknowledged', default: false })
  employeeAcknowledged: boolean;

  @Column({ name: 'employee_acknowledgment_date', type: 'date', nullable: true })
  employeeAcknowledgmentDate: Date;

  @Column({ name: 'employee_signature_url', length: 500, nullable: true })
  employeeSignatureUrl: string;

  @Column({ name: 'employee_dispute', default: false })
  employeeDispute: boolean;

  @Column({ name: 'employee_dispute_reason', type: 'text', nullable: true })
  employeeDisputeReason: string;

  @Column({ name: 'dispute_resolution_notes', type: 'text', nullable: true })
  disputeResolutionNotes: string;

  // Document Management
  @Column({ name: 'review_document_url', length: 500, nullable: true })
  reviewDocumentUrl: string;

  @Column({ name: 'self_assessment_document', length: 500, nullable: true })
  selfAssessmentDocument: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of URLs

  @Column({ name: 'development_plan_document', length: 500, nullable: true })
  developmentPlanDocument: string;

  // Integration and Automation
  @Column({ name: 'hr_system_synced', default: false })
  hrSystemSynced: boolean;

  @Column({ name: 'payroll_impact_processed', default: false })
  payrollImpactProcessed: boolean;

  @Column({ name: 'learning_system_updated', default: false })
  learningSystemUpdated: boolean;

  @Column({ name: 'succession_planning_updated', default: false })
  successionPlanningUpdated: boolean;

  // Analytics and Reporting
  @Column({ name: 'performance_trend', length: 20, nullable: true })
  performanceTrend: string; // IMPROVING, DECLINING, STABLE

  @Column({ name: 'ranking_in_peer_group', nullable: true })
  rankingInPeerGroup: number;

  @Column({ name: 'percentile_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentileScore: number;

  @Column({ name: 'department_average_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  departmentAverageScore: number;

  @Column({ name: 'company_average_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  companyAverageScore: number;

  // Cost Center and Reporting
  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'division', length: 100, nullable: true })
  division: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  @Column({ name: 'reviewer_employee_id', nullable: true })
  reviewerEmployeeId: string;

  @Column({ name: 'reviewer_name', length: 255, nullable: true })
  reviewerName: string;

  // Notes and Comments
  @Column({ name: 'additional_comments', type: 'text', nullable: true })
  additionalComments: string;

  @Column({ name: 'hr_notes', type: 'text', nullable: true })
  hrNotes: string;

  @Column({ name: 'confidential_notes', type: 'text', nullable: true })
  confidentialNotes: string;

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
  @ManyToOne(() => Employee, employee => employee.performanceReviews)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Employee, employee => employee.id)
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @ManyToOne(() => Employee, employee => employee.id, { nullable: true })
  @JoinColumn({ name: 'reviewer_employee_id' })
  reviewer: Employee;
}