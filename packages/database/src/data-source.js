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
exports.closeDatabase = exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const User_1 = require("./entities/User");
const Tenant_1 = require("./entities/Tenant");
const Station_1 = require("./entities/Station");
const Tank_1 = require("./entities/Tank");
const Pump_1 = require("./entities/Pump");
const Transaction_1 = require("./entities/Transaction");
const Customer_1 = require("./entities/Customer");
const Invoice_1 = require("./entities/Invoice");
const InvoiceLineItem_1 = require("./entities/InvoiceLineItem");
const StockReceipt_1 = require("./entities/StockReceipt");
const StockReceiptItem_1 = require("./entities/StockReceiptItem");
const Vehicle_1 = require("./entities/Vehicle");
const Driver_1 = require("./entities/Driver");
const Supplier_1 = require("./entities/Supplier");
const Shift_1 = require("./entities/Shift");
const AuditLog_1 = require("./entities/AuditLog");
// Load environment variables
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5434'),
    username: process.env.DB_USER || process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DB_NAME || process.env.DATABASE_NAME || 'omc_erp',
    synchronize: false, // Never use true in production
    logging: process.env.NODE_ENV === 'development',
    // Connection pool configuration
    extra: {
        connectionLimit: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4_unicode_ci',
    },
    // Connection timeout and retry settings
    connectTimeoutMS: 10000,
    maxQueryExecutionTime: 30000,
    entities: [
        User_1.User,
        Tenant_1.Tenant,
        Station_1.Station,
        Tank_1.Tank,
        Pump_1.Pump,
        Transaction_1.Transaction,
        Customer_1.Customer,
        Invoice_1.Invoice,
        InvoiceLineItem_1.InvoiceLineItem,
        StockReceipt_1.StockReceipt,
        StockReceiptItem_1.StockReceiptItem,
        Vehicle_1.Vehicle,
        Driver_1.Driver,
        Supplier_1.Supplier,
        Shift_1.Shift,
        AuditLog_1.AuditLog,
    ],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
// Initialize the data source with retry logic
const initializeDatabase = async (maxRetries = 5, delay = 5000) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            if (!exports.AppDataSource.isInitialized) {
                await exports.AppDataSource.initialize();
                console.log('Data Source has been initialized!');
            }
            return exports.AppDataSource;
        }
        catch (error) {
            retries++;
            console.error(`Error during Data Source initialization (attempt ${retries}/${maxRetries}):`, error);
            if (retries >= maxRetries) {
                console.error('Max retry attempts reached. Database initialization failed.');
                throw error;
            }
            console.log(`Retrying database connection in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Exponential backoff
            delay = Math.min(delay * 1.5, 30000);
        }
    }
    throw new Error('Failed to initialize database after maximum retry attempts');
};
exports.initializeDatabase = initializeDatabase;
// Close the data source
const closeDatabase = async () => {
    try {
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            console.log('Data Source has been closed!');
        }
    }
    catch (error) {
        console.error('Error during Data Source closure:', error);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=data-source.js.map