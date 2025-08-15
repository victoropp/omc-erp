import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate, IsUUID, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ComponentType, ValueType } from '../entities/price-build-up-component.entity';
import { ProductGrade, StationType } from '../entities/daily-delivery.entity';

export class CreatePriceBuildUpComponentDto {
  @IsString()
  @Length(1, 50)
  componentCode: string;

  @IsString()
  @Length(1, 200)
  componentName: string;

  @IsEnum(ComponentType)
  componentType: ComponentType;

  @IsEnum(ProductGrade)
  productGrade: ProductGrade;

  @IsEnum(StationType)
  stationType: StationType;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  componentValue: number;

  @IsEnum(ValueType)
  valueType: ValueType;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  regulatoryReference?: string;

  @IsUUID()
  createdBy: string;
}

export class UpdatePriceBuildUpComponentDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  componentName?: string;

  @IsOptional()
  @IsEnum(ComponentType)
  componentType?: ComponentType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  componentValue?: number;

  @IsOptional()
  @IsEnum(ValueType)
  valueType?: ValueType;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  regulatoryReference?: string;

  @IsUUID()
  updatedBy: string;
}

export class QueryPriceBuildUpComponentDto {
  @IsOptional()
  @IsEnum(ProductGrade)
  productGrade?: ProductGrade;

  @IsOptional()
  @IsEnum(StationType)
  stationType?: StationType;

  @IsOptional()
  @IsEnum(ComponentType)
  componentType?: ComponentType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

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
  sortBy?: string = 'displayOrder';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class PriceBuildUpComponentResponseDto {
  id: string;
  componentCode: string;
  componentName: string;
  componentType: ComponentType;
  productGrade: ProductGrade;
  stationType: StationType;
  effectiveDate: Date;
  expiryDate?: Date;
  componentValue: number;
  valueType: ValueType;
  calculationFormula?: string;
  currencyCode: string;
  isActive: boolean;
  isMandatory: boolean;
  displayOrder: number;
  description?: string;
  regulatoryReference?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}