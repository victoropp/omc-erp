import { BaseEntity } from './BaseEntity';
import { Station } from './Station';
import { User } from './User';
import { Transaction } from './Transaction';
export declare class Shift extends BaseEntity {
    tenantId: string;
    stationId: string;
    attendantId: string;
    shiftNumber: string;
    startTime: Date;
    endTime: Date;
    openingCash: number;
    closingCash: number;
    totalSales: number;
    totalTransactions: number;
    status: string;
    notes: string;
    station: Station;
    attendant: User;
    transactions: Transaction[];
    isOpen(): boolean;
    calculateTotals(): void;
}
//# sourceMappingURL=Shift.d.ts.map