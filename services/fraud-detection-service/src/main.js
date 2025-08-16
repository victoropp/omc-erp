"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const fraud_detection_engine_1 = require("./engines/fraud-detection-engine");
const pump_fraud_detector_1 = require("./detectors/pump-fraud-detector");
const transaction_fraud_detector_1 = require("./detectors/transaction-fraud-detector");
const driver_fraud_detector_1 = require("./detectors/driver-fraud-detector");
const inventory_fraud_detector_1 = require("./detectors/inventory-fraud-detector");
const graph_analyzer_1 = require("./analyzers/graph-analyzer");
const benford_analyzer_1 = require("./analyzers/benford-analyzer");
const pattern_recognition_1 = require("./ml/pattern-recognition");
const anomaly_scoring_1 = require("./ml/anomaly-scoring");
const database_service_1 = require("./services/database.service");
const alerting_service_1 = require("./services/alerting.service");
const fraud_routes_1 = require("./routes/fraud.routes");
const server = (0, fastify_1.default)({
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
    await server.register(websocket_1.default);
    // Initialize core services
    const dbService = new database_service_1.DatabaseService();
    await dbService.initialize();
    const fraudEngine = new fraud_detection_engine_1.FraudDetectionEngine(dbService);
    const alertingService = new alerting_service_1.AlertingService();
    // Initialize specialized detectors
    const pumpFraud = new pump_fraud_detector_1.PumpFraudDetector(dbService);
    const transactionFraud = new transaction_fraud_detector_1.TransactionFraudDetector(dbService);
    const driverFraud = new driver_fraud_detector_1.DriverFraudDetector(dbService);
    const inventoryFraud = new inventory_fraud_detector_1.InventoryFraudDetector(dbService);
    // Initialize ML components
    const patternRecognition = new pattern_recognition_1.PatternRecognition();
    const anomalyScoring = new anomaly_scoring_1.AnomalyScoring();
    const graphAnalyzer = new graph_analyzer_1.GraphAnalyzer();
    const benfordAnalyzer = new benford_analyzer_1.BenfordAnalyzer();
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
    server.register(fraud_routes_1.fraudRoutes, { prefix: '/api/v1/fraud' });
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
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map