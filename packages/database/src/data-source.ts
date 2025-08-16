import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/User';
import { Tenant } from './entities/Tenant';
import { Station } from './entities/Station';
import { Tank } from './entities/Tank';
import { Pump } from './entities/Pump';
import { Transaction } from './entities/Transaction';
import { Customer } from './entities/Customer';
import { Invoice } from './entities/Invoice';
import { InvoiceLineItem } from './entities/InvoiceLineItem';
import { StockReceipt } from './entities/StockReceipt';
import { StockReceiptItem } from './entities/StockReceiptItem';
import { Vehicle } from './entities/Vehicle';
import { Driver } from './entities/Driver';
import { Supplier } from './entities/Supplier';
import { Shift } from './entities/Shift';
import { AuditLog } from './entities/AuditLog';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
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
    User,
    Tenant,
    Station,
    Tank,
    Pump,
    Transaction,
    Customer,
    Invoice,
    InvoiceLineItem,
    StockReceipt,
    StockReceiptItem,
    Vehicle,
    Driver,
    Supplier,
    Shift,
    AuditLog,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize the data source with retry logic
export const initializeDatabase = async (maxRetries: number = 5, delay: number = 5000): Promise<DataSource> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');
      }
      return AppDataSource;
    } catch (error) {
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

// Close the data source
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Data Source has been closed!');
    }
  } catch (error) {
    console.error('Error during Data Source closure:', error);
    throw error;
  }
};