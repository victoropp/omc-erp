export declare enum InventoryLocation {
    DEPOT = "DEPOT",
    STATION = "STATION",
    TERMINAL = "TERMINAL",
    REFINERY = "REFINERY",
    WAREHOUSE = "WAREHOUSE",
    IN_TRANSIT = "IN_TRANSIT"
}
export declare enum InventoryStatus {
    AVAILABLE = "AVAILABLE",
    RESERVED = "RESERVED",
    IN_TRANSIT = "IN_TRANSIT",
    QUARANTINE = "QUARANTINE",
    DAMAGED = "DAMAGED",
    EXPIRED = "EXPIRED",
    ALLOCATED = "ALLOCATED"
}
export declare enum StockMovementType {
    RECEIPT = "RECEIPT",
    ISSUE = "ISSUE",
    TRANSFER = "TRANSFER",
    ADJUSTMENT = "ADJUSTMENT",
    RETURN = "RETURN",
    WRITE_OFF = "WRITE_OFF",
    PHYSICAL_COUNT = "PHYSICAL_COUNT"
}
export declare class Inventory {
    id: string;
    tenantId: string;
    inventoryCode: string;
    locationType: InventoryLocation;
    locationId: string;
    locationName: string;
    tankId: string;
    tankNumber: string;
    zoneId: string;
    region: string;
    productType: string;
    productCode: string;
    productName: string;
    productGrade: string;
    productSpecification: string;
    openingBalance: number;
    quantityOnHand: number;
    quantityAvailable: number;
    quantityReserved: number;
    quantityInTransit: number;
    quantityAllocated: number;
    quantityQuarantine: number;
    minimumStockLevel: number;
    maximumStockLevel: number;
    reorderPoint: number;
    reorderQuantity: number;
    safetyStock: number;
    unitOfMeasure: string;
    tankCapacity: number;
    tankUllage: number;
    fillPercentage: number;
    unitCost: number;
    totalValue: number;
    valuationMethod: string;
    lastPurchasePrice: number;
    lastPurchaseDate: Date;
    batchNumber: string;
    lotNumber: string;
    manufactureDate: Date;
    expiryDate: Date;
    qualityStatus: string;
    density: number;
    temperature: number;
    apiGravity: number;
    lastMovementType: StockMovementType;
    lastMovementDate: Date;
    lastMovementQuantity: number;
    lastReceiptDate: Date;
    lastIssueDate: Date;
    lastStockTakeDate: Date;
    lastStockTakeQuantity: number;
    stockVariance: number;
    averageDailyUsage: number;
    daysOfSupply: number;
    turnoverRatio: number;
    stockAgeDays: number;
    npaStockReportSubmitted: boolean;
    npaStockReportDate: Date;
    bostAllocationBalance: number;
    strategicStockQuantity: number;
    commercialStockQuantity: number;
    status: InventoryStatus;
    isActive: boolean;
    isConsignment: boolean;
    consignmentOwner: string;
    requiresInspection: boolean;
    inspectionDueDate: Date;
    lowStockAlert: boolean;
    expiryAlert: boolean;
    qualityAlert: boolean;
    reorderAlert: boolean;
    alertEmailSentDate: Date;
    supplierId: string;
    supplierName: string;
    warehouseBinLocation: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateFields(): void;
}
//# sourceMappingURL=inventory.entity.d.ts.map