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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBuildUpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const price_build_up_component_entity_1 = require("../entities/price-build-up-component.entity");
let PriceBuildUpService = class PriceBuildUpService {
    priceBuildUpRepository;
    constructor(priceBuildUpRepository) {
        this.priceBuildUpRepository = priceBuildUpRepository;
    }
    async create(createDto) {
        // Check for existing active component with same code, grade, and station type
        const existing = await this.priceBuildUpRepository.findOne({
            where: {
                componentCode: createDto.componentCode,
                productGrade: createDto.productGrade,
                stationType: createDto.stationType,
                isActive: true,
                expiryDate: null
            }
        });
        if (existing) {
            throw new common_1.ConflictException(`Active price component already exists for ${createDto.componentCode} - ${createDto.productGrade} - ${createDto.stationType}`);
        }
        // Validate effective date is not in the past for new components
        if (createDto.effectiveDate < new Date()) {
            throw new common_1.BadRequestException('Effective date cannot be in the past for new components');
        }
        const component = this.priceBuildUpRepository.create(createDto);
        const saved = await this.priceBuildUpRepository.save(component);
        return this.mapToResponseDto(saved);
    }
    async findAll(queryDto) {
        const queryBuilder = this.priceBuildUpRepository.createQueryBuilder('pbc');
        // Apply filters
        if (queryDto.productGrade) {
            queryBuilder.andWhere('pbc.productGrade = :productGrade', { productGrade: queryDto.productGrade });
        }
        if (queryDto.stationType) {
            queryBuilder.andWhere('pbc.stationType = :stationType', { stationType: queryDto.stationType });
        }
        if (queryDto.componentType) {
            queryBuilder.andWhere('pbc.componentType = :componentType', { componentType: queryDto.componentType });
        }
        if (queryDto.effectiveDate) {
            queryBuilder.andWhere('pbc.effectiveDate <= :effectiveDate', { effectiveDate: queryDto.effectiveDate });
            queryBuilder.andWhere('(pbc.expiryDate IS NULL OR pbc.expiryDate >= :effectiveDate)', { effectiveDate: queryDto.effectiveDate });
        }
        if (queryDto.isActive !== undefined) {
            queryBuilder.andWhere('pbc.isActive = :isActive', { isActive: queryDto.isActive });
        }
        if (queryDto.search) {
            queryBuilder.andWhere('(pbc.componentCode ILIKE :search OR pbc.componentName ILIKE :search OR pbc.description ILIKE :search)', { search: `%${queryDto.search}%` });
        }
        // Apply sorting
        const sortBy = queryDto.sortBy || 'displayOrder';
        const sortOrder = queryDto.sortOrder || 'ASC';
        queryBuilder.orderBy(`pbc.${sortBy}`, sortOrder);
        // Apply pagination
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 20;
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [components, total] = await queryBuilder.getManyAndCount();
        return {
            data: components.map(component => this.mapToResponseDto(component)),
            total,
            page,
            limit
        };
    }
    async findById(id) {
        const component = await this.priceBuildUpRepository.findOne({ where: { id } });
        if (!component) {
            throw new common_1.NotFoundException(`Price build-up component with ID ${id} not found`);
        }
        return this.mapToResponseDto(component);
    }
    async findEffectiveComponents(productGrade, stationType, effectiveDate = new Date()) {
        const components = await this.priceBuildUpRepository.find({
            where: {
                productGrade,
                stationType,
                isActive: true,
                effectiveDate: (0, typeorm_2.LessThanOrEqual)(effectiveDate),
                expiryDate: null // Only get non-expired components
            },
            order: { displayOrder: 'ASC' }
        });
        // Filter out expired components
        const activeComponents = components.filter(component => component.expiryDate === null || component.expiryDate >= effectiveDate);
        return activeComponents.map(component => this.mapToResponseDto(component));
    }
    async update(id, updateDto) {
        const component = await this.priceBuildUpRepository.findOne({ where: { id } });
        if (!component) {
            throw new common_1.NotFoundException(`Price build-up component with ID ${id} not found`);
        }
        // Validate expiry date is after effective date
        if (updateDto.expiryDate && updateDto.expiryDate <= component.effectiveDate) {
            throw new common_1.BadRequestException('Expiry date must be after effective date');
        }
        Object.assign(component, updateDto);
        const updated = await this.priceBuildUpRepository.save(component);
        return this.mapToResponseDto(updated);
    }
    async deactivate(id, updatedBy) {
        const component = await this.priceBuildUpRepository.findOne({ where: { id } });
        if (!component) {
            throw new common_1.NotFoundException(`Price build-up component with ID ${id} not found`);
        }
        component.isActive = false;
        component.updatedBy = updatedBy;
        await this.priceBuildUpRepository.save(component);
    }
    async expire(id, expiryDate, updatedBy) {
        const component = await this.priceBuildUpRepository.findOne({ where: { id } });
        if (!component) {
            throw new common_1.NotFoundException(`Price build-up component with ID ${id} not found`);
        }
        if (expiryDate <= component.effectiveDate) {
            throw new common_1.BadRequestException('Expiry date must be after effective date');
        }
        component.expiryDate = expiryDate;
        component.updatedBy = updatedBy;
        await this.priceBuildUpRepository.save(component);
    }
    async calculatePriceBuildup(productGrade, stationType, basePrice, quantity, effectiveDate = new Date()) {
        const components = await this.findEffectiveComponents(productGrade, stationType, effectiveDate);
        const calculatedComponents = [];
        let totalTaxes = 0;
        let totalLevies = 0;
        let totalMargins = 0;
        for (const component of components) {
            const calculatedAmount = this.calculateComponentValue(component, basePrice, quantity);
            calculatedComponents.push({
                code: component.componentCode,
                name: component.componentName,
                type: component.componentType,
                value: component.componentValue,
                calculatedAmount
            });
            // Categorize amounts
            switch (component.componentType) {
                case price_build_up_component_entity_1.ComponentType.TAX:
                    totalTaxes += calculatedAmount;
                    break;
                case price_build_up_component_entity_1.ComponentType.LEVY:
                    totalLevies += calculatedAmount;
                    break;
                case price_build_up_component_entity_1.ComponentType.MARGIN:
                case price_build_up_component_entity_1.ComponentType.MARKUP:
                    totalMargins += calculatedAmount;
                    break;
            }
        }
        const totalPrice = basePrice + totalTaxes + totalLevies + totalMargins;
        return {
            components: calculatedComponents,
            totalPrice,
            breakdown: {
                basePrice,
                totalTaxes,
                totalLevies,
                totalMargins
            }
        };
    }
    async generatePriceSnapshot(productGrade, stationType, effectiveDate = new Date()) {
        const components = await this.findEffectiveComponents(productGrade, stationType, effectiveDate);
        const snapshot = {};
        for (const component of components) {
            snapshot[component.componentCode] = {
                name: component.componentName,
                type: component.componentType,
                value: component.componentValue,
                valueType: component.valueType,
                effectiveDate: component.effectiveDate,
                displayOrder: component.displayOrder
            };
        }
        return snapshot;
    }
    calculateComponentValue(component, basePrice, quantity) {
        switch (component.valueType) {
            case price_build_up_component_entity_1.ValueType.FIXED:
                return component.componentValue;
            case price_build_up_component_entity_1.ValueType.PERCENTAGE:
                return (basePrice * component.componentValue) / 100;
            case price_build_up_component_entity_1.ValueType.FORMULA:
                // In a real implementation, this would use a formula parser
                // For now, treat it as fixed value
                return component.componentValue;
            default:
                return component.componentValue;
        }
    }
    mapToResponseDto(component) {
        return {
            id: component.id,
            componentCode: component.componentCode,
            componentName: component.componentName,
            componentType: component.componentType,
            productGrade: component.productGrade,
            stationType: component.stationType,
            effectiveDate: component.effectiveDate,
            expiryDate: component.expiryDate,
            componentValue: component.componentValue,
            valueType: component.valueType,
            calculationFormula: component.calculationFormula,
            currencyCode: component.currencyCode,
            isActive: component.isActive,
            isMandatory: component.isMandatory,
            displayOrder: component.displayOrder,
            description: component.description,
            regulatoryReference: component.regulatoryReference,
            createdAt: component.createdAt,
            updatedAt: component.updatedAt,
            createdBy: component.createdBy,
            updatedBy: component.updatedBy
        };
    }
};
exports.PriceBuildUpService = PriceBuildUpService;
exports.PriceBuildUpService = PriceBuildUpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(price_build_up_component_entity_1.PriceBuildUpComponent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PriceBuildUpService);
//# sourceMappingURL=price-build-up.service.js.map