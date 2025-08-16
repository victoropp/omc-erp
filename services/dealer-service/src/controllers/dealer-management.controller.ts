import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { 
  IsUUID,
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Services
import { DealerSettlementService } from '../services/dealer-settlement.service';
import { DealerLoanManagementService, LoanApplicationDto } from '../services/dealer-loan-management.service';
import { DealerMarginAccrualService, DailyMarginAccrualDto } from '../services/dealer-margin-accrual.service';
import { DealerPerformanceService } from '../services/dealer-performance.service';
import { DealerSettlementStatementService, StatementTemplate } from '../services/dealer-settlement-statement.service';
import { DealerPaymentAutomationService } from '../services/dealer-payment-automation.service';

// Entities
import { DealerSettlementStatus } from '../entities/dealer-settlement.entity';
import { RepaymentFrequency } from '../entities/dealer-loan.entity';
import { AccrualStatus } from '../entities/dealer-margin-accrual.entity';

// DTOs
class CalculateSettlementDto {
  @IsUUID()
  stationId: string;

  @IsString()
  windowId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

class CreateLoanDto {
  @IsUUID()
  dealerId: string;

  @IsUUID()
  stationId: string;

  @IsNumber()
  @Min(1000)
  @Max(1000000)
  principalAmount: number;

  @IsNumber()
  @Min(0.1)
  @Max(50)
  interestRate: number;

  @IsNumber()
  @Min(3)
  @Max(60)
  tenorMonths: number;

  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsString()
  loanPurpose: string;

  @IsOptional()
  collateralDetails?: any;

  @IsOptional()
  guarantorDetails?: any;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  createdBy: string;
}

class ProcessMarginAccrualDto {
  @IsUUID()
  stationId: string;

  @IsUUID()
  dealerId: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  accrualDate: Date;

  @ValidateNested({ each: true })
  @Type(() => TransactionDataDto)
  transactions: TransactionDataDto[];

  @IsString()
  windowId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  processedBy?: string;
}

class TransactionDataDto {
  @IsUUID()
  transactionId: string;

  @IsUUID()
  stationId: string;

  @IsString()
  productType: string;

  @IsNumber()
  @Min(0)
  litresSold: number;

  @IsNumber()
  @Min(0)
  exPumpPrice: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  transactionDate: Date;

  @IsString()
  windowId: string;
}

class GenerateStatementDto {
  @IsUUID()
  settlementId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatementTemplateDto)
  template?: StatementTemplateDto;
}

class StatementTemplateDto {
  @IsEnum(['STANDARD', 'DETAILED', 'SUMMARY'])
  templateType: 'STANDARD' | 'DETAILED' | 'SUMMARY';

  @IsEnum(['PDF', 'HTML', 'EXCEL'])
  format: 'PDF' | 'HTML' | 'EXCEL';

  @IsEnum(['EN', 'FR'])
  language: 'EN' | 'FR';

  @IsBoolean()
  includeCharts: boolean;

  @IsBoolean()
  includeLoanDetails: boolean;

  @IsBoolean()
  includePerformanceMetrics: boolean;

  @IsOptional()
  customFields?: Record<string, any>;
}

class ProcessAutomatedPaymentsDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxBatchSize?: number;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

@Controller('api/dealer-management')
@ApiTags('Dealer Management')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DealerManagementController {
  constructor(
    private readonly settlementService: DealerSettlementService,
    private readonly loanService: DealerLoanManagementService,
    private readonly marginService: DealerMarginAccrualService,
    private readonly performanceService: DealerPerformanceService,
    private readonly statementService: DealerSettlementStatementService,
    private readonly paymentService: DealerPaymentAutomationService,
  ) {}

  // Settlement Management APIs

  @Post('settlements/calculate')
  @ApiOperation({ summary: 'Calculate dealer settlement for a pricing window' })
  @ApiResponse({ status: 201, description: 'Settlement calculation completed successfully' })
  async calculateSettlement(@Body() dto: CalculateSettlementDto) {
    const calculation = await this.settlementService.calculateDealerSettlement(
      dto.stationId,
      dto.windowId,
      dto.tenantId,
      dto.userId,
    );

    const settlement = await this.settlementService.createSettlement(
      calculation,
      dto.tenantId,
      dto.userId,
    );

    return {
      calculation,
      settlement,
      message: 'Settlement calculated and created successfully',
    };
  }

  @Patch('settlements/:settlementId/approve')
  @ApiOperation({ summary: 'Approve a dealer settlement' })
  @ApiParam({ name: 'settlementId', type: 'string',  })
  async approveSettlement(
    @Param('settlementId', ParseUUIDPipe) settlementId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('userId', ParseUUIDPipe) userId?: string,
  ) {
    const settlement = await this.settlementService.approveSettlement(
      settlementId,
      tenantId,
      userId,
    );

    return {
      settlement,
      message: 'Settlement approved successfully',
    };
  }

  @Patch('settlements/:settlementId/process-payment')
  @ApiOperation({ summary: 'Process payment for approved settlement' })
  @ApiParam({ name: 'settlementId', type: 'string',  })
  async processSettlementPayment(
    @Param('settlementId', ParseUUIDPipe) settlementId: string,
    @Body() body: { paymentReference: string; paymentMethod: string; tenantId: string; userId?: string },
  ) {
    const settlement = await this.settlementService.processSettlementPayment(
      settlementId,
      body.paymentReference,
      body.paymentMethod,
      body.tenantId,
      body.userId,
    );

    return {
      settlement,
      message: 'Settlement payment processed successfully',
    };
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Get dealer settlements with filtering options' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'status', enum: DealerSettlementStatus, required: false })
  @ApiQuery({ name: 'fromDate', type: 'string', required: false })
  @ApiQuery({ name: 'toDate', type: 'string', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async getDealerSettlements(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('status') status?: DealerSettlementStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit?: number,
  ) {
    const options: any = {};
    if (status) options.status = status;
    if (fromDate) options.fromDate = new Date(fromDate);
    if (toDate) options.toDate = new Date(toDate);
    if (limit) options.limit = Number(limit);

    const settlements = await this.settlementService.getDealerSettlements(
      stationId,
      tenantId,
      options,
    );

    return {
      settlements,
      count: settlements.length,
    };
  }

  // Loan Management APIs

  @Post('loans')
  @ApiOperation({ summary: 'Create a new dealer loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  async createLoan(@Body() dto: CreateLoanDto) {
    const loanApplication: LoanApplicationDto = {
      dealerId: dto.dealerId,
      stationId: dto.stationId,
      principalAmount: dto.principalAmount,
      interestRate: dto.interestRate,
      tenorMonths: dto.tenorMonths,
      repaymentFrequency: dto.repaymentFrequency,
      startDate: dto.startDate,
      loanPurpose: dto.loanPurpose,
      collateralDetails: dto.collateralDetails,
      guarantorDetails: dto.guarantorDetails,
      tenantId: dto.tenantId,
      createdBy: dto.createdBy,
    };

    const result = await this.loanService.createLoan(loanApplication);

    return {
      loan: result.loan,
      amortizationSchedule: result.amortizationSchedule,
      message: 'Loan created successfully',
    };
  }

  @Patch('loans/:loanId/approve')
  @ApiOperation({ summary: 'Approve a dealer loan' })
  @ApiParam({ name: 'loanId', type: 'string' })
  async approveLoan(
    @Param('loanId') loanId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('userId', ParseUUIDPipe) userId?: string,
  ) {
    const loan = await this.loanService.approveLoan(loanId, tenantId, userId);

    return {
      loan,
      message: 'Loan approved successfully',
    };
  }

  @Get('loans/:loanId/performance')
  @ApiOperation({ summary: 'Get loan performance metrics' })
  @ApiParam({ name: 'loanId', type: 'string' })
  async getLoanPerformance(
    @Param('loanId') loanId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const metrics = await this.loanService.getLoanPerformanceMetrics(loanId, tenantId);

    return {
      metrics,
      message: 'Loan performance metrics retrieved successfully',
    };
  }

  @Get('loans/active')
  @ApiOperation({ summary: 'Get active loans for a station' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'dealerId', type: 'string', required: false })
  async getActiveLoans(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('dealerId', ParseUUIDPipe) dealerId?: string,
  ) {
    const loans = await this.loanService.getActiveLoans(stationId, tenantId, dealerId);

    return {
      loans,
      count: loans.length,
    };
  }

  @Get('loans/monthly-obligation')
  @ApiOperation({ summary: 'Calculate total monthly loan obligations for a station' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  async getMonthlyObligation(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const obligation = await this.loanService.calculateMonthlyObligation(stationId, tenantId);

    return {
      obligation,
      message: 'Monthly loan obligations calculated successfully',
    };
  }

  // Margin Accrual APIs

  @Post('margins/process-daily')
  @ApiOperation({ summary: 'Process daily margin accrual' })
  @ApiResponse({ status: 201, description: 'Daily margin accrual processed successfully' })
  async processDailyMarginAccrual(@Body() dto: ProcessMarginAccrualDto) {
    const dailyAccrualDto: DailyMarginAccrualDto = {
      stationId: dto.stationId,
      dealerId: dto.dealerId,
      accrualDate: dto.accrualDate,
      transactions: dto.transactions,
      windowId: dto.windowId,
      tenantId: dto.tenantId,
      processedBy: dto.processedBy,
    };

    const accruals = await this.marginService.processDailyMarginAccrual(dailyAccrualDto);

    return {
      accruals,
      count: accruals.length,
      message: 'Daily margin accrual processed successfully',
    };
  }

  @Get('margins/daily-summary')
  @ApiOperation({ summary: 'Get daily margin accrual summary' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'accrualDate', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  async getDailyMarginSummary(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('accrualDate') accrualDate: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const summary = await this.marginService.getDailyMarginSummary(
      stationId,
      new Date(accrualDate),
      tenantId,
    );

    return {
      summary,
      message: 'Daily margin summary retrieved successfully',
    };
  }

  @Get('margins/window-summary')
  @ApiOperation({ summary: 'Get window-level margin accrual summary' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'windowId', type: 'string' })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  async getWindowMarginSummary(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('windowId') windowId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const summary = await this.marginService.getWindowMarginSummary(
      stationId,
      windowId,
      tenantId,
    );

    return {
      summary,
      message: 'Window margin summary retrieved successfully',
    };
  }

  @Get('margins/trends')
  @ApiOperation({ summary: 'Get margin accrual trends' })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'periodDays', type: 'number', required: false })
  async getMarginTrends(
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('periodDays') periodDays?: number,
  ) {
    const trends = await this.marginService.getMarginAccrualTrends(
      stationId,
      tenantId,
      periodDays || 30,
    );

    return {
      trends,
      message: 'Margin accrual trends retrieved successfully',
    };
  }

  @Patch('margins/:accrualId/adjust')
  @ApiOperation({ summary: 'Adjust margin accrual amount' })
  @ApiParam({ name: 'accrualId', type: 'string',  })
  async adjustMarginAccrual(
    @Param('accrualId', ParseUUIDPipe) accrualId: string,
    @Body() body: { adjustmentAmount: number; adjustmentReason: string; tenantId: string; userId?: string },
  ) {
    const accrual = await this.marginService.adjustMarginAccrual(
      accrualId,
      body.adjustmentAmount,
      body.adjustmentReason,
      body.tenantId,
      body.userId,
    );

    return {
      accrual,
      message: 'Margin accrual adjusted successfully',
    };
  }

  // Performance & Analytics APIs

  @Get('performance/metrics')
  @ApiOperation({ summary: 'Get comprehensive dealer performance metrics' })
  @ApiQuery({ name: 'dealerId', type: 'string',  })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'evaluationPeriodDays', type: 'number', required: false })
  async getPerformanceMetrics(
    @Query('dealerId', ParseUUIDPipe) dealerId: string,
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('evaluationPeriodDays') evaluationPeriodDays?: number,
  ) {
    const metrics = await this.performanceService.calculatePerformanceMetrics(
      dealerId,
      stationId,
      tenantId,
      evaluationPeriodDays || 90,
    );

    return {
      metrics,
      message: 'Performance metrics calculated successfully',
    };
  }

  @Get('performance/credit-risk')
  @ApiOperation({ summary: 'Generate credit risk model and scoring' })
  @ApiQuery({ name: 'dealerId', type: 'string',  })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  async getCreditRiskModel(
    @Query('dealerId', ParseUUIDPipe) dealerId: string,
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const model = await this.performanceService.generateCreditRiskModel(
      dealerId,
      stationId,
      tenantId,
    );

    return {
      model,
      message: 'Credit risk model generated successfully',
    };
  }

  @Get('performance/trends')
  @ApiOperation({ summary: 'Get performance trends for a dealer' })
  @ApiQuery({ name: 'dealerId', type: 'string',  })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'metricType', enum: ['SALES_VOLUME', 'MARGIN_EARNED', 'PAYMENT_RELIABILITY', 'DEBT_RATIO'] })
  @ApiQuery({ name: 'periodDays', type: 'number', required: false })
  async getPerformanceTrends(
    @Query('dealerId', ParseUUIDPipe) dealerId: string,
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('metricType') metricType: 'SALES_VOLUME' | 'MARGIN_EARNED' | 'PAYMENT_RELIABILITY' | 'DEBT_RATIO',
    @Query('periodDays') periodDays?: number,
  ) {
    const trends = await this.performanceService.getPerformanceTrends(
      dealerId,
      stationId,
      tenantId,
      metricType,
      periodDays || 90,
    );

    return {
      trends,
      message: 'Performance trends retrieved successfully',
    };
  }

  @Get('performance/recommendations')
  @ApiOperation({ summary: 'Generate performance recommendations' })
  @ApiQuery({ name: 'dealerId', type: 'string',  })
  @ApiQuery({ name: 'stationId', type: 'string',  })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  async getPerformanceRecommendations(
    @Query('dealerId', ParseUUIDPipe) dealerId: string,
    @Query('stationId', ParseUUIDPipe) stationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    const recommendations = await this.performanceService.generateRecommendations(
      dealerId,
      stationId,
      tenantId,
    );

    return {
      recommendations,
      message: 'Performance recommendations generated successfully',
    };
  }

  // Statement Generation APIs

  @Post('statements/generate')
  @ApiOperation({ summary: 'Generate dealer settlement statement' })
  @ApiResponse({ status: 201, description: 'Settlement statement generated successfully' })
  async generateStatement(@Body() dto: GenerateStatementDto) {
    const template: StatementTemplate = dto.template || {
      templateType: 'DETAILED',
      format: 'PDF',
      language: 'EN',
      includeCharts: true,
      includeLoanDetails: true,
      includePerformanceMetrics: true,
    };

    const statement = await this.statementService.generateSettlementStatement(
      dto.settlementId,
      dto.tenantId,
      template,
    );

    return {
      statement,
      message: 'Settlement statement generated successfully',
    };
  }

  @Post('statements/generate-batch')
  @ApiOperation({ summary: 'Generate multiple settlement statements' })
  async generateBatchStatements(
    @Body() body: { settlementIds: string[]; tenantId: string; template?: StatementTemplateDto },
  ) {
    const template: StatementTemplate = body.template || {
      templateType: 'STANDARD',
      format: 'PDF',
      language: 'EN',
      includeCharts: false,
      includeLoanDetails: true,
      includePerformanceMetrics: false,
    };

    const result = await this.statementService.generateBatchStatements(
      body.settlementIds,
      body.tenantId,
      template,
    );

    return {
      statements: result.statements,
      errors: result.errors,
      successCount: result.statements.length,
      errorCount: result.errors.length,
      message: 'Batch statement generation completed',
    };
  }

  // Payment Automation APIs

  @Post('payments/process-automated')
  @ApiOperation({ summary: 'Process automated payments for approved settlements' })
  @ApiResponse({ status: 201, description: 'Automated payment processing completed' })
  async processAutomatedPayments(@Body() dto: ProcessAutomatedPaymentsDto) {
    const result = await this.paymentService.processAutomatedPayments(
      dto.tenantId,
      dto.maxBatchSize || 50,
      dto.dryRun || false,
    );

    return {
      ...result,
      message: 'Automated payment processing completed',
    };
  }

  @Post('payments/execute-batch/:batchId')
  @ApiOperation({ summary: 'Execute a payment batch' })
  @ApiParam({ name: 'batchId', type: 'string',  })
  async executePaymentBatch(
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() body: { tenantId: string; userId: string },
  ) {
    const result = await this.paymentService.executePaymentBatch(
      batchId,
      body.tenantId,
      body.userId,
    );

    return {
      ...result,
      message: 'Payment batch execution completed',
    };
  }

  @Post('payments/create-instructions')
  @ApiOperation({ summary: 'Create payment instructions for manual processing' })
  async createPaymentInstructions(
    @Body() body: { 
      settlementIds: string[]; 
      tenantId: string; 
      priority?: 'HIGH' | 'NORMAL' | 'LOW' 
    },
  ) {
    const instructions = await this.paymentService.createPaymentInstructions(
      body.settlementIds,
      body.tenantId,
      body.priority || 'NORMAL',
    );

    return {
      instructions,
      count: instructions.length,
      message: 'Payment instructions created successfully',
    };
  }

  @Get('payments/report')
  @ApiOperation({ summary: 'Generate payment report' })
  @ApiQuery({ name: 'tenantId', type: 'string',  })
  @ApiQuery({ name: 'periodStart', type: 'string',  })
  @ApiQuery({ name: 'periodEnd', type: 'string',  })
  async generatePaymentReport(
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string,
  ) {
    const report = await this.paymentService.generatePaymentReport(
      tenantId,
      new Date(periodStart),
      new Date(periodEnd),
    );

    return {
      report,
      message: 'Payment report generated successfully',
    };
  }

  @Post('payments/retry-failed/:batchId')
  @ApiOperation({ summary: 'Retry failed payments from a batch' })
  @ApiParam({ name: 'batchId', type: 'string',  })
  async retryFailedPayments(
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() body: { tenantId: string; userId: string },
  ) {
    const result = await this.paymentService.retryFailedPayments(
      batchId,
      body.tenantId,
      body.userId,
    );

    return {
      ...result,
      message: 'Failed payment retry completed',
    };
  }

  // Health Check API

  @Get('health')
  @ApiOperation({ summary: 'Health check for dealer management service' })
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'dealer-management',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      features: {
        settlements: 'active',
        loans: 'active',
        margins: 'active',
        performance: 'active',
        statements: 'active',
        payments: 'active',
      },
    };
  }
}