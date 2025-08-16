import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface Dealer {
    id: string;
    dealerCode: string;
    dealerName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
    };
    businessInfo: {
        businessRegistrationNumber: string;
        taxIdentificationNumber: string;
        vatRegistrationNumber?: string;
        licenseNumber: string;
        licenseExpiryDate: Date;
    };
    financialInfo: {
        creditLimit: number;
        currentOutstanding: number;
        paymentTerms: string;
        creditRating: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    onboardingDate: Date;
    lastActivityDate: Date;
}
export interface DealerCreditProfile {
    dealerId: string;
    creditLimit: number;
    currentOutstanding: number;
    availableCredit: number;
    creditUtilization: number;
    creditRating: string;
    paymentHistory: {
        onTimePayments: number;
        latePayments: number;
        defaultedPayments: number;
        averagePaymentDays: number;
    };
    riskProfile: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    lastCreditReview: Date;
    nextReviewDue: Date;
}
export interface DealerPerformanceMetrics {
    dealerId: string;
    performancePeriod: {
        startDate: Date;
        endDate: Date;
    };
    salesMetrics: {
        totalVolume: {
            [productCode: string]: number;
        };
        totalRevenue: number;
        averageDailySales: number;
        growthRate: number;
    };
    operationalMetrics: {
        stationsManaged: number;
        complianceScore: number;
        customerSatisfactionRating: number;
        operationalEfficiencyScore: number;
    };
    financialMetrics: {
        marginEarned: number;
        loanRepaymentRate: number;
        profitabilityScore: number;
    };
    overallRating: string;
}
export declare class CustomerServiceIntegration {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Get dealer information by ID
     */
    getDealerById(dealerId: string): Promise<Dealer | null>;
    /**
     * Get all active dealers
     */
    getActiveDealers(): Promise<Dealer[]>;
    /**
     * Get dealer credit profile
     */
    getDealerCreditProfile(dealerId: string): Promise<DealerCreditProfile | null>;
    /**
     * Update dealer credit limit
     */
    updateDealerCreditLimit(dealerId: string, newCreditLimit: number, reason: string, updatedBy: string): Promise<void>;
    /**
     * Get dealer performance metrics
     */
    getDealerPerformanceMetrics(dealerId: string, startDate: Date, endDate: Date): Promise<DealerPerformanceMetrics | null>;
    /**
     * Check dealer creditworthiness for loan application
     */
    checkDealerCreditworthiness(dealerId: string, requestedAmount: number, loanType: string): Promise<{
        isEligible: boolean;
        approvedAmount: number;
        creditRating: string;
        riskScore: number;
        conditions: string[];
        reasons: string[];
    }>;
    /**
     * Record dealer payment
     */
    recordDealerPayment(payment: {
        dealerId: string;
        paymentAmount: number;
        paymentDate: Date;
        paymentMethod: string;
        paymentReference: string;
        allocations: Array<{
            invoiceId?: string;
            loanId?: string;
            amount: number;
            description: string;
        }>;
        recordedBy: string;
    }): Promise<void>;
    /**
     * Get dealer outstanding balance
     */
    getDealerOutstandingBalance(dealerId: string): Promise<{
        totalOutstanding: number;
        breakdown: {
            tradeReceivables: number;
            loanReceivables: number;
            overdueAmount: number;
            currentAmount: number;
        };
        agingAnalysis: Array<{
            category: string;
            amount: number;
            percentage: number;
        }>;
    }>;
    /**
     * Update dealer status
     */
    updateDealerStatus(dealerId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', reason: string, updatedBy: string): Promise<void>;
    /**
     * Get dealers requiring credit review
     */
    getDealersRequiringCreditReview(): Promise<Array<{
        dealerId: string;
        dealerName: string;
        currentCreditLimit: number;
        creditUtilization: number;
        lastReviewDate: Date;
        reviewDueDate: Date;
        riskProfile: string;
    }>>;
    /**
     * Send dealer notification
     */
    sendDealerNotification(notification: {
        dealerId: string;
        notificationType: 'PRICE_CHANGE' | 'PAYMENT_DUE' | 'CREDIT_LIMIT_UPDATE' | 'SETTLEMENT_READY';
        subject: string;
        message: string;
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        channels: Array<'EMAIL' | 'SMS' | 'PUSH'>;
        sendBy: string;
    }): Promise<{
        sent: boolean;
        channels: Array<{
            channel: string;
            status: string;
            error?: string;
        }>;
    }>;
    /**
     * Health check for customer service
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        lastChecked: Date;
        activeDealers?: number;
    }>;
    private getDefaultCreditProfile;
}
//# sourceMappingURL=customer-service.integration.d.ts.map