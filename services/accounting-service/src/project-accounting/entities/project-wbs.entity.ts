import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index 
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectTransaction } from './project-transaction.entity';

export enum WBSType {
  PHASE = 'PHASE',
  DELIVERABLE = 'DELIVERABLE',
  WORK_PACKAGE = 'WORK_PACKAGE',
  ACTIVITY = 'ACTIVITY',
  MILESTONE = 'MILESTONE',
  SUMMARY = 'SUMMARY',
  CONTROL_ACCOUNT = 'CONTROL_ACCOUNT'
}

export enum WBSStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

@Entity('project_wbs')
@Index(['tenantId', 'projectId'])
@Index(['tenantId', 'wbsCode'])
@Index(['parentWbsId'])
@Index(['level'])
export class ProjectWBS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'wbs_code', length: 50 })
  wbsCode: string; // e.g., "1.1.2.3"

  @Column({ name: 'wbs_name', length: 255 })
  wbsName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'wbs_type', 
    type: 'enum', 
    enum: WBSType 
  })
  wbsType: WBSType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: WBSStatus,
    default: WBSStatus.PLANNING
  })
  status: WBSStatus;

  // Hierarchy
  @Column({ name: 'parent_wbs_id', nullable: true })
  parentWbsId: string;

  @Column({ name: 'level', default: 1 })
  level: number;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder: number;

  @Column({ name: 'path', type: 'text', nullable: true })
  path: string; // For hierarchical queries

  @Column({ name: 'is_leaf_node', default: true })
  isLeafNode: boolean;

  @Column({ name: 'child_count', default: 0 })
  childCount: number;

  // Schedule Information
  @Column({ name: 'planned_start_date', type: 'date', nullable: true })
  plannedStartDate: Date;

  @Column({ name: 'planned_end_date', type: 'date', nullable: true })
  plannedEndDate: Date;

  @Column({ name: 'actual_start_date', type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'baseline_start_date', type: 'date', nullable: true })
  baselineStartDate: Date;

  @Column({ name: 'baseline_end_date', type: 'date', nullable: true })
  baselineEndDate: Date;

  @Column({ name: 'planned_duration_days', nullable: true })
  plannedDurationDays: number;

  @Column({ name: 'actual_duration_days', nullable: true })
  actualDurationDays: number;

  @Column({ name: 'remaining_duration_days', nullable: true })
  remainingDurationDays: number;

  // Budget and Cost Information
  @Column({ name: 'budgeted_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetedCost: number;

  @Column({ name: 'baseline_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  baselineCost: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'committed_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedCost: number;

  @Column({ name: 'estimated_cost_to_complete', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCostToComplete: number;

  @Column({ name: 'estimated_total_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedTotalCost: number;

  @Column({ name: 'cost_variance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  costVariance: number;

  @Column({ name: 'cost_variance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  costVariancePercentage: number;

  // Revenue Information
  @Column({ name: 'budgeted_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetedRevenue: number;

  @Column({ name: 'actual_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualRevenue: number;

  @Column({ name: 'billed_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  billedRevenue: number;

  @Column({ name: 'unbilled_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unbilledRevenue: number;

  // Progress and Performance
  @Column({ name: 'percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentComplete: number;

  @Column({ name: 'physical_percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  physicalPercentComplete: number;

  @Column({ name: 'cost_percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  costPercentComplete: number;

  @Column({ name: 'schedule_percent_complete', type: 'decimal', precision: 5, scale: 2, default: 0 })
  schedulePercentComplete: number;

  // Earned Value Management
  @Column({ name: 'planned_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  plannedValue: number;

  @Column({ name: 'earned_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  earnedValue: number;

  @Column({ name: 'schedule_variance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  scheduleVariance: number;

  @Column({ name: 'schedule_performance_index', type: 'decimal', precision: 5, scale: 4, default: 1 })
  schedulePerformanceIndex: number;

  @Column({ name: 'cost_performance_index', type: 'decimal', precision: 5, scale: 4, default: 1 })
  costPerformanceIndex: number;

  @Column({ name: 'to_complete_performance_index', type: 'decimal', precision: 5, scale: 4, default: 1 })
  toCompletePerformanceIndex: number;

  // Resource Information
  @Column({ name: 'assigned_resources', type: 'text', nullable: true })
  assignedResources: string; // JSON array of resource assignments

  @Column({ name: 'planned_effort_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  plannedEffortHours: number;

  @Column({ name: 'actual_effort_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualEffortHours: number;

  @Column({ name: 'remaining_effort_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingEffortHours: number;

  // Work Package Specifics
  @Column({ name: 'work_package_manager', nullable: true })
  workPackageManager: string;

  @Column({ name: 'control_account_manager', nullable: true })
  controlAccountManager: string;

  @Column({ name: 'responsible_organization', length: 255, nullable: true })
  responsibleOrganization: string;

  @Column({ name: 'performing_organization', length: 255, nullable: true })
  performingOrganization: string;

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_activity', length: 100, nullable: true })
  petroleumActivity: string; // Exploration, Development, Production

  @Column({ name: 'well_drilling_phase', length: 50, nullable: true })
  wellDrillingPhase: string; // Surface, Intermediate, Production

  @Column({ name: 'reservoir_zone', length: 100, nullable: true })
  reservoirZone: string;

  @Column({ name: 'facility_type', length: 100, nullable: true })
  facilityType: string; // Wellhead, Flowstation, Terminal, Refinery

  @Column({ name: 'pipeline_segment', length: 100, nullable: true })
  pipelineSegment: string;

  @Column({ name: 'storage_tank_type', length: 50, nullable: true })
  storageTankType: string;

  @Column({ name: 'environmental_phase', length: 50, nullable: true })
  environmentalPhase: string; // Assessment, Remediation, Monitoring

  // Quality and Risk
  @Column({ name: 'quality_gate_required', default: false })
  qualityGateRequired: boolean;

  @Column({ name: 'quality_gate_passed', default: false })
  qualityGatePassed: boolean;

  @Column({ name: 'risk_level', length: 20, default: 'MEDIUM' })
  riskLevel: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  riskScore: number;

  @Column({ name: 'mitigation_plan', type: 'text', nullable: true })
  mitigationPlan: string;

  // Dependencies
  @Column({ name: 'predecessors', type: 'text', nullable: true })
  predecessors: string; // JSON array of predecessor WBS IDs

  @Column({ name: 'successors', type: 'text', nullable: true })
  successors: string; // JSON array of successor WBS IDs

  @Column({ name: 'critical_path', default: false })
  criticalPath: boolean;

  @Column({ name: 'float_days', nullable: true })
  floatDays: number;

  // Deliverables and Milestones
  @Column({ name: 'deliverables', type: 'text', nullable: true })
  deliverables: string; // JSON array of deliverables

  @Column({ name: 'milestones', type: 'text', nullable: true })
  milestones: string; // JSON array of milestones

  @Column({ name: 'acceptance_criteria', type: 'text', nullable: true })
  acceptanceCriteria: string;

  @Column({ name: 'deliverable_status', length: 20, nullable: true })
  deliverableStatus: string;

  // Cost Categories Breakdown
  @Column({ name: 'labor_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  laborCost: number;

  @Column({ name: 'material_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  materialCost: number;

  @Column({ name: 'equipment_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  equipmentCost: number;

  @Column({ name: 'subcontractor_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  subcontractorCost: number;

  @Column({ name: 'overhead_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  overheadCost: number;

  @Column({ name: 'other_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherCost: number;

  // Billing Configuration
  @Column({ name: 'billable', default: true })
  billable: boolean;

  @Column({ name: 'billing_method', length: 50, nullable: true })
  billingMethod: string;

  @Column({ name: 'billing_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  billingRate: number;

  @Column({ name: 'markup_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  markupPercentage: number;

  // Approval and Control
  @Column({ name: 'baseline_approved', default: false })
  baselineApproved: boolean;

  @Column({ name: 'change_control_required', default: false })
  changeControlRequired: boolean;

  @Column({ name: 'budget_control_enabled', default: true })
  budgetControlEnabled: boolean;

  @Column({ name: 'cost_ceiling', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costCeiling: number;

  // Currency
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate_date', nullable: true })
  exchangeRateDate: Date;

  // Integration and Templates
  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ name: 'external_id', length: 100, nullable: true })
  externalId: string;

  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON for additional fields

  // Notes and Documentation
  @Column({ name: 'work_description', type: 'text', nullable: true })
  workDescription: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'assumptions', type: 'text', nullable: true })
  assumptions: string;

  @Column({ name: 'constraints', type: 'text', nullable: true })
  constraints: string;

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
  @ManyToOne(() => Project, project => project.wbsElements)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => ProjectWBS, wbs => wbs.children, { nullable: true })
  @JoinColumn({ name: 'parent_wbs_id' })
  parent: ProjectWBS;

  @OneToMany(() => ProjectWBS, wbs => wbs.parent)
  children: ProjectWBS[];

  @OneToMany(() => ProjectTransaction, transaction => transaction.wbsElement)
  transactions: ProjectTransaction[];
}