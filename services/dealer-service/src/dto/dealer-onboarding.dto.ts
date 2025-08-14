import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsBoolean, IsNumber, IsDateString, ValidateNested, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DealerContactInfoDto {
  @ApiProperty({ description: 'Primary phone number' })
  @IsPhoneNumber('GH')
  primaryPhone: string;

  @ApiProperty({ description: 'Secondary phone number', required: false })
  @IsOptional()
  @IsPhoneNumber('GH')
  secondaryPhone?: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'WhatsApp number', required: false })
  @IsOptional()
  @IsPhoneNumber('GH')
  whatsappNumber?: string;
}

export class DealerAddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Region' })
  @IsString()
  region: string;

  @ApiProperty({ description: 'GPS address', required: false })
  @IsOptional()
  @IsString()
  gpsAddress?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Landmark', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;
}

export class DealerBankAccountDto {
  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  accountName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Bank name' })
  @IsString()
  bankName: string;

  @ApiProperty({ description: 'Bank code' })
  @IsString()
  bankCode: string;

  @ApiProperty({ description: 'Branch code', required: false })
  @IsOptional()
  @IsString()
  branchCode?: string;

  @ApiProperty({ description: 'Branch name', required: false })
  @IsOptional()
  @IsString()
  branchName?: string;
}

export class DealerBusinessInfoDto {
  @ApiProperty({ description: 'Business registration number' })
  @IsString()
  registrationNumber: string;

  @ApiProperty({ description: 'TIN number' })
  @IsString()
  tinNumber: string;

  @ApiProperty({ description: 'VAT registration number', required: false })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiProperty({ description: 'Business type' })
  @IsString()
  businessType: string;

  @ApiProperty({ description: 'Date of incorporation' })
  @IsDateString()
  incorporationDate: string;

  @ApiProperty({ description: 'Number of employees', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;
}

export class CreateDealerDto {
  @ApiProperty({ description: 'Station ID where dealer operates' })
  @IsString()
  stationId: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'National ID number' })
  @IsString()
  nationalId: string;

  @ApiProperty({ description: 'Date of birth' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Contact information' })
  @ValidateNested()
  @Type(() => DealerContactInfoDto)
  contactInfo: DealerContactInfoDto;

  @ApiProperty({ description: 'Residential address' })
  @ValidateNested()
  @Type(() => DealerAddressDto)
  address: DealerAddressDto;

  @ApiProperty({ description: 'Bank account details' })
  @ValidateNested()
  @Type(() => DealerBankAccountDto)
  bankAccount: DealerBankAccountDto;

  @ApiProperty({ description: 'Business information', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DealerBusinessInfoDto)
  businessInfo?: DealerBusinessInfoDto;

  @ApiProperty({ description: 'Emergency contact name' })
  @IsString()
  emergencyContactName: string;

  @ApiProperty({ description: 'Emergency contact phone' })
  @IsPhoneNumber('GH')
  emergencyContactPhone: string;

  @ApiProperty({ description: 'Relationship to emergency contact' })
  @IsString()
  emergencyContactRelationship: string;

  @ApiProperty({ description: 'Expected monthly sales volume (litres)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedMonthlySales?: number;

  @ApiProperty({ description: 'Previous fuel retail experience (years)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  previousExperience?: number;

  @ApiProperty({ description: 'Credit limit requested (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requestedCreditLimit?: number;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DealerDocumentDto {
  @ApiProperty({ description: 'Document type' })
  @IsString()
  documentType: string;

  @ApiProperty({ description: 'Document URL' })
  @IsString()
  documentUrl: string;

  @ApiProperty({ description: 'Document description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Expiry date if applicable', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UploadDealerDocumentsDto {
  @ApiProperty({ description: 'Dealer ID' })
  @IsString()
  dealerId: string;

  @ApiProperty({ description: 'List of documents to upload', type: [DealerDocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DealerDocumentDto)
  documents: DealerDocumentDto[];
}

export class DealerCreditAssessmentDto {
  @ApiProperty({ description: 'Credit score', minimum: 300, maximum: 850 })
  @IsNumber()
  @Min(300)
  @Max(850)
  creditScore: number;

  @ApiProperty({ description: 'Recommended credit limit (GHS)' })
  @IsNumber()
  @Min(0)
  recommendedCreditLimit: number;

  @ApiProperty({ description: 'Risk rating' })
  @IsString()
  riskRating: string;

  @ApiProperty({ description: 'Assessment notes' })
  @IsString()
  assessmentNotes: string;

  @ApiProperty({ description: 'Requires guarantor' })
  @IsBoolean()
  requiresGuarantor: boolean;

  @ApiProperty({ description: 'Collateral required (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  collateralRequired?: number;
}

export class ApproveDealerDto {
  @ApiProperty({ description: 'Approval decision' })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ description: 'Approved credit limit (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedCreditLimit?: number;

  @ApiProperty({ description: 'Approval notes' })
  @IsString()
  approvalNotes: string;

  @ApiProperty({ description: 'Conditions or restrictions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
}

export class DealerResponseDto {
  @ApiProperty({ description: 'Dealer ID' })
  id: string;

  @ApiProperty({ description: 'Dealer code' })
  dealerCode: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Station ID' })
  stationId: string;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Contact information' })
  contactInfo: DealerContactInfoDto;

  @ApiProperty({ description: 'Credit limit' })
  creditLimit: number;

  @ApiProperty({ description: 'Outstanding balance' })
  outstandingBalance: number;

  @ApiProperty({ description: 'Last activity date' })
  lastActivityDate: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}