import { PartialType } from '@nestjs/swagger';
import { CreateStationDto } from './create-station.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StationStatus } from '../../../../../packages/shared-types/src/enums';

export class UpdateStationDto extends PartialType(CreateStationDto) {
  @ApiProperty({ enum: StationStatus, required: false })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;
}