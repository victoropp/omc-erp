import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupMfaDto {
  @ApiProperty({ description: 'Current user password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}

export class VerifyMfaSetupDto {
  @ApiProperty({ description: 'TOTP token from authenticator app' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class DisableMfaDto {
  @ApiProperty({ description: 'Current user password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'TOTP token or backup code' })
  @IsString()
  @IsNotEmpty()
  mfaToken: string;
}

export class VerifyMfaDto {
  @ApiProperty({ description: 'TOTP token or backup code' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Temporary MFA session token' })
  @IsString()
  @IsNotEmpty()
  mfaSessionToken: string;

  @ApiProperty({ description: 'Remember this device for 30 days', required: false })
  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

export class GenerateBackupCodesDto {
  @ApiProperty({ description: 'Current user password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'TOTP token for verification' })
  @IsString()
  @IsNotEmpty()
  mfaToken: string;
}