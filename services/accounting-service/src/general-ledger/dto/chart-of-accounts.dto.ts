import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  AccountType, 
  AccountCategory, 
  NormalBalance 
} from '../entities/chart-of-account.entity';

export class CreateChartOfAccountDto {
  @ApiProperty({ 
    description: 'Unique account code',
    example: '1100',
    maxLength: 20 
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  accountCode: string;

  @ApiPropertyOptional({ 
    description: 'Parent account code for hierarchical structure',
    example: '1000' 
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  parentAccountCode?: string;

  @ApiProperty({ 
    description: 'Account name',
    example: 'Cash and Cash Equivalents',
    maxLength: 200 
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  accountName: string;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.ASSET
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional({
    description: 'Account category',
    enum: AccountCategory,
    example: AccountCategory.CURRENT_ASSET
  })
  @IsOptional()
  @IsEnum(AccountCategory)
  accountCategory?: AccountCategory;

  @ApiProperty({
    description: 'Normal balance side',
    enum: NormalBalance,
    example: NormalBalance.DEBIT
  })
  @IsEnum(NormalBalance)
  normalBalance: NormalBalance;

  @ApiPropertyOptional({ 
    description: 'Is this a control account?',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isControlAccount?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Is this a bank account?',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isBankAccount?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Can this account be reconciled?',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isReconcilable?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Currency code',
    default: 'GHS',
    maxLength: 3 
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string = 'GHS';

  @ApiPropertyOptional({ 
    description: 'Opening balance',
    default: 0 
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  openingBalance?: number = 0;

  @ApiPropertyOptional({ 
    description: 'Account description',
    maxLength: 1000 
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Is account active?',
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;
}

export class UpdateChartOfAccountDto {
  @ApiPropertyOptional({ 
    description: 'Parent account code for hierarchical structure' 
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  parentAccountCode?: string;

  @ApiPropertyOptional({ 
    description: 'Account name',
    maxLength: 200 
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Account category',
    enum: AccountCategory
  })
  @IsOptional()
  @IsEnum(AccountCategory)
  accountCategory?: AccountCategory;

  @ApiPropertyOptional({ description: 'Is this a control account?' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isControlAccount?: boolean;

  @ApiPropertyOptional({ description: 'Is this a bank account?' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isBankAccount?: boolean;

  @ApiPropertyOptional({ description: 'Can this account be reconciled?' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isReconcilable?: boolean;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Account description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Is account active?' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class ChartOfAccountsQueryDto {
  @ApiPropertyOptional({ description: 'Account code search' })
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional({ description: 'Account name search' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ 
    description: 'Account type filter',
    enum: AccountType 
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional({ 
    description: 'Account category filter',
    enum: AccountCategory 
  })
  @IsOptional()
  @IsEnum(AccountCategory)
  accountCategory?: AccountCategory;

  @ApiPropertyOptional({ description: 'Parent account code filter' })
  @IsOptional()
  @IsString()
  parentAccountCode?: string;

  @ApiPropertyOptional({ description: 'Only active accounts', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Include control accounts only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  controlAccountsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Include bank accounts only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  bankAccountsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Include reconcilable accounts only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  reconcilableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Currency code filter' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Include hierarchy', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHierarchy?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Sort field', default: 'accountCode' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'accountCode';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class AccountBalanceQueryDto {
  @ApiPropertyOptional({ description: 'Specific date for balance (defaults to current date)' })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  asOfDate?: Date;

  @ApiPropertyOptional({ description: 'Include child accounts in balance', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeChildren?: boolean = true;

  @ApiPropertyOptional({ description: 'Base currency for conversion', default: 'GHS' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  baseCurrency?: string = 'GHS';
}