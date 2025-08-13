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

export enum InventoryLocation {
  DEPOT = 'DEPOT',
  STATION = 'STATION',
  TERMINAL = 'TERMINAL',
  REFINERY = 'REFINERY',
  WAREHOUSE = 'WAREHOUSE',
  IN_TRANSIT = 'IN_TRANSIT',
}

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  IN_TRANSIT = 'IN_TRANSIT',
  QUARANTINE = 'QUARANTINE',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  ALLOCATED = 'ALLOCATED',
}

export enum StockMovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  WRITE_OFF = 'WRITE_OFF',
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
}

@Entity('inventory')
@Index(['tenantId', 'locationId', 'productType'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'lastMovementDate'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'inventory_code', length: 50, unique: true })
  inventoryCode: string;

  // Location Information
  @Column({ name: 'location_type', type: 'enum', enum: InventoryLocation })
  locationType: InventoryLocation;

  @Column({ name: 'location_id', length: 50 })
  locationId: string;

  @Column({ name: 'location_name', length: 255 })
  locationName: string;

  @Column({ name: 'tank_id', length: 50, nullable: true })
  tankId: string;

  @Column({ name: 'tank_number', length: 50, nullable: true })
  tankNumber: string;

  @Column({ name: 'zone_id', length: 50, nullable: true })
  zoneId: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  // Product Information
  @Column({ name: 'product_type', length: 50 })
  productType: string;

  @Column({ name: 'product_code', length: 50 })
  productCode: string;

  @Column({ name: 'product_name', length: 255 })
  productName: string;

  @Column({ name: 'product_grade', length: 50, nullable: true })
  productGrade: string;

  @Column({ name: 'product_specification', type: 'text', nullable: true })
  productSpecification: string;

  // Quantity Information
  @Column({ name: 'opening_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ name: 'quantity_on_hand', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityOnHand: number;

  @Column({ name: 'quantity_available', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityAvailable: number;

  @Column({ name: 'quantity_reserved', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityReserved: number;

  @Column({ name: 'quantity_in_transit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityInTransit: number;

  @Column({ name: 'quantity_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityAllocated: number;

  @Column({ name: 'quantity_quarantine', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityQuarantine: number;

  @Column({ name: 'minimum_stock_level', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minimumStockLevel: number;

  @Column({ name: 'maximum_stock_level', type: 'decimal', precision: 15, scale: 2, default: 0 })
  maximumStockLevel: number;

  @Column({ name: 'reorder_point', type: 'decimal', precision: 15, scale: 2, default: 0 })
  reorderPoint: number;

  @Column({ name: 'reorder_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 })
  reorderQuantity: number;

  @Column({ name: 'safety_stock', type: 'decimal', precision: 15, scale: 2, default: 0 })
  safetyStock: number;

  @Column({ name: 'unit_of_measure', length: 20, default: 'LITRES' })
  unitOfMeasure: string;

  // Tank Capacity (for tank locations)
  @Column({ name: 'tank_capacity', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tankCapacity: number;

  @Column({ name: 'tank_ullage', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tankUllage: number;

  @Column({ name: 'fill_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  fillPercentage: number;

  // Valuation Information
  @Column({ name: 'unit_cost', type: 'decimal', precision: 15, scale: 4, default: 0 })
  unitCost: number;

  @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ name: 'valuation_method', length: 50, default: 'WEIGHTED_AVERAGE' })
  valuationMethod: string; // FIFO, LIFO, WEIGHTED_AVERAGE

  @Column({ name: 'last_purchase_price', type: 'decimal', precision: 15, scale: 4, nullable: true })
  lastPurchasePrice: number;

  @Column({ name: 'last_purchase_date', type: 'date', nullable: true })
  lastPurchaseDate: Date;

  // Quality Information
  @Column({ name: 'batch_number', length: 100, nullable: true })
  batchNumber: string;

  @Column({ name: 'lot_number', length: 100, nullable: true })
  lotNumber: string;

  @Column({ name: 'manufacture_date', type: 'date', nullable: true })
  manufactureDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'quality_status', length: 50, default: 'PASSED' })
  qualityStatus: string;

  @Column({ name: 'density', type: 'decimal', precision: 10, scale: 4, nullable: true })
  density: number;

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column({ name: 'api_gravity', type: 'decimal', precision: 5, scale: 2, nullable: true })
  apiGravity: number;

  // Movement Information
  @Column({ name: 'last_movement_type', type: 'enum', enum: StockMovementType, nullable: true })
  lastMovementType: StockMovementType;

  @Column({ name: 'last_movement_date', type: 'timestamp', nullable: true })
  lastMovementDate: Date;

  @Column({ name: 'last_movement_quantity', type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastMovementQuantity: number;

  @Column({ name: 'last_receipt_date', type: 'timestamp', nullable: true })
  lastReceiptDate: Date;

  @Column({ name: 'last_issue_date', type: 'timestamp', nullable: true })
  lastIssueDate: Date;

  @Column({ name: 'last_stock_take_date', type: 'timestamp', nullable: true })
  lastStockTakeDate: Date;

  @Column({ name: 'last_stock_take_quantity', type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastStockTakeQuantity: number;

  @Column({ name: 'stock_variance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  stockVariance: number;

  // Turnover Analysis
  @Column({ name: 'average_daily_usage', type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageDailyUsage: number;

  @Column({ name: 'days_of_supply', type: 'int', nullable: true })
  daysOfSupply: number;

  @Column({ name: 'turnover_ratio', type: 'decimal', precision: 10, scale: 2, nullable: true })
  turnoverRatio: number;

  @Column({ name: 'stock_age_days', type: 'int', nullable: true })
  stockAgeDays: number;

  // Ghana Specific Fields
  @Column({ name: 'npa_stock_report_submitted', type: 'boolean', default: false })
  npaStockReportSubmitted: boolean;

  @Column({ name: 'npa_stock_report_date', type: 'date', nullable: true })
  npaStockReportDate: Date;

  @Column({ name: 'bost_allocation_balance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  bostAllocationBalance: number;

  @Column({ name: 'strategic_stock_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 })
  strategicStockQuantity: number;

  @Column({ name: 'commercial_stock_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 })
  commercialStockQuantity: number;

  // Status and Control
  @Column({ name: 'status', type: 'enum', enum: InventoryStatus, default: InventoryStatus.AVAILABLE })
  status: InventoryStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_consignment', type: 'boolean', default: false })
  isConsignment: boolean;

  @Column({ name: 'consignment_owner', length: 255, nullable: true })
  consignmentOwner: string;

  @Column({ name: 'requires_inspection', type: 'boolean', default: false })
  requiresInspection: boolean;

  @Column({ name: 'inspection_due_date', type: 'date', nullable: true })
  inspectionDueDate: Date;

  // Alerts and Notifications
  @Column({ name: 'low_stock_alert', type: 'boolean', default: false })
  lowStockAlert: boolean;

  @Column({ name: 'expiry_alert', type: 'boolean', default: false })
  expiryAlert: boolean;

  @Column({ name: 'quality_alert', type: 'boolean', default: false })
  qualityAlert: boolean;

  @Column({ name: 'reorder_alert', type: 'boolean', default: false })
  reorderAlert: boolean;

  @Column({ name: 'alert_email_sent_date', type: 'timestamp', nullable: true })
  alertEmailSentDate: Date;

  // Additional Information
  @Column({ name: 'supplier_id', length: 50, nullable: true })
  supplierId: string;

  @Column({ name: 'supplier_name', length: 255, nullable: true })
  supplierName: string;

  @Column({ name: 'warehouse_bin_location', length: 100, nullable: true })
  warehouseBinLocation: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

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
    // Calculate available quantity
    this.quantityAvailable = this.quantityOnHand - this.quantityReserved - this.quantityQuarantine;

    // Calculate total value
    this.totalValue = this.quantityOnHand * this.unitCost;

    // Calculate fill percentage for tanks
    if (this.tankCapacity && this.tankCapacity > 0) {
      this.fillPercentage = (this.quantityOnHand / this.tankCapacity) * 100;
      this.tankUllage = this.tankCapacity - this.quantityOnHand;
    }

    // Calculate days of supply
    if (this.averageDailyUsage && this.averageDailyUsage > 0) {
      this.daysOfSupply = Math.floor(this.quantityAvailable / this.averageDailyUsage);
    }

    // Set alerts
    this.lowStockAlert = this.quantityAvailable <= this.minimumStockLevel;
    this.reorderAlert = this.quantityAvailable <= this.reorderPoint;
    
    if (this.expiryDate) {
      const daysToExpiry = Math.floor((this.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      this.expiryAlert = daysToExpiry <= 30;
    }

    // Generate inventory code if not exists
    if (!this.inventoryCode) {
      this.inventoryCode = `INV-${this.locationType}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
}