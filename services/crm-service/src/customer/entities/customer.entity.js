"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = exports.CommunicationPreference = exports.LeadSource = exports.CustomerSegment = exports.CustomerStatus = exports.CustomerType = void 0;
const typeorm_1 = require("typeorm");
var CustomerType;
(function (CustomerType) {
    CustomerType["INDIVIDUAL"] = "INDIVIDUAL";
    CustomerType["CORPORATE"] = "CORPORATE";
    CustomerType["GOVERNMENT"] = "GOVERNMENT";
    CustomerType["RETAIL_STATION"] = "RETAIL_STATION";
    CustomerType["COMMERCIAL"] = "COMMERCIAL";
    CustomerType["INDUSTRIAL"] = "INDUSTRIAL";
    CustomerType["DISTRIBUTOR"] = "DISTRIBUTOR";
    CustomerType["RESELLER"] = "RESELLER";
    CustomerType["FLEET_OPERATOR"] = "FLEET_OPERATOR";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["PROSPECT"] = "PROSPECT";
    CustomerStatus["LEAD"] = "LEAD";
    CustomerStatus["QUALIFIED"] = "QUALIFIED";
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["SUSPENDED"] = "SUSPENDED";
    CustomerStatus["BLACKLISTED"] = "BLACKLISTED";
    CustomerStatus["VIP"] = "VIP";
    CustomerStatus["CHURNED"] = "CHURNED";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var CustomerSegment;
(function (CustomerSegment) {
    CustomerSegment["PLATINUM"] = "PLATINUM";
    CustomerSegment["GOLD"] = "GOLD";
    CustomerSegment["SILVER"] = "SILVER";
    CustomerSegment["BRONZE"] = "BRONZE";
    CustomerSegment["STANDARD"] = "STANDARD";
})(CustomerSegment || (exports.CustomerSegment = CustomerSegment = {}));
var LeadSource;
(function (LeadSource) {
    LeadSource["WEBSITE"] = "WEBSITE";
    LeadSource["REFERRAL"] = "REFERRAL";
    LeadSource["COLD_CALL"] = "COLD_CALL";
    LeadSource["ADVERTISEMENT"] = "ADVERTISEMENT";
    LeadSource["TRADE_SHOW"] = "TRADE_SHOW";
    LeadSource["SOCIAL_MEDIA"] = "SOCIAL_MEDIA";
    LeadSource["EMAIL_CAMPAIGN"] = "EMAIL_CAMPAIGN";
    LeadSource["PARTNER"] = "PARTNER";
    LeadSource["WALK_IN"] = "WALK_IN";
    LeadSource["OTHER"] = "OTHER";
})(LeadSource || (exports.LeadSource = LeadSource = {}));
var CommunicationPreference;
(function (CommunicationPreference) {
    CommunicationPreference["EMAIL"] = "EMAIL";
    CommunicationPreference["PHONE"] = "PHONE";
    CommunicationPreference["SMS"] = "SMS";
    CommunicationPreference["WHATSAPP"] = "WHATSAPP";
    CommunicationPreference["IN_PERSON"] = "IN_PERSON";
    CommunicationPreference["NO_CONTACT"] = "NO_CONTACT";
})(CommunicationPreference || (exports.CommunicationPreference = CommunicationPreference = {}));
let Customer = class Customer {
    id;
    tenantId;
    customerCode;
    customerType;
    status;
    segment;
    // Basic Information
    companyName;
    firstName;
    lastName;
    middleName;
    title; // Mr, Mrs, Dr, etc.
    jobTitle;
    department;
    // Contact Information
    email;
    alternateEmail;
    phone;
    mobile;
    whatsappNumber;
    fax;
    website;
    communicationPreference;
    preferredLanguage;
    // Address Information
    billingAddress;
    shippingAddress;
    gpsAddress; // Ghana Post GPS
    city;
    region;
    district;
    postalCode;
    country;
    latitude;
    longitude;
    // Ghana Specific IDs
    tinNumber;
    ghanaCardNumber;
    businessRegistrationNumber;
    vatNumber;
    // Business Information
    industry;
    businessType;
    annualRevenue;
    employeeCount;
    establishmentDate;
    fleetSize; // For fleet operators
    stationCount; // For retail stations
    // Sales Information
    leadSource;
    leadDate;
    conversionDate;
    salesRepId;
    salesRepName;
    accountManagerId;
    accountManagerName;
    salesTerritory;
    salesRegion;
    // Financial Information
    creditLimit;
    creditUsed;
    creditAvailable;
    paymentTerms;
    discountPercentage;
    outstandingBalance;
    overdueAmount;
    creditRating;
    paymentHistoryScore;
    // Transaction Metrics
    lifetimeValue;
    totalPurchases;
    purchaseCount;
    averageOrderValue;
    lastPurchaseDate;
    purchaseFrequencyDays;
    churnProbability;
    // Product Preferences
    preferredProducts;
    monthlyFuelConsumption;
    preferredFuelType;
    deliveryPreference;
    preferredPaymentMethod;
    // Loyalty Program
    loyaltyProgramMember;
    loyaltyCardNumber;
    loyaltyPoints;
    loyaltyTier;
    pointsEarnedYtd;
    pointsRedeemedYtd;
    // Marketing
    emailOptIn;
    smsOptIn;
    whatsappOptIn;
    marketingConsent;
    lastMarketingCampaign;
    campaignResponseRate;
    // Customer Service
    supportTicketsCount;
    openTicketsCount;
    satisfactionScore; // 0-5
    npsScore; // -100 to 100
    lastInteractionDate;
    lastInteractionType;
    complaintsCount;
    // Relationship Management
    relationshipStrength; // STRONG, MODERATE, WEAK
    engagementLevel; // HIGH, MEDIUM, LOW
    referralCount;
    referredByCustomerId;
    contractCustomer;
    contractEndDate;
    renewalProbability;
    // Social Media
    facebookProfile;
    twitterHandle;
    linkedinProfile;
    instagramHandle;
    // Segmentation and Analytics
    rfmScore; // Recency, Frequency, Monetary
    clvPrediction; // Customer Lifetime Value prediction
    propensityToBuy;
    crossSellOpportunities;
    upsellOpportunities;
    // Competition
    competitorCustomer;
    competitorsUsed;
    switchProbability;
    winBackAttempts;
    // Important Dates
    birthday;
    anniversaryDate;
    firstPurchaseDate;
    lastContactDate;
    nextFollowUpDate;
    // Data Quality
    dataCompletenessScore;
    dataAccuracyVerified;
    lastDataUpdate;
    gdprConsent;
    gdprConsentDate;
    // Additional Information
    notes;
    internalNotes;
    tags;
    customFields;
    isActive;
    isKeyAccount;
    doNotContact;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
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
        }
        else if (this.lifetimeValue >= 500000) {
            this.segment = CustomerSegment.GOLD;
        }
        else if (this.lifetimeValue >= 100000) {
            this.segment = CustomerSegment.SILVER;
        }
        else if (this.lifetimeValue >= 50000) {
            this.segment = CustomerSegment.BRONZE;
        }
        else {
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
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Customer.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_code', length: 50, unique: true }),
    __metadata("design:type", String)
], Customer.prototype, "customerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_type', type: 'enum', enum: CustomerType }),
    __metadata("design:type", String)
], Customer.prototype, "customerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: CustomerStatus, default: CustomerStatus.PROSPECT }),
    __metadata("design:type", String)
], Customer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segment', type: 'enum', enum: CustomerSegment, default: CustomerSegment.STANDARD }),
    __metadata("design:type", String)
], Customer.prototype, "segment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'middle_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_title', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alternate_email', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "alternateEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', length: 20 }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'whatsapp_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "whatsappNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fax', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "fax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'website', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'communication_preference', type: 'enum', enum: CommunicationPreference, default: CommunicationPreference.EMAIL }),
    __metadata("design:type", String)
], Customer.prototype, "communicationPreference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_language', length: 20, default: 'English' }),
    __metadata("design:type", String)
], Customer.prototype, "preferredLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_address', type: 'text' }),
    __metadata("design:type", String)
], Customer.prototype, "billingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipping_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "shippingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gps_address', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "gpsAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'city', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'region', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'district', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country', length: 100, default: 'Ghana' }),
    __metadata("design:type", String)
], Customer.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tin_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "tinNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_card_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "ghanaCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_registration_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "businessRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "vatNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'industry', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_revenue', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "annualRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_count', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "employeeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'establishment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "establishmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fleet_size', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "fleetSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_count', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "stationCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_source', type: 'enum', enum: LeadSource, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "leadSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "leadDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "conversionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_rep_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "salesRepId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_rep_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "salesRepName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_manager_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "accountManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_manager_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "accountManagerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_territory', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "salesTerritory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_region', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "salesRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_used', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_available', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', length: 50, default: 'CASH' }),
    __metadata("design:type", String)
], Customer.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'outstanding_balance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "outstandingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overdue_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "overdueAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_rating', length: 10, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "creditRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_history_score', type: 'int', default: 100 }),
    __metadata("design:type", Number)
], Customer.prototype, "paymentHistoryScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lifetime_value', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "lifetimeValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_purchases', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalPurchases", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "purchaseCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'average_order_value', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "averageOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_purchase_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "lastPurchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_frequency_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "purchaseFrequencyDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'churn_probability', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "churnProbability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_products', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "preferredProducts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_fuel_consumption', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "monthlyFuelConsumption", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_fuel_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "preferredFuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_preference', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "deliveryPreference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_payment_method', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "preferredPaymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loyalty_program_member', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "loyaltyProgramMember", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loyalty_card_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "loyaltyCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loyalty_points', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "loyaltyPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loyalty_tier', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "loyaltyTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'points_earned_ytd', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "pointsEarnedYtd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'points_redeemed_ytd', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "pointsRedeemedYtd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_opt_in', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "emailOptIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sms_opt_in', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "smsOptIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'whatsapp_opt_in', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "whatsappOptIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marketing_consent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "marketingConsent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_marketing_campaign', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "lastMarketingCampaign", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campaign_response_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "campaignResponseRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'support_tickets_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "supportTicketsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_tickets_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "openTicketsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'satisfaction_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "satisfactionScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nps_score', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "npsScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_interaction_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "lastInteractionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_interaction_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "lastInteractionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'complaints_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "complaintsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'relationship_strength', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "relationshipStrength", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engagement_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "engagementLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referral_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "referralCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referred_by_customer_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "referredByCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_customer', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "contractCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "contractEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_probability', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "renewalProbability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'facebook_profile', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "facebookProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'twitter_handle', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "twitterHandle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'linkedin_profile', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "linkedinProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'instagram_handle', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "instagramHandle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rfm_score', length: 10, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "rfmScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clv_prediction', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "clvPrediction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'propensity_to_buy', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "propensityToBuy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cross_sell_opportunities', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "crossSellOpportunities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'upsell_opportunities', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "upsellOpportunities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competitor_customer', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "competitorCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competitors_used', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "competitorsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'switch_probability', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "switchProbability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'win_back_attempts', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "winBackAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birthday', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'anniversary_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "anniversaryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_purchase_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "firstPurchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_contact_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "lastContactDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_follow_up_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "nextFollowUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_completeness_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "dataCompletenessScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_accuracy_verified', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "dataAccuracyVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_data_update', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "lastDataUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gdpr_consent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "gdprConsent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gdpr_consent_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "gdprConsentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'custom_fields', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_key_account', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isKeyAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'do_not_contact', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "doNotContact", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Customer.prototype, "calculateFields", null);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers'),
    (0, typeorm_1.Index)(['tenantId', 'customerCode'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'customerType']),
    (0, typeorm_1.Index)(['tenantId', 'segment']),
    (0, typeorm_1.Index)(['tenantId', 'email'])
], Customer);
//# sourceMappingURL=customer.entity.js.map