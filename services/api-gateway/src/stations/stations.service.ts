import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class StationsService {
  // private readonly logger = new Logger(StationsService.name);
  private readonly serviceName = 'stations';

  constructor(private readonly proxyService: ProxyService) {}

  async getStations(query: any, headers: any) {
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

  async getStationManagement(headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      '/management',
      null,
      headers,
    );
  }

  async getStation(id: string, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      `/${id}`,
      null,
      headers,
    );
  }

  async createStation(data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'POST',
      '',
      data,
      headers,
    );
  }

  async updateStation(id: string, data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'PUT',
      `/${id}`,
      data,
      headers,
    );
  }

  async deleteStation(id: string, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'DELETE',
      `/${id}`,
      null,
      headers,
    );
  }
}