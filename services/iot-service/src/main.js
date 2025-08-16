"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const iot_module_1 = require("./iot.module");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(iot_module_1.IoTModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message }) => {
                        return `${timestamp} ${level}: ${message}`;
                    })),
                }),
                new winston.transports.File({
                    filename: 'logs/iot-service.log',
                    format: winston.format.json(),
                }),
            ],
        }),
    });
    // MQTT Microservice for IoT devices
    app.connectMicroservice({
        transport: microservices_1.Transport.MQTT,
        options: {
            url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
            clientId: 'iot-service-' + Math.random().toString(16).substr(2, 8),
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
        },
    });
    // Kafka for event streaming
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('IoT Tank Monitoring Service')
        .setDescription('Enterprise-grade IoT monitoring for fuel tanks, pumps, and environmental sensors')
        .setVersion('1.0')
        .addTag('tanks', 'Tank monitoring operations')
        .addTag('pumps', 'Pump telemetry operations')
        .addTag('alerts', 'Alert management')
        .addTag('analytics', 'IoT analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
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
//# sourceMappingURL=main.js.map