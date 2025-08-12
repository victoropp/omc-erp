import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PBUComponent } from '../pbu-components/entities/pbu-component.entity';
import { PBUComponentCategory, PBUComponentUnit } from '@omc-erp/shared-types';

export interface PriceCalculationInput {
  tenantId: string;
  productId: string; // PMS, AGO, LPG
  windowId: string;
  effectiveDate: Date;
  exRefineryPrice: number;
  overrides?: Array<{
    componentCode: string;
    value: number;
    reason?: string;
  }>;
}

export interface PriceCalculationResult {
  exPumpPrice: number;
  components: Array<{
    code: string;
    name: string;
    category: PBUComponentCategory;
    value: number;
    unit: PBUComponentUnit;
    isOverridden?: boolean;
    overrideReason?: string;
  }>;
  sourceDocuments: string[];
  calculationTimestamp: Date;
}

@Injectable()
export class PriceCalculatorService {
  private readonly logger = new Logger(PriceCalculatorService.name);

  constructor(
    @InjectRepository(PBUComponent)
    private readonly pbuComponentRepository: Repository<PBUComponent>,
  ) {}

  /**
   * Calculate ex-pump price using the NPA PBU formula:
   * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
   */
  async calculatePrice(input: PriceCalculationInput): Promise<PriceCalculationResult> {
    this.logger.debug(`Calculating price for ${input.productId} in window ${input.windowId}`);

    // Get all active PBU components for the effective date
    const components = await this.getActiveComponents(
      input.tenantId, 
      input.effectiveDate, 
      input.productId
    );

    if (components.length === 0) {
      throw new BadRequestException(`No PBU components found for ${input.productId} on ${input.effectiveDate}`);
    }

    const result: PriceCalculationResult = {
      exPumpPrice: input.exRefineryPrice, // Start with ex-refinery price
      components: [
        {
          code: 'EXREF',
          name: 'Ex-Refinery Price',
          category: PBUComponentCategory.OTHER,
          value: input.exRefineryPrice,
          unit: PBUComponentUnit.GHS_PER_LITRE,
        }
      ],
      sourceDocuments: [],
      calculationTimestamp: new Date(),
    };

    // Process each component category in order
    const componentsByCategory = this.groupComponentsByCategory(components);
    
    // 1. Add Taxes and Levies (EDRL, ROAD, PSRL, etc.)
    this.addComponentsToPrice(result, componentsByCategory[PBUComponentCategory.LEVY] || [], input.overrides);
    
    // 2. Add Regulatory Margins (BOST, UPPF, Fuel Marking, Primary Distribution)
    this.addComponentsToPrice(result, componentsByCategory[PBUComponentCategory.REGULATORY_MARGIN] || [], input.overrides);
    
    // 3. Add Distribution Margins
    this.addComponentsToPrice(result, componentsByCategory[PBUComponentCategory.DISTRIBUTION_MARGIN] || [], input.overrides);
    
    // 4. Add OMC Margin
    this.addComponentsToPrice(result, componentsByCategory[PBUComponentCategory.OMC_MARGIN] || [], input.overrides);
    
    // 5. Add Dealer Margin
    this.addComponentsToPrice(result, componentsByCategory[PBUComponentCategory.DEALER_MARGIN] || [], input.overrides);

    // Collect source documents
    result.sourceDocuments = [...new Set(
      components
        .filter(c => c.sourceDocId)
        .map(c => c.sourceDocId!)
    )];

    this.logger.debug(`Calculated ex-pump price: GHS ${result.exPumpPrice.toFixed(4)} for ${input.productId}`);
    
    return result;
  }

  /**
   * Validate price calculation by checking against business rules
   */
  async validateCalculation(result: PriceCalculationResult): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check minimum price thresholds
    if (result.exPumpPrice < 0.50) {
      errors.push('Ex-pump price below minimum threshold of GHS 0.50');
    }

    if (result.exPumpPrice > 50.00) {
      warnings.push('Ex-pump price above GHS 50.00 - please verify');
    }

    // Check component reasonableness
    const exRefinery = result.components.find(c => c.code === 'EXREF')?.value || 0;
    const totalTaxes = result.components
      .filter(c => c.category === PBUComponentCategory.LEVY)
      .reduce((sum, c) => sum + c.value, 0);

    if (totalTaxes > exRefinery) {
      warnings.push('Total taxes exceed ex-refinery price - unusual but not invalid');
    }

    // Check for missing critical components
    const criticalComponents = ['EDRL', 'ROAD', 'BOST', 'UPPF'];
    const presentComponents = result.components.map(c => c.code);
    const missingCritical = criticalComponents.filter(code => !presentComponents.includes(code));
    
    if (missingCritical.length > 0) {
      warnings.push(`Missing critical components: ${missingCritical.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Get PBU components snapshot for a specific window (for audit)
   */
  async getComponentsSnapshot(tenantId: string, windowId: string, effectiveDate: Date): Promise<PBUComponent[]> {
    return this.pbuComponentRepository
      .createQueryBuilder('pbu')
      .where('pbu.tenantId = :tenantId', { tenantId })
      .andWhere('pbu.isActive = true')
      .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
      .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate })
      .orderBy('pbu.category', 'ASC')
      .addOrderBy('pbu.componentCode', 'ASC')
      .getMany();
  }

  private async getActiveComponents(
    tenantId: string, 
    effectiveDate: Date, 
    productId?: string
  ): Promise<PBUComponent[]> {
    const query = this.pbuComponentRepository
      .createQueryBuilder('pbu')
      .where('pbu.tenantId = :tenantId', { tenantId })
      .andWhere('pbu.isActive = true')
      .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
      .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate });

    // TODO: Add product-specific component filtering if needed
    // Some components might be product-specific (e.g., LPG might have different rates)

    return query
      .orderBy('pbu.category', 'ASC')
      .addOrderBy('pbu.componentCode', 'ASC')
      .getMany();
  }

  private groupComponentsByCategory(components: PBUComponent[]): Record<PBUComponentCategory, PBUComponent[]> {
    return components.reduce((groups, component) => {
      if (!groups[component.category]) {
        groups[component.category] = [];
      }
      groups[component.category].push(component);
      return groups;
    }, {} as Record<PBUComponentCategory, PBUComponent[]>);
  }

  private addComponentsToPrice(
    result: PriceCalculationResult,
    components: PBUComponent[],
    overrides?: Array<{ componentCode: string; value: number; reason?: string }>
  ): void {
    components.forEach(component => {
      const override = overrides?.find(o => o.componentCode === component.componentCode);
      const value = override ? override.value : component.rateValue;

      // Handle percentage-based components
      const actualValue = component.unit === PBUComponentUnit.PERCENTAGE
        ? (result.exPumpPrice * value) / 100
        : value;

      result.exPumpPrice += actualValue;
      result.components.push({
        code: component.componentCode,
        name: component.name,
        category: component.category,
        value: actualValue,
        unit: component.unit,
        isOverridden: !!override,
        overrideReason: override?.reason,
      });
    });
  }

  /**
   * Calculate dealer margin for a specific window and product
   */
  async getDealerMarginRate(tenantId: string, productId: string, windowId: string): Promise<number> {
    const effectiveDate = new Date(); // This should come from the pricing window
    
    const dealerMarginComponent = await this.pbuComponentRepository
      .createQueryBuilder('pbu')
      .where('pbu.tenantId = :tenantId', { tenantId })
      .andWhere('pbu.category = :category', { category: PBUComponentCategory.DEALER_MARGIN })
      .andWhere('pbu.isActive = true')
      .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
      .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate })
      .getOne();

    return dealerMarginComponent?.rateValue || 0;
  }
}