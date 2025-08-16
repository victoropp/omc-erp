"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const stations_module_1 = require("./stations/stations.module");
const tanks_module_1 = require("./tanks/tanks.module");
const pumps_module_1 = require("./pumps/pumps.module");
const equipment_module_1 = require("./equipment/equipment.module");
const database_1 = require("@omc-erp/database");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            // Event Emitter for domain events
            event_emitter_1.EventEmitterModule.forRoot(),
            // Database
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5434),
                    username: configService.get('DB_USER', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_NAME', 'omc_erp'),
                    entities: [database_1.Station, database_1.Tank, database_1.Pump, database_1.User, database_1.Shift, database_1.Equipment, database_1.MaintenanceRecord],
                    synchronize: false,
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            // Feature modules
            stations_module_1.StationsModule,
            tanks_module_1.TanksModule,
            pumps_module_1.PumpsModule,
            equipment_module_1.EquipmentModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map