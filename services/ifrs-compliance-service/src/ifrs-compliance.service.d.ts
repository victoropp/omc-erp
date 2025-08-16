import { EventEmitter2 } from '@nestjs/event-emitter';
export declare enum IFRSStandard {
    IAS_1 = "IAS_1",// Presentation of Financial Statements
    IAS_2 = "IAS_2",// Inventories
    IAS_7 = "IAS_7",// Statement of Cash Flows
    IAS_8 = "IAS_8",// Accounting Policies, Changes in Accounting Estimates and Errors
    IAS_10 = "IAS_10",// Events after the Reporting Period
    IAS_12 = "IAS_12",// Income Taxes
    IAS_16 = "IAS_16",// Property, Plant and Equipment
    IAS_17 = "IAS_17",// Leases (superseded by IFRS 16)
    IAS_18 = "IAS_18",// Revenue (superseded by IFRS 15)
    IAS_19 = "IAS_19",// Employee Benefits
    IAS_20 = "IAS_20",// Government Grants
    IAS_21 = "IAS_21",// Foreign Currency Translation
    IAS_23 = "IAS_23",// Borrowing Costs
    IAS_24 = "IAS_24",// Related Party Disclosures
    IAS_26 = "IAS_26",// Retirement Benefit Plans
    IAS_27 = "IAS_27",// Separate Financial Statements
    IAS_28 = "IAS_28",// Investments in Associates and Joint Ventures
    IAS_29 = "IAS_29",// Financial Reporting in Hyperinflationary Economies
    IAS_32 = "IAS_32",// Financial Instruments: Presentation
    IAS_33 = "IAS_33",// Earnings per Share
    IAS_34 = "IAS_34",// Interim Financial Reporting
    IAS_36 = "IAS_36",// Impairment of Assets
    IAS_37 = "IAS_37",// Provisions, Contingent Liabilities and Contingent Assets
    IAS_38 = "IAS_38",// Intangible Assets
    IAS_39 = "IAS_39",// Financial Instruments: Recognition and Measurement
    IAS_40 = "IAS_40",// Investment Property
    IAS_41 = "IAS_41",// Agriculture
    IFRS_1 = "IFRS_1",// First-time Adoption of IFRS
    IFRS_2 = "IFRS_2",// Share-based Payment
    IFRS_3 = "IFRS_3",// Business Combinations
    IFRS_4 = "IFRS_4",// Insurance Contracts
    IFRS_5 = "IFRS_5",// Non-current Assets Held for Sale and Discontinued Operations
    IFRS_6 = "IFRS_6",// Exploration for and Evaluation of Mineral Resources
    IFRS_7 = "IFRS_7",// Financial Instruments: Disclosures
    IFRS_8 = "IFRS_8",// Operating Segments
    IFRS_9 = "IFRS_9",// Financial Instruments
    IFRS_10 = "IFRS_10",// Consolidated Financial Statements
    IFRS_11 = "IFRS_11",// Joint Arrangements
    IFRS_12 = "IFRS_12",// Disclosure of Interests in Other Entities
    IFRS_13 = "IFRS_13",// Fair Value Measurement
    IFRS_14 = "IFRS_14",// Regulatory Deferral Accounts
    IFRS_15 = "IFRS_15",// Revenue from Contracts with Customers
    IFRS_16 = "IFRS_16",// Leases
    IFRS_17 = "IFRS_17"
}
export declare enum ComplianceStatus {
    COMPLIANT = "COMPLIANT",
    NON_COMPLIANT = "NON_COMPLIANT",
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
    UNDER_REVIEW = "UNDER_REVIEW",
    REQUIRES_ATTENTION = "REQUIRES_ATTENTION",
    NOT_APPLICABLE = "NOT_APPLICABLE"
}
export declare enum TransactionCategory {
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE",
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY"
}
export interface ComplianceRule {
    id: string;
    standard: IFRSStandard;
    ruleName: string;
    description: string;
    category: TransactionCategory;
    isActive: boolean;
    priority: number;
    validationLogic: string;
    automatedCorrection: boolean;
}
export interface ComplianceCheck {
    id: string;
    tenantId: string;
    transactionId: string;
    standard: IFRSStandard;
    ruleName: string;
    status: ComplianceStatus;
    checkDate: Date;
    issues: ComplianceIssue[];
    recommendations: string[];
    correctionsMade: ComplianceCorrection[];
}
export interface ComplianceIssue {
    issueId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    issueType: string;
    description: string;
    impact: string;
    affectedAmount: number;
    suggestedResolution: string;
}
export interface ComplianceCorrection {
    correctionId: string;
    correctionType: string;
    description: string;
    amountBefore: number;
    amountAfter: number;
    correctionDate: Date;
    appliedBy: string;
}
export interface IFRSComplianceReport {
    tenantId: string;
    reportDate: Date;
    reportingPeriod: string;
    overallComplianceScore: number;
    totalTransactionsChecked: number;
    compliantTransactions: number;
    nonCompliantTransactions: number;
    standardCompliance: Array<{
        standard: IFRSStandard;
        complianceScore: number;
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        criticalIssues: number;
    }>;
    categoryCompliance: Array<{
        category: TransactionCategory;
        complianceScore: number;
        totalAmount: number;
        compliantAmount: number;
        nonCompliantAmount: number;
    }>;
    criticalIssues: ComplianceIssue[];
    recommendedActions: string[];
    automatedCorrections: ComplianceCorrection[];
}
export declare class IFRSComplianceService {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    checkTransactionCompliance(tenantId: string, transactionId: string, transactionData: any): Promise<ComplianceCheck>;
    private checkIAS12Compliance;
    private checkIAS16Compliance;
    private checkIAS23Compliance;
    private checkIAS37Compliance;
    private checkIFRS6Compliance;
    private checkIFRS15Compliance;
    private checkIFRS16Compliance;
    private applyAutomatedCorrections;
    private correctTaxRecognition;
    private correctDepreciationCalculation;
    private correctBorrowingCostCapitalization;
    private correctRevenueRecognitionTiming;
    generateComplianceReport(tenantId: string, reportingPeriod: string): Promise<IFRSComplianceReport>;
    dailyComplianceMonitoring(): Promise<void>;
    monthlyComplianceReporting(): Promise<void>;
    private getApplicableStandards;
    private checkStandardCompliance;
    private determineApplicableStandard;
    private determineComplianceStatus;
    private isQualifyingAsset;
    private generateComplianceCheckId;
    private generateIssueId;
    private generateCorrectionId;
    private checkRecentTransactions;
    private generateComplianceAlerts;
    private updateComplianceDashboards;
    private generateMonthlyComplianceReports;
    private updateComplianceMetrics;
    private distributeComplianceReports;
}
//# sourceMappingURL=ifrs-compliance.service.d.ts.map