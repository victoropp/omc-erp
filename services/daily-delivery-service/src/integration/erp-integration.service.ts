import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
import { SupplierInvoiceService } from '../invoice-generation/supplier-invoice.service';
import { CustomerInvoiceService } from '../invoice-generation/customer-invoice.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';

interface InventoryUpdateData {
  productType: string;
  quantityChange: number;
  depotId: string;
  transactionType: 'INBOUND' | 'OUTBOUND';
  referenceNumber: string;
  referenceType: 'DELIVERY';
  referenceId: string;
}

interface ServiceRegistryData {
  serviceName: string;
  version: string;
  endpoint: string;
  status: 'HEALTHY' | 'UNHEALTHY';
  metadata?: any;
}

@Injectable()
export class ERPIntegrationService {
  private readonly logger = new Logger(ERPIntegrationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly supplierInvoiceService: SupplierInvoiceService,
    private readonly customerInvoiceService: CustomerInvoiceService,
    private readonly ghanaComplianceService: GhanaComplianceService,
  ) {}

  // ===== EVENT HANDLERS =====

  @OnEvent('delivery.created')
  async handleDeliveryCreated(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling delivery created event for delivery ${payload.deliveryId}`);

      // Update inventory system
      await this.updateInventoryReservation(payload);

      // Notify station service
      await this.notifyStationService(payload);

      // Register with audit service
      await this.createAuditLog('DELIVERY_CREATED', payload);

      // Send notification to relevant stakeholders
      await this.sendDeliveryNotifications(payload, 'CREATED');

    } catch (error) {
      this.logger.error('Failed to handle delivery created event:', error);
    }
  }

  @OnEvent('delivery.updated')
  async handleDeliveryUpdated(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling delivery updated event for delivery ${payload.deliveryId}`);

      // Update inventory if quantities changed
      if (payload.changes.quantityLitres) {
        await this.updateInventoryReservation(payload);
      }

      // Register audit log
      await this.createAuditLog('DELIVERY_UPDATED', {
        deliveryId: payload.deliveryId,
        changes: payload.changes,
      });

    } catch (error) {
      this.logger.error('Failed to handle delivery updated event:', error);
    }
  }

  @OnEvent('delivery.approved')
  async handleDeliveryApproved(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling delivery approved event for delivery ${payload.deliveryId}`);

      // Get delivery details
      const delivery = await this.getDeliveryDetails(payload.deliveryId);
      
      // Submit to NPA if required
      if (this.requiresNPASubmission(delivery)) {
        await this.ghanaComplianceService.submitToNPA(delivery);
      }

      // Update procurement system
      await this.updateProcurementStatus(delivery, 'APPROVED');

      // Send notifications
      await this.sendDeliveryNotifications(payload, 'APPROVED');

      // Register audit log
      await this.createAuditLog('DELIVERY_APPROVED', payload);

    } catch (error) {
      this.logger.error('Failed to handle delivery approved event:', error);
    }
  }

  @OnEvent('delivery.in_transit')
  async handleDeliveryInTransit(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling delivery in transit event for delivery ${payload.deliveryId}`);

      // Start GPS tracking if enabled
      if (payload.gpsTrackingEnabled) {
        await this.startGPSTracking(payload);
      }

      // Update fleet management system
      await this.updateFleetManagement(payload);

      // Send notifications
      await this.sendDeliveryNotifications(payload, 'IN_TRANSIT');

      // Register audit log
      await this.createAuditLog('DELIVERY_IN_TRANSIT', payload);

    } catch (error) {
      this.logger.error('Failed to handle delivery in transit event:', error);
    }
  }

  @OnEvent('delivery.delivered')
  async handleDeliveryDelivered(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling delivery delivered event for delivery ${payload.deliveryId}`);

      // Update inventory - move from reserved to delivered
      await this.updateInventoryDelivered(payload);

      // Stop GPS tracking
      await this.stopGPSTracking(payload.deliveryId);

      // Update fleet management
      await this.updateFleetManagement({
        ...payload,
        status: 'DELIVERED'
      });

      // Get delivery for invoicing
      const delivery = await this.getDeliveryDetails(payload.deliveryId);

      // Auto-generate supplier invoice if configured
      if (await this.shouldAutoGenerateSupplierInvoice(delivery)) {
        try {
          await this.supplierInvoiceService.generateSupplierInvoice(delivery, {
            deliveryId: delivery.id,
            generatedBy: 'SYSTEM',
          });
        } catch (error) {
          this.logger.error('Failed to auto-generate supplier invoice:', error);
        }
      }

      // Auto-generate customer invoice if configured
      if (await this.shouldAutoGenerateCustomerInvoice(delivery)) {
        try {
          await this.customerInvoiceService.generateCustomerInvoice(delivery, {
            deliveryId: delivery.id,
            generatedBy: 'SYSTEM',
          });
        } catch (error) {
          this.logger.error('Failed to auto-generate customer invoice:', error);
        }
      }

      // Submit UPPF claim if applicable
      if (delivery.unifiedPetroleumPriceFundLevy > 0) {
        await this.ghanaComplianceService.submitUPPFClaim(delivery);
      }

      // Send notifications
      await this.sendDeliveryNotifications(payload, 'DELIVERED');

      // Register audit log
      await this.createAuditLog('DELIVERY_DELIVERED', payload);

    } catch (error) {
      this.logger.error('Failed to handle delivery delivered event:', error);
    }
  }

  @OnEvent('supplier_invoice.generated')
  async handleSupplierInvoiceGenerated(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling supplier invoice generated event for delivery ${payload.deliveryId}`);

      // Update procurement system
      await this.updateProcurementInvoicing(payload, 'SUPPLIER_INVOICE_GENERATED');

      // Send notification to finance team
      await this.sendFinanceNotification('SUPPLIER_INVOICE_GENERATED', payload);

      // Register audit log
      await this.createAuditLog('SUPPLIER_INVOICE_GENERATED', payload);

    } catch (error) {
      this.logger.error('Failed to handle supplier invoice generated event:', error);
    }
  }

  @OnEvent('customer_invoice.generated')
  async handleCustomerInvoiceGenerated(payload: any): Promise<void> {
    try {
      this.logger.log(`Handling customer invoice generated event for delivery ${payload.deliveryId}`);

      // Update CRM system
      await this.updateCRMSystem(payload);

      // Send invoice to customer
      await this.sendCustomerInvoice(payload);

      // Register audit log
      await this.createAuditLog('CUSTOMER_INVOICE_GENERATED', payload);

    } catch (error) {
      this.logger.error('Failed to handle customer invoice generated event:', error);
    }
  }

  // ===== INTEGRATION METHODS =====

  private async updateInventoryReservation(payload: any): Promise<void> {
    try {
      const inventoryUpdate: InventoryUpdateData = {
        productType: payload.productType,
        quantityChange: -payload.quantityLitres, // Negative for reservation
        depotId: payload.depotId,
        transactionType: 'OUTBOUND',
        referenceNumber: payload.deliveryNumber,
        referenceType: 'DELIVERY',
        referenceId: payload.deliveryId,
      };

      await firstValueFrom(
        this.httpService.post('/inventory/update-reservation', inventoryUpdate)
      );

      this.logger.log(`Updated inventory reservation for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to update inventory reservation:', error);
    }
  }

  private async updateInventoryDelivered(payload: any): Promise<void> {
    try {
      const inventoryUpdate: InventoryUpdateData = {
        productType: payload.productType,
        quantityChange: -payload.quantityLitres, // Actual consumption
        depotId: payload.depotId,
        transactionType: 'OUTBOUND',
        referenceNumber: `DEL-${payload.deliveryId}`,
        referenceType: 'DELIVERY',
        referenceId: payload.deliveryId,
      };

      await firstValueFrom(
        this.httpService.post('/inventory/update-actual', inventoryUpdate)
      );

      this.logger.log(`Updated inventory actual for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to update inventory actual:', error);
    }
  }

  private async notifyStationService(payload: any): Promise<void> {
    try {
      const notificationData = {
        stationId: payload.customerId, // Assuming customer can be a station
        deliveryId: payload.deliveryId,
        productType: payload.productType,
        quantityLitres: payload.quantityLitres,
        plannedDeliveryDate: payload.deliveryDate,
        status: 'SCHEDULED',
      };

      await firstValueFrom(
        this.httpService.post('/stations/delivery-notifications', notificationData)
      );

      this.logger.log(`Notified station service for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to notify station service:', error);
    }
  }

  private async startGPSTracking(payload: any): Promise<void> {
    try {
      const trackingData = {
        deliveryId: payload.deliveryId,
        vehicleRegistrationNumber: payload.vehicleRegistrationNumber,
        startTime: new Date(),
        trackingEnabled: true,
      };

      await firstValueFrom(
        this.httpService.post('/fleet/start-tracking', trackingData)
      );

      this.logger.log(`Started GPS tracking for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to start GPS tracking:', error);
    }
  }

  private async stopGPSTracking(deliveryId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/fleet/stop-tracking/${deliveryId}`, {
          endTime: new Date(),
        })
      );

      this.logger.log(`Stopped GPS tracking for delivery ${deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to stop GPS tracking:', error);
    }
  }

  private async updateFleetManagement(payload: any): Promise<void> {
    try {
      const fleetUpdate = {
        vehicleRegistrationNumber: payload.vehicleRegistrationNumber,
        deliveryId: payload.deliveryId,
        status: payload.status,
        currentLocation: payload.currentLocation,
        lastUpdate: new Date(),
      };

      await firstValueFrom(
        this.httpService.patch('/fleet/vehicle-status', fleetUpdate)
      );

      this.logger.log(`Updated fleet management for vehicle ${payload.vehicleRegistrationNumber}`);
    } catch (error) {
      this.logger.error('Failed to update fleet management:', error);
    }
  }

  private async updateProcurementStatus(delivery: DailyDelivery, status: string): Promise<void> {
    try {
      const procurementUpdate = {
        purchaseOrderId: delivery.purchaseOrderId,
        deliveryId: delivery.id,
        status,
        quantityDelivered: delivery.quantityLitres,
        deliveryDate: delivery.deliveryDate,
      };

      await firstValueFrom(
        this.httpService.patch('/procurement/delivery-status', procurementUpdate)
      );

      this.logger.log(`Updated procurement status for delivery ${delivery.id}`);
    } catch (error) {
      this.logger.error('Failed to update procurement status:', error);
    }
  }

  private async updateProcurementInvoicing(payload: any, status: string): Promise<void> {
    try {
      const procurementUpdate = {
        deliveryId: payload.deliveryId,
        invoiceId: payload.invoiceId,
        invoiceNumber: payload.invoiceNumber,
        invoiceAmount: payload.amount,
        status,
      };

      await firstValueFrom(
        this.httpService.patch('/procurement/invoicing-status', procurementUpdate)
      );

      this.logger.log(`Updated procurement invoicing for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to update procurement invoicing:', error);
    }
  }

  private async updateCRMSystem(payload: any): Promise<void> {
    try {
      const crmUpdate = {
        customerId: payload.customerId,
        deliveryId: payload.deliveryId,
        invoiceId: payload.invoiceId,
        invoiceAmount: payload.amount,
        transactionType: 'FUEL_DELIVERY',
        transactionDate: new Date(),
      };

      await firstValueFrom(
        this.httpService.post('/crm/customer-transactions', crmUpdate)
      );

      this.logger.log(`Updated CRM system for customer ${payload.customerId}`);
    } catch (error) {
      this.logger.error('Failed to update CRM system:', error);
    }
  }

  private async sendCustomerInvoice(payload: any): Promise<void> {
    try {
      const invoiceData = {
        customerId: payload.customerId,
        invoiceId: payload.invoiceId,
        invoiceNumber: payload.invoiceNumber,
        deliveryChannel: 'EMAIL', // Could be SMS, EMAIL, PORTAL
        urgent: false,
      };

      await firstValueFrom(
        this.httpService.post('/communications/send-invoice', invoiceData)
      );

      this.logger.log(`Sent customer invoice ${payload.invoiceNumber}`);
    } catch (error) {
      this.logger.error('Failed to send customer invoice:', error);
    }
  }

  private async sendDeliveryNotifications(payload: any, eventType: string): Promise<void> {
    try {
      const notificationData = {
        deliveryId: payload.deliveryId,
        eventType,
        recipients: await this.getNotificationRecipients(payload, eventType),
        templateData: {
          deliveryNumber: payload.deliveryNumber,
          customerName: payload.customerName,
          productType: payload.productType,
          quantityLitres: payload.quantityLitres,
          totalValue: payload.totalValue,
        },
      };

      await firstValueFrom(
        this.httpService.post('/notifications/send-delivery-notification', notificationData)
      );

      this.logger.log(`Sent ${eventType} notifications for delivery ${payload.deliveryId}`);
    } catch (error) {
      this.logger.error('Failed to send delivery notifications:', error);
    }
  }

  private async sendFinanceNotification(eventType: string, payload: any): Promise<void> {
    try {
      const notificationData = {
        eventType,
        deliveryId: payload.deliveryId,
        invoiceId: payload.invoiceId,
        amount: payload.amount,
        priority: payload.amount > 100000 ? 'HIGH' : 'NORMAL',
        recipients: ['finance-team'],
      };

      await firstValueFrom(
        this.httpService.post('/notifications/send-finance-notification', notificationData)
      );

      this.logger.log(`Sent finance notification for ${eventType}`);
    } catch (error) {
      this.logger.error('Failed to send finance notification:', error);
    }
  }

  private async createAuditLog(action: string, payload: any): Promise<void> {
    try {
      const auditData = {
        service: 'DAILY_DELIVERY',
        action,
        entityType: 'DELIVERY',
        entityId: payload.deliveryId,
        userId: payload.userId || 'SYSTEM',
        tenantId: payload.tenantId,
        details: payload,
        timestamp: new Date(),
      };

      await firstValueFrom(
        this.httpService.post('/audit/create-log', auditData)
      );

      this.logger.log(`Created audit log for ${action}`);
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  private async getDeliveryDetails(deliveryId: string): Promise<DailyDelivery> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/daily-deliveries/${deliveryId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get delivery details for ${deliveryId}:`, error);
      throw error;
    }
  }

  private requiresNPASubmission(delivery: DailyDelivery): boolean {
    const controlledProducts = ['PMS', 'AGO', 'KEROSENE'];
    return controlledProducts.includes(delivery.productType) && !!delivery.npaPermitNumber;
  }

  private async shouldAutoGenerateSupplierInvoice(delivery: DailyDelivery): Promise<boolean> {
    try {
      // Check configuration service for auto-invoice settings
      const response = await firstValueFrom(
        this.httpService.get(`/configuration/auto-invoice-settings/${delivery.tenantId}`)
      );
      return response.data.autoGenerateSupplierInvoice;
    } catch (error) {
      this.logger.error('Failed to check auto supplier invoice setting:', error);
      return false; // Default to false if config unavailable
    }
  }

  private async shouldAutoGenerateCustomerInvoice(delivery: DailyDelivery): Promise<boolean> {
    try {
      // Check configuration service for auto-invoice settings
      const response = await firstValueFrom(
        this.httpService.get(`/configuration/auto-invoice-settings/${delivery.tenantId}`)
      );
      return response.data.autoGenerateCustomerInvoice;
    } catch (error) {
      this.logger.error('Failed to check auto customer invoice setting:', error);
      return false; // Default to false if config unavailable
    }
  }

  private async getNotificationRecipients(payload: any, eventType: string): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/configuration/notification-recipients/${payload.tenantId}?eventType=${eventType}`)
      );
      return response.data.recipients || [];
    } catch (error) {
      this.logger.error('Failed to get notification recipients:', error);
      return []; // Default to empty array
    }
  }

  // ===== SERVICE REGISTRATION =====

  async registerService(): Promise<void> {
    try {
      const serviceData: ServiceRegistryData = {
        serviceName: 'daily-delivery-service',
        version: '1.0.0',
        endpoint: process.env.SERVICE_URL || 'http://localhost:3008',
        status: 'HEALTHY',
        metadata: {
          capabilities: [
            'DELIVERY_MANAGEMENT',
            'INVOICE_GENERATION',
            'APPROVAL_WORKFLOW',
            'GHANA_COMPLIANCE',
            'GPS_TRACKING'
          ],
          supportedRegions: ['GHANA'],
          lastHealthCheck: new Date(),
        },
      };

      await firstValueFrom(
        this.httpService.post('/service-registry/register', serviceData)
      );

      this.logger.log('Successfully registered daily-delivery-service with service registry');
    } catch (error) {
      this.logger.error('Failed to register service:', error);
    }
  }

  async unregisterService(): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete('/service-registry/unregister/daily-delivery-service')
      );

      this.logger.log('Successfully unregistered daily-delivery-service from service registry');
    } catch (error) {
      this.logger.error('Failed to unregister service:', error);
    }
  }

  // ===== HEALTH CHECKS =====

  async performHealthChecks(): Promise<{ healthy: boolean; details: any }> {
    const healthChecks = {
      database: false,
      externalServices: {
        accounting: false,
        inventory: false,
        crm: false,
        fleet: false,
        notifications: false,
      },
    };

    try {
      // Check database connectivity
      healthChecks.database = await this.checkDatabaseHealth();

      // Check external service connectivity
      healthChecks.externalServices.accounting = await this.checkServiceHealth('/accounting/health');
      healthChecks.externalServices.inventory = await this.checkServiceHealth('/inventory/health');
      healthChecks.externalServices.crm = await this.checkServiceHealth('/crm/health');
      healthChecks.externalServices.fleet = await this.checkServiceHealth('/fleet/health');
      healthChecks.externalServices.notifications = await this.checkServiceHealth('/notifications/health');

      const isHealthy = healthChecks.database && 
                       Object.values(healthChecks.externalServices).every(service => service);

      return {
        healthy: isHealthy,
        details: healthChecks,
      };

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        healthy: false,
        details: { error: error.message, ...healthChecks },
      };
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // This would typically run a simple query to check database connectivity
      // For now, return true as a placeholder
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkServiceHealth(endpoint: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(endpoint, { timeout: 5000 })
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Service health check failed for ${endpoint}:`, error);
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  async syncWithExternalSystems(deliveryId: string): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const delivery = await this.getDeliveryDetails(deliveryId);

      // Sync with inventory system
      try {
        await this.updateInventoryReservation({
          deliveryId: delivery.id,
          productType: delivery.productType,
          quantityLitres: delivery.quantityLitres,
          depotId: delivery.depotId,
        });
      } catch (error) {
        errors.push(`Failed to sync with inventory system: ${error.message}`);
      }

      // Sync with procurement system
      try {
        await this.updateProcurementStatus(delivery, 'SYNCED');
      } catch (error) {
        errors.push(`Failed to sync with procurement system: ${error.message}`);
      }

      // Sync with CRM if customer invoice exists
      if (delivery.customerInvoiceId) {
        try {
          await this.updateCRMSystem({
            customerId: delivery.customerId,
            deliveryId: delivery.id,
            invoiceId: delivery.customerInvoiceId,
            amount: delivery.totalValue,
          });
        } catch (error) {
          errors.push(`Failed to sync with CRM system: ${error.message}`);
        }
      }

      return {
        success: errors.length === 0,
        errors,
      };

    } catch (error) {
      errors.push(`Failed to get delivery details: ${error.message}`);
      return {
        success: false,
        errors,
      };
    }
  }

  async validateIntegrations(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if required services are available
      const requiredServices = [
        '/accounting/health',
        '/inventory/health',
        '/fleet/health',
        '/notifications/health'
      ];

      for (const service of requiredServices) {
        const isHealthy = await this.checkServiceHealth(service);
        if (!isHealthy) {
          issues.push(`Required service ${service} is not available`);
        }
      }

      // Check configuration
      try {
        await firstValueFrom(
          this.httpService.get('/configuration/daily-delivery')
        );
      } catch (error) {
        issues.push('Daily delivery configuration not found');
      }

      return {
        valid: issues.length === 0,
        issues,
      };

    } catch (error) {
      issues.push(`Integration validation failed: ${error.message}`);
      return {
        valid: false,
        issues,
      };
    }
  }
}