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
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Transaction_1 = require("./Transaction");
const Invoice_1 = require("./Invoice");
let Customer = class Customer extends BaseEntity_1.BaseEntity {
    tenantId;
    customerType;
    firstName;
    lastName;
    companyName;
    email;
    phoneNumber;
    address;
    // Business details
    taxId;
    businessRegistration;
    creditLimit;
    paymentTerms; // Days
    // Loyalty program
    loyaltyCardNumber;
    loyaltyPoints;
    loyaltyTier;
    status;
    registrationDate;
    // Relations
    transactions;
    invoices;
    // Virtual properties
    get fullName() {
        if (this.customerType === shared_types_1.CustomerType.CORPORATE) {
            return this.companyName || '';
        }
        return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }
    get displayName() {
        return this.customerType === shared_types_1.CustomerType.CORPORATE
            ? this.companyName || 'Unknown Company'
            : this.fullName || 'Unknown Customer';
    }
    // Methods
    addLoyaltyPoints(points) {
        this.loyaltyPoints += points;
        this.updateLoyaltyTier();
    }
    redeemLoyaltyPoints(points) {
        if (this.loyaltyPoints >= points) {
            this.loyaltyPoints -= points;
            this.updateLoyaltyTier();
            return true;
        }
        return false;
    }
    updateLoyaltyTier() {
        if (this.loyaltyPoints >= 10000) {
            this.loyaltyTier = shared_types_1.LoyaltyTier.PLATINUM;
        }
        else if (this.loyaltyPoints >= 5000) {
            this.loyaltyTier = shared_types_1.LoyaltyTier.GOLD;
        }
        else if (this.loyaltyPoints >= 1000) {
            this.loyaltyTier = shared_types_1.LoyaltyTier.SILVER;
        }
        else {
            this.loyaltyTier = shared_types_1.LoyaltyTier.BRONZE;
        }
    }
    hasCredit() {
        return this.creditLimit > 0;
    }
    canPurchaseOnCredit(amount) {
        if (!this.hasCredit())
            return false;
        // Calculate current outstanding amount from unpaid invoices
        // This would need to be implemented with actual invoice query
        const outstandingAmount = 0; // Placeholder
        return (outstandingAmount + amount) <= this.creditLimit;
    }
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Customer.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.CustomerType,
    }),
    __metadata("design:type", String)
], Customer.prototype, "customerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "taxId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "businessRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "loyaltyCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "loyaltyPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.LoyaltyTier,
        default: shared_types_1.LoyaltyTier.BRONZE,
    }),
    __metadata("design:type", String)
], Customer.prototype, "loyaltyTier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.CustomerStatus,
        default: shared_types_1.CustomerStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Customer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Customer.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.customer),
    __metadata("design:type", Array)
], Customer.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Invoice_1.Invoice, (invoice) => invoice.customer),
    __metadata("design:type", Array)
], Customer.prototype, "invoices", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['phoneNumber']),
    (0, typeorm_1.Index)(['loyaltyCardNumber'], { unique: true, where: 'loyalty_card_number IS NOT NULL' })
], Customer);
//# sourceMappingURL=Customer.js.map