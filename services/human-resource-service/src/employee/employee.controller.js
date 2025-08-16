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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const employee_service_1 = require("./employee.service");
const employee_entity_1 = require("./entities/employee.entity");
const employee_contract_entity_1 = require("./entities/employee-contract.entity");
const employee_leave_entity_1 = require("./entities/employee-leave.entity");
const employee_performance_entity_1 = require("./entities/employee-performance.entity");
const employee_training_entity_1 = require("./entities/employee-training.entity");
let EmployeeController = class EmployeeController {
    employeeService;
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    // ===== EMPLOYEE MANAGEMENT =====
    async createEmployee(createEmployeeDto) {
        return this.employeeService.createEmployee(createEmployeeDto);
    }
    async getEmployee(id) {
        // This would be implemented with proper repository findOne with relations
        throw new Error('Method not implemented');
    }
    async updateEmployee(id, updateEmployeeDto) {
        // This would be implemented with proper update logic
        throw new Error('Method not implemented');
    }
    async updateEmployeeStatus(id, statusDto) {
        return this.employeeService.updateEmployeeStatus(id, statusDto.status, statusDto.effectiveDate, statusDto.updatedBy, statusDto.reason);
    }
    async getAllEmployees(tenantId, department, status, page = 1, limit = 10) {
        // This would be implemented with proper pagination and filtering
        throw new Error('Method not implemented');
    }
    async getEmployeeAnalytics(tenantId) {
        return this.employeeService.generateEmployeeAnalytics(tenantId);
    }
    // ===== CONTRACT MANAGEMENT =====
    async createContract(employeeId, createContractDto) {
        return this.employeeService.createContract({
            ...createContractDto,
            employeeId
        });
    }
    async getEmployeeContracts(employeeId) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    async getActiveContract(employeeId) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    // ===== LEAVE MANAGEMENT =====
    async requestLeave(employeeId, leaveRequestDto) {
        return this.employeeService.requestLeave({
            ...leaveRequestDto,
            employeeId
        });
    }
    async getEmployeeLeaveRequests(employeeId, year, status) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    async getLeaveBalance(employeeId, leaveType) {
        // This would be implemented with leave balance calculation
        throw new Error('Method not implemented');
    }
    async approveLeave(leaveId, approvalDto) {
        // This would be implemented with leave approval logic
        throw new Error('Method not implemented');
    }
    async rejectLeave(leaveId, rejectionDto) {
        // This would be implemented with leave rejection logic
        throw new Error('Method not implemented');
    }
    // ===== PERFORMANCE MANAGEMENT =====
    async initiatePerformanceReview(employeeId, reviewDto) {
        return this.employeeService.initiatePerformanceReview({
            ...reviewDto,
            employeeId
        });
    }
    async getEmployeePerformanceReviews(employeeId, year) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    async submitSelfAssessment(reviewId, selfAssessmentDto) {
        // This would be implemented with self-assessment update logic
        throw new Error('Method not implemented');
    }
    async submitManagerAssessment(reviewId, managerAssessmentDto) {
        // This would be implemented with manager assessment update logic
        throw new Error('Method not implemented');
    }
    // ===== TRAINING MANAGEMENT =====
    async enrollInTraining(employeeId, trainingDto) {
        return this.employeeService.enrollInTraining({
            ...trainingDto,
            employeeId
        });
    }
    async getEmployeeTrainingRecords(employeeId, year, trainingType) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    async completeTraining(trainingId, completionDto) {
        // This would be implemented with training completion logic
        throw new Error('Method not implemented');
    }
    async getTrainingCompliance(employeeId) {
        // This would be implemented with training compliance checking
        throw new Error('Method not implemented');
    }
    // ===== REPORTING ENDPOINTS =====
    async getHeadcountReport(tenantId, department, startDate, endDate) {
        // This would be implemented with headcount reporting logic
        throw new Error('Method not implemented');
    }
    async getTurnoverReport(tenantId, year) {
        // This would be implemented with turnover analysis
        throw new Error('Method not implemented');
    }
    async getLeaveUtilizationReport(tenantId, year, department) {
        // This would be implemented with leave utilization analysis
        throw new Error('Method not implemented');
    }
    async getTrainingSummaryReport(tenantId, year, trainingType) {
        // This would be implemented with training summary analysis
        throw new Error('Method not implemented');
    }
    async getPerformanceSummaryReport(tenantId, reviewPeriod, department) {
        // This would be implemented with performance summary analysis
        throw new Error('Method not implemented');
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new employee' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Employee created successfully', type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Employee found', type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Employee updated successfully', type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "updateEmployee", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Employee status updated successfully', type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "updateEmployeeStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all employees' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Employees retrieved successfully', type: [employee_entity_1.Employee] }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('department')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getAllEmployees", null);
__decorate([
    (0, common_1.Get)('analytics/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee analytics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeAnalytics", null);
__decorate([
    (0, common_1.Post)(':employeeId/contracts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create employee contract' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Contract created successfully', type: employee_contract_entity_1.EmployeeContract }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "createContract", null);
__decorate([
    (0, common_1.Get)(':employeeId/contracts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee contracts' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Contracts retrieved successfully', type: [employee_contract_entity_1.EmployeeContract] }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeContracts", null);
__decorate([
    (0, common_1.Get)(':employeeId/contracts/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active employee contract' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Active contract retrieved', type: employee_contract_entity_1.EmployeeContract }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getActiveContract", null);
__decorate([
    (0, common_1.Post)(':employeeId/leave-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Request leave' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Leave requested successfully', type: employee_leave_entity_1.EmployeeLeave }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "requestLeave", null);
__decorate([
    (0, common_1.Get)(':employeeId/leave-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee leave requests' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leave requests retrieved successfully', type: [employee_leave_entity_1.EmployeeLeave] }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeLeaveRequests", null);
__decorate([
    (0, common_1.Get)(':employeeId/leave-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee leave balance' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leave balance retrieved successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('leaveType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getLeaveBalance", null);
__decorate([
    (0, common_1.Put)('leave-requests/:leaveId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve leave request' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leave approved successfully', type: employee_leave_entity_1.EmployeeLeave }),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Put)('leave-requests/:leaveId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject leave request' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leave rejected successfully', type: employee_leave_entity_1.EmployeeLeave }),
    __param(0, (0, common_1.Param)('leaveId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "rejectLeave", null);
__decorate([
    (0, common_1.Post)(':employeeId/performance-reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate performance review' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Performance review initiated', type: employee_performance_entity_1.EmployeePerformance }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "initiatePerformanceReview", null);
__decorate([
    (0, common_1.Get)(':employeeId/performance-reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee performance reviews' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Performance reviews retrieved', type: [employee_performance_entity_1.EmployeePerformance] }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeePerformanceReviews", null);
__decorate([
    (0, common_1.Put)('performance-reviews/:reviewId/self-assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit self assessment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Self assessment submitted', type: employee_performance_entity_1.EmployeePerformance }),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "submitSelfAssessment", null);
__decorate([
    (0, common_1.Put)('performance-reviews/:reviewId/manager-assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit manager assessment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Manager assessment submitted', type: employee_performance_entity_1.EmployeePerformance }),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "submitManagerAssessment", null);
__decorate([
    (0, common_1.Post)(':employeeId/training-enrollments'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll employee in training' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Training enrollment successful', type: employee_training_entity_1.EmployeeTraining }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "enrollInTraining", null);
__decorate([
    (0, common_1.Get)(':employeeId/training-records'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee training records' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Training records retrieved', type: [employee_training_entity_1.EmployeeTraining] }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('trainingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeTrainingRecords", null);
__decorate([
    (0, common_1.Put)('training-records/:trainingId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark training as completed' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Training marked as completed', type: employee_training_entity_1.EmployeeTraining }),
    __param(0, (0, common_1.Param)('trainingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "completeTraining", null);
__decorate([
    (0, common_1.Get)(':employeeId/training-compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee training compliance status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Training compliance status retrieved' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getTrainingCompliance", null);
__decorate([
    (0, common_1.Get)('reports/headcount'),
    (0, swagger_1.ApiOperation)({ summary: 'Get headcount report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Headcount report retrieved' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('department')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getHeadcountReport", null);
__decorate([
    (0, common_1.Get)('reports/turnover'),
    (0, swagger_1.ApiOperation)({ summary: 'Get turnover report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Turnover report retrieved' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getTurnoverReport", null);
__decorate([
    (0, common_1.Get)('reports/leave-utilization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leave utilization report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Leave utilization report retrieved' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getLeaveUtilizationReport", null);
__decorate([
    (0, common_1.Get)('reports/training-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get training summary report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Training summary report retrieved' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('trainingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getTrainingSummaryReport", null);
__decorate([
    (0, common_1.Get)('reports/performance-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance summary report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Performance summary report retrieved' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('reviewPeriod')),
    __param(2, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getPerformanceSummaryReport", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, swagger_1.ApiTags)('Employee Management'),
    (0, common_1.Controller)('employees'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map