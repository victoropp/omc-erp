import { Module } from '@nestjs/common';
import { VersioningService } from './versioning.service';
import { VersioningController } from './versioning.controller';
import { ApiVersionGuard } from './guards/api-version.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [VersioningController],
  providers: [
    VersioningService,
    {
      provide: APP_GUARD,
      useClass: ApiVersionGuard,
    },
  ],
  exports: [VersioningService],
})
export class ApiVersioningModule {}