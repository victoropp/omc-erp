import { 
  IsString, 
  IsEmail, 
  IsPhoneNumber, 
  IsOptional, 
  IsObject, 
  IsBoolean,
  IsNumber,
  Min,
  Max,
  ValidateNested 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({ example: 5.6037, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -0.1870, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: 'Accra, Greater Accra Region', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'AMA123', required: false })
  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateStationDto {
  @ApiProperty({ example: 'Shell Adabraka Station' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'SHELL_ADA_001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Adabraka Road, Accra' })
  @IsString()
  address: string;

  @ApiProperty({ example: '+233244123456' })
  @IsPhoneNumber('GH')
  phone: string;

  @ApiProperty({ example: 'manager@shelladabraka.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiProperty({ example: '+233244654321', required: false })
  @IsOptional()
  @IsPhoneNumber('GH')
  managerPhone?: string;

  @ApiProperty({ example: 'manager@email.com', required: false })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @ApiProperty({ example: '06:00', required: false })
  @IsOptional()
  @IsString()
  operatingHoursStart?: string;

  @ApiProperty({ example: '22:00', required: false })
  @IsOptional()
  @IsString()
  operatingHoursEnd?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    example: { 
      hasCarWash: true, 
      hasShop: true, 
      hasMaintenance: false,
      totalPumps: 6,
      hasATM: true 
    }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  facilities?: Record<string, any>;
}