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
exports.Tank = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Station_1 = require("./Station");
const Pump_1 = require("./Pump");
const Transaction_1 = require("./Transaction");
let Tank = class Tank extends BaseEntity_1.BaseEntity {
    stationId;
    tankNumber;
    fuelType;
    capacity; // Liters
    currentLevel;
    minimumLevel;
    maximumLevel;
    tankType;
    material;
    installationDate;
    lastCalibrationDate;
    calibrationCertificate;
    status;
    sensorId;
    // Relations
    station;
    pumps;
    transactions;
    // Computed properties
    get percentageFull() {
        return (this.currentLevel / this.capacity) * 100;
    }
    get availableCapacity() {
        return this.capacity - this.currentLevel;
    }
    // Methods
    isLowLevel() {
        return this.currentLevel <= this.minimumLevel;
    }
    isCriticalLevel() {
        return this.percentageFull < 10;
    }
    canDispense(quantity) {
        return this.currentLevel >= quantity && this.status === shared_types_1.TankStatus.ACTIVE;
    }
    updateLevel(quantity, operation) {
        if (operation === 'add') {
            this.currentLevel = Math.min(this.currentLevel + quantity, this.maximumLevel);
        }
        else {
            this.currentLevel = Math.max(this.currentLevel - quantity, 0);
        }
    }
    requiresCalibration() {
        if (!this.lastCalibrationDate)
            return true;
        const monthsSinceCalibration = (Date.now() - this.lastCalibrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsSinceCalibration >= 12; // Calibration required annually
    }
};
exports.Tank = Tank;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Tank.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Tank.prototype, "tankNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.FuelType,
    }),
    __metadata("design:type", String)
], Tank.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], Tank.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Tank.prototype, "currentLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], Tank.prototype, "minimumLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], Tank.prototype, "maximumLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.TankType,
        default: shared_types_1.TankType.UNDERGROUND,
    }),
    __metadata("design:type", String)
], Tank.prototype, "tankType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Tank.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Tank.prototype, "installationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Tank.prototype, "lastCalibrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Tank.prototype, "calibrationCertificate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.TankStatus,
        default: shared_types_1.TankStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Tank.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Tank.prototype, "sensorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station, (station) => station.tanks),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], Tank.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Pump_1.Pump, (pump) => pump.tank),
    __metadata("design:type", Array)
], Tank.prototype, "pumps", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.tank),
    __metadata("design:type", Array)
], Tank.prototype, "transactions", void 0);
exports.Tank = Tank = __decorate([
    (0, typeorm_1.Entity)('tanks'),
    (0, typeorm_1.Index)(['stationId', 'tankNumber'], { unique: true }),
    (0, typeorm_1.Index)(['stationId']),
    (0, typeorm_1.Index)(['fuelType'])
], Tank);
//# sourceMappingURL=Tank.js.map