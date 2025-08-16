import { BaseEntity } from './BaseEntity';
import { CustomerType, CustomerStatus, LoyaltyTier } from '@omc-erp/shared-types';
import { Transaction } from './Transaction';
import { Invoice } from './Invoice';
export declare class Customer extends BaseEntity {
    tenantId: string;
    customerType: CustomerType;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phoneNumber: string;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
    };
    taxId: string;
    businessRegistration: string;
    creditLimit: number;
    paymentTerms: number;
    loyaltyCardNumber: string;
    loyaltyPoints: number;
    loyaltyTier: LoyaltyTier;
    status: CustomerStatus;
    registrationDate: Date;
    transactions: Transaction[];
    invoices: Invoice[];
    get fullName(): string;
    get displayName(): string;
    addLoyaltyPoints(points: number): void;
    redeemLoyaltyPoints(points: number): boolean;
    updateLoyaltyTier(): void;
    hasCredit(): boolean;
    canPurchaseOnCredit(amount: number): boolean;
}
//# sourceMappingURL=Customer.d.ts.map