import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';

@Injectable()
export class PriceCalculationService {
  private readonly logger = new Logger(PriceCalculationService.name);

  constructor(
    @InjectRepository('PbuComponents')
    private pbuComponentsRepository: Repository<any>,
    @InjectRepository('StationPrices')
    private stationPricesRepository: Repository<any>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate ex-pump price for a product at a station
   * Implements the deterministic formula from blueprint:
   * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
   */
  async calculateExPumpPrice(
    stationId: string,
    productId: string,
    windowId: string,
  ): Promise<{
    exPumpPrice: number;
    breakdown: any;
  }> {
    this.logger.log(`Calculating ex-pump price for station ${stationId}, product ${productId}`);

    // Get all active components for the pricing window
    const components = await this.pbuComponentsRepository.find({
      where: {
        isActive: true,
        effectiveFrom: { $lte: new Date() },
        effectiveTo: { $gte: new Date() },
      },
    });

    // Get ex-refinery price (base price)
    const exRefinery = components.find(c => c.componentCode === 'EXREF');
    if (!exRefinery) {
      throw new Error('Ex-refinery price not found');
    }

    const breakdown = {
      exRefinery: exRefinery.rateValue,
      components: [],
      taxesLevies: new Decimal(0),
      regulatoryMargins: new Decimal(0),
      omcMargin: new Decimal(0),
      dealerMargin: new Decimal(0),
      total: new Decimal(0),
    };

    // Calculate each component
    for (const component of components) {
      let componentValue = new Decimal(0);

      if (component.unit === 'GHS_per_litre') {
        componentValue = new Decimal(component.rateValue);
      } else if (component.unit === 'percentage') {
        componentValue = new Decimal(exRefinery.rateValue)
          .mul(component.rateValue)
          .div(100);
      }

      // Categorize components
      switch (component.category) {
        case 'levy':
          breakdown.taxesLevies = breakdown.taxesLevies.add(componentValue);
          break;
        case 'regulatory_margin':
          breakdown.regulatoryMargins = breakdown.regulatoryMargins.add(componentValue);
          break;
        case 'omc_margin':
          breakdown.omcMargin = componentValue;
          break;
        case 'dealer_margin':
          breakdown.dealerMargin = componentValue;
          break;
      }

      breakdown.components.push({
        code: component.componentCode,
        name: component.name,
        category: component.category,
        value: componentValue.toNumber(),
        unit: component.unit,
      });
    }

    // Calculate total ex-pump price
    breakdown.total = new Decimal(breakdown.exRefinery)
      .add(breakdown.taxesLevies)
      .add(breakdown.regulatoryMargins)
      .add(breakdown.omcMargin)
      .add(breakdown.dealerMargin);

    // Save station price
    await this.stationPricesRepository.save({
      stationId,
      productId,
      windowId,
      exPumpPrice: breakdown.total.toNumber(),
      exRefineryPrice: breakdown.exRefinery,
      totalTaxesLevies: breakdown.taxesLevies.toNumber(),
      totalRegulatoryMargins: breakdown.regulatoryMargins.toNumber(),
      omcMargin: breakdown.omcMargin.toNumber(),
      dealerMargin: breakdown.dealerMargin.toNumber(),
      calcBreakdownJson: breakdown,
      publishedDate: new Date(),
    });

    // Emit price update event
    this.eventEmitter.emit('price.calculated', {
      stationId,
      productId,
      windowId,
      exPumpPrice: breakdown.total.toNumber(),
      breakdown,
    });

    return {
      exPumpPrice: breakdown.total.toNumber(),
      breakdown,
    };
  }

  /**
   * Bulk calculate prices for all stations and products
   */
  async bulkCalculatePrices(windowId: string): Promise<void> {
    this.logger.log(`Starting bulk price calculation for window ${windowId}`);

    const stations = await this.getActiveStations();
    const products = await this.getFuelProducts();

    let successCount = 0;
    let errorCount = 0;

    for (const station of stations) {
      for (const product of products) {
        try {
          await this.calculateExPumpPrice(station.id, product.code, windowId);
          successCount++;
        } catch (error) {
          this.logger.error(`Failed to calculate price for station ${station.id}, product ${product.code}: ${error.message}`);
          errorCount++;
        }
      }
    }

    this.logger.log(`Bulk calculation completed. Success: ${successCount}, Errors: ${errorCount}`);

    // Emit completion event
    this.eventEmitter.emit('price.bulk.calculation.completed', {
      windowId,
      successCount,
      errorCount,
      timestamp: new Date(),
    });
  }

  /**
   * Handle component rate updates
   */
  async updateComponentRate(
    componentCode: string,
    newRate: number,
    effectiveFrom: Date,
  ): Promise<void> {
    this.logger.log(`Updating component ${componentCode} rate to ${newRate}`);

    // End current component validity
    await this.pbuComponentsRepository.update(
      {
        componentCode,
        isActive: true,
      },
      {
        effectiveTo: effectiveFrom,
        isActive: false,
      },
    );

    // Create new component with updated rate
    await this.pbuComponentsRepository.save({
      componentCode,
      rateValue: newRate,
      effectiveFrom,
      isActive: true,
    });

    // Trigger recalculation for affected windows
    this.eventEmitter.emit('component.rate.updated', {
      componentCode,
      newRate,
      effectiveFrom,
    });
  }

  /**
   * Validate price calculations against NPA requirements
   */
  async validatePriceCalculation(
    stationId: string,
    productId: string,
    windowId: string,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const price = await this.stationPricesRepository.findOne({
        where: { stationId, productId, windowId },
      });

      if (!price) {
        errors.push('Price not found');
        return { isValid: false, errors };
      }

      // Validate each component is present
      const requiredComponents = [
        'EXREF', 'ESRL', 'PSRL', 'ROAD', 'EDRL',
        'BOST', 'UPPF', 'MARK', 'PRIM', 'OMC', 'DEAL',
      ];

      const breakdown = price.calcBreakdownJson;
      for (const code of requiredComponents) {
        const component = breakdown.components.find((c: any) => c.code === code);
        if (!component) {
          errors.push(`Missing required component: ${code}`);
        }
      }

      // Validate total calculation
      const recalculatedTotal = new Decimal(breakdown.exRefinery)
        .add(breakdown.taxesLevies)
        .add(breakdown.regulatoryMargins)
        .add(breakdown.omcMargin)
        .add(breakdown.dealerMargin);

      if (!recalculatedTotal.eq(price.exPumpPrice)) {
        errors.push('Total price mismatch in calculation');
      }

      // Validate against NPA minimum/maximum thresholds
      if (price.exPumpPrice < 10 || price.exPumpPrice > 30) {
        errors.push('Price outside acceptable range (10-30 GHS/L)');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Generate NPA price submission
   */
  async generateNPASubmission(windowId: string): Promise<any> {
    this.logger.log(`Generating NPA submission for window ${windowId}`);

    const prices = await this.stationPricesRepository.find({
      where: { windowId },
    });

    const submission = {
      windowId,
      submissionDate: new Date(),
      omcDetails: {
        name: 'Ghana OMC Ltd',
        license: 'NPA/OMC/2025/001',
      },
      priceDetails: prices.map(price => ({
        stationId: price.stationId,
        productId: price.productId,
        exPumpPrice: price.exPumpPrice,
        breakdown: price.calcBreakdownJson,
      })),
      summary: {
        totalStations: new Set(prices.map(p => p.stationId)).size,
        averagePrices: this.calculateAveragePrices(prices),
        componentsUsed: this.extractComponentsUsed(prices),
      },
    };

    return submission;
  }

  // Helper methods
  private async getActiveStations(): Promise<any[]> {
    // Implement station retrieval logic
    return [];
  }

  private async getFuelProducts(): Promise<any[]> {
    // Return fuel products
    return [
      { code: 'PMS', name: 'Premium Motor Spirit' },
      { code: 'AGO', name: 'Automotive Gas Oil' },
      { code: 'LPG', name: 'Liquefied Petroleum Gas' },
    ];
  }

  private calculateAveragePrices(prices: any[]): any {
    // Calculate average prices by product
    const byProduct = {};
    for (const price of prices) {
      if (!byProduct[price.productId]) {
        byProduct[price.productId] = [];
      }
      byProduct[price.productId].push(price.exPumpPrice);
    }

    const averages = {};
    for (const [productId, productPrices] of Object.entries(byProduct)) {
      const sum = (productPrices as number[]).reduce((a, b) => a + b, 0);
      averages[productId] = sum / (productPrices as number[]).length;
    }

    return averages;
  }

  private extractComponentsUsed(prices: any[]): any[] {
    if (prices.length === 0) return [];
    
    // Extract unique components from first price (all should be same)
    return prices[0].calcBreakdownJson.components.map((c: any) => ({
      code: c.code,
      name: c.name,
      value: c.value,
    }));
  }
}