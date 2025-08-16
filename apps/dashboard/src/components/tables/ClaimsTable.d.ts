import React from 'react';
interface UPPFClaim {
    id: string;
    claimNumber: string;
    dealer: string;
    route: string;
    fuelType: string;
    quantity: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    submissionDate: string;
    approvalDate?: string;
    notes?: string;
}
interface ClaimsTableProps {
    showActions?: boolean;
    onClaimSelect?: (claim: UPPFClaim) => void;
    filters?: Record<string, any>;
}
export declare function ClaimsTable({ showActions, onClaimSelect, filters }: ClaimsTableProps): React.JSX.Element;
export {};
//# sourceMappingURL=ClaimsTable.d.ts.map