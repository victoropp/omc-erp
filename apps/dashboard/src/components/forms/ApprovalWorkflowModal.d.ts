import React from 'react';
import { DailyDelivery } from '@/types';
interface ApprovalWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    delivery: DailyDelivery | null;
    onApproval: (deliveryId: string, approved: boolean, comments?: string) => void;
}
export declare const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps>;
export {};
//# sourceMappingURL=ApprovalWorkflowModal.d.ts.map