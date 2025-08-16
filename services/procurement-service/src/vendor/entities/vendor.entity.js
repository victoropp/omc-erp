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
exports.Vendor = exports.VendorRating = exports.PaymentMethod = exports.VendorType = exports.VendorCategory = exports.VendorStatus = void 0;
const typeorm_1 = require("typeorm");
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    VendorStatus["ACTIVE"] = "ACTIVE";
    VendorStatus["INACTIVE"] = "INACTIVE";
    VendorStatus["SUSPENDED"] = "SUSPENDED";
    VendorStatus["BLACKLISTED"] = "BLACKLISTED";
    VendorStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
var VendorCategory;
(function (VendorCategory) {
    VendorCategory["SUPPLIER"] = "SUPPLIER";
    VendorCategory["CONTRACTOR"] = "CONTRACTOR";
    VendorCategory["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
    VendorCategory["CONSULTANT"] = "CONSULTANT";
    VendorCategory["TRANSPORTER"] = "TRANSPORTER";
    VendorCategory["DISTRIBUTOR"] = "DISTRIBUTOR";
})(VendorCategory || (exports.VendorCategory = VendorCategory = {}));
var VendorType;
(function (VendorType) {
    VendorType["LOCAL"] = "LOCAL";
    VendorType["INTERNATIONAL"] = "INTERNATIONAL";
    VendorType["GOVERNMENT"] = "GOVERNMENT";
    VendorType["SOLE_PROPRIETOR"] = "SOLE_PROPRIETOR";
    VendorType["PARTNERSHIP"] = "PARTNERSHIP";
    VendorType["CORPORATION"] = "CORPORATION";
})(VendorType || (exports.VendorType = VendorType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CHEQUE"] = "CHEQUE";
    PaymentMethod["LETTER_OF_CREDIT"] = "LETTER_OF_CREDIT";
    PaymentMethod["DOCUMENTARY_CREDIT"] = "DOCUMENTARY_CREDIT";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var VendorRating;
(function (VendorRating) {
    VendorRating["EXCELLENT"] = "EXCELLENT";
    VendorRating["GOOD"] = "GOOD";
    VendorRating["AVERAGE"] = "AVERAGE";
    VendorRating["BELOW_AVERAGE"] = "BELOW_AVERAGE";
    VendorRating["POOR"] = "POOR";
})(VendorRating || (exports.VendorRating = VendorRating = {}));
let Vendor = class Vendor {
    id;
    tenantId;
    vendorCode;
    vendorName;
    legalName;
    tradingName;
    // Classification
    category;
    vendorType;
    status;
    rating;
    ratingScore; // 0.00 to 5.00
    // Registration Information
    registrationNumber;
    registrationDate;
    registrationCountry;
    incorporationDate;
    // Ghana Specific IDs
    tinNumber; // Tax Identification Number
    ghanaCardNumber; // For individual vendors
    businessRegistrationNumber;
    ssnitNumber;
    nhisNumber;
    // Contact Information
    primaryContactName;
    primaryContactTitle;
    primaryEmail;
    secondaryEmail;
    primaryPhone;
    secondaryPhone;
    mobileMoneyNumber;
    mobileMoneyProvider; // MTN, VODAFONE, AIRTELTIGO
    website;
    // Address Information
    physicalAddress;
    postalAddress;
    gpsAddress; // Ghana Post GPS
    city;
    region;
    district;
    country;
    // Banking Information
    bankName;
    bankBranch;
    accountNumber;
    accountName;
    swiftCode;
    routingNumber;
    preferredPaymentMethod;
    // Financial Information
    creditLimit;
    creditUsed;
    creditAvailable;
    paymentTerms;
    discountPercentage;
    currency;
    taxRate;
    withholdingTaxRate;
    // Performance Metrics
    totalOrders;
    completedOrders;
    onTimeDeliveryRate;
    qualityScore;
    totalBusinessValue;
    lastOrderDate;
    lastPaymentDate;
    averagePaymentDays;
    // Compliance and Certification
    taxClearanceCertificate;
    taxClearanceExpiry;
    businessOperatingPermit;
    permitExpiryDate;
    vatRegistered;
    vatNumber;
    // Industry Specific Certifications
    npaLicense; // National Petroleum Authority
    npaLicenseNumber;
    npaLicenseExpiry;
    epaPermit; // Environmental Protection Agency
    epaPermitNumber;
    isoCertified;
    isoCertificationType; // ISO 9001, ISO 14001, etc.
    // Products and Services
    productCategories;
    serviceCategories;
    specializedProducts;
    deliveryCapabilities;
    // Risk Management
    riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    insuranceCoverage;
    insuranceCompany;
    insurancePolicyNumber;
    insuranceExpiryDate;
    insuranceCoverageAmount;
    // Local Content
    isLocalCompany;
    localContentPercentage;
    localEmployeesCount;
    totalEmployeesCount;
    // Blacklist and Suspension
    blacklistReason;
    blacklistDate;
    suspensionReason;
    suspensionStartDate;
    suspensionEndDate;
    // Evaluation and Review
    lastEvaluationDate;
    nextEvaluationDate;
    evaluationScore;
    contractComplianceRate;
    // Additional Information
    notes;
    internalNotes;
    attachments; // Document URLs/paths
    isActive;
    isPreferred;
    approvalDate;
    approvedBy;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
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
        }
        else if (this.rating === VendorRating.POOR || this.onTimeDeliveryRate < 60) {
            this.riskLevel = 'HIGH';
        }
        else if (this.rating === VendorRating.BELOW_AVERAGE || this.onTimeDeliveryRate < 80) {
            this.riskLevel = 'MEDIUM';
        }
        else {
            this.riskLevel = 'LOW';
        }
    }
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Vendor.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_code', length: 50, unique: true }),
    __metadata("design:type", String)
], Vendor.prototype, "vendorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_name', length: 255 }),
    __metadata("design:type", String)
], Vendor.prototype, "vendorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "legalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trading_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "tradingName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', type: 'enum', enum: VendorCategory }),
    __metadata("design:type", String)
], Vendor.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_type', type: 'enum', enum: VendorType }),
    __metadata("design:type", String)
], Vendor.prototype, "vendorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING_APPROVAL }),
    __metadata("design:type", String)
], Vendor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rating', type: 'enum', enum: VendorRating, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rating_score', type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Vendor.prototype, "ratingScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_country', length: 100, default: 'Ghana' }),
    __metadata("design:type", String)
], Vendor.prototype, "registrationCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incorporation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "incorporationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tin_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "tinNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_card_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "ghanaCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_registration_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "businessRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "ssnitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nhis_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "nhisNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_contact_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "primaryContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_contact_title', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "primaryContactTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_email', length: 100 }),
    __metadata("design:type", String)
], Vendor.prototype, "primaryEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secondary_email', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "secondaryEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_phone', length: 20 }),
    __metadata("design:type", String)
], Vendor.prototype, "primaryPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secondary_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "secondaryPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "mobileMoneyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_provider', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "mobileMoneyProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'website', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'physical_address', type: 'text' }),
    __metadata("design:type", String)
], Vendor.prototype, "physicalAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "postalAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gps_address', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "gpsAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'city', length: 100 }),
    __metadata("design:type", String)
], Vendor.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'region', length: 100 }),
    __metadata("design:type", String)
], Vendor.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'district', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country', length: 100, default: 'Ghana' }),
    __metadata("design:type", String)
], Vendor.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_branch', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "bankBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'swift_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'routing_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "routingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER }),
    __metadata("design:type", String)
], Vendor.prototype, "preferredPaymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_used', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "creditUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_available', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "creditAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', length: 100, default: 'NET 30' }),
    __metadata("design:type", String)
], Vendor.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], Vendor.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "taxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "withholdingTaxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_orders', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "totalOrders", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_orders', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "completedOrders", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'on_time_delivery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "onTimeDeliveryRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_business_value', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "totalBusinessValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_order_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "lastOrderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_payment_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "lastPaymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'average_payment_days', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "averagePaymentDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_clearance_certificate', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "taxClearanceCertificate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_clearance_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "taxClearanceExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_operating_permit', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "businessOperatingPermit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'permit_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "permitExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_registered', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "vatRegistered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "vatNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_license', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "npaLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_license_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "npaLicenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_license_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "npaLicenseExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'epa_permit', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "epaPermit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'epa_permit_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "epaPermitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'iso_certified', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isoCertified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'iso_certification_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "isoCertificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_categories', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Vendor.prototype, "productCategories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_categories', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Vendor.prototype, "serviceCategories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'specialized_products', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "specializedProducts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_capabilities', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Vendor.prototype, "deliveryCapabilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_level', length: 50, default: 'LOW' }),
    __metadata("design:type", String)
], Vendor.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "insuranceCoverage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_company', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "insuranceCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_policy_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "insuranceExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Vendor.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_local_company', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isLocalCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_content_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "localContentPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_employees_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "localEmployeesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_employees_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "totalEmployeesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blacklist_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "blacklistReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blacklist_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "blacklistDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suspension_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "suspensionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suspension_start_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "suspensionStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suspension_end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "suspensionEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_evaluation_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "lastEvaluationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_evaluation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "nextEvaluationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evaluation_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Vendor.prototype, "evaluationScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_compliance_rate', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], Vendor.prototype, "contractComplianceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attachments', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Vendor.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_preferred', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isPreferred", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Vendor.prototype, "calculateFields", null);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)('vendors'),
    (0, typeorm_1.Index)(['tenantId', 'vendorCode'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'category']),
    (0, typeorm_1.Index)(['tenantId', 'rating'])
], Vendor);
//# sourceMappingURL=vendor.entity.js.map