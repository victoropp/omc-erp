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
exports.SupplyChainOrder = exports.ProductType = exports.OrderPriority = exports.OrderType = exports.OrderStatus = void 0;
const typeorm_1 = require("typeorm");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "DRAFT";
    OrderStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    OrderStatus["APPROVED"] = "APPROVED";
    OrderStatus["IN_TRANSIT"] = "IN_TRANSIT";
    OrderStatus["PARTIALLY_DELIVERED"] = "PARTIALLY_DELIVERED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["ON_HOLD"] = "ON_HOLD";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["PURCHASE_ORDER"] = "PURCHASE_ORDER";
    OrderType["TRANSFER_ORDER"] = "TRANSFER_ORDER";
    OrderType["IMPORT_ORDER"] = "IMPORT_ORDER";
    OrderType["EMERGENCY_ORDER"] = "EMERGENCY_ORDER";
    OrderType["STANDING_ORDER"] = "STANDING_ORDER";
    OrderType["DEPOT_ORDER"] = "DEPOT_ORDER";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderPriority;
(function (OrderPriority) {
    OrderPriority["LOW"] = "LOW";
    OrderPriority["NORMAL"] = "NORMAL";
    OrderPriority["HIGH"] = "HIGH";
    OrderPriority["CRITICAL"] = "CRITICAL";
    OrderPriority["EMERGENCY"] = "EMERGENCY";
})(OrderPriority || (exports.OrderPriority = OrderPriority = {}));
var ProductType;
(function (ProductType) {
    ProductType["PETROL"] = "PETROL";
    ProductType["DIESEL"] = "DIESEL";
    ProductType["KEROSENE"] = "KEROSENE";
    ProductType["LPG"] = "LPG";
    ProductType["LUBRICANTS"] = "LUBRICANTS";
    ProductType["AVIATION_FUEL"] = "AVIATION_FUEL";
    ProductType["HEAVY_FUEL_OIL"] = "HEAVY_FUEL_OIL";
    ProductType["PREMIX"] = "PREMIX";
})(ProductType || (exports.ProductType = ProductType = {}));
let SupplyChainOrder = class SupplyChainOrder {
    id;
    tenantId;
    orderNumber;
    orderType;
    status;
    priority;
    // Supplier Information
    supplierId;
    supplierName;
    supplierContact;
    supplierPhone;
    supplierEmail;
    // Product Information
    productType;
    productSpecification;
    quantityOrdered;
    quantityDelivered;
    quantityOutstanding;
    unitOfMeasure;
    // Financial Information
    unitPrice;
    totalAmount;
    taxAmount;
    discountAmount;
    netAmount;
    currency;
    exchangeRate;
    // Delivery Information
    deliveryLocationId;
    deliveryAddress;
    deliveryStationId;
    deliveryDepotId;
    requestedDeliveryDate;
    confirmedDeliveryDate;
    actualDeliveryDate;
    // Transportation Information
    transportMode; // TRUCK, PIPELINE, RAIL, BARGE
    truckNumber;
    driverName;
    driverLicense;
    waybillNumber;
    loadingTicketNumber;
    // Quality Control
    qualityCertificateNumber;
    densityAt15C;
    temperatureAtLoading;
    temperatureAtDelivery;
    sealNumbers;
    // Ghana Specific Fields
    npaPermitNumber;
    graTaxInvoiceNumber;
    temaOilRefineryBatch;
    bostAllocationNumber;
    uppfPriceComponent;
    // Tracking Information
    orderDate;
    approvalDate;
    approvedBy;
    paymentTerms;
    paymentDueDate;
    paymentStatus;
    // Risk Management
    insurancePolicyNumber;
    insuranceCoverageAmount;
    riskAssessmentScore;
    // Additional Fields
    referenceNumber;
    purchaseRequisitionNumber;
    contractNumber;
    notes;
    internalNotes;
    cancellationReason;
    isActive;
    isUrgent;
    requiresQualityCheck;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
    calculateFields() {
        // Calculate outstanding quantity
        this.quantityOutstanding = this.quantityOrdered - this.quantityDelivered;
        // Calculate net amount
        this.netAmount = this.totalAmount + this.taxAmount - this.discountAmount;
        // Generate order number if not exists
        if (!this.orderNumber && this.orderType) {
            const prefix = this.orderType === OrderType.PURCHASE_ORDER ? 'PO' :
                this.orderType === OrderType.TRANSFER_ORDER ? 'TO' :
                    this.orderType === OrderType.IMPORT_ORDER ? 'IO' : 'SO';
            this.orderNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
    }
};
exports.SupplyChainOrder = SupplyChainOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_number', length: 50, unique: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_type', type: 'enum', enum: OrderType }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "orderType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', type: 'enum', enum: OrderPriority, default: OrderPriority.NORMAL }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', length: 50 }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', length: 255 }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_contact', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "supplierContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "supplierPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_email', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "supplierEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_type', type: 'enum', enum: ProductType }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_specification', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "productSpecification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_ordered', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "quantityOrdered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_delivered', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "quantityDelivered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_outstanding', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "quantityOutstanding", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', length: 20, default: 'LITRES' }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_location_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "deliveryLocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_station_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "deliveryStationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_depot_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "deliveryDepotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_delivery_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "requestedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confirmed_delivery_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "confirmedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_delivery_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transport_mode', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "transportMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'truck_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "truckNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "driverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_license', length: 50, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "driverLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waybill_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "waybillNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loading_ticket_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "loadingTicketNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_certificate_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "qualityCertificateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'density_at_15c', type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "densityAt15C", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature_at_loading', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "temperatureAtLoading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature_at_delivery', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "temperatureAtDelivery", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seal_numbers', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "sealNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_permit_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "npaPermitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gra_tax_invoice_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "graTaxInvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tema_oil_refinery_batch', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "temaOilRefineryBatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bost_allocation_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "bostAllocationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uppf_price_component', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "uppfPriceComponent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "paymentDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', length: 50, default: 'PENDING' }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_policy_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_assessment_score', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SupplyChainOrder.prototype, "riskAssessmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_requisition_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "purchaseRequisitionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "contractNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SupplyChainOrder.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_urgent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SupplyChainOrder.prototype, "isUrgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_quality_check', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SupplyChainOrder.prototype, "requiresQualityCheck", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SupplyChainOrder.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], SupplyChainOrder.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SupplyChainOrder.prototype, "calculateFields", null);
exports.SupplyChainOrder = SupplyChainOrder = __decorate([
    (0, typeorm_1.Entity)('supply_chain_orders'),
    (0, typeorm_1.Index)(['tenantId', 'orderNumber'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'orderDate']),
    (0, typeorm_1.Index)(['tenantId', 'supplierId'])
], SupplyChainOrder);
//# sourceMappingURL=supply-chain-order.entity.js.map