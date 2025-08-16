import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/register',
      registerDto,
      headers,
    );
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/login',
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
      '/refresh',
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
      '/logout',
      {},
      headers,
    );
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/forgot-password',
      forgotPasswordDto,
      headers,
    );
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: any, @Headers() headers: any) {
    return this.proxyService.forwardRequest(
      'auth',
      'POST',
      '/reset-password',
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
      '/profile',
      null,
      headers,
    );
  }
}