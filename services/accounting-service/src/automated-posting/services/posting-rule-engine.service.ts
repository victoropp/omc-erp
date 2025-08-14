import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { AutomatedPostingRule, RuleCondition } from '../entities/automated-posting-rule.entity';
import { TransactionEvent } from './automated-posting.service';

export interface RuleEvaluationResult {
  rule: AutomatedPostingRule;
  matches: boolean;
  evaluationDetails: {
    conditionsChecked: number;
    conditionsPassed: number;
    failedConditions: Array<{
      condition: RuleCondition;
      actualValue: any;
      reason: string;
    }>;
  };
}

export interface RuleMatchCriteria {
  transactionType?: string;
  sourceSystem?: string;
  eventType?: string;
  stationId?: string;
  customerId?: string;
  productType?: string;
  amountRange?: {
    min?: number;
    max?: number;
  };
}

@Injectable()
export class PostingRuleEngine {
  private readonly logger = new Logger(PostingRuleEngine.name);

  constructor(
    @InjectRepository(AutomatedPostingRule)
    private ruleRepository: Repository<AutomatedPostingRule>,
  ) {}

  /**
   * Find all applicable posting rules for a transaction event
   */
  async findApplicableRules(event: TransactionEvent): Promise<AutomatedPostingRule[]> {
    try {
      // Get all active rules that could potentially match
      const candidateRules = await this.getCandidateRules(event);
      
      if (candidateRules.length === 0) {
        this.logger.warn(`No candidate rules found for event type: ${event.eventType}`);
        return [];
      }

      // Evaluate each rule against the transaction data
      const applicableRules: AutomatedPostingRule[] = [];
      
      for (const rule of candidateRules) {
        const evaluationResult = await this.evaluateRule(rule, event);
        
        if (evaluationResult.matches) {
          applicableRules.push(rule);
          this.logger.debug(`Rule ${rule.rule_name} matches event ${event.sourceDocumentId}`);
        } else {
          this.logger.debug(
            `Rule ${rule.rule_name} does not match: ${evaluationResult.evaluationDetails.failedConditions.length} conditions failed`
          );
        }
      }

      this.logger.log(`Found ${applicableRules.length} applicable rules for event ${event.eventType}`);
      return applicableRules;

    } catch (error) {
      this.logger.error(`Error finding applicable rules: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Get candidate rules based on basic criteria
   */
  private async getCandidateRules(event: TransactionEvent): Promise<AutomatedPostingRule[]> {
    const queryBuilder = this.ruleRepository
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.template', 'template')
      .where('rule.is_active = :isActive', { isActive: true })
      .andWhere('template.is_active = :templateActive', { templateActive: true })
      .orderBy('rule.priority', 'ASC');

    // Filter by trigger event
    if (event.eventType) {
      queryBuilder.andWhere(
        '(rule.trigger_event = :triggerEvent OR rule.trigger_event = :transactionType)',
        { 
          triggerEvent: event.eventType,
          transactionType: event.transactionType,
        }
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Evaluate a single rule against transaction event
   */
  async evaluateRule(rule: AutomatedPostingRule, event: TransactionEvent): Promise<RuleEvaluationResult> {
    const result: RuleEvaluationResult = {
      rule,
      matches: true,
      evaluationDetails: {
        conditionsChecked: 0,
        conditionsPassed: 0,
        failedConditions: [],
      },
    };

    try {
      // If no conditions, rule matches by default
      if (!rule.conditions || rule.conditions.length === 0) {
        return result;
      }

      // Evaluate each condition
      for (const condition of rule.conditions) {
        result.evaluationDetails.conditionsChecked++;
        
        const conditionResult = await this.evaluateCondition(
          condition,
          event.transactionData,
          event
        );

        if (conditionResult.passed) {
          result.evaluationDetails.conditionsPassed++;
        } else {
          result.matches = false;
          result.evaluationDetails.failedConditions.push({
            condition,
            actualValue: conditionResult.actualValue,
            reason: conditionResult.reason,
          });
        }
      }

      return result;

    } catch (error) {
      this.logger.error(`Error evaluating rule ${rule.rule_id}: ${error.message}`, error.stack);
      result.matches = false;
      result.evaluationDetails.failedConditions.push({
        condition: null,
        actualValue: null,
        reason: `Evaluation error: ${error.message}`,
      });
      return result;
    }
  }

  /**
   * Evaluate individual condition
   */
  private async evaluateCondition(
    condition: RuleCondition,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): Promise<{
    passed: boolean;
    actualValue: any;
    reason: string;
  }> {
    try {
      const fieldValue = this.getFieldValue(condition.field, transactionData, event);
      const expectedValue = condition.value;
      
      let passed = false;
      let reason = '';

      switch (condition.operator) {
        case '=':
        case '==':
          passed = fieldValue == expectedValue;
          reason = passed ? 'Values match' : `Expected ${expectedValue}, got ${fieldValue}`;
          break;

        case '!=':
          passed = fieldValue != expectedValue;
          reason = passed ? 'Values differ' : `Expected not ${expectedValue}, got ${fieldValue}`;
          break;

        case '>':
          passed = parseFloat(fieldValue) > parseFloat(expectedValue);
          reason = passed ? 'Greater than condition met' : `${fieldValue} is not greater than ${expectedValue}`;
          break;

        case '<':
          passed = parseFloat(fieldValue) < parseFloat(expectedValue);
          reason = passed ? 'Less than condition met' : `${fieldValue} is not less than ${expectedValue}`;
          break;

        case '>=':
          passed = parseFloat(fieldValue) >= parseFloat(expectedValue);
          reason = passed ? 'Greater than or equal condition met' : `${fieldValue} is not >= ${expectedValue}`;
          break;

        case '<=':
          passed = parseFloat(fieldValue) <= parseFloat(expectedValue);
          reason = passed ? 'Less than or equal condition met' : `${fieldValue} is not <= ${expectedValue}`;
          break;

        case 'IN':
          passed = Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
          reason = passed ? 'Value found in list' : `${fieldValue} not found in ${JSON.stringify(expectedValue)}`;
          break;

        case 'NOT IN':
          passed = Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
          reason = passed ? 'Value not in list' : `${fieldValue} found in exclusion list ${JSON.stringify(expectedValue)}`;
          break;

        case 'LIKE':
          passed = fieldValue && fieldValue.toString().toLowerCase().includes(expectedValue.toLowerCase());
          reason = passed ? 'Pattern match found' : `${fieldValue} does not contain ${expectedValue}`;
          break;

        case 'BETWEEN':
          if (Array.isArray(expectedValue) && expectedValue.length === 2) {
            const numValue = parseFloat(fieldValue);
            passed = numValue >= expectedValue[0] && numValue <= expectedValue[1];
            reason = passed ? 'Value in range' : `${fieldValue} not between ${expectedValue[0]} and ${expectedValue[1]}`;
          } else {
            passed = false;
            reason = 'Invalid BETWEEN value format';
          }
          break;

        case 'REGEX':
          try {
            const regex = new RegExp(expectedValue);
            passed = regex.test(fieldValue);
            reason = passed ? 'Regex pattern matched' : `${fieldValue} does not match pattern ${expectedValue}`;
          } catch (error) {
            passed = false;
            reason = `Invalid regex pattern: ${expectedValue}`;
          }
          break;

        case 'IS_NULL':
          passed = fieldValue === null || fieldValue === undefined;
          reason = passed ? 'Value is null/undefined' : `Value is not null: ${fieldValue}`;
          break;

        case 'IS_NOT_NULL':
          passed = fieldValue !== null && fieldValue !== undefined;
          reason = passed ? 'Value is not null' : 'Value is null/undefined';
          break;

        case 'IS_EMPTY':
          passed = !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0) || 
                   (typeof fieldValue === 'string' && fieldValue.trim() === '');
          reason = passed ? 'Value is empty' : `Value is not empty: ${fieldValue}`;
          break;

        case 'IS_NOT_EMPTY':
          passed = fieldValue && !(Array.isArray(fieldValue) && fieldValue.length === 0) && 
                   !(typeof fieldValue === 'string' && fieldValue.trim() === '');
          reason = passed ? 'Value is not empty' : 'Value is empty';
          break;

        default:
          passed = false;
          reason = `Unknown operator: ${condition.operator}`;
      }

      return {
        passed,
        actualValue: fieldValue,
        reason,
      };

    } catch (error) {
      return {
        passed: false,
        actualValue: null,
        reason: `Condition evaluation error: ${error.message}`,
      };
    }
  }

  /**
   * Get field value from transaction data or event
   */
  private getFieldValue(
    field: string,
    transactionData: Record<string, any>,
    event: TransactionEvent
  ): any {
    // Check transaction data first
    if (transactionData.hasOwnProperty(field)) {
      return transactionData[field];
    }

    // Check event properties
    switch (field) {
      case 'event_type':
        return event.eventType;
      case 'transaction_type':
        return event.transactionType;
      case 'source_document_type':
        return event.sourceDocumentType;
      case 'station_id':
        return event.stationId;
      case 'customer_id':
        return event.customerId;
      case 'timestamp':
        return event.timestamp;
      default:
        // Try nested field access (e.g., 'customer.category')
        if (field.includes('.')) {
          return this.getNestedValue(field, transactionData);
        }
        return undefined;
    }
  }

  /**
   * Get nested field value using dot notation
   */
  private getNestedValue(path: string, obj: Record<string, any>): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Create new posting rule
   */
  async createRule(ruleData: Partial<AutomatedPostingRule>): Promise<AutomatedPostingRule> {
    const rule = this.ruleRepository.create({
      ...ruleData,
      created_by: ruleData.created_by || 'SYSTEM',
      created_at: new Date(),
    });

    return await this.ruleRepository.save(rule);
  }

  /**
   * Update existing rule
   */
  async updateRule(
    ruleId: string, 
    updateData: Partial<AutomatedPostingRule>
  ): Promise<AutomatedPostingRule> {
    await this.ruleRepository.update(ruleId, {
      ...updateData,
      updated_at: new Date(),
    });

    return await this.ruleRepository.findOne({ where: { rule_id: ruleId } });
  }

  /**
   * Delete rule (soft delete by setting inactive)
   */
  async deleteRule(ruleId: string): Promise<void> {
    await this.ruleRepository.update(ruleId, {
      is_active: false,
      updated_at: new Date(),
    });
  }

  /**
   * Find rules by criteria
   */
  async findRulesByCriteria(criteria: RuleMatchCriteria): Promise<AutomatedPostingRule[]> {
    const queryBuilder = this.ruleRepository
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.template', 'template')
      .where('rule.is_active = :isActive', { isActive: true });

    if (criteria.transactionType) {
      queryBuilder.andWhere('rule.trigger_event = :transactionType', {
        transactionType: criteria.transactionType,
      });
    }

    if (criteria.sourceSystem) {
      queryBuilder.andWhere(
        "rule.trigger_configuration->>'source_system' = :sourceSystem",
        { sourceSystem: criteria.sourceSystem }
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get rule performance statistics
   */
  async getRulePerformanceStats(ruleId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution: Date;
  }> {
    // This would require joining with audit logs table
    // Implementation depends on your audit log structure
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecution: new Date(),
    };
  }

  /**
   * Test rule against sample data
   */
  async testRule(
    ruleId: string,
    testData: Record<string, any>
  ): Promise<RuleEvaluationResult> {
    const rule = await this.ruleRepository.findOne({
      where: { rule_id: ruleId },
      relations: ['template'],
    });

    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const testEvent: TransactionEvent = {
      eventType: 'TEST_EVENT',
      transactionType: 'TEST_TRANSACTION',
      sourceDocumentType: 'TEST_DOCUMENT',
      sourceDocumentId: 'TEST_ID',
      transactionData: testData,
      timestamp: new Date(),
    };

    return await this.evaluateRule(rule, testEvent);
  }

  /**
   * Get all active rules ordered by priority
   */
  async getAllActiveRules(): Promise<AutomatedPostingRule[]> {
    return await this.ruleRepository.find({
      where: { is_active: true },
      relations: ['template'],
      order: { priority: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * Bulk update rule priorities
   */
  async updateRulePriorities(priorities: Array<{ ruleId: string; priority: number }>): Promise<void> {
    for (const item of priorities) {
      await this.ruleRepository.update(item.ruleId, {
        priority: item.priority,
        updated_at: new Date(),
      });
    }
  }

  /**
   * Clone existing rule
   */
  async cloneRule(ruleId: string, newRuleName: string): Promise<AutomatedPostingRule> {
    const existingRule = await this.ruleRepository.findOne({
      where: { rule_id: ruleId },
    });

    if (!existingRule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const clonedRule = this.ruleRepository.create({
      ...existingRule,
      rule_id: undefined, // Let TypeORM generate new UUID
      rule_name: newRuleName,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.ruleRepository.save(clonedRule);
  }
}