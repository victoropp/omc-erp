import { FuelType, PaymentMethod } from '@omc-erp/shared-types';
export declare class CreateTransactionDto {
    stationId: string;
    pumpId: string;
    attendantId?: string;
    customerId?: string;
    shiftId?: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    paymentMethod: PaymentMethod;
    paymentDetails?: {
        provider?: string;
        phoneNumber?: string;
        cardNumber?: string;
        voucherCode?: string;
    };
    posReference?: string;
    autoProcessPayment?: boolean;
}
//# sourceMappingURL=create-transaction.dto.d.ts.map