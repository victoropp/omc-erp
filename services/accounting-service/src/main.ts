import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AccountingService');
  
  // Create main HTTP application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('OMC ERP - Accounting Service')
    .setDescription('Comprehensive General Ledger and Accounting API for Ghana OMC ERP System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('General Ledger', 'Chart of accounts, journal entries, and GL operations')
    .addTag('Accounts Payable', 'Vendor management, bills, and payments')
    .addTag('Accounts Receivable', 'Customer invoicing and collections')
    .addTag('Financial Reporting', 'Trial balance, P&L, Balance Sheet, and cash flow')
    .addTag('Fixed Assets', 'Asset management and depreciation')
    .addTag('Tax Management', 'Ghana VAT, NHIL, GETFund calculations')
    .addTag('Budget Management', 'Budget planning and variance analysis')
    .addTag('Cost Management', 'Cost centers and allocation')
    .addTag('IFRS Compliance', 'International financial reporting standards')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  // Start microservice for inter-service communication
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.ACCOUNTING_MICROSERVICE_PORT || '4001'),
    },
  });
  
  await app.startAllMicroservices();
  logger.log('Accounting microservice started on port ' + (process.env.ACCOUNTING_MICROSERVICE_PORT || '4001'));
  
  // Start HTTP server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`Accounting Service is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});