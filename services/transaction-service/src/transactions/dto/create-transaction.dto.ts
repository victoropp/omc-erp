import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FuelType, PaymentMethod } from '@omc-erp/shared-types';

export class CreateTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  stationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  pumpId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002', required: false })
  @IsOptional()
  @IsUUID()
  attendantId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174004', required: false })
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @ApiProperty({ enum: FuelType, example: FuelType.PMS })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ example: 50.5, description: 'Quantity in liters' })
  @IsNumber()
  @IsPositive()
  @Min(0.001)
  @Max(50000)
  quantity: number;

  @ApiProperty({ example: 15.75, description: 'Unit price per liter' })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  unitPrice: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  paymentDetails?: {
    provider?: string;
    phoneNumber?: string;
    cardNumber?: string;
    voucherCode?: string;
  };

  @ApiProperty({ example: 'POS123456', required: false })
  @IsOptional()
  posReference?: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  autoProcessPayment?: boolean;
}