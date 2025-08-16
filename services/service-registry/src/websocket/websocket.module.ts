import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServiceRegistryWebSocketGateway } from './websocket.gateway';
import { ServiceRegistryModule } from '../service-registry/service-registry.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [
    ConfigModule,
    // Use forwardRef to avoid circular dependencies
    forwardRef(() => ServiceRegistryModule),
    forwardRef(() => EventBusModule),
  ],
  providers: [ServiceRegistryWebSocketGateway],
  exports: [ServiceRegistryWebSocketGateway],
})
export class WebSocketModule {}