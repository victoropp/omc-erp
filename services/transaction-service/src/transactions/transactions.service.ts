import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction, Tank, Pump, Station, Customer, Shift } from '@omc-erp/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionStatus, PaymentStatus } from '@omc-erp/shared-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Tank)
    private readonly tankRepository: Repository<Tank>,
    @InjectRepository(Pump)
    private readonly pumpRepository: Repository<Pump>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, tenantId: string): Promise<Transaction> {
    // Start a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate station, pump, and tank
      const station = await this.stationRepository.findOne({
        where: { id: createTransactionDto.stationId, tenantId },
      });

      if (!station) {
        throw new NotFoundException('Station not found');
      }

      const pump = await this.pumpRepository.findOne({
        where: { id: createTransactionDto.pumpId, stationId: station.id },
        relations: ['tank'],
      });

      if (!pump) {
        throw new NotFoundException('Pump not found');
      }

      if (!pump.isOperational()) {
        throw new BadRequestException('Pump is not operational');
      }

      const tank = pump.tank;
      if (!tank) {
        throw new NotFoundException('Tank not found');
      }

      // Check inventory availability
      const hasInventory = await this.inventoryService.checkAvailability(
        tank.id,
        createTransactionDto.quantity,
      );

      if (!hasInventory) {
        throw new UnprocessableEntityException('Insufficient fuel inventory');
      }

      // Get current shift if provided
      let shift = null;
      if (createTransactionDto.shiftId) {
        shift = await this.shiftRepository.findOne({
          where: { id: createTransactionDto.shiftId, stationId: station.id },
        });
      }

      // Get customer if provided
      let customer = null;
      if (createTransactionDto.customerId) {
        customer = await this.customerRepository.findOne({
          where: { id: createTransactionDto.customerId, tenantId },
        });
      }

      // Create transaction
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        id: uuidv4(),
        tenantId,
        tankId: tank.id,
        shiftId: shift?.id,
        customerId: customer?.id,
        status: TransactionStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        transactionTime: new Date(),
        receiptNumber: this.generateReceiptNumber(),
      });

      // Calculate amounts (triggers @BeforeInsert hook)
      transaction.calculateAmounts();
      transaction.generateReceiptNumber();

      // Save transaction
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Reserve inventory
      await this.inventoryService.reserveInventory(
        tank.id,
        createTransactionDto.quantity,
        savedTransaction.id,
      );

      // Process payment if auto-process is enabled
      if (createTransactionDto.autoProcessPayment) {
        const paymentResult = await this.paymentService.processPayment({
          transactionId: savedTransaction.id,
          amount: savedTransaction.totalAmount,
          method: createTransactionDto.paymentMethod,
          details: createTransactionDto.paymentDetails,
        });

        if (paymentResult.success) {
          savedTransaction.paymentStatus = PaymentStatus.COMPLETED;
          savedTransaction.paymentReference = paymentResult.reference;
          savedTransaction.paymentProcessedAt = new Date();
          savedTransaction.status = TransactionStatus.COMPLETED;

          // Deduct inventory
          await this.inventoryService.deductInventory(
            tank.id,
            createTransactionDto.quantity,
            savedTransaction.id,
          );

          // Award loyalty points if customer exists
          if (customer && savedTransaction.loyaltyPointsAwarded > 0) {
            customer.addLoyaltyPoints(savedTransaction.loyaltyPointsAwarded);
            await queryRunner.manager.save(customer);
          }

          await queryRunner.manager.save(savedTransaction);
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('transaction.created', {
        transactionId: savedTransaction.id,
        stationId: station.id,
        amount: savedTransaction.totalAmount,
        status: savedTransaction.status,
      });

      return savedTransaction;
    } catch (error) {
      // Rollback the transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll(query: QueryTransactionsDto, tenantId: string): Promise<any> {
    const { page = 1, limit = 20, startDate, endDate, status, paymentStatus, stationId } = query;

    const whereConditions: any = { tenantId };

    if (startDate && endDate) {
      whereConditions.transactionTime = Between(new Date(startDate), new Date(endDate));
    }

    if (status) {
      whereConditions.status = status;
    }

    if (paymentStatus) {
      whereConditions.paymentStatus = paymentStatus;
    }

    if (stationId) {
      whereConditions.stationId = stationId;
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: whereConditions,
      relations: ['station', 'pump', 'customer', 'attendant'],
      order: { transactionTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, tenantId },
      relations: ['station', 'pump', 'tank', 'customer', 'attendant', 'shift'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async complete(id: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, tenantId);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not in pending status');
    }

    transaction.status = TransactionStatus.COMPLETED;
    
    if (transaction.paymentStatus === PaymentStatus.PENDING) {
      transaction.paymentStatus = PaymentStatus.COMPLETED;
      transaction.paymentProcessedAt = new Date();
    }

    // Deduct inventory
    await this.inventoryService.deductInventory(
      transaction.tankId,
      transaction.quantityLiters,
      transaction.id,
    );

    const updatedTransaction = await this.transactionRepository.save(transaction);

    // Emit event
    this.eventEmitter.emit('transaction.completed', {
      transactionId: updatedTransaction.id,
      stationId: updatedTransaction.stationId,
      amount: updatedTransaction.totalAmount,
    });

    return updatedTransaction;
  }

  async cancel(id: string, reason: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, tenantId);

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed transaction');
    }

    transaction.status = TransactionStatus.CANCELLED;

    // Release reserved inventory if transaction was pending
    if (transaction.status === TransactionStatus.PENDING) {
      await this.inventoryService.releaseInventory(
        transaction.tankId,
        transaction.quantityLiters,
        transaction.id,
      );
    }

    const updatedTransaction = await this.transactionRepository.save(transaction);

    // Emit event
    this.eventEmitter.emit('transaction.cancelled', {
      transactionId: updatedTransaction.id,
      stationId: updatedTransaction.stationId,
      reason,
    });

    return updatedTransaction;
  }

  async refund(id: string, amount: number | undefined, reason: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, tenantId);

    if (!transaction.canBeRefunded()) {
      throw new BadRequestException('Transaction cannot be refunded');
    }

    const refundAmount = amount || transaction.totalAmount;

    // Process refund through payment service
    const refundResult = await this.paymentService.refundPayment({
      transactionId: transaction.id,
      amount: refundAmount,
      reason,
    });

    if (refundResult.success) {
      transaction.paymentStatus = PaymentStatus.REFUNDED;
      transaction.status = TransactionStatus.CANCELLED;

      // Return inventory
      await this.inventoryService.returnInventory(
        transaction.tankId,
        transaction.quantityLiters,
        transaction.id,
      );

      // Deduct loyalty points if customer exists
      if (transaction.customerId && transaction.loyaltyPointsAwarded > 0) {
        const customer = await this.customerRepository.findOne({
          where: { id: transaction.customerId },
        });
        if (customer) {
          customer.redeemLoyaltyPoints(transaction.loyaltyPointsAwarded);
          await this.customerRepository.save(customer);
        }
      }

      await this.transactionRepository.save(transaction);

      // Emit event
      this.eventEmitter.emit('transaction.refunded', {
        transactionId: transaction.id,
        stationId: transaction.stationId,
        amount: refundAmount,
        reason,
      });
    }

    return transaction;
  }

  async findByStation(stationId: string, query: QueryTransactionsDto, tenantId: string): Promise<any> {
    return this.findAll({ ...query, stationId }, tenantId);
  }

  async findByCustomer(customerId: string, query: QueryTransactionsDto, tenantId: string): Promise<any> {
    const { page = 1, limit = 20 } = query;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { customerId, tenantId },
      relations: ['station', 'pump'],
      order: { transactionTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }

  async getDailySummary(date: string, tenantId: string): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.transactionRepository.find({
      where: {
        tenantId,
        transactionTime: Between(startOfDay, endOfDay),
        status: TransactionStatus.COMPLETED,
      },
    });

    const summary = {
      date: date,
      totalTransactions: transactions.length,
      totalSales: transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      totalQuantity: transactions.reduce((sum, t) => sum + Number(t.quantityLiters), 0),
      byFuelType: {},
      byPaymentMethod: {},
      byStation: {},
    };

    // Group by fuel type
    transactions.forEach(t => {
      if (!summary.byFuelType[t.fuelType]) {
        summary.byFuelType[t.fuelType] = {
          count: 0,
          quantity: 0,
          amount: 0,
        };
      }
      summary.byFuelType[t.fuelType].count++;
      summary.byFuelType[t.fuelType].quantity += Number(t.quantityLiters);
      summary.byFuelType[t.fuelType].amount += Number(t.totalAmount);
    });

    // Group by payment method
    transactions.forEach(t => {
      if (!summary.byPaymentMethod[t.paymentMethod]) {
        summary.byPaymentMethod[t.paymentMethod] = {
          count: 0,
          amount: 0,
        };
      }
      summary.byPaymentMethod[t.paymentMethod].count++;
      summary.byPaymentMethod[t.paymentMethod].amount += Number(t.totalAmount);
    });

    return summary;
  }

  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP${timestamp}${random}`;
  }
}