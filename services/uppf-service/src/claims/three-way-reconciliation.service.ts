import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  dipReadingsBefore: Array<{ tank: string; level: number }>;
  dipReadingsAfter: Array<{ tank: string; level: number }>;
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

@Injectable()
export class ThreeWayReconciliationService {
  private readonly logger = new Logger(ThreeWayReconciliationService.name);

  // Standard tolerance thresholds
  private readonly VOLUME_TOLERANCE_PERCENT = 0.5; // 0.5% volume tolerance
  private readonly TEMPERATURE_TOLERANCE = 2.0; // 2°C temperature tolerance
  private readonly TIME_TOLERANCE_HOURS = 2; // 2 hour timing tolerance

  constructor(
    @InjectRepository(DeliveryConsignment)
    private readonly deliveryRepository: Repository<DeliveryConsignment>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Perform comprehensive three-way reconciliation
   * Compare depot loading vs transporter GPS vs station receiving
   */
  async performReconciliation(consignmentId: string): Promise<ReconciliationResult> {
    this.logger.log(`Performing three-way reconciliation for consignment: ${consignmentId}`);

    try {
      // Get delivery consignment
      const consignment = await this.deliveryRepository.findOne({
        where: { id: consignmentId },
      });

      if (!consignment) {
        throw new Error('Delivery consignment not found');
      }

      // Gather all three data sources
      const depotData = await this.getDepotLoadingData(consignmentId);
      const transporterData = await this.getTransporterDeliveryData(consignmentId);
      const stationData = await this.getStationReceivingData(consignmentId);

      // Perform temperature corrections
      const temperatureCorrected = this.performTemperatureCorrections(
        depotData,
        transporterData,
        stationData
      );

      // Detect all variances
      const variances = this.detectAllVariances(
        depotData,
        transporterData,
        stationData,
        temperatureCorrected
      );

      // Calculate reconciled volume
      const reconciledLitres = this.calculateReconciledVolume(
        temperatureCorrected,
        variances
      );

      // Calculate overall variance percentage
      const variancePercentage = this.calculateOverallVariance(
        depotData.litresLoaded,
        reconciledLitres
      );

      // Determine reconciliation status
      const status = this.determineReconciliationStatus(variances, variancePercentage);

      // Generate recommendations
      const recommendations = this.generateRecommendations(variances, temperatureCorrected);

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(variances, temperatureCorrected);

      // Store reconciliation results
      await this.storeReconciliationResults({
        consignmentId,
        status,
        reconciledLitres,
        variancePercentage,
        variances,
        temperatureCorrected,
      });

      const result: ReconciliationResult = {
        status,
        reconciledLitres,
        variancePercentage,
        variances,
        documentRefs: [
          depotData.loadingDocRef,
          transporterData.waybillNumber,
          stationData.receivingDocRef,
        ],
        temperatureCorrectedVolumes: temperatureCorrected,
        recommendations,
        confidence,
      };

      // Emit reconciliation event
      this.eventEmitter.emit('three-way-reconciliation.completed', {
        consignmentId,
        result,
      });

      return result;

    } catch (error) {
      this.logger.error(`Three-way reconciliation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Real-time variance detection during delivery
   */
  async detectRealTimeVariances(
    consignmentId: string,
    currentData: Partial<TransporterDeliveryRecord>
  ): Promise<{ hasVariances: boolean; variances: ReconciliationVariance[] }> {
    const depotData = await this.getDepotLoadingData(consignmentId);
    const variances: ReconciliationVariance[] = [];

    if (currentData.litresDelivered && depotData) {
      const volumeVariance = Math.abs(depotData.litresLoaded - currentData.litresDelivered);
      const variancePercent = (volumeVariance / depotData.litresLoaded) * 100;

      if (variancePercent > this.VOLUME_TOLERANCE_PERCENT) {
        variances.push({
          type: 'VOLUME',
          severity: variancePercent > 2 ? 'HIGH' : 'MEDIUM',
          description: `Volume variance detected: ${variancePercent.toFixed(2)}% difference`,
          quantifiedImpact: volumeVariance,
          expectedValue: depotData.litresLoaded,
          actualValue: currentData.litresDelivered,
          tolerance: this.VOLUME_TOLERANCE_PERCENT,
        });
      }
    }

    return {
      hasVariances: variances.length > 0,
      variances,
    };
  }

  /**
   * Automated reconciliation for low-variance deliveries
   */
  async performAutomatedReconciliation(consignmentId: string): Promise<{
    canAutoReconcile: boolean;
    result?: ReconciliationResult;
    reason?: string;
  }> {
    const reconciliationResult = await this.performReconciliation(consignmentId);

    // Check if auto-reconciliation criteria are met
    const highSeverityVariances = reconciliationResult.variances.filter(v => 
      v.severity === 'HIGH' || v.severity === 'CRITICAL'
    );

    const canAutoReconcile = 
      highSeverityVariances.length === 0 &&
      reconciliationResult.variancePercentage <= this.VOLUME_TOLERANCE_PERCENT &&
      reconciliationResult.confidence >= 0.8;

    if (canAutoReconcile) {
      // Auto-approve reconciliation
      await this.approveReconciliation(consignmentId, 'SYSTEM_AUTO');
      return { canAutoReconcile: true, result: reconciliationResult };
    } else {
      return {
        canAutoReconcile: false,
        reason: `Manual review required: ${highSeverityVariances.length} high-severity variances, ${reconciliationResult.variancePercentage.toFixed(2)}% total variance`,
      };
    }
  }

  // Private helper methods

  private async getDepotLoadingData(consignmentId: string): Promise<DepotLoadingRecord> {
    // TODO: Implement database query to get depot loading data
    // This would typically query depot_loading_records table
    return {
      consignmentId,
      litresLoaded: 5000,
      loadingTemp: 25,
      productType: 'PETROL',
      loadingTime: new Date(),
      sealNumbers: ['SEAL001', 'SEAL002'],
      loadingDocRef: 'DLR-001',
      densityAt15C: 0.745,
      compartmentDetails: [
        { compartment: 1, litres: 2500, sealNumber: 'SEAL001' },
        { compartment: 2, litres: 2500, sealNumber: 'SEAL002' },
      ],
    };
  }

  private async getTransporterDeliveryData(consignmentId: string): Promise<TransporterDeliveryRecord> {
    // TODO: Implement database query to get transporter data
    return {
      consignmentId,
      litresDelivered: 4985,
      deliveryTemp: 27,
      deliveryTime: new Date(),
      waybillNumber: 'WB-001',
      driverSignature: 'driver_signature.png',
      kilometersRun: 125,
      fuelConsumed: 15.5,
      routeTaken: 'Route A',
    };
  }

  private async getStationReceivingData(consignmentId: string): Promise<StationReceivingRecord> {
    // TODO: Implement database query to get station receiving data
    return {
      consignmentId,
      litresReceived: 4980,
      receivingTemp: 28,
      receivingTime: new Date(),
      dipReadingsBefore: [{ tank: 'T1', level: 1000 }],
      dipReadingsAfter: [{ tank: 'T1', level: 5980 }],
      receivingDocRef: 'SRR-001',
      qualityTestResults: {
        density: 0.745,
        octaneRating: 95,
        waterContent: 0.01,
        sedimentContent: 0.005,
      },
      stationManagerSignature: 'manager_signature.png',
    };
  }

  private performTemperatureCorrections(
    depotData: DepotLoadingRecord,
    transporterData: TransporterDeliveryRecord,
    stationData: StationReceivingRecord
  ): TemperatureCorrectedVolumes {
    // API gravity-based temperature correction for petroleum products
    const apiGravity = depotData.apiGravity || 60; // Default API gravity for gasoline

    // Calculate Volume Correction Factors (VCF) to 15°C
    const depotVCF = this.calculateVCF(depotData.loadingTemp, apiGravity);
    const transporterVCF = this.calculateVCF(transporterData.deliveryTemp, apiGravity);
    const stationVCF = this.calculateVCF(stationData.receivingTemp, apiGravity);

    return {
      depotAt15C: depotData.litresLoaded * depotVCF,
      transporterAt15C: transporterData.litresDelivered * transporterVCF,
      stationAt15C: stationData.litresReceived * stationVCF,
      correctionFactors: {
        depot: depotVCF,
        transporter: transporterVCF,
        station: stationVCF,
      },
    };
  }

  private calculateVCF(temperature: number, apiGravity: number): number {
    // Simplified VCF calculation (ASTM D1250 approximation)
    const standardTemp = 15; // °C
    const tempDiff = temperature - standardTemp;
    const expansionCoeff = 0.00065; // Typical for gasoline
    
    return 1 - (expansionCoeff * tempDiff);
  }

  private detectAllVariances(
    depotData: DepotLoadingRecord,
    transporterData: TransporterDeliveryRecord,
    stationData: StationReceivingRecord,
    temperatureCorrected: TemperatureCorrectedVolumes
  ): ReconciliationVariance[] {
    const variances: ReconciliationVariance[] = [];

    // Volume variances (using temperature-corrected volumes)
    const depotTransporterVariance = Math.abs(
      temperatureCorrected.depotAt15C - temperatureCorrected.transporterAt15C
    );
    const depotTransporterVariancePercent = 
      (depotTransporterVariance / temperatureCorrected.depotAt15C) * 100;

    if (depotTransporterVariancePercent > this.VOLUME_TOLERANCE_PERCENT) {
      variances.push({
        type: 'VOLUME',
        severity: this.getSeverity(depotTransporterVariancePercent, this.VOLUME_TOLERANCE_PERCENT),
        description: `Depot-Transporter volume variance: ${depotTransporterVariancePercent.toFixed(2)}%`,
        quantifiedImpact: depotTransporterVariance,
        expectedValue: temperatureCorrected.depotAt15C,
        actualValue: temperatureCorrected.transporterAt15C,
        tolerance: this.VOLUME_TOLERANCE_PERCENT,
        rootCause: 'Possible loading error or spillage during transport',
        correctiveAction: 'Verify loading procedures and check for leaks',
      });
    }

    const transporterStationVariance = Math.abs(
      temperatureCorrected.transporterAt15C - temperatureCorrected.stationAt15C
    );
    const transporterStationVariancePercent = 
      (transporterStationVariance / temperatureCorrected.transporterAt15C) * 100;

    if (transporterStationVariancePercent > this.VOLUME_TOLERANCE_PERCENT) {
      variances.push({
        type: 'VOLUME',
        severity: this.getSeverity(transporterStationVariancePercent, this.VOLUME_TOLERANCE_PERCENT),
        description: `Transporter-Station volume variance: ${transporterStationVariancePercent.toFixed(2)}%`,
        quantifiedImpact: transporterStationVariance,
        expectedValue: temperatureCorrected.transporterAt15C,
        actualValue: temperatureCorrected.stationAt15C,
        tolerance: this.VOLUME_TOLERANCE_PERCENT,
        rootCause: 'Possible measurement error or ullage during unloading',
        correctiveAction: 'Verify tank calibration and unloading procedures',
      });
    }

    // Temperature variances
    const loadingDeliveryTempVariance = Math.abs(depotData.loadingTemp - transporterData.deliveryTemp);
    if (loadingDeliveryTempVariance > this.TEMPERATURE_TOLERANCE) {
      variances.push({
        type: 'TEMPERATURE',
        severity: this.getSeverity(loadingDeliveryTempVariance, this.TEMPERATURE_TOLERANCE),
        description: `Temperature change during transport: ${loadingDeliveryTempVariance.toFixed(1)}°C`,
        quantifiedImpact: loadingDeliveryTempVariance,
        expectedValue: depotData.loadingTemp,
        actualValue: transporterData.deliveryTemp,
        tolerance: this.TEMPERATURE_TOLERANCE,
      });
    }

    // Timing variances
    const expectedDeliveryTime = new Date(depotData.loadingTime.getTime() + (8 * 60 * 60 * 1000)); // 8 hours expected
    const actualDeliveryTime = transporterData.deliveryTime;
    const timingVarianceHours = Math.abs(
      (actualDeliveryTime.getTime() - expectedDeliveryTime.getTime()) / (1000 * 60 * 60)
    );

    if (timingVarianceHours > this.TIME_TOLERANCE_HOURS) {
      variances.push({
        type: 'TIMING',
        severity: this.getSeverity(timingVarianceHours, this.TIME_TOLERANCE_HOURS),
        description: `Delivery timing variance: ${timingVarianceHours.toFixed(1)} hours difference`,
        quantifiedImpact: timingVarianceHours,
        expectedValue: expectedDeliveryTime.getTime(),
        actualValue: actualDeliveryTime.getTime(),
        tolerance: this.TIME_TOLERANCE_HOURS,
      });
    }

    // Quality variances
    if (stationData.qualityTestResults) {
      const densityVariance = Math.abs(depotData.densityAt15C - stationData.qualityTestResults.density);
      const densityVariancePercent = (densityVariance / depotData.densityAt15C) * 100;
      
      if (densityVariancePercent > 0.5) { // 0.5% density tolerance
        variances.push({
          type: 'QUALITY',
          severity: this.getSeverity(densityVariancePercent, 0.5),
          description: `Density variance: ${densityVariancePercent.toFixed(2)}%`,
          quantifiedImpact: densityVariance,
          expectedValue: depotData.densityAt15C,
          actualValue: stationData.qualityTestResults.density,
          tolerance: 0.5,
        });
      }
    }

    return variances;
  }

  private getSeverity(variance: number, tolerance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const ratio = variance / tolerance;
    
    if (ratio <= 1) return 'LOW';
    if (ratio <= 2) return 'MEDIUM';
    if (ratio <= 5) return 'HIGH';
    return 'CRITICAL';
  }

  private calculateReconciledVolume(
    temperatureCorrected: TemperatureCorrectedVolumes,
    variances: ReconciliationVariance[]
  ): number {
    // Use weighted average based on confidence in each measurement
    const weights = {
      depot: 0.4,     // Highest confidence - controlled loading environment
      transporter: 0.3, // Medium confidence - mobile measurement
      station: 0.3,   // Medium confidence - receiving measurement
    };

    // Adjust weights based on variances
    const criticalVariances = variances.filter(v => v.severity === 'CRITICAL');
    if (criticalVariances.length > 0) {
      // If there are critical variances, rely more on depot measurement
      weights.depot = 0.6;
      weights.transporter = 0.2;
      weights.station = 0.2;
    }

    return (
      temperatureCorrected.depotAt15C * weights.depot +
      temperatureCorrected.transporterAt15C * weights.transporter +
      temperatureCorrected.stationAt15C * weights.station
    );
  }

  private calculateOverallVariance(originalVolume: number, reconciledVolume: number): number {
    return Math.abs((originalVolume - reconciledVolume) / originalVolume) * 100;
  }

  private determineReconciliationStatus(
    variances: ReconciliationVariance[],
    variancePercentage: number
  ): 'MATCHED' | 'VARIANCE_DETECTED' | 'FAILED' {
    const criticalVariances = variances.filter(v => v.severity === 'CRITICAL');
    const highVariances = variances.filter(v => v.severity === 'HIGH');

    if (criticalVariances.length > 0) return 'FAILED';
    if (highVariances.length > 0 || variancePercentage > 2) return 'VARIANCE_DETECTED';
    return 'MATCHED';
  }

  private generateRecommendations(
    variances: ReconciliationVariance[],
    temperatureCorrected: TemperatureCorrectedVolumes
  ): string[] {
    const recommendations: string[] = [];

    // Volume-based recommendations
    const volumeVariances = variances.filter(v => v.type === 'VOLUME');
    if (volumeVariances.length > 0) {
      recommendations.push('Review loading and unloading procedures');
      recommendations.push('Calibrate tank measurement systems');
      recommendations.push('Implement real-time volume monitoring');
    }

    // Temperature-based recommendations
    const tempVariances = variances.filter(v => v.type === 'TEMPERATURE');
    if (tempVariances.length > 0) {
      recommendations.push('Monitor temperature throughout transport chain');
      recommendations.push('Implement insulated transport where necessary');
    }

    // Quality-based recommendations
    const qualityVariances = variances.filter(v => v.type === 'QUALITY');
    if (qualityVariances.length > 0) {
      recommendations.push('Implement quality sampling at each transfer point');
      recommendations.push('Review product handling procedures');
    }

    // General recommendations
    if (variances.length === 0) {
      recommendations.push('Reconciliation passed - no action required');
    } else {
      recommendations.push('Document all variances for trend analysis');
      recommendations.push('Implement corrective actions for recurring issues');
    }

    return recommendations;
  }

  private calculateConfidenceScore(
    variances: ReconciliationVariance[],
    temperatureCorrected: TemperatureCorrectedVolumes
  ): number {
    let baseScore = 1.0;

    // Reduce confidence for each variance
    variances.forEach(variance => {
      switch (variance.severity) {
        case 'CRITICAL':
          baseScore -= 0.3;
          break;
        case 'HIGH':
          baseScore -= 0.2;
          break;
        case 'MEDIUM':
          baseScore -= 0.1;
          break;
        case 'LOW':
          baseScore -= 0.05;
          break;
      }
    });

    // Temperature correction quality affects confidence
    const tempCorrectionVariance = Math.abs(
      temperatureCorrected.correctionFactors.depot - 1.0
    );
    if (tempCorrectionVariance > 0.05) {
      baseScore -= 0.1; // Large temperature corrections reduce confidence
    }

    return Math.max(0, Math.min(1, baseScore));
  }

  private async storeReconciliationResults(data: {
    consignmentId: string;
    status: string;
    reconciledLitres: number;
    variancePercentage: number;
    variances: ReconciliationVariance[];
    temperatureCorrected: TemperatureCorrectedVolumes;
  }): Promise<void> {
    // TODO: Store reconciliation results in three_way_reconciliation table
    this.logger.log(`Storing reconciliation results for ${data.consignmentId}: ${data.status}`);
  }

  private async approveReconciliation(consignmentId: string, approvedBy: string): Promise<void> {
    // TODO: Update reconciliation status to approved
    this.logger.log(`Auto-approving reconciliation for ${consignmentId} by ${approvedBy}`);
  }
}