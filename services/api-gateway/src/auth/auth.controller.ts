import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/register',
      registerDto,
      headers,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/login',
      loginDto,
      headers,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshTokens(@Body() refreshDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/refresh',
      refreshDto,
      headers,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(@Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/logout',
      {},
      headers,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/forgot-password',
      forgotPasswordDto,
      headers,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/api/v1/auth/reset-password',
      resetPasswordDto,
      headers,
    );
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'GET',
      '/api/v1/auth/profile',
      null,
      headers,
    );
  }
}