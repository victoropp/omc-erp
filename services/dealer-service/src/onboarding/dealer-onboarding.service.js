"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DealerOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerOnboardingService = exports.DealerStatus = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
var DealerStatus;
(function (DealerStatus) {
    DealerStatus["PENDING_DOCUMENTS"] = "pending_documents";
    DealerStatus["UNDER_REVIEW"] = "under_review";
    DealerStatus["CREDIT_ASSESSMENT"] = "credit_assessment";
    DealerStatus["PENDING_APPROVAL"] = "pending_approval";
    DealerStatus["APPROVED"] = "approved";
    DealerStatus["ACTIVE"] = "active";
    DealerStatus["SUSPENDED"] = "suspended";
    DealerStatus["TERMINATED"] = "terminated";
    DealerStatus["REJECTED"] = "rejected";
})(DealerStatus || (exports.DealerStatus = DealerStatus = {}));
let DealerOnboardingService = DealerOnboardingService_1 = class DealerOnboardingService {
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerOnboardingService_1.name);
    constructor(
    // We'll use a simple repository pattern for now
    // @InjectRepository(DealerProfile)
    // private readonly dealerRepository: Repository<DealerProfile>,
    dataSource, eventEmitter) {
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create new dealer profile and initiate onboarding process
     */
    async createDealerProfile(createDealerDto, tenantId, createdBy) {
        this.logger.log(`Creating dealer profile for station ${createDealerDto.stationId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Check if dealer already exists for this station
            const existingDealer = await this.findDealerByStation(createDealerDto.stationId, tenantId);
            if (existingDealer && existingDealer.status !== DealerStatus.REJECTED) {
                throw new common_1.ConflictException('Active dealer already exists for this station');
            }
            // Check for duplicate national ID
            const duplicateNationalId = await this.findDealerByNationalId(createDealerDto.nationalId, tenantId);
            if (duplicateNationalId) {
                throw new common_1.ConflictException('Dealer with this National ID already exists');
            }
            // Generate dealer code
            const dealerCode = await this.generateDealerCode(createDealerDto.stationId);
            // Create dealer profile
            const dealerProfile = {
                id: (0, uuid_1.v4)(),
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Submit required documents for verification
     */
    async submitDocuments(dealerId, documents, tenantId, submittedBy) {
        this.logger.log(`Submitting documents for dealer ${dealerId}`);
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
        }
        if (dealer.status !== DealerStatus.PENDING_DOCUMENTS) {
            throw new common_1.BadRequestException('Dealer is not in pending documents status');
        }
        // Validate required documents
        const requiredDocs = this.getRequiredDocuments();
        const submittedTypes = documents.map(d => d.type);
        const missingDocs = requiredDocs.filter(req => !submittedTypes.includes(req.type));
        if (missingDocs.length > 0) {
            throw new common_1.BadRequestException(`Missing required documents: ${missingDocs.map(d => d.type).join(', ')}`);
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
    async verifyDocuments(dealerId, verificationResults, tenantId, verifiedBy) {
        this.logger.log(`Verifying documents for dealer ${dealerId}`);
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
        }
        if (dealer.status !== DealerStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException('Dealer is not under review');
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
        }
        else {
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
    async performCreditAssessment(dealerId, tenantId) {
        this.logger.log(`Performing credit assessment for dealer ${dealerId}`);
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
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
    async approveDealer(dealerId, approvalDto, tenantId, approvedBy) {
        this.logger.log(`Processing approval for dealer ${dealerId}: ${approvalDto.approved ? 'APPROVED' : 'REJECTED'}`);
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
        }
        if (dealer.status !== DealerStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Dealer is not pending approval');
        }
        if (approvalDto.approved) {
            // Approve dealer
            dealer.status = DealerStatus.APPROVED;
            dealer.creditLimit = approvalDto.approvedCreditLimit || dealer.creditLimit;
            dealer.onboardingProgress.approvalCompleted = true;
        }
        else {
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
        }
        else {
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
    async activateDealer(dealerId, tenantId) {
        this.logger.log(`Activating dealer ${dealerId}`);
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
        }
        if (dealer.status !== DealerStatus.APPROVED) {
            throw new common_1.BadRequestException('Dealer must be approved before activation');
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
    async getDealerById(dealerId, tenantId) {
        const dealer = await this.findDealerById(dealerId, tenantId);
        if (!dealer) {
            throw new common_1.NotFoundException('Dealer not found');
        }
        return this.mapToResponseDto(dealer);
    }
    /**
     * List dealers with filtering and pagination
     */
    async listDealers(tenantId, filters, pagination) {
        // Implementation would query database with filters and pagination
        const dealers = await this.findDealersWithFilters(tenantId, filters, pagination);
        const total = await this.countDealersWithFilters(tenantId, filters);
        return {
            dealers: dealers.map(dealer => this.mapToResponseDto(dealer)),
            total,
        };
    }
    // Private helper methods
    async generateDealerCode(stationId) {
        // Generate unique dealer code: D-{STATION_CODE}-{SEQUENCE}
        const stationCode = stationId.substring(0, 6).toUpperCase();
        const sequence = String(Date.now()).slice(-4);
        return `D-${stationCode}-${sequence}`;
    }
    getRequiredDocuments() {
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
    async calculateCreditScore(dealer) {
        // AI-powered credit scoring algorithm
        let baseScore = 600; // Base credit score
        // Factors affecting credit score:
        // 1. Business information completeness
        if (dealer.businessInfo) {
            baseScore += 50;
        }
        // 2. Expected sales volume
        const expectedSales = dealer.businessInfo?.expectedMonthlySales || 0;
        if (expectedSales > 50000)
            baseScore += 40;
        else if (expectedSales > 20000)
            baseScore += 20;
        // 3. Previous experience
        const experience = dealer.businessInfo?.previousExperience || 0;
        baseScore += Math.min(experience * 10, 100);
        // 4. Age factor (mature applicants get bonus)
        const age = new Date().getFullYear() - dealer.dateOfBirth.getFullYear();
        if (age >= 30 && age <= 55)
            baseScore += 30;
        // 5. Business structure
        if (dealer.businessInfo?.businessType === 'LIMITED_LIABILITY') {
            baseScore += 25;
        }
        // Cap the score
        const creditScore = Math.min(baseScore, 850);
        // Determine risk rating and credit limit
        let riskRating;
        let recommendedCreditLimit;
        let requiresGuarantor;
        if (creditScore >= 750) {
            riskRating = 'LOW';
            recommendedCreditLimit = 500000;
            requiresGuarantor = false;
        }
        else if (creditScore >= 650) {
            riskRating = 'MEDIUM';
            recommendedCreditLimit = 200000;
            requiresGuarantor = false;
        }
        else if (creditScore >= 550) {
            riskRating = 'MEDIUM_HIGH';
            recommendedCreditLimit = 100000;
            requiresGuarantor = true;
        }
        else {
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
    async setupDealerAccounts(dealer) {
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
    async setupMarginAccruals(dealer) {
        // Setup margin accrual configuration
        this.eventEmitter.emit('dealer.margin-accrual-setup', {
            dealerId: dealer.id,
            stationId: dealer.stationId,
            products: ['PMS', 'AGO', 'LPG'],
            tenantId: dealer.tenantId,
        });
    }
    mapToResponseDto(dealer) {
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
    async findDealerById(dealerId, tenantId) {
        // Simulated database query
        return null;
    }
    async findDealerByStation(stationId, tenantId) {
        // Simulated database query
        return null;
    }
    async findDealerByNationalId(nationalId, tenantId) {
        // Simulated database query
        return null;
    }
    async saveDealerProfile(dealer, queryRunner) {
        // Simulated database save
    }
    async storeDocuments(dealerId, documents, tenantId) {
        // Simulated document storage
    }
    async initiateCreditAssessment(dealerId, createDealerDto, tenantId) {
        // Simulated credit assessment initiation
    }
    async saveCreditAssessment(dealerId, assessment, tenantId) {
        // Simulated assessment save
    }
    async saveApprovalRecord(dealerId, approval, approvedBy, tenantId) {
        // Simulated approval record save
    }
    async findDealersWithFilters(tenantId, filters, pagination) {
        // Simulated filtered query
        return [];
    }
    async countDealersWithFilters(tenantId, filters) {
        // Simulated count query
        return 0;
    }
};
exports.DealerOnboardingService = DealerOnboardingService;
exports.DealerOnboardingService = DealerOnboardingService = DealerOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        event_emitter_1.EventEmitter2])
], DealerOnboardingService);
//# sourceMappingURL=dealer-onboarding.service.js.map