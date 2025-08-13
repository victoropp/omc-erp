import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, startOfMonth, endOfMonth, addDays, differenceInDays } from 'date-fns';

import { Customer, CustomerType, CustomerStatus, PaymentTerms } from './entities/customer.entity';
import { ARInvoice } from './entities/ar-invoice.entity';
import { CustomerPayment } from './entities/customer-payment.entity';
import { CreditLimit } from './entities/credit-limit.entity';
import { BadDebtProvision } from './entities/bad-debt-provision.entity';

export interface CustomerData {
  tenantId: string;
  customerName: string;
  customerType: CustomerType;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  currency?: string;
  createdBy: string;
}

export interface InvoiceData {
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  terms: PaymentTerms;
  description: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency?: string;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxCode?: string;
    taxAmount?: number;
    accountCode: string;
  }>;
}

export interface PaymentData {
  customerId: string;
  paymentDate: Date;
  paymentAmount: number;
  paymentMethod: string;
  referenceNumber?: string;
  currency?: string;
  bankAccount?: string;
  invoiceAllocations?: Array<{
    invoiceId: string;
    allocationAmount: number;
  }>;
}

export interface ARAgingReport {
  tenantId: string;
  asOfDate: Date;
  currency: string;
  summary: {
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
  };
  customers: Array<{
    customerId: string;
    customerName: string;
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
    creditLimit: number;
    availableCredit: number;
    overdueAmount: number;
    daysSalesOutstanding: number;
    riskCategory: string;
  }>;
}

@Injectable()
export class AccountsReceivableService {
  private readonly logger = new Logger(AccountsReceivableService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(ARInvoice)
    private invoiceRepo: Repository<ARInvoice>,
    @InjectRepository(CustomerPayment)
    private paymentRepo: Repository<CustomerPayment>,
    @InjectRepository(CreditLimit)
    private creditLimitRepo: Repository<CreditLimit>,
    @InjectRepository(BadDebtProvision)
    private badDebtRepo: Repository<BadDebtProvision>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== CUSTOMER MANAGEMENT =====

  async createCustomer(data: CustomerData): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate customer number
      const customerNumber = await this.generateCustomerNumber(queryRunner, data.customerType);

      // Create customer
      const customer = this.customerRepo.create({
        ...data,
        customerNumber,
        status: CustomerStatus.ACTIVE,
        availableCredit: data.creditLimit || 0,
        customerSince: new Date(),
        kycStatus: 'PENDING',
        paymentHistoryScore: 50, // Default neutral score
        riskCategory: 'MEDIUM',
        stageClassification: 'STAGE_1', // IFRS 9
      });

      const savedCustomer = await queryRunner.manager.save(customer);

      // Create initial credit limit record
      if (data.creditLimit && data.creditLimit > 0) {
        const creditLimit = this.creditLimitRepo.create({
          customerId: savedCustomer.id,
          tenantId: data.tenantId,
          creditLimit: data.creditLimit,
          currency: data.currency || 'GHS',
          effectiveDate: new Date(),
          approvedBy: data.createdBy,
          isActive: true,
        });
        await queryRunner.manager.save(creditLimit);
      }

      // Create corresponding GL customer account
      await this.createCustomerGLAccount(queryRunner, savedCustomer);

      await queryRunner.commitTransaction();

      // Emit customer created event
      this.eventEmitter.emit('customer.created', {
        customerId: savedCustomer.id,
        customerNumber: savedCustomer.customerNumber,
        customerName: savedCustomer.customerName,
        tenantId: data.tenantId,
      });

      this.logger.log(`Customer ${savedCustomer.customerNumber} created successfully`);
      return savedCustomer;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomers(
    tenantId: string,
    status?: CustomerStatus,
    customerType?: CustomerType
  ): Promise<Customer[]> {
    const query = this.customerRepo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .orderBy('c.customerName', 'ASC');

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    if (customerType) {
      query.andWhere('c.customerType = :customerType', { customerType });
    }

    return query.getMany();
  }

  async updateCustomerCreditLimit(
    customerId: string,
    newCreditLimit: number,
    approvedBy: string,
    effectiveDate?: Date
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await this.customerRepo.findOne({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Deactivate current credit limit
      await queryRunner.manager.update(
        CreditLimit,
        { customerId, isActive: true },
        { isActive: false, updatedAt: new Date() }
      );

      // Create new credit limit record
      const creditLimit = this.creditLimitRepo.create({
        customerId,
        tenantId: customer.tenantId,
        creditLimit: newCreditLimit,
        previousCreditLimit: customer.creditLimit,
        currency: customer.currency,
        effectiveDate: effectiveDate || new Date(),
        approvedBy,
        isActive: true,
      });
      await queryRunner.manager.save(creditLimit);

      // Update customer record
      const newAvailableCredit = newCreditLimit - customer.currentBalance;
      await queryRunner.manager.update(
        Customer,
        { id: customerId },
        { 
          creditLimit: newCreditLimit,
          availableCredit: newAvailableCredit,
          updatedAt: new Date(),
        }
      );

      await queryRunner.commitTransaction();

      // Emit credit limit change event
      this.eventEmitter.emit('customer.credit-limit-changed', {
        customerId,
        oldLimit: customer.creditLimit,
        newLimit: newCreditLimit,
        approvedBy,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== INVOICE MANAGEMENT =====

  async createInvoice(data: InvoiceData): Promise<ARInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer and credit limit
      const customer = await this.validateCustomerCredit(data.customerId, data.totalAmount);

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(queryRunner, new Date());

      // Create invoice
      const invoice = this.invoiceRepo.create({
        tenantId: customer.tenantId,
        customerId: data.customerId,
        invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        terms: data.terms,
        description: data.description,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        outstandingAmount: data.totalAmount,
        currency: data.currency || customer.currency,
        status: 'POSTED',
        createdBy: 'system', // Should come from auth context
      });

      const savedInvoice = await queryRunner.manager.save(invoice);

      // Create invoice lines
      for (const line of data.lines) {
        const invoiceLine = {
          invoiceId: savedInvoice.id,
          tenantId: customer.tenantId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
          taxCode: line.taxCode,
          taxAmount: line.taxAmount || 0,
          accountCode: line.accountCode,
        };
        await queryRunner.manager.save('ARInvoiceLine', invoiceLine);
      }

      // Update customer balance
      const newBalance = new Decimal(customer.currentBalance).plus(data.totalAmount);
      const newAvailableCredit = new Decimal(customer.creditLimit).minus(newBalance);

      await queryRunner.manager.update(
        Customer,
        { id: data.customerId },
        {
          currentBalance: newBalance.toNumber(),
          availableCredit: newAvailableCredit.toNumber(),
          updatedAt: new Date(),
        }
      );

      // Create journal entry for GL
      await this.createInvoiceJournalEntry(queryRunner, savedInvoice, customer, data.lines);

      await queryRunner.commitTransaction();

      // Emit invoice created event
      this.eventEmitter.emit('ar-invoice.created', {
        invoiceId: savedInvoice.id,
        customerId: data.customerId,
        amount: data.totalAmount,
        dueDate: data.dueDate,
      });

      this.logger.log(`AR Invoice ${invoiceNumber} created for customer ${customer.customerNumber}`);
      return savedInvoice;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerInvoices(
    customerId: string,
    status?: string,
    overdueDaysMin?: number
  ): Promise<ARInvoice[]> {
    const query = this.invoiceRepo.createQueryBuilder('inv')
      .where('inv.customerId = :customerId', { customerId })
      .orderBy('inv.invoiceDate', 'DESC');

    if (status) {
      query.andWhere('inv.status = :status', { status });
    }

    if (overdueDaysMin !== undefined) {
      const cutoffDate = addDays(new Date(), -overdueDaysMin);
      query.andWhere('inv.dueDate < :cutoffDate', { cutoffDate });
      query.andWhere('inv.outstandingAmount > 0');
    }

    return query.getMany();
  }

  // ===== PAYMENT PROCESSING =====

  async processCustomerPayment(data: PaymentData): Promise<CustomerPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await this.customerRepo.findOne({ where: { id: data.customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Generate payment number
      const paymentNumber = await this.generatePaymentNumber(queryRunner, data.paymentDate);

      // Create payment record
      const payment = this.paymentRepo.create({
        tenantId: customer.tenantId,
        customerId: data.customerId,
        paymentNumber,
        paymentDate: data.paymentDate,
        paymentAmount: data.paymentAmount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        currency: data.currency || customer.currency,
        bankAccount: data.bankAccount,
        status: 'CLEARED',
        createdBy: 'system', // Should come from auth context
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // Process invoice allocations
      let totalAllocated = 0;
      if (data.invoiceAllocations && data.invoiceAllocations.length > 0) {
        for (const allocation of data.invoiceAllocations) {
          await this.processPaymentAllocation(
            queryRunner,
            savedPayment.id,
            allocation.invoiceId,
            allocation.allocationAmount
          );
          totalAllocated += allocation.allocationAmount;
        }
      } else {
        // Auto-allocate to oldest invoices
        totalAllocated = await this.autoAllocatePayment(
          queryRunner,
          savedPayment.id,
          data.customerId,
          data.paymentAmount
        );
      }

      // Handle unapplied amount
      const unappliedAmount = data.paymentAmount - totalAllocated;
      if (unappliedAmount > 0) {
        await queryRunner.manager.update(
          CustomerPayment,
          { id: savedPayment.id },
          { unappliedAmount }
        );
      }

      // Update customer balance
      const newBalance = new Decimal(customer.currentBalance).minus(totalAllocated);
      const newAvailableCredit = new Decimal(customer.creditLimit).minus(newBalance);

      await queryRunner.manager.update(
        Customer,
        { id: data.customerId },
        {
          currentBalance: newBalance.toNumber(),
          availableCredit: newAvailableCredit.toNumber(),
          lastPaymentDate: data.paymentDate,
          lastPaymentAmount: data.paymentAmount,
          updatedAt: new Date(),
        }
      );

      // Create journal entry
      await this.createPaymentJournalEntry(queryRunner, savedPayment, customer);

      await queryRunner.commitTransaction();

      // Emit payment processed event
      this.eventEmitter.emit('ar-payment.processed', {
        paymentId: savedPayment.id,
        customerId: data.customerId,
        amount: data.paymentAmount,
        allocatedAmount: totalAllocated,
      });

      this.logger.log(`Payment ${paymentNumber} processed for customer ${customer.customerNumber}`);
      return savedPayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== AGING AND REPORTING =====

  async generateARAgingReport(
    tenantId: string,
    asOfDate?: Date,
    currency?: string
  ): Promise<ARAgingReport> {
    const reportDate = asOfDate || new Date();
    const reportCurrency = currency || 'GHS';

    // Get aging data from database
    const agingData = await this.dataSource.query(`
      WITH customer_aging AS (
        SELECT 
          c.id as customer_id,
          c.customer_name,
          c.credit_limit,
          c.available_credit,
          SUM(inv.outstanding_amount) as total_outstanding,
          SUM(CASE 
            WHEN CURRENT_DATE - inv.due_date <= 0 THEN inv.outstanding_amount 
            ELSE 0 
          END) as current_amount,
          SUM(CASE 
            WHEN CURRENT_DATE - inv.due_date BETWEEN 1 AND 30 THEN inv.outstanding_amount 
            ELSE 0 
          END) as days_30,
          SUM(CASE 
            WHEN CURRENT_DATE - inv.due_date BETWEEN 31 AND 60 THEN inv.outstanding_amount 
            ELSE 0 
          END) as days_60,
          SUM(CASE 
            WHEN CURRENT_DATE - inv.due_date BETWEEN 61 AND 90 THEN inv.outstanding_amount 
            ELSE 0 
          END) as days_90,
          SUM(CASE 
            WHEN CURRENT_DATE - inv.due_date > 90 THEN inv.outstanding_amount 
            ELSE 0 
          END) as days_120_plus,
          SUM(CASE 
            WHEN inv.due_date < CURRENT_DATE THEN inv.outstanding_amount 
            ELSE 0 
          END) as overdue_amount,
          AVG(CURRENT_DATE - inv.due_date) as avg_days_overdue
        FROM customers c
        LEFT JOIN ar_invoices inv ON inv.customer_id = c.id 
          AND inv.outstanding_amount > 0
          AND inv.invoice_date <= $2
        WHERE c.tenant_id = $1
          AND c.is_active = true
        GROUP BY c.id, c.customer_name, c.credit_limit, c.available_credit
      )
      SELECT 
        customer_id,
        customer_name,
        credit_limit,
        available_credit,
        COALESCE(total_outstanding, 0) as total_outstanding,
        COALESCE(current_amount, 0) as current_amount,
        COALESCE(days_30, 0) as days_30,
        COALESCE(days_60, 0) as days_60,
        COALESCE(days_90, 0) as days_90,
        COALESCE(days_120_plus, 0) as days_120_plus,
        COALESCE(overdue_amount, 0) as overdue_amount,
        COALESCE(avg_days_overdue, 0) as days_sales_outstanding
      FROM customer_aging
      ORDER BY total_outstanding DESC
    `, [tenantId, reportDate]);

    // Calculate summary totals
    const summary = agingData.reduce((acc, row) => ({
      totalOutstanding: acc.totalOutstanding + parseFloat(row.total_outstanding || 0),
      current: acc.current + parseFloat(row.current_amount || 0),
      days30: acc.days30 + parseFloat(row.days_30 || 0),
      days60: acc.days60 + parseFloat(row.days_60 || 0),
      days90: acc.days90 + parseFloat(row.days_90 || 0),
      days120Plus: acc.days120Plus + parseFloat(row.days_120_plus || 0),
    }), {
      totalOutstanding: 0,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      days120Plus: 0,
    });

    // Format customer data
    const customers = agingData.map(row => ({
      customerId: row.customer_id,
      customerName: row.customer_name,
      totalOutstanding: parseFloat(row.total_outstanding || 0),
      current: parseFloat(row.current_amount || 0),
      days30: parseFloat(row.days_30 || 0),
      days60: parseFloat(row.days_60 || 0),
      days90: parseFloat(row.days_90 || 0),
      days120Plus: parseFloat(row.days_120_plus || 0),
      creditLimit: parseFloat(row.credit_limit || 0),
      availableCredit: parseFloat(row.available_credit || 0),
      overdueAmount: parseFloat(row.overdue_amount || 0),
      daysSalesOutstanding: Math.round(parseFloat(row.days_sales_outstanding || 0)),
      riskCategory: this.calculateRiskCategory(
        parseFloat(row.overdue_amount || 0),
        parseFloat(row.total_outstanding || 0),
        Math.round(parseFloat(row.days_sales_outstanding || 0))
      ),
    }));

    return {
      tenantId,
      asOfDate: reportDate,
      currency: reportCurrency,
      summary,
      customers,
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyARProcesses(): Promise<void> {
    this.logger.log('Starting daily AR processes');

    try {
      // Update customer payment scores
      await this.updateCustomerPaymentScores();

      // Calculate expected credit losses (IFRS 9)
      await this.calculateExpectedCreditLosses();

      // Generate overdue notices
      await this.generateOverdueNotices();

      // Update customer risk categories
      await this.updateCustomerRiskCategories();

      this.logger.log('Daily AR processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily AR processes:', error);
    }
  }

  @Cron('0 0 1 * *') // First day of every month
  async monthlyARProcesses(): Promise<void> {
    this.logger.log('Starting monthly AR processes');

    try {
      // Generate customer statements
      await this.generateCustomerStatements();

      // Calculate DSO (Days Sales Outstanding)
      await this.calculateDaysSalesOutstanding();

      // Review and update credit limits
      await this.reviewCreditLimits();

      // Bad debt assessment
      await this.assessBadDebts();

      this.logger.log('Monthly AR processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly AR processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async generateCustomerNumber(
    queryRunner: QueryRunner,
    customerType: CustomerType
  ): Promise<string> {
    const prefix = this.getCustomerPrefix(customerType);
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM customers WHERE customer_number LIKE $1`,
      [`${prefix}%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `${prefix}${sequence}`;
  }

  private getCustomerPrefix(customerType: CustomerType): string {
    const prefixes = {
      'INDIVIDUAL': 'IND',
      'CORPORATE': 'COR',
      'GOVERNMENT': 'GOV',
      'NGO': 'NGO',
      'FUEL_DEALER': 'FD',
      'FLEET_OPERATOR': 'FO',
      'INDUSTRIAL': 'IND'
    };
    return prefixes[customerType] || 'CUS';
  }

  private async generateInvoiceNumber(
    queryRunner: QueryRunner,
    invoiceDate: Date
  ): Promise<string> {
    const yearMonth = format(invoiceDate, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM ar_invoices WHERE invoice_number LIKE $1`,
      [`INV-${yearMonth}-%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `INV-${yearMonth}-${sequence}`;
  }

  private async generatePaymentNumber(
    queryRunner: QueryRunner,
    paymentDate: Date
  ): Promise<string> {
    const yearMonth = format(paymentDate, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM customer_payments WHERE payment_number LIKE $1`,
      [`PAY-${yearMonth}-%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `PAY-${yearMonth}-${sequence}`;
  }

  private async validateCustomerCredit(
    customerId: string,
    amount: number
  ): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new BadRequestException('Customer is not active');
    }

    // Check credit limit
    const newBalance = new Decimal(customer.currentBalance).plus(amount);
    if (newBalance.toNumber() > customer.creditLimit && customer.creditLimit > 0) {
      throw new BadRequestException(
        `Transaction exceeds credit limit. Available credit: ${customer.availableCredit}`
      );
    }

    return customer;
  }

  private calculateRiskCategory(
    overdueAmount: number,
    totalOutstanding: number,
    daysSalesOutstanding: number
  ): string {
    if (overdueAmount === 0) return 'LOW';
    
    const overduePercentage = totalOutstanding > 0 ? (overdueAmount / totalOutstanding) * 100 : 0;
    
    if (overduePercentage > 50 || daysSalesOutstanding > 90) return 'CRITICAL';
    if (overduePercentage > 25 || daysSalesOutstanding > 60) return 'HIGH';
    if (overduePercentage > 10 || daysSalesOutstanding > 45) return 'MEDIUM';
    return 'LOW';
  }

  // Placeholder methods for complex processes
  private async createCustomerGLAccount(queryRunner: QueryRunner, customer: Customer): Promise<void> {}
  private async createInvoiceJournalEntry(queryRunner: QueryRunner, invoice: ARInvoice, customer: Customer, lines: any[]): Promise<void> {}
  private async createPaymentJournalEntry(queryRunner: QueryRunner, payment: CustomerPayment, customer: Customer): Promise<void> {}
  private async processPaymentAllocation(queryRunner: QueryRunner, paymentId: string, invoiceId: string, amount: number): Promise<void> {}
  private async autoAllocatePayment(queryRunner: QueryRunner, paymentId: string, customerId: string, amount: number): Promise<number> { return amount; }
  private async updateCustomerPaymentScores(): Promise<void> {}
  private async calculateExpectedCreditLosses(): Promise<void> {}
  private async generateOverdueNotices(): Promise<void> {}
  private async updateCustomerRiskCategories(): Promise<void> {}
  private async generateCustomerStatements(): Promise<void> {}
  private async calculateDaysSalesOutstanding(): Promise<void> {}
  private async reviewCreditLimits(): Promise<void> {}
  private async assessBadDebts(): Promise<void> {}
}