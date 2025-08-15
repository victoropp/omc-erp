import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsDateString } from 'class-validator';
import { CreateDailyDeliveryDto } from './create-daily-delivery.dto';

export class UpdateDailyDeliveryDto extends PartialType(CreateDailyDeliveryDto) {
  @ApiPropertyOptional({ description: 'Updated by user ID' })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Actual delivery time' })
  @IsOptional()
  @IsDateString()
  actualDeliveryTime?: string;

  @ApiPropertyOptional({ description: 'Customer feedback' })
  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @ApiPropertyOptional({ description: 'Delivery rating (1-5)' })
  @IsOptional()
  deliveryRating?: number;

  @ApiPropertyOptional({ description: 'Performance obligation satisfied' })
  @IsOptional()
  performanceObligationSatisfied?: boolean;
}