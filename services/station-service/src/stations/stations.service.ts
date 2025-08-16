import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Station } from '../../../../packages/database/src/entities/Station';
import { User } from '../../../../packages/database/src/entities/User';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationsDto } from './dto/query-stations.dto';
import { StationStatus } from '../../../../packages/shared-types/src/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createStationDto: CreateStationDto, tenantId: string): Promise<Station> {
    // Check if station code already exists for this tenant
    const existingStation = await this.stationRepository.findOne({
      where: { code: createStationDto.code, tenantId },
    });

    if (existingStation) {
      throw new ConflictException('Station code already exists');
    }

    const station = this.stationRepository.create({
      ...createStationDto,
      id: uuidv4(),
      tenantId,
      status: StationStatus.ACTIVE,
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

  async findAll(query: QueryStationsDto, tenantId: string): Promise<any> {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      region, 
      isActive,
      latitude,
      longitude,
      radius = 50
    } = query;

    const queryBuilder = this.stationRepository.createQueryBuilder('station')
      .where('station.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('station.tanks', 'tank')
      .leftJoinAndSelect('station.pumps', 'pump');

    // Text search
    if (search) {
      queryBuilder.andWhere(
        '(station.name ILIKE :search OR station.code ILIKE :search OR station.address ILIKE :search)',
        { search: `%${search}%` }
      );
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
      queryBuilder.andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(CAST(station.location->>'latitude' AS FLOAT))) * 
            cos(radians(CAST(station.location->>'longitude' AS FLOAT)) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(CAST(station.location->>'latitude' AS FLOAT)))
          )
        ) <= :radius`,
        { latitude, longitude, radius }
      );
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

  async findOne(id: string, tenantId: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id, tenantId },
      relations: ['tanks', 'pumps', 'shifts', 'equipment'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return station;
  }

  async findByCode(code: string, tenantId: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { code, tenantId },
      relations: ['tanks', 'pumps'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return station;
  }

  async update(id: string, updateStationDto: UpdateStationDto, tenantId: string): Promise<Station> {
    const station = await this.findOne(id, tenantId);

    // Check if updating station code and it conflicts with existing
    if (updateStationDto.code && updateStationDto.code !== station.code) {
      const existingStation = await this.stationRepository.findOne({
        where: { code: updateStationDto.code, tenantId },
      });

      if (existingStation) {
        throw new ConflictException('Station code already exists');
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

  async remove(id: string, tenantId: string): Promise<void> {
    const station = await this.findOne(id, tenantId);

    // Check if station has active transactions or equipment
    const hasActiveOperations = await this.checkActiveOperations(id);
    
    if (hasActiveOperations) {
      throw new BadRequestException('Cannot delete station with active operations');
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

  async activate(id: string, tenantId: string): Promise<Station> {
    const station = await this.findOne(id, tenantId);
    station.status = StationStatus.ACTIVE;
    station.status = StationStatus.ACTIVE;
    station.updatedAt = new Date();

    const updatedStation = await this.stationRepository.save(station);

    this.eventEmitter.emit('station.activated', {
      stationId: id,
      tenantId,
    });

    return updatedStation;
  }

  async deactivate(id: string, tenantId: string, reason?: string): Promise<Station> {
    const station = await this.findOne(id, tenantId);
    station.status = StationStatus.INACTIVE;
    station.status = StationStatus.INACTIVE;
    station.updatedAt = new Date();

    const updatedStation = await this.stationRepository.save(station);

    this.eventEmitter.emit('station.deactivated', {
      stationId: id,
      tenantId,
      reason,
    });

    return updatedStation;
  }

  async getStationStatistics(id: string, tenantId: string): Promise<any> {
    const station = await this.findOne(id, tenantId);

    // Get tank statistics
    const tankStats = station.tanks?.map(tank => ({
      id: tank.id,
      fuelType: tank.fuelType,
      capacity: tank.capacity,
      currentVolume: tank.currentLevel,
      fillPercentage: (tank.currentLevel / tank.capacity) * 100,
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
      isActive: station.status === StationStatus.ACTIVE,
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

  async findNearbyStations(latitude: number, longitude: number, radius: number = 50, tenantId: string): Promise<Station[]> {
    const stations = await this.stationRepository
      .createQueryBuilder('station')
      .where('station.tenantId = :tenantId', { tenantId })
      .andWhere('station.isActive = true')
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(CAST(station.location->>'latitude' AS FLOAT))) * 
            cos(radians(CAST(station.location->>'longitude' AS FLOAT)) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(CAST(station.location->>'latitude' AS FLOAT)))
          )
        ) <= :radius`,
        { latitude, longitude, radius }
      )
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

  private async checkActiveOperations(_stationId: string): Promise<boolean> {
    // In a real implementation, this would check for:
    // - Active transactions
    // - Pending maintenance
    // - Equipment in use
    // For now, we'll return false to allow deletion
    return false;
  }
}