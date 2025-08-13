import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { FraudDetectionEngine } from './engines/fraud-detection-engine';
import { PumpFraudDetector } from './detectors/pump-fraud-detector';
import { TransactionFraudDetector } from './detectors/transaction-fraud-detector';
import { DriverFraudDetector } from './detectors/driver-fraud-detector';
import { InventoryFraudDetector } from './detectors/inventory-fraud-detector';
import { GraphAnalyzer } from './analyzers/graph-analyzer';
import { BenfordAnalyzer } from './analyzers/benford-analyzer';
import { PatternRecognition } from './ml/pattern-recognition';
import { AnomalyScoring } from './ml/anomaly-scoring';
import { DatabaseService } from './services/database.service';
import { AlertingService } from './services/alerting.service';
import { fraudRoutes } from './routes/fraud.routes';

const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  },
});

/**
 * Enterprise Fraud Detection Service
 * Targets 92% accuracy using ensemble ML methods
 * Exceeds capabilities of SAP GRC and Oracle Risk Management
 */
async function bootstrap() {
  await server.register(websocket);
  
  // Initialize core services
  const dbService = new DatabaseService();
  await dbService.initialize();
  
  const fraudEngine = new FraudDetectionEngine(dbService);
  const alertingService = new AlertingService();
  
  // Initialize specialized detectors
  const pumpFraud = new PumpFraudDetector(dbService);
  const transactionFraud = new TransactionFraudDetector(dbService);
  const driverFraud = new DriverFraudDetector(dbService);
  const inventoryFraud = new InventoryFraudDetector(dbService);
  
  // Initialize ML components
  const patternRecognition = new PatternRecognition();
  const anomalyScoring = new AnomalyScoring();
  const graphAnalyzer = new GraphAnalyzer();
  const benfordAnalyzer = new BenfordAnalyzer();
  
  // Register fraud detection engine
  fraudEngine.registerDetector('pump', pumpFraud);
  fraudEngine.registerDetector('transaction', transactionFraud);
  fraudEngine.registerDetector('driver', driverFraud);
  fraudEngine.registerDetector('inventory', inventoryFraud);
  
  // Register ML analyzers
  fraudEngine.registerAnalyzer('pattern', patternRecognition);
  fraudEngine.registerAnalyzer('anomaly', anomalyScoring);
  fraudEngine.registerAnalyzer('graph', graphAnalyzer);
  fraudEngine.registerAnalyzer('benford', benfordAnalyzer);
  
  // API Routes
  server.register(fraudRoutes, { prefix: '/api/v1/fraud' });
  
  // WebSocket for real-time fraud alerts
  server.get('/ws/fraud-alerts', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe') {
        fraudEngine.subscribeToAlerts(data.stationId, (alert) => {
          connection.socket.send(JSON.stringify(alert));
        });
      }
    });
  });
  
  // Health check
  server.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    accuracy: await fraudEngine.getCurrentAccuracy(),
    detectors: await fraudEngine.getDetectorStatus(),
  }));
  
  // Start real-time monitoring
  await fraudEngine.startRealTimeMonitoring();
  
  const port = parseInt(process.env.PORT || '3009', 10);
  const host = process.env.HOST || '0.0.0.0';
  
  try {
    await server.listen({ port, host });
    console.log(`🔍 Fraud Detection Service running on http://${host}:${port}`);
    console.log(`📊 Current accuracy: ${await fraudEngine.getCurrentAccuracy()}%`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();