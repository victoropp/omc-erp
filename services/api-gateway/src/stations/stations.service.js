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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("../proxy/proxy.service");
let StationsService = class StationsService {
    proxyService;
    // private readonly logger = new Logger(StationsService.name);
    serviceName = 'stations';
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async getStations(query, headers) {
        const queryString = new URLSearchParams(query).toString();
        const path = queryString ? `?${queryString}` : '';
        return this.proxyService.forwardRequest(this.serviceName, 'GET', path, null, headers);
    }
    async getStationManagement(headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'GET', '/management', null, headers);
    }
    async getStation(id, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'GET', `/${id}`, null, headers);
    }
    async createStation(data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'POST', '', data, headers);
    }
    async updateStation(id, data, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'PUT', `/${id}`, data, headers);
    }
    async deleteStation(id, headers) {
        return this.proxyService.forwardRequest(this.serviceName, 'DELETE', `/${id}`, null, headers);
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], StationsService);
//# sourceMappingURL=stations.service.js.map