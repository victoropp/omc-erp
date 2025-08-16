import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User, Tenant, Station } from '@omc-erp/database';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DB_PORT') || configService.get('DATABASE_PORT', 5434),
        username: configService.get('DB_USER') || configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD') || configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME') || configService.get('DATABASE_NAME', 'omc_erp'),
        entities: [User, Tenant, Station],
        autoLoadEntities: false,
        synchronize: false, // Never true in production
        logging: configService.get('NODE_ENV') === 'development',
        // Connection pool settings
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        },
        // Retry logic
        retryAttempts: 5,
        retryDelay: 3000,
        connectTimeoutMS: 10000,
        maxQueryExecutionTime: 30000,
      }),
      inject: [ConfigService],
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
      inject: [ConfigService],
    }),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Feature modules
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}