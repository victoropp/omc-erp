import { RegulatoryDocType } from '@omc-erp/shared-types';
export declare class RegulatoryDocument {
    id: string;
    tenantId: string;
    type: RegulatoryDocType;
    title: string;
    description?: string;
    documentNumber: string;
    version: string;
    fileUrl: string;
    fileHash: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    effectiveDate: Date;
    expiryDate?: Date;
    publicationDate: Date;
    sourceUrl?: string;
    isActive: boolean;
    metadata?: {
        windowId?: string;
        components?: string[];
        guidelineType?: string;
        applicableProducts?: string[];
        circularType?: string;
        affectedParties?: string[];
        actNumber?: string;
        sections?: string[];
    };
    parsedContent?: {
        components?: Array<{
            code: string;
            name: string;
            category: string;
            rate: number;
            unit: string;
        }>;
        requirements?: string[];
        actionItems?: string[];
    };
    notes?: string;
    uploadedBy: string;
    verifiedBy?: string;
    verifiedAt?: Date;
    supersededBy?: string;
    supersedes?: string;
    createdAt: Date;
    updatedAt: Date;
    isEffectiveOn(date: Date): boolean;
    isCurrentVersion(): boolean;
    getFileExtension(): string;
    getHumanReadableSize(): string;
}
//# sourceMappingURL=regulatory-document.entity.d.ts.map