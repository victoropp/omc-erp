"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DailyDeliveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const daily_delivery_entity_1 = require("../entities/daily-delivery.entity");
const delivery_line_item_entity_1 = require("../entities/delivery-line-item.entity");
const delivery_approval_history_entity_1 = require("../entities/delivery-approval-history.entity");
const delivery_documents_entity_1 = require("../entities/delivery-documents.entity");
const delivery_validation_service_1 = require("./delivery-validation.service");
const approval_workflow_service_1 = require("../../approval-workflow/approval-workflow.service");
let DailyDeliveryService = DailyDeliveryService_1 = class DailyDeliveryService {
    deliveryRepository;
    lineItemRepository;
    approvalHistoryRepository;
    documentsRepository;
    dataSource;
    eventEmitter;
    validationService;
    approvalWorkflowService;
    logger = new common_1.Logger(DailyDeliveryService_1.name);
    constructor(deliveryRepository, lineItemRepository, approvalHistoryRepository, documentsRepository, dataSource, eventEmitter, validationService, approvalWorkflowService) {
        this.deliveryRepository = deliveryRepository;
        this.lineItemRepository = lineItemRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.documentsRepository = documentsRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.validationService = validationService;
        this.approvalWorkflowService = approvalWorkflowService;
    }
    async create(createDeliveryDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Validate the delivery data
            const validation = await this.validationService.validateDelivery(createDeliveryDto);
            if (!validation.isValid) {
                throw new common_1.BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
            }
            // Check for duplicate PSA number
            const existingPsa = await this.deliveryRepository.findOne({
                where: { psaNumber: createDeliveryDto.psaNumber }
            });
            if (existingPsa) {
                throw new common_1.ConflictException(`PSA number ${createDeliveryDto.psaNumber} already exists`);
            }
            // Check for duplicate waybill number
            const existingWaybill = await this.deliveryRepository.findOne({
                where: { waybillNumber: createDeliveryDto.waybillNumber }
            });
            if (existingWaybill) {
                throw new common_1.ConflictException(`Waybill number ${createDeliveryDto.waybillNumber} already exists`);
            }
            // Get price build-up components if station type provided
            let priceBuildupComponents = null;
            let revenueRecognitionType = createDeliveryDto.revenueRecognitionType || daily_delivery_entity_1.RevenueRecognitionType.IMMEDIATE;
            if (createDeliveryDto.stationType) {
                // Auto-determine revenue recognition based on station type
                if (createDeliveryDto.stationType === daily_delivery_entity_1.StationType.COCO || createDeliveryDto.stationType === daily_delivery_entity_1.StationType.DOCO) {
                    revenueRecognitionType = daily_delivery_entity_1.RevenueRecognitionType.DEFERRED;
                }
                // Fetch price build-up components from pricing service
                try {
                    priceBuildupComponents = await this.fetchPriceBuildupComponents(createDeliveryDto.productType, createDeliveryDto.stationType, createDeliveryDto.deliveryDate);
                }
                catch (error) {
                    this.logger.warn('Failed to fetch price build-up components, continuing with base price', error);
                }
            }
            // Create delivery entity
            const delivery = this.deliveryRepository.create({
                ...createDeliveryDto,
                deliveryDate: new Date(createDeliveryDto.deliveryDate),
                plannedDeliveryTime: createDeliveryDto.plannedDeliveryTime ? new Date(createDeliveryDto.plannedDeliveryTime) : null,
                loadingStartTime: createDeliveryDto.loadingStartTime ? new Date(createDeliveryDto.loadingStartTime) : null,
                loadingEndTime: createDeliveryDto.loadingEndTime ? new Date(createDeliveryDto.loadingEndTime) : null,
                dischargeStartTime: createDeliveryDto.dischargeStartTime ? new Date(createDeliveryDto.dischargeStartTime) : null,
                dischargeEndTime: createDeliveryDto.dischargeEndTime ? new Date(createDeliveryDto.dischargeEndTime) : null,
                revenueRecognitionType,
                priceBuildupSnapshot: priceBuildupComponents ? JSON.stringify(priceBuildupComponents) : null,
                status: daily_delivery_entity_1.DeliveryStatus.DRAFT,
            });
            // Save delivery
            const savedDelivery = await queryRunner.manager.save(delivery);
            // Create line items if provided
            if (createDeliveryDto.lineItems && createDeliveryDto.lineItems.length > 0) {
                const lineItems = createDeliveryDto.lineItems.map(item => ({
                    ...item,
                    deliveryId: savedDelivery.id,
                    lineTotal: item.quantity * item.unitPrice,
                }));
                await queryRunner.manager.save(delivery_line_item_entity_1.DeliveryLineItem, lineItems);
            }
            await queryRunner.commitTransaction();
            // Emit event for integration with other services
            this.eventEmitter.emit('delivery.created', {
                deliveryId: savedDelivery.id,
                tenantId: savedDelivery.tenantId,
                supplierId: savedDelivery.supplierId,
                customerId: savedDelivery.customerId,
                depotId: savedDelivery.depotId,
                productType: savedDelivery.productType,
                quantityLitres: savedDelivery.quantityLitres,
                totalValue: savedDelivery.totalValue,
            });
            this.logger.log(`Delivery ${savedDelivery.deliveryNumber} created successfully`);
            return this.findOne(savedDelivery.id, savedDelivery.tenantId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to create delivery:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(query, tenantId) {
        const queryBuilder = this.deliveryRepository.createQueryBuilder('delivery');
        // Apply tenant filter
        queryBuilder.where('delivery.tenantId = :tenantId', { tenantId });
        // Apply filters
        if (query.search) {
            queryBuilder.andWhere('(delivery.deliveryNumber ILIKE :search OR delivery.customerName ILIKE :search OR delivery.vehicleRegistrationNumber ILIKE :search OR delivery.psaNumber ILIKE :search OR delivery.waybillNumber ILIKE :search)', { search: `%${query.search}%` });
        }
        if (query.status) {
            queryBuilder.andWhere('delivery.status = :status', { status: query.status });
        }
        if (query.deliveryType) {
            queryBuilder.andWhere('delivery.deliveryType = :deliveryType', { deliveryType: query.deliveryType });
        }
        if (query.productType) {
            queryBuilder.andWhere('delivery.productType = :productType', { productType: query.productType });
        }
        if (query.supplierId) {
            queryBuilder.andWhere('delivery.supplierId = :supplierId', { supplierId: query.supplierId });
        }
        if (query.customerId) {
            queryBuilder.andWhere('delivery.customerId = :customerId', { customerId: query.customerId });
        }
        if (query.depotId) {
            queryBuilder.andWhere('delivery.depotId = :depotId', { depotId: query.depotId });
        }
        if (query.transporterId) {
            queryBuilder.andWhere('delivery.transporterId = :transporterId', { transporterId: query.transporterId });
        }
        if (query.fromDate && query.toDate) {
            queryBuilder.andWhere('delivery.deliveryDate BETWEEN :fromDate AND :toDate', {
                fromDate: query.fromDate,
                toDate: query.toDate
            });
        }
        else if (query.fromDate) {
            queryBuilder.andWhere('delivery.deliveryDate >= :fromDate', { fromDate: query.fromDate });
        }
        else if (query.toDate) {
            queryBuilder.andWhere('delivery.deliveryDate <= :toDate', { toDate: query.toDate });
        }
        if (query.fromCreatedDate && query.toCreatedDate) {
            queryBuilder.andWhere('delivery.createdAt BETWEEN :fromCreatedDate AND :toCreatedDate', {
                fromCreatedDate: query.fromCreatedDate,
                toCreatedDate: query.toCreatedDate
            });
        }
        if (query.minQuantity) {
            queryBuilder.andWhere('delivery.quantityLitres >= :minQuantity', { minQuantity: query.minQuantity });
        }
        if (query.maxQuantity) {
            queryBuilder.andWhere('delivery.quantityLitres <= :maxQuantity', { maxQuantity: query.maxQuantity });
        }
        if (query.minValue) {
            queryBuilder.andWhere('delivery.totalValue >= :minValue', { minValue: query.minValue });
        }
        if (query.maxValue) {
            queryBuilder.andWhere('delivery.totalValue <= :maxValue', { maxValue: query.maxValue });
        }
        if (query.vehicleRegistrationNumber) {
            queryBuilder.andWhere('delivery.vehicleRegistrationNumber ILIKE :vehicleReg', {
                vehicleReg: `%${query.vehicleRegistrationNumber}%`
            });
        }
        if (query.psaNumber) {
            queryBuilder.andWhere('delivery.psaNumber ILIKE :psaNumber', {
                psaNumber: `%${query.psaNumber}%`
            });
        }
        if (query.waybillNumber) {
            queryBuilder.andWhere('delivery.waybillNumber ILIKE :waybillNumber', {
                waybillNumber: `%${query.waybillNumber}%`
            });
        }
        if (query.invoiceNumber) {
            queryBuilder.andWhere('delivery.invoiceNumber ILIKE :invoiceNumber', {
                invoiceNumber: `%${query.invoiceNumber}%`
            });
        }
        if (query.npaPermitNumber) {
            queryBuilder.andWhere('delivery.npaPermitNumber ILIKE :npaPermitNumber', {
                npaPermitNumber: `%${query.npaPermitNumber}%`
            });
        }
        if (query.gpsTrackedOnly) {
            queryBuilder.andWhere('delivery.gpsTrackingEnabled = true');
        }
        if (query.delayedOnly) {
            queryBuilder.andWhere('delivery.actualDeliveryTime > delivery.plannedDeliveryTime');
        }
        if (query.invoicedOnly) {
            queryBuilder.andWhere('(delivery.supplierInvoiceId IS NOT NULL OR delivery.customerInvoiceId IS NOT NULL)');
        }
        if (query.pendingApprovalsOnly) {
            queryBuilder.andWhere('delivery.status = :pendingStatus', { pendingStatus: daily_delivery_entity_1.DeliveryStatus.PENDING_APPROVAL });
        }
        // Apply sorting
        const sortField = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'DESC';
        queryBuilder.orderBy(`delivery.${sortField}`, sortOrder);
        // Apply pagination
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        // Include related data if requested
        if (query.includeLineItems) {
            queryBuilder.leftJoinAndSelect('delivery.lineItems', 'lineItems');
        }
        if (query.includeApprovalHistory) {
            queryBuilder.leftJoinAndSelect('delivery.approvalHistory', 'approvalHistory');
        }
        if (query.includeDocuments) {
            queryBuilder.leftJoinAndSelect('delivery.documents', 'documents');
        }
        // Execute query
        const [deliveries, total] = await queryBuilder.getManyAndCount();
        return {
            deliveries,
            total,
            page,
            limit,
        };
    }
    async findOne(id, tenantId) {
        const delivery = await this.deliveryRepository.findOne({
            where: { id, tenantId },
            relations: ['lineItems', 'approvalHistory', 'documents'],
        });
        if (!delivery) {
            throw new common_1.NotFoundException(`Delivery with ID ${id} not found`);
        }
        return delivery;
    }
    async update(id, updateDeliveryDto, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        // Check if delivery can be updated
        if (delivery.status === daily_delivery_entity_1.DeliveryStatus.COMPLETED || delivery.status === daily_delivery_entity_1.DeliveryStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update completed or cancelled delivery');
        }
        // Validate update data
        const validation = await this.validationService.validateDeliveryUpdate(delivery, updateDeliveryDto);
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
        }
        // Update the delivery
        const updatedData = {
            ...updateDeliveryDto,
            actualDeliveryTime: updateDeliveryDto.actualDeliveryTime ? new Date(updateDeliveryDto.actualDeliveryTime) : delivery.actualDeliveryTime,
            updatedBy: updateDeliveryDto.updatedBy,
        };
        await this.deliveryRepository.update(id, updatedData);
        // Emit event for integration
        this.eventEmitter.emit('delivery.updated', {
            deliveryId: id,
            tenantId,
            changes: updateDeliveryDto,
        });
        this.logger.log(`Delivery ${delivery.deliveryNumber} updated successfully`);
        return this.findOne(id, tenantId);
    }
    async delete(id, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        // Check if delivery can be deleted
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.DRAFT && delivery.status !== daily_delivery_entity_1.DeliveryStatus.CANCELLED) {
            throw new common_1.BadRequestException('Only draft or cancelled deliveries can be deleted');
        }
        await this.deliveryRepository.softDelete(id);
        // Emit event for integration
        this.eventEmitter.emit('delivery.deleted', {
            deliveryId: id,
            tenantId,
            deliveryNumber: delivery.deliveryNumber,
        });
        this.logger.log(`Delivery ${delivery.deliveryNumber} deleted successfully`);
    }
    async submitForApproval(id, submitDto, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft deliveries can be submitted for approval');
        }
        // Validate for approval
        const validation = await this.validationService.validateForApproval(delivery);
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`Cannot submit for approval: ${validation.errors.join(', ')}`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Update delivery status
            await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, id, {
                status: daily_delivery_entity_1.DeliveryStatus.PENDING_APPROVAL,
                updatedBy: submitDto.submittedBy,
            });
            // Create approval history entry
            const approvalHistory = this.approvalHistoryRepository.create({
                deliveryId: id,
                approvalStep: 1,
                action: delivery_approval_history_entity_1.ApprovalAction.SUBMITTED,
                approvedBy: submitDto.submittedBy,
                approverRole: 'SUBMITTER',
                comments: submitDto.comments,
            });
            await queryRunner.manager.save(approvalHistory);
            // Start approval workflow
            await this.approvalWorkflowService.startWorkflow(delivery, submitDto.submittedBy);
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('delivery.submitted_for_approval', {
                deliveryId: id,
                tenantId,
                submittedBy: submitDto.submittedBy,
            });
            this.logger.log(`Delivery ${delivery.deliveryNumber} submitted for approval`);
            return this.findOne(id, tenantId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async processApproval(id, processDto, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Only pending approval deliveries can be processed');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create approval history entry
            const currentStep = await this.approvalHistoryRepository.count({
                where: { deliveryId: id }
            });
            const approvalHistory = this.approvalHistoryRepository.create({
                deliveryId: id,
                approvalStep: currentStep + 1,
                action: processDto.action,
                approvedBy: processDto.approvedBy,
                approverRole: 'APPROVER', // This should be fetched from user role service
                comments: processDto.comments,
                decisionDeadline: processDto.decisionDeadline ? new Date(processDto.decisionDeadline) : null,
            });
            await queryRunner.manager.save(approvalHistory);
            // Update delivery status based on action
            let newStatus = delivery.status;
            let approvalData = {};
            switch (processDto.action) {
                case delivery_approval_history_entity_1.ApprovalAction.APPROVED:
                    newStatus = daily_delivery_entity_1.DeliveryStatus.APPROVED;
                    approvalData = {
                        approvedBy: processDto.approvedBy,
                        approvalDate: new Date(),
                        approvalComments: processDto.comments,
                    };
                    break;
                case delivery_approval_history_entity_1.ApprovalAction.REJECTED:
                    newStatus = daily_delivery_entity_1.DeliveryStatus.REJECTED;
                    break;
                case delivery_approval_history_entity_1.ApprovalAction.RETURNED:
                    newStatus = daily_delivery_entity_1.DeliveryStatus.DRAFT;
                    break;
                case delivery_approval_history_entity_1.ApprovalAction.CANCELLED:
                    newStatus = daily_delivery_entity_1.DeliveryStatus.CANCELLED;
                    break;
            }
            await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, id, {
                status: newStatus,
                ...approvalData,
                updatedBy: processDto.approvedBy,
            });
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('delivery.approval_processed', {
                deliveryId: id,
                tenantId,
                action: processDto.action,
                approvedBy: processDto.approvedBy,
                newStatus,
            });
            this.logger.log(`Delivery ${delivery.deliveryNumber} approval processed: ${processDto.action}`);
            return this.findOne(id, tenantId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async markInTransit(id, userId, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.APPROVED) {
            throw new common_1.BadRequestException('Only approved deliveries can be marked as in transit');
        }
        await this.deliveryRepository.update(id, {
            status: daily_delivery_entity_1.DeliveryStatus.IN_TRANSIT,
            updatedBy: userId,
        });
        // Emit event for GPS tracking
        this.eventEmitter.emit('delivery.in_transit', {
            deliveryId: id,
            tenantId,
            vehicleRegistrationNumber: delivery.vehicleRegistrationNumber,
            gpsTrackingEnabled: delivery.gpsTrackingEnabled,
        });
        this.logger.log(`Delivery ${delivery.deliveryNumber} marked as in transit`);
        return this.findOne(id, tenantId);
    }
    async markDelivered(id, userId, tenantId, actualDeliveryTime) {
        const delivery = await this.findOne(id, tenantId);
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.IN_TRANSIT) {
            throw new common_1.BadRequestException('Only in-transit deliveries can be marked as delivered');
        }
        await this.deliveryRepository.update(id, {
            status: daily_delivery_entity_1.DeliveryStatus.DELIVERED,
            actualDeliveryTime: actualDeliveryTime || new Date(),
            performanceObligationSatisfied: true,
            updatedBy: userId,
        });
        // Emit event for inventory and invoicing
        this.eventEmitter.emit('delivery.delivered', {
            deliveryId: id,
            tenantId,
            actualDeliveryTime: actualDeliveryTime || new Date(),
            quantityLitres: delivery.quantityLitres,
            depotId: delivery.depotId,
            customerId: delivery.customerId,
            productType: delivery.productType,
        });
        this.logger.log(`Delivery ${delivery.deliveryNumber} marked as delivered`);
        return this.findOne(id, tenantId);
    }
    async addDocument(createDocumentDto) {
        // Verify delivery exists and user has access
        const delivery = await this.deliveryRepository.findOne({
            where: { id: createDocumentDto.deliveryId }
        });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery not found');
        }
        const document = this.documentsRepository.create(createDocumentDto);
        const savedDocument = await this.documentsRepository.save(document);
        this.logger.log(`Document ${createDocumentDto.documentName} added to delivery ${delivery.deliveryNumber}`);
        return savedDocument;
    }
    async verifyDocument(documentId, verifyDto) {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId }
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        await this.documentsRepository.update(documentId, {
            isVerified: true,
            verifiedBy: verifyDto.verifiedBy,
            verificationDate: new Date(),
        });
        this.logger.log(`Document ${document.documentName} verified`);
        return this.documentsRepository.findOne({ where: { id: documentId } });
    }
    async getDeliveryStats(tenantId, fromDate, toDate) {
        const queryBuilder = this.deliveryRepository.createQueryBuilder('delivery');
        queryBuilder.where('delivery.tenantId = :tenantId', { tenantId });
        if (fromDate && toDate) {
            queryBuilder.andWhere('delivery.deliveryDate BETWEEN :fromDate AND :toDate', {
                fromDate,
                toDate
            });
        }
        const stats = await queryBuilder
            .select([
            'COUNT(*) as total_deliveries',
            'SUM(delivery.quantityLitres) as total_quantity',
            'SUM(delivery.totalValue) as total_value',
            'AVG(delivery.quantityLitres) as avg_quantity',
            'AVG(delivery.totalValue) as avg_value',
            'COUNT(CASE WHEN delivery.status = :delivered THEN 1 END) as delivered_count',
            'COUNT(CASE WHEN delivery.status = :pending THEN 1 END) as pending_count',
            'COUNT(CASE WHEN delivery.actualDeliveryTime > delivery.plannedDeliveryTime THEN 1 END) as delayed_count',
        ])
            .setParameters({
            delivered: daily_delivery_entity_1.DeliveryStatus.DELIVERED,
            pending: daily_delivery_entity_1.DeliveryStatus.PENDING_APPROVAL,
        })
            .getRawOne();
        // Get stats by product type
        const productStats = await queryBuilder
            .select([
            'delivery.productType',
            'COUNT(*) as count',
            'SUM(delivery.quantityLitres) as quantity',
            'SUM(delivery.totalValue) as value',
        ])
            .groupBy('delivery.productType')
            .getRawMany();
        // Get stats by status
        const statusStats = await queryBuilder
            .select([
            'delivery.status',
            'COUNT(*) as count',
        ])
            .groupBy('delivery.status')
            .getRawMany();
        return {
            overall: stats,
            byProduct: productStats,
            byStatus: statusStats,
        };
    }
    /**
     * Fetch price build-up components from pricing service
     */
    async fetchPriceBuildupComponents(productType, stationType, deliveryDate) {
        this.logger.log(`Fetching price build-up for ${productType} at ${stationType} station`);
        // This would integrate with the pricing service
        // For now, return mock data structure
        return {
            productType,
            stationType,
            deliveryDate,
            basePrice: 4.50, // Base pump price
            dealerMargin: stationType === daily_delivery_entity_1.StationType.DODO ? 0.15 : 0,
            marketingMargin: 0.10,
            transportationCost: 0.05,
            taxes: {
                petroleumTax: 0.20,
                energyFundLevy: 0.05,
                roadFundLevy: 0.07,
                priceStabilizationLevy: 0.16,
                uppfLevy: 0.46
            },
            levies: {
                primaryDistributionMargin: 0.27,
                secondaryDistributionMargin: 0.24,
                retailMargin: stationType === daily_delivery_entity_1.StationType.DODO ? 0.18 : 0
            },
            calculatedAt: new Date(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };
    }
    /**
     * Create inventory movement entries for COCO/DOCO stations
     */
    async createInventoryMovement(delivery, userId) {
        if (!delivery.requiresInventoryMovement()) {
            throw new common_1.BadRequestException('Delivery does not require inventory movement');
        }
        this.logger.log(`Creating inventory movement for delivery ${delivery.deliveryNumber}`);
        // Emit event for inventory service
        this.eventEmitter.emit('inventory.movement_required', {
            deliveryId: delivery.id,
            tenantId: delivery.tenantId,
            movementType: 'INBOUND_TRANSFER',
            productType: delivery.productType,
            quantity: delivery.quantityLitres,
            unitCost: delivery.unitPrice,
            totalValue: delivery.totalValue,
            sourceLocation: delivery.depotId,
            destinationLocation: delivery.customerId,
            stationType: delivery.stationType,
            revenueRecognitionRequired: true,
            movementDate: delivery.actualDeliveryTime || new Date(),
            createdBy: userId
        });
    }
    /**
     * Create immediate sales entries for DODO/Industrial/Commercial
     */
    async createImmediateSale(delivery, userId) {
        if (!delivery.requiresImmediateSale()) {
            throw new common_1.BadRequestException('Delivery does not require immediate sale processing');
        }
        this.logger.log(`Creating immediate sale for delivery ${delivery.deliveryNumber}`);
        const priceBuildupComponents = delivery.getPriceBuildupComponents();
        const sellingPrice = delivery.getCalculatedSellingPrice();
        // Emit event for sales/revenue recognition
        this.eventEmitter.emit('sale.immediate_recognition_required', {
            deliveryId: delivery.id,
            tenantId: delivery.tenantId,
            saleType: 'IMMEDIATE',
            productType: delivery.productType,
            quantity: delivery.quantityLitres,
            unitPrice: sellingPrice,
            totalValue: sellingPrice * delivery.quantityLitres,
            customerId: delivery.customerId,
            stationType: delivery.stationType,
            priceBuildupComponents,
            saleDate: delivery.actualDeliveryTime || new Date(),
            createdBy: userId
        });
    }
    /**
     * Process deferred revenue recognition
     */
    async processDeferredRevenueRecognition(delivery, userId) {
        if (!delivery.shouldDeferRevenue()) {
            throw new common_1.BadRequestException('Delivery does not require deferred revenue recognition');
        }
        this.logger.log(`Processing deferred revenue recognition for delivery ${delivery.deliveryNumber}`);
        // Emit event for accounting service to create deferred revenue entries
        this.eventEmitter.emit('revenue.deferred_recognition_required', {
            deliveryId: delivery.id,
            tenantId: delivery.tenantId,
            recognitionType: 'DEFERRED',
            productType: delivery.productType,
            quantity: delivery.quantityLitres,
            unitPrice: delivery.unitPrice,
            totalValue: delivery.totalValue,
            customerId: delivery.customerId,
            stationType: delivery.stationType,
            deferralReason: delivery.requiresInventoryMovement() ? 'INVENTORY_MOVEMENT' : 'MANUAL_DEFERRAL',
            recognitionDate: delivery.revenueRecognitionDate || delivery.actualDeliveryTime,
            createdBy: userId
        });
    }
    /**
     * Enhanced delivery completion processing with station type logic
     */
    async completeDeliveryWithStationTypeLogic(id, userId, tenantId) {
        const delivery = await this.findOne(id, tenantId);
        if (delivery.status !== daily_delivery_entity_1.DeliveryStatus.DELIVERED) {
            throw new common_1.BadRequestException('Only delivered orders can be completed');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Process based on station type
            if (delivery.requiresInventoryMovement()) {
                // COCO/DOCO: Create inventory movement entries
                await this.createInventoryMovement(delivery, userId);
                // Create deferred revenue entries
                if (delivery.shouldDeferRevenue()) {
                    await this.processDeferredRevenueRecognition(delivery, userId);
                }
            }
            else if (delivery.requiresImmediateSale()) {
                // DODO/Industrial/Commercial: Create immediate sales entries
                await this.createImmediateSale(delivery, userId);
            }
            // Update delivery status
            await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, id, {
                status: daily_delivery_entity_1.DeliveryStatus.COMPLETED,
                updatedBy: userId,
            });
            await queryRunner.commitTransaction();
            // Emit completion event
            this.eventEmitter.emit('delivery.completed_with_station_logic', {
                deliveryId: id,
                tenantId,
                stationType: delivery.stationType,
                revenueRecognitionType: delivery.revenueRecognitionType,
                requiresInventoryMovement: delivery.requiresInventoryMovement(),
                requiresImmediateSale: delivery.requiresImmediateSale(),
                completedBy: userId,
            });
            this.logger.log(`Delivery ${delivery.deliveryNumber} completed with station type logic`);
            return this.findOne(id, tenantId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Calculate tax accruals based on price build-up components
     */
    calculateTaxAccruals(delivery) {
        const priceBuildupComponents = delivery.getPriceBuildupComponents();
        if (!priceBuildupComponents || !priceBuildupComponents.taxes) {
            return {
                petroleumTax: delivery.petroleumTaxAmount,
                energyFundLevy: delivery.energyFundLevy,
                roadFundLevy: delivery.roadFundLevy,
                priceStabilizationLevy: delivery.priceStabilizationLevy,
                uppfLevy: delivery.unifiedPetroleumPriceFundLevy,
                total: delivery.getTotalTaxes()
            };
        }
        const quantity = delivery.quantityLitres;
        const taxes = priceBuildupComponents.taxes;
        return {
            petroleumTax: quantity * taxes.petroleumTax,
            energyFundLevy: quantity * taxes.energyFundLevy,
            roadFundLevy: quantity * taxes.roadFundLevy,
            priceStabilizationLevy: quantity * taxes.priceStabilizationLevy,
            uppfLevy: quantity * taxes.uppfLevy,
            total: quantity * (taxes.petroleumTax + taxes.energyFundLevy + taxes.roadFundLevy +
                taxes.priceStabilizationLevy + taxes.uppfLevy)
        };
    }
};
exports.DailyDeliveryService = DailyDeliveryService;
exports.DailyDeliveryService = DailyDeliveryService = DailyDeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_delivery_entity_1.DailyDelivery)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_line_item_entity_1.DeliveryLineItem)),
    __param(2, (0, typeorm_1.InjectRepository)(delivery_approval_history_entity_1.DeliveryApprovalHistory)),
    __param(3, (0, typeorm_1.InjectRepository)(delivery_documents_entity_1.DeliveryDocuments)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2,
        delivery_validation_service_1.DeliveryValidationService,
        approval_workflow_service_1.ApprovalWorkflowService])
], DailyDeliveryService);
//# sourceMappingURL=daily-delivery.service.js.map