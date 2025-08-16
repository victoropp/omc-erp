import { DailyDelivery } from './daily-delivery.entity';
export declare enum DocumentType {
    DELIVERY_RECEIPT = "DELIVERY_RECEIPT",
    BILL_OF_LADING = "BILL_OF_LADING",
    QUALITY_CERTIFICATE = "QUALITY_CERTIFICATE",
    CUSTOMS_DOCUMENT = "CUSTOMS_DOCUMENT",
    INSURANCE_CERTIFICATE = "INSURANCE_CERTIFICATE",
    ENVIRONMENTAL_PERMIT = "ENVIRONMENTAL_PERMIT",
    SAFETY_CERTIFICATE = "SAFETY_CERTIFICATE",
    WAYBILL = "WAYBILL",
    INVOICE_COPY = "INVOICE_COPY",
    OTHER = "OTHER"
}
export declare class DeliveryDocuments {
    id: string;
    deliveryId: string;
    documentType: DocumentType;
    documentName: string;
    documentNumber: string;
    fileUrl: string;
    fileSizeBytes: number;
    mimeType: string;
    isRequired: boolean;
    isVerified: boolean;
    verifiedBy: string;
    verificationDate: Date;
    uploadedBy: string;
    uploadedAt: Date;
    delivery: DailyDelivery;
}
//# sourceMappingURL=delivery-documents.entity.d.ts.map