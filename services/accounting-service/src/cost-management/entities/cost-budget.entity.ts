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
import { CostCenter } from './cost-center.entity';

export enum BudgetType {
  OPERATING = 'OPERATING',
  CAPITAL = 'CAPITAL',
  MASTER = 'MASTER',
  FLEXIBLE = 'FLEXIBLE',
  ZERO_BASED = 'ZERO_BASED',
  ACTIVITY_BASED = 'ACTIVITY_BASED',
  ROLLING = 'ROLLING',
  PROJECT = 'PROJECT'
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  CLOSED = 'CLOSED',
  REVISED = 'REVISED'
}

export enum BudgetPeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  PROJECT_BASED = 'PROJECT_BASED'
}

export enum CostCategory {
  DIRECT_MATERIALS = 'DIRECT_MATERIALS',
  DIRECT_LABOR = 'DIRECT_LABOR',
  MANUFACTURING_OVERHEAD = 'MANUFACTURING_OVERHEAD',
  SELLING_EXPENSES = 'SELLING_EXPENSES',
  ADMINISTRATIVE_EXPENSES = 'ADMINISTRATIVE_EXPENSES',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECIATION = 'DEPRECIATION',
  INSURANCE = 'INSURANCE',
  RENT_LEASE = 'RENT_LEASE',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  TRAVEL_ENTERTAINMENT = 'TRAVEL_ENTERTAINMENT',
  TRAINING_DEVELOPMENT = 'TRAINING_DEVELOPMENT',
  ENVIRONMENTAL_COMPLIANCE = 'ENVIRONMENTAL_COMPLIANCE',
  SAFETY_SECURITY = 'SAFETY_SECURITY'
}

@Entity('cost_budgets')
@Index(['tenantId', 'costCenterId'])
@Index(['tenantId', 'budgetPeriod'])
@Index(['tenantId', 'status'])
@Index(['budgetYear', 'budgetType'])
export class CostBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'budget_number', length: 50, unique: true })
  budgetNumber: string;

  @Column({ name: 'cost_center_id' })
  costCenterId: string;

  @Column({ name: 'budget_name', length: 255 })
  budgetName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Budget Classification
  @Column({ 
    name: 'budget_type', 
    type: 'enum', 
    enum: BudgetType 
  })
  budgetType: BudgetType;

  @Column({ 
    name: 'cost_category', 
    type: 'enum', 
    enum: CostCategory 
  })
  costCategory: CostCategory;

  @Column({ name: 'cost_subcategory', length: 100, nullable: true })
  costSubcategory: string;

  // Period Information
  @Column({ name: 'budget_year', length: 4 })
  budgetYear: string;

  @Column({ name: 'budget_period', length: 20 })
  budgetPeriod: string; // e.g., "2024", "2024-Q1", "2024-01"

  @Column({ 
    name: 'period_type', 
    type: 'enum', 
    enum: BudgetPeriodType 
  })
  periodType: BudgetPeriodType;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  // Budget Amounts
  @Column({ name: 'budgeted_amount', type: 'decimal', precision: 15, scale: 2 })
  budgetedAmount: number;

  @Column({ name: 'revised_budget_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  revisedBudgetAmount: number;

  @Column({ name: 'approved_budget_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedBudgetAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ name: 'committed_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedAmount: number;

  @Column({ name: 'encumbered_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  encumberedAmount: number;

  @Column({ name: 'available_amount', type: 'decimal', precision: 15, scale: 2 })
  availableAmount: number;

  // Variance Analysis
  @Column({ name: 'budget_variance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetVariance: number;

  @Column({ name: 'variance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  variancePercentage: number;

  @Column({ name: 'favorable_unfavorable', length: 20, nullable: true })
  favorableUnfavorable: string; // FAVORABLE, UNFAVORABLE

  @Column({ name: 'variance_threshold_percentage', type: 'decimal', precision: 5, scale: 2, default: 10 })
  varianceThresholdPercentage: number;

  @Column({ name: 'variance_explanation', type: 'text', nullable: true })
  varianceExplanation: string;

  // Activity-Based Budgeting
  @Column({ name: 'activity_measure', length: 100, nullable: true })
  activityMeasure: string; // Units, hours, transactions

  @Column({ name: 'budgeted_activity_volume', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetedActivityVolume: number;

  @Column({ name: 'actual_activity_volume', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualActivityVolume: number;

  @Column({ name: 'cost_per_activity_unit', type: 'decimal', precision: 15, scale: 6, nullable: true })
  costPerActivityUnit: number;

  @Column({ name: 'activity_efficiency', type: 'decimal', precision: 5, scale: 2, nullable: true })
  activityEfficiency: number; // Actual volume / Budgeted volume

  // Cost Behavior Analysis
  @Column({ name: 'fixed_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fixedCostComponent: number;

  @Column({ name: 'variable_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  variableCostComponent: number;

  @Column({ name: 'semi_variable_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  semiVariableCostComponent: number;

  @Column({ name: 'variable_rate_per_unit', type: 'decimal', precision: 15, scale: 6, nullable: true })
  variableRatePerUnit: number;

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_product_category', length: 100, nullable: true })
  petroleumProductCategory: string;

  @Column({ name: 'environmental_compliance_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  environmentalComplianceBudget: number;

  @Column({ name: 'safety_training_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  safetyTrainingBudget: number;

  @Column({ name: 'npa_compliance_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  npaComplianceBudget: number;

  @Column({ name: 'equipment_maintenance_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  equipmentMaintenanceBudget: number;

  @Column({ name: 'fuel_quality_testing_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fuelQualityTestingBudget: number;

  @Column({ name: 'storage_tank_inspection_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  storageTankInspectionBudget: number;

  // Status and Approval
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT
  })
  status: BudgetStatus;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: string;

  @Column({ name: 'submission_date', nullable: true })
  submissionDate: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'review_date', nullable: true })
  reviewDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_level', nullable: true })
  approvalLevel: number;

  // Budget Planning and Forecasting
  @Column({ name: 'budget_method', length: 50, default: 'INCREMENTAL' })
  budgetMethod: string; // INCREMENTAL, ZERO_BASED, ACTIVITY_BASED

  @Column({ name: 'base_year_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseYearAmount: number;

  @Column({ name: 'inflation_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  inflationRate: number;

  @Column({ name: 'growth_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  growthRate: number;

  @Column({ name: 'seasonal_factor', type: 'decimal', precision: 5, scale: 4, default: 1 })
  seasonalFactor: number;

  // Rolling Budget Fields
  @Column({ name: 'is_rolling_budget', default: false })
  isRollingBudget: boolean;

  @Column({ name: 'rolling_periods', nullable: true })
  rollingPeriods: number;

  @Column({ name: 'next_budget_period', length: 20, nullable: true })
  nextBudgetPeriod: string;

  @Column({ name: 'auto_roll_forward', default: false })
  autoRollForward: boolean;

  // Performance Targets
  @Column({ name: 'performance_target', type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceTarget: number;

  @Column({ name: 'target_unit', length: 50, nullable: true })
  targetUnit: string;

  @Column({ name: 'benchmark_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  benchmarkAmount: number;

  @Column({ name: 'industry_average', type: 'decimal', precision: 15, scale: 2, nullable: true })
  industryAverage: number;

  // Budget Controls
  @Column({ name: 'budget_control_enabled', default: true })
  budgetControlEnabled: boolean;

  @Column({ name: 'overspend_allowed', default: false })
  overspendAllowed: boolean;

  @Column({ name: 'overspend_limit_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overspendLimitPercentage: number;

  @Column({ name: 'requires_approval_for_overspend', default: true })
  requiresApprovalForOverspend: boolean;

  // Currency and Exchange
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Supporting Information
  @Column({ name: 'budget_assumptions', type: 'text', nullable: true })
  budgetAssumptions: string; // JSON array of assumptions

  @Column({ name: 'budget_justification', type: 'text', nullable: true })
  budgetJustification: string;

  @Column({ name: 'risk_factors', type: 'text', nullable: true })
  riskFactors: string; // JSON array of risk factors

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  // Reporting and Analytics
  @Column({ name: 'budget_category_code', length: 50, nullable: true })
  budgetCategoryCode: string;

  @Column({ name: 'reporting_hierarchy', type: 'text', nullable: true })
  reportingHierarchy: string;

  @Column({ name: 'consolidation_level', length: 50, nullable: true })
  consolidationLevel: string;

  @Column({ name: 'budget_line_sequence', nullable: true })
  budgetLineSequence: number;

  // Revision and History
  @Column({ name: 'version_number', default: 1 })
  versionNumber: number;

  @Column({ name: 'parent_budget_id', nullable: true })
  parentBudgetId: string;

  @Column({ name: 'is_revision', default: false })
  isRevision: boolean;

  @Column({ name: 'revision_reason', type: 'text', nullable: true })
  revisionReason: string;

  @Column({ name: 'last_updated_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastUpdatedAmount: number;

  @Column({ name: 'last_calculation_date', nullable: true })
  lastCalculationDate: Date;

  // Notes and Comments
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'manager_comments', type: 'text', nullable: true })
  managerComments: string;

  @Column({ name: 'reviewer_comments', type: 'text', nullable: true })
  reviewerComments: string;

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
  @ManyToOne(() => CostCenter, costCenter => costCenter.budgets)
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;
}