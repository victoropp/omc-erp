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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const User_1 = require("./User");
const Station_1 = require("./Station");
let Tenant = class Tenant extends BaseEntity_1.BaseEntity {
    companyName;
    companyCode;
    licenseNumber;
    businessRegistration;
    taxIdentification;
    subscriptionPlan;
    subscriptionStatus;
    subscriptionExpiresAt;
    billingContact;
    technicalContact;
    settings;
    // Relations
    users;
    stations;
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Tenant.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "companyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "licenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "businessRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "taxIdentification", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.SubscriptionPlan,
        default: shared_types_1.SubscriptionPlan.STARTER,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.SubscriptionStatus,
        default: shared_types_1.SubscriptionStatus.TRIAL,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "subscriptionExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Tenant.prototype, "billingContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Tenant.prototype, "technicalContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, (user) => user.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Station_1.Station, (station) => station.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "stations", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants'),
    (0, typeorm_1.Index)(['companyCode'], { unique: true }),
    (0, typeorm_1.Index)(['licenseNumber'], { unique: true })
], Tenant);
//# sourceMappingURL=Tenant.js.map