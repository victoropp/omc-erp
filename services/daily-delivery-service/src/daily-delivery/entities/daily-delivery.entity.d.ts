import { DeliveryLineItem } from './delivery-line-item.entity';
import { DeliveryApprovalHistory } from './delivery-approval-history.entity';
import { DeliveryDocuments } from './delivery-documents.entity';
import { TaxAccrual } from './tax-accrual.entity';
export declare enum DeliveryStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    INVOICED_SUPPLIER = "INVOICED_SUPPLIER",
    INVOICED_CUSTOMER = "INVOICED_CUSTOMER",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REJECTED = "REJECTED"
}
export declare enum DeliveryType {
    DEPOT_TO_STATION = "DEPOT_TO_STATION",
    DEPOT_TO_CUSTOMER = "DEPOT_TO_CUSTOMER",
    INTER_DEPOT = "INTER_DEPOT",
    CUSTOMER_PICKUP = "CUSTOMER_PICKUP",
    EMERGENCY_DELIVERY = "EMERGENCY_DELIVERY"
}
export declare enum ProductGrade {
    PMS = "PMS",// Premium Motor Spirit
    AGO = "AGO",// Automotive Gas Oil
    IFO = "IFO",// Industrial Fuel Oil
    LPG = "LPG",// Liquefied Petroleum Gas
    KEROSENE = "KEROSENE",
    LUBRICANTS = "LUBRICANTS"
}
export declare enum StationType {
    COCO = "COCO",// Company Owned Company Operated
    DOCO = "DOCO",// Dealer Owned Company Operated
    DODO = "DODO",// Dealer Owned Dealer Operated
    INDUSTRIAL = "INDUSTRIAL",// Industrial/Commercial customers
    COMMERCIAL = "COMMERCIAL"
}
export declare enum RevenueRecognitionType {
    IMMEDIATE = "IMMEDIATE",// Recognize revenue immediately upon delivery
    DEFERRED = "DEFERRED",// Defer revenue recognition based on contract terms
    PROGRESS = "PROGRESS",// Progress-based revenue recognition
    MILESTONE = "MILESTONE"
}
export declare enum StationType {
    COCO = "COCO",// Company Owned Company Operated
    DOCO = "DOCO",// Dealer Owned Company Operated
    DODO = "DODO",// Dealer Owned Dealer Operated
    INDUSTRIAL = "INDUSTRIAL",
    COMMERCIAL = "COMMERCIAL"
}
export declare enum RevenueRecognitionType {
    IMMEDIATE = "IMMEDIATE",
    DEFERRED = "DEFERRED"
}
export declare class DailyDelivery {
    id: string;
    tenantId: string;
    deliveryNumber: string;
    deliveryDate: Date;
    supplierId: string;
    depotId: string;
    customerId: string;
    customerName: string;
    deliveryLocation: string;
    stationType: StationType;
    revenueRecognitionType: RevenueRecognitionType;
    psaNumber: string;
    waybillNumber: string;
    invoiceNumber: string;
    vehicleRegistrationNumber: string;
    transporterId: string;
    transporterName: string;
    productType: ProductGrade;
    productDescription: string;
    quantityLitres: number;
    unitPrice: number;
    totalValue: number;
    currency: string;
    deliveryType: DeliveryType;
    loadingTerminal: string;
    dischargeTerminal: string;
    plannedDeliveryTime: Date;
    actualDeliveryTime: Date;
    loadingStartTime: Date;
    loadingEndTime: Date;
    dischargeStartTime: Date;
    dischargeEndTime: Date;
    temperatureAtLoading: number;
    temperatureAtDischarge: number;
    densityAtLoading: number;
    densityAtDischarge: number;
    netStandardVolume: number;
    grossStandardVolume: number;
    volumeCorrectionFactor: number;
    sourceTankNumber: string;
    destinationTankNumber: string;
    compartmentNumbers: string;
    sealNumbers: string;
    driverId: string;
    driverName: string;
    driverLicenseNumber: string;
    driverPhone: string;
    supplierInvoiceId: string;
    customerInvoiceId: string;
    supplierInvoiceNumber: string;
    customerInvoiceNumber: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    salesOrderId: string;
    salesOrderNumber: string;
    status: DeliveryStatus;
    approvalWorkflowId: string;
    approvedBy: string;
    approvalDate: Date;
    approvalComments: string;
    npaPermitNumber: string;
    customsEntryNumber: string;
    customsDutyPaid: number;
    petroleumTaxAmount: number;
    energyFundLevy: number;
    roadFundLevy: number;
    priceStabilizationLevy: number;
    primaryDistributionMargin: number;
    marketingMargin: number;
    dealerMargin: number;
    unifiedPetroleumPriceFundLevy: number;
    stationType: StationType;
    priceBuilUpSnapshot: any;
    dealerMarginSnapshot: number;
    uppfLevySnapshot: number;
    revenueRecognitionType: RevenueRecognitionType;
    priceBuildupSnapshot: string;
    pricingWindowId: string;
    gpsTrackingEnabled: boolean;
    routeCoordinates: string;
    distanceTravelledKm: number;
    fuelConsumptionLitres: number;
    routeDeviationFlag: boolean;
    unauthorizedStops: string;
    insurancePolicyNumber: string;
    insuranceCoverageAmount: number;
    riskAssessmentScore: number;
    securityEscortRequired: boolean;
    securityEscortDetails: string;
    environmentalPermitNumber: string;
    emissionCertificateNumber: string;
    carbonFootprintKg: number;
    revenueRecognitionDate: Date;
    revenueRecognitionAmount: number;
    contractAssetAmount: number;
    contractLiabilityAmount: number;
    performanceObligationSatisfied: boolean;
    deliveryReceiptUrl: string;
    billOfLadingUrl: string;
    qualityCertificateUrl: string;
    customsDocumentsUrl: string;
    supportingDocuments: string;
    deliveryInstructions: string;
    specialHandlingRequirements: string;
    remarks: string;
    internalNotes: string;
    customerFeedback: string;
    deliveryRating: number;
    isActive: boolean;
    syncStatus: string;
    lastSyncDate: Date;
    externalReferenceId: string;
    integrationFlags: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    lineItems: DeliveryLineItem[];
    approvalHistory: DeliveryApprovalHistory[];
    documents: DeliveryDocuments[];
    taxAccruals: TaxAccrual[];
    generateDeliveryNumber(): void;
    calculateTotals(): void;
    private calculateVCF;
    canBeApproved(): boolean;
    canBeInvoicedToSupplier(): boolean;
    canBeInvoicedToCustomer(): boolean;
    getTotalTaxes(): number;
    getTotalMargins(): number;
    getTotalTaxAccruals(): number;
    getPendingTaxAccruals(): TaxAccrual[];
    getOverdueTaxAccruals(): TaxAccrual[];
    canGenerateJournalEntries(): boolean;
    getEffectivePricePerLitre(): number;
    hasValidPriceBuildUp(): boolean;
    getRevenueRecognitionDate(): Date;
    getDeliveryDurationHours(): number;
    isDelayed(): boolean;
    getDelayHours(): number;
    isCocoStation(): boolean;
    isDocoStation(): boolean;
    isDodoStation(): boolean;
    isIndustrialCustomer(): boolean;
    isCommercialCustomer(): boolean;
    requiresInventoryMovement(): boolean;
    requiresImmediateSale(): boolean;
    shouldDeferRevenue(): boolean;
    getPriceBuildupComponents(): any;
    setPriceBuildupComponents(components: any): void;
    getCalculatedSellingPrice(): number;
}
//# sourceMappingURL=daily-delivery.entity.d.ts.map