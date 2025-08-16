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
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_module_1 = require("./payment.module");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(payment_module_1.PaymentModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, context }) => {
                        return `${timestamp} [${context}] ${level}: ${message}`;
                    })),
                }),
                new winston.transports.File({
                    filename: 'logs/payment-service.log',
                    format: winston.format.json(),
                }),
            ],
        }),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OMC Payment Service')
        .setDescription('Enterprise Payment Processing with Mobile Money Integration for Ghana OMC Operations')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('payments', 'Payment processing operations')
        .addTag('mobile-money', 'Mobile money integrations')
        .addTag('settlements', 'Settlement and reconciliation')
        .addTag('forex', 'Foreign exchange operations')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
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
//# sourceMappingURL=main.js.map