import { EventEmitter2 } from '@nestjs/event-emitter';
import { UPPFSettlementsService } from '../settlements/uppf-settlements.service';
import { UPPFClaimsService } from '../claims/uppf-claims.service';
import { UPPFSettlement, SettlementStatus, CreateUPPFSettlementDto } from '../entities/uppf-entities';
import { PaginatedResult } from '../dto/pagination.dto';
interface User {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
}
interface SettlementQueryDto {
    windowId?: string;
    status?: SettlementStatus[];
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
interface SettlementSummaryDto {
    totalSettlements: number;
    totalAmount: number;
    totalClaims: number;
    averageProcessingDays: number;
    settlementsByStatus: {
        [key: string]: number;
    };
    monthlyTrends: Array<{
        month: string;
        settlements: number;
        amount: number;
        claims: number;
    }>;
    performanceMetrics: {
        efficiency: number;
        successRate: number;
        varianceRate: number;
        complianceScore: number;
    };
}
interface ProcessSettlementDto {
    windowId: string;
    claimIds: string[];
    settlementAmount: number;
    npaPenalties?: number;
    performanceBonuses?: number;
    npaSubmissionRef?: string;
    paymentReference?: string;
    notes?: string;
}
export declare class UPPFSettlementsController {
    private readonly settlementsService;
    private readonly claimsService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(settlementsService: UPPFSettlementsService, claimsService: UPPFClaimsService, eventEmitter: EventEmitter2);
    /**
     * Create a new UPPF settlement
     */
    createSettlement(createSettlementDto: CreateUPPFSettlementDto, user: User): Promise<UPPFSettlement>;
    /**
     * Get all settlements with filtering and pagination
     */
    getSettlements(queryDto: SettlementQueryDto, user: User): Promise<PaginatedResult<UPPFSettlement>>;
    /**
     * Get a specific settlement by ID
     */
    getSettlementById(id: string, user: User): Promise<UPPFSettlement>;
    /**
     * Process settlement payment
     */
    processSettlement(id: string, processDto: ProcessSettlementDto, user: User): Promise<UPPFSettlement>;
    /**
     * Get settlement summary and statistics
     */
    getSettlementStatistics(queryDto: any, user: User): Promise<SettlementSummaryDto>;
    /**
     * Generate settlement report
     */
    generateSettlementReport(id: string, format: "pdf" | "excel" | undefined, user: User): Promise<{
        reportUrl: string;
        reportId: string;
    }>;
    /**
     * Reconcile settlement with bank payment
     */
    reconcileSettlement(id: string, reconcileDto: {
        bankTransactionRef: string;
        actualAmount: number;
        reconciliationDate: Date;
        notes?: string;
    }, user: User): Promise<UPPFSettlement>;
    /**
     * Get claims eligible for settlement
     */
    getEligibleClaims(windowId: string, user: User): Promise<any[]>;
    /**
     * Export settlement data
     */
    exportSettlementsCSV(queryDto: SettlementQueryDto, user: User): Promise<any>;
    private groupClaimsByDealer;
    private groupClaimsByProduct;
}
export {};
//# sourceMappingURL=uppf-settlements.controller.d.ts.map