import { Module } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SecurityService } from './security.service';
import { CorsGuard } from './guards/cors.guard';
import { CSPGuard } from './guards/csp.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityController } from './security.controller';

@Module({
  controllers: [SecurityController],
  providers: [
    SecurityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CorsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CSPGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}