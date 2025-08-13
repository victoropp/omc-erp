import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { ProjectTransaction } from './project-transaction.entity';
import { ProjectBudget } from './project-budget.entity';
import { ProjectWBS } from './project-wbs.entity';

export enum ProjectType {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  CONSTRUCTION = 'CONSTRUCTION',
  EXPLORATION = 'EXPLORATION',
  REFINERY_UPGRADE = 'REFINERY_UPGRADE',
  PIPELINE = 'PIPELINE',
  STORAGE_FACILITY = 'STORAGE_FACILITY',
  RETAIL_OUTLET = 'RETAIL_OUTLET',
  ENVIRONMENTAL_REMEDIATION = 'ENVIRONMENTAL_REMEDIATION',
  SAFETY_UPGRADE = 'SAFETY_UPGRADE',
  TECHNOLOGY_IMPLEMENTATION = 'TECHNOLOGY_IMPLEMENTATION',
  MAINTENANCE = 'MAINTENANCE',
  COMPLIANCE = 'COMPLIANCE',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  MARKETING_CAMPAIGN = 'MARKETING_CAMPAIGN',
  TRAINING_PROGRAM = 'TRAINING_PROGRAM'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED'
}

export enum ProjectPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum RevenueRecognitionMethod {
  PERCENTAGE_OF_COMPLETION = 'PERCENTAGE_OF_COMPLETION',
  COMPLETED_CONTRACT = 'COMPLETED_CONTRACT',
  COST_RECOVERY = 'COST_RECOVERY',
  MILESTONE = 'MILESTONE',
  TIME_AND_MATERIALS = 'TIME_AND_MATERIALS'
}

@Entity('projects')
@Index(['tenantId', 'projectCode'])
@Index(['tenantId', 'projectType'])
@Index(['tenantId', 'status'])
@Index(['customerId'])
@Index(['startDate', 'endDate'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'project_code', length: 50, unique: true })
  projectCode: string;

  @Column({ name: 'project_name', length: 255 })
  projectName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'project_type', 
    type: 'enum', 
    enum: ProjectType 
  })
  projectType: ProjectType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status: ProjectStatus;

  @Column({ 
    name: 'priority', 
    type: 'enum', 
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM
  })
  priority: ProjectPriority;

  // Hierarchy and Organization
  @Column({ name: 'parent_project_id', nullable: true })
  parentProjectId: string;

  @Column({ name: 'program_id', nullable: true })
  programId: string;

  @Column({ name: 'portfolio_id', nullable: true })
  portfolioId: string;

  @Column({ name: 'project_level', default: 1 })
  projectLevel: number;

  @Column({ name: 'wbs_enabled', default: true })
  wbsEnabled: boolean;

  // Customer and Contract Information
  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({ name: 'customer_name', length: 255, nullable: true })
  customerName: string;

  @Column({ name: 'contract_number', length: 100, nullable: true })
  contractNumber: string;

  @Column({ name: 'contract_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  contractValue: number;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date;

  // Project Timeline
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'planned_end_date', type: 'date' })
  plannedEndDate: Date;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'baseline_start_date', type: 'date', nullable: true })
  baselineStartDate: Date;

  @Column({ name: 'baseline_end_date', type: 'date', nullable: true })
  baselineEndDate: Date;

  @Column({ name: 'duration_days', nullable: true })
  durationDays: number;

  @Column({ name: 'remaining_days', nullable: true })
  remainingDays: number;

  // Financial Information
  @Column({ name: 'total_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ name: 'approved_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  approvedBudget: number;

  @Column({ name: 'baseline_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  baselineBudget: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'committed_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedCost: number;

  @Column({ name: 'estimated_cost_to_complete', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCostToComplete: number;

  @Column({ name: 'estimated_total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedTotalCost: number; // Actual + ETC

  @Column({ name: 'budget_variance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetVariance: number;

  @Column({ name: 'budget_variance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  budgetVariancePercentage: number;

  // Revenue Recognition
  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'recognized_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  recognizedRevenue: number;

  @Column({ name: 'billed_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  billedAmount: number;

  @Column({ name: 'unbilled_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unbilledRevenue: number;

  @Column({ name: 'deferred_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deferredRevenue: number;

  @Column({ 
    name: 'revenue_recognition_method', 
    type: 'enum', 
    enum: RevenueRecognitionMethod,
    default: RevenueRecognitionMethod.PERCENTAGE_OF_COMPLETION
  })
  revenueRecognitionMethod: RevenueRecognitionMethod;

  // Performance Metrics
  @Column({ name: 'percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentComplete: number;

  @Column({ name: 'physical_percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  physicalPercentComplete: number;

  @Column({ name: 'cost_percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  costPercentComplete: number;

  @Column({ name: 'schedule_performance_index', type: 'decimal', precision: 5, scale: 4, default: 1 })
  schedulePerformanceIndex: number; // SPI = EV / PV

  @Column({ name: 'cost_performance_index', type: 'decimal', precision: 5, scale: 4, default: 1 })
  costPerformanceIndex: number; // CPI = EV / AC

  @Column({ name: 'earned_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  earnedValue: number; // EV = % Complete × Budget

  @Column({ name: 'planned_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  plannedValue: number; // PV = Planned % Complete × Budget

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_license_number', length: 100, nullable: true })
  petroleumLicenseNumber: string;

  @Column({ name: 'block_area', length: 100, nullable: true })
  blockArea: string;

  @Column({ name: 'drilling_depth_meters', type: 'decimal', precision: 10, scale: 2, nullable: true })
  drillingDepthMeters: number;

  @Column({ name: 'estimated_reserves_barrels', type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedReservesBarrels: number;

  @Column({ name: 'production_capacity_bpd', type: 'decimal', precision: 15, scale: 2, nullable: true })
  productionCapacityBPD: number; // Barrels per day

  @Column({ name: 'refinery_capacity_bpd', type: 'decimal', precision: 15, scale: 2, nullable: true })
  refineryCapacityBPD: number;

  @Column({ name: 'pipeline_length_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pipelineLengthKm: number;

  @Column({ name: 'storage_capacity_liters', type: 'decimal', precision: 15, scale: 2, nullable: true })
  storageCapacityLiters: number;

  @Column({ name: 'retail_outlets_count', nullable: true })
  retailOutletsCount: number;

  // Environmental and Regulatory
  @Column({ name: 'environmental_impact_assessment', default: false })
  environmentalImpactAssessment: boolean;

  @Column({ name: 'eia_approval_date', type: 'date', nullable: true })
  eiaApprovalDate: Date;

  @Column({ name: 'epa_permit_required', default: false })
  epaPermitRequired: boolean;

  @Column({ name: 'epa_permit_number', length: 100, nullable: true })
  epaPermitNumber: string;

  @Column({ name: 'local_content_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  localContentPercentage: number;

  @Column({ name: 'local_participation_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  localParticipationValue: number;

  // Project Team and Management
  @Column({ name: 'project_manager_id', nullable: true })
  projectManagerId: string;

  @Column({ name: 'project_manager_name', length: 255, nullable: true })
  projectManagerName: string;

  @Column({ name: 'sponsor_id', nullable: true })
  sponsorId: string;

  @Column({ name: 'sponsor_name', length: 255, nullable: true })
  sponsorName: string;

  @Column({ name: 'team_size', default: 0 })
  teamSize: number;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'business_unit', length: 100, nullable: true })
  businessUnit: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  // Risk and Quality
  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  riskScore: number; // 0-100 scale

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  qualityScore: number;

  @Column({ name: 'health_safety_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  healthSafetyScore: number;

  @Column({ name: 'environmental_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  environmentalScore: number;

  @Column({ name: 'overall_project_health', length: 20, default: 'GREEN' })
  overallProjectHealth: string; // GREEN, YELLOW, RED

  // IFRS and Accounting Standards
  @Column({ name: 'ifrs_classification', length: 50, default: 'CAPITAL_PROJECT' })
  ifrsClassification: string;

  @Column({ name: 'asset_category', length: 100, nullable: true })
  assetCategory: string;

  @Column({ name: 'capitalization_threshold', type: 'decimal', precision: 15, scale: 2, default: 0 })
  capitalizationThreshold: number;

  @Column({ name: 'accumulated_costs', type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulatedCosts: number;

  @Column({ name: 'costs_to_be_capitalized', type: 'decimal', precision: 15, scale: 2, default: 0 })
  toBeCapitalized: number;

  @Column({ name: 'costs_to_be_expensed', type: 'decimal', precision: 15, scale: 2, default: 0 })
  toBeExpensed: number;

  // Billing and Invoicing
  @Column({ name: 'billing_method', length: 50, default: 'MILESTONE' })
  billingMethod: string; // MILESTONE, PERCENTAGE, TIME_MATERIALS, FIXED_PRICE

  @Column({ name: 'billing_frequency', length: 20, default: 'MONTHLY' })
  billingFrequency: string;

  @Column({ name: 'retention_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  retentionPercentage: number;

  @Column({ name: 'retention_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  retentionAmount: number;

  @Column({ name: 'advance_payment_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  advancePaymentPercentage: number;

  @Column({ name: 'advance_payment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  advancePaymentAmount: number;

  // Currency and Exchange
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'functional_currency', length: 3, default: 'GHS' })
  functionalCurrency: string;

  @Column({ name: 'reporting_currency', length: 3, default: 'GHS' })
  reportingCurrency: string;

  @Column({ name: 'exchange_rate_date', nullable: true })
  exchangeRateDate: Date;

  // Approval Workflow
  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_level', nullable: true })
  approvalLevel: number;

  @Column({ name: 'requires_board_approval', default: false })
  requiresBoardApproval: boolean;

  @Column({ name: 'board_approval_date', nullable: true })
  boardApprovalDate: Date;

  // Supporting Information
  @Column({ name: 'objectives', type: 'text', nullable: true })
  objectives: string;

  @Column({ name: 'deliverables', type: 'text', nullable: true })
  deliverables: string; // JSON array

  @Column({ name: 'key_milestones', type: 'text', nullable: true })
  keyMilestones: string; // JSON array

  @Column({ name: 'success_criteria', type: 'text', nullable: true })
  successCriteria: string; // JSON array

  @Column({ name: 'assumptions', type: 'text', nullable: true })
  assumptions: string; // JSON array

  @Column({ name: 'constraints', type: 'text', nullable: true })
  constraints: string; // JSON array

  @Column({ name: 'risks', type: 'text', nullable: true })
  risks: string; // JSON array

  // Integration and External Systems
  @Column({ name: 'external_project_id', length: 100, nullable: true })
  externalProjectId: string;

  @Column({ name: 'source_system', length: 50, nullable: true })
  sourceSystem: string;

  @Column({ name: 'integration_status', length: 20, default: 'SYNCED' })
  integrationStatus: string;

  @Column({ name: 'last_sync_date', nullable: true })
  lastSyncDate: Date;

  // Templates and Configuration
  @Column({ name: 'project_template_id', nullable: true })
  projectTemplateId: string;

  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON for tenant-specific fields

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array

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
  @ManyToOne(() => Project, project => project.childProjects)
  @JoinColumn({ name: 'parent_project_id' })
  parentProject: Project;

  @OneToMany(() => Project, project => project.parentProject)
  childProjects: Project[];

  @OneToMany(() => ProjectTransaction, transaction => transaction.project)
  transactions: ProjectTransaction[];

  @OneToMany(() => ProjectBudget, budget => budget.project)
  budgets: ProjectBudget[];

  @OneToMany(() => ProjectWBS, wbs => wbs.project)
  wbsElements: ProjectWBS[];
}