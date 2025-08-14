import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PriceCalculationService } from '../price-buildup/price-calculation.service';
import { PricingWindowService } from '../pricing-window/pricing-window.service';
import { UppfClaimsService } from '../uppf-claims/uppf-claims.service';
import { NpaTemplateParserService } from '../npa-integration/npa-template-parser.service';

export class CreatePricingWindowDto {
  windowNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  npaGuidelineDocId?: string;
}

export class ComponentRateUpdateDto {
  componentCode: string;
  newRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  reason: string;
}

export class PriceCalculationRequestDto {
  windowId: string;
  overrides?: ComponentRateUpdateDto[];
  validateOnly?: boolean;
}

export class UppfClaimSubmissionDto {
  windowId: string;
  claimIds?: string[];
  submissionNotes?: string;
}

export class NpaResponseProcessingDto {
  submissionReference: string;
  responseReference: string;
  responseStatus: string;
  responseFile?: Buffer;
}

@ApiTags('Pricing Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/pricing')
export class PricingAutomationController {
  private readonly logger = new Logger(PricingAutomationController.name);

  constructor(
    private readonly priceCalculationService: PriceCalculationService,
    private readonly pricingWindowService: PricingWindowService,
    private readonly uppfClaimsService: UppfClaimsService,
    private readonly npaTemplateParser: NpaTemplateParserService
  ) {}

  /**
   * Create a new pricing window
   */
  @Post('windows/create')
  @ApiOperation({ summary: 'Create new pricing window' })
  @ApiResponse({ status: 201, description: 'Pricing window created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid window data' })
  @HttpCode(HttpStatus.CREATED)
  async createPricingWindow(
    @Body() dto: CreatePricingWindowDto,
    @Query('createdBy') createdBy: string
  ) {
    this.logger.log(`Creating pricing window: ${dto.year}-W${dto.windowNumber.toString().padStart(2, '0')}`);

    try {
      const windowData = {
        windowNumber: dto.windowNumber,
        year: dto.year,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        submissionDeadline: new Date(dto.submissionDeadline),
        npaGuidelineDocId: dto.npaGuidelineDocId,
        createdBy: createdBy || 'API_USER'
      };

      const window = await this.pricingWindowService.createPricingWindow(windowData);
      
      return {
        success: true,
        data: {
          windowId: window.windowId,
          windowNumber: window.windowNumber,
          year: window.year,
          status: window.status,
          startDate: window.startDate,
          endDate: window.endDate,
          submissionDeadline: window.submissionDeadline
        },
        message: 'Pricing window created successfully'
      };

    } catch (error) {
      this.logger.error('Failed to create pricing window:', error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update component rates
   */
  @Put('components/update')
  @ApiOperation({ summary: 'Update price component rates' })
  @ApiResponse({ status: 200, description: 'Component rates updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid component data' })
  async updateComponentRates(
    @Body() updates: ComponentRateUpdateDto[],
    @Query('updatedBy') updatedBy: string
  ) {
    this.logger.log(`Updating ${updates.length} component rates`);

    try {
      const results = [];

      for (const update of updates) {
        // Mock implementation - would integrate with component repository
        const result = {
          componentCode: update.componentCode,
          oldRate: 0.20, // Would fetch from database
          newRate: update.newRate,
          effectiveFrom: new Date(update.effectiveFrom),
          effectiveTo: update.effectiveTo ? new Date(update.effectiveTo) : undefined,
          reason: update.reason,
          updatedBy: updatedBy || 'API_USER',
          updatedAt: new Date()
        };

        results.push(result);
      }

      return {
        success: true,
        data: {
          updatedComponents: results.length,
          updates: results
        },
        message: 'Component rates updated successfully'
      };

    } catch (error) {
      this.logger.error('Failed to update component rates:', error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Calculate prices for a pricing window
   */
  @Get(':windowId/calculate')
  @ApiOperation({ summary: 'Calculate prices for pricing window' })
  @ApiParam({ name: 'windowId', description: 'Pricing window ID' })
  @ApiQuery({ name: 'withOverrides', required: false, description: 'Include component overrides' })
  @ApiResponse({ status: 200, description: 'Price calculation completed' })
  @ApiResponse({ status: 404, description: 'Pricing window not found' })
  async calculatePrices(
    @Param('windowId') windowId: string,
    @Query('withOverrides') withOverrides?: boolean
  ) {
    this.logger.log(`Calculating prices for window: ${windowId}`);

    try {
      const overrides = withOverrides ? [] : undefined; // Would get from request or database
      const calculation = await this.priceCalculationService.calculatePricesForWindow(
        windowId, 
        overrides
      );

      if (!calculation.isValid) {
        return {
          success: false,
          data: calculation,
          message: 'Price calculation completed with validation errors',
          errors: calculation.validationErrors
        };
      }

      return {
        success: true,
        data: {
          windowId: calculation.windowId,
          calculationDate: calculation.calculationDate,
          isValid: calculation.isValid,
          products: calculation.products.map(product => ({
            productCode: product.productCode,
            exPumpPrice: product.exPumpPrice,
            exRefineryPrice: product.exRefineryPrice,
            totalTaxesLevies: product.totalTaxesLevies,
            totalRegulatoryMargins: product.totalRegulatoryMargins,
            omcMargin: product.omcMargin,
            dealerMargin: product.dealerMargin,
            componentsBreakdown: product.components
          }))
        },
        message: 'Price calculation completed successfully'
      };

    } catch (error) {
      this.logger.error(`Price calculation failed for window ${windowId}:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Publish calculated prices to all stations
   */
  @Post(':windowId/publish-to-stations')
  @ApiOperation({ summary: 'Publish prices to all stations' })
  @ApiParam({ name: 'windowId', description: 'Pricing window ID' })
  @ApiResponse({ status: 200, description: 'Prices published to stations successfully' })
  @HttpCode(HttpStatus.OK)
  async publishPricesToStations(
    @Param('windowId') windowId: string,
    @Query('publishedBy') publishedBy: string,
    @Body() options?: { overrides?: ComponentRateUpdateDto[] }
  ) {
    this.logger.log(`Publishing prices to stations for window: ${windowId}`);

    try {
      const result = await this.pricingWindowService.calculateAndPublishPrices(
        windowId,
        publishedBy || 'API_USER',
        options?.overrides
      );

      return {
        success: true,
        data: {
          windowId: result.windowId,
          totalStationsUpdated: result.totalStationsUpdated,
          publishedAt: new Date(),
          pricesSummary: {
            productsCount: result.priceResults.products.length,
            validationPassed: result.priceResults.isValid
          }
        },
        message: `Prices published to ${result.totalStationsUpdated} stations successfully`
      };

    } catch (error) {
      this.logger.error(`Failed to publish prices for window ${windowId}:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Submit UPPF claims to NPA
   */
  @Post('uppf/submit')
  @ApiOperation({ summary: 'Submit UPPF claims to NPA' })
  @ApiResponse({ status: 200, description: 'UPPF claims submitted successfully' })
  @ApiResponse({ status: 400, description: 'No eligible claims found' })
  @HttpCode(HttpStatus.OK)
  async submitUppfClaims(
    @Body() dto: UppfClaimSubmissionDto,
    @Query('submittedBy') submittedBy: string
  ) {
    this.logger.log(`Submitting UPPF claims for window: ${dto.windowId}`);

    try {
      const result = await this.uppfClaimsService.submitClaimsToNpa(
        dto.windowId,
        submittedBy || 'API_USER',
        dto.claimIds
      );

      return {
        success: true,
        data: {
          submissionReference: result.submissionReference,
          windowId: dto.windowId,
          totalClaims: result.totalClaims,
          totalAmount: result.totalAmount,
          submissionDate: result.submissionDate,
          notes: dto.submissionNotes
        },
        message: `${result.totalClaims} UPPF claims submitted to NPA successfully`
      };

    } catch (error) {
      this.logger.error(`Failed to submit UPPF claims for window ${dto.windowId}:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Process NPA response for submitted claims
   */
  @Post('npa/process-response')
  @ApiOperation({ summary: 'Process NPA response for submitted claims' })
  @ApiResponse({ status: 200, description: 'NPA response processed successfully' })
  @HttpCode(HttpStatus.OK)
  async processNpaResponse(
    @Body() dto: NpaResponseProcessingDto
  ) {
    this.logger.log(`Processing NPA response for submission: ${dto.submissionReference}`);

    try {
      // Mock NPA response data structure
      const responseData = {
        responseReference: dto.responseReference,
        responseStatus: dto.responseStatus,
        approvedClaims: [
          {
            claimNumber: 'UPPF-2025-W01-001',
            approvedAmount: 1500.00,
            settlementDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        ],
        rejectedClaims: []
      };

      await this.uppfClaimsService.processNpaResponse(
        dto.submissionReference,
        responseData
      );

      return {
        success: true,
        data: {
          submissionReference: dto.submissionReference,
          responseReference: dto.responseReference,
          responseStatus: dto.responseStatus,
          approvedClaims: responseData.approvedClaims.length,
          rejectedClaims: responseData.rejectedClaims.length,
          processedAt: new Date()
        },
        message: 'NPA response processed successfully'
      };

    } catch (error) {
      this.logger.error(`Failed to process NPA response:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Upload and parse NPA template document
   */
  @Post('npa/upload-template')
  @ApiOperation({ summary: 'Upload and parse NPA pricing template' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, callback) => {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/pdf',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Invalid file type. Only Excel, CSV, PDF, and text files are allowed.'), false);
      }
    }
  }))
  @ApiResponse({ status: 200, description: 'NPA template processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or processing error' })
  @HttpCode(HttpStatus.OK)
  async uploadNpaTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Query('documentType') documentType: 'pricing_guideline' | 'pbu_template' | 'circular' = 'pricing_guideline',
    @Query('autoImport') autoImport: boolean = false,
    @Query('replaceExisting') replaceExisting: boolean = false,
    @Query('importBy') importBy: string = 'API_USER'
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`Processing NPA template upload: ${file.originalname}`);

    try {
      // Parse the uploaded document
      const parsedDocument = await this.npaTemplateParser.parseNpaDocument(
        file.buffer,
        file.originalname,
        documentType
      );

      let importResult = null;

      // Auto-import components if requested and document is valid
      if (autoImport && parsedDocument.isValid && parsedDocument.extractedData) {
        importResult = await this.npaTemplateParser.importNpaComponents(
          parsedDocument.extractedData,
          importBy,
          replaceExisting
        );
      }

      return {
        success: parsedDocument.isValid,
        data: {
          documentId: parsedDocument.documentId,
          documentType: parsedDocument.documentType,
          title: parsedDocument.title,
          issueDate: parsedDocument.issueDate,
          effectiveDate: parsedDocument.effectiveDate,
          isValid: parsedDocument.isValid,
          validationErrors: parsedDocument.validationErrors,
          extractedComponents: parsedDocument.extractedData?.components?.length || 0,
          importResult: importResult ? {
            imported: importResult.imported,
            updated: importResult.updated,
            skipped: importResult.skipped,
            errors: importResult.errors
          } : null,
          processedAt: new Date()
        },
        message: parsedDocument.isValid ? 
          'NPA template processed successfully' : 
          'NPA template processed with validation errors',
        errors: parsedDocument.validationErrors
      };

    } catch (error) {
      this.logger.error(`Failed to process NPA template upload:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get pricing window summary with analytics
   */
  @Get('windows/:windowId/summary')
  @ApiOperation({ summary: 'Get pricing window summary and analytics' })
  @ApiParam({ name: 'windowId', description: 'Pricing window ID' })
  @ApiResponse({ status: 200, description: 'Window summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pricing window not found' })
  async getWindowSummary(
    @Param('windowId') windowId: string
  ) {
    this.logger.log(`Retrieving summary for pricing window: ${windowId}`);

    try {
      const windowSummary = await this.pricingWindowService.getWindowSummary(windowId);
      const claimsSummary = await this.uppfClaimsService.getClaimsSummary(windowId);

      return {
        success: true,
        data: {
          window: windowSummary,
          uppfClaims: claimsSummary,
          retrievedAt: new Date()
        },
        message: 'Window summary retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Failed to retrieve window summary for ${windowId}:`, error);
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get current active pricing window
   */
  @Get('windows/current')
  @ApiOperation({ summary: 'Get current active pricing window' })
  @ApiResponse({ status: 200, description: 'Current window retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No active window found' })
  async getCurrentWindow() {
    this.logger.log('Retrieving current active pricing window');

    try {
      const currentWindow = await this.pricingWindowService.getCurrentActiveWindow();

      if (!currentWindow) {
        throw new NotFoundException('No active pricing window found');
      }

      return {
        success: true,
        data: {
          windowId: currentWindow.windowId,
          windowNumber: currentWindow.windowNumber,
          year: currentWindow.year,
          status: currentWindow.status,
          startDate: currentWindow.startDate,
          endDate: currentWindow.endDate,
          submissionDeadline: currentWindow.submissionDeadline,
          publishedAt: currentWindow.publishedAt
        },
        message: 'Current active window retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve current window:', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Compare prices between two windows
   */
  @Get('windows/compare/:currentWindowId/:previousWindowId')
  @ApiOperation({ summary: 'Compare prices between two pricing windows' })
  @ApiParam({ name: 'currentWindowId', description: 'Current pricing window ID' })
  @ApiParam({ name: 'previousWindowId', description: 'Previous pricing window ID' })
  @ApiResponse({ status: 200, description: 'Price comparison completed successfully' })
  async comparePriceWindows(
    @Param('currentWindowId') currentWindowId: string,
    @Param('previousWindowId') previousWindowId: string
  ) {
    this.logger.log(`Comparing prices between windows: ${previousWindowId} -> ${currentWindowId}`);

    try {
      const comparison = await this.priceCalculationService.comparePriceWindows(
        currentWindowId,
        previousWindowId
      );

      return {
        success: true,
        data: {
          currentWindow: comparison.currentWindow,
          previousWindow: comparison.previousWindow,
          productComparisons: comparison.productComparisons,
          summary: {
            totalProducts: comparison.productComparisons.length,
            productsWithIncrease: comparison.productComparisons.filter((p: any) => p.priceDifference > 0).length,
            productsWithDecrease: comparison.productComparisons.filter((p: any) => p.priceDifference < 0).length,
            averagePercentageChange: comparison.productComparisons.reduce(
              (sum: number, p: any) => sum + p.percentageChange, 0
            ) / comparison.productComparisons.length
          },
          comparedAt: new Date()
        },
        message: 'Price comparison completed successfully'
      };

    } catch (error) {
      this.logger.error(`Failed to compare price windows:`, error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get UPPF claims report for a date range
   */
  @Get('uppf/claims/report')
  @ApiOperation({ summary: 'Generate UPPF claims report for date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', enum: ['summary', 'detailed'], required: false })
  @ApiResponse({ status: 200, description: 'UPPF claims report generated successfully' })
  async getUppfClaimsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'summary' | 'detailed' = 'summary'
  ) {
    this.logger.log(`Generating UPPF claims report: ${startDate} to ${endDate} (${format})`);

    try {
      const report = await this.uppfClaimsService.generateClaimsReport(
        new Date(startDate),
        new Date(endDate),
        format
      );

      return {
        success: true,
        data: report,
        message: 'UPPF claims report generated successfully'
      };

    } catch (error) {
      this.logger.error('Failed to generate UPPF claims report:', error);
      throw new BadRequestException(error.message);
    }
  }
}