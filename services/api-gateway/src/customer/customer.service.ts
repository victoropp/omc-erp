import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class CustomerService {
  private readonly serviceName = 'customer';

  constructor(private readonly proxyService: ProxyService) {}

  async forwardRequest(method: string, path: string, data?: any, headers?: any) {
    return this.proxyService.forwardRequest(this.serviceName, method, path, data, headers);
  }
}