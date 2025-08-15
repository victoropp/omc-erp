import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import Decimal from 'decimal.js';
import { addDays, subDays, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

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

// Enhanced interfaces for comprehensive price build-up integration
export interface UPPFPricingComponent {
  componentId: string;
  componentName: string;
  componentType: 'LEVY' | 'FUND' | 'TAX' | 'MARGIN';
  calculationMethod: 'PER_LITRE' | 'PERCENTAGE' | 'FIXED';
  baseRate: number;
  adjustmentFactors: PricingAdjustmentFactor[];
  applicableProducts: string[];
  geographicScope: string[];
  effectiveDate: Date;
  expiryDate?: Date;
  npaApproved: boolean;
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface PricingAdjustmentFactor {
  factorType: 'ROUTE_COMPLEXITY' | 'PRODUCT_CATEGORY' | 'VOLUME_TIER' | 'SEASONAL' | 'COMPLIANCE_BONUS';
  factorName: string;
  multiplier: number;
  conditions: string[];
  isActive: boolean;
}

export interface PriceBuildup {
  productType: string;
  pricingWindow: string;
  basePrice: number;
  components: PriceBuildupComponent[];
  totalPrice: number;
  uppfComponent: UPPFPricingComponent;
  dealerMargin: number;
  omcMargin: number;
  calculationDate: Date;
  approvalStatus: string;
  varianceFromPrevious: number;
}

export interface PriceBuildupComponent {
  componentCode: string;
  componentName: string;
  amount: number;
  calculationBasis: string;
  sourceDocument: string;
  approvalReference: string;
}

export interface UPPFLevyCalculation {
  productType: string;
  volumeLitres: number;
  baseUppfRate: number;
  adjustedUppfRate: number;
  adjustmentFactors: {
    routeComplexity: number;
    productCategory: number;
    volumeTier: number;
    complianceBonus: number;
  };
  totalUppfLevy: number;
  claimableAmount: number;
  nonClaimableAmount: number;
  calculationBreakdown: any;
}

export interface AutomaticPricingIntegration {
  enabled: boolean;
  updateFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  npaDataSource: string;
  validationRules: PricingValidationRule[];
  alertThresholds: PricingAlertThreshold[];
  fallbackMechanism: FallbackMechanism;
}

export interface PricingValidationRule {
  ruleId: string;
  ruleName: string;
  ruleType: 'VARIANCE_CHECK' | 'APPROVAL_REQUIRED' | 'HISTORICAL_COMPARISON' | 'MARKET_BENCHMARK';
  parameters: any;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  autoCorrect: boolean;
}

export interface PricingAlertThreshold {
  thresholdType: 'VARIANCE_PERCENT' | 'ABSOLUTE_CHANGE' | 'VOLUME_IMPACT';
  thresholdValue: number;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notificationChannels: string[];
}

export interface FallbackMechanism {
  useHistoricalData: boolean;
  useMarketAverage: boolean;
  manualOverride: boolean;
  emergencyContact: string[];
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

  // Enhanced UPPF pricing configuration
  private readonly UPPF_PRICING_CONFIG = {
    DEFAULT_TARIFF: 0.0012, // GHS per litre per km
    VARIANCE_TOLERANCE: 0.02, // 2% tolerance for three-way reconciliation
    BASE_RATES: {
      'PMS': 0.46, // GHS per litre
      'AGO': 0.46,
      'KEROSENE': 0.20,
      'LPG': 0.00, // Not eligible
    },
    ADJUSTMENT_FACTORS: {
      ROUTE_COMPLEXITY: {
        'HIGHWAY': 1.0,
        'URBAN': 1.15,
        'RURAL': 1.25,
        'REMOTE': 1.5,
      },
      PRODUCT_CATEGORY: {
        'PMS': 1.0,
        'AGO': 1.0,
        'KEROSENE': 0.8,
      },
      VOLUME_TIER: {
        'SMALL': 1.0,    // < 20,000L
        'MEDIUM': 1.05,  // 20,000L - 50,000L
        'LARGE': 1.10,   // > 50,000L
      },
    },
  };

  private pricingIntegration: AutomaticPricingIntegration = {
    enabled: true,
    updateFrequency: 'DAILY',
    npaDataSource: 'https://npa.gov.gh/pricing',
    validationRules: [],
    alertThresholds: [],
    fallbackMechanism: {
      useHistoricalData: true,
      useMarketAverage: true,
      manualOverride: true,
      emergencyContact: ['pricing@omc.com', 'operations@omc.com'],
    },
  };

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.initializePricingIntegration();
  }

  private initializePricingIntegration(): void {
    // Initialize validation rules
    this.pricingIntegration.validationRules = [
      {
        ruleId: 'VAR_001',
        ruleName: 'UPPF Rate Variance Check',
        ruleType: 'VARIANCE_CHECK',
        parameters: { maxVariancePercent: 10, compareToLastMonth: true },
        severity: 'WARNING',
        autoCorrect: false,
      },
      {
        ruleId: 'APP_001',
        ruleName: 'NPA Approval Required',
        ruleType: 'APPROVAL_REQUIRED',
        parameters: { thresholdAmount: 0.05 },
        severity: 'ERROR',
        autoCorrect: false,
      },
      {
        ruleId: 'HIS_001',
        ruleName: 'Historical Comparison',
        ruleType: 'HISTORICAL_COMPARISON',
        parameters: { lookbackMonths: 6, maxDeviation: 20 },
        severity: 'INFO',
        autoCorrect: false,
      },
    ];

    // Initialize alert thresholds
    this.pricingIntegration.alertThresholds = [
      {
        thresholdType: 'VARIANCE_PERCENT',
        thresholdValue: 5,
        alertLevel: 'LOW',
        notificationChannels: ['email'],
      },
      {
        thresholdType: 'VARIANCE_PERCENT',
        thresholdValue: 10,
        alertLevel: 'HIGH',
        notificationChannels: ['email', 'sms'],
      },
      {
        thresholdType: 'ABSOLUTE_CHANGE',
        thresholdValue: 0.10,
        alertLevel: 'CRITICAL',
        notificationChannels: ['email', 'sms', 'dashboard_alert'],
      },
    ];
  }

  /**
   * Calculate UPPF levy with enhanced price build-up integration
   */
  async calculateUPPFLevy(params: {
    productType: string;
    volumeLitres: number;
    routeComplexity: string;
    deliveryDate: Date;
    customPricingWindow?: string;
  }): Promise<UPPFLevyCalculation> {
    this.logger.log(`Calculating UPPF levy for ${params.volumeLitres}L of ${params.productType}`);

    try {
      // Get current UPPF pricing component
      const uppfComponent = await this.getCurrentUPPFComponent(params.productType, params.customPricingWindow);
      
      if (!uppfComponent) {
        throw new BadRequestException(`UPPF component not found for product ${params.productType}`);
      }

      // Calculate adjustment factors
      const adjustmentFactors = {
        routeComplexity: this.UPPF_PRICING_CONFIG.ADJUSTMENT_FACTORS.ROUTE_COMPLEXITY[params.routeComplexity] || 1.0,
        productCategory: this.UPPF_PRICING_CONFIG.ADJUSTMENT_FACTORS.PRODUCT_CATEGORY[params.productType] || 1.0,
        volumeTier: this.calculateVolumeTierFactor(params.volumeLitres),
        complianceBonus: await this.calculateComplianceBonus(params),
      };

      // Calculate adjusted UPPF rate
      const baseUppfRate = uppfComponent.baseRate;
      const adjustedUppfRate = baseUppfRate * 
        adjustmentFactors.routeComplexity * 
        adjustmentFactors.productCategory * 
        adjustmentFactors.volumeTier * 
        (1 + adjustmentFactors.complianceBonus);

      // Calculate total UPPF levy
      const totalUppfLevy = new Decimal(params.volumeLitres)
        .mul(adjustedUppfRate)
        .toNumber();

      // Determine claimable vs non-claimable amounts
      const claimablePercentage = await this.getClaimablePercentage(params.productType);
      const claimableAmount = totalUppfLevy * claimablePercentage;
      const nonClaimableAmount = totalUppfLevy - claimableAmount;

      // Create detailed calculation breakdown
      const calculationBreakdown = {
        baseCalculation: {
          volumeLitres: params.volumeLitres,
          baseRate: baseUppfRate,
          baseAmount: params.volumeLitres * baseUppfRate,
        },
        adjustments: {
          routeComplexity: {
            factor: adjustmentFactors.routeComplexity,
            amount: (adjustmentFactors.routeComplexity - 1) * params.volumeLitres * baseUppfRate,
          },
          productCategory: {
            factor: adjustmentFactors.productCategory,
            amount: (adjustmentFactors.productCategory - 1) * params.volumeLitres * baseUppfRate,
          },
          volumeTier: {
            factor: adjustmentFactors.volumeTier,
            amount: (adjustmentFactors.volumeTier - 1) * params.volumeLitres * baseUppfRate,
          },
          complianceBonus: {
            factor: adjustmentFactors.complianceBonus,
            amount: adjustmentFactors.complianceBonus * params.volumeLitres * baseUppfRate,
          },
        },
        finalCalculation: {
          adjustedRate: adjustedUppfRate,
          totalLevy: totalUppfLevy,
          claimablePercentage,
          claimableAmount,
          nonClaimableAmount,
        },
      };

      const result: UPPFLevyCalculation = {
        productType: params.productType,
        volumeLitres: params.volumeLitres,
        baseUppfRate,
        adjustedUppfRate,
        adjustmentFactors,
        totalUppfLevy,
        claimableAmount,
        nonClaimableAmount,
        calculationBreakdown,
      };

      // Emit calculation event for analytics
      this.eventEmitter.emit('uppf.levy.calculated', {
        ...result,
        calculationDate: new Date(),
        pricingWindow: uppfComponent.componentId,
      });

      this.logger.log(`UPPF levy calculated: Total ${totalUppfLevy.toFixed(4)}, Claimable ${claimableAmount.toFixed(4)}`);
      return result;

    } catch (error) {
      this.logger.error(`UPPF levy calculation failed:`, error);
      throw error;
    }
  }

  /**
   * Generate comprehensive price build-up with UPPF integration
   */
  async generatePriceBuildup(params: {
    productType: string;
    pricingWindow?: string;
    includeProjections?: boolean;
    validationLevel?: 'BASIC' | 'ENHANCED' | 'COMPREHENSIVE';
  }): Promise<PriceBuildup> {
    this.logger.log(`Generating price build-up for ${params.productType}`);

    try {
      // Get current pricing window or use active one
      const pricingWindow = params.pricingWindow || await this.getActivePricingWindow();
      
      // Get all pricing components
      const components = await this.getAllPricingComponents(params.productType, pricingWindow);
      
      // Get UPPF component specifically
      const uppfComponent = components.find(c => c.componentType === 'FUND' && c.componentName.includes('UPPF'));
      
      if (!uppfComponent) {
        throw new BadRequestException('UPPF component not found in pricing structure');
      }

      // Calculate base price (ex-refinery)
      const basePrice = await this.getBasePrice(params.productType, pricingWindow);
      
      // Build price components
      const priceBuildupComponents: PriceBuildupComponent[] = [];
      let totalPrice = basePrice;

      for (const component of components) {
        const componentAmount = await this.calculateComponentAmount(component, basePrice);
        
        priceBuildupComponents.push({
          componentCode: component.componentId,
          componentName: component.componentName,
          amount: componentAmount,
          calculationBasis: component.calculationMethod,
          sourceDocument: `NPA-PRICING-${pricingWindow}`,
          approvalReference: component.npaApproved ? 'NPA-APPROVED' : 'PENDING',
        });
        
        totalPrice += componentAmount;
      }

      // Get dealer and OMC margins
      const dealerMargin = await this.getDealerMargin(params.productType, pricingWindow);
      const omcMargin = await this.getOMCMargin(params.productType, pricingWindow);
      
      totalPrice += dealerMargin + omcMargin;

      // Calculate variance from previous pricing window
      const previousPrice = await this.getPreviousPrice(params.productType);
      const varianceFromPrevious = previousPrice ? 
        ((totalPrice - previousPrice) / previousPrice) * 100 : 0;

      // Validate pricing if required
      if (params.validationLevel && params.validationLevel !== 'BASIC') {
        await this.validatePriceBuildup({
          productType: params.productType,
          totalPrice,
          components: priceBuildupComponents,
          varianceFromPrevious,
        }, params.validationLevel);
      }

      const priceBuildup: PriceBuildup = {
        productType: params.productType,
        pricingWindow,
        basePrice,
        components: priceBuildupComponents,
        totalPrice,
        uppfComponent,
        dealerMargin,
        omcMargin,
        calculationDate: new Date(),
        approvalStatus: this.determineApprovalStatus(priceBuildupComponents),
        varianceFromPrevious,
      };

      // Store price build-up for audit trail
      await this.storePriceBuildup(priceBuildup);

      // Emit price build-up event
      this.eventEmitter.emit('pricing.buildup.generated', {
        productType: params.productType,
        pricingWindow,
        totalPrice,
        uppfAmount: uppfComponent.baseRate,
        varianceFromPrevious,
      });

      this.logger.log(`Price build-up generated for ${params.productType}: GHS ${totalPrice.toFixed(4)}`);
      return priceBuildup;

    } catch (error) {
      this.logger.error(`Price build-up generation failed:`, error);
      throw error;
    }
  }

  /**
   * Automatically sync UPPF rates from NPA data sources
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async syncUPPFRatesFromNPA(): Promise<void> {
    if (!this.pricingIntegration.enabled) {
      this.logger.log('Automatic UPPF rate sync is disabled');
      return;
    }

    this.logger.log('Syncing UPPF rates from NPA data sources');

    try {
      // Fetch latest NPA pricing data
      const npaData = await this.fetchNPAPricingData();
      
      if (!npaData || !npaData.uppfRates) {
        throw new Error('No UPPF rate data received from NPA');
      }

      // Validate received data
      const validationResult = await this.validateNPAData(npaData);
      
      if (!validationResult.isValid) {
        throw new Error(`NPA data validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Update UPPF components
      for (const productType of Object.keys(npaData.uppfRates)) {
        const newRate = npaData.uppfRates[productType];
        await this.updateUPPFComponent(productType, newRate, {
          sourceDocument: npaData.sourceDocument,
          effectiveDate: npaData.effectiveDate,
          approvalReference: npaData.approvalReference,
        });
      }

      // Generate change summary
      const changeSummary = await this.generateRateChangeSummary(npaData);
      
      // Check alert thresholds
      await this.checkAlertThresholds(changeSummary);

      // Emit sync completion event
      this.eventEmitter.emit('uppf.rates.synced', {
        source: 'NPA',
        changesApplied: changeSummary.totalChanges,
        effectiveDate: npaData.effectiveDate,
        syncDate: new Date(),
      });

      this.logger.log(`UPPF rates synchronized successfully: ${changeSummary.totalChanges} changes applied`);

    } catch (error) {
      this.logger.error('UPPF rate synchronization failed:', error);
      
      // Apply fallback mechanism
      await this.applyFallbackMechanism(error);
      
      // Notify stakeholders
      await this.notifySyncFailure(error);
    }
  }

  /**
   * Create a new UPPF claim with automatic calculation (Enhanced)
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
    // Enhanced UUID generation with timestamp prefix
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
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

  // Enhanced pricing integration helper methods

  private async getCurrentUPPFComponent(productType: string, pricingWindow?: string): Promise<UPPFPricingComponent | null> {
    try {
      const window = pricingWindow || await this.getActivePricingWindow();
      
      // Mock implementation - would fetch from pricing components table
      return {
        componentId: `UPPF-${productType}-${window}`,
        componentName: `UPPF Levy - ${productType}`,
        componentType: 'FUND',
        calculationMethod: 'PER_LITRE',
        baseRate: this.UPPF_PRICING_CONFIG.BASE_RATES[productType] || 0,
        adjustmentFactors: [],
        applicableProducts: [productType],
        geographicScope: ['NATIONAL'],
        effectiveDate: new Date(),
        npaApproved: true,
        lastReviewDate: subDays(new Date(), 30),
        nextReviewDate: addDays(new Date(), 60),
      };
    } catch (error) {
      this.logger.error(`Failed to get UPPF component for ${productType}:`, error);
      return null;
    }
  }

  private calculateVolumeTierFactor(volumeLitres: number): number {
    if (volumeLitres >= 50000) return this.UPPF_PRICING_CONFIG.ADJUSTMENT_FACTORS.VOLUME_TIER.LARGE;
    if (volumeLitres >= 20000) return this.UPPF_PRICING_CONFIG.ADJUSTMENT_FACTORS.VOLUME_TIER.MEDIUM;
    return this.UPPF_PRICING_CONFIG.ADJUSTMENT_FACTORS.VOLUME_TIER.SMALL;
  }

  private async calculateComplianceBonus(params: any): Promise<number> {
    // Calculate compliance bonus based on historical performance
    try {
      const complianceScore = await this.getComplianceScore(params);
      return complianceScore > 95 ? 0.05 : complianceScore > 90 ? 0.02 : 0;
    } catch {
      return 0;
    }
  }

  private async getClaimablePercentage(productType: string): Promise<number> {
    // Get percentage of UPPF levy that is claimable
    const claimableRates = {
      'PMS': 1.0,      // 100% claimable
      'AGO': 1.0,      // 100% claimable
      'KEROSENE': 0.8, // 80% claimable
      'LPG': 0.0,      // Not claimable
    };
    
    return claimableRates[productType] || 0;
  }

  private async getActivePricingWindow(): Promise<string> {
    const now = new Date();
    return `W${now.getFullYear()}-${String(Math.ceil((now.getMonth() + 1) / 0.5)).padStart(2, '0')}`;
  }

  private async getAllPricingComponents(productType: string, pricingWindow: string): Promise<UPPFPricingComponent[]> {
    // Mock implementation - would fetch all pricing components
    return [
      {
        componentId: 'EXREF-001',
        componentName: 'Ex-Refinery Price',
        componentType: 'LEVY',
        calculationMethod: 'PER_LITRE',
        baseRate: 8.50,
        adjustmentFactors: [],
        applicableProducts: [productType],
        geographicScope: ['NATIONAL'],
        effectiveDate: new Date(),
        npaApproved: true,
        lastReviewDate: new Date(),
        nextReviewDate: addDays(new Date(), 30),
      },
      {
        componentId: 'UPPF-001',
        componentName: 'UPPF Levy',
        componentType: 'FUND',
        calculationMethod: 'PER_LITRE',
        baseRate: this.UPPF_PRICING_CONFIG.BASE_RATES[productType] || 0,
        adjustmentFactors: [],
        applicableProducts: [productType],
        geographicScope: ['NATIONAL'],
        effectiveDate: new Date(),
        npaApproved: true,
        lastReviewDate: new Date(),
        nextReviewDate: addDays(new Date(), 30),
      },
    ];
  }

  private async getBasePrice(productType: string, pricingWindow: string): Promise<number> {
    // Get ex-refinery or import-parity price
    const basePrices = {
      'PMS': 8.50,
      'AGO': 8.20,
      'KEROSENE': 7.80,
      'LPG': 6.50,
    };
    
    return basePrices[productType] || 0;
  }

  private async calculateComponentAmount(component: UPPFPricingComponent, basePrice: number): Promise<number> {
    switch (component.calculationMethod) {
      case 'PER_LITRE':
        return component.baseRate;
      case 'PERCENTAGE':
        return basePrice * (component.baseRate / 100);
      case 'FIXED':
        return component.baseRate;
      default:
        return 0;
    }
  }

  private async getDealerMargin(productType: string, pricingWindow: string): Promise<number> {
    const dealerMargins = {
      'PMS': 0.35,
      'AGO': 0.35,
      'KEROSENE': 0.30,
      'LPG': 0.40,
    };
    
    return dealerMargins[productType] || 0;
  }

  private async getOMCMargin(productType: string, pricingWindow: string): Promise<number> {
    const omcMargins = {
      'PMS': 0.30,
      'AGO': 0.30,
      'KEROSENE': 0.25,
      'LPG': 0.35,
    };
    
    return omcMargins[productType] || 0;
  }

  private async getPreviousPrice(productType: string): Promise<number | null> {
    // Get previous pricing window price for comparison
    const previousPrices = {
      'PMS': 14.20,
      'AGO': 14.10,
      'KEROSENE': 13.50,
      'LPG': 12.80,
    };
    
    return previousPrices[productType] || null;
  }

  private async validatePriceBuildup(priceData: any, validationLevel: string): Promise<void> {
    // Apply validation rules based on level
    for (const rule of this.pricingIntegration.validationRules) {
      const result = await this.applyPricingValidationRule(priceData, rule);
      
      if (!result.passed && rule.severity === 'ERROR') {
        throw new BadRequestException(`Pricing validation failed: ${result.message}`);
      }
      
      if (!result.passed && rule.severity === 'WARNING') {
        this.logger.warn(`Pricing validation warning: ${result.message}`);
      }
    }
  }

  private async applyPricingValidationRule(priceData: any, rule: PricingValidationRule): Promise<{ passed: boolean; message: string }> {
    switch (rule.ruleType) {
      case 'VARIANCE_CHECK':
        if (Math.abs(priceData.varianceFromPrevious) > rule.parameters.maxVariancePercent) {
          return {
            passed: false,
            message: `Price variance ${priceData.varianceFromPrevious.toFixed(2)}% exceeds threshold ${rule.parameters.maxVariancePercent}%`,
          };
        }
        break;
      
      case 'APPROVAL_REQUIRED':
        const uppfComponent = priceData.components.find(c => c.componentName.includes('UPPF'));
        if (uppfComponent && Math.abs(uppfComponent.amount - this.UPPF_PRICING_CONFIG.BASE_RATES[priceData.productType]) > rule.parameters.thresholdAmount) {
          return {
            passed: false,
            message: 'UPPF rate change requires NPA approval',
          };
        }
        break;
    }
    
    return { passed: true, message: 'Validation passed' };
  }

  private determineApprovalStatus(components: PriceBuildupComponent[]): string {
    const hasUnapproved = components.some(c => c.approvalReference === 'PENDING');
    return hasUnapproved ? 'PENDING_APPROVAL' : 'APPROVED';
  }

  private async storePriceBuildup(priceBuildup: PriceBuildup): Promise<void> {
    // Store price build-up for audit trail
    this.eventEmitter.emit('pricing.buildup.stored', {
      id: `PBU-${Date.now()}`,
      ...priceBuildup,
    });
  }

  private async fetchNPAPricingData(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.pricingIntegration.npaDataSource, {
          timeout: 30000,
          headers: {
            'User-Agent': 'OMC-ERP-System/1.0',
            'Accept': 'application/json',
          },
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch NPA pricing data:', error);
      throw new Error('NPA data source unavailable');
    }
  }

  private async validateNPAData(npaData: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!npaData.uppfRates) {
      errors.push('Missing UPPF rates in NPA data');
    }
    
    if (!npaData.effectiveDate) {
      errors.push('Missing effective date in NPA data');
    }
    
    if (npaData.uppfRates) {
      for (const [product, rate] of Object.entries(npaData.uppfRates)) {
        if (typeof rate !== 'number' || rate < 0) {
          errors.push(`Invalid UPPF rate for ${product}: ${rate}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async updateUPPFComponent(productType: string, newRate: number, metadata: any): Promise<void> {
    // Update UPPF component with new rate
    this.eventEmitter.emit('uppf.component.updated', {
      productType,
      oldRate: this.UPPF_PRICING_CONFIG.BASE_RATES[productType],
      newRate,
      metadata,
      updateDate: new Date(),
    });
    
    // Update local configuration
    this.UPPF_PRICING_CONFIG.BASE_RATES[productType] = newRate;
  }

  private async generateRateChangeSummary(npaData: any): Promise<{ totalChanges: number; changes: any[] }> {
    const changes = [];
    
    for (const [product, newRate] of Object.entries(npaData.uppfRates)) {
      const oldRate = this.UPPF_PRICING_CONFIG.BASE_RATES[product];
      if (oldRate !== newRate) {
        changes.push({
          product,
          oldRate,
          newRate,
          variance: ((newRate as number - oldRate) / oldRate) * 100,
        });
      }
    }
    
    return {
      totalChanges: changes.length,
      changes,
    };
  }

  private async checkAlertThresholds(changeSummary: any): Promise<void> {
    for (const change of changeSummary.changes) {
      for (const threshold of this.pricingIntegration.alertThresholds) {
        let shouldAlert = false;
        
        switch (threshold.thresholdType) {
          case 'VARIANCE_PERCENT':
            shouldAlert = Math.abs(change.variance) > threshold.thresholdValue;
            break;
          case 'ABSOLUTE_CHANGE':
            shouldAlert = Math.abs(change.newRate - change.oldRate) > threshold.thresholdValue;
            break;
        }
        
        if (shouldAlert) {
          await this.triggerAlert(threshold, change);
        }
      }
    }
  }

  private async triggerAlert(threshold: PricingAlertThreshold, change: any): Promise<void> {
    this.eventEmitter.emit('pricing.alert.triggered', {
      alertLevel: threshold.alertLevel,
      thresholdType: threshold.thresholdType,
      change,
      notificationChannels: threshold.notificationChannels,
      timestamp: new Date(),
    });
  }

  private async applyFallbackMechanism(error: any): Promise<void> {
    this.logger.log('Applying fallback mechanism for UPPF rate sync failure');
    
    if (this.pricingIntegration.fallbackMechanism.useHistoricalData) {
      await this.useHistoricalRates();
    }
    
    if (this.pricingIntegration.fallbackMechanism.manualOverride) {
      await this.requestManualIntervention(error);
    }
  }

  private async useHistoricalRates(): Promise<void> {
    // Use historical rates as fallback
    this.logger.log('Using historical UPPF rates as fallback');
  }

  private async requestManualIntervention(error: any): Promise<void> {
    // Request manual intervention
    this.eventEmitter.emit('pricing.manual_intervention.required', {
      error: error.message,
      contacts: this.pricingIntegration.fallbackMechanism.emergencyContact,
      timestamp: new Date(),
    });
  }

  private async notifySyncFailure(error: any): Promise<void> {
    this.eventEmitter.emit('uppf.sync.failure', {
      error: error.message,
      timestamp: new Date(),
      fallbackApplied: true,
    });
  }

  private async getComplianceScore(params: any): Promise<number> {
    // Calculate compliance score based on historical performance
    return 95; // Mock implementation
  }
}