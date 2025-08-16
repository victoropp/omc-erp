import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDealerDto, ApproveDealerDto, DealerCreditAssessmentDto, DealerResponseDto } from '../dto/dealer-onboarding.dto';
export declare enum DealerStatus {
    PENDING_DOCUMENTS = "pending_documents",
    UNDER_REVIEW = "under_review",
    CREDIT_ASSESSMENT = "credit_assessment",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    TERMINATED = "terminated",
    REJECTED = "rejected"
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
export declare class DealerOnboardingService {
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Create new dealer profile and initiate onboarding process
     */
    createDealerProfile(createDealerDto: CreateDealerDto, tenantId: string, createdBy?: string): Promise<DealerProfile>;
    /**
     * Submit required documents for verification
     */
    submitDocuments(dealerId: string, documents: Array<{
        type: string;
        url: string;
        description?: string;
    }>, tenantId: string, submittedBy?: string): Promise<void>;
    /**
     * Verify submitted documents
     */
    verifyDocuments(dealerId: string, verificationResults: Array<{
        type: string;
        verified: boolean;
        notes?: string;
    }>, tenantId: string, verifiedBy?: string): Promise<void>;
    /**
     * Perform automated credit assessment
     */
    performCreditAssessment(dealerId: string, tenantId: string): Promise<DealerCreditAssessmentDto>;
    /**
     * Approve or reject dealer application
     */
    approveDealer(dealerId: string, approvalDto: ApproveDealerDto, tenantId: string, approvedBy?: string): Promise<DealerProfile>;
    /**
     * Activate approved dealer
     */
    activateDealer(dealerId: string, tenantId: string): Promise<DealerProfile>;
    /**
     * Get dealer by ID
     */
    getDealerById(dealerId: string, tenantId: string): Promise<DealerResponseDto>;
    /**
     * List dealers with filtering and pagination
     */
    listDealers(tenantId: string, filters?: {
        status?: DealerStatus;
        stationId?: string;
        riskRating?: string;
    }, pagination?: {
        page: number;
        limit: number;
    }): Promise<{
        dealers: DealerResponseDto[];
        total: number;
    }>;
    private generateDealerCode;
    private getRequiredDocuments;
    private calculateCreditScore;
    private setupDealerAccounts;
    private setupMarginAccruals;
    private mapToResponseDto;
    private findDealerById;
    private findDealerByStation;
    private findDealerByNationalId;
    private saveDealerProfile;
    private storeDocuments;
    private initiateCreditAssessment;
    private saveCreditAssessment;
    private saveApprovalRecord;
    private findDealersWithFilters;
    private countDealersWithFilters;
}
//# sourceMappingURL=dealer-onboarding.service.d.ts.map