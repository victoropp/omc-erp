import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getTransactions(query: any, headers: any): Promise<any>;
    getTransactionStats(headers: any): Promise<any>;
    getLiveTransactions(headers: any): Promise<any>;
    getTransaction(id: string, headers: any): Promise<any>;
    createTransaction(transactionData: any, headers: any): Promise<any>;
    updateTransaction(id: string, updateData: any, headers: any): Promise<any>;
    deleteTransaction(id: string, headers: any): Promise<any>;
}
//# sourceMappingURL=transactions.controller.d.ts.map