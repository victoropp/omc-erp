"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global pipes
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // CORS
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
    });
    // Swagger API Documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OMC ERP - Station Management Service')
        .setDescription('Station, Pump, Tank, and Equipment Management API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Stations', 'Station management operations')
        .addTag('Tanks', 'Tank management and monitoring')
        .addTag('Pumps', 'Pump management and operations')
        .addTag('Equipment', 'Equipment maintenance and monitoring')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3003;
    await app.listen(port);
    console.log(`🏗️  Station Service running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map