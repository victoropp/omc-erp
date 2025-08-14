import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JournalEntryTemplate, AccountMappingRule } from '../entities/journal-entry-template.entity';
import { TransactionEvent } from './automated-posting.service';

export interface JournalLineData {
  account_code: string;
  description: string;
  debit_amount?: number;
  credit_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  project_code?: string;
  cost_center_code?: string;
  dimension_data?: Record<string, any>;
}

export interface GeneratedJournalData {
  lines: JournalLineData[];
  totalDebit: number;
  totalCredit: number;
  totalAmount: number;
  currency: string;
  validation_errors: string[];
  warnings: string[];
}

@Injectable()
export class TransactionTemplateService {
  private readonly logger = new Logger(TransactionTemplateService.name);

  constructor(
    @InjectRepository(JournalEntryTemplate)
    private templateRepository: Repository<JournalEntryTemplate>,
  ) {}

  /**
   * Generate journal entries from template and transaction data
   */
  async generateJournalEntries(
    template: JournalEntryTemplate,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): Promise<GeneratedJournalData> {
    const result: GeneratedJournalData = {
      lines: [],
      totalDebit: 0,
      totalCredit: 0,
      totalAmount: 0,
      currency: 'GHS',
      validation_errors: [],
      warnings: [],
    };

    try {
      // Validate template
      if (!this.validateTemplate(template)) {
        result.validation_errors.push('Invalid template configuration');
        return result;
      }

      // Process debit entries
      if (template.account_mapping_rules.debit) {
        for (const debitRule of template.account_mapping_rules.debit) {
          const line = await this.processAccountRule(
            debitRule,
            transactionData,
            event,
            'DEBIT',
            template
          );
          if (line) {
            result.lines.push(line);
            result.totalDebit += line.debit_amount || 0;
          }
        }
      }

      // Process credit entries
      if (template.account_mapping_rules.credit) {
        for (const creditRule of template.account_mapping_rules.credit) {
          const line = await this.processAccountRule(
            creditRule,
            transactionData,
            event,
            'CREDIT',
            template
          );
          if (line) {
            result.lines.push(line);
            result.totalCredit += line.credit_amount || 0;
          }
        }
      }

      // Process IFRS adjustments if configured
      if (template.account_mapping_rules.ifrs_adjustments) {
        const ifrsLines = await this.processIFRSAdjustments(
          template.account_mapping_rules.ifrs_adjustments,
          transactionData,
          event,
          template
        );
        result.lines.push(...ifrsLines);
        
        // Update totals
        ifrsLines.forEach(line => {
          result.totalDebit += line.debit_amount || 0;
          result.totalCredit += line.credit_amount || 0;
        });
      }

      // Validate balanced entries
      if (Math.abs(result.totalDebit - result.totalCredit) > 0.01) {
        result.validation_errors.push(
          `Journal entries not balanced: Debit ${result.totalDebit}, Credit ${result.totalCredit}`
        );
      }

      result.totalAmount = Math.max(result.totalDebit, result.totalCredit);

      // Apply validation rules if defined
      if (template.validation_rules) {
        const validationErrors = await this.applyValidationRules(
          template.validation_rules,
          transactionData,
          result
        );
        result.validation_errors.push(...validationErrors);
      }

      this.logger.log(
        `Generated ${result.lines.length} journal lines for template ${template.template_code}`
      );

      return result;

    } catch (error) {
      this.logger.error(`Error generating journal entries: ${error.message}`, error.stack);
      result.validation_errors.push(`Generation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Process individual account mapping rule
   */
  private async processAccountRule(
    rule: any,
    transactionData: Record<string, any>,
    event: TransactionEvent,
    type: 'DEBIT' | 'CREDIT',
    template: JournalEntryTemplate
  ): Promise<JournalLineData | null> {
    try {
      // Check conditions if present
      if (rule.conditions && !this.evaluateConditions(rule.conditions, transactionData)) {
        return null;
      }

      // Calculate amount
      const amount = await this.calculateAmount(rule.amount, transactionData, event);
      if (amount <= 0) {
        this.logger.warn(`Zero or negative amount calculated for rule: ${JSON.stringify(rule)}`);
        return null;
      }

      // Determine account code
      const accountCode = await this.resolveAccountCode(rule.account, transactionData, event);
      if (!accountCode) {
        throw new Error(`Could not resolve account code: ${rule.account}`);
      }

      // Build dimension data
      const dimensionData = await this.buildDimensionData(rule.dimension, transactionData, event);

      const line: JournalLineData = {
        account_code: accountCode,
        description: await this.buildDescription(rule, transactionData, event, template),
        currency_code: transactionData.currency_code || 'GHS',
        exchange_rate: transactionData.exchange_rate || 1,
        dimension_data: dimensionData,
      };

      // Set amount based on type
      if (type === 'DEBIT') {
        line.debit_amount = amount;
      } else {
        line.credit_amount = amount;
      }

      // Add dimension fields
      if (dimensionData) {
        line.project_code = dimensionData.project_code;
        line.cost_center_code = dimensionData.cost_center_code;
      }

      return line;

    } catch (error) {
      this.logger.error(`Error processing account rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process IFRS adjustments
   */
  private async processIFRSAdjustments(
    ifrsRules: any[],
    transactionData: Record<string, any>,
    event: TransactionEvent,
    template: JournalEntryTemplate
  ): Promise<JournalLineData[]> {
    const lines: JournalLineData[] = [];

    for (const rule of ifrsRules) {
      // Check conditions
      if (rule.conditions && !this.evaluateConditions(rule.conditions, transactionData)) {
        continue;
      }

      const amount = await this.calculateAmount(rule.amount, transactionData, event);
      if (amount <= 0) continue;

      const accountCode = await this.resolveAccountCode(rule.account, transactionData, event);
      if (!accountCode) continue;

      const line: JournalLineData = {
        account_code: accountCode,
        description: `IFRS ${rule.standard} Adjustment - ${rule.schedule_type || 'Standard'}`,
        debit_amount: rule.entry_type === 'DEBIT' ? amount : 0,
        credit_amount: rule.entry_type === 'CREDIT' ? amount : 0,
        currency_code: transactionData.currency_code || 'GHS',
        exchange_rate: transactionData.exchange_rate || 1,
      };

      lines.push(line);
    }

    return lines;
  }

  /**
   * Calculate amount from formula or field reference
   */
  private async calculateAmount(
    amountExpression: string,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): Promise<number> {
    try {
      // If it's a direct field reference
      if (transactionData.hasOwnProperty(amountExpression)) {
        return parseFloat(transactionData[amountExpression]) || 0;
      }

      // Handle complex expressions
      if (amountExpression.includes('+') || amountExpression.includes('-') || 
          amountExpression.includes('*') || amountExpression.includes('/')) {
        return this.evaluateExpression(amountExpression, transactionData);
      }

      // Handle special cases
      switch (amountExpression) {
        case 'total':
          return transactionData.total_amount || transactionData.net_amount || 0;
        case 'base_price':
          return (transactionData.total_amount || 0) - (transactionData.tax_amount || 0);
        case 'uppf_component':
          return this.calculateUPPFComponent(transactionData);
        case 'vat_component':
          return this.calculateTaxComponent(transactionData, 'VAT');
        case 'nhil_component':
          return this.calculateTaxComponent(transactionData, 'NHIL');
        case 'getfund_component':
          return this.calculateTaxComponent(transactionData, 'GETFUND');
        case 'fuel_cost':
          return this.calculateFuelCost(transactionData);
        default:
          return parseFloat(amountExpression) || 0;
      }
    } catch (error) {
      this.logger.error(`Error calculating amount for expression: ${amountExpression}`, error);
      return 0;
    }
  }

  /**
   * Evaluate mathematical expression
   */
  private evaluateExpression(expression: string, data: Record<string, any>): number {
    try {
      // Replace field references with actual values
      let processedExpression = expression;
      
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedExpression = processedExpression.replace(regex, data[key] || '0');
      });

      // Simple evaluation (in production, use a safe expression evaluator)
      // This is a simplified version - use libraries like 'expr-eval' for production
      return Function('"use strict"; return (' + processedExpression + ')')();
    } catch (error) {
      this.logger.error(`Error evaluating expression: ${expression}`, error);
      return 0;
    }
  }

  /**
   * Calculate UPPF component from price buildup
   */
  private calculateUPPFComponent(transactionData: Record<string, any>): number {
    const quantity = transactionData.quantity_liters || 0;
    const uppfRate = transactionData.uppf_rate || 0.10; // Default UPPF rate
    return quantity * uppfRate;
  }

  /**
   * Calculate tax component
   */
  private calculateTaxComponent(transactionData: Record<string, any>, taxType: string): number {
    const taxes = transactionData.tax_breakdown || {};
    return taxes[taxType] || 0;
  }

  /**
   * Calculate fuel cost
   */
  private calculateFuelCost(transactionData: Record<string, any>): number {
    const quantity = transactionData.quantity_liters || 0;
    const unitCost = transactionData.unit_cost || 0;
    return quantity * unitCost;
  }

  /**
   * Resolve account code from configuration or dynamic lookup
   */
  private async resolveAccountCode(
    accountExpression: string,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): Promise<string> {
    // If it's a direct account code
    if (/^\d{4,}$/.test(accountExpression)) {
      return accountExpression;
    }

    // Dynamic account resolution based on transaction data
    switch (accountExpression) {
      case 'customer_receivable':
        return transactionData.customer_receivable_account || '1210';
      case 'station_cash':
        return `1110-${event.stationId}` || '1110';
      case 'product_revenue':
        return this.getProductRevenueAccount(transactionData.product_type);
      case 'product_cost':
        return this.getProductCostAccount(transactionData.product_type);
      default:
        return accountExpression;
    }
  }

  /**
   * Get product-specific revenue account
   */
  private getProductRevenueAccount(productType: string): string {
    const accountMap: Record<string, string> = {
      'PETROL': '4110',
      'DIESEL': '4120',
      'KEROSENE': '4130',
      'LPG': '4140',
    };
    return accountMap[productType] || '4100';
  }

  /**
   * Get product-specific cost account
   */
  private getProductCostAccount(productType: string): string {
    const accountMap: Record<string, string> = {
      'PETROL': '5110',
      'DIESEL': '5120',
      'KEROSENE': '5130',
      'LPG': '5140',
    };
    return accountMap[productType] || '5100';
  }

  /**
   * Build dimension data for cost centers, projects, etc.
   */
  private async buildDimensionData(
    dimension: string | undefined,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): Promise<Record<string, any> | null> {
    if (!dimension) return null;

    const dimensionData: Record<string, any> = {};

    // Add station as cost center
    if (event.stationId) {
      dimensionData.cost_center_code = event.stationId;
    }

    // Add project code if available
    if (transactionData.project_code) {
      dimensionData.project_code = transactionData.project_code;
    }

    return Object.keys(dimensionData).length > 0 ? dimensionData : null;
  }

  /**
   * Build journal line description
   */
  private async buildDescription(
    rule: any,
    transactionData: Record<string, any>,
    event: TransactionEvent,
    template: JournalEntryTemplate
  ): Promise<string> {
    const baseDescription = rule.description || template.description || template.name;
    
    // Replace placeholders
    let description = baseDescription;
    description = description.replace('{transaction_number}', transactionData.transaction_number || '');
    description = description.replace('{customer_code}', transactionData.customer_code || '');
    description = description.replace('{product_type}', transactionData.product_type || '');
    description = description.replace('{station_id}', event.stationId || '');

    return description;
  }

  /**
   * Evaluate conditions for conditional processing
   */
  private evaluateConditions(
    conditions: Record<string, any>,
    transactionData: Record<string, any>
  ): boolean {
    for (const [field, condition] of Object.entries(conditions)) {
      const fieldValue = transactionData[field];
      
      if (typeof condition === 'object' && condition.operator && condition.value !== undefined) {
        if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
          return false;
        }
      } else if (fieldValue !== condition) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate individual condition
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case '=':
      case '==':
        return fieldValue == expectedValue;
      case '!=':
        return fieldValue != expectedValue;
      case '>':
        return parseFloat(fieldValue) > parseFloat(expectedValue);
      case '<':
        return parseFloat(fieldValue) < parseFloat(expectedValue);
      case '>=':
        return parseFloat(fieldValue) >= parseFloat(expectedValue);
      case '<=':
        return parseFloat(fieldValue) <= parseFloat(expectedValue);
      case 'IN':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'NOT IN':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      case 'LIKE':
        return fieldValue && fieldValue.toString().includes(expectedValue);
      default:
        return false;
    }
  }

  /**
   * Apply validation rules to generated journal data
   */
  private async applyValidationRules(
    validationRules: any[],
    transactionData: Record<string, any>,
    journalData: GeneratedJournalData
  ): Promise<string[]> {
    const errors: string[] = [];

    for (const rule of validationRules) {
      const fieldValue = this.getFieldValue(rule.field, transactionData, journalData);
      
      if (!this.evaluateCondition(fieldValue, rule.operator, rule.value)) {
        errors.push(rule.message || `Validation failed for field ${rule.field}`);
      }
    }

    return errors;
  }

  /**
   * Get field value for validation
   */
  private getFieldValue(
    field: string,
    transactionData: Record<string, any>,
    journalData: GeneratedJournalData
  ): any {
    switch (field) {
      case 'total_amount':
        return journalData.totalAmount;
      case 'line_count':
        return journalData.lines.length;
      case 'debit_total':
        return journalData.totalDebit;
      case 'credit_total':
        return journalData.totalCredit;
      default:
        return transactionData[field];
    }
  }

  /**
   * Validate template configuration
   */
  private validateTemplate(template: JournalEntryTemplate): boolean {
    if (!template.account_mapping_rules) {
      this.logger.error(`Template ${template.template_code} has no account mapping rules`);
      return false;
    }

    if (!template.account_mapping_rules.debit && !template.account_mapping_rules.credit) {
      this.logger.error(`Template ${template.template_code} has no debit or credit rules`);
      return false;
    }

    return true;
  }

  /**
   * Get all active templates
   */
  async getActiveTemplates(): Promise<JournalEntryTemplate[]> {
    return await this.templateRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get template by code
   */
  async getTemplateByCode(templateCode: string): Promise<JournalEntryTemplate | null> {
    return await this.templateRepository.findOne({
      where: { template_code: templateCode, is_active: true },
    });
  }

  /**
   * Create or update template
   */
  async saveTemplate(templateData: Partial<JournalEntryTemplate>): Promise<JournalEntryTemplate> {
    const template = this.templateRepository.create(templateData);
    return await this.templateRepository.save(template);
  }
}