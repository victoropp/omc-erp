import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format, differenceInDays, addDays, startOfYear, endOfYear, getYear } from 'date-fns';

import { Employee, EmployeeStatus, EmploymentType } from './entities/employee.entity';
import { EmployeeContract, ContractType, ContractStatus } from './entities/employee-contract.entity';
import { EmployeeLeave, LeaveType, LeaveStatus } from './entities/employee-leave.entity';
import { EmployeePerformance, PerformanceReviewType, PerformanceStatus } from './entities/employee-performance.entity';
import { EmployeeTraining, TrainingType, TrainingStatus } from './entities/employee-training.entity';

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

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeContract)
    private contractRepo: Repository<EmployeeContract>,
    @InjectRepository(EmployeeLeave)
    private leaveRepo: Repository<EmployeeLeave>,
    @InjectRepository(EmployeePerformance)
    private performanceRepo: Repository<EmployeePerformance>,
    @InjectRepository(EmployeeTraining)
    private trainingRepo: Repository<EmployeeTraining>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== EMPLOYEE MANAGEMENT =====

  async createEmployee(data: EmployeeData): Promise<Employee> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if email already exists
      const existingEmployee = await this.employeeRepo.findOne({
        where: { email: data.email }
      });

      if (existingEmployee) {
        throw new BadRequestException('Email already exists');
      }

      // Generate employee number
      const employeeNumber = await this.generateEmployeeNumber(queryRunner);

      // Calculate full name and other derived fields
      const fullName = [data.firstName, data.middleName, data.lastName]
        .filter(name => name)
        .join(' ');

      // Create employee with Ghana OMC defaults
      const employee = this.employeeRepo.create({
        ...data,
        employeeNumber,
        fullName,
        startDate: data.hireDate,
        nationality: 'Ghanaian',
        currency: 'GHS',
        payFrequency: 'MONTHLY',
        employmentType: EmploymentType.PERMANENT,
        status: EmployeeStatus.PROBATION,
        
        // Ghana Labor Law defaults
        annualLeaveEntitlement: 15,
        sickLeaveEntitlement: 12,
        maternityLeaveEntitlement: 84,
        paternityLeaveEntitlement: 7,
        compassionateLeaveEntitlement: 3,
        noticePeriodDays: 30,
        
        // Calculate probation end date (typically 6 months for new hires)
        probationEndDate: addDays(data.hireDate, 180),
        
        // Ghana OMC specific defaults
        petroleumSafetyTraining: false,
        hseCertification: false,
        
        // Performance defaults
        performanceRating: null,
        nextAppraisalDate: addDays(data.hireDate, 365), // Annual review
        
        // System defaults
        employeePortalAccess: true,
        backgroundCheckCompleted: false,
        medicalExamCompleted: false,
        drugTestCompleted: false,
      });

      const savedEmployee = await queryRunner.manager.save(employee);

      // Create initial contract if employee is permanent
      if (data.basicSalary > 0) {
        await this.createInitialContract(queryRunner, savedEmployee, data.createdBy);
      }

      // Enroll in mandatory trainings
      await this.enrollMandatoryTrainings(queryRunner, savedEmployee, data.createdBy);

      await queryRunner.commitTransaction();

      // Emit employee created event
      this.eventEmitter.emit('employee.created', {
        employeeId: savedEmployee.id,
        employeeNumber: savedEmployee.employeeNumber,
        fullName: savedEmployee.fullName,
        department: data.department,
        jobTitle: data.jobTitle,
        tenantId: data.tenantId,
      });

      this.logger.log(`Employee created: ${savedEmployee.employeeNumber} - ${savedEmployee.fullName}, Department: ${data.department}`);
      return savedEmployee;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateEmployeeStatus(
    employeeId: string, 
    status: EmployeeStatus, 
    effectiveDate: Date,
    updatedBy: string,
    reason?: string
  ): Promise<Employee> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      const previousStatus = employee.status;

      // Update employee status
      await queryRunner.manager.update(Employee, { id: employeeId }, {
        status,
        updatedBy,
        updatedAt: new Date(),
        ...(status === EmployeeStatus.TERMINATED && { terminationDate: effectiveDate }),
        ...(status === EmployeeStatus.RETIRED && { retirementDate: effectiveDate }),
        ...(status === EmployeeStatus.ACTIVE && previousStatus === EmployeeStatus.PROBATION && { 
          confirmationDate: effectiveDate 
        }),
      });

      // Handle status-specific actions
      if (status === EmployeeStatus.TERMINATED) {
        await this.processEmployeeTermination(queryRunner, employeeId, effectiveDate, reason);
      } else if (status === EmployeeStatus.ACTIVE && previousStatus === EmployeeStatus.PROBATION) {
        await this.processEmployeeConfirmation(queryRunner, employeeId, effectiveDate);
      }

      await queryRunner.commitTransaction();

      // Emit status change event
      this.eventEmitter.emit('employee.status-changed', {
        employeeId,
        previousStatus,
        newStatus: status,
        effectiveDate,
        reason,
      });

      const updatedEmployee = await this.employeeRepo.findOne({ where: { id: employeeId } });
      this.logger.log(`Employee status updated: ${employee.employeeNumber}, ${previousStatus} → ${status}`);
      
      return updatedEmployee!;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== CONTRACT MANAGEMENT =====

  async createContract(data: ContractData): Promise<EmployeeContract> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Generate contract number
      const contractNumber = await this.generateContractNumber(queryRunner);

      // Calculate total package value
      const totalPackageValue = data.basicSalary;

      const contract = this.contractRepo.create({
        ...data,
        contractNumber,
        totalPackageValue,
        contractValueTotal: totalPackageValue * 12, // Annual value
        currency: 'GHS',
        payFrequency: 'MONTHLY',
        workingHoursPerWeek: 40,
        workingDaysPerWeek: 5,
        overtimeEligible: true,
        
        // Ghana Labor Law defaults
        annualLeaveDays: 15,
        sickLeaveDays: 12,
        maternityLeaveDays: 84,
        paternityLeaveDays: 7,
        compassionateLeaveDays: 3,
        noticePeriodDays: 30,
        
        // Ghana OMC specific clauses
        petroleumSafetyComplianceRequired: true,
        hseTrainingRequired: true,
        confidentialityAgreement: true,
        intellectualPropertyClause: true,
        codeOfConductAcceptance: true,
        
        // Benefits
        healthInsuranceCoverage: true,
        socialSecurityRegistration: true,
        pensionSchemeEnrollment: true,
        
        contractStatus: ContractStatus.DRAFT,
      });

      const savedContract = await queryRunner.manager.save(contract);

      // Update employee's basic salary if this is an active contract
      if (data.contractStartDate <= new Date()) {
        await queryRunner.manager.update(Employee, { id: data.employeeId }, {
          basicSalary: data.basicSalary,
          updatedAt: new Date(),
        });
      }

      await queryRunner.commitTransaction();

      // Emit contract created event
      this.eventEmitter.emit('contract.created', {
        contractId: savedContract.id,
        employeeId: data.employeeId,
        contractNumber: savedContract.contractNumber,
        contractType: data.contractType,
        basicSalary: data.basicSalary,
      });

      this.logger.log(`Contract created: ${savedContract.contractNumber} for ${employee.fullName}, Salary: GHS ${data.basicSalary}`);
      return savedContract;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== LEAVE MANAGEMENT =====

  async requestLeave(data: LeaveRequestData): Promise<EmployeeLeave> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await this.employeeRepo.findOne({ 
        where: { id: data.employeeId },
        relations: ['reportingManager']
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Generate leave request number
      const leaveRequestNumber = await this.generateLeaveRequestNumber(queryRunner);

      // Calculate leave days
      const totalDays = differenceInDays(data.leaveEndDate, data.leaveStartDate) + 1;
      const workingDays = this.calculateWorkingDays(data.leaveStartDate, data.leaveEndDate);

      // Check leave balance for annual leave
      if (data.leaveType === LeaveType.ANNUAL_LEAVE) {
        const currentBalance = await this.getLeaveBalance(data.employeeId, data.leaveType);
        if (currentBalance < workingDays) {
          throw new BadRequestException('Insufficient leave balance');
        }
      }

      const leaveRequest = this.leaveRepo.create({
        ...data,
        leaveRequestNumber,
        totalDaysRequested: totalDays,
        workingDaysRequested: workingDays,
        requestDate: new Date(),
        
        // Payment defaults
        paidLeave: this.isPaidLeave(data.leaveType),
        paymentPercentage: this.getPaymentPercentage(data.leaveType),
        paymentStatus: this.isPaidLeave(data.leaveType) ? 'PAID' : 'NOT_APPLICABLE',
        
        // Ghana compliance
        ghanaLaborActCompliant: true,
        statutoryLeave: this.isStatutoryLeave(data.leaveType),
        medicalCertificateRequired: this.requiresMedicalCertificate(data.leaveType, workingDays),
        
        // Approval workflow
        immediateSupervisorId: employee.reportingManagerId,
        immediateSupervisorName: employee.reportingManagerName,
        
        // Cost center from employee
        costCenter: employee.costCenter,
        department: employee.department,
        location: employee.workLocation,
        
        leaveStatus: data.emergencyLeave ? LeaveStatus.APPROVED : LeaveStatus.SUBMITTED,
      });

      const savedLeave = await queryRunner.manager.save(leaveRequest);

      await queryRunner.commitTransaction();

      // Emit leave requested event
      this.eventEmitter.emit('leave.requested', {
        leaveId: savedLeave.id,
        employeeId: data.employeeId,
        employeeName: employee.fullName,
        leaveType: data.leaveType,
        totalDays: workingDays,
        emergencyLeave: data.emergencyLeave,
      });

      this.logger.log(`Leave requested: ${employee.fullName}, Type: ${data.leaveType}, Days: ${workingDays}`);
      return savedLeave;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== PERFORMANCE MANAGEMENT =====

  async initiatePerformanceReview(data: PerformanceReviewData): Promise<EmployeePerformance> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
      const manager = await this.employeeRepo.findOne({ where: { id: data.managerId } });

      if (!employee || !manager) {
        throw new NotFoundException('Employee or Manager not found');
      }

      // Generate review number
      const reviewNumber = await this.generatePerformanceReviewNumber(queryRunner);

      const performanceReview = this.performanceRepo.create({
        ...data,
        performanceReviewNumber: reviewNumber,
        managerName: manager.fullName,
        performanceStatus: PerformanceStatus.SELF_ASSESSMENT_PENDING,
        
        // Cost center and reporting
        costCenter: employee.costCenter,
        department: employee.department,
        division: employee.division,
        location: employee.workLocation,
        
        // Default settings
        selfAssessmentSubmitted: false,
        developmentPlanCreated: false,
        
        // Performance defaults
        retentionRisk: 'LOW',
        highPotentialEmployee: false,
        promotionReady: false,
      });

      const savedReview = await queryRunner.manager.save(performanceReview);

      // Update employee's next appraisal date
      if (data.reviewType === PerformanceReviewType.ANNUAL) {
        await queryRunner.manager.update(Employee, { id: data.employeeId }, {
          nextAppraisalDate: addDays(data.reviewEndDate, 365),
          updatedAt: new Date(),
        });
      }

      await queryRunner.commitTransaction();

      // Emit performance review initiated event
      this.eventEmitter.emit('performance-review.initiated', {
        reviewId: savedReview.id,
        employeeId: data.employeeId,
        employeeName: employee.fullName,
        reviewType: data.reviewType,
        reviewPeriod: data.reviewPeriod,
        managerId: data.managerId,
      });

      this.logger.log(`Performance review initiated: ${employee.fullName}, Period: ${data.reviewPeriod}, Type: ${data.reviewType}`);
      return savedReview;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== TRAINING MANAGEMENT =====

  async enrollInTraining(data: TrainingEnrollmentData): Promise<EmployeeTraining> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Generate training record number
      const trainingRecordNumber = await this.generateTrainingRecordNumber(queryRunner);

      // Calculate training hours
      const trainingDays = differenceInDays(data.scheduledEndDate, data.scheduledStartDate) + 1;
      const scheduledHours = trainingDays * 8; // Assuming 8 hours per day

      const trainingEnrollment = this.trainingRepo.create({
        ...data,
        trainingRecordNumber,
        trainingDays,
        scheduledHours,
        dailyHours: 8,
        
        // Registration details
        registrationDate: new Date(),
        enrollmentDate: new Date(),
        
        // Training details
        deliveryMethod: 'CLASSROOM',
        trainingPriority: data.mandatory ? 'CRITICAL' : 'MEDIUM',
        mandatoryTraining: data.mandatory || false,
        
        // Ghana OMC specific
        petroleumSafetyTraining: this.isPetroleumSafetyTraining(data.trainingType),
        hseTraining: this.isHSETraining(data.trainingType),
        npaComplianceTraining: this.isNPAComplianceTraining(data.trainingType),
        
        // Assessment and certification
        assessmentRequired: this.requiresAssessment(data.trainingType),
        certificationRequired: this.requiresCertification(data.trainingType),
        passingScore: 70,
        
        // Approval
        managerApprovalRequired: !data.mandatory,
        managerId: employee.reportingManagerId,
        managerName: employee.reportingManagerName,
        
        // Cost center
        costCenter: employee.costCenter,
        department: employee.department,
        location: employee.workLocation,
        
        // Status
        trainingStatus: data.mandatory ? TrainingStatus.ENROLLED : TrainingStatus.PLANNED,
        currency: 'GHS',
      });

      const savedTraining = await queryRunner.manager.save(trainingEnrollment);

      await queryRunner.commitTransaction();

      // Emit training enrollment event
      this.eventEmitter.emit('training.enrolled', {
        trainingId: savedTraining.id,
        employeeId: data.employeeId,
        employeeName: employee.fullName,
        trainingTitle: data.trainingTitle,
        trainingType: data.trainingType,
        mandatory: data.mandatory,
      });

      this.logger.log(`Training enrollment: ${employee.fullName}, Training: ${data.trainingTitle}, Type: ${data.trainingType}`);
      return savedTraining;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== REPORTING AND ANALYTICS =====

  async generateEmployeeAnalytics(tenantId: string): Promise<EmployeeAnalytics> {
    const employees = await this.employeeRepo.find({ where: { tenantId } });
    const currentYear = getYear(new Date());
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === EmployeeStatus.ACTIVE).length;

    // New hires this year
    const newHires = employees.filter(e => 
      e.hireDate >= yearStart && e.hireDate <= yearEnd
    ).length;

    // Separations this year
    const separations = employees.filter(e => 
      e.terminationDate && e.terminationDate >= yearStart && e.terminationDate <= yearEnd
    ).length;

    // Average tenure
    const totalTenure = employees
      .filter(e => e.status === EmployeeStatus.ACTIVE)
      .reduce((sum, e) => sum + differenceInDays(new Date(), e.hireDate), 0);
    const averageTenure = activeEmployees > 0 ? Math.round(totalTenure / activeEmployees) : 0;

    // Department breakdown
    const departmentMap = new Map<string, number>();
    employees.forEach(e => {
      const count = departmentMap.get(e.department) || 0;
      departmentMap.set(e.department, count + 1);
    });

    const departmentBreakdown = Array.from(departmentMap.entries()).map(([department, count]) => ({
      department,
      count,
      percentage: totalEmployees > 0 ? (count / totalEmployees) * 100 : 0
    }));

    // Status breakdown
    const statusMap = new Map<EmployeeStatus, number>();
    employees.forEach(e => {
      const count = statusMap.get(e.status) || 0;
      statusMap.set(e.status, count + 1);
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalEmployees > 0 ? (count / totalEmployees) * 100 : 0
    }));

    // Leave metrics
    const leaves = await this.leaveRepo.find({
      where: { tenantId, leaveStartDate: Between(yearStart, yearEnd) }
    });

    const totalLeaveRequests = leaves.length;
    const pendingApprovals = leaves.filter(l => l.leaveStatus === LeaveStatus.PENDING_APPROVAL).length;
    const totalLeaveDays = leaves.reduce((sum, l) => sum + l.workingDaysApproved, 0);
    const averageLeaveDays = totalLeaveRequests > 0 ? totalLeaveDays / totalLeaveRequests : 0;
    const leaveUtilizationRate = activeEmployees > 0 ? (totalLeaveDays / (activeEmployees * 15)) * 100 : 0;

    // Training metrics
    const trainings = await this.trainingRepo.find({
      where: { tenantId, scheduledStartDate: Between(yearStart, yearEnd) }
    });

    const totalTrainingHours = trainings.reduce((sum, t) => sum + t.actualHours, 0);
    const completedTrainings = trainings.filter(t => t.trainingStatus === TrainingStatus.COMPLETED).length;
    const complianceTrainings = trainings.filter(t => t.mandatoryTraining && t.trainingStatus === TrainingStatus.COMPLETED);
    const complianceTrainingRate = trainings.filter(t => t.mandatoryTraining).length > 0 ? 
      (complianceTrainings.length / trainings.filter(t => t.mandatoryTraining).length) * 100 : 0;
    const totalTrainingCost = trainings.reduce((sum, t) => sum + t.totalCost, 0);
    const averageTrainingCost = completedTrainings > 0 ? totalTrainingCost / completedTrainings : 0;

    // Performance metrics
    const performanceReviews = await this.performanceRepo.find({
      where: { tenantId, reviewStartDate: Between(yearStart, yearEnd) }
    });

    const completedReviews = performanceReviews.filter(p => p.performanceStatus === PerformanceStatus.FINALIZED).length;
    const ratingsSum = performanceReviews
      .filter(p => p.overallScore !== null)
      .reduce((sum, p) => sum + p.overallScore!, 0);
    const averageRating = completedReviews > 0 ? ratingsSum / completedReviews : 0;
    const highPerformers = performanceReviews.filter(p => p.overallScore && p.overallScore >= 4.0).length;
    const improvementRequired = performanceReviews.filter(p => p.performanceImprovementRequired).length;

    return {
      totalEmployees,
      activeEmployees,
      newHires,
      separations,
      averageTenure,
      departmentBreakdown,
      statusBreakdown,
      leaveMetrics: {
        totalLeaveRequests,
        pendingApprovals,
        averageLeaveDays,
        leaveUtilizationRate,
      },
      trainingMetrics: {
        totalTrainingHours,
        completedTrainings,
        complianceTrainingRate,
        averageTrainingCost,
      },
      performanceMetrics: {
        completedReviews,
        averageRating,
        highPerformers,
        improvementRequired,
      }
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyHRProcesses(): Promise<void> {
    this.logger.log('Starting daily HR processes');

    try {
      // Update employee ages
      await this.updateEmployeeAges();

      // Check probation periods
      await this.checkProbationPeriods();

      // Check contract expirations
      await this.checkContractExpirations();

      // Check training due dates
      await this.checkTrainingDueDates();

      // Update leave accruals
      await this.updateLeaveAccruals();

      this.logger.log('Daily HR processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily HR processes:', error);
    }
  }

  @Cron('0 0 1 * *') // First day of every month
  async monthlyHRProcesses(): Promise<void> {
    this.logger.log('Starting monthly HR processes');

    try {
      // Generate HR reports
      await this.generateMonthlyHRReports();

      // Process annual leave carryovers
      await this.processLeaveCarryovers();

      // Update performance review schedules
      await this.updatePerformanceReviewSchedules();

      // Process training compliance
      await this.processTrainingCompliance();

      this.logger.log('Monthly HR processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly HR processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async generateEmployeeNumber(queryRunner: QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM employees WHERE employee_number LIKE $1`,
      [`EMP-${year}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `EMP-${year}-${sequence}`;
  }

  private async generateContractNumber(queryRunner: QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM employee_contracts WHERE contract_number LIKE $1`,
      [`CON-${year}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `CON-${year}-${sequence}`;
  }

  private async generateLeaveRequestNumber(queryRunner: QueryRunner): Promise<string> {
    const yearMonth = format(new Date(), 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM employee_leaves WHERE leave_request_number LIKE $1`,
      [`LEV-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `LEV-${yearMonth}-${sequence}`;
  }

  private async generatePerformanceReviewNumber(queryRunner: QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM employee_performance WHERE performance_review_number LIKE $1`,
      [`PER-${year}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `PER-${year}-${sequence}`;
  }

  private async generateTrainingRecordNumber(queryRunner: QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM employee_training WHERE training_record_number LIKE $1`,
      [`TRN-${year}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `TRN-${year}-${sequence}`;
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Simple calculation excluding weekends
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  private isPaidLeave(leaveType: LeaveType): boolean {
    const paidLeaveTypes = [
      LeaveType.ANNUAL_LEAVE,
      LeaveType.SICK_LEAVE,
      LeaveType.MATERNITY_LEAVE,
      LeaveType.PATERNITY_LEAVE,
      LeaveType.COMPASSIONATE_LEAVE,
      LeaveType.PUBLIC_HOLIDAY,
    ];
    return paidLeaveTypes.includes(leaveType);
  }

  private getPaymentPercentage(leaveType: LeaveType): number {
    const paymentRates = {
      [LeaveType.ANNUAL_LEAVE]: 100,
      [LeaveType.SICK_LEAVE]: 100,
      [LeaveType.MATERNITY_LEAVE]: 100,
      [LeaveType.PATERNITY_LEAVE]: 100,
      [LeaveType.COMPASSIONATE_LEAVE]: 100,
      [LeaveType.STUDY_LEAVE]: 50,
      [LeaveType.UNPAID_LEAVE]: 0,
    };
    return paymentRates[leaveType] || 0;
  }

  private isStatutoryLeave(leaveType: LeaveType): boolean {
    const statutoryLeaves = [
      LeaveType.MATERNITY_LEAVE,
      LeaveType.PATERNITY_LEAVE,
      LeaveType.SICK_LEAVE,
    ];
    return statutoryLeaves.includes(leaveType);
  }

  private requiresMedicalCertificate(leaveType: LeaveType, days: number): boolean {
    return leaveType === LeaveType.SICK_LEAVE && days > 3;
  }

  private isPetroleumSafetyTraining(trainingType: TrainingType): boolean {
    return trainingType === TrainingType.SAFETY_TRAINING;
  }

  private isHSETraining(trainingType: TrainingType): boolean {
    return trainingType === TrainingType.SAFETY_TRAINING || trainingType === TrainingType.COMPLIANCE_TRAINING;
  }

  private isNPAComplianceTraining(trainingType: TrainingType): boolean {
    return trainingType === TrainingType.COMPLIANCE_TRAINING;
  }

  private requiresAssessment(trainingType: TrainingType): boolean {
    const assessmentRequired = [
      TrainingType.SAFETY_TRAINING,
      TrainingType.COMPLIANCE_TRAINING,
      TrainingType.CERTIFICATION,
      TrainingType.TECHNICAL_TRAINING,
    ];
    return assessmentRequired.includes(trainingType);
  }

  private requiresCertification(trainingType: TrainingType): boolean {
    const certificationRequired = [
      TrainingType.SAFETY_TRAINING,
      TrainingType.CERTIFICATION,
    ];
    return certificationRequired.includes(trainingType);
  }

  private async getLeaveBalance(employeeId: string, leaveType: LeaveType): Promise<number> {
    // Simplified leave balance calculation
    const currentYear = getYear(new Date());
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) return 0;

    const usedLeave = await this.leaveRepo
      .createQueryBuilder('leave')
      .select('SUM(leave.workingDaysTaken)', 'total')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.leaveType = :leaveType', { leaveType })
      .andWhere('leave.leaveStartDate >= :yearStart', { yearStart })
      .andWhere('leave.leaveEndDate <= :yearEnd', { yearEnd })
      .andWhere('leave.leaveStatus IN (:...statuses)', { 
        statuses: [LeaveStatus.APPROVED, LeaveStatus.TAKEN] 
      })
      .getRawOne();

    const usedDays = parseFloat(usedLeave?.total || '0');
    const entitlement = employee.annualLeaveEntitlement || 15;

    return Math.max(0, entitlement - usedDays);
  }

  // Placeholder methods for complex processes
  private async createInitialContract(queryRunner: QueryRunner, employee: Employee, createdBy: string): Promise<void> {}
  private async enrollMandatoryTrainings(queryRunner: QueryRunner, employee: Employee, createdBy: string): Promise<void> {}
  private async processEmployeeTermination(queryRunner: QueryRunner, employeeId: string, effectiveDate: Date, reason?: string): Promise<void> {}
  private async processEmployeeConfirmation(queryRunner: QueryRunner, employeeId: string, effectiveDate: Date): Promise<void> {}
  private async updateEmployeeAges(): Promise<void> {}
  private async checkProbationPeriods(): Promise<void> {}
  private async checkContractExpirations(): Promise<void> {}
  private async checkTrainingDueDates(): Promise<void> {}
  private async updateLeaveAccruals(): Promise<void> {}
  private async generateMonthlyHRReports(): Promise<void> {}
  private async processLeaveCarryovers(): Promise<void> {}
  private async updatePerformanceReviewSchedules(): Promise<void> {}
  private async processTrainingCompliance(): Promise<void> {}
}