import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Legacy modules
import { PricingModule } from './pricing/pricing.module';
import { PBUComponentsModule } from './pbu-components/pbu-components.module';
import { CalculationEngineModule } from './calculation-engine/calculation-engine.module';

// New comprehensive pricing automation services
import { PriceCalculationService } from './price-buildup/price-calculation.service';
import { PricingWindowService } from './pricing-window/pricing-window.service';
import { UppfClaimsService } from './uppf-claims/uppf-claims.service';
import { NpaTemplateParserService } from './npa-integration/npa-template-parser.service';
import { BackgroundAutomationService } from './jobs/background-automation.service';
import { DealerSettlementService } from './dealer-settlement/dealer-settlement.service';
import { AutomatedJournalEntryService } from './accounting-integration/automated-journal-entry.service';

// API Controllers
import { PricingAutomationController } from './api/pricing-automation.controller';

// Service Integration Module
import { ServiceIntegrationModule } from './integration/service-integration.module';

// Entities
import { PbuComponent } from './pbu-components/entities/pbu-component.entity';
import { PricingWindow } from './pricing/entities/pricing-window.entity';
import { StationPrice } from './pricing/entities/station-price.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling for automated price updates and jobs
    ScheduleModule.forRoot(),

    // Event Emitter for domain events and service integration
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

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
        ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),

    // TypeORM Feature modules for entities
    TypeOrmModule.forFeature([
      PbuComponent,
      PricingWindow,
      StationPrice
    ]),

    // Service Integration (External Services)
    ServiceIntegrationModule,

    // Legacy feature modules (maintaining backward compatibility)
    PricingModule,
    PBUComponentsModule,
    CalculationEngineModule,
  ],
  controllers: [
    // Main API Controller for all pricing automation endpoints
    PricingAutomationController,
  ],
  providers: [
    // Core pricing automation services
    PriceCalculationService,
    PricingWindowService,
    UppfClaimsService,
    NpaTemplateParserService,
    BackgroundAutomationService,
    DealerSettlementService,
    AutomatedJournalEntryService,
  ],
  exports: [
    // Export services for use by other modules if needed
    PriceCalculationService,
    PricingWindowService,
    UppfClaimsService,
    NpaTemplateParserService,
    BackgroundAutomationService,
    DealerSettlementService,
    AutomatedJournalEntryService,
  ],
})
export class AppModule {}