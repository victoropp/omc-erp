import { IsEnum, IsString, IsOptional, IsUUID, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../entities/delivery-documents.entity';

export class CreateDeliveryDocumentDto {
  @ApiProperty({ description: 'Delivery ID' })
  @IsUUID()
  deliveryId: string;

  @ApiProperty({ enum: DocumentType, description: 'Document type' })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ description: 'Document name' })
  @IsString()
  documentName: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'File URL' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSizeBytes?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Is required document' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @IsUUID()
  uploadedBy: string;
}

export class VerifyDocumentDto {
  @ApiProperty({ description: 'Verified by user ID' })
  @IsUUID()
  verifiedBy: string;

  @ApiPropertyOptional({ description: 'Verification comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}