import { IsEnum, IsNumber, IsString, IsBoolean, IsOptional, IsDate, IsArray, ValidateNested, Min, Max, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { 
  PriceComponentType, 
  PriceComponentCategory, 
  PriceComponentStatus,
  StationType,
  ProductType 
} from '../entities/price-buildup.entity';

export class CreatePriceComponentDto {
  @IsEnum(PriceComponentType)
  componentType: PriceComponentType;

  @IsString()
  componentName: string;

  @IsEnum(PriceComponentCategory)
  category: PriceComponentCategory;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'GHS';

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean = false;

  @IsOptional()
  @IsEnum(PriceComponentType)
  percentageBase?: PriceComponentType;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsEnum(StationType)
  stationType?: StationType;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isConfigurable?: boolean = true;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number = 0;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  regulatoryReference?: string;

  @IsOptional()
  @IsString()
  externalSource?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;
}

export class UpdatePriceComponentDto {
  @IsOptional()
  @IsString()
  componentName?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

  @IsOptional()
  @IsEnum(PriceComponentType)
  percentageBase?: PriceComponentType;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsEnum(StationType)
  stationType?: StationType;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  isConfigurable?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  regulatoryReference?: string;

  @IsOptional()
  @IsString()
  externalSource?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePriceBuildupVersionDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  changeReason?: string;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceComponentDto)
  components: CreatePriceComponentDto[];
}

export class UpdatePriceBuildupVersionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  changeReason?: string;

  @IsOptional()
  @IsEnum(PriceComponentStatus)
  status?: PriceComponentStatus;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsString()
  approvalNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePriceComponentDto)
  components?: UpdatePriceComponentDto[];
}

export class ApprovePriceBuildupDto {
  @IsString()
  approvedBy: string;

  @IsOptional()
  @IsString()
  approvalNotes?: string;

  @IsOptional()
  @IsBoolean()
  publishImmediately?: boolean = false;
}

export class PublishPriceBuildupDto {
  @IsString()
  publishedBy: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishDate?: Date;
}

export class PriceBuildupQueryDto {
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @IsOptional()
  @IsEnum(PriceComponentStatus)
  status?: PriceComponentStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsBoolean()
  includeComponents?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeStationTypePricing?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class StationTypeConfigurationDto {
  @IsEnum(StationType)
  stationType: StationType;

  @IsString()
  stationTypeName: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsEnum(PriceComponentType, { each: true })
  applicableComponents?: PriceComponentType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ProductType, { each: true })
  supportedProducts?: ProductType[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  baseDealerMargin?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  baseTransportCost?: number;

  @IsOptional()
  @IsString()
  regulatoryCompliance?: string;

  @IsOptional()
  @IsString()
  operatingModel?: string;

  @IsOptional()
  @IsBoolean()
  requiresSpecialPricing?: boolean = false;
}

export class BulkPriceUpdateDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsString()
  changeReason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkComponentUpdateDto)
  componentUpdates: BulkComponentUpdateDto[];

  @IsOptional()
  @IsBoolean()
  createNewVersion?: boolean = true;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean = true;
}

export class BulkComponentUpdateDto {
  @IsEnum(PriceComponentType)
  componentType: PriceComponentType;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  newAmount: number;

  @IsOptional()
  @IsString()
  updateReason?: string;

  @IsOptional()
  @IsEnum(StationType)
  stationType?: StationType;
}

export class ExcelUploadDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsString()
  changeReason: string;

  @IsString()
  uploadedBy: string;

  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean = false;

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean = false;
}

export class PriceCalculationRequestDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsEnum(StationType)
  stationType: StationType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  calculationDate?: Date;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  volume?: number;

  @IsOptional()
  @IsBoolean()
  includeBreakdown?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsEnum(PriceComponentType, { each: true })
  excludeComponents?: PriceComponentType[];
}

export class PriceCalculationResponseDto {
  productType: ProductType;
  stationType: StationType;
  calculationDate: Date;
  totalPrice: number;
  currency: string;
  breakdown: PriceBreakdownDto[];
  metadata: {
    buildupVersionId: string;
    versionNumber: number;
    calculatedAt: Date;
    calculatedBy?: string;
  };
}

export class PriceBreakdownDto {
  componentType: PriceComponentType;
  componentName: string;
  category: PriceComponentCategory;
  amount: number;
  isPercentage: boolean;
  calculationBase?: number;
  displayOrder: number;
  description?: string;
}

export class AuditTrailQueryDto {
  @IsOptional()
  @IsUUID()
  buildupVersionId?: string;

  @IsOptional()
  @IsUUID()
  componentId?: string;

  @IsOptional()
  @IsString()
  actionType?: string;

  @IsOptional()
  @IsString()
  actionBy?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}