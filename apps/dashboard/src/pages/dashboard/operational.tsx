import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { dashboardService } from '@/services/api';
import { ChartData } from '@/types';

const OperationalDashboardPage: NextPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperationalData();
  }, []);

  const loadOperationalData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getOperationalDashboard();
      // Process data here
    } catch (error) {
      console.error('Failed to load operational dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample operational data
  const tankLevelsData: ChartData = {
    labels: ['ACC-001', 'ACC-002', 'ACC-003', 'ACC-004', 'ACC-005', 'ACC-006'],
    datasets: [
      {
        label: 'PMS (%)',
        data: [85, 65, 45, 92, 78, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'AGO (%)',
        data: [78, 82, 55, 88, 45, 75],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'LPG (%)',
        data: [92, 45, 70, 65, 85, 60],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const deliveryStatusData: ChartData = {
    labels: ['Scheduled', 'In Transit', 'Delivered', 'Delayed'],
    datasets: [
      {
        label: 'Deliveries',
        data: [25, 15, 45, 5],
        backgroundColor: [
          '#3b82f6',
          '#f59e0b',
          '#10b981',
          '#ef4444',
        ],
      },
    ],
  };

  const hourlyTransactionsData: ChartData = {
    labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    datasets: [
      {
        label: 'Transactions',
        data: [45, 78, 125, 145, 165, 185, 155, 175, 195, 210, 185, 225, 195, 165, 145],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const fleetStatusData: ChartData = {
    labels: ['Available', 'In Transit', 'Maintenance', 'Out of Service'],
    datasets: [
      {
        label: 'Vehicles',
        data: [45, 25, 8, 2],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ef4444',
        ],
      },
    ],
  };

  const operationalMetrics = [
    {
      title: 'Live Transactions',
      value: '1,247',
      change: '+8.2%',
      changeType: 'increase' as const,
      period: 'vs yesterday',
      status: 'online',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Stations Online',
      value: '245/247',
      change: '99.2%',
      changeType: 'stable' as const,
      period: 'uptime',
      status: 'healthy',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Fleet Utilization',
      value: '87.5%',
      change: '+2.3%',
      changeType: 'increase' as const,
      period: 'efficiency',
      status: 'good',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      title: 'Inventory Alerts',
      value: '12',
      change: '-3',
      changeType: 'decrease' as const,
      period: 'critical levels',
      status: 'warning',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
  ];

  const criticalAlerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Station ACC-015 PMS tank below 10%',
      time: '5 minutes ago',
      station: 'ACC-015',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Delivery truck GV-234 delayed by 2 hours',
      time: '12 minutes ago',
      station: 'Multiple',
    },
    {
      id: 3,
      type: 'info',
      message: 'Scheduled maintenance completed at ACC-008',
      time: '25 minutes ago',
      station: 'ACC-008',
    },
    {
      id: 4,
      type: 'warning',
      message: 'High transaction volume at ACC-001',
      time: '45 minutes ago',
      station: 'ACC-001',
    },
  ];

  const recentDeliveries = [
    {
      id: 'DEL-001',
      truck: 'GV-234',
      destination: 'ACC-015',
      fuelType: 'PMS',
      quantity: '45,000L',
      status: 'In Transit',
      eta: '14:30',
    },
    {
      id: 'DEL-002',
      truck: 'GV-156',
      destination: 'ACC-008',
      fuelType: 'AGO',
      quantity: '32,000L',
      status: 'Delivered',
      eta: '12:15',
    },
    {
      id: 'DEL-003',
      truck: 'GV-298',
      destination: 'ACC-023',
      fuelType: 'LPG',
      quantity: '15,000L',
      status: 'Scheduled',
      eta: '16:45',
    },
    {
      id: 'DEL-004',
      truck: 'GV-187',
      destination: 'ACC-045',
      fuelType: 'PMS',
      quantity: '50,000L',
      status: 'Delivered',
      eta: '11:00',
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
              Operational Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Real-time operations monitoring and control center
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 4h11v14H4z" />
              </svg>
              Emergency Stop
            </Button>
            <Button variant="primary" size="sm" onClick={loadOperationalData}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Live Data
            </Button>
          </div>
        </motion.div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationalMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-400 mb-2">{metric.title}</p>
                      <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                      <div className={`flex items-center text-sm ${
                        metric.changeType === 'increase' ? 'text-green-400' : 
                        metric.changeType === 'decrease' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {metric.changeType === 'increase' && (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                          </svg>
                        )}
                        {metric.changeType === 'decrease' && (
                          <svg className="w-4 h-4 mr-1 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                          </svg>
                        )}
                        {metric.change} {metric.period}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      metric.status === 'healthy' ? 'bg-green-500/20' :
                      metric.status === 'warning' ? 'bg-yellow-500/20' :
                      metric.status === 'good' ? 'bg-blue-500/20' :
                      'bg-primary-500/20'
                    }`}>
                      <div className={
                        metric.status === 'healthy' ? 'text-green-400' :
                        metric.status === 'warning' ? 'text-yellow-400' :
                        metric.status === 'good' ? 'text-blue-400' :
                        'text-primary-400'
                      }>
                        {metric.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tank Levels */}
          <Card>
            <CardHeader 
              title="Tank Levels by Station" 
              action={
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              }
            />
            <CardContent>
              <BarChart data={tankLevelsData} height={300} />
            </CardContent>
          </Card>

          {/* Hourly Transactions */}
          <Card>
            <CardHeader title="Hourly Transaction Volume" />
            <CardContent>
              <LineChart data={hourlyTransactionsData} height={300} showLegend={false} />
            </CardContent>
          </Card>
        </div>

        {/* Fleet and Delivery Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Status */}
          <Card>
            <CardHeader title="Fleet Status" />
            <CardContent>
              <PieChart data={fleetStatusData} height={250} variant="doughnut" />
            </CardContent>
          </Card>

          {/* Delivery Status */}
          <Card>
            <CardHeader title="Delivery Status" />
            <CardContent>
              <PieChart data={deliveryStatusData} height={250} variant="doughnut" />
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card>
            <CardHeader title="Critical Alerts" />
            <CardContent>
              <div className="space-y-4">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-dark-400">{alert.station}</span>
                          <span className="text-xs text-dark-400">{alert.time}</span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader 
            title="Recent Deliveries" 
            action={
              <Button variant="outline" size="sm">
                View All
              </Button>
            }
          />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Delivery ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Truck</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Destination</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Fuel Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.map((delivery, index) => (
                    <motion.tr
                      key={delivery.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-sm text-white">{delivery.id}</td>
                      <td className="py-3 px-4 text-sm text-white">{delivery.truck}</td>
                      <td className="py-3 px-4 text-sm text-white">{delivery.destination}</td>
                      <td className="py-3 px-4 text-sm text-white">{delivery.fuelType}</td>
                      <td className="py-3 px-4 text-sm text-white">{delivery.quantity}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          delivery.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          delivery.status === 'In Transit' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">{delivery.eta}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default OperationalDashboardPage;