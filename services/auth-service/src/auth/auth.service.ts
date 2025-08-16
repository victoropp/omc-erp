import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserStatus } from '@omc-erp/shared-types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string, tenantId?: string): Promise<any> {
    const user = await this.usersService.findByUsername(username, tenantId);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is locked
    if (user.isLocked()) {
      throw new ForbiddenException('Account is locked. Please try again later.');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.usersService.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Account is suspended');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Account is inactive');
    }

    // Reset failed login attempts on successful login
    await this.usersService.resetFailedLoginAttempts(user.id);
    await this.usersService.updateLastLogin(user.id);

    const { passwordHash, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create new user
    const user = await this.usersService.create(registerDto);
    
    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      ...tokens,
    };
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    await this.generatePasswordResetToken(user.id);
    
    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Verify reset token
    const payload = await this.verifyPasswordResetToken(token);
    
    if (!payload) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    await this.usersService.updatePassword(payload.userId, newPassword);
    
    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    await this.usersService.updatePassword(userId, newPassword);
    
    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshToken, ...profile } = user;
    return profile;
  }

  async verifyEmail(_token: string) {
    // TODO: Implement email verification
    return { message: 'Email verified successfully' };
  }

  // Helper methods
  private async getTokens(userId: string, email: string, tenantId: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tenantId,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshToken: hashedRefreshToken });
  }

  private async generatePasswordResetToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );
  }

  private async verifyPasswordResetToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      return null;
    }
  }
}