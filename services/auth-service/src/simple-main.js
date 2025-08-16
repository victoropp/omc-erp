"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const simple_app_module_1 = require("./simple-app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(simple_app_module_1.SimpleAppModule);
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
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
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
    // API prefix
    app.setGlobalPrefix('api/v1');
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OMC ERP Auth Service')
        .setDescription('Authentication and authorization service for Ghana OMC ERP')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Auth Service is running on: http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=simple-main.js.map