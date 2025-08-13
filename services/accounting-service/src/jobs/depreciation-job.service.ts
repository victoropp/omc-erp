import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FixedAsset, AssetStatus, DepreciationMethod } from '../fixed-assets/entities/fixed-asset.entity';
import { AssetDepreciation } from '../fixed-assets/entities/asset-depreciation.entity';
import { JournalEntry, JournalType } from '../general-ledger/entities/journal-entry.entity';
import { JournalEntryLine } from '../general-ledger/entities/journal-entry-line.entity';
import { AccountingPeriod } from '../general-ledger/entities/accounting-period.entity';

@Injectable()
export class DepreciationJobService {
  private readonly logger = new Logger(DepreciationJobService.name);

  constructor(
    @InjectRepository(FixedAsset)
    private readonly assetRepository: Repository<FixedAsset>,
    @InjectRepository(AssetDepreciation)
    private readonly depreciationRepository: Repository<AssetDepreciation>,
    @InjectRepository(JournalEntry)
    private readonly journalRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly journalLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(AccountingPeriod)
    private readonly periodRepository: Repository<AccountingPeriod>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Monthly depreciation calculation - runs on the 1st of each month at 2:00 AM
   */
  @Cron('0 2 1 * *')
  async calculateMonthlyDepreciation() {
    this.logger.log('Starting monthly depreciation calculation');
    
    try {
      const currentPeriod = await this.getCurrentAccountingPeriod();
      if (!currentPeriod) {
        this.logger.warn('No current accounting period found, skipping depreciation');
        return;
      }

      const activeAssets = await this.getActiveDepreciableAssets();
      let processedCount = 0;
      let totalDepreciationAmount = 0;

      for (const asset of activeAssets) {
        try {
          if (this.shouldDepreciateAsset(asset, currentPeriod)) {
            const depreciationAmount = await this.calculateDepreciationForAsset(asset, currentPeriod);
            
            if (depreciationAmount > 0) {
              await this.recordDepreciation(asset, depreciationAmount, currentPeriod);
              await this.updateAssetBalances(asset, depreciationAmount);
              processedCount++;
              totalDepreciationAmount += depreciationAmount;
            }
          }
        } catch (error) {
          this.logger.error(`Error depreciating asset ${asset.assetTag}:`, error);
        }
      }

      // Create consolidated journal entry for all depreciation
      if (processedCount > 0) {
        await this.createDepreciationJournalEntry(totalDepreciationAmount, currentPeriod);
      }

      this.logger.log(`Monthly depreciation completed: ${processedCount} assets processed, total amount: ${totalDepreciationAmount}`);

      // Emit event for real-time notifications
      this.eventEmitter.emit('depreciation.monthly.completed', {
        processedAssets: processedCount,
        totalAmount: totalDepreciationAmount,
        period: currentPeriod.periodName,
      });

    } catch (error) {
      this.logger.error('Error in monthly depreciation calculation:', error);
      
      this.eventEmitter.emit('depreciation.monthly.failed', {
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Daily asset maintenance check - runs every day at 6:00 AM
   */
  @Cron('0 6 * * *')
  async checkAssetMaintenance() {
    this.logger.log('Starting daily asset maintenance check');
    
    try {
      const assetsNeedingMaintenance = await this.assetRepository.find({
        where: {
          assetStatus: AssetStatus.ACTIVE,
          nextMaintenanceDue: Between(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Next 7 days
        },
      });

      for (const asset of assetsNeedingMaintenance) {
        this.eventEmitter.emit('asset.maintenance.due', {
          assetId: asset.id,
          assetTag: asset.assetTag,
          assetName: asset.assetName,
          dueDate: asset.nextMaintenanceDue,
          location: asset.physicalLocation,
        });
      }

      this.logger.log(`Asset maintenance check completed: ${assetsNeedingMaintenance.length} assets need maintenance`);

    } catch (error) {
      this.logger.error('Error in asset maintenance check:', error);
    }
  }

  /**
   * Weekly asset condition monitoring - runs every Sunday at 8:00 AM
   */
  @Cron('0 8 * * 0')
  async monitorAssetConditions() {
    this.logger.log('Starting weekly asset condition monitoring');
    
    try {
      const assets = await this.assetRepository.find({
        where: { assetStatus: AssetStatus.ACTIVE },
      });

      const alerts = [];

      for (const asset of assets) {
        // Check for assets with poor condition ratings
        if (asset.conditionRating && asset.conditionRating < 3) {
          alerts.push({
            type: 'poor_condition',
            asset,
            severity: 'high',
            message: `Asset ${asset.assetTag} has poor condition rating: ${asset.conditionRating}/10`,
          });
        }

        // Check for overdue maintenance
        if (asset.nextMaintenanceDue && asset.nextMaintenanceDue < new Date()) {
          alerts.push({
            type: 'overdue_maintenance',
            asset,
            severity: 'critical',
            message: `Asset ${asset.assetTag} has overdue maintenance`,
          });
        }

        // Check for warranty expiration
        if (asset.warrantyEndDate && 
            asset.warrantyEndDate > new Date() && 
            asset.warrantyEndDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
          alerts.push({
            type: 'warranty_expiring',
            asset,
            severity: 'medium',
            message: `Asset ${asset.assetTag} warranty expires on ${asset.warrantyEndDate.toDateString()}`,
          });
        }

        // Check for fully depreciated assets
        if (asset.isFullyDepreciated && asset.assetStatus === AssetStatus.ACTIVE) {
          alerts.push({
            type: 'fully_depreciated',
            asset,
            severity: 'low',
            message: `Asset ${asset.assetTag} is fully depreciated but still active`,
          });
        }
      }

      // Emit alerts
      for (const alert of alerts) {
        this.eventEmitter.emit('asset.condition.alert', alert);
      }

      this.logger.log(`Asset condition monitoring completed: ${alerts.length} alerts generated`);

    } catch (error) {
      this.logger.error('Error in asset condition monitoring:', error);
    }
  }

  /**
   * Year-end depreciation summary - runs on December 31st at 11:00 PM
   */
  @Cron('0 23 31 12 *')
  async generateYearEndDepreciationSummary() {
    this.logger.log('Generating year-end depreciation summary');
    
    try {
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);

      const yearDepreciation = await this.depreciationRepository
        .createQueryBuilder('depreciation')
        .select('SUM(depreciation.depreciationAmount)', 'totalDepreciation')
        .addSelect('COUNT(depreciation.id)', 'depreciationEntries')
        .where('depreciation.depreciationDate BETWEEN :start AND :end', {
          start: yearStart,
          end: yearEnd,
        })
        .getRawOne();

      const summary = {
        year: currentYear,
        totalDepreciation: parseFloat(yearDepreciation.totalDepreciation) || 0,
        totalEntries: parseInt(yearDepreciation.depreciationEntries) || 0,
        generatedAt: new Date(),
      };

      this.eventEmitter.emit('depreciation.year.end.summary', summary);

      this.logger.log(`Year-end depreciation summary generated: ${summary.totalDepreciation} total depreciation`);

    } catch (error) {
      this.logger.error('Error generating year-end depreciation summary:', error);
    }
  }

  // Private helper methods

  private async getCurrentAccountingPeriod(): Promise<AccountingPeriod | null> {
    return this.periodRepository.findOne({
      where: {
        isClosed: false,
        startDate: MoreThan(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // Within last 60 days
      },
      order: { startDate: 'DESC' },
    });
  }

  private async getActiveDepreciableAssets(): Promise<FixedAsset[]> {
    return this.assetRepository.find({
      where: {
        assetStatus: AssetStatus.ACTIVE,
        acquisitionCost: MoreThan(0),
        usefulLifeYears: MoreThan(0),
      },
    });
  }

  private shouldDepreciateAsset(asset: FixedAsset, period: AccountingPeriod): boolean {
    // Check if asset is within depreciation period
    if (!asset.depreciationStartDate) {
      asset.depreciationStartDate = asset.acquisitionDate;
    }

    // Don't depreciate if fully depreciated
    if (asset.isFullyDepreciated) {
      return false;
    }

    // Don't depreciate if acquisition date is after period end
    if (asset.acquisitionDate > period.endDate) {
      return false;
    }

    // Check if depreciation already recorded for this period
    return true; // Additional checks can be added here
  }

  private async calculateDepreciationForAsset(asset: FixedAsset, period: AccountingPeriod): Promise<number> {
    const monthsInPeriod = this.getMonthsInPeriod(period);
    let monthlyDepreciation: number;

    switch (asset.depreciationMethod) {
      case DepreciationMethod.STRAIGHT_LINE:
        monthlyDepreciation = asset.depreciableAmount / (asset.usefulLifeYears * 12);
        break;

      case DepreciationMethod.DECLINING_BALANCE:
        const rate = asset.depreciationRate || (2 / asset.usefulLifeYears);
        monthlyDepreciation = (asset.bookValue * rate) / 12;
        break;

      case DepreciationMethod.UNITS_OF_PRODUCTION:
        // This would require additional usage data
        monthlyDepreciation = asset.depreciableAmount / (asset.usefulLifeYears * 12);
        break;

      default:
        monthlyDepreciation = asset.depreciableAmount / (asset.usefulLifeYears * 12);
    }

    // Ensure we don't depreciate below salvage value
    const totalDepreciation = monthlyDepreciation * monthsInPeriod;
    const maxDepreciation = asset.bookValue - asset.salvageValue;
    
    return Math.min(totalDepreciation, maxDepreciation);
  }

  private getMonthsInPeriod(period: AccountingPeriod): number {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    return (end.getFullYear() - start.getFullYear()) * 12 + 
           (end.getMonth() - start.getMonth()) + 1;
  }

  private async recordDepreciation(asset: FixedAsset, amount: number, period: AccountingPeriod): Promise<void> {
    const depreciation = this.depreciationRepository.create({
      assetId: asset.id,
      depreciationDate: new Date(),
      depreciationAmount: amount,
      depreciationMethod: asset.depreciationMethod,
      periodId: period.id,
      bookValueBefore: asset.bookValue,
      bookValueAfter: asset.bookValue - amount,
      accumulatedDepreciationBefore: asset.accumulatedDepreciation,
      accumulatedDepreciationAfter: asset.accumulatedDepreciation + amount,
      calculatedBy: 'SYSTEM',
      notes: `Monthly depreciation for ${period.periodName}`,
    });

    await this.depreciationRepository.save(depreciation);

    // Emit depreciation recorded event
    this.eventEmitter.emit('asset.depreciated', {
      assetId: asset.id,
      assetTag: asset.assetTag,
      amount,
      period: period.periodName,
      method: asset.depreciationMethod,
    });
  }

  private async updateAssetBalances(asset: FixedAsset, depreciationAmount: number): Promise<void> {
    asset.accumulatedDepreciation += depreciationAmount;
    asset.updateBookValue();

    await this.assetRepository.save(asset);
  }

  private async createDepreciationJournalEntry(totalAmount: number, period: AccountingPeriod): Promise<void> {
    const journalNumber = `DEP-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const journalEntry = this.journalRepository.create({
      journalNumber,
      journalDate: new Date(),
      postingDate: new Date(),
      periodId: period.id,
      journalType: JournalType.DEPRECIATION,
      sourceModule: 'FIXED_ASSETS',
      sourceDocumentType: 'MONTHLY_DEPRECIATION',
      description: `Monthly depreciation for ${period.periodName}`,
      totalDebit: totalAmount,
      totalCredit: totalAmount,
      status: 'POSTED',
      createdBy: 'SYSTEM',
      postedBy: 'SYSTEM',
      postedAt: new Date(),
    });

    const savedJournal = await this.journalRepository.save(journalEntry);

    // Debit: Depreciation Expense
    const expenseLine = this.journalLineRepository.create({
      journalEntryId: savedJournal.id,
      lineNumber: 1,
      accountCode: '6210', // Depreciation Expense account
      description: 'Monthly depreciation expense',
      debitAmount: totalAmount,
      creditAmount: 0,
    });

    // Credit: Accumulated Depreciation
    const accumulatedLine = this.journalLineRepository.create({
      journalEntryId: savedJournal.id,
      lineNumber: 2,
      accountCode: '1520', // Accumulated Depreciation account
      description: 'Accumulated depreciation',
      debitAmount: 0,
      creditAmount: totalAmount,
    });

    await this.journalLineRepository.save([expenseLine, accumulatedLine]);

    this.logger.log(`Depreciation journal entry created: ${journalNumber} for amount ${totalAmount}`);
  }
}