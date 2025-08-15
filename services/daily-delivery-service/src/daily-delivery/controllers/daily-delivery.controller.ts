import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { DailyDeliveryService } from '../services/daily-delivery.service';
import { CreateDailyDeliveryDto } from '../dto/create-daily-delivery.dto';
import { UpdateDailyDeliveryDto } from '../dto/update-daily-delivery.dto';
import { QueryDailyDeliveryDto } from '../dto/query-daily-delivery.dto';
import { SubmitForApprovalDto, ProcessApprovalDto } from '../dto/approval-action.dto';
import { CreateDeliveryDocumentDto, VerifyDocumentDto } from '../dto/delivery-document.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Daily Deliveries')
@Controller('daily-deliveries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DailyDeliveryController {
  constructor(private readonly dailyDeliveryService: DailyDeliveryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new daily delivery' })
  @ApiResponse({ status: 201, description: 'Delivery created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Duplicate PSA or waybill number' })
  @Roles('delivery_manager', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async create(@Body() createDeliveryDto: CreateDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Ensure tenant ID matches
    createDeliveryDto.tenantId = tenantId;
    
    return this.dailyDeliveryService.create(createDeliveryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deliveries with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of deliveries retrieved successfully' })
  async findAll(@Query() query: QueryDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get delivery statistics' })
  @ApiResponse({ status: 200, description: 'Delivery statistics retrieved' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date for statistics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date for statistics (YYYY-MM-DD)' })
  async getStats(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req = {}
  ) {
    const tenantId = req.headers?.['x-tenant-id'] || req.user?.tenantId;
    return this.dailyDeliveryService.getDeliveryStats(tenantId, fromDate, toDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({ status: 200, description: 'Delivery found' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.dailyDeliveryService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery' })
  @ApiResponse({ status: 200, description: 'Delivery updated successfully' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data or delivery cannot be updated' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('delivery_manager', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryDto: UpdateDailyDeliveryDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id;
    
    updateDeliveryDto.updatedBy = userId;
    
    return this.dailyDeliveryService.update(id, updateDeliveryDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery' })
  @ApiResponse({ status: 204, description: 'Delivery deleted successfully' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiResponse({ status: 400, description: 'Delivery cannot be deleted' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('delivery_manager', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.dailyDeliveryService.delete(id, tenantId);
  }

  @Post(':id/submit-for-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit delivery for approval' })
  @ApiResponse({ status: 200, description: 'Delivery submitted for approval' })
  @ApiResponse({ status: 400, description: 'Delivery cannot be submitted for approval' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('delivery_manager', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitDto: SubmitForApprovalDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id;
    
    submitDto.submittedBy = userId;
    
    return this.dailyDeliveryService.submitForApproval(id, submitDto, tenantId);
  }

  @Post(':id/process-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process delivery approval' })
  @ApiResponse({ status: 200, description: 'Approval processed successfully' })
  @ApiResponse({ status: 400, description: 'Delivery cannot be processed for approval' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('approver', 'operations_manager', 'general_manager', 'admin')
  @UseGuards(RolesGuard)
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() processDto: ProcessApprovalDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id;
    
    processDto.approvedBy = userId;
    
    return this.dailyDeliveryService.processApproval(id, processDto, tenantId);
  }

  @Post(':id/mark-in-transit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark delivery as in transit' })
  @ApiResponse({ status: 200, description: 'Delivery marked as in transit' })
  @ApiResponse({ status: 400, description: 'Delivery cannot be marked as in transit' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('dispatcher', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async markInTransit(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id;
    
    return this.dailyDeliveryService.markInTransit(id, userId, tenantId);
  }

  @Post(':id/mark-delivered')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark delivery as delivered' })
  @ApiResponse({ status: 200, description: 'Delivery marked as delivered' })
  @ApiResponse({ status: 400, description: 'Delivery cannot be marked as delivered' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('driver', 'dispatcher', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async markDelivered(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { actualDeliveryTime?: string },
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    const userId = req.user?.id;
    const actualDeliveryTime = body.actualDeliveryTime ? new Date(body.actualDeliveryTime) : undefined;
    
    return this.dailyDeliveryService.markDelivered(id, userId, tenantId, actualDeliveryTime);
  }

  @Post(':id/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add document to delivery' })
  @ApiResponse({ status: 201, description: 'Document added successfully' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiParam({ name: 'id', description: 'Delivery ID', format: 'uuid' })
  @Roles('delivery_manager', 'operations_manager', 'admin', 'document_manager')
  @UseGuards(RolesGuard)
  async addDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDocumentDto: CreateDeliveryDocumentDto,
    @Request() req
  ) {
    const userId = req.user?.id;
    
    createDocumentDto.deliveryId = id;
    createDocumentDto.uploadedBy = userId;
    
    return this.dailyDeliveryService.addDocument(createDocumentDto);
  }

  @Post('documents/:documentId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify delivery document' })
  @ApiResponse({ status: 200, description: 'Document verified successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'documentId', description: 'Document ID', format: 'uuid' })
  @Roles('approver', 'operations_manager', 'admin', 'document_manager')
  @UseGuards(RolesGuard)
  async verifyDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() verifyDto: VerifyDocumentDto,
    @Request() req
  ) {
    const userId = req.user?.id;
    
    verifyDto.verifiedBy = userId;
    
    return this.dailyDeliveryService.verifyDocument(documentId, verifyDto);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get deliveries by supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deliveries retrieved' })
  @ApiParam({ name: 'supplierId', description: 'Supplier ID', format: 'uuid' })
  async getBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query() query: QueryDailyDeliveryDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.supplierId = supplierId;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get deliveries by customer' })
  @ApiResponse({ status: 200, description: 'Customer deliveries retrieved' })
  @ApiParam({ name: 'customerId', description: 'Customer ID', format: 'uuid' })
  async getByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: QueryDailyDeliveryDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.customerId = customerId;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('depot/:depotId')
  @ApiOperation({ summary: 'Get deliveries by depot' })
  @ApiResponse({ status: 200, description: 'Depot deliveries retrieved' })
  @ApiParam({ name: 'depotId', description: 'Depot ID', format: 'uuid' })
  async getByDepot(
    @Param('depotId', ParseUUIDPipe) depotId: string,
    @Query() query: QueryDailyDeliveryDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.depotId = depotId;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('transporter/:transporterId')
  @ApiOperation({ summary: 'Get deliveries by transporter' })
  @ApiResponse({ status: 200, description: 'Transporter deliveries retrieved' })
  @ApiParam({ name: 'transporterId', description: 'Transporter ID', format: 'uuid' })
  async getByTransporter(
    @Param('transporterId', ParseUUIDPipe) transporterId: string,
    @Query() query: QueryDailyDeliveryDto,
    @Request() req
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.transporterId = transporterId;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get deliveries pending approval' })
  @ApiResponse({ status: 200, description: 'Pending approval deliveries retrieved' })
  @Roles('approver', 'operations_manager', 'general_manager', 'admin')
  @UseGuards(RolesGuard)
  async getPendingApprovals(@Query() query: QueryDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.pendingApprovalsOnly = true;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('ready-for-invoicing')
  @ApiOperation({ summary: 'Get deliveries ready for invoicing' })
  @ApiResponse({ status: 200, description: 'Deliveries ready for invoicing retrieved' })
  @Roles('finance_manager', 'accountant', 'admin')
  @UseGuards(RolesGuard)
  async getReadyForInvoicing(@Query() query: QueryDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.status = 'DELIVERED' as any;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('in-transit')
  @ApiOperation({ summary: 'Get deliveries currently in transit' })
  @ApiResponse({ status: 200, description: 'In-transit deliveries retrieved' })
  @Roles('dispatcher', 'operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async getInTransit(@Query() query: QueryDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.status = 'IN_TRANSIT' as any;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }

  @Get('delayed')
  @ApiOperation({ summary: 'Get delayed deliveries' })
  @ApiResponse({ status: 200, description: 'Delayed deliveries retrieved' })
  @Roles('operations_manager', 'admin')
  @UseGuards(RolesGuard)
  async getDelayed(@Query() query: QueryDailyDeliveryDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    query.delayedOnly = true;
    return this.dailyDeliveryService.findAll(query, tenantId);
  }
}