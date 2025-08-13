import { Module } from '@nestjs/common';
import { IFRSComplianceService } from './ifrs-compliance.service';
import { IFRSComplianceController } from './ifrs-compliance.controller';

@Module({
  controllers: [IFRSComplianceController],
  providers: [IFRSComplianceService],
  exports: [IFRSComplianceService],
})
export class IFRSComplianceModule {}