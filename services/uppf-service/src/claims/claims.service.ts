import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UPPFClaim } from './entities/uppf-claim.entity';
import { DeliveryConsignment } from './entities/delivery-consignment.entity';
import { EqualisationPoint } from './entities/equalisation-point.entity';
import { GPSTrace } from './entities/gps-trace.entity';
import { CreateUPPFClaimDto } from './dto/create-uppf-claim.dto';
import { UPPFClaimStatus } from '@omc-erp/shared-types';
import { v4 as uuidv4 } from 'uuid';
import * as geolib from 'geolib';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectRepository(UPPFClaim)
    private readonly uppfClaimRepository: Repository<UPPFClaim>,
    @InjectRepository(DeliveryConsignment)
    private readonly deliveryRepository: Repository<DeliveryConsignment>,
    @InjectRepository(EqualisationPoint)
    private readonly equalisationRepository: Repository<EqualisationPoint>,
    @InjectRepository(GPSTrace)
    private readonly gpsTraceRepository: Repository<GPSTrace>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create UPPF claim from delivery with automatic calculation
   * Implements the blueprint formula: claim_amount = km_excess * litres_delivered * tariff_per_litre_km
   */
  async createClaim(
    createClaimDto: CreateUPPFClaimDto,
    tenantId: string,
    userId?: string,
  ): Promise<UPPFClaim> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get delivery consignment
      const delivery = await this.deliveryRepository.findOne({
        where: { id: createClaimDto.deliveryId, tenantId },
      });

      if (!delivery) {
        throw new NotFoundException('Delivery consignment not found');
      }

      // 2. Get equalisation point for the route
      const equalisationPoint = await this.equalisationRepository.findOne({
        where: { routeId: createClaimDto.routeId, tenantId },
        order: { effectiveFrom: 'DESC' }, // Get latest effective rate
      });

      if (!equalisationPoint) {
        throw new NotFoundException(`Equalisation point not found for route ${createClaimDto.routeId}`);
      }

      // 3. Calculate km beyond equalisation (blueprint: km_excess = max(0, km_actual - equalisation_points.km_threshold))
      const kmBeyondEqualisation = Math.max(0, createClaimDto.kmActual - equalisationPoint.kmThreshold);

      if (kmBeyondEqualisation <= 0) {
        throw new BadRequestException(
          `No UPPF claim applicable. Actual distance (${createClaimDto.kmActual}km) does not exceed equalisation threshold (${equalisationPoint.kmThreshold}km)`
        );
      }

      // 4. Calculate claim amount (blueprint: claim_amount = km_excess * litres_delivered * tariff_per_litre_km)
      const amountDue = kmBeyondEqualisation * createClaimDto.litresMoved * equalisationPoint.tariffPerLitreKm;

      // 5. Create GPS trace if provided
      let gpsTraceId: string | undefined;
      if (createClaimDto.gpsTrace && createClaimDto.gpsTrace.length > 0) {
        const gpsTrace = await this.createGPSTrace(
          createClaimDto.deliveryId,
          createClaimDto.gpsTrace,
          tenantId
        );
        gpsTraceId = gpsTrace.id;
      }

      // 6. Create UPPF claim
      const claim = this.uppfClaimRepository.create({
        claimId: this.generateClaimId(createClaimDto.windowId),
        windowId: createClaimDto.windowId,
        deliveryId: createClaimDto.deliveryId,
        routeId: createClaimDto.routeId,
        kmBeyondEqualisation,
        litresMoved: createClaimDto.litresMoved,
        tariffPerLitreKm: equalisationPoint.tariffPerLitreKm,
        amountDue,
        status: UPPFClaimStatus.DRAFT,
        evidenceLinks: createClaimDto.evidenceLinks || [],
        tenantId,
        createdBy: userId,
      });

      const savedClaim = await queryRunner.manager.save(claim);

      // 7. Perform three-way reconciliation
      const reconciliationResult = await this.performThreeWayReconciliation(delivery, createClaimDto);
      
      if (reconciliationResult.hasVariances) {
        savedClaim.status = UPPFClaimStatus.UNDER_REVIEW;
        savedClaim.notes = `Variances detected: ${reconciliationResult.variances.join(', ')}`;
        await queryRunner.manager.save(savedClaim);

        this.eventEmitter.emit('uppf-claim.variance-flagged', {
          claimId: savedClaim.claimId,
          variances: reconciliationResult.variances,
          tenantId,
        });
      } else {
        savedClaim.status = UPPFClaimStatus.READY_TO_SUBMIT;
        await queryRunner.manager.save(savedClaim);
      }

      await queryRunner.commitTransaction();

      // 8. Emit events
      this.eventEmitter.emit('uppf-claim.created', {
        claimId: savedClaim.claimId,
        deliveryId: createClaimDto.deliveryId,
        amountDue,
        routeId: createClaimDto.routeId,
        tenantId,
      });

      this.logger.log(
        `Created UPPF claim ${savedClaim.claimId}: ${kmBeyondEqualisation}km × ${createClaimDto.litresMoved}L × GHS${equalisationPoint.tariffPerLitreKm} = GHS${amountDue.toFixed(2)}`
      );

      return savedClaim;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Three-way reconciliation: depot load vs station received vs transporter trip
   * Blueprint requirement: "Three-way reconcile: depot load vs. station received vs. transporter trip; flag variances."
   */
  async performThreeWayReconciliation(
    delivery: DeliveryConsignment,
    claimData: CreateUPPFClaimDto
  ): Promise<{
    hasVariances: boolean;
    variances: string[];
    reconciliation: {
      depotLoaded: number;
      stationReceived: number;
      claimedMoved: number;
      volumeVariance: number;
      distanceVariance?: number;
    };
  }> {
    const variances: string[] = [];
    
    const reconciliation = {
      depotLoaded: delivery.litresLoaded,
      stationReceived: delivery.litresReceived || 0,
      claimedMoved: claimData.litresMoved,
      volumeVariance: 0,
      distanceVariance: 0,
    };

    // Volume reconciliation
    const volumeTolerance = 50; // 50L tolerance
    reconciliation.volumeVariance = Math.abs(delivery.litresLoaded - (delivery.litresReceived || 0));
    
    if (reconciliation.volumeVariance > volumeTolerance) {
      variances.push(`Volume variance: ${reconciliation.volumeVariance.toFixed(1)}L exceeds tolerance of ${volumeTolerance}L`);
    }

    // Check if claimed litres match received litres
    const claimVolumeVariance = Math.abs(claimData.litresMoved - (delivery.litresReceived || delivery.litresLoaded));
    if (claimVolumeVariance > volumeTolerance) {
      variances.push(`Claimed litres (${claimData.litresMoved}L) don't match delivery records`);
    }

    // Distance reconciliation (if we have GPS data)
    if (claimData.gpsTrace && claimData.gpsTrace.length > 1) {
      const gpsDistance = this.calculateGPSDistance(claimData.gpsTrace);
      reconciliation.distanceVariance = Math.abs(claimData.kmActual - gpsDistance);
      
      const distanceTolerance = claimData.kmActual * 0.1; // 10% tolerance
      if (reconciliation.distanceVariance > distanceTolerance) {
        variances.push(
          `Distance variance: GPS trace shows ${gpsDistance.toFixed(1)}km vs claimed ${claimData.kmActual}km`
        );
      }
    }

    return {
      hasVariances: variances.length > 0,
      variances,
      reconciliation,
    };
  }

  /**
   * Route anomaly detection using GPS patterns
   * Blueprint AI feature: "Route validation model: flag abnormal detours vs historical baselines"
   */
  async detectRouteAnomalies(gpsTrace: any[], routeId: string, tenantId: string): Promise<{
    hasAnomalies: boolean;
    anomalies: string[];
    confidence: number;
  }> {
    // TODO: Implement ML-based route anomaly detection
    // For now, basic checks
    const anomalies: string[] = [];

    if (gpsTrace.length < 2) {
      anomalies.push('Insufficient GPS points for route validation');
      return { hasAnomalies: true, anomalies, confidence: 0.9 };
    }

    // Check for unusual stops (more than 2 hours at non-depot/station locations)
    let previousPoint = gpsTrace[0];
    let stationaryTime = 0;
    
    for (let i = 1; i < gpsTrace.length; i++) {
      const currentPoint = gpsTrace[i];
      const distance = geolib.getDistance(
        { latitude: previousPoint.latitude, longitude: previousPoint.longitude },
        { latitude: currentPoint.latitude, longitude: currentPoint.longitude }
      );

      const timeDiff = new Date(currentPoint.timestamp).getTime() - new Date(previousPoint.timestamp).getTime();
      
      if (distance < 100 && timeDiff > 2 * 60 * 60 * 1000) { // Stationary for >2 hours within 100m
        stationaryTime += timeDiff;
      }
      
      previousPoint = currentPoint;
    }

    if (stationaryTime > 4 * 60 * 60 * 1000) { // More than 4 hours total stationary time
      anomalies.push('Excessive stationary time detected - possible unauthorized stops');
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      confidence: 0.7,
    };
  }

  /**
   * Batch submit claims for a pricing window
   * Blueprint requirement: "Batch submit claim set per window with auto-generated schedules & attachments"
   */
  async batchSubmitClaims(
    windowId: string,
    tenantId: string,
    userId?: string,
  ): Promise<{
    submittedClaims: string[];
    totalAmount: number;
    submissionReference: string;
  }> {
    const readyToSubmitClaims = await this.uppfClaimRepository.find({
      where: {
        windowId,
        tenantId,
        status: UPPFClaimStatus.READY_TO_SUBMIT,
      },
    });

    if (readyToSubmitClaims.length === 0) {
      throw new BadRequestException(`No claims ready to submit for window ${windowId}`);
    }

    const submissionReference = `UPPF-${windowId}-${Date.now()}`;
    const totalAmount = readyToSubmitClaims.reduce((sum, claim) => sum + claim.amountDue, 0);
    
    // Update all claims to submitted status
    await this.uppfClaimRepository.update(
      { windowId, tenantId, status: UPPFClaimStatus.READY_TO_SUBMIT },
      { 
        status: UPPFClaimStatus.SUBMITTED,
        submittedAt: new Date(),
        submittedBy: userId,
        submissionReference,
      }
    );

    // Generate NPA submission format
    const submissionPackage = await this.generateNPASubmissionPackage(readyToSubmitClaims, submissionReference);

    this.eventEmitter.emit('uppf-claims.batch-submitted', {
      windowId,
      submissionReference,
      claimCount: readyToSubmitClaims.length,
      totalAmount,
      tenantId,
    });

    return {
      submittedClaims: readyToSubmitClaims.map(c => c.claimId),
      totalAmount,
      submissionReference,
    };
  }

  /**
   * Generate variance dashboard data
   * Blueprint requirement: "Variance dashboards. Compare expected vs paid UPPF; flag short-pays and aging."
   */
  async getVarianceDashboard(tenantId: string): Promise<any> {
    const claims = await this.uppfClaimRepository
      .createQueryBuilder('claim')
      .where('claim.tenantId = :tenantId', { tenantId })
      .andWhere('claim.submittedAt IS NOT NULL')
      .orderBy('claim.submittedAt', 'DESC')
      .take(1000) // Last 1000 claims
      .getMany();

    const dashboard = {
      summary: {
        totalSubmitted: 0,
        totalPaid: 0,
        totalPending: 0,
        shortPayAmount: 0,
      },
      aging: {
        under30Days: 0,
        days30to60: 0,
        days60to90: 0,
        over90Days: 0,
      },
      paymentVariances: [] as any[],
    };

    const now = new Date();
    
    claims.forEach(claim => {
      dashboard.summary.totalSubmitted += claim.amountDue;
      
      if (claim.status === UPPFClaimStatus.PAID) {
        dashboard.summary.totalPaid += claim.amountPaid || claim.amountDue;
        
        if (claim.amountPaid && claim.amountPaid < claim.amountDue) {
          const shortfall = claim.amountDue - claim.amountPaid;
          dashboard.summary.shortPayAmount += shortfall;
          dashboard.paymentVariances.push({
            claimId: claim.claimId,
            expected: claim.amountDue,
            received: claim.amountPaid,
            variance: shortfall,
          });
        }
      } else {
        dashboard.summary.totalPending += claim.amountDue;
        
        if (claim.submittedAt) {
          const daysAgo = Math.floor((now.getTime() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysAgo < 30) dashboard.aging.under30Days++;
          else if (daysAgo < 60) dashboard.aging.days30to60++;
          else if (daysAgo < 90) dashboard.aging.days60to90++;
          else dashboard.aging.over90Days++;
        }
      }
    });

    return dashboard;
  }

  // Helper methods
  private generateClaimId(windowId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `UPPF-${windowId}-${timestamp}-${random}`;
  }

  private calculateGPSDistance(gpsTrace: any[]): number {
    let totalDistance = 0;
    
    for (let i = 1; i < gpsTrace.length; i++) {
      const distance = geolib.getDistance(
        { latitude: gpsTrace[i-1].latitude, longitude: gpsTrace[i-1].longitude },
        { latitude: gpsTrace[i].latitude, longitude: gpsTrace[i].longitude }
      );
      totalDistance += distance;
    }
    
    return totalDistance / 1000; // Convert meters to kilometers
  }

  private async createGPSTrace(deliveryId: string, gpsPoints: any[], tenantId: string): Promise<GPSTrace> {
    const gpsTrace = this.gpsTraceRepository.create({
      deliveryId,
      tenantId,
      startTime: new Date(gpsPoints[0].timestamp),
      endTime: new Date(gpsPoints[gpsPoints.length - 1].timestamp),
      totalKm: this.calculateGPSDistance(gpsPoints),
      routePoints: gpsPoints,
    });

    return this.gpsTraceRepository.save(gpsTrace);
  }

  private async generateNPASubmissionPackage(claims: UPPFClaim[], submissionReference: string): Promise<any> {
    // Generate NPA-compliant submission format
    return {
      submissionReference,
      submissionDate: new Date().toISOString(),
      totalClaims: claims.length,
      totalAmount: claims.reduce((sum, claim) => sum + claim.amountDue, 0),
      claims: claims.map(claim => ({
        claimId: claim.claimId,
        windowId: claim.windowId,
        routeId: claim.routeId,
        kmBeyondEqualisation: claim.kmBeyondEqualisation,
        litresMoved: claim.litresMoved,
        tariffRate: claim.tariffPerLitreKm,
        amountDue: claim.amountDue,
        evidenceLinks: claim.evidenceLinks,
      })),
    };
  }

  // Scheduled task to check aging claims
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAgingClaims(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    const agingClaims = await this.uppfClaimRepository.find({
      where: {
        status: UPPFClaimStatus.SUBMITTED,
        submittedAt: { $lt: cutoffDate } as any,
      },
    });

    for (const claim of agingClaims) {
      this.eventEmitter.emit('uppf-claim.aging-alert', {
        claimId: claim.claimId,
        windowId: claim.windowId,
        amountDue: claim.amountDue,
        daysAging: Math.floor((Date.now() - claim.submittedAt!.getTime()) / (1000 * 60 * 60 * 24)),
        tenantId: claim.tenantId,
      });
    }
  }
}