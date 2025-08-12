import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('OMC ERP - Pricing Service')
    .setDescription('Ghana Price Build-Up (PBU) and UPPF Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Pricing Windows', 'Bi-weekly pricing window management')
    .addTag('PBU Components', 'Price Build-Up component management')
    .addTag('Station Prices', 'Ex-pump price calculations and management')
    .addTag('Regulatory Docs', 'NPA documents and compliance')
    .addTag('Price Calculator', 'Price calculation engine')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  console.log(`💰 Pricing Service running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();