import { ApprovalAction } from '../entities/delivery-approval-history.entity';
export declare class SubmitForApprovalDto {
    comments?: string;
    submittedBy: string;
}
export declare class ProcessApprovalDto {
    action: ApprovalAction;
    comments?: string;
    approvedBy: string;
    decisionDeadline?: string;
}
//# sourceMappingURL=approval-action.dto.d.ts.map