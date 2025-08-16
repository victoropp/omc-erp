import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupplierInvoiceService } from '../invoice-generation/supplier-invoice.service';
import { CustomerInvoiceService } from '../invoice-generation/customer-invoice.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
export declare class ERPIntegrationService {
    private readonly httpService;
    private readonly eventEmitter;
    private readonly supplierInvoiceService;
    private readonly customerInvoiceService;
    private readonly ghanaComplianceService;
    private readonly logger;
    constructor(httpService: HttpService, eventEmitter: EventEmitter2, supplierInvoiceService: SupplierInvoiceService, customerInvoiceService: CustomerInvoiceService, ghanaComplianceService: GhanaComplianceService);
    handleDeliveryCreated(payload: any): Promise<void>;
    handleDeliveryUpdated(payload: any): Promise<void>;
    handleDeliveryApproved(payload: any): Promise<void>;
    handleDeliveryInTransit(payload: any): Promise<void>;
    handleDeliveryDelivered(payload: any): Promise<void>;
    handleSupplierInvoiceGenerated(payload: any): Promise<void>;
    handleCustomerInvoiceGenerated(payload: any): Promise<void>;
    private updateInventoryReservation;
    private updateInventoryDelivered;
    private notifyStationService;
    private startGPSTracking;
    private stopGPSTracking;
    private updateFleetManagement;
    private updateProcurementStatus;
    private updateProcurementInvoicing;
    private updateCRMSystem;
    private sendCustomerInvoice;
    private sendDeliveryNotifications;
    private sendFinanceNotification;
    private createAuditLog;
    private getDeliveryDetails;
    private requiresNPASubmission;
    private shouldAutoGenerateSupplierInvoice;
    private shouldAutoGenerateCustomerInvoice;
    private getNotificationRecipients;
    registerService(): Promise<void>;
    unregisterService(): Promise<void>;
    performHealthChecks(): Promise<{
        healthy: boolean;
        details: any;
    }>;
    private checkDatabaseHealth;
    private checkServiceHealth;
    syncWithExternalSystems(deliveryId: string): Promise<{
        success: boolean;
        errors: string[];
    }>;
    validateIntegrations(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
}
//# sourceMappingURL=erp-integration.service.d.ts.map