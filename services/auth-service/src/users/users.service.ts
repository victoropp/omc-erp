import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@omc-erp/database';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole, UserStatus } from '@omc-erp/shared-types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { password, ...userData } = registerDto;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user entity
    const user = this.userRepository.create({
      ...userData,
      passwordHash,
      role: registerDto.role || UserRole.OPERATOR,
      status: UserStatus.PENDING_VERIFICATION,
      failedLoginAttempts: 0,
    });

    // Save to database
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const where: any = { email };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.userRepository.findOne({
      where,
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'passwordHash', 
               'role', 'status', 'tenantId', 'failedLoginAttempts', 'lockedUntil'],
    });
  }

  async findByUsername(username: string, tenantId?: string): Promise<User | null> {
    const where: any = { username };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.userRepository.findOne({
      where,
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'passwordHash', 
               'role', 'status', 'tenantId', 'failedLoginAttempts', 'lockedUntil', 'refreshToken'],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(id, { passwordHash });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { 
      lastLoginAt: new Date() 
    });
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    const user = await this.findById(id);
    
    if (!user) {
      return;
    }

    user.incrementFailedLoginAttempts();
    await this.userRepository.save(user);
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    const user = await this.findById(id);
    
    if (!user) {
      return;
    }

    user.resetFailedLoginAttempts();
    await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.userRepository.find({
      where,
      select: ['id', 'email', 'username', 'firstName', 'lastName', 
               'role', 'status', 'tenantId', 'createdAt'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.userRepository.update(id, {
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    });
  }

  async suspendUser(id: string): Promise<void> {
    await this.userRepository.update(id, {
      status: UserStatus.SUSPENDED,
    });
  }

  async activateUser(id: string): Promise<void> {
    await this.userRepository.update(id, {
      status: UserStatus.ACTIVE,
    });
  }
}