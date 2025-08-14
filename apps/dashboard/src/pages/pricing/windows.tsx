import React from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';

const PricingWindowsPage = () => {
  const currentWindows = [
    {
      id: 'PW-2025-001',
      name: 'January 2025 - Window 1',
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      status: 'active',
      productsCount: 8,
      stationsCount: 156,
      averagePrice: 12.45,
      totalVolume: 2847593.50
    },
    {
      id: 'PW-2025-002',
      name: 'January 2025 - Window 2',
      startDate: '2025-01-16',
      endDate: '2025-01-31',
      status: 'draft',
      productsCount: 8,
      stationsCount: 156,
      averagePrice: 12.67,
      totalVolume: 0
    },
    {
      id: 'PW-2024-026',
      name: 'December 2024 - Window 2',
      startDate: '2024-12-16',
      endDate: '2024-12-31',
      status: 'closed',
      productsCount: 8,
      stationsCount: 154,
      averagePrice: 12.23,
      totalVolume: 3156789.75
    }
  ];

  const windowProducts = [
    {
      product: 'Petrol (95 Octane)',
      currentPrice: 15.45,
      proposedPrice: 15.57,
      variance: '+0.12',
      effectiveDate: '2025-01-16',
      status: 'approved'
    },
    {
      product: 'Diesel (AGO)',
      currentPrice: 14.89,
      proposedPrice: 14.81,
      variance: '-0.08',
      effectiveDate: '2025-01-16',
      status: 'pending'
    },
    {
      product: 'Kerosene (DPK)',
      currentPrice: 13.67,
      proposedPrice: 13.72,
      variance: '+0.05',
      effectiveDate: '2025-01-16',
      status: 'approved'
    },
    {
      product: 'Heavy Fuel Oil',
      currentPrice: 11.23,
      proposedPrice: 11.18,
      variance: '-0.05',
      effectiveDate: '2025-01-16',
      status: 'rejected'
    }
  ];

  return (
    <FuturisticDashboardLayout title="Pricing Windows Management" subtitle="NPA Pricing Windows & Price Approvals">
      <div className="space-y-6">
        {/* Current Active Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Current Active Window</h3>
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium animate-pulse">
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Window ID</p>
                <p className="font-bold text-green-700 dark:text-green-300">{currentWindows[0].id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Period</p>
                <p className="font-medium">{currentWindows[0].startDate} to {currentWindows[0].endDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Stations</p>
                <p className="font-bold text-2xl">{currentWindows[0].stationsCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="font-bold text-2xl">₵{currentWindows[0].totalVolume.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* All Pricing Windows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Pricing Windows</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Create New Window
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Window ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Products</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Avg Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWindows.map((window, index) => (
                    <motion.tr
                      key={window.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm">{window.id}</td>
                      <td className="py-3 px-4 font-medium">{window.name}</td>
                      <td className="py-3 px-4 text-sm">{window.startDate} - {window.endDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          window.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          window.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {window.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{window.productsCount}</td>
                      <td className="py-3 px-4 font-bold">₵{window.averagePrice}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Edit Window"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Next Window Product Prices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Next Window - Product Prices</h3>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Submit to NPA
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Save Draft
                </motion.button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Proposed Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Variance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Effective Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {windowProducts.map((product, index) => (
                    <motion.tr
                      key={product.product}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{product.product}</td>
                      <td className="py-3 px-4 font-bold">₵{product.currentPrice}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">₵{product.proposedPrice}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          product.variance.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.variance}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{product.effectiveDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Edit Price"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Calculate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </tr>
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

export default PricingWindowsPage;