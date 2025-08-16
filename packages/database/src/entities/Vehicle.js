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
exports.Vehicle = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Driver_1 = require("./Driver");
let Vehicle = class Vehicle extends BaseEntity_1.BaseEntity {
    tenantId;
    licensePlate;
    vehicleType;
    make;
    model;
    year;
    vin;
    totalCapacity; // Liters
    compartmentCount;
    compartmentConfig;
    registrationExpiry;
    insuranceExpiry;
    roadWorthyExpiry;
    gpsDeviceId;
    status;
    currentLocation;
    currentDriverId;
    // Relations
    currentDriver;
};
exports.Vehicle = Vehicle;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Vehicle.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "licensePlate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.VehicleType,
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "make", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Vehicle.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "vin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Vehicle.prototype, "totalCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Vehicle.prototype, "compartmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Vehicle.prototype, "compartmentConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vehicle.prototype, "registrationExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vehicle.prototype, "insuranceExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vehicle.prototype, "roadWorthyExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "gpsDeviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.VehicleStatus,
        default: shared_types_1.VehicleStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "currentLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "currentDriverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Driver_1.Driver, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'currentDriverId' }),
    __metadata("design:type", Driver_1.Driver)
], Vehicle.prototype, "currentDriver", void 0);
exports.Vehicle = Vehicle = __decorate([
    (0, typeorm_1.Entity)('vehicles'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['licensePlate'], { unique: true })
], Vehicle);
//# sourceMappingURL=Vehicle.js.map