"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('ServiceRegistry');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    // CORS configuration
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Name', 'X-Request-ID'],
        credentials: true,
    });
    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('OMC ERP Service Registry')
            .setDescription('Service discovery and registry for OMC ERP microservices architecture')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('service-registry')
            .addTag('service-discovery')
            .addTag('health-checks')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT || 3010;
    await app.listen(port);
    logger.log(`Service Registry is running on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV !== 'production') {
        logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map