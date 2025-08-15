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
import { DeliveryLineItem } from './delivery-line-item.entity';
import { DeliveryApprovalHistory } from './delivery-approval-history.entity';
import { DeliveryDocuments } from './delivery-documents.entity';
import { TaxAccrual } from './tax-accrual.entity';

export enum DeliveryStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  INVOICED_SUPPLIER = 'INVOICED_SUPPLIER',
  INVOICED_CUSTOMER = 'INVOICED_CUSTOMER',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum DeliveryType {
  DEPOT_TO_STATION = 'DEPOT_TO_STATION',
  DEPOT_TO_CUSTOMER = 'DEPOT_TO_CUSTOMER',
  INTER_DEPOT = 'INTER_DEPOT',
  CUSTOMER_PICKUP = 'CUSTOMER_PICKUP',
  EMERGENCY_DELIVERY = 'EMERGENCY_DELIVERY'
}

export enum ProductGrade {
  PMS = 'PMS', // Premium Motor Spirit
  AGO = 'AGO', // Automotive Gas Oil
  IFO = 'IFO', // Industrial Fuel Oil
  LPG = 'LPG', // Liquefied Petroleum Gas
  KEROSENE = 'KEROSENE',
  LUBRICANTS = 'LUBRICANTS'
}

export enum StationType {
  COCO = 'COCO',        // Company Owned Company Operated
  DOCO = 'DOCO',        // Dealer Owned Company Operated
  DODO = 'DODO',        // Dealer Owned Dealer Operated
  INDUSTRIAL = 'INDUSTRIAL',  // Industrial/Commercial customers
  COMMERCIAL = 'COMMERCIAL'   // Large commercial customers
}

export enum RevenueRecognitionType {
  IMMEDIATE = 'IMMEDIATE',   // Recognize revenue immediately upon delivery
  DEFERRED = 'DEFERRED',     // Defer revenue recognition based on contract terms
  PROGRESS = 'PROGRESS',     // Progress-based revenue recognition
  MILESTONE = 'MILESTONE'    // Milestone-based revenue recognition
}

export enum StationType {
  COCO = 'COCO', // Company Owned Company Operated
  DOCO = 'DOCO', // Dealer Owned Company Operated
  DODO = 'DODO', // Dealer Owned Dealer Operated
  INDUSTRIAL = 'INDUSTRIAL',
  COMMERCIAL = 'COMMERCIAL'
}

export enum RevenueRecognitionType {
  IMMEDIATE = 'IMMEDIATE',
  DEFERRED = 'DEFERRED'
}

@Entity('daily_deliveries')
@Index(['tenantId', 'deliveryDate'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'supplierId'])
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'depotId'])
@Index(['psaNumber'], { unique: true })
@Index(['waybillNumber'], { unique: true })
@Index(['invoiceNumber'], { unique: true, where: 'invoice_number IS NOT NULL' })
@Index(['stationType'])
@Index(['revenueRecognitionType'])
export class DailyDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'delivery_number', length: 50, unique: true })
  deliveryNumber: string;

  // Core Required Fields
  @Column({ name: 'delivery_date', type: 'date' })
  @Index()
  deliveryDate: Date;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ name: 'depot_id', type: 'uuid' })
  depotId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @Column({ name: 'delivery_location', type: 'text' })
  deliveryLocation: string;

  // Station Type and Revenue Recognition
  @Column({ name: 'station_type', type: 'enum', enum: StationType, nullable: true })
  stationType: StationType;

  @Column({ name: 'revenue_recognition_type', type: 'enum', enum: RevenueRecognitionType, default: RevenueRecognitionType.IMMEDIATE })
  revenueRecognitionType: RevenueRecognitionType;

  @Column({ name: 'psa_number', length: 50, unique: true })
  psaNumber: string; // Petroleum Supply Agreement Number

  @Column({ name: 'waybill_number', length: 50, unique: true })
  waybillNumber: string;

  @Column({ name: 'invoice_number', length: 50, nullable: true, unique: true })
  invoiceNumber: string;

  @Column({ name: 'vehicle_registration_number', length: 20 })
  vehicleRegistrationNumber: string;

  @Column({ name: 'transporter_id', type: 'uuid', nullable: true })
  transporterId: string;

  @Column({ name: 'transporter_name', length: 255 })
  transporterName: string;

  // Product Information
  @Column({ name: 'product_type', type: 'enum', enum: ProductGrade })
  productType: ProductGrade;

  @Column({ name: 'product_description', length: 255 })
  productDescription: string;

  @Column({ name: 'quantity_litres', type: 'decimal', precision: 15, scale: 2 })
  quantityLitres: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  // Delivery Details
  @Column({ name: 'delivery_type', type: 'enum', enum: DeliveryType })
  deliveryType: DeliveryType;

  @Column({ name: 'loading_terminal', length: 255, nullable: true })
  loadingTerminal: string;

  @Column({ name: 'discharge_terminal', length: 255, nullable: true })
  dischargeTerminal: string;

  @Column({ name: 'planned_delivery_time', type: 'timestamp', nullable: true })
  plannedDeliveryTime: Date;

  @Column({ name: 'actual_delivery_time', type: 'timestamp', nullable: true })
  actualDeliveryTime: Date;

  @Column({ name: 'loading_start_time', type: 'timestamp', nullable: true })
  loadingStartTime: Date;

  @Column({ name: 'loading_end_time', type: 'timestamp', nullable: true })
  loadingEndTime: Date;

  @Column({ name: 'discharge_start_time', type: 'timestamp', nullable: true })
  dischargeStartTime: Date;

  @Column({ name: 'discharge_end_time', type: 'timestamp', nullable: true })
  dischargeEndTime: Date;

  // Quality Control
  @Column({ name: 'temperature_at_loading', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureAtLoading: number;

  @Column({ name: 'temperature_at_discharge', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperatureAtDischarge: number;

  @Column({ name: 'density_at_loading', type: 'decimal', precision: 8, scale: 4, nullable: true })
  densityAtLoading: number;

  @Column({ name: 'density_at_discharge', type: 'decimal', precision: 8, scale: 4, nullable: true })
  densityAtDischarge: number;

  @Column({ name: 'net_standard_volume', type: 'decimal', precision: 15, scale: 2, nullable: true })
  netStandardVolume: number;

  @Column({ name: 'gross_standard_volume', type: 'decimal', precision: 15, scale: 2, nullable: true })
  grossStandardVolume: number;

  @Column({ name: 'volume_correction_factor', type: 'decimal', precision: 8, scale: 6, nullable: true })
  volumeCorrectionFactor: number;

  // Tank Information
  @Column({ name: 'source_tank_number', length: 50, nullable: true })
  sourceTankNumber: string;

  @Column({ name: 'destination_tank_number', length: 50, nullable: true })
  destinationTankNumber: string;

  @Column({ name: 'compartment_numbers', type: 'text', nullable: true })
  compartmentNumbers: string; // JSON array

  @Column({ name: 'seal_numbers', type: 'text', nullable: true })
  sealNumbers: string; // JSON array

  // Driver Information
  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @Column({ name: 'driver_name', length: 255, nullable: true })
  driverName: string;

  @Column({ name: 'driver_license_number', length: 50, nullable: true })
  driverLicenseNumber: string;

  @Column({ name: 'driver_phone', length: 20, nullable: true })
  driverPhone: string;

  // Financial Integration
  @Column({ name: 'supplier_invoice_id', type: 'uuid', nullable: true })
  supplierInvoiceId: string;

  @Column({ name: 'customer_invoice_id', type: 'uuid', nullable: true })
  customerInvoiceId: string;

  @Column({ name: 'supplier_invoice_number', length: 50, nullable: true })
  supplierInvoiceNumber: string;

  @Column({ name: 'customer_invoice_number', length: 50, nullable: true })
  customerInvoiceNumber: string;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId: string;

  @Column({ name: 'purchase_order_number', length: 50, nullable: true })
  purchaseOrderNumber: string;

  @Column({ name: 'sales_order_id', type: 'uuid', nullable: true })
  salesOrderId: string;

  @Column({ name: 'sales_order_number', length: 50, nullable: true })
  salesOrderNumber: string;

  // Status and Approval
  @Column({ name: 'status', type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.DRAFT })
  @Index()
  status: DeliveryStatus;

  @Column({ name: 'approval_workflow_id', type: 'uuid', nullable: true })
  approvalWorkflowId: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Ghana Compliance
  @Column({ name: 'npa_permit_number', length: 50, nullable: true })
  npaPermitNumber: string;

  @Column({ name: 'customs_entry_number', length: 50, nullable: true })
  customsEntryNumber: string;

  @Column({ name: 'customs_duty_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  customsDutyPaid: number;

  @Column({ name: 'petroleum_tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  petroleumTaxAmount: number;

  @Column({ name: 'energy_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 })
  energyFundLevy: number;

  @Column({ name: 'road_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 })
  roadFundLevy: number;

  @Column({ name: 'price_stabilization_levy', type: 'decimal', precision: 15, scale: 2, default: 0 })
  priceStabilizationLevy: number;

  @Column({ name: 'primary_distribution_margin', type: 'decimal', precision: 15, scale: 2, default: 0 })
  primaryDistributionMargin: number;

  @Column({ name: 'marketing_margin', type: 'decimal', precision: 15, scale: 2, default: 0 })
  marketingMargin: number;

  @Column({ name: 'dealer_margin', type: 'decimal', precision: 15, scale: 2, default: 0 })
  dealerMargin: number;

  @Column({ name: 'unified_petroleum_price_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unifiedPetroleumPriceFundLevy: number;

  // Station Type Configuration
  @Column({ name: 'station_type', type: 'enum', enum: StationType, nullable: true })
  stationType: StationType;

  // Price Build-up Snapshot
  @Column({ name: 'price_build_up_snapshot', type: 'jsonb', nullable: true })
  priceBuilUpSnapshot: any;

  @Column({ name: 'dealer_margin_snapshot', type: 'decimal', precision: 15, scale: 2, default: 0 })
  dealerMarginSnapshot: number;

  @Column({ name: 'uppf_levy_snapshot', type: 'decimal', precision: 15, scale: 2, default: 0 })
  uppfLevySnapshot: number;

  @Column({ name: 'revenue_recognition_type', type: 'enum', enum: RevenueRecognitionType, default: RevenueRecognitionType.IMMEDIATE })
  revenueRecognitionType: RevenueRecognitionType;

  // Price Build-up Snapshot
  @Column({ name: 'price_buildup_snapshot', type: 'text', nullable: true })
  priceBuildupSnapshot: string; // JSON snapshot of price components at transaction time

  @Column({ name: 'pricing_window_id', type: 'uuid', nullable: true })
  pricingWindowId: string;

  // GPS and Tracking
  @Column({ name: 'gps_tracking_enabled', type: 'boolean', default: false })
  gpsTrackingEnabled: boolean;

  @Column({ name: 'route_coordinates', type: 'text', nullable: true })
  routeCoordinates: string; // JSON array of GPS coordinates

  @Column({ name: 'distance_travelled_km', type: 'decimal', precision: 8, scale: 2, nullable: true })
  distanceTravelledKm: number;

  @Column({ name: 'fuel_consumption_litres', type: 'decimal', precision: 10, scale: 2, nullable: true })
  fuelConsumptionLitres: number;

  @Column({ name: 'route_deviation_flag', type: 'boolean', default: false })
  routeDeviationFlag: boolean;

  @Column({ name: 'unauthorized_stops', type: 'text', nullable: true })
  unauthorizedStops: string; // JSON array

  // Risk and Insurance
  @Column({ name: 'insurance_policy_number', length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCoverageAmount: number;

  @Column({ name: 'risk_assessment_score', type: 'integer', default: 1 })
  riskAssessmentScore: number; // 1-10

  @Column({ name: 'security_escort_required', type: 'boolean', default: false })
  securityEscortRequired: boolean;

  @Column({ name: 'security_escort_details', type: 'text', nullable: true })
  securityEscortDetails: string;

  // Environmental Compliance
  @Column({ name: 'environmental_permit_number', length: 50, nullable: true })
  environmentalPermitNumber: string;

  @Column({ name: 'emission_certificate_number', length: 50, nullable: true })
  emissionCertificateNumber: string;

  @Column({ name: 'carbon_footprint_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbonFootprintKg: number;

  // IFRS Compliance
  @Column({ name: 'revenue_recognition_date', type: 'date', nullable: true })
  revenueRecognitionDate: Date;

  @Column({ name: 'revenue_recognition_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenueRecognitionAmount: number;

  @Column({ name: 'contract_asset_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  contractAssetAmount: number;

  @Column({ name: 'contract_liability_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  contractLiabilityAmount: number;

  @Column({ name: 'performance_obligation_satisfied', type: 'boolean', default: false })
  performanceObligationSatisfied: boolean;

  // Document Management
  @Column({ name: 'delivery_receipt_url', type: 'text', nullable: true })
  deliveryReceiptUrl: string;

  @Column({ name: 'bill_of_lading_url', type: 'text', nullable: true })
  billOfLadingUrl: string;

  @Column({ name: 'quality_certificate_url', type: 'text', nullable: true })
  qualityCertificateUrl: string;

  @Column({ name: 'customs_documents_url', type: 'text', nullable: true })
  customsDocumentsUrl: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  // Additional Information
  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string;

  @Column({ name: 'special_handling_requirements', type: 'text', nullable: true })
  specialHandlingRequirements: string;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'customer_feedback', type: 'text', nullable: true })
  customerFeedback: string;

  @Column({ name: 'delivery_rating', type: 'integer', nullable: true })
  deliveryRating: number; // 1-5 stars

  // System Fields
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sync_status', length: 20, default: 'SYNCED' })
  syncStatus: string;

  @Column({ name: 'last_sync_date', type: 'timestamp', nullable: true })
  lastSyncDate: Date;

  @Column({ name: 'external_reference_id', length: 100, nullable: true })
  externalReferenceId: string;

  @Column({ name: 'integration_flags', type: 'text', nullable: true })
  integrationFlags: string; // JSON object

  // Audit Fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => DeliveryLineItem, lineItem => lineItem.delivery, { cascade: true })
  lineItems: DeliveryLineItem[];

  @OneToMany(() => DeliveryApprovalHistory, approval => approval.delivery, { cascade: true })
  approvalHistory: DeliveryApprovalHistory[];

  @OneToMany(() => DeliveryDocuments, document => document.delivery, { cascade: true })
  documents: DeliveryDocuments[];

  @OneToMany(() => TaxAccrual, taxAccrual => taxAccrual.delivery, { cascade: true })
  taxAccruals: TaxAccrual[];

  // Lifecycle hooks
  @BeforeInsert()
  generateDeliveryNumber() {
    if (!this.deliveryNumber) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.deliveryNumber = `DD-${date}-${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotals() {
    this.totalValue = this.quantityLitres * this.unitPrice;
    
    // Calculate net standard volume if temperature and density are provided
    if (this.temperatureAtLoading && this.densityAtLoading) {
      this.volumeCorrectionFactor = this.calculateVCF(this.temperatureAtLoading, this.densityAtLoading);
      this.netStandardVolume = this.quantityLitres * this.volumeCorrectionFactor;
    }
    
    // Update snapshot values if they exist
    if (this.dealerMargin > 0) {
      this.dealerMarginSnapshot = this.dealerMargin;
    }
    if (this.unifiedPetroleumPriceFundLevy > 0) {
      this.uppfLevySnapshot = this.unifiedPetroleumPriceFundLevy;
    }
  }

  // Helper methods
  private calculateVCF(temperature: number, density: number): number {
    // Simplified VCF calculation - in reality, this would use API standards
    const baseTemp = 15; // Standard temperature in Celsius
    const expansionCoefficient = 0.0008; // Typical for petroleum products
    return 1 - (temperature - baseTemp) * expansionCoefficient;
  }

  // Business logic methods
  canBeApproved(): boolean {
    return this.status === DeliveryStatus.PENDING_APPROVAL && 
           this.quantityLitres > 0 && 
           this.unitPrice > 0 &&
           this.psaNumber && 
           this.waybillNumber;
  }

  canBeInvoicedToSupplier(): boolean {
    return this.status === DeliveryStatus.DELIVERED && 
           !this.supplierInvoiceId &&
           this.performanceObligationSatisfied;
  }

  canBeInvoicedToCustomer(): boolean {
    return this.status === DeliveryStatus.DELIVERED && 
           !this.customerInvoiceId &&
           this.actualDeliveryTime;
  }

  getTotalTaxes(): number {
    return this.petroleumTaxAmount + 
           this.energyFundLevy + 
           this.roadFundLevy + 
           this.priceStabilizationLevy + 
           this.unifiedPetroleumPriceFundLevy;
  }

  getTotalMargins(): number {
    return this.primaryDistributionMargin + 
           this.marketingMargin + 
           this.dealerMargin;
  }

  // New helper methods for enhanced functionality
  getTotalTaxAccruals(): number {
    if (!this.taxAccruals || this.taxAccruals.length === 0) return 0;
    return this.taxAccruals.reduce((total, accrual) => total + accrual.taxAmount, 0);
  }

  getPendingTaxAccruals(): TaxAccrual[] {
    if (!this.taxAccruals) return [];
    return this.taxAccruals.filter(accrual => accrual.isPaymentRequired());
  }

  getOverdueTaxAccruals(): TaxAccrual[] {
    if (!this.taxAccruals) return [];
    return this.taxAccruals.filter(accrual => accrual.isOverdue());
  }

  canGenerateJournalEntries(): boolean {
    return this.status === DeliveryStatus.DELIVERED && 
           this.stationType !== null && 
           this.stationType !== undefined;
  }

  getEffectivePricePerLitre(): number {
    if (this.quantityLitres === 0) return 0;
    const totalPrice = this.unitPrice + (this.getTotalTaxes() + this.getTotalMargins()) / this.quantityLitres;
    return totalPrice;
  }

  hasValidPriceBuildUp(): boolean {
    return this.priceBuilUpSnapshot !== null && 
           this.priceBuilUpSnapshot !== undefined &&
           Object.keys(this.priceBuilUpSnapshot).length > 0;
  }

  getRevenueRecognitionDate(): Date {
    switch (this.revenueRecognitionType) {
      case RevenueRecognitionType.IMMEDIATE:
        return this.actualDeliveryTime || this.deliveryDate;
      case RevenueRecognitionType.DEFERRED:
        return this.revenueRecognitionDate || this.deliveryDate;
      case RevenueRecognitionType.PROGRESS:
      case RevenueRecognitionType.MILESTONE:
        return this.revenueRecognitionDate || this.actualDeliveryTime || this.deliveryDate;
      default:
        return this.deliveryDate;
    }
  }

  getDeliveryDurationHours(): number {
    if (this.loadingStartTime && this.dischargeEndTime) {
      return (this.dischargeEndTime.getTime() - this.loadingStartTime.getTime()) / (1000 * 60 * 60);
    }
    return 0;
  }

  isDelayed(): boolean {
    if (this.plannedDeliveryTime && this.actualDeliveryTime) {
      return this.actualDeliveryTime > this.plannedDeliveryTime;
    }
    return false;
  }

  getDelayHours(): number {
    if (this.isDelayed()) {
      return (this.actualDeliveryTime.getTime() - this.plannedDeliveryTime.getTime()) / (1000 * 60 * 60);
    }
    return 0;
  }

  // Station Type Business Logic
  isCocoStation(): boolean {
    return this.stationType === StationType.COCO;
  }

  isDocoStation(): boolean {
    return this.stationType === StationType.DOCO;
  }

  isDodoStation(): boolean {
    return this.stationType === StationType.DODO;
  }

  isIndustrialCustomer(): boolean {
    return this.stationType === StationType.INDUSTRIAL;
  }

  isCommercialCustomer(): boolean {
    return this.stationType === StationType.COMMERCIAL;
  }

  requiresInventoryMovement(): boolean {
    // COCO and DOCO require inventory movement (no immediate sale)
    return this.isCocoStation() || this.isDocoStation();
  }

  requiresImmediateSale(): boolean {
    // DODO, Industrial, and Commercial are immediate sales
    return this.isDodoStation() || this.isIndustrialCustomer() || this.isCommercialCustomer();
  }

  shouldDeferRevenue(): boolean {
    return this.revenueRecognitionType === RevenueRecognitionType.DEFERRED || this.requiresInventoryMovement();
  }

  // Price Build-up Methods
  getPriceBuildupComponents(): any {
    if (!this.priceBuildupSnapshot) {
      return null;
    }
    try {
      return JSON.parse(this.priceBuildupSnapshot);
    } catch (error) {
      return null;
    }
  }

  setPriceBuildupComponents(components: any): void {
    this.priceBuildupSnapshot = JSON.stringify(components);
  }

  getCalculatedSellingPrice(): number {
    const components = this.getPriceBuildupComponents();
    if (!components) {
      return this.unitPrice;
    }

    // Calculate based on station type
    let sellingPrice = components.basePrice || 0;

    if (this.requiresInventoryMovement()) {
      // For COCO/DOCO, no margin is added at delivery
      return sellingPrice;
    } else {
      // For DODO/Industrial/Commercial, add appropriate margins
      sellingPrice += (components.dealerMargin || 0);
      sellingPrice += (components.marketingMargin || 0);
      return sellingPrice;
    }
  }
}