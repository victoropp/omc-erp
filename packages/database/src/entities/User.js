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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Tenant_1 = require("./Tenant");
// import * as bcrypt from 'bcrypt';
let User = class User extends BaseEntity_1.BaseEntity {
    tenantId;
    username;
    email;
    passwordHash;
    firstName;
    lastName;
    phoneNumber;
    role;
    status;
    lastLoginAt;
    emailVerifiedAt;
    failedLoginAttempts;
    lockedUntil;
    createdBy;
    updatedBy;
    // Relations
    tenant;
    // Virtual properties
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    // Methods
    async setPassword(password) {
        // TODO: Implement bcrypt hashing
        this.passwordHash = password;
    }
    async validatePassword(password) {
        // TODO: Implement bcrypt comparison
        return this.passwordHash === password;
    }
    isLocked() {
        return !!(this.lockedUntil && this.lockedUntil > new Date());
    }
    incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            // Lock account for 30 minutes after 5 failed attempts
            this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
    }
    resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }
    // Hooks
    async hashPassword() {
        // Password is already hashed, do nothing
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], User.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, select: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.UserRole,
        default: shared_types_1.UserRole.OPERATOR,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.UserStatus,
        default: shared_types_1.UserStatus.PENDING_VERIFICATION,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "emailVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lockedUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tenant_1.Tenant, (tenant) => tenant.users),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", Tenant_1.Tenant)
], User.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)(['email', 'tenantId'], { unique: true }),
    (0, typeorm_1.Index)(['username', 'tenantId'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId'])
], User);
//# sourceMappingURL=User.js.map