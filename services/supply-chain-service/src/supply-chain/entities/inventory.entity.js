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
exports.Inventory = exports.StockMovementType = exports.InventoryStatus = exports.InventoryLocation = void 0;
const typeorm_1 = require("typeorm");
var InventoryLocation;
(function (InventoryLocation) {
    InventoryLocation["DEPOT"] = "DEPOT";
    InventoryLocation["STATION"] = "STATION";
    InventoryLocation["TERMINAL"] = "TERMINAL";
    InventoryLocation["REFINERY"] = "REFINERY";
    InventoryLocation["WAREHOUSE"] = "WAREHOUSE";
    InventoryLocation["IN_TRANSIT"] = "IN_TRANSIT";
})(InventoryLocation || (exports.InventoryLocation = InventoryLocation = {}));
var InventoryStatus;
(function (InventoryStatus) {
    InventoryStatus["AVAILABLE"] = "AVAILABLE";
    InventoryStatus["RESERVED"] = "RESERVED";
    InventoryStatus["IN_TRANSIT"] = "IN_TRANSIT";
    InventoryStatus["QUARANTINE"] = "QUARANTINE";
    InventoryStatus["DAMAGED"] = "DAMAGED";
    InventoryStatus["EXPIRED"] = "EXPIRED";
    InventoryStatus["ALLOCATED"] = "ALLOCATED";
})(InventoryStatus || (exports.InventoryStatus = InventoryStatus = {}));
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["RECEIPT"] = "RECEIPT";
    StockMovementType["ISSUE"] = "ISSUE";
    StockMovementType["TRANSFER"] = "TRANSFER";
    StockMovementType["ADJUSTMENT"] = "ADJUSTMENT";
    StockMovementType["RETURN"] = "RETURN";
    StockMovementType["WRITE_OFF"] = "WRITE_OFF";
    StockMovementType["PHYSICAL_COUNT"] = "PHYSICAL_COUNT";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
let Inventory = class Inventory {
    id;
    tenantId;
    inventoryCode;
    // Location Information
    locationType;
    locationId;
    locationName;
    tankId;
    tankNumber;
    zoneId;
    region;
    // Product Information
    productType;
    productCode;
    productName;
    productGrade;
    productSpecification;
    // Quantity Information
    openingBalance;
    quantityOnHand;
    quantityAvailable;
    quantityReserved;
    quantityInTransit;
    quantityAllocated;
    quantityQuarantine;
    minimumStockLevel;
    maximumStockLevel;
    reorderPoint;
    reorderQuantity;
    safetyStock;
    unitOfMeasure;
    // Tank Capacity (for tank locations)
    tankCapacity;
    tankUllage;
    fillPercentage;
    // Valuation Information
    unitCost;
    totalValue;
    valuationMethod; // FIFO, LIFO, WEIGHTED_AVERAGE
    lastPurchasePrice;
    lastPurchaseDate;
    // Quality Information
    batchNumber;
    lotNumber;
    manufactureDate;
    expiryDate;
    qualityStatus;
    density;
    temperature;
    apiGravity;
    // Movement Information
    lastMovementType;
    lastMovementDate;
    lastMovementQuantity;
    lastReceiptDate;
    lastIssueDate;
    lastStockTakeDate;
    lastStockTakeQuantity;
    stockVariance;
    // Turnover Analysis
    averageDailyUsage;
    daysOfSupply;
    turnoverRatio;
    stockAgeDays;
    // Ghana Specific Fields
    npaStockReportSubmitted;
    npaStockReportDate;
    bostAllocationBalance;
    strategicStockQuantity;
    commercialStockQuantity;
    // Status and Control
    status;
    isActive;
    isConsignment;
    consignmentOwner;
    requiresInspection;
    inspectionDueDate;
    // Alerts and Notifications
    lowStockAlert;
    expiryAlert;
    qualityAlert;
    reorderAlert;
    alertEmailSentDate;
    // Additional Information
    supplierId;
    supplierName;
    warehouseBinLocation;
    notes;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
    calculateFields() {
        // Calculate available quantity
        this.quantityAvailable = this.quantityOnHand - this.quantityReserved - this.quantityQuarantine;
        // Calculate total value
        this.totalValue = this.quantityOnHand * this.unitCost;
        // Calculate fill percentage for tanks
        if (this.tankCapacity && this.tankCapacity > 0) {
            this.fillPercentage = (this.quantityOnHand / this.tankCapacity) * 100;
            this.tankUllage = this.tankCapacity - this.quantityOnHand;
        }
        // Calculate days of supply
        if (this.averageDailyUsage && this.averageDailyUsage > 0) {
            this.daysOfSupply = Math.floor(this.quantityAvailable / this.averageDailyUsage);
        }
        // Set alerts
        this.lowStockAlert = this.quantityAvailable <= this.minimumStockLevel;
        this.reorderAlert = this.quantityAvailable <= this.reorderPoint;
        if (this.expiryDate) {
            const daysToExpiry = Math.floor((this.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            this.expiryAlert = daysToExpiry <= 30;
        }
        // Generate inventory code if not exists
        if (!this.inventoryCode) {
            this.inventoryCode = `INV-${this.locationType}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
    }
};
exports.Inventory = Inventory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Inventory.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inventory_code', length: 50, unique: true }),
    __metadata("design:type", String)
], Inventory.prototype, "inventoryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_type', type: 'enum', enum: InventoryLocation }),
    __metadata("design:type", String)
], Inventory.prototype, "locationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_id', length: 50 }),
    __metadata("design:type", String)
], Inventory.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_name', length: 255 }),
    __metadata("design:type", String)
], Inventory.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tank_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "tankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tank_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "tankNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'zone_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "zoneId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'region', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_type', length: 50 }),
    __metadata("design:type", String)
], Inventory.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_code', length: 50 }),
    __metadata("design:type", String)
], Inventory.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name', length: 255 }),
    __metadata("design:type", String)
], Inventory.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_grade', length: 50, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "productGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_specification', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "productSpecification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opening_balance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_on_hand', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityOnHand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_available', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_reserved', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityReserved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_in_transit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityInTransit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityAllocated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_quarantine', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantityQuarantine", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_stock_level', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "minimumStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_stock_level', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "maximumStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_point', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "reorderQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'safety_stock', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "safetyStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', length: 20, default: 'LITRES' }),
    __metadata("design:type", String)
], Inventory.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tank_capacity', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "tankCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tank_ullage', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "tankUllage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fill_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "fillPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'decimal', precision: 15, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_value', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valuation_method', length: 50, default: 'WEIGHTED_AVERAGE' }),
    __metadata("design:type", String)
], Inventory.prototype, "valuationMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_purchase_price', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "lastPurchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_purchase_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastPurchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lot_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "lotNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manufacture_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "manufactureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_status', length: 50, default: 'PASSED' }),
    __metadata("design:type", String)
], Inventory.prototype, "qualityStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'density', type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "density", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_gravity', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "apiGravity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_movement_type', type: 'enum', enum: StockMovementType, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "lastMovementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_movement_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastMovementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_movement_quantity', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "lastMovementQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_receipt_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastReceiptDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_issue_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastIssueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_stock_take_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "lastStockTakeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_stock_take_quantity', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "lastStockTakeQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_variance', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "stockVariance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'average_daily_usage', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "averageDailyUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'days_of_supply', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "daysOfSupply", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'turnover_ratio', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "turnoverRatio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_age_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "stockAgeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_stock_report_submitted', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "npaStockReportSubmitted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_stock_report_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "npaStockReportDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bost_allocation_balance', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "bostAllocationBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strategic_stock_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "strategicStockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commercial_stock_quantity', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "commercialStockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: InventoryStatus, default: InventoryStatus.AVAILABLE }),
    __metadata("design:type", String)
], Inventory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_consignment', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "isConsignment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consignment_owner', length: 255, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "consignmentOwner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_inspection', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "requiresInspection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inspection_due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "inspectionDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'low_stock_alert', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "lowStockAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_alert', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "expiryAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_alert', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "qualityAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_alert', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "reorderAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alert_email_sent_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Inventory.prototype, "alertEmailSentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warehouse_bin_location', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "warehouseBinLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Inventory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Inventory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Inventory.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Inventory.prototype, "calculateFields", null);
exports.Inventory = Inventory = __decorate([
    (0, typeorm_1.Entity)('inventory'),
    (0, typeorm_1.Index)(['tenantId', 'locationId', 'productType']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'lastMovementDate'])
], Inventory);
//# sourceMappingURL=inventory.entity.js.map