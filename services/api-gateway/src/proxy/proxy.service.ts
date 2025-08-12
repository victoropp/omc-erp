import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private serviceUrls: Map<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrls = new Map([
      ['auth', this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001')],
      ['transactions', this.configService.get('TRANSACTION_SERVICE_URL', 'http://localhost:3002')],
      ['stations', this.configService.get('STATION_SERVICE_URL', 'http://localhost:3003')],
      ['fleet', this.configService.get('FLEET_SERVICE_URL', 'http://localhost:3004')],
      ['finance', this.configService.get('FINANCE_SERVICE_URL', 'http://localhost:3005')],
    ]);
  }

  async forwardRequest(
    service: string,
    method: string,
    path: string,
    data?: any,
    headers?: any,
  ): Promise<any> {
    const baseUrl = this.serviceUrls.get(service);
    
    if (!baseUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${baseUrl}${path}`,
      data,
      headers: {
        ...headers,
        'X-Forwarded-For': headers?.['x-forwarded-for'] || headers?.['x-real-ip'],
        'X-Request-ID': headers?.['x-request-id'] || this.generateRequestId(),
      },
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error) {
      this.handleProxyError(error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleProxyError(error: any): never {
    if (error.response) {
      // The service responded with an error
      throw {
        statusCode: error.response.status,
        message: error.response.data?.message || 'Service error',
        error: error.response.data?.error,
      };
    } else if (error.request) {
      // Service didn't respond
      throw {
        statusCode: 503,
        message: 'Service unavailable',
        error: 'Service did not respond',
      };
    } else {
      // Request setup error
      throw {
        statusCode: 500,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }
}