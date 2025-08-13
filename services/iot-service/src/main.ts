import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoTModule } from './iot.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(IoTModule, {
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
          filename: 'logs/iot-service.log',
          format: winston.format.json(),
        }),
      ],
    }),
  });

  // MQTT Microservice for IoT devices
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
      clientId: 'iot-service-' + Math.random().toString(16).substr(2, 8),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  });

  // Kafka for event streaming
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'iot-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'iot-consumer-group',
      },
    },
  });

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('IoT Tank Monitoring Service')
    .setDescription('Enterprise-grade IoT monitoring for fuel tanks, pumps, and environmental sensors')
    .setVersion('1.0')
    .addTag('tanks', 'Tank monitoring operations')
    .addTag('pumps', 'Pump telemetry operations')
    .addTag('alerts', 'Alert management')
    .addTag('analytics', 'IoT analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for dashboard
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3007);

  console.log(`🔌 IoT Service is running on: ${await app.getUrl()}`);
  console.log(`📡 MQTT Broker connected: ${process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'}`);
}

bootstrap();