import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OAuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

export class OAuthAuthorizationDto {
  @ApiProperty({ description: 'OAuth provider', enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @ApiProperty({ description: 'Redirect URI after authentication' })
  @IsUrl()
  redirectUri: string;

  @ApiProperty({ description: 'OAuth scopes requested', required: false })
  @IsOptional()
  @IsString()
  scopes?: string;

  @ApiProperty({ description: 'State parameter for CSRF protection', required: false })
  @IsOptional()
  @IsString()
  state?: string;
}

export class OAuthCallbackDto {
  @ApiProperty({ description: 'Authorization code from OAuth provider' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'OAuth provider', enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @ApiProperty({ description: 'State parameter for CSRF protection', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Redirect URI used in authorization', required: false })
  @IsOptional()
  @IsUrl()
  redirectUri?: string;
}

export class LinkOAuthAccountDto {
  @ApiProperty({ description: 'OAuth provider', enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @ApiProperty({ description: 'Authorization code from OAuth provider' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Current user password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}

export class UnlinkOAuthAccountDto {
  @ApiProperty({ description: 'OAuth provider to unlink', enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @ApiProperty({ description: 'Current user password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}