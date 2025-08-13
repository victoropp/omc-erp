import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import { ForecastingEngine } from './engines/forecasting-engine';
import { WeatherIntegration } from './integrations/weather-integration';
import { EventCalendar } from './integrations/event-calendar';
import { ModelTrainingScheduler } from './schedulers/model-training-scheduler';
import { DatabaseService } from './services/database.service';
import { MetricsCollector } from './services/metrics-collector';
import { forecastRoutes } from './routes/forecast.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { modelRoutes } from './routes/model.routes';

const server = fastify({
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
  await server.register(helmet);
  await server.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  });

  // API Documentation
  await server.register(swagger, {
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
  const dbService = new DatabaseService();
  await dbService.initialize();

  const forecastingEngine = new ForecastingEngine(dbService);
  const weatherIntegration = new WeatherIntegration();
  const eventCalendar = new EventCalendar();
  const metricsCollector = new MetricsCollector(dbService);

  // Register routes
  server.register(forecastRoutes, { prefix: '/api/v1/forecast' });
  server.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
  server.register(modelRoutes, { prefix: '/api/v1/models' });

  // Health check
  server.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    models: await forecastingEngine.getModelStatus(),
  }));

  // Start model training scheduler
  const trainingScheduler = new ModelTrainingScheduler(forecastingEngine, dbService);
  trainingScheduler.start();

  // Start metrics collection
  metricsCollector.startCollection();

  const port = parseInt(process.env.PORT || '3006', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`🤖 AI Forecasting Service running on http://${host}:${port}`);
    console.log('📊 Swagger documentation available at /documentation');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();