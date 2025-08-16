import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { ARInvoice } from './ar-invoice.entity';
import { CustomerPayment } from './customer-payment.entity';
import { CreditLimit } from './credit-limit.entity';
import { CustomerCreditRating } from './customer-credit-rating.entity';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  GOVERNMENT = 'GOVERNMENT',
  NGO = 'NGO',
  FUEL_DEALER = 'FUEL_DEALER',
  FLEET_OPERATOR = 'FLEET_OPERATOR',
  INDUSTRIAL = 'INDUSTRIAL'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED'
}

export enum PaymentTerms {
  NET_7 = 'NET_7',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  COD = 'COD', // Cash on Delivery
  CIA = 'CIA', // Cash in Advance
  CREDIT_CARD = 'CREDIT_CARD',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

@Entity('customers')
@Index(['tenantId', 'customerNumber'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'customerType'])
@Index(['email'])
@Index(['tinNumber'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'customer_number', length: 50, unique: true })
  customerNumber: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @Column({ name: 'trading_name', length: 255, nullable: true })
  tradingName: string;

  @Column({ 
    name: 'customer_type', 
    type: 'enum', 
    enum: CustomerType 
  })
  customerType: CustomerType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE
  })
  status: CustomerStatus;

  // Contact Information
  @Column({ name: 'email', length: 255, nullable: true })
  email: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'mobile', length: 20, nullable: true })
  mobile: string;

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
  ghanaPostGPS: string; // Ghana Post GPS address

  // Billing Address (if different)
  @Column({ name: 'billing_address_same', default: true })
  billingAddressSame: boolean;

  @Column({ name: 'billing_street_address', type: 'text', nullable: true })
  billingStreetAddress: string;

  @Column({ name: 'billing_city', length: 100, nullable: true })
  billingCity: string;

  @Column({ name: 'billing_region', length: 100, nullable: true })
  billingRegion: string;

  @Column({ name: 'billing_postal_code', length: 20, nullable: true })
  billingPostalCode: string;

  // Legal and Tax Information
  @Column({ name: 'tin_number', length: 20, nullable: true })
  tinNumber: string; // Tax Identification Number

  @Column({ name: 'vat_number', length: 20, nullable: true })
  vatNumber: string;

  @Column({ name: 'business_registration', length: 50, nullable: true })
  businessRegistration: string;

  @Column({ name: 'sssnit_number', length: 20, nullable: true })
  sssnitNumber: string; // Social Security and National Insurance Trust

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

  @Column({ 
    name: 'available_credit', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  availableCredit: number;

  @Column({ name: 'credit_rating', length: 20, nullable: true })
  creditRating: string; // AAA, AA, A, BBB, BB, B, CCC, CC, C, D

  @Column({ name: 'credit_rating_date', nullable: true })
  creditRatingDate: Date;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ name: 'early_payment_discount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  earlyPaymentDiscount: number;

  @Column({ name: 'early_payment_days', default: 0 })
  earlyPaymentDays: number;

  // Banking Information
  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_branch', length: 255, nullable: true })
  bankBranch: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string; // MTN, Vodafone, AirtelTigo

  // Industry and Business Classification
  @Column({ name: 'industry_sector', length: 100, nullable: true })
  industrySector: string;

  @Column({ name: 'business_segment', length: 100, nullable: true })
  businessSegment: string;

  @Column({ name: 'sic_code', length: 10, nullable: true })
  sicCode: string; // Standard Industrial Classification

  @Column({ name: 'fuel_consumption_pattern', length: 50, nullable: true })
  fuelConsumptionPattern: string; // HIGH, MEDIUM, LOW, SEASONAL

  @Column({ name: 'average_monthly_volume', type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageMonthlyVolume: number; // Liters

  // Sales and Account Management
  @Column({ name: 'sales_rep_id', nullable: true })
  salesRepId: string;

  @Column({ name: 'account_manager_id', nullable: true })
  accountManagerId: string;

  @Column({ name: 'territory', length: 100, nullable: true })
  territory: string;

  @Column({ name: 'customer_group', length: 100, nullable: true })
  customerGroup: string;

  @Column({ name: 'price_group', length: 100, nullable: true })
  priceGroup: string;

  // Collection and Risk Management
  @Column({ name: 'collection_priority', length: 20, default: 'NORMAL' })
  collectionPriority: string; // HIGH, NORMAL, LOW

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

  @Column({ name: 'days_sales_outstanding', default: 0 })
  daysSalesOutstanding: number;

  @Column({ name: 'payment_history_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  paymentHistoryScore: number; // 0-100

  @Column({ name: 'risk_category', length: 20, default: 'MEDIUM' })
  riskCategory: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'collection_agency_flag', default: false })
  collectionAgencyFlag: boolean;

  @Column({ name: 'legal_action_flag', default: false })
  legalActionFlag: boolean;

  // IFRS Compliance
  @Column({ name: 'expected_credit_loss', type: 'decimal', precision: 15, scale: 2, default: 0 })
  expectedCreditLoss: number; // IFRS 9

  @Column({ name: 'loss_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossAllowance: number;

  @Column({ name: 'stage_classification', length: 20, default: 'STAGE_1' })
  stageClassification: string; // STAGE_1, STAGE_2, STAGE_3 (IFRS 9)

  @Column({ name: 'significant_increase_credit_risk', default: false })
  significantIncreaseCreditRisk: boolean;

  @Column({ name: 'credit_impaired', default: false })
  creditImpaired: boolean;

  // Communication Preferences
  @Column({ name: 'statement_delivery_method', length: 20, default: 'EMAIL' })
  statementDeliveryMethod: string; // EMAIL, POSTAL, SMS, PORTAL

  @Column({ name: 'invoice_delivery_method', length: 20, default: 'EMAIL' })
  invoiceDeliveryMethod: string;

  @Column({ name: 'preferred_language', length: 10, default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'communication_frequency', length: 20, default: 'MONTHLY' })
  communicationFrequency: string;

  // Loyalty and Rewards
  @Column({ name: 'loyalty_points', default: 0 })
  loyaltyPoints: number;

  @Column({ name: 'loyalty_tier', length: 20, nullable: true })
  loyaltyTier: string; // BRONZE, SILVER, GOLD, PLATINUM

  @Column({ name: 'referral_source', length: 255, nullable: true })
  referralSource: string;

  @Column({ name: 'customer_since' })
  customerSince: Date;

  // Compliance and Verification
  @Column({ name: 'kyc_status', length: 20, default: 'PENDING' })
  kycStatus: string; // PENDING, VERIFIED, REJECTED, EXPIRED

  @Column({ name: 'kyc_verification_date', nullable: true })
  kycVerificationDate: Date;

  @Column({ name: 'aml_check_status', length: 20, default: 'PENDING' })
  amlCheckStatus: string; // Anti-Money Laundering

  @Column({ name: 'sanctions_check_status', length: 20, default: 'CLEAR' })
  sanctionsCheckStatus: string;

  @Column({ name: 'pep_status', default: false })
  pepStatus: boolean; // Politically Exposed Person

  // System Fields
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array of tags

  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON object for custom fields

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ARInvoice, invoice => invoice.customer)
  invoices: ARInvoice[];

  @OneToMany(() => CustomerPayment, payment => payment.customer)
  payments: CustomerPayment[];

  @OneToMany(() => CreditLimit, creditLimit => creditLimit.customer)
  creditLimits: CreditLimit[];

  @OneToMany(() => CustomerCreditRating, rating => rating.customer)
  creditRatings: CustomerCreditRating[];
}