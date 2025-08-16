import { EventEmitter2 } from '@nestjs/event-emitter';
export interface NpaTemplateData {
    templateVersion: string;
    issueDate: Date;
    effectiveDate: Date;
    windowId: string;
    components: NpaComponentData[];
    metadata: {
        documentNumber: string;
        issuingAuthority: string;
        approvalReference: string;
        fileHash: string;
        processingDate: Date;
    };
}
export interface NpaComponentData {
    componentCode: string;
    componentName: string;
    category: string;
    unit: string;
    rateValue: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    applicableProducts: string[];
    remarks?: string;
}
export interface ProcessedNpaDocument {
    documentId: string;
    documentType: string;
    title: string;
    issueDate: Date;
    effectiveDate: Date;
    isProcessed: boolean;
    processedDate?: Date;
    extractedData?: NpaTemplateData;
    validationErrors: string[];
    isValid: boolean;
}
export interface NpaSubmissionPackage {
    submissionReference: string;
    submissionType: 'PRICE_SUBMISSION' | 'UPPF_CLAIMS' | 'COMPLIANCE_REPORT';
    windowId: string;
    documents: Array<{
        documentType: string;
        fileName: string;
        content: Buffer;
        metadata: any;
    }>;
    totalAmount?: number;
    claimsCount?: number;
    generatedAt: Date;
}
export declare class NpaTemplateParserService {
    private readonly eventEmitter;
    private readonly logger;
    private readonly NPA_COMPONENT_PATTERNS;
    private readonly FUEL_PRODUCT_MAPPINGS;
    constructor(eventEmitter: EventEmitter2);
    /**
     * Parse NPA pricing guideline document
     */
    parseNpaDocument(fileBuffer: Buffer, fileName: string, documentType?: 'pricing_guideline' | 'pbu_template' | 'circular'): Promise<ProcessedNpaDocument>;
    /**
     * Import parsed NPA data into system components
     */
    importNpaComponents(npaData: NpaTemplateData, importBy: string, replaceExisting?: boolean): Promise<{
        imported: number;
        updated: number;
        skipped: number;
        errors: string[];
    }>;
    /**
     * Generate NPA submission package
     */
    generateNpaSubmissionPackage(submissionType: 'PRICE_SUBMISSION' | 'UPPF_CLAIMS' | 'COMPLIANCE_REPORT', windowId: string, data: any): Promise<NpaSubmissionPackage>;
    /**
     * Validate NPA response format
     */
    validateNpaResponse(responseFile: Buffer, expectedSubmissionRef: string): Promise<{
        isValid: boolean;
        submissionReference: string;
        responseReference: string;
        responseStatus: string;
        approvedItems: any[];
        rejectedItems: any[];
        validationErrors: string[];
    }>;
    private extractContentFromFile;
    private parseDocumentContent;
    private validateNpaData;
    private extractComponents;
    private extractDate;
    private extractWindowId;
    private extractDocumentNumber;
    private extractApprovalReference;
    private extractNumericValue;
    private extractApplicableProducts;
    private formatComponentName;
    private extractDocumentTitle;
    private generateDocumentId;
    private generateSubmissionReference;
    private extractFromExcel;
    private extractFromPdf;
    private findExistingComponent;
    private updateComponent;
    private createComponent;
    private generatePriceSubmissionDocuments;
    private generateUppfClaimsDocuments;
    private generateComplianceReportDocuments;
    private parseNpaResponseContent;
}
//# sourceMappingURL=npa-template-parser.service.d.ts.map