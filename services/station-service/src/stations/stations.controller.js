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
const create_station_dto_1 = require("./dto/create-station.dto");
const update_station_dto_1 = require("./dto/update-station.dto");
const query_stations_dto_1 = require("./dto/query-stations.dto");
let StationsController = class StationsController {
    stationsService;
    constructor(stationsService) {
        this.stationsService = stationsService;
    }
    async create(createStationDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return this.stationsService.create(createStationDto, tenantId);
    }
    async findAll(query, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.findAll(query, tenantId);
    }
    async findNearby(latitude, longitude, radius = 50, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        if (!latitude || !longitude) {
            throw new common_1.BadRequestException('Latitude and longitude are required');
        }
        return this.stationsService.findNearbyStations(latitude, longitude, radius, tenantId);
    }
    async findOne(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.findOne(id, tenantId);
    }
    async getStatistics(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.getStationStatistics(id, tenantId);
    }
    async findByCode(code, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.findByCode(code, tenantId);
    }
    async update(id, updateStationDto, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.update(id, updateStationDto, tenantId);
    }
    async activate(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.activate(id, tenantId);
    }
    async deactivate(id, body, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.deactivate(id, tenantId, body.reason);
    }
    async remove(id, req) {
        const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return this.stationsService.remove(id, tenantId);
    }
};
exports.StationsController = StationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new station' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Station created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Station code already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_station_dto_1.CreateStationDto, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stations with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of stations retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_stations_dto_1.QueryStationsDto, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Find stations near a location' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nearby stations retrieved successfully' }),
    __param(0, (0, common_1.Query)('latitude')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station statistics and status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station by code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update station details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Station code already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_station_dto_1.UpdateStationDto, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a station' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station activated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a station' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station deactivated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a station' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Station deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete station with active operations' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "remove", null);
exports.StationsController = StationsController = __decorate([
    (0, swagger_1.ApiTags)('Stations'),
    (0, common_1.Controller)('stations'),
    __metadata("design:paramtypes", [stations_service_1.StationsService])
], StationsController);
//# sourceMappingURL=stations.controller.js.map