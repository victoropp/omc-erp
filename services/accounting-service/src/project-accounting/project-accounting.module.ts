import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectAccountingService } from './project-accounting.service';
import { ProjectAccountingController } from './project-accounting.controller';
import { ProjectBudgetService } from './project-budget.service';
import { ProjectWBSService } from './project-wbs.service';
import { EarnedValueService } from './earned-value.service';
import { RevenueRecognitionService } from './revenue-recognition.service';
import { ProjectCapitalizationService } from './project-capitalization.service';

// Project Accounting Entities
import { Project } from './entities/project.entity';
import { ProjectTransaction } from './entities/project-transaction.entity';
import { ProjectWBS } from './entities/project-wbs.entity';
import { ProjectBudget } from './entities/project-budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectTransaction,
      ProjectWBS,
      ProjectBudget,
    ]),
  ],
  controllers: [ProjectAccountingController],
  providers: [
    ProjectAccountingService,
    ProjectBudgetService,
    ProjectWBSService,
    EarnedValueService,
    RevenueRecognitionService,
    ProjectCapitalizationService,
  ],
  exports: [
    ProjectAccountingService,
    ProjectBudgetService,
    ProjectWBSService,
    EarnedValueService,
    RevenueRecognitionService,
    ProjectCapitalizationService,
  ],
})
export class ProjectAccountingModule {}