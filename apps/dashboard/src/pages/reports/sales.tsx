import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const SalesReports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [reportType, setReportType] = useState('summary');

  // Sales metrics
  const salesMetrics = {
    totalRevenue: 15847593.50,
    totalVolume: 985673.25,
    totalTransactions: 12847,
    averageTransaction: 1234.56,
    topPerformingStation: 'Accra Central Station',
    topSellingProduct: 'Petrol (95 Octane)',
    profitMargin: 18.5,
    customerRetention: 87.3,
    growthRate: 12.8
  };

  // Daily sales trend data
  const dailySalesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue (₵1000s)',
        data: [1450, 1678, 1523, 1789, 2145, 2456, 1923],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Volume (1000L)',
        data: [950, 1089, 987, 1156, 1378, 1567, 1234],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Station performance comparison
  const stationPerformanceData = {
    labels: ['Accra Central', 'Kumasi Highway', 'Takoradi Port', 'Cape Coast', 'Tamale North', 'Ho Station'],
    datasets: [{
      label: 'Weekly Revenue (₵1000s)',
      data: [2456, 1789, 2123, 1234, 987, 1456],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3B82F6',
      borderWidth: 1
    }]
  };

  // Product mix analysis
  const productMixData = {
    labels: ['Petrol (95)', 'Petrol (91)', 'Diesel (AGO)', 'Kerosene (DPK)', 'Lubricants', 'Other'],
    datasets: [{
      data: [45, 25, 20, 5, 3, 2],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }]
  };

  // Hourly sales pattern
  const hourlySalesData = {
    labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'],
    datasets: [{
      label: 'Average Hourly Sales (₵1000s)',
      data: [45, 78, 123, 156, 189, 201, 234, 267, 298, 321, 289, 256, 234, 198, 167, 123],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: '#8B5CF6',
      borderWidth: 1
    }]
  };

  // Top performing products data
  const topProductsData = [
    {
      product: 'Petrol (95 Octane)',
      revenue: 7123456.75,
      volume: 461234.5,
      growth: 15.3,
      margin: 22.1
    },
    {
      product: 'Diesel (AGO)',
      revenue: 4567890.25,
      volume: 306789.2,
      growth: 8.7,
      margin: 18.5
    },
    {
      product: 'Petrol (91 Octane)',
      revenue: 2987456.50,
      volume: 201456.8,
      growth: 12.1,
      margin: 19.8
    },
    {
      product: 'Kerosene (DPK)',
      revenue: 785632.00,
      volume: 57452.3,
      growth: 5.2,
      margin: 16.3
    }
  ];

  // Monthly comparison data
  const monthlyTrendsData = [
    { month: 'January', revenue: 12456789, volume: 789456, transactions: 45623 },
    { month: 'February', revenue: 13567890, volume: 856234, transactions: 48756 },
    { month: 'March', revenue: 14234567, volume: 901234, transactions: 51234 },
    { month: 'April', revenue: 15123456, volume: 967834, transactions: 53456 },
    { month: 'May', revenue: 15847593, volume: 985673, transactions: 54789 },
  ];

  // Station-wise detailed performance
  const stationDetailsData = [
    {
      station: 'Accra Central Station',
      revenue: 3456789.50,
      volume: 234567.8,
      transactions: 12456,
      avgTransaction: 277.45,
      topProduct: 'Petrol (95)',
      growth: 18.7,
      margin: 21.3
    },
    {
      station: 'Kumasi Highway Station',
      revenue: 2987456.25,
      volume: 201234.5,
      transactions: 10234,
      avgTransaction: 292.18,
      topProduct: 'Diesel (AGO)',
      growth: 12.4,
      margin: 19.8
    },
    {
      station: 'Takoradi Port Station',
      revenue: 4123567.75,
      volume: 278945.2,
      transactions: 14567,
      avgTransaction: 283.12,
      topProduct: 'Petrol (95)',
      growth: 22.1,
      margin: 23.5
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount).replace('GHS', '₵');
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Sales Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive sales analytics and performance reports for Ghana OMC operations
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <select 
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Schedule Report
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Report Type</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="summary">Sales Summary</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="comparison">Period Comparison</option>
                  <option value="forecast">Sales Forecast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Station</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                >
                  <option value="all">All Stations</option>
                  <option value="accra">Accra Central</option>
                  <option value="kumasi">Kumasi Highway</option>
                  <option value="takoradi">Takoradi Port</option>
                  <option value="cape-coast">Cape Coast</option>
                  <option value="tamale">Tamale North</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Product</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="all">All Products</option>
                  <option value="petrol-95">Petrol (95 Octane)</option>
                  <option value="petrol-91">Petrol (91 Octane)</option>
                  <option value="diesel">Diesel (AGO)</option>
                  <option value="kerosene">Kerosene (DPK)</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesMetrics.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    {getGrowthIcon(salesMetrics.growthRate)}
                    <span className={`text-xs ml-1 ${getGrowthColor(salesMetrics.growthRate)}`}>
                      +{salesMetrics.growthRate}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-green-600">{(salesMetrics.totalVolume / 1000).toFixed(0)}K L</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">{salesMetrics.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Transaction</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(salesMetrics.averageTransaction)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-2xl font-bold text-pink-600">{salesMetrics.profitMargin}%</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
              <LineChart data={dailySalesData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Mix Analysis</h3>
              <PieChart data={productMixData} height={300} />
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Station Performance Comparison</h3>
              <BarChart data={stationPerformanceData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hourly Sales Pattern</h3>
              <BarChart data={hourlySalesData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Top Products Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Volume (L)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Growth</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsData.map((product, index) => (
                    <motion.tr
                      key={product.product}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{product.product}</td>
                      <td className="py-4 px-4 font-bold">{formatCurrency(product.revenue)}</td>
                      <td className="py-4 px-4">{product.volume.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {getGrowthIcon(product.growth)}
                          <span className={`ml-1 font-medium ${getGrowthColor(product.growth)}`}>
                            +{product.growth}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{product.margin}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Station Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Station Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Station</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Volume (L)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Transactions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Avg Transaction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Top Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Growth</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {stationDetailsData.map((station, index) => (
                    <motion.tr
                      key={station.station}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{station.station}</td>
                      <td className="py-4 px-4 font-bold">{formatCurrency(station.revenue)}</td>
                      <td className="py-4 px-4">{station.volume.toLocaleString()}</td>
                      <td className="py-4 px-4">{station.transactions.toLocaleString()}</td>
                      <td className="py-4 px-4">{formatCurrency(station.avgTransaction)}</td>
                      <td className="py-4 px-4">{station.topProduct}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {getGrowthIcon(station.growth)}
                          <span className={`ml-1 font-medium ${getGrowthColor(station.growth)}`}>
                            +{station.growth}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{station.margin}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default SalesReports;