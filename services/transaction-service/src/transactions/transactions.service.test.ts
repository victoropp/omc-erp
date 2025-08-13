import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, SelectQueryBuilder, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  NotFoundException, 
  BadRequestException, 
  UnprocessableEntityException 
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentService } from '../payment/payment.service';
import { Transaction, Tank, Pump, Station, Customer, Shift } from '@omc-erp/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionStatus, PaymentStatus, PaymentMethod } from '@omc-erp/shared-types';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let tankRepository: jest.Mocked<Repository<Tank>>;
  let pumpRepository: jest.Mocked<Repository<Pump>>;
  let stationRepository: jest.Mocked<Repository<Station>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let shiftRepository: jest.Mocked<Repository<Shift>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let inventoryService: jest.Mocked<InventoryService>;
  let paymentService: jest.Mocked<PaymentService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  const mockStation = {
    id: 'station-123',
    name: 'Test Station',
    tenantId: mockTenantId,
  };

  const mockTank = {
    id: 'tank-123',
    name: 'Tank 1',
    capacity: 10000,
    currentLevel: 8000,
    stationId: mockStation.id,
  };

  const mockPump = {
    id: 'pump-123',
    name: 'Pump 1',
    stationId: mockStation.id,
    tank: mockTank,
    isOperational: jest.fn(() => true),
  };

  const mockCustomer = {
    id: 'customer-123',
    name: 'Test Customer',
    loyaltyPoints: 100,
    addLoyaltyPoints: jest.fn(),
    redeemLoyaltyPoints: jest.fn(),
    tenantId: mockTenantId,
  };

  const mockShift = {
    id: 'shift-123',
    startTime: new Date(),
    stationId: mockStation.id,
  };

  const mockTransaction: Transaction = {
    id: 'transaction-123',
    receiptNumber: 'RCP123456789001',
    stationId: mockStation.id,
    pumpId: mockPump.id,
    tankId: mockTank.id,
    customerId: mockCustomer.id,
    shiftId: mockShift.id,
    attendantId: mockUserId,
    fuelType: 'PETROL',
    quantityLiters: 50,
    pricePerLiter: 10.50,
    subtotalAmount: 525.00,
    vatAmount: 63.00,
    totalAmount: 588.00,
    paymentMethod: PaymentMethod.CASH,
    status: TransactionStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    transactionTime: new Date(),
    loyaltyPointsAwarded: 5,
    tenantId: mockTenantId,
    calculateAmounts: jest.fn(),
    generateReceiptNumber: jest.fn(),
    canBeRefunded: jest.fn(() => true),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    } as any;

    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      findAndCount: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Tank),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Pump),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Station),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => queryRunner),
          },
        },
        {
          provide: InventoryService,
          useValue: {
            checkAvailability: jest.fn(),
            reserveInventory: jest.fn(),
            deductInventory: jest.fn(),
            releaseInventory: jest.fn(),
            returnInventory: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            processPayment: jest.fn(),
            refundPayment: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    tankRepository = module.get(getRepositoryToken(Tank));
    pumpRepository = module.get(getRepositoryToken(Pump));
    stationRepository = module.get(getRepositoryToken(Station));
    customerRepository = module.get(getRepositoryToken(Customer));
    shiftRepository = module.get(getRepositoryToken(Shift));
    dataSource = module.get(DataSource);
    inventoryService = module.get(InventoryService);
    paymentService = module.get(PaymentService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateTransactionDto = {
      stationId: mockStation.id,
      pumpId: mockPump.id,
      customerId: mockCustomer.id,
      shiftId: mockShift.id,
      attendantId: mockUserId,
      fuelType: 'PETROL',
      quantity: 50,
      pricePerLiter: 10.50,
      paymentMethod: PaymentMethod.CASH,
      autoProcessPayment: false,
    };

    beforeEach(() => {
      stationRepository.findOne.mockResolvedValue(mockStation);
      pumpRepository.findOne.mockResolvedValue(mockPump);
      shiftRepository.findOne.mockResolvedValue(mockShift);
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      inventoryService.checkAvailability.mockResolvedValue(true);
      transactionRepository.create.mockReturnValue(mockTransaction);
      queryRunner.manager.save.mockResolvedValue(mockTransaction);
    });

    it('should create transaction successfully', async () => {
      // Act
      const result = await service.create(createDto, mockTenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockTransaction.id);
      expect(stationRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.stationId, tenantId: mockTenantId },
      });
      expect(inventoryService.checkAvailability).toHaveBeenCalledWith(mockTank.id, createDto.quantity);
      expect(inventoryService.reserveInventory).toHaveBeenCalledWith(mockTank.id, createDto.quantity, mockTransaction.id);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('transaction.created', expect.any(Object));
    });

    it('should throw NotFoundException if station not found', async () => {
      // Arrange
      stationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if pump not found', async () => {
      // Arrange
      pumpRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if pump is not operational', async () => {
      // Arrange
      const nonOperationalPump = { ...mockPump, isOperational: jest.fn(() => false) };
      pumpRepository.findOne.mockResolvedValue(nonOperationalPump);

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if tank not found', async () => {
      // Arrange
      const pumpWithoutTank = { ...mockPump, tank: null };
      pumpRepository.findOne.mockResolvedValue(pumpWithoutTank);

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException if insufficient inventory', async () => {
      // Arrange
      inventoryService.checkAvailability.mockResolvedValue(false);

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should process payment automatically when enabled', async () => {
      // Arrange
      const autoPaymentDto = { ...createDto, autoProcessPayment: true };
      const paymentResult = { success: true, reference: 'PAY123' };
      paymentService.processPayment.mockResolvedValue(paymentResult);

      const completedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentReference: paymentResult.reference,
        paymentProcessedAt: expect.any(Date),
      };
      queryRunner.manager.save.mockResolvedValue(completedTransaction);

      // Act
      const result = await service.create(autoPaymentDto, mockTenantId);

      // Assert
      expect(paymentService.processPayment).toHaveBeenCalledWith({
        transactionId: mockTransaction.id,
        amount: mockTransaction.totalAmount,
        method: autoPaymentDto.paymentMethod,
        details: autoPaymentDto.paymentDetails,
      });
      expect(inventoryService.deductInventory).toHaveBeenCalledWith(mockTank.id, autoPaymentDto.quantity, mockTransaction.id);
      expect(mockCustomer.addLoyaltyPoints).toHaveBeenCalledWith(mockTransaction.loyaltyPointsAwarded);
    });

    it('should handle payment failure gracefully', async () => {
      // Arrange
      const autoPaymentDto = { ...createDto, autoProcessPayment: true };
      const paymentResult = { success: false, error: 'Payment failed' };
      paymentService.processPayment.mockResolvedValue(paymentResult);

      // Act
      const result = await service.create(autoPaymentDto, mockTenantId);

      // Assert
      expect(result.status).toBe(TransactionStatus.PENDING);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(inventoryService.deductInventory).not.toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow('Database error');
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const queryDto: QueryTransactionsDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated transactions', async () => {
      // Arrange
      const transactions = [mockTransaction];
      const total = 1;
      transactionRepository.findAndCount.mockResolvedValue([transactions, total]);

      // Act
      const result = await service.findAll(queryDto, mockTenantId);

      // Assert
      expect(result).toEqual({
        data: transactions,
        pagination: {
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalRecords: 1,
        },
      });
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        relations: ['station', 'pump', 'customer', 'attendant'],
        order: { transactionTime: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by date range', async () => {
      // Arrange
      const queryWithDates = {
        ...queryDto,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      transactionRepository.findAndCount.mockResolvedValue([[mockTransaction], 1]);

      // Act
      await service.findAll(queryWithDates, mockTenantId);

      // Assert
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            transactionTime: expect.any(Object), // Between dates
          }),
        })
      );
    });

    it('should filter by status', async () => {
      // Arrange
      const queryWithStatus = { ...queryDto, status: TransactionStatus.COMPLETED };
      transactionRepository.findAndCount.mockResolvedValue([[mockTransaction], 1]);

      // Act
      await service.findAll(queryWithStatus, mockTenantId);

      // Assert
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            status: TransactionStatus.COMPLETED,
          }),
        })
      );
    });

    it('should filter by payment status', async () => {
      // Arrange
      const queryWithPaymentStatus = { ...queryDto, paymentStatus: PaymentStatus.COMPLETED };
      transactionRepository.findAndCount.mockResolvedValue([[mockTransaction], 1]);

      // Act
      await service.findAll(queryWithPaymentStatus, mockTenantId);

      // Assert
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            paymentStatus: PaymentStatus.COMPLETED,
          }),
        })
      );
    });

    it('should filter by station', async () => {
      // Arrange
      const queryWithStation = { ...queryDto, stationId: 'station-456' };
      transactionRepository.findAndCount.mockResolvedValue([[mockTransaction], 1]);

      // Act
      await service.findAll(queryWithStation, mockTenantId);

      // Assert
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: mockTenantId,
            stationId: 'station-456',
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return transaction with relations', async () => {
      // Arrange
      transactionRepository.findOne.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.findOne(mockTransaction.id, mockTenantId);

      // Assert
      expect(result).toBe(mockTransaction);
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransaction.id, tenantId: mockTenantId },
        relations: ['station', 'pump', 'tank', 'customer', 'attendant', 'shift'],
      });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      // Arrange
      transactionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent', mockTenantId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete pending transaction', async () => {
      // Arrange
      const pendingTransaction = { ...mockTransaction, status: TransactionStatus.PENDING };
      transactionRepository.findOne.mockResolvedValue(pendingTransaction);
      const completedTransaction = { ...pendingTransaction, status: TransactionStatus.COMPLETED };
      transactionRepository.save.mockResolvedValue(completedTransaction);

      // Act
      const result = await service.complete(mockTransaction.id, mockTenantId);

      // Assert
      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
      expect(result.paymentProcessedAt).toBeDefined();
      expect(inventoryService.deductInventory).toHaveBeenCalledWith(
        pendingTransaction.tankId,
        pendingTransaction.quantityLiters,
        pendingTransaction.id
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('transaction.completed', expect.any(Object));
    });

    it('should throw BadRequestException if transaction is not pending', async () => {
      // Arrange
      const completedTransaction = { ...mockTransaction, status: TransactionStatus.COMPLETED };
      transactionRepository.findOne.mockResolvedValue(completedTransaction);

      // Act & Assert
      await expect(service.complete(mockTransaction.id, mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel pending transaction', async () => {
      // Arrange
      const pendingTransaction = { ...mockTransaction, status: TransactionStatus.PENDING };
      transactionRepository.findOne.mockResolvedValue(pendingTransaction);
      const cancelledTransaction = { ...pendingTransaction, status: TransactionStatus.CANCELLED };
      transactionRepository.save.mockResolvedValue(cancelledTransaction);

      // Act
      const result = await service.cancel(mockTransaction.id, 'Test cancellation', mockTenantId);

      // Assert
      expect(result.status).toBe(TransactionStatus.CANCELLED);
      expect(inventoryService.releaseInventory).toHaveBeenCalledWith(
        pendingTransaction.tankId,
        pendingTransaction.quantityLiters,
        pendingTransaction.id
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('transaction.cancelled', expect.any(Object));
    });

    it('should throw BadRequestException if transaction is completed', async () => {
      // Arrange
      const completedTransaction = { ...mockTransaction, status: TransactionStatus.COMPLETED };
      transactionRepository.findOne.mockResolvedValue(completedTransaction);

      // Act & Assert
      await expect(service.cancel(mockTransaction.id, 'reason', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('refund', () => {
    it('should refund completed transaction', async () => {
      // Arrange
      const completedTransaction = { 
        ...mockTransaction, 
        status: TransactionStatus.COMPLETED,
        paymentStatus: PaymentStatus.COMPLETED,
      };
      transactionRepository.findOne.mockResolvedValue(completedTransaction);
      mockTransaction.canBeRefunded.mockReturnValue(true);
      
      const refundResult = { success: true, reference: 'REF123' };
      paymentService.refundPayment.mockResolvedValue(refundResult);
      
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      transactionRepository.save.mockResolvedValue({
        ...completedTransaction,
        status: TransactionStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
      });

      // Act
      const result = await service.refund(mockTransaction.id, 588.00, 'Customer request', mockTenantId);

      // Assert
      expect(paymentService.refundPayment).toHaveBeenCalledWith({
        transactionId: mockTransaction.id,
        amount: 588.00,
        reason: 'Customer request',
      });
      expect(inventoryService.returnInventory).toHaveBeenCalledWith(
        completedTransaction.tankId,
        completedTransaction.quantityLiters,
        completedTransaction.id
      );
      expect(mockCustomer.redeemLoyaltyPoints).toHaveBeenCalledWith(mockTransaction.loyaltyPointsAwarded);
      expect(eventEmitter.emit).toHaveBeenCalledWith('transaction.refunded', expect.any(Object));
    });

    it('should throw BadRequestException if transaction cannot be refunded', async () => {
      // Arrange
      transactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransaction.canBeRefunded.mockReturnValue(false);

      // Act & Assert
      await expect(service.refund(mockTransaction.id, 100, 'reason', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });

    it('should use full amount if amount not specified', async () => {
      // Arrange
      transactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransaction.canBeRefunded.mockReturnValue(true);
      paymentService.refundPayment.mockResolvedValue({ success: true });
      transactionRepository.save.mockResolvedValue(mockTransaction);

      // Act
      await service.refund(mockTransaction.id, undefined, 'reason', mockTenantId);

      // Assert
      expect(paymentService.refundPayment).toHaveBeenCalledWith({
        transactionId: mockTransaction.id,
        amount: mockTransaction.totalAmount, // Full amount used
        reason: 'reason',
      });
    });
  });

  describe('findByStation', () => {
    it('should delegate to findAll with stationId', async () => {
      // Arrange
      const stationId = 'station-456';
      const query = { page: 1, limit: 10 };
      const expectedResult = { data: [], pagination: {} };
      
      // Mock findAll method
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult as any);

      // Act
      const result = await service.findByStation(stationId, query, mockTenantId);

      // Assert
      expect(result).toBe(expectedResult);
      expect(findAllSpy).toHaveBeenCalledWith({ ...query, stationId }, mockTenantId);
    });
  });

  describe('findByCustomer', () => {
    it('should return customer transactions', async () => {
      // Arrange
      const customerId = 'customer-456';
      const query = { page: 1, limit: 20 };
      const transactions = [mockTransaction];
      const total = 1;
      
      transactionRepository.findAndCount.mockResolvedValue([transactions, total]);

      // Act
      const result = await service.findByCustomer(customerId, query, mockTenantId);

      // Assert
      expect(result).toEqual({
        data: transactions,
        pagination: {
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalRecords: 1,
        },
      });
      expect(transactionRepository.findAndCount).toHaveBeenCalledWith({
        where: { customerId, tenantId: mockTenantId },
        relations: ['station', 'pump'],
        order: { transactionTime: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('getDailySummary', () => {
    it('should return daily transaction summary', async () => {
      // Arrange
      const date = '2024-01-15';
      const transactions = [
        { 
          ...mockTransaction, 
          fuelType: 'PETROL', 
          paymentMethod: PaymentMethod.CASH,
          totalAmount: 500,
          quantityLiters: 50,
          status: TransactionStatus.COMPLETED,
        },
        { 
          ...mockTransaction, 
          id: 'transaction-456',
          fuelType: 'DIESEL', 
          paymentMethod: PaymentMethod.MOBILE_MONEY,
          totalAmount: 600,
          quantityLiters: 40,
          status: TransactionStatus.COMPLETED,
        },
      ];
      
      transactionRepository.find.mockResolvedValue(transactions);

      // Act
      const result = await service.getDailySummary(date, mockTenantId);

      // Assert
      expect(result).toEqual({
        date: '2024-01-15',
        totalTransactions: 2,
        totalSales: 1100,
        totalQuantity: 90,
        byFuelType: {
          PETROL: { count: 1, quantity: 50, amount: 500 },
          DIESEL: { count: 1, quantity: 40, amount: 600 },
        },
        byPaymentMethod: {
          [PaymentMethod.CASH]: { count: 1, amount: 500 },
          [PaymentMethod.MOBILE_MONEY]: { count: 1, amount: 600 },
        },
        byStation: {},
      });
    });

    it('should filter by date range correctly', async () => {
      // Arrange
      const date = '2024-01-15';
      transactionRepository.find.mockResolvedValue([]);

      // Act
      await service.getDailySummary(date, mockTenantId);

      // Assert
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          transactionTime: expect.any(Object), // Between start and end of day
          status: TransactionStatus.COMPLETED,
        },
      });
    });
  });

  describe('generateReceiptNumber (private method)', () => {
    it('should generate unique receipt numbers', () => {
      // Act
      const receiptNumber1 = service['generateReceiptNumber']();
      const receiptNumber2 = service['generateReceiptNumber']();

      // Assert
      expect(receiptNumber1).toMatch(/^RCP\d{13}\d{3}$/); // RCP + timestamp + random
      expect(receiptNumber2).toMatch(/^RCP\d{13}\d{3}$/);
      expect(receiptNumber1).not.toBe(receiptNumber2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection failures', async () => {
      // Arrange
      queryRunner.startTransaction.mockRejectedValue(new Error('Connection failed'));
      const createDto: CreateTransactionDto = {
        stationId: mockStation.id,
        pumpId: mockPump.id,
        fuelType: 'PETROL',
        quantity: 50,
        pricePerLiter: 10.50,
        paymentMethod: PaymentMethod.CASH,
      };

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow('Connection failed');
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle inventory service failures', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: mockStation.id,
        pumpId: mockPump.id,
        fuelType: 'PETROL',
        quantity: 50,
        pricePerLiter: 10.50,
        paymentMethod: PaymentMethod.CASH,
      };

      stationRepository.findOne.mockResolvedValue(mockStation);
      pumpRepository.findOne.mockResolvedValue(mockPump);
      inventoryService.checkAvailability.mockRejectedValue(new Error('Inventory service down'));

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow('Inventory service down');
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle payment service failures', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: mockStation.id,
        pumpId: mockPump.id,
        fuelType: 'PETROL',
        quantity: 50,
        pricePerLiter: 10.50,
        paymentMethod: PaymentMethod.CASH,
        autoProcessPayment: true,
      };

      stationRepository.findOne.mockResolvedValue(mockStation);
      pumpRepository.findOne.mockResolvedValue(mockPump);
      inventoryService.checkAvailability.mockResolvedValue(true);
      transactionRepository.create.mockReturnValue(mockTransaction);
      queryRunner.manager.save.mockResolvedValue(mockTransaction);
      paymentService.processPayment.mockRejectedValue(new Error('Payment gateway error'));

      // Act & Assert
      await expect(service.create(createDto, mockTenantId))
        .rejects.toThrow('Payment gateway error');
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle large quantity transactions', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: mockStation.id,
        pumpId: mockPump.id,
        fuelType: 'PETROL',
        quantity: 9999, // Large quantity
        pricePerLiter: 10.50,
        paymentMethod: PaymentMethod.CASH,
      };

      stationRepository.findOne.mockResolvedValue(mockStation);
      pumpRepository.findOne.mockResolvedValue(mockPump);
      inventoryService.checkAvailability.mockResolvedValue(true);
      transactionRepository.create.mockReturnValue(mockTransaction);
      queryRunner.manager.save.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.create(createDto, mockTenantId);

      // Assert
      expect(result).toBeDefined();
      expect(inventoryService.checkAvailability).toHaveBeenCalledWith(mockTank.id, 9999);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent transaction creation', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: mockStation.id,
        pumpId: mockPump.id,
        fuelType: 'PETROL',
        quantity: 50,
        pricePerLiter: 10.50,
        paymentMethod: PaymentMethod.CASH,
      };

      stationRepository.findOne.mockResolvedValue(mockStation);
      pumpRepository.findOne.mockResolvedValue(mockPump);
      inventoryService.checkAvailability.mockResolvedValue(true);
      transactionRepository.create.mockReturnValue(mockTransaction);
      queryRunner.manager.save.mockResolvedValue(mockTransaction);

      const concurrentTransactions = Array(5).fill(null).map(() => 
        service.create(createDto, mockTenantId)
      );

      // Act
      const results = await Promise.all(concurrentTransactions);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => expect(result).toBeDefined());
    });

    it('should efficiently handle large result sets in findAll', async () => {
      // Arrange
      const largeResultSet = Array(1000).fill(null).map((_, index) => ({
        ...mockTransaction,
        id: `transaction-${index}`,
      }));
      
      transactionRepository.findAndCount.mockResolvedValue([largeResultSet, 1000]);

      const queryDto: QueryTransactionsDto = {
        page: 1,
        limit: 1000,
      };

      const startTime = Date.now();

      // Act
      const result = await service.findAll(queryDto, mockTenantId);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(result.data).toHaveLength(1000);
      expect(result.pagination.totalRecords).toBe(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});