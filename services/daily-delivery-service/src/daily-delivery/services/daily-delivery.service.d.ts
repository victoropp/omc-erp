import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyDelivery } from '../entities/daily-delivery.entity';
import { DeliveryLineItem } from '../entities/delivery-line-item.entity';
import { DeliveryApprovalHistory } from '../entities/delivery-approval-history.entity';
import { DeliveryDocuments } from '../entities/delivery-documents.entity';
import { CreateDailyDeliveryDto } from '../dto/create-daily-delivery.dto';
import { UpdateDailyDeliveryDto } from '../dto/update-daily-delivery.dto';
import { QueryDailyDeliveryDto } from '../dto/query-daily-delivery.dto';
import { SubmitForApprovalDto, ProcessApprovalDto } from '../dto/approval-action.dto';
import { CreateDeliveryDocumentDto, VerifyDocumentDto } from '../dto/delivery-document.dto';
import { DeliveryValidationService } from './delivery-validation.service';
import { ApprovalWorkflowService } from '../../approval-workflow/approval-workflow.service';
export declare class DailyDeliveryService {
    private readonly deliveryRepository;
    private readonly lineItemRepository;
    private readonly approvalHistoryRepository;
    private readonly documentsRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly validationService;
    private readonly approvalWorkflowService;
    private readonly logger;
    constructor(deliveryRepository: Repository<DailyDelivery>, lineItemRepository: Repository<DeliveryLineItem>, approvalHistoryRepository: Repository<DeliveryApprovalHistory>, documentsRepository: Repository<DeliveryDocuments>, dataSource: DataSource, eventEmitter: EventEmitter2, validationService: DeliveryValidationService, approvalWorkflowService: ApprovalWorkflowService);
    create(createDeliveryDto: CreateDailyDeliveryDto): Promise<DailyDelivery>;
    findAll(query: QueryDailyDeliveryDto, tenantId: string): Promise<{
        deliveries: DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, tenantId: string): Promise<DailyDelivery>;
    update(id: string, updateDeliveryDto: UpdateDailyDeliveryDto, tenantId: string): Promise<DailyDelivery>;
    delete(id: string, tenantId: string): Promise<void>;
    submitForApproval(id: string, submitDto: SubmitForApprovalDto, tenantId: string): Promise<DailyDelivery>;
    processApproval(id: string, processDto: ProcessApprovalDto, tenantId: string): Promise<DailyDelivery>;
    markInTransit(id: string, userId: string, tenantId: string): Promise<DailyDelivery>;
    markDelivered(id: string, userId: string, tenantId: string, actualDeliveryTime?: Date): Promise<DailyDelivery>;
    addDocument(createDocumentDto: CreateDeliveryDocumentDto): Promise<DeliveryDocuments>;
    verifyDocument(documentId: string, verifyDto: VerifyDocumentDto): Promise<DeliveryDocuments>;
    getDeliveryStats(tenantId: string, fromDate?: string, toDate?: string): Promise<any>;
    /**
     * Fetch price build-up components from pricing service
     */
    private fetchPriceBuildupComponents;
    /**
     * Create inventory movement entries for COCO/DOCO stations
     */
    createInventoryMovement(delivery: DailyDelivery, userId: string): Promise<void>;
    /**
     * Create immediate sales entries for DODO/Industrial/Commercial
     */
    createImmediateSale(delivery: DailyDelivery, userId: string): Promise<void>;
    /**
     * Process deferred revenue recognition
     */
    processDeferredRevenueRecognition(delivery: DailyDelivery, userId: string): Promise<void>;
    /**
     * Enhanced delivery completion processing with station type logic
     */
    completeDeliveryWithStationTypeLogic(id: string, userId: string, tenantId: string): Promise<DailyDelivery>;
    /**
     * Calculate tax accruals based on price build-up components
     */
    calculateTaxAccruals(delivery: DailyDelivery): any;
}
//# sourceMappingURL=daily-delivery.service.d.ts.map