import { TransactionStatus, PaymentStatus, FuelType } from '@omc-erp/shared-types';
export declare class QueryTransactionsDto {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: TransactionStatus;
    paymentStatus?: PaymentStatus;
    fuelType?: FuelType;
    stationId?: string;
    pumpId?: string;
    customerId?: string;
    attendantId?: string;
    shiftId?: string;
}
//# sourceMappingURL=query-transactions.dto.d.ts.map