"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const forecasting_engine_1 = require("./engines/forecasting-engine");
const weather_integration_1 = require("./integrations/weather-integration");
const event_calendar_1 = require("./integrations/event-calendar");
const model_training_scheduler_1 = require("./schedulers/model-training-scheduler");
const database_service_1 = require("./services/database.service");
const metrics_collector_1 = require("./services/metrics-collector");
const forecast_routes_1 = require("./routes/forecast.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const model_routes_1 = require("./routes/model.routes");
const server = (0, fastify_1.default)({
    logger: {
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    },
});
/**
 * World-Class AI Demand Forecasting Service
 * Targets 95% accuracy using ensemble methods
 * Rivals SAP APO, Oracle Demantra, and Microsoft Dynamics 365 Supply Chain
 */
async function bootstrap() {
    // Security & CORS
    await server.register(helmet_1.default);
    await server.register(cors_1.default, {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    });
    // API Documentation
    await server.register(swagger_1.default, {
        swagger: {
            info: {
                title: 'AI Demand Forecasting API',
                description: 'Enterprise-grade demand forecasting with 95% accuracy target',
                version: '1.0.0',
            },
            tags: [
                { name: 'forecasting', description: 'Demand forecasting operations' },
                { name: 'analytics', description: 'Forecast analytics and insights' },
                { name: 'models', description: 'ML model management' },
            ],
        },
    });
    // Initialize core services
    const dbService = new database_service_1.DatabaseService();
    await dbService.initialize();
    const forecastingEngine = new forecasting_engine_1.ForecastingEngine(dbService);
    const weatherIntegration = new weather_integration_1.WeatherIntegration();
    const eventCalendar = new event_calendar_1.EventCalendar();
    const metricsCollector = new metrics_collector_1.MetricsCollector(dbService);
    // Register routes
    server.register(forecast_routes_1.forecastRoutes, { prefix: '/api/v1/forecast' });
    server.register(analytics_routes_1.analyticsRoutes, { prefix: '/api/v1/analytics' });
    server.register(model_routes_1.modelRoutes, { prefix: '/api/v1/models' });
    // Health check
    server.get('/health', async () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        models: await forecastingEngine.getModelStatus(),
    }));
    // Start model training scheduler
    const trainingScheduler = new model_training_scheduler_1.ModelTrainingScheduler(forecastingEngine, dbService);
    trainingScheduler.start();
    // Start metrics collection
    metricsCollector.startCollection();
    const port = parseInt(process.env.PORT || '3006', 10);
    const host = process.env.HOST || '0.0.0.0';
    try {
        await server.listen({ port, host });
        console.log(`🤖 AI Forecasting Service running on http://${host}:${port}`);
        console.log('📊 Swagger documentation available at /documentation');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map