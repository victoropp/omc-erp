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
exports.Station = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Tenant_1 = require("./Tenant");
const User_1 = require("./User");
const Tank_1 = require("./Tank");
const Pump_1 = require("./Pump");
const Transaction_1 = require("./Transaction");
let Station = class Station extends BaseEntity_1.BaseEntity {
    tenantId;
    name;
    code;
    stationType;
    address;
    managerId;
    phoneNumber;
    email;
    operatingHours;
    fuelTypes;
    status;
    commissionRate;
    lastInspectionDate;
    licenseExpiryDate;
    // Relations
    tenant;
    manager;
    tanks;
    pumps;
    transactions;
    // Methods
    isOperational() {
        return this.status === shared_types_1.StationStatus.ACTIVE;
    }
    hasLowInventory() {
        if (!this.tanks)
            return false;
        return this.tanks.some(tank => {
            const percentageFull = (tank.currentLevel / tank.capacity) * 100;
            return percentageFull < 25;
        });
    }
    getTotalCapacity() {
        if (!this.tanks)
            return 0;
        return this.tanks.reduce((total, tank) => total + tank.capacity, 0);
    }
    getTotalInventory() {
        if (!this.tanks)
            return 0;
        return this.tanks.reduce((total, tank) => total + tank.currentLevel, 0);
    }
};
exports.Station = Station;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Station.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Station.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Station.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.StationType,
        default: shared_types_1.StationType.RETAIL,
    }),
    __metadata("design:type", String)
], Station.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Station.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Station.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Station.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Station.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Station.prototype, "operatingHours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.FuelType,
        array: true,
        default: [shared_types_1.FuelType.PMS, shared_types_1.FuelType.AGO],
    }),
    __metadata("design:type", Array)
], Station.prototype, "fuelTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.StationStatus,
        default: shared_types_1.StationStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Station.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Station.prototype, "commissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Station.prototype, "lastInspectionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Station.prototype, "licenseExpiryDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tenant_1.Tenant, (tenant) => tenant.stations),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", Tenant_1.Tenant)
], Station.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'managerId' }),
    __metadata("design:type", User_1.User)
], Station.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Tank_1.Tank, (tank) => tank.station),
    __metadata("design:type", Array)
], Station.prototype, "tanks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pump_1.Pump, (pump) => pump.station),
    __metadata("design:type", Array)
], Station.prototype, "pumps", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.station),
    __metadata("design:type", Array)
], Station.prototype, "transactions", void 0);
exports.Station = Station = __decorate([
    (0, typeorm_1.Entity)('stations'),
    (0, typeorm_1.Index)(['code', 'tenantId'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['managerId'])
], Station);
//# sourceMappingURL=Station.js.map