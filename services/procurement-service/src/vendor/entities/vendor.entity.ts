import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum VendorStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum VendorCategory {
  SUPPLIER = 'SUPPLIER',
  CONTRACTOR = 'CONTRACTOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  CONSULTANT = 'CONSULTANT',
  TRANSPORTER = 'TRANSPORTER',
  DISTRIBUTOR = 'DISTRIBUTOR',
}

export enum VendorType {
  LOCAL = 'LOCAL',
  INTERNATIONAL = 'INTERNATIONAL',
  GOVERNMENT = 'GOVERNMENT',
  SOLE_PROPRIETOR = 'SOLE_PROPRIETOR',
  PARTNERSHIP = 'PARTNERSHIP',
  CORPORATION = 'CORPORATION',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  LETTER_OF_CREDIT = 'LETTER_OF_CREDIT',
  DOCUMENTARY_CREDIT = 'DOCUMENTARY_CREDIT',
}

export enum VendorRating {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  BELOW_AVERAGE = 'BELOW_AVERAGE',
  POOR = 'POOR',
}

@Entity('vendors')
@Index(['tenantId', 'vendorCode'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'category'])
@Index(['tenantId', 'rating'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'vendor_code', length: 50, unique: true })
  vendorCode: string;

  @Column({ name: 'vendor_name', length: 255 })
  vendorName: string;

  @Column({ name: 'legal_name', length: 255, nullable: true })
  legalName: string;

  @Column({ name: 'trading_name', length: 255, nullable: true })
  tradingName: string;

  // Classification
  @Column({ name: 'category', type: 'enum', enum: VendorCategory })
  category: VendorCategory;

  @Column({ name: 'vendor_type', type: 'enum', enum: VendorType })
  vendorType: VendorType;

  @Column({ name: 'status', type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING_APPROVAL })
  status: VendorStatus;

  @Column({ name: 'rating', type: 'enum', enum: VendorRating, nullable: true })
  rating: VendorRating;

  @Column({ name: 'rating_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingScore: number; // 0.00 to 5.00

  // Registration Information
  @Column({ name: 'registration_number', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: Date;

  @Column({ name: 'registration_country', length: 100, default: 'Ghana' })
  registrationCountry: string;

  @Column({ name: 'incorporation_date', type: 'date', nullable: true })
  incorporationDate: Date;

  // Ghana Specific IDs
  @Column({ name: 'tin_number', length: 50, nullable: true })
  tinNumber: string; // Tax Identification Number

  @Column({ name: 'ghana_card_number', length: 50, nullable: true })
  ghanaCardNumber: string; // For individual vendors

  @Column({ name: 'business_registration_number', length: 100, nullable: true })
  businessRegistrationNumber: string;

  @Column({ name: 'ssnit_number', length: 50, nullable: true })
  ssnitNumber: string;

  @Column({ name: 'nhis_number', length: 50, nullable: true })
  nhisNumber: string;

  // Contact Information
  @Column({ name: 'primary_contact_name', length: 255, nullable: true })
  primaryContactName: string;

  @Column({ name: 'primary_contact_title', length: 100, nullable: true })
  primaryContactTitle: string;

  @Column({ name: 'primary_email', length: 100 })
  primaryEmail: string;

  @Column({ name: 'secondary_email', length: 100, nullable: true })
  secondaryEmail: string;

  @Column({ name: 'primary_phone', length: 20 })
  primaryPhone: string;

  @Column({ name: 'secondary_phone', length: 20, nullable: true })
  secondaryPhone: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_provider', length: 50, nullable: true })
  mobileMoneyProvider: string; // MTN, VODAFONE, AIRTELTIGO

  @Column({ name: 'website', length: 255, nullable: true })
  website: string;

  // Address Information
  @Column({ name: 'physical_address', type: 'text' })
  physicalAddress: string;

  @Column({ name: 'postal_address', type: 'text', nullable: true })
  postalAddress: string;

  @Column({ name: 'gps_address', length: 50, nullable: true })
  gpsAddress: string; // Ghana Post GPS

  @Column({ name: 'city', length: 100 })
  city: string;

  @Column({ name: 'region', length: 100 })
  region: string;

  @Column({ name: 'district', length: 100, nullable: true })
  district: string;

  @Column({ name: 'country', length: 100, default: 'Ghana' })
  country: string;

  // Banking Information
  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_branch', length: 255, nullable: true })
  bankBranch: string;

  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber: string;

  @Column({ name: 'account_name', length: 255, nullable: true })
  accountName: string;

  @Column({ name: 'swift_code', length: 20, nullable: true })
  swiftCode: string;

  @Column({ name: 'routing_number', length: 20, nullable: true })
  routingNumber: string;

  @Column({ name: 'preferred_payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  preferredPaymentMethod: PaymentMethod;

  // Financial Information
  @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'credit_used', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditUsed: number;

  @Column({ name: 'credit_available', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditAvailable: number;

  @Column({ name: 'payment_terms', length: 100, default: 'NET 30' })
  paymentTerms: string;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  withholdingTaxRate: number;

  // Performance Metrics
  @Column({ name: 'total_orders', type: 'int', default: 0 })
  totalOrders: number;

  @Column({ name: 'completed_orders', type: 'int', default: 0 })
  completedOrders: number;

  @Column({ name: 'on_time_delivery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  onTimeDeliveryRate: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ name: 'total_business_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBusinessValue: number;

  @Column({ name: 'last_order_date', type: 'timestamp', nullable: true })
  lastOrderDate: Date;

  @Column({ name: 'last_payment_date', type: 'timestamp', nullable: true })
  lastPaymentDate: Date;

  @Column({ name: 'average_payment_days', type: 'int', default: 0 })
  averagePaymentDays: number;

  // Compliance and Certification
  @Column({ name: 'tax_clearance_certificate', type: 'boolean', default: false })
  taxClearanceCertificate: boolean;

  @Column({ name: 'tax_clearance_expiry', type: 'date', nullable: true })
  taxClearanceExpiry: Date;

  @Column({ name: 'business_operating_permit', type: 'boolean', default: false })
  businessOperatingPermit: boolean;

  @Column({ name: 'permit_expiry_date', type: 'date', nullable: true })
  permitExpiryDate: Date;

  @Column({ name: 'vat_registered', type: 'boolean', default: false })
  vatRegistered: boolean;

  @Column({ name: 'vat_number', length: 50, nullable: true })
  vatNumber: string;

  // Industry Specific Certifications
  @Column({ name: 'npa_license', type: 'boolean', default: false })
  npaLicense: boolean; // National Petroleum Authority

  @Column({ name: 'npa_license_number', length: 100, nullable: true })
  npaLicenseNumber: string;

  @Column({ name: 'npa_license_expiry', type: 'date', nullable: true })
  npaLicenseExpiry: Date;

  @Column({ name: 'epa_permit', type: 'boolean', default: false })
  epaPermit: boolean; // Environmental Protection Agency

  @Column({ name: 'epa_permit_number', length: 100, nullable: true })
  epaPermitNumber: string;

  @Column({ name: 'iso_certified', type: 'boolean', default: false })
  isoCertified: boolean;

  @Column({ name: 'iso_certification_type', length: 100, nullable: true })
  isoCertificationType: string; // ISO 9001, ISO 14001, etc.

  // Products and Services
  @Column({ name: 'product_categories', type: 'simple-array', nullable: true })
  productCategories: string[];

  @Column({ name: 'service_categories', type: 'simple-array', nullable: true })
  serviceCategories: string[];

  @Column({ name: 'specialized_products', type: 'text', nullable: true })
  specializedProducts: string;

  @Column({ name: 'delivery_capabilities', type: 'simple-array', nullable: true })
  deliveryCapabilities: string[];

  // Risk Management
  @Column({ name: 'risk_level', length: 50, default: 'LOW' })
  riskLevel: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'insurance_coverage', type: 'boolean', default: false })
  insuranceCoverage: boolean;

  @Column({ name: 'insurance_company', length: 255, nullable: true })
  insuranceCompany: string;

  @Column({ name: 'insurance_policy_number', length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'insurance_expiry_date', type: 'date', nullable: true })
  insuranceExpiryDate: Date;

  @Column({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCoverageAmount: number;

  // Local Content
  @Column({ name: 'is_local_company', type: 'boolean', default: false })
  isLocalCompany: boolean;

  @Column({ name: 'local_content_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  localContentPercentage: number;

  @Column({ name: 'local_employees_count', type: 'int', default: 0 })
  localEmployeesCount: number;

  @Column({ name: 'total_employees_count', type: 'int', default: 0 })
  totalEmployeesCount: number;

  // Blacklist and Suspension
  @Column({ name: 'blacklist_reason', type: 'text', nullable: true })
  blacklistReason: string;

  @Column({ name: 'blacklist_date', type: 'timestamp', nullable: true })
  blacklistDate: Date;

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ name: 'suspension_start_date', type: 'timestamp', nullable: true })
  suspensionStartDate: Date;

  @Column({ name: 'suspension_end_date', type: 'timestamp', nullable: true })
  suspensionEndDate: Date;

  // Evaluation and Review
  @Column({ name: 'last_evaluation_date', type: 'timestamp', nullable: true })
  lastEvaluationDate: Date;

  @Column({ name: 'next_evaluation_date', type: 'date', nullable: true })
  nextEvaluationDate: Date;

  @Column({ name: 'evaluation_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  evaluationScore: number;

  @Column({ name: 'contract_compliance_rate', type: 'decimal', precision: 5, scale: 2, default: 100 })
  contractComplianceRate: number;

  // Additional Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'attachments', type: 'simple-array', nullable: true })
  attachments: string[]; // Document URLs/paths

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_preferred', type: 'boolean', default: false })
  isPreferred: boolean;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approved_by', length: 100, nullable: true })
  approvedBy: string;

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
    // Calculate credit available
    this.creditAvailable = this.creditLimit - this.creditUsed;

    // Calculate local content percentage
    if (this.totalEmployeesCount > 0) {
      this.localContentPercentage = (this.localEmployeesCount / this.totalEmployeesCount) * 100;
    }

    // Calculate on-time delivery rate
    if (this.completedOrders > 0) {
      // This would be calculated based on actual delivery data
    }

    // Generate vendor code if not exists
    if (!this.vendorCode) {
      const prefix = this.category === VendorCategory.SUPPLIER ? 'SUP' :
                    this.category === VendorCategory.CONTRACTOR ? 'CON' :
                    this.category === VendorCategory.SERVICE_PROVIDER ? 'SRV' : 'VEN';
      this.vendorCode = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Set risk level based on various factors
    if (this.status === VendorStatus.BLACKLISTED) {
      this.riskLevel = 'CRITICAL';
    } else if (this.rating === VendorRating.POOR || this.onTimeDeliveryRate < 60) {
      this.riskLevel = 'HIGH';
    } else if (this.rating === VendorRating.BELOW_AVERAGE || this.onTimeDeliveryRate < 80) {
      this.riskLevel = 'MEDIUM';
    } else {
      this.riskLevel = 'LOW';
    }
  }
}