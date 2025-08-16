import React from 'react';
interface NPASubmission {
    id: string;
    submissionId: string;
    claimId: string;
    dealerName: string;
    route: string;
    transportDate: Date;
    claimAmount: number;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
    documents: Document[];
    validationResults: ValidationResult[];
    npaResponseCode?: string;
    submissionDate?: Date;
    reviewDate?: Date;
    paymentDate?: Date;
    reviewComments?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Document {
    id: string;
    name: string;
    type: 'gps_data' | 'waybill' | 'delivery_note' | 'fuel_receipt' | 'transport_permit';
    fileUrl: string;
    uploadedAt: Date;
    verified: boolean;
}
interface ValidationResult {
    id: string;
    type: 'gps_validation' | 'route_validation' | 'amount_validation' | 'document_validation';
    status: 'passed' | 'failed' | 'warning';
    message: string;
    details?: any;
}
declare const NPASubmission: () => React.JSX.Element;
export default NPASubmission;
//# sourceMappingURL=npa-submission.d.ts.map