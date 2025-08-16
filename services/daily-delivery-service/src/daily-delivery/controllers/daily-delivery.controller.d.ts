import { DailyDeliveryService } from '../services/daily-delivery.service';
import { CreateDailyDeliveryDto } from '../dto/create-daily-delivery.dto';
import { UpdateDailyDeliveryDto } from '../dto/update-daily-delivery.dto';
import { QueryDailyDeliveryDto } from '../dto/query-daily-delivery.dto';
import { SubmitForApprovalDto, ProcessApprovalDto } from '../dto/approval-action.dto';
import { CreateDeliveryDocumentDto, VerifyDocumentDto } from '../dto/delivery-document.dto';
export declare class DailyDeliveryController {
    private readonly dailyDeliveryService;
    constructor(dailyDeliveryService: DailyDeliveryService);
    create(createDeliveryDto: CreateDailyDeliveryDto, req: any): Promise<import("../entities").DailyDelivery>;
    findAll(query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(fromDate?: string, toDate?: string, req?: {}): Promise<any>;
    findOne(id: string, req: any): Promise<import("../entities").DailyDelivery>;
    update(id: string, updateDeliveryDto: UpdateDailyDeliveryDto, req: any): Promise<import("../entities").DailyDelivery>;
    remove(id: string, req: any): Promise<void>;
    submitForApproval(id: string, submitDto: SubmitForApprovalDto, req: any): Promise<import("../entities").DailyDelivery>;
    processApproval(id: string, processDto: ProcessApprovalDto, req: any): Promise<import("../entities").DailyDelivery>;
    markInTransit(id: string, req: any): Promise<import("../entities").DailyDelivery>;
    markDelivered(id: string, body: {
        actualDeliveryTime?: string;
    }, req: any): Promise<import("../entities").DailyDelivery>;
    addDocument(id: string, createDocumentDto: CreateDeliveryDocumentDto, req: any): Promise<import("../entities").DeliveryDocuments>;
    verifyDocument(documentId: string, verifyDto: VerifyDocumentDto, req: any): Promise<import("../entities").DeliveryDocuments>;
    getBySupplier(supplierId: string, query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getByCustomer(customerId: string, query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getByDepot(depotId: string, query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getByTransporter(transporterId: string, query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPendingApprovals(query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReadyForInvoicing(query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInTransit(query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDelayed(query: QueryDailyDeliveryDto, req: any): Promise<{
        deliveries: import("../entities").DailyDelivery[];
        total: number;
        page: number;
        limit: number;
    }>;
}
//# sourceMappingURL=daily-delivery.controller.d.ts.map