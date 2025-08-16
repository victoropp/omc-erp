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
exports.DealerManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// Services
const dealer_settlement_service_1 = require("../services/dealer-settlement.service");
const dealer_loan_management_service_1 = require("../services/dealer-loan-management.service");
const dealer_margin_accrual_service_1 = require("../services/dealer-margin-accrual.service");
const dealer_performance_service_1 = require("../services/dealer-performance.service");
const dealer_settlement_statement_service_1 = require("../services/dealer-settlement-statement.service");
const dealer_payment_automation_service_1 = require("../services/dealer-payment-automation.service");
// Entities
const dealer_settlement_entity_1 = require("../entities/dealer-settlement.entity");
const dealer_loan_entity_1 = require("../entities/dealer-loan.entity");
// DTOs
class CalculateSettlementDto {
    stationId;
    windowId;
    tenantId;
    userId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalculateSettlementDto.prototype, "stationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateSettlementDto.prototype, "windowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalculateSettlementDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalculateSettlementDto.prototype, "userId", void 0);
class CreateLoanDto {
    dealerId;
    stationId;
    principalAmount;
    interestRate;
    tenorMonths;
    repaymentFrequency;
    startDate;
    loanPurpose;
    collateralDetails;
    guarantorDetails;
    tenantId;
    createdBy;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "dealerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "stationId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(1000000),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "principalAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(dealer_loan_entity_1.RepaymentFrequency),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    __metadata("design:type", Date)
], CreateLoanDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "loanPurpose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLoanDto.prototype, "collateralDetails", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLoanDto.prototype, "guarantorDetails", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "createdBy", void 0);
class ProcessMarginAccrualDto {
    stationId;
    dealerId;
    accrualDate;
    transactions;
    windowId;
    tenantId;
    processedBy;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessMarginAccrualDto.prototype, "stationId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessMarginAccrualDto.prototype, "dealerId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    __metadata("design:type", Date)
], ProcessMarginAccrualDto.prototype, "accrualDate", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TransactionDataDto),
    __metadata("design:type", Array)
], ProcessMarginAccrualDto.prototype, "transactions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessMarginAccrualDto.prototype, "windowId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessMarginAccrualDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessMarginAccrualDto.prototype, "processedBy", void 0);
class TransactionDataDto {
    transactionId;
    stationId;
    productType;
    litresSold;
    exPumpPrice;
    transactionDate;
    windowId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransactionDataDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransactionDataDto.prototype, "stationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionDataDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransactionDataDto.prototype, "litresSold", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransactionDataDto.prototype, "exPumpPrice", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    __metadata("design:type", Date)
], TransactionDataDto.prototype, "transactionDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionDataDto.prototype, "windowId", void 0);
class GenerateStatementDto {
    settlementId;
    tenantId;
    template;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateStatementDto.prototype, "settlementId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateStatementDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StatementTemplateDto),
    __metadata("design:type", StatementTemplateDto)
], GenerateStatementDto.prototype, "template", void 0);
class StatementTemplateDto {
    templateType;
    format;
    language;
    includeCharts;
    includeLoanDetails;
    includePerformanceMetrics;
    customFields;
}
__decorate([
    (0, class_validator_1.IsEnum)(['STANDARD', 'DETAILED', 'SUMMARY']),
    __metadata("design:type", String)
], StatementTemplateDto.prototype, "templateType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PDF', 'HTML', 'EXCEL']),
    __metadata("design:type", String)
], StatementTemplateDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['EN', 'FR']),
    __metadata("design:type", String)
], StatementTemplateDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StatementTemplateDto.prototype, "includeCharts", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StatementTemplateDto.prototype, "includeLoanDetails", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StatementTemplateDto.prototype, "includePerformanceMetrics", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StatementTemplateDto.prototype, "customFields", void 0);
class ProcessAutomatedPaymentsDto {
    tenantId;
    maxBatchSize;
    dryRun;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessAutomatedPaymentsDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ProcessAutomatedPaymentsDto.prototype, "maxBatchSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProcessAutomatedPaymentsDto.prototype, "dryRun", void 0);
let DealerManagementController = class DealerManagementController {
    settlementService;
    loanService;
    marginService;
    performanceService;
    statementService;
    paymentService;
    constructor(settlementService, loanService, marginService, performanceService, statementService, paymentService) {
        this.settlementService = settlementService;
        this.loanService = loanService;
        this.marginService = marginService;
        this.performanceService = performanceService;
        this.statementService = statementService;
        this.paymentService = paymentService;
    }
    // Settlement Management APIs
    async calculateSettlement(dto) {
        const calculation = await this.settlementService.calculateDealerSettlement(dto.stationId, dto.windowId, dto.tenantId, dto.userId);
        const settlement = await this.settlementService.createSettlement(calculation, dto.tenantId, dto.userId);
        return {
            calculation,
            settlement,
            message: 'Settlement calculated and created successfully',
        };
    }
    async approveSettlement(settlementId, tenantId, userId) {
        const settlement = await this.settlementService.approveSettlement(settlementId, tenantId, userId);
        return {
            settlement,
            message: 'Settlement approved successfully',
        };
    }
    async processSettlementPayment(settlementId, body) {
        const settlement = await this.settlementService.processSettlementPayment(settlementId, body.paymentReference, body.paymentMethod, body.tenantId, body.userId);
        return {
            settlement,
            message: 'Settlement payment processed successfully',
        };
    }
    async getDealerSettlements(stationId, tenantId, status, fromDate, toDate, limit) {
        const options = {};
        if (status)
            options.status = status;
        if (fromDate)
            options.fromDate = new Date(fromDate);
        if (toDate)
            options.toDate = new Date(toDate);
        if (limit)
            options.limit = Number(limit);
        const settlements = await this.settlementService.getDealerSettlements(stationId, tenantId, options);
        return {
            settlements,
            count: settlements.length,
        };
    }
    // Loan Management APIs
    async createLoan(dto) {
        const loanApplication = {
            dealerId: dto.dealerId,
            stationId: dto.stationId,
            principalAmount: dto.principalAmount,
            interestRate: dto.interestRate,
            tenorMonths: dto.tenorMonths,
            repaymentFrequency: dto.repaymentFrequency,
            startDate: dto.startDate,
            loanPurpose: dto.loanPurpose,
            collateralDetails: dto.collateralDetails,
            guarantorDetails: dto.guarantorDetails,
            tenantId: dto.tenantId,
            createdBy: dto.createdBy,
        };
        const result = await this.loanService.createLoan(loanApplication);
        return {
            loan: result.loan,
            amortizationSchedule: result.amortizationSchedule,
            message: 'Loan created successfully',
        };
    }
    async approveLoan(loanId, tenantId, userId) {
        const loan = await this.loanService.approveLoan(loanId, tenantId, userId);
        return {
            loan,
            message: 'Loan approved successfully',
        };
    }
    async getLoanPerformance(loanId, tenantId) {
        const metrics = await this.loanService.getLoanPerformanceMetrics(loanId, tenantId);
        return {
            metrics,
            message: 'Loan performance metrics retrieved successfully',
        };
    }
    async getActiveLoans(stationId, tenantId, dealerId) {
        const loans = await this.loanService.getActiveLoans(stationId, tenantId, dealerId);
        return {
            loans,
            count: loans.length,
        };
    }
    async getMonthlyObligation(stationId, tenantId) {
        const obligation = await this.loanService.calculateMonthlyObligation(stationId, tenantId);
        return {
            obligation,
            message: 'Monthly loan obligations calculated successfully',
        };
    }
    // Margin Accrual APIs
    async processDailyMarginAccrual(dto) {
        const dailyAccrualDto = {
            stationId: dto.stationId,
            dealerId: dto.dealerId,
            accrualDate: dto.accrualDate,
            transactions: dto.transactions,
            windowId: dto.windowId,
            tenantId: dto.tenantId,
            processedBy: dto.processedBy,
        };
        const accruals = await this.marginService.processDailyMarginAccrual(dailyAccrualDto);
        return {
            accruals,
            count: accruals.length,
            message: 'Daily margin accrual processed successfully',
        };
    }
    async getDailyMarginSummary(stationId, accrualDate, tenantId) {
        const summary = await this.marginService.getDailyMarginSummary(stationId, new Date(accrualDate), tenantId);
        return {
            summary,
            message: 'Daily margin summary retrieved successfully',
        };
    }
    async getWindowMarginSummary(stationId, windowId, tenantId) {
        const summary = await this.marginService.getWindowMarginSummary(stationId, windowId, tenantId);
        return {
            summary,
            message: 'Window margin summary retrieved successfully',
        };
    }
    async getMarginTrends(stationId, tenantId, periodDays) {
        const trends = await this.marginService.getMarginAccrualTrends(stationId, tenantId, periodDays || 30);
        return {
            trends,
            message: 'Margin accrual trends retrieved successfully',
        };
    }
    async adjustMarginAccrual(accrualId, body) {
        const accrual = await this.marginService.adjustMarginAccrual(accrualId, body.adjustmentAmount, body.adjustmentReason, body.tenantId, body.userId);
        return {
            accrual,
            message: 'Margin accrual adjusted successfully',
        };
    }
    // Performance & Analytics APIs
    async getPerformanceMetrics(dealerId, stationId, tenantId, evaluationPeriodDays) {
        const metrics = await this.performanceService.calculatePerformanceMetrics(dealerId, stationId, tenantId, evaluationPeriodDays || 90);
        return {
            metrics,
            message: 'Performance metrics calculated successfully',
        };
    }
    async getCreditRiskModel(dealerId, stationId, tenantId) {
        const model = await this.performanceService.generateCreditRiskModel(dealerId, stationId, tenantId);
        return {
            model,
            message: 'Credit risk model generated successfully',
        };
    }
    async getPerformanceTrends(dealerId, stationId, tenantId, metricType, periodDays) {
        const trends = await this.performanceService.getPerformanceTrends(dealerId, stationId, tenantId, metricType, periodDays || 90);
        return {
            trends,
            message: 'Performance trends retrieved successfully',
        };
    }
    async getPerformanceRecommendations(dealerId, stationId, tenantId) {
        const recommendations = await this.performanceService.generateRecommendations(dealerId, stationId, tenantId);
        return {
            recommendations,
            message: 'Performance recommendations generated successfully',
        };
    }
    // Statement Generation APIs
    async generateStatement(dto) {
        const template = dto.template || {
            templateType: 'DETAILED',
            format: 'PDF',
            language: 'EN',
            includeCharts: true,
            includeLoanDetails: true,
            includePerformanceMetrics: true,
        };
        const statement = await this.statementService.generateSettlementStatement(dto.settlementId, dto.tenantId, template);
        return {
            statement,
            message: 'Settlement statement generated successfully',
        };
    }
    async generateBatchStatements(body) {
        const template = body.template || {
            templateType: 'STANDARD',
            format: 'PDF',
            language: 'EN',
            includeCharts: false,
            includeLoanDetails: true,
            includePerformanceMetrics: false,
        };
        const result = await this.statementService.generateBatchStatements(body.settlementIds, body.tenantId, template);
        return {
            statements: result.statements,
            errors: result.errors,
            successCount: result.statements.length,
            errorCount: result.errors.length,
            message: 'Batch statement generation completed',
        };
    }
    // Payment Automation APIs
    async processAutomatedPayments(dto) {
        const result = await this.paymentService.processAutomatedPayments(dto.tenantId, dto.maxBatchSize || 50, dto.dryRun || false);
        return {
            ...result,
            message: 'Automated payment processing completed',
        };
    }
    async executePaymentBatch(batchId, body) {
        const result = await this.paymentService.executePaymentBatch(batchId, body.tenantId, body.userId);
        return {
            ...result,
            message: 'Payment batch execution completed',
        };
    }
    async createPaymentInstructions(body) {
        const instructions = await this.paymentService.createPaymentInstructions(body.settlementIds, body.tenantId, body.priority || 'NORMAL');
        return {
            instructions,
            count: instructions.length,
            message: 'Payment instructions created successfully',
        };
    }
    async generatePaymentReport(tenantId, periodStart, periodEnd) {
        const report = await this.paymentService.generatePaymentReport(tenantId, new Date(periodStart), new Date(periodEnd));
        return {
            report,
            message: 'Payment report generated successfully',
        };
    }
    async retryFailedPayments(batchId, body) {
        const result = await this.paymentService.retryFailedPayments(batchId, body.tenantId, body.userId);
        return {
            ...result,
            message: 'Failed payment retry completed',
        };
    }
    // Health Check API
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'dealer-management',
            timestamp: new Date().toISOString(),
            version: '2.1.0',
            features: {
                settlements: 'active',
                loans: 'active',
                margins: 'active',
                performance: 'active',
                statements: 'active',
                payments: 'active',
            },
        };
    }
};
exports.DealerManagementController = DealerManagementController;
__decorate([
    (0, common_1.Post)('settlements/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate dealer settlement for a pricing window' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Settlement calculation completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateSettlementDto]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "calculateSettlement", null);
__decorate([
    (0, common_1.Patch)('settlements/:settlementId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a dealer settlement' }),
    (0, swagger_1.ApiParam)({ name: 'settlementId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('settlementId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "approveSettlement", null);
__decorate([
    (0, common_1.Patch)('settlements/:settlementId/process-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payment for approved settlement' }),
    (0, swagger_1.ApiParam)({ name: 'settlementId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('settlementId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "processSettlementPayment", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dealer settlements with filtering options' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: dealer_settlement_entity_1.DealerSettlementStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', type: 'string', format: 'date', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', type: 'string', format: 'date', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('fromDate')),
    __param(4, (0, common_1.Query)('toDate')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getDealerSettlements", null);
__decorate([
    (0, common_1.Post)('loans'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new dealer loan' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Loan created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateLoanDto]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Patch)('loans/:loanId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a dealer loan' }),
    (0, swagger_1.ApiParam)({ name: 'loanId', type: 'string' }),
    __param(0, (0, common_1.Param)('loanId')),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "approveLoan", null);
__decorate([
    (0, common_1.Get)('loans/:loanId/performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loan performance metrics' }),
    (0, swagger_1.ApiParam)({ name: 'loanId', type: 'string' }),
    __param(0, (0, common_1.Param)('loanId')),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getLoanPerformance", null);
__decorate([
    (0, common_1.Get)('loans/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active loans for a station' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', type: 'string', format: 'uuid', required: false }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('dealerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getActiveLoans", null);
__decorate([
    (0, common_1.Get)('loans/monthly-obligation'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate total monthly loan obligations for a station' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getMonthlyObligation", null);
__decorate([
    (0, common_1.Post)('margins/process-daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Process daily margin accrual' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Daily margin accrual processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProcessMarginAccrualDto]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "processDailyMarginAccrual", null);
__decorate([
    (0, common_1.Get)('margins/daily-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily margin accrual summary' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'accrualDate', type: 'string', format: 'date' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('accrualDate')),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getDailyMarginSummary", null);
__decorate([
    (0, common_1.Get)('margins/window-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get window-level margin accrual summary' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'windowId', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('windowId')),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getWindowMarginSummary", null);
__decorate([
    (0, common_1.Get)('margins/trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get margin accrual trends' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'periodDays', type: 'number', required: false }),
    __param(0, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getMarginTrends", null);
__decorate([
    (0, common_1.Patch)('margins/:accrualId/adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust margin accrual amount' }),
    (0, swagger_1.ApiParam)({ name: 'accrualId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('accrualId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "adjustMarginAccrual", null);
__decorate([
    (0, common_1.Get)('performance/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive dealer performance metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'evaluationPeriodDays', type: 'number', required: false }),
    __param(0, (0, common_1.Query)('dealerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Query)('evaluationPeriodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('performance/credit-risk'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate credit risk model and scoring' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Query)('dealerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getCreditRiskModel", null);
__decorate([
    (0, common_1.Get)('performance/trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance trends for a dealer' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'metricType', enum: ['SALES_VOLUME', 'MARGIN_EARNED', 'PAYMENT_RELIABILITY', 'DEBT_RATIO'] }),
    (0, swagger_1.ApiQuery)({ name: 'periodDays', type: 'number', required: false }),
    __param(0, (0, common_1.Query)('dealerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Query)('metricType')),
    __param(4, (0, common_1.Query)('periodDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getPerformanceTrends", null);
__decorate([
    (0, common_1.Get)('performance/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate performance recommendations' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'stationId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Query)('dealerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('stationId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "getPerformanceRecommendations", null);
__decorate([
    (0, common_1.Post)('statements/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate dealer settlement statement' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Settlement statement generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateStatementDto]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "generateStatement", null);
__decorate([
    (0, common_1.Post)('statements/generate-batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate multiple settlement statements' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "generateBatchStatements", null);
__decorate([
    (0, common_1.Post)('payments/process-automated'),
    (0, swagger_1.ApiOperation)({ summary: 'Process automated payments for approved settlements' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Automated payment processing completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProcessAutomatedPaymentsDto]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "processAutomatedPayments", null);
__decorate([
    (0, common_1.Post)('payments/execute-batch/:batchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a payment batch' }),
    (0, swagger_1.ApiParam)({ name: 'batchId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('batchId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "executePaymentBatch", null);
__decorate([
    (0, common_1.Post)('payments/create-instructions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment instructions for manual processing' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "createPaymentInstructions", null);
__decorate([
    (0, common_1.Get)('payments/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payment report' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'periodStart', type: 'string', format: 'date' }),
    (0, swagger_1.ApiQuery)({ name: 'periodEnd', type: 'string', format: 'date' }),
    __param(0, (0, common_1.Query)('tenantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('periodStart')),
    __param(2, (0, common_1.Query)('periodEnd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "generatePaymentReport", null);
__decorate([
    (0, common_1.Post)('payments/retry-failed/:batchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed payments from a batch' }),
    (0, swagger_1.ApiParam)({ name: 'batchId', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('batchId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "retryFailedPayments", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for dealer management service' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerManagementController.prototype, "healthCheck", null);
exports.DealerManagementController = DealerManagementController = __decorate([
    (0, common_1.Controller)('api/dealer-management'),
    (0, swagger_1.ApiTags)('Dealer Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [dealer_settlement_service_1.DealerSettlementService,
        dealer_loan_management_service_1.DealerLoanManagementService,
        dealer_margin_accrual_service_1.DealerMarginAccrualService,
        dealer_performance_service_1.DealerPerformanceService,
        dealer_settlement_statement_service_1.DealerSettlementStatementService,
        dealer_payment_automation_service_1.DealerPaymentAutomationService])
], DealerManagementController);
//# sourceMappingURL=dealer-management.controller.js.map