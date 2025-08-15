import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PriceBuildUpComponent, ComponentType, ValueType } from '../entities/price-build-up-component.entity';
import { StationType, ProductGrade } from '../entities/daily-delivery.entity';
import { 
  CreatePriceBuildUpComponentDto, 
  UpdatePriceBuildUpComponentDto, 
  QueryPriceBuildUpComponentDto,
  PriceBuildUpComponentResponseDto 
} from '../dto/price-build-up-component.dto';

@Injectable()
export class PriceBuildUpService {
  constructor(
    @InjectRepository(PriceBuildUpComponent)
    private readonly priceBuildUpRepository: Repository<PriceBuildUpComponent>,
  ) {}

  async create(createDto: CreatePriceBuildUpComponentDto): Promise<PriceBuildUpComponentResponseDto> {
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
      throw new ConflictException(
        `Active price component already exists for ${createDto.componentCode} - ${createDto.productGrade} - ${createDto.stationType}`
      );
    }

    // Validate effective date is not in the past for new components
    if (createDto.effectiveDate < new Date()) {
      throw new BadRequestException('Effective date cannot be in the past for new components');
    }

    const component = this.priceBuildUpRepository.create(createDto);
    const saved = await this.priceBuildUpRepository.save(component);
    
    return this.mapToResponseDto(saved);
  }

  async findAll(queryDto: QueryPriceBuildUpComponentDto): Promise<{
    data: PriceBuildUpComponentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
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
      queryBuilder.andWhere(
        '(pbc.componentCode ILIKE :search OR pbc.componentName ILIKE :search OR pbc.description ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
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

  async findById(id: string): Promise<PriceBuildUpComponentResponseDto> {
    const component = await this.priceBuildUpRepository.findOne({ where: { id } });
    
    if (!component) {
      throw new NotFoundException(`Price build-up component with ID ${id} not found`);
    }

    return this.mapToResponseDto(component);
  }

  async findEffectiveComponents(
    productGrade: ProductGrade,
    stationType: StationType,
    effectiveDate: Date = new Date()
  ): Promise<PriceBuildUpComponentResponseDto[]> {
    const components = await this.priceBuildUpRepository.find({
      where: {
        productGrade,
        stationType,
        isActive: true,
        effectiveDate: LessThanOrEqual(effectiveDate),
        expiryDate: null // Only get non-expired components
      },
      order: { displayOrder: 'ASC' }
    });

    // Filter out expired components
    const activeComponents = components.filter(component => 
      component.expiryDate === null || component.expiryDate >= effectiveDate
    );

    return activeComponents.map(component => this.mapToResponseDto(component));
  }

  async update(id: string, updateDto: UpdatePriceBuildUpComponentDto): Promise<PriceBuildUpComponentResponseDto> {
    const component = await this.priceBuildUpRepository.findOne({ where: { id } });
    
    if (!component) {
      throw new NotFoundException(`Price build-up component with ID ${id} not found`);
    }

    // Validate expiry date is after effective date
    if (updateDto.expiryDate && updateDto.expiryDate <= component.effectiveDate) {
      throw new BadRequestException('Expiry date must be after effective date');
    }

    Object.assign(component, updateDto);
    const updated = await this.priceBuildUpRepository.save(component);
    
    return this.mapToResponseDto(updated);
  }

  async deactivate(id: string, updatedBy: string): Promise<void> {
    const component = await this.priceBuildUpRepository.findOne({ where: { id } });
    
    if (!component) {
      throw new NotFoundException(`Price build-up component with ID ${id} not found`);
    }

    component.isActive = false;
    component.updatedBy = updatedBy;
    await this.priceBuildUpRepository.save(component);
  }

  async expire(id: string, expiryDate: Date, updatedBy: string): Promise<void> {
    const component = await this.priceBuildUpRepository.findOne({ where: { id } });
    
    if (!component) {
      throw new NotFoundException(`Price build-up component with ID ${id} not found`);
    }

    if (expiryDate <= component.effectiveDate) {
      throw new BadRequestException('Expiry date must be after effective date');
    }

    component.expiryDate = expiryDate;
    component.updatedBy = updatedBy;
    await this.priceBuildUpRepository.save(component);
  }

  async calculatePriceBuildup(
    productGrade: ProductGrade,
    stationType: StationType,
    basePrice: number,
    quantity: number,
    effectiveDate: Date = new Date()
  ): Promise<{
    components: Array<{
      code: string;
      name: string;
      type: ComponentType;
      value: number;
      calculatedAmount: number;
    }>;
    totalPrice: number;
    breakdown: {
      basePrice: number;
      totalTaxes: number;
      totalLevies: number;
      totalMargins: number;
    };
  }> {
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
        case ComponentType.TAX:
          totalTaxes += calculatedAmount;
          break;
        case ComponentType.LEVY:
          totalLevies += calculatedAmount;
          break;
        case ComponentType.MARGIN:
        case ComponentType.MARKUP:
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

  async generatePriceSnapshot(
    productGrade: ProductGrade,
    stationType: StationType,
    effectiveDate: Date = new Date()
  ): Promise<any> {
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

  private calculateComponentValue(
    component: PriceBuildUpComponentResponseDto,
    basePrice: number,
    quantity: number
  ): number {
    switch (component.valueType) {
      case ValueType.FIXED:
        return component.componentValue;
      case ValueType.PERCENTAGE:
        return (basePrice * component.componentValue) / 100;
      case ValueType.FORMULA:
        // In a real implementation, this would use a formula parser
        // For now, treat it as fixed value
        return component.componentValue;
      default:
        return component.componentValue;
    }
  }

  private mapToResponseDto(component: PriceBuildUpComponent): PriceBuildUpComponentResponseDto {
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
}