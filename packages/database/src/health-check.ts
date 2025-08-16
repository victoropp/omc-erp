import { AppDataSource } from './data-source';
import * as redis from 'redis';
import { MongoClient } from 'mongodb';

export interface DatabaseHealthStatus {
  postgres: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  };
  timescale: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  };
  redis: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  };
  mongodb: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

export class DatabaseHealthChecker {
  
  async checkPostgres(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      
      if (!AppDataSource.isInitialized) {
        return { status: 'unhealthy', error: 'DataSource not initialized' };
      }
      
      await AppDataSource.query('SELECT 1');
      const latency = Date.now() - startTime;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  async checkTimescale(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      
      // Create a separate connection for TimescaleDB
      const { DataSource } = await import('typeorm');
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
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  async checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    let client: any = null;
    
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
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      if (client) {
        try {
          await client.quit();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }
  
  async checkMongoDB(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    let client: MongoClient | null = null;
    
    try {
      const startTime = Date.now();
      
      const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:admin@localhost:27017/omc_erp_docs?authSource=admin';
      
      client = new MongoClient(mongoUrl, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      
      await client.connect();
      await client.db().admin().ping();
      
      const latency = Date.now() - startTime;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      if (client) {
        try {
          await client.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }
  
  async checkAllDatabases(): Promise<DatabaseHealthStatus> {
    const [postgres, timescale, redis, mongodb] = await Promise.all([
      this.checkPostgres(),
      this.checkTimescale(),
      this.checkRedis(),
      this.checkMongoDB(),
    ]);
    
    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    const unhealthyCount = [postgres, timescale, redis, mongodb]
      .filter(db => db.status === 'unhealthy').length;
    
    if (unhealthyCount === 0) {
      overall = 'healthy';
    } else if (unhealthyCount < 2) {
      overall = 'degraded';
    } else {
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

export const databaseHealthChecker = new DatabaseHealthChecker();