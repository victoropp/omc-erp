import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
  ],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}