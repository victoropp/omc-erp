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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PriceBuildupService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBuildupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const NodeCache = __importStar(require("node-cache"));
const XLSX = __importStar(require("xlsx"));
const price_buildup_entity_1 = require("../entities/price-buildup.entity");
let PriceBuildupService = PriceBuildupService_1 = class PriceBuildupService {
    buildupRepository;
    componentRepository;
    stationPricingRepository;
    auditRepository;
    eventEmitter;
    entityManager;
    logger = new common_1.Logger(PriceBuildupService_1.name);
    cache = new NodeCache({
        stdTTL: 1800, // 30 minutes for price calculations
        checkperiod: 300, // Check for expired keys every 5 minutes
        useClones: false
    });
    constructor(buildupRepository, componentRepository, stationPricingRepository, auditRepository, eventEmitter, entityManager) {
        this.buildupRepository = buildupRepository;
        this.componentRepository = componentRepository;
        this.stationPricingRepository = stationPricingRepository;
        this.auditRepository = auditRepository;
        this.eventEmitter = eventEmitter;
        this.entityManager = entityManager;
    }
    // ===== PRICE BUILDUP VERSION MANAGEMENT =====
    async createPriceBuildupVersion(createDto, createdBy) {
        return this.entityManager.transaction(async (manager) => {
            try {
                // Check for overlapping effective dates
                await this.validateEffectiveDateRange(createDto.productType, createDto.effectiveDate, createDto.expiryDate);
                // Get next version number
                const versionNumber = await this.getNextVersionNumber(createDto.productType);
                // Create price buildup version
                const buildupVersion = manager.create(price_buildup_entity_1.PriceBuildupVersion, {
                    ...createDto,
                    versionNumber,
                    createdBy,
                    status: price_buildup_entity_1.PriceComponentStatus.DRAFT,
                });
                const savedBuildupVersion = await manager.save(buildupVersion);
                // Create price components
                const components = createDto.components.map(componentDto => manager.create(price_buildup_entity_1.PriceComponent, {
                    ...componentDto,
                    buildupVersionId: savedBuildupVersion.id,
                    createdBy,
                }));
                await manager.save(components);
                // Generate station type pricing
                await this.generateStationTypePricing(manager, savedBuildupVersion.id, createdBy);
                // Create audit trail
                await this.createAuditTrail(manager, {
                    buildupVersionId: savedBuildupVersion.id,
                    actionType: 'CREATE',
                    actionDescription: `Created new price buildup version ${versionNumber} for ${createDto.productType}`,
                    newValues: createDto,
                    actionBy: createdBy,
                });
                // Clear cache
                this.clearPriceCache(createDto.productType);
                // Emit event
                this.eventEmitter.emit('price-buildup.created', {
                    buildupVersionId: savedBuildupVersion.id,
                    productType: createDto.productType,
                    versionNumber,
                    createdBy,
                });
                this.logger.log(`Created price buildup version ${versionNumber} for ${createDto.productType}`);
                return this.findBuildupVersionById(savedBuildupVersion.id);
            }
            catch (error) {
                this.logger.error(`Failed to create price buildup version: ${error.message}`);
                throw error;
            }
        });
    }
    async updatePriceBuildupVersion(id, updateDto, updatedBy) {
        return this.entityManager.transaction(async (manager) => {
            const buildupVersion = await this.findBuildupVersionById(id);
            if (!buildupVersion.canBeModified()) {
                throw new common_1.BadRequestException('Cannot modify a published or archived price buildup version');
            }
            const oldValues = { ...buildupVersion };
            // Update buildup version
            await manager.update(price_buildup_entity_1.PriceBuildupVersion, id, {
                ...updateDto,
                updatedBy,
            });
            // Update components if provided
            if (updateDto.components) {
                for (const componentUpdate of updateDto.components) {
                    const component = await this.componentRepository.findOne({
                        where: {
                            buildupVersionId: id,
                            componentType: componentUpdate.componentType || undefined
                        }
                    });
                    if (component) {
                        await manager.update(price_buildup_entity_1.PriceComponent, component.id, {
                            ...componentUpdate,
                            updatedBy,
                        });
                    }
                }
            }
            // Regenerate station type pricing if components changed
            if (updateDto.components) {
                await this.generateStationTypePricing(manager, id, updatedBy);
            }
            // Create audit trail
            await this.createAuditTrail(manager, {
                buildupVersionId: id,
                actionType: 'UPDATE',
                actionDescription: `Updated price buildup version`,
                oldValues,
                newValues: updateDto,
                actionBy: updatedBy,
            });
            // Clear cache
            this.clearPriceCache(buildupVersion.productType);
            this.logger.log(`Updated price buildup version ${id}`);
            return this.findBuildupVersionById(id);
        });
    }
    async approvePriceBuildupVersion(id, approveDto) {
        return this.entityManager.transaction(async (manager) => {
            const buildupVersion = await this.findBuildupVersionById(id);
            if (buildupVersion.status !== price_buildup_entity_1.PriceComponentStatus.PENDING_APPROVAL &&
                buildupVersion.status !== price_buildup_entity_1.PriceComponentStatus.DRAFT) {
                throw new common_1.BadRequestException('Only draft or pending approval versions can be approved');
            }
            // Update approval status
            await manager.update(price_buildup_entity_1.PriceBuildupVersion, id, {
                status: price_buildup_entity_1.PriceComponentStatus.ACTIVE,
                approvedBy: approveDto.approvedBy,
                approvalDate: new Date(),
                approvalNotes: approveDto.approvalNotes,
                publishedBy: approveDto.publishImmediately ? approveDto.approvedBy : null,
                publishedDate: approveDto.publishImmediately ? new Date() : null,
            });
            // Deactivate previous active versions for the same product
            if (approveDto.publishImmediately) {
                await this.deactivatePreviousVersions(manager, buildupVersion.productType, id);
            }
            // Create audit trail
            await this.createAuditTrail(manager, {
                buildupVersionId: id,
                actionType: 'APPROVE',
                actionDescription: `Approved price buildup version${approveDto.publishImmediately ? ' and published immediately' : ''}`,
                newValues: approveDto,
                actionBy: approveDto.approvedBy,
            });
            // Clear cache
            this.clearPriceCache(buildupVersion.productType);
            // Emit event
            this.eventEmitter.emit('price-buildup.approved', {
                buildupVersionId: id,
                productType: buildupVersion.productType,
                approvedBy: approveDto.approvedBy,
                published: approveDto.publishImmediately,
            });
            this.logger.log(`Approved price buildup version ${id}`);
            return this.findBuildupVersionById(id);
        });
    }
    async publishPriceBuildupVersion(id, publishDto) {
        return this.entityManager.transaction(async (manager) => {
            const buildupVersion = await this.findBuildupVersionById(id);
            if (buildupVersion.status !== price_buildup_entity_1.PriceComponentStatus.ACTIVE) {
                throw new common_1.BadRequestException('Only approved versions can be published');
            }
            if (buildupVersion.publishedDate) {
                throw new common_1.BadRequestException('Version is already published');
            }
            const publishDate = publishDto.publishDate || new Date();
            // Update publish status
            await manager.update(price_buildup_entity_1.PriceBuildupVersion, id, {
                publishedBy: publishDto.publishedBy,
                publishedDate: publishDate,
            });
            // Deactivate previous active versions
            await this.deactivatePreviousVersions(manager, buildupVersion.productType, id);
            // Create audit trail
            await this.createAuditTrail(manager, {
                buildupVersionId: id,
                actionType: 'PUBLISH',
                actionDescription: `Published price buildup version`,
                newValues: publishDto,
                actionBy: publishDto.publishedBy,
            });
            // Clear cache
            this.clearPriceCache(buildupVersion.productType);
            // Emit event
            this.eventEmitter.emit('price-buildup.published', {
                buildupVersionId: id,
                productType: buildupVersion.productType,
                publishedBy: publishDto.publishedBy,
                publishDate,
            });
            this.logger.log(`Published price buildup version ${id}`);
            return this.findBuildupVersionById(id);
        });
    }
    // ===== PRICE CALCULATION =====
    async calculatePrice(request) {
        const cacheKey = this.buildPriceCacheKey(request);
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const context = {
            productType: request.productType,
            stationType: request.stationType,
            calculationDate: request.calculationDate || new Date(),
            volume: request.volume,
            excludeComponents: request.excludeComponents,
        };
        // Get active price buildup version
        const buildupVersion = await this.getActivePriceBuildupVersion(context.productType, context.calculationDate);
        if (!buildupVersion) {
            throw new common_1.NotFoundException(`No active price buildup found for ${context.productType} on ${context.calculationDate}`);
        }
        // Calculate prices for the station type
        const breakdown = await this.calculatePriceBreakdown(buildupVersion, context);
        const totalPrice = breakdown.reduce((sum, item) => sum + item.amount, 0);
        const result = {
            productType: context.productType,
            stationType: context.stationType,
            calculationDate: context.calculationDate,
            totalPrice,
            currency: 'GHS',
            breakdown: request.includeBreakdown ? breakdown : [],
            metadata: {
                buildupVersionId: buildupVersion.id,
                versionNumber: buildupVersion.versionNumber,
                calculatedAt: new Date(),
            },
        };
        // Cache the result
        this.cache.set(cacheKey, result, 1800); // 30 minutes
        return result;
    }
    async getPriceHistory(productType, stationType, fromDate, toDate) {
        const buildupVersions = await this.buildupRepository.find({
            where: {
                productType,
                status: price_buildup_entity_1.PriceComponentStatus.ACTIVE,
                effectiveDate: (0, typeorm_2.Between)(fromDate, toDate),
                isActive: true,
            },
            relations: ['components'],
            order: { effectiveDate: 'ASC' },
        });
        const priceHistory = [];
        for (const buildupVersion of buildupVersions) {
            const context = {
                productType,
                stationType,
                calculationDate: buildupVersion.effectiveDate,
            };
            const breakdown = await this.calculatePriceBreakdown(buildupVersion, context);
            const totalPrice = breakdown.reduce((sum, item) => sum + item.amount, 0);
            priceHistory.push({
                productType,
                stationType,
                calculationDate: buildupVersion.effectiveDate,
                totalPrice,
                currency: 'GHS',
                breakdown,
                metadata: {
                    buildupVersionId: buildupVersion.id,
                    versionNumber: buildupVersion.versionNumber,
                    calculatedAt: new Date(),
                },
            });
        }
        return priceHistory;
    }
    // ===== BULK OPERATIONS =====
    async bulkUpdatePrices(bulkUpdateDto, updatedBy) {
        if (bulkUpdateDto.createNewVersion) {
            // Create new version with updated components
            const activeVersion = await this.getActivePriceBuildupVersion(bulkUpdateDto.productType, new Date());
            if (!activeVersion) {
                throw new common_1.NotFoundException(`No active price buildup found for ${bulkUpdateDto.productType}`);
            }
            const existingComponents = activeVersion.components.map(component => {
                const update = bulkUpdateDto.componentUpdates.find(u => u.componentType === component.componentType &&
                    u.stationType === component.stationType);
                return {
                    componentType: component.componentType,
                    componentName: component.componentName,
                    category: component.category,
                    amount: update ? update.newAmount : component.amount,
                    currency: component.currency,
                    isPercentage: component.isPercentage,
                    percentageBase: component.percentageBase,
                    calculationFormula: component.calculationFormula,
                    stationType: component.stationType,
                    isMandatory: component.isMandatory,
                    isConfigurable: component.isConfigurable,
                    minAmount: component.minAmount,
                    maxAmount: component.maxAmount,
                    displayOrder: component.displayOrder,
                    description: component.description,
                    regulatoryReference: component.regulatoryReference,
                    externalSource: component.externalSource,
                    externalReference: component.externalReference,
                    effectiveDate: bulkUpdateDto.effectiveDate,
                    expiryDate: component.expiryDate,
                };
            });
            const createDto = {
                productType: bulkUpdateDto.productType,
                effectiveDate: bulkUpdateDto.effectiveDate,
                changeReason: bulkUpdateDto.changeReason,
                approvalRequired: bulkUpdateDto.requireApproval,
                components: existingComponents,
            };
            return this.createPriceBuildupVersion(createDto, updatedBy);
        }
        else {
            // Update existing active version
            throw new common_1.BadRequestException('Direct bulk updates to existing versions not supported. Create new version instead.');
        }
    }
    async uploadFromExcel(file, uploadDto) {
        try {
            const workbook = XLSX.read(file, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const errors = [];
            const components = [];
            // Validate and parse Excel data
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    const component = this.parseExcelRow(row, i + 2); // +2 for header and 0-based index
                    components.push(component);
                }
                catch (error) {
                    errors.push(`Row ${i + 2}: ${error.message}`);
                }
            }
            if (errors.length > 0 && !uploadDto.validateOnly) {
                return { success: false, message: 'Validation errors found', errors };
            }
            if (uploadDto.validateOnly) {
                return {
                    success: true,
                    message: `Validation completed. ${components.length} valid rows, ${errors.length} errors.`,
                    errors: errors.length > 0 ? errors : undefined
                };
            }
            // Create price buildup version
            const createDto = {
                productType: uploadDto.productType,
                effectiveDate: uploadDto.effectiveDate,
                changeReason: uploadDto.changeReason,
                components,
            };
            const buildupVersion = await this.createPriceBuildupVersion(createDto, uploadDto.uploadedBy);
            return {
                success: true,
                message: `Successfully imported ${components.length} price components`,
                buildupVersionId: buildupVersion.id,
            };
        }
        catch (error) {
            this.logger.error(`Excel upload failed: ${error.message}`);
            return { success: false, message: `Upload failed: ${error.message}` };
        }
    }
    // ===== QUERY METHODS =====
    async findPriceBuildupVersions(query) {
        const where = {
            isActive: true,
        };
        if (query.productType)
            where.productType = query.productType;
        if (query.status)
            where.status = query.status;
        if (query.createdBy)
            where.createdBy = query.createdBy;
        if (query.effectiveDate)
            where.effectiveDate = (0, typeorm_2.LessThanOrEqual)(query.effectiveDate);
        if (query.fromDate && query.toDate) {
            where.effectiveDate = (0, typeorm_2.Between)(query.fromDate, query.toDate);
        }
        const relations = [];
        if (query.includeComponents)
            relations.push('components');
        if (query.includeStationTypePricing)
            relations.push('stationTypePricing');
        const [data, total] = await this.buildupRepository.findAndCount({
            where,
            relations,
            order: { effectiveDate: 'DESC', versionNumber: 'DESC' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });
        return {
            data,
            total,
            page: query.page,
            limit: query.limit,
        };
    }
    async findBuildupVersionById(id) {
        const buildupVersion = await this.buildupRepository.findOne({
            where: { id, isActive: true },
            relations: ['components', 'stationTypePricing'],
        });
        if (!buildupVersion) {
            throw new common_1.NotFoundException(`Price buildup version ${id} not found`);
        }
        return buildupVersion;
    }
    async getAuditTrail(query) {
        const where = {};
        if (query.buildupVersionId)
            where.buildupVersionId = query.buildupVersionId;
        if (query.componentId)
            where.componentId = query.componentId;
        if (query.actionType)
            where.actionType = query.actionType;
        if (query.actionBy)
            where.actionBy = query.actionBy;
        if (query.fromDate && query.toDate) {
            where.actionDate = (0, typeorm_2.Between)(query.fromDate, query.toDate);
        }
        const [data, total] = await this.auditRepository.findAndCount({
            where,
            relations: ['buildupVersion', 'component'],
            order: { actionDate: 'DESC' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });
        return {
            data,
            total,
            page: query.page,
            limit: query.limit,
        };
    }
    // ===== PRIVATE HELPER METHODS =====
    async validateEffectiveDateRange(productType, effectiveDate, expiryDate) {
        const overlapping = await this.buildupRepository.findOne({
            where: [
                {
                    productType,
                    isActive: true,
                    status: (0, typeorm_2.In)([price_buildup_entity_1.PriceComponentStatus.ACTIVE, price_buildup_entity_1.PriceComponentStatus.PENDING_APPROVAL]),
                    effectiveDate: (0, typeorm_2.LessThanOrEqual)(effectiveDate),
                    expiryDate: (0, typeorm_2.MoreThanOrEqual)(effectiveDate),
                },
                ...(expiryDate ? [{
                        productType,
                        isActive: true,
                        status: (0, typeorm_2.In)([price_buildup_entity_1.PriceComponentStatus.ACTIVE, price_buildup_entity_1.PriceComponentStatus.PENDING_APPROVAL]),
                        effectiveDate: (0, typeorm_2.LessThanOrEqual)(expiryDate),
                        expiryDate: (0, typeorm_2.MoreThanOrEqual)(expiryDate),
                    }] : []),
            ],
        });
        if (overlapping) {
            throw new common_1.ConflictException('Effective date range overlaps with existing price buildup version');
        }
    }
    async getNextVersionNumber(productType) {
        const latest = await this.buildupRepository.findOne({
            where: { productType },
            order: { versionNumber: 'DESC' },
        });
        return (latest?.versionNumber || 0) + 1;
    }
    async generateStationTypePricing(manager, buildupVersionId, createdBy) {
        // Remove existing station type pricing
        await manager.delete(price_buildup_entity_1.StationTypePricing, { buildupVersionId });
        // Get all components for this buildup version
        const components = await manager.find(price_buildup_entity_1.PriceComponent, {
            where: { buildupVersionId },
        });
        // Generate pricing for each station type
        const stationTypes = Object.values(price_buildup_entity_1.StationType);
        const productTypes = Object.values(price_buildup_entity_1.ProductType);
        for (const stationType of stationTypes) {
            for (const productType of productTypes) {
                const applicableComponents = components.filter(c => !c.stationType || c.stationType === stationType);
                const basePrice = this.calculateBasePrice(applicableComponents);
                const totalTaxesLevies = this.calculateTotalByCategory(applicableComponents, price_buildup_entity_1.PriceComponentCategory.TAX_LEVY);
                const totalMargins = this.calculateTotalByCategory(applicableComponents, price_buildup_entity_1.PriceComponentCategory.MARGIN);
                const totalCosts = this.calculateTotalByCategory(applicableComponents, price_buildup_entity_1.PriceComponentCategory.COST);
                const stationPricing = manager.create(price_buildup_entity_1.StationTypePricing, {
                    buildupVersionId,
                    stationType,
                    productType,
                    basePrice,
                    totalTaxesLevies,
                    totalMargins,
                    totalCosts,
                    finalPrice: basePrice + totalTaxesLevies + totalMargins + totalCosts,
                    currency: 'GHS',
                    createdBy,
                });
                await manager.save(stationPricing);
            }
        }
    }
    async getActivePriceBuildupVersion(productType, effectiveDate) {
        return this.buildupRepository.findOne({
            where: {
                productType,
                status: price_buildup_entity_1.PriceComponentStatus.ACTIVE,
                isActive: true,
                effectiveDate: (0, typeorm_2.LessThanOrEqual)(effectiveDate),
                expiryDate: (0, typeorm_2.MoreThanOrEqual)(effectiveDate),
            },
            relations: ['components'],
            order: { effectiveDate: 'DESC' },
        });
    }
    async calculatePriceBreakdown(buildupVersion, context) {
        const applicableComponents = buildupVersion.components
            .filter(c => !c.stationType || c.stationType === context.stationType)
            .filter(c => !context.excludeComponents?.includes(c.componentType))
            .filter(c => c.isEffective(context.calculationDate))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        const breakdown = [];
        let runningTotal = 0;
        for (const component of applicableComponents) {
            let amount = component.amount;
            let calculationBase;
            if (component.isPercentage && component.percentageBase) {
                // Find the base component
                const baseComponent = breakdown.find(b => b.componentType === component.percentageBase);
                if (baseComponent) {
                    calculationBase = baseComponent.amount;
                    amount = (component.amount / 100) * calculationBase;
                }
            }
            breakdown.push({
                componentType: component.componentType,
                componentName: component.componentName,
                category: component.category,
                amount,
                isPercentage: component.isPercentage,
                calculationBase,
                displayOrder: component.displayOrder,
                description: component.description,
            });
            runningTotal += amount;
        }
        return breakdown;
    }
    calculateBasePrice(components) {
        return components
            .filter(c => c.category === price_buildup_entity_1.PriceComponentCategory.BASE_PRICE)
            .reduce((sum, c) => sum + c.amount, 0);
    }
    calculateTotalByCategory(components, category) {
        return components
            .filter(c => c.category === category)
            .reduce((sum, c) => sum + c.amount, 0);
    }
    async deactivatePreviousVersions(manager, productType, excludeId) {
        await manager.update(price_buildup_entity_1.PriceBuildupVersion, {
            productType,
            status: price_buildup_entity_1.PriceComponentStatus.ACTIVE,
            id: not(excludeId),
        }, { status: price_buildup_entity_1.PriceComponentStatus.ARCHIVED });
    }
    async createAuditTrail(manager, auditData) {
        const audit = manager.create(price_buildup_entity_1.PriceBuildupAuditTrail, {
            ...auditData,
            actionDate: new Date(),
        });
        await manager.save(audit);
    }
    parseExcelRow(row, rowNumber) {
        // Implement Excel row parsing logic based on your Excel template structure
        const requiredFields = ['componentType', 'componentName', 'category', 'amount'];
        for (const field of requiredFields) {
            if (!row[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        return {
            componentType: row.componentType,
            componentName: row.componentName,
            category: row.category,
            amount: parseFloat(row.amount),
            currency: row.currency || 'GHS',
            isPercentage: row.isPercentage === 'true' || row.isPercentage === true,
            percentageBase: row.percentageBase || null,
            stationType: row.stationType || null,
            description: row.description || null,
            effectiveDate: new Date(),
        };
    }
    buildPriceCacheKey(request) {
        return `price:${request.productType}:${request.stationType}:${request.calculationDate?.toISOString() || 'now'}:${request.excludeComponents?.join(',') || 'none'}`;
    }
    clearPriceCache(productType) {
        const keys = this.cache.keys();
        const keysToDelete = keys.filter(key => key.startsWith(`price:${productType}:`));
        keysToDelete.forEach(key => this.cache.del(key));
    }
};
exports.PriceBuildupService = PriceBuildupService;
exports.PriceBuildupService = PriceBuildupService = PriceBuildupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(price_buildup_entity_1.PriceBuildupVersion)),
    __param(1, (0, typeorm_1.InjectRepository)(price_buildup_entity_1.PriceComponent)),
    __param(2, (0, typeorm_1.InjectRepository)(price_buildup_entity_1.StationTypePricing)),
    __param(3, (0, typeorm_1.InjectRepository)(price_buildup_entity_1.PriceBuildupAuditTrail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object, typeorm_2.EntityManager])
], PriceBuildupService);
// Helper function for TypeORM not() operator
function not(value) {
    return { $ne: value };
}
//# sourceMappingURL=price-buildup.service.js.map