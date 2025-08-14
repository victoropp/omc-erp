import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts';
import { Badge } from '@/components/ui';
import { analyticsService } from '@/services/api';
import { toast } from 'react-hot-toast';

const FinancialAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1y');

  const periodOptions = [
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: '3y', label: 'Last 3 Years' }
  ];

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getFinancialAnalytics(selectedPeriod);
      setData(response);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Mock data for development
      setData({
        summary: {
          revenue: 28475634.50,
          revenueGrowth: 12.5,
          grossProfit: 8542690.35,
          grossMargin: 30.0,
          netProfit: 4273845.18,
          netMargin: 15.0,
          ebitda: 6410767.77,
          ebitdaMargin: 22.5,
          operatingCashFlow: 5689023.45,
          returnOnAssets: 18.5,
          returnOnEquity: 24.2,
          currentRatio: 2.1
        },
        trends: generateMockTrends(),
        breakdown: generateMockBreakdown(),
        ratios: generateMockRatios()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrends = () => ({
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Revenue (GHS)',
        data: [2100000, 2250000, 2400000, 2150000, 2550000, 2700000, 2800000, 2650000, 2900000, 3100000, 3200000, 2847563],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    profitability: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Gross Margin %',
        data: [28.5, 29.2, 30.1, 28.8, 31.2, 30.5, 30.8, 29.9, 31.5, 32.1, 31.8, 30.0],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }, {
        label: 'Net Margin %',
        data: [14.2, 14.8, 15.5, 14.1, 16.2, 15.8, 15.9, 15.2, 16.5, 16.8, 16.3, 15.0],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    },
    cashFlow: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Operating Cash Flow',
        data: [1200000, 1450000, 1650000, 1389023],
        backgroundColor: '#3B82F6'
      }, {
        label: 'Investing Cash Flow',
        data: [-300000, -450000, -200000, -350000],
        backgroundColor: '#EF4444'
      }, {
        label: 'Financing Cash Flow',
        data: [-150000, 200000, -100000, -80000],
        backgroundColor: '#F59E0B'
      }]
    }
  });

  const generateMockBreakdown = () => ({
    revenueByProduct: {
      labels: ['Petrol', 'Diesel', 'Kerosene', 'Lubricants', 'LPG', 'Services'],
      datasets: [{
        data: [45, 28, 15, 8, 3, 1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
      }]
    },
    expenseByCategory: {
      labels: ['COGS', 'Personnel', 'Operations', 'Marketing', 'Admin', 'Others'],
      datasets: [{
        data: [65, 15, 8, 5, 4, 3],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#6B7280']
      }]
    },
    profitBySegment: {
      labels: ['Retail', 'Corporate', 'Government', 'Export'],
      datasets: [{
        label: 'Profit (GHS)',
        data: [1800000, 1200000, 900000, 373845],
        backgroundColor: '#10B981'
      }]
    }
  });

  const generateMockRatios = () => ({
    liquidity: [
      { name: 'Current Ratio', value: 2.1, target: 2.0, status: 'good' },
      { name: 'Quick Ratio', value: 1.8, target: 1.5, status: 'good' },
      { name: 'Cash Ratio', value: 0.9, target: 0.5, status: 'excellent' }
    ],
    efficiency: [
      { name: 'Asset Turnover', value: 1.2, target: 1.0, status: 'good' },
      { name: 'Inventory Turnover', value: 8.5, target: 6.0, status: 'excellent' },
      { name: 'Receivables Turnover', value: 12.3, target: 10.0, status: 'good' }
    ],
    leverage: [
      { name: 'Debt-to-Equity', value: 0.6, target: 1.0, status: 'good' },
      { name: 'Interest Coverage', value: 15.2, target: 5.0, status: 'excellent' },
      { name: 'Debt Service Coverage', value: 2.8, target: 1.5, status: 'excellent' }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number, showSign = false) => {
    const sign = showSign && percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getRatioColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'warning': return 'warning';
      case 'poor': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Financial Analytics" subtitle="Comprehensive financial performance analysis">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Financial Analytics" 
      subtitle="Comprehensive financial performance analysis and insights"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-4">
            <Select
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value)}
              options={periodOptions}
              className="w-40"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Financial Report</Button>
            <Button variant="outline">Budget Analysis</Button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Revenue',
              value: formatCurrency(data?.summary?.revenue || 0),
              growth: data?.summary?.revenueGrowth || 0,
              icon: '💰',
              color: 'blue'
            },
            {
              title: 'Gross Profit',
              value: formatCurrency(data?.summary?.grossProfit || 0),
              growth: 8.5,
              icon: '📈',
              color: 'green'
            },
            {
              title: 'Net Profit',
              value: formatCurrency(data?.summary?.netProfit || 0),
              growth: 15.2,
              icon: '🎯',
              color: 'purple'
            },
            {
              title: 'EBITDA',
              value: formatCurrency(data?.summary?.ebitda || 0),
              growth: 11.8,
              icon: '⚡',
              color: 'orange'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{metric.icon}</span>
                  <span className={`text-sm font-medium ${
                    metric.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(metric.growth, true)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Margin Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Gross Margin',
              value: formatPercentage(data?.summary?.grossMargin || 0),
              color: 'green'
            },
            {
              title: 'Net Margin',
              value: formatPercentage(data?.summary?.netMargin || 0),
              color: 'blue'
            },
            {
              title: 'EBITDA Margin',
              value: formatPercentage(data?.summary?.ebitdaMargin || 0),
              color: 'purple'
            },
            {
              title: 'ROE',
              value: formatPercentage(data?.summary?.returnOnEquity || 0),
              color: 'orange'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="p-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue and Profitability Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Revenue Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue performance</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data?.trends?.revenue} height={300} />
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
                <h3 className="text-lg font-semibold">Profitability Trends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Margin performance over time</p>
              </CardHeader>
              <CardContent>
                <LineChart data={data?.trends?.profitability} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue and Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Revenue by Product</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product contribution</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.breakdown?.revenueByProduct} height={300} />
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
                <h3 className="text-lg font-semibold">Expenses by Category</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cost structure analysis</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.breakdown?.expenseByCategory} height={300} />
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
                <h3 className="text-lg font-semibold">Profit by Segment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Segment profitability</p>
              </CardHeader>
              <CardContent>
                <BarChart data={data?.breakdown?.profitBySegment} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Cash Flow Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Cash Flow Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quarterly cash flow breakdown</p>
            </CardHeader>
            <CardContent>
              <BarChart data={data?.trends?.cashFlow} height={300} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Ratios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Liquidity Ratios</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Short-term financial health</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.ratios?.liquidity?.map((ratio: any) => (
                    <div key={ratio.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ratio.name}</p>
                        <p className="text-sm text-gray-500">Target: {ratio.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{ratio.value}</p>
                        <Badge variant={getRatioColor(ratio.status)} className="text-xs">
                          {ratio.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Efficiency Ratios</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asset utilization metrics</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.ratios?.efficiency?.map((ratio: any) => (
                    <div key={ratio.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ratio.name}</p>
                        <p className="text-sm text-gray-500">Target: {ratio.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{ratio.value}</p>
                        <Badge variant={getRatioColor(ratio.status)} className="text-xs">
                          {ratio.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Leverage Ratios</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Financial leverage analysis</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.ratios?.leverage?.map((ratio: any) => (
                    <div key={ratio.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ratio.name}</p>
                        <p className="text-sm text-gray-500">Target: {ratio.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{ratio.value}</p>
                        <Badge variant={getRatioColor(ratio.status)} className="text-xs">
                          {ratio.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Financial Health Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Financial Health Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall financial performance insights</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Strengths</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Strong revenue growth (+12.5%)</li>
                    <li>• Healthy cash flow generation</li>
                    <li>• Good liquidity position</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Opportunities</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Expand lubricant segment</li>
                    <li>• Improve operational efficiency</li>
                    <li>• Explore new markets</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Watch Areas</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Monitor cost inflation</li>
                    <li>• Track working capital</li>
                    <li>• Manage forex exposure</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Goals</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Achieve 35% gross margin</li>
                    <li>• Maintain 2.0+ current ratio</li>
                    <li>• Target 20% ROE</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default FinancialAnalytics;