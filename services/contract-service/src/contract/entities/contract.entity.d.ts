export declare enum ContractType {
    SUPPLY_AGREEMENT = "SUPPLY_AGREEMENT",
    SERVICE_AGREEMENT = "SERVICE_AGREEMENT",
    PURCHASE_AGREEMENT = "PURCHASE_AGREEMENT",
    DISTRIBUTION_AGREEMENT = "DISTRIBUTION_AGREEMENT",
    TRANSPORTATION_AGREEMENT = "TRANSPORTATION_AGREEMENT",
    STORAGE_AGREEMENT = "STORAGE_AGREEMENT",
    FRANCHISE_AGREEMENT = "FRANCHISE_AGREEMENT",
    LEASE_AGREEMENT = "LEASE_AGREEMENT",
    EMPLOYMENT_CONTRACT = "EMPLOYMENT_CONTRACT",
    CONSULTANCY_AGREEMENT = "CONSULTANCY_AGREEMENT",
    NDA = "NDA",
    SLA = "SLA"
}
export declare enum ContractStatus {
    DRAFT = "DRAFT",
    UNDER_REVIEW = "UNDER_REVIEW",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    TERMINATED = "TERMINATED",
    EXPIRED = "EXPIRED",
    RENEWED = "RENEWED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentTerms {
    NET_15 = "NET_15",
    NET_30 = "NET_30",
    NET_45 = "NET_45",
    NET_60 = "NET_60",
    NET_90 = "NET_90",
    IMMEDIATE = "IMMEDIATE",
    ON_DELIVERY = "ON_DELIVERY",
    MILESTONE_BASED = "MILESTONE_BASED",
    QUARTERLY = "QUARTERLY",
    MONTHLY = "MONTHLY"
}
export declare enum RenewalType {
    MANUAL = "MANUAL",
    AUTOMATIC = "AUTOMATIC",
    MUTUAL_AGREEMENT = "MUTUAL_AGREEMENT",
    PERFORMANCE_BASED = "PERFORMANCE_BASED"
}
export declare class Contract {
    id: string;
    tenantId: string;
    contractNumber: string;
    contractTitle: string;
    contractType: ContractType;
    status: ContractStatus;
    partyAId: string;
    partyAName: string;
    partyARepresentative: string;
    partyADesignation: string;
    partyBId: string;
    partyBName: string;
    partyBRepresentative: string;
    partyBDesignation: string;
    partyBType: string;
    effectiveDate: Date;
    expiryDate: Date;
    durationMonths: number;
    noticePeriodDays: number;
    contractValue: number;
    currency: string;
    paymentTerms: PaymentTerms;
    billingFrequency: string;
    minimumOrderValue: number;
    maximumOrderValue: number;
    discountPercentage: number;
    penaltyRate: number;
    securityDeposit: number;
    productsServices: string[];
    deliveryTerms: string;
    qualitySpecifications: string;
    volumeCommitment: number;
    unitPrice: number;
    priceAdjustmentClause: string;
    requiresNpaApproval: boolean;
    npaApprovalNumber: string;
    npaApprovalDate: Date;
    localContentRequirement: number;
    taxExemptionApplicable: boolean;
    withholdingTaxRate: number;
    vatApplicable: boolean;
    stampDutyPaid: boolean;
    stampDutyAmount: number;
    slaDefined: boolean;
    uptimeRequirement: number;
    responseTimeHours: number;
    resolutionTimeHours: number;
    performanceBondRequired: boolean;
    performanceBondAmount: number;
    kpiMetrics: any;
    insuranceRequired: boolean;
    insuranceCoverageAmount: number;
    liabilityCap: number;
    indemnificationClause: string;
    forceMajeureClause: string;
    terminationClause: string;
    earlyTerminationAllowed: boolean;
    earlyTerminationPenalty: number;
    terminationNoticeRequired: boolean;
    terminationDate: Date;
    terminationReason: string;
    renewable: boolean;
    renewalType: RenewalType;
    renewalNoticeDays: number;
    maxRenewals: number;
    renewalCount: number;
    lastRenewalDate: Date;
    nextRenewalDate: Date;
    governingLaw: string;
    disputeResolution: string;
    arbitrationVenue: string;
    confidentialityClause: boolean;
    nonCompeteClause: boolean;
    nonSolicitationClause: boolean;
    legalReviewCompleted: boolean;
    legalReviewDate: Date;
    legalReviewer: string;
    approvedBy: string;
    approvalDate: Date;
    signedDate: Date;
    partyASignatureDate: Date;
    partyBSignatureDate: Date;
    witness1Name: string;
    witness2Name: string;
    amendmentCount: number;
    lastAmendmentDate: Date;
    amendmentHistory: any[];
    complianceScore: number;
    performanceScore: number;
    disputesCount: number;
    breachesCount: number;
    claimsRaised: number;
    claimsSettled: number;
    expiryAlertSent: boolean;
    expiryAlertDate: Date;
    renewalAlertSent: boolean;
    renewalAlertDate: Date;
    originalDocumentUrl: string;
    signedDocumentUrl: string;
    supportingDocuments: string[];
    documentVersion: number;
    notes: string;
    internalNotes: string;
    tags: string[];
    isActive: boolean;
    isTemplate: boolean;
    parentContractId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=contract.entity.d.ts.map