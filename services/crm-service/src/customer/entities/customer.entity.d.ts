export declare enum CustomerType {
    INDIVIDUAL = "INDIVIDUAL",
    CORPORATE = "CORPORATE",
    GOVERNMENT = "GOVERNMENT",
    RETAIL_STATION = "RETAIL_STATION",
    COMMERCIAL = "COMMERCIAL",
    INDUSTRIAL = "INDUSTRIAL",
    DISTRIBUTOR = "DISTRIBUTOR",
    RESELLER = "RESELLER",
    FLEET_OPERATOR = "FLEET_OPERATOR"
}
export declare enum CustomerStatus {
    PROSPECT = "PROSPECT",
    LEAD = "LEAD",
    QUALIFIED = "QUALIFIED",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    BLACKLISTED = "BLACKLISTED",
    VIP = "VIP",
    CHURNED = "CHURNED"
}
export declare enum CustomerSegment {
    PLATINUM = "PLATINUM",
    GOLD = "GOLD",
    SILVER = "SILVER",
    BRONZE = "BRONZE",
    STANDARD = "STANDARD"
}
export declare enum LeadSource {
    WEBSITE = "WEBSITE",
    REFERRAL = "REFERRAL",
    COLD_CALL = "COLD_CALL",
    ADVERTISEMENT = "ADVERTISEMENT",
    TRADE_SHOW = "TRADE_SHOW",
    SOCIAL_MEDIA = "SOCIAL_MEDIA",
    EMAIL_CAMPAIGN = "EMAIL_CAMPAIGN",
    PARTNER = "PARTNER",
    WALK_IN = "WALK_IN",
    OTHER = "OTHER"
}
export declare enum CommunicationPreference {
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP",
    IN_PERSON = "IN_PERSON",
    NO_CONTACT = "NO_CONTACT"
}
export declare class Customer {
    id: string;
    tenantId: string;
    customerCode: string;
    customerType: CustomerType;
    status: CustomerStatus;
    segment: CustomerSegment;
    companyName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    title: string;
    jobTitle: string;
    department: string;
    email: string;
    alternateEmail: string;
    phone: string;
    mobile: string;
    whatsappNumber: string;
    fax: string;
    website: string;
    communicationPreference: CommunicationPreference;
    preferredLanguage: string;
    billingAddress: string;
    shippingAddress: string;
    gpsAddress: string;
    city: string;
    region: string;
    district: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
    tinNumber: string;
    ghanaCardNumber: string;
    businessRegistrationNumber: string;
    vatNumber: string;
    industry: string;
    businessType: string;
    annualRevenue: number;
    employeeCount: number;
    establishmentDate: Date;
    fleetSize: number;
    stationCount: number;
    leadSource: LeadSource;
    leadDate: Date;
    conversionDate: Date;
    salesRepId: string;
    salesRepName: string;
    accountManagerId: string;
    accountManagerName: string;
    salesTerritory: string;
    salesRegion: string;
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
    paymentTerms: string;
    discountPercentage: number;
    outstandingBalance: number;
    overdueAmount: number;
    creditRating: string;
    paymentHistoryScore: number;
    lifetimeValue: number;
    totalPurchases: number;
    purchaseCount: number;
    averageOrderValue: number;
    lastPurchaseDate: Date;
    purchaseFrequencyDays: number;
    churnProbability: number;
    preferredProducts: string[];
    monthlyFuelConsumption: number;
    preferredFuelType: string;
    deliveryPreference: string;
    preferredPaymentMethod: string;
    loyaltyProgramMember: boolean;
    loyaltyCardNumber: string;
    loyaltyPoints: number;
    loyaltyTier: string;
    pointsEarnedYtd: number;
    pointsRedeemedYtd: number;
    emailOptIn: boolean;
    smsOptIn: boolean;
    whatsappOptIn: boolean;
    marketingConsent: boolean;
    lastMarketingCampaign: string;
    campaignResponseRate: number;
    supportTicketsCount: number;
    openTicketsCount: number;
    satisfactionScore: number;
    npsScore: number;
    lastInteractionDate: Date;
    lastInteractionType: string;
    complaintsCount: number;
    relationshipStrength: string;
    engagementLevel: string;
    referralCount: number;
    referredByCustomerId: string;
    contractCustomer: boolean;
    contractEndDate: Date;
    renewalProbability: number;
    facebookProfile: string;
    twitterHandle: string;
    linkedinProfile: string;
    instagramHandle: string;
    rfmScore: string;
    clvPrediction: number;
    propensityToBuy: number;
    crossSellOpportunities: string[];
    upsellOpportunities: string[];
    competitorCustomer: boolean;
    competitorsUsed: string[];
    switchProbability: number;
    winBackAttempts: number;
    birthday: Date;
    anniversaryDate: Date;
    firstPurchaseDate: Date;
    lastContactDate: Date;
    nextFollowUpDate: Date;
    dataCompletenessScore: number;
    dataAccuracyVerified: boolean;
    lastDataUpdate: Date;
    gdprConsent: boolean;
    gdprConsentDate: Date;
    notes: string;
    internalNotes: string;
    tags: string[];
    customFields: any;
    isActive: boolean;
    isKeyAccount: boolean;
    doNotContact: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=customer.entity.d.ts.map