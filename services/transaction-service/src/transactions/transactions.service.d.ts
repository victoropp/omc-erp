import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction, Tank, Pump, Station, Customer, Shift } from '@omc-erp/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentService } from '../payment/payment.service';
export declare class TransactionsService {
    private readonly transactionRepository;
    private readonly tankRepository;
    private readonly pumpRepository;
    private readonly stationRepository;
    private readonly customerRepository;
    private readonly shiftRepository;
    private readonly dataSource;
    private readonly inventoryService;
    private readonly paymentService;
    private readonly eventEmitter;
    constructor(transactionRepository: Repository<Transaction>, tankRepository: Repository<Tank>, pumpRepository: Repository<Pump>, stationRepository: Repository<Station>, customerRepository: Repository<Customer>, shiftRepository: Repository<Shift>, dataSource: DataSource, inventoryService: InventoryService, paymentService: PaymentService, eventEmitter: EventEmitter2);
    create(createTransactionDto: CreateTransactionDto, tenantId: string): Promise<Transaction>;
    findAll(query: QueryTransactionsDto, tenantId: string): Promise<any>;
    findOne(id: string, tenantId: string): Promise<Transaction>;
    complete(id: string, tenantId: string): Promise<Transaction>;
    cancel(id: string, reason: string, tenantId: string): Promise<Transaction>;
    refund(id: string, amount: number | undefined, reason: string, tenantId: string): Promise<Transaction>;
    findByStation(stationId: string, query: QueryTransactionsDto, tenantId: string): Promise<any>;
    findByCustomer(customerId: string, query: QueryTransactionsDto, tenantId: string): Promise<any>;
    getDailySummary(date: string, tenantId: string): Promise<any>;
    private generateReceiptNumber;
}
//# sourceMappingURL=transactions.service.d.ts.map