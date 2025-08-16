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
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getTransactions(query, headers) {
        return this.transactionsService.getTransactions(query, headers);
    }
    async getTransactionStats(headers) {
        return this.transactionsService.getTransactionStats(headers);
    }
    async getLiveTransactions(headers) {
        return this.transactionsService.getLiveTransactions(headers);
    }
    async getTransaction(id, headers) {
        return this.transactionsService.getTransaction(id, headers);
    }
    async createTransaction(transactionData, headers) {
        return this.transactionsService.createTransaction(transactionData, headers);
    }
    async updateTransaction(id, updateData, headers) {
        return this.transactionsService.updateTransaction(id, updateData, headers);
    }
    async deleteTransaction(id, headers) {
        return this.transactionsService.deleteTransaction(id, headers);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of transactions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction statistics' }),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Get live transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Live transaction data' }),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getLiveTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "deleteTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map