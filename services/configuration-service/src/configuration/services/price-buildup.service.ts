import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In, Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as NodeCache from 'node-cache';
import * as XLSX from 'xlsx';
import {
  PriceBuildupVersion,
  PriceComponent,
  StationTypePricing,
  PriceBuildupAuditTrail,
  PriceComponentType,
  PriceComponentStatus,
  StationType,
  ProductType,
  PriceComponentCategory,
} from '../entities/price-buildup.entity';
import {
  CreatePriceBuildupVersionDto,
  UpdatePriceBuildupVersionDto,
  ApprovePriceBuildupDto,
  PublishPriceBuildupDto,
  PriceBuildupQueryDto,
  StationTypeConfigurationDto,
  BulkPriceUpdateDto,
  ExcelUploadDto,
  PriceCalculationRequestDto,
  PriceCalculationResponseDto,
  AuditTrailQueryDto,
  PriceBreakdownDto,
} from '../dto/price-buildup.dto';

interface PriceCalculationContext {
  productType: ProductType;
  stationType: StationType;
  calculationDate: Date;
  volume?: number;
  excludeComponents?: PriceComponentType[];
}

@Injectable()
export class PriceBuildupService {
  private readonly logger = new Logger(PriceBuildupService.name);
  private readonly cache = new NodeCache({ 
    stdTTL: 1800, // 30 minutes for price calculations
    checkperiod: 300, // Check for expired keys every 5 minutes
    useClones: false 
  });

  constructor(
    @InjectRepository(PriceBuildupVersion)
    private buildupRepository: Repository<PriceBuildupVersion>,
    
    @InjectRepository(PriceComponent)
    private componentRepository: Repository<PriceComponent>,
    
    @InjectRepository(StationTypePricing)
    private stationPricingRepository: Repository<StationTypePricing>,
    
    @InjectRepository(PriceBuildupAuditTrail)
    private auditRepository: Repository<PriceBuildupAuditTrail>,
    
    private eventEmitter: EventEmitter2,
    private entityManager: EntityManager,
  ) {}

  // ===== PRICE BUILDUP VERSION MANAGEMENT =====

  async createPriceBuildupVersion(
    createDto: CreatePriceBuildupVersionDto,
    createdBy: string
  ): Promise<PriceBuildupVersion> {
    return this.entityManager.transaction(async (manager) => {
      try {
        // Check for overlapping effective dates
        await this.validateEffectiveDateRange(
          createDto.productType,
          createDto.effectiveDate,
          createDto.expiryDate
        );

        // Get next version number
        const versionNumber = await this.getNextVersionNumber(createDto.productType);

        // Create price buildup version
        const buildupVersion = manager.create(PriceBuildupVersion, {
          ...createDto,
          versionNumber,
          createdBy,
          status: PriceComponentStatus.DRAFT,
        });

        const savedBuildupVersion = await manager.save(buildupVersion);

        // Create price components
        const components = createDto.components.map(componentDto => 
          manager.create(PriceComponent, {
            ...componentDto,
            buildupVersionId: savedBuildupVersion.id,
            createdBy,
          })
        );

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
      } catch (error) {
        this.logger.error(`Failed to create price buildup version: ${error.message}`);
        throw error;
      }
    });
  }

  async updatePriceBuildupVersion(
    id: string,
    updateDto: UpdatePriceBuildupVersionDto,
    updatedBy: string
  ): Promise<PriceBuildupVersion> {
    return this.entityManager.transaction(async (manager) => {
      const buildupVersion = await this.findBuildupVersionById(id);
      
      if (!buildupVersion.canBeModified()) {
        throw new BadRequestException('Cannot modify a published or archived price buildup version');
      }

      const oldValues = { ...buildupVersion };

      // Update buildup version
      await manager.update(PriceBuildupVersion, id, {
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
            await manager.update(PriceComponent, component.id, {
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

  async approvePriceBuildupVersion(
    id: string,
    approveDto: ApprovePriceBuildupDto
  ): Promise<PriceBuildupVersion> {
    return this.entityManager.transaction(async (manager) => {
      const buildupVersion = await this.findBuildupVersionById(id);
      
      if (buildupVersion.status !== PriceComponentStatus.PENDING_APPROVAL &&
          buildupVersion.status !== PriceComponentStatus.DRAFT) {
        throw new BadRequestException('Only draft or pending approval versions can be approved');
      }

      // Update approval status
      await manager.update(PriceBuildupVersion, id, {
        status: PriceComponentStatus.ACTIVE,
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

  async publishPriceBuildupVersion(
    id: string,
    publishDto: PublishPriceBuildupDto
  ): Promise<PriceBuildupVersion> {
    return this.entityManager.transaction(async (manager) => {
      const buildupVersion = await this.findBuildupVersionById(id);
      
      if (buildupVersion.status !== PriceComponentStatus.ACTIVE) {
        throw new BadRequestException('Only approved versions can be published');
      }

      if (buildupVersion.publishedDate) {
        throw new BadRequestException('Version is already published');
      }

      const publishDate = publishDto.publishDate || new Date();

      // Update publish status
      await manager.update(PriceBuildupVersion, id, {
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

  async calculatePrice(request: PriceCalculationRequestDto): Promise<PriceCalculationResponseDto> {
    const cacheKey = this.buildPriceCacheKey(request);
    
    // Check cache first
    const cached = this.cache.get<PriceCalculationResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const context: PriceCalculationContext = {
      productType: request.productType,
      stationType: request.stationType,
      calculationDate: request.calculationDate || new Date(),
      volume: request.volume,
      excludeComponents: request.excludeComponents,
    };

    // Get active price buildup version
    const buildupVersion = await this.getActivePriceBuildupVersion(
      context.productType,
      context.calculationDate
    );

    if (!buildupVersion) {
      throw new NotFoundException(`No active price buildup found for ${context.productType} on ${context.calculationDate}`);
    }

    // Calculate prices for the station type
    const breakdown = await this.calculatePriceBreakdown(buildupVersion, context);
    const totalPrice = breakdown.reduce((sum, item) => sum + item.amount, 0);

    const result: PriceCalculationResponseDto = {
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

  async getPriceHistory(
    productType: ProductType,
    stationType: StationType,
    fromDate: Date,
    toDate: Date
  ): Promise<PriceCalculationResponseDto[]> {
    const buildupVersions = await this.buildupRepository.find({
      where: {
        productType,
        status: PriceComponentStatus.ACTIVE,
        effectiveDate: Between(fromDate, toDate),
        isActive: true,
      },
      relations: ['components'],
      order: { effectiveDate: 'ASC' },
    });

    const priceHistory: PriceCalculationResponseDto[] = [];

    for (const buildupVersion of buildupVersions) {
      const context: PriceCalculationContext = {
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

  async bulkUpdatePrices(
    bulkUpdateDto: BulkPriceUpdateDto,
    updatedBy: string
  ): Promise<PriceBuildupVersion> {
    if (bulkUpdateDto.createNewVersion) {
      // Create new version with updated components
      const activeVersion = await this.getActivePriceBuildupVersion(
        bulkUpdateDto.productType,
        new Date()
      );

      if (!activeVersion) {
        throw new NotFoundException(`No active price buildup found for ${bulkUpdateDto.productType}`);
      }

      const existingComponents = activeVersion.components.map(component => {
        const update = bulkUpdateDto.componentUpdates.find(
          u => u.componentType === component.componentType && 
               u.stationType === component.stationType
        );

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

      const createDto: CreatePriceBuildupVersionDto = {
        productType: bulkUpdateDto.productType,
        effectiveDate: bulkUpdateDto.effectiveDate,
        changeReason: bulkUpdateDto.changeReason,
        approvalRequired: bulkUpdateDto.requireApproval,
        components: existingComponents,
      };

      return this.createPriceBuildupVersion(createDto, updatedBy);
    } else {
      // Update existing active version
      throw new BadRequestException('Direct bulk updates to existing versions not supported. Create new version instead.');
    }
  }

  async uploadFromExcel(
    file: Buffer,
    uploadDto: ExcelUploadDto
  ): Promise<{ success: boolean; message: string; errors?: string[]; buildupVersionId?: string }> {
    try {
      const workbook = XLSX.read(file, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const errors: string[] = [];
      const components: any[] = [];

      // Validate and parse Excel data
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        
        try {
          const component = this.parseExcelRow(row, i + 2); // +2 for header and 0-based index
          components.push(component);
        } catch (error) {
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
      const createDto: CreatePriceBuildupVersionDto = {
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
    } catch (error) {
      this.logger.error(`Excel upload failed: ${error.message}`);
      return { success: false, message: `Upload failed: ${error.message}` };
    }
  }

  // ===== QUERY METHODS =====

  async findPriceBuildupVersions(query: PriceBuildupQueryDto): Promise<{
    data: PriceBuildupVersion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<PriceBuildupVersion> = {
      isActive: true,
    };

    if (query.productType) where.productType = query.productType;
    if (query.status) where.status = query.status;
    if (query.createdBy) where.createdBy = query.createdBy;
    if (query.effectiveDate) where.effectiveDate = LessThanOrEqual(query.effectiveDate);
    if (query.fromDate && query.toDate) {
      where.effectiveDate = Between(query.fromDate, query.toDate);
    }

    const relations: string[] = [];
    if (query.includeComponents) relations.push('components');
    if (query.includeStationTypePricing) relations.push('stationTypePricing');

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

  async findBuildupVersionById(id: string): Promise<PriceBuildupVersion> {
    const buildupVersion = await this.buildupRepository.findOne({
      where: { id, isActive: true },
      relations: ['components', 'stationTypePricing'],
    });

    if (!buildupVersion) {
      throw new NotFoundException(`Price buildup version ${id} not found`);
    }

    return buildupVersion;
  }

  async getAuditTrail(query: AuditTrailQueryDto): Promise<{
    data: PriceBuildupAuditTrail[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<PriceBuildupAuditTrail> = {};

    if (query.buildupVersionId) where.buildupVersionId = query.buildupVersionId;
    if (query.componentId) where.componentId = query.componentId;
    if (query.actionType) where.actionType = query.actionType;
    if (query.actionBy) where.actionBy = query.actionBy;
    if (query.fromDate && query.toDate) {
      where.actionDate = Between(query.fromDate, query.toDate);
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

  private async validateEffectiveDateRange(
    productType: ProductType,
    effectiveDate: Date,
    expiryDate?: Date
  ): Promise<void> {
    const overlapping = await this.buildupRepository.findOne({
      where: [
        {
          productType,
          isActive: true,
          status: In([PriceComponentStatus.ACTIVE, PriceComponentStatus.PENDING_APPROVAL]),
          effectiveDate: LessThanOrEqual(effectiveDate),
          expiryDate: MoreThanOrEqual(effectiveDate),
        },
        ...(expiryDate ? [{
          productType,
          isActive: true,
          status: In([PriceComponentStatus.ACTIVE, PriceComponentStatus.PENDING_APPROVAL]),
          effectiveDate: LessThanOrEqual(expiryDate),
          expiryDate: MoreThanOrEqual(expiryDate),
        }] : []),
      ],
    });

    if (overlapping) {
      throw new ConflictException('Effective date range overlaps with existing price buildup version');
    }
  }

  private async getNextVersionNumber(productType: ProductType): Promise<number> {
    const latest = await this.buildupRepository.findOne({
      where: { productType },
      order: { versionNumber: 'DESC' },
    });

    return (latest?.versionNumber || 0) + 1;
  }

  private async generateStationTypePricing(
    manager: EntityManager,
    buildupVersionId: string,
    createdBy: string
  ): Promise<void> {
    // Remove existing station type pricing
    await manager.delete(StationTypePricing, { buildupVersionId });

    // Get all components for this buildup version
    const components = await manager.find(PriceComponent, {
      where: { buildupVersionId },
    });

    // Generate pricing for each station type
    const stationTypes = Object.values(StationType);
    const productTypes = Object.values(ProductType);

    for (const stationType of stationTypes) {
      for (const productType of productTypes) {
        const applicableComponents = components.filter(c => 
          !c.stationType || c.stationType === stationType
        );

        const basePrice = this.calculateBasePrice(applicableComponents);
        const totalTaxesLevies = this.calculateTotalByCategory(applicableComponents, PriceComponentCategory.TAX_LEVY);
        const totalMargins = this.calculateTotalByCategory(applicableComponents, PriceComponentCategory.MARGIN);
        const totalCosts = this.calculateTotalByCategory(applicableComponents, PriceComponentCategory.COST);

        const stationPricing = manager.create(StationTypePricing, {
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

  private async getActivePriceBuildupVersion(
    productType: ProductType,
    effectiveDate: Date
  ): Promise<PriceBuildupVersion | null> {
    return this.buildupRepository.findOne({
      where: {
        productType,
        status: PriceComponentStatus.ACTIVE,
        isActive: true,
        effectiveDate: LessThanOrEqual(effectiveDate),
        expiryDate: MoreThanOrEqual(effectiveDate),
      },
      relations: ['components'],
      order: { effectiveDate: 'DESC' },
    });
  }

  private async calculatePriceBreakdown(
    buildupVersion: PriceBuildupVersion,
    context: PriceCalculationContext
  ): Promise<PriceBreakdownDto[]> {
    const applicableComponents = buildupVersion.components
      .filter(c => !c.stationType || c.stationType === context.stationType)
      .filter(c => !context.excludeComponents?.includes(c.componentType))
      .filter(c => c.isEffective(context.calculationDate))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const breakdown: PriceBreakdownDto[] = [];
    let runningTotal = 0;

    for (const component of applicableComponents) {
      let amount = component.amount;
      let calculationBase: number | undefined;

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

  private calculateBasePrice(components: PriceComponent[]): number {
    return components
      .filter(c => c.category === PriceComponentCategory.BASE_PRICE)
      .reduce((sum, c) => sum + c.amount, 0);
  }

  private calculateTotalByCategory(components: PriceComponent[], category: PriceComponentCategory): number {
    return components
      .filter(c => c.category === category)
      .reduce((sum, c) => sum + c.amount, 0);
  }

  private async deactivatePreviousVersions(
    manager: EntityManager,
    productType: ProductType,
    excludeId: string
  ): Promise<void> {
    await manager.update(
      PriceBuildupVersion,
      {
        productType,
        status: PriceComponentStatus.ACTIVE,
        id: not(excludeId),
      },
      { status: PriceComponentStatus.ARCHIVED }
    );
  }

  private async createAuditTrail(
    manager: EntityManager,
    auditData: Partial<PriceBuildupAuditTrail>
  ): Promise<void> {
    const audit = manager.create(PriceBuildupAuditTrail, {
      ...auditData,
      actionDate: new Date(),
    });

    await manager.save(audit);
  }

  private parseExcelRow(row: any, rowNumber: number): any {
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

  private buildPriceCacheKey(request: PriceCalculationRequestDto): string {
    return `price:${request.productType}:${request.stationType}:${request.calculationDate?.toISOString() || 'now'}:${request.excludeComponents?.join(',') || 'none'}`;
  }

  private clearPriceCache(productType: ProductType): void {
    const keys = this.cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(`price:${productType}:`));
    keysToDelete.forEach(key => this.cache.del(key));
  }
}

// Helper function for TypeORM not() operator
function not<T>(value: T): any {
  return { $ne: value };
}