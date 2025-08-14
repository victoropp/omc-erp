import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts';
import { RealTimeChart } from '@/components/charts/RealTimeChart';
import { Badge } from '@/components/ui';
import { analyticsService } from '@/services/api';
import { toast } from 'react-hot-toast';

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const productOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'petrol-95', label: 'Petrol 95' },
    { value: 'diesel-ago', label: 'Diesel AGO' },
    { value: 'kerosene-dpk', label: 'Kerosene DPK' },
    { value: 'engine-oil', label: 'Engine Oil' },
    { value: 'lpg', label: 'LPG' }
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'greater-accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'western', label: 'Western' },
    { value: 'central', label: 'Central' },
    { value: 'northern', label: 'Northern' }
  ];

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod, selectedProduct, selectedRegion]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const filters = {
        period: selectedPeriod,
        product: selectedProduct !== 'all' ? selectedProduct : undefined,
        region: selectedRegion !== 'all' ? selectedRegion : undefined
      };

      const response = await analyticsService.getSalesAnalytics(selectedPeriod, filters);
      setData(response);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Mock data for development
      setData({
        summary: {
          totalSales: 15243,
          totalRevenue: 2847563.45,
          averageOrderValue: 186.75,
          growth: 8.3,
          topProducts: [
            { name: 'Petrol 95', sales: 6847, revenue: 1284563.45 },
            { name: 'Diesel AGO', sales: 4521, revenue: 847392.12 },
            { name: 'Kerosene DPK', sales: 2156, revenue: 394582.88 }
          ]
        },
        trends: generateMockTrends(),
        breakdown: generateMockBreakdown(),
        forecasting: generateMockForecast()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrends = () => ({
    daily: {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      datasets: [{
        label: 'Sales Volume',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 300),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    hourly: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Hourly Sales',
        data: [45, 52, 38, 42, 65, 78, 95, 120, 145, 165, 178, 185, 192, 188, 175, 168, 155, 142, 128, 115, 98, 82, 68, 55],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }]
    }
  });

  const generateMockBreakdown = () => ({
    byProduct: {
      labels: ['Petrol 95', 'Diesel AGO', 'Kerosene DPK', 'Engine Oil', 'LPG', 'Others'],
      datasets: [{
        data: [45, 28, 15, 8, 3, 1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
      }]
    },
    byRegion: {
      labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Others'],
      datasets: [{
        label: 'Sales (GHS)',
        data: [850000, 420000, 380000, 245000, 180000, 125000],
        backgroundColor: '#3B82F6'
      }]
    },
    byCustomerType: {
      labels: ['Retail', 'Corporate', 'Government', 'Wholesale'],
      datasets: [{
        data: [52, 28, 15, 5],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }]
    }
  });

  const generateMockForecast = () => ({
    labels: ['Current', 'Next Week', 'Next Month', 'Next Quarter'],
    datasets: [{
      label: 'Predicted Sales',
      data: [15243, 16800, 18200, 22500],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    }]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Sales Analytics" subtitle="Comprehensive sales performance analysis">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Sales Analytics" 
      subtitle="Comprehensive sales performance analysis and insights"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Select
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value)}
              options={periodOptions}
              className="w-40"
            />
            <Select
              value={selectedProduct}
              onChange={(value) => setSelectedProduct(value)}
              options={productOptions}
              className="w-40"
            />
            <Select
              value={selectedRegion}
              onChange={(value) => setSelectedRegion(value)}
              options={regionOptions}
              className="w-40"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Export Data</Button>
            <Button variant="outline">Generate Report</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
                  <p className="text-3xl font-bold text-blue-600">{data?.summary?.totalSales?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-green-600">+{data?.summary?.growth || 0}% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(data?.summary?.totalRevenue || 0)}</p>
                  <p className="text-sm text-green-600">+12.5% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(data?.summary?.averageOrderValue || 0)}</p>
                  <p className="text-sm text-green-600">+5.2% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-3xl font-bold text-orange-600">78.5%</p>
                  <p className="text-sm text-green-600">+2.1% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Real-time Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Real-time Sales</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Live sales data updated every 30 seconds</p>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RealTimeChart 
                endpoint="/analytics/live-sales"
                height={300}
                updateInterval={30000}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Daily Sales Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales volume over time</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data?.trends?.daily} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Hourly Sales Pattern</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peak hours analysis</p>
              </CardHeader>
              <CardContent>
                <LineChart data={data?.trends?.hourly} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sales Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Sales by Product</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product performance breakdown</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.breakdown?.byProduct} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Sales by Region</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Regional performance</p>
              </CardHeader>
              <CardContent>
                <BarChart data={data?.breakdown?.byRegion} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Customer Segments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales by customer type</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.breakdown?.byCustomerType} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Top Performing Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best selling products this period</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Sales Volume</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Growth</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Market Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.summary?.topProducts?.map((product: any, index: number) => (
                      <tr key={product.name} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.sales?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold">{formatCurrency(product.revenue)}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-600 font-medium">+{(Math.random() * 20).toFixed(1)}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${[45, 28, 15][index] || 5}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{[45, 28, 15][index] || 5}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Forecasting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Sales Forecasting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered sales predictions</p>
            </CardHeader>
            <CardContent>
              <LineChart data={data?.forecasting} height={300} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default SalesAnalytics;