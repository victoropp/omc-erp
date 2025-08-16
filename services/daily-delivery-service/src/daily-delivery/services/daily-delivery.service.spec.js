"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const daily_delivery_service_1 = require("./daily-delivery.service");
const daily_delivery_entity_1 = require("../entities/daily-delivery.entity");
const delivery_line_item_entity_1 = require("../entities/delivery-line-item.entity");
const delivery_approval_history_entity_1 = require("../entities/delivery-approval-history.entity");
const delivery_documents_entity_1 = require("../entities/delivery-documents.entity");
const delivery_validation_service_1 = require("./delivery-validation.service");
const approval_workflow_service_1 = require("../../approval-workflow/approval-workflow.service");
describe('DailyDeliveryService - Station Type Logic', () => {
    let service;
    let deliveryRepository;
    let mockQueryRunner;
    const mockRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
    const mockDataSource = {
        createQueryRunner: jest.fn(),
    };
    const mockEventEmitter = {
        emit: jest.fn(),
    };
    const mockValidationService = {
        validateDelivery: jest.fn(),
        validateDeliveryUpdate: jest.fn(),
        validateForApproval: jest.fn(),
    };
    const mockApprovalService = {
        startWorkflow: jest.fn(),
    };
    beforeEach(async () => {
        mockQueryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                save: jest.fn(),
                update: jest.fn(),
            },
        };
        mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                daily_delivery_service_1.DailyDeliveryService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(daily_delivery_entity_1.DailyDelivery),
                    useValue: mockRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(delivery_line_item_entity_1.DeliveryLineItem),
                    useValue: mockRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(delivery_approval_history_entity_1.DeliveryApprovalHistory),
                    useValue: mockRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(delivery_documents_entity_1.DeliveryDocuments),
                    useValue: mockRepository,
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: mockEventEmitter,
                },
                {
                    provide: delivery_validation_service_1.DeliveryValidationService,
                    useValue: mockValidationService,
                },
                {
                    provide: approval_workflow_service_1.ApprovalWorkflowService,
                    useValue: mockApprovalService,
                },
            ],
        }).compile();
        service = module.get(daily_delivery_service_1.DailyDeliveryService);
        deliveryRepository = module.get((0, typeorm_1.getRepositoryToken)(daily_delivery_entity_1.DailyDelivery));
    });
    describe('Station Type Logic', () => {
        it('should create COCO delivery with deferred revenue recognition', async () => {
            // Arrange
            const createDto = {
                tenantId: '123e4567-e89b-12d3-a456-426614174000',
                deliveryDate: '2024-01-15',
                supplierId: '123e4567-e89b-12d3-a456-426614174001',
                depotId: '123e4567-e89b-12d3-a456-426614174002',
                customerId: '123e4567-e89b-12d3-a456-426614174003',
                customerName: 'COCO Station A',
                deliveryLocation: 'Accra',
                stationType: daily_delivery_entity_1.StationType.COCO,
                psaNumber: 'PSA-2024-001',
                waybillNumber: 'WB-2024-001',
                vehicleRegistrationNumber: 'GH-1234-23',
                transporterName: 'Transport Co.',
                productType: daily_delivery_entity_1.ProductGrade.PMS,
                productDescription: 'Premium Motor Spirit',
                quantityLitres: 10000,
                unitPrice: 4.50,
                deliveryType: 'DEPOT_TO_STATION',
                createdBy: '123e4567-e89b-12d3-a456-426614174004',
            };
            mockValidationService.validateDelivery.mockResolvedValue({ isValid: true, errors: [] });
            mockRepository.findOne.mockResolvedValue(null); // No duplicates
            mockRepository.create.mockReturnValue({ id: 'new-delivery-id', ...createDto });
            mockQueryRunner.manager.save.mockResolvedValue({ id: 'new-delivery-id', ...createDto });
            // Act
            const result = await service.create(createDto);
            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                stationType: daily_delivery_entity_1.StationType.COCO,
                revenueRecognitionType: daily_delivery_entity_1.RevenueRecognitionType.DEFERRED,
                priceBuildupSnapshot: expect.any(String),
            }));
        });
        it('should create DODO delivery with immediate revenue recognition', async () => {
            // Arrange
            const createDto = {
                tenantId: '123e4567-e89b-12d3-a456-426614174000',
                deliveryDate: '2024-01-15',
                supplierId: '123e4567-e89b-12d3-a456-426614174001',
                depotId: '123e4567-e89b-12d3-a456-426614174002',
                customerId: '123e4567-e89b-12d3-a456-426614174003',
                customerName: 'DODO Station B',
                deliveryLocation: 'Kumasi',
                stationType: daily_delivery_entity_1.StationType.DODO,
                psaNumber: 'PSA-2024-002',
                waybillNumber: 'WB-2024-002',
                vehicleRegistrationNumber: 'GH-5678-23',
                transporterName: 'Transport Co.',
                productType: daily_delivery_entity_1.ProductGrade.PMS,
                productDescription: 'Premium Motor Spirit',
                quantityLitres: 8000,
                unitPrice: 4.65,
                deliveryType: 'DEPOT_TO_STATION',
                createdBy: '123e4567-e89b-12d3-a456-426614174004',
            };
            mockValidationService.validateDelivery.mockResolvedValue({ isValid: true, errors: [] });
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue({ id: 'new-delivery-id', ...createDto });
            mockQueryRunner.manager.save.mockResolvedValue({ id: 'new-delivery-id', ...createDto });
            // Act
            await service.create(createDto);
            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                stationType: daily_delivery_entity_1.StationType.DODO,
                revenueRecognitionType: daily_delivery_entity_1.RevenueRecognitionType.IMMEDIATE,
                priceBuildupSnapshot: expect.any(String),
            }));
        });
        it('should create inventory movement for COCO station completion', async () => {
            // Arrange
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.id = 'delivery-id';
            delivery.tenantId = 'tenant-id';
            delivery.stationType = daily_delivery_entity_1.StationType.COCO;
            delivery.status = daily_delivery_entity_1.DeliveryStatus.DELIVERED;
            delivery.deliveryNumber = 'DD-2024-001';
            delivery.productType = daily_delivery_entity_1.ProductGrade.PMS;
            delivery.quantityLitres = 10000;
            delivery.unitPrice = 4.50;
            delivery.totalValue = 45000;
            delivery.depotId = 'depot-id';
            delivery.customerId = 'customer-id';
            delivery.revenueRecognitionType = daily_delivery_entity_1.RevenueRecognitionType.DEFERRED;
            mockRepository.findOne.mockResolvedValue(delivery);
            // Act
            await service.completeDeliveryWithStationTypeLogic(delivery.id, 'user-id', delivery.tenantId);
            // Assert
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('inventory.movement_required', expect.objectContaining({
                deliveryId: delivery.id,
                movementType: 'INBOUND_TRANSFER',
                stationType: daily_delivery_entity_1.StationType.COCO,
                revenueRecognitionRequired: true,
            }));
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('revenue.deferred_recognition_required', expect.objectContaining({
                deliveryId: delivery.id,
                recognitionType: 'DEFERRED',
                stationType: daily_delivery_entity_1.StationType.COCO,
            }));
        });
        it('should create immediate sale for DODO station completion', async () => {
            // Arrange
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.id = 'delivery-id';
            delivery.tenantId = 'tenant-id';
            delivery.stationType = daily_delivery_entity_1.StationType.DODO;
            delivery.status = daily_delivery_entity_1.DeliveryStatus.DELIVERED;
            delivery.deliveryNumber = 'DD-2024-002';
            delivery.productType = daily_delivery_entity_1.ProductGrade.PMS;
            delivery.quantityLitres = 8000;
            delivery.unitPrice = 4.65;
            delivery.totalValue = 37200;
            delivery.customerId = 'customer-id';
            delivery.revenueRecognitionType = daily_delivery_entity_1.RevenueRecognitionType.IMMEDIATE;
            delivery.priceBuildupSnapshot = JSON.stringify({
                basePrice: 4.50,
                dealerMargin: 0.15,
                stationType: daily_delivery_entity_1.StationType.DODO
            });
            mockRepository.findOne.mockResolvedValue(delivery);
            // Act
            await service.completeDeliveryWithStationTypeLogic(delivery.id, 'user-id', delivery.tenantId);
            // Assert
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('sale.immediate_recognition_required', expect.objectContaining({
                deliveryId: delivery.id,
                saleType: 'IMMEDIATE',
                stationType: daily_delivery_entity_1.StationType.DODO,
                unitPrice: 4.65, // Base price + dealer margin
            }));
        });
        it('should calculate tax accruals from price build-up components', async () => {
            // Arrange
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.quantityLitres = 10000;
            delivery.priceBuildupSnapshot = JSON.stringify({
                taxes: {
                    petroleumTax: 0.20,
                    energyFundLevy: 0.05,
                    roadFundLevy: 0.07,
                    priceStabilizationLevy: 0.16,
                    uppfLevy: 0.46
                }
            });
            // Act
            const taxAccruals = service.calculateTaxAccruals(delivery);
            // Assert
            expect(taxAccruals).toEqual({
                petroleumTax: 2000, // 0.20 * 10000
                energyFundLevy: 500, // 0.05 * 10000
                roadFundLevy: 700, // 0.07 * 10000
                priceStabilizationLevy: 1600, // 0.16 * 10000
                uppfLevy: 4600, // 0.46 * 10000
                total: 9400 // Sum of all taxes
            });
        });
    });
    describe('Revenue Recognition Logic', () => {
        it('should defer revenue for COCO stations', () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.COCO;
            delivery.revenueRecognitionType = daily_delivery_entity_1.RevenueRecognitionType.DEFERRED;
            expect(delivery.shouldDeferRevenue()).toBe(true);
            expect(delivery.requiresInventoryMovement()).toBe(true);
            expect(delivery.requiresImmediateSale()).toBe(false);
        });
        it('should recognize revenue immediately for DODO stations', () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.DODO;
            delivery.revenueRecognitionType = daily_delivery_entity_1.RevenueRecognitionType.IMMEDIATE;
            expect(delivery.shouldDeferRevenue()).toBe(false);
            expect(delivery.requiresInventoryMovement()).toBe(false);
            expect(delivery.requiresImmediateSale()).toBe(true);
        });
        it('should calculate selling price with dealer margin for DODO', () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.DODO;
            delivery.unitPrice = 4.50;
            delivery.priceBuildupSnapshot = JSON.stringify({
                basePrice: 4.50,
                dealerMargin: 0.15,
                marketingMargin: 0.10
            });
            const sellingPrice = delivery.getCalculatedSellingPrice();
            expect(sellingPrice).toBe(4.75); // 4.50 + 0.15 + 0.10
        });
        it('should calculate cost price without margins for COCO', () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.COCO;
            delivery.unitPrice = 4.50;
            delivery.priceBuildupSnapshot = JSON.stringify({
                basePrice: 4.50,
                dealerMargin: 0.15,
                marketingMargin: 0.10
            });
            const costPrice = delivery.getCalculatedSellingPrice();
            expect(costPrice).toBe(4.50); // Base price only for inventory
        });
    });
    describe('Error Handling', () => {
        it('should throw error for COCO customer invoice generation', async () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.COCO;
            await expect(service.createImmediateSale(delivery, 'user-id')).rejects.toThrow('Delivery does not require immediate sale processing');
        });
        it('should throw error for DODO inventory movement', async () => {
            const delivery = new daily_delivery_entity_1.DailyDelivery();
            delivery.stationType = daily_delivery_entity_1.StationType.DODO;
            await expect(service.createInventoryMovement(delivery, 'user-id')).rejects.toThrow('Delivery does not require inventory movement');
        });
    });
});
//# sourceMappingURL=daily-delivery.service.spec.js.map