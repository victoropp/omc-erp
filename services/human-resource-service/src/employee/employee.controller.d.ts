import { EmployeeService, EmployeeData, ContractData, LeaveRequestData, PerformanceReviewData, TrainingEnrollmentData } from './employee.service';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { EmployeeContract } from './entities/employee-contract.entity';
import { EmployeeLeave } from './entities/employee-leave.entity';
import { EmployeePerformance } from './entities/employee-performance.entity';
import { EmployeeTraining } from './entities/employee-training.entity';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    createEmployee(createEmployeeDto: EmployeeData): Promise<Employee>;
    getEmployee(id: string): Promise<Employee>;
    updateEmployee(id: string, updateEmployeeDto: Partial<EmployeeData>): Promise<Employee>;
    updateEmployeeStatus(id: string, statusDto: {
        status: EmployeeStatus;
        effectiveDate: Date;
        updatedBy: string;
        reason?: string;
    }): Promise<Employee>;
    getAllEmployees(tenantId: string, department?: string, status?: EmployeeStatus, page?: number, limit?: number): Promise<Employee[]>;
    getEmployeeAnalytics(tenantId: string): Promise<import("./employee.service").EmployeeAnalytics>;
    createContract(employeeId: string, createContractDto: Omit<ContractData, 'employeeId'>): Promise<EmployeeContract>;
    getEmployeeContracts(employeeId: string): Promise<EmployeeContract[]>;
    getActiveContract(employeeId: string): Promise<EmployeeContract>;
    requestLeave(employeeId: string, leaveRequestDto: Omit<LeaveRequestData, 'employeeId'>): Promise<EmployeeLeave>;
    getEmployeeLeaveRequests(employeeId: string, year?: number, status?: string): Promise<EmployeeLeave[]>;
    getLeaveBalance(employeeId: string, leaveType?: string): Promise<any>;
    approveLeave(leaveId: string, approvalDto: {
        approvedBy: string;
        approvedDays: number;
        comments?: string;
    }): Promise<EmployeeLeave>;
    rejectLeave(leaveId: string, rejectionDto: {
        rejectedBy: string;
        rejectionReason: string;
    }): Promise<EmployeeLeave>;
    initiatePerformanceReview(employeeId: string, reviewDto: Omit<PerformanceReviewData, 'employeeId'>): Promise<EmployeePerformance>;
    getEmployeePerformanceReviews(employeeId: string, year?: number): Promise<EmployeePerformance[]>;
    submitSelfAssessment(reviewId: string, selfAssessmentDto: {
        selfRatingOverall: number;
        selfAssessmentComments: string;
        keyAchievements: string;
        challengesFaced: string;
        developmentNeedsSelf: string;
        careerAspirations: string;
    }): Promise<EmployeePerformance>;
    submitManagerAssessment(reviewId: string, managerAssessmentDto: {
        managerRatingOverall: number;
        managerComments: string;
        managerFeedback: string;
        areasOfStrength: string;
        areasForImprovement: string;
        developmentGoals: string;
    }): Promise<EmployeePerformance>;
    enrollInTraining(employeeId: string, trainingDto: Omit<TrainingEnrollmentData, 'employeeId'>): Promise<EmployeeTraining>;
    getEmployeeTrainingRecords(employeeId: string, year?: number, trainingType?: string): Promise<EmployeeTraining[]>;
    completeTraining(trainingId: string, completionDto: {
        actualEndDate: Date;
        actualHours: number;
        assessmentScore?: number;
        overallSatisfactionRating?: number;
        employeeFeedback?: string;
        completedBy: string;
    }): Promise<EmployeeTraining>;
    getTrainingCompliance(employeeId: string): Promise<any>;
    getHeadcountReport(tenantId: string, department?: string, startDate?: string, endDate?: string): Promise<any>;
    getTurnoverReport(tenantId: string, year?: number): Promise<any>;
    getLeaveUtilizationReport(tenantId: string, year?: number, department?: string): Promise<any>;
    getTrainingSummaryReport(tenantId: string, year?: number, trainingType?: string): Promise<any>;
    getPerformanceSummaryReport(tenantId: string, reviewPeriod?: string, department?: string): Promise<any>;
}
//# sourceMappingURL=employee.controller.d.ts.map