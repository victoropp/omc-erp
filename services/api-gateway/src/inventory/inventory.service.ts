import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class InventoryService {
  // private readonly logger = new Logger(InventoryService.name);
  private readonly serviceName = 'inventory';

  constructor(private readonly proxyService: ProxyService) {}

  async getInventory(query: any, headers: any) {
    const queryString = new URLSearchParams(query).toString();
    const path = queryString ? `?${queryString}` : '';
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      path,
      null,
      headers,
    );
  }

  async getTankLevels(headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      '/tank-levels',
      null,
      headers,
    );
  }

  async updateInventory(data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'POST',
      '/update',
      data,
      headers,
    );
  }

  async getInventoryItem(id: string, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      `/${id}`,
      null,
      headers,
    );
  }

  async createInventoryItem(data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'POST',
      '',
      data,
      headers,
    );
  }

  async updateInventoryItem(id: string, data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'PUT',
      `/${id}`,
      data,
      headers,
    );
  }
}