import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { RealTimeChart } from '@/components/charts';
import { toast } from 'react-hot-toast';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  url?: string;
  port?: number;
  healthEndpoint?: string;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  service: string;
  timestamp: string;
  resolved: boolean;
}

const SystemHealth: NextPage = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
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
    } catch (error) {
      toast.error('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'info': return 'border-l-blue-500 bg-blue-500/10';
      case 'warning': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'error': return 'border-l-orange-500 bg-orange-500/10';
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      default: return 'border-l-dark-500 bg-dark-500/10';
    }
  };

  const handleRestartService = async (serviceId: string) => {
    try {
      toast.success(`Service ${serviceId} restart initiated`);
      // In production, this would call the API to restart the service
      loadSystemHealth();
    } catch (error) {
      toast.error('Failed to restart service');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      toast.success('Alert marked as resolved');
      setSystemAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const overallHealthScore = Math.round(
    (systemMetrics.filter(m => m.status === 'healthy').length / systemMetrics.length) * 100
  );

  const activeServices = serviceStatuses.filter(s => s.status === 'online').length;
  const totalServices = serviceStatuses.length;
  const unrelatedAlerts = systemAlerts.filter(a => !a.resolved).length;
  const criticalAlerts = systemAlerts.filter(a => !a.resolved && a.level === 'critical').length;

  // Sample data
  const sampleSystemMetrics: SystemMetric[] = [
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

  const sampleServiceStatuses: ServiceStatus[] = [
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

  const sampleSystemAlerts: SystemAlert[] = [
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

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
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
              <div className={`w-3 h-3 rounded-full ${
                realTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-dark-400">
                {realTimeEnabled ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button 
              variant={realTimeEnabled ? 'outline' : 'primary'} 
              size="sm"
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              {realTimeEnabled ? 'Pause' : 'Resume'} Monitoring
            </Button>
            <Button variant="primary" size="sm" onClick={loadSystemHealth}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Overall Health</h3>
              <p className={`text-3xl font-bold mb-1 ${
                overallHealthScore >= 90 ? 'text-green-400' :
                overallHealthScore >= 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {overallHealthScore}%
              </p>
              <p className="text-sm text-dark-400">System health score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Services</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">
                {activeServices}/{totalServices}
              </p>
              <p className="text-sm text-green-400">
                {Math.round((activeServices/totalServices) * 100)}% operational
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Alerts</h3>
              <p className={`text-3xl font-bold mb-1 ${
                unrelatedAlerts === 0 ? 'text-green-400' :
                criticalAlerts > 0 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {unrelatedAlerts}
              </p>
              <p className="text-sm text-dark-400">
                {criticalAlerts} critical
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Last Update</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {new Date().toLocaleTimeString()}
              </p>
              <p className="text-sm text-dark-400">Real-time monitoring</p>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader title="System Performance Metrics" />
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-400' :
                        metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-white font-medium">{metric.name}</p>
                        <p className="text-dark-400 text-sm">
                          Warning: {metric.threshold.warning}{metric.unit} | 
                          Critical: {metric.threshold.critical}{metric.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        metric.status === 'healthy' ? 'text-green-400' :
                        metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {metric.value}{metric.unit}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {new Date(metric.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Performance Chart" />
            <CardContent>
              <RealTimeChart 
                type="line"
                height={300}
                data={[
                  {
                    name: 'CPU Usage',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      x: new Date(Date.now() - (23-i) * 60 * 60 * 1000),
                      y: Math.random() * 40 + 20
                    }))
                  },
                  {
                    name: 'Memory Usage',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      x: new Date(Date.now() - (23-i) * 60 * 60 * 1000),
                      y: Math.random() * 30 + 50
                    }))
                  }
                ]}
                refreshInterval={realTimeEnabled ? 30000 : 0}
              />
            </CardContent>
          </Card>
        </div>

        {/* Service Status */}
        <Card>
          <CardHeader title="Service Status" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceStatuses.map((service) => (
                <div key={service.id} className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                      getStatusColor(service.status)
                    }`}>
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
                    {service.port && (
                      <div className="flex justify-between">
                        <span className="text-dark-400">Port:</span>
                        <span className="text-white font-mono">{service.port}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-dark-400">Last Check:</span>
                      <span className="text-white text-xs">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {service.status !== 'online' && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleRestartService(service.id)}
                      >
                        Restart Service
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader title={`System Alerts (${systemAlerts.filter(a => !a.resolved).length} active)`} />
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.level)} ${
                    alert.resolved ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.level === 'critical' ? 'bg-red-400' :
                        alert.level === 'error' ? 'bg-orange-400' :
                        alert.level === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      } ${!alert.resolved ? 'animate-pulse' : ''}`} />
                      <div>
                        <p className="text-white font-medium">{alert.message}</p>
                        <p className="text-dark-400 text-sm">
                          {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        alert.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.level === 'error' ? 'bg-orange-500/20 text-orange-400' :
                        alert.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.level.toUpperCase()}
                      </span>
                      {!alert.resolved && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {systemAlerts.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">All systems operational</p>
                  <p className="text-dark-400">No alerts or issues detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default SystemHealth;