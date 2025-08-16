import { DocumentType } from '../entities/delivery-documents.entity';
export declare class CreateDeliveryDocumentDto {
    deliveryId: string;
    documentType: DocumentType;
    documentName: string;
    documentNumber?: string;
    fileUrl: string;
    fileSizeBytes?: number;
    mimeType?: string;
    isRequired?: boolean;
    uploadedBy: string;
}
export declare class VerifyDocumentDto {
    verifiedBy: string;
    comments?: string;
}
//# sourceMappingURL=delivery-document.dto.d.ts.map