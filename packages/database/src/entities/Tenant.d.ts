import { BaseEntity } from './BaseEntity';
import { SubscriptionPlan, SubscriptionStatus } from '@omc-erp/shared-types';
import { User } from './User';
import { Station } from './Station';
export declare class Tenant extends BaseEntity {
    companyName: string;
    companyCode: string;
    licenseNumber: string;
    businessRegistration: string;
    taxIdentification: string;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt: Date;
    billingContact: {
        name: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            region: string;
            postalCode?: string;
            country: string;
        };
    };
    technicalContact: {
        name: string;
        email: string;
        phone: string;
    };
    settings: Record<string, any>;
    users: User[];
    stations: Station[];
}
//# sourceMappingURL=Tenant.d.ts.map