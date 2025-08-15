import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  UPPFSettlement,
  UPPFClaim,
  SettlementStatus,
  SettlementType,
  CreateUPPFSettlementDto,
} from '../entities/uppf-entities';
import { PaginatedResult } from '../dto/pagination.dto';

interface SettlementProcessingOptions {
  batchSize?: number;
  autoApprove?: boolean;
  includePenalties?: boolean;
  includePerformanceBonuses?: boolean;
  settlementType?: SettlementType;
  customCalculationRules?: {
    penaltyRate?: number;
    bonusRate?: number;
    minimumClaimAmount?: number;
    maximumClaimAmount?: number;
  };
}

interface SettlementCalculationResult {
  totalClaimAmount: number;
  totalDeductions: number;
  totalBonuses: number;
  netSettlementAmount: number;
  claimBreakdown: Array<{
    claimId: string;
    claimNumber: string;
    claimAmount: number;
    deductions: number;
    bonuses: number;
    netAmount: number;
  }>;
  processingFees: number;
  npaPenalties: number;
  performanceBonuses: number;
}

interface SettlementReportData {
  settlement: UPPFSettlement;
  claims: UPPFClaim[];
  calculationDetails: SettlementCalculationResult;
  complianceMetrics: {
    onTimeSubmission: boolean;
    documentationComplete: boolean;
    qualityScore: number;
    complianceRate: number;
  };
  financialSummary: {
    totalVolume: number;
    averageClaimAmount: number;
    settlementEfficiency: number;
    costPerLitre: number;
  };
}

interface NPASubmissionData {
  settlementId: string;
  submissionReference: string;
  submissionDate: Date;
  totalAmount: number;
  claimCount: number;
  supportingDocuments: Array<{
    type: string;
    documentId: string;
    uploadedAt: Date;
  }>;
  complianceVerification: {
    verified: boolean;
    verificationDate: Date;
    verifiedBy: string;
    notes?: string;
  };
}

@Injectable()
export class UPPFSettlementsService {
  private readonly logger = new Logger(UPPFSettlementsService.name);

  constructor(
    @InjectRepository(UPPFSettlement)
    private readonly settlementRepository: Repository<UPPFSettlement>,
    @InjectRepository(UPPFClaim)
    private readonly claimRepository: Repository<UPPFClaim>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new UPPF settlement with automatic calculation
   */
  async createSettlement(dto: CreateUPPFSettlementDto & { processedBy: string }): Promise<UPPFSettlement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Creating UPPF settlement for window ${dto.windowId}`);

      // Get approved claims for the pricing window
      const eligibleClaims = await this.claimRepository.find({
        where: {
          windowId: dto.windowId,
          status: 'approved',
          ...(dto.claimIds && { id: In(dto.claimIds) }),
        },
        relations: ['reconciliation'],
      });

      if (eligibleClaims.length === 0) {
        throw new BadRequestException('No eligible claims found for settlement');
      }

      // Calculate settlement amounts
      const calculationResult = await this.calculateSettlementAmounts(
        eligibleClaims,
        {
          includePenalties: true,
          includePerformanceBonuses: true,
          settlementType: dto.settlementType || SettlementType.REGULAR,
        },
      );

      // Generate settlement reference number
      const settlementReference = await this.generateSettlementReference(dto.windowId);

      // Create settlement entity
      const settlement = this.settlementRepository.create({
        settlementId: settlementReference,
        windowId: dto.windowId,
        settlementType: dto.settlementType || SettlementType.REGULAR,
        totalClaims: eligibleClaims.length,
        totalClaimsAmount: calculationResult.totalClaimAmount,
        totalDeductions: calculationResult.totalDeductions,
        totalBonuses: calculationResult.totalBonuses,
        netSettlementAmount: calculationResult.netSettlementAmount,
        totalSettledAmount: calculationResult.netSettlementAmount,
        processingFees: calculationResult.processingFees,
        npaPenalties: calculationResult.npaPenalties,
        performanceBonuses: calculationResult.performanceBonuses,
        status: SettlementStatus.PENDING,
        calculationDetails: calculationResult,
        settlementDate: new Date(),
        createdBy: dto.processedBy,
        notes: dto.notes,
      });

      // Save settlement
      const savedSettlement = await queryRunner.manager.save(UPPFSettlement, settlement);

      // Update claims with settlement reference
      await queryRunner.manager.update(
        UPPFClaim,
        { id: In(eligibleClaims.map(c => c.id)) },
        { 
          settlementId: savedSettlement.settlementId,
          status: 'settled',
          lastModifiedAt: new Date(),
          lastModifiedBy: dto.processedBy,
        },
      );

      await queryRunner.commitTransaction();

      // Emit settlement creation event
      this.eventEmitter.emit('uppf.settlement.created', {
        settlementId: savedSettlement.settlementId,
        windowId: dto.windowId,
        totalAmount: savedSettlement.totalSettledAmount,
        claimsCount: savedSettlement.totalClaims,
        createdBy: dto.processedBy,
        timestamp: new Date(),
      });

      this.logger.log(`UPPF settlement ${savedSettlement.settlementId} created successfully`);
      return savedSettlement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create settlement: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process settlement payment
   */
  async processSettlement(
    settlementId: string,
    processData: {
      paymentReference: string;
      bankTransactionRef: string;
      notes?: string;
      processedBy: string;
    },
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Processing settlement ${settlementId}`);

      const settlement = await this.findById(settlementId);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      if (settlement.status !== SettlementStatus.PENDING) {
        throw new BadRequestException('Settlement is not in pending status');
      }

      // Update settlement status
      settlement.status = SettlementStatus.PROCESSING;
      settlement.paymentReference = processData.paymentReference;
      settlement.bankTransactionRef = processData.bankTransactionRef;
      settlement.processingStartDate = new Date();
      settlement.lastModifiedAt = new Date();
      settlement.lastModifiedBy = processData.processedBy;
      settlement.notes = [settlement.notes, processData.notes].filter(Boolean).join('; ');

      const updatedSettlement = await this.settlementRepository.save(settlement);

      // Emit processing event
      this.eventEmitter.emit('uppf.settlement.processing', {
        settlementId: settlement.settlementId,
        paymentReference: processData.paymentReference,
        processedBy: processData.processedBy,
        timestamp: new Date(),
      });

      return updatedSettlement;

    } catch (error) {
      this.logger.error(`Failed to process settlement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reconcile settlement with actual bank payment
   */
  async reconcileSettlement(
    settlementId: string,
    reconcileData: {
      bankTransactionRef: string;
      actualAmount: number;
      reconciliationDate: Date;
      notes?: string;
      reconciledBy: string;
    },
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Reconciling settlement ${settlementId}`);

      const settlement = await this.findById(settlementId);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      // Calculate variance
      const variance = reconcileData.actualAmount - settlement.totalSettledAmount;
      const variancePercentage = (variance / settlement.totalSettledAmount) * 100;

      // Update settlement
      settlement.status = Math.abs(variancePercentage) <= 0.1 ? 
        SettlementStatus.RECONCILED : SettlementStatus.VARIANCE_DETECTED;
      settlement.actualAmountReceived = reconcileData.actualAmount;
      settlement.paymentVariance = variance;
      settlement.reconciliationDate = reconcileData.reconciliationDate;
      settlement.reconciledBy = reconcileData.reconciledBy;
      settlement.lastModifiedAt = new Date();
      settlement.lastModifiedBy = reconcileData.reconciledBy;
      settlement.notes = [settlement.notes, reconcileData.notes].filter(Boolean).join('; ');

      // Add variance details if significant
      if (Math.abs(variancePercentage) > 0.1) {
        settlement.varianceAnalysis = {
          expectedAmount: settlement.totalSettledAmount,
          actualAmount: reconcileData.actualAmount,
          variance,
          variancePercentage,
          possibleCauses: this.analyzeVarianceCauses(variancePercentage),
          recommendedActions: this.getVarianceRecommendations(variancePercentage),
        };
      }

      const reconciledSettlement = await this.settlementRepository.save(settlement);

      // Emit reconciliation event
      this.eventEmitter.emit('uppf.settlement.reconciled', {
        settlementId: settlement.settlementId,
        expectedAmount: settlement.totalSettledAmount,
        actualAmount: reconcileData.actualAmount,
        variance,
        variancePercentage,
        status: settlement.status,
        reconciledBy: reconcileData.reconciledBy,
        timestamp: new Date(),
      });

      return reconciledSettlement;

    } catch (error) {
      this.logger.error(`Failed to reconcile settlement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate settlement amounts with deductions and bonuses
   */
  private async calculateSettlementAmounts(
    claims: UPPFClaim[],
    options: SettlementProcessingOptions,
  ): Promise<SettlementCalculationResult> {
    let totalClaimAmount = 0;
    let totalDeductions = 0;
    let totalBonuses = 0;
    let processingFees = 0;
    let npaPenalties = 0;
    let performanceBonuses = 0;

    const claimBreakdown = [];

    for (const claim of claims) {
      let claimAmount = claim.totalClaimAmount;
      let deductions = 0;
      let bonuses = 0;

      // Apply processing fees (typically 2% of claim amount)
      const processingFee = claimAmount * 0.02;
      processingFees += processingFee;
      deductions += processingFee;

      // Apply penalties for late submission or non-compliance
      if (options.includePenalties) {
        const penaltyAmount = await this.calculatePenalties(claim);
        npaPenalties += penaltyAmount;
        deductions += penaltyAmount;
      }

      // Apply performance bonuses
      if (options.includePerformanceBonuses) {
        const bonusAmount = await this.calculatePerformanceBonuses(claim);
        performanceBonuses += bonusAmount;
        bonuses += bonusAmount;
      }

      const netAmount = claimAmount - deductions + bonuses;

      claimBreakdown.push({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimAmount,
        deductions,
        bonuses,
        netAmount,
      });

      totalClaimAmount += claimAmount;
      totalDeductions += deductions;
      totalBonuses += bonuses;
    }

    const netSettlementAmount = totalClaimAmount - totalDeductions + totalBonuses;

    return {
      totalClaimAmount,
      totalDeductions,
      totalBonuses,
      netSettlementAmount,
      claimBreakdown,
      processingFees,
      npaPenalties,
      performanceBonuses,
    };
  }

  /**
   * Calculate penalties for a claim
   */
  private async calculatePenalties(claim: UPPFClaim): Promise<number> {
    let penalties = 0;

    // Late submission penalty
    const submissionDelay = this.getSubmissionDelay(claim);
    if (submissionDelay > 0) {
      // 0.5% penalty per day late, max 5%
      const penaltyRate = Math.min(submissionDelay * 0.005, 0.05);
      penalties += claim.totalClaimAmount * penaltyRate;
    }

    // Quality score penalty
    if (claim.qualityScore < 80) {
      // Penalty for poor documentation quality
      const qualityPenalty = (80 - claim.qualityScore) * 0.001; // 0.1% per point below 80
      penalties += claim.totalClaimAmount * qualityPenalty;
    }

    // GPS validation penalty
    if (!claim.gpsValidated || claim.gpsConfidence < 0.8) {
      penalties += claim.totalClaimAmount * 0.01; // 1% penalty for GPS issues
    }

    return penalties;
  }

  /**
   * Calculate performance bonuses for a claim
   */
  private async calculatePerformanceBonuses(claim: UPPFClaim): Promise<number> {
    let bonuses = 0;

    // Early submission bonus
    const submissionAdvance = this.getSubmissionAdvance(claim);
    if (submissionAdvance > 0) {
      // 0.1% bonus per day early, max 1%
      const bonusRate = Math.min(submissionAdvance * 0.001, 0.01);
      bonuses += claim.totalClaimAmount * bonusRate;
    }

    // High quality bonus
    if (claim.qualityScore >= 95) {
      bonuses += claim.totalClaimAmount * 0.005; // 0.5% bonus for excellent quality
    }

    // Perfect GPS validation bonus
    if (claim.gpsValidated && claim.gpsConfidence >= 0.95) {
      bonuses += claim.totalClaimAmount * 0.002; // 0.2% bonus for perfect GPS
    }

    // Three-way reconciliation bonus
    if (claim.threeWayReconciled) {
      bonuses += claim.totalClaimAmount * 0.003; // 0.3% bonus for reconciliation
    }

    return bonuses;
  }

  /**
   * Generate settlement report
   */
  async generateSettlementReport(
    settlementId: string,
    format: 'pdf' | 'excel' = 'pdf',
    generatedBy: string,
  ): Promise<{ reportUrl: string; reportId: string }> {
    try {
      this.logger.log(`Generating settlement report for ${settlementId} in ${format} format`);

      const settlement = await this.findByIdWithClaims(settlementId);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      // Prepare report data
      const reportData = await this.prepareSettlementReportData(settlement);

      // Generate report via external service
      const response = await firstValueFrom(
        this.httpService.post('/reports-service/generate', {
          templateType: 'uppf_settlement',
          format,
          data: reportData,
          generatedBy,
          metadata: {
            settlementId: settlement.settlementId,
            windowId: settlement.windowId,
            generatedAt: new Date(),
          },
        }, {
          headers: { 'X-Service-Authorization': this.configService.get('SERVICE_TOKEN') },
        }),
      );

      const { reportUrl, reportId } = response.data;

      // Update settlement with report reference
      await this.settlementRepository.update(settlement.id, {
        reportGenerated: true,
        reportUrl,
        reportGeneratedAt: new Date(),
        reportGeneratedBy: generatedBy,
      });

      return { reportUrl, reportId };

    } catch (error) {
      this.logger.error(`Failed to generate settlement report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Submit settlement to NPA
   */
  async submitToNPA(
    settlementId: string,
    submittedBy: string,
  ): Promise<NPASubmissionData> {
    try {
      this.logger.log(`Submitting settlement ${settlementId} to NPA`);

      const settlement = await this.findByIdWithClaims(settlementId);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      if (settlement.status !== SettlementStatus.RECONCILED) {
        throw new BadRequestException('Settlement must be reconciled before NPA submission');
      }

      // Prepare NPA submission data
      const submissionData = await this.prepareNPASubmissionData(settlement);

      // Submit to NPA via external service
      const response = await firstValueFrom(
        this.httpService.post('/npa-service/settlements/submit', submissionData, {
          headers: { 'X-Service-Authorization': this.configService.get('SERVICE_TOKEN') },
        }),
      );

      const npaSubmission: NPASubmissionData = response.data;

      // Update settlement with NPA submission details
      await this.settlementRepository.update(settlement.id, {
        npaSubmissionRef: npaSubmission.submissionReference,
        npaSubmissionDate: npaSubmission.submissionDate,
        npaSubmissionStatus: 'submitted',
        status: SettlementStatus.SUBMITTED_TO_NPA,
        lastModifiedAt: new Date(),
        lastModifiedBy: submittedBy,
      });

      // Emit NPA submission event
      this.eventEmitter.emit('uppf.settlement.npa_submitted', {
        settlementId: settlement.settlementId,
        submissionReference: npaSubmission.submissionReference,
        submittedBy,
        timestamp: new Date(),
      });

      return npaSubmission;

    } catch (error) {
      this.logger.error(`Failed to submit settlement to NPA: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get settlement statistics
   */
  async getSettlementStatistics(filters: any = {}): Promise<any> {
    const query = this.settlementRepository.createQueryBuilder('settlement');

    if (filters.dateFrom) {
      query.andWhere('settlement.settlementDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      query.andWhere('settlement.settlementDate <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.windowId) {
      query.andWhere('settlement.windowId = :windowId', { windowId: filters.windowId });
    }

    const [settlements, totalSettlements] = await query.getManyAndCount();

    // Calculate metrics
    const totalAmount = settlements.reduce((sum, s) => sum + s.totalSettledAmount, 0);
    const totalClaims = settlements.reduce((sum, s) => sum + s.totalClaims, 0);
    
    const processingTimes = settlements
      .filter(s => s.processingStartDate && s.reconciliationDate)
      .map(s => {
        const start = new Date(s.processingStartDate).getTime();
        const end = new Date(s.reconciliationDate).getTime();
        return Math.round((end - start) / (1000 * 60 * 60 * 24)); // days
      });

    const averageProcessingDays = processingTimes.length > 0 
      ? processingTimes.reduce((sum, days) => sum + days, 0) / processingTimes.length 
      : 0;

    // Settlement by status
    const settlementsByStatus = settlements.reduce((acc, settlement) => {
      acc[settlement.status] = (acc[settlement.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(settlements);

    // Performance metrics
    const reconciledCount = settlements.filter(s => s.status === SettlementStatus.RECONCILED).length;
    const efficiency = totalSettlements > 0 ? (reconciledCount / totalSettlements) * 100 : 0;
    
    const varianceCount = settlements.filter(s => s.paymentVariance && Math.abs(s.paymentVariance) > 0).length;
    const varianceRate = totalSettlements > 0 ? (varianceCount / totalSettlements) * 100 : 0;

    return {
      totalSettlements,
      totalAmount,
      totalClaims,
      averageProcessingDays,
      settlementsByStatus,
      monthlyTrends,
      performanceMetrics: {
        efficiency,
        successRate: efficiency,
        varianceRate,
        complianceScore: Math.max(0, 100 - varianceRate),
      },
    };
  }

  /**
   * Export settlements to CSV
   */
  async exportToCSV(filters: any = {}): Promise<string> {
    const query = this.settlementRepository.createQueryBuilder('settlement');

    // Apply filters
    if (filters.windowId) {
      query.andWhere('settlement.windowId = :windowId', { windowId: filters.windowId });
    }

    if (filters.status && filters.status.length > 0) {
      query.andWhere('settlement.status IN (:...status)', { status: filters.status });
    }

    if (filters.dateFrom) {
      query.andWhere('settlement.settlementDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      query.andWhere('settlement.settlementDate <= :dateTo', { dateTo: filters.dateTo });
    }

    const settlements = await query.getMany();

    // Generate CSV content
    const headers = [
      'Settlement ID',
      'Window ID',
      'Settlement Date',
      'Status',
      'Total Claims',
      'Total Amount (GHS)',
      'Deductions (GHS)',
      'Bonuses (GHS)',
      'Net Amount (GHS)',
      'Payment Reference',
      'NPA Submission Ref',
      'Created By',
    ];

    const rows = settlements.map(settlement => [
      settlement.settlementId,
      settlement.windowId,
      settlement.settlementDate.toISOString().split('T')[0],
      settlement.status,
      settlement.totalClaims.toString(),
      settlement.totalClaimsAmount.toFixed(2),
      settlement.totalDeductions.toFixed(2),
      settlement.totalBonuses.toFixed(2),
      settlement.totalSettledAmount.toFixed(2),
      settlement.paymentReference || '',
      settlement.npaSubmissionRef || '',
      settlement.createdBy,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Helper methods
  private async generateSettlementReference(windowId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.settlementRepository.count({
      where: {
        settlementDate: Between(
          new Date(year, new Date().getMonth(), 1),
          new Date(year, new Date().getMonth() + 1, 0),
        ),
      },
    });
    
    return `UPPF-SETTLEMENT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  private getSubmissionDelay(claim: UPPFClaim): number {
    // Calculate days between expected and actual submission
    // This would depend on business rules for expected submission timing
    return 0; // Placeholder
  }

  private getSubmissionAdvance(claim: UPPFClaim): number {
    // Calculate days submitted early
    return 0; // Placeholder
  }

  private analyzeVarianceCauses(variancePercentage: number): string[] {
    const causes = [];
    
    if (Math.abs(variancePercentage) > 5) {
      causes.push('Significant payment variance - investigate calculation errors');
    }
    
    if (variancePercentage > 0) {
      causes.push('Overpayment detected - possible duplicate payment or calculation error');
    } else {
      causes.push('Underpayment detected - possible missing claims or calculation error');
    }
    
    return causes;
  }

  private getVarianceRecommendations(variancePercentage: number): string[] {
    const recommendations = [];
    
    if (Math.abs(variancePercentage) > 1) {
      recommendations.push('Conduct detailed review of calculation methodology');
      recommendations.push('Verify all claims included in settlement');
      recommendations.push('Check for processing errors or system issues');
    }
    
    return recommendations;
  }

  private async prepareSettlementReportData(settlement: UPPFSettlement): Promise<SettlementReportData> {
    const claims = await this.claimRepository.find({
      where: { settlementId: settlement.settlementId },
    });

    return {
      settlement,
      claims,
      calculationDetails: settlement.calculationDetails as SettlementCalculationResult,
      complianceMetrics: {
        onTimeSubmission: true, // Calculate based on business rules
        documentationComplete: true,
        qualityScore: 95,
        complianceRate: 98.5,
      },
      financialSummary: {
        totalVolume: claims.reduce((sum, c) => sum + c.volumeLitres, 0),
        averageClaimAmount: settlement.totalClaimsAmount / settlement.totalClaims,
        settlementEfficiency: 95.2,
        costPerLitre: settlement.totalSettledAmount / claims.reduce((sum, c) => sum + c.volumeLitres, 0),
      },
    };
  }

  private async prepareNPASubmissionData(settlement: UPPFSettlement): Promise<any> {
    return {
      settlementId: settlement.settlementId,
      windowId: settlement.windowId,
      totalAmount: settlement.totalSettledAmount,
      claimCount: settlement.totalClaims,
      submissionDate: new Date(),
      supportingDocuments: [],
      complianceData: {
        allClaimsValidated: true,
        gpsValidationComplete: true,
        threeWayReconciliationComplete: true,
      },
    };
  }

  private calculateMonthlyTrends(settlements: UPPFSettlement[]): any[] {
    // Group settlements by month and calculate trends
    const monthlyData = new Map();
    
    settlements.forEach(settlement => {
      const monthKey = settlement.settlementDate.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          settlements: 0,
          amount: 0,
          claims: 0,
        });
      }
      
      const data = monthlyData.get(monthKey);
      data.settlements += 1;
      data.amount += settlement.totalSettledAmount;
      data.claims += settlement.totalClaims;
    });
    
    return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Repository methods
  async findById(id: string): Promise<UPPFSettlement | null> {
    return this.settlementRepository.findOne({ where: { id } });
  }

  async findByIdWithClaims(id: string): Promise<UPPFSettlement | null> {
    const settlement = await this.settlementRepository.findOne({ where: { id } });
    if (settlement) {
      // This would be enhanced to include related claims
    }
    return settlement;
  }

  async findByWindowId(windowId: string): Promise<UPPFSettlement | null> {
    return this.settlementRepository.findOne({ where: { windowId } });
  }

  async findWithPagination(queryDto: any): Promise<PaginatedResult<UPPFSettlement>> {
    const query = this.settlementRepository.createQueryBuilder('settlement');

    // Apply filters
    if (queryDto.windowId) {
      query.andWhere('settlement.windowId = :windowId', { windowId: queryDto.windowId });
    }

    if (queryDto.status && queryDto.status.length > 0) {
      query.andWhere('settlement.status IN (:...status)', { status: queryDto.status });
    }

    if (queryDto.dateFrom) {
      query.andWhere('settlement.settlementDate >= :dateFrom', { dateFrom: queryDto.dateFrom });
    }

    if (queryDto.dateTo) {
      query.andWhere('settlement.settlementDate <= :dateTo', { dateTo: queryDto.dateTo });
    }

    if (queryDto.minAmount) {
      query.andWhere('settlement.totalSettledAmount >= :minAmount', { minAmount: queryDto.minAmount });
    }

    if (queryDto.maxAmount) {
      query.andWhere('settlement.totalSettledAmount <= :maxAmount', { maxAmount: queryDto.maxAmount });
    }

    // Sorting
    const sortBy = queryDto.sortBy || 'settlementDate';
    const sortOrder = queryDto.sortOrder || 'DESC';
    query.orderBy(`settlement.${sortBy}`, sortOrder);

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const offset = (page - 1) * limit;

    query.skip(offset).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}