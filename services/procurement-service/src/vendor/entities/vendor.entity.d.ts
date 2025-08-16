export declare enum VendorStatus {
    PENDING_APPROVAL = "PENDING_APPROVAL",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    BLACKLISTED = "BLACKLISTED",
    UNDER_REVIEW = "UNDER_REVIEW"
}
export declare enum VendorCategory {
    SUPPLIER = "SUPPLIER",
    CONTRACTOR = "CONTRACTOR",
    SERVICE_PROVIDER = "SERVICE_PROVIDER",
    CONSULTANT = "CONSULTANT",
    TRANSPORTER = "TRANSPORTER",
    DISTRIBUTOR = "DISTRIBUTOR"
}
export declare enum VendorType {
    LOCAL = "LOCAL",
    INTERNATIONAL = "INTERNATIONAL",
    GOVERNMENT = "GOVERNMENT",
    SOLE_PROPRIETOR = "SOLE_PROPRIETOR",
    PARTNERSHIP = "PARTNERSHIP",
    CORPORATION = "CORPORATION"
}
export declare enum PaymentMethod {
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_MONEY = "MOBILE_MONEY",
    CASH = "CASH",
    CHEQUE = "CHEQUE",
    LETTER_OF_CREDIT = "LETTER_OF_CREDIT",
    DOCUMENTARY_CREDIT = "DOCUMENTARY_CREDIT"
}
export declare enum VendorRating {
    EXCELLENT = "EXCELLENT",
    GOOD = "GOOD",
    AVERAGE = "AVERAGE",
    BELOW_AVERAGE = "BELOW_AVERAGE",
    POOR = "POOR"
}
export declare class Vendor {
    id: string;
    tenantId: string;
    vendorCode: string;
    vendorName: string;
    legalName: string;
    tradingName: string;
    category: VendorCategory;
    vendorType: VendorType;
    status: VendorStatus;
    rating: VendorRating;
    ratingScore: number;
    registrationNumber: string;
    registrationDate: Date;
    registrationCountry: string;
    incorporationDate: Date;
    tinNumber: string;
    ghanaCardNumber: string;
    businessRegistrationNumber: string;
    ssnitNumber: string;
    nhisNumber: string;
    primaryContactName: string;
    primaryContactTitle: string;
    primaryEmail: string;
    secondaryEmail: string;
    primaryPhone: string;
    secondaryPhone: string;
    mobileMoneyNumber: string;
    mobileMoneyProvider: string;
    website: string;
    physicalAddress: string;
    postalAddress: string;
    gpsAddress: string;
    city: string;
    region: string;
    district: string;
    country: string;
    bankName: string;
    bankBranch: string;
    accountNumber: string;
    accountName: string;
    swiftCode: string;
    routingNumber: string;
    preferredPaymentMethod: PaymentMethod;
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
    paymentTerms: string;
    discountPercentage: number;
    currency: string;
    taxRate: number;
    withholdingTaxRate: number;
    totalOrders: number;
    completedOrders: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    totalBusinessValue: number;
    lastOrderDate: Date;
    lastPaymentDate: Date;
    averagePaymentDays: number;
    taxClearanceCertificate: boolean;
    taxClearanceExpiry: Date;
    businessOperatingPermit: boolean;
    permitExpiryDate: Date;
    vatRegistered: boolean;
    vatNumber: string;
    npaLicense: boolean;
    npaLicenseNumber: string;
    npaLicenseExpiry: Date;
    epaPermit: boolean;
    epaPermitNumber: string;
    isoCertified: boolean;
    isoCertificationType: string;
    productCategories: string[];
    serviceCategories: string[];
    specializedProducts: string;
    deliveryCapabilities: string[];
    riskLevel: string;
    insuranceCoverage: boolean;
    insuranceCompany: string;
    insurancePolicyNumber: string;
    insuranceExpiryDate: Date;
    insuranceCoverageAmount: number;
    isLocalCompany: boolean;
    localContentPercentage: number;
    localEmployeesCount: number;
    totalEmployeesCount: number;
    blacklistReason: string;
    blacklistDate: Date;
    suspensionReason: string;
    suspensionStartDate: Date;
    suspensionEndDate: Date;
    lastEvaluationDate: Date;
    nextEvaluationDate: Date;
    evaluationScore: number;
    contractComplianceRate: number;
    notes: string;
    internalNotes: string;
    attachments: string[];
    isActive: boolean;
    isPreferred: boolean;
    approvalDate: Date;
    approvedBy: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=vendor.entity.d.ts.map