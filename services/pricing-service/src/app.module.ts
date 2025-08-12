import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PricingModule } from './pricing/pricing.module';
import { PBUComponentsModule } from './pbu-components/pbu-components.module';
import { CalculationEngineModule } from './calculation-engine/calculation-engine.module';
import { RegulatoryDocsModule } from './regulatory-docs/regulatory-docs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling for automated price updates
    ScheduleModule.forRoot(),

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    PricingModule,
    PBUComponentsModule,
    CalculationEngineModule,
    RegulatoryDocsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}