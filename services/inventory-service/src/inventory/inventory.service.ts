import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface StockReceiptData {
  stationId: string;
  supplierId: string;
  deliveryNoteNumber: string;
  waybillNumber: string;
  truckNumber: string;
  driverName: string;
  driverLicense: string;
  items: StockReceiptItemData[];
  temperatureReadings?: any;
  qualityCertificates?: any;
}

export interface StockReceiptItemData {
  productId: string;
  tankId?: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: Date;
  temperatureCelsius?: number;
  densityReading?: number;
}

export interface TankReadingData {
  tankId: string;
  stationId: string;
  productId: string;
  levelPercentage: number;
  volumeLiters: number;
  temperatureCelsius?: number;
  waterLevelMm?: number;
  densityReading?: number;
  sensorStatus: 'ONLINE' | 'OFFLINE' | 'ERROR';
}

export interface StockTakeData {
  stationId: string;
  details: StockTakeDetailData[];
}

export interface StockTakeDetailData {
  productId: string;
  tankId?: string;
  physicalQuantity: number;
  notes?: string;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process stock receipt (delivery)
   */
  async processStockReceipt(data: StockReceiptData): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate receipt number
      const receiptNumber = await this.generateReceiptNumber(queryRunner);

      // Calculate totals
      const totalQuantity = data.items.reduce((sum, item) => sum + item.deliveredQuantity, 0);
      const totalValue = data.items.reduce((sum, item) => sum + (item.deliveredQuantity * item.unitCost), 0);

      // Create stock receipt header
      const receipt = await queryRunner.manager.query(
        `INSERT INTO stock_receipts (
          receipt_number, receipt_date, station_id, supplier_id,
          delivery_note_number, waybill_number, truck_number,
          driver_name, driver_license, total_quantity, total_value,
          status, temperature_readings, quality_certificates
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          receiptNumber,
          new Date(),
          data.stationId,
          data.supplierId,
          data.deliveryNoteNumber,
          data.waybillNumber,
          data.truckNumber,
          data.driverName,
          data.driverLicense,
          totalQuantity,
          totalValue,
          'PENDING',
          JSON.stringify(data.temperatureReadings || {}),
          JSON.stringify(data.qualityCertificates || {}),
        ]
      );

      // Process each item
      for (const item of data.items) {
        // Create receipt item
        await queryRunner.manager.query(
          `INSERT INTO stock_receipt_items (
            receipt_id, product_id, tank_id, ordered_quantity,
            delivered_quantity, accepted_quantity, variance_quantity,
            unit_cost, total_cost, batch_number, expiry_date,
            temperature_celsius, density_reading, quality_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            receipt[0].id,
            item.productId,
            item.tankId,
            item.orderedQuantity,
            item.deliveredQuantity,
            item.deliveredQuantity, // Initially accept all
            item.deliveredQuantity - item.orderedQuantity,
            item.unitCost,
            item.deliveredQuantity * item.unitCost,
            item.batchNumber,
            item.expiryDate,
            item.temperatureCelsius,
            item.densityReading,
            'PENDING',
          ]
        );

        // Create inventory movement
        await this.createInventoryMovement(
          queryRunner,
          'RECEIPT',
          data.stationId,
          item.productId,
          item.tankId,
          item.deliveredQuantity,
          item.unitCost,
          'STOCK_RECEIPT',
          receipt[0].id
        );

        // Update stock levels
        await this.updateStockLevel(
          queryRunner,
          data.stationId,
          item.productId,
          item.tankId,
          item.deliveredQuantity
        );

        // Check for reorder alerts
        await this.checkReorderLevel(queryRunner, data.stationId, item.productId);
      }

      // Create automated journal entry for inventory receipt
      await this.createInventoryJournalEntry(queryRunner, receipt[0], data.items);

      await queryRunner.commitTransaction();

      // Emit events
      this.eventEmitter.emit('stock.received', {
        receiptId: receipt[0].id,
        stationId: data.stationId,
        totalQuantity,
        totalValue,
      });

      // Send real-time update via WebSocket
      this.server.emit('inventory:updated', {
        type: 'STOCK_RECEIPT',
        stationId: data.stationId,
        receiptNumber,
        quantity: totalQuantity,
      });

      this.logger.log(`Stock receipt ${receiptNumber} processed successfully`);
      return receipt[0];

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to process stock receipt:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process fuel sale and update inventory
   */
  async processFuelSale(transactionData: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { stationId, productId, tankId, quantityLiters, unitPrice } = transactionData;

      // Create inventory movement (negative for sale)
      await this.createInventoryMovement(
        queryRunner,
        'SALE',
        stationId,
        productId,
        tankId,
        -quantityLiters,
        unitPrice,
        'FUEL_TRANSACTION',
        transactionData.id
      );

      // Update stock level
      await this.updateStockLevel(queryRunner, stationId, productId, tankId, -quantityLiters);

      // Check for low stock alerts
      await this.checkLowStock(queryRunner, stationId, productId, tankId);

      await queryRunner.commitTransaction();

      // Send real-time update
      this.server.emit('inventory:updated', {
        type: 'FUEL_SALE',
        stationId,
        productId,
        quantity: quantityLiters,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to process fuel sale inventory:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process IoT tank reading
   */
  async processTankReading(reading: TankReadingData): Promise<void> {
    try {
      // Store tank reading
      await this.dataSource.query(
        `INSERT INTO tank_readings (
          time, tank_id, station_id, product_id,
          level_percentage, volume_liters, temperature_celsius,
          water_level_mm, density_reading, sensor_status, alert_triggered
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          new Date(),
          reading.tankId,
          reading.stationId,
          reading.productId,
          reading.levelPercentage,
          reading.volumeLiters,
          reading.temperatureCelsius,
          reading.waterLevelMm,
          reading.densityReading,
          reading.sensorStatus,
          false,
        ]
      );

      // Update current stock level
      await this.dataSource.query(
        `UPDATE stock_levels 
        SET current_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE station_id = $2 AND product_id = $3 AND tank_id = $4`,
        [reading.volumeLiters, reading.stationId, reading.productId, reading.tankId]
      );

      // Check for alerts
      await this.checkTankAlerts(reading);

      // Send real-time update
      this.server.emit('tank:reading', {
        stationId: reading.stationId,
        tankId: reading.tankId,
        level: reading.levelPercentage,
        volume: reading.volumeLiters,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error('Failed to process tank reading:', error);
      throw error;
    }
  }

  /**
   * Perform stock take (physical count)
   */
  async performStockTake(data: StockTakeData): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate stock take number
      const stockTakeNumber = await this.generateStockTakeNumber(queryRunner);

      // Create stock take header
      const stockTake = await queryRunner.manager.query(
        `INSERT INTO stock_takes (
          stock_take_number, stock_take_date, station_id, status
        ) VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [stockTakeNumber, new Date(), data.stationId, 'IN_PROGRESS']
      );

      let totalVarianceValue = 0;

      // Process each item
      for (const detail of data.details) {
        // Get system quantity
        const systemStock = await queryRunner.manager.query(
          `SELECT current_quantity FROM stock_levels 
          WHERE station_id = $1 AND product_id = $2 AND 
          ($3::uuid IS NULL OR tank_id = $3)`,
          [data.stationId, detail.productId, detail.tankId]
        );

        const systemQuantity = systemStock[0]?.current_quantity || 0;
        const varianceQuantity = detail.physicalQuantity - systemQuantity;

        // Get product cost for variance value
        const product = await queryRunner.manager.query(
          `SELECT p.*, 
          (SELECT unit_cost FROM stock_receipt_items sri 
           JOIN stock_receipts sr ON sr.id = sri.receipt_id
           WHERE sri.product_id = p.id AND sr.station_id = $1
           ORDER BY sr.receipt_date DESC LIMIT 1) as last_cost
          FROM products p WHERE p.id = $2`,
          [data.stationId, detail.productId]
        );

        const unitCost = product[0]?.last_cost || 0;
        const varianceValue = varianceQuantity * unitCost;
        totalVarianceValue += varianceValue;

        // Create stock take detail
        await queryRunner.manager.query(
          `INSERT INTO stock_take_details (
            stock_take_id, product_id, tank_id,
            system_quantity, physical_quantity, variance_quantity,
            unit_cost, variance_value, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            stockTake[0].id,
            detail.productId,
            detail.tankId,
            systemQuantity,
            detail.physicalQuantity,
            varianceQuantity,
            unitCost,
            varianceValue,
            detail.notes,
          ]
        );

        // Create adjustment if variance exists
        if (Math.abs(varianceQuantity) > 0.01) {
          await this.createInventoryAdjustment(
            queryRunner,
            data.stationId,
            detail.productId,
            detail.tankId,
            varianceQuantity,
            unitCost,
            stockTake[0].id
          );
        }
      }

      // Update stock take with total variance
      await queryRunner.manager.query(
        `UPDATE stock_takes 
        SET total_variance_value = $1, status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [totalVarianceValue, stockTake[0].id]
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Stock take ${stockTakeNumber} completed with variance of ${totalVarianceValue}`);
      return stockTake[0];

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to perform stock take:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get real-time inventory dashboard
   */
  async getInventoryDashboard(stationId?: string): Promise<any> {
    try {
      // Current stock levels
      const stockLevels = await this.dataSource.query(
        `SELECT 
          sl.*, 
          p.product_name,
          p.product_type,
          s.name as station_name,
          t.tank_number,
          t.capacity as tank_capacity,
          CASE 
            WHEN sl.current_quantity < p.minimum_stock THEN 'CRITICAL'
            WHEN sl.current_quantity < p.reorder_level THEN 'LOW'
            ELSE 'NORMAL'
          END as stock_status
        FROM stock_levels sl
        JOIN products p ON p.id = sl.product_id
        JOIN stations s ON s.id = sl.station_id
        LEFT JOIN tanks t ON t.id = sl.tank_id
        WHERE ($1::uuid IS NULL OR sl.station_id = $1)
        ORDER BY s.name, p.product_name`,
        [stationId]
      );

      // Recent movements
      const recentMovements = await this.dataSource.query(
        `SELECT 
          im.*,
          p.product_name,
          s.name as station_name
        FROM inventory_movements im
        JOIN products p ON p.id = im.product_id
        JOIN stations s ON s.id = im.station_id
        WHERE ($1::uuid IS NULL OR im.station_id = $1)
        ORDER BY im.movement_date DESC
        LIMIT 50`,
        [stationId]
      );

      // Pending receipts
      const pendingReceipts = await this.dataSource.query(
        `SELECT 
          sr.*,
          s.name as station_name,
          sup.name as supplier_name
        FROM stock_receipts sr
        JOIN stations s ON s.id = sr.station_id
        JOIN suppliers sup ON sup.id = sr.supplier_id
        WHERE sr.status = 'PENDING'
        AND ($1::uuid IS NULL OR sr.station_id = $1)
        ORDER BY sr.receipt_date DESC`,
        [stationId]
      );

      // Stock alerts
      const stockAlerts = await this.dataSource.query(
        `SELECT 
          sl.*,
          p.product_name,
          s.name as station_name,
          CASE 
            WHEN sl.current_quantity = 0 THEN 'OUT_OF_STOCK'
            WHEN sl.current_quantity < p.minimum_stock THEN 'CRITICAL_LOW'
            WHEN sl.current_quantity < p.reorder_level THEN 'REORDER_REQUIRED'
            ELSE 'NORMAL'
          END as alert_type
        FROM stock_levels sl
        JOIN products p ON p.id = sl.product_id
        JOIN stations s ON s.id = sl.station_id
        WHERE sl.current_quantity < p.reorder_level
        AND ($1::uuid IS NULL OR sl.station_id = $1)
        ORDER BY sl.current_quantity / NULLIF(p.reorder_level, 0)`,
        [stationId]
      );

      // Tank readings (last 24 hours)
      const tankReadings = await this.dataSource.query(
        `SELECT 
          tr.*,
          t.tank_number,
          p.product_name,
          s.name as station_name
        FROM tank_readings tr
        JOIN tanks t ON t.id = tr.tank_id
        JOIN products p ON p.id = tr.product_id
        JOIN stations s ON s.id = tr.station_id
        WHERE tr.time > NOW() - INTERVAL '24 hours'
        AND ($1::uuid IS NULL OR tr.station_id = $1)
        ORDER BY tr.time DESC`,
        [stationId]
      );

      return {
        stockLevels,
        recentMovements,
        pendingReceipts,
        stockAlerts,
        tankReadings,
        summary: {
          totalProducts: stockLevels.length,
          criticalItems: stockAlerts.filter(a => a.alert_type === 'CRITICAL_LOW').length,
          reorderRequired: stockAlerts.filter(a => a.alert_type === 'REORDER_REQUIRED').length,
          pendingDeliveries: pendingReceipts.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get inventory dashboard:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic reorder processing
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processAutomaticReorders(): Promise<void> {
    try {
      this.logger.log('Processing automatic reorders...');

      const itemsToReorder = await this.dataSource.query(
        `SELECT 
          sl.*,
          p.product_name,
          p.reorder_quantity,
          s.name as station_name,
          s.primary_supplier_id
        FROM stock_levels sl
        JOIN products p ON p.id = sl.product_id
        JOIN stations s ON s.id = sl.station_id
        WHERE sl.current_quantity < p.reorder_level
        AND sl.reorder_alert_sent = false
        AND p.reorder_quantity > 0`
      );

      for (const item of itemsToReorder) {
        // Create purchase order or alert
        await this.createReorderAlert(item);

        // Mark alert as sent
        await this.dataSource.query(
          `UPDATE stock_levels 
          SET reorder_alert_sent = true 
          WHERE id = $1`,
          [item.id]
        );
      }

      this.logger.log(`Processed ${itemsToReorder.length} automatic reorders`);
    } catch (error) {
      this.logger.error('Failed to process automatic reorders:', error);
    }
  }

  /**
   * Create inventory movement record
   */
  private async createInventoryMovement(
    queryRunner: any,
    movementType: string,
    stationId: string,
    productId: string,
    tankId: string | null,
    quantity: number,
    unitCost: number,
    sourceType: string,
    sourceId: string
  ): Promise<void> {
    // Get current balance
    const currentStock = await queryRunner.manager.query(
      `SELECT current_quantity FROM stock_levels 
      WHERE station_id = $1 AND product_id = $2 
      AND ($3::uuid IS NULL OR tank_id = $3)`,
      [stationId, productId, tankId]
    );

    const balanceBefore = currentStock[0]?.current_quantity || 0;
    const balanceAfter = balanceBefore + quantity;

    await queryRunner.manager.query(
      `INSERT INTO inventory_movements (
        movement_date, movement_type, station_id, product_id, tank_id,
        source_document_type, source_document_id, quantity,
        unit_cost, total_cost, balance_before, balance_after
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        new Date(),
        movementType,
        stationId,
        productId,
        tankId,
        sourceType,
        sourceId,
        quantity,
        unitCost,
        Math.abs(quantity * unitCost),
        balanceBefore,
        balanceAfter,
      ]
    );
  }

  /**
   * Update stock level
   */
  private async updateStockLevel(
    queryRunner: any,
    stationId: string,
    productId: string,
    tankId: string | null,
    quantityChange: number
  ): Promise<void> {
    await queryRunner.manager.query(
      `INSERT INTO stock_levels (
        station_id, product_id, tank_id, current_quantity, updated_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (station_id, product_id, tank_id) 
      DO UPDATE SET 
        current_quantity = stock_levels.current_quantity + $4,
        updated_at = CURRENT_TIMESTAMP`,
      [stationId, productId, tankId, quantityChange]
    );
  }

  /**
   * Check and create alerts for tank readings
   */
  private async checkTankAlerts(reading: TankReadingData): Promise<void> {
    const alerts = [];

    // Check low level
    if (reading.levelPercentage < 20) {
      alerts.push({
        type: 'LOW_LEVEL',
        severity: reading.levelPercentage < 10 ? 'CRITICAL' : 'WARNING',
        message: `Tank level at ${reading.levelPercentage}%`,
      });
    }

    // Check water level
    if (reading.waterLevelMm && reading.waterLevelMm > 50) {
      alerts.push({
        type: 'HIGH_WATER',
        severity: 'WARNING',
        message: `Water level at ${reading.waterLevelMm}mm`,
      });
    }

    // Check temperature
    if (reading.temperatureCelsius) {
      if (reading.temperatureCelsius > 40 || reading.temperatureCelsius < 10) {
        alerts.push({
          type: 'TEMPERATURE',
          severity: 'WARNING',
          message: `Temperature at ${reading.temperatureCelsius}°C`,
        });
      }
    }

    // Create alerts in database
    for (const alert of alerts) {
      await this.dataSource.query(
        `INSERT INTO alerts (
          alert_type, severity, title, message,
          station_id, reference_type, reference_id,
          metric_value, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          alert.type,
          alert.severity,
          `Tank Alert - ${alert.type}`,
          alert.message,
          reading.stationId,
          'TANK_READING',
          reading.tankId,
          reading.levelPercentage,
          'NEW',
        ]
      );

      // Emit alert event
      this.eventEmitter.emit('alert.created', {
        ...alert,
        stationId: reading.stationId,
        tankId: reading.tankId,
      });
    }
  }

  /**
   * Helper methods
   */
  private async generateReceiptNumber(queryRunner: any): Promise<string> {
    const date = new Date();
    const prefix = `SR-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM stock_receipts WHERE receipt_number LIKE $1`,
      [`${prefix}%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `${prefix}-${sequence}`;
  }

  private async generateStockTakeNumber(queryRunner: any): Promise<string> {
    const date = new Date();
    const prefix = `ST-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM stock_takes WHERE stock_take_number LIKE $1`,
      [`${prefix}%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `${prefix}-${sequence}`;
  }

  private async checkLowStock(
    queryRunner: any,
    stationId: string,
    productId: string,
    tankId: string | null
  ): Promise<void> {
    const result = await queryRunner.manager.query(
      `SELECT 
        sl.current_quantity,
        p.minimum_stock,
        p.reorder_level
      FROM stock_levels sl
      JOIN products p ON p.id = sl.product_id
      WHERE sl.station_id = $1 AND sl.product_id = $2
      AND ($3::uuid IS NULL OR sl.tank_id = $3)`,
      [stationId, productId, tankId]
    );

    if (result[0]) {
      const { current_quantity, minimum_stock, reorder_level } = result[0];

      if (current_quantity < minimum_stock) {
        // Create critical alert
        this.eventEmitter.emit('stock.critical', {
          stationId,
          productId,
          currentQuantity: current_quantity,
          minimumStock: minimum_stock,
        });
      } else if (current_quantity < reorder_level) {
        // Create reorder alert
        this.eventEmitter.emit('stock.reorder', {
          stationId,
          productId,
          currentQuantity: current_quantity,
          reorderLevel: reorder_level,
        });
      }
    }
  }

  private async checkReorderLevel(queryRunner: any, stationId: string, productId: string): Promise<void> {
    await this.checkLowStock(queryRunner, stationId, productId, null);
  }

  private async createReorderAlert(item: any): Promise<void> {
    // This would integrate with purchase order system
    this.eventEmitter.emit('reorder.required', {
      stationId: item.station_id,
      productId: item.product_id,
      currentQuantity: item.current_quantity,
      reorderQuantity: item.reorder_quantity,
      supplierId: item.primary_supplier_id,
    });
  }

  private async createInventoryAdjustment(
    queryRunner: any,
    stationId: string,
    productId: string,
    tankId: string | null,
    varianceQuantity: number,
    unitCost: number,
    stockTakeId: string
  ): Promise<void> {
    // Create inventory movement for adjustment
    await this.createInventoryMovement(
      queryRunner,
      'ADJUSTMENT',
      stationId,
      productId,
      tankId,
      varianceQuantity,
      unitCost,
      'STOCK_TAKE',
      stockTakeId
    );

    // Update stock level
    await this.updateStockLevel(queryRunner, stationId, productId, tankId, varianceQuantity);

    // Create journal entry for inventory adjustment
    const adjustmentValue = varianceQuantity * unitCost;
    if (Math.abs(adjustmentValue) > 0.01) {
      this.eventEmitter.emit('inventory.adjusted', {
        stationId,
        productId,
        varianceQuantity,
        adjustmentValue,
        stockTakeId,
      });
    }
  }

  private async createInventoryJournalEntry(queryRunner: any, receipt: any, items: any[]): Promise<void> {
    // Emit event for accounting service to create journal entry
    this.eventEmitter.emit('journal.create', {
      journalDate: receipt.receipt_date,
      description: `Stock receipt ${receipt.receipt_number}`,
      journalType: 'PURCHASE',
      sourceModule: 'INVENTORY',
      sourceDocumentType: 'STOCK_RECEIPT',
      sourceDocumentId: receipt.id,
      lines: [
        {
          accountCode: '1310', // Inventory account
          debitAmount: receipt.total_value,
          creditAmount: 0,
          stationId: receipt.station_id,
        },
        {
          accountCode: '2110', // Accounts Payable
          debitAmount: 0,
          creditAmount: receipt.total_value,
          supplierId: receipt.supplier_id,
        },
      ],
    });
  }
}