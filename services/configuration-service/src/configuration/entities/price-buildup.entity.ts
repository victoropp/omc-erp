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
  BeforeUpdate,
} from 'typeorm';

export enum PriceComponentType {
  // Base Prices
  EX_REFINERY_PRICE = 'EX_REFINERY_PRICE',
  LANDED_COST = 'LANDED_COST',
  
  // Taxes and Levies
  ENERGY_DEBT_RECOVERY_LEVY = 'ENERGY_DEBT_RECOVERY_LEVY',
  ROAD_FUND_LEVY = 'ROAD_FUND_LEVY',
  PRICE_STABILIZATION_LEVY = 'PRICE_STABILIZATION_LEVY',
  SPECIAL_PETROLEUM_TAX = 'SPECIAL_PETROLEUM_TAX',
  FUEL_MARKING_LEVY = 'FUEL_MARKING_LEVY',
  PRIMARY_DISTRIBUTION_MARGIN = 'PRIMARY_DISTRIBUTION_MARGIN',
  
  // Margins
  BOST_MARGIN = 'BOST_MARGIN',
  UPPF_MARGIN = 'UPPF_MARGIN',
  FUEL_MARKING_MARGIN = 'FUEL_MARKING_MARGIN',
  OMC_MARGIN = 'OMC_MARGIN',
  DEALER_MARGIN = 'DEALER_MARGIN',
  
  // Additional Components
  TRANSPORT_COST = 'TRANSPORT_COST',
  STORAGE_COST = 'STORAGE_COST',
  INSURANCE_COST = 'INSURANCE_COST',
  ADMINISTRATIVE_COST = 'ADMINISTRATIVE_COST',
  
  // Custom Components
  CUSTOM_LEVY = 'CUSTOM_LEVY',
  CUSTOM_MARGIN = 'CUSTOM_MARGIN',
}

export enum PriceComponentCategory {
  BASE_PRICE = 'BASE_PRICE',
  TAX_LEVY = 'TAX_LEVY',
  MARGIN = 'MARGIN',
  COST = 'COST',
  CUSTOM = 'CUSTOM',
}

export enum PriceComponentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export enum StationType {
  COCO = 'COCO', // Company Owned Company Operated
  DOCO = 'DOCO', // Dealer Owned Company Operated
  DODO = 'DODO', // Dealer Owned Dealer Operated
  INDUSTRIAL = 'INDUSTRIAL',
  COMMERCIAL = 'COMMERCIAL',
  BULK_CONSUMER = 'BULK_CONSUMER',
}

export enum ProductType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  LPG = 'LPG',
  KEROSENE = 'KEROSENE',
  FUEL_OIL = 'FUEL_OIL',
  AVIATION_FUEL = 'AVIATION_FUEL',
  MARINE_GAS_OIL = 'MARINE_GAS_OIL',
}

@Entity('price_buildup_versions')
@Index(['effectiveDate', 'status'])
@Index(['productType', 'effectiveDate'])
@Index(['createdBy', 'createdAt'])
export class PriceBuildupVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'product_type', type: 'enum', enum: ProductType })
  productType: ProductType;

  @Column({ name: 'effective_date', type: 'timestamp' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ name: 'status', type: 'enum', enum: PriceComponentStatus, default: PriceComponentStatus.DRAFT })
  status: PriceComponentStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 4 })
  totalPrice: number;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'approval_required', type: 'boolean', default: true })
  approvalRequired: boolean;

  @Column({ name: 'approved_by', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ name: 'published_by', length: 100, nullable: true })
  publishedBy: string;

  @Column({ name: 'published_date', type: 'timestamp', nullable: true })
  publishedDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100 })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  @OneToMany(() => PriceComponent, component => component.buildupVersion, { cascade: true })
  components: PriceComponent[];

  @OneToMany(() => StationTypePricing, pricing => pricing.buildupVersion, { cascade: true })
  stationTypePricing: StationTypePricing[];

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    if (this.components && this.components.length > 0) {
      this.totalPrice = this.components.reduce((total, component) => {
        return total + (component.amount || 0);
      }, 0);
    }
  }

  // Helper methods
  isEffective(date: Date = new Date()): boolean {
    return this.status === PriceComponentStatus.ACTIVE &&
           this.isActive &&
           this.effectiveDate <= date &&
           (!this.expiryDate || this.expiryDate > date);
  }

  canBeModified(): boolean {
    return this.status === PriceComponentStatus.DRAFT || 
           this.status === PriceComponentStatus.PENDING_APPROVAL;
  }

  requiresApproval(): boolean {
    return this.approvalRequired && !this.approvedBy;
  }
}

@Entity('price_components')
@Index(['buildupVersionId', 'componentType'])
@Index(['componentType', 'category'])
@Index(['stationType', 'componentType'])
export class PriceComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buildup_version_id', type: 'uuid' })
  buildupVersionId: string;

  @Column({ name: 'component_type', type: 'enum', enum: PriceComponentType })
  componentType: PriceComponentType;

  @Column({ name: 'component_name', length: 255 })
  componentName: string;

  @Column({ name: 'category', type: 'enum', enum: PriceComponentCategory })
  category: PriceComponentCategory;

  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 4 })
  amount: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'is_percentage', type: 'boolean', default: false })
  isPercentage: boolean;

  @Column({ name: 'percentage_base', type: 'enum', enum: PriceComponentType, nullable: true })
  percentageBase: PriceComponentType;

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula: string;

  @Column({ name: 'station_type', type: 'enum', enum: StationType, nullable: true })
  stationType: StationType;

  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'is_configurable', type: 'boolean', default: true })
  isConfigurable: boolean;

  @Column({ name: 'min_amount', type: 'decimal', precision: 15, scale: 4, nullable: true })
  minAmount: number;

  @Column({ name: 'max_amount', type: 'decimal', precision: 15, scale: 4, nullable: true })
  maxAmount: number;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'regulatory_reference', length: 500, nullable: true })
  regulatoryReference: string;

  @Column({ name: 'external_source', length: 255, nullable: true })
  externalSource: string;

  @Column({ name: 'external_reference', length: 255, nullable: true })
  externalReference: string;

  @Column({ name: 'last_updated_source', length: 255, nullable: true })
  lastUpdatedSource: string;

  @Column({ name: 'effective_date', type: 'timestamp' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100 })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  @ManyToOne(() => PriceBuildupVersion, buildup => buildup.components)
  @JoinColumn({ name: 'buildup_version_id' })
  buildupVersion: PriceBuildupVersion;

  // Helper methods
  calculateAmount(baseAmount?: number): number {
    if (this.isPercentage && baseAmount !== undefined) {
      return (this.amount / 100) * baseAmount;
    }
    return this.amount;
  }

  isEffective(date: Date = new Date()): boolean {
    return this.isActive &&
           this.effectiveDate <= date &&
           (!this.expiryDate || this.expiryDate > date);
  }

  validateAmount(): boolean {
    if (this.minAmount !== null && this.amount < this.minAmount) return false;
    if (this.maxAmount !== null && this.amount > this.maxAmount) return false;
    return true;
  }
}

@Entity('station_type_pricing')
@Index(['buildupVersionId', 'stationType'])
@Index(['stationType', 'productType'])
export class StationTypePricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buildup_version_id', type: 'uuid' })
  buildupVersionId: string;

  @Column({ name: 'station_type', type: 'enum', enum: StationType })
  stationType: StationType;

  @Column({ name: 'product_type', type: 'enum', enum: ProductType })
  productType: ProductType;

  @Column({ name: 'base_price', type: 'decimal', precision: 15, scale: 4 })
  basePrice: number;

  @Column({ name: 'total_taxes_levies', type: 'decimal', precision: 15, scale: 4 })
  totalTaxesLevies: number;

  @Column({ name: 'total_margins', type: 'decimal', precision: 15, scale: 4 })
  totalMargins: number;

  @Column({ name: 'total_costs', type: 'decimal', precision: 15, scale: 4 })
  totalCosts: number;

  @Column({ name: 'final_price', type: 'decimal', precision: 15, scale: 4 })
  finalPrice: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'pricing_notes', type: 'text', nullable: true })
  pricingNotes: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100 })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  @ManyToOne(() => PriceBuildupVersion, buildup => buildup.stationTypePricing)
  @JoinColumn({ name: 'buildup_version_id' })
  buildupVersion: PriceBuildupVersion;

  @BeforeInsert()
  @BeforeUpdate()
  calculateFinalPrice() {
    this.finalPrice = (this.basePrice || 0) + 
                     (this.totalTaxesLevies || 0) + 
                     (this.totalMargins || 0) + 
                     (this.totalCosts || 0);
  }
}

@Entity('price_buildup_audit_trail')
@Index(['buildupVersionId', 'actionDate'])
@Index(['actionBy', 'actionDate'])
@Index(['actionType', 'actionDate'])
export class PriceBuildupAuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buildup_version_id', type: 'uuid' })
  buildupVersionId: string;

  @Column({ name: 'component_id', type: 'uuid', nullable: true })
  componentId: string;

  @Column({ name: 'action_type', length: 50 })
  actionType: string; // CREATE, UPDATE, DELETE, APPROVE, PUBLISH, ARCHIVE

  @Column({ name: 'action_description', type: 'text' })
  actionDescription: string;

  @Column({ name: 'old_values', type: 'simple-json', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'simple-json', nullable: true })
  newValues: any;

  @Column({ name: 'action_by', length: 100 })
  actionBy: string;

  @Column({ name: 'action_date', type: 'timestamp' })
  actionDate: Date;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', length: 255, nullable: true })
  sessionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PriceBuildupVersion)
  @JoinColumn({ name: 'buildup_version_id' })
  buildupVersion: PriceBuildupVersion;

  @ManyToOne(() => PriceComponent)
  @JoinColumn({ name: 'component_id' })
  component: PriceComponent;
}