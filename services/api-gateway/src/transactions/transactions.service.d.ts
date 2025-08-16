import { ProxyService } from '../proxy/proxy.service';
export declare class TransactionsService {
    private readonly proxyService;
    private readonly serviceName;
    constructor(proxyService: ProxyService);
    getTransactions(query: any, headers: any): Promise<any>;
    getTransactionStats(headers: any): Promise<any>;
    getLiveTransactions(headers: any): Promise<any>;
    getTransaction(id: string, headers: any): Promise<any>;
    createTransaction(data: any, headers: any): Promise<any>;
    updateTransaction(id: string, data: any, headers: any): Promise<any>;
    deleteTransaction(id: string, headers: any): Promise<any>;
}
//# sourceMappingURL=transactions.service.d.ts.map