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
exports.DealerMarginAccrual = exports.AccrualStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var AccrualStatus;
(function (AccrualStatus) {
    AccrualStatus["PENDING"] = "pending";
    AccrualStatus["ACCRUED"] = "accrued";
    AccrualStatus["POSTED_TO_GL"] = "posted_to_gl";
    AccrualStatus["REVERSED"] = "reversed";
})(AccrualStatus || (exports.AccrualStatus = AccrualStatus = {}));
let DealerMarginAccrual = class DealerMarginAccrual {
    id;
    stationId;
    dealerId;
    productType;
    accrualDate;
    windowId;
    litresSold;
    marginRate;
    marginAmount;
    exPumpPrice;
    cumulativeLitres;
    cumulativeMargin;
    status;
    journalEntryId;
    glAccountCode;
    costCenter;
    reversalReason;
    originalAccrualId;
    calculationDetails;
    tenantId;
    processedBy;
    createdAt;
    // Computed properties
    get isPosted() {
        return this.status === AccrualStatus.POSTED_TO_GL;
    }
    get isReversed() {
        return this.status === AccrualStatus.REVERSED;
    }
};
exports.DealerMarginAccrual = DealerMarginAccrual;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "dealerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product type (PMS, AGO, LPG)' }),
    (0, typeorm_1.Column)('varchar', { length: 10 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Accrual date' }),
    (0, typeorm_1.Column)('date'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DealerMarginAccrual.prototype, "accrualDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pricing window ID' }),
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "windowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Litres sold on this date' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "litresSold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer margin rate per litre' }),
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "marginRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total margin amount accrued' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "marginAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ex-pump price used for calculation' }),
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "exPumpPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cumulative litres sold in window' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "cumulativeLitres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cumulative margin in window' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DealerMarginAccrual.prototype, "cumulativeMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Accrual status', enum: AccrualStatus }),
    (0, typeorm_1.Column)('varchar', { length: 20, default: AccrualStatus.PENDING }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GL journal entry ID when posted' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "journalEntryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GL account code for dealer margin' }),
    (0, typeorm_1.Column)('varchar', { length: 20, nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "glAccountCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost center code' }),
    (0, typeorm_1.Column)('varchar', { length: 20, nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "costCenter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reversal reason if reversed' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "reversalReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original accrual ID if this is a reversal' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "originalAccrualId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional calculation details' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], DealerMarginAccrual.prototype, "calculationDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processed by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerMarginAccrual.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DealerMarginAccrual.prototype, "createdAt", void 0);
exports.DealerMarginAccrual = DealerMarginAccrual = __decorate([
    (0, typeorm_1.Entity)('dealer_margin_accruals'),
    (0, typeorm_1.Index)(['stationId', 'accrualDate']),
    (0, typeorm_1.Index)(['productType', 'accrualDate']),
    (0, typeorm_1.Index)(['status', 'accrualDate'])
], DealerMarginAccrual);
//# sourceMappingURL=dealer-margin-accrual.entity.js.map