import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { APInvoice } from './ap-invoice.entity';
import { VendorPayment } from './vendor-payment.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { VendorContract } from './vendor-contract.entity';

export enum VendorType {
  FUEL_SUPPLIER = 'FUEL_SUPPLIER',
  EQUIPMENT_SUPPLIER = 'EQUIPMENT_SUPPLIER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  CONTRACTOR = 'CONTRACTOR',
  UTILITY_PROVIDER = 'UTILITY_PROVIDER',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION',
  LOGISTICS_PROVIDER = 'LOGISTICS_PROVIDER',
  MAINTENANCE_SERVICES = 'MAINTENANCE_SERVICES',
  TECHNOLOGY_PROVIDER = 'TECHNOLOGY_PROVIDER',
  OTHER = 'OTHER'
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BLACKLISTED = 'BLACKLISTED'
}

export enum PaymentTerms {
  NET_7 = 'NET_7',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  COD = 'COD',
  CIA = 'CIA', // Cash in Advance
  END_OF_MONTH = 'EOM',
  PROGRESS_BILLING = 'PROGRESS_BILLING'
}

export enum VendorRating {
  EXCELLENT = 'EXCELLENT', // A+
  VERY_GOOD = 'VERY_GOOD', // A
  GOOD = 'GOOD',          // B
  FAIR = 'FAIR',          // C
  POOR = 'POOR',          // D
  UNACCEPTABLE = 'UNACCEPTABLE' // F
}

@Entity('vendors')
@Index(['tenantId', 'vendorNumber'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'vendorType'])
@Index(['tinNumber'])
@Index(['businessRegistration'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'vendor_number', length: 50, unique: true })
  vendorNumber: string;

  @Column({ name: 'vendor_name', length: 255 })
  vendorName: string;

  @Column({ name: 'trading_name', length: 255, nullable: true })
  tradingName: string;

  @Column({ 
    name: 'vendor_type', 
    type: 'enum', 
    enum: VendorType 
  })
  vendorType: VendorType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: VendorStatus,
    default: VendorStatus.PENDING_APPROVAL
  })
  status: VendorStatus;

  // Contact Information
  @Column({ name: 'primary_contact_name', length: 255, nullable: true })
  primaryContactName: string;

  @Column({ name: 'primary_contact_title', length: 100, nullable: true })
  primaryContactTitle: string;

  @Column({ name: 'email', length: 255, nullable: true })
  email: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'mobile', length: 20, nullable: true })
  mobile: string;

  @Column({ name: 'fax', length: 20, nullable: true })
  fax: string;

  @Column({ name: 'website', length: 255, nullable: true })
  website: string;

  // Physical Address
  @Column({ name: 'street_address', type: 'text', nullable: true })
  streetAddress: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'country', length: 50, default: 'Ghana' })
  country: string;

  @Column({ name: 'ghana_post_gps', length: 20, nullable: true })
  ghanaPostGPS: string;

  // Legal and Registration Information
  @Column({ name: 'tin_number', length: 20, nullable: true })
  tinNumber: string; // Tax Identification Number

  @Column({ name: 'vat_number', length: 20, nullable: true })
  vatNumber: string;

  @Column({ name: 'business_registration', length: 50, nullable: true })
  businessRegistration: string;

  @Column({ name: 'incorporation_date', nullable: true })
  incorporationDate: Date;

  @Column({ name: 'business_license', length: 100, nullable: true })
  businessLicense: string;

  @Column({ name: 'business_license_expiry', nullable: true })
  businessLicenseExpiry: Date;

  @Column({ name: 'social_security_number', length: 20, nullable: true })
  socialSecurityNumber: string; // SSNIT

  @Column({ name: 'ghana_card_number', length: 20, nullable: true })
  ghanaCardNumber: string;

  // Financial Information
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ 
    name: 'payment_terms', 
    type: 'enum', 
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  paymentTerms: PaymentTerms;

  @Column({ name: 'payment_method', length: 50, default: 'BANK_TRANSFER' })
  paymentMethod: string; // BANK_TRANSFER, CHECK, MOBILE_MONEY, CASH

  @Column({ 
    name: 'credit_limit', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  creditLimit: number;

  @Column({ 
    name: 'current_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  currentBalance: number;

  @Column({ name: 'early_payment_discount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  earlyPaymentDiscount: number; // Percentage

  @Column({ name: 'early_payment_days', default: 0 })
  earlyPaymentDays: number;

  @Column({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  withholdingTaxRate: number; // Ghana withholding tax

  @Column({ name: 'withholding_tax_exempt', default: false })
  withholdingTaxExempt: boolean;

  // Banking Information
  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_account_name', length: 255, nullable: true })
  bankAccountName: string;

  @Column({ name: 'bank_branch', length: 255, nullable: true })
  bankBranch: string;

  @Column({ name: 'bank_code', length: 20, nullable: true })
  bankCode: string;

  @Column({ name: 'swift_code', length: 20, nullable: true })
  swiftCode: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string; // MTN, Vodafone, AirtelTigo

  // Performance and Rating
  @Column({ 
    name: 'vendor_rating', 
    type: 'enum', 
    enum: VendorRating,
    nullable: true
  })
  vendorRating: VendorRating;

  @Column({ name: 'rating_date', nullable: true })
  ratingDate: Date;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number; // 0-100

  @Column({ name: 'delivery_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryScore: number; // 0-100

  @Column({ name: 'service_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceScore: number; // 0-100

  @Column({ name: 'price_competitiveness', type: 'decimal', precision: 5, scale: 2, default: 0 })
  priceCompetitiveness: number; // 0-100

  @Column({ name: 'overall_rating', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallRating: number; // Weighted average

  // Categories and Classifications
  @Column({ name: 'primary_category', length: 100, nullable: true })
  primaryCategory: string;

  @Column({ name: 'subcategory', length: 100, nullable: true })
  subcategory: string;

  @Column({ name: 'industry_sector', length: 100, nullable: true })
  industrySector: string;

  @Column({ name: 'vendor_class', length: 50, default: 'STANDARD' })
  vendorClass: string; // PREFERRED, STANDARD, RESTRICTED

  @Column({ name: 'is_strategic_vendor', default: false })
  isStrategicVendor: boolean;

  @Column({ name: 'is_critical_vendor', default: false })
  isCriticalVendor: boolean;

  @Column({ name: 'is_local_vendor', default: true })
  isLocalVendor: boolean; // Ghana-based vendor

  @Column({ name: 'is_minority_owned', default: false })
  isMinorityOwned: boolean;

  @Column({ name: 'is_women_owned', default: false })
  isWomenOwned: boolean;

  // Compliance and Certifications
  @Column({ name: 'iso_certified', default: false })
  isoCertified: boolean;

  @Column({ name: 'iso_certification_number', length: 100, nullable: true })
  isoCertificationNumber: string;

  @Column({ name: 'iso_expiry_date', nullable: true })
  isoExpiryDate: Date;

  @Column({ name: 'environmental_certification', default: false })
  environmentalCertification: boolean;

  @Column({ name: 'safety_certification', default: false })
  safetyCertification: boolean;

  @Column({ name: 'insurance_certificate', length: 255, nullable: true })
  insuranceCertificate: string;

  @Column({ name: 'insurance_expiry', nullable: true })
  insuranceExpiry: Date;

  @Column({ 
    name: 'insurance_coverage_amount', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  insuranceCoverageAmount: number;

  // Approval and Verification
  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'next_review_date', nullable: true })
  nextReviewDate: Date;

  @Column({ name: 'verification_status', length: 20, default: 'PENDING' })
  verificationStatus: string; // PENDING, VERIFIED, FAILED

  @Column({ name: 'verification_date', nullable: true })
  verificationDate: Date;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy: string;

  // Performance Metrics
  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;

  @Column({ 
    name: 'total_order_value', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  totalOrderValue: number;

  @Column({ name: 'on_time_delivery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  onTimeDeliveryRate: number; // Percentage

  @Column({ name: 'quality_rejection_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityRejectionRate: number; // Percentage

  @Column({ name: 'average_lead_time', default: 0 })
  averageLeadTime: number; // Days

  @Column({ name: 'last_order_date', nullable: true })
  lastOrderDate: Date;

  @Column({ name: 'last_payment_date', nullable: true })
  lastPaymentDate: Date;

  @Column({ 
    name: 'last_payment_amount', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    nullable: true 
  })
  lastPaymentAmount: number;

  @Column({ name: 'days_payable_outstanding', default: 0 })
  daysPayableOutstanding: number;

  // Risk Management
  @Column({ name: 'risk_category', length: 20, default: 'MEDIUM' })
  riskCategory: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'financial_risk_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  financialRiskScore: number; // 0-100

  @Column({ name: 'operational_risk_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  operationalRiskScore: number; // 0-100

  @Column({ name: 'compliance_risk_score', type: 'decimal', precision: 5, scale: 2, default: 50 })
  complianceRiskScore: number; // 0-100

  @Column({ name: 'sanctions_check_status', length: 20, default: 'CLEAR' })
  sanctionsCheckStatus: string; // CLEAR, FLAGGED, BLOCKED

  @Column({ name: 'sanctions_check_date', nullable: true })
  sanctionsCheckDate: Date;

  @Column({ name: 'blacklist_status', default: false })
  blacklistStatus: boolean;

  @Column({ name: 'blacklist_reason', type: 'text', nullable: true })
  blacklistReason: string;

  // IFRS Compliance
  @Column({ name: 'related_party', default: false })
  relatedParty: boolean; // IAS 24

  @Column({ name: 'related_party_relationship', length: 100, nullable: true })
  relatedPartyRelationship: string;

  @Column({ name: 'expected_credit_loss', type: 'decimal', precision: 15, scale: 2, default: 0 })
  expectedCreditLoss: number; // If vendor owes money

  // Communication and Preferences
  @Column({ name: 'preferred_communication_method', length: 20, default: 'EMAIL' })
  preferredCommunicationMethod: string; // EMAIL, SMS, PHONE, POSTAL

  @Column({ name: 'statement_frequency', length: 20, default: 'MONTHLY' })
  statementFrequency: string;

  @Column({ name: 'preferred_language', length: 10, default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'time_zone', length: 50, default: 'Africa/Accra' })
  timeZone: string;

  // Emergency and Backup Information
  @Column({ name: 'emergency_contact_name', length: 255, nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'backup_vendor_id', nullable: true })
  backupVendorId: string;

  @Column({ name: 'alternative_suppliers', type: 'text', nullable: true })
  alternativeSuppliers: string; // JSON array

  // Integration and System Fields
  @Column({ name: 'external_vendor_id', length: 100, nullable: true })
  externalVendorId: string; // ID in external systems

  @Column({ name: 'erp_vendor_code', length: 50, nullable: true })
  erpVendorCode: string;

  @Column({ name: 'sync_status', length: 20, default: 'SYNCED' })
  syncStatus: string; // SYNCED, PENDING, FAILED

  @Column({ name: 'last_sync_date', nullable: true })
  lastSyncDate: Date;

  // Additional Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array of tags

  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON object for tenant-specific fields

  @Column({ name: 'attachments', type: 'text', nullable: true })
  attachments: string; // JSON array of document URLs

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
  @OneToMany(() => APInvoice, invoice => invoice.vendor)
  invoices: APInvoice[];

  @OneToMany(() => VendorPayment, payment => payment.vendor)
  payments: VendorPayment[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.vendor)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => VendorContract, contract => contract.vendor)
  contracts: VendorContract[];
}