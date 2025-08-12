import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StationsModule } from './stations/stations.module';
import { TanksModule } from './tanks/tanks.module';
import { PumpsModule } from './pumps/pumps.module';
import { EquipmentModule } from './equipment/equipment.module';
import {
  Station,
  Tank,
  Pump,
  User,
  Shift,
  Equipment,
  MaintenanceRecord,
} from '@omc-erp/database';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Event Emitter for domain events
    EventEmitterModule.forRoot(),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'omc_erp_dev'),
        entities: [Station, Tank, Pump, User, Shift, Equipment, MaintenanceRecord],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    StationsModule,
    TanksModule,
    PumpsModule,
    EquipmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}