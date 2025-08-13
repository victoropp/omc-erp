import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';

import { Project, ProjectType, ProjectStatus, RevenueRecognitionMethod } from './entities/project.entity';
import { ProjectTransaction, TransactionType, TransactionStatus, CostCategory } from './entities/project-transaction.entity';
import { ProjectWBS, WBSType, WBSStatus } from './entities/project-wbs.entity';

export interface ProjectData {
  tenantId: string;
  projectCode: string;
  projectName: string;
  projectType: ProjectType;
  startDate: Date;
  plannedEndDate: Date;
  totalBudget: number;
  customerId?: string;
  contractNumber?: string;
  projectManagerId?: string;
  createdBy: string;
}

export interface ProjectTransactionData {
  tenantId: string;
  projectId: string;
  wbsElementId?: string;
  transactionType: TransactionType;
  description: string;
  transactionDate: Date;
  amount: number;
  costCategory?: CostCategory;
  glAccount: string;
  employeeId?: string;
  vendorId?: string;
  createdBy: string;
}

export interface WBSData {
  tenantId: string;
  projectId: string;
  parentWbsId?: string;
  wbsCode: string;
  wbsName: string;
  wbsType: WBSType;
  budgetedCost: number;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  createdBy: string;
}

export interface ProjectPerformanceReport {
  projectId: string;
  projectName: string;
  reportDate: Date;
  
  // Schedule Performance
  plannedEndDate: Date;
  currentEndDate: Date;
  scheduleVarianceDays: number;
  schedulePerformanceIndex: number;
  
  // Cost Performance
  budgetedCost: number;
  actualCost: number;
  earnedValue: number;
  costVariance: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  
  // Progress
  percentComplete: number;
  physicalPercentComplete: number;
  
  // Revenue
  contractValue: number;
  billedAmount: number;
  recognizedRevenue: number;
  
  // Key Metrics
  overallHealth: string;
  riskLevel: string;
  criticalIssues: string[];
}

export interface PortfolioAnalysis {
  totalProjects: number;
  totalBudget: number;
  totalActualCost: number;
  totalEarnedValue: number;
  
  statusBreakdown: Array<{
    status: ProjectStatus;
    count: number;
    totalBudget: number;
    percentage: number;
  }>;
  
  typeBreakdown: Array<{
    type: ProjectType;
    count: number;
    totalBudget: number;
    avgCPI: number;
    avgSPI: number;
  }>;
  
  performanceMetrics: {
    avgCostPerformanceIndex: number;
    avgSchedulePerformanceIndex: number;
    projectsOverBudget: number;
    projectsBehindSchedule: number;
    projectsAtRisk: number;
  };
}

@Injectable()
export class ProjectAccountingService {
  private readonly logger = new Logger(ProjectAccountingService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectTransaction)
    private transactionRepo: Repository<ProjectTransaction>,
    @InjectRepository(ProjectWBS)
    private wbsRepo: Repository<ProjectWBS>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== PROJECT MANAGEMENT =====

  async createProject(data: ProjectData): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if project code already exists
      const existingProject = await this.projectRepo.findOne({
        where: { projectCode: data.projectCode }
      });

      if (existingProject) {
        throw new BadRequestException('Project code already exists');
      }

      // Calculate duration
      const durationDays = differenceInDays(data.plannedEndDate, data.startDate);

      // Create project with Ghana OMC specific defaults
      const project = this.projectRepo.create({
        ...data,
        durationDays,
        remainingDays: durationDays,
        approvedBudget: data.totalBudget,
        baselineBudget: data.totalBudget,
        availableAmount: data.totalBudget,
        currency: 'GHS',
        functionalCurrency: 'GHS',
        reportingCurrency: 'GHS',
        revenueRecognitionMethod: RevenueRecognitionMethod.PERCENTAGE_OF_COMPLETION,
        ifrsClassification: 'CAPITAL_PROJECT',
        localContentPercentage: this.calculateLocalContentRequirement(data.projectType),
        environmentalImpactAssessment: this.requiresEIA(data.projectType),
        epaPermitRequired: this.requiresEPAPermit(data.projectType),
        overallProjectHealth: 'GREEN',
        riskScore: 25, // Default low risk for new projects
      });

      const savedProject = await queryRunner.manager.save(project);

      // Create default WBS structure if needed
      if (savedProject.wbsEnabled) {
        await this.createDefaultWBSStructure(queryRunner, savedProject, data.createdBy);
      }

      // Create project GL accounts
      await this.createProjectGLAccounts(queryRunner, savedProject);

      await queryRunner.commitTransaction();

      // Emit project created event
      this.eventEmitter.emit('project.created', {
        projectId: savedProject.id,
        projectCode: savedProject.projectCode,
        projectType: data.projectType,
        totalBudget: data.totalBudget,
        tenantId: data.tenantId,
      });

      this.logger.log(`Project created: ${data.projectCode} - ${data.projectName}, Budget: GHS ${data.totalBudget}`);
      return savedProject;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProjectProgress(
    projectId: string,
    percentComplete: number,
    actualCost: number,
    updatedBy: string
  ): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await this.projectRepo.findOne({ where: { id: projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Calculate Earned Value Management metrics
      const earnedValue = (percentComplete / 100) * project.baselineBudget;
      const plannedValue = this.calculatePlannedValue(project);
      const costVariance = earnedValue - actualCost;
      const scheduleVariance = earnedValue - plannedValue;
      const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 1;
      const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 1;
      const estimateAtCompletion = actualCost + ((project.baselineBudget - earnedValue) / Math.max(costPerformanceIndex, 0.1));

      // Update project metrics
      const updatedProject = await queryRunner.manager.update(
        Project,
        { id: projectId },
        {
          percentComplete,
          actualCost,
          earnedValue,
          plannedValue,
          costVariance,
          budgetVariance: project.approvedBudget - actualCost,
          budgetVariancePercentage: project.approvedBudget > 0 ? 
            ((project.approvedBudget - actualCost) / project.approvedBudget) * 100 : 0,
          costPerformanceIndex,
          schedulePerformanceIndex,
          estimatedTotalCost: estimateAtCompletion,
          estimatedCostToComplete: Math.max(0, estimateAtCompletion - actualCost),
          overallProjectHealth: this.calculateProjectHealth(costPerformanceIndex, schedulePerformanceIndex),
          updatedBy,
          updatedAt: new Date(),
        }
      );

      // Update revenue recognition if applicable
      if (project.contractValue > 0) {
        const recognizedRevenue = (percentComplete / 100) * project.contractValue;
        await this.updateRevenueRecognition(queryRunner, projectId, recognizedRevenue);
      }

      await queryRunner.commitTransaction();

      // Emit progress updated event
      this.eventEmitter.emit('project.progress-updated', {
        projectId,
        percentComplete,
        actualCost,
        earnedValue,
        costPerformanceIndex,
        schedulePerformanceIndex,
      });

      const updatedProjectData = await this.projectRepo.findOne({ where: { id: projectId } });
      this.logger.log(`Project progress updated: ${project.projectCode}, ${percentComplete}% complete, CPI: ${costPerformanceIndex.toFixed(3)}, SPI: ${schedulePerformanceIndex.toFixed(3)}`);
      
      return updatedProjectData!;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== TRANSACTION MANAGEMENT =====

  async createProjectTransaction(data: ProjectTransactionData): Promise<ProjectTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await this.projectRepo.findOne({ where: { id: data.projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(queryRunner, data.transactionDate);

      // Create transaction
      const transaction = this.transactionRepo.create({
        ...data,
        transactionNumber,
        period: format(data.transactionDate, 'yyyy-MM'),
        fiscalYear: data.transactionDate.getFullYear().toString(),
        functionalAmount: data.amount, // Assuming GHS for now
        allocatedAmount: data.amount,
        status: TransactionStatus.APPROVED, // Auto-approve for now
        
        // Ghana OMC specific fields based on project type
        petroleumProduct: this.getPetroleumProduct(project.projectType),
        localContentValue: data.amount * (project.localContentPercentage / 100),
        localContentPercentage: project.localContentPercentage,
        
        // Automatic capitalization decision
        capitalizable: this.shouldCapitalize(project.projectType, data.costCategory),
        ifrsClassification: this.getIFRSClassification(project.projectType, data.costCategory),
        developmentPhase: this.getDevelopmentPhase(project.projectType),
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update project actual costs
      const newActualCost = project.actualCost + data.amount;
      await queryRunner.manager.update(
        Project,
        { id: data.projectId },
        {
          actualCost: newActualCost,
          budgetVariance: project.approvedBudget - newActualCost,
          updatedAt: new Date(),
        }
      );

      // Update WBS element if specified
      if (data.wbsElementId) {
        await this.updateWBSActualCost(queryRunner, data.wbsElementId, data.amount);
      }

      // Create GL journal entry
      await this.createTransactionJournalEntry(queryRunner, savedTransaction);

      // Handle capitalization if applicable
      if (savedTransaction.capitalizable && savedTransaction.amount >= project.capitalizationThreshold) {
        await this.processCapitalization(queryRunner, savedTransaction);
      }

      await queryRunner.commitTransaction();

      // Emit transaction created event
      this.eventEmitter.emit('project-transaction.created', {
        transactionId: savedTransaction.id,
        projectId: data.projectId,
        transactionType: data.transactionType,
        amount: data.amount,
        capitalizable: savedTransaction.capitalizable,
      });

      this.logger.log(`Project transaction created: ${transactionNumber}, Amount: GHS ${data.amount}, Project: ${project.projectCode}`);
      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== WBS MANAGEMENT =====

  async createWBSElement(data: WBSData): Promise<ProjectWBS> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await this.projectRepo.findOne({ where: { id: data.projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Determine level and path
      let level = 1;
      let path = data.wbsCode;

      if (data.parentWbsId) {
        const parent = await this.wbsRepo.findOne({ where: { id: data.parentWbsId } });
        if (parent) {
          level = parent.level + 1;
          path = `${parent.path}.${data.wbsCode}`;
        }
      }

      // Create WBS element
      const wbsElement = this.wbsRepo.create({
        ...data,
        level,
        path,
        currency: 'GHS',
        plannedValue: data.budgetedCost,
        baselineCost: data.budgetedCost,
        estimatedTotalCost: data.budgetedCost,
        billable: project.customerId !== null,
        baselineApproved: false,
        budgetControlEnabled: true,
      });

      const savedWBS = await queryRunner.manager.save(wbsElement);

      // Update parent if exists
      if (data.parentWbsId) {
        await this.updateParentWBSCounts(queryRunner, data.parentWbsId);
      }

      await queryRunner.commitTransaction();

      // Emit WBS created event
      this.eventEmitter.emit('wbs.created', {
        wbsId: savedWBS.id,
        projectId: data.projectId,
        wbsCode: data.wbsCode,
        budgetedCost: data.budgetedCost,
      });

      this.logger.log(`WBS element created: ${data.wbsCode} - ${data.wbsName}, Budget: GHS ${data.budgetedCost}`);
      return savedWBS;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== REPORTING AND ANALYTICS =====

  async generateProjectPerformanceReport(projectId: string): Promise<ProjectPerformanceReport> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['transactions', 'wbsElements']
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Calculate current metrics
    const scheduleVarianceDays = project.actualEndDate ? 
      differenceInDays(project.actualEndDate, project.plannedEndDate) : 
      differenceInDays(new Date(), project.plannedEndDate);

    const criticalIssues = this.identifyCriticalIssues(project);

    return {
      projectId: project.id,
      projectName: project.projectName,
      reportDate: new Date(),
      
      plannedEndDate: project.plannedEndDate,
      currentEndDate: project.actualEndDate || addDays(new Date(), project.remainingDays || 0),
      scheduleVarianceDays,
      schedulePerformanceIndex: project.schedulePerformanceIndex,
      
      budgetedCost: project.approvedBudget,
      actualCost: project.actualCost,
      earnedValue: project.earnedValue,
      costVariance: project.budgetVariance,
      costPerformanceIndex: project.costPerformanceIndex,
      estimateAtCompletion: project.estimatedTotalCost,
      
      percentComplete: project.percentComplete,
      physicalPercentComplete: project.physicalPercentComplete,
      
      contractValue: project.contractValue || 0,
      billedAmount: project.billedAmount,
      recognizedRevenue: project.recognizedRevenue,
      
      overallHealth: project.overallProjectHealth,
      riskLevel: this.categorizeRisk(project.riskScore),
      criticalIssues,
    };
  }

  async generatePortfolioAnalysis(tenantId: string): Promise<PortfolioAnalysis> {
    const projects = await this.projectRepo.find({
      where: { tenantId, status: ProjectStatus.ACTIVE }
    });

    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
    const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
    const totalEarnedValue = projects.reduce((sum, p) => sum + p.earnedValue, 0);

    // Status breakdown
    const statusMap = new Map<ProjectStatus, {count: number, totalBudget: number}>();
    projects.forEach(p => {
      const existing = statusMap.get(p.status) || { count: 0, totalBudget: 0 };
      statusMap.set(p.status, {
        count: existing.count + 1,
        totalBudget: existing.totalBudget + p.totalBudget
      });
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      totalBudget: data.totalBudget,
      percentage: totalBudget > 0 ? (data.totalBudget / totalBudget) * 100 : 0
    }));

    // Type breakdown
    const typeMap = new Map<ProjectType, {count: number, totalBudget: number, totalCPI: number, totalSPI: number}>();
    projects.forEach(p => {
      const existing = typeMap.get(p.projectType) || { count: 0, totalBudget: 0, totalCPI: 0, totalSPI: 0 };
      typeMap.set(p.projectType, {
        count: existing.count + 1,
        totalBudget: existing.totalBudget + p.totalBudget,
        totalCPI: existing.totalCPI + p.costPerformanceIndex,
        totalSPI: existing.totalSPI + p.schedulePerformanceIndex
      });
    });

    const typeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalBudget: data.totalBudget,
      avgCPI: data.count > 0 ? data.totalCPI / data.count : 1,
      avgSPI: data.count > 0 ? data.totalSPI / data.count : 1
    }));

    // Performance metrics
    const avgCPI = projects.length > 0 ? 
      projects.reduce((sum, p) => sum + p.costPerformanceIndex, 0) / projects.length : 1;
    const avgSPI = projects.length > 0 ? 
      projects.reduce((sum, p) => sum + p.schedulePerformanceIndex, 0) / projects.length : 1;
    const projectsOverBudget = projects.filter(p => p.costPerformanceIndex < 1).length;
    const projectsBehindSchedule = projects.filter(p => p.schedulePerformanceIndex < 1).length;
    const projectsAtRisk = projects.filter(p => p.overallProjectHealth === 'RED').length;

    return {
      totalProjects,
      totalBudget,
      totalActualCost,
      totalEarnedValue,
      statusBreakdown,
      typeBreakdown,
      performanceMetrics: {
        avgCostPerformanceIndex: avgCPI,
        avgSchedulePerformanceIndex: avgSPI,
        projectsOverBudget,
        projectsBehindSchedule,
        projectsAtRisk,
      }
    };
  }

  // ===== AUTOMATED PROCESSES =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyProjectProcesses(): Promise<void> {
    this.logger.log('Starting daily project accounting processes');

    try {
      // Update project progress from latest transactions
      await this.updateProjectProgressFromTransactions();

      // Calculate earned value metrics
      await this.calculateEarnedValueMetrics();

      // Process revenue recognition
      await this.processRevenueRecognition();

      // Update project health indicators
      await this.updateProjectHealthIndicators();

      this.logger.log('Daily project accounting processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete daily project processes:', error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyProjectProcesses(): Promise<void> {
    this.logger.log('Starting monthly project accounting processes');

    try {
      // Generate project performance reports
      await this.generateMonthlyProjectReports();

      // Process project capitalizations
      await this.processMonthlyCapitalizations();

      // Update portfolio analytics
      await this.updatePortfolioAnalytics();

      // Check project milestones and budgets
      await this.reviewProjectMilestones();

      this.logger.log('Monthly project accounting processes completed successfully');
    } catch (error) {
      this.logger.error('Failed to complete monthly project processes:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private calculateLocalContentRequirement(projectType: ProjectType): number {
    // Ghana local content requirements by project type
    const requirements = {
      [ProjectType.EXPLORATION]: 10,
      [ProjectType.INFRASTRUCTURE]: 20,
      [ProjectType.CONSTRUCTION]: 25,
      [ProjectType.REFINERY_UPGRADE]: 15,
      [ProjectType.PIPELINE]: 20,
      [ProjectType.STORAGE_FACILITY]: 30,
      [ProjectType.RETAIL_OUTLET]: 40,
    };
    return requirements[projectType] || 15;
  }

  private requiresEIA(projectType: ProjectType): boolean {
    const eiaRequired = [
      ProjectType.EXPLORATION,
      ProjectType.REFINERY_UPGRADE,
      ProjectType.PIPELINE,
      ProjectType.STORAGE_FACILITY,
      ProjectType.INFRASTRUCTURE,
    ];
    return eiaRequired.includes(projectType);
  }

  private requiresEPAPermit(projectType: ProjectType): boolean {
    const epaRequired = [
      ProjectType.EXPLORATION,
      ProjectType.REFINERY_UPGRADE,
      ProjectType.PIPELINE,
      ProjectType.STORAGE_FACILITY,
      ProjectType.ENVIRONMENTAL_REMEDIATION,
    ];
    return epaRequired.includes(projectType);
  }

  private calculatePlannedValue(project: Project): number {
    // Simplified planned value calculation
    const totalDays = differenceInDays(project.plannedEndDate, project.startDate);
    const elapsedDays = differenceInDays(new Date(), project.startDate);
    const plannedPercent = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;
    return (plannedPercent / 100) * project.baselineBudget;
  }

  private calculateProjectHealth(cpi: number, spi: number): string {
    if (cpi >= 1.0 && spi >= 1.0) return 'GREEN';
    if (cpi >= 0.9 && spi >= 0.9) return 'YELLOW';
    return 'RED';
  }

  private shouldCapitalize(projectType: ProjectType, costCategory?: CostCategory): boolean {
    const capitalProjectTypes = [
      ProjectType.INFRASTRUCTURE,
      ProjectType.CONSTRUCTION,
      ProjectType.REFINERY_UPGRADE,
      ProjectType.PIPELINE,
      ProjectType.STORAGE_FACILITY,
    ];
    return capitalProjectTypes.includes(projectType);
  }

  private getIFRSClassification(projectType: ProjectType, costCategory?: CostCategory): string {
    if (projectType === ProjectType.EXPLORATION) return 'EXPLORATION_ASSET';
    if (projectType === ProjectType.RESEARCH_DEVELOPMENT) return 'INTANGIBLE_ASSET';
    return 'PROPERTY_PLANT_EQUIPMENT';
  }

  private getDevelopmentPhase(projectType: ProjectType): string {
    if (projectType === ProjectType.EXPLORATION) return 'EXPLORATION';
    return 'DEVELOPMENT';
  }

  private getPetroleumProduct(projectType: ProjectType): string | null {
    const productMap = {
      [ProjectType.EXPLORATION]: 'CRUDE_OIL',
      [ProjectType.REFINERY_UPGRADE]: 'REFINED_PRODUCTS',
      [ProjectType.PIPELINE]: 'CRUDE_OIL',
      [ProjectType.STORAGE_FACILITY]: 'PETROLEUM_PRODUCTS',
    };
    return productMap[projectType] || null;
  }

  private identifyCriticalIssues(project: Project): string[] {
    const issues: string[] = [];
    
    if (project.costPerformanceIndex < 0.9) {
      issues.push('Cost overrun detected');
    }
    
    if (project.schedulePerformanceIndex < 0.9) {
      issues.push('Schedule delay detected');
    }
    
    if (project.riskScore > 75) {
      issues.push('High risk factors identified');
    }
    
    if (project.actualCost > project.approvedBudget * 1.1) {
      issues.push('Budget exceeded by more than 10%');
    }

    return issues;
  }

  private categorizeRisk(riskScore: number): string {
    if (riskScore <= 25) return 'LOW';
    if (riskScore <= 50) return 'MEDIUM';
    if (riskScore <= 75) return 'HIGH';
    return 'CRITICAL';
  }

  private async generateTransactionNumber(queryRunner: QueryRunner, date: Date): Promise<string> {
    const yearMonth = format(date, 'yyyyMM');
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM project_transactions WHERE transaction_number LIKE $1`,
      [`PTX-${yearMonth}-%`]
    );
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
    return `PTX-${yearMonth}-${sequence}`;
  }

  // Placeholder methods for complex processes
  private async createDefaultWBSStructure(queryRunner: QueryRunner, project: Project, createdBy: string): Promise<void> {}
  private async createProjectGLAccounts(queryRunner: QueryRunner, project: Project): Promise<void> {}
  private async updateRevenueRecognition(queryRunner: QueryRunner, projectId: string, amount: number): Promise<void> {}
  private async updateWBSActualCost(queryRunner: QueryRunner, wbsId: string, amount: number): Promise<void> {}
  private async createTransactionJournalEntry(queryRunner: QueryRunner, transaction: ProjectTransaction): Promise<void> {}
  private async processCapitalization(queryRunner: QueryRunner, transaction: ProjectTransaction): Promise<void> {}
  private async updateParentWBSCounts(queryRunner: QueryRunner, parentId: string): Promise<void> {}
  private async updateProjectProgressFromTransactions(): Promise<void> {}
  private async calculateEarnedValueMetrics(): Promise<void> {}
  private async processRevenueRecognition(): Promise<void> {}
  private async updateProjectHealthIndicators(): Promise<void> {}
  private async generateMonthlyProjectReports(): Promise<void> {}
  private async processMonthlyCapitalizations(): Promise<void> {}
  private async updatePortfolioAnalytics(): Promise<void> {}
  private async reviewProjectMilestones(): Promise<void> {}
}