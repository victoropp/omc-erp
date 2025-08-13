import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { dashboardService } from '@/services/api';
import { DashboardMetrics, ChartData } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/shared';

const ExecutiveDashboardPage: NextPage = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getExecutiveDashboard();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load executive dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data - replace with actual API data
  const revenueData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (GHS)',
        data: [2400000, 2100000, 2800000, 2500000, 3200000, 3800000, 4100000, 3900000, 4300000, 4000000, 3700000, 4500000],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
      },
    ],
  };

  const profitabilityData: ChartData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
    datasets: [
      {
        label: 'Gross Profit',
        data: [1800000, 2100000, 2400000, 2700000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Net Profit',
        data: [850000, 1200000, 1400000, 1600000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Operating Expenses',
        data: [950000, 900000, 1000000, 1100000],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const fuelMixData: ChartData = {
    labels: ['PMS', 'AGO', 'LPG', 'KERO', 'IFO'],
    datasets: [
      {
        label: 'Sales Volume',
        data: [45, 30, 15, 8, 2],
        backgroundColor: [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
        ],
      },
    ],
  };

  const regionalPerformanceData: ChartData = {
    labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Eastern', 'Volta', 'Upper East', 'Upper West', 'Brong Ahafo'],
    datasets: [
      {
        label: 'Revenue (GHS)',
        data: [8500000, 6200000, 4800000, 3900000, 2100000, 3200000, 2800000, 1500000, 1200000, 2900000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: 'GHS 45.2M',
      change: '+12.5%',
      changeType: 'increase' as const,
      period: 'vs last year',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: 'Net Profit Margin',
      value: '18.5%',
      change: '+2.1pp',
      changeType: 'increase' as const,
      period: 'vs last quarter',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Active Stations',
      value: '247',
      change: '+8',
      changeType: 'increase' as const,
      period: 'this month',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Market Share',
      value: '32.8%',
      change: '+1.2pp',
      changeType: 'increase' as const,
      period: 'in Ghana',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      title: 'Customer Satisfaction',
      value: '94.2%',
      change: '+3.8pp',
      changeType: 'increase' as const,
      period: 'NPS Score',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Compliance Score',
      value: '98.7%',
      change: '+0.5pp',
      changeType: 'increase' as const,
      period: 'regulatory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Only show executive dashboard to authorized users
  if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.COMPANY_ADMIN) {
    return (
      <FuturisticDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="text-center">
            <CardContent>
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
              <p className="text-gray-400">You don't have permission to view the Executive Dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </FuturisticDashboardLayout>
    );
  }

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
              Executive Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Strategic overview and key performance indicators for Ghana OMC
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </Button>
            <Button variant="primary" size="sm" onClick={loadDashboardData}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-400 mb-2">{kpi.title}</p>
                      <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                      <div className={`flex items-center text-sm ${
                        kpi.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <svg className={`w-4 h-4 mr-1 ${kpi.changeType === 'increase' ? 'rotate-0' : 'rotate-180'}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                        {kpi.change} {kpi.period}
                      </div>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                      <div className="text-primary-400">
                        {kpi.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader title="Revenue Trend" />
            <CardContent>
              <LineChart data={revenueData} height={300} showLegend={false} />
            </CardContent>
          </Card>

          {/* Profitability Analysis */}
          <Card>
            <CardHeader title="Quarterly Profitability" />
            <CardContent>
              <BarChart data={profitabilityData} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fuel Mix */}
          <Card>
            <CardHeader title="Fuel Sales Mix" />
            <CardContent>
              <PieChart data={fuelMixData} height={250} variant="doughnut" />
            </CardContent>
          </Card>

          {/* Regional Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader 
                title="Regional Performance" 
                action={
                  <select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm text-white">
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                }
              />
              <CardContent>
                <BarChart data={regionalPerformanceData} height={250} showLegend={false} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">15.2M</div>
              <div className="text-sm text-dark-400">Liters Sold</div>
              <div className="text-xs text-green-400 mt-1">+8.5% MoM</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-secondary-400 mb-2">24.7%</div>
              <div className="text-sm text-dark-400">EBITDA Margin</div>
              <div className="text-xs text-green-400 mt-1">+1.2pp YoY</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.2x</div>
              <div className="text-sm text-dark-400">Inventory Turnover</div>
              <div className="text-xs text-green-400 mt-1">+0.3x QoQ</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">97.8%</div>
              <div className="text-sm text-dark-400">Station Uptime</div>
              <div className="text-xs text-green-400 mt-1">+0.5% MoM</div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Initiatives */}
        <Card>
          <CardHeader title="Strategic Initiatives & Key Projects" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Digital Transformation</h4>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">75%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Implementing IoT sensors and digital payment systems across all stations</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Sustainability Program</h4>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">60%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Solar panels and eco-friendly infrastructure across 100 stations</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Market Expansion</h4>
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">40%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Opening 50 new stations in underserved regions</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default ExecutiveDashboardPage;