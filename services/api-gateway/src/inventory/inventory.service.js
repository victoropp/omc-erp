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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("../proxy/proxy.service");
let InventoryService = class InventoryService {
    proxyService;
    // private readonly logger = new Logger(InventoryService.name);
    serviceName = 'inventory';
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async getInventory(query, headers) {
        const queryString = new URLSearchParams(query).toString();
        const path = queryString ? `?${queryString}` : '';
        return this.proxyService.forwardRequest(this.serviceName, 'GET', path, null, headers);
    }
    async getTankLevels(headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'GET', '/tank-levels', null, headers);
    }
    async updateInventory(data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'POST', '/update', data, headers);
    }
    async getInventoryItem(id, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'GET', `/${id}`, null, headers);
    }
    async createInventoryItem(data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'POST', '', data, headers);
    }
    async updateInventoryItem(id, data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'PUT', `/${id}`, data, headers);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map