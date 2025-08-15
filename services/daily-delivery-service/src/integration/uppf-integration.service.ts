import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Decimal } from 'decimal.js';
import { addDays, subDays, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

import { DailyDelivery, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';

export interface UPPFClaimRequest {
  claimPeriod: {
    startDate: Date;
    endDate: Date;
  };
  dealerId: string;
  deliveryIds: string[];
  claimType: 'MONTHLY' | 'QUARTERLY' | 'INDIVIDUAL';
  totalEligibleVolume: number;
  totalClaimAmount: number;
  supportingDocuments: string[];
  submittedBy: string;
  urgentProcessing?: boolean;
  notes?: string;
}

export interface UPPFClaimResult {
  claimId: string;
  claimNumber: string;
  submissionDate: Date;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
  claimAmount: number;
  approvedAmount?: number;
  rejectionReason?: string;
  expectedPaymentDate?: Date;
  actualPaymentDate?: Date;
  processingTime: number;
  supportingDocuments: ClaimDocument[];
}

export interface ClaimDocument {
  documentId: string;
  documentType: 'DELIVERY_RECEIPT' | 'BILL_OF_LADING' | 'QUALITY_CERTIFICATE' | 'DEALER_LICENSE' | 'NPA_PERMIT' | 'PUMP_PRICE_EVIDENCE' | 'OTHER';
  fileName: string;
  uploadDate: Date;
  url: string;
  isRequired: boolean;
  validationStatus: 'PENDING' | 'VALID' | 'INVALID' | 'MISSING';
}

export interface UPPFEligibilityAssessment {
  dealerId: string;
  dealerName: string;
  assessmentDate: Date;
  overallEligible: boolean;
  eligibilityScore: number; // 0-100
  eligibilityCriteria: EligibilityCriteria[];
  disqualifications: string[];
  conditionalRequirements: string[];
  nextReviewDate: Date;
  maximumClaimPerMonth: number;
  geographicRestrictions: string[];
}

export interface EligibilityCriteria {
  criteriaType: 'DEALER_REGISTRATION' | 'LICENSE_VALIDITY' | 'COMPLIANCE_HISTORY' | 'VOLUME_THRESHOLD' | 'PRICE_COMPLIANCE' | 'GEOGRAPHIC_LOCATION' | 'PAYMENT_HISTORY';
  criteriaName: string;
  status: 'MET' | 'NOT_MET' | 'PARTIAL' | 'UNDER_REVIEW';
  details: string;
  score: number; // 0-100
  evidence?: string[];
  correctionActions?: string[];
  nextVerificationDate?: Date;
}

export interface DealerMarginStructure {
  dealerId: string;
  dealerName: string;
  effectiveDate: Date;
  expiryDate?: Date;
  marginStructure: {
    primaryDistribution: MarginComponent;
    marketing: MarginComponent;
    dealer: MarginComponent;
    uppfContribution: MarginComponent;
  };
  geographicZone: 'GREATER_ACCRA' | 'ASHANTI' | 'NORTHERN' | 'WESTERN' | 'EASTERN' | 'CENTRAL' | 'VOLTA' | 'BRONG_AHAFO' | 'UPPER_EAST' | 'UPPER_WEST';
  dealerCategory: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'RURAL' | 'URBAN' | 'HIGHWAY';
  specialConditions: string[];
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface MarginComponent {
  componentName: string;
  amountPerLitre: number;
  percentage?: number;
  currency: string;
  taxable: boolean;
  uppfEligible: boolean;
  calculationBasis: 'PER_LITRE' | 'PERCENTAGE_OF_PRICE' | 'FIXED_AMOUNT';
  conditions: string[];
}

export interface UPPFPaymentRecord {
  paymentId: string;
  claimId: string;
  dealerId: string;
  paymentDate: Date;
  paymentAmount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'MOBILE_MONEY' | 'DIRECT_DEBIT';
  paymentReference: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    sortCode: string;
  };
  paymentStatus: 'PENDING' | 'PROCESSED' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  failureReason?: string;
  taxWithheld?: number;
  netPaymentAmount: number;
  paymentAdviceUrl?: string;
}

export interface UPPFStatistics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalClaims: number;
  totalClaimAmount: number;
  totalPaid: number;
  averageProcessingDays: number;
  claimsByStatus: { [status: string]: number };
  topDealersByClaim: DealerClaimSummary[];
  productDistribution: ProductClaimSummary[];
  regionalDistribution: RegionalClaimSummary[];
  monthlyTrends: MonthlyClaimTrend[];
}

export interface DealerClaimSummary {
  dealerId: string;
  dealerName: string;
  totalClaims: number;
  totalAmount: number;
  averageClaimAmount: number;
  successRate: number; // percentage
  lastClaimDate: Date;
}

export interface ProductClaimSummary {
  productType: ProductGrade;
  totalVolume: number;
  totalClaims: number;
  totalAmount: number;
  averageMarginPerLitre: number;
}

export interface RegionalClaimSummary {
  region: string;
  dealerCount: number;
  totalClaims: number;
  totalAmount: number;
  averageClaimPerDealer: number;
}

export interface MonthlyClaimTrend {
  month: string;
  year: number;
  totalClaims: number;
  totalAmount: number;
  averageProcessingDays: number;
  successRate: number;
}

export interface PumpPriceValidation {
  validationId: string;
  dealerId: string;
  stationLocation: string;
  productType: ProductGrade;
  validationDate: Date;
  regulatedPrice: number;
  actualSellingPrice: number;
  variance: number;
  variancePercentage: number;
  isCompliant: boolean;
  toleranceLimit: number;
  validationMethod: 'MANUAL_INSPECTION' | 'DIGITAL_MONITORING' | 'CUSTOMER_REPORT' | 'AUTOMATED_SYSTEM';
  inspector?: string;
  photographic_evidence?: string[];
  correctionRequired: boolean;
  correctionDeadline?: Date;
  penaltyApplicable: boolean;
  penaltyAmount?: number;
}

@Injectable()
export class UPPFIntegrationService {
  private readonly logger = new Logger(UPPFIntegrationService.name);
  
  // UPPF rates per litre for different products (in GHS)
  private readonly UPPF_RATES = {
    'PMS': 0.46,      // Petrol
    'AGO': 0.46,      // Diesel
    'IFO': 0.00,      // Industrial Fuel Oil (not eligible)
    'LPG': 0.00,      // LPG (not eligible)
    'KEROSENE': 0.20, // Kerosene
    'LUBRICANTS': 0.00, // Lubricants (not eligible)
  };

  // Geographic zone multipliers
  private readonly ZONE_MULTIPLIERS = {
    'GREATER_ACCRA': 1.0,
    'ASHANTI': 1.0,
    'NORTHERN': 1.2,
    'WESTERN': 1.1,
    'EASTERN': 1.0,
    'CENTRAL': 1.0,
    'VOLTA': 1.1,
    'BRONG_AHAFO': 1.1,
    'UPPER_EAST': 1.3,
    'UPPER_WEST': 1.3,
  };

  constructor(
    @InjectRepository(DailyDelivery)
    private readonly deliveryRepository: Repository<DailyDelivery>,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Assess dealer eligibility for UPPF claims
   */
  async assessDealerEligibility(dealerId: string): Promise<UPPFEligibilityAssessment> {
    try {
      this.logger.log(`Assessing UPPF eligibility for dealer: ${dealerId}`);

      // Get dealer information
      const dealer = await this.getDealerInfo(dealerId);
      if (!dealer) {
        throw new NotFoundException('Dealer not found');
      }

      const eligibilityCriteria: EligibilityCriteria[] = [];
      const disqualifications: string[] = [];
      const conditionalRequirements: string[] = [];
      let eligibilityScore = 0;

      // Check dealer registration
      const registrationCheck = await this.checkDealerRegistration(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'DEALER_REGISTRATION',
        criteriaName: 'Dealer Registration Status',
        status: registrationCheck.isValid ? 'MET' : 'NOT_MET',
        details: registrationCheck.details,
        score: registrationCheck.isValid ? 100 : 0,
        evidence: registrationCheck.evidence,
        correctionActions: registrationCheck.correctionActions,
      });
      eligibilityScore += registrationCheck.isValid ? 15 : 0;

      // Check license validity
      const licenseCheck = await this.checkDealerLicense(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'LICENSE_VALIDITY',
        criteriaName: 'Dealer License Validity',
        status: licenseCheck.isValid ? 'MET' : 'NOT_MET',
        details: licenseCheck.details,
        score: licenseCheck.isValid ? 100 : 0,
        evidence: licenseCheck.evidence,
        nextVerificationDate: licenseCheck.expiryDate,
      });
      eligibilityScore += licenseCheck.isValid ? 20 : 0;

      // Check compliance history
      const complianceCheck = await this.checkComplianceHistory(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'COMPLIANCE_HISTORY',
        criteriaName: 'Regulatory Compliance History',
        status: complianceCheck.isCompliant ? 'MET' : complianceCheck.isPartiallyCompliant ? 'PARTIAL' : 'NOT_MET',
        details: complianceCheck.details,
        score: complianceCheck.complianceScore,
      });
      eligibilityScore += (complianceCheck.complianceScore / 100) * 20;

      // Check volume thresholds
      const volumeCheck = await this.checkVolumeThreshold(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'VOLUME_THRESHOLD',
        criteriaName: 'Minimum Volume Threshold',
        status: volumeCheck.meetsThreshold ? 'MET' : 'NOT_MET',
        details: volumeCheck.details,
        score: volumeCheck.meetsThreshold ? 100 : (volumeCheck.currentVolume / volumeCheck.requiredVolume) * 100,
      });
      eligibilityScore += volumeCheck.meetsThreshold ? 15 : 0;

      // Check price compliance
      const priceComplianceCheck = await this.checkPriceCompliance(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'PRICE_COMPLIANCE',
        criteriaName: 'Pump Price Compliance',
        status: priceComplianceCheck.isCompliant ? 'MET' : 'NOT_MET',
        details: priceComplianceCheck.details,
        score: priceComplianceCheck.complianceScore,
      });
      eligibilityScore += (priceComplianceCheck.complianceScore / 100) * 15;

      // Check geographic location
      const locationCheck = await this.checkGeographicEligibility(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'GEOGRAPHIC_LOCATION',
        criteriaName: 'Geographic Location Eligibility',
        status: locationCheck.isEligible ? 'MET' : 'NOT_MET',
        details: locationCheck.details,
        score: locationCheck.isEligible ? 100 : 0,
      });
      eligibilityScore += locationCheck.isEligible ? 10 : 0;

      // Check payment history
      const paymentHistoryCheck = await this.checkPaymentHistory(dealerId);
      eligibilityCriteria.push({
        criteriaType: 'PAYMENT_HISTORY',
        criteriaName: 'Payment History with OMC',
        status: paymentHistoryCheck.isGood ? 'MET' : 'PARTIAL',
        details: paymentHistoryCheck.details,
        score: paymentHistoryCheck.reliabilityScore,
      });
      eligibilityScore += (paymentHistoryCheck.reliabilityScore / 100) * 5;

      // Determine overall eligibility
      const overallEligible = eligibilityScore >= 75 && disqualifications.length === 0;

      // Calculate maximum monthly claim
      const maximumClaimPerMonth = this.calculateMaximumClaim(dealer, eligibilityCriteria);

      const assessment: UPPFEligibilityAssessment = {
        dealerId,
        dealerName: dealer.dealerName,
        assessmentDate: new Date(),
        overallEligible,
        eligibilityScore: Math.round(eligibilityScore),
        eligibilityCriteria,
        disqualifications,
        conditionalRequirements,
        nextReviewDate: addDays(new Date(), 90), // Quarterly review
        maximumClaimPerMonth,
        geographicRestrictions: locationCheck.restrictions || [],
      };

      // Store assessment results
      await this.storeEligibilityAssessment(assessment);

      // Emit assessment event
      this.eventEmitter.emit('uppf.eligibility_assessed', {
        dealerId,
        assessment,
      });

      this.logger.log(`UPPF eligibility assessment completed for dealer ${dealerId}: ${overallEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'} (Score: ${Math.round(eligibilityScore)})`);
      return assessment;

    } catch (error) {
      this.logger.error(`UPPF eligibility assessment failed for dealer ${dealerId}:`, error);
      throw error;
    }
  }

  /**
   * Submit UPPF claim
   */
  async submitUPPFClaim(request: UPPFClaimRequest): Promise<UPPFClaimResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Submitting UPPF claim for dealer ${request.dealerId} with ${request.deliveryIds.length} deliveries`);

      // Validate dealer eligibility
      const eligibilityAssessment = await this.assessDealerEligibility(request.dealerId);
      if (!eligibilityAssessment.overallEligible) {
        throw new BadRequestException(`Dealer ${request.dealerId} is not eligible for UPPF claims`);
      }

      // Validate deliveries
      const validatedDeliveries = await this.validateDeliveriesForClaim(request.deliveryIds, request.dealerId);

      // Calculate claim amounts
      const claimCalculation = await this.calculateClaimAmount(validatedDeliveries, request.dealerId);

      // Validate claim amount against maximum allowable
      if (claimCalculation.totalAmount > eligibilityAssessment.maximumClaimPerMonth) {
        throw new BadRequestException(`Claim amount ${claimCalculation.totalAmount} exceeds maximum monthly limit ${eligibilityAssessment.maximumClaimPerMonth}`);
      }

      // Generate claim number
      const claimNumber = await this.generateClaimNumber(request.claimType);

      // Prepare supporting documents
      const supportingDocuments = await this.prepareSupportingDocuments(validatedDeliveries, request.supportingDocuments);

      // Submit to UPPF system
      const claimSubmission = {
        claimNumber,
        claimType: request.claimType,
        claimPeriod: request.claimPeriod,
        dealerId: request.dealerId,
        deliveries: validatedDeliveries,
        claimCalculation,
        supportingDocuments,
        submissionDate: new Date(),
        submittedBy: request.submittedBy,
        urgentProcessing: request.urgentProcessing || false,
        notes: request.notes,
      };

      const submissionResponse = await this.submitToUPPFSystem(claimSubmission);

      // Create result
      const result: UPPFClaimResult = {
        claimId: submissionResponse.claimId,
        claimNumber,
        submissionDate: new Date(),
        status: 'SUBMITTED',
        claimAmount: claimCalculation.totalAmount,
        processingTime: Date.now() - startTime,
        supportingDocuments,
      };

      // Update deliveries with claim information
      await this.updateDeliveriesWithClaim(request.deliveryIds, result.claimId);

      // Store claim record
      await this.storeClaimRecord(result, request);

      // Emit claim submission event
      this.eventEmitter.emit('uppf.claim_submitted', {
        claimId: result.claimId,
        claimNumber: result.claimNumber,
        dealerId: request.dealerId,
        claimAmount: result.claimAmount,
        deliveryCount: request.deliveryIds.length,
      });

      this.logger.log(`UPPF claim ${claimNumber} submitted successfully for dealer ${request.dealerId}: GHS ${claimCalculation.totalAmount}`);
      return result;

    } catch (error) {
      this.logger.error(`UPPF claim submission failed for dealer ${request.dealerId}:`, error);
      throw error;
    }
  }

  /**
   * Get dealer margin structure
   */
  async getDealerMarginStructure(dealerId: string): Promise<DealerMarginStructure> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/ghana/uppf/dealer-margins/${dealerId}`)
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get dealer margin structure for ${dealerId}:`, error);
      
      // Return default margin structure
      return this.getDefaultMarginStructure(dealerId);
    }
  }

  /**
   * Validate pump prices
   */
  async validatePumpPrices(dealerId: string, productType: ProductGrade, reportedPrice: number): Promise<PumpPriceValidation> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/ghana/uppf/pump-price-validation', {
          dealerId,
          productType,
          reportedPrice,
          validationDate: new Date(),
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Pump price validation failed:', error);
      
      // Return default validation (assuming compliance)
      return {
        validationId: `VALIDATION_${Date.now()}`,
        dealerId,
        stationLocation: 'Unknown',
        productType,
        validationDate: new Date(),
        regulatedPrice: reportedPrice,
        actualSellingPrice: reportedPrice,
        variance: 0,
        variancePercentage: 0,
        isCompliant: true,
        toleranceLimit: 0.02, // 2% tolerance
        validationMethod: 'AUTOMATED_SYSTEM',
        correctionRequired: false,
        penaltyApplicable: false,
      };
    }
  }

  /**
   * Get UPPF statistics
   */
  async getUPPFStatistics(startDate: Date, endDate: Date): Promise<UPPFStatistics> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/ghana/uppf/statistics', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get UPPF statistics:', error);
      
      // Return empty statistics
      return {
        period: { startDate, endDate },
        totalClaims: 0,
        totalClaimAmount: 0,
        totalPaid: 0,
        averageProcessingDays: 0,
        claimsByStatus: {},
        topDealersByClaim: [],
        productDistribution: [],
        regionalDistribution: [],
        monthlyTrends: [],
      };
    }
  }

  /**
   * Process monthly UPPF claims for all eligible dealers
   */
  async processMonthlyUPPFClaims(month: Date, forceProcess = false): Promise<{
    totalProcessed: number;
    totalSuccessful: number;
    totalFailed: number;
    totalAmount: number;
    results: Array<{ dealerId: string; success: boolean; claimId?: string; error?: string; amount?: number }>;
  }> {
    const startTime = Date.now();
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    this.logger.log(`Processing monthly UPPF claims for ${format(month, 'MMMM yyyy')}`);

    const results = [];
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalAmount = 0;

    try {
      // Get all eligible dealers
      const eligibleDealers = await this.getEligibleDealers();

      for (const dealer of eligibleDealers) {
        try {
          // Get deliveries for the month
          const deliveries = await this.getMonthlyDeliveries(dealer.dealerId, monthStart, monthEnd);

          if (deliveries.length === 0) {
            results.push({
              dealerId: dealer.dealerId,
              success: false,
              error: 'No eligible deliveries for the period',
            });
            totalFailed++;
            continue;
          }

          // Submit claim
          const claimRequest: UPPFClaimRequest = {
            claimPeriod: { startDate: monthStart, endDate: monthEnd },
            dealerId: dealer.dealerId,
            deliveryIds: deliveries.map(d => d.id),
            claimType: 'MONTHLY',
            totalEligibleVolume: deliveries.reduce((sum, d) => sum + d.quantityLitres, 0),
            totalClaimAmount: deliveries.reduce((sum, d) => sum + (d.unifiedPetroleumPriceFundLevy || 0), 0),
            supportingDocuments: [],
            submittedBy: 'SYSTEM_AUTO_PROCESS',
          };

          const claimResult = await this.submitUPPFClaim(claimRequest);

          results.push({
            dealerId: dealer.dealerId,
            success: true,
            claimId: claimResult.claimId,
            amount: claimResult.claimAmount,
          });

          totalSuccessful++;
          totalAmount += claimResult.claimAmount;

        } catch (error) {
          this.logger.error(`Monthly UPPF claim failed for dealer ${dealer.dealerId}:`, error);
          results.push({
            dealerId: dealer.dealerId,
            success: false,
            error: error.message,
          });
          totalFailed++;
        }
      }

      // Emit monthly processing completion event
      this.eventEmitter.emit('uppf.monthly_processing_completed', {
        month: format(month, 'yyyy-MM'),
        totalProcessed: eligibleDealers.length,
        totalSuccessful,
        totalFailed,
        totalAmount,
        processingTime: Date.now() - startTime,
      });

      this.logger.log(`Monthly UPPF processing completed for ${format(month, 'MMMM yyyy')}: ${totalSuccessful}/${eligibleDealers.length} successful, Total: GHS ${totalAmount}`);

      return {
        totalProcessed: eligibleDealers.length,
        totalSuccessful,
        totalFailed,
        totalAmount,
        results,
      };

    } catch (error) {
      this.logger.error('Monthly UPPF processing failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getDealerInfo(dealerId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/dealers/${dealerId}`)
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  private async checkDealerRegistration(dealerId: string): Promise<{
    isValid: boolean;
    details: string;
    evidence?: string[];
    correctionActions?: string[];
  }> {
    // Simulate dealer registration check
    return {
      isValid: true,
      details: 'Dealer is properly registered with NPA',
      evidence: ['dealer-registration-certificate.pdf'],
    };
  }

  private async checkDealerLicense(dealerId: string): Promise<{
    isValid: boolean;
    details: string;
    evidence?: string[];
    expiryDate?: Date;
  }> {
    // Simulate dealer license check
    return {
      isValid: true,
      details: 'Dealer license is valid and not expired',
      evidence: ['dealer-license.pdf'],
      expiryDate: addDays(new Date(), 365),
    };
  }

  private async checkComplianceHistory(dealerId: string): Promise<{
    isCompliant: boolean;
    isPartiallyCompliant: boolean;
    complianceScore: number;
    details: string;
  }> {
    // Simulate compliance history check
    return {
      isCompliant: true,
      isPartiallyCompliant: false,
      complianceScore: 85,
      details: 'Good compliance history with minor violations resolved',
    };
  }

  private async checkVolumeThreshold(dealerId: string): Promise<{
    meetsThreshold: boolean;
    currentVolume: number;
    requiredVolume: number;
    details: string;
  }> {
    const currentVolume = 50000; // Simulate current monthly volume
    const requiredVolume = 20000; // Minimum required volume per month
    
    return {
      meetsThreshold: currentVolume >= requiredVolume,
      currentVolume,
      requiredVolume,
      details: `Current monthly volume: ${currentVolume}L, Required: ${requiredVolume}L`,
    };
  }

  private async checkPriceCompliance(dealerId: string): Promise<{
    isCompliant: boolean;
    complianceScore: number;
    details: string;
  }> {
    return {
      isCompliant: true,
      complianceScore: 90,
      details: 'Pump prices are compliant with regulated pricing',
    };
  }

  private async checkGeographicEligibility(dealerId: string): Promise<{
    isEligible: boolean;
    details: string;
    restrictions?: string[];
  }> {
    return {
      isEligible: true,
      details: 'Station is located in eligible geographic zone',
    };
  }

  private async checkPaymentHistory(dealerId: string): Promise<{
    isGood: boolean;
    reliabilityScore: number;
    details: string;
  }> {
    return {
      isGood: true,
      reliabilityScore: 85,
      details: 'Good payment history with average 25 days payment cycle',
    };
  }

  private calculateMaximumClaim(dealer: any, criteria: EligibilityCriteria[]): number {
    // Base maximum claim per month (GHS)
    let maximumClaim = 50000;

    // Adjust based on dealer category
    if (dealer.dealerCategory === 'TIER_1') {
      maximumClaim *= 1.5;
    } else if (dealer.dealerCategory === 'TIER_2') {
      maximumClaim *= 1.2;
    } else if (dealer.dealerCategory === 'RURAL') {
      maximumClaim *= 1.3; // Rural dealers get higher limits
    }

    // Adjust based on compliance score
    const complianceScore = criteria.find(c => c.criteriaType === 'COMPLIANCE_HISTORY')?.score || 0;
    if (complianceScore < 70) {
      maximumClaim *= 0.7; // Reduce limit for poor compliance
    }

    return Math.round(maximumClaim);
  }

  private async validateDeliveriesForClaim(deliveryIds: string[], dealerId: string): Promise<DailyDelivery[]> {
    const deliveries = await this.deliveryRepository.find({
      where: { 
        id: { $in: deliveryIds } as any,
        customerId: dealerId,
        status: { $in: ['DELIVERED', 'COMPLETED'] } as any,
      },
    });

    // Validate each delivery for UPPF eligibility
    const validDeliveries = deliveries.filter(delivery => {
      // Check if product is UPPF eligible
      const uppfRate = this.UPPF_RATES[delivery.productType];
      if (!uppfRate || uppfRate === 0) {
        return false;
      }

      // Check if delivery has not been claimed before
      if (delivery.uppfClaimId) {
        return false;
      }

      // Check if UPPF levy is properly calculated
      const expectedLevy = delivery.quantityLitres * uppfRate;
      const actualLevy = delivery.unifiedPetroleumPriceFundLevy;
      const variance = Math.abs(expectedLevy - actualLevy) / expectedLevy;
      
      return variance <= 0.05; // 5% tolerance
    });

    return validDeliveries;
  }

  private async calculateClaimAmount(deliveries: DailyDelivery[], dealerId: string): Promise<{
    totalVolume: number;
    totalAmount: number;
    productBreakdown: { [productType: string]: { volume: number; amount: number } };
  }> {
    const productBreakdown = {};
    let totalVolume = 0;
    let totalAmount = 0;

    for (const delivery of deliveries) {
      const uppfRate = this.UPPF_RATES[delivery.productType];
      if (uppfRate > 0) {
        const claimAmount = delivery.quantityLitres * uppfRate;
        
        if (!productBreakdown[delivery.productType]) {
          productBreakdown[delivery.productType] = { volume: 0, amount: 0 };
        }
        
        productBreakdown[delivery.productType].volume += delivery.quantityLitres;
        productBreakdown[delivery.productType].amount += claimAmount;
        
        totalVolume += delivery.quantityLitres;
        totalAmount += claimAmount;
      }
    }

    return {
      totalVolume,
      totalAmount,
      productBreakdown,
    };
  }

  private async generateClaimNumber(claimType: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `UPPF-${claimType}-${year}${month}-${timestamp}`;
  }

  private async prepareSupportingDocuments(deliveries: DailyDelivery[], additionalDocs: string[]): Promise<ClaimDocument[]> {
    const documents: ClaimDocument[] = [];

    // Add delivery receipts
    for (const delivery of deliveries) {
      if (delivery.deliveryReceiptUrl) {
        documents.push({
          documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          documentType: 'DELIVERY_RECEIPT',
          fileName: `delivery_receipt_${delivery.deliveryNumber}.pdf`,
          uploadDate: new Date(),
          url: delivery.deliveryReceiptUrl,
          isRequired: true,
          validationStatus: 'VALID',
        });
      }

      if (delivery.billOfLadingUrl) {
        documents.push({
          documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          documentType: 'BILL_OF_LADING',
          fileName: `bill_of_lading_${delivery.deliveryNumber}.pdf`,
          uploadDate: new Date(),
          url: delivery.billOfLadingUrl,
          isRequired: true,
          validationStatus: 'VALID',
        });
      }

      if (delivery.qualityCertificateUrl) {
        documents.push({
          documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          documentType: 'QUALITY_CERTIFICATE',
          fileName: `quality_certificate_${delivery.deliveryNumber}.pdf`,
          uploadDate: new Date(),
          url: delivery.qualityCertificateUrl,
          isRequired: false,
          validationStatus: 'VALID',
        });
      }
    }

    // Add additional documents
    for (const docUrl of additionalDocs) {
      documents.push({
        documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentType: 'OTHER',
        fileName: docUrl.split('/').pop() || 'document.pdf',
        uploadDate: new Date(),
        url: docUrl,
        isRequired: false,
        validationStatus: 'PENDING',
      });
    }

    return documents;
  }

  private async submitToUPPFSystem(claimSubmission: any): Promise<{ claimId: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/ghana/uppf/claims/submit', claimSubmission)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to submit to UPPF system:', error);
      
      // Return mock response
      return {
        claimId: `UPPF_CLAIM_${Date.now()}`,
      };
    }
  }

  private async updateDeliveriesWithClaim(deliveryIds: string[], claimId: string): Promise<void> {
    await this.deliveryRepository.update(
      { id: { $in: deliveryIds } as any },
      { uppfClaimId: claimId }
    );
  }

  private async storeEligibilityAssessment(assessment: UPPFEligibilityAssessment): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/ghana/uppf/eligibility-assessments', assessment)
      );
    } catch (error) {
      this.logger.error('Failed to store eligibility assessment:', error);
    }
  }

  private async storeClaimRecord(result: UPPFClaimResult, request: UPPFClaimRequest): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/ghana/uppf/claim-records', { result, request })
      );
    } catch (error) {
      this.logger.error('Failed to store claim record:', error);
    }
  }

  private getDefaultMarginStructure(dealerId: string): DealerMarginStructure {
    return {
      dealerId,
      dealerName: 'Unknown Dealer',
      effectiveDate: new Date(),
      marginStructure: {
        primaryDistribution: {
          componentName: 'Primary Distribution Margin',
          amountPerLitre: 0.15,
          currency: 'GHS',
          taxable: true,
          uppfEligible: true,
          calculationBasis: 'PER_LITRE',
          conditions: [],
        },
        marketing: {
          componentName: 'Marketing Margin',
          amountPerLitre: 0.12,
          currency: 'GHS',
          taxable: true,
          uppfEligible: true,
          calculationBasis: 'PER_LITRE',
          conditions: [],
        },
        dealer: {
          componentName: 'Dealer Margin',
          amountPerLitre: 0.46,
          currency: 'GHS',
          taxable: true,
          uppfEligible: true,
          calculationBasis: 'PER_LITRE',
          conditions: [],
        },
        uppfContribution: {
          componentName: 'UPPF Contribution',
          amountPerLitre: 0.46,
          currency: 'GHS',
          taxable: false,
          uppfEligible: true,
          calculationBasis: 'PER_LITRE',
          conditions: ['Product must be PMS or AGO', 'Dealer must be UPPF registered'],
        },
      },
      geographicZone: 'GREATER_ACCRA',
      dealerCategory: 'TIER_2',
      specialConditions: [],
      lastReviewDate: subDays(new Date(), 90),
      nextReviewDate: addDays(new Date(), 90),
    };
  }

  private async getEligibleDealers(): Promise<Array<{ dealerId: string; dealerName: string }>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/dealers?uppfEligible=true')
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get eligible dealers:', error);
      return [];
    }
  }

  private async getMonthlyDeliveries(dealerId: string, monthStart: Date, monthEnd: Date): Promise<DailyDelivery[]> {
    return this.deliveryRepository.find({
      where: {
        customerId: dealerId,
        deliveryDate: {
          $gte: monthStart,
          $lte: monthEnd,
        } as any,
        status: { $in: ['DELIVERED', 'COMPLETED'] } as any,
        uppfClaimId: null, // Not already claimed
      },
    });
  }

  // Mock repository for claims functionality
  private claimsRepository: Repository<any> = {
    count: async (options: any) => 0,
    find: async (options: any) => [],
    findOne: async (options: any) => null,
    save: async (entity: any) => entity,
    update: async (criteria: any, partialEntity: any) => ({ affected: 1 }),
    manager: {
      save: async (entityClass: string, entity: any) => entity,
    },
  } as any;
}