import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostManagementService } from './cost-management.service';
import { CostManagementController } from './cost-management.controller';
import { CostAllocationService } from './cost-allocation.service';
import { CostBudgetService } from './cost-budget.service';
import { CostAnalyticsService } from './cost-analytics.service';
import { ABCCostingService } from './abc-costing.service';

// Cost Management Entities
import { CostCenter } from './entities/cost-center.entity';
import { CostAllocation } from './entities/cost-allocation.entity';
import { CostBudget } from './entities/cost-budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CostCenter,
      CostAllocation,
      CostBudget,
    ]),
  ],
  controllers: [CostManagementController],
  providers: [
    CostManagementService,
    CostAllocationService,
    CostBudgetService,
    CostAnalyticsService,
    ABCCostingService,
  ],
  exports: [
    CostManagementService,
    CostAllocationService,
    CostBudgetService,
    CostAnalyticsService,
    ABCCostingService,
  ],
})
export class CostManagementModule {}