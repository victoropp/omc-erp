import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsPayableService } from './accounts-payable.service';
import { APController } from './ap.controller';
import { VendorManagementService } from './vendor-management.service';
import { PurchaseOrderService } from './purchase-order.service';
import { InvoiceMatchingService } from './invoice-matching.service';
import { PaymentProcessingService } from './payment-processing.service';
import { CashFlowService } from './cash-flow.service';

// AP Entities
import { Vendor } from './entities/vendor.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import { APInvoice } from './entities/ap-invoice.entity';
import { APInvoiceLine } from './entities/ap-invoice-line.entity';
import { VendorPayment } from './entities/vendor-payment.entity';
import { PaymentRun } from './entities/payment-run.entity';
import { ThreeWayMatch } from './entities/three-way-match.entity';
import { VendorContract } from './entities/vendor-contract.entity';
import { VendorEvaluation } from './entities/vendor-evaluation.entity';
import { CashFlowForecast } from './entities/cash-flow-forecast.entity';
import { PaymentApproval } from './entities/payment-approval.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      PurchaseOrder,
      PurchaseOrderLine,
      APInvoice,
      APInvoiceLine,
      VendorPayment,
      PaymentRun,
      ThreeWayMatch,
      VendorContract,
      VendorEvaluation,
      CashFlowForecast,
      PaymentApproval,
    ]),
  ],
  controllers: [APController],
  providers: [
    AccountsPayableService,
    VendorManagementService,
    PurchaseOrderService,
    InvoiceMatchingService,
    PaymentProcessingService,
    CashFlowService,
  ],
  exports: [
    AccountsPayableService,
    VendorManagementService,
    PurchaseOrderService,
    InvoiceMatchingService,
    PaymentProcessingService,
    CashFlowService,
  ],
})
export class AccountsPayableModule {}