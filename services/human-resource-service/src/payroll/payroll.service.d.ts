import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payroll } from './entities/payroll.entity';
import { Employee } from '../employee/entities/employee.entity';
export interface PayrollCalculationData {
    tenantId: string;
    employeeId: string;
    payrollPeriod: string;
    periodStartDate: Date;
    periodEndDate: Date;
    actualDaysWorked: number;
    overtimeHours?: number;
    bonuses?: PayrollBonus[];
    deductions?: PayrollDeduction[];
    calculatedBy: string;
}
export interface PayrollBonus {
    type: string;
    amount: number;
    description?: string;
}
export interface PayrollDeduction {
    type: string;
    amount: number;
    description?: string;
}
export interface GhanaTaxBracket {
    minIncome: number;
    maxIncome: number;
    rate: number;
    cumulativeTax: number;
}
export interface PayrollSummary {
    tenantId: string;
    payrollPeriod: string;
    totalEmployees: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalIncomeTax: number;
    totalSSNITEmployee: number;
    totalSSNITEmployer: number;
    totalCostToCompany: number;
    averageNetPay: number;
}
export declare class PayrollService {
    private payrollRepo;
    private employeeRepo;
    private dataSource;
    private eventEmitter;
    private readonly logger;
    private readonly ghanaTaxBrackets;
    private readonly ghanaMinimumWage;
    constructor(payrollRepo: Repository<Payroll>, employeeRepo: Repository<Employee>, dataSource: DataSource, eventEmitter: EventEmitter2);
    calculatePayroll(data: PayrollCalculationData): Promise<Payroll>;
    approvePayroll(payrollId: string, approvedBy: string): Promise<Payroll>;
    processPayrollPayment(payrollId: string, processedBy: string): Promise<Payroll>;
    generatePayrollSummary(tenantId: string, payrollPeriod: string): Promise<PayrollSummary>;
    monthlyPayrollReminders(): Promise<void>;
    private calculateProratedSalary;
    private calculateOvertimePay;
    private calculateTotalAllowances;
    private calculateTaxableIncome;
    private calculateIncomeTax;
    private calculateSSNITContributions;
    private calculateTier2Contributions;
    private calculateYTDAmounts;
    private generatePayrollNumber;
    private generatePaymentReference;
    private createPayrollJournalEntries;
    private sendPayrollProcessingReminders;
    private generateMonthlyPayrollReports;
}
//# sourceMappingURL=payroll.service.d.ts.map