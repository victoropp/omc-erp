import { PaymentMethod } from '@omc-erp/shared-types';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface PaymentRequest {
    transactionId: string;
    amount: number;
    method: PaymentMethod;
    details?: {
        provider?: string;
        phoneNumber?: string;
        cardNumber?: string;
        voucherCode?: string;
    };
}
export interface PaymentResult {
    success: boolean;
    reference?: string;
    error?: string;
    externalReference?: string;
}
export interface RefundRequest {
    transactionId: string;
    amount: number;
    reason: string;
}
export declare class PaymentService {
    private readonly eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    processPayment(request: PaymentRequest): Promise<PaymentResult>;
    refundPayment(request: RefundRequest): Promise<PaymentResult>;
    private processCashPayment;
    private processCardPayment;
    private processMobileMoneyPayment;
    private processCreditPayment;
    private processVoucherPayment;
    private validateVoucher;
    private generateReference;
    private delay;
}
//# sourceMappingURL=payment.service.d.ts.map