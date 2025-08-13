import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ForexModule } from './forex.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

/**
 * Multi-currency Forex Hedging Service
 * Manages USD exposure from petroleum imports vs GHS local sales
 * Protects against cedi depreciation (25% annual average)
 */
async function bootstrap() {
  const app = await NestFactory.create(ForexModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/forex-service.log',
          format: winston.format.json(),
        }),
      ],
    }),
  });

  // Kafka for event streaming
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'forex-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'forex-consumer-group',
      },
    },
  });

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('Forex Hedging Service')
    .setDescription('Enterprise Forex Risk Management for Ghana OMC Operations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('hedging', 'Hedging operations')
    .addTag('exposure', 'Exposure management')
    .addTag('rates', 'Exchange rate management')
    .addTag('analytics', 'Forex analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3010);

  console.log(`💱 Forex Service running on: ${await app.getUrl()}`);
  console.log(`📊 Managing USD/GHS exposure for petroleum imports`);
}

bootstrap();