import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankCashService } from './bank-cash.service';
import { BankCashController } from './bank-cash.controller';
import { BankReconciliationService } from './bank-reconciliation.service';
import { CashFlowService } from './cash-flow.service';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { CashTransaction } from './entities/cash-transaction.entity';
import { BankReconciliation } from './entities/bank-reconciliation.entity';
import { CheckRegister } from './entities/check-register.entity';
import { CashPosition } from './entities/cash-position.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankAccount,
      BankTransaction,
      CashTransaction,
      BankReconciliation,
      CheckRegister,
      CashPosition,
    ]),
  ],
  controllers: [BankCashController],
  providers: [
    BankCashService,
    BankReconciliationService,
    CashFlowService,
  ],
  exports: [
    BankCashService,
    BankReconciliationService,
    CashFlowService,
  ],
})
export class BankCashModule {}