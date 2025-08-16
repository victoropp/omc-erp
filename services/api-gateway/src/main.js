"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Security middleware
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    // Compression
    app.use((0, compression_1.default)());
    // Enable CORS
    app.enableCors({
        origin: [
            'http://localhost:5000',
            'http://localhost:3001',
            'http://localhost:3000',
            ...(process.env.ALLOWED_ORIGINS?.split(',') || ['*'])
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID', 'X-Gateway'],
    });
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Global exception filter
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    // API prefix
    app.setGlobalPrefix('api/v1');
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OMC ERP API Gateway')
        .setDescription('Central API Gateway for Ghana OMC ERP System')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
        .addServer('http://localhost:3000', 'Development')
        .addServer('https://api.omc-erp.com', 'Production')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map