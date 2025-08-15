import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DailyDeliveryModule } from './daily-delivery/daily-delivery.module';
import { SupplierInvoiceService } from './invoice-generation/supplier-invoice.service';
import { CustomerInvoiceService } from './invoice-generation/customer-invoice.service';
import { ApprovalWorkflowService } from './approval-workflow/approval-workflow.service';
import { GhanaComplianceService } from './compliance/ghana-compliance.service';
import { ERPIntegrationService } from './integration/erp-integration.service';
import { DealerMarginIntegrationService } from './integration/dealer-margin-integration.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'omc_erp_daily_delivery'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV', 'development') === 'development',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl: configService.get('DB_SSL', 'false') === 'true' ? {
          rejectUnauthorized: false
        } : false,
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT', 10000),
        maxRedirects: 5,
        baseURL: configService.get('API_GATEWAY_URL', 'http://localhost:3000'),
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Name': 'daily-delivery-service',
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    DailyDeliveryModule,
  ],
  providers: [
    SupplierInvoiceService,
    CustomerInvoiceService,
    ApprovalWorkflowService,
    GhanaComplianceService,
    ERPIntegrationService,
    DealerMarginIntegrationService,
  ],
  exports: [
    SupplierInvoiceService,
    CustomerInvoiceService,
    ApprovalWorkflowService,
    GhanaComplianceService,
    ERPIntegrationService,
    DealerMarginIntegrationService,
  ],
})
export class AppModule {}