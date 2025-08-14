import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AccountingServiceIntegration } from './accounting-service.integration';
import { ConfigurationServiceIntegration } from './configuration-service.integration';
import { StationServiceIntegration } from './station-service.integration';
import { CustomerServiceIntegration } from './customer-service.integration';
import { TransactionServiceIntegration } from './transaction-service.integration';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule
  ],
  providers: [
    AccountingServiceIntegration,
    ConfigurationServiceIntegration,
    StationServiceIntegration,
    CustomerServiceIntegration,
    TransactionServiceIntegration
  ],
  exports: [
    AccountingServiceIntegration,
    ConfigurationServiceIntegration,
    StationServiceIntegration,
    CustomerServiceIntegration,
    TransactionServiceIntegration
  ]
})
export class ServiceIntegrationModule {}