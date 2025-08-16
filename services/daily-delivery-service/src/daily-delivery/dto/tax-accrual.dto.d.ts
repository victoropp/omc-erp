import { TaxType, PaymentStatus } from '../entities/tax-accrual.entity';
export declare class CreateTaxAccrualDto {
    deliveryId: string;
    taxType: TaxType;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    taxAccountCode: string;
    liabilityAccountCode: string;
    taxAuthority?: string;
    dueDate?: Date;
    currencyCode?: string;
    exchangeRate?: number;
    baseTaxAmount: number;
    description?: string;
    createdBy: string;
}
export declare class UpdateTaxAccrualDto {
    taxRate?: number;
    taxableAmount?: number;
    taxAmount?: number;
    taxAccountCode?: string;
    liabilityAccountCode?: string;
    taxAuthority?: string;
    dueDate?: Date;
    paymentStatus?: PaymentStatus;
    paymentDate?: Date;
    paymentReference?: string;
    currencyCode?: string;
    exchangeRate?: number;
    baseTaxAmount?: number;
    description?: string;
    updatedBy: string;
}
export declare class MarkTaxAccrualPaidDto {
    paymentDate: Date;
    paymentReference: string;
    updatedBy: string;
}
export declare class QueryTaxAccrualDto {
    deliveryId?: string;
    taxType?: TaxType;
    paymentStatus?: PaymentStatus;
    taxAuthority?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    overdue?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class TaxAccrualResponseDto {
    id: string;
    deliveryId: string;
    taxType: TaxType;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    taxAccountCode: string;
    liabilityAccountCode: string;
    taxAuthority?: string;
    dueDate?: Date;
    paymentStatus: PaymentStatus;
    paymentDate?: Date;
    paymentReference?: string;
    currencyCode: string;
    exchangeRate: number;
    baseTaxAmount: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
    isOverdue?: boolean;
    daysOverdue?: number;
    daysUntilDue?: number;
    effectiveTaxRate?: number;
}
export declare class TaxAccrualSummaryDto {
    totalAccruals: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    overdueAmount: number;
    pendingCount: number;
    paidCount: number;
    overdueCount: number;
    byTaxType: Array<{
        taxType: TaxType;
        count: number;
        totalAmount: number;
        pendingAmount: number;
        paidAmount: number;
    }>;
    byAuthority: Array<{
        authority: string;
        count: number;
        totalAmount: number;
        pendingAmount: number;
    }>;
}
//# sourceMappingURL=tax-accrual.dto.d.ts.map