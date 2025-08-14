import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const InventoryManagement = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);

  // Inventory metrics
  const inventoryMetrics = {
    totalProducts: 8,
    totalVolume: 2847593,
    lowStockAlerts: 5,
    outOfStock: 2,
    averageStockLevel: 78.5,
    reorderPoints: 12,
    totalValue: 45786932.50,
    turnoverRate: 15.8,
    deliveriesPending: 3,
    lastRestocked: '2025-01-12 08:30'
  };

  // Product inventory data
  const inventoryData = [
    {
      id: 'PROD-001',
      name: 'Petrol (95 Octane)',
      category: 'Fuel',
      currentStock: 156789,
      minStock: 50000,
      maxStock: 200000,
      reorderPoint: 75000,
      unit: 'Litres',
      costPerUnit: 12.45,
      sellingPrice: 15.43,
      stockLevel: 78.4,
      lastDelivery: '2025-01-10 14:30',
      nextDelivery: '2025-01-15 09:00',
      supplier: 'Ghana National Petroleum Corporation',
      location: 'Tank A1',
      status: 'adequate',
      dailyConsumption: 8500,
      daysToEmpty: 18
    },
    {
      id: 'PROD-002',
      name: 'Petrol (91 Octane)',
      category: 'Fuel',
      currentStock: 89450,
      minStock: 40000,
      maxStock: 150000,
      reorderPoint: 60000,
      unit: 'Litres',
      costPerUnit: 11.89,
      sellingPrice: 14.87,
      stockLevel: 59.6,
      lastDelivery: '2025-01-08 16:20',
      nextDelivery: '2025-01-14 11:00',
      supplier: 'Tema Oil Refinery',
      location: 'Tank A2',
      status: 'low',
      dailyConsumption: 4200,
      daysToEmpty: 21
    },
    {
      id: 'PROD-003',
      name: 'Diesel (AGO)',
      category: 'Fuel',
      currentStock: 198765,
      minStock: 60000,
      maxStock: 250000,
      reorderPoint: 90000,
      unit: 'Litres',
      costPerUnit: 11.23,
      sellingPrice: 14.89,
      stockLevel: 79.5,
      lastDelivery: '2025-01-11 10:15',
      nextDelivery: '2025-01-16 13:30',
      supplier: 'Ghana National Petroleum Corporation',
      location: 'Tank B1',
      status: 'adequate',
      dailyConsumption: 6800,
      daysToEmpty: 29
    },
    {
      id: 'PROD-004',
      name: 'Kerosene (DPK)',
      category: 'Fuel',
      currentStock: 25430,
      minStock: 20000,
      maxStock: 80000,
      reorderPoint: 30000,
      unit: 'Litres',
      costPerUnit: 10.45,
      sellingPrice: 13.67,
      stockLevel: 31.8,
      lastDelivery: '2025-01-06 09:45',
      nextDelivery: '2025-01-13 15:00',
      supplier: 'Tema Oil Refinery',
      location: 'Tank C1',
      status: 'critical',
      dailyConsumption: 1200,
      daysToEmpty: 21
    },
    {
      id: 'PROD-005',
      name: 'Lubricants',
      category: 'Non-Fuel',
      currentStock: 0,
      minStock: 500,
      maxStock: 2000,
      reorderPoint: 750,
      unit: 'Litres',
      costPerUnit: 45.00,
      sellingPrice: 65.00,
      stockLevel: 0,
      lastDelivery: '2024-12-28 11:20',
      nextDelivery: 'TBD',
      supplier: 'Total Energies Ghana',
      location: 'Storage Room A',
      status: 'out_of_stock',
      dailyConsumption: 25,
      daysToEmpty: 0
    },
    {
      id: 'PROD-006',
      name: 'Engine Oil',
      category: 'Non-Fuel',
      currentStock: 1245,
      minStock: 300,
      maxStock: 1500,
      reorderPoint: 500,
      unit: 'Litres',
      costPerUnit: 38.50,
      sellingPrice: 55.00,
      stockLevel: 83.0,
      lastDelivery: '2025-01-09 13:15',
      nextDelivery: '2025-01-20 10:00',
      supplier: 'Shell Ghana',
      location: 'Storage Room B',
      status: 'adequate',
      dailyConsumption: 18,
      daysToEmpty: 69
    }
  ];

  // Stock level trends
  const stockTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Petrol 95',
        data: [168, 165, 162, 159, 157, 156],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Petrol 91', 
        data: [95, 93, 91, 90, 89, 89],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Diesel AGO',
        data: [205, 203, 201, 200, 199, 198],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Inventory value distribution
  const valueDistributionData = {
    labels: ['Petrol (95)', 'Petrol (91)', 'Diesel (AGO)', 'Kerosene (DPK)', 'Lubricants', 'Engine Oil', 'Other'],
    datasets: [{
      data: [35, 22, 28, 8, 0, 4, 3],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
    }]
  };

  // Monthly consumption data
  const consumptionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Total Consumption (000L)',
      data: [450, 478, 523, 489, 567, 601, 578, 634, 589, 612, 567, 623],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: '#8B5CF6',
      borderWidth: 1
    }]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'adequate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStockLevelColor = (level: number) => {
    if (level > 75) return 'bg-green-500';
    if (level > 50) return 'bg-yellow-500';
    if (level > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'critical':
      case 'out_of_stock':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
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
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time fuel inventory monitoring and management across all stations
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRealTimeActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isRealTimeActive ? 'Live Monitoring' : 'Offline'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Request Delivery
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Generate Report
            </motion.button>
          </div>
        </motion.div>

        {/* Alert Summary */}
        {inventoryMetrics.lowStockAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Inventory Alerts</h3>
                    <p className="text-red-700 dark:text-red-300">
                      {inventoryMetrics.lowStockAlerts} products require attention • {inventoryMetrics.outOfStock} out of stock
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  View Alerts
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-3xl font-bold text-blue-600">{inventoryMetrics.totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume (L)</p>
                  <p className="text-3xl font-bold text-green-600">{(inventoryMetrics.totalVolume / 1000).toFixed(0)}K</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-3xl font-bold text-purple-600">₵{(inventoryMetrics.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Stock Level</p>
                  <p className="text-3xl font-bold text-orange-600">{inventoryMetrics.averageStockLevel}%</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{inventoryMetrics.lowStockAlerts}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Stock Level Trends (24h)</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Real-time</span>
                </div>
              </div>
              <LineChart data={stockTrendData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Value Distribution</h3>
              <PieChart data={valueDistributionData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Monthly Consumption Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Fuel Consumption</h3>
            <BarChart data={consumptionData} height={400} />
          </Card>
        </motion.div>

        {/* Inventory Details Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Product Inventory</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <select 
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                >
                  <option value="all">All Products</option>
                  <option value="low">Low Stock</option>
                  <option value="critical">Critical</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stock Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Daily Usage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Days to Empty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {getAlertIcon(product.status)}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{product.currentStock.toLocaleString()} {product.unit}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Min: {product.minStock.toLocaleString()} | Max: {product.maxStock.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                            <div 
                              className={`h-2 rounded-full ${getStockLevelColor(product.stockLevel)}`}
                              style={{ width: `${Math.min(product.stockLevel, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium min-w-[40px]">{product.stockLevel.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{product.dailyConsumption.toLocaleString()} L/day</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${product.daysToEmpty < 7 ? 'text-red-600' : product.daysToEmpty < 14 ? 'text-orange-600' : 'text-green-600'}`}>
                          {product.daysToEmpty} days
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">{product.location}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(product.lastDelivery).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Request Delivery"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Adjust Stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
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

export default InventoryManagement;