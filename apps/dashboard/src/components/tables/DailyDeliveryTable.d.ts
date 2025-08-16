import React from 'react';
import { DailyDelivery } from '@/types';
interface DailyDeliveryTableProps {
    deliveries: DailyDelivery[];
    selectedDeliveries: string[];
    onSelectionChange: (selected: string[]) => void;
    onEdit: (delivery: DailyDelivery) => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onGenerateInvoice: (id: string, type: 'supplier' | 'customer') => void;
    onSubmitApproval: (id: string) => void;
    loading?: boolean;
}
export declare const DailyDeliveryTable: React.FC<DailyDeliveryTableProps>;
export {};
//# sourceMappingURL=DailyDeliveryTable.d.ts.map