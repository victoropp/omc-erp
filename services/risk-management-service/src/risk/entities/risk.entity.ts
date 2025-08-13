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

export enum RiskCategory {
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  STRATEGIC = 'STRATEGIC',
  COMPLIANCE = 'COMPLIANCE',
  REPUTATIONAL = 'REPUTATIONAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  SAFETY = 'SAFETY',
  CYBER_SECURITY = 'CYBER_SECURITY',
  MARKET = 'MARKET',
  CREDIT = 'CREDIT',
  LIQUIDITY = 'LIQUIDITY',
  FOREIGN_EXCHANGE = 'FOREIGN_EXCHANGE',
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ASSESSED = 'ASSESSED',
  MITIGATED = 'MITIGATED',
  ACCEPTED = 'ACCEPTED',
  TRANSFERRED = 'TRANSFERRED',
  AVOIDED = 'AVOIDED',
  MONITORING = 'MONITORING',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

export enum RiskLikelihood {
  RARE = 'RARE', // 1
  UNLIKELY = 'UNLIKELY', // 2
  POSSIBLE = 'POSSIBLE', // 3
  LIKELY = 'LIKELY', // 4
  ALMOST_CERTAIN = 'ALMOST_CERTAIN', // 5
}

export enum RiskImpact {
  NEGLIGIBLE = 'NEGLIGIBLE', // 1
  MINOR = 'MINOR', // 2
  MODERATE = 'MODERATE', // 3
  MAJOR = 'MAJOR', // 4
  CATASTROPHIC = 'CATASTROPHIC', // 5
}

export enum RiskLevel {
  LOW = 'LOW', // 1-4
  MEDIUM = 'MEDIUM', // 5-9
  HIGH = 'HIGH', // 10-16
  CRITICAL = 'CRITICAL', // 17-25
}

export enum RiskTrend {
  INCREASING = 'INCREASING',
  STABLE = 'STABLE',
  DECREASING = 'DECREASING',
  VOLATILE = 'VOLATILE',
}

@Entity('risks')
@Index(['tenantId', 'riskCode'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'category'])
@Index(['tenantId', 'riskLevel'])
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'risk_code', length: 50, unique: true })
  riskCode: string;

  @Column({ name: 'risk_title', length: 500 })
  riskTitle: string;

  @Column({ name: 'risk_description', type: 'text' })
  riskDescription: string;

  // Risk Classification
  @Column({ name: 'category', type: 'enum', enum: RiskCategory })
  category: RiskCategory;

  @Column({ name: 'sub_category', length: 100, nullable: true })
  subCategory: string;

  @Column({ name: 'status', type: 'enum', enum: RiskStatus, default: RiskStatus.IDENTIFIED })
  status: RiskStatus;

  @Column({ name: 'risk_type', length: 100, nullable: true })
  riskType: string; // Specific type within category

  // Risk Assessment
  @Column({ name: 'likelihood', type: 'enum', enum: RiskLikelihood })
  likelihood: RiskLikelihood;

  @Column({ name: 'likelihood_score', type: 'int', default: 1 })
  likelihoodScore: number; // 1-5

  @Column({ name: 'impact', type: 'enum', enum: RiskImpact })
  impact: RiskImpact;

  @Column({ name: 'impact_score', type: 'int', default: 1 })
  impactScore: number; // 1-5

  @Column({ name: 'inherent_risk_score', type: 'int', default: 1 })
  inherentRiskScore: number; // likelihood * impact (1-25)

  @Column({ name: 'inherent_risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  inherentRiskLevel: RiskLevel;

  @Column({ name: 'residual_likelihood', type: 'enum', enum: RiskLikelihood, nullable: true })
  residualLikelihood: RiskLikelihood;

  @Column({ name: 'residual_impact', type: 'enum', enum: RiskImpact, nullable: true })
  residualImpact: RiskImpact;

  @Column({ name: 'residual_risk_score', type: 'int', nullable: true })
  residualRiskScore: number;

  @Column({ name: 'residual_risk_level', type: 'enum', enum: RiskLevel, nullable: true })
  residualRiskLevel: RiskLevel;

  @Column({ name: 'risk_appetite', type: 'enum', enum: RiskLevel, default: RiskLevel.MEDIUM })
  riskAppetite: RiskLevel;

  @Column({ name: 'risk_tolerance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  riskTolerance: number; // Financial tolerance amount

  // Risk Metrics
  @Column({ name: 'risk_velocity', length: 50, nullable: true })
  riskVelocity: string; // SLOW, MEDIUM, FAST - How quickly risk impacts

  @Column({ name: 'risk_trend', type: 'enum', enum: RiskTrend, default: RiskTrend.STABLE })
  riskTrend: RiskTrend;

  @Column({ name: 'detection_difficulty', length: 50, nullable: true })
  detectionDifficulty: string; // EASY, MODERATE, DIFFICULT

  @Column({ name: 'control_effectiveness', type: 'decimal', precision: 5, scale: 2, default: 0 })
  controlEffectiveness: number; // 0-100%

  // Financial Impact
  @Column({ name: 'potential_loss_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  potentialLossAmount: number;

  @Column({ name: 'actual_loss_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualLossAmount: number;

  @Column({ name: 'mitigation_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  mitigationCost: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'probability_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  probabilityPercentage: number; // Statistical probability

  // Risk Source and Triggers
  @Column({ name: 'risk_source', type: 'text', nullable: true })
  riskSource: string;

  @Column({ name: 'risk_triggers', type: 'simple-array', nullable: true })
  riskTriggers: string[];

  @Column({ name: 'early_warning_indicators', type: 'simple-array', nullable: true })
  earlyWarningIndicators: string[];

  @Column({ name: 'affected_departments', type: 'simple-array', nullable: true })
  affectedDepartments: string[];

  @Column({ name: 'affected_processes', type: 'simple-array', nullable: true })
  affectedProcesses: string[];

  @Column({ name: 'affected_systems', type: 'simple-array', nullable: true })
  affectedSystems: string[];

  // Ghana Specific Risks
  @Column({ name: 'regulatory_body', length: 100, nullable: true })
  regulatoryBody: string; // NPA, EPA, GRA, BOG, etc.

  @Column({ name: 'regulatory_requirement', type: 'text', nullable: true })
  regulatoryRequirement: string;

  @Column({ name: 'compliance_deadline', type: 'date', nullable: true })
  complianceDeadline: Date;

  @Column({ name: 'political_risk_factor', type: 'boolean', default: false })
  politicalRiskFactor: boolean;

  @Column({ name: 'forex_exposure', type: 'decimal', precision: 15, scale: 2, nullable: true })
  forexExposure: number;

  @Column({ name: 'petroleum_price_sensitivity', type: 'decimal', precision: 5, scale: 2, nullable: true })
  petroleumPriceSensitivity: number; // Percentage impact per dollar change

  // Risk Ownership
  @Column({ name: 'risk_owner_id', length: 50, nullable: true })
  riskOwnerId: string;

  @Column({ name: 'risk_owner_name', length: 255, nullable: true })
  riskOwnerName: string;

  @Column({ name: 'risk_owner_department', length: 100, nullable: true })
  riskOwnerDepartment: string;

  @Column({ name: 'risk_champion_id', length: 50, nullable: true })
  riskChampionId: string;

  @Column({ name: 'risk_champion_name', length: 255, nullable: true })
  riskChampionName: string;

  @Column({ name: 'escalation_contact', length: 255, nullable: true })
  escalationContact: string;

  // Risk Response and Mitigation
  @Column({ name: 'mitigation_strategy', type: 'text', nullable: true })
  mitigationStrategy: string;

  @Column({ name: 'mitigation_actions', type: 'simple-json', nullable: true })
  mitigationActions: any[];

  @Column({ name: 'control_measures', type: 'simple-json', nullable: true })
  controlMeasures: any[];

  @Column({ name: 'contingency_plan', type: 'text', nullable: true })
  contingencyPlan: string;

  @Column({ name: 'recovery_plan', type: 'text', nullable: true })
  recoveryPlan: string;

  @Column({ name: 'insurance_coverage', type: 'boolean', default: false })
  insuranceCoverage: boolean;

  @Column({ name: 'insurance_policy_number', length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCoverageAmount: number;

  // Risk Timeline
  @Column({ name: 'identification_date', type: 'date' })
  identificationDate: Date;

  @Column({ name: 'assessment_date', type: 'date', nullable: true })
  assessmentDate: Date;

  @Column({ name: 'mitigation_start_date', type: 'date', nullable: true })
  mitigationStartDate: Date;

  @Column({ name: 'mitigation_target_date', type: 'date', nullable: true })
  mitigationTargetDate: Date;

  @Column({ name: 'mitigation_completion_date', type: 'date', nullable: true })
  mitigationCompletionDate: Date;

  @Column({ name: 'last_review_date', type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ name: 'closure_date', type: 'date', nullable: true })
  closureDate: Date;

  // Risk Monitoring
  @Column({ name: 'monitoring_frequency', length: 50, nullable: true })
  monitoringFrequency: string; // DAILY, WEEKLY, MONTHLY, QUARTERLY

  @Column({ name: 'kri_metrics', type: 'simple-json', nullable: true })
  kriMetrics: any[]; // Key Risk Indicators

  @Column({ name: 'kri_threshold_breached', type: 'boolean', default: false })
  kriThresholdBreached: boolean;

  @Column({ name: 'incidents_count', type: 'int', default: 0 })
  incidentsCount: number;

  @Column({ name: 'near_misses_count', type: 'int', default: 0 })
  nearMissesCount: number;

  @Column({ name: 'last_incident_date', type: 'date', nullable: true })
  lastIncidentDate: Date;

  // Risk Reporting
  @Column({ name: 'board_reportable', type: 'boolean', default: false })
  boardReportable: boolean;

  @Column({ name: 'regulatory_reportable', type: 'boolean', default: false })
  regulatoryReportable: boolean;

  @Column({ name: 'reported_to_board_date', type: 'date', nullable: true })
  reportedToBoardDate: Date;

  @Column({ name: 'reported_to_regulator_date', type: 'date', nullable: true })
  reportedToRegulatorDate: Date;

  @Column({ name: 'external_audit_finding', type: 'boolean', default: false })
  externalAuditFinding: boolean;

  @Column({ name: 'internal_audit_finding', type: 'boolean', default: false })
  internalAuditFinding: boolean;

  // Risk Interconnections
  @Column({ name: 'related_risks', type: 'simple-array', nullable: true })
  relatedRisks: string[]; // Risk IDs

  @Column({ name: 'parent_risk_id', length: 50, nullable: true })
  parentRiskId: string;

  @Column({ name: 'causes_risks', type: 'simple-array', nullable: true })
  causesRisks: string[]; // Downstream risk IDs

  @Column({ name: 'caused_by_risks', type: 'simple-array', nullable: true })
  causedByRisks: string[]; // Upstream risk IDs

  // Documentation and Evidence
  @Column({ name: 'risk_register_entry', type: 'boolean', default: true })
  riskRegisterEntry: boolean;

  @Column({ name: 'supporting_documents', type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ name: 'assessment_methodology', length: 100, nullable: true })
  assessmentMethodology: string;

  @Column({ name: 'data_sources', type: 'simple-array', nullable: true })
  dataSources: string[];

  // Risk Scoring History
  @Column({ name: 'score_history', type: 'simple-json', nullable: true })
  scoreHistory: any[];

  @Column({ name: 'assessment_history', type: 'simple-json', nullable: true })
  assessmentHistory: any[];

  // Additional Information
  @Column({ name: 'business_impact_analysis', type: 'text', nullable: true })
  businessImpactAnalysis: string;

  @Column({ name: 'stakeholder_impact', type: 'text', nullable: true })
  stakeholderImpact: string;

  @Column({ name: 'lessons_learned', type: 'text', nullable: true })
  lessonsLearned: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_critical', type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ name: 'requires_immediate_action', type: 'boolean', default: false })
  requiresImmediateAction: boolean;

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
    // Calculate likelihood and impact scores
    const likelihoodMap = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
    const impactMap = { NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };

    this.likelihoodScore = likelihoodMap[this.likelihood] || 1;
    this.impactScore = impactMap[this.impact] || 1;

    // Calculate inherent risk score
    this.inherentRiskScore = this.likelihoodScore * this.impactScore;

    // Determine inherent risk level
    if (this.inherentRiskScore <= 4) {
      this.inherentRiskLevel = RiskLevel.LOW;
    } else if (this.inherentRiskScore <= 9) {
      this.inherentRiskLevel = RiskLevel.MEDIUM;
    } else if (this.inherentRiskScore <= 16) {
      this.inherentRiskLevel = RiskLevel.HIGH;
    } else {
      this.inherentRiskLevel = RiskLevel.CRITICAL;
    }

    // Calculate residual risk if applicable
    if (this.residualLikelihood && this.residualImpact) {
      const residualLikelihoodScore = likelihoodMap[this.residualLikelihood] || 1;
      const residualImpactScore = impactMap[this.residualImpact] || 1;
      this.residualRiskScore = residualLikelihoodScore * residualImpactScore;

      // Determine residual risk level
      if (this.residualRiskScore <= 4) {
        this.residualRiskLevel = RiskLevel.LOW;
      } else if (this.residualRiskScore <= 9) {
        this.residualRiskLevel = RiskLevel.MEDIUM;
      } else if (this.residualRiskScore <= 16) {
        this.residualRiskLevel = RiskLevel.HIGH;
      } else {
        this.residualRiskLevel = RiskLevel.CRITICAL;
      }
    }

    // Set critical flag
    this.isCritical = this.inherentRiskLevel === RiskLevel.CRITICAL;
    this.requiresImmediateAction = this.isCritical || this.inherentRiskLevel === RiskLevel.HIGH;

    // Set board reportable
    this.boardReportable = this.inherentRiskLevel === RiskLevel.CRITICAL || 
                           this.inherentRiskLevel === RiskLevel.HIGH;

    // Generate risk code if not exists
    if (!this.riskCode) {
      const categoryPrefix = {
        OPERATIONAL: 'OPR',
        FINANCIAL: 'FIN',
        STRATEGIC: 'STR',
        COMPLIANCE: 'COM',
        REPUTATIONAL: 'REP',
        ENVIRONMENTAL: 'ENV',
        SAFETY: 'SAF',
        CYBER_SECURITY: 'CYB',
        MARKET: 'MKT',
        CREDIT: 'CRD',
        LIQUIDITY: 'LIQ',
        FOREIGN_EXCHANGE: 'FEX',
      };
      const prefix = categoryPrefix[this.category] || 'RSK';
      this.riskCode = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  }
}