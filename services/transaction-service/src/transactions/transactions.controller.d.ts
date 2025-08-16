import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto, req: any): Promise<import("@omc-erp/database").Transaction>;
    findAll(query: QueryTransactionsDto, req: any): Promise<any>;
    getDailySummary(date: string, req: any): Promise<any>;
    findOne(id: string, req: any): Promise<import("@omc-erp/database").Transaction>;
    complete(id: string, req: any): Promise<import("@omc-erp/database").Transaction>;
    cancel(id: string, body: {
        reason: string;
    }, req: any): Promise<import("@omc-erp/database").Transaction>;
    refund(id: string, body: {
        amount?: number;
        reason: string;
    }, req: any): Promise<import("@omc-erp/database").Transaction>;
    getByStation(stationId: string, query: QueryTransactionsDto, req: any): Promise<any>;
    getByCustomer(customerId: string, query: QueryTransactionsDto, req: any): Promise<any>;
}
//# sourceMappingURL=transactions.controller.d.ts.map