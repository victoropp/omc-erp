import { Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { EventBusController } from './event-bus.controller';
import { EventHandlerService } from './event-handler.service';

@Module({
  controllers: [EventBusController],
  providers: [EventBusService, EventHandlerService],
  exports: [EventBusService],
})
export class EventBusModule {}