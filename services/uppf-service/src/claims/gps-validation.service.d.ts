import { Repository } from 'typeorm';
import { GPSTrace } from './entities/gps-trace.entity';
import { EqualisationPoint } from './entities/equalisation-point.entity';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
export interface GPSValidationRequest {
    consignmentId: string;
    vehicleId: string;
    plannedRoute: GPSPoint[];
    actualRoute: GPSPoint[];
}
export interface GPSPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
    heading?: number;
}
export interface GPSValidationResult {
    isValid: boolean;
    kmBeyondEqualisation: number;
    totalDistance: number;
    averageSpeed: number;
    maxSpeed: number;
    routeDeviations: RouteDeviation[];
    anomalies: RouteAnomaly[];
    gpsTrace: GPSTrace;
    evidenceFiles: string[];
    reasons: string[];
    confidence: number;
}
export interface RouteDeviation {
    type: 'UNAUTHORIZED_STOP' | 'ROUTE_DEVIATION' | 'SPEED_VIOLATION' | 'GEOFENCE_VIOLATION';
    location: GPSPoint;
    duration?: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
}
export interface RouteAnomaly {
    type: 'SUSPICIOUS_PATTERN' | 'GPS_SIGNAL_LOSS' | 'IMPOSSIBLE_SPEED' | 'BACKTRACKING';
    startTime: string;
    endTime: string;
    confidence: number;
    description: string;
}
export declare class GPSValidationService {
    private readonly gpsTraceRepository;
    private readonly equalisationRepository;
    private readonly deliveryRepository;
    private readonly logger;
    constructor(gpsTraceRepository: Repository<GPSTrace>, equalisationRepository: Repository<EqualisationPoint>, deliveryRepository: Repository<DeliveryConsignment>);
    /**
     * Comprehensive GPS route validation with real-time tracking
     */
    validateRoute(request: GPSValidationRequest): Promise<GPSValidationResult>;
    /**
     * Real-time GPS tracking integration
     */
    processRealTimeGPSData(vehicleId: string, gpsPoint: GPSPoint): Promise<void>;
    /**
     * Mileage calculation with temperature compensation
     */
    calculateMileage(gpsPoints: GPSPoint[]): {
        totalDistance: number;
        segmentDistances: number[];
        temperatureCompensated: number;
    };
    /**
     * Geofencing validation for depots and stations
     */
    validateGeofences(gpsPoints: GPSPoint[], routeId: string): Promise<{
        violations: Array<{
            location: GPSPoint;
            violationType: 'ENTRY' | 'EXIT' | 'UNAUTHORIZED_AREA';
            geofenceName: string;
        }>;
        validEntryExit: boolean;
    }>;
    private validateGPSDataQuality;
    private calculateRouteMetrics;
    private calculateSpeeds;
    private detectRouteDeviations;
    private detectRouteAnomalies;
    private identifyStops;
    private isAuthorizedStop;
    private checkRestrictedArea;
    private detectSignalLoss;
    private detectSpeedAnomalies;
    private detectBacktracking;
    private calculateTotalDistance;
    private createGPSTrace;
    private generateEvidenceFiles;
    private evaluateValidationResult;
    private calculateConfidenceScore;
    private generateValidationReasons;
    private checkRealTimeViolations;
}
//# sourceMappingURL=gps-validation.service.d.ts.map