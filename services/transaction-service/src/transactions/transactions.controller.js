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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const query_transactions_dto_1 = require("./dto/query-transactions.dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async create(createTransactionDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.transactionsService.create(createTransactionDto, tenantId);
    }
    async findAll(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.findAll(query, tenantId);
    }
    async getDailySummary(date, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.getDailySummary(date || new Date().toISOString(), tenantId);
    }
    async findOne(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.findOne(id, tenantId);
    }
    async complete(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.complete(id, tenantId);
    }
    async cancel(id, body, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.cancel(id, body.reason, tenantId);
    }
    async refund(id, body, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.refund(id, body.amount, body.reason, tenantId);
    }
    async getByStation(stationId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.findByStation(stationId, query, tenantId);
    }
    async getByCustomer(customerId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.transactionsService.findByCustomer(customerId, query, tenantId);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new fuel transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 422, description: 'Insufficient inventory' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of transactions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_transactions_dto_1.QueryTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('daily-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily transaction summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daily summary retrieved' }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getDailySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a pending transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction completed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction cancelled' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a completed transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction refunded' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "refund", null);
__decorate([
    (0, common_1.Get)('station/:stationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by station' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station transactions retrieved' }),
    __param(0, (0, common_1.Param)('stationId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_transactions_dto_1.QueryTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getByStation", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer transactions retrieved' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_transactions_dto_1.QueryTransactionsDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getByCustomer", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map