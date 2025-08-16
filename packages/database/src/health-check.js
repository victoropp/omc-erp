"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseHealthChecker = exports.DatabaseHealthChecker = void 0;
const data_source_1 = require("./data-source");
const redis = __importStar(require("redis"));
const mongodb_1 = require("mongodb");
class DatabaseHealthChecker {
    async checkPostgres() {
        try {
            const startTime = Date.now();
            if (!data_source_1.AppDataSource.isInitialized) {
                return { status: 'unhealthy', error: 'DataSource not initialized' };
            }
            await data_source_1.AppDataSource.query('SELECT 1');
            const latency = Date.now() - startTime;
            return { status: 'healthy', latency };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async checkTimescale() {
        try {
            const startTime = Date.now();
            // Create a separate connection for TimescaleDB
            const { DataSource } = await Promise.resolve().then(() => __importStar(require('typeorm')));
            const timescaleSource = new DataSource({
                type: 'postgres',
                host: process.env.TIMESCALE_HOST || 'localhost',
                port: parseInt(process.env.TIMESCALE_PORT || '5434'),
                username: process.env.TIMESCALE_USERNAME || 'timescale',
                password: process.env.TIMESCALE_PASSWORD || 'timescale',
                database: process.env.TIMESCALE_DATABASE || 'omc_erp_timeseries',
            });
            await timescaleSource.initialize();
            await timescaleSource.query('SELECT 1');
            await timescaleSource.destroy();
            const latency = Date.now() - startTime;
            return { status: 'healthy', latency };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async checkRedis() {
        let client = null;
        try {
            const startTime = Date.now();
            client = redis.createClient({
                url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
                socket: {
                    connectTimeout: 5000,
                }
            });
            await client.connect();
            await client.ping();
            const latency = Date.now() - startTime;
            return { status: 'healthy', latency };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        finally {
            if (client) {
                try {
                    await client.quit();
                }
                catch (e) {
                    // Ignore cleanup errors
                }
            }
        }
    }
    async checkMongoDB() {
        let client = null;
        try {
            const startTime = Date.now();
            const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:admin@localhost:27017/omc_erp_docs?authSource=admin';
            client = new mongodb_1.MongoClient(mongoUrl, {
                connectTimeoutMS: 5000,
                serverSelectionTimeoutMS: 5000,
            });
            await client.connect();
            await client.db().admin().ping();
            const latency = Date.now() - startTime;
            return { status: 'healthy', latency };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        finally {
            if (client) {
                try {
                    await client.close();
                }
                catch (e) {
                    // Ignore cleanup errors
                }
            }
        }
    }
    async checkAllDatabases() {
        const [postgres, timescale, redis, mongodb] = await Promise.all([
            this.checkPostgres(),
            this.checkTimescale(),
            this.checkRedis(),
            this.checkMongoDB(),
        ]);
        // Determine overall health
        let overall;
        const unhealthyCount = [postgres, timescale, redis, mongodb]
            .filter(db => db.status === 'unhealthy').length;
        if (unhealthyCount === 0) {
            overall = 'healthy';
        }
        else if (unhealthyCount < 2) {
            overall = 'degraded';
        }
        else {
            overall = 'unhealthy';
        }
        return {
            postgres,
            timescale,
            redis,
            mongodb,
            overall,
        };
    }
}
exports.DatabaseHealthChecker = DatabaseHealthChecker;
exports.databaseHealthChecker = new DatabaseHealthChecker();
//# sourceMappingURL=health-check.js.map