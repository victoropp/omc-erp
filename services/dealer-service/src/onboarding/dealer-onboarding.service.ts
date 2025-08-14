import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { CreateDealerDto, ApproveDealerDto, DealerCreditAssessmentDto, DealerResponseDto } from '../dto/dealer-onboarding.dto';

export enum DealerStatus {
  PENDING_DOCUMENTS = 'pending_documents',
  UNDER_REVIEW = 'under_review',
  CREDIT_ASSESSMENT = 'credit_assessment',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  REJECTED = 'rejected',
}

export interface DealerProfile {
  id: string;
  dealerCode: string;
  stationId: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: Date;
  status: DealerStatus;
  contactInfo: any;
  address: any;
  bankAccount: any;
  businessInfo?: any;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  creditLimit: number;
  outstandingBalance: number;
  riskRating?: string;
  onboardingProgress: {
    documentsSubmitted: boolean;
    documentsVerified: boolean;
    creditAssessmentCompleted: boolean;
    approvalCompleted: boolean;
    activationCompleted: boolean;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DealerOnboardingService {
  private readonly logger = new Logger(DealerOnboardingService.name);

  constructor(
    // We'll use a simple repository pattern for now
    // @InjectRepository(DealerProfile)
    // private readonly dealerRepository: Repository<DealerProfile>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create new dealer profile and initiate onboarding process
   */
  async createDealerProfile(
    createDealerDto: CreateDealerDto,
    tenantId: string,
    createdBy?: string,
  ): Promise<DealerProfile> {
    this.logger.log(`Creating dealer profile for station ${createDealerDto.stationId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if dealer already exists for this station
      const existingDealer = await this.findDealerByStation(createDealerDto.stationId, tenantId);
      if (existingDealer && existingDealer.status !== DealerStatus.REJECTED) {
        throw new ConflictException('Active dealer already exists for this station');
      }

      // Check for duplicate national ID
      const duplicateNationalId = await this.findDealerByNationalId(createDealerDto.nationalId, tenantId);
      if (duplicateNationalId) {
        throw new ConflictException('Dealer with this National ID already exists');
      }

      // Generate dealer code
      const dealerCode = await this.generateDealerCode(createDealerDto.stationId);

      // Create dealer profile
      const dealerProfile: DealerProfile = {
        id: uuidv4(),
        dealerCode,
        stationId: createDealerDto.stationId,
        firstName: createDealerDto.firstName,
        lastName: createDealerDto.lastName,
        nationalId: createDealerDto.nationalId,
        dateOfBirth: new Date(createDealerDto.dateOfBirth),
        status: DealerStatus.PENDING_DOCUMENTS,
        contactInfo: createDealerDto.contactInfo,
        address: createDealerDto.address,
        bankAccount: createDealerDto.bankAccount,
        businessInfo: createDealerDto.businessInfo,
        emergencyContact: {
          name: createDealerDto.emergencyContactName,
          phone: createDealerDto.emergencyContactPhone,
          relationship: createDealerDto.emergencyContactRelationship,
        },
        creditLimit: 0,
        outstandingBalance: 0,
        onboardingProgress: {
          documentsSubmitted: false,
          documentsVerified: false,
          creditAssessmentCompleted: false,
          approvalCompleted: false,
          activationCompleted: false,
        },
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database (simulated)
      await this.saveDealerProfile(dealerProfile, queryRunner);

      // Create initial credit assessment record
      await this.initiateCreditAssessment(dealerProfile.id, createDealerDto, tenantId);

      await queryRunner.commitTransaction();

      // Emit events
      this.eventEmitter.emit('dealer.profile-created', {
        dealerId: dealerProfile.id,
        dealerCode: dealerProfile.dealerCode,
        stationId: dealerProfile.stationId,
        tenantId,
      });

      this.eventEmitter.emit('dealer.documents-required', {
        dealerId: dealerProfile.id,
        requiredDocuments: this.getRequiredDocuments(),
        tenantId,
      });

      this.logger.log(`Dealer profile created: ${dealerProfile.dealerCode}`);
      return dealerProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Submit required documents for verification
   */
  async submitDocuments(
    dealerId: string,
    documents: Array<{ type: string; url: string; description?: string }>,
    tenantId: string,
    submittedBy?: string,
  ): Promise<void> {
    this.logger.log(`Submitting documents for dealer ${dealerId}`);

    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    if (dealer.status !== DealerStatus.PENDING_DOCUMENTS) {
      throw new BadRequestException('Dealer is not in pending documents status');
    }

    // Validate required documents
    const requiredDocs = this.getRequiredDocuments();
    const submittedTypes = documents.map(d => d.type);
    const missingDocs = requiredDocs.filter(req => !submittedTypes.includes(req.type));

    if (missingDocs.length > 0) {
      throw new BadRequestException(`Missing required documents: ${missingDocs.map(d => d.type).join(', ')}`);
    }

    // Update dealer status and documents
    dealer.status = DealerStatus.UNDER_REVIEW;
    dealer.onboardingProgress.documentsSubmitted = true;
    dealer.updatedAt = new Date();

    await this.saveDealerProfile(dealer);

    // Store documents (simulated)
    await this.storeDocuments(dealerId, documents, tenantId);

    // Emit events
    this.eventEmitter.emit('dealer.documents-submitted', {
      dealerId,
      documents: documents.map(d => d.type),
      tenantId,
    });

    this.eventEmitter.emit('dealer.verification-required', {
      dealerId,
      documents,
      tenantId,
    });
  }

  /**
   * Verify submitted documents
   */
  async verifyDocuments(
    dealerId: string,
    verificationResults: Array<{ type: string; verified: boolean; notes?: string }>,
    tenantId: string,
    verifiedBy?: string,
  ): Promise<void> {
    this.logger.log(`Verifying documents for dealer ${dealerId}`);

    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    if (dealer.status !== DealerStatus.UNDER_REVIEW) {
      throw new BadRequestException('Dealer is not under review');
    }

    const allVerified = verificationResults.every(result => result.verified);
    const failedVerifications = verificationResults.filter(result => !result.verified);

    if (allVerified) {
      // All documents verified - proceed to credit assessment
      dealer.status = DealerStatus.CREDIT_ASSESSMENT;
      dealer.onboardingProgress.documentsVerified = true;
      dealer.updatedAt = new Date();

      await this.saveDealerProfile(dealer);

      // Trigger automated credit assessment
      await this.performCreditAssessment(dealerId, tenantId);

      this.eventEmitter.emit('dealer.documents-verified', {
        dealerId,
        tenantId,
      });
    } else {
      // Some documents failed verification
      dealer.status = DealerStatus.PENDING_DOCUMENTS;
      dealer.onboardingProgress.documentsSubmitted = false;
      dealer.updatedAt = new Date();

      await this.saveDealerProfile(dealer);

      this.eventEmitter.emit('dealer.documents-rejected', {
        dealerId,
        failedDocuments: failedVerifications,
        tenantId,
      });
    }
  }

  /**
   * Perform automated credit assessment
   */
  async performCreditAssessment(dealerId: string, tenantId: string): Promise<DealerCreditAssessmentDto> {
    this.logger.log(`Performing credit assessment for dealer ${dealerId}`);

    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // AI-powered credit scoring algorithm
    const creditAssessment = await this.calculateCreditScore(dealer);

    // Update dealer with assessment results
    dealer.riskRating = creditAssessment.riskRating;
    dealer.creditLimit = creditAssessment.recommendedCreditLimit;
    dealer.status = DealerStatus.PENDING_APPROVAL;
    dealer.onboardingProgress.creditAssessmentCompleted = true;
    dealer.updatedAt = new Date();

    await this.saveDealerProfile(dealer);

    // Save detailed assessment
    await this.saveCreditAssessment(dealerId, creditAssessment, tenantId);

    this.eventEmitter.emit('dealer.credit-assessment-completed', {
      dealerId,
      creditScore: creditAssessment.creditScore,
      recommendedCreditLimit: creditAssessment.recommendedCreditLimit,
      riskRating: creditAssessment.riskRating,
      tenantId,
    });

    return creditAssessment;
  }

  /**
   * Approve or reject dealer application
   */
  async approveDealer(
    dealerId: string,
    approvalDto: ApproveDealerDto,
    tenantId: string,
    approvedBy?: string,
  ): Promise<DealerProfile> {
    this.logger.log(`Processing approval for dealer ${dealerId}: ${approvalDto.approved ? 'APPROVED' : 'REJECTED'}`);

    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    if (dealer.status !== DealerStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Dealer is not pending approval');
    }

    if (approvalDto.approved) {
      // Approve dealer
      dealer.status = DealerStatus.APPROVED;
      dealer.creditLimit = approvalDto.approvedCreditLimit || dealer.creditLimit;
      dealer.onboardingProgress.approvalCompleted = true;
    } else {
      // Reject dealer
      dealer.status = DealerStatus.REJECTED;
    }

    dealer.updatedAt = new Date();
    await this.saveDealerProfile(dealer);

    // Save approval record
    await this.saveApprovalRecord(dealerId, approvalDto, approvedBy, tenantId);

    if (approvalDto.approved) {
      // Activate dealer account
      await this.activateDealer(dealerId, tenantId);

      this.eventEmitter.emit('dealer.approved', {
        dealerId,
        creditLimit: dealer.creditLimit,
        tenantId,
      });
    } else {
      this.eventEmitter.emit('dealer.rejected', {
        dealerId,
        reason: approvalDto.approvalNotes,
        tenantId,
      });
    }

    return dealer;
  }

  /**
   * Activate approved dealer
   */
  async activateDealer(dealerId: string, tenantId: string): Promise<DealerProfile> {
    this.logger.log(`Activating dealer ${dealerId}`);

    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    if (dealer.status !== DealerStatus.APPROVED) {
      throw new BadRequestException('Dealer must be approved before activation');
    }

    dealer.status = DealerStatus.ACTIVE;
    dealer.onboardingProgress.activationCompleted = true;
    dealer.updatedAt = new Date();

    await this.saveDealerProfile(dealer);

    // Setup dealer accounts in GL
    await this.setupDealerAccounts(dealer);

    // Create initial margin accrual setup
    await this.setupMarginAccruals(dealer);

    this.eventEmitter.emit('dealer.activated', {
      dealerId,
      dealerCode: dealer.dealerCode,
      stationId: dealer.stationId,
      creditLimit: dealer.creditLimit,
      tenantId,
    });

    this.logger.log(`Dealer activated successfully: ${dealer.dealerCode}`);
    return dealer;
  }

  /**
   * Get dealer by ID
   */
  async getDealerById(dealerId: string, tenantId: string): Promise<DealerResponseDto> {
    const dealer = await this.findDealerById(dealerId, tenantId);
    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    return this.mapToResponseDto(dealer);
  }

  /**
   * List dealers with filtering and pagination
   */
  async listDealers(
    tenantId: string,
    filters?: {
      status?: DealerStatus;
      stationId?: string;
      riskRating?: string;
    },
    pagination?: { page: number; limit: number },
  ): Promise<{ dealers: DealerResponseDto[]; total: number }> {
    // Implementation would query database with filters and pagination
    const dealers = await this.findDealersWithFilters(tenantId, filters, pagination);
    const total = await this.countDealersWithFilters(tenantId, filters);

    return {
      dealers: dealers.map(dealer => this.mapToResponseDto(dealer)),
      total,
    };
  }

  // Private helper methods
  private async generateDealerCode(stationId: string): Promise<string> {
    // Generate unique dealer code: D-{STATION_CODE}-{SEQUENCE}
    const stationCode = stationId.substring(0, 6).toUpperCase();
    const sequence = String(Date.now()).slice(-4);
    return `D-${stationCode}-${sequence}`;
  }

  private getRequiredDocuments() {
    return [
      { type: 'national_id', description: 'National ID Card' },
      { type: 'birth_certificate', description: 'Birth Certificate' },
      { type: 'bank_statement', description: 'Bank Statement (last 3 months)' },
      { type: 'passport_photo', description: 'Passport Photographs' },
      { type: 'guarantor_id', description: 'Guarantor National ID' },
      { type: 'business_registration', description: 'Business Registration Certificate' },
      { type: 'tax_clearance', description: 'Tax Clearance Certificate' },
    ];
  }

  private async calculateCreditScore(dealer: DealerProfile): Promise<DealerCreditAssessmentDto> {
    // AI-powered credit scoring algorithm
    let baseScore = 600; // Base credit score

    // Factors affecting credit score:
    // 1. Business information completeness
    if (dealer.businessInfo) {
      baseScore += 50;
    }

    // 2. Expected sales volume
    const expectedSales = dealer.businessInfo?.expectedMonthlySales || 0;
    if (expectedSales > 50000) baseScore += 40;
    else if (expectedSales > 20000) baseScore += 20;

    // 3. Previous experience
    const experience = dealer.businessInfo?.previousExperience || 0;
    baseScore += Math.min(experience * 10, 100);

    // 4. Age factor (mature applicants get bonus)
    const age = new Date().getFullYear() - dealer.dateOfBirth.getFullYear();
    if (age >= 30 && age <= 55) baseScore += 30;

    // 5. Business structure
    if (dealer.businessInfo?.businessType === 'LIMITED_LIABILITY') {
      baseScore += 25;
    }

    // Cap the score
    const creditScore = Math.min(baseScore, 850);

    // Determine risk rating and credit limit
    let riskRating: string;
    let recommendedCreditLimit: number;
    let requiresGuarantor: boolean;

    if (creditScore >= 750) {
      riskRating = 'LOW';
      recommendedCreditLimit = 500000;
      requiresGuarantor = false;
    } else if (creditScore >= 650) {
      riskRating = 'MEDIUM';
      recommendedCreditLimit = 200000;
      requiresGuarantor = false;
    } else if (creditScore >= 550) {
      riskRating = 'MEDIUM_HIGH';
      recommendedCreditLimit = 100000;
      requiresGuarantor = true;
    } else {
      riskRating = 'HIGH';
      recommendedCreditLimit = 50000;
      requiresGuarantor = true;
    }

    return {
      creditScore,
      recommendedCreditLimit,
      riskRating,
      assessmentNotes: `Automated assessment based on business profile, experience, and risk factors.`,
      requiresGuarantor,
    };
  }

  private async setupDealerAccounts(dealer: DealerProfile): Promise<void> {
    // Setup dealer accounts in GL system
    this.eventEmitter.emit('dealer.gl-accounts-setup-required', {
      dealerId: dealer.id,
      dealerCode: dealer.dealerCode,
      stationId: dealer.stationId,
      accounts: [
        { type: 'receivable', code: `DLR-${dealer.dealerCode}-REC` },
        { type: 'margin_payable', code: `DLR-${dealer.dealerCode}-MAR` },
        { type: 'loan_receivable', code: `DLR-${dealer.dealerCode}-LOAN` },
      ],
      tenantId: dealer.tenantId,
    });
  }

  private async setupMarginAccruals(dealer: DealerProfile): Promise<void> {
    // Setup margin accrual configuration
    this.eventEmitter.emit('dealer.margin-accrual-setup', {
      dealerId: dealer.id,
      stationId: dealer.stationId,
      products: ['PMS', 'AGO', 'LPG'],
      tenantId: dealer.tenantId,
    });
  }

  private mapToResponseDto(dealer: DealerProfile): DealerResponseDto {
    return {
      id: dealer.id,
      dealerCode: dealer.dealerCode,
      fullName: `${dealer.firstName} ${dealer.lastName}`,
      stationId: dealer.stationId,
      status: dealer.status,
      contactInfo: dealer.contactInfo,
      creditLimit: dealer.creditLimit,
      outstandingBalance: dealer.outstandingBalance,
      lastActivityDate: dealer.updatedAt,
      createdAt: dealer.createdAt,
    };
  }

  // Simulated database operations (would be replaced with actual TypeORM queries)
  private async findDealerById(dealerId: string, tenantId: string): Promise<DealerProfile | null> {
    // Simulated database query
    return null;
  }

  private async findDealerByStation(stationId: string, tenantId: string): Promise<DealerProfile | null> {
    // Simulated database query
    return null;
  }

  private async findDealerByNationalId(nationalId: string, tenantId: string): Promise<DealerProfile | null> {
    // Simulated database query
    return null;
  }

  private async saveDealerProfile(dealer: DealerProfile, queryRunner?: any): Promise<void> {
    // Simulated database save
  }

  private async storeDocuments(dealerId: string, documents: any[], tenantId: string): Promise<void> {
    // Simulated document storage
  }

  private async initiateCreditAssessment(dealerId: string, createDealerDto: CreateDealerDto, tenantId: string): Promise<void> {
    // Simulated credit assessment initiation
  }

  private async saveCreditAssessment(dealerId: string, assessment: DealerCreditAssessmentDto, tenantId: string): Promise<void> {
    // Simulated assessment save
  }

  private async saveApprovalRecord(dealerId: string, approval: ApproveDealerDto, approvedBy: string, tenantId: string): Promise<void> {
    // Simulated approval record save
  }

  private async findDealersWithFilters(tenantId: string, filters: any, pagination: any): Promise<DealerProfile[]> {
    // Simulated filtered query
    return [];
  }

  private async countDealersWithFilters(tenantId: string, filters: any): Promise<number> {
    // Simulated count query
    return 0;
  }
}