import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SimpleAuthController } from './simple-auth.controller';
import { TestController } from './test-controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // JWT
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: '15m',
      },
    }),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SimpleAuthController, TestController],
  providers: [],
})
export class SimpleAppModule {}