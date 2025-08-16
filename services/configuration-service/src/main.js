"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('System Configuration Service')
        .setDescription('Centralized configuration management for OMC ERP')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.CONFIG_SERVICE_PORT || 3007;
    await app.listen(port);
    console.log(`Configuration Service is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map