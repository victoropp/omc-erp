import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';

@Injectable()
export class UPPFClaimsService {
  private readonly logger = new Logger(UPPFClaimsService.name);

  constructor(
    @InjectRepository('DeliveryConsignments')
    private deliveryRepository: Repository<any>,
    @InjectRepository('UppfClaims')
    private claimsRepository: Repository<any>,
    @InjectRepository('EqualisationPoints')
    private equalisationRepository: Repository<any>,
    @InjectRepository('GpsTraces')
    private gpsRepository: Repository<any>,
    @InjectRepository('ThreeWayReconciliation')
    private reconciliationRepository: Repository<any>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Automatically generate UPPF claim from delivery consignment
   * Implements blueprint logic: km_excess = max(0, km_actual - equalisation_points.km_threshold)
   */
  async generateUPPFClaim(consignmentId: string): Promise<any> {
    this.logger.log(`Generating UPPF claim for consignment ${consignmentId}`);

    // Get delivery consignment
    const delivery = await this.deliveryRepository.findOne({
      where: { consignmentId },
      relations: ['gpsTrace', 'route'],
    });

    if (!delivery) {
      throw new Error(`Delivery consignment ${consignmentId} not found`);
    }

    // Get equalisation point
    const equalisationPoint = await this.equalisationRepository.findOne({
      where: { routeId: delivery.routeId },
    });

    if (!equalisationPoint) {
      throw new Error(`Equalisation point not found for route ${delivery.routeId}`);
    }

    // Calculate km beyond equalisation
    const kmBeyondEqualisation = Math.max(0, 
      delivery.kmActual - equalisationPoint.kmThreshold
    );

    // Get current UPPF tariff rate
    const tariffPerLitreKm = await this.getCurrentUPPFTariff();

    // Calculate claim amount
    const claimAmount = new Decimal(kmBeyondEqualisation)
      .mul(delivery.litresReceived || delivery.litresLoaded)
      .mul(tariffPerLitreKm)
      .toNumber();

    // Perform three-way reconciliation
    const reconciliation = await this.performThreeWayReconciliation(consignmentId);

    // Collect evidence
    const evidence = await this.collectClaimEvidence(consignmentId);

    // Create UPPF claim
    const claim = await this.claimsRepository.save({
      claimNumber: this.generateClaimNumber(),
      windowId: await this.getCurrentPricingWindow(),
      consignmentId,
      routeId: delivery.routeId,
      kmBeyondEqualisation,
      litresMoved: delivery.litresReceived || delivery.litresLoaded,
      tariffPerLitreKm,
      claimAmount,
      status: reconciliation.isValid ? 'READY_TO_SUBMIT' : 'DRAFT',
      evidenceLinks: evidence,
      threeWayReconciled: reconciliation.isValid,
      createdBy: 'SYSTEM',
    });

    // Emit claim generated event
    this.eventEmitter.emit('uppf.claim.generated', {
      claimId: claim.claimId,
      consignmentId,
      claimAmount,
      status: claim.status,
    });

    return claim;
  }

  /**
   * Perform three-way reconciliation
   * Compare Depot → Transporter → Station records
   */
  async performThreeWayReconciliation(consignmentId: string): Promise<{
    isValid: boolean;
    variances: any;
    status: string;
  }> {
    this.logger.log(`Performing three-way reconciliation for ${consignmentId}`);

    const delivery = await this.deliveryRepository.findOne({
      where: { consignmentId },
    });

    // Get depot loading records
    const depotLoadedLitres = delivery.litresLoaded;
    
    // Get transporter delivery records (from GPS/vehicle monitoring)
    const transporterDeliveredLitres = await this.getTransporterVolume(consignmentId);
    
    // Get station receiving records
    const stationReceivedLitres = delivery.litresReceived;

    // Calculate variances
    const varianceDepotTransporter = depotLoadedLitres - transporterDeliveredLitres;
    const varianceTransporterStation = transporterDeliveredLitres - stationReceivedLitres;
    const varianceDepotStation = depotLoadedLitres - stationReceivedLitres;

    // 2% tolerance as per industry standard
    const tolerancePercentage = 0.02;
    const toleranceLitres = depotLoadedLitres * tolerancePercentage;

    const isValid = Math.abs(varianceDepotStation) <= toleranceLitres;

    // Save reconciliation record
    const reconciliation = await this.reconciliationRepository.save({
      consignmentId,
      depotLoadedLitres,
      depotDocumentRef: delivery.waybillNumber,
      transporterDeliveredLitres,
      transporterDocumentRef: `GPS-${delivery.gpsTraceId}`,
      stationReceivedLitres,
      stationDocumentRef: `GRN-${delivery.deliveryNumber}`,
      varianceDepotTransporter,
      varianceTransporterStation,
      varianceDepotStation,
      reconciliationStatus: isValid ? 'MATCHED' : 'VARIANCE_DETECTED',
    });

    // Emit reconciliation event
    this.eventEmitter.emit('uppf.reconciliation.completed', {
      consignmentId,
      isValid,
      variances: {
        depotTransporter: varianceDepotTransporter,
        transporterStation: varianceTransporterStation,
        depotStation: varianceDepotStation,
      },
    });

    return {
      isValid,
      variances: {
        depotTransporter: varianceDepotTransporter,
        transporterStation: varianceTransporterStation,
        depotStation: varianceDepotStation,
        toleranceExceeded: Math.abs(varianceDepotStation) > toleranceLitres,
      },
      status: reconciliation.reconciliationStatus,
    };
  }

  /**
   * Validate GPS route and detect anomalies
   */
  async validateGPSRoute(consignmentId: string): Promise<{
    isValid: boolean;
    anomalies: string[];
    actualKm: number;
  }> {
    this.logger.log(`Validating GPS route for ${consignmentId}`);

    const delivery = await this.deliveryRepository.findOne({
      where: { consignmentId },
    });

    const gpsTrace = await this.gpsRepository.findOne({
      where: { traceId: delivery.gpsTraceId },
    });

    if (!gpsTrace) {
      return {
        isValid: false,
        anomalies: ['GPS trace not found'],
        actualKm: 0,
      };
    }

    const anomalies: string[] = [];

    // Check for route deviations
    const plannedKm = delivery.kmPlanned;
    const actualKm = gpsTrace.totalKm;
    const deviationPercentage = Math.abs(actualKm - plannedKm) / plannedKm;

    if (deviationPercentage > 0.1) { // 10% deviation threshold
      anomalies.push(`Route deviation: ${(deviationPercentage * 100).toFixed(1)}%`);
    }

    // Check for excessive stops
    if (gpsTrace.stopCount > 3) {
      anomalies.push(`Excessive stops: ${gpsTrace.stopCount}`);
    }

    // Check for prolonged stop duration
    if (gpsTrace.stopDurationMinutes > 60) {
      anomalies.push(`Long stop duration: ${gpsTrace.stopDurationMinutes} minutes`);
    }

    // Check for speed anomalies
    if (gpsTrace.maxSpeedKmh > 90) {
      anomalies.push(`Speed violation: ${gpsTrace.maxSpeedKmh} km/h`);
    }

    // Check for time anomalies
    const expectedTime = plannedKm / 50; // Average 50 km/h
    const actualTime = gpsTrace.actualTravelTime ? 
      parseFloat(gpsTrace.actualTravelTime.replace('hours', '')) : 0;
    
    if (actualTime > expectedTime * 1.5) {
      anomalies.push(`Time anomaly: ${actualTime} hours vs expected ${expectedTime} hours`);
    }

    // AI-powered anomaly detection
    const aiAnomalies = await this.detectAIAnomalies(gpsTrace);
    anomalies.push(...aiAnomalies);

    const isValid = anomalies.length === 0;

    // Update delivery with validation results
    await this.deliveryRepository.update(
      { consignmentId },
      {
        kmActual: actualKm,
        status: isValid ? 'DELIVERED' : 'ANOMALY_DETECTED',
      },
    );

    return {
      isValid,
      anomalies,
      actualKm,
    };
  }

  /**
   * Submit UPPF claims to NPA
   */
  async submitClaimsToNPA(windowId: string): Promise<{
    submissionId: string;
    claimsCount: number;
    totalAmount: number;
  }> {
    this.logger.log(`Submitting UPPF claims for window ${windowId}`);

    // Get all ready claims for the window
    const claims = await this.claimsRepository.find({
      where: {
        windowId,
        status: 'READY_TO_SUBMIT',
      },
    });

    if (claims.length === 0) {
      this.logger.warn('No claims ready for submission');
      return {
        submissionId: null,
        claimsCount: 0,
        totalAmount: 0,
      };
    }

    // Calculate total amount
    const totalAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);

    // Generate submission package
    const submissionPackage = {
      submissionId: this.generateSubmissionId(),
      windowId,
      submissionDate: new Date(),
      omcDetails: {
        name: 'Ghana OMC Ltd',
        license: 'NPA/OMC/2025/001',
        tin: '1234567890',
      },
      claims: claims.map(claim => ({
        claimNumber: claim.claimNumber,
        consignmentId: claim.consignmentId,
        routeDetails: {
          from: 'Tema Depot',
          to: claim.stationId,
          kmBeyondEqualisation: claim.kmBeyondEqualisation,
        },
        volumeDetails: {
          litresMoved: claim.litresMoved,
          product: 'PMS', // Get from delivery
        },
        claimAmount: claim.claimAmount,
        supportingDocuments: claim.evidenceLinks,
      })),
      summary: {
        totalClaims: claims.length,
        totalAmount,
        averageClaimAmount: totalAmount / claims.length,
      },
    };

    // Submit to NPA (mock implementation)
    const submissionResult = await this.sendToNPAAPI(submissionPackage);

    // Update claims status
    await this.claimsRepository.update(
      { windowId, status: 'READY_TO_SUBMIT' },
      {
        status: 'SUBMITTED',
        submissionDate: new Date(),
        submissionRef: submissionResult.referenceNumber,
      },
    );

    // Emit submission event
    this.eventEmitter.emit('uppf.claims.submitted', {
      submissionId: submissionPackage.submissionId,
      windowId,
      claimsCount: claims.length,
      totalAmount,
    });

    return {
      submissionId: submissionPackage.submissionId,
      claimsCount: claims.length,
      totalAmount,
    };
  }

  /**
   * Process UPPF settlement from NPA
   */
  async processUPPFSettlement(settlementData: {
    submissionRef: string;
    settlementAmount: number;
    settlementDate: Date;
    paymentReference: string;
  }): Promise<void> {
    this.logger.log(`Processing UPPF settlement for ${settlementData.submissionRef}`);

    // Get claims for the submission
    const claims = await this.claimsRepository.find({
      where: { submissionRef: settlementData.submissionRef },
    });

    const totalClaimAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);
    const varianceAmount = settlementData.settlementAmount - totalClaimAmount;

    // Update claims with settlement details
    for (const claim of claims) {
      const claimProportion = claim.claimAmount / totalClaimAmount;
      const settlementAmount = settlementData.settlementAmount * claimProportion;

      await this.claimsRepository.update(
        { claimId: claim.claimId },
        {
          status: 'SETTLED',
          settlementDate: settlementData.settlementDate,
          settlementAmount,
          varianceAmount: settlementAmount - claim.claimAmount,
        },
      );

      // Post to GL
      await this.postSettlementToGL(claim.claimId, settlementAmount);
    }

    // Emit settlement event
    this.eventEmitter.emit('uppf.settlement.processed', {
      submissionRef: settlementData.submissionRef,
      settlementAmount: settlementData.settlementAmount,
      claimsCount: claims.length,
      varianceAmount,
    });
  }

  /**
   * Scheduled job to auto-generate claims
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoGenerateClaims(): Promise<void> {
    this.logger.log('Running auto-generate UPPF claims job');

    // Get completed deliveries without claims
    const deliveries = await this.deliveryRepository.find({
      where: {
        status: 'DELIVERED',
        claimGenerated: false,
      },
    });

    for (const delivery of deliveries) {
      try {
        await this.generateUPPFClaim(delivery.consignmentId);
        
        // Mark as claim generated
        await this.deliveryRepository.update(
          { consignmentId: delivery.consignmentId },
          { claimGenerated: true },
        );
      } catch (error) {
        this.logger.error(`Failed to generate claim for ${delivery.consignmentId}: ${error.message}`);
      }
    }
  }

  // Helper methods
  private generateClaimNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `UPPF-${year}${month}-${String(random).padStart(4, '0')}`;
  }

  private generateSubmissionId(): string {
    const date = new Date();
    return `SUB-${date.getTime()}`;
  }

  private async getCurrentUPPFTariff(): Promise<number> {
    // Get from configuration or PBU components
    return 0.012; // GHS per litre per km
  }

  private async getCurrentPricingWindow(): Promise<string> {
    // Get active pricing window
    return 'W2025-01';
  }

  private async getTransporterVolume(consignmentId: string): Promise<number> {
    // Get from vehicle monitoring system
    const delivery = await this.deliveryRepository.findOne({
      where: { consignmentId },
    });
    return delivery.litresLoaded * 0.995; // Assume 0.5% loss in transit
  }

  private async collectClaimEvidence(consignmentId: string): Promise<any> {
    return {
      waybill: `waybill-${consignmentId}`,
      gpsTrace: `gps-${consignmentId}`,
      grn: `grn-${consignmentId}`,
      tankDips: `dips-${consignmentId}`,
      weighbridge: `weighbridge-${consignmentId}`,
    };
  }

  private async detectAIAnomalies(gpsTrace: any): Promise<string[]> {
    const anomalies: string[] = [];
    
    // Implement AI-based anomaly detection
    // This would use machine learning models in production
    
    if (gpsTrace.routePolyline && gpsTrace.routePolyline.includes('detour')) {
      anomalies.push('Suspicious route pattern detected');
    }

    return anomalies;
  }

  private async sendToNPAAPI(submissionPackage: any): Promise<any> {
    // Mock NPA API submission
    return {
      success: true,
      referenceNumber: `NPA-REF-${Date.now()}`,
      message: 'Claims submitted successfully',
    };
  }

  private async postSettlementToGL(claimId: string, amount: number): Promise<void> {
    // Post journal entry for UPPF settlement
    this.eventEmitter.emit('journal.entry.create', {
      type: 'UPPF_SETTLEMENT',
      entries: [
        {
          account: '1000', // Cash
          debit: amount,
          credit: 0,
        },
        {
          account: '1250', // Accounts Receivable - UPPF
          debit: 0,
          credit: amount,
        },
      ],
      reference: `UPPF-SETTLEMENT-${claimId}`,
      date: new Date(),
    });
  }
}