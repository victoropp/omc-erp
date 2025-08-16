"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TankMonitoringService_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TankMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tank_reading_entity_1 = require("../entities/tank-reading.entity");
const tank_entity_1 = require("../entities/tank.entity");
const alert_entity_1 = require("../entities/alert.entity");
const anomaly_detection_service_1 = require("./anomaly-detection.service");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
const edge_computing_service_1 = require("./edge-computing.service");
const calibration_service_1 = require("./calibration.service");
let TankMonitoringService = TankMonitoringService_1 = class TankMonitoringService {
    tankReadingRepository;
    tankRepository;
    alertRepository;
    eventEmitter;
    anomalyDetection;
    predictiveAnalytics;
    edgeComputing;
    calibrationService;
    logger = new common_1.Logger(TankMonitoringService_1.name);
    activeTanks = new Map();
    realtimeData = new Map();
    alertThresholds = new Map();
    constructor(tankReadingRepository, tankRepository, alertRepository, eventEmitter, anomalyDetection, predictiveAnalytics, edgeComputing, calibrationService) {
        this.tankReadingRepository = tankReadingRepository;
        this.tankRepository = tankRepository;
        this.alertRepository = alertRepository;
        this.eventEmitter = eventEmitter;
        this.anomalyDetection = anomalyDetection;
        this.predictiveAnalytics = predictiveAnalytics;
        this.edgeComputing = edgeComputing;
        this.calibrationService = calibrationService;
        this.initializeTankMonitoring();
    }
    /**
     * Initialize tank monitoring system
     */
    async initializeTankMonitoring() {
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
    async processTelemetry(telemetry) {
        // 1. Validate and calibrate sensor data
        const calibratedData = await this.calibrationService.calibrate(telemetry);
        // 2. Store in time-series database
        await this.storeTelemetry(calibratedData);
        // 3. Update real-time cache
        this.realtimeData.set(telemetry.tankId, calibratedData);
        // 4. Run edge computing algorithms
        const edgeAnalysis = await this.edgeComputing.analyze(calibratedData);
        // 5. Check for anomalies
        const anomalies = await this.anomalyDetection.detectAnomalies(telemetry.tankId, calibratedData);
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
    async detectLeaks(tankId) {
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
        const combinedConfidence = (sldResult.confidence * 0.25 +
            massBalanceResult.confidence * 0.30 +
            ppaResult.confidence * 0.20 +
            mlResult.confidence * 0.25);
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
    async detectWaterContamination(tankId) {
        const tank = this.activeTanks.get(tankId);
        const currentReading = this.realtimeData.get(tankId);
        if (!currentReading) {
            throw new Error(`No real-time data available for tank ${tankId}`);
        }
        const historicalWaterLevels = await this.getWaterLevelHistory(tankId, 7); // 7 days
        const trend = this.analyzeWaterTrend(historicalWaterLevels);
        const contaminated = currentReading.waterLevel > this.alertThresholds.get(tankId).waterLevel;
        const estimatedVolume = this.calculateWaterVolume(currentReading.waterLevel, tank.diameter);
        let action = 'Continue monitoring';
        if (contaminated) {
            if (trend === 'increasing') {
                action = 'URGENT: Schedule immediate water draining. Investigate source.';
            }
            else {
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
    async analyzeTemperatureAnomalies(tankId) {
        const currentReading = this.realtimeData.get(tankId);
        const ambientTemp = await this.getAmbientTemperature(tankId);
        const historicalTemps = await this.getTemperatureHistory(tankId, 30); // 30 days
        // Calculate expected temperature based on ambient and product characteristics
        const expectedTemp = this.calculateExpectedTemperature(ambientTemp, currentReading.density, currentReading.fuelLevel);
        const deviation = Math.abs(currentReading.temperature - expectedTemp);
        const hasAnomaly = deviation > 5; // 5°C threshold
        const possibleCauses = [];
        if (hasAnomaly) {
            if (currentReading.temperature > expectedTemp) {
                possibleCauses.push('Possible contamination');
                possibleCauses.push('Equipment malfunction');
                possibleCauses.push('Direct sunlight exposure');
            }
            else {
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
    async predictMaintenance(tankId) {
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
    async performReconciliation(tankId) {
        const currentReading = this.realtimeData.get(tankId);
        const bookStock = await this.getBookStock(tankId);
        const physicalStock = currentReading.fuelLevel;
        const variance = bookStock - physicalStock;
        const variancePercentage = (Math.abs(variance) / bookStock) * 100;
        let reconciliationStatus;
        if (variancePercentage < 0.5) {
            reconciliationStatus = 'matched';
        }
        else if (variancePercentage < 2) {
            reconciliationStatus = 'acceptable';
        }
        else {
            reconciliationStatus = 'investigation_required';
        }
        const possibleReasons = [];
        if (variance > 0) {
            possibleReasons.push('Possible leak');
            possibleReasons.push('Theft/pilferage');
            possibleReasons.push('Evaporation loss');
            possibleReasons.push('Measurement error');
        }
        else if (variance < 0) {
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
    async forecastDeliveryRequirement(tankId) {
        const currentReading = this.realtimeData.get(tankId);
        const consumptionHistory = await this.getConsumptionHistory(tankId, 90); // 90 days
        const forecast = await this.predictiveAnalytics.forecastConsumption(tankId, consumptionHistory, {
            seasonality: true,
            events: await this.getUpcomingEvents(),
            weather: await this.getWeatherForecast(),
        });
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
    async monitorEnvironmentalCompliance(tankId) {
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
        const recommendations = this.generateEnvironmentalRecommendations(violations, environmentalData);
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
    async checkAlertConditions(telemetry, anomalies) {
        const thresholds = this.alertThresholds.get(telemetry.tankId);
        const alerts = [];
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
    async processAlert(alert) {
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
    async storeTelemetry(telemetry) {
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
    async getHistoricalData(tankId, hours) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.tankReadingRepository.find({
            where: {
                tankId,
                timestamp: { $gte: since },
            },
            order: { timestamp: 'ASC' },
        });
    }
    statisticalLeakDetection(data) {
        // Implement statistical leak detection algorithm
        return { confidence: 0.85 };
    }
    async massBalanceAnalysis(tankId, data) {
        // Implement mass balance analysis
        return { confidence: 0.90 };
    }
    pressurePointAnalysis(data) {
        // Implement pressure point analysis
        return { confidence: 0.75 };
    }
    calculateLeakRate(data) {
        // Calculate leak rate from historical data
        return 50; // liters/hour
    }
    async estimateLeakLocation(tankId) {
        // Estimate leak location based on sensor data
        return 'Bottom valve section';
    }
    async createLeakAlert(tankId, confidence, evidence) {
        // Create and process leak alert
    }
    async getWaterLevelHistory(tankId, days) {
        // Get water level history
        return [];
    }
    analyzeWaterTrend(levels) {
        // Analyze water level trend
        return 'stable';
    }
    calculateWaterVolume(waterLevel, tankDiameter) {
        // Calculate water volume from level
        return waterLevel * Math.PI * Math.pow(tankDiameter / 2, 2) / 1000;
    }
    async getAmbientTemperature(tankId) {
        // Get ambient temperature from weather service
        return 25;
    }
    async getTemperatureHistory(tankId, days) {
        // Get temperature history
        return [];
    }
    calculateExpectedTemperature(ambient, density, level) {
        // Calculate expected temperature based on conditions
        return ambient + 2;
    }
    async analyzeSensorHealth(tankId) {
        // Analyze sensor health metrics
        return {};
    }
    async analyzeStructuralIntegrity(tankId) {
        // Analyze tank structural integrity
        return {};
    }
    calculateTankAge(tank) {
        // Calculate tank age in years
        return 5;
    }
    async getUsagePattern(tankId) {
        // Get tank usage pattern
        return {};
    }
    async getBookStock(tankId) {
        // Get book stock from inventory system
        return 10000;
    }
    async createReconciliationAlert(tankId, variance, reasons) {
        // Create reconciliation alert
    }
    async getConsumptionHistory(tankId, days) {
        // Get consumption history
        return [];
    }
    async getUpcomingEvents() {
        // Get upcoming events that might affect consumption
        return [];
    }
    async getWeatherForecast() {
        // Get weather forecast
        return {};
    }
    async getEnvironmentalData(tankId) {
        // Get environmental monitoring data
        return {
            vaporEmissions: 50,
            vaporRecoveryEfficiency: 0.95,
        };
    }
    generateEnvironmentalRecommendations(violations, data) {
        // Generate environmental compliance recommendations
        return ['Install vapor recovery unit', 'Schedule maintenance for pressure relief valve'];
    }
    async sendCriticalNotification(alert) {
        // Send critical notifications via multiple channels
        this.logger.error(`CRITICAL ALERT: ${alert.message}`);
    }
    /**
     * Scheduled tasks for regular monitoring
     */
    async performScheduledChecks() {
        for (const [tankId, _] of this.activeTanks) {
            await this.detectLeaks(tankId);
            await this.detectWaterContamination(tankId);
            await this.performReconciliation(tankId);
        }
    }
    async updatePredictiveModels() {
        for (const [tankId, _] of this.activeTanks) {
            await this.predictMaintenance(tankId);
            await this.forecastDeliveryRequirement(tankId);
        }
    }
    async generateDailyReports() {
        for (const [tankId, _] of this.activeTanks) {
            await this.monitorEnvironmentalCompliance(tankId);
        }
    }
};
exports.TankMonitoringService = TankMonitoringService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TankMonitoringService.prototype, "performScheduledChecks", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TankMonitoringService.prototype, "updatePredictiveModels", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TankMonitoringService.prototype, "generateDailyReports", null);
exports.TankMonitoringService = TankMonitoringService = TankMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tank_reading_entity_1.TankReading)),
    __param(1, (0, typeorm_1.InjectRepository)(tank_entity_1.Tank)),
    __param(2, (0, typeorm_1.InjectRepository)(alert_entity_1.Alert)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object, typeof (_e = typeof anomaly_detection_service_1.AnomalyDetectionService !== "undefined" && anomaly_detection_service_1.AnomalyDetectionService) === "function" ? _e : Object, typeof (_f = typeof predictive_analytics_service_1.PredictiveAnalyticsService !== "undefined" && predictive_analytics_service_1.PredictiveAnalyticsService) === "function" ? _f : Object, typeof (_g = typeof edge_computing_service_1.EdgeComputingService !== "undefined" && edge_computing_service_1.EdgeComputingService) === "function" ? _g : Object, typeof (_h = typeof calibration_service_1.CalibrationService !== "undefined" && calibration_service_1.CalibrationService) === "function" ? _h : Object])
], TankMonitoringService);
//# sourceMappingURL=tank-monitoring.service.js.map