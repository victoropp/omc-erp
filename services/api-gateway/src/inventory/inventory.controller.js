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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventory(query, headers) {
        return this.inventoryService.getInventory(query, headers);
    }
    async getTankLevels(headers) {
        return this.inventoryService.getTankLevels(headers);
    }
    async updateInventory(updateData, headers) {
        return this.inventoryService.updateInventory(updateData, headers);
    }
    async getInventoryItem(id, headers) {
        return this.inventoryService.getInventoryItem(id, headers);
    }
    async createInventoryItem(itemData, headers) {
        return this.inventoryService.createInventoryItem(itemData, headers);
    }
    async updateInventoryItem(id, updateData, headers) {
        return this.inventoryService.updateInventoryItem(id, updateData, headers);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory items' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of inventory items' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('tank-levels'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tank levels' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tank level data' }),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getTankLevels", null);
__decorate([
    (0, common_1.Post)('update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateInventory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory item by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryItem", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create inventory item' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Inventory item created successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createInventoryItem", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateInventoryItem", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map