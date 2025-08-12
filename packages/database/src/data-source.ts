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
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'omc_erp_dev',
  synchronize: false, // Never use true in production
  logging: process.env.NODE_ENV === 'development',
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

// Initialize the data source
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Data Source has been initialized!');
    }
    return AppDataSource;
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    throw error;
  }
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