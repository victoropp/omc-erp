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
exports.DailyDeliveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const daily_delivery_service_1 = require("../services/daily-delivery.service");
const create_daily_delivery_dto_1 = require("../dto/create-daily-delivery.dto");
const update_daily_delivery_dto_1 = require("../dto/update-daily-delivery.dto");
const query_daily_delivery_dto_1 = require("../dto/query-daily-delivery.dto");
const approval_action_dto_1 = require("../dto/approval-action.dto");
const delivery_document_dto_1 = require("../dto/delivery-document.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../guards/roles.decorator");
let DailyDeliveryController = class DailyDeliveryController {
    dailyDeliveryService;
    constructor(dailyDeliveryService) {
        this.dailyDeliveryService = dailyDeliveryService;
    }
    async create(createDeliveryDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        // Ensure tenant ID matches
        createDeliveryDto.tenantId = tenantId;
        return this.dailyDeliveryService.create(createDeliveryDto);
    }
    async findAll(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getStats(fromDate, toDate, req = {}) {
        const tenantId = req.headers?.['x-tenant-id'] || req.user?.tenantId;
        return this.dailyDeliveryService.getDeliveryStats(tenantId, fromDate, toDate);
    }
    async findOne(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.dailyDeliveryService.findOne(id, tenantId);
    }
    async update(id, updateDeliveryDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const userId = req.user?.id;
        updateDeliveryDto.updatedBy = userId;
        return this.dailyDeliveryService.update(id, updateDeliveryDto, tenantId);
    }
    async remove(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.dailyDeliveryService.delete(id, tenantId);
    }
    async submitForApproval(id, submitDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const userId = req.user?.id;
        submitDto.submittedBy = userId;
        return this.dailyDeliveryService.submitForApproval(id, submitDto, tenantId);
    }
    async processApproval(id, processDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const userId = req.user?.id;
        processDto.approvedBy = userId;
        return this.dailyDeliveryService.processApproval(id, processDto, tenantId);
    }
    async markInTransit(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const userId = req.user?.id;
        return this.dailyDeliveryService.markInTransit(id, userId, tenantId);
    }
    async markDelivered(id, body, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        const userId = req.user?.id;
        const actualDeliveryTime = body.actualDeliveryTime ? new Date(body.actualDeliveryTime) : undefined;
        return this.dailyDeliveryService.markDelivered(id, userId, tenantId, actualDeliveryTime);
    }
    async addDocument(id, createDocumentDto, req) {
        const userId = req.user?.id;
        createDocumentDto.deliveryId = id;
        createDocumentDto.uploadedBy = userId;
        return this.dailyDeliveryService.addDocument(createDocumentDto);
    }
    async verifyDocument(documentId, verifyDto, req) {
        const userId = req.user?.id;
        verifyDto.verifiedBy = userId;
        return this.dailyDeliveryService.verifyDocument(documentId, verifyDto);
    }
    async getBySupplier(supplierId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.supplierId = supplierId;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getByCustomer(customerId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.customerId = customerId;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getByDepot(depotId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.depotId = depotId;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getByTransporter(transporterId, query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.transporterId = transporterId;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getPendingApprovals(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.pendingApprovalsOnly = true;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getReadyForInvoicing(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.status = 'DELIVERED';
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getInTransit(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.status = 'IN_TRANSIT';
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
    async getDelayed(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        query.delayedOnly = true;
        return this.dailyDeliveryService.findAll(query, tenantId);
    }
};
exports.DailyDeliveryController = DailyDeliveryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new daily delivery' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Delivery created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Duplicate PSA or waybill number' }),
    (0, roles_decorator_1.Roles)('delivery_manager', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_daily_delivery_dto_1.CreateDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deliveries with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of deliveries retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery statistics retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'Start date for statistics (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'End date for statistics (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid update data or delivery cannot be updated' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('delivery_manager', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_daily_delivery_dto_1.UpdateDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete delivery' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Delivery deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Delivery cannot be deleted' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('delivery_manager', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit-for-approval'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit delivery for approval' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery submitted for approval' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Delivery cannot be submitted for approval' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('delivery_manager', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_action_dto_1.SubmitForApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Post)(':id/process-approval'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process delivery approval' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Delivery cannot be processed for approval' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('approver', 'operations_manager', 'general_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_action_dto_1.ProcessApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "processApproval", null);
__decorate([
    (0, common_1.Post)(':id/mark-in-transit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery as in transit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery marked as in transit' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Delivery cannot be marked as in transit' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('dispatcher', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "markInTransit", null);
__decorate([
    (0, common_1.Post)(':id/mark-delivered'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery as delivered' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery marked as delivered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Delivery cannot be marked as delivered' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('driver', 'dispatcher', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "markDelivered", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add document to delivery' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Delivery not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Delivery ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('delivery_manager', 'operations_manager', 'admin', 'document_manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, delivery_document_dto_1.CreateDeliveryDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Post)('documents/:documentId/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify delivery document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    (0, swagger_1.ApiParam)({ name: 'documentId', description: 'Document ID', format: 'uuid' }),
    (0, roles_decorator_1.Roles)('approver', 'operations_manager', 'admin', 'document_manager'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('documentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, delivery_document_dto_1.VerifyDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Get)('supplier/:supplierId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries by supplier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supplier deliveries retrieved' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', description: 'Supplier ID', format: 'uuid' }),
    __param(0, (0, common_1.Param)('supplierId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getBySupplier", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries by customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer deliveries retrieved' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', description: 'Customer ID', format: 'uuid' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getByCustomer", null);
__decorate([
    (0, common_1.Get)('depot/:depotId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries by depot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Depot deliveries retrieved' }),
    (0, swagger_1.ApiParam)({ name: 'depotId', description: 'Depot ID', format: 'uuid' }),
    __param(0, (0, common_1.Param)('depotId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getByDepot", null);
__decorate([
    (0, common_1.Get)('transporter/:transporterId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries by transporter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transporter deliveries retrieved' }),
    (0, swagger_1.ApiParam)({ name: 'transporterId', description: 'Transporter ID', format: 'uuid' }),
    __param(0, (0, common_1.Param)('transporterId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getByTransporter", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries pending approval' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending approval deliveries retrieved' }),
    (0, roles_decorator_1.Roles)('approver', 'operations_manager', 'general_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('ready-for-invoicing'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries ready for invoicing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deliveries ready for invoicing retrieved' }),
    (0, roles_decorator_1.Roles)('finance_manager', 'accountant', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getReadyForInvoicing", null);
__decorate([
    (0, common_1.Get)('in-transit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliveries currently in transit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'In-transit deliveries retrieved' }),
    (0, roles_decorator_1.Roles)('dispatcher', 'operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getInTransit", null);
__decorate([
    (0, common_1.Get)('delayed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delayed deliveries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delayed deliveries retrieved' }),
    (0, roles_decorator_1.Roles)('operations_manager', 'admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_daily_delivery_dto_1.QueryDailyDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDeliveryController.prototype, "getDelayed", null);
exports.DailyDeliveryController = DailyDeliveryController = __decorate([
    (0, swagger_1.ApiTags)('Daily Deliveries'),
    (0, common_1.Controller)('daily-deliveries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [daily_delivery_service_1.DailyDeliveryService])
], DailyDeliveryController);
//# sourceMappingURL=daily-delivery.controller.js.map