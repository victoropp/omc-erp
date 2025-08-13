import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
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
  fuelLevel: number; // liters
  temperature: number; // celsius
  pressure: number; // kPa
  waterLevel: number; // mm
  density: number; // kg/m³
  ullage: number; // liters
  productHeight: number; // mm
  interfaceHeight: number; // mm
  sensorStatus: 'normal' | 'warning' | 'critical';
  batteryLevel?: number; // percentage
  signalStrength?: number; // dBm
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

@Injectable()
export class TankMonitoringService {
  private readonly logger = new Logger(TankMonitoringService.name);
  private activeTanks: Map<string, Tank> = new Map();
  private realtimeData: Map<string, TankTelemetry> = new Map();
  private alertThresholds: Map<string, any> = new Map();

  constructor(
    @InjectRepository(TankReading)
    private tankReadingRepository: Repository<TankReading>,
    @InjectRepository(Tank)
    private tankRepository: Repository<Tank>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private eventEmitter: EventEmitter2,
    private anomalyDetection: AnomalyDetectionService,
    private predictiveAnalytics: PredictiveAnalyticsService,
    private edgeComputing: EdgeComputingService,
    private calibrationService: CalibrationService,
  ) {
    this.initializeTankMonitoring();
  }

  /**
   * Initialize tank monitoring system
   */
  private async initializeTankMonitoring() {
    const tanks = await this.tankRepository.find({ where: { isActive: true } });
    
    for (const tank of tanks) {
      this.activeTanks.set(tank.id, tank);
      this.alertThresholds.set(tank.id, {
        criticalLow: tank.capacity * 0.10, // 10% of capacity
        warningLow: tank.capacity * 0.20, // 20% of capacity
        highLevel: tank.capacity * 0.90, // 90% of capacity
        criticalHigh: tank.capacity * 0.95, // 95% of capacity
        waterLevel: 50, // 50mm water
        temperatureMin: 10, // 10°C
        temperatureMax: 45, // 45°C
        leakDetectionRate: 100, // 100 liters/hour
      });
    }

    this.logger.log(`Initialized monitoring for ${tanks.length} tanks`);
  }

  /**
   * Process incoming telemetry data from IoT sensors
   */
  async processTelemetry(telemetry: TankTelemetry): Promise<void> {
    // 1. Validate and calibrate sensor data
    const calibratedData = await this.calibrationService.calibrate(telemetry);
    
    // 2. Store in time-series database
    await this.storeTelemetry(calibratedData);
    
    // 3. Update real-time cache
    this.realtimeData.set(telemetry.tankId, calibratedData);
    
    // 4. Run edge computing algorithms
    const edgeAnalysis = await this.edgeComputing.analyze(calibratedData);
    
    // 5. Check for anomalies
    const anomalies = await this.anomalyDetection.detectAnomalies(
      telemetry.tankId,
      calibratedData,
    );
    
    // 6. Generate alerts if needed
    await this.checkAlertConditions(calibratedData, anomalies);
    
    // 7. Emit real-time events
    this.eventEmitter.emit('tank.telemetry', {
      tankId: telemetry.tankId,
      data: calibratedData,
      analysis: edgeAnalysis,
      anomalies,
    });
    
    // 8. Update predictive models
    await this.predictiveAnalytics.updateModels(telemetry.tankId, calibratedData);
  }

  /**
   * Advanced leak detection using multiple algorithms
   */
  async detectLeaks(tankId: string): Promise<{
    leakDetected: boolean;
    confidence: number;
    leakRate?: number;
    location?: string;
    evidence: string[];
  }> {
    const historicalData = await this.getHistoricalData(tankId, 24); // Last 24 hours
    
    // 1. Statistical Leak Detection (SLD)
    const sldResult = this.statisticalLeakDetection(historicalData);
    
    // 2. Mass Balance Analysis
    const massBalanceResult = await this.massBalanceAnalysis(tankId, historicalData);
    
    // 3. Pressure Point Analysis (PPA)
    const ppaResult = this.pressurePointAnalysis(historicalData);
    
    // 4. Machine Learning Model
    const mlResult = await this.anomalyDetection.detectLeakML(historicalData);
    
    // 5. Combine results using weighted voting
    const combinedConfidence = (
      sldResult.confidence * 0.25 +
      massBalanceResult.confidence * 0.30 +
      ppaResult.confidence * 0.20 +
      mlResult.confidence * 0.25
    );
    
    const leakDetected = combinedConfidence > 0.7;
    
    if (leakDetected) {
      await this.createLeakAlert(tankId, combinedConfidence, [
        sldResult,
        massBalanceResult,
        ppaResult,
        mlResult,
      ]);
    }
    
    return {
      leakDetected,
      confidence: combinedConfidence,
      leakRate: leakDetected ? this.calculateLeakRate(historicalData) : undefined,
      location: leakDetected ? await this.estimateLeakLocation(tankId) : undefined,
      evidence: [
        `SLD: ${sldResult.confidence.toFixed(2)}`,
        `Mass Balance: ${massBalanceResult.confidence.toFixed(2)}`,
        `PPA: ${ppaResult.confidence.toFixed(2)}`,
        `ML: ${mlResult.confidence.toFixed(2)}`,
      ],
    };
  }

  /**
   * Water contamination detection
   */
  async detectWaterContamination(tankId: string): Promise<{
    contaminated: boolean;
    waterLevel: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    estimatedVolume: number;
    action: string;
  }> {
    const tank = this.activeTanks.get(tankId);
    const currentReading = this.realtimeData.get(tankId);
    
    if (!currentReading) {
      throw new Error(`No real-time data available for tank ${tankId}`);
    }
    
    const historicalWaterLevels = await this.getWaterLevelHistory(tankId, 7); // 7 days
    const trend = this.analyzeWaterTrend(historicalWaterLevels);
    
    const contaminated = currentReading.waterLevel > this.alertThresholds.get(tankId).waterLevel;
    const estimatedVolume = this.calculateWaterVolume(
      currentReading.waterLevel,
      tank.diameter,
    );
    
    let action = 'Continue monitoring';
    if (contaminated) {
      if (trend === 'increasing') {
        action = 'URGENT: Schedule immediate water draining. Investigate source.';
      } else {
        action = 'Schedule water draining within 24 hours.';
      }
    }
    
    return {
      contaminated,
      waterLevel: currentReading.waterLevel,
      trend,
      estimatedVolume,
      action,
    };
  }

  /**
   * Temperature anomaly detection with environmental correlation
   */
  async analyzeTemperatureAnomalies(tankId: string): Promise<{
    hasAnomaly: boolean;
    currentTemp: number;
    expectedTemp: number;
    deviation: number;
    possibleCauses: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const currentReading = this.realtimeData.get(tankId);
    const ambientTemp = await this.getAmbientTemperature(tankId);
    const historicalTemps = await this.getTemperatureHistory(tankId, 30); // 30 days
    
    // Calculate expected temperature based on ambient and product characteristics
    const expectedTemp = this.calculateExpectedTemperature(
      ambientTemp,
      currentReading.density,
      currentReading.fuelLevel,
    );
    
    const deviation = Math.abs(currentReading.temperature - expectedTemp);
    const hasAnomaly = deviation > 5; // 5°C threshold
    
    const possibleCauses = [];
    if (hasAnomaly) {
      if (currentReading.temperature > expectedTemp) {
        possibleCauses.push('Possible contamination');
        possibleCauses.push('Equipment malfunction');
        possibleCauses.push('Direct sunlight exposure');
      } else {
        possibleCauses.push('Water contamination');
        possibleCauses.push('Product degradation');
        possibleCauses.push('Sensor calibration issue');
      }
    }
    
    const riskLevel = deviation > 10 ? 'high' : deviation > 5 ? 'medium' : 'low';
    
    return {
      hasAnomaly,
      currentTemp: currentReading.temperature,
      expectedTemp,
      deviation,
      possibleCauses,
      riskLevel,
    };
  }

  /**
   * Predictive maintenance for tank equipment
   */
  async predictMaintenance(tankId: string): Promise<{
    nextMaintenance: Date;
    urgentIssues: string[];
    predictedFailures: Array<{
      component: string;
      failureProbability: number;
      daysUntilFailure: number;
      recommendedAction: string;
    }>;
    maintenanceCost: number;
  }> {
    const tank = this.activeTanks.get(tankId);
    const sensorHealth = await this.analyzeSensorHealth(tankId);
    const structuralAnalysis = await this.analyzeStructuralIntegrity(tankId);
    
    const predictions = await this.predictiveAnalytics.predictFailures(tankId, {
      sensorHealth,
      structuralAnalysis,
      age: this.calculateTankAge(tank),
      usagePattern: await this.getUsagePattern(tankId),
    });
    
    return {
      nextMaintenance: predictions.nextMaintenance,
      urgentIssues: predictions.urgentIssues,
      predictedFailures: predictions.failures,
      maintenanceCost: predictions.estimatedCost,
    };
  }

  /**
   * Real-time inventory reconciliation
   */
  async performReconciliation(tankId: string): Promise<{
    bookStock: number;
    physicalStock: number;
    variance: number;
    variancePercentage: number;
    reconciliationStatus: 'matched' | 'acceptable' | 'investigation_required';
    possibleReasons: string[];
  }> {
    const currentReading = this.realtimeData.get(tankId);
    const bookStock = await this.getBookStock(tankId);
    const physicalStock = currentReading.fuelLevel;
    
    const variance = bookStock - physicalStock;
    const variancePercentage = (Math.abs(variance) / bookStock) * 100;
    
    let reconciliationStatus: 'matched' | 'acceptable' | 'investigation_required';
    if (variancePercentage < 0.5) {
      reconciliationStatus = 'matched';
    } else if (variancePercentage < 2) {
      reconciliationStatus = 'acceptable';
    } else {
      reconciliationStatus = 'investigation_required';
    }
    
    const possibleReasons = [];
    if (variance > 0) {
      possibleReasons.push('Possible leak');
      possibleReasons.push('Theft/pilferage');
      possibleReasons.push('Evaporation loss');
      possibleReasons.push('Measurement error');
    } else if (variance < 0) {
      possibleReasons.push('Unrecorded delivery');
      possibleReasons.push('Calibration error');
      possibleReasons.push('Temperature expansion');
    }
    
    if (reconciliationStatus === 'investigation_required') {
      await this.createReconciliationAlert(tankId, variance, possibleReasons);
    }
    
    return {
      bookStock,
      physicalStock,
      variance,
      variancePercentage,
      reconciliationStatus,
      possibleReasons,
    };
  }

  /**
   * Generate delivery forecast based on consumption patterns
   */
  async forecastDeliveryRequirement(tankId: string): Promise<{
    currentStock: number;
    dailyConsumption: number;
    daysUntilReorder: number;
    reorderDate: Date;
    recommendedOrderQuantity: number;
    confidenceLevel: number;
  }> {
    const currentReading = this.realtimeData.get(tankId);
    const consumptionHistory = await this.getConsumptionHistory(tankId, 90); // 90 days
    
    const forecast = await this.predictiveAnalytics.forecastConsumption(
      tankId,
      consumptionHistory,
      {
        seasonality: true,
        events: await this.getUpcomingEvents(),
        weather: await this.getWeatherForecast(),
      },
    );
    
    const tank = this.activeTanks.get(tankId);
    const reorderPoint = tank.capacity * 0.25; // Reorder at 25% capacity
    const daysUntilReorder = (currentReading.fuelLevel - reorderPoint) / forecast.dailyConsumption;
    
    return {
      currentStock: currentReading.fuelLevel,
      dailyConsumption: forecast.dailyConsumption,
      daysUntilReorder: Math.max(0, daysUntilReorder),
      reorderDate: new Date(Date.now() + daysUntilReorder * 24 * 60 * 60 * 1000),
      recommendedOrderQuantity: tank.capacity * 0.70, // Order to 70% capacity
      confidenceLevel: forecast.confidence,
    };
  }

  /**
   * Environmental compliance monitoring
   */
  async monitorEnvironmentalCompliance(tankId: string): Promise<{
    compliant: boolean;
    violations: string[];
    emissionsLevel: number;
    vaporRecoveryEfficiency: number;
    recommendations: string[];
  }> {
    const currentReading = this.realtimeData.get(tankId);
    const environmentalData = await this.getEnvironmentalData(tankId);
    
    const violations = [];
    let compliant = true;
    
    // Check vapor emissions
    if (environmentalData.vaporEmissions > 100) {
      violations.push('Vapor emissions exceed EPA limit');
      compliant = false;
    }
    
    // Check temperature compliance
    if (currentReading.temperature > 45) {
      violations.push('Temperature exceeds safe storage limit');
      compliant = false;
    }
    
    // Check pressure relief
    if (currentReading.pressure > 15) {
      violations.push('Pressure exceeds safety threshold');
      compliant = false;
    }
    
    const recommendations = this.generateEnvironmentalRecommendations(
      violations,
      environmentalData,
    );
    
    return {
      compliant,
      violations,
      emissionsLevel: environmentalData.vaporEmissions,
      vaporRecoveryEfficiency: environmentalData.vaporRecoveryEfficiency,
      recommendations,
    };
  }

  /**
   * Real-time alert generation
   */
  private async checkAlertConditions(
    telemetry: TankTelemetry,
    anomalies: any[],
  ): Promise<void> {
    const thresholds = this.alertThresholds.get(telemetry.tankId);
    const alerts: TankAlert[] = [];
    
    // Critical low level
    if (telemetry.fuelLevel < thresholds.criticalLow) {
      alerts.push({
        tankId: telemetry.tankId,
        alertType: 'critical_low',
        severity: 'critical',
        message: `Tank level critically low: ${telemetry.fuelLevel.toFixed(0)}L (${((telemetry.fuelLevel / thresholds.capacity) * 100).toFixed(1)}%)`,
        currentValue: telemetry.fuelLevel,
        threshold: thresholds.criticalLow,
        timestamp: new Date(),
        autoResolved: false,
      });
    }
    
    // Water contamination
    if (telemetry.waterLevel > thresholds.waterLevel) {
      alerts.push({
        tankId: telemetry.tankId,
        alertType: 'water_contamination',
        severity: 'high',
        message: `Water contamination detected: ${telemetry.waterLevel}mm`,
        currentValue: telemetry.waterLevel,
        threshold: thresholds.waterLevel,
        timestamp: new Date(),
        autoResolved: false,
      });
    }
    
    // Temperature anomaly
    if (telemetry.temperature < thresholds.temperatureMin || telemetry.temperature > thresholds.temperatureMax) {
      alerts.push({
        tankId: telemetry.tankId,
        alertType: 'temperature_anomaly',
        severity: 'medium',
        message: `Temperature outside safe range: ${telemetry.temperature}°C`,
        currentValue: telemetry.temperature,
        threshold: telemetry.temperature < thresholds.temperatureMin ? thresholds.temperatureMin : thresholds.temperatureMax,
        timestamp: new Date(),
        autoResolved: false,
      });
    }
    
    // Process all alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  private async processAlert(alert: TankAlert): Promise<void> {
    // Store alert
    await this.alertRepository.save({
      ...alert,
      createdAt: new Date(),
    });
    
    // Emit alert event
    this.eventEmitter.emit('tank.alert', alert);
    
    // Send notifications based on severity
    if (alert.severity === 'critical') {
      await this.sendCriticalNotification(alert);
    }
  }

  // Helper methods
  private async storeTelemetry(telemetry: TankTelemetry): Promise<void> {
    await this.tankReadingRepository.save({
      tankId: telemetry.tankId,
      timestamp: telemetry.timestamp,
      fuelLevel: telemetry.fuelLevel,
      temperature: telemetry.temperature,
      pressure: telemetry.pressure,
      waterLevel: telemetry.waterLevel,
      density: telemetry.density,
      sensorStatus: telemetry.sensorStatus,
    });
  }

  private async getHistoricalData(tankId: string, hours: number): Promise<TankReading[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.tankReadingRepository.find({
      where: {
        tankId,
        timestamp: { $gte: since } as any,
      },
      order: { timestamp: 'ASC' },
    });
  }

  private statisticalLeakDetection(data: TankReading[]): { confidence: number } {
    // Implement statistical leak detection algorithm
    return { confidence: 0.85 };
  }

  private async massBalanceAnalysis(tankId: string, data: TankReading[]): Promise<{ confidence: number }> {
    // Implement mass balance analysis
    return { confidence: 0.90 };
  }

  private pressurePointAnalysis(data: TankReading[]): { confidence: number } {
    // Implement pressure point analysis
    return { confidence: 0.75 };
  }

  private calculateLeakRate(data: TankReading[]): number {
    // Calculate leak rate from historical data
    return 50; // liters/hour
  }

  private async estimateLeakLocation(tankId: string): Promise<string> {
    // Estimate leak location based on sensor data
    return 'Bottom valve section';
  }

  private async createLeakAlert(tankId: string, confidence: number, evidence: any[]): Promise<void> {
    // Create and process leak alert
  }

  private async getWaterLevelHistory(tankId: string, days: number): Promise<number[]> {
    // Get water level history
    return [];
  }

  private analyzeWaterTrend(levels: number[]): 'increasing' | 'stable' | 'decreasing' {
    // Analyze water level trend
    return 'stable';
  }

  private calculateWaterVolume(waterLevel: number, tankDiameter: number): number {
    // Calculate water volume from level
    return waterLevel * Math.PI * Math.pow(tankDiameter / 2, 2) / 1000;
  }

  private async getAmbientTemperature(tankId: string): Promise<number> {
    // Get ambient temperature from weather service
    return 25;
  }

  private async getTemperatureHistory(tankId: string, days: number): Promise<number[]> {
    // Get temperature history
    return [];
  }

  private calculateExpectedTemperature(ambient: number, density: number, level: number): number {
    // Calculate expected temperature based on conditions
    return ambient + 2;
  }

  private async analyzeSensorHealth(tankId: string): Promise<any> {
    // Analyze sensor health metrics
    return {};
  }

  private async analyzeStructuralIntegrity(tankId: string): Promise<any> {
    // Analyze tank structural integrity
    return {};
  }

  private calculateTankAge(tank: Tank): number {
    // Calculate tank age in years
    return 5;
  }

  private async getUsagePattern(tankId: string): Promise<any> {
    // Get tank usage pattern
    return {};
  }

  private async getBookStock(tankId: string): Promise<number> {
    // Get book stock from inventory system
    return 10000;
  }

  private async createReconciliationAlert(tankId: string, variance: number, reasons: string[]): Promise<void> {
    // Create reconciliation alert
  }

  private async getConsumptionHistory(tankId: string, days: number): Promise<any[]> {
    // Get consumption history
    return [];
  }

  private async getUpcomingEvents(): Promise<any[]> {
    // Get upcoming events that might affect consumption
    return [];
  }

  private async getWeatherForecast(): Promise<any> {
    // Get weather forecast
    return {};
  }

  private async getEnvironmentalData(tankId: string): Promise<any> {
    // Get environmental monitoring data
    return {
      vaporEmissions: 50,
      vaporRecoveryEfficiency: 0.95,
    };
  }

  private generateEnvironmentalRecommendations(violations: string[], data: any): string[] {
    // Generate environmental compliance recommendations
    return ['Install vapor recovery unit', 'Schedule maintenance for pressure relief valve'];
  }

  private async sendCriticalNotification(alert: TankAlert): Promise<void> {
    // Send critical notifications via multiple channels
    this.logger.error(`CRITICAL ALERT: ${alert.message}`);
  }

  /**
   * Scheduled tasks for regular monitoring
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async performScheduledChecks() {
    for (const [tankId, _] of this.activeTanks) {
      await this.detectLeaks(tankId);
      await this.detectWaterContamination(tankId);
      await this.performReconciliation(tankId);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updatePredictiveModels() {
    for (const [tankId, _] of this.activeTanks) {
      await this.predictMaintenance(tankId);
      await this.forecastDeliveryRequirement(tankId);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async generateDailyReports() {
    for (const [tankId, _] of this.activeTanks) {
      await this.monitorEnvironmentalCompliance(tankId);
    }
  }
}