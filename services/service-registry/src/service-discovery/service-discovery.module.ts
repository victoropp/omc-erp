import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServiceDiscoveryService } from './service-discovery.service';
import { ServiceRegistryModule } from '../service-registry/service-registry.module';

@Module({
  imports: [
    ConfigModule,
    // Use forwardRef to avoid circular dependencies
    forwardRef(() => ServiceRegistryModule),
  ],
  providers: [ServiceDiscoveryService],
  exports: [ServiceDiscoveryService],
})
export class ServiceDiscoveryModule {}