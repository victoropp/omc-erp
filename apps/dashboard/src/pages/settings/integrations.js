"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const ui_1 = require("@/components/ui");
const react_hot_toast_1 = require("react-hot-toast");
const IntegrationSettings = () => {
    const [integrations, setIntegrations] = (0, react_1.useState)([]);
    const [webhooks, setWebhooks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasChanges, setHasChanges] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('integrations');
    const [selectedIntegration, setSelectedIntegration] = (0, react_1.useState)(null);
    const [showConfig, setShowConfig] = (0, react_1.useState)(false);
    const [apiKeys, setApiKeys] = (0, react_1.useState)({
        primary: 'sk_live_************************',
        secondary: 'sk_live_************************',
    });
    (0, react_1.useEffect)(() => {
        loadIntegrations();
        loadWebhooks();
    }, []);
    const loadIntegrations = async () => {
        try {
            setLoading(true);
            setIntegrations(sampleIntegrations);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load integrations');
        }
        finally {
            setLoading(false);
        }
    };
    const loadWebhooks = async () => {
        try {
            setWebhooks(sampleWebhooks);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load webhooks');
        }
    };
    const handleIntegrationToggle = (integrationId) => {
        setIntegrations(prev => prev.map(integration => integration.id === integrationId
            ? { ...integration, enabled: !integration.enabled }
            : integration));
        setHasChanges(true);
    };
    const handleWebhookToggle = (webhookId) => {
        setWebhooks(prev => prev.map(webhook => webhook.id === webhookId
            ? { ...webhook, enabled: !webhook.enabled }
            : webhook));
        setHasChanges(true);
    };
    const handleTestIntegration = async (integrationId) => {
        try {
            setLoading(true);
            // In production, this would test the integration
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success('Integration test successful');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Integration test failed');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSyncNow = async (integrationId) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            react_hot_toast_1.toast.success('Sync completed successfully');
            // Update last sync time
            setIntegrations(prev => prev.map(integration => integration.id === integrationId
                ? { ...integration, lastSync: new Date().toISOString() }
                : integration));
        }
        catch (error) {
            react_hot_toast_1.toast.error('Sync failed');
        }
        finally {
            setLoading(false);
        }
    };
    const generateApiKey = () => {
        const newKey = 'sk_live_' + Array.from({ length: 24 }, () => Math.random().toString(36)[2] || '0').join('');
        return newKey;
    };
    const handleGenerateNewKey = (keyType) => {
        const newKey = generateApiKey();
        setApiKeys(prev => ({ ...prev, [keyType]: newKey }));
        setHasChanges(true);
        react_hot_toast_1.toast.success(`New ${keyType} API key generated`);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'disconnected': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
            case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'configuring': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
        }
    };
    // Sample data
    const sampleIntegrations = [
        {
            id: '1',
            name: 'MTN Mobile Money',
            type: 'payment',
            description: 'Accept payments via MTN Mobile Money',
            status: 'connected',
            enabled: true,
            icon: '📱',
            config: {
                apiKey: 'mtn_**********************',
                merchantId: 'MTN_MERCHANT_123',
                environment: 'production',
                webhook_url: 'https://api.omc.com.gh/webhooks/mtn-momo',
            },
            lastSync: '2024-01-13T18:30:00Z',
            syncFrequency: 'real-time',
        },
        {
            id: '2',
            name: 'Vodafone Cash',
            type: 'payment',
            description: 'Accept payments via Vodafone Cash',
            status: 'connected',
            enabled: true,
            icon: '💳',
            config: {
                merchantId: 'VOD_MERCHANT_456',
                apiSecret: 'vod_**********************',
                environment: 'production',
            },
            lastSync: '2024-01-13T18:25:00Z',
            syncFrequency: 'real-time',
        },
        {
            id: '3',
            name: 'Ghana Revenue Authority',
            type: 'tax',
            description: 'Automatic tax filing and compliance',
            status: 'connected',
            enabled: true,
            icon: '🏦',
            config: {
                taxpayerId: 'TIN-12345678',
                apiEndpoint: 'https://api.gra.gov.gh',
                certificatePath: '/certs/gra-cert.pem',
            },
            lastSync: '2024-01-13T17:00:00Z',
            syncFrequency: 'daily',
        },
        {
            id: '4',
            name: 'Bank of Ghana (BoG)',
            type: 'regulatory',
            description: 'Financial reporting and compliance',
            status: 'connected',
            enabled: true,
            icon: '🏦',
            config: {
                institutionCode: 'BOG_OMC_001',
                reportingFrequency: 'monthly',
                contactEmail: 'compliance@omc.com.gh',
            },
            lastSync: '2024-01-13T06:00:00Z',
            syncFrequency: 'monthly',
        },
        {
            id: '5',
            name: 'NPA Price Database',
            type: 'pricing',
            description: 'Automatic fuel price updates from NPA',
            status: 'connected',
            enabled: true,
            icon: '⛽',
            config: {
                npaEndpoint: 'https://npa.gov.gh/api/prices',
                updateSchedule: '0 6 * * *', // Daily at 6 AM
                priceTypes: ['PMS', 'AGO', 'DPK', 'LPG'],
            },
            lastSync: '2024-01-13T06:00:00Z',
            syncFrequency: 'daily',
        },
        {
            id: '6',
            name: 'QuickBooks Online',
            type: 'accounting',
            description: 'Sync accounting data with QuickBooks',
            status: 'disconnected',
            enabled: false,
            icon: '📊',
            config: {},
            syncFrequency: 'hourly',
        },
        {
            id: '7',
            name: 'Slack Notifications',
            type: 'communication',
            description: 'Send alerts and notifications to Slack',
            status: 'connected',
            enabled: true,
            icon: '📢',
            config: {
                webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
                channel: '#omc-alerts',
                username: 'OMC ERP Bot',
            },
            lastSync: '2024-01-13T18:35:00Z',
            syncFrequency: 'real-time',
        },
        {
            id: '8',
            name: 'Google Analytics',
            type: 'analytics',
            description: 'Track website and app analytics',
            status: 'error',
            enabled: true,
            icon: '📈',
            config: {
                trackingId: 'GA-XXXXXXXXX-X',
                propertyId: 'GA4-PROPERTY-ID',
            },
            errorMessage: 'Authentication token expired',
            lastSync: '2024-01-12T15:30:00Z',
            syncFrequency: 'daily',
        },
    ];
    const sampleWebhooks = [
        {
            id: '1',
            name: 'External Payment Processor',
            url: 'https://api.payment-processor.com/webhooks/omc',
            events: ['transaction.completed', 'transaction.failed', 'payment.received'],
            enabled: true,
            secret: 'whsec_**********************',
            lastTriggered: '2024-01-13T18:30:00Z',
            attempts: 1245,
            success: 1240,
        },
        {
            id: '2',
            name: 'Inventory Management System',
            url: 'https://inventory.omc.com.gh/api/webhooks',
            events: ['inventory.low', 'inventory.updated', 'delivery.completed'],
            enabled: true,
            secret: 'whsec_**********************',
            lastTriggered: '2024-01-13T17:45:00Z',
            attempts: 892,
            success: 889,
        },
        {
            id: '3',
            name: 'Customer Notification Service',
            url: 'https://notifications.external.com/api/omc',
            events: ['user.created', 'transaction.completed', 'uppf.claim.status'],
            enabled: false,
            secret: 'whsec_**********************',
            lastTriggered: '2024-01-10T12:00:00Z',
            attempts: 156,
            success: 152,
        },
    ];
    const connectedIntegrations = integrations.filter(i => i.status === 'connected' && i.enabled).length;
    const totalIntegrations = integrations.length;
    const errorIntegrations = integrations.filter(i => i.status === 'error').length;
    const activeWebhooks = webhooks.filter(w => w.enabled).length;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Integration Settings
            </h1>
            <p className="text-dark-400 mt-2">
              Manage external integrations, APIs, and webhook endpoints
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
              Integration Logs
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Integration
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Integrations</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{connectedIntegrations}</p>
              <p className="text-sm text-green-400">of {totalIntegrations} configured</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Webhook Endpoints</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{activeWebhooks}</p>
              <p className="text-sm text-dark-400">active endpoints</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Integration Errors</h3>
              <p className={`text-3xl font-bold mb-1 ${errorIntegrations === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {errorIntegrations}
              </p>
              <p className="text-sm text-dark-400">Need attention</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">API Calls Today</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">15,247</p>
              <p className="text-sm text-green-400">+12% from yesterday</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { id: 'integrations', label: 'Integrations', count: integrations.length },
            { id: 'webhooks', label: 'Webhooks', count: webhooks.length },
            { id: 'api', label: 'API Keys', count: 0 },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
              {tab.count > 0 && (<span className="ml-2 px-2 py-0.5 bg-dark-600 rounded-full text-xs">
                  {tab.count}
                </span>)}
            </button>))}
        </div>

        {/* Tab Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'integrations' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (<ui_1.Card key={integration.id} className="hover:shadow-xl transition-shadow">
                  <ui_1.CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <h3 className="text-white font-semibold">{integration.name}</h3>
                          <p className="text-dark-400 text-sm capitalize">{integration.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(integration.status)}`}>
                        {integration.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-dark-300 text-sm mb-4">{integration.description}</p>
                    
                    {integration.lastSync && (<div className="text-xs text-dark-500 mb-4">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                        <br />
                        Frequency: {integration.syncFrequency}
                      </div>)}
                    
                    {integration.errorMessage && (<div className="p-3 bg-red-500/10 border border-red-500/20 rounded mb-4">
                        <p className="text-red-400 text-xs">{integration.errorMessage}</p>
                      </div>)}
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-dark-400 text-sm">Enabled</span>
                      <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleIntegrationToggle(integration.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.enabled ? 'bg-primary-500' : 'bg-dark-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </framer_motion_1.motion.button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <ui_1.Button variant="outline" size="sm" className="flex-1" onClick={() => {
                    setSelectedIntegration(integration);
                    setShowConfig(true);
                }}>
                        Configure
                      </ui_1.Button>
                      {integration.status === 'connected' && (<ui_1.Button variant="ghost" size="sm" onClick={() => handleSyncNow(integration.id)} disabled={loading}>
                          Sync Now
                        </ui_1.Button>)}
                      <ui_1.Button variant="ghost" size="sm" onClick={() => handleTestIntegration(integration.id)} disabled={loading}>
                        Test
                      </ui_1.Button>
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>))}
            </div>)}

          {activeTab === 'webhooks' && (<ui_1.Card>
              <ui_1.CardHeader title="Webhook Endpoints"/>
              <ui_1.CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (<div key={webhook.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-medium">{webhook.name}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${webhook.enabled
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                              {webhook.enabled ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="text-dark-400 text-sm font-mono mb-2">{webhook.url}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {webhook.events.map((event, index) => (<span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                                {event}
                              </span>))}
                          </div>
                          {webhook.lastTriggered && (<p className="text-dark-500 text-xs">
                              Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                              <span className="ml-3">
                                Success rate: {Math.round((webhook.success / webhook.attempts) * 100)}% 
                                ({webhook.success}/{webhook.attempts})
                              </span>
                            </p>)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleWebhookToggle(webhook.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webhook.enabled ? 'bg-primary-500' : 'bg-dark-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webhook.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                          </framer_motion_1.motion.button>
                          <ui_1.Button variant="ghost" size="sm">
                            Test
                          </ui_1.Button>
                          <ui_1.Button variant="ghost" size="sm">
                            Edit
                          </ui_1.Button>
                        </div>
                      </div>
                    </div>))}
                  
                  <div className="mt-6 pt-4 border-t border-dark-600">
                    <ui_1.Button variant="primary">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Add Webhook Endpoint
                    </ui_1.Button>
                  </div>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'api' && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="API Keys Management"/>
                <ui_1.CardContent className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-400 font-medium text-sm">API Security Notice</p>
                        <p className="text-dark-300 text-sm mt-1">
                          API keys provide access to your OMC ERP data. Keep them secure and rotate them regularly.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Primary API Key
                      </label>
                      <div className="flex space-x-2">
                        <ui_1.Input value={apiKeys.primary} readOnly className="font-mono"/>
                        <ui_1.Button variant="outline" onClick={() => navigator.clipboard.writeText(apiKeys.primary)}>
                          Copy
                        </ui_1.Button>
                        <ui_1.Button variant="outline" onClick={() => handleGenerateNewKey('primary')}>
                          Regenerate
                        </ui_1.Button>
                      </div>
                      <p className="text-dark-400 text-sm mt-1">
                        Used for production API calls. Regenerating will invalidate the current key.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Secondary API Key
                      </label>
                      <div className="flex space-x-2">
                        <ui_1.Input value={apiKeys.secondary} readOnly className="font-mono"/>
                        <ui_1.Button variant="outline" onClick={() => navigator.clipboard.writeText(apiKeys.secondary)}>
                          Copy
                        </ui_1.Button>
                        <ui_1.Button variant="outline" onClick={() => handleGenerateNewKey('secondary')}>
                          Regenerate
                        </ui_1.Button>
                      </div>
                      <p className="text-dark-400 text-sm mt-1">
                        Backup key for development and testing purposes.
                      </p>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
              
              <ui_1.Card>
                <ui_1.CardHeader title="API Usage Statistics"/>
                <ui_1.CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-400">15,247</p>
                      <p className="text-dark-400 text-sm">Requests Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">99.8%</p>
                      <p className="text-dark-400 text-sm">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">125ms</p>
                      <p className="text-dark-400 text-sm">Avg Response</p>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
              
              <ui_1.Card>
                <ui_1.CardHeader title="Rate Limiting"/>
                <ui_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Requests per minute
                      </label>
                      <ui_1.Input type="number" defaultValue="1000"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Burst limit
                      </label>
                      <ui_1.Input type="number" defaultValue="1500"/>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Enable Rate Limiting</p>
                      <p className="text-dark-400 text-sm">Protect API from abuse and overuse</p>
                    </div>
                    <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 transition-colors">
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform"/>
                    </framer_motion_1.motion.button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>

        {/* Configuration Modal */}
        {showConfig && selectedIntegration && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowConfig(false)}>
            <framer_motion_1.motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-dark-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Configure {selectedIntegration.name}
                </h3>
                <ui_1.Button variant="ghost" size="sm" onClick={() => setShowConfig(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </ui_1.Button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(selectedIntegration.config).map(([key, value]) => (<div key={key}>
                    <label className="block text-sm font-medium text-white mb-2 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <ui_1.Input value={typeof value === 'string' ? value : JSON.stringify(value)} className={key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'font-mono' : ''} type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'password' : 'text'}/>
                  </div>))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <ui_1.Button variant="outline" onClick={() => setShowConfig(false)}>
                  Cancel
                </ui_1.Button>
                <ui_1.Button variant="primary">
                  Save Configuration
                </ui_1.Button>
              </div>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = IntegrationSettings;
//# sourceMappingURL=integrations.js.map