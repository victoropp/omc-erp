import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UPPFClaim } from './entities/uppf-claim.entity';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
import { EqualisationPoint } from './entities/equalisation-point.entity';
import { GPSTrace } from './entities/gps-trace.entity';
import { CreateUPPFClaimDto } from './dto/create-uppf-claim.dto';
export declare class ClaimsService {
    private readonly uppfClaimRepository;
    private readonly deliveryRepository;
    private readonly equalisationRepository;
    private readonly gpsTraceRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(uppfClaimRepository: Repository<UPPFClaim>, deliveryRepository: Repository<DeliveryConsignment>, equalisationRepository: Repository<EqualisationPoint>, gpsTraceRepository: Repository<GPSTrace>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Create UPPF claim from delivery with automatic calculation
     * Implements the blueprint formula: claim_amount = km_excess * litres_delivered * tariff_per_litre_km
     */
    createClaim(createClaimDto: CreateUPPFClaimDto, tenantId: string, userId?: string): Promise<UPPFClaim>;
    /**
     * Three-way reconciliation: depot load vs station received vs transporter trip
     * Blueprint requirement: "Three-way reconcile: depot load vs. station received vs. transporter trip; flag variances."
     */
    performThreeWayReconciliation(delivery: DeliveryConsignment, claimData: CreateUPPFClaimDto): Promise<{
        hasVariances: boolean;
        variances: string[];
        reconciliation: {
            depotLoaded: number;
            stationReceived: number;
            claimedMoved: number;
            volumeVariance: number;
            distanceVariance?: number;
        };
    }>;
    /**
     * Route anomaly detection using GPS patterns
     * Blueprint AI feature: "Route validation model: flag abnormal detours vs historical baselines"
     */
    detectRouteAnomalies(gpsTrace: any[], routeId: string, tenantId: string): Promise<{
        hasAnomalies: boolean;
        anomalies: string[];
        confidence: number;
    }>;
    /**
     * Batch submit claims for a pricing window
     * Blueprint requirement: "Batch submit claim set per window with auto-generated schedules & attachments"
     */
    batchSubmitClaims(windowId: string, tenantId: string, userId?: string): Promise<{
        submittedClaims: string[];
        totalAmount: number;
        submissionReference: string;
    }>;
    /**
     * Generate variance dashboard data
     * Blueprint requirement: "Variance dashboards. Compare expected vs paid UPPF; flag short-pays and aging."
     */
    getVarianceDashboard(tenantId: string): Promise<any>;
    private generateClaimId;
    private calculateGPSDistance;
    private createGPSTrace;
    private generateNPASubmissionPackage;
    checkAgingClaims(): Promise<void>;
}
//# sourceMappingURL=claims.service.d.ts.map