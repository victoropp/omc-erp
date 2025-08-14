import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Find all records with pagination and filtering
   */
  async findAll(
    tenantId: string,
    options: SearchOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      searchFields = [],
      filters = {},
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('entity');
    
    // Add tenant filtering
    queryBuilder.where('entity.tenantId = :tenantId', { tenantId });
    
    // Add search functionality
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields
        .map((field) => `entity.${field} ILIKE :search`)
        .join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${search}%` });
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryBuilder.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
        } else {
          queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      }
    });

    // Add sorting
    queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find a single record by ID
   */
  async findOne(id: string, tenantId: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id, tenantId } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  /**
   * Find records by specific criteria
   */
  async findBy(
    tenantId: string,
    criteria: Partial<T>,
    options?: FindManyOptions<T>
  ): Promise<T[]> {
    return this.repository.find({
      where: { ...criteria, tenantId } as FindOptionsWhere<T>,
      ...options,
    });
  }

  /**
   * Create a new record
   */
  async create(tenantId: string, createDto: DeepPartial<T>, userId: string): Promise<T> {
    const entity = this.repository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    } as DeepPartial<T>);

    // Run validation hooks
    await this.beforeCreate(entity, tenantId, userId);

    const savedEntity = await this.repository.save(entity);

    // Run post-creation hooks
    await this.afterCreate(savedEntity, tenantId, userId);

    return savedEntity;
  }

  /**
   * Update an existing record
   */
  async update(
    id: string,
    tenantId: string,
    updateDto: DeepPartial<T>,
    userId: string
  ): Promise<T> {
    const entity = await this.findOne(id, tenantId);

    // Run validation hooks
    await this.beforeUpdate(entity, updateDto, tenantId, userId);

    // Apply updates
    Object.assign(entity, {
      ...updateDto,
      updatedBy: userId,
    });

    const savedEntity = await this.repository.save(entity);

    // Run post-update hooks
    await this.afterUpdate(savedEntity, tenantId, userId);

    return savedEntity;
  }

  /**
   * Soft delete a record
   */
  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    const entity = await this.findOne(id, tenantId);

    // Run validation hooks
    await this.beforeDelete(entity, tenantId, userId);

    await this.repository.update(
      { id, tenantId } as FindOptionsWhere<T>,
      { 
        isActive: false,
        updatedBy: userId,
      } as DeepPartial<T>
    );

    // Run post-deletion hooks
    await this.afterDelete(entity, tenantId, userId);
  }

  /**
   * Hard delete a record (use with caution)
   */
  async hardDelete(id: string, tenantId: string, userId: string): Promise<void> {
    const entity = await this.findOne(id, tenantId);

    await this.beforeDelete(entity, tenantId, userId);
    await this.repository.delete({ id, tenantId } as FindOptionsWhere<T>);
    await this.afterDelete(entity, tenantId, userId);
  }

  /**
   * Bulk operations
   */
  async bulkCreate(tenantId: string, createDtos: DeepPartial<T>[], userId: string): Promise<T[]> {
    const entities = createDtos.map(dto => 
      this.repository.create({
        ...dto,
        tenantId,
        createdBy: userId,
      } as DeepPartial<T>)
    );

    return this.repository.save(entities);
  }

  async bulkUpdate(
    tenantId: string,
    criteria: FindOptionsWhere<T>,
    updateDto: DeepPartial<T>,
    userId: string
  ): Promise<void> {
    await this.repository.update(
      { ...criteria, tenantId } as FindOptionsWhere<T>,
      {
        ...updateDto,
        updatedBy: userId,
      } as DeepPartial<T>
    );
  }

  async bulkDelete(tenantId: string, ids: string[], userId: string): Promise<void> {
    await this.repository.update(
      { id: { $in: ids }, tenantId } as any,
      { 
        isActive: false,
        updatedBy: userId,
      } as DeepPartial<T>
    );
  }

  /**
   * Aggregation methods
   */
  async count(tenantId: string, criteria: FindOptionsWhere<T> = {}): Promise<number> {
    return this.repository.count({
      where: { ...criteria, tenantId } as FindOptionsWhere<T>,
    });
  }

  async exists(tenantId: string, criteria: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.count(tenantId, criteria);
    return count > 0;
  }

  // Hook methods for subclasses to override
  protected async beforeCreate(entity: T, tenantId: string, userId: string): Promise<void> {
    // Override in subclasses for custom validation
  }

  protected async afterCreate(entity: T, tenantId: string, userId: string): Promise<void> {
    // Override in subclasses for post-creation logic
  }

  protected async beforeUpdate(
    entity: T,
    updateDto: DeepPartial<T>,
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Override in subclasses for custom validation
  }

  protected async afterUpdate(entity: T, tenantId: string, userId: string): Promise<void> {
    // Override in subclasses for post-update logic
  }

  protected async beforeDelete(entity: T, tenantId: string, userId: string): Promise<void> {
    // Override in subclasses for deletion validation
  }

  protected async afterDelete(entity: T, tenantId: string, userId: string): Promise<void> {
    // Override in subclasses for cleanup logic
  }
}

/**
 * Financial Service Base Class
 * For services handling financial entities
 */
@Injectable()
export abstract class FinancialService<T extends BaseEntity> extends BaseService<T> {
  /**
   * Calculate totals and validate financial data
   */
  protected async validateFinancialData(entity: any): Promise<void> {
    if (entity.amount && entity.amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }

    if (entity.taxAmount && entity.taxAmount < 0) {
      throw new BadRequestException('Tax amount cannot be negative');
    }

    // Recalculate total
    if (entity.amount !== undefined || entity.taxAmount !== undefined) {
      entity.totalAmount = (entity.amount || 0) + (entity.taxAmount || 0);
    }
  }

  protected async beforeCreate(entity: T, tenantId: string, userId: string): Promise<void> {
    await this.validateFinancialData(entity);
    await super.beforeCreate(entity, tenantId, userId);
  }

  protected async beforeUpdate(
    entity: T,
    updateDto: DeepPartial<T>,
    tenantId: string,
    userId: string
  ): Promise<void> {
    await this.validateFinancialData(updateDto);
    await super.beforeUpdate(entity, updateDto, tenantId, userId);
  }
}

/**
 * Audit Service Base Class
 * For services that need audit trail functionality
 */
@Injectable()
export abstract class AuditableService<T extends BaseEntity> extends BaseService<T> {
  protected async createAuditTrail(
    entityId: string,
    action: string,
    oldValues: any,
    newValues: any,
    userId: string,
    tenantId: string
  ): Promise<void> {
    // Implementation would depend on your audit system
    // This could write to an audit table or emit events
    console.log('Audit Trail:', {
      entityId,
      action,
      oldValues,
      newValues,
      userId,
      tenantId,
      timestamp: new Date(),
    });
  }

  protected async afterCreate(entity: T, tenantId: string, userId: string): Promise<void> {
    await this.createAuditTrail(
      entity.id,
      'CREATE',
      {},
      entity,
      userId,
      tenantId
    );
    await super.afterCreate(entity, tenantId, userId);
  }

  protected async afterUpdate(entity: T, tenantId: string, userId: string): Promise<void> {
    // Note: In a real implementation, you'd want to capture the old values
    await this.createAuditTrail(
      entity.id,
      'UPDATE',
      {}, // old values would be captured here
      entity,
      userId,
      tenantId
    );
    await super.afterUpdate(entity, tenantId, userId);
  }

  protected async afterDelete(entity: T, tenantId: string, userId: string): Promise<void> {
    await this.createAuditTrail(
      entity.id,
      'DELETE',
      entity,
      {},
      userId,
      tenantId
    );
    await super.afterDelete(entity, tenantId, userId);
  }
}

export { BaseService as default };