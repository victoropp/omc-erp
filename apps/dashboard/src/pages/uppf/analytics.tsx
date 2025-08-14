import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/index';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { pricingService, wsService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface UPPFAnalyticsData {
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  totalClaimValue: number;
  averageProcessingTime: number;
  settlementRate: number;
  monthlyTrend: any[];
  routeAnalysis: any[];
  npaSubmissionStats: any[];
  dealerPerformance: any[];
  auditFindings: any[];
  complianceMetrics: any;
}

interface SearchFilters {
  dateRange: string;
  status: string;
  route: string;
  dealer: string;
}

const UPPFAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<UPPFAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    dateRange: '30days',
    status: 'all',
    route: 'all',
    dealer: 'all'
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = {
        ...searchFilters,
        includeRealTime: realTimeUpdates
      };
      
      const data = await pricingService.get(`/uppf-analytics?${new URLSearchParams(params).toString()}`);
      setAnalyticsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching UPPF analytics:', error);
      toast.error('Failed to load UPPF analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates via WebSocket
  useEffect(() => {
    if (realTimeUpdates) {
      wsService.connect();
      
      const handleUPPFUpdate = (data: any) => {
        if (data.type === 'uppf_analytics_update') {
          setAnalyticsData(prev => ({
            ...prev,
            ...data.payload
          }));
          setLastUpdated(new Date());
        }
      };

      // Add event listener for WebSocket messages
      wsService.send({ type: 'subscribe', channel: 'uppf_analytics' });
      
      return () => {
        wsService.send({ type: 'unsubscribe', channel: 'uppf_analytics' });
        wsService.disconnect();
      };
    }
  }, [realTimeUpdates]);

  // Initial data load
  useEffect(() => {
    fetchAnalyticsData();
  }, [searchFilters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  // Export analytics data
  const exportAnalytics = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await pricingService.get(`/uppf-analytics/export?format=${format}&${new URLSearchParams(searchFilters).toString()}`);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uppf-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  if (loading || !analyticsData) {
    return (
      <FuturisticDashboardLayout title="UPPF Analytics" subtitle="Comprehensive UPPF Performance Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout title="UPPF Analytics" subtitle="Comprehensive UPPF Performance Analytics">
      <div className="space-y-6">
        {/* Real-time Status & Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <Badge variant={realTimeUpdates ? 'success' : 'secondary'}>
              {realTimeUpdates ? '● Live Updates' : '○ Static View'}
            </Badge>
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            >
              {realTimeUpdates ? 'Disable' : 'Enable'} Real-time
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => exportAnalytics('excel')}
            >
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm" 
              onClick={() => exportAnalytics('pdf')}
            >
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Search & Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Date Range"
                value={searchFilters.dateRange}
                onChange={(value) => handleFilterChange('dateRange', value)}
                options={[
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '90days', label: 'Last 90 Days' },
                  { value: '1year', label: 'Last Year' },
                  { value: 'custom', label: 'Custom Range' }
                ]}
              />
              
              <Select
                label="Status"
                value={searchFilters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'settled', label: 'Settled' }
                ]}
              />
              
              <Select
                label="Route"
                value={searchFilters.route}
                onChange={(value) => handleFilterChange('route', value)}
                options={[
                  { value: 'all', label: 'All Routes' },
                  { value: 'accra-kumasi', label: 'Accra - Kumasi' },
                  { value: 'tema-tamale', label: 'Tema - Tamale' },
                  { value: 'takoradi-sunyani', label: 'Takoradi - Sunyani' }
                ]}
              />
              
              <Select
                label="Dealer"
                value={searchFilters.dealer}
                onChange={(value) => handleFilterChange('dealer', value)}
                options={[
                  { value: 'all', label: 'All Dealers' },
                  { value: 'dealer-001', label: 'Ghana Oil Depot' },
                  { value: 'dealer-002', label: 'Tema Energy Hub' },
                  { value: 'dealer-003', label: 'Kumasi Fuel Centre' }
                ]}
              />
            </div>
          </Card>
        </motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Claims</p>
                  <p className="text-3xl font-bold text-blue-700">{analyticsData.totalClaims.toLocaleString()}</p>
                  <p className="text-xs text-blue-500 mt-1">+12% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Value</p>
                  <p className="text-3xl font-bold text-green-700">₵{analyticsData.totalClaimValue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 mt-1">+8.5% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Settlement Rate</p>
                  <p className="text-3xl font-bold text-purple-700">{analyticsData.settlementRate}%</p>
                  <p className="text-xs text-purple-500 mt-1">+2.1% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Processing Time</p>
                  <p className="text-3xl font-bold text-orange-700">{analyticsData.averageProcessingTime} days</p>
                  <p className="text-xs text-orange-500 mt-1">-0.5 days vs last period</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Claims Trend</h3>
              <LineChart
                data={{
                  labels: analyticsData.monthlyTrend?.map(item => item.month) || [],
                  datasets: [
                    {
                      label: 'Claims Submitted',
                      data: analyticsData.monthlyTrend?.map(item => item.submitted) || [],
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4
                    },
                    {
                      label: 'Claims Approved',
                      data: analyticsData.monthlyTrend?.map(item => item.approved) || [],
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.4
                    }
                  ]
                }}
                height={300}
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Claims by Route</h3>
              <BarChart
                data={{
                  labels: analyticsData.routeAnalysis?.map(route => route.name) || [],
                  datasets: [{
                    label: 'Total Claims',
                    data: analyticsData.routeAnalysis?.map(route => route.count) || [],
                    backgroundColor: [
                      '#3B82F6',
                      '#10B981', 
                      '#F59E0B',
                      '#EF4444',
                      '#8B5CF6'
                    ]
                  }]
                }}
                height={300}
              />
            </Card>
          </motion.div>
        </div>

        {/* Detailed Analytics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Dealers</h3>
              <div className="space-y-3">
                {analyticsData.dealerPerformance?.map((dealer, index) => (
                  <div key={dealer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{dealer.name}</p>
                        <p className="text-sm text-gray-500">{dealer.claimsCount} claims</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₵{dealer.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{dealer.successRate}% success</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">NPA Submission Statistics</h3>
              <div className="space-y-4">
                {analyticsData.npaSubmissionStats?.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{stat.type}</p>
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
                      <Badge variant={stat.status === 'success' ? 'success' : stat.status === 'pending' ? 'warning' : 'danger'}>
                        {stat.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Compliance & Audit Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance & Audit Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{analyticsData.complianceMetrics?.compliantClaims || 0}</p>
                <p className="text-sm text-gray-600">Compliant Claims</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.complianceMetrics?.complianceRate || 0}%` }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{analyticsData.auditFindings?.length || 0}</p>
                <p className="text-sm text-gray-600">Audit Findings</p>
                <div className="mt-2 flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < (analyticsData.auditFindings?.filter(f => f.severity === 'high').length || 0)
                          ? 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analyticsData.complianceMetrics?.averageScore || 0}%</p>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <PieChart
                  data={{
                    labels: ['Compliant', 'Non-compliant'],
                    datasets: [{
                      data: [
                        analyticsData.complianceMetrics?.averageScore || 0,
                        100 - (analyticsData.complianceMetrics?.averageScore || 0)
                      ],
                      backgroundColor: ['#10B981', '#EF4444']
                    }]
                  }}
                  height={100}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default UPPFAnalytics;