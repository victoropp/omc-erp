import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { Station } from '../../../../packages/database/src/entities/Station';
import { User } from '../../../../packages/database/src/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([Station, User]),
  ],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}