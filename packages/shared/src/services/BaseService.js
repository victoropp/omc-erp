"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.AuditableService = exports.FinancialService = exports.BaseService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
let BaseService = class BaseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Find all records with pagination and filtering
     */
    async findAll(tenantId, options = {}) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, searchFields = [], filters = {}, } = options;
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
                }
                else {
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
    async findOne(id, tenantId) {
        const entity = await this.repository.findOne({
            where: { id, tenantId },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${id} not found`);
        }
        return entity;
    }
    /**
     * Find records by specific criteria
     */
    async findBy(tenantId, criteria, options) {
        return this.repository.find({
            where: { ...criteria, tenantId },
            ...options,
        });
    }
    /**
     * Create a new record
     */
    async create(tenantId, createDto, userId) {
        const entity = this.repository.create({
            ...createDto,
            tenantId,
            createdBy: userId,
        });
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
    async update(id, tenantId, updateDto, userId) {
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
    async remove(id, tenantId, userId) {
        const entity = await this.findOne(id, tenantId);
        // Run validation hooks
        await this.beforeDelete(entity, tenantId, userId);
        await this.repository.update({ id, tenantId }, {
            isActive: false,
            updatedBy: userId,
        });
        // Run post-deletion hooks
        await this.afterDelete(entity, tenantId, userId);
    }
    /**
     * Hard delete a record (use with caution)
     */
    async hardDelete(id, tenantId, userId) {
        const entity = await this.findOne(id, tenantId);
        await this.beforeDelete(entity, tenantId, userId);
        await this.repository.delete({ id, tenantId });
        await this.afterDelete(entity, tenantId, userId);
    }
    /**
     * Bulk operations
     */
    async bulkCreate(tenantId, createDtos, userId) {
        const entities = createDtos.map(dto => this.repository.create({
            ...dto,
            tenantId,
            createdBy: userId,
        }));
        return this.repository.save(entities);
    }
    async bulkUpdate(tenantId, criteria, updateDto, userId) {
        await this.repository.update({ ...criteria, tenantId }, {
            ...updateDto,
            updatedBy: userId,
        });
    }
    async bulkDelete(tenantId, ids, userId) {
        await this.repository.update({ id: { $in: ids }, tenantId }, {
            isActive: false,
            updatedBy: userId,
        });
    }
    /**
     * Aggregation methods
     */
    async count(tenantId, criteria = {}) {
        return this.repository.count({
            where: { ...criteria, tenantId },
        });
    }
    async exists(tenantId, criteria) {
        const count = await this.count(tenantId, criteria);
        return count > 0;
    }
    // Hook methods for subclasses to override
    async beforeCreate(entity, tenantId, userId) {
        // Override in subclasses for custom validation
    }
    async afterCreate(entity, tenantId, userId) {
        // Override in subclasses for post-creation logic
    }
    async beforeUpdate(entity, updateDto, tenantId, userId) {
        // Override in subclasses for custom validation
    }
    async afterUpdate(entity, tenantId, userId) {
        // Override in subclasses for post-update logic
    }
    async beforeDelete(entity, tenantId, userId) {
        // Override in subclasses for deletion validation
    }
    async afterDelete(entity, tenantId, userId) {
        // Override in subclasses for cleanup logic
    }
};
exports.BaseService = BaseService;
exports.default = BaseService;
exports.default = exports.BaseService = BaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _a : Object])
], BaseService);
/**
 * Financial Service Base Class
 * For services handling financial entities
 */
let FinancialService = class FinancialService extends BaseService {
    /**
     * Calculate totals and validate financial data
     */
    async validateFinancialData(entity) {
        if (entity.amount && entity.amount < 0) {
            throw new common_1.BadRequestException('Amount cannot be negative');
        }
        if (entity.taxAmount && entity.taxAmount < 0) {
            throw new common_1.BadRequestException('Tax amount cannot be negative');
        }
        // Recalculate total
        if (entity.amount !== undefined || entity.taxAmount !== undefined) {
            entity.totalAmount = (entity.amount || 0) + (entity.taxAmount || 0);
        }
    }
    async beforeCreate(entity, tenantId, userId) {
        await this.validateFinancialData(entity);
        await super.beforeCreate(entity, tenantId, userId);
    }
    async beforeUpdate(entity, updateDto, tenantId, userId) {
        await this.validateFinancialData(updateDto);
        await super.beforeUpdate(entity, updateDto, tenantId, userId);
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)()
], FinancialService);
/**
 * Audit Service Base Class
 * For services that need audit trail functionality
 */
let AuditableService = class AuditableService extends BaseService {
    async createAuditTrail(entityId, action, oldValues, newValues, userId, tenantId) {
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
    async afterCreate(entity, tenantId, userId) {
        await this.createAuditTrail(entity.id, 'CREATE', {}, entity, userId, tenantId);
        await super.afterCreate(entity, tenantId, userId);
    }
    async afterUpdate(entity, tenantId, userId) {
        // Note: In a real implementation, you'd want to capture the old values
        await this.createAuditTrail(entity.id, 'UPDATE', {}, // old values would be captured here
        entity, userId, tenantId);
        await super.afterUpdate(entity, tenantId, userId);
    }
    async afterDelete(entity, tenantId, userId) {
        await this.createAuditTrail(entity.id, 'DELETE', entity, {}, userId, tenantId);
        await super.afterDelete(entity, tenantId, userId);
    }
};
exports.AuditableService = AuditableService;
exports.AuditableService = AuditableService = __decorate([
    (0, common_1.Injectable)()
], AuditableService);
//# sourceMappingURL=BaseService.js.map