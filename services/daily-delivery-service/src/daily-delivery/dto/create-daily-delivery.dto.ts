import { 
  IsString, 
  IsUUID, 
  IsDate, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  ValidateNested, 
  Min, 
  Max, 
  Length,
  IsDateString,
  IsPositive
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryType, ProductGrade, StationType, RevenueRecognitionType } from '../entities/daily-delivery.entity';

export class CreateDeliveryLineItemDto {
  @ApiProperty({ description: 'Line number' })
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ description: 'Product code' })
  @IsString()
  @Length(1, 50)
  productCode: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @Length(1, 255)
  productName: string;

  @ApiProperty({ enum: ProductGrade, description: 'Product grade' })
  @IsEnum(ProductGrade)
  productGrade: ProductGrade;

  @ApiProperty({ description: 'Quantity in litres' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Tank number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  tankNumber?: string;

  @ApiPropertyOptional({ description: 'Compartment number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  compartmentNumber?: string;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Quality specifications (JSON)' })
  @IsOptional()
  @IsString()
  qualitySpecifications?: string;

  // Price Component Breakdown
  @ApiPropertyOptional({ description: 'Base unit price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  baseUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Total taxes for this line' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalTaxes?: number;

  @ApiPropertyOptional({ description: 'Total levies for this line' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalLevies?: number;

  @ApiPropertyOptional({ description: 'Total margins for this line' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalMargins?: number;

  @ApiPropertyOptional({ description: 'Price components breakdown (JSON)' })
  @IsOptional()
  @IsString()
  priceComponents?: string;

  @ApiPropertyOptional({ description: 'Cost center code' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  costCenterCode?: string;

  @ApiPropertyOptional({ description: 'Profit center code' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  profitCenterCode?: string;

  @ApiPropertyOptional({ description: 'GL account code' })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  glAccountCode?: string;
}

export class CreateDailyDeliveryDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Delivery date', example: '2024-01-15' })
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'Depot ID' })
  @IsUUID()
  depotId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @Length(1, 255)
  customerName: string;

  @ApiProperty({ description: 'Delivery location' })
  @IsString()
  @Length(1, 1000)
  deliveryLocation: string;

  @ApiPropertyOptional({ enum: StationType, description: 'Station type' })
  @IsOptional()
  @IsEnum(StationType)
  stationType?: StationType;

  @ApiPropertyOptional({ enum: RevenueRecognitionType, description: 'Revenue recognition type', default: RevenueRecognitionType.IMMEDIATE })
  @IsOptional()
  @IsEnum(RevenueRecognitionType)
  revenueRecognitionType?: RevenueRecognitionType;

  @ApiProperty({ description: 'PSA number' })
  @IsString()
  @Length(1, 50)
  psaNumber: string;

  @ApiProperty({ description: 'Waybill number' })
  @IsString()
  @Length(1, 50)
  waybillNumber: string;

  @ApiPropertyOptional({ description: 'Invoice number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  invoiceNumber?: string;

  @ApiProperty({ description: 'Vehicle registration number' })
  @IsString()
  @Length(1, 20)
  vehicleRegistrationNumber: string;

  @ApiPropertyOptional({ description: 'Transporter ID' })
  @IsOptional()
  @IsUUID()
  transporterId?: string;

  @ApiProperty({ description: 'Transporter name' })
  @IsString()
  @Length(1, 255)
  transporterName: string;

  @ApiProperty({ enum: ProductGrade, description: 'Product type' })
  @IsEnum(ProductGrade)
  productType: ProductGrade;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  @Length(1, 255)
  productDescription: string;

  @ApiProperty({ description: 'Quantity in litres' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  quantityLitres: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'GHS' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({ enum: DeliveryType, description: 'Delivery type' })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional({ description: 'Loading terminal' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  loadingTerminal?: string;

  @ApiPropertyOptional({ description: 'Discharge terminal' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  dischargeTerminal?: string;

  @ApiPropertyOptional({ description: 'Planned delivery time' })
  @IsOptional()
  @IsDateString()
  plannedDeliveryTime?: string;

  @ApiPropertyOptional({ description: 'Loading start time' })
  @IsOptional()
  @IsDateString()
  loadingStartTime?: string;

  @ApiPropertyOptional({ description: 'Loading end time' })
  @IsOptional()
  @IsDateString()
  loadingEndTime?: string;

  @ApiPropertyOptional({ description: 'Discharge start time' })
  @IsOptional()
  @IsDateString()
  dischargeStartTime?: string;

  @ApiPropertyOptional({ description: 'Discharge end time' })
  @IsOptional()
  @IsDateString()
  dischargeEndTime?: string;

  // Quality Control
  @ApiPropertyOptional({ description: 'Temperature at loading (Celsius)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-50)
  @Max(100)
  temperatureAtLoading?: number;

  @ApiPropertyOptional({ description: 'Temperature at discharge (Celsius)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-50)
  @Max(100)
  temperatureAtDischarge?: number;

  @ApiPropertyOptional({ description: 'Density at loading (g/cm³)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.5)
  @Max(1.5)
  densityAtLoading?: number;

  @ApiPropertyOptional({ description: 'Density at discharge (g/cm³)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.5)
  @Max(1.5)
  densityAtDischarge?: number;

  // Tank Information
  @ApiPropertyOptional({ description: 'Source tank number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  sourceTankNumber?: string;

  @ApiPropertyOptional({ description: 'Destination tank number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  destinationTankNumber?: string;

  @ApiPropertyOptional({ description: 'Compartment numbers (JSON array)' })
  @IsOptional()
  @IsString()
  compartmentNumbers?: string;

  @ApiPropertyOptional({ description: 'Seal numbers (JSON array)' })
  @IsOptional()
  @IsString()
  sealNumbers?: string;

  // Driver Information
  @ApiPropertyOptional({ description: 'Driver ID' })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Driver name' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  driverName?: string;

  @ApiPropertyOptional({ description: 'Driver license number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  driverLicenseNumber?: string;

  @ApiPropertyOptional({ description: 'Driver phone' })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  driverPhone?: string;

  // Ghana Compliance
  @ApiPropertyOptional({ description: 'NPA permit number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  npaPermitNumber?: string;

  @ApiPropertyOptional({ description: 'Customs entry number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  customsEntryNumber?: string;

  @ApiPropertyOptional({ description: 'Customs duty paid' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  customsDutyPaid?: number;

  @ApiPropertyOptional({ description: 'Petroleum tax amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  petroleumTaxAmount?: number;

  @ApiPropertyOptional({ description: 'Energy fund levy' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  energyFundLevy?: number;

  @ApiPropertyOptional({ description: 'Road fund levy' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  roadFundLevy?: number;

  @ApiPropertyOptional({ description: 'Price stabilization levy' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceStabilizationLevy?: number;

  @ApiPropertyOptional({ description: 'Primary distribution margin' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  primaryDistributionMargin?: number;

  @ApiPropertyOptional({ description: 'Marketing margin' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marketingMargin?: number;

  @ApiPropertyOptional({ description: 'Dealer margin' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealerMargin?: number;

  @ApiPropertyOptional({ description: 'UPPF levy' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unifiedPetroleumPriceFundLevy?: number;

  // Price Build-up Integration
  @ApiPropertyOptional({ description: 'Price build-up snapshot (JSON)' })
  @IsOptional()
  @IsString()
  priceBuilUpSnapshot?: string;

  @ApiPropertyOptional({ description: 'Dealer margin snapshot' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dealerMarginSnapshot?: number;

  @ApiPropertyOptional({ description: 'UPPF levy snapshot' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  uppfLevySnapshot?: number;

  @ApiPropertyOptional({ description: 'Pricing window ID' })
  @IsOptional()
  @IsUUID()
  pricingWindowId?: string;

  // GPS and Tracking
  @ApiPropertyOptional({ description: 'GPS tracking enabled' })
  @IsOptional()
  @IsBoolean()
  gpsTrackingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Security escort required' })
  @IsOptional()
  @IsBoolean()
  securityEscortRequired?: boolean;

  @ApiPropertyOptional({ description: 'Security escort details' })
  @IsOptional()
  @IsString()
  securityEscortDetails?: string;

  // Insurance
  @ApiPropertyOptional({ description: 'Insurance policy number' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  insurancePolicyNumber?: string;

  @ApiPropertyOptional({ description: 'Insurance coverage amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  insuranceCoverageAmount?: number;

  @ApiPropertyOptional({ description: 'Risk assessment score (1-10)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  riskAssessmentScore?: number;

  // Environmental
  @ApiPropertyOptional({ description: 'Environmental permit number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  environmentalPermitNumber?: string;

  @ApiPropertyOptional({ description: 'Emission certificate number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  emissionCertificateNumber?: string;

  // Additional Information
  @ApiPropertyOptional({ description: 'Delivery instructions' })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @ApiPropertyOptional({ description: 'Special handling requirements' })
  @IsOptional()
  @IsString()
  specialHandlingRequirements?: string;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  // Line Items
  @ApiPropertyOptional({ description: 'Delivery line items', type: [CreateDeliveryLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryLineItemDto)
  lineItems?: CreateDeliveryLineItemDto[];

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdBy: string;
}