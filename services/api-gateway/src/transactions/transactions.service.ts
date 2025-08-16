import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class TransactionsService {
  // private readonly logger = new Logger(TransactionsService.name);
  private readonly serviceName = 'transactions';

  constructor(private readonly proxyService: ProxyService) {}

  async getTransactions(query: any, headers: any) {
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

  async getTransactionStats(headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      '/stats',
      null,
      headers,
    );
  }

  async getLiveTransactions(headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      '/live',
      null,
      headers,
    );
  }

  async getTransaction(id: string, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'GET',
      `/${id}`,
      null,
      headers,
    );
  }

  async createTransaction(data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'POST',
      '',
      data,
      headers,
    );
  }

  async updateTransaction(id: string, data: any, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'PUT',
      `/${id}`,
      data,
      headers,
    );
  }

  async deleteTransaction(id: string, headers: any) {
    return this.proxyService.forwardRequest(
      this.serviceName,
      'DELETE',
      `/${id}`,
      null,
      headers,
    );
  }
}