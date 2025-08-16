import { IFRSComplianceService, ComplianceCheck, IFRSComplianceReport, IFRSStandard } from './ifrs-compliance.service';
export declare class IFRSComplianceController {
    private readonly ifrsComplianceService;
    constructor(ifrsComplianceService: IFRSComplianceService);
    checkTransactionCompliance(checkData: {
        tenantId: string;
        transactionId: string;
        transactionData: any;
    }): Promise<ComplianceCheck>;
    bulkCheckCompliance(bulkCheckData: {
        tenantId: string;
        transactionIds: string[];
        checkParameters?: any;
    }): Promise<{
        processId: string;
        message: string;
    }>;
    getComplianceCheck(checkId: string): Promise<ComplianceCheck>;
    getTransactionComplianceHistory(transactionId: string): Promise<ComplianceCheck[]>;
    generateComplianceReport(tenantId: string, period: string): Promise<IFRSComplianceReport>;
    exportComplianceReport(tenantId: string, period: string, format?: string, includeDetails?: boolean): Promise<{
        reportUrl: string;
    }>;
    getComplianceDashboard(tenantId: string, period?: string, standard?: IFRSStandard): Promise<any>;
    getSupportedStandards(): Promise<{
        standard: IFRSStandard;
        name: string;
        description: string;
    }[]>;
    getStandardRules(standard: IFRSStandard): Promise<any[]>;
    createComplianceRule(standard: IFRSStandard, ruleData: {
        ruleName: string;
        description: string;
        category: string;
        validationLogic: any;
        priority: number;
        automatedCorrection: boolean;
    }): Promise<any>;
    getComplianceAlerts(tenantId: string, severity?: string, standard?: IFRSStandard, status?: string, limit?: number): Promise<any[]>;
    acknowledgeAlert(alertId: string, acknowledgmentData: {
        acknowledgedBy: string;
        acknowledgmentNotes?: string;
    }): Promise<any>;
    subscribeToAlerts(subscriptionData: {
        tenantId: string;
        userId: string;
        alertTypes: string[];
        deliveryMethod: string;
        frequency: string;
    }): Promise<{
        subscriptionId: string;
    }>;
    getComplianceAnalytics(tenantId: string, startDate?: string, endDate?: string, standard?: IFRSStandard, department?: string): Promise<any>;
    getComplianceTrends(tenantId: string, period?: string, granularity?: string): Promise<any>;
    getComplianceRiskAssessment(tenantId: string): Promise<any>;
    getAutomatedCorrections(tenantId: string, startDate?: string, endDate?: string, standard?: IFRSStandard): Promise<any[]>;
    applyManualCorrection(correctionData: {
        tenantId: string;
        transactionId: string;
        issueId: string;
        correctionType: string;
        description: string;
        amountBefore: number;
        amountAfter: number;
        appliedBy: string;
        approvalRequired?: boolean;
    }): Promise<any>;
    approveCorrection(correctionId: string, approvalData: {
        approvedBy: string;
        approvalNotes?: string;
    }): Promise<any>;
    rejectCorrection(correctionId: string, rejectionData: {
        rejectedBy: string;
        rejectionReason: string;
    }): Promise<any>;
    getComplianceSettings(tenantId: string): Promise<any>;
    updateComplianceSettings(tenantId: string, settingsData: {
        automatedCorrections: boolean;
        alertThresholds: any;
        reportingFrequency: string;
        enabledStandards: IFRSStandard[];
        customRules: any[];
    }): Promise<any>;
    testComplianceRules(tenantId: string, testData: {
        ruleIds: string[];
        sampleTransactions: any[];
    }): Promise<{
        testResults: any[];
    }>;
    getComplianceAuditTrail(tenantId: string, startDate?: string, endDate?: string, userId?: string, action?: string, limit?: number): Promise<any[]>;
    getServiceHealth(): Promise<{
        status: string;
        uptime: number;
        checks: any[];
        lastMaintenanceDate: Date;
    }>;
    triggerMaintenance(maintenanceData: {
        maintenanceType: string;
        scheduledBy: string;
        maintenanceWindow?: string;
    }): Promise<{
        maintenanceId: string;
        message: string;
    }>;
}
//# sourceMappingURL=ifrs-compliance.controller.d.ts.map