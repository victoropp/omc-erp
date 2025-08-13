import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedAssetsController } from './fixed-assets.controller';
import { FixedAssetsService } from './fixed-assets.service';
import { DepreciationService } from './depreciation.service';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { AssetTransferService } from './asset-transfer.service';

// Entities
import { FixedAsset } from './entities/fixed-asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetDepreciation } from './entities/asset-depreciation.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { AssetTransfer } from './entities/asset-transfer.entity';
import { AssetInsurance } from './entities/asset-insurance.entity';
import { AssetValuation } from './entities/asset-valuation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FixedAsset,
      AssetCategory,
      AssetDepreciation,
      AssetMaintenance,
      AssetTransfer,
      AssetInsurance,
      AssetValuation,
    ]),
  ],
  controllers: [FixedAssetsController],
  providers: [
    FixedAssetsService,
    DepreciationService,
    AssetMaintenanceService,
    AssetTransferService,
  ],
  exports: [
    FixedAssetsService,
    DepreciationService,
    AssetMaintenanceService,
    AssetTransferService,
  ],
})
export class FixedAssetsModule {}