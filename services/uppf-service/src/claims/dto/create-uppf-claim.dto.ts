import { IsString, IsUUID, IsNumber, Min, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GPSPointDto {
  @ApiProperty({ example: 5.6037 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -0.1870 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '2025-01-15T14:30:00Z' })
  @IsString()
  timestamp: string;

  @ApiProperty({ required: false, example: 65.5 })
  @IsOptional()
  @IsNumber()
  speed?: number;
}

export class CreateUPPFClaimDto {
  @ApiProperty({ example: 'DEL-001', description: 'Delivery consignment ID' })
  @IsUUID()
  deliveryId: string;

  @ApiProperty({ example: 'R-ACCRA-BONGO', description: 'Route identifier' })
  @IsString()
  routeId: string;

  @ApiProperty({ example: 713.4, description: 'Actual kilometers traveled' })
  @IsNumber()
  @Min(0)
  kmActual: number;

  @ApiProperty({ example: 36000, description: 'Litres delivered and received' })
  @IsNumber()
  @Min(0.001)
  litresMoved: number;

  @ApiProperty({ example: '2025W15', description: 'Pricing window ID' })
  @IsString()
  windowId: string;

  @ApiProperty({ 
    required: false,
    type: [GPSPointDto],
    description: 'GPS trace points for route verification'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GPSPointDto)
  gpsTrace?: GPSPointDto[];

  @ApiProperty({ required: false, example: 'WB-2025-001', description: 'Waybill reference number' })
  @IsOptional()
  @IsString()
  waybillNumber?: string;

  @ApiProperty({ 
    required: false,
    description: 'Evidence document links (waybill, GRN, weighbridge tickets, etc.)',
    example: ['waybill_001.pdf', 'grn_station_045.pdf', 'weighbridge_ticket.jpg']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceLinks?: string[];

  @ApiProperty({ required: false, description: 'Additional notes for the claim' })
  @IsOptional()
  @IsString()
  notes?: string;
}