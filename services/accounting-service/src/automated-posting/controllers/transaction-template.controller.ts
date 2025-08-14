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

import { TransactionTemplateService } from '../services/transaction-template.service';
import { JournalEntryTemplate } from '../entities/journal-entry-template.entity';

@ApiTags('Transaction Templates')
@ApiBearerAuth()
@Controller('transaction-templates')
export class TransactionTemplateController {
  constructor(private templateService: TransactionTemplateService) {}

  /**
   * Get all active templates
   */
  @Get()
  @ApiOperation({ summary: 'Get all active transaction templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getActiveTemplates() {
    try {
      const templates = await this.templateService.getActiveTemplates();
      
      return {
        success: true,
        data: templates,
        message: `Retrieved ${templates.length} active templates`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve templates',
      };
    }
  }

  /**
   * Get template by code
   */
  @Get('by-code/:templateCode')
  @ApiOperation({ summary: 'Get template by code' })
  @ApiParam({ name: 'templateCode', description: 'Template code' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateByCode(@Param('templateCode') templateCode: string) {
    try {
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }
      
      return {
        success: true,
        data: template,
        message: 'Template retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve template',
      };
    }
  }

  /**
   * Create new template
   */
  @Post()
  @ApiOperation({ summary: 'Create new transaction template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  async createTemplate(@Body() templateData: Partial<JournalEntryTemplate>) {
    try {
      // Validate required fields
      if (!templateData.template_code || !templateData.name || !templateData.transaction_type) {
        return {
          success: false,
          message: 'Missing required fields: template_code, name, transaction_type',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      // Validate account mapping rules
      if (!templateData.account_mapping_rules || 
          (!templateData.account_mapping_rules.debit && !templateData.account_mapping_rules.credit)) {
        return {
          success: false,
          message: 'Account mapping rules must include at least debit or credit entries',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const template = await this.templateService.saveTemplate(templateData);
      
      return {
        success: true,
        data: template,
        message: 'Template created successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create template',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Update existing template
   */
  @Put(':templateId')
  @ApiOperation({ summary: 'Update existing transaction template' })
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateData: Partial<JournalEntryTemplate>
  ) {
    try {
      // Add template_id to updateData
      updateData.template_id = templateId;
      
      const updatedTemplate = await this.templateService.saveTemplate(updateData);
      
      return {
        success: true,
        data: updatedTemplate,
        message: 'Template updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update template',
      };
    }
  }

  /**
   * Test template with sample data
   */
  @Post('test/:templateCode')
  @ApiOperation({ summary: 'Test template with sample transaction data' })
  @ApiParam({ name: 'templateCode', description: 'Template code to test' })
  @ApiResponse({ status: 200, description: 'Template test completed' })
  async testTemplate(
    @Param('templateCode') templateCode: string,
    @Body() testData: {
      transactionData: Record<string, any>;
      eventData?: Record<string, any>;
    }
  ) {
    try {
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      // Create mock event
      const mockEvent = {
        eventType: 'test.event',
        transactionType: template.transaction_type,
        sourceDocumentType: 'TEST',
        sourceDocumentId: 'TEST_001',
        transactionData: testData.transactionData,
        timestamp: new Date(),
        ...testData.eventData,
      };

      const result = await this.templateService.generateJournalEntries(
        template,
        testData.transactionData,
        mockEvent as any
      );

      return {
        success: true,
        data: {
          template_code: templateCode,
          test_results: result,
          mock_event: mockEvent,
        },
        message: result.validation_errors.length > 0 ? 
          'Template test completed with validation errors' : 
          'Template test completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Template test failed',
      };
    }
  }

  /**
   * Validate template configuration
   */
  @Post('validate/:templateCode')
  @ApiOperation({ summary: 'Validate template configuration' })
  @ApiParam({ name: 'templateCode', description: 'Template code to validate' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateTemplate(@Param('templateCode') templateCode: string) {
    try {
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      const validationResults = {
        is_valid: true,
        errors: [] as string[],
        warnings: [] as string[],
        recommendations: [] as string[],
      };

      // Validate account mapping rules
      if (!template.account_mapping_rules) {
        validationResults.is_valid = false;
        validationResults.errors.push('Account mapping rules are missing');
      } else {
        // Validate debit entries
        if (template.account_mapping_rules.debit) {
          template.account_mapping_rules.debit.forEach((rule, index) => {
            if (!rule.account) {
              validationResults.errors.push(`Debit rule ${index + 1}: Missing account code`);
              validationResults.is_valid = false;
            }
            if (!rule.amount) {
              validationResults.errors.push(`Debit rule ${index + 1}: Missing amount formula`);
              validationResults.is_valid = false;
            }
          });
        }

        // Validate credit entries
        if (template.account_mapping_rules.credit) {
          template.account_mapping_rules.credit.forEach((rule, index) => {
            if (!rule.account) {
              validationResults.errors.push(`Credit rule ${index + 1}: Missing account code`);
              validationResults.is_valid = false;
            }
            if (!rule.amount) {
              validationResults.errors.push(`Credit rule ${index + 1}: Missing amount formula`);
              validationResults.is_valid = false;
            }
          });
        }

        // Check if at least one debit or credit rule exists
        if (!template.account_mapping_rules.debit?.length && !template.account_mapping_rules.credit?.length) {
          validationResults.is_valid = false;
          validationResults.errors.push('Template must have at least one debit or credit rule');
        }
      }

      // Validate validation rules syntax
      if (template.validation_rules?.length) {
        template.validation_rules.forEach((rule, index) => {
          if (!rule.field || !rule.operator || rule.value === undefined) {
            validationResults.warnings.push(`Validation rule ${index + 1}: Incomplete rule definition`);
          }
        });
      }

      // Check IFRS configuration consistency
      if (template.ifrs15_revenue_recognition && !template.ifrs_configuration) {
        validationResults.warnings.push('IFRS 15 enabled but no IFRS configuration provided');
      }

      // Recommendations
      if (!template.description) {
        validationResults.recommendations.push('Add a description for better documentation');
      }

      if (template.approval_required && !template.approval_threshold) {
        validationResults.recommendations.push('Consider setting an approval threshold for conditional approvals');
      }

      return {
        success: true,
        data: {
          template_code: templateCode,
          validation_results: validationResults,
        },
        message: validationResults.is_valid ? 
          'Template validation passed' : 
          'Template validation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Template validation failed',
      };
    }
  }

  /**
   * Get template usage statistics
   */
  @Get('statistics/:templateCode')
  @ApiOperation({ summary: 'Get template usage statistics' })
  @ApiParam({ name: 'templateCode', description: 'Template code' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getTemplateStatistics(
    @Param('templateCode') templateCode: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    try {
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      // This would typically fetch statistics from audit logs
      // For now, returning mock statistics
      const statistics = {
        template_id: template.template_id,
        template_code: templateCode,
        usage_period: {
          from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: dateTo || new Date().toISOString(),
        },
        metrics: {
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          success_rate: 0,
          average_processing_time_ms: 0,
          total_amount_processed: 0,
          unique_source_documents: 0,
        },
        trend_data: [],
        error_breakdown: [],
        performance_indicators: {
          reliability_score: 0,
          efficiency_score: 0,
          accuracy_score: 0,
        },
      };

      return {
        success: true,
        data: statistics,
        message: 'Template statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve template statistics',
      };
    }
  }

  /**
   * Clone existing template
   */
  @Post('clone/:templateCode')
  @ApiOperation({ summary: 'Clone existing template' })
  @ApiParam({ name: 'templateCode', description: 'Template code to clone' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  async cloneTemplate(
    @Param('templateCode') templateCode: string,
    @Body() cloneData: {
      new_template_code: string;
      new_name?: string;
      modifications?: Partial<JournalEntryTemplate>;
    }
  ) {
    try {
      const originalTemplate = await this.templateService.getTemplateByCode(templateCode);
      
      if (!originalTemplate) {
        return {
          success: false,
          message: 'Original template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      // Create new template based on original
      const clonedTemplate: Partial<JournalEntryTemplate> = {
        ...originalTemplate,
        template_id: undefined, // Let TypeORM generate new ID
        template_code: cloneData.new_template_code,
        name: cloneData.new_name || `${originalTemplate.name} (Copy)`,
        created_by: 'SYSTEM', // Should be replaced with actual user
        created_at: undefined,
        updated_at: undefined,
        ...cloneData.modifications,
      };

      const savedTemplate = await this.templateService.saveTemplate(clonedTemplate);

      return {
        success: true,
        data: {
          original_template_code: templateCode,
          cloned_template: savedTemplate,
        },
        message: 'Template cloned successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to clone template',
      };
    }
  }

  /**
   * Get templates by transaction type
   */
  @Get('by-type/:transactionType')
  @ApiOperation({ summary: 'Get templates by transaction type' })
  @ApiParam({ name: 'transactionType', description: 'Transaction type' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplatesByType(@Param('transactionType') transactionType: string) {
    try {
      const allTemplates = await this.templateService.getActiveTemplates();
      const filteredTemplates = allTemplates.filter(
        template => template.transaction_type === transactionType
      );

      return {
        success: true,
        data: {
          transaction_type: transactionType,
          templates: filteredTemplates,
          count: filteredTemplates.length,
        },
        message: `Found ${filteredTemplates.length} templates for transaction type: ${transactionType}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve templates by type',
      };
    }
  }

  /**
   * Preview journal entries for template
   */
  @Post('preview/:templateCode')
  @ApiOperation({ summary: 'Preview journal entries that would be generated' })
  @ApiParam({ name: 'templateCode', description: 'Template code' })
  async previewJournalEntries(
    @Param('templateCode') templateCode: string,
    @Body() previewData: Record<string, any>
  ) {
    try {
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      // Create mock event for preview
      const mockEvent = {
        eventType: 'preview.event',
        transactionType: template.transaction_type,
        sourceDocumentType: 'PREVIEW',
        sourceDocumentId: 'PREVIEW_001',
        transactionData: previewData,
        timestamp: new Date(),
      };

      const journalData = await this.templateService.generateJournalEntries(
        template,
        previewData,
        mockEvent as any
      );

      return {
        success: true,
        data: {
          template_code: templateCode,
          preview_data: previewData,
          generated_journal: journalData,
          preview_mode: true,
        },
        message: 'Journal entry preview generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate journal entry preview',
      };
    }
  }
}