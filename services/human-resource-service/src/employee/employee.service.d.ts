import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { EmployeeContract, ContractType } from './entities/employee-contract.entity';
import { EmployeeLeave, LeaveType } from './entities/employee-leave.entity';
import { EmployeePerformance, PerformanceReviewType } from './entities/employee-performance.entity';
import { EmployeeTraining, TrainingType } from './entities/employee-training.entity';
export interface EmployeeData {
    tenantId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    email: string;
    phone: string;
    hireDate: Date;
    jobTitle: string;
    department: string;
    basicSalary: number;
    reportingManagerId?: string;
    createdBy: string;
}
export interface ContractData {
    tenantId: string;
    employeeId: string;
    contractType: ContractType;
    contractTitle: string;
    contractStartDate: Date;
    contractEndDate?: Date;
    basicSalary: number;
    probationPeriodMonths?: number;
    createdBy: string;
}
export interface LeaveRequestData {
    tenantId: string;
    employeeId: string;
    leaveType: LeaveType;
    leaveStartDate: Date;
    leaveEndDate: Date;
    reason: string;
    emergencyLeave?: boolean;
    coveringEmployeeId?: string;
    requestedBy: string;
}
export interface PerformanceReviewData {
    tenantId: string;
    employeeId: string;
    reviewType: PerformanceReviewType;
    reviewPeriod: string;
    reviewStartDate: Date;
    reviewEndDate: Date;
    managerId: string;
    dueDate: Date;
    createdBy: string;
}
export interface TrainingEnrollmentData {
    tenantId: string;
    employeeId: string;
    trainingType: TrainingType;
    trainingTitle: string;
    scheduledStartDate: Date;
    scheduledEndDate: Date;
    mandatory?: boolean;
    trainingProvider?: string;
    createdBy: string;
}
export interface EmployeeAnalytics {
    totalEmployees: number;
    activeEmployees: number;
    newHires: number;
    separations: number;
    averageTenure: number;
    departmentBreakdown: Array<{
        department: string;
        count: number;
        percentage: number;
    }>;
    statusBreakdown: Array<{
        status: EmployeeStatus;
        count: number;
        percentage: number;
    }>;
    leaveMetrics: {
        totalLeaveRequests: number;
        pendingApprovals: number;
        averageLeaveDays: number;
        leaveUtilizationRate: number;
    };
    trainingMetrics: {
        totalTrainingHours: number;
        completedTrainings: number;
        complianceTrainingRate: number;
        averageTrainingCost: number;
    };
    performanceMetrics: {
        completedReviews: number;
        averageRating: number;
        highPerformers: number;
        improvementRequired: number;
    };
}
export declare class EmployeeService {
    private employeeRepo;
    private contractRepo;
    private leaveRepo;
    private performanceRepo;
    private trainingRepo;
    private dataSource;
    private eventEmitter;
    private readonly logger;
    constructor(employeeRepo: Repository<Employee>, contractRepo: Repository<EmployeeContract>, leaveRepo: Repository<EmployeeLeave>, performanceRepo: Repository<EmployeePerformance>, trainingRepo: Repository<EmployeeTraining>, dataSource: DataSource, eventEmitter: EventEmitter2);
    createEmployee(data: EmployeeData): Promise<Employee>;
    updateEmployeeStatus(employeeId: string, status: EmployeeStatus, effectiveDate: Date, updatedBy: string, reason?: string): Promise<Employee>;
    createContract(data: ContractData): Promise<EmployeeContract>;
    requestLeave(data: LeaveRequestData): Promise<EmployeeLeave>;
    initiatePerformanceReview(data: PerformanceReviewData): Promise<EmployeePerformance>;
    enrollInTraining(data: TrainingEnrollmentData): Promise<EmployeeTraining>;
    generateEmployeeAnalytics(tenantId: string): Promise<EmployeeAnalytics>;
    dailyHRProcesses(): Promise<void>;
    monthlyHRProcesses(): Promise<void>;
    private generateEmployeeNumber;
    private generateContractNumber;
    private generateLeaveRequestNumber;
    private generatePerformanceReviewNumber;
    private generateTrainingRecordNumber;
    private calculateWorkingDays;
    private isPaidLeave;
    private getPaymentPercentage;
    private isStatutoryLeave;
    private requiresMedicalCertificate;
    private isPetroleumSafetyTraining;
    private isHSETraining;
    private isNPAComplianceTraining;
    private requiresAssessment;
    private requiresCertification;
    private getLeaveBalance;
    private createInitialContract;
    private enrollMandatoryTrainings;
    private processEmployeeTermination;
    private processEmployeeConfirmation;
    private updateEmployeeAges;
    private checkProbationPeriods;
    private checkContractExpirations;
    private checkTrainingDueDates;
    private updateLeaveAccruals;
    private generateMonthlyHRReports;
    private processLeaveCarryovers;
    private updatePerformanceReviewSchedules;
    private processTrainingCompliance;
}
//# sourceMappingURL=employee.service.d.ts.map