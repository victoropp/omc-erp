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
exports.StationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stations_service_1 = require("./stations.service");
let StationsController = class StationsController {
    stationsService;
    constructor(stationsService) {
        this.stationsService = stationsService;
    }
    async getStations(query, headers) {
        return this.stationsService.getStations(query, headers);
    }
    async getStationManagement(headers) {
        return this.stationsService.getStationManagement(headers);
    }
    async getStation(id, headers) {
        return this.stationsService.getStation(id, headers);
    }
    async createStation(stationData, headers) {
        return this.stationsService.createStation(stationData, headers);
    }
    async updateStation(id, updateData, headers) {
        return this.stationsService.updateStation(id, updateData, headers);
    }
    async deleteStation(id, headers) {
        return this.stationsService.deleteStation(id, headers);
    }
};
exports.StationsController = StationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of stations' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "getStations", null);
__decorate([
    (0, common_1.Get)('management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station management data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station management data' }),
    __param(0, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "getStationManagement", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "getStation", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new station' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Station created successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "createStation", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update station' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "updateStation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete station' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "deleteStation", null);
exports.StationsController = StationsController = __decorate([
    (0, swagger_1.ApiTags)('stations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('stations'),
    __metadata("design:paramtypes", [stations_service_1.StationsService])
], StationsController);
//# sourceMappingURL=stations.controller.js.map