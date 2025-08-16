"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmployeeService_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const date_fns_1 = require("date-fns");
const employee_entity_1 = require("./entities/employee.entity");
const employee_contract_entity_1 = require("./entities/employee-contract.entity");
const employee_leave_entity_1 = require("./entities/employee-leave.entity");
const employee_performance_entity_1 = require("./entities/employee-performance.entity");
const employee_training_entity_1 = require("./entities/employee-training.entity");
let EmployeeService = EmployeeService_1 = class EmployeeService {
    employeeRepo;
    contractRepo;
    leaveRepo;
    performanceRepo;
    trainingRepo;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(EmployeeService_1.name);
    constructor(employeeRepo, contractRepo, leaveRepo, performanceRepo, trainingRepo, dataSource, eventEmitter) {
        this.employeeRepo = employeeRepo;
        this.contractRepo = contractRepo;
        this.leaveRepo = leaveRepo;
        this.performanceRepo = performanceRepo;
        this.trainingRepo = trainingRepo;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    // ===== EMPLOYEE MANAGEMENT =====
    async createEmployee(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Check if email already exists
            const existingEmployee = await this.employeeRepo.findOne({
                where: { email: data.email }
            });
            if (existingEmployee) {
                throw new common_1.BadRequestException('Email already exists');
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
                employmentType: employee_entity_1.EmploymentType.PERMANENT,
                status: employee_entity_1.EmployeeStatus.PROBATION,
                // Ghana Labor Law defaults
                annualLeaveEntitlement: 15,
                sickLeaveEntitlement: 12,
                maternityLeaveEntitlement: 84,
                paternityLeaveEntitlement: 7,
                compassionateLeaveEntitlement: 3,
                noticePeriodDays: 30,
                // Calculate probation end date (typically 6 months for new hires)
                probationEndDate: (0, date_fns_1.addDays)(data.hireDate, 180),
                // Ghana OMC specific defaults
                petroleumSafetyTraining: false,
                hseCertification: false,
                // Performance defaults
                performanceRating: null,
                nextAppraisalDate: (0, date_fns_1.addDays)(data.hireDate, 365), // Annual review
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateEmployeeStatus(employeeId, status, effectiveDate, updatedBy, reason) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
            const previousStatus = employee.status;
            // Update employee status
            await queryRunner.manager.update(employee_entity_1.Employee, { id: employeeId }, {
                status,
                updatedBy,
                updatedAt: new Date(),
                ...(status === employee_entity_1.EmployeeStatus.TERMINATED && { terminationDate: effectiveDate }),
                ...(status === employee_entity_1.EmployeeStatus.RETIRED && { retirementDate: effectiveDate }),
                ...(status === employee_entity_1.EmployeeStatus.ACTIVE && previousStatus === employee_entity_1.EmployeeStatus.PROBATION && {
                    confirmationDate: effectiveDate
                }),
            });
            // Handle status-specific actions
            if (status === employee_entity_1.EmployeeStatus.TERMINATED) {
                await this.processEmployeeTermination(queryRunner, employeeId, effectiveDate, reason);
            }
            else if (status === employee_entity_1.EmployeeStatus.ACTIVE && previousStatus === employee_entity_1.EmployeeStatus.PROBATION) {
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
            return updatedEmployee;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== CONTRACT MANAGEMENT =====
    async createContract(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
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
                contractStatus: employee_contract_entity_1.ContractStatus.DRAFT,
            });
            const savedContract = await queryRunner.manager.save(contract);
            // Update employee's basic salary if this is an active contract
            if (data.contractStartDate <= new Date()) {
                await queryRunner.manager.update(employee_entity_1.Employee, { id: data.employeeId }, {
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== LEAVE MANAGEMENT =====
    async requestLeave(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({
                where: { id: data.employeeId },
                relations: ['reportingManager']
            });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
            // Generate leave request number
            const leaveRequestNumber = await this.generateLeaveRequestNumber(queryRunner);
            // Calculate leave days
            const totalDays = (0, date_fns_1.differenceInDays)(data.leaveEndDate, data.leaveStartDate) + 1;
            const workingDays = this.calculateWorkingDays(data.leaveStartDate, data.leaveEndDate);
            // Check leave balance for annual leave
            if (data.leaveType === employee_leave_entity_1.LeaveType.ANNUAL_LEAVE) {
                const currentBalance = await this.getLeaveBalance(data.employeeId, data.leaveType);
                if (currentBalance < workingDays) {
                    throw new common_1.BadRequestException('Insufficient leave balance');
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
                leaveStatus: data.emergencyLeave ? employee_leave_entity_1.LeaveStatus.APPROVED : employee_leave_entity_1.LeaveStatus.SUBMITTED,
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== PERFORMANCE MANAGEMENT =====
    async initiatePerformanceReview(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
            const manager = await this.employeeRepo.findOne({ where: { id: data.managerId } });
            if (!employee || !manager) {
                throw new common_1.NotFoundException('Employee or Manager not found');
            }
            // Generate review number
            const reviewNumber = await this.generatePerformanceReviewNumber(queryRunner);
            const performanceReview = this.performanceRepo.create({
                ...data,
                performanceReviewNumber: reviewNumber,
                managerName: manager.fullName,
                performanceStatus: employee_performance_entity_1.PerformanceStatus.SELF_ASSESSMENT_PENDING,
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
            if (data.reviewType === employee_performance_entity_1.PerformanceReviewType.ANNUAL) {
                await queryRunner.manager.update(employee_entity_1.Employee, { id: data.employeeId }, {
                    nextAppraisalDate: (0, date_fns_1.addDays)(data.reviewEndDate, 365),
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== TRAINING MANAGEMENT =====
    async enrollInTraining(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({ where: { id: data.employeeId } });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
            // Generate training record number
            const trainingRecordNumber = await this.generateTrainingRecordNumber(queryRunner);
            // Calculate training hours
            const trainingDays = (0, date_fns_1.differenceInDays)(data.scheduledEndDate, data.scheduledStartDate) + 1;
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
                trainingStatus: data.mandatory ? employee_training_entity_1.TrainingStatus.ENROLLED : employee_training_entity_1.TrainingStatus.PLANNED,
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== REPORTING AND ANALYTICS =====
    async generateEmployeeAnalytics(tenantId) {
        const employees = await this.employeeRepo.find({ where: { tenantId } });
        const currentYear = (0, date_fns_1.getYear)(new Date());
        const yearStart = (0, date_fns_1.startOfYear)(new Date());
        const yearEnd = (0, date_fns_1.endOfYear)(new Date());
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(e => e.status === employee_entity_1.EmployeeStatus.ACTIVE).length;
        // New hires this year
        const newHires = employees.filter(e => e.hireDate >= yearStart && e.hireDate <= yearEnd).length;
        // Separations this year
        const separations = employees.filter(e => e.terminationDate && e.terminationDate >= yearStart && e.terminationDate <= yearEnd).length;
        // Average tenure
        const totalTenure = employees
            .filter(e => e.status === employee_entity_1.EmployeeStatus.ACTIVE)
            .reduce((sum, e) => sum + (0, date_fns_1.differenceInDays)(new Date(), e.hireDate), 0);
        const averageTenure = activeEmployees > 0 ? Math.round(totalTenure / activeEmployees) : 0;
        // Department breakdown
        const departmentMap = new Map();
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
        const statusMap = new Map();
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
            where: { tenantId, leaveStartDate: (0, typeorm_2.Between)(yearStart, yearEnd) }
        });
        const totalLeaveRequests = leaves.length;
        const pendingApprovals = leaves.filter(l => l.leaveStatus === employee_leave_entity_1.LeaveStatus.PENDING_APPROVAL).length;
        const totalLeaveDays = leaves.reduce((sum, l) => sum + l.workingDaysApproved, 0);
        const averageLeaveDays = totalLeaveRequests > 0 ? totalLeaveDays / totalLeaveRequests : 0;
        const leaveUtilizationRate = activeEmployees > 0 ? (totalLeaveDays / (activeEmployees * 15)) * 100 : 0;
        // Training metrics
        const trainings = await this.trainingRepo.find({
            where: { tenantId, scheduledStartDate: (0, typeorm_2.Between)(yearStart, yearEnd) }
        });
        const totalTrainingHours = trainings.reduce((sum, t) => sum + t.actualHours, 0);
        const completedTrainings = trainings.filter(t => t.trainingStatus === employee_training_entity_1.TrainingStatus.COMPLETED).length;
        const complianceTrainings = trainings.filter(t => t.mandatoryTraining && t.trainingStatus === employee_training_entity_1.TrainingStatus.COMPLETED);
        const complianceTrainingRate = trainings.filter(t => t.mandatoryTraining).length > 0 ?
            (complianceTrainings.length / trainings.filter(t => t.mandatoryTraining).length) * 100 : 0;
        const totalTrainingCost = trainings.reduce((sum, t) => sum + t.totalCost, 0);
        const averageTrainingCost = completedTrainings > 0 ? totalTrainingCost / completedTrainings : 0;
        // Performance metrics
        const performanceReviews = await this.performanceRepo.find({
            where: { tenantId, reviewStartDate: (0, typeorm_2.Between)(yearStart, yearEnd) }
        });
        const completedReviews = performanceReviews.filter(p => p.performanceStatus === employee_performance_entity_1.PerformanceStatus.FINALIZED).length;
        const ratingsSum = performanceReviews
            .filter(p => p.overallScore !== null)
            .reduce((sum, p) => sum + p.overallScore, 0);
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
    async dailyHRProcesses() {
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
        }
        catch (error) {
            this.logger.error('Failed to complete daily HR processes:', error);
        }
    }
    async monthlyHRProcesses() {
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
        }
        catch (error) {
            this.logger.error('Failed to complete monthly HR processes:', error);
        }
    }
    // ===== PRIVATE HELPER METHODS =====
    async generateEmployeeNumber(queryRunner) {
        const year = new Date().getFullYear();
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM employees WHERE employee_number LIKE $1`, [`EMP-${year}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `EMP-${year}-${sequence}`;
    }
    async generateContractNumber(queryRunner) {
        const year = new Date().getFullYear();
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM employee_contracts WHERE contract_number LIKE $1`, [`CON-${year}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `CON-${year}-${sequence}`;
    }
    async generateLeaveRequestNumber(queryRunner) {
        const yearMonth = (0, date_fns_1.format)(new Date(), 'yyyyMM');
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM employee_leaves WHERE leave_request_number LIKE $1`, [`LEV-${yearMonth}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
        return `LEV-${yearMonth}-${sequence}`;
    }
    async generatePerformanceReviewNumber(queryRunner) {
        const year = new Date().getFullYear();
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM employee_performance WHERE performance_review_number LIKE $1`, [`PER-${year}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `PER-${year}-${sequence}`;
    }
    async generateTrainingRecordNumber(queryRunner) {
        const year = new Date().getFullYear();
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM employee_training WHERE training_record_number LIKE $1`, [`TRN-${year}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `TRN-${year}-${sequence}`;
    }
    calculateWorkingDays(startDate, endDate) {
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
    isPaidLeave(leaveType) {
        const paidLeaveTypes = [
            employee_leave_entity_1.LeaveType.ANNUAL_LEAVE,
            employee_leave_entity_1.LeaveType.SICK_LEAVE,
            employee_leave_entity_1.LeaveType.MATERNITY_LEAVE,
            employee_leave_entity_1.LeaveType.PATERNITY_LEAVE,
            employee_leave_entity_1.LeaveType.COMPASSIONATE_LEAVE,
            employee_leave_entity_1.LeaveType.PUBLIC_HOLIDAY,
        ];
        return paidLeaveTypes.includes(leaveType);
    }
    getPaymentPercentage(leaveType) {
        const paymentRates = {
            [employee_leave_entity_1.LeaveType.ANNUAL_LEAVE]: 100,
            [employee_leave_entity_1.LeaveType.SICK_LEAVE]: 100,
            [employee_leave_entity_1.LeaveType.MATERNITY_LEAVE]: 100,
            [employee_leave_entity_1.LeaveType.PATERNITY_LEAVE]: 100,
            [employee_leave_entity_1.LeaveType.COMPASSIONATE_LEAVE]: 100,
            [employee_leave_entity_1.LeaveType.STUDY_LEAVE]: 50,
            [employee_leave_entity_1.LeaveType.UNPAID_LEAVE]: 0,
        };
        return paymentRates[leaveType] || 0;
    }
    isStatutoryLeave(leaveType) {
        const statutoryLeaves = [
            employee_leave_entity_1.LeaveType.MATERNITY_LEAVE,
            employee_leave_entity_1.LeaveType.PATERNITY_LEAVE,
            employee_leave_entity_1.LeaveType.SICK_LEAVE,
        ];
        return statutoryLeaves.includes(leaveType);
    }
    requiresMedicalCertificate(leaveType, days) {
        return leaveType === employee_leave_entity_1.LeaveType.SICK_LEAVE && days > 3;
    }
    isPetroleumSafetyTraining(trainingType) {
        return trainingType === employee_training_entity_1.TrainingType.SAFETY_TRAINING;
    }
    isHSETraining(trainingType) {
        return trainingType === employee_training_entity_1.TrainingType.SAFETY_TRAINING || trainingType === employee_training_entity_1.TrainingType.COMPLIANCE_TRAINING;
    }
    isNPAComplianceTraining(trainingType) {
        return trainingType === employee_training_entity_1.TrainingType.COMPLIANCE_TRAINING;
    }
    requiresAssessment(trainingType) {
        const assessmentRequired = [
            employee_training_entity_1.TrainingType.SAFETY_TRAINING,
            employee_training_entity_1.TrainingType.COMPLIANCE_TRAINING,
            employee_training_entity_1.TrainingType.CERTIFICATION,
            employee_training_entity_1.TrainingType.TECHNICAL_TRAINING,
        ];
        return assessmentRequired.includes(trainingType);
    }
    requiresCertification(trainingType) {
        const certificationRequired = [
            employee_training_entity_1.TrainingType.SAFETY_TRAINING,
            employee_training_entity_1.TrainingType.CERTIFICATION,
        ];
        return certificationRequired.includes(trainingType);
    }
    async getLeaveBalance(employeeId, leaveType) {
        // Simplified leave balance calculation
        const currentYear = (0, date_fns_1.getYear)(new Date());
        const yearStart = (0, date_fns_1.startOfYear)(new Date());
        const yearEnd = (0, date_fns_1.endOfYear)(new Date());
        const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!employee)
            return 0;
        const usedLeave = await this.leaveRepo
            .createQueryBuilder('leave')
            .select('SUM(leave.workingDaysTaken)', 'total')
            .where('leave.employeeId = :employeeId', { employeeId })
            .andWhere('leave.leaveType = :leaveType', { leaveType })
            .andWhere('leave.leaveStartDate >= :yearStart', { yearStart })
            .andWhere('leave.leaveEndDate <= :yearEnd', { yearEnd })
            .andWhere('leave.leaveStatus IN (:...statuses)', {
            statuses: [employee_leave_entity_1.LeaveStatus.APPROVED, employee_leave_entity_1.LeaveStatus.TAKEN]
        })
            .getRawOne();
        const usedDays = parseFloat(usedLeave?.total || '0');
        const entitlement = employee.annualLeaveEntitlement || 15;
        return Math.max(0, entitlement - usedDays);
    }
    // Placeholder methods for complex processes
    async createInitialContract(queryRunner, employee, createdBy) { }
    async enrollMandatoryTrainings(queryRunner, employee, createdBy) { }
    async processEmployeeTermination(queryRunner, employeeId, effectiveDate, reason) { }
    async processEmployeeConfirmation(queryRunner, employeeId, effectiveDate) { }
    async updateEmployeeAges() { }
    async checkProbationPeriods() { }
    async checkContractExpirations() { }
    async checkTrainingDueDates() { }
    async updateLeaveAccruals() { }
    async generateMonthlyHRReports() { }
    async processLeaveCarryovers() { }
    async updatePerformanceReviewSchedules() { }
    async processTrainingCompliance() { }
};
exports.EmployeeService = EmployeeService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeeService.prototype, "dailyHRProcesses", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *') // First day of every month
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeeService.prototype, "monthlyHRProcesses", null);
exports.EmployeeService = EmployeeService = EmployeeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_contract_entity_1.EmployeeContract)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_leave_entity_1.EmployeeLeave)),
    __param(3, (0, typeorm_1.InjectRepository)(employee_performance_entity_1.EmployeePerformance)),
    __param(4, (0, typeorm_1.InjectRepository)(employee_training_entity_1.EmployeeTraining)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _f : Object, typeof (_g = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _g : Object])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map