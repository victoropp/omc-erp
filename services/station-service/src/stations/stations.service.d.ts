import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Station, User } from '@omc-erp/database';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationsDto } from './dto/query-stations.dto';
export declare class StationsService {
    private readonly stationRepository;
    private readonly userRepository;
    private readonly eventEmitter;
    constructor(stationRepository: Repository<Station>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    create(createStationDto: CreateStationDto, tenantId: string): Promise<Station>;
    findAll(query: QueryStationsDto, tenantId: string): Promise<any>;
    findOne(id: string, tenantId: string): Promise<Station>;
    findByCode(code: string, tenantId: string): Promise<Station>;
    update(id: string, updateStationDto: UpdateStationDto, tenantId: string): Promise<Station>;
    remove(id: string, tenantId: string): Promise<void>;
    activate(id: string, tenantId: string): Promise<Station>;
    deactivate(id: string, tenantId: string, reason?: string): Promise<Station>;
    getStationStatistics(id: string, tenantId: string): Promise<any>;
    findNearbyStations(latitude: number, longitude: number, radius: number | undefined, tenantId: string): Promise<Station[]>;
    private checkActiveOperations;
}
//# sourceMappingURL=stations.service.d.ts.map