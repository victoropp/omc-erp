import { BaseEntity } from './BaseEntity';
export declare class Supplier extends BaseEntity {
    tenantId: string;
    name: string;
    code: string;
    contactPerson: string;
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
    paymentTerms: number;
    creditLimit: number;
    status: string;
}
//# sourceMappingURL=Supplier.d.ts.map