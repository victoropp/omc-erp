import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UPPFClaim, UPPFSettlement, ThreeWayReconciliation, UPPFClaimStatus, SettlementStatus } from '../entities/uppf-entities';
interface NPAReportData {
    reportType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ADHOC';
    reportPeriod: {
        startDate: Date;
        endDate: Date;
        description: string;
    };
    summary: {
        totalClaims: number;
        totalAmount: number;
        totalVolume: number;
        averageClaimAmount: number;
        settlementEfficiency: number;
    };
    claimsBreakdown: {
        byStatus: Record<UPPFClaimStatus, number>;
        byProduct: Record<string, {
            claims: number;
            amount: number;
            volume: number;
        }>;
        byDealer: Array<{
            dealerId: string;
            dealerName: string;
            claims: number;
            amount: number;
            volume: number;
        }>;
        byRegion: Record<string, {
            claims: number;
            amount: number;
            volume: number;
        }>;
    };
    settlementsBreakdown: {
        totalSettlements: number;
        totalSettledAmount: number;
        averageSettlementAmount: number;
        byStatus: Record<SettlementStatus, number>;
    };
    reconciliationMetrics: {
        totalReconciliations: number;
        successfulReconciliations: number;
        successRate: number;
        averageVariancePercentage: number;
    };
    complianceMetrics: {
        gpsValidationRate: number;
        documentationCompleteness: number;
        onTimeSubmissionRate: number;
        qualityScoreAverage: number;
    };
    trends: {
        monthlyTrends: Array<{
            month: string;
            claims: number;
            amount: number;
            volume: number;
        }>;
        performanceTrends: Array<{
            period: string;
            efficiency: number;
            compliance: number;
            variance: number;
        }>;
    };
    anomalies: Array<{
        type: string;
        description: string;
        impact: string;
        recommendation: string;
    }>;
}
interface DealerPerformanceReport {
    dealerId: string;
    dealerName: string;
    reportPeriod: {
        startDate: Date;
        endDate: Date;
    };
    claimsMetrics: {
        totalClaims: number;
        approvedClaims: number;
        rejectedClaims: number;
        totalAmount: number;
        averageClaimAmount: number;
        approvalRate: number;
    };
    operationalMetrics: {
        totalVolume: number;
        averageVolumePerClaim: number;
        uniqueRoutes: number;
        averageDistance: number;
        gpsValidationRate: number;
    };
    qualityMetrics: {
        averageQualityScore: number;
        documentationCompleteness: number;
        onTimeSubmissionRate: number;
        reconciliationSuccessRate: number;
    };
    financialMetrics: {
        totalSettled: number;
        averageSettlementTime: number;
        penaltiesIncurred: number;
        bonusesEarned: number;
        netPaymentReceived: number;
    };
    complianceScore: number;
    performanceRating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'POOR';
    recommendations: string[];
}
interface SystemPerformanceReport {
    reportPeriod: {
        startDate: Date;
        endDate: Date;
    };
    systemMetrics: {
        totalClaimsProcessed: number;
        totalSettlementsGenerated: number;
        totalAmountProcessed: number;
        averageProcessingTime: number;
        systemUptime: number;
    };
    automationMetrics: {
        autoApprovedClaims: number;
        autoReconciliations: number;
        automationRate: number;
        manualInterventionRequired: number;
    };
    qualityMetrics: {
        errorRate: number;
        dataQualityScore: number;
        documentationCompleteness: number;
        validationAccuracy: number;
    };
    efficiencyMetrics: {
        processingSpeed: number;
        resourceUtilization: number;
        costPerClaim: number;
        costPerSettlement: number;
    };
    securityMetrics: {
        fraudDetectionRate: number;
        securityIncidents: number;
        blockchainVerificationRate: number;
        dataIntegrityScore: number;
    };
    recommendations: {
        systemOptimization: string[];
        processImprovement: string[];
        securityEnhancements: string[];
    };
}
export declare class UPPFReportsService {
    private readonly claimRepository;
    private readonly settlementRepository;
    private readonly reconciliationRepository;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    constructor(claimRepository: Repository<UPPFClaim>, settlementRepository: Repository<UPPFSettlement>, reconciliationRepository: Repository<ThreeWayReconciliation>, httpService: HttpService, configService: ConfigService);
    /**
     * Generate comprehensive NPA submission report
     */
    generateNPAReport(reportType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ADHOC', startDate: Date, endDate: Date, additionalOptions?: {
        includeAnomalies?: boolean;
        includeTrends?: boolean;
        includeDetailedBreakdowns?: boolean;
    }): Promise<NPAReportData>;
    /**
     * Generate dealer performance report
     */
    generateDealerPerformanceReport(dealerId: string, startDate: Date, endDate: Date): Promise<DealerPerformanceReport>;
    /**
     * Generate system performance report
     */
    generateSystemPerformanceReport(startDate: Date, endDate: Date): Promise<SystemPerformanceReport>;
    /**
     * Export report to PDF format
     */
    exportReportToPDF(reportData: NPAReportData | DealerPerformanceReport | SystemPerformanceReport, reportType: string, generatedBy: string): Promise<{
        reportUrl: string;
        reportId: string;
    }>;
    /**
     * Schedule automated report generation
     */
    scheduleAutomatedReports(): Promise<void>;
    private getClaimsForPeriod;
    private getSettlementsForPeriod;
    private getReconciliationsForPeriod;
    private calculateSummaryMetrics;
    private generateClaimsBreakdown;
    private generateSettlementsBreakdown;
    private calculateReconciliationMetrics;
    private calculateComplianceMetrics;
    private generateTrends;
    private detectAnomalies;
    private calculateDealerClaimsMetrics;
    private calculateDealerOperationalMetrics;
    private calculateDealerQualityMetrics;
    private calculateDealerFinancialMetrics;
    private calculateDealerComplianceScore;
    private getDealerPerformanceRating;
    private generateDealerRecommendations;
    private calculateSystemMetrics;
    private calculateAutomationMetrics;
    private calculateSystemQualityMetrics;
    private calculateEfficiencyMetrics;
    private calculateSecurityMetrics;
    private generateSystemRecommendations;
    private getDealerInfo;
    private getSettlementsForDealer;
    private getReportPeriodDescription;
    private getReportTemplate;
    private scheduleReport;
}
export {};
//# sourceMappingURL=uppf-reports.service.d.ts.map