import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStationTypeRevenueRecognition1734028800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add station_type column
    await queryRunner.addColumn(
      'daily_deliveries',
      new TableColumn({
        name: 'station_type',
        type: 'enum',
        enum: ['COCO', 'DOCO', 'DODO', 'INDUSTRIAL', 'COMMERCIAL'],
        isNullable: true,
      })
    );

    // Add revenue_recognition_type column
    await queryRunner.addColumn(
      'daily_deliveries',
      new TableColumn({
        name: 'revenue_recognition_type',
        type: 'enum',
        enum: ['IMMEDIATE', 'DEFERRED'],
        default: "'IMMEDIATE'",
        isNullable: false,
      })
    );

    // Add price_buildup_snapshot column
    await queryRunner.addColumn(
      'daily_deliveries',
      new TableColumn({
        name: 'price_buildup_snapshot',
        type: 'text',
        isNullable: true,
      })
    );

    // Add pricing_window_id column
    await queryRunner.addColumn(
      'daily_deliveries',
      new TableColumn({
        name: 'pricing_window_id',
        type: 'uuid',
        isNullable: true,
      })
    );

    // Add index on station_type for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_daily_deliveries_station_type" ON "daily_deliveries" ("tenant_id", "station_type")
    `);

    // Add index on revenue_recognition_type
    await queryRunner.query(`
      CREATE INDEX "IDX_daily_deliveries_revenue_recognition" ON "daily_deliveries" ("tenant_id", "revenue_recognition_type")
    `);

    // Add index on pricing_window_id
    await queryRunner.query(`
      CREATE INDEX "IDX_daily_deliveries_pricing_window" ON "daily_deliveries" ("pricing_window_id") WHERE "pricing_window_id" IS NOT NULL
    `);

    console.log('✅ Added station type and revenue recognition fields to daily_deliveries table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_deliveries_station_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_deliveries_revenue_recognition"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_deliveries_pricing_window"`);

    // Drop columns
    await queryRunner.dropColumn('daily_deliveries', 'pricing_window_id');
    await queryRunner.dropColumn('daily_deliveries', 'price_buildup_snapshot');
    await queryRunner.dropColumn('daily_deliveries', 'revenue_recognition_type');
    await queryRunner.dropColumn('daily_deliveries', 'station_type');

    console.log('✅ Removed station type and revenue recognition fields from daily_deliveries table');
  }
}