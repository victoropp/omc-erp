"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(registerDto) {
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
    async findById(id) {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }
    async findByEmail(email, tenantId) {
        const where = { email };
        if (tenantId) {
            where.tenantId = tenantId;
        }
        return await this.userRepository.findOne({
            where,
            select: ['id', 'email', 'username', 'firstName', 'lastName', 'passwordHash',
                'role', 'status', 'tenantId', 'failedLoginAttempts', 'lockedUntil'],
        });
    }
    async findByUsername(username, tenantId) {
        const where = { username };
        if (tenantId) {
            where.tenantId = tenantId;
        }
        return await this.userRepository.findOne({
            where,
            select: ['id', 'email', 'username', 'firstName', 'lastName', 'passwordHash',
                'role', 'status', 'tenantId', 'failedLoginAttempts', 'lockedUntil', 'refreshToken'],
        });
    }
    async update(id, updateData) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updateData);
        return await this.userRepository.save(user);
    }
    async updatePassword(id, newPassword) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepository.update(id, { passwordHash });
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, {
            lastLoginAt: new Date()
        });
    }
    async incrementFailedLoginAttempts(id) {
        const user = await this.findById(id);
        if (!user) {
            return;
        }
        user.incrementFailedLoginAttempts();
        await this.userRepository.save(user);
    }
    async resetFailedLoginAttempts(id) {
        const user = await this.findById(id);
        if (!user) {
            return;
        }
        user.resetFailedLoginAttempts();
        await this.userRepository.save(user);
    }
    async delete(id) {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async findAll(tenantId) {
        const where = {};
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
    async verifyEmail(id) {
        await this.userRepository.update(id, {
            emailVerifiedAt: new Date(),
            status: UserStatus.ACTIVE,
        });
    }
    async suspendUser(id) {
        await this.userRepository.update(id, {
            status: UserStatus.SUSPENDED,
        });
    }
    async activateUser(id) {
        await this.userRepository.update(id, {
            status: UserStatus.ACTIVE,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map