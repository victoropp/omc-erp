import { 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsEnum, 
  IsDateString,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus, DeliveryType, ProductGrade } from '../entities/daily-delivery.entity';

export class QueryDailyDeliveryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search term for delivery number, customer name, etc.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DeliveryStatus, description: 'Filter by delivery status' })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @ApiPropertyOptional({ enum: DeliveryType, description: 'Filter by delivery type' })
  @IsOptional()
  @IsEnum(DeliveryType)
  deliveryType?: DeliveryType;

  @ApiPropertyOptional({ enum: ProductGrade, description: 'Filter by product type' })
  @IsOptional()
  @IsEnum(ProductGrade)
  productType?: ProductGrade;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter by depot ID' })
  @IsOptional()
  @IsUUID()
  depotId?: string;

  @ApiPropertyOptional({ description: 'Filter by transporter ID' })
  @IsOptional()
  @IsUUID()
  transporterId?: string;

  @ApiPropertyOptional({ description: 'Filter from delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Filter from created date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromCreatedDate?: string;

  @ApiPropertyOptional({ description: 'Filter to created date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toCreatedDate?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity in litres' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity in litres' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Minimum total value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum total value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Filter by vehicle registration number' })
  @IsOptional()
  @IsString()
  vehicleRegistrationNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by PSA number' })
  @IsOptional()
  @IsString()
  psaNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by waybill number' })
  @IsOptional()
  @IsString()
  waybillNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by invoice number' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by NPA permit number' })
  @IsOptional()
  @IsString()
  npaPermitNumber?: string;

  @ApiPropertyOptional({ description: 'Show only GPS tracked deliveries' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  gpsTrackedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only delayed deliveries' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  delayedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only invoiced deliveries' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  invoicedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only pending approvals' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  pendingApprovalsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Include line items in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeLineItems?: boolean;

  @ApiPropertyOptional({ description: 'Include approval history in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeApprovalHistory?: boolean;

  @ApiPropertyOptional({ description: 'Include documents in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDocuments?: boolean;
}