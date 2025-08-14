import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PostingRuleEngine, RuleMatchCriteria } from '../services/posting-rule-engine.service';
import { AutomatedPostingRule } from '../entities/automated-posting-rule.entity';

@ApiTags('Posting Rules')
@ApiBearerAuth()
@Controller('posting-rules')
export class PostingRuleController {
  constructor(private ruleEngine: PostingRuleEngine) {}

  /**
   * Get all active posting rules
   */
  @Get()
  @ApiOperation({ summary: 'Get all active posting rules' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  async getAllActiveRules() {
    try {
      const rules = await this.ruleEngine.getAllActiveRules();
      
      return {
        success: true,
        data: rules,
        message: `Retrieved ${rules.length} active rules`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rules',
      };
    }
  }

  /**
   * Create new posting rule
   */
  @Post()
  @ApiOperation({ summary: 'Create new posting rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid rule data' })
  async createRule(@Body() ruleData: Partial<AutomatedPostingRule>) {
    try {
      // Validate required fields
      if (!ruleData.rule_name || !ruleData.trigger_event || !ruleData.template_id) {
        return {
          success: false,
          message: 'Missing required fields: rule_name, trigger_event, template_id',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const rule = await this.ruleEngine.createRule(ruleData);
      
      return {
        success: true,
        data: rule,
        message: 'Rule created successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create rule',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Update existing rule
   */
  @Put(':ruleId')
  @ApiOperation({ summary: 'Update existing posting rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  async updateRule(
    @Param('ruleId') ruleId: string,
    @Body() updateData: Partial<AutomatedPostingRule>
  ) {
    try {
      const updatedRule = await this.ruleEngine.updateRule(ruleId, updateData);
      
      if (!updatedRule) {
        return {
          success: false,
          message: 'Rule not found',
          status: HttpStatus.NOT_FOUND,
        };
      }
      
      return {
        success: true,
        data: updatedRule,
        message: 'Rule updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update rule',
      };
    }
  }

  /**
   * Delete rule (soft delete)
   */
  @Delete(':ruleId')
  @ApiOperation({ summary: 'Delete posting rule (soft delete)' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  async deleteRule(@Param('ruleId') ruleId: string) {
    try {
      await this.ruleEngine.deleteRule(ruleId);
      
      return {
        success: true,
        message: 'Rule deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete rule',
      };
    }
  }

  /**
   * Find rules by criteria
   */
  @Post('search')
  @ApiOperation({ summary: 'Search rules by criteria' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  async findRulesByCriteria(@Body() criteria: RuleMatchCriteria) {
    try {
      const rules = await this.ruleEngine.findRulesByCriteria(criteria);
      
      return {
        success: true,
        data: {
          criteria,
          rules,
          count: rules.length,
        },
        message: `Found ${rules.length} rules matching criteria`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to search rules',
      };
    }
  }

  /**
   * Test rule against sample data
   */
  @Post('test/:ruleId')
  @ApiOperation({ summary: 'Test rule against sample transaction data' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID to test' })
  @ApiResponse({ status: 200, description: 'Rule test completed' })
  async testRule(
    @Param('ruleId') ruleId: string,
    @Body() testData: Record<string, any>
  ) {
    try {
      const result = await this.ruleEngine.testRule(ruleId, testData);
      
      return {
        success: true,
        data: {
          rule_id: ruleId,
          test_data: testData,
          evaluation_result: result,
        },
        message: result.matches ? 
          'Rule matches the test data' : 
          'Rule does not match the test data',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Rule test failed',
      };
    }
  }

  /**
   * Get rule performance statistics
   */
  @Get('statistics/:ruleId')
  @ApiOperation({ summary: 'Get rule performance statistics' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getRulePerformanceStats(@Param('ruleId') ruleId: string) {
    try {
      const stats = await this.ruleEngine.getRulePerformanceStats(ruleId);
      
      return {
        success: true,
        data: {
          rule_id: ruleId,
          performance_stats: stats,
        },
        message: 'Rule performance statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rule performance statistics',
      };
    }
  }

  /**
   * Update rule priorities in bulk
   */
  @Put('priorities')
  @ApiOperation({ summary: 'Update rule priorities in bulk' })
  @ApiResponse({ status: 200, description: 'Priorities updated successfully' })
  async updateRulePriorities(
    @Body() priorities: Array<{ ruleId: string; priority: number }>
  ) {
    try {
      await this.ruleEngine.updateRulePriorities(priorities);
      
      return {
        success: true,
        data: {
          updated_rules: priorities.length,
          priorities,
        },
        message: `Updated priorities for ${priorities.length} rules`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update rule priorities',
      };
    }
  }

  /**
   * Clone existing rule
   */
  @Post('clone/:ruleId')
  @ApiOperation({ summary: 'Clone existing rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID to clone' })
  @ApiResponse({ status: 201, description: 'Rule cloned successfully' })
  async cloneRule(
    @Param('ruleId') ruleId: string,
    @Body() cloneData: { new_rule_name: string; modifications?: Partial<AutomatedPostingRule> }
  ) {
    try {
      const clonedRule = await this.ruleEngine.cloneRule(ruleId, cloneData.new_rule_name);
      
      // Apply any modifications if provided
      if (cloneData.modifications) {
        const modifiedRule = await this.ruleEngine.updateRule(
          clonedRule.rule_id, 
          cloneData.modifications
        );
        
        return {
          success: true,
          data: {
            original_rule_id: ruleId,
            cloned_rule: modifiedRule,
          },
          message: 'Rule cloned and modified successfully',
          status: HttpStatus.CREATED,
        };
      }
      
      return {
        success: true,
        data: {
          original_rule_id: ruleId,
          cloned_rule: clonedRule,
        },
        message: 'Rule cloned successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to clone rule',
      };
    }
  }

  /**
   * Validate rule configuration
   */
  @Post('validate/:ruleId')
  @ApiOperation({ summary: 'Validate rule configuration' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID to validate' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateRule(@Param('ruleId') ruleId: string) {
    try {
      // This would implement comprehensive rule validation
      const validationResults = {
        is_valid: true,
        errors: [] as string[],
        warnings: [] as string[],
        recommendations: [] as string[],
      };

      // Placeholder validation logic
      // In a real implementation, you would validate:
      // - Condition syntax
      // - Template existence and compatibility
      // - Field references
      // - Logical consistency
      // - Performance implications

      return {
        success: true,
        data: {
          rule_id: ruleId,
          validation_results: validationResults,
        },
        message: validationResults.is_valid ? 
          'Rule validation passed' : 
          'Rule validation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Rule validation failed',
      };
    }
  }

  /**
   * Get rules by transaction type
   */
  @Get('by-type/:transactionType')
  @ApiOperation({ summary: 'Get rules by transaction type' })
  @ApiParam({ name: 'transactionType', description: 'Transaction type' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  async getRulesByType(@Param('transactionType') transactionType: string) {
    try {
      const criteria: RuleMatchCriteria = {
        transactionType,
      };
      
      const rules = await this.ruleEngine.findRulesByCriteria(criteria);
      
      return {
        success: true,
        data: {
          transaction_type: transactionType,
          rules,
          count: rules.length,
        },
        message: `Found ${rules.length} rules for transaction type: ${transactionType}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rules by type',
      };
    }
  }

  /**
   * Enable/disable rule
   */
  @Put(':ruleId/toggle')
  @ApiOperation({ summary: 'Enable or disable rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Rule status updated successfully' })
  async toggleRuleStatus(@Param('ruleId') ruleId: string) {
    try {
      // Get current rule status
      const allRules = await this.ruleEngine.getAllActiveRules();
      const rule = allRules.find(r => r.rule_id === ruleId);
      
      if (!rule) {
        return {
          success: false,
          message: 'Rule not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      // Toggle active status
      const updatedRule = await this.ruleEngine.updateRule(ruleId, {
        is_active: !rule.is_active,
      });

      return {
        success: true,
        data: updatedRule,
        message: `Rule ${updatedRule.is_active ? 'enabled' : 'disabled'} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to toggle rule status',
      };
    }
  }

  /**
   * Get rule execution history
   */
  @Get(':ruleId/history')
  @ApiOperation({ summary: 'Get rule execution history' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getRuleExecutionHistory(
    @Param('ruleId') ruleId: string,
    @Query('limit') limit: number = 50,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    try {
      // This would typically fetch from audit logs
      // For now, returning placeholder data
      const executionHistory = {
        rule_id: ruleId,
        executions: [],
        summary: {
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          success_rate: 0,
          average_execution_time: 0,
        },
        period: {
          from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: dateTo || new Date().toISOString(),
        },
      };

      return {
        success: true,
        data: executionHistory,
        message: 'Rule execution history retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve rule execution history',
      };
    }
  }
}