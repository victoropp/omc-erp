import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum AuditType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  REGULATORY = 'REGULATORY',
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  COMPLIANCE = 'COMPLIANCE',
  IT_SYSTEMS = 'IT_SYSTEMS',
  QUALITY = 'QUALITY',
  SAFETY = 'SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  SPECIAL_INVESTIGATION = 'SPECIAL_INVESTIGATION',
  FORENSIC = 'FORENSIC',
}

export enum AuditStatus {
  PLANNED = 'PLANNED',
  IN_PREPARATION = 'IN_PREPARATION',
  IN_PROGRESS = 'IN_PROGRESS',
  FIELDWORK_COMPLETE = 'FIELDWORK_COMPLETE',
  DRAFT_REPORT = 'DRAFT_REPORT',
  MANAGEMENT_RESPONSE = 'MANAGEMENT_RESPONSE',
  FINAL_REPORT = 'FINAL_REPORT',
  CLOSED = 'CLOSED',
  FOLLOW_UP = 'FOLLOW_UP',
  CANCELLED = 'CANCELLED',
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  OBSERVATION = 'OBSERVATION',
}

export enum ControlRating {
  EFFECTIVE = 'EFFECTIVE',
  PARTIALLY_EFFECTIVE = 'PARTIALLY_EFFECTIVE',
  INEFFECTIVE = 'INEFFECTIVE',
  NOT_TESTED = 'NOT_TESTED',
}

export enum AuditOpinion {
  UNQUALIFIED = 'UNQUALIFIED',
  QUALIFIED = 'QUALIFIED',
  ADVERSE = 'ADVERSE',
  DISCLAIMER = 'DISCLAIMER',
  SATISFACTORY = 'SATISFACTORY',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

@Entity('audits')
@Index(['tenantId', 'auditNumber'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'auditType'])
@Index(['tenantId', 'startDate'])
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'audit_number', length: 100, unique: true })
  auditNumber: string;

  @Column({ name: 'audit_title', length: 500 })
  auditTitle: string;

  @Column({ name: 'audit_type', type: 'enum', enum: AuditType })
  auditType: AuditType;

  @Column({ name: 'status', type: 'enum', enum: AuditStatus, default: AuditStatus.PLANNED })
  status: AuditStatus;

  // Audit Scope and Objectives
  @Column({ name: 'audit_objective', type: 'text' })
  auditObjective: string;

  @Column({ name: 'audit_scope', type: 'text' })
  auditScope: string;

  @Column({ name: 'audit_criteria', type: 'text', nullable: true })
  auditCriteria: string;

  @Column({ name: 'audit_methodology', type: 'text', nullable: true })
  auditMethodology: string;

  @Column({ name: 'departments_covered', type: 'simple-array', nullable: true })
  departmentsCovered: string[];

  @Column({ name: 'processes_reviewed', type: 'simple-array', nullable: true })
  processesReviewed: string[];

  @Column({ name: 'systems_reviewed', type: 'simple-array', nullable: true })
  systemsReviewed: string[];

  @Column({ name: 'locations_covered', type: 'simple-array', nullable: true })
  locationsCovered: string[];

  // Audit Period and Timeline
  @Column({ name: 'audit_period_from', type: 'date', nullable: true })
  auditPeriodFrom: Date;

  @Column({ name: 'audit_period_to', type: 'date', nullable: true })
  auditPeriodTo: Date;

  @Column({ name: 'planned_start_date', type: 'date' })
  plannedStartDate: Date;

  @Column({ name: 'planned_end_date', type: 'date' })
  plannedEndDate: Date;

  @Column({ name: 'actual_start_date', type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'fieldwork_start_date', type: 'date', nullable: true })
  fieldworkStartDate: Date;

  @Column({ name: 'fieldwork_end_date', type: 'date', nullable: true })
  fieldworkEndDate: Date;

  @Column({ name: 'report_issue_date', type: 'date', nullable: true })
  reportIssueDate: Date;

  // Audit Team
  @Column({ name: 'lead_auditor_id', length: 50, nullable: true })
  leadAuditorId: string;

  @Column({ name: 'lead_auditor_name', length: 255, nullable: true })
  leadAuditorName: string;

  @Column({ name: 'audit_team_members', type: 'simple-json', nullable: true })
  auditTeamMembers: any[];

  @Column({ name: 'external_auditor_firm', length: 255, nullable: true })
  externalAuditorFirm: string;

  @Column({ name: 'audit_partner', length: 255, nullable: true })
  auditPartner: string;

  @Column({ name: 'audit_manager', length: 255, nullable: true })
  auditManager: string;

  // Budget and Resources
  @Column({ name: 'budgeted_hours', type: 'int', nullable: true })
  budgetedHours: number;

  @Column({ name: 'actual_hours', type: 'int', nullable: true })
  actualHours: number;

  @Column({ name: 'budgeted_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetedCost: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualCost: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  // Risk Assessment
  @Column({ name: 'risk_assessment_completed', type: 'boolean', default: false })
  riskAssessmentCompleted: boolean;

  @Column({ name: 'inherent_risk_level', length: 50, nullable: true })
  inherentRiskLevel: string;

  @Column({ name: 'control_risk_level', length: 50, nullable: true })
  controlRiskLevel: string;

  @Column({ name: 'detection_risk_level', length: 50, nullable: true })
  detectionRiskLevel: string;

  @Column({ name: 'audit_risk_level', length: 50, nullable: true })
  auditRiskLevel: string;

  @Column({ name: 'materiality_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true })
  materialityThreshold: number;

  // Findings Summary
  @Column({ name: 'total_findings', type: 'int', default: 0 })
  totalFindings: number;

  @Column({ name: 'critical_findings', type: 'int', default: 0 })
  criticalFindings: number;

  @Column({ name: 'high_findings', type: 'int', default: 0 })
  highFindings: number;

  @Column({ name: 'medium_findings', type: 'int', default: 0 })
  mediumFindings: number;

  @Column({ name: 'low_findings', type: 'int', default: 0 })
  lowFindings: number;

  @Column({ name: 'observations_count', type: 'int', default: 0 })
  observationsCount: number;

  @Column({ name: 'recommendations_count', type: 'int', default: 0 })
  recommendationsCount: number;

  @Column({ name: 'accepted_recommendations', type: 'int', default: 0 })
  acceptedRecommendations: number;

  @Column({ name: 'implemented_recommendations', type: 'int', default: 0 })
  implementedRecommendations: number;

  // Control Testing
  @Column({ name: 'controls_tested', type: 'int', default: 0 })
  controlsTested: number;

  @Column({ name: 'controls_effective', type: 'int', default: 0 })
  controlsEffective: number;

  @Column({ name: 'controls_partially_effective', type: 'int', default: 0 })
  controlsPartiallyEffective: number;

  @Column({ name: 'controls_ineffective', type: 'int', default: 0 })
  controlsIneffective: number;

  @Column({ name: 'control_effectiveness_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  controlEffectivenessRate: number;

  // Compliance Assessment
  @Column({ name: 'compliance_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceRate: number;

  @Column({ name: 'regulations_reviewed', type: 'simple-array', nullable: true })
  regulationsReviewed: string[];

  @Column({ name: 'policies_reviewed', type: 'simple-array', nullable: true })
  policiesReviewed: string[];

  @Column({ name: 'compliance_violations', type: 'int', default: 0 })
  complianceViolations: number;

  // Ghana Specific Compliance
  @Column({ name: 'npa_compliance_checked', type: 'boolean', default: false })
  npaComplianceChecked: boolean;

  @Column({ name: 'gra_compliance_checked', type: 'boolean', default: false })
  graComplianceChecked: boolean;

  @Column({ name: 'epa_compliance_checked', type: 'boolean', default: false })
  epaComplianceChecked: boolean;

  @Column({ name: 'bog_compliance_checked', type: 'boolean', default: false })
  bogComplianceChecked: boolean;

  @Column({ name: 'local_content_compliance', type: 'boolean', default: false })
  localContentCompliance: boolean;

  // Audit Opinion and Rating
  @Column({ name: 'audit_opinion', type: 'enum', enum: AuditOpinion, nullable: true })
  auditOpinion: AuditOpinion;

  @Column({ name: 'overall_rating', length: 50, nullable: true })
  overallRating: string;

  @Column({ name: 'executive_summary', type: 'text', nullable: true })
  executiveSummary: string;

  @Column({ name: 'key_conclusions', type: 'text', nullable: true })
  keyConclusions: string;

  // Management Response
  @Column({ name: 'management_response_received', type: 'boolean', default: false })
  managementResponseReceived: boolean;

  @Column({ name: 'management_response_date', type: 'date', nullable: true })
  managementResponseDate: Date;

  @Column({ name: 'management_action_plan', type: 'text', nullable: true })
  managementActionPlan: string;

  @Column({ name: 'disagreements_with_management', type: 'text', nullable: true })
  disagreementsWithManagement: string;

  // Follow-up
  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_status', length: 50, nullable: true })
  followUpStatus: string;

  @Column({ name: 'issues_resolved', type: 'int', default: 0 })
  issuesResolved: number;

  @Column({ name: 'issues_outstanding', type: 'int', default: 0 })
  issuesOutstanding: number;

  // Financial Impact
  @Column({ name: 'errors_identified_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  errorsIdentifiedAmount: number;

  @Column({ name: 'recoveries_identified', type: 'decimal', precision: 15, scale: 2, default: 0 })
  recoveriesIdentified: number;

  @Column({ name: 'cost_savings_identified', type: 'decimal', precision: 15, scale: 2, default: 0 })
  costSavingsIdentified: number;

  @Column({ name: 'revenue_enhancement_identified', type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenueEnhancementIdentified: number;

  @Column({ name: 'fraud_amount_identified', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fraudAmountIdentified: number;

  // Sampling and Testing
  @Column({ name: 'sample_size', type: 'int', nullable: true })
  sampleSize: number;

  @Column({ name: 'population_size', type: 'int', nullable: true })
  populationSize: number;

  @Column({ name: 'sampling_method', length: 100, nullable: true })
  samplingMethod: string;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceLevel: number;

  @Column({ name: 'error_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  errorRate: number;

  // Documentation
  @Column({ name: 'audit_program_ref', length: 100, nullable: true })
  auditProgramRef: string;

  @Column({ name: 'working_papers_ref', length: 100, nullable: true })
  workingPapersRef: string;

  @Column({ name: 'draft_report_url', length: 500, nullable: true })
  draftReportUrl: string;

  @Column({ name: 'final_report_url', length: 500, nullable: true })
  finalReportUrl: string;

  @Column({ name: 'management_letter_url', length: 500, nullable: true })
  managementLetterUrl: string;

  @Column({ name: 'supporting_documents', type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  // Quality Assurance
  @Column({ name: 'quality_review_completed', type: 'boolean', default: false })
  qualityReviewCompleted: boolean;

  @Column({ name: 'quality_reviewer', length: 255, nullable: true })
  qualityReviewer: string;

  @Column({ name: 'quality_review_date', type: 'date', nullable: true })
  qualityReviewDate: Date;

  @Column({ name: 'quality_review_comments', type: 'text', nullable: true })
  qualityReviewComments: string;

  // Reporting
  @Column({ name: 'reported_to_board', type: 'boolean', default: false })
  reportedToBoard: boolean;

  @Column({ name: 'board_presentation_date', type: 'date', nullable: true })
  boardPresentationDate: Date;

  @Column({ name: 'reported_to_regulator', type: 'boolean', default: false })
  reportedToRegulator: boolean;

  @Column({ name: 'regulator_submission_date', type: 'date', nullable: true })
  regulatorSubmissionDate: Date;

  @Column({ name: 'public_disclosure_required', type: 'boolean', default: false })
  publicDisclosureRequired: boolean;

  // Additional Information
  @Column({ name: 'previous_audit_ref', length: 100, nullable: true })
  previousAuditRef: string;

  @Column({ name: 'next_audit_date', type: 'date', nullable: true })
  nextAuditDate: Date;

  @Column({ name: 'lessons_learned', type: 'text', nullable: true })
  lessonsLearned: string;

  @Column({ name: 'best_practices_identified', type: 'text', nullable: true })
  bestPracticesIdentified: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_confidential', type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ name: 'requires_ceo_attention', type: 'boolean', default: false })
  requiresCeoAttention: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  // Calculated fields
  @BeforeInsert()
  @BeforeUpdate()
  calculateFields() {
    // Calculate total findings
    this.totalFindings = this.criticalFindings + this.highFindings + 
                        this.mediumFindings + this.lowFindings + this.observationsCount;

    // Calculate control effectiveness rate
    if (this.controlsTested > 0) {
      this.controlEffectivenessRate = (this.controlsEffective / this.controlsTested) * 100;
    }

    // Calculate error rate
    if (this.sampleSize > 0 && this.errorsIdentifiedAmount > 0) {
      // This would be calculated based on actual errors found
    }

    // Set CEO attention flag
    this.requiresCeoAttention = this.criticalFindings > 0 || 
                                this.fraudAmountIdentified > 0 ||
                                this.auditOpinion === AuditOpinion.ADVERSE ||
                                this.auditOpinion === AuditOpinion.DISCLAIMER;

    // Set board reportable
    this.reportedToBoard = this.requiresCeoAttention || 
                           this.highFindings > 3 ||
                           this.complianceViolations > 0;

    // Generate audit number if not exists
    if (!this.auditNumber) {
      const typePrefix = {
        INTERNAL: 'INT',
        EXTERNAL: 'EXT',
        REGULATORY: 'REG',
        FINANCIAL: 'FIN',
        OPERATIONAL: 'OPS',
        COMPLIANCE: 'COM',
        IT_SYSTEMS: 'ITS',
        QUALITY: 'QUA',
        SAFETY: 'SAF',
        ENVIRONMENTAL: 'ENV',
        SPECIAL_INVESTIGATION: 'SPI',
        FORENSIC: 'FOR',
      };
      const prefix = typePrefix[this.auditType] || 'AUD';
      this.auditNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  }
}