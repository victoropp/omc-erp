import { BaseEntity } from './BaseEntity';
import { VehicleType, VehicleStatus, FuelType } from '@omc-erp/shared-types';
import { Driver } from './Driver';
export declare class Vehicle extends BaseEntity {
    tenantId: string;
    licensePlate: string;
    vehicleType: VehicleType;
    make: string;
    model: string;
    year: number;
    vin: string;
    totalCapacity: number;
    compartmentCount: number;
    compartmentConfig: Array<{
        compartmentNumber: number;
        capacity: number;
        fuelType?: FuelType;
    }>;
    registrationExpiry: Date;
    insuranceExpiry: Date;
    roadWorthyExpiry: Date;
    gpsDeviceId: string;
    status: VehicleStatus;
    currentLocation: {
        latitude: number;
        longitude: number;
    };
    currentDriverId: string;
    currentDriver: Driver;
}
//# sourceMappingURL=Vehicle.d.ts.map