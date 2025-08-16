import { EventEmitter2 } from '@nestjs/event-emitter';
import { UPPFClaimsService } from '../claims/uppf-claims.service';
import { ThreeWayReconciliationService } from '../claims/three-way-reconciliation.service';
import { GPSValidationService } from '../claims/gps-validation.service';
import { NPASubmissionService } from '../claims/npa-submission.service';
import { UPPFClaim, ClaimAnomaly, ThreeWayReconciliation, CreateUPPFClaimDto, UpdateUPPFClaimDto, UPPFClaimQueryDto, CreateThreeWayReconciliationDto } from '../entities/uppf-entities';
import { PaginatedResult } from '../dto/pagination.dto';
import { BulkActionDto, BulkActionResult } from '../dto/bulk-action.dto';
import { UPPFClaimStatisticsDto } from '../dto/statistics.dto';
interface User {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
}
export declare class UPPFClaimsController {
    private readonly uppfClaimsService;
    private readonly threeWayReconciliationService;
    private readonly gpsValidationService;
    private readonly npaSubmissionService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(uppfClaimsService: UPPFClaimsService, threeWayReconciliationService: ThreeWayReconciliationService, gpsValidationService: GPSValidationService, npaSubmissionService: NPASubmissionService, eventEmitter: EventEmitter2);
    /**
     * Create a new UPPF claim
     */
    createClaim(createClaimDto: CreateUPPFClaimDto, user: User): Promise<UPPFClaim>;
    /**
     * Get all UPPF claims with filtering and pagination
     */
    getClaims(queryDto: UPPFClaimQueryDto, user: User): Promise<PaginatedResult<UPPFClaim>>;
    /**
     * Get a specific UPPF claim by ID
     */
    getClaimById(id: string, user: User): Promise<UPPFClaim>;
    /**
     * Update a UPPF claim
     */
    updateClaim(id: string, updateClaimDto: UpdateUPPFClaimDto, user: User): Promise<UPPFClaim>;
    /**
     * Delete a UPPF claim (soft delete)
     */
    deleteClaim(id: string, user: User): Promise<{
        message: string;
    }>;
    /**
     * Submit claims to NPA
     */
    submitClaim(id: string, user: User): Promise<{
        submissionRef: string;
        message: string;
    }>;
    /**
     * Bulk submit claims to NPA
     */
    bulkSubmitClaims(bulkActionDto: BulkActionDto, user: User): Promise<BulkActionResult>;
    /**
     * Perform bulk actions on claims
     */
    bulkAction(bulkActionDto: BulkActionDto, user: User): Promise<BulkActionResult>;
    /**
     * Get claim statistics
     */
    getClaimsStatistics(queryDto: any, user: User): Promise<UPPFClaimStatisticsDto>;
    /**
     * Validate GPS for a claim
     */
    validateGPS(id: string, user: User): Promise<any>;
    /**
     * Perform three-way reconciliation
     */
    performReconciliation(id: string, reconciliationDto: CreateThreeWayReconciliationDto, user: User): Promise<ThreeWayReconciliation>;
    /**
     * Get claim anomalies
     */
    getClaimAnomalies(id: string, user: User): Promise<ClaimAnomaly[]>;
    /**
     * Export claims data
     */
    exportClaimsCSV(queryDto: UPPFClaimQueryDto, user: User): Promise<any>;
    private validateStatusTransition;
}
export {};
//# sourceMappingURL=uppf-claims.controller.d.ts.map