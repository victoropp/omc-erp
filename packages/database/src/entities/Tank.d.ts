import { BaseEntity } from './BaseEntity';
import { FuelType, TankType, TankStatus } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Pump } from './Pump';
import { Transaction } from './Transaction';
export declare class Tank extends BaseEntity {
    stationId: string;
    tankNumber: number;
    fuelType: FuelType;
    capacity: number;
    currentLevel: number;
    minimumLevel: number;
    maximumLevel: number;
    tankType: TankType;
    material: string;
    installationDate: Date;
    lastCalibrationDate: Date;
    calibrationCertificate: string;
    status: TankStatus;
    sensorId: string;
    station: Station;
    pumps: Pump[];
    transactions: Transaction[];
    get percentageFull(): number;
    get availableCapacity(): number;
    isLowLevel(): boolean;
    isCriticalLevel(): boolean;
    canDispense(quantity: number): boolean;
    updateLevel(quantity: number, operation: 'add' | 'subtract'): void;
    requiresCalibration(): boolean;
}
//# sourceMappingURL=Tank.d.ts.map