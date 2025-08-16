import { CreateTransactionDto } from './create-transaction.dto';
import { TransactionStatus, PaymentStatus } from '@omc-erp/shared-types';
declare const UpdateTransactionDto_base: import("@nestjs/common").Type<Partial<CreateTransactionDto>>;
export declare class UpdateTransactionDto extends UpdateTransactionDto_base {
    status?: TransactionStatus;
    paymentStatus?: PaymentStatus;
    paymentReference?: string;
    notes?: string;
}
export {};
//# sourceMappingURL=update-transaction.dto.d.ts.map