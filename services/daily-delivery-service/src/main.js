"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const erp_integration_service_1 = require("./integration/erp-integration.service");
async function bootstrap() {
    const logger = new common_1.Logger('DailyDeliveryService');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Enable CORS
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', '*'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    // Global prefix
    app.setGlobalPrefix('api/v1');
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Daily Delivery Management API')
        .setDescription('Ghana OMC ERP - Daily Delivery Management Service API Documentation')
        .setVersion('1.0')
        .addTag('Daily Deliveries', 'Manage fuel deliveries and related operations')
        .addTag('Invoice Generation', 'Generate supplier and customer invoices')
        .addTag('Approval Workflow', 'Manage delivery approvals')
        .addTag('Ghana Compliance', 'NPA, UPPF, and customs compliance')
        .addBearerAuth()
        .addServer(configService.get('API_BASE_URL', 'http://localhost:3008'), 'Development')
        .addServer(configService.get('API_PROD_URL', 'https://api.omc-erp.gh'), 'Production')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
        },
    });
    // Register service with service registry
    try {
        const integrationService = app.get(erp_integration_service_1.ERPIntegrationService);
        await integrationService.registerService();
        logger.log('Service registered with service registry');
    }
    catch (error) {
        logger.error('Failed to register service with registry:', error);
    }
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.log('Received SIGTERM, shutting down gracefully...');
        try {
            const integrationService = app.get(erp_integration_service_1.ERPIntegrationService);
            await integrationService.unregisterService();
            await app.close();
            logger.log('Application shut down complete');
            process.exit(0);
        }
        catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
    const port = configService.get('PORT', 3008);
    await app.listen(port);
    logger.log(`Daily Delivery Service is running on port ${port}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
    logger.log(`Health check available at http://localhost:${port}/api/v1/health`);
    // Schedule periodic health checks
    setInterval(async () => {
        try {
            const integrationService = app.get(erp_integration_service_1.ERPIntegrationService);
            const healthCheck = await integrationService.performHealthChecks();
            if (!healthCheck.healthy) {
                logger.warn('Health check failed:', healthCheck.details);
            }
        }
        catch (error) {
            logger.error('Health check error:', error);
        }
    }, 60000); // Check every minute
}
bootstrap().catch((error) => {
    const logger = new common_1.Logger('Bootstrap');
    logger.error('Failed to start Daily Delivery Service:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map