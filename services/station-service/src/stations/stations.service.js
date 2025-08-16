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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_1 = require("@omc-erp/database");
const shared_types_1 = require("@omc-erp/shared-types");
const uuid_1 = require("uuid");
let StationsService = class StationsService {
    stationRepository;
    userRepository;
    eventEmitter;
    constructor(stationRepository, userRepository, eventEmitter) {
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async create(createStationDto, tenantId) {
        // Check if station code already exists for this tenant
        const existingStation = await this.stationRepository.findOne({
            where: { code: createStationDto.code, tenantId },
        });
        if (existingStation) {
            throw new common_1.ConflictException('Station code already exists');
        }
        const station = this.stationRepository.create({
            ...createStationDto,
            id: (0, uuid_1.v4)(),
            tenantId,
            status: shared_types_1.StationStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedStation = await this.stationRepository.save(station);
        // Emit station created event
        this.eventEmitter.emit('station.created', {
            stationId: savedStation.id,
            tenantId,
            name: savedStation.name,
            code: savedStation.code,
        });
        return savedStation;
    }
    async findAll(query, tenantId) {
        const { page = 1, limit = 20, search, status, region, isActive, latitude, longitude, radius = 50 } = query;
        const queryBuilder = this.stationRepository.createQueryBuilder('station')
            .where('station.tenantId = :tenantId', { tenantId })
            .leftJoinAndSelect('station.tanks', 'tank')
            .leftJoinAndSelect('station.pumps', 'pump');
        // Text search
        if (search) {
            queryBuilder.andWhere('(station.name ILIKE :search OR station.code ILIKE :search OR station.address ILIKE :search)', { search: `%${search}%` });
        }
        // Status filter
        if (status) {
            queryBuilder.andWhere('station.status = :status', { status });
        }
        // Active status filter
        if (typeof isActive === 'boolean') {
            queryBuilder.andWhere('station.isActive = :isActive', { isActive });
        }
        // Region filter
        if (region) {
            queryBuilder.andWhere('station.location->>\'region\' = :region', { region });
        }
        // Proximity search
        if (latitude && longitude) {
            queryBuilder.andWhere(`(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(CAST(station.location->>'latitude' AS FLOAT))) * 
            cos(radians(CAST(station.location->>'longitude' AS FLOAT)) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(CAST(station.location->>'latitude' AS FLOAT)))
          )
        ) <= :radius`, { latitude, longitude, radius });
        }
        const [stations, total] = await queryBuilder
            .orderBy('station.name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: stations,
            pagination: {
                currentPage: page,
                perPage: limit,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
            },
        };
    }
    async findOne(id, tenantId) {
        const station = await this.stationRepository.findOne({
            where: { id, tenantId },
            relations: ['tanks', 'pumps', 'shifts', 'equipment'],
        });
        if (!station) {
            throw new common_1.NotFoundException('Station not found');
        }
        return station;
    }
    async findByCode(code, tenantId) {
        const station = await this.stationRepository.findOne({
            where: { code, tenantId },
            relations: ['tanks', 'pumps'],
        });
        if (!station) {
            throw new common_1.NotFoundException('Station not found');
        }
        return station;
    }
    async update(id, updateStationDto, tenantId) {
        const station = await this.findOne(id, tenantId);
        // Check if updating station code and it conflicts with existing
        if (updateStationDto.code && updateStationDto.code !== station.code) {
            const existingStation = await this.stationRepository.findOne({
                where: { code: updateStationDto.code, tenantId },
            });
            if (existingStation) {
                throw new common_1.ConflictException('Station code already exists');
            }
        }
        Object.assign(station, {
            ...updateStationDto,
            updatedAt: new Date(),
        });
        const updatedStation = await this.stationRepository.save(station);
        // Emit station updated event
        this.eventEmitter.emit('station.updated', {
            stationId: updatedStation.id,
            tenantId,
            changes: updateStationDto,
        });
        return updatedStation;
    }
    async remove(id, tenantId) {
        const station = await this.findOne(id, tenantId);
        // Check if station has active transactions or equipment
        const hasActiveOperations = await this.checkActiveOperations(id);
        if (hasActiveOperations) {
            throw new common_1.BadRequestException('Cannot delete station with active operations');
        }
        await this.stationRepository.remove(station);
        // Emit station deleted event
        this.eventEmitter.emit('station.deleted', {
            stationId: id,
            tenantId,
            name: station.name,
            code: station.code,
        });
    }
    async activate(id, tenantId) {
        const station = await this.findOne(id, tenantId);
        station.isActive = true;
        station.status = shared_types_1.StationStatus.ACTIVE;
        station.updatedAt = new Date();
        const updatedStation = await this.stationRepository.save(station);
        this.eventEmitter.emit('station.activated', {
            stationId: id,
            tenantId,
        });
        return updatedStation;
    }
    async deactivate(id, tenantId, reason) {
        const station = await this.findOne(id, tenantId);
        station.isActive = false;
        station.status = shared_types_1.StationStatus.INACTIVE;
        station.updatedAt = new Date();
        const updatedStation = await this.stationRepository.save(station);
        this.eventEmitter.emit('station.deactivated', {
            stationId: id,
            tenantId,
            reason,
        });
        return updatedStation;
    }
    async getStationStatistics(id, tenantId) {
        const station = await this.findOne(id, tenantId);
        // Get tank statistics
        const tankStats = station.tanks?.map(tank => ({
            id: tank.id,
            fuelType: tank.fuelType,
            capacity: tank.capacity,
            currentVolume: tank.currentVolume,
            fillPercentage: (tank.currentVolume / tank.capacity) * 100,
            status: tank.status,
        })) || [];
        // Get pump statistics
        const pumpStats = station.pumps?.map(pump => ({
            id: pump.id,
            pumpNumber: pump.pumpNumber,
            status: pump.status,
            isOperational: pump.isOperational(),
        })) || [];
        // Calculate totals
        const totalTanks = tankStats.length;
        const totalPumps = pumpStats.length;
        const operationalPumps = pumpStats.filter(p => p.isOperational).length;
        const totalFuelCapacity = tankStats.reduce((sum, tank) => sum + tank.capacity, 0);
        const totalFuelVolume = tankStats.reduce((sum, tank) => sum + tank.currentVolume, 0);
        return {
            stationId: station.id,
            name: station.name,
            code: station.code,
            status: station.status,
            isActive: station.isActive,
            summary: {
                totalTanks,
                totalPumps,
                operationalPumps,
                totalFuelCapacity,
                totalFuelVolume,
                fuelFillPercentage: totalFuelCapacity > 0 ? (totalFuelVolume / totalFuelCapacity) * 100 : 0,
            },
            tanks: tankStats,
            pumps: pumpStats,
        };
    }
    async findNearbyStations(latitude, longitude, radius = 50, tenantId) {
        const stations = await this.stationRepository
            .createQueryBuilder('station')
            .where('station.tenantId = :tenantId', { tenantId })
            .andWhere('station.isActive = true')
            .andWhere(`(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(CAST(station.location->>'latitude' AS FLOAT))) * 
            cos(radians(CAST(station.location->>'longitude' AS FLOAT)) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(CAST(station.location->>'latitude' AS FLOAT)))
          )
        ) <= :radius`, { latitude, longitude, radius })
            .addSelect(`(
        6371 * acos(
          cos(radians(:latitude)) * 
          cos(radians(CAST(station.location->>'latitude' AS FLOAT))) * 
          cos(radians(CAST(station.location->>'longitude' AS FLOAT)) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(CAST(station.location->>'latitude' AS FLOAT)))
        )
      )`, 'distance')
            .orderBy('distance', 'ASC')
            .getMany();
        return stations;
    }
    async checkActiveOperations(stationId) {
        // In a real implementation, this would check for:
        // - Active transactions
        // - Pending maintenance
        // - Equipment in use
        // For now, we'll return false to allow deletion
        return false;
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Station)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], StationsService);
//# sourceMappingURL=stations.service.js.map