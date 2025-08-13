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
import { CostAllocation } from './cost-allocation.entity';
import { CostBudget } from './cost-budget.entity';

export enum CostCenterType {
  PRODUCTION = 'PRODUCTION',
  SERVICE = 'SERVICE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  MARKETING = 'MARKETING',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  DISTRIBUTION = 'DISTRIBUTION',
  MAINTENANCE = 'MAINTENANCE',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  LOGISTICS = 'LOGISTICS',
  PROCUREMENT = 'PROCUREMENT',
  FINANCE = 'FINANCE',
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  INFORMATION_TECHNOLOGY = 'INFORMATION_TECHNOLOGY',
  LEGAL_COMPLIANCE = 'LEGAL_COMPLIANCE',
  ENVIRONMENTAL_SAFETY = 'ENVIRONMENTAL_SAFETY'
}

export enum CostCenterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export enum CostBehavior {
  VARIABLE = 'VARIABLE',
  FIXED = 'FIXED',
  SEMI_VARIABLE = 'SEMI_VARIABLE',
  STEP_FIXED = 'STEP_FIXED'
}

@Entity('cost_centers')
@Index(['tenantId', 'costCenterCode'])
@Index(['tenantId', 'costCenterType'])
@Index(['tenantId', 'status'])
@Index(['parentCostCenterId'])
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'cost_center_code', length: 20, unique: true })
  costCenterCode: string;

  @Column({ name: 'cost_center_name', length: 255 })
  costCenterName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'cost_center_type', 
    type: 'enum', 
    enum: CostCenterType 
  })
  costCenterType: CostCenterType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: CostCenterStatus,
    default: CostCenterStatus.ACTIVE
  })
  status: CostCenterStatus;

  // Hierarchy
  @Column({ name: 'parent_cost_center_id', nullable: true })
  parentCostCenterId: string;

  @Column({ name: 'hierarchy_level', default: 1 })
  hierarchyLevel: number;

  @Column({ name: 'hierarchy_path', type: 'text', nullable: true })
  hierarchyPath: string; // For efficient hierarchy queries

  @Column({ name: 'has_children', default: false })
  hasChildren: boolean;

  // Organizational Structure
  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'division', length: 100, nullable: true })
  division: string;

  @Column({ name: 'business_unit', length: 100, nullable: true })
  businessUnit: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  // Financial Information
  @Column({ name: 'budget_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetAmount: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'committed_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedCost: number;

  @Column({ name: 'allocated_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedCost: number;

  @Column({ name: 'variance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  varianceAmount: number;

  @Column({ name: 'variance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  variancePercentage: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  // Cost Behavior Analysis
  @Column({ 
    name: 'primary_cost_behavior', 
    type: 'enum', 
    enum: CostBehavior,
    default: CostBehavior.VARIABLE
  })
  primaryCostBehavior: CostBehavior;

  @Column({ name: 'fixed_cost_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  fixedCostPercentage: number;

  @Column({ name: 'variable_cost_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  variableCostPercentage: number;

  @Column({ name: 'activity_measure', length: 100, nullable: true })
  activityMeasure: string; // Units, hours, liters, etc.

  @Column({ name: 'activity_volume', type: 'decimal', precision: 15, scale: 2, default: 0 })
  activityVolume: number;

  @Column({ name: 'cost_per_activity_unit', type: 'decimal', precision: 15, scale: 6, nullable: true })
  costPerActivityUnit: number;

  // Responsibility and Management
  @Column({ name: 'manager_id', nullable: true })
  managerId: string;

  @Column({ name: 'manager_name', length: 255, nullable: true })
  managerName: string;

  @Column({ name: 'manager_email', length: 255, nullable: true })
  managerEmail: string;

  @Column({ name: 'cost_controller_id', nullable: true })
  costControllerId: string;

  @Column({ name: 'cost_controller_name', length: 255, nullable: true })
  costControllerName: string;

  // Performance Metrics
  @Column({ name: 'efficiency_ratio', type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficiencyRatio: number; // Actual output / Budgeted output

  @Column({ name: 'utilization_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number; // Actual usage / Available capacity

  @Column({ name: 'productivity_index', type: 'decimal', precision: 5, scale: 2, nullable: true })
  productivityIndex: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_product_type', length: 100, nullable: true })
  petroleumProductType: string; // Gasoline, Diesel, Kerosene, LPG, etc.

  @Column({ name: 'storage_capacity_liters', type: 'decimal', precision: 15, scale: 2, nullable: true })
  storageCapacityLiters: number;

  @Column({ name: 'throughput_liters_per_day', type: 'decimal', precision: 15, scale: 2, nullable: true })
  throughputLitersPerDay: number;

  @Column({ name: 'environmental_compliance_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  environmentalComplianceScore: number;

  @Column({ name: 'safety_incident_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  safetyIncidentRate: number;

  @Column({ name: 'npa_compliance_status', length: 50, default: 'COMPLIANT' })
  npaComplianceStatus: string; // NPA = National Petroleum Authority

  @Column({ name: 'epa_permit_number', length: 100, nullable: true })
  epaPermitNumber: string; // EPA = Environmental Protection Agency

  // Cost Allocation Settings
  @Column({ name: 'is_cost_allocation_source', default: false })
  isCostAllocationSource: boolean;

  @Column({ name: 'is_cost_allocation_target', default: true })
  isCostAllocationTarget: boolean;

  @Column({ name: 'allocation_method', length: 50, nullable: true })
  allocationMethod: string; // DIRECT, STEP_DOWN, RECIPROCAL, ABC

  @Column({ name: 'allocation_driver', length: 100, nullable: true })
  allocationDriver: string; // Square footage, employee count, machine hours, etc.

  @Column({ name: 'allocation_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  allocationPercentage: number;

  // Budgeting and Planning
  @Column({ name: 'budget_model', length: 50, default: 'INCREMENTAL' })
  budgetModel: string; // INCREMENTAL, ZERO_BASED, ACTIVITY_BASED, FLEXIBLE

  @Column({ name: 'budget_frequency', length: 20, default: 'ANNUAL' })
  budgetFrequency: string; // ANNUAL, QUARTERLY, MONTHLY

  @Column({ name: 'rolling_forecast_enabled', default: false })
  rollingForecastEnabled: boolean;

  @Column({ name: 'forecast_horizon_months', default: 12 })
  forecastHorizonMonths: number;

  // Reporting and Analytics
  @Column({ name: 'reporting_level', length: 20, default: 'DETAIL' })
  reportingLevel: string; // SUMMARY, DETAIL, CONSOLIDATED

  @Column({ name: 'kpi_dashboard_enabled', default: true })
  kpiDashboardEnabled: boolean;

  @Column({ name: 'automated_alerts_enabled', default: true })
  automatedAlertsEnabled: boolean;

  @Column({ name: 'variance_threshold_percentage', type: 'decimal', precision: 5, scale: 2, default: 10 })
  varianceThresholdPercentage: number;

  // Integration and System Fields
  @Column({ name: 'external_cost_center_code', length: 50, nullable: true })
  externalCostCenterCode: string;

  @Column({ name: 'erp_integration_enabled', default: true })
  erpIntegrationEnabled: boolean;

  @Column({ name: 'gl_account_mapping', type: 'text', nullable: true })
  glAccountMapping: string; // JSON mapping to GL accounts

  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON for tenant-specific fields

  // Dates and Status
  @Column({ name: 'effective_from_date', type: 'date' })
  effectiveFromDate: Date;

  @Column({ name: 'effective_to_date', type: 'date', nullable: true })
  effectiveToDate: Date;

  @Column({ name: 'last_activity_date', nullable: true })
  lastActivityDate: Date;

  @Column({ name: 'last_budget_update_date', nullable: true })
  lastBudgetUpdateDate: Date;

  @Column({ name: 'last_cost_calculation_date', nullable: true })
  lastCostCalculationDate: Date;

  // Approval Workflow
  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Notes and Documentation
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'cost_accounting_policies', type: 'text', nullable: true })
  costAccountingPolicies: string;

  @Column({ name: 'performance_targets', type: 'text', nullable: true })
  performanceTargets: string; // JSON array of targets

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
  @ManyToOne(() => CostCenter, costCenter => costCenter.children)
  @JoinColumn({ name: 'parent_cost_center_id' })
  parentCostCenter: CostCenter;

  @OneToMany(() => CostCenter, costCenter => costCenter.parentCostCenter)
  children: CostCenter[];

  @OneToMany(() => CostAllocation, allocation => allocation.sourceCostCenter)
  sourceAllocations: CostAllocation[];

  @OneToMany(() => CostAllocation, allocation => allocation.targetCostCenter)
  targetAllocations: CostAllocation[];

  @OneToMany(() => CostBudget, budget => budget.costCenter)
  budgets: CostBudget[];
}