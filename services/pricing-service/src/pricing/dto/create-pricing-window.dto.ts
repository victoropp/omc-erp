import { IsString, IsDateString, IsOptional, IsUUID, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingWindowDto {
  @ApiProperty({ example: '2025W15', description: 'Pricing window ID in YYYYWXX format' })
  @IsString()
  @Length(6, 20)
  @Matches(/^\d{4}W\d{2}$/, { message: 'Window ID must be in format YYYYWXX (e.g., 2025W15)' })
  windowId: string;

  @ApiProperty({ example: '2025-04-07', description: 'Window start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-04-20', description: 'Window end date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false, description: 'UUID of NPA guideline document' })
  @IsOptional()
  @IsUUID()
  npaGuidelineDocId?: string;

  @ApiProperty({ required: false, description: 'Additional notes for this pricing window' })
  @IsOptional()
  @IsString()
  notes?: string;
}