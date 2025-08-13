import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

import { CostCenter, CostCenterType, CostCenterStatus } from './entities/cost-center.entity';
import { CostAllocation, AllocationMethod, AllocationBasis, AllocationStatus } from './entities/cost-allocation.entity';
import { CostBudget, BudgetType, BudgetStatus, CostCategory } from './entities/cost-budget.entity';

export interface CostCenterData {
  tenantId: string;
  costCenterCode: string;
  costCenterName: string;
  costCenterType: CostCenterType;
  department?: string;
  managerId?: string;
  budgetAmount?: number;
  createdBy: string;
}

export interface CostAllocationData {
  tenantId: string;
  sourceCostCenterId: string;
  targetCostCenterId: string;
  allocationMethod: AllocationMethod;
  allocationBasis: AllocationBasis;
  sourceAmount: number;
  allocationPercentage: number;
  allocationPeriod: string;
  createdBy: string;
}

export interface CostBudgetData {
  tenantId: string;
  costCenterId: string;
  budgetName: string;
  budgetType: BudgetType;
  costCategory: CostCategory;
  budgetYear: string;
  budgetPeriod: string;
  budgetedAmount: number;
  periodStartDate: Date;
  periodEndDate: Date;
  createdBy: string;
}

export interface CostAnalysis {
  tenantId: string;
  analysisDate: Date;
  totalCosts: number;
  costByType: Array<{
    costCenterType: CostCenterType;
    totalCost: number;
    percentage: number;
  }>;
  costByCategory: Array<{
    category: string;
    totalCost: number;
    budgetedAmount: number;
    variance: number;
    variancePercentage: number;
  }>;
  topCostCenters: Array<{
    costCenterId: string;
    costCenterName: string;
    totalCost: number;
    budgetVariance: number;
  }>;
  trends: Array<{
    period: string;
    totalCosts: number;
    budgetedAmount: number;
    variance: number;
  }>;
}

export interface ABCAnalysis {
  activities: Array<{
    activityName: string;
    totalCost: number;
    activityRate: number;
    resourceConsumption: number;
    costDrivers: Array<{
      driverName: string;
      driverValue: number;
      costPerDriver: number;
    }>;
  }>;
  products: Array<{
    productName: string;
    totalActivityCost: number;
    activityConsumption: Array<{
      activityName: string;
      consumption: number;
      cost: number;
    }>;
  }>;
}

@Injectable()
export class CostManagementService {
  private readonly logger = new Logger(CostManagementService.name);

  constructor(
    @InjectRepository(CostCenter)
    private costCenterRepo: Repository<CostCenter>,
    @InjectRepository(CostAllocation)
    private costAllocationRepo: Repository<CostAllocation>,
    @InjectRepository(CostBudget)
    private costBudgetRepo: Repository<CostBudget>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== COST CENTER MANAGEMENT =====

  async createCostCenter(data: CostCenterData): Promise<CostCenter> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if cost center code already exists
      const existingCenter = await this.costCenterRepo.findOne({
        where: { costCenterCode: data.costCenterCode }
      });

      if (existingCenter) {
        throw new BadRequestException('Cost center code already exists');
      }

      // Create cost center with Ghana OMC specific defaults
      const costCenter = this.costCenterRepo.create({
        ...data,
        status: CostCenterStatus.ACTIVE,
        effectiveFromDate: new Date(),
        hierarchyLevel: 1,
        currency: 'GHS',
        primaryCostBehavior: this.getDefaultCostBehavior(data.costCenterType),
        activityMeasure: this.getDefaultActivityMeasure(data.costCenterType),
        npaComplianceStatus: 'COMPLIANT',
        environmentalComplianceScore: 85, // Default good score
        safetyIncidentRate: 0,
        kpiDashboardEnabled: true,
        automatedAlertsEnabled: true,
        varianceThresholdPercentage: 10,
      });

      const savedCostCenter = await queryRunner.manager.save(costCenter);

      // Create default budget if budget amount provided
      if (data.budgetAmount && data.budgetAmount > 0) {
        await this.createDefaultBudget(queryRunner, savedCostCenter, data.budgetAmount, data.createdBy);
      }

      await queryRunner.commitTransaction();

      // Emit cost center created event
      this.eventEmitter.emit('cost-center.created', {
        costCenterId: savedCostCenter.id,
        costCenterCode: savedCostCenter.costCenterCode,
        costCenterType: data.costCenterType,
        tenantId: data.tenantId,
      });

      this.logger.log(`Cost center created: ${data.costCenterCode} - ${data.costCenterName}`);
      return savedCostCenter;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCostCenters(
    tenantId: string,
    costCenterType?: CostCenterType,
    status?: CostCenterStatus,
    includeChildren: boolean = false
  ): Promise<CostCenter[]> {
    const query = this.costCenterRepo.createQueryBuilder('cc')
      .where('cc.tenantId = :tenantId', { tenantId })
      .orderBy('cc.costCenterCode', 'ASC');

    if (costCenterType) {
      query.andWhere('cc.costCenterType = :costCenterType', { costCenterType });
    }

    if (status) {
      query.andWhere('cc.status = :status', { status });
    }

    if (includeChildren) {
      query.leftJoinAndSelect('cc.children', 'children');
    }

    return query.getMany();
  }

  async updateCostCenterActuals(
    costCenterId: string,
    actualCost: number,
    period: string
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const costCenter = await this.costCenterRepo.findOne({ where: { id: costCenterId } });
      if (!costCenter) {
        throw new NotFoundException('Cost center not found');
      }

      const newTotalActual = costCenter.actualCost + actualCost;
      const varianceAmount = newTotalActual - costCenter.budgetAmount;
      const variancePercentage = costCenter.budgetAmount > 0 ? 
        (varianceAmount / costCenter.budgetAmount) * 100 : 0;

      await queryRunner.manager.update(
        CostCenter,
        { id: costCenterId },
        {
          actualCost: newTotalActual,
          varianceAmount,
          variancePercentage,
          lastActivityDate: new Date(),
          lastCostCalculationDate: new Date(),
          updatedAt: new Date(),
        }
      );

      // Check if variance exceeds threshold and send alerts
      if (Math.abs(variancePercentage) > costCenter.varianceThresholdPercentage) {
        await this.sendVarianceAlert(costCenter, variancePercentage);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Cost center actuals updated: ${costCenter.costCenterCode}, Actual: GHS ${newTotalActual}, Variance: ${variancePercentage.toFixed(2)}%`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== COST ALLOCATION =====

  async createCostAllocation(data: CostAllocationData): Promise<CostAllocation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate source and target cost centers
      const [sourceCenter, targetCenter] = await Promise.all([
        this.costCenterRepo.findOne({ where: { id: data.sourceCostCenterId } }),
        this.costCenterRepo.findOne({ where: { id: data.targetCostCenterId } })
      ]);

      if (!sourceCenter || !targetCenter) {
        throw new NotFoundException('Source or target cost center not found');
      }

      // Generate allocation number
      const allocationNumber = await this.generateAllocationNumber(queryRunner, new Date());

      // Calculate allocated amount
      const allocatedAmount = data.sourceAmount * (data.allocationPercentage / 100);

      // Create cost allocation
      const allocation = this.costAllocationRepo.create({
        ...data,
        allocationNumber,
        allocatedAmount,
        description: `Cost allocation from ${sourceCenter.costCenterName} to ${targetCenter.costCenterName}`,
        allocationDate: new Date(),
        effectiveFromDate: new Date(),
        status: AllocationStatus.ACTIVE,
        currency: 'GHS',
      });

      const savedAllocation = await queryRunner.manager.save(allocation);

      // Update cost center balances
      await this.updateCostCenterAllocations(queryRunner, data.sourceCostCenterId, data.targetCostCenterId, allocatedAmount);

      // Create journal entry for allocation
      await this.createAllocationJournalEntry(queryRunner, savedAllocation);

      await queryRunner.commitTransaction();

      // Emit allocation created event
      this.eventEmitter.emit('cost-allocation.created', {
        allocationId: savedAllocation.id,
        sourceCenter: sourceCenter.costCenterName,
        targetCenter: targetCenter.costCenterName,
        amount: allocatedAmount,
      });

      this.logger.log(`Cost allocation created: ${allocationNumber}, Amount: GHS ${allocatedAmount}`);
      return savedAllocation;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processCostAllocations(tenantId: string, allocationPeriod: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get all active allocations for the period
      const allocations = await this.costAllocationRepo.find({
        where: {
          tenantId,
          allocationPeriod,
          status: AllocationStatus.ACTIVE,
          isRecurring: true,
        },
        relations: ['sourceCostCenter', 'targetCostCenter']
      });

      let totalAllocated = 0;
      let processedCount = 0;

      for (const allocation of allocations) {
        try {
          // Calculate current period allocation based on actual costs
          const currentSourceAmount = await this.getCurrentPeriodCosts(
            allocation.sourceCostCenterId, 
            allocationPeriod
          );

          const currentAllocatedAmount = currentSourceAmount * (allocation.allocationPercentage / 100);

          // Update allocation amounts
          await queryRunner.manager.update(
            CostAllocation,
            { id: allocation.id },
            {
              sourceAmount: currentSourceAmount,
              allocatedAmount: currentAllocatedAmount,
              status: AllocationStatus.PROCESSED,
              processingDate: new Date(),
              processedBy: 'system',
            }
          );

          // Update cost center balances
          await this.updateCostCenterAllocations(
            queryRunner,
            allocation.sourceCostCenterId,
            allocation.targetCostCenterId,
            currentAllocatedAmount
          );

          totalAllocated += currentAllocatedAmount;
          processedCount++;

        } catch (error) {
          this.logger.error(`Failed to process allocation ${allocation.allocationNumber}: ${error.message}`);
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Processed ${processedCount} cost allocations for period ${allocationPeriod}, Total allocated: GHS ${totalAllocated}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== BUDGET MANAGEMENT =====

  async createCostBudget(data: CostBudgetData): Promise<CostBudget> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const costCenter = await this.costCenterRepo.findOne({ where: { id: data.costCenterId } });
      if (!costCenter) {
        throw new NotFoundException('Cost center not found');
      }

      // Generate budget number
      const budgetNumber = await this.generateBudgetNumber(queryRunner, data.budgetYear);

      // Create budget with Ghana OMC specific allocations
      const budget = this.costBudgetRepo.create({
        ...data,
        budgetNumber,
        availableAmount: data.budgetedAmount,
        status: BudgetStatus.DRAFT,
        currency: 'GHS',
        periodType: this.determinePeriodType(data.budgetPeriod),
        budgetMethod: 'ACTIVITY_BASED', // Default for OMC operations
        
        // Ghana OMC specific budget allocations (10% each for compliance areas)
        environmentalComplianceBudget: data.budgetedAmount * 0.10,
        safetyTrainingBudget: data.budgetedAmount * 0.10,
        npaComplianceBudget: data.budgetedAmount * 0.05,
        equipmentMaintenanceBudget: data.budgetedAmount * 0.15,
        fuelQualityTestingBudget: data.budgetedAmount * 0.05,
        
        budgetControlEnabled: true,
        overspendAllowed: false,
        varianceThresholdPercentage: 15,
      });

      const savedBudget = await queryRunner.manager.save(budget);

      // Update cost center budget amount
      await queryRunner.manager.update(
        CostCenter,
        { id: data.costCenterId },
        {
          budgetAmount: costCenter.budgetAmount + data.budgetedAmount,
          lastBudgetUpdateDate: new Date(),
        }
      );

      await queryRunner.commitTransaction();

      // Emit budget created event
      this.eventEmitter.emit('cost-budget.created', {
        budgetId: savedBudget.id,
        budgetNumber,
        costCenterName: costCenter.costCenterName,
        budgetedAmount: data.budgetedAmount,
      });

      this.logger.log(`Cost budget created: ${budgetNumber}, Amount: GHS ${data.budgetedAmount}`);
      return savedBudget;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== COST ANALYSIS AND REPORTING =====

  async generateCostAnalysis(tenantId: string, period: string): Promise<CostAnalysis> {
    // Get total costs
    const totalCostsResult = await this.costCenterRepo
      .createQueryBuilder('cc')
      .select('COALESCE(SUM(cc.actual_cost), 0)', 'total')
      .where('cc.tenant_id = :tenantId', { tenantId })
      .andWhere('cc.status = :status', { status: CostCenterStatus.ACTIVE })
      .getRawOne();

    const totalCosts = parseFloat(totalCostsResult.total || 0);

    // Get cost by type
    const costByType = await this.costCenterRepo
      .createQueryBuilder('cc')
      .select([
        'cc.cost_center_type as type',
        'COALESCE(SUM(cc.actual_cost), 0) as total_cost'
      ])
      .where('cc.tenant_id = :tenantId', { tenantId })
      .andWhere('cc.status = :status', { status: CostCenterStatus.ACTIVE })
      .groupBy('cc.cost_center_type')
      .getRawMany();

    // Get cost by category (from budgets)
    const costByCategory = await this.costBudgetRepo
      .createQueryBuilder('cb')
      .select([
        'cb.cost_category as category',
        'COALESCE(SUM(cb.actual_amount), 0) as total_cost',
        'COALESCE(SUM(cb.budgeted_amount), 0) as budgeted_amount',
        'COALESCE(SUM(cb.budget_variance), 0) as variance'
      ])
      .where('cb.tenant_id = :tenantId', { tenantId })
      .andWhere('cb.budget_period = :period', { period })
      .andWhere('cb.status = :status', { status: BudgetStatus.ACTIVE })
      .groupBy('cb.cost_category')
      .getRawMany();

    // Get top cost centers
    const topCostCenters = await this.costCenterRepo
      .createQueryBuilder('cc')
      .select([
        'cc.id as cost_center_id',
        'cc.cost_center_name as cost_center_name',
        'cc.actual_cost as total_cost',
        'cc.variance_amount as budget_variance'
      ])
      .where('cc.tenant_id = :tenantId', { tenantId })
      .andWhere('cc.status = :status', { status: CostCenterStatus.ACTIVE })
      .orderBy('cc.actual_cost', 'DESC')
      .limit(10)
      .getRawMany();

    // Get trends (last 12 periods)
    const trends = await this.getCostTrends(tenantId, 12);

    return {
      tenantId,
      analysisDate: new Date(),
      totalCosts,
      costByType: costByType.map(row => ({
        costCenterType: row.type as CostCenterType,
        totalCost: parseFloat(row.total_cost || 0),
        percentage: totalCosts > 0 ? (parseFloat(row.total_cost || 0) / totalCosts) * 100 : 0,
      })),
      costByCategory: costByCategory.map(row => ({
        category: row.category,
        totalCost: parseFloat(row.total_cost || 0),
        budgetedAmount: parseFloat(row.budgeted_amount || 0),
        variance: parseFloat(row.variance || 0),
        variancePercentage: parseFloat(row.budgeted_amount || 0) > 0 ? 
          (parseFloat(row.variance || 0) / parseFloat(row.budgeted_amount || 0)) * 100 : 0,
      })),
      topCostCenters: topCostCenters.map(row => ({
        costCenterId: row.cost_center_id,
        costCenterName: row.cost_center_name,
        totalCost: parseFloat(row.total_cost || 0),
        budgetVariance: parseFloat(row.budget_variance || 0),
      })),
      trends,
    };
  }

  async performABCAnalysis(tenantId: string, period: string): Promise<ABCAnalysis> {
    // This is a simplified ABC analysis - in practice, would be more complex
    const activities = await this.getActivityCosts(tenantId, period);
    const products = await this.getProductCosts(tenantId, period);

    return {
      activities,
      products,
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyCostProcesses(): Promise<void> {
    this.logger.log('Starting daily cost management processes');

    try {
      // Update cost center actuals from GL
      await this.updateCostCenterActualsFromGL();

      // Process pending cost allocations
      await this.processPendingAllocations();

      // Calculate cost variances
      await this.calculateDailyCostVariances();

      // Send variance alerts
      await this.sendVarianceAlerts();

      this.logger.log('Daily cost management processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily cost processes:', error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyCostProcesses(): Promise<void> {
    this.logger.log('Starting monthly cost management processes');

    try {
      const currentPeriod = format(new Date(), 'yyyy-MM');

      // Process monthly cost allocations
      await this.processMonthlyAllocations(currentPeriod);

      // Update budget vs actual analysis
      await this.updateBudgetAnalysis(currentPeriod);

      // Generate cost performance reports
      await this.generateMonthlyCostReports(currentPeriod);

      // Update cost center performance metrics
      await this.updateCostCenterPerformanceMetrics();

      this.logger.log('Monthly cost management processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly cost processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private getDefaultCostBehavior(costCenterType: CostCenterType): any {
    const fixedCostTypes = [CostCenterType.ADMINISTRATIVE, CostCenterType.FINANCE];
    return fixedCostTypes.includes(costCenterType) ? 'FIXED' : 'VARIABLE';
  }

  private getDefaultActivityMeasure(costCenterType: CostCenterType): string {
    const measures = {
      [CostCenterType.PRODUCTION]: 'LITERS_PRODUCED',
      [CostCenterType.DISTRIBUTION]: 'LITERS_DISTRIBUTED',
      [CostCenterType.MAINTENANCE]: 'MAINTENANCE_HOURS',
      [CostCenterType.QUALITY_CONTROL]: 'TESTS_PERFORMED',
      [CostCenterType.ADMINISTRATIVE]: 'EMPLOYEES',
    };
    return measures[costCenterType] || 'TRANSACTIONS';
  }

  private determinePeriodType(budgetPeriod: string): any {
    if (budgetPeriod.includes('-Q')) return 'QUARTERLY';
    if (budgetPeriod.includes('-')) return 'MONTHLY';
    return 'ANNUAL';
  }

  private async generateAllocationNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM cost_allocations WHERE allocation_number LIKE $1`,
      [`ALLOC-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `ALLOC-${yearMonth}-${sequence}`;
  }

  private async generateBudgetNumber(queryRunner: QueryRunner, budgetYear: string): Promise<string> {
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM cost_budgets WHERE budget_number LIKE $1`,
      [`BUD-${budgetYear}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `BUD-${budgetYear}-${sequence}`;
  }

  // Placeholder methods for complex processes
  private async createDefaultBudget(queryRunner: QueryRunner, costCenter: CostCenter, amount: number, createdBy: string): Promise<void> {}
  private async sendVarianceAlert(costCenter: CostCenter, variancePercentage: number): Promise<void> {}
  private async updateCostCenterAllocations(queryRunner: QueryRunner, sourceCenterId: string, targetCenterId: string, amount: number): Promise<void> {}
  private async createAllocationJournalEntry(queryRunner: QueryRunner, allocation: CostAllocation): Promise<void> {}
  private async getCurrentPeriodCosts(costCenterId: string, period: string): Promise<number> { return 0; }
  private async getCostTrends(tenantId: string, periods: number): Promise<any[]> { return []; }
  private async getActivityCosts(tenantId: string, period: string): Promise<any[]> { return []; }
  private async getProductCosts(tenantId: string, period: string): Promise<any[]> { return []; }
  private async updateCostCenterActualsFromGL(): Promise<void> {}
  private async processPendingAllocations(): Promise<void> {}
  private async calculateDailyCostVariances(): Promise<void> {}
  private async sendVarianceAlerts(): Promise<void> {}
  private async processMonthlyAllocations(period: string): Promise<void> {}
  private async updateBudgetAnalysis(period: string): Promise<void> {}
  private async generateMonthlyCostReports(period: string): Promise<void> {}
  private async updateCostCenterPerformanceMetrics(): Promise<void> {}
}