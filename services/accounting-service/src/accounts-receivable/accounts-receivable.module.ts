import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsReceivableService } from './accounts-receivable.service';
import { ARController } from './ar.controller';
import { CreditManagementService } from './credit-management.service';
import { CollectionsService } from './collections.service';
import { ARAgingService } from './ar-aging.service';
import { BadDebtService } from './bad-debt.service';
import { PaymentAllocationService } from './payment-allocation.service';

// AR Entities
import { Customer } from './entities/customer.entity';
import { ARInvoice } from './entities/ar-invoice.entity';
import { ARInvoiceLine } from './entities/ar-invoice-line.entity';
import { CustomerPayment } from './entities/customer-payment.entity';
import { PaymentApplication } from './entities/payment-application.entity';
import { CreditLimit } from './entities/credit-limit.entity';
import { ARStatement } from './entities/ar-statement.entity';
import { BadDebtProvision } from './entities/bad-debt-provision.entity';
import { CollectionActivity } from './entities/collection-activity.entity';
import { ARDunningLevel } from './entities/ar-dunning-level.entity';
import { CustomerCreditRating } from './entities/customer-credit-rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      ARInvoice,
      ARInvoiceLine,
      CustomerPayment,
      PaymentApplication,
      CreditLimit,
      ARStatement,
      BadDebtProvision,
      CollectionActivity,
      ARDunningLevel,
      CustomerCreditRating,
    ]),
  ],
  controllers: [ARController],
  providers: [
    AccountsReceivableService,
    CreditManagementService,
    CollectionsService,
    ARAgingService,
    BadDebtService,
    PaymentAllocationService,
  ],
  exports: [
    AccountsReceivableService,
    CreditManagementService,
    CollectionsService,
    ARAgingService,
    BadDebtService,
    PaymentAllocationService,
  ],
})
export class AccountsReceivableModule {}