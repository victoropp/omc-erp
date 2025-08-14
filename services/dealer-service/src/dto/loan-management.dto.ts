import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RepaymentFrequency, AmortizationMethod } from '../entities/dealer-loan.entity';

export class LoanCollateralDto {
  @ApiProperty({ description: 'Collateral type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Collateral description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Estimated value (GHS)' })
  @IsNumber()
  @Min(0)
  estimatedValue: number;

  @ApiProperty({ description: 'Location of collateral' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Document references', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentReferences?: string[];
}

export class LoanGuarantorDto {
  @ApiProperty({ description: 'Guarantor full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'National ID number' })
  @IsString()
  nationalId: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Relationship to borrower' })
  @IsString()
  relationship: string;

  @ApiProperty({ description: 'Occupation' })
  @IsString()
  occupation: string;

  @ApiProperty({ description: 'Monthly income (GHS)' })
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({ description: 'Net worth (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netWorth?: number;
}

export class CreateLoanApplicationDto {
  @ApiProperty({ description: 'Station ID' })
  @IsString()
  stationId: string;

  @ApiProperty({ description: 'Dealer ID' })
  @IsString()
  dealerId: string;

  @ApiProperty({ description: 'Requested loan amount (GHS)' })
  @IsNumber()
  @Min(1000)
  @Max(2000000)
  requestedAmount: number;

  @ApiProperty({ description: 'Loan purpose' })
  @IsString()
  purpose: string;

  @ApiProperty({ description: 'Requested tenor in months' })
  @IsNumber()
  @Min(3)
  @Max(60)
  requestedTenorMonths: number;

  @ApiProperty({ description: 'Preferred repayment frequency', enum: RepaymentFrequency })
  @IsEnum(RepaymentFrequency)
  preferredRepaymentFrequency: RepaymentFrequency;

  @ApiProperty({ description: 'Expected monthly revenue (GHS)' })
  @IsNumber()
  @Min(0)
  expectedMonthlyRevenue: number;

  @ApiProperty({ description: 'Current monthly expenses (GHS)' })
  @IsNumber()
  @Min(0)
  currentMonthlyExpenses: number;

  @ApiProperty({ description: 'Other monthly debt obligations (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherDebtObligations?: number;

  @ApiProperty({ description: 'Collateral details', required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LoanCollateralDto)
  @IsArray()
  collateral?: LoanCollateralDto[];

  @ApiProperty({ description: 'Guarantor information', required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LoanGuarantorDto)
  @IsArray()
  guarantors?: LoanGuarantorDto[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LoanTermsDto {
  @ApiProperty({ description: 'Approved loan amount (GHS)' })
  @IsNumber()
  @Min(0)
  approvedAmount: number;

  @ApiProperty({ description: 'Interest rate (annual percentage)' })
  @IsNumber()
  @Min(0)
  @Max(50)
  interestRate: number;

  @ApiProperty({ description: 'Loan tenor in months' })
  @IsNumber()
  @Min(1)
  @Max(60)
  tenorMonths: number;

  @ApiProperty({ description: 'Repayment frequency', enum: RepaymentFrequency })
  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ description: 'Amortization method', enum: AmortizationMethod })
  @IsEnum(AmortizationMethod)
  amortizationMethod: AmortizationMethod;

  @ApiProperty({ description: 'Monthly installment amount (GHS)' })
  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @ApiProperty({ description: 'Processing fee (GHS)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  processingFee?: number;

  @ApiProperty({ description: 'Late payment penalty rate (%)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  penaltyRate?: number;

  @ApiProperty({ description: 'Grace period days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  gracePeriodDays?: number;
}

export class ApproveLoanDto {
  @ApiProperty({ description: 'Loan terms' })
  @ValidateNested()
  @Type(() => LoanTermsDto)
  loanTerms: LoanTermsDto;

  @ApiProperty({ description: 'Approval notes' })
  @IsString()
  approvalNotes: string;

  @ApiProperty({ description: 'Conditions for disbursement', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
}

export class DisburseLoanDto {
  @ApiProperty({ description: 'Disbursement amount (GHS)' })
  @IsNumber()
  @Min(0)
  disbursementAmount: number;

  @ApiProperty({ description: 'Disbursement method' })
  @IsString()
  disbursementMethod: string;

  @ApiProperty({ description: 'Bank account details for transfer', required: false })
  @IsOptional()
  bankAccountDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };

  @ApiProperty({ description: 'Expected disbursement date' })
  @IsDateString()
  expectedDisbursementDate: string;

  @ApiProperty({ description: 'Disbursement notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LoanPaymentDto {
  @ApiProperty({ description: 'Payment amount (GHS)' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment method' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Transaction reference' })
  @IsString()
  transactionReference: string;

  @ApiProperty({ description: 'Payment date' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ description: 'Payment notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LoanRestructureDto {
  @ApiProperty({ description: 'New tenor in months' })
  @IsNumber()
  @Min(1)
  @Max(60)
  newTenorMonths: number;

  @ApiProperty({ description: 'New interest rate (%)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  newInterestRate?: number;

  @ApiProperty({ description: 'New repayment frequency', required: false })
  @IsOptional()
  @IsEnum(RepaymentFrequency)
  newRepaymentFrequency?: RepaymentFrequency;

  @ApiProperty({ description: 'Moratorium period (months)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(12)
  moratoriumMonths?: number;

  @ApiProperty({ description: 'Reason for restructuring' })
  @IsString()
  restructureReason: string;

  @ApiProperty({ description: 'Additional terms and conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalTerms?: string[];
}

export class AmortizationScheduleEntryDto {
  @ApiProperty({ description: 'Installment number' })
  installmentNumber: number;

  @ApiProperty({ description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ description: 'Principal amount' })
  principalAmount: number;

  @ApiProperty({ description: 'Interest amount' })
  interestAmount: number;

  @ApiProperty({ description: 'Total installment amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Outstanding balance after payment' })
  outstandingBalance: number;

  @ApiProperty({ description: 'Payment status' })
  paymentStatus: string;

  @ApiProperty({ description: 'Actual payment date', required: false })
  actualPaymentDate?: Date;
}

export class LoanResponseDto {
  @ApiProperty({ description: 'Loan ID' })
  id: string;

  @ApiProperty({ description: 'Loan reference number' })
  loanId: string;

  @ApiProperty({ description: 'Station ID' })
  stationId: string;

  @ApiProperty({ description: 'Dealer ID' })
  dealerId: string;

  @ApiProperty({ description: 'Principal amount' })
  principalAmount: number;

  @ApiProperty({ description: 'Interest rate' })
  interestRate: number;

  @ApiProperty({ description: 'Tenor in months' })
  tenorMonths: number;

  @ApiProperty({ description: 'Repayment frequency' })
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Outstanding balance' })
  outstandingBalance: number;

  @ApiProperty({ description: 'Total paid' })
  totalPaid: number;

  @ApiProperty({ description: 'Next payment date' })
  nextPaymentDate: Date;

  @ApiProperty({ description: 'Installment amount' })
  installmentAmount: number;

  @ApiProperty({ description: 'Days past due' })
  daysPastDue: number;

  @ApiProperty({ description: 'Amortization schedule', type: [AmortizationScheduleEntryDto] })
  amortizationSchedule: AmortizationScheduleEntryDto[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}