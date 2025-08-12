import { IsString, IsUUID, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PriceOverrideDto {
  @ApiProperty({ example: 'EXREF', description: 'Component code to override' })
  @IsString()
  componentCode: string;

  @ApiProperty({ example: 8.904, description: 'Override value' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ required: false, description: 'Reason for override' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CalculatePriceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  stationId: string;

  @ApiProperty({ example: 'PMS', description: 'Product code (PMS, AGO, LPG)' })
  @IsString()
  productId: string;

  @ApiProperty({ example: '2025W15' })
  @IsString()
  windowId: string;

  @ApiProperty({ 
    required: false, 
    type: [PriceOverrideDto],
    description: 'Optional component overrides for manual adjustments'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceOverrideDto)
  overrides?: PriceOverrideDto[];

  @ApiProperty({ required: false, description: 'Ex-refinery price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exRefineryPrice?: number;

  @ApiProperty({ required: false, description: 'Justification for manual overrides' })
  @IsOptional()
  @IsString()
  justification?: string;
}