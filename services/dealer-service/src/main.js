"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('DealerService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // CORS configuration
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    });
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OMC ERP Dealer Management Service')
        .setDescription(`
      Complete dealer management automation including:
      - Dealer onboarding and validation
      - Automated margin calculation and accrual
      - Loan origination and management
      - Settlement processing and payment automation
      - Performance analytics and risk assessment
    `)
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('dealer-onboarding', 'Dealer registration and validation')
        .addTag('dealer-margins', 'Margin calculation and accrual')
        .addTag('dealer-loans', 'Loan management and repayment')
        .addTag('dealer-settlements', 'Settlement processing automation')
        .addTag('dealer-analytics', 'Performance and risk analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3007;
    await app.listen(port);
    logger.log(`Dealer Management Service running on port ${port}`);
    logger.log(`API Documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map