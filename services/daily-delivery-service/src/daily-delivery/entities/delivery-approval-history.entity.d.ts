import { DailyDelivery } from './daily-delivery.entity';
export declare enum ApprovalAction {
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    RETURNED = "RETURNED",
    CANCELLED = "CANCELLED",
    ESCALATED = "ESCALATED"
}
export declare class DeliveryApprovalHistory {
    id: string;
    deliveryId: string;
    approvalStep: number;
    action: ApprovalAction;
    approvedBy: string;
    approverRole: string;
    comments: string;
    decisionDeadline: Date;
    escalationFlag: boolean;
    actionDate: Date;
    delivery: DailyDelivery;
}
//# sourceMappingURL=delivery-approval-history.entity.d.ts.map