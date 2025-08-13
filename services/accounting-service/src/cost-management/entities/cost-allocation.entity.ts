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

export enum AllocationMethod {
  DIRECT = 'DIRECT',
  STEP_DOWN = 'STEP_DOWN',
  RECIPROCAL = 'RECIPROCAL',
  ACTIVITY_BASED = 'ACTIVITY_BASED',
  PROPORTIONAL = 'PROPORTIONAL',
  EQUAL = 'EQUAL',
  CUSTOM = 'CUSTOM'
}

export enum AllocationBasis {
  PERCENTAGE = 'PERCENTAGE',
  UNITS = 'UNITS',
  SQUARE_FOOTAGE = 'SQUARE_FOOTAGE',
  EMPLOYEE_COUNT = 'EMPLOYEE_COUNT',
  MACHINE_HOURS = 'MACHINE_HOURS',
  LABOR_HOURS = 'LABOR_HOURS',
  SALES_VOLUME = 'SALES_VOLUME',
  PRODUCTION_VOLUME = 'PRODUCTION_VOLUME',
  ASSET_VALUE = 'ASSET_VALUE',
  ENERGY_CONSUMPTION = 'ENERGY_CONSUMPTION',
  THROUGHPUT = 'THROUGHPUT',
  CUSTOM_DRIVER = 'CUSTOM_DRIVER'
}

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED'
}

@Entity('cost_allocations')
@Index(['tenantId', 'sourceCostCenterId'])
@Index(['tenantId', 'targetCostCenterId'])
@Index(['tenantId', 'allocationPeriod'])
@Index(['tenantId', 'status'])
export class CostAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'allocation_number', length: 50, unique: true })
  allocationNumber: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  // Source and Target Cost Centers
  @Column({ name: 'source_cost_center_id' })
  sourceCostCenterId: string;

  @Column({ name: 'target_cost_center_id' })
  targetCostCenterId: string;

  // Allocation Configuration
  @Column({ 
    name: 'allocation_method', 
    type: 'enum', 
    enum: AllocationMethod 
  })
  allocationMethod: AllocationMethod;

  @Column({ 
    name: 'allocation_basis', 
    type: 'enum', 
    enum: AllocationBasis 
  })
  allocationBasis: AllocationBasis;

  @Column({ name: 'allocation_driver', length: 100 })
  allocationDriver: string;

  @Column({ name: 'allocation_rule', type: 'text', nullable: true })
  allocationRule: string; // JSON object with detailed rules

  // Allocation Amounts and Percentages
  @Column({ name: 'source_amount', type: 'decimal', precision: 15, scale: 2 })
  sourceAmount: number;

  @Column({ name: 'allocation_percentage', type: 'decimal', precision: 10, scale: 6 })
  allocationPercentage: number;

  @Column({ name: 'allocated_amount', type: 'decimal', precision: 15, scale: 2 })
  allocatedAmount: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  // Period and Timing
  @Column({ name: 'allocation_period', length: 20 })
  allocationPeriod: string; // e.g., "2024-01", "2024-Q1"

  @Column({ name: 'allocation_date', type: 'date' })
  allocationDate: Date;

  @Column({ name: 'effective_from_date', type: 'date' })
  effectiveFromDate: Date;

  @Column({ name: 'effective_to_date', type: 'date', nullable: true })
  effectiveToDate: Date;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_frequency', length: 20, nullable: true })
  recurrenceFrequency: string; // MONTHLY, QUARTERLY, ANNUALLY

  @Column({ name: 'next_allocation_date', nullable: true })
  nextAllocationDate: Date;

  // Driver Data
  @Column({ name: 'driver_value', type: 'decimal', precision: 15, scale: 6, nullable: true })
  driverValue: number; // The actual driver value (e.g., square feet, employee count)

  @Column({ name: 'total_driver_pool', type: 'decimal', precision: 15, scale: 6, nullable: true })
  totalDriverPool: number; // Total of all driver values across targets

  @Column({ name: 'driver_unit', length: 50, nullable: true })
  driverUnit: string; // sq ft, employees, hours, etc.

  // Cost Categories
  @Column({ name: 'cost_category', length: 100, nullable: true })
  costCategory: string; // Utilities, Rent, Depreciation, etc.

  @Column({ name: 'cost_subcategory', length: 100, nullable: true })
  costSubcategory: string;

  @Column({ name: 'cost_type', length: 50, default: 'INDIRECT' })
  costType: string; // DIRECT, INDIRECT, OVERHEAD

  @Column({ name: 'cost_behavior', length: 20, default: 'VARIABLE' })
  costBehavior: string; // FIXED, VARIABLE, SEMI_VARIABLE

  // GL Integration
  @Column({ name: 'source_gl_account', length: 20, nullable: true })
  sourceGLAccount: string;

  @Column({ name: 'target_gl_account', length: 20, nullable: true })
  targetGLAccount: string;

  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'posted_to_gl', default: false })
  postedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  // Status and Approval
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: AllocationStatus,
    default: AllocationStatus.ACTIVE
  })
  status: AllocationStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'processing_date', nullable: true })
  processingDate: Date;

  // Calculation Details
  @Column({ name: 'calculation_method', type: 'text', nullable: true })
  calculationMethod: string; // JSON object describing calculation steps

  @Column({ name: 'calculation_notes', type: 'text', nullable: true })
  calculationNotes: string;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'manual_adjustment', type: 'decimal', precision: 15, scale: 2, default: 0 })
  manualAdjustment: number;

  // Performance Metrics
  @Column({ name: 'allocation_accuracy', type: 'decimal', precision: 5, scale: 2, nullable: true })
  allocationAccuracy: number; // How accurate this allocation was vs actual usage

  @Column({ name: 'utilization_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number;

  @Column({ name: 'efficiency_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficiencyScore: number;

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_product_allocation', default: false })
  petroleumProductAllocation: boolean;

  @Column({ name: 'product_type', length: 50, nullable: true })
  productType: string; // Gasoline, Diesel, Kerosene, LPG

  @Column({ name: 'volume_allocated_liters', type: 'decimal', precision: 15, scale: 2, nullable: true })
  volumeAllocatedLiters: number;

  @Column({ name: 'environmental_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  environmentalCostComponent: number;

  @Column({ name: 'safety_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  safetyCostComponent: number;

  @Column({ name: 'compliance_cost_component', type: 'decimal', precision: 15, scale: 2, default: 0 })
  complianceCostComponent: number;

  // ABC Costing Fields
  @Column({ name: 'activity_name', length: 255, nullable: true })
  activityName: string;

  @Column({ name: 'activity_level', length: 50, nullable: true })
  activityLevel: string; // UNIT_LEVEL, BATCH_LEVEL, PRODUCT_LEVEL, FACILITY_LEVEL

  @Column({ name: 'activity_measure', length: 100, nullable: true })
  activityMeasure: string;

  @Column({ name: 'activity_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  activityRate: number;

  @Column({ name: 'activity_consumption', type: 'decimal', precision: 15, scale: 2, nullable: true })
  activityConsumption: number;

  // Variance Analysis
  @Column({ name: 'budgeted_allocation', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetedAllocation: number;

  @Column({ name: 'allocation_variance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocationVariance: number;

  @Column({ name: 'variance_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  variancePercentage: number;

  @Column({ name: 'variance_analysis', type: 'text', nullable: true })
  varianceAnalysis: string;

  // Automation and Processing
  @Column({ name: 'auto_calculated', default: false })
  autoCalculated: boolean;

  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

  @Column({ name: 'processing_run_id', nullable: true })
  processingRunId: string;

  // Supporting Information
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array for categorization

  // Audit and History
  @Column({ name: 'revision_number', default: 1 })
  revisionNumber: number;

  @Column({ name: 'previous_allocation_id', nullable: true })
  previousAllocationId: string;

  @Column({ name: 'is_adjustment', default: false })
  isAdjustment: boolean;

  @Column({ name: 'original_allocation_id', nullable: true })
  originalAllocationId: string;

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
  @ManyToOne(() => CostCenter, costCenter => costCenter.sourceAllocations)
  @JoinColumn({ name: 'source_cost_center_id' })
  sourceCostCenter: CostCenter;

  @ManyToOne(() => CostCenter, costCenter => costCenter.targetAllocations)
  @JoinColumn({ name: 'target_cost_center_id' })
  targetCostCenter: CostCenter;
}