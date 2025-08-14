import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostingTolerance, ToleranceType, ToleranceScope } from '../entities/posting-tolerance.entity';
import { GeneratedJournalData } from './transaction-template.service';

export interface ToleranceViolation {
  tolerance_id: string;
  tolerance_name: string;
  expected_value: number;
  actual_value: number;
  variance_amount: number;
  variance_percentage: number;
  violation_action: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  requires_approval: boolean;
}

export interface ToleranceCheckResult {
  passed: boolean;
  requiresApproval: boolean;
  violations: ToleranceViolation[];
  warnings: string[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    criticalViolations: number;
  };
}

@Injectable()
export class ToleranceCheckService {
  private readonly logger = new Logger(ToleranceCheckService.name);

  constructor(
    @InjectRepository(PostingTolerance)
    private toleranceRepository: Repository<PostingTolerance>,
  ) {}

  /**
   * Check all applicable tolerances for journal data
   */
  async checkTolerances(
    journalData: GeneratedJournalData,
    transactionType: string,
    contextData?: Record<string, any>
  ): Promise<ToleranceCheckResult> {
    const result: ToleranceCheckResult = {
      passed: true,
      requiresApproval: false,
      violations: [],
      warnings: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        criticalViolations: 0,
      },
    };

    try {
      // Get applicable tolerances
      const tolerances = await this.getApplicableTolerances(transactionType, journalData, contextData);
      result.summary.totalChecks = tolerances.length;

      if (tolerances.length === 0) {
        this.logger.warn(`No tolerances configured for transaction type: ${transactionType}`);
        return result;
      }

      // Check each tolerance
      for (const tolerance of tolerances) {
        const violation = await this.checkTolerance(tolerance, journalData, contextData);
        
        if (violation) {
          result.violations.push(violation);
          result.summary.failedChecks++;
          result.passed = false;

          if (violation.severity === 'CRITICAL') {
            result.summary.criticalViolations++;
          }

          if (violation.requires_approval) {
            result.requiresApproval = true;
          }

          // Update tolerance violation statistics
          await this.updateToleranceStatistics(tolerance.tolerance_id, violation);
          
        } else {
          result.summary.passedChecks++;
        }
      }

      // Add warnings for significant variances that don't violate tolerances
      result.warnings = this.generateWarnings(journalData, tolerances);

      this.logger.log(
        `Tolerance check completed: ${result.summary.passedChecks}/${result.summary.totalChecks} passed, ` +
        `${result.violations.length} violations, approval required: ${result.requiresApproval}`
      );

      return result;

    } catch (error) {
      this.logger.error(`Error checking tolerances: ${error.message}`, error.stack);
      result.passed = false;
      result.warnings.push(`Tolerance check failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Get tolerances applicable to the transaction
   */
  private async getApplicableTolerances(
    transactionType: string,
    journalData: GeneratedJournalData,
    contextData?: Record<string, any>
  ): Promise<PostingTolerance[]> {
    const queryBuilder = this.toleranceRepository
      .createQueryBuilder('tolerance')
      .where('tolerance.is_active = :isActive', { isActive: true });

    // Add scope-based filters
    queryBuilder.andWhere(
      '(tolerance.scope = :global OR ' +
      '(tolerance.scope = :transactionType AND tolerance.scope_value = :transactionTypeValue))',
      {
        global: ToleranceScope.GLOBAL,
        transactionType: ToleranceScope.TRANSACTION_TYPE,
        transactionTypeValue: transactionType,
      }
    );

    // Add account-specific tolerances
    if (journalData.lines && journalData.lines.length > 0) {
      const accountCodes = journalData.lines.map(line => line.account_code);
      queryBuilder.orWhere(
        '(tolerance.scope = :accountScope AND tolerance.scope_value IN (:...accountCodes))',
        {
          accountScope: ToleranceScope.ACCOUNT,
          accountCodes,
        }
      );
    }

    // Add station-specific tolerances if available
    if (contextData?.stationId) {
      queryBuilder.orWhere(
        '(tolerance.scope = :stationScope AND tolerance.scope_value = :stationId)',
        {
          stationScope: ToleranceScope.STATION,
          stationId: contextData.stationId,
        }
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Check individual tolerance
   */
  private async checkTolerance(
    tolerance: PostingTolerance,
    journalData: GeneratedJournalData,
    contextData?: Record<string, any>
  ): Promise<ToleranceViolation | null> {
    try {
      // Get the value to check based on tolerance scope
      const actualValue = this.getToleranceCheckValue(tolerance, journalData, contextData);
      
      // Check if conditions are met (if any)
      if (tolerance.conditions && !this.evaluateConditions(tolerance.conditions, journalData, contextData)) {
        return null; // Tolerance doesn't apply
      }

      // Check amount range constraints
      if (tolerance.minimum_amount && actualValue < tolerance.minimum_amount) {
        return null; // Below minimum threshold
      }
      if (tolerance.maximum_amount && actualValue > tolerance.maximum_amount) {
        return null; // Above maximum threshold
      }

      // Calculate variance based on tolerance type
      const variance = this.calculateVariance(tolerance, actualValue);
      
      if (variance.violates_tolerance) {
        const severity = this.determineSeverity(variance.variance_percentage, tolerance);
        
        return {
          tolerance_id: tolerance.tolerance_id,
          tolerance_name: tolerance.tolerance_name,
          expected_value: variance.expected_value,
          actual_value: actualValue,
          variance_amount: variance.variance_amount,
          variance_percentage: variance.variance_percentage,
          violation_action: tolerance.violation_action,
          severity,
          message: this.generateViolationMessage(tolerance, variance),
          requires_approval: tolerance.violation_action === 'APPROVE' || severity === 'CRITICAL',
        };
      }

      return null; // No violation

    } catch (error) {
      this.logger.error(`Error checking tolerance ${tolerance.tolerance_id}: ${error.message}`, error.stack);
      
      return {
        tolerance_id: tolerance.tolerance_id,
        tolerance_name: tolerance.tolerance_name,
        expected_value: 0,
        actual_value: 0,
        variance_amount: 0,
        variance_percentage: 0,
        violation_action: 'BLOCK',
        severity: 'CRITICAL',
        message: `Tolerance check error: ${error.message}`,
        requires_approval: true,
      };
    }
  }

  /**
   * Get the value to check against tolerance
   */
  private getToleranceCheckValue(
    tolerance: PostingTolerance,
    journalData: GeneratedJournalData,
    contextData?: Record<string, any>
  ): number {
    switch (tolerance.scope) {
      case ToleranceScope.GLOBAL:
        return journalData.totalAmount;
      
      case ToleranceScope.TRANSACTION_TYPE:
        return journalData.totalAmount;
      
      case ToleranceScope.ACCOUNT:
        const accountLines = journalData.lines.filter(
          line => line.account_code === tolerance.scope_value
        );
        return accountLines.reduce(
          (sum, line) => sum + (line.debit_amount || 0) + (line.credit_amount || 0),
          0
        );
      
      case ToleranceScope.STATION:
        return journalData.totalAmount;
      
      case ToleranceScope.PRODUCT:
        return contextData?.product_amount || journalData.totalAmount;
      
      default:
        return journalData.totalAmount;
    }
  }

  /**
   * Calculate variance against tolerance
   */
  private calculateVariance(
    tolerance: PostingTolerance,
    actualValue: number
  ): {
    expected_value: number;
    variance_amount: number;
    variance_percentage: number;
    violates_tolerance: boolean;
  } {
    let expectedValue = actualValue;
    let varianceAmount = 0;
    let variancePercentage = 0;
    let violatesTolerance = false;

    switch (tolerance.tolerance_type) {
      case ToleranceType.PERCENTAGE:
        // For percentage tolerances, we compare against the tolerance value
        varianceAmount = Math.abs(actualValue * (tolerance.tolerance_value / 100));
        variancePercentage = tolerance.tolerance_value;
        violatesTolerance = Math.abs(actualValue) > varianceAmount;
        expectedValue = actualValue - varianceAmount; // Expected within tolerance
        break;

      case ToleranceType.ABSOLUTE:
        // For absolute tolerances, we check if the actual value exceeds the tolerance
        expectedValue = tolerance.tolerance_value;
        varianceAmount = Math.abs(actualValue - expectedValue);
        variancePercentage = expectedValue !== 0 ? (varianceAmount / Math.abs(expectedValue)) * 100 : 0;
        violatesTolerance = varianceAmount > tolerance.tolerance_value;
        break;

      case ToleranceType.CONDITIONAL:
        // For conditional tolerances, evaluate the conditions
        if (tolerance.conditions) {
          const conditionResult = this.evaluateToleranceConditions(tolerance.conditions, actualValue);
          expectedValue = conditionResult.expected_value;
          varianceAmount = Math.abs(actualValue - expectedValue);
          variancePercentage = expectedValue !== 0 ? (varianceAmount / Math.abs(expectedValue)) * 100 : 0;
          violatesTolerance = !conditionResult.within_tolerance;
        }
        break;
    }

    return {
      expected_value: expectedValue,
      variance_amount: varianceAmount,
      variance_percentage: variancePercentage,
      violates_tolerance: violatesTolerance,
    };
  }

  /**
   * Evaluate tolerance conditions
   */
  private evaluateToleranceConditions(
    conditions: any[],
    actualValue: number
  ): { expected_value: number; within_tolerance: boolean } {
    // Simplified condition evaluation
    // In practice, this would be more sophisticated
    for (const condition of conditions) {
      if (this.evaluateCondition(actualValue, condition.operator, condition.value)) {
        return {
          expected_value: condition.tolerance_value || actualValue,
          within_tolerance: Math.abs(actualValue - condition.tolerance_value) <= condition.tolerance_value,
        };
      }
    }

    return {
      expected_value: actualValue,
      within_tolerance: false,
    };
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case '>':
        return parseFloat(fieldValue) > parseFloat(expectedValue);
      case '<':
        return parseFloat(fieldValue) < parseFloat(expectedValue);
      case '>=':
        return parseFloat(fieldValue) >= parseFloat(expectedValue);
      case '<=':
        return parseFloat(fieldValue) <= parseFloat(expectedValue);
      case '=':
      case '==':
        return fieldValue == expectedValue;
      case '!=':
        return fieldValue != expectedValue;
      default:
        return false;
    }
  }

  /**
   * Evaluate general conditions
   */
  private evaluateConditions(
    conditions: any[],
    journalData: GeneratedJournalData,
    contextData?: Record<string, any>
  ): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getConditionFieldValue(condition.field, journalData, contextData);
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get field value for condition evaluation
   */
  private getConditionFieldValue(
    field: string,
    journalData: GeneratedJournalData,
    contextData?: Record<string, any>
  ): any {
    switch (field) {
      case 'total_amount':
        return journalData.totalAmount;
      case 'line_count':
        return journalData.lines.length;
      case 'currency':
        return journalData.currency;
      default:
        return contextData?.[field];
    }
  }

  /**
   * Determine violation severity
   */
  private determineSeverity(variancePercentage: number, tolerance: PostingTolerance): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Check escalation matrix if available
    if (tolerance.escalation_matrix) {
      for (const escalation of tolerance.escalation_matrix) {
        if (variancePercentage >= escalation.threshold_percentage) {
          return escalation.threshold_percentage >= 50 ? 'CRITICAL' :
                 escalation.threshold_percentage >= 25 ? 'HIGH' :
                 escalation.threshold_percentage >= 10 ? 'MEDIUM' : 'LOW';
        }
      }
    }

    // Default severity based on variance percentage
    if (variancePercentage >= 50) return 'CRITICAL';
    if (variancePercentage >= 25) return 'HIGH';
    if (variancePercentage >= 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate violation message
   */
  private generateViolationMessage(tolerance: PostingTolerance, variance: any): string {
    const percentageText = variance.variance_percentage.toFixed(2);
    const amountText = variance.variance_amount.toFixed(2);
    
    return `${tolerance.tolerance_name}: Variance of ${amountText} (${percentageText}%) exceeds tolerance of ${tolerance.tolerance_value}${tolerance.tolerance_type === ToleranceType.PERCENTAGE ? '%' : ''}`;
  }

  /**
   * Generate warnings for significant variances
   */
  private generateWarnings(journalData: GeneratedJournalData, tolerances: PostingTolerance[]): string[] {
    const warnings: string[] = [];

    // Check for imbalanced entries
    if (Math.abs(journalData.totalDebit - journalData.totalCredit) > 0.01) {
      warnings.push(`Journal entries not balanced: Debit ${journalData.totalDebit}, Credit ${journalData.totalCredit}`);
    }

    // Check for zero-amount entries
    const zeroAmountLines = journalData.lines.filter(
      line => (line.debit_amount || 0) === 0 && (line.credit_amount || 0) === 0
    );
    if (zeroAmountLines.length > 0) {
      warnings.push(`${zeroAmountLines.length} journal lines have zero amounts`);
    }

    // Check for large amounts (potential data entry errors)
    const largeAmountThreshold = 1000000; // 1 million
    const largeAmountLines = journalData.lines.filter(
      line => (line.debit_amount || 0) > largeAmountThreshold || (line.credit_amount || 0) > largeAmountThreshold
    );
    if (largeAmountLines.length > 0) {
      warnings.push(`${largeAmountLines.length} journal lines have unusually large amounts (>${largeAmountThreshold})`);
    }

    return warnings;
  }

  /**
   * Update tolerance violation statistics
   */
  private async updateToleranceStatistics(toleranceId: string, violation: ToleranceViolation): Promise<void> {
    try {
      await this.toleranceRepository
        .createQueryBuilder()
        .update(PostingTolerance)
        .set({
          violation_count: () => 'violation_count + 1',
          last_violation_date: new Date(),
          total_variance_amount: () => `total_variance_amount + ${violation.variance_amount}`,
        })
        .where('tolerance_id = :toleranceId', { toleranceId })
        .execute();
    } catch (error) {
      this.logger.error(`Error updating tolerance statistics: ${error.message}`, error.stack);
    }
  }

  /**
   * Create new tolerance
   */
  async createTolerance(toleranceData: Partial<PostingTolerance>): Promise<PostingTolerance> {
    const tolerance = this.toleranceRepository.create({
      ...toleranceData,
      created_by: toleranceData.created_by || 'SYSTEM',
    });

    return await this.toleranceRepository.save(tolerance);
  }

  /**
   * Update existing tolerance
   */
  async updateTolerance(
    toleranceId: string,
    updateData: Partial<PostingTolerance>
  ): Promise<PostingTolerance> {
    await this.toleranceRepository.update(toleranceId, {
      ...updateData,
      updated_at: new Date(),
    });

    return await this.toleranceRepository.findOne({ where: { tolerance_id: toleranceId } });
  }

  /**
   * Get tolerance performance statistics
   */
  async getToleranceStats(toleranceId: string): Promise<{
    tolerance: PostingTolerance;
    performance: {
      total_violations: number;
      last_violation: Date;
      average_variance: number;
      violation_trend: string;
    };
  }> {
    const tolerance = await this.toleranceRepository.findOne({
      where: { tolerance_id: toleranceId },
    });

    if (!tolerance) {
      throw new Error(`Tolerance not found: ${toleranceId}`);
    }

    return {
      tolerance,
      performance: {
        total_violations: tolerance.violation_count,
        last_violation: tolerance.last_violation_date,
        average_variance: tolerance.violation_count > 0 ? 
          tolerance.total_variance_amount / tolerance.violation_count : 0,
        violation_trend: this.calculateViolationTrend(tolerance),
      },
    };
  }

  /**
   * Calculate violation trend
   */
  private calculateViolationTrend(tolerance: PostingTolerance): string {
    // This is a simplified implementation
    // In practice, you'd analyze historical data
    if (tolerance.violation_count === 0) return 'STABLE';
    if (tolerance.last_violation_date) {
      const daysSinceViolation = Math.floor(
        (Date.now() - tolerance.last_violation_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceViolation < 7) return 'INCREASING';
      if (daysSinceViolation > 30) return 'DECREASING';
    }
    return 'STABLE';
  }

  /**
   * Get all active tolerances
   */
  async getActiveTolerances(): Promise<PostingTolerance[]> {
    return await this.toleranceRepository.find({
      where: { is_active: true },
      order: { scope: 'ASC', tolerance_name: 'ASC' },
    });
  }
}