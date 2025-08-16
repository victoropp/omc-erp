import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegulatoryDocument } from './entities/regulatory-document.entity';
import { RegulatoryDocType } from '@omc-erp/shared-types';
export interface DocumentUploadDto {
    type: RegulatoryDocType;
    title: string;
    description?: string;
    documentNumber: string;
    version: string;
    effectiveDate: string;
    expiryDate?: string;
    publicationDate: string;
    sourceUrl?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export interface DocumentParseResult {
    success: boolean;
    parsedContent?: any;
    components?: Array<{
        code: string;
        name: string;
        category: string;
        rate: number;
        unit: string;
    }>;
    errors?: string[];
    warnings?: string[];
}
export declare class RegulatoryDocumentsService {
    private readonly documentRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly uploadPath;
    constructor(documentRepository: Repository<RegulatoryDocument>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Upload and process regulatory document
     * Blueprint requirement: "Load NPA artifacts (Guidelines PDF, current PBU template) into regulatory_docs; parse into pbu_components"
     */
    uploadDocument(file: Express.Multer.File, uploadDto: DocumentUploadDto, tenantId: string, userId: string): Promise<RegulatoryDocument>;
    /**
     * Parse regulatory document content
     * Blueprint requirement: Parse PBU templates into components
     */
    parseDocument(fileBuffer: Buffer, docType: RegulatoryDocType): Promise<DocumentParseResult>;
    /**
     * Parse PBU template and extract component rates
     * Blueprint requirement: Dynamic component loading from NPA templates
     */
    private parsePBUTemplate;
    /**
     * Parse pricing guidelines for requirements and changes
     */
    private parsePricingGuideline;
    /**
     * Parse circular for action items and requirements
     */
    private parseCircular;
    /**
     * Create PBU components from parsed template
     * Blueprint requirement: "populate from NPA PBU template"
     */
    private createPBUComponentsFromTemplate;
    /**
     * Mark previous versions as superseded
     */
    private supersedePreviousVersions;
    /**
     * Verify document integrity using hash
     * Blueprint requirement: "Reg source control. Keep a registry of every NPA circular, Guidelines PDF, PBU template used to set rates; attach doc IDs to each computed price"
     */
    verifyDocumentIntegrity(documentId: string, tenantId: string): Promise<{
        isValid: boolean;
        currentHash: string;
        storedHash: string;
        verifiedAt: Date;
    }>;
    /**
     * Get effective documents for a specific date
     */
    getEffectiveDocuments(date: Date, tenantId: string, type?: RegulatoryDocType): Promise<RegulatoryDocument[]>;
    /**
     * Get document audit trail
     */
    getDocumentAuditTrail(documentId: string, tenantId: string): Promise<any>;
    private calculateFileHash;
}
//# sourceMappingURL=regulatory-documents.service.d.ts.map