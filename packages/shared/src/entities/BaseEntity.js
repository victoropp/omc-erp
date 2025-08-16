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
exports.default = exports.InventoryItemEntity = exports.TransactionEntity = exports.AddressColumns = exports.OrganizationEntity = exports.PersonEntity = exports.FinancialEntity = exports.BusinessEntity = exports.BaseEntity = exports.Currency = exports.Priority = exports.EntityStatus = void 0;
const typeorm_1 = require("typeorm");
/**
 * Base Entity Classes
 * Eliminates duplicate entity patterns across all microservices
 */
// Common enums used across entities
var EntityStatus;
(function (EntityStatus) {
    EntityStatus["ACTIVE"] = "ACTIVE";
    EntityStatus["INACTIVE"] = "INACTIVE";
    EntityStatus["SUSPENDED"] = "SUSPENDED";
    EntityStatus["DELETED"] = "DELETED";
})(EntityStatus || (exports.EntityStatus = EntityStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["CRITICAL"] = "CRITICAL";
})(Priority || (exports.Priority = Priority = {}));
var Currency;
(function (Currency) {
    Currency["GHS"] = "GHS";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
})(Currency || (exports.Currency = Currency = {}));
// Base entity with common fields
class BaseEntity {
    id;
    tenantId;
    isActive;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    updateTimestamps() {
        // This can be overridden by child classes
    }
}
exports.BaseEntity = BaseEntity;
exports.default = BaseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BaseEntity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], BaseEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], BaseEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], BaseEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BaseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BaseEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BaseEntity.prototype, "updateTimestamps", null);
// Business entity with additional business fields
class BusinessEntity extends BaseEntity {
    status;
    notes;
    tags;
    metadata;
    version;
    incrementVersion() {
        this.version += 1;
    }
}
exports.BusinessEntity = BusinessEntity;
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: EntityStatus,
        default: EntityStatus.ACTIVE,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BusinessEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], BusinessEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadata', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], BusinessEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], BusinessEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessEntity.prototype, "incrementVersion", null);
// Financial entity with currency and amount fields
class FinancialEntity extends BusinessEntity {
    currency;
    amount;
    taxAmount;
    totalAmount;
    calculateTotals() {
        this.totalAmount = this.amount + this.taxAmount;
        super.updateTimestamps();
    }
}
exports.FinancialEntity = FinancialEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], FinancialEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'amount',
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], FinancialEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tax_amount',
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], FinancialEntity.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_amount',
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], FinancialEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialEntity.prototype, "calculateTotals", null);
// Person entity for individuals
class PersonEntity extends BusinessEntity {
    firstName;
    lastName;
    middleName;
    title;
    email;
    phone;
    mobile;
    dateOfBirth;
    gender;
    // Ghana-specific fields
    ghanaCardNumber;
    tinNumber;
    sssnitNumber;
    get fullName() {
        return [this.title, this.firstName, this.middleName, this.lastName]
            .filter(Boolean)
            .join(' ');
    }
}
exports.PersonEntity = PersonEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 100 }),
    __metadata("design:type", String)
], PersonEntity.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 100 }),
    __metadata("design:type", String)
], PersonEntity.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'middle_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', length: 50, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PersonEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', length: 20, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PersonEntity.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', length: 10, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_card_number', length: 20, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PersonEntity.prototype, "ghanaCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tin_number', length: 20, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PersonEntity.prototype, "tinNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sssnit_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], PersonEntity.prototype, "sssnitNumber", void 0);
// Organization entity for companies
class OrganizationEntity extends BusinessEntity {
    organizationName;
    tradingName;
    registrationNumber;
    tinNumber;
    vatNumber;
    email;
    phone;
    website;
    industry;
    establishmentDate;
}
exports.OrganizationEntity = OrganizationEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_name', length: 255 }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "organizationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trading_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "tradingName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_number', length: 100, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tin_number', length: 20, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "tinNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_number', length: 20, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "vatNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'website', length: 255, nullable: true }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'industry', length: 100, nullable: true }),
    __metadata("design:type", String)
], OrganizationEntity.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'establishment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], OrganizationEntity.prototype, "establishmentDate", void 0);
// Address entity columns mixin
exports.AddressColumns = {
    streetAddress: () => (0, typeorm_1.Column)({ name: 'street_address', type: 'text', nullable: true }),
    city: () => (0, typeorm_1.Column)({ name: 'city', length: 100, nullable: true }),
    region: () => (0, typeorm_1.Column)({ name: 'region', length: 100, nullable: true }),
    district: () => (0, typeorm_1.Column)({ name: 'district', length: 100, nullable: true }),
    postalCode: () => (0, typeorm_1.Column)({ name: 'postal_code', length: 20, nullable: true }),
    country: () => (0, typeorm_1.Column)({ name: 'country', length: 50, default: 'Ghana' }),
    ghanaPostGPS: () => (0, typeorm_1.Column)({ name: 'ghana_post_gps', length: 20, nullable: true }),
    latitude: () => (0, typeorm_1.Column)({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true }),
    longitude: () => (0, typeorm_1.Column)({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true }),
};
// Transaction entity for financial transactions
class TransactionEntity extends FinancialEntity {
    transactionNumber;
    transactionDate;
    referenceNumber;
    description;
    externalReference;
    generateTransactionNumber() {
        if (!this.transactionNumber) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            this.transactionNumber = `TXN-${timestamp}-${random}`;
        }
        super.calculateTotals();
    }
}
exports.TransactionEntity = TransactionEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_number', length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "transactionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', length: 100, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionEntity.prototype, "generateTransactionNumber", null);
// Inventory item entity
class InventoryItemEntity extends BusinessEntity {
    itemCode;
    itemName;
    description;
    category;
    unitOfMeasure;
    unitPrice;
    costPrice;
    reorderLevel;
    maximumLevel;
}
exports.InventoryItemEntity = InventoryItemEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryItemEntity.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_name', length: 255 }),
    __metadata("design:type", String)
], InventoryItemEntity.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryItemEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_of_measure', length: 20 }),
    __metadata("design:type", String)
], InventoryItemEntity.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'unit_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], InventoryItemEntity.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'cost_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], InventoryItemEntity.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_level', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryItemEntity.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_level', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryItemEntity.prototype, "maximumLevel", void 0);
//# sourceMappingURL=BaseEntity.js.map