import {
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JournalType } from '../entities/journal-entry.entity';

export class CreateJournalEntryLineDto {
  @ApiProperty({ description: 'Account code for the journal line' })
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiPropertyOptional({ description: 'Description for this line' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Debit amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  debitAmount: number;

  @ApiProperty({ description: 'Credit amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  creditAmount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'GHS' })
  @IsOptional()
  @IsString()
  currencyCode?: string = 'GHS';

  @ApiPropertyOptional({ description: 'Exchange rate', default: 1 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  @Transform(({ value }) => parseFloat(value))
  exchangeRate?: number = 1;

  @ApiPropertyOptional({ description: 'Station ID reference' })
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Customer ID reference' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Supplier ID reference' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Employee ID reference' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Project code reference' })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional({ description: 'Cost center code' })
  @IsOptional()
  @IsString()
  costCenterCode?: string;

  @ApiPropertyOptional({ description: 'Department code' })
  @IsOptional()
  @IsString()
  departmentCode?: string;

  @ApiPropertyOptional({ description: 'Region code' })
  @IsOptional()
  @IsString()
  regionCode?: string;

  @ApiPropertyOptional({ description: 'Product code' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'Tax code' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  taxAmount?: number = 0;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Reference date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  referenceDate?: Date;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;
}

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Journal entry date' })
  @IsDate()
  @Type(() => Date)
  journalDate: Date;

  @ApiPropertyOptional({ description: 'Posting date (defaults to journal date)' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  postingDate?: Date;

  @ApiProperty({
    description: 'Type of journal entry',
    enum: JournalType,
    default: JournalType.GENERAL,
  })
  @IsEnum(JournalType)
  journalType: JournalType = JournalType.GENERAL;

  @ApiPropertyOptional({ description: 'Source module that created this entry' })
  @IsOptional()
  @IsString()
  sourceModule?: string;

  @ApiPropertyOptional({ description: 'Source document type' })
  @IsOptional()
  @IsString()
  sourceDocumentType?: string;

  @ApiPropertyOptional({ description: 'Source document ID' })
  @IsOptional()
  @IsUUID()
  sourceDocumentId?: string;

  @ApiProperty({ description: 'Description of the journal entry' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Journal entry lines',
    type: [CreateJournalEntryLineDto],
    minItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Journal entry must have at least 2 lines' })
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines: CreateJournalEntryLineDto[];

  @ApiPropertyOptional({ description: 'Auto-post after creation' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  autoPost?: boolean = false;

  @ApiPropertyOptional({ description: 'Custom journal number (system generates if not provided)' })
  @IsOptional()
  @IsString()
  journalNumber?: string;
}

export class JournalEntryQueryDto {
  @ApiPropertyOptional({ description: 'Journal number to search' })
  @IsOptional()
  @IsString()
  journalNumber?: string;

  @ApiPropertyOptional({ description: 'Account code filter' })
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional({ description: 'Start date for date range' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for date range' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Journal type filter', 
    enum: JournalType 
  })
  @IsOptional()
  @IsEnum(JournalType)
  journalType?: JournalType;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Source module filter' })
  @IsOptional()
  @IsString()
  sourceModule?: string;

  @ApiPropertyOptional({ description: 'Station ID filter' })
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'journalDate';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}