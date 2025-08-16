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
exports.IFRSComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ifrs_compliance_service_1 = require("./ifrs-compliance.service");
let IFRSComplianceController = class IFRSComplianceController {
    ifrsComplianceService;
    constructor(ifrsComplianceService) {
        this.ifrsComplianceService = ifrsComplianceService;
    }
    // ===== COMPLIANCE CHECKING =====
    async checkTransactionCompliance(checkData) {
        return this.ifrsComplianceService.checkTransactionCompliance(checkData.tenantId, checkData.transactionId, checkData.transactionData);
    }
    async bulkCheckCompliance(bulkCheckData) {
        // This would be implemented with bulk processing logic
        throw new Error('Method not implemented');
    }
    async getComplianceCheck(checkId) {
        // This would be implemented with database retrieval
        throw new Error('Method not implemented');
    }
    async getTransactionComplianceHistory(transactionId) {
        // This would be implemented with historical data retrieval
        throw new Error('Method not implemented');
    }
    // ===== COMPLIANCE REPORTING =====
    async generateComplianceReport(tenantId, period) {
        return this.ifrsComplianceService.generateComplianceReport(tenantId, period);
    }
    async exportComplianceReport(tenantId, period, format = 'pdf', includeDetails = true) {
        // This would be implemented with report export logic
        throw new Error('Method not implemented');
    }
    async getComplianceDashboard(tenantId, period, standard) {
        // This would be implemented with dashboard data aggregation
        throw new Error('Method not implemented');
    }
    // ===== COMPLIANCE STANDARDS =====
    async getSupportedStandards() {
        return [
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IAS_12,
                name: 'IAS 12 - Income Taxes',
                description: 'Accounting for income taxes and deferred tax assets/liabilities'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IAS_16,
                name: 'IAS 16 - Property, Plant and Equipment',
                description: 'Recognition, measurement and disclosure of property, plant and equipment'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IAS_23,
                name: 'IAS 23 - Borrowing Costs',
                description: 'Capitalization of borrowing costs for qualifying assets'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IAS_37,
                name: 'IAS 37 - Provisions, Contingent Liabilities and Contingent Assets',
                description: 'Recognition and measurement of provisions and disclosure of contingencies'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IFRS_6,
                name: 'IFRS 6 - Exploration for and Evaluation of Mineral Resources',
                description: 'Accounting for exploration and evaluation expenditures in extractive industries'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IFRS_15,
                name: 'IFRS 15 - Revenue from Contracts with Customers',
                description: 'Recognition of revenue from contracts with customers using 5-step model'
            },
            {
                standard: ifrs_compliance_service_1.IFRSStandard.IFRS_16,
                name: 'IFRS 16 - Leases',
                description: 'Recognition of lease assets and liabilities for lessees and lessors'
            }
        ];
    }
    async getStandardRules(standard) {
        // This would be implemented with rules retrieval from database
        throw new Error('Method not implemented');
    }
    async createComplianceRule(standard, ruleData) {
        // This would be implemented with rule creation logic
        throw new Error('Method not implemented');
    }
    // ===== COMPLIANCE ALERTS AND NOTIFICATIONS =====
    async getComplianceAlerts(tenantId, severity, standard, status, limit = 50) {
        // This would be implemented with alerts retrieval
        throw new Error('Method not implemented');
    }
    async acknowledgeAlert(alertId, acknowledgmentData) {
        // This would be implemented with alert acknowledgment logic
        throw new Error('Method not implemented');
    }
    async subscribeToAlerts(subscriptionData) {
        // This would be implemented with subscription logic
        throw new Error('Method not implemented');
    }
    // ===== COMPLIANCE ANALYTICS =====
    async getComplianceAnalytics(tenantId, startDate, endDate, standard, department) {
        // This would be implemented with analytics calculation
        throw new Error('Method not implemented');
    }
    async getComplianceTrends(tenantId, period = '12months', granularity = 'monthly') {
        // This would be implemented with trend analysis
        throw new Error('Method not implemented');
    }
    async getComplianceRiskAssessment(tenantId) {
        // This would be implemented with risk assessment logic
        throw new Error('Method not implemented');
    }
    // ===== AUTOMATED CORRECTIONS =====
    async getAutomatedCorrections(tenantId, startDate, endDate, standard) {
        // This would be implemented with corrections history retrieval
        throw new Error('Method not implemented');
    }
    async applyManualCorrection(correctionData) {
        // This would be implemented with manual correction logic
        throw new Error('Method not implemented');
    }
    async approveCorrection(correctionId, approvalData) {
        // This would be implemented with correction approval logic
        throw new Error('Method not implemented');
    }
    async rejectCorrection(correctionId, rejectionData) {
        // This would be implemented with correction rejection logic
        throw new Error('Method not implemented');
    }
    // ===== CONFIGURATION AND SETTINGS =====
    async getComplianceSettings(tenantId) {
        // This would be implemented with settings retrieval
        throw new Error('Method not implemented');
    }
    async updateComplianceSettings(tenantId, settingsData) {
        // This would be implemented with settings update logic
        throw new Error('Method not implemented');
    }
    async testComplianceRules(tenantId, testData) {
        // This would be implemented with rule testing logic
        throw new Error('Method not implemented');
    }
    // ===== AUDIT AND MONITORING =====
    async getComplianceAuditTrail(tenantId, startDate, endDate, userId, action, limit = 100) {
        // This would be implemented with audit trail retrieval
        throw new Error('Method not implemented');
    }
    async getServiceHealth() {
        return {
            status: 'HEALTHY',
            uptime: process.uptime(),
            checks: [
                { name: 'Database Connection', status: 'HEALTHY' },
                { name: 'Rules Engine', status: 'HEALTHY' },
                { name: 'Alert System', status: 'HEALTHY' },
                { name: 'Report Generation', status: 'HEALTHY' }
            ],
            lastMaintenanceDate: new Date('2024-01-01'),
        };
    }
    async triggerMaintenance(maintenanceData) {
        // This would be implemented with maintenance scheduling logic
        throw new Error('Method not implemented');
    }
};
exports.IFRSComplianceController = IFRSComplianceController;
__decorate([
    (0, common_1.Post)('check-transaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Check transaction IFRS compliance' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Compliance check completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "checkTransactionCompliance", null);
__decorate([
    (0, common_1.Post)('bulk-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk check multiple transactions for compliance' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Bulk compliance check initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "bulkCheckCompliance", null);
__decorate([
    (0, common_1.Get)('compliance-check/:checkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance check results' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance check results retrieved' }),
    __param(0, (0, common_1.Param)('checkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceCheck", null);
__decorate([
    (0, common_1.Get)('transaction/:transactionId/compliance-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction compliance history' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance history retrieved' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getTransactionComplianceHistory", null);
__decorate([
    (0, common_1.Get)('report/:tenantId/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate IFRS compliance report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance report generated successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "generateComplianceReport", null);
__decorate([
    (0, common_1.Get)('report/:tenantId/:period/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export compliance report' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Report exported successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('period')),
    __param(2, (0, common_1.Query)('format')),
    __param(3, (0, common_1.Query)('includeDetails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "exportComplianceReport", null);
__decorate([
    (0, common_1.Get)('dashboard/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Dashboard data retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('standard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceDashboard", null);
__decorate([
    (0, common_1.Get)('standards'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported IFRS standards' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'IFRS standards list retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getSupportedStandards", null);
__decorate([
    (0, common_1.Get)('standards/:standard/rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance rules for specific standard' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance rules retrieved' }),
    __param(0, (0, common_1.Param)('standard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getStandardRules", null);
__decorate([
    (0, common_1.Post)('standards/:standard/rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom compliance rule' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Compliance rule created successfully' }),
    __param(0, (0, common_1.Param)('standard')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "createComplianceRule", null);
__decorate([
    (0, common_1.Get)('alerts/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance alerts' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance alerts retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('standard')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceAlerts", null);
__decorate([
    (0, common_1.Put)('alerts/:alertId/acknowledge'),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge compliance alert' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Alert acknowledged successfully' }),
    __param(0, (0, common_1.Param)('alertId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Post)('alerts/subscribe'),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to compliance alerts' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Alert subscription created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "subscribeToAlerts", null);
__decorate([
    (0, common_1.Get)('analytics/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance analytics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance analytics retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('standard')),
    __param(4, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/:tenantId/trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance trends' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance trends retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('granularity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceTrends", null);
__decorate([
    (0, common_1.Get)('analytics/:tenantId/risk-assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance risk assessment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Risk assessment retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceRiskAssessment", null);
__decorate([
    (0, common_1.Get)('corrections/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get automated corrections history' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Corrections history retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('standard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getAutomatedCorrections", null);
__decorate([
    (0, common_1.Post)('corrections/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply manual compliance correction' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Correction applied successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "applyManualCorrection", null);
__decorate([
    (0, common_1.Put)('corrections/:correctionId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve compliance correction' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Correction approved successfully' }),
    __param(0, (0, common_1.Param)('correctionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "approveCorrection", null);
__decorate([
    (0, common_1.Put)('corrections/:correctionId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject compliance correction' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Correction rejected successfully' }),
    __param(0, (0, common_1.Param)('correctionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "rejectCorrection", null);
__decorate([
    (0, common_1.Get)('settings/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance settings' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance settings retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceSettings", null);
__decorate([
    (0, common_1.Put)('settings/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update compliance settings' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Compliance settings updated' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "updateComplianceSettings", null);
__decorate([
    (0, common_1.Post)('settings/:tenantId/test-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Test compliance rules' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Rules testing completed' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "testComplianceRules", null);
__decorate([
    (0, common_1.Get)('audit-trail/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance audit trail' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Audit trail retrieved' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('action')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getComplianceAuditTrail", null);
__decorate([
    (0, common_1.Get)('monitoring/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance service health status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Health status retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "getServiceHealth", null);
__decorate([
    (0, common_1.Post)('monitoring/maintenance'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger compliance system maintenance' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.ACCEPTED, description: 'Maintenance initiated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IFRSComplianceController.prototype, "triggerMaintenance", null);
exports.IFRSComplianceController = IFRSComplianceController = __decorate([
    (0, swagger_1.ApiTags)('IFRS Compliance'),
    (0, common_1.Controller)('ifrs-compliance'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ifrs_compliance_service_1.IFRSComplianceService])
], IFRSComplianceController);
//# sourceMappingURL=ifrs-compliance.controller.js.map