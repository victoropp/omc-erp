"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_1 = require("@omc-erp/database");
const inventory_service_1 = require("../inventory/inventory.service");
const payment_service_1 = require("../payment/payment.service");
const shared_types_1 = require("@omc-erp/shared-types");
const uuid_1 = require("uuid");
let TransactionsService = class TransactionsService {
    transactionRepository;
    tankRepository;
    pumpRepository;
    stationRepository;
    customerRepository;
    shiftRepository;
    dataSource;
    inventoryService;
    paymentService;
    eventEmitter;
    constructor(transactionRepository, tankRepository, pumpRepository, stationRepository, customerRepository, shiftRepository, dataSource, inventoryService, paymentService, eventEmitter) {
        this.transactionRepository = transactionRepository;
        this.tankRepository = tankRepository;
        this.pumpRepository = pumpRepository;
        this.stationRepository = stationRepository;
        this.customerRepository = customerRepository;
        this.shiftRepository = shiftRepository;
        this.dataSource = dataSource;
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
        this.eventEmitter = eventEmitter;
    }
    async create(createTransactionDto, tenantId) {
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
                throw new common_1.NotFoundException('Station not found');
            }
            const pump = await this.pumpRepository.findOne({
                where: { id: createTransactionDto.pumpId, stationId: station.id },
                relations: ['tank'],
            });
            if (!pump) {
                throw new common_1.NotFoundException('Pump not found');
            }
            if (!pump.isOperational()) {
                throw new common_1.BadRequestException('Pump is not operational');
            }
            const tank = pump.tank;
            if (!tank) {
                throw new common_1.NotFoundException('Tank not found');
            }
            // Check inventory availability
            const hasInventory = await this.inventoryService.checkAvailability(tank.id, createTransactionDto.quantity);
            if (!hasInventory) {
                throw new common_1.UnprocessableEntityException('Insufficient fuel inventory');
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
                id: (0, uuid_1.v4)(),
                tenantId,
                tankId: tank.id,
                shiftId: shift?.id,
                customerId: customer?.id,
                status: shared_types_1.TransactionStatus.PENDING,
                paymentStatus: shared_types_1.PaymentStatus.PENDING,
                transactionTime: new Date(),
                receiptNumber: this.generateReceiptNumber(),
            });
            // Calculate amounts (triggers @BeforeInsert hook)
            transaction.calculateAmounts();
            transaction.generateReceiptNumber();
            // Save transaction
            const savedTransaction = await queryRunner.manager.save(transaction);
            // Reserve inventory
            await this.inventoryService.reserveInventory(tank.id, createTransactionDto.quantity, savedTransaction.id);
            // Process payment if auto-process is enabled
            if (createTransactionDto.autoProcessPayment) {
                const paymentResult = await this.paymentService.processPayment({
                    transactionId: savedTransaction.id,
                    amount: savedTransaction.totalAmount,
                    method: createTransactionDto.paymentMethod,
                    details: createTransactionDto.paymentDetails,
                });
                if (paymentResult.success) {
                    savedTransaction.paymentStatus = shared_types_1.PaymentStatus.COMPLETED;
                    savedTransaction.paymentReference = paymentResult.reference;
                    savedTransaction.paymentProcessedAt = new Date();
                    savedTransaction.status = shared_types_1.TransactionStatus.COMPLETED;
                    // Deduct inventory
                    await this.inventoryService.deductInventory(tank.id, createTransactionDto.quantity, savedTransaction.id);
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
        }
        catch (error) {
            // Rollback the transaction
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            // Release the query runner
            await queryRunner.release();
        }
    }
    async findAll(query, tenantId) {
        const { page = 1, limit = 20, startDate, endDate, status, paymentStatus, stationId } = query;
        const whereConditions = { tenantId };
        if (startDate && endDate) {
            whereConditions.transactionTime = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
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
    async findOne(id, tenantId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, tenantId },
            relations: ['station', 'pump', 'tank', 'customer', 'attendant', 'shift'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async complete(id, tenantId) {
        const transaction = await this.findOne(id, tenantId);
        if (transaction.status !== shared_types_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException('Transaction is not in pending status');
        }
        transaction.status = shared_types_1.TransactionStatus.COMPLETED;
        if (transaction.paymentStatus === shared_types_1.PaymentStatus.PENDING) {
            transaction.paymentStatus = shared_types_1.PaymentStatus.COMPLETED;
            transaction.paymentProcessedAt = new Date();
        }
        // Deduct inventory
        await this.inventoryService.deductInventory(transaction.tankId, transaction.quantityLiters, transaction.id);
        const updatedTransaction = await this.transactionRepository.save(transaction);
        // Emit event
        this.eventEmitter.emit('transaction.completed', {
            transactionId: updatedTransaction.id,
            stationId: updatedTransaction.stationId,
            amount: updatedTransaction.totalAmount,
        });
        return updatedTransaction;
    }
    async cancel(id, reason, tenantId) {
        const transaction = await this.findOne(id, tenantId);
        if (transaction.status === shared_types_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed transaction');
        }
        transaction.status = shared_types_1.TransactionStatus.CANCELLED;
        // Release reserved inventory if transaction was pending
        if (transaction.status === shared_types_1.TransactionStatus.PENDING) {
            await this.inventoryService.releaseInventory(transaction.tankId, transaction.quantityLiters, transaction.id);
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
    async refund(id, amount, reason, tenantId) {
        const transaction = await this.findOne(id, tenantId);
        if (!transaction.canBeRefunded()) {
            throw new common_1.BadRequestException('Transaction cannot be refunded');
        }
        const refundAmount = amount || transaction.totalAmount;
        // Process refund through payment service
        const refundResult = await this.paymentService.refundPayment({
            transactionId: transaction.id,
            amount: refundAmount,
            reason,
        });
        if (refundResult.success) {
            transaction.paymentStatus = shared_types_1.PaymentStatus.REFUNDED;
            transaction.status = shared_types_1.TransactionStatus.CANCELLED;
            // Return inventory
            await this.inventoryService.returnInventory(transaction.tankId, transaction.quantityLiters, transaction.id);
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
    async findByStation(stationId, query, tenantId) {
        return this.findAll({ ...query, stationId }, tenantId);
    }
    async findByCustomer(customerId, query, tenantId) {
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
    async getDailySummary(date, tenantId) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const transactions = await this.transactionRepository.find({
            where: {
                tenantId,
                transactionTime: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: shared_types_1.TransactionStatus.COMPLETED,
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
    generateReceiptNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RCP${timestamp}${random}`;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.Tank)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.Pump)),
    __param(3, (0, typeorm_1.InjectRepository)(database_1.Station)),
    __param(4, (0, typeorm_1.InjectRepository)(database_1.Customer)),
    __param(5, (0, typeorm_1.InjectRepository)(database_1.Shift)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        inventory_service_1.InventoryService,
        payment_service_1.PaymentService,
        event_emitter_1.EventEmitter2])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map