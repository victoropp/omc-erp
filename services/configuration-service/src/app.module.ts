import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from './configuration/configuration.module';
import { AccountingConfigModule } from './accounting-config/accounting-config.module';
import { PaymentConfigModule } from './payment-config/payment-config.module';
import { IoTConfigModule } from './iot-config/iot-config.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5434'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'omc_erp',
      autoLoadEntities: true,
      synchronize: false, // Use migrations in production
    }),
    ConfigurationModule,
    AccountingConfigModule,
    PaymentConfigModule,
    IoTConfigModule,
  ],
})
export class AppModule {}