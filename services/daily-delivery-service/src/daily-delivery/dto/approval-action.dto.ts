import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalAction } from '../entities/delivery-approval-history.entity';

export class SubmitForApprovalDto {
  @ApiProperty({ description: 'Comments for approval submission' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'User ID submitting for approval' })
  @IsUUID()
  submittedBy: string;
}

export class ProcessApprovalDto {
  @ApiProperty({ enum: ApprovalAction, description: 'Approval action' })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'User ID processing the approval' })
  @IsUUID()
  approvedBy: string;

  @ApiPropertyOptional({ description: 'Decision deadline' })
  @IsOptional()
  @IsDateString()
  decisionDeadline?: string;
}