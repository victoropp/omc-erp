import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('DealerService');
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('OMC ERP Dealer Management Service')
    .setDescription(`
      Complete dealer management automation including:
      - Dealer onboarding and validation
      - Automated margin calculation and accrual
      - Loan origination and management
      - Settlement processing and payment automation
      - Performance analytics and risk assessment
    `)
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('dealer-onboarding', 'Dealer registration and validation')
    .addTag('dealer-margins', 'Margin calculation and accrual')
    .addTag('dealer-loans', 'Loan management and repayment')
    .addTag('dealer-settlements', 'Settlement processing automation')
    .addTag('dealer-analytics', 'Performance and risk analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3007;
  await app.listen(port);

  logger.log(`Dealer Management Service running on port ${port}`);
  logger.log(`API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();