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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_service_1 = require("./financial.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const throttler_1 = require("@nestjs/throttler");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    // ===== CHART OF ACCOUNTS =====
    async getChartOfAccounts(accountType, isActive) {
        const filters = { accountType, isActive };
        const result = await this.financialService.getChartOfAccounts(filters);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createAccount(accountData, req) {
        const enrichedData = {
            ...accountData,
            createdBy: req.user.sub,
            createdAt: new Date().toISOString(),
        };
        const result = await this.financialService.createAccount(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Account created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async updateAccount(accountId, accountData, req) {
        const enrichedData = {
            ...accountData,
            updatedBy: req.user.sub,
            updatedAt: new Date().toISOString(),
        };
        const result = await this.financialService.updateAccount(accountId, enrichedData);
        return {
            success: true,
            data: result,
            message: 'Account updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteAccount(accountId) {
        await this.financialService.deleteAccount(accountId);
        return {
            success: true,
            message: 'Account deleted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== GENERAL LEDGER =====
    async getTrialBalance(periodId, asOfDate) {
        const result = await this.financialService.getTrialBalance(periodId, asOfDate);
        return {
            success: true,
            data: result,
            parameters: { periodId, asOfDate },
            timestamp: new Date().toISOString(),
        };
    }
    async getAccountBalance(accountCode, asOfDate) {
        const result = await this.financialService.getAccountBalance(accountCode, asOfDate);
        return {
            success: true,
            data: result,
            accountCode,
            asOfDate,
            timestamp: new Date().toISOString(),
        };
    }
    async getAccountMovements(accountCode, fromDate, toDate) {
        const result = await this.financialService.getAccountMovements(accountCode, fromDate, toDate);
        return {
            success: true,
            data: result,
            parameters: { accountCode, fromDate, toDate },
            timestamp: new Date().toISOString(),
        };
    }
    // ===== JOURNAL ENTRIES =====
    async getJournalEntries(periodId, status, fromDate, toDate, page, limit) {
        const filters = { periodId, status, fromDate, toDate, page, limit };
        const result = await this.financialService.getJournalEntries(filters);
        return {
            success: true,
            data: result,
            filters,
            timestamp: new Date().toISOString(),
        };
    }
    async getJournalEntry(journalId) {
        const result = await this.financialService.getJournalEntry(journalId);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createJournalEntry(journalData, req) {
        const enrichedData = {
            ...journalData,
            createdBy: req.user.sub,
            createdAt: new Date().toISOString(),
            status: 'DRAFT',
        };
        const result = await this.financialService.createJournalEntry(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Journal entry created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async updateJournalEntry(journalId, journalData, req) {
        const enrichedData = {
            ...journalData,
            updatedBy: req.user.sub,
            updatedAt: new Date().toISOString(),
        };
        const result = await this.financialService.updateJournalEntry(journalId, enrichedData);
        return {
            success: true,
            data: result,
            message: 'Journal entry updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async postJournalEntry(journalId, req) {
        const result = await this.financialService.postJournalEntry(journalId);
        return {
            success: true,
            data: result,
            message: 'Journal entry posted to General Ledger successfully',
            postedBy: req.user.sub,
            timestamp: new Date().toISOString(),
        };
    }
    async reverseJournalEntry(journalId, reverseData, req) {
        const result = await this.financialService.reverseJournalEntry(journalId, reverseData.reason);
        return {
            success: true,
            data: result,
            message: 'Journal entry reversed successfully',
            reversedBy: req.user.sub,
            reason: reverseData.reason,
            timestamp: new Date().toISOString(),
        };
    }
    async deleteJournalEntry(journalId) {
        await this.financialService.deleteJournalEntry(journalId);
        return {
            success: true,
            message: 'Journal entry deleted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== FINANCIAL REPORTING =====
    async getProfitLossStatement(periodId, comparative) {
        const result = await this.financialService.getFinancialStatements(periodId, 'profit-loss');
        return {
            success: true,
            data: result,
            statementType: 'Profit & Loss Statement',
            periodId,
            comparative,
            timestamp: new Date().toISOString(),
        };
    }
    async getBalanceSheet(periodId) {
        const result = await this.financialService.getFinancialStatements(periodId, 'balance-sheet');
        return {
            success: true,
            data: result,
            statementType: 'Balance Sheet',
            periodId,
            timestamp: new Date().toISOString(),
        };
    }
    async getCashFlowStatement(periodId) {
        const result = await this.financialService.getFinancialStatements(periodId, 'cash-flow');
        return {
            success: true,
            data: result,
            statementType: 'Cash Flow Statement',
            periodId,
            timestamp: new Date().toISOString(),
        };
    }
    // ===== TAX MANAGEMENT =====
    async getGhanaTaxRates(taxType) {
        const result = await this.financialService.getGhanaTaxRates(taxType);
        return {
            success: true,
            data: result,
            country: 'Ghana',
            taxType,
            timestamp: new Date().toISOString(),
        };
    }
    async calculateTaxes(calculationData) {
        const result = await this.financialService.calculateTaxes(calculationData);
        return {
            success: true,
            data: result,
            calculationDate: new Date().toISOString(),
        };
    }
    async submitTaxReturn(taxReturnData, req) {
        const enrichedData = {
            ...taxReturnData,
            submittedBy: req.user.sub,
            submittedAt: new Date().toISOString(),
        };
        const result = await this.financialService.submitTaxReturn(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Tax return submitted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== SYSTEM HEALTH =====
    async getHealthCheck() {
        const result = await this.financialService.getHealthCheck();
        return result;
    }
    // ===== FINANCIAL DASHBOARD =====
    async getDashboardSummary(periodId) {
        const [trialBalance, profitLoss, balanceSheet] = await Promise.all([
            this.financialService.getTrialBalance(periodId),
            this.financialService.getFinancialStatements(periodId || 'current', 'profit-loss'),
            this.financialService.getFinancialStatements(periodId || 'current', 'balance-sheet'),
        ]);
        return {
            success: true,
            data: {
                summary: {
                    totalAssets: balanceSheet?.totalAssets || 0,
                    totalLiabilities: balanceSheet?.totalLiabilities || 0,
                    totalEquity: balanceSheet?.totalEquity || 0,
                    totalRevenue: profitLoss?.totalRevenue || 0,
                    totalExpenses: profitLoss?.totalExpenses || 0,
                    netIncome: profitLoss?.netIncome || 0,
                },
                trialBalanceStatus: trialBalance?.isBalanced ? 'Balanced' : 'Out of Balance',
                lastUpdated: new Date().toISOString(),
            },
            periodId,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('chart-of-accounts'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Chart of Accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chart of Accounts retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'accountType', required: false, description: 'Filter by account type' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, description: 'Filter by active status' }),
    __param(0, (0, common_1.Query)('accountType')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getChartOfAccounts", null);
__decorate([
    (0, common_1.Post)('chart-of-accounts'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Account created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Put)('chart-of-accounts/:id'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Delete)('chart-of-accounts/:id'),
    (0, permissions_decorator_1.Permissions)('finance:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)('general-ledger/trial-balance'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Trial Balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trial Balance retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: false, description: 'Accounting period ID' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Query)('periodId')),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('general-ledger/account-balance/:accountCode'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Account Balance' }),
    (0, swagger_1.ApiParam)({ name: 'accountCode', description: 'Account code' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account balance retrieved' }),
    __param(0, (0, common_1.Param)('accountCode')),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('general-ledger/account-movements/:accountCode'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Account Movements (Ledger)' }),
    (0, swagger_1.ApiParam)({ name: 'accountCode', description: 'Account code' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'From date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'To date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account movements retrieved' }),
    __param(0, (0, common_1.Param)('accountCode')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getAccountMovements", null);
__decorate([
    (0, common_1.Get)('journal-entries'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Journal Entries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entries retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('periodId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getJournalEntries", null);
__decorate([
    (0, common_1.Get)('journal-entries/:id'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Journal Entry by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Journal Entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entry retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getJournalEntry", null);
__decorate([
    (0, common_1.Post)('journal-entries'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Journal Entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Journal entry created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "createJournalEntry", null);
__decorate([
    (0, common_1.Put)('journal-entries/:id'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Journal Entry (Draft only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Journal Entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entry updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "updateJournalEntry", null);
__decorate([
    (0, common_1.Post)('journal-entries/:id/post'),
    (0, permissions_decorator_1.Permissions)('finance:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Post Journal Entry to GL' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Journal Entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entry posted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "postJournalEntry", null);
__decorate([
    (0, common_1.Post)('journal-entries/:id/reverse'),
    (0, permissions_decorator_1.Permissions)('finance:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse Journal Entry' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Journal Entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entry reversed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "reverseJournalEntry", null);
__decorate([
    (0, common_1.Delete)('journal-entries/:id'),
    (0, permissions_decorator_1.Permissions)('finance:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Journal Entry (Draft only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Journal Entry ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Journal entry deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "deleteJournalEntry", null);
__decorate([
    (0, common_1.Get)('reports/profit-loss'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Profit & Loss Statement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'P&L statement retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: true, description: 'Accounting period ID' }),
    (0, swagger_1.ApiQuery)({ name: 'comparative', required: false, description: 'Include comparative period' }),
    __param(0, (0, common_1.Query)('periodId')),
    __param(1, (0, common_1.Query)('comparative')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getProfitLossStatement", null);
__decorate([
    (0, common_1.Get)('reports/balance-sheet'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Balance Sheet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance sheet retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: true, description: 'Accounting period ID' }),
    __param(0, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('reports/cash-flow'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Cash Flow Statement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cash flow statement retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: true, description: 'Accounting period ID' }),
    __param(0, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getCashFlowStatement", null);
__decorate([
    (0, common_1.Get)('tax/ghana-rates'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Ghana Tax Rates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ghana tax rates retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'taxType', required: false, description: 'VAT, NHIL, GETFund, etc.' }),
    __param(0, (0, common_1.Query)('taxType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getGhanaTaxRates", null);
__decorate([
    (0, common_1.Post)('tax/calculate'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate Taxes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax calculation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "calculateTaxes", null);
__decorate([
    (0, common_1.Post)('tax/returns'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit Tax Return' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tax return submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "submitTaxReturn", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Financial service health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health status retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getHealthCheck", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Financial Dashboard Summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard summary retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: false }),
    __param(0, (0, common_1.Query)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinancialController.prototype, "getDashboardSummary", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financial Management'),
    (0, common_1.Controller)('financial'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard, jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map