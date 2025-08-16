import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UPPFClaim } from './entities/uppf-claim.entity';
import { PricingWindow } from './entities/pricing-window.entity';
import { NPASubmission } from './entities/npa-submission.entity';
export interface NPASubmissionRequest {
    windowId: string;
    claims: UPPFClaim[];
    submissionType: 'UPPF_CLAIMS' | 'PRICE_SUBMISSION' | 'COMPLIANCE_REPORT';
    submissionDeadline?: Date;
}
export interface NPASubmissionResult {
    submissionId: string;
    submissionReference: string;
    submissionDate: Date;
    totalClaims: number;
    totalAmount: number;
    documentsGenerated: NPADocument[];
    validationResults: ValidationResult[];
    submissionStatus: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
}
export interface NPADocument {
    documentType: 'SUMMARY_REPORT' | 'DETAILED_CLAIMS' | 'SUPPORTING_EVIDENCE' | 'COMPLIANCE_CERTIFICATE';
    fileName: string;
    filePath: string;
    fileSize: number;
    checksum: string;
    generatedAt: Date;
}
export interface ValidationResult {
    ruleId: string;
    ruleName: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    affectedClaims?: string[];
}
export interface NPASubmissionSchedule {
    windowId: string;
    submissionDeadline: Date;
    reminderDates: Date[];
    escalationDates: Date[];
    autoSubmitEnabled: boolean;
    batchSize: number;
}
export declare class NPASubmissionService {
    private readonly claimRepository;
    private readonly pricingWindowRepository;
    private readonly submissionRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(claimRepository: Repository<UPPFClaim>, pricingWindowRepository: Repository<PricingWindow>, submissionRepository: Repository<NPASubmission>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Submit batch of UPPF claims to NPA
     */
    submitBatch(request: NPASubmissionRequest): Promise<NPASubmissionResult>;
}
//# sourceMappingURL=npa-submission.service.d.ts.map