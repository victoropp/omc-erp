import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PaymentModule } from './payment.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/payment-service.log',
          format: winston.format.json(),
        }),
      ],
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('OMC Payment Service')
    .setDescription('Enterprise Payment Processing with Mobile Money Integration for Ghana OMC Operations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('payments', 'Payment processing operations')
    .addTag('mobile-money', 'Mobile money integrations')
    .addTag('settlements', 'Settlement and reconciliation')
    .addTag('forex', 'Foreign exchange operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'payment-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'payment-service-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3005);
  
  console.log(`Payment Service is running on: ${await app.getUrl()}`);
}

bootstrap();