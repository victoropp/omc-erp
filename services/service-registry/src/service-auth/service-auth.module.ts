import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServiceAuthController } from './service-auth.controller';
import { ServiceAuthService } from './service-auth.service';
import { CacheService } from '../common/cache.service';

@Module({
  imports: [ConfigModule],
  controllers: [ServiceAuthController],
  providers: [
    ServiceAuthService,
    CacheService,
  ],
  exports: [ServiceAuthService],
})
export class ServiceAuthModule {}