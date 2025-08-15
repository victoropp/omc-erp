import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsUUID, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { TaxType, PaymentStatus } from '../entities/tax-accrual.entity';

export class CreateTaxAccrualDto {
  @IsUUID()
  deliveryId: string;

  @IsEnum(TaxType)
  taxType: TaxType;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxableAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount: number;

  @IsString()
  @Length(1, 20)
  taxAccountCode: string;

  @IsString()
  @Length(1, 20)
  liabilityAccountCode: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  taxAuthority?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseTaxAmount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  createdBy: string;
}

export class UpdateTaxAccrualDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxableAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  taxAccountCode?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  liabilityAccountCode?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  taxAuthority?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  paymentReference?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseTaxAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  updatedBy: string;
}

export class MarkTaxAccrualPaidDto {
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @IsString()
  @Length(1, 100)
  paymentReference: string;

  @IsUUID()
  updatedBy: string;
}

export class QueryTaxAccrualDto {
  @IsOptional()
  @IsUUID()
  deliveryId?: string;

  @IsOptional()
  @IsEnum(TaxType)
  taxType?: TaxType;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  taxAuthority?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDateTo?: Date;

  @IsOptional()
  @IsBoolean()
  overdue?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'dueDate';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class TaxAccrualResponseDto {
  id: string;
  deliveryId: string;
  taxType: TaxType;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  taxAccountCode: string;
  liabilityAccountCode: string;
  taxAuthority?: string;
  dueDate?: Date;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  paymentReference?: string;
  currencyCode: string;
  exchangeRate: number;
  baseTaxAmount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  
  // Computed properties
  isOverdue?: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  effectiveTaxRate?: number;
}

export class TaxAccrualSummaryDto {
  totalAccruals: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  byTaxType: Array<{
    taxType: TaxType;
    count: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
  }>;
  byAuthority: Array<{
    authority: string;
    count: number;
    totalAmount: number;
    pendingAmount: number;
  }>;
}