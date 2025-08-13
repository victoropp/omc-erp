import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxManagementService } from './tax-management.service';
import { TaxController } from './tax.controller';
import { CorporateIncomeTaxService } from './corporate-income-tax.service';
import { VATManagementService } from './vat-management.service';
import { WithholdingTaxService } from './withholding-tax.service';
import { TaxComplianceService } from './tax-compliance.service';
import { GRAIntegrationService } from './gra-integration.service';

// Tax Entities
import { TaxConfiguration } from './entities/tax-configuration.entity';
import { TaxCalculation } from './entities/tax-calculation.entity';
import { TaxPayment } from './entities/tax-payment.entity';
import { TaxReturn } from './entities/tax-return.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaxConfiguration,
      TaxCalculation,
      TaxPayment,
      TaxReturn,
    ]),
  ],
  controllers: [TaxController],
  providers: [
    TaxManagementService,
    CorporateIncomeTaxService,
    VATManagementService,
    WithholdingTaxService,
    TaxComplianceService,
    GRAIntegrationService,
  ],
  exports: [
    TaxManagementService,
    CorporateIncomeTaxService,
    VATManagementService,
    WithholdingTaxService,
    TaxComplianceService,
    GRAIntegrationService,
  ],
})
export class TaxManagementModule {}