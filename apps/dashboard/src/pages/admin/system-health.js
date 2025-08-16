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
const charts_1 = require("@/components/charts");
const react_hot_toast_1 = require("react-hot-toast");
const SystemHealth = () => {
    const [systemMetrics, setSystemMetrics] = (0, react_1.useState)([]);
    const [serviceStatuses, setServiceStatuses] = (0, react_1.useState)([]);
    const [systemAlerts, setSystemAlerts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [realTimeEnabled, setRealTimeEnabled] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        loadSystemHealth();
        if (realTimeEnabled) {
            const interval = setInterval(loadSystemHealth, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [realTimeEnabled]);
    const loadSystemHealth = async () => {
        try {
            setLoading(true);
            // In production, these would be separate API calls
            setSystemMetrics(sampleSystemMetrics);
            setServiceStatuses(sampleServiceStatuses);
            setSystemAlerts(sampleSystemAlerts);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load system health data');
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
            case 'online':
                return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'warning':
            case 'degraded':
                return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'critical':
            case 'offline':
                return 'text-red-400 bg-red-500/20 border-red-500/30';
            default:
                return 'text-dark-400 bg-dark-500/20 border-dark-500/30';
        }
    };
    const getAlertColor = (level) => {
        switch (level) {
            case 'info': return 'border-l-blue-500 bg-blue-500/10';
            case 'warning': return 'border-l-yellow-500 bg-yellow-500/10';
            case 'error': return 'border-l-orange-500 bg-orange-500/10';
            case 'critical': return 'border-l-red-500 bg-red-500/10';
            default: return 'border-l-dark-500 bg-dark-500/10';
        }
    };
    const handleRestartService = async (serviceId) => {
        try {
            react_hot_toast_1.toast.success(`Service ${serviceId} restart initiated`);
            // In production, this would call the API to restart the service
            loadSystemHealth();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to restart service');
        }
    };
    const handleResolveAlert = async (alertId) => {
        try {
            react_hot_toast_1.toast.success('Alert marked as resolved');
            setSystemAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, resolved: true } : alert));
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to resolve alert');
        }
    };
    const overallHealthScore = Math.round((systemMetrics.filter(m => m.status === 'healthy').length / systemMetrics.length) * 100);
    const activeServices = serviceStatuses.filter(s => s.status === 'online').length;
    const totalServices = serviceStatuses.length;
    const unrelatedAlerts = systemAlerts.filter(a => !a.resolved).length;
    const criticalAlerts = systemAlerts.filter(a => !a.resolved && a.level === 'critical').length;
    // Sample data
    const sampleSystemMetrics = [
        {
            id: '1',
            name: 'CPU Usage',
            value: 35.2,
            unit: '%',
            status: 'healthy',
            threshold: { warning: 70, critical: 85 },
            lastUpdated: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Memory Usage',
            value: 68.5,
            unit: '%',
            status: 'healthy',
            threshold: { warning: 75, critical: 90 },
            lastUpdated: new Date().toISOString(),
        },
        {
            id: '3',
            name: 'Disk Usage',
            value: 82.1,
            unit: '%',
            status: 'warning',
            threshold: { warning: 80, critical: 95 },
            lastUpdated: new Date().toISOString(),
        },
        {
            id: '4',
            name: 'Network I/O',
            value: 245.8,
            unit: 'MB/s',
            status: 'healthy',
            threshold: { warning: 500, critical: 800 },
            lastUpdated: new Date().toISOString(),
        },
        {
            id: '5',
            name: 'Database Connections',
            value: 45,
            unit: 'connections',
            status: 'healthy',
            threshold: { warning: 80, critical: 100 },
            lastUpdated: new Date().toISOString(),
        },
        {
            id: '6',
            name: 'Response Time',
            value: 125,
            unit: 'ms',
            status: 'healthy',
            threshold: { warning: 200, critical: 500 },
            lastUpdated: new Date().toISOString(),
        },
    ];
    const sampleServiceStatuses = [
        {
            id: '1',
            name: 'API Gateway',
            status: 'online',
            uptime: 99.8,
            responseTime: 45,
            lastCheck: new Date().toISOString(),
            port: 3001,
            healthEndpoint: '/health',
        },
        {
            id: '2',
            name: 'Pricing Service',
            status: 'online',
            uptime: 99.5,
            responseTime: 78,
            lastCheck: new Date().toISOString(),
            port: 3002,
        },
        {
            id: '3',
            name: 'UPPF Service',
            status: 'online',
            uptime: 98.9,
            responseTime: 112,
            lastCheck: new Date().toISOString(),
            port: 3003,
        },
        {
            id: '4',
            name: 'Configuration Service',
            status: 'online',
            uptime: 99.9,
            responseTime: 32,
            lastCheck: new Date().toISOString(),
            port: 3004,
        },
        {
            id: '5',
            name: 'Accounting Service',
            status: 'degraded',
            uptime: 97.2,
            responseTime: 342,
            lastCheck: new Date().toISOString(),
            port: 3005,
        },
        {
            id: '6',
            name: 'Dealer Service',
            status: 'online',
            uptime: 99.1,
            responseTime: 89,
            lastCheck: new Date().toISOString(),
            port: 3006,
        },
        {
            id: '7',
            name: 'PostgreSQL Database',
            status: 'online',
            uptime: 99.99,
            responseTime: 15,
            lastCheck: new Date().toISOString(),
            port: 5432,
        },
        {
            id: '8',
            name: 'Redis Cache',
            status: 'online',
            uptime: 99.8,
            responseTime: 8,
            lastCheck: new Date().toISOString(),
            port: 6379,
        },
    ];
    const sampleSystemAlerts = [
        {
            id: '1',
            level: 'warning',
            message: 'Disk usage on primary server exceeds 80%',
            service: 'System',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            resolved: false,
        },
        {
            id: '2',
            level: 'error',
            message: 'Accounting Service response time degraded',
            service: 'Accounting Service',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            resolved: false,
        },
        {
            id: '3',
            level: 'info',
            message: 'Scheduled backup completed successfully',
            service: 'Backup System',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            resolved: true,
        },
        {
            id: '4',
            level: 'critical',
            message: 'Multiple failed login attempts detected',
            service: 'Security',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            resolved: false,
        },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              System Health Monitoring
            </h1>
            <p className="text-dark-400 mt-2">
              Real-time system performance and service status monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}/>
              <span className="text-sm text-dark-400">
                {realTimeEnabled ? 'Live' : 'Paused'}
              </span>
            </div>
            <ui_1.Button variant={realTimeEnabled ? 'outline' : 'primary'} size="sm" onClick={() => setRealTimeEnabled(!realTimeEnabled)}>
              {realTimeEnabled ? 'Pause' : 'Resume'} Monitoring
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm" onClick={loadSystemHealth}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Overall Health</h3>
              <p className={`text-3xl font-bold mb-1 ${overallHealthScore >= 90 ? 'text-green-400' :
            overallHealthScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {overallHealthScore}%
              </p>
              <p className="text-sm text-dark-400">System health score</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Services</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">
                {activeServices}/{totalServices}
              </p>
              <p className="text-sm text-green-400">
                {Math.round((activeServices / totalServices) * 100)}% operational
              </p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Alerts</h3>
              <p className={`text-3xl font-bold mb-1 ${unrelatedAlerts === 0 ? 'text-green-400' :
            criticalAlerts > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                {unrelatedAlerts}
              </p>
              <p className="text-sm text-dark-400">
                {criticalAlerts} critical
              </p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Last Update</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-dark-400">Real-time monitoring</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ui_1.Card>
            <ui_1.CardHeader title="System Performance Metrics"/>
            <ui_1.CardContent>
              <div className="space-y-4">
                {systemMetrics.map((metric) => (<div key={metric.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${metric.status === 'healthy' ? 'bg-green-400' :
                metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}/>
                      <div>
                        <p className="text-white font-medium">{metric.name}</p>
                        <p className="text-dark-400 text-sm">
                          Warning: {metric.threshold.warning}{metric.unit} | 
                          Critical: {metric.threshold.critical}{metric.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${metric.status === 'healthy' ? 'text-green-400' :
                metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {metric.value}{metric.unit}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {new Date(metric.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>))}
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardHeader title="Performance Chart"/>
            <ui_1.CardContent>
              <charts_1.RealTimeChart type="line" height={300} data={[
            {
                name: 'CPU Usage',
                data: Array.from({ length: 24 }, (_, i) => ({
                    x: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
                    y: Math.random() * 40 + 20
                }))
            },
            {
                name: 'Memory Usage',
                data: Array.from({ length: 24 }, (_, i) => ({
                    x: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
                    y: Math.random() * 30 + 50
                }))
            }
        ]} refreshInterval={realTimeEnabled ? 30000 : 0}/>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Service Status */}
        <ui_1.Card>
          <ui_1.CardHeader title="Service Status"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceStatuses.map((service) => (<div key={service.id} className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(service.status)}`}>
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Uptime:</span>
                      <span className="text-white font-mono">{service.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Response Time:</span>
                      <span className="text-white font-mono">{service.responseTime}ms</span>
                    </div>
                    {service.port && (<div className="flex justify-between">
                        <span className="text-dark-400">Port:</span>
                        <span className="text-white font-mono">{service.port}</span>
                      </div>)}
                    <div className="flex justify-between">
                      <span className="text-dark-400">Last Check:</span>
                      <span className="text-white text-xs">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {service.status !== 'online' && (<div className="mt-3 pt-3 border-t border-dark-600">
                      <ui_1.Button variant="outline" size="sm" className="w-full" onClick={() => handleRestartService(service.id)}>
                        Restart Service
                      </ui_1.Button>
                    </div>)}
                </div>))}
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* System Alerts */}
        <ui_1.Card>
          <ui_1.CardHeader title={`System Alerts (${systemAlerts.filter(a => !a.resolved).length} active)`}/>
          <ui_1.CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (<div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.level)} ${alert.resolved ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${alert.level === 'critical' ? 'bg-red-400' :
                alert.level === 'error' ? 'bg-orange-400' :
                    alert.level === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'} ${!alert.resolved ? 'animate-pulse' : ''}`}/>
                      <div>
                        <p className="text-white font-medium">{alert.message}</p>
                        <p className="text-dark-400 text-sm">
                          {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${alert.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                alert.level === 'error' ? 'bg-orange-500/20 text-orange-400' :
                    alert.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'}`}>
                        {alert.level.toUpperCase()}
                      </span>
                      {!alert.resolved && (<ui_1.Button variant="ghost" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                          Resolve
                        </ui_1.Button>)}
                    </div>
                  </div>
                </div>))}
              
              {systemAlerts.length === 0 && (<div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">All systems operational</p>
                  <p className="text-dark-400">No alerts or issues detected</p>
                </div>)}
            </div>
          </ui_1.CardContent>
        </ui_1.Card>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = SystemHealth;
//# sourceMappingURL=system-health.js.map