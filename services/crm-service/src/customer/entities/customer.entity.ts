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

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  GOVERNMENT = 'GOVERNMENT',
  RETAIL_STATION = 'RETAIL_STATION',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RESELLER = 'RESELLER',
  FLEET_OPERATOR = 'FLEET_OPERATOR',
}

export enum CustomerStatus {
  PROSPECT = 'PROSPECT',
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
  VIP = 'VIP',
  CHURNED = 'CHURNED',
}

export enum CustomerSegment {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
  STANDARD = 'STANDARD',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  COLD_CALL = 'COLD_CALL',
  ADVERTISEMENT = 'ADVERTISEMENT',
  TRADE_SHOW = 'TRADE_SHOW',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  PARTNER = 'PARTNER',
  WALK_IN = 'WALK_IN',
  OTHER = 'OTHER',
}

export enum CommunicationPreference {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_PERSON = 'IN_PERSON',
  NO_CONTACT = 'NO_CONTACT',
}

@Entity('customers')
@Index(['tenantId', 'customerCode'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'customerType'])
@Index(['tenantId', 'segment'])
@Index(['tenantId', 'email'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'customer_code', length: 50, unique: true })
  customerCode: string;

  @Column({ name: 'customer_type', type: 'enum', enum: CustomerType })
  customerType: CustomerType;

  @Column({ name: 'status', type: 'enum', enum: CustomerStatus, default: CustomerStatus.PROSPECT })
  status: CustomerStatus;

  @Column({ name: 'segment', type: 'enum', enum: CustomerSegment, default: CustomerSegment.STANDARD })
  segment: CustomerSegment;

  // Basic Information
  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName: string;

  @Column({ name: 'title', length: 50, nullable: true })
  title: string; // Mr, Mrs, Dr, etc.

  @Column({ name: 'job_title', length: 100, nullable: true })
  jobTitle: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  // Contact Information
  @Column({ name: 'email', length: 100 })
  email: string;

  @Column({ name: 'alternate_email', length: 100, nullable: true })
  alternateEmail: string;

  @Column({ name: 'phone', length: 20 })
  phone: string;

  @Column({ name: 'mobile', length: 20, nullable: true })
  mobile: string;

  @Column({ name: 'whatsapp_number', length: 20, nullable: true })
  whatsappNumber: string;

  @Column({ name: 'fax', length: 20, nullable: true })
  fax: string;

  @Column({ name: 'website', length: 255, nullable: true })
  website: string;

  @Column({ name: 'communication_preference', type: 'enum', enum: CommunicationPreference, default: CommunicationPreference.EMAIL })
  communicationPreference: CommunicationPreference;

  @Column({ name: 'preferred_language', length: 20, default: 'English' })
  preferredLanguage: string;

  // Address Information
  @Column({ name: 'billing_address', type: 'text' })
  billingAddress: string;

  @Column({ name: 'shipping_address', type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ name: 'gps_address', length: 50, nullable: true })
  gpsAddress: string; // Ghana Post GPS

  @Column({ name: 'city', length: 100 })
  city: string;

  @Column({ name: 'region', length: 100 })
  region: string;

  @Column({ name: 'district', length: 100, nullable: true })
  district: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'country', length: 100, default: 'Ghana' })
  country: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  // Ghana Specific IDs
  @Column({ name: 'tin_number', length: 50, nullable: true })
  tinNumber: string;

  @Column({ name: 'ghana_card_number', length: 50, nullable: true })
  ghanaCardNumber: string;

  @Column({ name: 'business_registration_number', length: 100, nullable: true })
  businessRegistrationNumber: string;

  @Column({ name: 'vat_number', length: 50, nullable: true })
  vatNumber: string;

  // Business Information
  @Column({ name: 'industry', length: 100, nullable: true })
  industry: string;

  @Column({ name: 'business_type', length: 100, nullable: true })
  businessType: string;

  @Column({ name: 'annual_revenue', type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ name: 'employee_count', type: 'int', nullable: true })
  employeeCount: number;

  @Column({ name: 'establishment_date', type: 'date', nullable: true })
  establishmentDate: Date;

  @Column({ name: 'fleet_size', type: 'int', nullable: true })
  fleetSize: number; // For fleet operators

  @Column({ name: 'station_count', type: 'int', nullable: true })
  stationCount: number; // For retail stations

  // Sales Information
  @Column({ name: 'lead_source', type: 'enum', enum: LeadSource, nullable: true })
  leadSource: LeadSource;

  @Column({ name: 'lead_date', type: 'date', nullable: true })
  leadDate: Date;

  @Column({ name: 'conversion_date', type: 'date', nullable: true })
  conversionDate: Date;

  @Column({ name: 'sales_rep_id', length: 50, nullable: true })
  salesRepId: string;

  @Column({ name: 'sales_rep_name', length: 255, nullable: true })
  salesRepName: string;

  @Column({ name: 'account_manager_id', length: 50, nullable: true })
  accountManagerId: string;

  @Column({ name: 'account_manager_name', length: 255, nullable: true })
  accountManagerName: string;

  @Column({ name: 'sales_territory', length: 100, nullable: true })
  salesTerritory: string;

  @Column({ name: 'sales_region', length: 100, nullable: true })
  salesRegion: string;

  // Financial Information
  @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'credit_used', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditUsed: number;

  @Column({ name: 'credit_available', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditAvailable: number;

  @Column({ name: 'payment_terms', length: 50, default: 'CASH' })
  paymentTerms: string;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ name: 'outstanding_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ name: 'overdue_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  overdueAmount: number;

  @Column({ name: 'credit_rating', length: 10, nullable: true })
  creditRating: string;

  @Column({ name: 'payment_history_score', type: 'int', default: 100 })
  paymentHistoryScore: number;

  // Transaction Metrics
  @Column({ name: 'lifetime_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ name: 'total_purchases', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPurchases: number;

  @Column({ name: 'purchase_count', type: 'int', default: 0 })
  purchaseCount: number;

  @Column({ name: 'average_order_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ name: 'last_purchase_date', type: 'timestamp', nullable: true })
  lastPurchaseDate: Date;

  @Column({ name: 'purchase_frequency_days', type: 'int', nullable: true })
  purchaseFrequencyDays: number;

  @Column({ name: 'churn_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  churnProbability: number;

  // Product Preferences
  @Column({ name: 'preferred_products', type: 'simple-array', nullable: true })
  preferredProducts: string[];

  @Column({ name: 'monthly_fuel_consumption', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyFuelConsumption: number;

  @Column({ name: 'preferred_fuel_type', length: 50, nullable: true })
  preferredFuelType: string;

  @Column({ name: 'delivery_preference', length: 50, nullable: true })
  deliveryPreference: string;

  @Column({ name: 'preferred_payment_method', length: 50, nullable: true })
  preferredPaymentMethod: string;

  // Loyalty Program
  @Column({ name: 'loyalty_program_member', type: 'boolean', default: false })
  loyaltyProgramMember: boolean;

  @Column({ name: 'loyalty_card_number', length: 50, nullable: true })
  loyaltyCardNumber: string;

  @Column({ name: 'loyalty_points', type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({ name: 'loyalty_tier', length: 50, nullable: true })
  loyaltyTier: string;

  @Column({ name: 'points_earned_ytd', type: 'int', default: 0 })
  pointsEarnedYtd: number;

  @Column({ name: 'points_redeemed_ytd', type: 'int', default: 0 })
  pointsRedeemedYtd: number;

  // Marketing
  @Column({ name: 'email_opt_in', type: 'boolean', default: true })
  emailOptIn: boolean;

  @Column({ name: 'sms_opt_in', type: 'boolean', default: false })
  smsOptIn: boolean;

  @Column({ name: 'whatsapp_opt_in', type: 'boolean', default: false })
  whatsappOptIn: boolean;

  @Column({ name: 'marketing_consent', type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({ name: 'last_marketing_campaign', length: 255, nullable: true })
  lastMarketingCampaign: string;

  @Column({ name: 'campaign_response_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  campaignResponseRate: number;

  // Customer Service
  @Column({ name: 'support_tickets_count', type: 'int', default: 0 })
  supportTicketsCount: number;

  @Column({ name: 'open_tickets_count', type: 'int', default: 0 })
  openTicketsCount: number;

  @Column({ name: 'satisfaction_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  satisfactionScore: number; // 0-5

  @Column({ name: 'nps_score', type: 'int', nullable: true })
  npsScore: number; // -100 to 100

  @Column({ name: 'last_interaction_date', type: 'timestamp', nullable: true })
  lastInteractionDate: Date;

  @Column({ name: 'last_interaction_type', length: 50, nullable: true })
  lastInteractionType: string;

  @Column({ name: 'complaints_count', type: 'int', default: 0 })
  complaintsCount: number;

  // Relationship Management
  @Column({ name: 'relationship_strength', length: 50, nullable: true })
  relationshipStrength: string; // STRONG, MODERATE, WEAK

  @Column({ name: 'engagement_level', length: 50, nullable: true })
  engagementLevel: string; // HIGH, MEDIUM, LOW

  @Column({ name: 'referral_count', type: 'int', default: 0 })
  referralCount: number;

  @Column({ name: 'referred_by_customer_id', length: 50, nullable: true })
  referredByCustomerId: string;

  @Column({ name: 'contract_customer', type: 'boolean', default: false })
  contractCustomer: boolean;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ name: 'renewal_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  renewalProbability: number;

  // Social Media
  @Column({ name: 'facebook_profile', length: 255, nullable: true })
  facebookProfile: string;

  @Column({ name: 'twitter_handle', length: 100, nullable: true })
  twitterHandle: string;

  @Column({ name: 'linkedin_profile', length: 255, nullable: true })
  linkedinProfile: string;

  @Column({ name: 'instagram_handle', length: 100, nullable: true })
  instagramHandle: string;

  // Segmentation and Analytics
  @Column({ name: 'rfm_score', length: 10, nullable: true })
  rfmScore: string; // Recency, Frequency, Monetary

  @Column({ name: 'clv_prediction', type: 'decimal', precision: 15, scale: 2, nullable: true })
  clvPrediction: number; // Customer Lifetime Value prediction

  @Column({ name: 'propensity_to_buy', type: 'decimal', precision: 5, scale: 2, nullable: true })
  propensityToBuy: number;

  @Column({ name: 'cross_sell_opportunities', type: 'simple-array', nullable: true })
  crossSellOpportunities: string[];

  @Column({ name: 'upsell_opportunities', type: 'simple-array', nullable: true })
  upsellOpportunities: string[];

  // Competition
  @Column({ name: 'competitor_customer', type: 'boolean', default: false })
  competitorCustomer: boolean;

  @Column({ name: 'competitors_used', type: 'simple-array', nullable: true })
  competitorsUsed: string[];

  @Column({ name: 'switch_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  switchProbability: number;

  @Column({ name: 'win_back_attempts', type: 'int', default: 0 })
  winBackAttempts: number;

  // Important Dates
  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'anniversary_date', type: 'date', nullable: true })
  anniversaryDate: Date;

  @Column({ name: 'first_purchase_date', type: 'date', nullable: true })
  firstPurchaseDate: Date;

  @Column({ name: 'last_contact_date', type: 'timestamp', nullable: true })
  lastContactDate: Date;

  @Column({ name: 'next_follow_up_date', type: 'date', nullable: true })
  nextFollowUpDate: Date;

  // Data Quality
  @Column({ name: 'data_completeness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  dataCompletenessScore: number;

  @Column({ name: 'data_accuracy_verified', type: 'boolean', default: false })
  dataAccuracyVerified: boolean;

  @Column({ name: 'last_data_update', type: 'timestamp', nullable: true })
  lastDataUpdate: Date;

  @Column({ name: 'gdpr_consent', type: 'boolean', default: false })
  gdprConsent: boolean;

  @Column({ name: 'gdpr_consent_date', type: 'timestamp', nullable: true })
  gdprConsentDate: Date;

  // Additional Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'custom_fields', type: 'simple-json', nullable: true })
  customFields: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_key_account', type: 'boolean', default: false })
  isKeyAccount: boolean;

  @Column({ name: 'do_not_contact', type: 'boolean', default: false })
  doNotContact: boolean;

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
    // Calculate full name
    const fullName = [this.title, this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');

    // Calculate credit available
    this.creditAvailable = this.creditLimit - this.creditUsed;

    // Calculate average order value
    if (this.purchaseCount > 0) {
      this.averageOrderValue = this.totalPurchases / this.purchaseCount;
    }

    // Calculate segment based on lifetime value
    if (this.lifetimeValue >= 1000000) {
      this.segment = CustomerSegment.PLATINUM;
    } else if (this.lifetimeValue >= 500000) {
      this.segment = CustomerSegment.GOLD;
    } else if (this.lifetimeValue >= 100000) {
      this.segment = CustomerSegment.SILVER;
    } else if (this.lifetimeValue >= 50000) {
      this.segment = CustomerSegment.BRONZE;
    } else {
      this.segment = CustomerSegment.STANDARD;
    }

    // Set key account flag
    this.isKeyAccount = this.segment === CustomerSegment.PLATINUM || 
                       this.segment === CustomerSegment.GOLD ||
                       this.monthlyFuelConsumption > 100000;

    // Calculate data completeness
    const requiredFields = [
      this.firstName, this.lastName, this.email, this.phone,
      this.billingAddress, this.city, this.region
    ];
    const filledFields = requiredFields.filter(Boolean).length;
    this.dataCompletenessScore = (filledFields / requiredFields.length) * 100;

    // Generate customer code if not exists
    if (!this.customerCode) {
      const typePrefix = {
        INDIVIDUAL: 'IND',
        CORPORATE: 'COR',
        GOVERNMENT: 'GOV',
        RETAIL_STATION: 'RET',
        COMMERCIAL: 'COM',
        INDUSTRIAL: 'IND',
        DISTRIBUTOR: 'DIS',
        RESELLER: 'RES',
        FLEET_OPERATOR: 'FLT',
      };
      const prefix = typePrefix[this.customerType] || 'CUS';
      this.customerCode = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
}