import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_TRANSIT = 'IN_TRANSIT',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum OrderType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  TRANSFER_ORDER = 'TRANSFER_ORDER',
  IMPORT_ORDER = 'IMPORT_ORDER',
  EMERGENCY_ORDER = 'EMERGENCY_ORDER',
  STANDING_ORDER = 'STANDING_ORDER',
  DEPOT_ORDER = 'DEPOT_ORDER',
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum ProductType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  KEROSENE = 'KEROSENE',
  LPG = 'LPG',
  LUBRICANTS = 'LUBRICANTS',
  AVIATION_FUEL = 'AVIATION_FUEL',
  HEAVY_FUEL_OIL = 'HEAVY_FUEL_OIL',
  PREMIX = 'PREMIX',
}

@Entity('supply_chain_orders')
@Index(['tenantId', 'orderNumber'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'orderDate'])
@Index(['tenantId', 'supplierId'])
export class SupplyChainOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'order_number', length: 50, unique: true })
  orderNumber: string;

  @Column({ name: 'order_type', type: 'enum', enum: OrderType })
  orderType: OrderType;

  @Column({ name: 'status', type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status: OrderStatus;

  @Column({ name: 'priority', type: 'enum', enum: OrderPriority, default: OrderPriority.NORMAL })
  priority: OrderPriority;

  // Supplier Information
  @Column({ name: 'supplier_id', length: 50 })
  supplierId: string;

  @Column({ name: 'supplier_name', length: 255 })
  supplierName: string;

  @Column({ name: 'supplier_contact', length: 100, nullable: true })
  supplierContact: string;

  @Column({ name: 'supplier_phone', length: 20, nullable: true })
  supplierPhone: string;

  @Column({ name: 'supplier_email', length: 100, nullable: true })
  supplierEmail: string;

  // Product Information
  @Column({ name: 'product_type', type: 'enum', enum: ProductType })
  productType: ProductType;

  @Column({ name: 'product_specification', type: 'text', nullable: true })
  productSpecification: string;

  @Column({ name: 'quantity_ordered', type: 'decimal', precision: 15, scale: 2 })
  quantityOrdered: number;

  @Column({ name: 'quantity_delivered', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityDelivered: number;

  @Column({ name: 'quantity_outstanding', type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantityOutstanding: number;

  @Column({ name: 'unit_of_measure', length: 20, default: 'LITRES' })
  unitOfMeasure: string;

  // Financial Information
  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  // Delivery Information
  @Column({ name: 'delivery_location_id', length: 50, nullable: true })
  deliveryLocationId: string;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ name: 'delivery_station_id', length: 50, nullable: true })
  deliveryStationId: string;

  @Column({ name: 'delivery_depot_id', length: 50, nullable: true })
  deliveryDepotId: string;

  @Column({ name: 'requested_delivery_date', type: 'date', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ name: 'confirmed_delivery_date', type: 'date', nullable: true })
  confirmedDeliveryDate: Date;

  @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  // Transportation Information
  @Column({ name: 'transport_mode', length: 50, nullable: true })
  transportMode: string; // TRUCK, PIPELINE, RAIL, BARGE

  @Column({ name: 'truck_number', length: 50, nullable: true })
  truckNumber: string;

  @Column({ name: 'driver_name', length: 100, nullable: true })
  driverName: string;

  @Column({ name: 'driver_license', length: 50, nullable: true })
  driverLicense: string;

  @Column({ name: 'waybill_number', length: 100, nullable: true })
  waybillNumber: string;

  @Column({ name: 'loading_ticket_number', length: 100, nullable: true })
  loadingTicketNumber: string;

  // Quality Control
  @Column({ name: 'quality_certificate_number', length: 100, nullable: true })
  qualityCertificateNumber: string;

  @Column({ name: 'density_at_15c', type: 'decimal', precision: 10, scale: 4, nullable: true })
  densityAt15C: number;

  @Column({ name: 'temperature_at_loading', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureAtLoading: number;

  @Column({ name: 'temperature_at_delivery', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureAtDelivery: number;

  @Column({ name: 'seal_numbers', type: 'text', nullable: true })
  sealNumbers: string;

  // Ghana Specific Fields
  @Column({ name: 'npa_permit_number', length: 100, nullable: true })
  npaPermitNumber: string;

  @Column({ name: 'gra_tax_invoice_number', length: 100, nullable: true })
  graTaxInvoiceNumber: string;

  @Column({ name: 'tema_oil_refinery_batch', length: 100, nullable: true })
  temaOilRefineryBatch: string;

  @Column({ name: 'bost_allocation_number', length: 100, nullable: true })
  bostAllocationNumber: string;

  @Column({ name: 'uppf_price_component', type: 'decimal', precision: 15, scale: 2, nullable: true })
  uppfPriceComponent: number;

  // Tracking Information
  @Column({ name: 'order_date', type: 'timestamp' })
  orderDate: Date;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approved_by', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'payment_terms', length: 100, nullable: true })
  paymentTerms: string;

  @Column({ name: 'payment_due_date', type: 'date', nullable: true })
  paymentDueDate: Date;

  @Column({ name: 'payment_status', length: 50, default: 'PENDING' })
  paymentStatus: string;

  // Risk Management
  @Column({ name: 'insurance_policy_number', length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCoverageAmount: number;

  @Column({ name: 'risk_assessment_score', type: 'int', nullable: true })
  riskAssessmentScore: number;

  // Additional Fields
  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'purchase_requisition_number', length: 100, nullable: true })
  purchaseRequisitionNumber: string;

  @Column({ name: 'contract_number', length: 100, nullable: true })
  contractNumber: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_urgent', type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ name: 'requires_quality_check', type: 'boolean', default: true })
  requiresQualityCheck: boolean;

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
    // Calculate outstanding quantity
    this.quantityOutstanding = this.quantityOrdered - this.quantityDelivered;

    // Calculate net amount
    this.netAmount = this.totalAmount + this.taxAmount - this.discountAmount;

    // Generate order number if not exists
    if (!this.orderNumber && this.orderType) {
      const prefix = this.orderType === OrderType.PURCHASE_ORDER ? 'PO' : 
                    this.orderType === OrderType.TRANSFER_ORDER ? 'TO' :
                    this.orderType === OrderType.IMPORT_ORDER ? 'IO' : 'SO';
      this.orderNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
}