import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { TankReading } from '../entities/tank-reading.entity';
import { Tank } from '../entities/tank.entity';
import { Alert } from '../entities/alert.entity';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { EdgeComputingService } from './edge-computing.service';
import { CalibrationService } from './calibration.service';
export interface TankTelemetry {
    tankId: string;
    timestamp: Date;
    fuelLevel: number;
    temperature: number;
    pressure: number;
    waterLevel: number;
    density: number;
    ullage: number;
    productHeight: number;
    interfaceHeight: number;
    sensorStatus: 'normal' | 'warning' | 'critical';
    batteryLevel?: number;
    signalStrength?: number;
}
export interface TankAlert {
    tankId: string;
    alertType: 'critical_low' | 'leak_detected' | 'water_contamination' | 'temperature_anomaly' | 'overfill_risk' | 'sensor_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    currentValue: number;
    threshold: number;
    timestamp: Date;
    autoResolved: boolean;
}
export declare class TankMonitoringService {
    private tankReadingRepository;
    private tankRepository;
    private alertRepository;
    private eventEmitter;
    private anomalyDetection;
    private predictiveAnalytics;
    private edgeComputing;
    private calibrationService;
    private readonly logger;
    private activeTanks;
    private realtimeData;
    private alertThresholds;
    constructor(tankReadingRepository: Repository<TankReading>, tankRepository: Repository<Tank>, alertRepository: Repository<Alert>, eventEmitter: EventEmitter2, anomalyDetection: AnomalyDetectionService, predictiveAnalytics: PredictiveAnalyticsService, edgeComputing: EdgeComputingService, calibrationService: CalibrationService);
    /**
     * Initialize tank monitoring system
     */
    private initializeTankMonitoring;
    /**
     * Process incoming telemetry data from IoT sensors
     */
    processTelemetry(telemetry: TankTelemetry): Promise<void>;
    /**
     * Advanced leak detection using multiple algorithms
     */
    detectLeaks(tankId: string): Promise<{
        leakDetected: boolean;
        confidence: number;
        leakRate?: number;
        location?: string;
        evidence: string[];
    }>;
    /**
     * Water contamination detection
     */
    detectWaterContamination(tankId: string): Promise<{
        contaminated: boolean;
        waterLevel: number;
        trend: 'increasing' | 'stable' | 'decreasing';
        estimatedVolume: number;
        action: string;
    }>;
    /**
     * Temperature anomaly detection with environmental correlation
     */
    analyzeTemperatureAnomalies(tankId: string): Promise<{
        hasAnomaly: boolean;
        currentTemp: number;
        expectedTemp: number;
        deviation: number;
        possibleCauses: string[];
        riskLevel: 'low' | 'medium' | 'high';
    }>;
    /**
     * Predictive maintenance for tank equipment
     */
    predictMaintenance(tankId: string): Promise<{
        nextMaintenance: Date;
        urgentIssues: string[];
        predictedFailures: Array<{
            component: string;
            failureProbability: number;
            daysUntilFailure: number;
            recommendedAction: string;
        }>;
        maintenanceCost: number;
    }>;
    /**
     * Real-time inventory reconciliation
     */
    performReconciliation(tankId: string): Promise<{
        bookStock: number;
        physicalStock: number;
        variance: number;
        variancePercentage: number;
        reconciliationStatus: 'matched' | 'acceptable' | 'investigation_required';
        possibleReasons: string[];
    }>;
    /**
     * Generate delivery forecast based on consumption patterns
     */
    forecastDeliveryRequirement(tankId: string): Promise<{
        currentStock: number;
        dailyConsumption: number;
        daysUntilReorder: number;
        reorderDate: Date;
        recommendedOrderQuantity: number;
        confidenceLevel: number;
    }>;
    /**
     * Environmental compliance monitoring
     */
    monitorEnvironmentalCompliance(tankId: string): Promise<{
        compliant: boolean;
        violations: string[];
        emissionsLevel: number;
        vaporRecoveryEfficiency: number;
        recommendations: string[];
    }>;
    /**
     * Real-time alert generation
     */
    private checkAlertConditions;
    private processAlert;
    private storeTelemetry;
    private getHistoricalData;
    private statisticalLeakDetection;
    private massBalanceAnalysis;
    private pressurePointAnalysis;
    private calculateLeakRate;
    private estimateLeakLocation;
    private createLeakAlert;
    private getWaterLevelHistory;
    private analyzeWaterTrend;
    private calculateWaterVolume;
    private getAmbientTemperature;
    private getTemperatureHistory;
    private calculateExpectedTemperature;
    private analyzeSensorHealth;
    private analyzeStructuralIntegrity;
    private calculateTankAge;
    private getUsagePattern;
    private getBookStock;
    private createReconciliationAlert;
    private getConsumptionHistory;
    private getUpcomingEvents;
    private getWeatherForecast;
    private getEnvironmentalData;
    private generateEnvironmentalRecommendations;
    private sendCriticalNotification;
    /**
     * Scheduled tasks for regular monitoring
     */
    performScheduledChecks(): Promise<void>;
    updatePredictiveModels(): Promise<void>;
    generateDailyReports(): Promise<void>;
}
//# sourceMappingURL=tank-monitoring.service.d.ts.map