import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/BaseEntity';
/**
 * Base Service Classes
 * Eliminates duplicate CRUD patterns across all microservices
 */
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface SearchOptions extends PaginationOptions {
    search?: string;
    searchFields?: string[];
    filters?: Record<string, any>;
}
export declare abstract class BaseService<T extends BaseEntity> {
    protected readonly repository: Repository<T>;
    constructor(repository: Repository<T>);
    /**
     * Find all records with pagination and filtering
     */
    findAll(tenantId: string, options?: SearchOptions): Promise<PaginatedResult<T>>;
    /**
     * Find a single record by ID
     */
    findOne(id: string, tenantId: string): Promise<T>;
    /**
     * Find records by specific criteria
     */
    findBy(tenantId: string, criteria: Partial<T>, options?: FindManyOptions<T>): Promise<T[]>;
    /**
     * Create a new record
     */
    create(tenantId: string, createDto: DeepPartial<T>, userId: string): Promise<T>;
    /**
     * Update an existing record
     */
    update(id: string, tenantId: string, updateDto: DeepPartial<T>, userId: string): Promise<T>;
    /**
     * Soft delete a record
     */
    remove(id: string, tenantId: string, userId: string): Promise<void>;
    /**
     * Hard delete a record (use with caution)
     */
    hardDelete(id: string, tenantId: string, userId: string): Promise<void>;
    /**
     * Bulk operations
     */
    bulkCreate(tenantId: string, createDtos: DeepPartial<T>[], userId: string): Promise<T[]>;
    bulkUpdate(tenantId: string, criteria: FindOptionsWhere<T>, updateDto: DeepPartial<T>, userId: string): Promise<void>;
    bulkDelete(tenantId: string, ids: string[], userId: string): Promise<void>;
    /**
     * Aggregation methods
     */
    count(tenantId: string, criteria?: FindOptionsWhere<T>): Promise<number>;
    exists(tenantId: string, criteria: FindOptionsWhere<T>): Promise<boolean>;
    protected beforeCreate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected afterCreate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected beforeUpdate(entity: T, updateDto: DeepPartial<T>, tenantId: string, userId: string): Promise<void>;
    protected afterUpdate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected beforeDelete(entity: T, tenantId: string, userId: string): Promise<void>;
    protected afterDelete(entity: T, tenantId: string, userId: string): Promise<void>;
}
/**
 * Financial Service Base Class
 * For services handling financial entities
 */
export declare abstract class FinancialService<T extends BaseEntity> extends BaseService<T> {
    /**
     * Calculate totals and validate financial data
     */
    protected validateFinancialData(entity: any): Promise<void>;
    protected beforeCreate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected beforeUpdate(entity: T, updateDto: DeepPartial<T>, tenantId: string, userId: string): Promise<void>;
}
/**
 * Audit Service Base Class
 * For services that need audit trail functionality
 */
export declare abstract class AuditableService<T extends BaseEntity> extends BaseService<T> {
    protected createAuditTrail(entityId: string, action: string, oldValues: any, newValues: any, userId: string, tenantId: string): Promise<void>;
    protected afterCreate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected afterUpdate(entity: T, tenantId: string, userId: string): Promise<void>;
    protected afterDelete(entity: T, tenantId: string, userId: string): Promise<void>;
}
export { BaseService as default };
//# sourceMappingURL=BaseService.d.ts.map