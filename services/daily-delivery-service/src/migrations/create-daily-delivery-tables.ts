import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateDailyDeliveryTables1703001000000 implements MigrationInterface {
  name = 'CreateDailyDeliveryTables1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_deliveries table
    await queryRunner.createTable(
      new Table({
        name: 'daily_deliveries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'delivery_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          // Core Required Fields
          {
            name: 'delivery_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'supplier_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'depot_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'delivery_location',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'psa_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'waybill_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'vehicle_registration_number',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'transporter_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'transporter_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          // Product Information
          {
            name: 'product_type',
            type: 'enum',
            enum: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            isNullable: false,
          },
          {
            name: 'product_description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'quantity_litres',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'total_value',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'GHS'",
          },
          // Delivery Details
          {
            name: 'delivery_type',
            type: 'enum',
            enum: ['DEPOT_TO_STATION', 'DEPOT_TO_CUSTOMER', 'INTER_DEPOT', 'CUSTOMER_PICKUP', 'EMERGENCY_DELIVERY'],
            isNullable: false,
          },
          {
            name: 'loading_terminal',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'discharge_terminal',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'planned_delivery_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'actual_delivery_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'loading_start_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'loading_end_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'discharge_start_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'discharge_end_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          // Quality Control
          {
            name: 'temperature_at_loading',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'temperature_at_discharge',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'density_at_loading',
            type: 'decimal',
            precision: 8,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'density_at_discharge',
            type: 'decimal',
            precision: 8,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'net_standard_volume',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'gross_standard_volume',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'volume_correction_factor',
            type: 'decimal',
            precision: 8,
            scale: 6,
            isNullable: true,
          },
          // Tank Information
          {
            name: 'source_tank_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'destination_tank_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'compartment_numbers',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'seal_numbers',
            type: 'text',
            isNullable: true,
          },
          // Driver Information
          {
            name: 'driver_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'driver_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'driver_license_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'driver_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          // Financial Integration
          {
            name: 'supplier_invoice_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'customer_invoice_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'supplier_invoice_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'customer_invoice_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'purchase_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'purchase_order_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'sales_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sales_order_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          // Status and Approval
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'INVOICED_SUPPLIER', 'INVOICED_CUSTOMER', 'COMPLETED', 'CANCELLED', 'REJECTED'],
            default: "'DRAFT'",
          },
          {
            name: 'approval_workflow_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approval_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'approval_comments',
            type: 'text',
            isNullable: true,
          },
          // Ghana Compliance
          {
            name: 'npa_permit_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'customs_entry_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'customs_duty_paid',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'petroleum_tax_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'energy_fund_levy',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'road_fund_levy',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'price_stabilization_levy',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'primary_distribution_margin',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'marketing_margin',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'dealer_margin',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'unified_petroleum_price_fund_levy',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // GPS and Tracking
          {
            name: 'gps_tracking_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'route_coordinates',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'distance_travelled_km',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'fuel_consumption_litres',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'route_deviation_flag',
            type: 'boolean',
            default: false,
          },
          {
            name: 'unauthorized_stops',
            type: 'text',
            isNullable: true,
          },
          // Risk and Insurance
          {
            name: 'insurance_policy_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'insurance_coverage_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'risk_assessment_score',
            type: 'int',
            default: 1,
          },
          {
            name: 'security_escort_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'security_escort_details',
            type: 'text',
            isNullable: true,
          },
          // Environmental Compliance
          {
            name: 'environmental_permit_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'emission_certificate_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'carbon_footprint_kg',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          // IFRS Compliance
          {
            name: 'revenue_recognition_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'revenue_recognition_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'contract_asset_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'contract_liability_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'performance_obligation_satisfied',
            type: 'boolean',
            default: false,
          },
          // Document Management
          {
            name: 'delivery_receipt_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bill_of_lading_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'quality_certificate_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'customs_documents_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'supporting_documents',
            type: 'text',
            isNullable: true,
          },
          // Additional Information
          {
            name: 'delivery_instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'special_handling_requirements',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'internal_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'customer_feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'delivery_rating',
            type: 'int',
            isNullable: true,
          },
          // System Fields
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sync_status',
            type: 'varchar',
            length: '20',
            default: "'SYNCED'",
          },
          {
            name: 'last_sync_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'external_reference_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'integration_flags',
            type: 'text',
            isNullable: true,
          },
          // Audit Fields
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create delivery_line_items table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_line_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'delivery_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'line_number',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'product_grade',
            type: 'enum',
            enum: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'line_total',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'tank_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'compartment_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'batch_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'quality_specifications',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    // Create delivery_approval_history table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_approval_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'delivery_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'approval_step',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED', 'ESCALATED'],
            isNullable: false,
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'approver_role',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'comments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'decision_deadline',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'escalation_flag',
            type: 'boolean',
            default: false,
          },
          {
            name: 'action_date',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create delivery_documents table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'delivery_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['DELIVERY_RECEIPT', 'BILL_OF_LADING', 'QUALITY_CERTIFICATE', 'CUSTOMS_DOCUMENT', 'INSURANCE_CERTIFICATE', 'ENVIRONMENTAL_PERMIT', 'SAFETY_CERTIFICATE', 'WAYBILL', 'INVOICE_COPY', 'OTHER'],
            isNullable: false,
          },
          {
            name: 'document_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'document_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'file_url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'file_size_bytes',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verified_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'verification_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'uploaded_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'uploaded_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_tenant_delivery_date', ['tenant_id', 'delivery_date']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_tenant_status', ['tenant_id', 'status']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_tenant_supplier', ['tenant_id', 'supplier_id']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_tenant_customer', ['tenant_id', 'customer_id']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_tenant_depot', ['tenant_id', 'depot_id']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_psa_number', ['psa_number']),
    );

    await queryRunner.createIndex(
      'daily_deliveries',
      new Index('IDX_daily_deliveries_waybill_number', ['waybill_number']),
    );

    await queryRunner.createIndex(
      'delivery_line_items',
      new Index('IDX_delivery_line_items_delivery_id', ['delivery_id']),
    );

    await queryRunner.createIndex(
      'delivery_approval_history',
      new Index('IDX_delivery_approval_history_delivery_id', ['delivery_id']),
    );

    await queryRunner.createIndex(
      'delivery_approval_history',
      new Index('IDX_delivery_approval_history_approved_by', ['approved_by']),
    );

    await queryRunner.createIndex(
      'delivery_documents',
      new Index('IDX_delivery_documents_delivery_id', ['delivery_id']),
    );

    await queryRunner.createIndex(
      'delivery_documents',
      new Index('IDX_delivery_documents_document_type', ['document_type']),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'delivery_line_items',
      new ForeignKey({
        columnNames: ['delivery_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'daily_deliveries',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'delivery_approval_history',
      new ForeignKey({
        columnNames: ['delivery_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'daily_deliveries',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'delivery_documents',
      new ForeignKey({
        columnNames: ['delivery_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'daily_deliveries',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const dailyDeliveriesTable = await queryRunner.getTable('daily_deliveries');
    const deliveryLineItemsTable = await queryRunner.getTable('delivery_line_items');
    const deliveryApprovalHistoryTable = await queryRunner.getTable('delivery_approval_history');
    const deliveryDocumentsTable = await queryRunner.getTable('delivery_documents');

    if (deliveryLineItemsTable) {
      const foreignKey = deliveryLineItemsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('delivery_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('delivery_line_items', foreignKey);
      }
    }

    if (deliveryApprovalHistoryTable) {
      const foreignKey = deliveryApprovalHistoryTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('delivery_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('delivery_approval_history', foreignKey);
      }
    }

    if (deliveryDocumentsTable) {
      const foreignKey = deliveryDocumentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('delivery_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('delivery_documents', foreignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('delivery_documents');
    await queryRunner.dropTable('delivery_approval_history');
    await queryRunner.dropTable('delivery_line_items');
    await queryRunner.dropTable('daily_deliveries');
  }
}