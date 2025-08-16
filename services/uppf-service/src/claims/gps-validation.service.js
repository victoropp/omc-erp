"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GPSValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSValidationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gps_trace_entity_1 = require("./entities/gps-trace.entity");
const equalisation_point_entity_1 = require("./entities/equalisation-point.entity");
const delivery_consignment_entity_1 = require("./entities/delivery-consignment.entity");
const geolib = __importStar(require("geolib"));
const turf = __importStar(require("@turf/turf"));
let GPSValidationService = GPSValidationService_1 = class GPSValidationService {
    gpsTraceRepository;
    equalisationRepository;
    deliveryRepository;
    logger = new common_1.Logger(GPSValidationService_1.name);
    constructor(gpsTraceRepository, equalisationRepository, deliveryRepository) {
        this.gpsTraceRepository = gpsTraceRepository;
        this.equalisationRepository = equalisationRepository;
        this.deliveryRepository = deliveryRepository;
    }
    /**
     * Comprehensive GPS route validation with real-time tracking
     */
    async validateRoute(request) {
        this.logger.log(`Validating GPS route for consignment: ${request.consignmentId}`);
        try {
            // Get delivery consignment
            const consignment = await this.deliveryRepository.findOne({
                where: { id: request.consignmentId },
            });
            if (!consignment) {
                throw new Error('Delivery consignment not found');
            }
            // Get equalisation point
            const equalisationPoint = await this.equalisationRepository.findOne({
                where: { routeId: consignment.routeId },
            });
            if (!equalisationPoint) {
                throw new Error('Equalisation point not found');
            }
            // Validate GPS data quality
            const gpsQualityCheck = this.validateGPSDataQuality(request.actualRoute);
            if (!gpsQualityCheck.isValid) {
                return {
                    isValid: false,
                    kmBeyondEqualisation: 0,
                    totalDistance: 0,
                    averageSpeed: 0,
                    maxSpeed: 0,
                    routeDeviations: [],
                    anomalies: [],
                    gpsTrace: {},
                    evidenceFiles: [],
                    reasons: gpsQualityCheck.reasons,
                    confidence: 0,
                };
            }
            // Calculate route metrics
            const routeMetrics = this.calculateRouteMetrics(request.actualRoute);
            // Detect route deviations
            const deviations = await this.detectRouteDeviations(request.plannedRoute, request.actualRoute, consignment.routeId);
            // Detect anomalies using ML patterns
            const anomalies = await this.detectRouteAnomalies(request.actualRoute, consignment.routeId);
            // Calculate distance beyond equalisation
            const kmBeyondEqualisation = Math.max(0, routeMetrics.totalDistance - equalisationPoint.kmThreshold);
            // Create GPS trace record
            const gpsTrace = await this.createGPSTrace({
                deliveryId: request.consignmentId,
                vehicleId: request.vehicleId,
                routePoints: request.actualRoute,
                totalKm: routeMetrics.totalDistance,
                maxSpeed: routeMetrics.maxSpeed,
                averageSpeed: routeMetrics.averageSpeed,
            });
            // Generate evidence files
            const evidenceFiles = await this.generateEvidenceFiles(gpsTrace, deviations, anomalies);
            // Determine overall validation result
            const isValid = this.evaluateValidationResult(deviations, anomalies);
            const confidence = this.calculateConfidenceScore(gpsQualityCheck, deviations, anomalies);
            return {
                isValid,
                kmBeyondEqualisation,
                totalDistance: routeMetrics.totalDistance,
                averageSpeed: routeMetrics.averageSpeed,
                maxSpeed: routeMetrics.maxSpeed,
                routeDeviations: deviations,
                anomalies,
                gpsTrace,
                evidenceFiles,
                reasons: this.generateValidationReasons(deviations, anomalies),
                confidence,
            };
        }
        catch (error) {
            this.logger.error(`GPS validation failed: ${error.message}`);
            throw error;
        }
    }
    /**
     * Real-time GPS tracking integration
     */
    async processRealTimeGPSData(vehicleId, gpsPoint) {
        this.logger.debug(`Processing real-time GPS data for vehicle: ${vehicleId}`);
        // Find active delivery for this vehicle
        const activeDelivery = await this.deliveryRepository.findOne({
            where: {
                vehicleId,
                status: 'IN_TRANSIT',
            },
        });
        if (!activeDelivery) {
            return; // No active delivery to track
        }
        // Update GPS trace with new point
        let gpsTrace = await this.gpsTraceRepository.findOne({
            where: { deliveryId: activeDelivery.id },
        });
        if (!gpsTrace) {
            // Create new GPS trace
            gpsTrace = this.gpsTraceRepository.create({
                deliveryId: activeDelivery.id,
                vehicleId,
                startTime: new Date(gpsPoint.timestamp),
                routePoints: [gpsPoint],
            });
        }
        else {
            // Append to existing trace
            gpsTrace.routePoints = [...(gpsTrace.routePoints || []), gpsPoint];
            gpsTrace.endTime = new Date(gpsPoint.timestamp);
            gpsTrace.totalKm = this.calculateTotalDistance(gpsTrace.routePoints);
        }
        await this.gpsTraceRepository.save(gpsTrace);
        // Check for real-time violations
        await this.checkRealTimeViolations(gpsPoint, activeDelivery, gpsTrace);
    }
    /**
     * Mileage calculation with temperature compensation
     */
    calculateMileage(gpsPoints) {
        const segmentDistances = [];
        let totalDistance = 0;
        for (let i = 1; i < gpsPoints.length; i++) {
            const distance = geolib.getDistance({ latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude }, { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }) / 1000; // Convert to km
            segmentDistances.push(distance);
            totalDistance += distance;
        }
        // Apply temperature compensation (simplified model)
        const temperatureCompensated = totalDistance * 1.001; // 0.1% adjustment
        return {
            totalDistance,
            segmentDistances,
            temperatureCompensated,
        };
    }
    /**
     * Geofencing validation for depots and stations
     */
    async validateGeofences(gpsPoints, routeId) {
        // TODO: Implement geofence validation against defined boundaries
        // This would check against the geofences table from the fleet management schema
        const violations = [];
        // Simplified geofence check for demonstration
        for (const point of gpsPoints) {
            // Check if point is in restricted area
            const isInRestrictedArea = await this.checkRestrictedArea(point);
            if (isInRestrictedArea) {
                violations.push({
                    location: point,
                    violationType: 'UNAUTHORIZED_AREA',
                    geofenceName: 'Restricted Zone',
                });
            }
        }
        return {
            violations,
            validEntryExit: violations.length === 0,
        };
    }
    // Private helper methods
    validateGPSDataQuality(gpsPoints) {
        const reasons = [];
        if (gpsPoints.length < 10) {
            reasons.push('Insufficient GPS points for validation (minimum 10 required)');
        }
        // Check for temporal consistency
        for (let i = 1; i < gpsPoints.length; i++) {
            const prevTime = new Date(gpsPoints[i - 1].timestamp);
            const currTime = new Date(gpsPoints[i].timestamp);
            if (currTime <= prevTime) {
                reasons.push('GPS timestamps not in chronological order');
                break;
            }
        }
        // Check for impossible speeds
        for (let i = 1; i < gpsPoints.length; i++) {
            const distance = geolib.getDistance({ latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude }, { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude });
            const timeDiff = (new Date(gpsPoints[i].timestamp).getTime() -
                new Date(gpsPoints[i - 1].timestamp).getTime()) / 1000; // seconds
            const speed = (distance / timeDiff) * 3.6; // km/h
            if (speed > 200) { // Impossible speed for BRV
                reasons.push('Impossible speed detected in GPS data');
                break;
            }
        }
        return {
            isValid: reasons.length === 0,
            reasons,
        };
    }
    calculateRouteMetrics(gpsPoints) {
        const mileage = this.calculateMileage(gpsPoints);
        const speeds = this.calculateSpeeds(gpsPoints);
        const startTime = new Date(gpsPoints[0].timestamp);
        const endTime = new Date(gpsPoints[gpsPoints.length - 1].timestamp);
        const totalTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
        return {
            totalDistance: mileage.totalDistance,
            averageSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
            maxSpeed: Math.max(...speeds, 0),
            totalTime,
        };
    }
    calculateSpeeds(gpsPoints) {
        const speeds = [];
        for (let i = 1; i < gpsPoints.length; i++) {
            const distance = geolib.getDistance({ latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude }, { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude });
            const timeDiff = (new Date(gpsPoints[i].timestamp).getTime() -
                new Date(gpsPoints[i - 1].timestamp).getTime()) / 1000;
            if (timeDiff > 0) {
                const speed = (distance / timeDiff) * 3.6; // km/h
                speeds.push(speed);
            }
        }
        return speeds;
    }
    async detectRouteDeviations(plannedRoute, actualRoute, routeId) {
        const deviations = [];
        // Check for unauthorized stops
        const stops = this.identifyStops(actualRoute);
        for (const stop of stops) {
            if (stop.duration > 30 * 60 * 1000 && !await this.isAuthorizedStop(stop.location, routeId)) {
                deviations.push({
                    type: 'UNAUTHORIZED_STOP',
                    location: stop.location,
                    duration: stop.duration,
                    severity: stop.duration > 2 * 60 * 60 * 1000 ? 'HIGH' : 'MEDIUM',
                    description: `Unauthorized stop for ${Math.round(stop.duration / 60000)} minutes`,
                });
            }
        }
        // Check for route deviations using buffer analysis
        if (plannedRoute.length > 0) {
            const planLine = turf.lineString(plannedRoute.map(p => [p.longitude, p.latitude]));
            const buffer = turf.buffer(planLine, 2, { units: 'kilometers' }); // 2km buffer
            for (const point of actualRoute) {
                const actualPoint = turf.point([point.longitude, point.latitude]);
                if (!turf.booleanPointInPolygon(actualPoint, buffer)) {
                    deviations.push({
                        type: 'ROUTE_DEVIATION',
                        location: point,
                        severity: 'MEDIUM',
                        description: 'Vehicle deviated more than 2km from planned route',
                    });
                }
            }
        }
        return deviations;
    }
    async detectRouteAnomalies(gpsPoints, routeId) {
        const anomalies = [];
        // Detect GPS signal loss
        const signalLosses = this.detectSignalLoss(gpsPoints);
        anomalies.push(...signalLosses);
        // Detect impossible speeds
        const speedAnomalies = this.detectSpeedAnomalies(gpsPoints);
        anomalies.push(...speedAnomalies);
        // Detect backtracking patterns
        const backtrackingAnomalies = this.detectBacktracking(gpsPoints);
        anomalies.push(...backtrackingAnomalies);
        return anomalies;
    }
    identifyStops(gpsPoints) {
        const stops = [];
        let currentStop = null;
        for (let i = 1; i < gpsPoints.length; i++) {
            const distance = geolib.getDistance({ latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude }, { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude });
            if (distance < 100) { // Within 100m radius
                if (!currentStop) {
                    currentStop = {
                        location: gpsPoints[i - 1],
                        startTime: gpsPoints[i - 1].timestamp,
                        endTime: gpsPoints[i].timestamp,
                        duration: 0,
                    };
                }
                else {
                    currentStop.endTime = gpsPoints[i].timestamp;
                }
            }
            else {
                if (currentStop) {
                    currentStop.duration = new Date(currentStop.endTime).getTime() - new Date(currentStop.startTime).getTime();
                    if (currentStop.duration > 10 * 60 * 1000) { // More than 10 minutes
                        stops.push(currentStop);
                    }
                    currentStop = null;
                }
            }
        }
        return stops;
    }
    async isAuthorizedStop(location, routeId) {
        // TODO: Check against authorized stops database
        // This would typically check against stations, depots, or other authorized locations
        return false; // Simplified for now
    }
    async checkRestrictedArea(point) {
        // TODO: Implement geofence checking against restricted areas
        return false; // Simplified for now
    }
    detectSignalLoss(gpsPoints) {
        const anomalies = [];
        for (let i = 1; i < gpsPoints.length; i++) {
            const timeDiff = new Date(gpsPoints[i].timestamp).getTime() -
                new Date(gpsPoints[i - 1].timestamp).getTime();
            if (timeDiff > 15 * 60 * 1000) { // More than 15 minutes gap
                anomalies.push({
                    type: 'GPS_SIGNAL_LOSS',
                    startTime: gpsPoints[i - 1].timestamp,
                    endTime: gpsPoints[i].timestamp,
                    confidence: 0.9,
                    description: `GPS signal loss for ${Math.round(timeDiff / 60000)} minutes`,
                });
            }
        }
        return anomalies;
    }
    detectSpeedAnomalies(gpsPoints) {
        const anomalies = [];
        const speeds = this.calculateSpeeds(gpsPoints);
        speeds.forEach((speed, index) => {
            if (speed > 120) { // Speed limit for BRVs
                anomalies.push({
                    type: 'IMPOSSIBLE_SPEED',
                    startTime: gpsPoints[index].timestamp,
                    endTime: gpsPoints[index + 1].timestamp,
                    confidence: 0.8,
                    description: `Excessive speed: ${Math.round(speed)} km/h`,
                });
            }
        });
        return anomalies;
    }
    detectBacktracking(gpsPoints) {
        const anomalies = [];
        // Simple backtracking detection - check if vehicle returns to a previous location
        for (let i = 2; i < gpsPoints.length; i++) {
            for (let j = 0; j < i - 1; j++) {
                const distance = geolib.getDistance({ latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }, { latitude: gpsPoints[j].latitude, longitude: gpsPoints[j].longitude });
                if (distance < 500) { // Within 500m of a previous location
                    anomalies.push({
                        type: 'BACKTRACKING',
                        startTime: gpsPoints[j].timestamp,
                        endTime: gpsPoints[i].timestamp,
                        confidence: 0.7,
                        description: 'Vehicle returned to previous location',
                    });
                    break;
                }
            }
        }
        return anomalies;
    }
    calculateTotalDistance(gpsPoints) {
        return this.calculateMileage(gpsPoints).totalDistance;
    }
    async createGPSTrace(data) {
        const gpsTrace = this.gpsTraceRepository.create({
            deliveryId: data.deliveryId,
            vehicleId: data.vehicleId,
            startTime: new Date(data.routePoints[0].timestamp),
            endTime: new Date(data.routePoints[data.routePoints.length - 1].timestamp),
            totalKm: data.totalKm,
            maxSpeed: data.maxSpeed,
            averageSpeed: data.averageSpeed,
            routePoints: data.routePoints,
        });
        return this.gpsTraceRepository.save(gpsTrace);
    }
    async generateEvidenceFiles(gpsTrace, deviations, anomalies) {
        // TODO: Generate evidence files (KML, reports, etc.)
        return [
            `gps-trace-${gpsTrace.id}.kml`,
            `route-report-${gpsTrace.id}.pdf`,
            `deviation-analysis-${gpsTrace.id}.json`,
        ];
    }
    evaluateValidationResult(deviations, anomalies) {
        const highSeverityDeviations = deviations.filter(d => d.severity === 'HIGH').length;
        const highConfidenceAnomalies = anomalies.filter(a => a.confidence > 0.8).length;
        return highSeverityDeviations === 0 && highConfidenceAnomalies === 0;
    }
    calculateConfidenceScore(gpsQuality, deviations, anomalies) {
        let baseScore = gpsQuality.isValid ? 0.9 : 0.3;
        // Reduce confidence for each deviation
        const deviationPenalty = deviations.length * 0.1;
        const anomalyPenalty = anomalies.length * 0.05;
        return Math.max(0, Math.min(1, baseScore - deviationPenalty - anomalyPenalty));
    }
    generateValidationReasons(deviations, anomalies) {
        const reasons = [];
        deviations.forEach(d => reasons.push(d.description));
        anomalies.forEach(a => reasons.push(a.description));
        return reasons;
    }
    async checkRealTimeViolations(gpsPoint, delivery, gpsTrace) {
        // Check speed violations
        if (gpsPoint.speed && gpsPoint.speed > 80) { // Speed limit for BRVs
            this.logger.warn(`Speed violation detected: ${gpsPoint.speed} km/h for vehicle ${delivery.vehicleId}`);
            // TODO: Emit real-time alert
        }
        // Check geofence violations
        const geofenceViolation = await this.checkRestrictedArea(gpsPoint);
        if (geofenceViolation) {
            this.logger.warn(`Geofence violation detected for vehicle ${delivery.vehicleId}`);
            // TODO: Emit real-time alert
        }
        // Check for extended stops
        const recentPoints = gpsTrace.routePoints?.slice(-10) || [];
        if (recentPoints.length >= 10) {
            const distances = recentPoints.slice(1).map((point, index) => geolib.getDistance({ latitude: recentPoints[index].latitude, longitude: recentPoints[index].longitude }, { latitude: point.latitude, longitude: point.longitude }));
            const isStationary = distances.every(d => d < 100); // Within 100m for all recent points
            if (isStationary) {
                this.logger.warn(`Extended stop detected for vehicle ${delivery.vehicleId}`);
                // TODO: Emit real-time alert
            }
        }
    }
};
exports.GPSValidationService = GPSValidationService;
exports.GPSValidationService = GPSValidationService = GPSValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gps_trace_entity_1.GPSTrace)),
    __param(1, (0, typeorm_1.InjectRepository)(equalisation_point_entity_1.EqualisationPoint)),
    __param(2, (0, typeorm_1.InjectRepository)(delivery_consignment_entity_1.DeliveryConsignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GPSValidationService);
//# sourceMappingURL=gps-validation.service.js.map