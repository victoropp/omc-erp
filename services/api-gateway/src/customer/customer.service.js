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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("../proxy/proxy.service");
let CustomerService = class CustomerService {
    proxyService;
    serviceName = 'customer';
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async forwardRequest(method, path, data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, method, path, data, headers);
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map