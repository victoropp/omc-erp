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
exports.Pump = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Station_1 = require("./Station");
const Tank_1 = require("./Tank");
const Transaction_1 = require("./Transaction");
let Pump = class Pump extends BaseEntity_1.BaseEntity {
    stationId;
    pumpNumber;
    tankId;
    nozzleCount;
    pumpType;
    manufacturer;
    model;
    serialNumber;
    installationDate;
    lastCalibrationDate;
    calibrationCertificate;
    status;
    totalDispensed; // Total lifetime liters dispensed
    transactionCount; // Total lifetime transactions
    // Relations
    station;
    tank;
    transactions;
    // Methods
    isOperational() {
        return this.status === shared_types_1.PumpStatus.ACTIVE;
    }
    requiresCalibration() {
        if (!this.lastCalibrationDate)
            return true;
        const monthsSinceCalibration = (Date.now() - this.lastCalibrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsSinceCalibration >= 6; // Calibration required every 6 months
    }
    requiresMaintenance() {
        // Maintenance required after every 50,000 liters or 5,000 transactions
        return this.totalDispensed >= 50000 || this.transactionCount >= 5000;
    }
    recordTransaction(quantity) {
        this.totalDispensed += quantity;
        this.transactionCount++;
    }
};
exports.Pump = Pump;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Pump.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Pump.prototype, "pumpNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Pump.prototype, "tankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Pump.prototype, "nozzleCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PumpType,
        default: shared_types_1.PumpType.DISPENSING,
    }),
    __metadata("design:type", String)
], Pump.prototype, "pumpType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Pump.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Pump.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Pump.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Pump.prototype, "installationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Pump.prototype, "lastCalibrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Pump.prototype, "calibrationCertificate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PumpStatus,
        default: shared_types_1.PumpStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Pump.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Pump.prototype, "totalDispensed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Pump.prototype, "transactionCount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station, (station) => station.pumps),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], Pump.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tank_1.Tank, (tank) => tank.pumps),
    (0, typeorm_1.JoinColumn)({ name: 'tankId' }),
    __metadata("design:type", Tank_1.Tank)
], Pump.prototype, "tank", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.pump),
    __metadata("design:type", Array)
], Pump.prototype, "transactions", void 0);
exports.Pump = Pump = __decorate([
    (0, typeorm_1.Entity)('pumps'),
    (0, typeorm_1.Index)(['stationId', 'pumpNumber'], { unique: true }),
    (0, typeorm_1.Index)(['stationId']),
    (0, typeorm_1.Index)(['tankId'])
], Pump);
//# sourceMappingURL=Pump.js.map