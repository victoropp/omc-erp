import { BaseEntity } from './BaseEntity';
import { StationType, StationStatus, FuelType } from '@omc-erp/shared-types';
import { Tenant } from './Tenant';
import { User } from './User';
import { Tank } from './Tank';
import { Pump } from './Pump';
import { Transaction } from './Transaction';
export declare class Station extends BaseEntity {
    tenantId: string;
    name: string;
    code: string;
    stationType: StationType;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
        gpsCoordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    managerId: string;
    phoneNumber: string;
    email: string;
    operatingHours: {
        [key: string]: {
            open: string;
            close: string;
        };
    };
    fuelTypes: FuelType[];
    status: StationStatus;
    commissionRate: number;
    lastInspectionDate: Date;
    licenseExpiryDate: Date;
    tenant: Tenant;
    manager: User;
    tanks: Tank[];
    pumps: Pump[];
    transactions: Transaction[];
    isOperational(): boolean;
    hasLowInventory(): boolean;
    getTotalCapacity(): number;
    getTotalInventory(): number;
}
//# sourceMappingURL=Station.d.ts.map