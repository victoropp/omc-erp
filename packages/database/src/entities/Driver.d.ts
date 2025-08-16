import { BaseEntity } from './BaseEntity';
import { DriverStatus } from '@omc-erp/shared-types';
export declare class Driver extends BaseEntity {
    tenantId: string;
    driverLicense: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
    };
    licenseClass: string;
    licenseExpiry: Date;
    hazmatCertified: boolean;
    hazmatExpiry: Date;
    employeeId: string;
    hireDate: Date;
    status: DriverStatus;
    get fullName(): string;
    isLicenseValid(): boolean;
    isHazmatValid(): boolean;
}
//# sourceMappingURL=Driver.d.ts.map