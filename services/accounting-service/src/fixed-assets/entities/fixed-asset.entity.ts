import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { AssetCategory } from './asset-category.entity';
import { AssetDepreciation } from './asset-depreciation.entity';
import { AssetMaintenance } from './asset-maintenance.entity';
import { AssetTransfer } from './asset-transfer.entity';
import { AssetInsurance } from './asset-insurance.entity';
import { AssetValuation } from './asset-valuation.entity';

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISPOSED = 'DISPOSED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  TRANSFERRED = 'TRANSFERRED',
  STOLEN = 'STOLEN',
  DAMAGED = 'DAMAGED',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
  SUM_OF_YEARS_DIGITS = 'SUM_OF_YEARS_DIGITS',
}

export enum AcquisitionType {
  PURCHASE = 'PURCHASE',
  CONSTRUCTION = 'CONSTRUCTION',
  DONATION = 'DONATION',
  LEASE = 'LEASE',
  TRANSFER = 'TRANSFER',
}

@Entity('fixed_assets')
@Index(['asset_tag'], { unique: true })
@Index(['asset_status'])
@Index(['location_id'])
@Index(['category_id'])
@Index(['acquisition_date'])
export class FixedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_tag', length: 50, unique: true })
  @Index()
  assetTag: string;

  @Column({ name: 'asset_number', length: 50, unique: true })
  assetNumber: string;

  @Column({ name: 'asset_name', length: 200 })
  assetName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'manufacturer', length: 100, nullable: true })
  manufacturer?: string;

  @Column({ name: 'model', length: 100, nullable: true })
  model?: string;

  @Column({ name: 'serial_number', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ name: 'part_number', length: 100, nullable: true })
  partNumber?: string;

  // Financial Information
  @Column({ 
    name: 'acquisition_cost', 
    type: 'decimal', 
    precision: 20, 
    scale: 2 
  })
  acquisitionCost: number;

  @Column({ name: 'acquisition_date', type: 'date' })
  @Index()
  acquisitionDate: Date;

  @Column({
    name: 'acquisition_type',
    type: 'enum',
    enum: AcquisitionType,
    default: AcquisitionType.PURCHASE,
  })
  acquisitionType: AcquisitionType;

  @Column({ name: 'purchase_order_number', length: 50, nullable: true })
  purchaseOrderNumber?: string;

  @Column({ name: 'invoice_number', length: 50, nullable: true })
  invoiceNumber?: string;

  @Column({ name: 'vendor_name', length: 200, nullable: true })
  vendorName?: string;

  // Depreciation Information
  @Column({
    name: 'depreciation_method',
    type: 'enum',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @Column({ name: 'useful_life_years', type: 'integer' })
  usefulLifeYears: number;

  @Column({ name: 'useful_life_units', type: 'integer', nullable: true })
  usefulLifeUnits?: number;

  @Column({ 
    name: 'salvage_value', 
    type: 'decimal', 
    precision: 20, 
    scale: 2,
    default: 0 
  })
  salvageValue: number;

  @Column({ 
    name: 'depreciation_rate', 
    type: 'decimal', 
    precision: 5, 
    scale: 2,
    nullable: true 
  })
  depreciationRate?: number;

  @Column({ name: 'depreciation_start_date', type: 'date', nullable: true })
  depreciationStartDate?: Date;

  @Column({ 
    name: 'accumulated_depreciation', 
    type: 'decimal', 
    precision: 20, 
    scale: 2,
    default: 0 
  })
  accumulatedDepreciation: number;

  @Column({ 
    name: 'book_value', 
    type: 'decimal', 
    precision: 20, 
    scale: 2 
  })
  bookValue: number;

  // Location and Assignment
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  @Index()
  locationId?: string;

  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  stationId?: string;

  @Column({ name: 'department_code', length: 50, nullable: true })
  departmentCode?: string;

  @Column({ name: 'cost_center_code', length: 50, nullable: true })
  costCenterCode?: string;

  @Column({ name: 'assigned_to_employee_id', type: 'uuid', nullable: true })
  assignedToEmployeeId?: string;

  @Column({ name: 'physical_location', length: 200, nullable: true })
  physicalLocation?: string;

  // Status and Condition
  @Column({
    name: 'asset_status',
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  @Index()
  assetStatus: AssetStatus;

  @Column({ name: 'condition_rating', type: 'integer', nullable: true })
  conditionRating?: number; // 1-10 scale

  @Column({ name: 'last_maintenance_date', type: 'date', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ name: 'next_maintenance_due', type: 'date', nullable: true })
  nextMaintenanceDue?: Date;

  @Column({ name: 'maintenance_frequency_days', type: 'integer', nullable: true })
  maintenanceFrequencyDays?: number;

  // Warranty Information
  @Column({ name: 'warranty_start_date', type: 'date', nullable: true })
  warrantyStartDate?: Date;

  @Column({ name: 'warranty_end_date', type: 'date', nullable: true })
  warrantyEndDate?: Date;

  @Column({ name: 'warranty_provider', length: 200, nullable: true })
  warrantyProvider?: string;

  @Column({ name: 'warranty_terms', type: 'text', nullable: true })
  warrantyTerms?: string;

  // Insurance Information
  @Column({ name: 'is_insured', default: false })
  isInsured: boolean;

  @Column({ name: 'insurance_policy_number', length: 100, nullable: true })
  insurancePolicyNumber?: string;

  @Column({ 
    name: 'insured_value', 
    type: 'decimal', 
    precision: 20, 
    scale: 2,
    nullable: true 
  })
  insuredValue?: number;

  // Additional Information
  @Column({ name: 'barcode', length: 100, nullable: true })
  barcode?: string;

  @Column({ name: 'qr_code', length: 200, nullable: true })
  qrCode?: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl?: string;

  @Column({ name: 'documents', type: 'jsonb', nullable: true })
  documents?: any;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: any;

  // GL Account Codes
  @Column({ name: 'asset_account_code', length: 20 })
  assetAccountCode: string;

  @Column({ name: 'accumulated_depreciation_account_code', length: 20 })
  accumulatedDepreciationAccountCode: string;

  @Column({ name: 'depreciation_expense_account_code', length: 20 })
  depreciationExpenseAccountCode: string;

  // Disposal Information
  @Column({ name: 'disposal_date', type: 'date', nullable: true })
  disposalDate?: Date;

  @Column({ 
    name: 'disposal_value', 
    type: 'decimal', 
    precision: 20, 
    scale: 2,
    nullable: true 
  })
  disposalValue?: number;

  @Column({ name: 'disposal_method', length: 50, nullable: true })
  disposalMethod?: string; // 'SALE', 'SCRAP', 'DONATION', 'TRADE_IN'

  @Column({ name: 'disposal_reason', type: 'text', nullable: true })
  disposalReason?: string;

  // Audit fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => AssetCategory, category => category.assets)
  @JoinColumn({ name: 'category_id' })
  category: AssetCategory;

  @OneToMany(() => AssetDepreciation, depreciation => depreciation.asset)
  depreciationHistory: AssetDepreciation[];

  @OneToMany(() => AssetMaintenance, maintenance => maintenance.asset)
  maintenanceHistory: AssetMaintenance[];

  @OneToMany(() => AssetTransfer, transfer => transfer.asset)
  transferHistory: AssetTransfer[];

  @OneToMany(() => AssetInsurance, insurance => insurance.asset)
  insuranceHistory: AssetInsurance[];

  @OneToMany(() => AssetValuation, valuation => valuation.asset)
  valuationHistory: AssetValuation[];

  // Hooks
  @BeforeInsert()
  generateAssetNumber() {
    if (!this.assetNumber) {
      const date = new Date().toISOString().slice(0, 7).replace('-', '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.assetNumber = `FA-${date}-${random}`;
    }
  }

  @BeforeInsert()
  calculateBookValue() {
    this.bookValue = this.acquisitionCost - this.accumulatedDepreciation;
  }

  // Helper methods
  get age(): number {
    const now = new Date();
    const ageInMs = now.getTime() - this.acquisitionDate.getTime();
    return Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
  }

  get isUnderWarranty(): boolean {
    if (!this.warrantyEndDate) return false;
    return new Date() <= this.warrantyEndDate;
  }

  get depreciableAmount(): number {
    return this.acquisitionCost - this.salvageValue;
  }

  get remainingDepreciableAmount(): number {
    return Math.max(0, this.depreciableAmount - this.accumulatedDepreciation);
  }

  get depreciationPercentage(): number {
    if (this.acquisitionCost === 0) return 0;
    return (this.accumulatedDepreciation / this.acquisitionCost) * 100;
  }

  get isFullyDepreciated(): boolean {
    return this.bookValue <= this.salvageValue;
  }

  get needsMaintenance(): boolean {
    if (!this.nextMaintenanceDue) return false;
    return new Date() >= this.nextMaintenanceDue;
  }

  calculateAnnualDepreciation(): number {
    switch (this.depreciationMethod) {
      case DepreciationMethod.STRAIGHT_LINE:
        return this.depreciableAmount / this.usefulLifeYears;
      case DepreciationMethod.DECLINING_BALANCE:
        const rate = this.depreciationRate || (1 / this.usefulLifeYears);
        return this.bookValue * rate;
      default:
        return this.depreciableAmount / this.usefulLifeYears;
    }
  }

  updateBookValue(): void {
    this.bookValue = this.acquisitionCost - this.accumulatedDepreciation;
  }

  markAsDisposed(disposalDate: Date, disposalValue: number, method: string, reason?: string): void {
    this.assetStatus = AssetStatus.DISPOSED;
    this.disposalDate = disposalDate;
    this.disposalValue = disposalValue;
    this.disposalMethod = method;
    this.disposalReason = reason;
  }
}