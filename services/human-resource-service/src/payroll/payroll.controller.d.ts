import { PayrollService, PayrollCalculationData, PayrollSummary } from './payroll.service';
import { Payroll } from './entities/payroll.entity';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    calculatePayroll(calculationData: PayrollCalculationData): Promise<Payroll>;
    recalculatePayroll(payrollId: string, recalculationData: {
        overtimeHours?: number;
        bonuses?: Array<{
            type: string;
            amount: number;
            description?: string;
        }>;
        deductions?: Array<{
            type: string;
            amount: number;
            description?: string;
        }>;
        actualDaysWorked?: number;
        updatedBy: string;
    }): Promise<Payroll>;
    getEmployeePayroll(employeeId: string, period: string): Promise<Payroll>;
    getEmployeePayrollHistory(employeeId: string, year?: number, limit?: number): Promise<Payroll[]>;
    approvePayroll(payrollId: string, approvalData: {
        approvedBy: string;
        approvalComments?: string;
    }): Promise<Payroll>;
    rejectPayroll(payrollId: string, rejectionData: {
        rejectedBy: string;
        rejectionReason: string;
    }): Promise<Payroll>;
    getPendingApprovals(tenantId: string, period?: string, department?: string): Promise<Payroll[]>;
    processPayrollPayment(payrollId: string, paymentData: {
        processedBy: string;
        paymentMethod?: string;
        paymentReference?: string;
    }): Promise<Payroll>;
    bulkCalculatePayroll(bulkData: {
        tenantId: string;
        employeeIds: string[];
        payrollPeriod: string;
        periodStartDate: Date;
        periodEndDate: Date;
        calculatedBy: string;
    }): Promise<{
        processId: string;
        message: string;
    }>;
    bulkProcessPayrolls(bulkProcessData: {
        tenantId: string;
        payrollPeriod: string;
        processedBy: string;
        paymentDate?: Date;
    }): Promise<{
        processId: string;
        message: string;
    }>;
    generatePayrollSummary(tenantId: string, period: string): Promise<PayrollSummary>;
    generatePayrollRegister(tenantId: string, period: string, department?: string, costCenter?: string, format?: string): Promise<any>;
    generateTaxSummary(tenantId: string, year: number, month?: number, department?: string): Promise<any>;
    generateSSNITSummary(tenantId: string, year: number, month?: number): Promise<any>;
    generateBankTransferFile(tenantId: string, period: string, bankCode?: string, format?: string): Promise<any>;
    generatePayslip(payrollId: string, format?: string): Promise<{
        payslipUrl: string;
    }>;
    generateBulkPayslips(bulkPayslipData: {
        tenantId: string;
        payrollPeriod: string;
        format?: string;
        emailToEmployees?: boolean;
    }): Promise<{
        processId: string;
        message: string;
    }>;
    sendPayslipToEmployee(payrollId: string, sendData: {
        emailAddress?: string;
        sendSMS?: boolean;
        sentBy: string;
    }): Promise<{
        sent: boolean;
        message: string;
    }>;
    getEmployeeYTDSummary(employeeId: string, year: number, asOfDate?: string): Promise<any>;
    generateTaxCertificate(employeeId: string, year: number, format?: string): Promise<{
        certificateUrl: string;
    }>;
    generateP9Form(employeeId: string, year: number, format?: string): Promise<{
        p9FormUrl: string;
    }>;
    addPayrollAdjustment(payrollId: string, adjustmentData: {
        adjustmentType: string;
        amount: number;
        reason: string;
        adjustedBy: string;
        effectiveDate?: Date;
    }): Promise<Payroll>;
    getPayrollAdjustments(payrollId: string): Promise<any[]>;
    generateGRAReport(tenantId: string, year: number, month?: number, quarter?: number): Promise<any>;
    generateSSNITReport(tenantId: string, year: number, month?: number): Promise<any>;
    generateTier2PensionReport(tenantId: string, year: number, month?: number): Promise<any>;
    getPayrollAnalytics(tenantId: string, year?: number, department?: string): Promise<any>;
    getPayrollCostAnalysis(tenantId: string, period?: string, compareWith?: string): Promise<any>;
    getPayrollVarianceAnalysis(tenantId: string, currentPeriod: string, comparePeriod: string): Promise<any>;
    getPayrollAuditTrail(tenantId: string, startDate?: string, endDate?: string, employeeId?: string, action?: string): Promise<any[]>;
    backupPayrollData(tenantId: string, period: string, backupOptions: {
        includeDocuments?: boolean;
        compressionLevel?: number;
        encryptionKey?: string;
    }): Promise<{
        backupId: string;
        message: string;
    }>;
}
//# sourceMappingURL=payroll.controller.d.ts.map