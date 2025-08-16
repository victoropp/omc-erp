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
exports.Driver = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
let Driver = class Driver extends BaseEntity_1.BaseEntity {
    tenantId;
    driverLicense;
    firstName;
    lastName;
    phoneNumber;
    email;
    address;
    licenseClass;
    licenseExpiry;
    hazmatCertified;
    hazmatExpiry;
    employeeId;
    hireDate;
    status;
    // Virtual properties
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    // Methods
    isLicenseValid() {
        return this.licenseExpiry > new Date();
    }
    isHazmatValid() {
        return this.hazmatCertified && this.hazmatExpiry && this.hazmatExpiry > new Date();
    }
};
exports.Driver = Driver;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Driver.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Driver.prototype, "driverLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Driver.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Driver.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Driver.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], Driver.prototype, "licenseClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Driver.prototype, "licenseExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Driver.prototype, "hazmatCertified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Driver.prototype, "hazmatExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Driver.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.DriverStatus,
        default: shared_types_1.DriverStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Driver.prototype, "status", void 0);
exports.Driver = Driver = __decorate([
    (0, typeorm_1.Entity)('drivers'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['driverLicense'], { unique: true })
], Driver);
//# sourceMappingURL=Driver.js.map