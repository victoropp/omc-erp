import { DailyDelivery } from './daily-delivery.entity';
export declare enum TaxType {
    PETROLEUM_TAX = "PETROLEUM_TAX",
    ENERGY_FUND_LEVY = "ENERGY_FUND_LEVY",
    ROAD_FUND_LEVY = "ROAD_FUND_LEVY",
    PRICE_STABILIZATION_LEVY = "PRICE_STABILIZATION_LEVY",
    UPPF_LEVY = "UPPF_LEVY",
    VAT = "VAT",
    WITHHOLDING_TAX = "WITHHOLDING_TAX",
    CUSTOMS_DUTY = "CUSTOMS_DUTY"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare class TaxAccrual {
    id: string;
    deliveryId: string;
    taxType: TaxType;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    taxAccountCode: string;
    liabilityAccountCode: string;
    taxAuthority: string;
    dueDate: Date;
    paymentStatus: PaymentStatus;
    paymentDate: Date;
    paymentReference: string;
    currencyCode: string;
    exchangeRate: number;
    baseTaxAmount: number;
    description: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    delivery: DailyDelivery;
    isOverdue(): boolean;
    getDaysOverdue(): number;
    markAsPaid(paymentDate: Date, paymentReference: string, updatedBy: string): void;
    getEffectiveTaxRate(): number;
    getTaxDescription(): string;
    getDaysUntilDue(): number;
    isPaymentRequired(): boolean;
}
//# sourceMappingURL=tax-accrual.entity.d.ts.map