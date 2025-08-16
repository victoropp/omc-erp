import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

@Injectable()
export class PaginationService {
  private readonly defaultLimit = 20;
  private readonly maxLimit = 1000;

  /**
   * Parse pagination parameters from request
   */
  parsePaginationQuery(req: Request): PaginationQuery {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      this.maxLimit,
      Math.max(1, parseInt(req.query.limit as string) || this.defaultLimit)
    );
    
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const search = req.query.search as string;
    
    // Parse filters from query parameters
    const filters: Record<string, any> = {};
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('filter.')) {
        const filterKey = key.replace('filter.', '');
        filters[filterKey] = req.query[key];
      }
    });

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      filters,
    };
  }

  /**
   * Create paginated response
   */
  createPaginatedResponse<T>(
    data: T[],
    total: number,
    query: PaginationQuery,
    baseUrl: string
  ): PaginatedResult<T> {
    const { page, limit, sortBy, sortOrder } = query;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      sortBy,
      sortOrder,
    };

    const links = {
      first: this.buildUrl(baseUrl, { ...query, page: 1 }),
      last: this.buildUrl(baseUrl, { ...query, page: totalPages }),
      next: hasNext ? this.buildUrl(baseUrl, { ...query, page: page + 1 }) : undefined,
      prev: hasPrev ? this.buildUrl(baseUrl, { ...query, page: page - 1 }) : undefined,
    };

    return {
      data,
      meta,
      links,
    };
  }

  /**
   * Apply pagination to TypeORM query builder
   */
  applyPagination(queryBuilder: any, query: PaginationQuery): any {
    const { page, limit, sortBy, sortOrder } = query;
    
    // Apply pagination
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    // Apply sorting
    if (sortBy) {
      // Handle nested sorting (e.g., "station.name")
      const sortField = sortBy.includes('.') ? sortBy : `${queryBuilder.alias}.${sortBy}`;
      queryBuilder.orderBy(sortField, sortOrder);
    } else {
      // Default sorting by creation date
      queryBuilder.orderBy(`${queryBuilder.alias}.createdAt`, 'DESC');
    }

    return queryBuilder;
  }

  /**
   * Apply search to TypeORM query builder
   */
  applySearch(queryBuilder: any, query: PaginationQuery, searchFields: string[]): any {
    if (query.search && searchFields.length > 0) {
      const searchTerms = query.search.split(' ').filter(term => term.trim().length > 0);
      
      searchTerms.forEach((term, index) => {
        const conditions = searchFields.map(field => {
          const fieldName = field.includes('.') ? field : `${queryBuilder.alias}.${field}`;
          return `LOWER(${fieldName}) LIKE LOWER(:search${index})`;
        });
        
        if (index === 0) {
          queryBuilder.where(`(${conditions.join(' OR ')})`, { [`search${index}`]: `%${term}%` });
        } else {
          queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { [`search${index}`]: `%${term}%` });
        }
      });
    }

    return queryBuilder;
  }

  /**
   * Apply filters to TypeORM query builder
   */
  applyFilters(queryBuilder: any, query: PaginationQuery): any {
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const fieldName = key.includes('.') ? key : `${queryBuilder.alias}.${key}`;
          
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`${fieldName} IN (:...${key})`, { [key]: value });
          } else if (typeof value === 'string' && value.includes('%')) {
            queryBuilder.andWhere(`${fieldName} LIKE :${key}`, { [key]: value });
          } else {
            queryBuilder.andWhere(`${fieldName} = :${key}`, { [key]: value });
          }
        }
      });
    }

    return queryBuilder;
  }

  /**
   * Apply date range filters
   */
  applyDateRange(
    queryBuilder: any, 
    dateField: string, 
    startDate?: string, 
    endDate?: string
  ): any {
    const field = dateField.includes('.') ? dateField : `${queryBuilder.alias}.${dateField}`;
    
    if (startDate) {
      queryBuilder.andWhere(`${field} >= :startDate`, { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere(`${field} <= :endDate`, { endDate });
    }

    return queryBuilder;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(baseUrl: string, query: PaginationQuery): string {
    const url = new URL(baseUrl);
    
    if (query.page) url.searchParams.set('page', query.page.toString());
    if (query.limit) url.searchParams.set('limit', query.limit.toString());
    if (query.sortBy) url.searchParams.set('sortBy', query.sortBy);
    if (query.sortOrder) url.searchParams.set('sortOrder', query.sortOrder);
    if (query.search) url.searchParams.set('search', query.search);
    
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(`filter.${key}`, value.toString());
        }
      });
    }

    return url.toString();
  }

  /**
   * Get pagination metadata for cursor-based pagination
   */
  createCursorPaginationResponse<T>(
    data: T[],
    query: { limit: number; cursor?: string; sortBy?: string },
    getCursor: (item: T) => string,
    baseUrl: string
  ): {
    data: T[];
    meta: {
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    links: {
      next?: string;
      prev?: string;
    };
  } {
    const { limit } = query;
    const hasNext = data.length > limit;
    const actualData = hasNext ? data.slice(0, -1) : data;
    
    const nextCursor = hasNext && actualData.length > 0 ? getCursor(actualData[actualData.length - 1]) : undefined;
    const prevCursor = actualData.length > 0 ? getCursor(actualData[0]) : undefined;

    return {
      data: actualData,
      meta: {
        limit,
        hasNext,
        hasPrev: !!query.cursor,
      },
      links: {
        next: nextCursor ? this.buildCursorUrl(baseUrl, { ...query, cursor: nextCursor }) : undefined,
        prev: prevCursor && query.cursor ? this.buildCursorUrl(baseUrl, { ...query, cursor: prevCursor, direction: 'prev' }) : undefined,
      },
    };
  }

  private buildCursorUrl(baseUrl: string, query: any): string {
    const url = new URL(baseUrl);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString());
      }
    });
    return url.toString();
  }

  /**
   * Optimize large result sets with streaming
   */
  createStreamingResponse<T>(
    queryBuilder: any,
    transform: (item: T) => any = (item) => item
  ): AsyncIterable<any> {
    return {
      async *[Symbol.asyncIterator]() {
        const stream = await queryBuilder.stream();
        
        for await (const item of stream) {
          yield transform(item);
        }
      }
    };
  }

  /**
   * Aggregate pagination for analytics endpoints
   */
  createAggregatedResponse<T>(
    data: T[],
    aggregates: Record<string, number>,
    query: PaginationQuery,
    baseUrl: string
  ): PaginatedResult<T> & { aggregates: Record<string, number> } {
    const paginatedResult = this.createPaginatedResponse(data, data.length, query, baseUrl);
    
    return {
      ...paginatedResult,
      aggregates,
    };
  }

  /**
   * Performance optimization for large datasets
   */
  async getOptimizedCount(queryBuilder: any): Promise<number> {
    // For large tables, use approximate count for better performance
    const approximateCountThreshold = 100000;
    
    try {
      // Try exact count first
      const exactCount = await queryBuilder.getCount();
      
      if (exactCount > approximateCountThreshold) {
        // Use PostgreSQL's approximate count for very large tables
        const approximateResult = await queryBuilder.connection.query(
          `SELECT reltuples::BIGINT AS approximate_count 
           FROM pg_class 
           WHERE relname = $1`,
          [queryBuilder.from.target.toLowerCase()]
        );
        
        return approximateResult[0]?.approximate_count || exactCount;
      }
      
      return exactCount;
    } catch (error) {
      console.warn('Failed to get optimized count, falling back to regular count:', error);
      return queryBuilder.getCount();
    }
  }
}