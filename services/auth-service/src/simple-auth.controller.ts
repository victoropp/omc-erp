import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

// Simple DTOs
class LoginDto {
  email: string;
  password: string;
}

class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

// Simple hash function for testing
const hashPassword = (password: string): string => {
  return createHash('sha256').update(password + 'salt').digest('hex');
};

// In-memory user store for testing
const users = [
  {
    id: '1',
    email: 'admin@omc-erp.com',
    password: hashPassword('Admin123!'),
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    isActive: true,
  }
];

@ApiTags('Authentication')
@Controller('auth')
export class SimpleAuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test() {
    return { message: 'Auth service is working!', timestamp: new Date().toISOString() };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = users.find(u => u.email === registerDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = hashPassword(registerDto.password);

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role || 'USER',
      isEmailVerified: false,
      isActive: true,
    };

    users.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    // Find user
    const user = users.find(u => u.email === loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const hashedInputPassword = hashPassword(loginDto.password);
    if (hashedInputPassword !== user.password) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { password, ...userWithoutPassword } = user;
    
    return {
      message: 'Login successful',
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 900, // 15 minutes
      },
    };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    // For simplicity, extract user info from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token);
      const user = users.find(u => u.id === decoded.sub);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async getAllUsers(@Request() req) {
    // For simplicity, extract user info from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token);
      
      if (decoded.role !== 'SUPER_ADMIN') {
        throw new Error('Insufficient privileges');
      }

      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new Error('Invalid token or insufficient privileges');
    }
  }

  @Post('test-protected')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test protected endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  async testProtected(@Request() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = this.jwtService.verify(token);
      return {
        message: 'Access granted to protected endpoint',
        user: {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}