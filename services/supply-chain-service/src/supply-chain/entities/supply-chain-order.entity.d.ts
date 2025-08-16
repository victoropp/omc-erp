export declare enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    IN_TRANSIT = "IN_TRANSIT",
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD"
}
export declare enum OrderType {
    PURCHASE_ORDER = "PURCHASE_ORDER",
    TRANSFER_ORDER = "TRANSFER_ORDER",
    IMPORT_ORDER = "IMPORT_ORDER",
    EMERGENCY_ORDER = "EMERGENCY_ORDER",
    STANDING_ORDER = "STANDING_ORDER",
    DEPOT_ORDER = "DEPOT_ORDER"
}
export declare enum OrderPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
    EMERGENCY = "EMERGENCY"
}
export declare enum ProductType {
    PETROL = "PETROL",
    DIESEL = "DIESEL",
    KEROSENE = "KEROSENE",
    LPG = "LPG",
    LUBRICANTS = "LUBRICANTS",
    AVIATION_FUEL = "AVIATION_FUEL",
    HEAVY_FUEL_OIL = "HEAVY_FUEL_OIL",
    PREMIX = "PREMIX"
}
export declare class SupplyChainOrder {
    id: string;
    tenantId: string;
    orderNumber: string;
    orderType: OrderType;
    status: OrderStatus;
    priority: OrderPriority;
    supplierId: string;
    supplierName: string;
    supplierContact: string;
    supplierPhone: string;
    supplierEmail: string;
    productType: ProductType;
    productSpecification: string;
    quantityOrdered: number;
    quantityDelivered: number;
    quantityOutstanding: number;
    unitOfMeasure: string;
    unitPrice: number;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    netAmount: number;
    currency: string;
    exchangeRate: number;
    deliveryLocationId: string;
    deliveryAddress: string;
    deliveryStationId: string;
    deliveryDepotId: string;
    requestedDeliveryDate: Date;
    confirmedDeliveryDate: Date;
    actualDeliveryDate: Date;
    transportMode: string;
    truckNumber: string;
    driverName: string;
    driverLicense: string;
    waybillNumber: string;
    loadingTicketNumber: string;
    qualityCertificateNumber: string;
    densityAt15C: number;
    temperatureAtLoading: number;
    temperatureAtDelivery: number;
    sealNumbers: string;
    npaPermitNumber: string;
    graTaxInvoiceNumber: string;
    temaOilRefineryBatch: string;
    bostAllocationNumber: string;
    uppfPriceComponent: number;
    orderDate: Date;
    approvalDate: Date;
    approvedBy: string;
    paymentTerms: string;
    paymentDueDate: Date;
    paymentStatus: string;
    insurancePolicyNumber: string;
    insuranceCoverageAmount: number;
    riskAssessmentScore: number;
    referenceNumber: string;
    purchaseRequisitionNumber: string;
    contractNumber: string;
    notes: string;
    internalNotes: string;
    cancellationReason: string;
    isActive: boolean;
    isUrgent: boolean;
    requiresQualityCheck: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=supply-chain-order.entity.d.ts.map