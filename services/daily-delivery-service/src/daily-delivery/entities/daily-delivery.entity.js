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
exports.DailyDelivery = exports.RevenueRecognitionType = exports.StationType = exports.ProductGrade = exports.DeliveryType = exports.DeliveryStatus = void 0;
const typeorm_1 = require("typeorm");
const delivery_line_item_entity_1 = require("./delivery-line-item.entity");
const delivery_approval_history_entity_1 = require("./delivery-approval-history.entity");
const delivery_documents_entity_1 = require("./delivery-documents.entity");
const tax_accrual_entity_1 = require("./tax-accrual.entity");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["DRAFT"] = "DRAFT";
    DeliveryStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    DeliveryStatus["APPROVED"] = "APPROVED";
    DeliveryStatus["IN_TRANSIT"] = "IN_TRANSIT";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["INVOICED_SUPPLIER"] = "INVOICED_SUPPLIER";
    DeliveryStatus["INVOICED_CUSTOMER"] = "INVOICED_CUSTOMER";
    DeliveryStatus["COMPLETED"] = "COMPLETED";
    DeliveryStatus["CANCELLED"] = "CANCELLED";
    DeliveryStatus["REJECTED"] = "REJECTED";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
var DeliveryType;
(function (DeliveryType) {
    DeliveryType["DEPOT_TO_STATION"] = "DEPOT_TO_STATION";
    DeliveryType["DEPOT_TO_CUSTOMER"] = "DEPOT_TO_CUSTOMER";
    DeliveryType["INTER_DEPOT"] = "INTER_DEPOT";
    DeliveryType["CUSTOMER_PICKUP"] = "CUSTOMER_PICKUP";
    DeliveryType["EMERGENCY_DELIVERY"] = "EMERGENCY_DELIVERY";
})(DeliveryType || (exports.DeliveryType = DeliveryType = {}));
var ProductGrade;
(function (ProductGrade) {
    ProductGrade["PMS"] = "PMS";
    ProductGrade["AGO"] = "AGO";
    ProductGrade["IFO"] = "IFO";
    ProductGrade["LPG"] = "LPG";
    ProductGrade["KEROSENE"] = "KEROSENE";
    ProductGrade["LUBRICANTS"] = "LUBRICANTS";
})(ProductGrade || (exports.ProductGrade = ProductGrade = {}));
var StationType;
(function (StationType) {
    StationType["COCO"] = "COCO";
    StationType["DOCO"] = "DOCO";
    StationType["DODO"] = "DODO";
    StationType["INDUSTRIAL"] = "INDUSTRIAL";
    StationType["COMMERCIAL"] = "COMMERCIAL"; // Large commercial customers
})(StationType || (exports.StationType = StationType = {}));
var RevenueRecognitionType;
(function (RevenueRecognitionType) {
    RevenueRecognitionType["IMMEDIATE"] = "IMMEDIATE";
    RevenueRecognitionType["DEFERRED"] = "DEFERRED";
    RevenueRecognitionType["PROGRESS"] = "PROGRESS";
    RevenueRecognitionType["MILESTONE"] = "MILESTONE"; // Milestone-based revenue recognition
})(RevenueRecognitionType || (exports.RevenueRecognitionType = RevenueRecognitionType = {}));
(function (StationType) {
    StationType["COCO"] = "COCO";
    StationType["DOCO"] = "DOCO";
    StationType["DODO"] = "DODO";
    StationType["INDUSTRIAL"] = "INDUSTRIAL";
    StationType["COMMERCIAL"] = "COMMERCIAL";
})(StationType || (exports.StationType = StationType = {}));
(function (RevenueRecognitionType) {
    RevenueRecognitionType["IMMEDIATE"] = "IMMEDIATE";
    RevenueRecognitionType["DEFERRED"] = "DEFERRED";
})(RevenueRecognitionType || (exports.RevenueRecognitionType = RevenueRecognitionType = {}));
let DailyDelivery = class DailyDelivery {
    id;
    tenantId;
    deliveryNumber;
    // Core Required Fields
    deliveryDate;
    supplierId;
    depotId;
    customerId;
    customerName;
    deliveryLocation;
    // Station Type and Revenue Recognition
    stationType;
    revenueRecognitionType;
    psaNumber; // Petroleum Supply Agreement Number
    waybillNumber;
    invoiceNumber;
    vehicleRegistrationNumber;
    transporterId;
    transporterName;
    // Product Information
    productType;
    productDescription;
    quantityLitres;
    unitPrice;
    totalValue;
    currency;
    // Delivery Details
    deliveryType;
    loadingTerminal;
    dischargeTerminal;
    plannedDeliveryTime;
    actualDeliveryTime;
    loadingStartTime;
    loadingEndTime;
    dischargeStartTime;
    dischargeEndTime;
    // Quality Control
    temperatureAtLoading;
    temperatureAtDischarge;
    densityAtLoading;
    densityAtDischarge;
    netStandardVolume;
    grossStandardVolume;
    volumeCorrectionFactor;
    // Tank Information
    sourceTankNumber;
    destinationTankNumber;
    compartmentNumbers; // JSON array
    sealNumbers; // JSON array
    // Driver Information
    driverId;
    driverName;
    driverLicenseNumber;
    driverPhone;
    // Financial Integration
    supplierInvoiceId;
    customerInvoiceId;
    supplierInvoiceNumber;
    customerInvoiceNumber;
    purchaseOrderId;
    purchaseOrderNumber;
    salesOrderId;
    salesOrderNumber;
    // Status and Approval
    status;
    approvalWorkflowId;
    approvedBy;
    approvalDate;
    approvalComments;
    // Ghana Compliance
    npaPermitNumber;
    customsEntryNumber;
    customsDutyPaid;
    petroleumTaxAmount;
    energyFundLevy;
    roadFundLevy;
    priceStabilizationLevy;
    primaryDistributionMargin;
    marketingMargin;
    dealerMargin;
    unifiedPetroleumPriceFundLevy;
    // Station Type Configuration
    stationType;
    // Price Build-up Snapshot
    priceBuilUpSnapshot;
    dealerMarginSnapshot;
    uppfLevySnapshot;
    revenueRecognitionType;
    // Price Build-up Snapshot
    priceBuildupSnapshot; // JSON snapshot of price components at transaction time
    pricingWindowId;
    // GPS and Tracking
    gpsTrackingEnabled;
    routeCoordinates; // JSON array of GPS coordinates
    distanceTravelledKm;
    fuelConsumptionLitres;
    routeDeviationFlag;
    unauthorizedStops; // JSON array
    // Risk and Insurance
    insurancePolicyNumber;
    insuranceCoverageAmount;
    riskAssessmentScore; // 1-10
    securityEscortRequired;
    securityEscortDetails;
    // Environmental Compliance
    environmentalPermitNumber;
    emissionCertificateNumber;
    carbonFootprintKg;
    // IFRS Compliance
    revenueRecognitionDate;
    revenueRecognitionAmount;
    contractAssetAmount;
    contractLiabilityAmount;
    performanceObligationSatisfied;
    // Document Management
    deliveryReceiptUrl;
    billOfLadingUrl;
    qualityCertificateUrl;
    customsDocumentsUrl;
    supportingDocuments; // JSON array of document URLs
    // Additional Information
    deliveryInstructions;
    specialHandlingRequirements;
    remarks;
    internalNotes;
    customerFeedback;
    deliveryRating; // 1-5 stars
    // System Fields
    isActive;
    syncStatus;
    lastSyncDate;
    externalReferenceId;
    integrationFlags; // JSON object
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    lineItems;
    approvalHistory;
    documents;
    taxAccruals;
    // Lifecycle hooks
    generateDeliveryNumber() {
        if (!this.deliveryNumber) {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            this.deliveryNumber = `DD-${date}-${random}`;
        }
    }
    calculateTotals() {
        this.totalValue = this.quantityLitres * this.unitPrice;
        // Calculate net standard volume if temperature and density are provided
        if (this.temperatureAtLoading && this.densityAtLoading) {
            this.volumeCorrectionFactor = this.calculateVCF(this.temperatureAtLoading, this.densityAtLoading);
            this.netStandardVolume = this.quantityLitres * this.volumeCorrectionFactor;
        }
        // Update snapshot values if they exist
        if (this.dealerMargin > 0) {
            this.dealerMarginSnapshot = this.dealerMargin;
        }
        if (this.unifiedPetroleumPriceFundLevy > 0) {
            this.uppfLevySnapshot = this.unifiedPetroleumPriceFundLevy;
        }
    }
    // Helper methods
    calculateVCF(temperature, density) {
        // Simplified VCF calculation - in reality, this would use API standards
        const baseTemp = 15; // Standard temperature in Celsius
        const expansionCoefficient = 0.0008; // Typical for petroleum products
        return 1 - (temperature - baseTemp) * expansionCoefficient;
    }
    // Business logic methods
    canBeApproved() {
        return this.status === DeliveryStatus.PENDING_APPROVAL &&
            this.quantityLitres > 0 &&
            this.unitPrice > 0 &&
            this.psaNumber &&
            this.waybillNumber;
    }
    canBeInvoicedToSupplier() {
        return this.status === DeliveryStatus.DELIVERED &&
            !this.supplierInvoiceId &&
            this.performanceObligationSatisfied;
    }
    canBeInvoicedToCustomer() {
        return this.status === DeliveryStatus.DELIVERED &&
            !this.customerInvoiceId &&
            this.actualDeliveryTime;
    }
    getTotalTaxes() {
        return this.petroleumTaxAmount +
            this.energyFundLevy +
            this.roadFundLevy +
            this.priceStabilizationLevy +
            this.unifiedPetroleumPriceFundLevy;
    }
    getTotalMargins() {
        return this.primaryDistributionMargin +
            this.marketingMargin +
            this.dealerMargin;
    }
    // New helper methods for enhanced functionality
    getTotalTaxAccruals() {
        if (!this.taxAccruals || this.taxAccruals.length === 0)
            return 0;
        return this.taxAccruals.reduce((total, accrual) => total + accrual.taxAmount, 0);
    }
    getPendingTaxAccruals() {
        if (!this.taxAccruals)
            return [];
        return this.taxAccruals.filter(accrual => accrual.isPaymentRequired());
    }
    getOverdueTaxAccruals() {
        if (!this.taxAccruals)
            return [];
        return this.taxAccruals.filter(accrual => accrual.isOverdue());
    }
    canGenerateJournalEntries() {
        return this.status === DeliveryStatus.DELIVERED &&
            this.stationType !== null &&
            this.stationType !== undefined;
    }
    getEffectivePricePerLitre() {
        if (this.quantityLitres === 0)
            return 0;
        const totalPrice = this.unitPrice + (this.getTotalTaxes() + this.getTotalMargins()) / this.quantityLitres;
        return totalPrice;
    }
    hasValidPriceBuildUp() {
        return this.priceBuilUpSnapshot !== null &&
            this.priceBuilUpSnapshot !== undefined &&
            Object.keys(this.priceBuilUpSnapshot).length > 0;
    }
    getRevenueRecognitionDate() {
        switch (this.revenueRecognitionType) {
            case RevenueRecognitionType.IMMEDIATE:
                return this.actualDeliveryTime || this.deliveryDate;
            case RevenueRecognitionType.DEFERRED:
                return this.revenueRecognitionDate || this.deliveryDate;
            case RevenueRecognitionType.PROGRESS:
            case RevenueRecognitionType.MILESTONE:
                return this.revenueRecognitionDate || this.actualDeliveryTime || this.deliveryDate;
            default:
                return this.deliveryDate;
        }
    }
    getDeliveryDurationHours() {
        if (this.loadingStartTime && this.dischargeEndTime) {
            return (this.dischargeEndTime.getTime() - this.loadingStartTime.getTime()) / (1000 * 60 * 60);
        }
        return 0;
    }
    isDelayed() {
        if (this.plannedDeliveryTime && this.actualDeliveryTime) {
            return this.actualDeliveryTime > this.plannedDeliveryTime;
        }
        return false;
    }
    getDelayHours() {
        if (this.isDelayed()) {
            return (this.actualDeliveryTime.getTime() - this.plannedDeliveryTime.getTime()) / (1000 * 60 * 60);
        }
        return 0;
    }
    // Station Type Business Logic
    isCocoStation() {
        return this.stationType === StationType.COCO;
    }
    isDocoStation() {
        return this.stationType === StationType.DOCO;
    }
    isDodoStation() {
        return this.stationType === StationType.DODO;
    }
    isIndustrialCustomer() {
        return this.stationType === StationType.INDUSTRIAL;
    }
    isCommercialCustomer() {
        return this.stationType === StationType.COMMERCIAL;
    }
    requiresInventoryMovement() {
        // COCO and DOCO require inventory movement (no immediate sale)
        return this.isCocoStation() || this.isDocoStation();
    }
    requiresImmediateSale() {
        // DODO, Industrial, and Commercial are immediate sales
        return this.isDodoStation() || this.isIndustrialCustomer() || this.isCommercialCustomer();
    }
    shouldDeferRevenue() {
        return this.revenueRecognitionType === RevenueRecognitionType.DEFERRED || this.requiresInventoryMovement();
    }
    // Price Build-up Methods
    getPriceBuildupComponents() {
        if (!this.priceBuildupSnapshot) {
            return null;
        }
        try {
            return JSON.parse(this.priceBuildupSnapshot);
        }
        catch (error) {
            return null;
        }
    }
    setPriceBuildupComponents(components) {
        this.priceBuildupSnapshot = JSON.stringify(components);
    }
    getCalculatedSellingPrice() {
        const components = this.getPriceBuildupComponents();
        if (!components) {
            return this.unitPrice;
        }
        // Calculate based on station type
        let sellingPrice = components.basePrice || 0;
        if (this.requiresInventoryMovement()) {
            // For COCO/DOCO, no margin is added at delivery
            return sellingPrice;
        }
        else {
            // For DODO/Industrial/Commercial, add appropriate margins
            sellingPrice += (components.dealerMargin || 0);
            sellingPrice += (components.marketingMargin || 0);
            return sellingPrice;
        }
    }
};
exports.DailyDelivery = DailyDelivery;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DailyDelivery.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_number', length: 50, unique: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "deliveryNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depot_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "depotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', length: 255 }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_location', type: 'text' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "deliveryLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_type', type: 'enum', enum: StationType, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_recognition_type', type: 'enum', enum: RevenueRecognitionType, default: RevenueRecognitionType.IMMEDIATE }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "revenueRecognitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'psa_number', length: 50, unique: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "psaNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waybill_number', length: 50, unique: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "waybillNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', length: 50, nullable: true, unique: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_registration_number', length: 20 }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "vehicleRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transporter_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "transporterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transporter_name', length: 255 }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "transporterName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_type', type: 'enum', enum: ProductGrade }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_description', length: 255 }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "productDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_litres', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "quantityLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_value', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_type', type: 'enum', enum: DeliveryType }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loading_terminal', length: 255, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "loadingTerminal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discharge_terminal', length: 255, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "dischargeTerminal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_delivery_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "plannedDeliveryTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_delivery_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "actualDeliveryTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loading_start_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "loadingStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loading_end_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "loadingEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discharge_start_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "dischargeStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discharge_end_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "dischargeEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature_at_loading', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "temperatureAtLoading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature_at_discharge', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "temperatureAtDischarge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'density_at_loading', type: 'decimal', precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "densityAtLoading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'density_at_discharge', type: 'decimal', precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "densityAtDischarge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_standard_volume', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "netStandardVolume", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gross_standard_volume', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "grossStandardVolume", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_correction_factor', type: 'decimal', precision: 8, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "volumeCorrectionFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_tank_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "sourceTankNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_tank_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "destinationTankNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compartment_numbers', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "compartmentNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seal_numbers', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "sealNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "driverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_license_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "driverLicenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "driverPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_invoice_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "supplierInvoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_invoice_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customerInvoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_invoice_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "supplierInvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_invoice_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customerInvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_order_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_order_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "purchaseOrderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_order_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "salesOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sales_order_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "salesOrderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.DRAFT }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DailyDelivery.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_workflow_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "approvalWorkflowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "approvalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_permit_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "npaPermitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customs_entry_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customsEntryNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customs_duty_paid', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "customsDutyPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "petroleumTaxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'energy_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "energyFundLevy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'road_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "roadFundLevy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_stabilization_levy', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "priceStabilizationLevy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_distribution_margin', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "primaryDistributionMargin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marketing_margin', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "marketingMargin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dealer_margin', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "dealerMargin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unified_petroleum_price_fund_levy', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "unifiedPetroleumPriceFundLevy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_type', type: 'enum', enum: StationType, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_build_up_snapshot', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DailyDelivery.prototype, "priceBuilUpSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dealer_margin_snapshot', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "dealerMarginSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uppf_levy_snapshot', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "uppfLevySnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_recognition_type', type: 'enum', enum: RevenueRecognitionType, default: RevenueRecognitionType.IMMEDIATE }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "revenueRecognitionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_buildup_snapshot', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "priceBuildupSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pricing_window_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "pricingWindowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gps_tracking_enabled', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DailyDelivery.prototype, "gpsTrackingEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'route_coordinates', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "routeCoordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'distance_travelled_km', type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "distanceTravelledKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_consumption_litres', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "fuelConsumptionLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'route_deviation_flag', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DailyDelivery.prototype, "routeDeviationFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unauthorized_stops', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "unauthorizedStops", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_policy_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_assessment_score', type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "riskAssessmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_escort_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DailyDelivery.prototype, "securityEscortRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_escort_details', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "securityEscortDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'environmental_permit_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "environmentalPermitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emission_certificate_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "emissionCertificateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carbon_footprint_kg', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "carbonFootprintKg", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_recognition_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "revenueRecognitionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_recognition_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "revenueRecognitionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_asset_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "contractAssetAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_liability_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "contractLiabilityAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_obligation_satisfied', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DailyDelivery.prototype, "performanceObligationSatisfied", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_receipt_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "deliveryReceiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bill_of_lading_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "billOfLadingUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_certificate_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "qualityCertificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customs_documents_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customsDocumentsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_instructions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_handling_requirements', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "specialHandlingRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remarks', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "customerFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_rating', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], DailyDelivery.prototype, "deliveryRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DailyDelivery.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_status', length: 20, default: 'SYNCED' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "syncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "lastSyncDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_reference_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "externalReferenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'integration_flags', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "integrationFlags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyDelivery.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DailyDelivery.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => delivery_line_item_entity_1.DeliveryLineItem, lineItem => lineItem.delivery, { cascade: true }),
    __metadata("design:type", Array)
], DailyDelivery.prototype, "lineItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => delivery_approval_history_entity_1.DeliveryApprovalHistory, approval => approval.delivery, { cascade: true }),
    __metadata("design:type", Array)
], DailyDelivery.prototype, "approvalHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => delivery_documents_entity_1.DeliveryDocuments, document => document.delivery, { cascade: true }),
    __metadata("design:type", Array)
], DailyDelivery.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tax_accrual_entity_1.TaxAccrual, taxAccrual => taxAccrual.delivery, { cascade: true }),
    __metadata("design:type", Array)
], DailyDelivery.prototype, "taxAccruals", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DailyDelivery.prototype, "generateDeliveryNumber", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DailyDelivery.prototype, "calculateTotals", null);
exports.DailyDelivery = DailyDelivery = __decorate([
    (0, typeorm_1.Entity)('daily_deliveries'),
    (0, typeorm_1.Index)(['tenantId', 'deliveryDate']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'supplierId']),
    (0, typeorm_1.Index)(['tenantId', 'customerId']),
    (0, typeorm_1.Index)(['tenantId', 'depotId']),
    (0, typeorm_1.Index)(['psaNumber'], { unique: true }),
    (0, typeorm_1.Index)(['waybillNumber'], { unique: true }),
    (0, typeorm_1.Index)(['invoiceNumber'], { unique: true, where: 'invoice_number IS NOT NULL' }),
    (0, typeorm_1.Index)(['stationType']),
    (0, typeorm_1.Index)(['revenueRecognitionType'])
], DailyDelivery);
//# sourceMappingURL=daily-delivery.entity.js.map