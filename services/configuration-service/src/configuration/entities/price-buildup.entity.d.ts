export declare enum PriceComponentType {
    EX_REFINERY_PRICE = "EX_REFINERY_PRICE",
    LANDED_COST = "LANDED_COST",
    ENERGY_DEBT_RECOVERY_LEVY = "ENERGY_DEBT_RECOVERY_LEVY",
    ROAD_FUND_LEVY = "ROAD_FUND_LEVY",
    PRICE_STABILIZATION_LEVY = "PRICE_STABILIZATION_LEVY",
    SPECIAL_PETROLEUM_TAX = "SPECIAL_PETROLEUM_TAX",
    FUEL_MARKING_LEVY = "FUEL_MARKING_LEVY",
    PRIMARY_DISTRIBUTION_MARGIN = "PRIMARY_DISTRIBUTION_MARGIN",
    BOST_MARGIN = "BOST_MARGIN",
    UPPF_MARGIN = "UPPF_MARGIN",
    FUEL_MARKING_MARGIN = "FUEL_MARKING_MARGIN",
    OMC_MARGIN = "OMC_MARGIN",
    DEALER_MARGIN = "DEALER_MARGIN",
    TRANSPORT_COST = "TRANSPORT_COST",
    STORAGE_COST = "STORAGE_COST",
    INSURANCE_COST = "INSURANCE_COST",
    ADMINISTRATIVE_COST = "ADMINISTRATIVE_COST",
    CUSTOM_LEVY = "CUSTOM_LEVY",
    CUSTOM_MARGIN = "CUSTOM_MARGIN"
}
export declare enum PriceComponentCategory {
    BASE_PRICE = "BASE_PRICE",
    TAX_LEVY = "TAX_LEVY",
    MARGIN = "MARGIN",
    COST = "COST",
    CUSTOM = "CUSTOM"
}
export declare enum PriceComponentStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    EXPIRED = "EXPIRED",
    ARCHIVED = "ARCHIVED"
}
export declare enum StationType {
    COCO = "COCO",// Company Owned Company Operated
    DOCO = "DOCO",// Dealer Owned Company Operated
    DODO = "DODO",// Dealer Owned Dealer Operated
    INDUSTRIAL = "INDUSTRIAL",
    COMMERCIAL = "COMMERCIAL",
    BULK_CONSUMER = "BULK_CONSUMER"
}
export declare enum ProductType {
    PETROL = "PETROL",
    DIESEL = "DIESEL",
    LPG = "LPG",
    KEROSENE = "KEROSENE",
    FUEL_OIL = "FUEL_OIL",
    AVIATION_FUEL = "AVIATION_FUEL",
    MARINE_GAS_OIL = "MARINE_GAS_OIL"
}
export declare class PriceBuildupVersion {
    id: string;
    versionNumber: number;
    productType: ProductType;
    effectiveDate: Date;
    expiryDate: Date;
    status: PriceComponentStatus;
    totalPrice: number;
    changeReason: string;
    approvalRequired: boolean;
    approvedBy: string;
    approvalDate: Date;
    approvalNotes: string;
    publishedBy: string;
    publishedDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    components: PriceComponent[];
    stationTypePricing: StationTypePricing[];
    calculateTotalPrice(): void;
    isEffective(date?: Date): boolean;
    canBeModified(): boolean;
    requiresApproval(): boolean;
}
export declare class PriceComponent {
    id: string;
    buildupVersionId: string;
    componentType: PriceComponentType;
    componentName: string;
    category: PriceComponentCategory;
    amount: number;
    currency: string;
    isPercentage: boolean;
    percentageBase: PriceComponentType;
    calculationFormula: string;
    stationType: StationType;
    isMandatory: boolean;
    isConfigurable: boolean;
    minAmount: number;
    maxAmount: number;
    displayOrder: number;
    description: string;
    regulatoryReference: string;
    externalSource: string;
    externalReference: string;
    lastUpdatedSource: string;
    effectiveDate: Date;
    expiryDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    buildupVersion: PriceBuildupVersion;
    calculateAmount(baseAmount?: number): number;
    isEffective(date?: Date): boolean;
    validateAmount(): boolean;
}
export declare class StationTypePricing {
    id: string;
    buildupVersionId: string;
    stationType: StationType;
    productType: ProductType;
    basePrice: number;
    totalTaxesLevies: number;
    totalMargins: number;
    totalCosts: number;
    finalPrice: number;
    currency: string;
    pricingNotes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    buildupVersion: PriceBuildupVersion;
    calculateFinalPrice(): void;
}
export declare class PriceBuildupAuditTrail {
    id: string;
    buildupVersionId: string;
    componentId: string;
    actionType: string;
    actionDescription: string;
    oldValues: any;
    newValues: any;
    actionBy: string;
    actionDate: Date;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    createdAt: Date;
    buildupVersion: PriceBuildupVersion;
    component: PriceComponent;
}
//# sourceMappingURL=price-buildup.entity.d.ts.map