import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollCalculationService } from './payroll-calculation.service';
import { PayrollReportingService } from './payroll-reporting.service';
import { PayrollComplianceService } from './payroll-compliance.service';

// Payroll Entities
import { Payroll } from './entities/payroll.entity';
import { PayrollDeduction } from './entities/payroll-deduction.entity';
import { PayrollAllowance } from './entities/payroll-allowance.entity';

// Employee Entity
import { Employee } from '../employee/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      PayrollDeduction,
      PayrollAllowance,
      Employee,
    ]),
  ],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    PayrollCalculationService,
    PayrollReportingService,
    PayrollComplianceService,
  ],
  exports: [
    PayrollService,
    PayrollCalculationService,
    PayrollReportingService,
    PayrollComplianceService,
  ],
})
export class PayrollModule {}