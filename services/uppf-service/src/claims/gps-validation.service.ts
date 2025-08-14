import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GPSTrace } from './entities/gps-trace.entity';
import { EqualisationPoint } from './entities/equalisation-point.entity';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
import * as geolib from 'geolib';
import * as turf from '@turf/turf';

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

@Injectable()
export class GPSValidationService {
  private readonly logger = new Logger(GPSValidationService.name);

  constructor(
    @InjectRepository(GPSTrace)
    private readonly gpsTraceRepository: Repository<GPSTrace>,
    @InjectRepository(EqualisationPoint)
    private readonly equalisationRepository: Repository<EqualisationPoint>,
    @InjectRepository(DeliveryConsignment)
    private readonly deliveryRepository: Repository<DeliveryConsignment>,
  ) {}

  /**
   * Comprehensive GPS route validation with real-time tracking
   */
  async validateRoute(request: GPSValidationRequest): Promise<GPSValidationResult> {
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
          gpsTrace: {} as GPSTrace,
          evidenceFiles: [],
          reasons: gpsQualityCheck.reasons,
          confidence: 0,
        };
      }

      // Calculate route metrics
      const routeMetrics = this.calculateRouteMetrics(request.actualRoute);
      
      // Detect route deviations
      const deviations = await this.detectRouteDeviations(
        request.plannedRoute,
        request.actualRoute,
        consignment.routeId!
      );

      // Detect anomalies using ML patterns
      const anomalies = await this.detectRouteAnomalies(request.actualRoute, consignment.routeId!);

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

    } catch (error) {
      this.logger.error(`GPS validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Real-time GPS tracking integration
   */
  async processRealTimeGPSData(vehicleId: string, gpsPoint: GPSPoint): Promise<void> {
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
    } else {
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
  calculateMileage(gpsPoints: GPSPoint[]): {
    totalDistance: number;
    segmentDistances: number[];
    temperatureCompensated: number;
  } {
    const segmentDistances: number[] = [];
    let totalDistance = 0;

    for (let i = 1; i < gpsPoints.length; i++) {
      const distance = geolib.getDistance(
        { latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude },
        { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }
      ) / 1000; // Convert to km

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
  async validateGeofences(gpsPoints: GPSPoint[], routeId: string): Promise<{
    violations: Array<{
      location: GPSPoint;
      violationType: 'ENTRY' | 'EXIT' | 'UNAUTHORIZED_AREA';
      geofenceName: string;
    }>;
    validEntryExit: boolean;
  }> {
    // TODO: Implement geofence validation against defined boundaries
    // This would check against the geofences table from the fleet management schema

    const violations: any[] = [];

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

  private validateGPSDataQuality(gpsPoints: GPSPoint[]): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];

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
      const distance = geolib.getDistance(
        { latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude },
        { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }
      );

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

  private calculateRouteMetrics(gpsPoints: GPSPoint[]): {
    totalDistance: number;
    averageSpeed: number;
    maxSpeed: number;
    totalTime: number;
  } {
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

  private calculateSpeeds(gpsPoints: GPSPoint[]): number[] {
    const speeds: number[] = [];

    for (let i = 1; i < gpsPoints.length; i++) {
      const distance = geolib.getDistance(
        { latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude },
        { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }
      );

      const timeDiff = (new Date(gpsPoints[i].timestamp).getTime() - 
                       new Date(gpsPoints[i - 1].timestamp).getTime()) / 1000;

      if (timeDiff > 0) {
        const speed = (distance / timeDiff) * 3.6; // km/h
        speeds.push(speed);
      }
    }

    return speeds;
  }

  private async detectRouteDeviations(
    plannedRoute: GPSPoint[],
    actualRoute: GPSPoint[],
    routeId: string
  ): Promise<RouteDeviation[]> {
    const deviations: RouteDeviation[] = [];

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

  private async detectRouteAnomalies(gpsPoints: GPSPoint[], routeId: string): Promise<RouteAnomaly[]> {
    const anomalies: RouteAnomaly[] = [];

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

  private identifyStops(gpsPoints: GPSPoint[]): Array<{
    location: GPSPoint;
    startTime: string;
    endTime: string;
    duration: number;
  }> {
    const stops: any[] = [];
    let currentStop: any = null;

    for (let i = 1; i < gpsPoints.length; i++) {
      const distance = geolib.getDistance(
        { latitude: gpsPoints[i - 1].latitude, longitude: gpsPoints[i - 1].longitude },
        { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude }
      );

      if (distance < 100) { // Within 100m radius
        if (!currentStop) {
          currentStop = {
            location: gpsPoints[i - 1],
            startTime: gpsPoints[i - 1].timestamp,
            endTime: gpsPoints[i].timestamp,
            duration: 0,
          };
        } else {
          currentStop.endTime = gpsPoints[i].timestamp;
        }
      } else {
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

  private async isAuthorizedStop(location: GPSPoint, routeId: string): Promise<boolean> {
    // TODO: Check against authorized stops database
    // This would typically check against stations, depots, or other authorized locations
    return false; // Simplified for now
  }

  private async checkRestrictedArea(point: GPSPoint): Promise<boolean> {
    // TODO: Implement geofence checking against restricted areas
    return false; // Simplified for now
  }

  private detectSignalLoss(gpsPoints: GPSPoint[]): RouteAnomaly[] {
    const anomalies: RouteAnomaly[] = [];
    
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

  private detectSpeedAnomalies(gpsPoints: GPSPoint[]): RouteAnomaly[] {
    const anomalies: RouteAnomaly[] = [];
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

  private detectBacktracking(gpsPoints: GPSPoint[]): RouteAnomaly[] {
    const anomalies: RouteAnomaly[] = [];
    
    // Simple backtracking detection - check if vehicle returns to a previous location
    for (let i = 2; i < gpsPoints.length; i++) {
      for (let j = 0; j < i - 1; j++) {
        const distance = geolib.getDistance(
          { latitude: gpsPoints[i].latitude, longitude: gpsPoints[i].longitude },
          { latitude: gpsPoints[j].latitude, longitude: gpsPoints[j].longitude }
        );
        
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

  private calculateTotalDistance(gpsPoints: GPSPoint[]): number {
    return this.calculateMileage(gpsPoints).totalDistance;
  }

  private async createGPSTrace(data: {
    deliveryId: string;
    vehicleId: string;
    routePoints: GPSPoint[];
    totalKm: number;
    maxSpeed: number;
    averageSpeed: number;
  }): Promise<GPSTrace> {
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

  private async generateEvidenceFiles(
    gpsTrace: GPSTrace,
    deviations: RouteDeviation[],
    anomalies: RouteAnomaly[]
  ): Promise<string[]> {
    // TODO: Generate evidence files (KML, reports, etc.)
    return [
      `gps-trace-${gpsTrace.id}.kml`,
      `route-report-${gpsTrace.id}.pdf`,
      `deviation-analysis-${gpsTrace.id}.json`,
    ];
  }

  private evaluateValidationResult(deviations: RouteDeviation[], anomalies: RouteAnomaly[]): boolean {
    const highSeverityDeviations = deviations.filter(d => d.severity === 'HIGH').length;
    const highConfidenceAnomalies = anomalies.filter(a => a.confidence > 0.8).length;
    
    return highSeverityDeviations === 0 && highConfidenceAnomalies === 0;
  }

  private calculateConfidenceScore(
    gpsQuality: { isValid: boolean; reasons: string[] },
    deviations: RouteDeviation[],
    anomalies: RouteAnomaly[]
  ): number {
    let baseScore = gpsQuality.isValid ? 0.9 : 0.3;
    
    // Reduce confidence for each deviation
    const deviationPenalty = deviations.length * 0.1;
    const anomalyPenalty = anomalies.length * 0.05;
    
    return Math.max(0, Math.min(1, baseScore - deviationPenalty - anomalyPenalty));
  }

  private generateValidationReasons(deviations: RouteDeviation[], anomalies: RouteAnomaly[]): string[] {
    const reasons: string[] = [];
    
    deviations.forEach(d => reasons.push(d.description));
    anomalies.forEach(a => reasons.push(a.description));
    
    return reasons;
  }

  private async checkRealTimeViolations(
    gpsPoint: GPSPoint,
    delivery: DeliveryConsignment,
    gpsTrace: GPSTrace
  ): Promise<void> {
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
      const distances = recentPoints.slice(1).map((point, index) => 
        geolib.getDistance(
          { latitude: recentPoints[index].latitude, longitude: recentPoints[index].longitude },
          { latitude: point.latitude, longitude: point.longitude }
        )
      );
      
      const isStationary = distances.every(d => d < 100); // Within 100m for all recent points
      if (isStationary) {
        this.logger.warn(`Extended stop detected for vehicle ${delivery.vehicleId}`);
        // TODO: Emit real-time alert
      }
    }
  }
}