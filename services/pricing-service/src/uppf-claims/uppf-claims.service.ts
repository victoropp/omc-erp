import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Entity interfaces (would be imported from actual entities)
interface UppfClaim {
  claimId: string;
  claimNumber: string;
  windowId: string;
  consignmentId: string;
  routeId: string;
  kmBeyondEqualisation: number;
  litresMoved: number;
  tariffPerLitreKm: number;
  claimAmount: number;
  status: string;
  evidenceLinks?: any;
  threeWayReconciled: boolean;
  submissionDate?: Date;
  submissionRef?: string;
  npaResponseDate?: Date;
  npaResponseRef?: string;
  settlementDate?: Date;
  settlementAmount?: number;
  varianceAmount?: number;
  varianceReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface DeliveryConsignment {
  consignmentId: string;
  deliveryNumber: string;
  depotId: string;
  stationId: string;
  productId: string;
  vehicleId: string;
  driverId: string;
  litresLoaded: number;
  litresReceived?: number;
  loadingTemp?: number;
  receivingTemp?: number;
  dispatchDatetime: Date;
  arrivalDatetime?: Date;
  routeId?: string;
  kmPlanned?: number;
  kmActual?: number;
  gpsTraceId?: string;
  waybillNumber?: string;
  sealNumbers?: string;
  status: string;
  varianceLitres?: number;
  varianceReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface ThreeWayReconciliation {
  reconciliationId: string;
  consignmentId: string;
  depotLoadedLitres: number;
  depotDocumentRef: string;
  transporterDeliveredLitres: number;
  transporterDocumentRef: string;
  stationReceivedLitres: number;
  stationDocumentRef: string;
  varianceDepotTransporter?: number;
  varianceTransporterStation?: number;
  varianceDepotStation?: number;
  reconciliationStatus: string;
  reconciledBy?: string;
  reconciledAt?: Date;
  notes?: string;
  createdAt: Date;
}

interface EqualisationPoint {
  routeId: string;
  depotId: string;
  stationId: string;
  routeName: string;
  kmThreshold: number;
  regionId: string;
  roadCategory?: string;
  trafficFactor: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUppfClaimDto {
  consignmentId: string;
  routeId: string;
  windowId: string;
  litresMoved: number;
  tariffPerLitreKm?: number;
  evidenceLinks?: any;
  createdBy: string;
}

export interface UppfClaimSummary {
  totalClaims: number;
  totalClaimAmount: number;
  totalSettledAmount: number;
  totalVarianceAmount: number;
  claimsByStatus: { [status: string]: number };
  averageSettlementDays: number;
  settlementRate: number;
}

export interface ThreeWayReconciliationDto {
  consignmentId: string;
  depotLoadedLitres: number;
  depotDocumentRef: string;
  transporterDeliveredLitres: number;
  transporterDocumentRef: string;
  stationReceivedLitres: number;
  stationDocumentRef: string;
  notes?: string;
}

@Injectable()
export class UppfClaimsService {
  private readonly logger = new Logger(UppfClaimsService.name);

  // Standard UPPF tariff rates (GHS per litre per km)
  private readonly DEFAULT_UPPF_TARIFF = 0.0012; // GHS 0.12 pesewas per litre per km
  private readonly VARIANCE_TOLERANCE = 0.02; // 2% tolerance for three-way reconciliation

  constructor(
    // These would be actual TypeORM repositories in real implementation
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new UPPF claim with automatic calculation
   */
  async createUppfClaim(dto: CreateUppfClaimDto): Promise<UppfClaim> {
    this.logger.log(`Creating UPPF claim for consignment: ${dto.consignmentId}`);

    try {
      // Validate consignment exists and is eligible
      const consignment = await this.getConsignmentById(dto.consignmentId);
      if (!consignment) {
        throw new BadRequestException(`Consignment ${dto.consignmentId} not found`);
      }

      // Validate route and get equalisation point
      const route = await this.getEqualisationPointById(dto.routeId);
      if (!route) {
        throw new BadRequestException(`Route ${dto.routeId} not found`);
      }

      // Check if consignment is three-way reconciled
      const reconciliation = await this.getThreeWayReconciliation(dto.consignmentId);
      if (!reconciliation || reconciliation.reconciliationStatus !== 'MATCHED') {
        throw new BadRequestException(
          'Consignment must be three-way reconciled before UPPF claim creation'
        );
      }

      // Calculate km beyond equalisation
      const kmBeyondEqualisation = Math.max(0, 
        (consignment.kmActual || consignment.kmPlanned || 0) - route.kmThreshold
      );

      if (kmBeyondEqualisation <= 0) {
        throw new BadRequestException(
          'No kilometers beyond equalisation point - claim not eligible'
        );
      }

      // Get or use default tariff
      const tariff = dto.tariffPerLitreKm || this.DEFAULT_UPPF_TARIFF;

      // Calculate claim amount
      const claimAmount = kmBeyondEqualisation * dto.litresMoved * tariff;

      // Generate claim number
      const claimNumber = await this.generateClaimNumber(dto.windowId);

      // Create claim
      const claimData: UppfClaim = {
        claimId: this.generateUUID(),
        claimNumber,
        windowId: dto.windowId,
        consignmentId: dto.consignmentId,
        routeId: dto.routeId,
        kmBeyondEqualisation,
        litresMoved: dto.litresMoved,
        tariffPerLitreKm: tariff,
        claimAmount,
        status: 'DRAFT',
        evidenceLinks: dto.evidenceLinks || {},
        threeWayReconciled: true,
        createdBy: dto.createdBy,
        createdAt: new Date()
      };

      // Save claim (mock implementation)
      const savedClaim = await this.saveClaim(claimData);

      // Emit event for automated workflows
      this.eventEmitter.emit('uppf.claim.created', {
        claimId: savedClaim.claimId,
        claimAmount: savedClaim.claimAmount,
        windowId: savedClaim.windowId
      });

      this.logger.log(`UPPF claim created: ${claimNumber} for GHS ${claimAmount.toFixed(2)}`);
      return savedClaim;

    } catch (error) {
      this.logger.error(`Failed to create UPPF claim: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Process three-way reconciliation for a delivery consignment
   */
  async processThreeWayReconciliation(dto: ThreeWayReconciliationDto): Promise<ThreeWayReconciliation> {
    this.logger.log(`Processing three-way reconciliation for consignment: ${dto.consignmentId}`);

    // Calculate variances
    const varianceDepotTransporter = dto.depotLoadedLitres - dto.transporterDeliveredLitres;
    const varianceTransporterStation = dto.transporterDeliveredLitres - dto.stationReceivedLitres;
    const varianceDepotStation = dto.depotLoadedLitres - dto.stationReceivedLitres;

    // Determine reconciliation status based on variance tolerance
    const variancePercentage = Math.abs(varianceDepotStation) / dto.depotLoadedLitres;
    const reconciliationStatus = variancePercentage <= this.VARIANCE_TOLERANCE ? 'MATCHED' : 'VARIANCE_DETECTED';

    const reconciliation: ThreeWayReconciliation = {
      reconciliationId: this.generateUUID(),
      consignmentId: dto.consignmentId,
      depotLoadedLitres: dto.depotLoadedLitres,
      depotDocumentRef: dto.depotDocumentRef,
      transporterDeliveredLitres: dto.transporterDeliveredLitres,
      transporterDocumentRef: dto.transporterDocumentRef,
      stationReceivedLitres: dto.stationReceivedLitres,
      stationDocumentRef: dto.stationDocumentRef,
      varianceDepotTransporter,
      varianceTransporterStation,
      varianceDepotStation,
      reconciliationStatus,
      notes: dto.notes,
      createdAt: new Date()
    };

    // Save reconciliation (mock implementation)
    const savedReconciliation = await this.saveReconciliation(reconciliation);

    // If matched, check if UPPF claim can be auto-created
    if (reconciliationStatus === 'MATCHED') {
      await this.checkAutoCreateUppfClaim(dto.consignmentId);
    }

    // Emit event
    this.eventEmitter.emit('three-way.reconciliation.completed', {
      consignmentId: dto.consignmentId,
      status: reconciliationStatus,
      variancePercentage: variancePercentage * 100
    });

    this.logger.log(`Three-way reconciliation completed: ${reconciliationStatus}`);
    return savedReconciliation;
  }

  /**
   * Submit UPPF claims to NPA for a pricing window
   */
  async submitClaimsToNpa(
    windowId: string,
    submittedBy: string,
    claimIds?: string[]
  ): Promise<{
    submissionReference: string;
    totalClaims: number;
    totalAmount: number;
    submissionDate: Date;
  }> {
    this.logger.log(`Submitting UPPF claims to NPA for window: ${windowId}`);

    // Get claims to submit
    let claimsQuery = 'claims ready for submission'; // Mock query
    if (claimIds) {
      claimsQuery += ` with specific IDs: ${claimIds.join(', ')}`;
    }

    // Mock claims data
    const claims = await this.getClaimsForSubmission(windowId, claimIds);
    
    if (claims.length === 0) {
      throw new BadRequestException('No eligible claims found for submission');
    }

    // Generate submission reference
    const submissionReference = this.generateSubmissionReference(windowId);
    const submissionDate = new Date();
    const totalAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);

    // Update claims status to SUBMITTED
    await this.updateClaimsStatus(claims.map(c => c.claimId), 'SUBMITTED', {
      submissionDate,
      submissionRef: submissionReference
    });

    // Create NPA submission record
    await this.createNpaSubmissionRecord({
      submissionType: 'UPPF_CLAIMS',
      windowId,
      submissionDate,
      submissionReference,
      documentCount: claims.length,
      totalClaims: claims.length,
      totalAmount,
      status: 'SUBMITTED',
      submittedBy
    });

    // Emit event
    this.eventEmitter.emit('uppf.claims.submitted', {
      windowId,
      submissionReference,
      totalClaims: claims.length,
      totalAmount
    });

    this.logger.log(`${claims.length} UPPF claims submitted to NPA: ${submissionReference}`);

    return {
      submissionReference,
      totalClaims: claims.length,
      totalAmount,
      submissionDate
    };
  }

  /**
   * Process NPA response for submitted claims
   */
  async processNpaResponse(
    submissionReference: string,
    responseData: {
      responseReference: string;
      responseStatus: string;
      approvedClaims: Array<{
        claimNumber: string;
        approvedAmount: number;
        settlementDate: Date;
      }>;
      rejectedClaims: Array<{
        claimNumber: string;
        rejectionReason: string;
      }>;
    }
  ): Promise<void> {
    this.logger.log(`Processing NPA response for submission: ${submissionReference}`);

    // Process approved claims
    for (const approved of responseData.approvedClaims) {
      const claim = await this.getClaimByNumber(approved.claimNumber);
      if (claim) {
        await this.updateClaimStatus(claim.claimId, 'APPROVED', {
          npaResponseDate: new Date(),
          npaResponseRef: responseData.responseReference,
          settlementAmount: approved.approvedAmount,
          settlementDate: approved.settlementDate,
          varianceAmount: approved.approvedAmount - claim.claimAmount,
          varianceReason: approved.approvedAmount !== claim.claimAmount ? 
            'NPA adjusted amount' : undefined
        });

        // Create accounting entry for approved claim
        await this.createAccountingEntry(claim, approved.approvedAmount);
      }
    }

    // Process rejected claims
    for (const rejected of responseData.rejectedClaims) {
      const claim = await this.getClaimByNumber(rejected.claimNumber);
      if (claim) {
        await this.updateClaimStatus(claim.claimId, 'REJECTED', {
          npaResponseDate: new Date(),
          npaResponseRef: responseData.responseReference,
          varianceReason: rejected.rejectionReason
        });
      }
    }

    // Update submission record
    await this.updateNpaSubmissionStatus(submissionReference, responseData.responseStatus);

    this.logger.log(`NPA response processed: ${responseData.approvedClaims.length} approved, ${responseData.rejectedClaims.length} rejected`);
  }

  /**
   * Get UPPF claims summary for a pricing window
   */
  async getClaimsSummary(windowId: string): Promise<UppfClaimSummary> {
    const claims = await this.getClaimsByWindow(windowId);

    const totalClaims = claims.length;
    const totalClaimAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);
    const totalSettledAmount = claims.reduce((sum, claim) => sum + (claim.settlementAmount || 0), 0);
    const totalVarianceAmount = claims.reduce((sum, claim) => sum + (claim.varianceAmount || 0), 0);

    // Group by status
    const claimsByStatus = claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });

    // Calculate average settlement days
    const settledClaims = claims.filter(c => c.settlementDate && c.submissionDate);
    const averageSettlementDays = settledClaims.length > 0 ?
      settledClaims.reduce((sum, claim) => {
        const days = Math.floor((claim.settlementDate!.getTime() - claim.submissionDate!.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / settledClaims.length : 0;

    // Calculate settlement rate
    const settlementRate = totalClaims > 0 ? 
      (claimsByStatus['SETTLED'] || 0) / totalClaims * 100 : 0;

    return {
      totalClaims,
      totalClaimAmount,
      totalSettledAmount,
      totalVarianceAmount,
      claimsByStatus,
      averageSettlementDays: Math.round(averageSettlementDays * 10) / 10,
      settlementRate: Math.round(settlementRate * 10) / 10
    };
  }

  /**
   * Generate claims report for a specific period
   */
  async generateClaimsReport(
    startDate: Date,
    endDate: Date,
    format: 'summary' | 'detailed' = 'summary'
  ): Promise<any> {
    this.logger.log(`Generating UPPF claims report: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const claims = await this.getClaimsInDateRange(startDate, endDate);

    if (format === 'summary') {
      return {
        reportPeriod: { startDate, endDate },
        totalClaims: claims.length,
        totalClaimAmount: claims.reduce((sum, c) => sum + c.claimAmount, 0),
        totalSettledAmount: claims.reduce((sum, c) => sum + (c.settlementAmount || 0), 0),
        claimsByWindow: this.groupClaimsByWindow(claims),
        claimsByStatus: this.groupClaimsByStatus(claims),
        topRoutes: this.getTopRoutesByClaimsValue(claims),
        performanceMetrics: this.calculatePerformanceMetrics(claims)
      };
    }

    return {
      reportPeriod: { startDate, endDate },
      claims: claims.map(claim => this.formatClaimForReport(claim))
    };
  }

  // Private helper methods (mock implementations)

  private async getConsignmentById(id: string): Promise<DeliveryConsignment | null> {
    // Mock implementation - would query delivery_consignments table
    return {
      consignmentId: id,
      deliveryNumber: 'DEL-001',
      depotId: 'DEPOT-001',
      stationId: 'STATION-001',
      productId: 'PMS',
      vehicleId: 'VEH-001',
      driverId: 'DRV-001',
      litresLoaded: 30000,
      litresReceived: 29950,
      dispatchDatetime: new Date(),
      kmActual: 125,
      status: 'COMPLETED',
      createdAt: new Date()
    };
  }

  private async getEqualisationPointById(id: string): Promise<EqualisationPoint | null> {
    // Mock implementation - would query equalisation_points table
    return {
      routeId: id,
      depotId: 'DEPOT-001',
      stationId: 'STATION-001',
      routeName: 'Accra-Kumasi Route',
      kmThreshold: 100,
      regionId: 'ASHANTI',
      trafficFactor: 1.0,
      isActive: true,
      createdAt: new Date()
    };
  }

  private async getThreeWayReconciliation(consignmentId: string): Promise<ThreeWayReconciliation | null> {
    // Mock implementation - would query three_way_reconciliation table
    return {
      reconciliationId: this.generateUUID(),
      consignmentId,
      depotLoadedLitres: 30000,
      depotDocumentRef: 'DEP-001',
      transporterDeliveredLitres: 30000,
      transporterDocumentRef: 'TRA-001',
      stationReceivedLitres: 29950,
      stationDocumentRef: 'STA-001',
      varianceDepotStation: 50,
      reconciliationStatus: 'MATCHED',
      createdAt: new Date()
    };
  }

  private async generateClaimNumber(windowId: string): Promise<string> {
    // Mock implementation - would generate sequential claim number
    return `UPPF-${windowId}-001`;
  }

  private generateUUID(): string {
    // Mock UUID generation
    return 'uuid-' + Math.random().toString(36).substr(2, 9);
  }

  private async saveClaim(claim: UppfClaim): Promise<UppfClaim> {
    // Mock implementation - would save to database
    return claim;
  }

  private async saveReconciliation(reconciliation: ThreeWayReconciliation): Promise<ThreeWayReconciliation> {
    // Mock implementation - would save to database
    return reconciliation;
  }

  private async checkAutoCreateUppfClaim(consignmentId: string): Promise<void> {
    // Mock implementation - would check eligibility and auto-create claim
    this.logger.log(`Checking auto-create UPPF claim for consignment: ${consignmentId}`);
  }

  private async getClaimsForSubmission(windowId: string, claimIds?: string[]): Promise<UppfClaim[]> {
    // Mock implementation - would query ready claims
    return [];
  }

  private generateSubmissionReference(windowId: string): string {
    return `NPA-SUB-${windowId}-${Date.now()}`;
  }

  private async updateClaimsStatus(claimIds: string[], status: string, additionalFields: any): Promise<void> {
    // Mock implementation - would update claims in database
  }

  private async createNpaSubmissionRecord(data: any): Promise<void> {
    // Mock implementation - would create submission record
  }

  private async getClaimByNumber(claimNumber: string): Promise<UppfClaim | null> {
    // Mock implementation - would query by claim number
    return null;
  }

  private async updateClaimStatus(claimId: string, status: string, additionalFields: any): Promise<void> {
    // Mock implementation - would update claim status
  }

  private async createAccountingEntry(claim: UppfClaim, approvedAmount: number): Promise<void> {
    // Mock implementation - would create journal entries
    this.eventEmitter.emit('accounting.journal.create', {
      templateCode: 'UPPF_CLAIM',
      claimId: claim.claimId,
      amount: approvedAmount
    });
  }

  private async updateNpaSubmissionStatus(submissionRef: string, status: string): Promise<void> {
    // Mock implementation - would update submission status
  }

  private async getClaimsByWindow(windowId: string): Promise<UppfClaim[]> {
    // Mock implementation - would query claims by window
    return [];
  }

  private async getClaimsInDateRange(startDate: Date, endDate: Date): Promise<UppfClaim[]> {
    // Mock implementation - would query claims in date range
    return [];
  }

  private groupClaimsByWindow(claims: UppfClaim[]): any {
    // Mock implementation - would group claims by window
    return {};
  }

  private groupClaimsByStatus(claims: UppfClaim[]): any {
    // Mock implementation - would group claims by status
    return {};
  }

  private getTopRoutesByClaimsValue(claims: UppfClaim[]): any[] {
    // Mock implementation - would analyze top routes
    return [];
  }

  private calculatePerformanceMetrics(claims: UppfClaim[]): any {
    // Mock implementation - would calculate metrics
    return {};
  }

  private formatClaimForReport(claim: UppfClaim): any {
    // Mock implementation - would format claim data for report
    return claim;
  }
}