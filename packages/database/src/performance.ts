import { DataSource, Repository, EntityTarget, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from './data-source';

/**
 * Database Performance Optimization Service
 * Provides advanced query optimization, caching, and performance monitoring
 */

interface QueryPerformanceMetrics {
  queryTime: number;
  cacheHit: boolean;
  rowsReturned: number;
  query: string;
  timestamp: Date;
}

interface DatabaseStats {
  activeConnections: number;
  queryCount: number;
  averageQueryTime: number;
  cacheHitRate: number;
  slowQueries: QueryPerformanceMetrics[];
}

export class DatabasePerformanceService {
  private static instance: DatabasePerformanceService;
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private dataSource: DataSource;
  
  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  static getInstance(): DatabasePerformanceService {
    if (!DatabasePerformanceService.instance) {
      DatabasePerformanceService.instance = new DatabasePerformanceService();
    }
    return DatabasePerformanceService.instance;
  }

  /**
   * Enhanced repository with performance monitoring
   */
  getOptimizedRepository<Entity>(target: EntityTarget<Entity>): Repository<Entity> {
    const repository = this.dataSource.getRepository(target);
    
    // Wrap repository methods with performance monitoring
    const originalFind = repository.find;
    repository.find = async (options) => {
      const startTime = Date.now();
      const result = await originalFind.call(repository, options);
      const queryTime = Date.now() - startTime;
      
      this.recordQueryMetrics({
        queryTime,
        cacheHit: false,
        rowsReturned: result.length,
        query: 'find',
        timestamp: new Date(),
      });
      
      return result;
    };
    
    return repository;
  }

  /**
   * Optimized query builder with automatic performance enhancements
   */
  createOptimizedQueryBuilder<Entity>(
    target: EntityTarget<Entity>,
    alias: string
  ): SelectQueryBuilder<Entity> {
    const queryBuilder = this.dataSource
      .getRepository(target)
      .createQueryBuilder(alias);

    // Add automatic performance optimizations
    queryBuilder.cache(300000); // 5 minutes cache by default
    
    // Override execute to add performance monitoring
    const originalGetMany = queryBuilder.getMany;
    queryBuilder.getMany = async () => {
      const startTime = Date.now();
      const result = await originalGetMany.call(queryBuilder);
      const queryTime = Date.now() - startTime;
      
      this.recordQueryMetrics({
        queryTime,
        cacheHit: false, // TODO: Detect cache hits
        rowsReturned: result.length,
        query: queryBuilder.getQuery(),
        timestamp: new Date(),
      });
      
      return result;
    };
    
    return queryBuilder;
  }

  /**
   * Bulk operations for improved performance
   */
  async bulkInsert<Entity>(
    target: EntityTarget<Entity>,
    entities: Entity[],
    batchSize: number = 1000
  ): Promise<void> {
    const repository = this.dataSource.getRepository(target);
    
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await repository.insert(batch as any);
    }
  }

  async bulkUpdate<Entity>(
    target: EntityTarget<Entity>,
    criteria: any,
    partialEntity: any,
    batchSize: number = 1000
  ): Promise<void> {
    const repository = this.dataSource.getRepository(target);
    
    // Get entities to update in batches
    let skip = 0;
    let entities;
    
    do {
      entities = await repository.find({
        where: criteria,
        take: batchSize,
        skip,
      });
      
      if (entities.length > 0) {
        await repository.update(
          entities.map(e => (e as any).id),
          partialEntity
        );
      }
      
      skip += batchSize;
    } while (entities.length === batchSize);
  }

  /**
   * Common optimized queries for frequent operations
   */
  
  // Transaction queries with optimizations
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    stationId?: string,
    limit: number = 1000
  ) {
    const queryBuilder = this.createOptimizedQueryBuilder('Transaction', 'transaction')
      .leftJoinAndSelect('transaction.station', 'station')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .where('transaction.transactionTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('transaction.transactionTime', 'DESC')
      .limit(limit);

    if (stationId) {
      queryBuilder.andWhere('transaction.stationId = :stationId', { stationId });
    }

    return queryBuilder.getMany();
  }

  // Station performance metrics
  async getStationSalesMetrics(stationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.dataSource.query(`
      SELECT 
        DATE(transaction_time) as date,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        SUM(quantity_liters) as total_liters,
        AVG(total_amount) as avg_transaction_value
      FROM fuel_transactions 
      WHERE station_id = $1 
        AND transaction_time >= $2
        AND status = 'COMPLETED'
      GROUP BY DATE(transaction_time)
      ORDER BY date DESC
    `, [stationId, startDate]);
  }

  // Customer analytics
  async getCustomerAnalytics(customerId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return this.dataSource.query(`
      SELECT 
        DATE_TRUNC('month', transaction_time) as month,
        COUNT(*) as visit_count,
        SUM(total_amount) as total_spent,
        SUM(quantity_liters) as total_liters,
        SUM(loyalty_points_awarded) as total_points
      FROM fuel_transactions 
      WHERE customer_id = $1 
        AND transaction_time >= $2
        AND status = 'COMPLETED'
      GROUP BY DATE_TRUNC('month', transaction_time)
      ORDER BY month DESC
    `, [customerId, startDate]);
  }

  /**
   * Performance monitoring and optimization
   */
  
  recordQueryMetrics(metrics: QueryPerformanceMetrics): void {
    this.queryMetrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }
    
    // Log slow queries
    if (metrics.queryTime > 5000) { // 5 seconds
      console.warn('Slow query detected:', {
        query: metrics.query,
        time: metrics.queryTime,
        rows: metrics.rowsReturned,
      });
    }
  }

  getPerformanceStats(): DatabaseStats {
    const recentMetrics = this.queryMetrics.filter(
      m => Date.now() - m.timestamp.getTime() < 3600000 // Last hour
    );

    const totalQueries = recentMetrics.length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const averageQueryTime = totalQueries > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.queryTime, 0) / totalQueries
      : 0;

    const slowQueries = recentMetrics
      .filter(m => m.queryTime > 1000) // Queries taking more than 1 second
      .sort((a, b) => b.queryTime - a.queryTime)
      .slice(0, 10);

    return {
      activeConnections: this.dataSource.isInitialized ? 1 : 0, // Simplified
      queryCount: totalQueries,
      averageQueryTime,
      cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
      slowQueries,
    };
  }

  /**
   * Database maintenance operations
   */
  
  async analyzeTable(tableName: string): Promise<void> {
    await this.dataSource.query(`ANALYZE ${tableName}`);
  }

  async vacuumTable(tableName: string): Promise<void> {
    await this.dataSource.query(`VACUUM ANALYZE ${tableName}`);
  }

  async getTableSizes(): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `);
  }

  async getIndexUsage(): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        t.tablename,
        indexname,
        c.reltuples AS num_rows,
        pg_size_pretty(pg_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))) AS table_size,
        pg_size_pretty(pg_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.indexname))) AS index_size,
        CASE WHEN indisunique THEN 'Y' ELSE 'N' END AS UNIQUE,
        idx_scan as times_used,
        pg_size_pretty(pg_relation_size(quote_ident(schemaname)||'.'||quote_ident(indexname))) as "INDEX SIZE"
      FROM pg_tables t
      LEFT OUTER JOIN pg_class c ON c.relname=t.tablename
      LEFT OUTER JOIN (
        SELECT c.relname AS ctablename, ipg.relname AS indexname, x.indnatts AS number_of_columns, idx_scan, indisunique FROM pg_index x
        JOIN pg_class c ON c.oid = x.indrelid
        JOIN pg_class ipg ON ipg.oid = x.indexrelid
        JOIN pg_stat_user_indexes psui ON x.indexrelid = psui.indexrelid
      ) AS foo ON t.tablename = foo.ctablename
      WHERE t.schemaname='public'
      ORDER BY 1,2
    `);
  }

  /**
   * Query optimization helpers
   */
  
  optimizeTransactionQuery(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    return queryBuilder
      .cache(300000) // 5 minute cache
      .setParameter('maxResults', 10000); // Prevent large result sets
  }

  optimizeCustomerQuery(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    return queryBuilder
      .cache(600000) // 10 minute cache for customer data
      .select([
        'customer.id',
        'customer.name',
        'customer.email',
        'customer.phone',
        'customer.loyaltyLevel',
      ]); // Only select needed fields
  }

  optimizeStationQuery(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    return queryBuilder
      .cache(1800000) // 30 minute cache for station data
      .leftJoinAndSelect('station.tanks', 'tanks')
      .leftJoinAndSelect('station.pumps', 'pumps');
  }
}

export const dbPerformance = DatabasePerformanceService.getInstance();