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
exports.Shift = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Station_1 = require("./Station");
const User_1 = require("./User");
const Transaction_1 = require("./Transaction");
let Shift = class Shift extends BaseEntity_1.BaseEntity {
    tenantId;
    stationId;
    attendantId;
    shiftNumber;
    startTime;
    endTime;
    openingCash;
    closingCash;
    totalSales;
    totalTransactions;
    status;
    notes;
    // Relations
    station;
    attendant;
    transactions;
    // Methods
    isOpen() {
        return this.status === 'open';
    }
    calculateTotals() {
        if (this.transactions && this.transactions.length > 0) {
            this.totalTransactions = this.transactions.length;
            this.totalSales = this.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + t.totalAmount, 0);
        }
    }
};
exports.Shift = Shift;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Shift.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Shift.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Shift.prototype, "attendantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Shift.prototype, "shiftNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Shift.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Shift.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Shift.prototype, "openingCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shift.prototype, "closingCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shift.prototype, "totalSales", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Shift.prototype, "totalTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'open' }),
    __metadata("design:type", String)
], Shift.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shift.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], Shift.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'attendantId' }),
    __metadata("design:type", User_1.User)
], Shift.prototype, "attendant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.shift),
    __metadata("design:type", Array)
], Shift.prototype, "transactions", void 0);
exports.Shift = Shift = __decorate([
    (0, typeorm_1.Entity)('shifts'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['stationId']),
    (0, typeorm_1.Index)(['attendantId']),
    (0, typeorm_1.Index)(['shiftNumber'], { unique: true })
], Shift);
//# sourceMappingURL=Shift.js.map