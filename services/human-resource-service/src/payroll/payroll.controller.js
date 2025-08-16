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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const payroll_entity_1 = require("./entities/payroll.entity");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    // ===== PAYROLL CALCULATION =====
    async calculatePayroll(calculationData) {
        return this.payrollService.calculatePayroll(calculationData);
    }
    async recalculatePayroll(payrollId, recalculationData) {
        // This would be implemented with recalculation logic
        throw new Error('Method not implemented');
    }
    async getEmployeePayroll(employeeId, period) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    async getEmployeePayrollHistory(employeeId, year, limit = 12) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    // ===== PAYROLL APPROVAL =====
    async approvePayroll(payrollId, approvalData) {
        return this.payrollService.approvePayroll(payrollId, approvalData.approvedBy);
    }
    async rejectPayroll(payrollId, rejectionData) {
        // This would be implemented with rejection logic
        throw new Error('Method not implemented');
    }
    async getPendingApprovals(tenantId, period, department) {
        // This would be implemented with proper repository query
        throw new Error('Method not implemented');
    }
    // ===== PAYROLL PROCESSING =====
    async processPayrollPayment(payrollId, paymentData) {
        return this.payrollService.processPayrollPayment(payrollId, paymentData.processedBy);
    }
    async bulkCalculatePayroll(bulkData) {
        // This would be implemented with bulk processing logic
        throw new Error('Method not implemented');
    }
    async bulkProcessPayrolls(bulkProcessData) {
        // This would be implemented with bulk processing logic
        throw new Error('Method not implemented');
    }
    // ===== PAYROLL REPORTING =====
    async generatePayrollSummary(tenantId, period) {
        return this.payrollService.generatePayrollSummary(tenantId, period);
    }
    async generatePayrollRegister(tenantId, period, department, costCenter, format = 'json') {
        // This would be implemented with payroll register generation
        throw new Error('Method not implemented');
    }
    async generateTaxSummary(tenantId, year, month, department) {
        // This would be implemented with tax summary generation
        throw new Error('Method not implemented');
    }
    async generateSSNITSummary(tenantId, year, month) {
        // This would be implemented with SSNIT summary generation
        throw new Error('Method not implemented');
    }
    async generateBankTransferFile(tenantId, period, bankCode, format = 'csv') {
        // This would be implemented with bank transfer file generation
        throw new Error('Method not implemented');
    }
    // ===== PAYSLIPS =====
    async generatePayslip(payrollId, format = 'pdf') {
        // This would be implemented with payslip generation
        throw new Error('Method not implemented');
    }
    async generateBulkPayslips(bulkPayslipData) {
        // This would be implemented with bulk payslip generation
        throw new Error('Method not implemented');
    }
    async sendPayslipToEmployee(payrollId, sendData) {
        // This would be implemented with payslip sending logic
        throw new Error('Method not implemented');
    }
    // ===== YEAR-TO-DATE AND TAX CERTIFICATES =====
    async getEmployeeYTDSummary(employeeId, year, asOfDate) {
        // This would be implemented with YTD calculation
        throw new Error('Method not implemented');
    }
    async generateTaxCertificate(employeeId, year, format = 'pdf') {
        // This would be implemented with tax certificate generation
        throw new Error('Method not implemented');
    }
    async generateP9Form(employeeId, year, format = 'pdf') {
        // This would be implemented with P9 form generation
        throw new Error('Method not implemented');
    }
    // ===== PAYROLL ADJUSTMENTS =====
    async addPayrollAdjustment(payrollId, adjustmentData) {
        // This would be implemented with adjustment logic
        throw new Error('Method not implemented');
    }
    async getPayrollAdjustments(payrollId) {
        // This would be implemented with adjustment retrieval
        throw new Error('Method not implemented');
    }
    // ===== COMPLIANCE AND STATUTORY REPORTS =====
    async generateGRAReport(tenantId, year, month, quarter) {
        // This would be implemented with GRA reporting
        throw new Error('Method not implemented');
    }
    async generateSSNITReport(tenantId, year, month) {
        // This would be implemented with SSNIT reporting
        throw new Error('Method not implemented');
    }
    async generateTier2PensionReport(tenantId, year, month) {
        // This would be implemented with Tier 2 pension reporting
        throw new Error('Method not implemented');
    }
    // ===== ANALYTICS AND INSIGHTS =====
    async getPayrollAnalytics(tenantId, year, department) {
        // This would be implemented with analytics generation
        throw new Error('Method not implemented');
    }
    async getPayrollCostAnalysis(tenantId, period, compareWith) {
        // This would be implemented with cost analysis
        throw new Error('Method not implemented');
    }
    async getPayrollVarianceAnalysis(tenantId, currentPeriod, comparePeriod) {
        // This would be implemented with variance analysis
        throw new Error('Method not implemented');
    }
    // ===== SYSTEM ADMINISTRATION =====
    async getPayrollAuditTrail(tenantId, startDate, endDate, employeeId, action) {
        // This would be implemented with audit trail retrieval
        throw new Error('Method not implemented');
    }
    async backupPayrollData(tenantId, period, backupOptions) {
        // This would be implemented with backup logic
        throw new Error('Method not implemented');
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate employee payroll' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Payroll calculated successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "calculatePayroll", null);
__decorate([
    (0, common_1.Put)(':payrollId/recalculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate payroll' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll recalculated successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "recalculatePayroll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/period/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll for employee and period' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll retrieved successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployeePayroll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee payroll history' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll history retrieved successfully', type: [payroll_entity_1.Payroll] }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployeePayrollHistory", null);
__decorate([
    (0, common_1.Put)(':payrollId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve payroll' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll approved successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approvePayroll", null);
__decorate([
    (0, common_1.Put)(':payrollId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject payroll' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll rejected successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "rejectPayroll", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payrolls pending approval' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Pending approvals retrieved successfully', type: [payroll_entity_1.Payroll] }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Put)(':payrollId/process-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payroll payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll payment processed successfully', type: payroll_entity_1.Payroll }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "processPayrollPayment", null);
__decorate([
    (0, common_1.Post)('bulk-calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk calculate payroll for multiple employees' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Bulk payroll calculation initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "bulkCalculatePayroll", null);
__decorate([
    (0, common_1.Post)('bulk-process'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk process approved payrolls' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Bulk payroll processing initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "bulkProcessPayrolls", null);
__decorate([
    (0, common_1.Get)('summary/:tenantId/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payroll summary report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll summary generated successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayrollSummary", null);
__decorate([
    (0, common_1.Get)('reports/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payroll register' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll register generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('costCenter')),
    __param(4, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayrollRegister", null);
__decorate([
    (0, common_1.Get)('reports/tax-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate tax summary report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Tax summary generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateTaxSummary", null);
__decorate([
    (0, common_1.Get)('reports/ssnit-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate SSNIT contribution summary' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'SSNIT summary generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateSSNITSummary", null);
__decorate([
    (0, common_1.Get)('reports/bank-transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate bank transfer file' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Bank transfer file generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('bankCode')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateBankTransferFile", null);
__decorate([
    (0, common_1.Get)(':payrollId/payslip'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate employee payslip' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payslip generated successfully' }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayslip", null);
__decorate([
    (0, common_1.Post)('bulk-payslips'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate bulk payslips' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Bulk payslip generation initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateBulkPayslips", null);
__decorate([
    (0, common_1.Put)(':payrollId/send-payslip'),
    (0, swagger_1.ApiOperation)({ summary: 'Send payslip to employee' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payslip sent successfully' }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "sendPayslipToEmployee", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/ytd/:year'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee year-to-date summary' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'YTD summary retrieved successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('year')),
    __param(2, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployeeYTDSummary", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/tax-certificate/:year'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate employee tax certificate' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Tax certificate generated successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('year')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateTaxCertificate", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/p9-form/:year'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate P9 tax form (Ghana)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'P9 form generated successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('year')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateP9Form", null);
__decorate([
    (0, common_1.Post)(':payrollId/adjustments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add payroll adjustment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Payroll adjustment added successfully' }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "addPayrollAdjustment", null);
__decorate([
    (0, common_1.Get)(':payrollId/adjustments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll adjustments' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll adjustments retrieved successfully' }),
    __param(0, (0, common_1.Param)('payrollId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollAdjustments", null);
__decorate([
    (0, common_1.Get)('compliance/ghana-revenue-authority'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate Ghana Revenue Authority report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'GRA report generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateGRAReport", null);
__decorate([
    (0, common_1.Get)('compliance/ssnit-contribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate SSNIT contribution report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'SSNIT report generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateSSNITReport", null);
__decorate([
    (0, common_1.Get)('compliance/tier2-pension'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate Tier 2 pension contribution report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Tier 2 pension report generated successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateTier2PensionReport", null);
__decorate([
    (0, common_1.Get)('analytics/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll analytics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payroll analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollAnalytics", null);
__decorate([
    (0, common_1.Get)('cost-analysis/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll cost analysis' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cost analysis retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('compareWith')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollCostAnalysis", null);
__decorate([
    (0, common_1.Get)('variance-analysis/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll variance analysis' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Variance analysis retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('currentPeriod')),
    __param(2, (0, common_1.Query)('comparePeriod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollVarianceAnalysis", null);
__decorate([
    (0, common_1.Get)('audit-trail/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll audit trail' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Audit trail retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('employeeId')),
    __param(4, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollAuditTrail", null);
__decorate([
    (0, common_1.Post)('backup/:tenantId/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Backup payroll data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Payroll backup initiated' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('period')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "backupPayrollData", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll Management'),
    (0, common_1.Controller)('payroll'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map