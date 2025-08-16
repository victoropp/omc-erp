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
const forex_module_1 = require("./forex.module");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
/**
 * Multi-currency Forex Hedging Service
 * Manages USD exposure from petroleum imports vs GHS local sales
 * Protects against cedi depreciation (25% annual average)
 */
async function bootstrap() {
    const app = await core_1.NestFactory.create(forex_module_1.ForexModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message }) => {
                        return `${timestamp} ${level}: ${message}`;
                    })),
                }),
                new winston.transports.File({
                    filename: 'logs/forex-service.log',
                    format: winston.format.json(),
                }),
            ],
        }),
    });
    // Kafka for event streaming
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Forex Hedging Service')
        .setDescription('Enterprise Forex Risk Management for Ghana OMC Operations')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('hedging', 'Hedging operations')
        .addTag('exposure', 'Exposure management')
        .addTag('rates', 'Exchange rate management')
        .addTag('analytics', 'Forex analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 3010);
    console.log(`💱 Forex Service running on: ${await app.getUrl()}`);
    console.log(`📊 Managing USD/GHS exposure for petroleum imports`);
}
bootstrap();
//# sourceMappingURL=main.js.map