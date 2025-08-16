import { BaseEntity } from './BaseEntity';
import { PumpType, PumpStatus } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Tank } from './Tank';
import { Transaction } from './Transaction';
export declare class Pump extends BaseEntity {
    stationId: string;
    pumpNumber: number;
    tankId: string;
    nozzleCount: number;
    pumpType: PumpType;
    manufacturer: string;
    model: string;
    serialNumber: string;
    installationDate: Date;
    lastCalibrationDate: Date;
    calibrationCertificate: string;
    status: PumpStatus;
    totalDispensed: number;
    transactionCount: number;
    station: Station;
    tank: Tank;
    transactions: Transaction[];
    isOperational(): boolean;
    requiresCalibration(): boolean;
    requiresMaintenance(): boolean;
    recordTransaction(quantity: number): void;
}
//# sourceMappingURL=Pump.d.ts.map