import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UPPFSettlement, UPPFClaim, CreateUPPFSettlementDto } from '../entities/uppf-entities';
import { PaginatedResult } from '../dto/pagination.dto';
interface NPASubmissionData {
    settlementId: string;
    submissionReference: string;
    submissionDate: Date;
    totalAmount: number;
    claimCount: number;
    supportingDocuments: Array<{
        type: string;
        documentId: string;
        uploadedAt: Date;
    }>;
    complianceVerification: {
        verified: boolean;
        verificationDate: Date;
        verifiedBy: string;
        notes?: string;
    };
}
export declare class UPPFSettlementsService {
    private readonly settlementRepository;
    private readonly claimRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    constructor(settlementRepository: Repository<UPPFSettlement>, claimRepository: Repository<UPPFClaim>, dataSource: DataSource, eventEmitter: EventEmitter2, httpService: HttpService, configService: ConfigService);
    /**
     * Create a new UPPF settlement with automatic calculation
     */
    createSettlement(dto: CreateUPPFSettlementDto & {
        processedBy: string;
    }): Promise<UPPFSettlement>;
    /**
     * Process settlement payment
     */
    processSettlement(settlementId: string, processData: {
        paymentReference: string;
        bankTransactionRef: string;
        notes?: string;
        processedBy: string;
    }): Promise<UPPFSettlement>;
    /**
     * Reconcile settlement with actual bank payment
     */
    reconcileSettlement(settlementId: string, reconcileData: {
        bankTransactionRef: string;
        actualAmount: number;
        reconciliationDate: Date;
        notes?: string;
        reconciledBy: string;
    }): Promise<UPPFSettlement>;
    /**
     * Calculate settlement amounts with deductions and bonuses
     */
    private calculateSettlementAmounts;
    /**
     * Calculate penalties for a claim
     */
    private calculatePenalties;
    /**
     * Calculate performance bonuses for a claim
     */
    private calculatePerformanceBonuses;
    /**
     * Generate settlement report
     */
    generateSettlementReport(settlementId: string, format: "pdf" | "excel" | undefined, generatedBy: string): Promise<{
        reportUrl: string;
        reportId: string;
    }>;
    /**
     * Submit settlement to NPA
     */
    submitToNPA(settlementId: string, submittedBy: string): Promise<NPASubmissionData>;
    /**
     * Get settlement statistics
     */
    getSettlementStatistics(filters?: any): Promise<any>;
    /**
     * Export settlements to CSV
     */
    exportToCSV(filters?: any): Promise<string>;
    private generateSettlementReference;
    private getSubmissionDelay;
    private getSubmissionAdvance;
    private analyzeVarianceCauses;
    private getVarianceRecommendations;
    private prepareSettlementReportData;
    private prepareNPASubmissionData;
    private calculateMonthlyTrends;
    findById(id: string): Promise<UPPFSettlement | null>;
    findByIdWithClaims(id: string): Promise<UPPFSettlement | null>;
    findByWindowId(windowId: string): Promise<UPPFSettlement | null>;
    findWithPagination(queryDto: any): Promise<PaginatedResult<UPPFSettlement>>;
}
export {};
//# sourceMappingURL=uppf-settlements.service.d.ts.map