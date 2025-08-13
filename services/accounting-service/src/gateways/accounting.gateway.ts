import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface ClientInfo {
  id: string;
  userId?: string;
  stationId?: string;
  roles?: string[];
  subscriptions: Set<string>;
}

@WebSocketGateway({
  namespace: 'accounting',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class AccountingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AccountingGateway.name);
  private clients = new Map<string, ClientInfo>();

  constructor(private eventEmitter: EventEmitter2) {}

  afterInit(server: Server) {
    this.logger.log('Accounting WebSocket Gateway initialized');
    this.setupEventListeners();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    const clientInfo: ClientInfo = {
      id: client.id,
      subscriptions: new Set(),
    };

    // Extract user info from auth token if available
    const token = client.handshake.auth?.token;
    if (token) {
      try {
        // Decode JWT token here and extract user info
        // clientInfo.userId = decodedToken.userId;
        // clientInfo.stationId = decodedToken.stationId;
        // clientInfo.roles = decodedToken.roles;
      } catch (error) {
        this.logger.warn('Invalid token provided by client', error);
      }
    }

    this.clients.set(client.id, clientInfo);
    
    // Send connection confirmation
    client.emit('connected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  // Subscription management
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { topics: string[] }) {
    const clientInfo = this.clients.get(client.id);
    if (!clientInfo) return;

    payload.topics.forEach(topic => {
      clientInfo.subscriptions.add(topic);
      client.join(topic);
    });

    this.logger.log(`Client ${client.id} subscribed to: ${payload.topics.join(', ')}`);
    
    client.emit('subscribed', {
      topics: payload.topics,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { topics: string[] }) {
    const clientInfo = this.clients.get(client.id);
    if (!clientInfo) return;

    payload.topics.forEach(topic => {
      clientInfo.subscriptions.delete(topic);
      client.leave(topic);
    });

    this.logger.log(`Client ${client.id} unsubscribed from: ${payload.topics.join(', ')}`);
    
    client.emit('unsubscribed', {
      topics: payload.topics,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Real-time event handlers
  private setupEventListeners() {
    // Journal Entry Events
    this.eventEmitter.on('journal.created', (data) => {
      this.broadcastToTopic('journal_entries', 'journal.created', data);
    });

    this.eventEmitter.on('journal.posted', (data) => {
      this.broadcastToTopic('journal_entries', 'journal.posted', data);
      this.broadcastToTopic('general_ledger', 'gl.updated', data);
      this.updateTrialBalance(data);
    });

    this.eventEmitter.on('journal.reversed', (data) => {
      this.broadcastToTopic('journal_entries', 'journal.reversed', data);
      this.broadcastToTopic('general_ledger', 'gl.updated', data);
      this.updateTrialBalance(data);
    });

    // Chart of Accounts Events
    this.eventEmitter.on('account.created', (data) => {
      this.broadcastToTopic('chart_of_accounts', 'account.created', data);
    });

    this.eventEmitter.on('account.updated', (data) => {
      this.broadcastToTopic('chart_of_accounts', 'account.updated', data);
    });

    this.eventEmitter.on('account.balance.updated', (data) => {
      this.broadcastToTopic('account_balances', 'balance.updated', data);
      this.broadcastToTopic(`account_${data.accountCode}`, 'balance.updated', data);
    });

    // Fixed Assets Events
    this.eventEmitter.on('asset.created', (data) => {
      this.broadcastToTopic('fixed_assets', 'asset.created', data);
    });

    this.eventEmitter.on('asset.depreciated', (data) => {
      this.broadcastToTopic('fixed_assets', 'asset.depreciated', data);
      this.broadcastToTopic('depreciation', 'depreciation.calculated', data);
    });

    this.eventEmitter.on('asset.maintenance.due', (data) => {
      this.broadcastToTopic('asset_maintenance', 'maintenance.due', data);
      this.broadcastToAlert('asset_alerts', 'maintenance_due', data);
    });

    // Tax Events
    this.eventEmitter.on('tax.calculated', (data) => {
      this.broadcastToTopic('tax_management', 'tax.calculated', data);
    });

    this.eventEmitter.on('tax.filed', (data) => {
      this.broadcastToTopic('tax_management', 'tax.filed', data);
    });

    // Budget Events
    this.eventEmitter.on('budget.variance.exceeded', (data) => {
      this.broadcastToTopic('budget_management', 'variance.exceeded', data);
      this.broadcastToAlert('budget_alerts', 'variance_exceeded', data);
    });

    // Accounting Period Events
    this.eventEmitter.on('period.closed', (data) => {
      this.broadcastToTopic('accounting_periods', 'period.closed', data);
      this.generatePeriodClosingReports(data);
    });

    this.eventEmitter.on('period.reopened', (data) => {
      this.broadcastToTopic('accounting_periods', 'period.reopened', data);
    });

    // IFRS Compliance Events
    this.eventEmitter.on('ifrs.adjustment.required', (data) => {
      this.broadcastToTopic('ifrs_compliance', 'adjustment.required', data);
      this.broadcastToAlert('compliance_alerts', 'ifrs_adjustment', data);
    });

    // Cost Management Events
    this.eventEmitter.on('cost.allocated', (data) => {
      this.broadcastToTopic('cost_management', 'cost.allocated', data);
    });

    this.eventEmitter.on('cost.variance.significant', (data) => {
      this.broadcastToTopic('cost_management', 'variance.significant', data);
      this.broadcastToAlert('cost_alerts', 'significant_variance', data);
    });

    // Project Accounting Events
    this.eventEmitter.on('project.budget.exceeded', (data) => {
      this.broadcastToTopic('project_accounting', 'budget.exceeded', data);
      this.broadcastToAlert('project_alerts', 'budget_exceeded', data);
    });

    // General System Events
    this.eventEmitter.on('system.backup.completed', (data) => {
      this.broadcastToTopic('system_events', 'backup.completed', data);
    });

    this.eventEmitter.on('system.integration.sync', (data) => {
      this.broadcastToTopic('system_events', 'integration.sync', data);
    });
  }

  // Broadcasting methods
  private broadcastToTopic(topic: string, event: string, data: any) {
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'accounting-service',
    };

    this.server.to(topic).emit(event, enrichedData);
    this.logger.debug(`Broadcasting to ${topic}: ${event}`);
  }

  private broadcastToAlert(topic: string, alertType: string, data: any) {
    const alert = {
      type: alertType,
      severity: this.determineAlertSeverity(alertType),
      data,
      timestamp: new Date().toISOString(),
      source: 'accounting-service',
    };

    this.server.to(topic).emit('alert', alert);
    this.logger.log(`Alert broadcast to ${topic}: ${alertType}`);
  }

  private broadcastToStation(stationId: string, event: string, data: any) {
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'accounting-service',
      stationId,
    };

    this.server.to(`station_${stationId}`).emit(event, enrichedData);
  }

  private broadcastToUser(userId: string, event: string, data: any) {
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'accounting-service',
    };

    // Find all client connections for this user
    for (const [clientId, clientInfo] of this.clients) {
      if (clientInfo.userId === userId) {
        this.server.to(clientId).emit(event, enrichedData);
      }
    }
  }

  // Specific business logic handlers
  private updateTrialBalance(data: any) {
    // Trigger trial balance recalculation and broadcast updates
    const trialBalanceUpdate = {
      affectedAccounts: data.affectedAccounts || [],
      recalculationNeeded: true,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToTopic('trial_balance', 'recalculation.needed', trialBalanceUpdate);
  }

  private generatePeriodClosingReports(data: any) {
    // Trigger generation of period-end reports
    const reportGeneration = {
      periodId: data.periodId,
      reports: ['trial_balance', 'income_statement', 'balance_sheet', 'cash_flow'],
      status: 'generating',
      timestamp: new Date().toISOString(),
    };

    this.broadcastToTopic('period_reports', 'generation.started', reportGeneration);
  }

  private determineAlertSeverity(alertType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      maintenance_due: 'medium',
      variance_exceeded: 'high',
      budget_exceeded: 'high',
      ifrs_adjustment: 'medium',
      significant_variance: 'medium',
      system_error: 'critical',
      compliance_violation: 'high',
    };

    return severityMap[alertType] || 'medium';
  }

  // Public methods for other services to use
  public notifyJournalPosted(journalData: any) {
    this.eventEmitter.emit('journal.posted', journalData);
  }

  public notifyAccountBalanceUpdated(accountData: any) {
    this.eventEmitter.emit('account.balance.updated', accountData);
  }

  public notifyBudgetVarianceExceeded(budgetData: any) {
    this.eventEmitter.emit('budget.variance.exceeded', budgetData);
  }

  public notifyAssetMaintenanceDue(assetData: any) {
    this.eventEmitter.emit('asset.maintenance.due', assetData);
  }

  public notifyTaxCalculated(taxData: any) {
    this.eventEmitter.emit('tax.calculated', taxData);
  }

  public notifyIFRSAdjustmentRequired(adjustmentData: any) {
    this.eventEmitter.emit('ifrs.adjustment.required', adjustmentData);
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getClientSubscriptions(clientId: string): string[] {
    const client = this.clients.get(clientId);
    return client ? Array.from(client.subscriptions) : [];
  }

  // Health check for the gateway
  public getGatewayStats() {
    return {
      connectedClients: this.clients.size,
      totalSubscriptions: Array.from(this.clients.values())
        .reduce((total, client) => total + client.subscriptions.size, 0),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}