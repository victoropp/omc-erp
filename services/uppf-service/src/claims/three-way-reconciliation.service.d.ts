import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
export interface ThreeWayReconciliationRequest {
    consignmentId: string;
    depotData?: DepotLoadingRecord;
    transporterData?: TransporterDeliveryRecord;
    stationData?: StationReceivingRecord;
}
export interface DepotLoadingRecord {
    consignmentId: string;
    litresLoaded: number;
    loadingTemp: number;
    productType: string;
    loadingTime: Date;
    sealNumbers: string[];
    loadingDocRef: string;
    densityAt15C: number;
    apiGravity?: number;
    compartmentDetails: Array<{
        compartment: number;
        litres: number;
        sealNumber: string;
    }>;
}
export interface TransporterDeliveryRecord {
    consignmentId: string;
    litresDelivered: number;
    deliveryTemp: number;
    deliveryTime: Date;
    waybillNumber: string;
    driverSignature: string;
    kilometersRun: number;
    fuelConsumed?: number;
    routeTaken: string;
}
export interface StationReceivingRecord {
    consignmentId: string;
    litresReceived: number;
    receivingTemp: number;
    receivingTime: Date;
    dipReadingsBefore: Array<{
        tank: string;
        level: number;
    }>;
    dipReadingsAfter: Array<{
        tank: string;
        level: number;
    }>;
    receivingDocRef: string;
    qualityTestResults?: {
        density: number;
        octaneRating?: number;
        waterContent: number;
        sedimentContent: number;
    };
    stationManagerSignature: string;
}
export interface ReconciliationResult {
    status: 'MATCHED' | 'VARIANCE_DETECTED' | 'FAILED';
    reconciledLitres: number;
    variancePercentage: number;
    variances: ReconciliationVariance[];
    documentRefs: string[];
    temperatureCorrectedVolumes: TemperatureCorrectedVolumes;
    recommendations: string[];
    confidence: number;
}
export interface ReconciliationVariance {
    type: 'VOLUME' | 'TEMPERATURE' | 'TIMING' | 'DOCUMENTATION' | 'QUALITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    quantifiedImpact: number;
    expectedValue: number;
    actualValue: number;
    tolerance: number;
    rootCause?: string;
    correctiveAction?: string;
}
export interface TemperatureCorrectedVolumes {
    depotAt15C: number;
    transporterAt15C: number;
    stationAt15C: number;
    correctionFactors: {
        depot: number;
        transporter: number;
        station: number;
    };
}
export declare class ThreeWayReconciliationService {
    private readonly deliveryRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly VOLUME_TOLERANCE_PERCENT;
    private readonly TEMPERATURE_TOLERANCE;
    private readonly TIME_TOLERANCE_HOURS;
    constructor(deliveryRepository: Repository<DeliveryConsignment>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Perform comprehensive three-way reconciliation
     * Compare depot loading vs transporter GPS vs station receiving
     */
    performReconciliation(consignmentId: string): Promise<ReconciliationResult>;
    /**
     * Real-time variance detection during delivery
     */
    detectRealTimeVariances(consignmentId: string, currentData: Partial<TransporterDeliveryRecord>): Promise<{
        hasVariances: boolean;
        variances: ReconciliationVariance[];
    }>;
    /**
     * Automated reconciliation for low-variance deliveries
     */
    performAutomatedReconciliation(consignmentId: string): Promise<{
        canAutoReconcile: boolean;
        result?: ReconciliationResult;
        reason?: string;
    }>;
    private getDepotLoadingData;
    private getTransporterDeliveryData;
    private getStationReceivingData;
    private performTemperatureCorrections;
    private calculateVCF;
    private detectAllVariances;
    private getSeverity;
    private calculateReconciledVolume;
    private calculateOverallVariance;
    private determineReconciliationStatus;
    private generateRecommendations;
    private calculateConfidenceScore;
    private storeReconciliationResults;
    private approveReconciliation;
}
//# sourceMappingURL=three-way-reconciliation.service.d.ts.map