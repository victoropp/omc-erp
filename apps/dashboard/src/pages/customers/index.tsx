import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const CustomerManagement = () => {
  const [selectedCustomerType, setSelectedCustomerType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Customer metrics
  const customerMetrics = {
    totalCustomers: 15847,
    activeCustomers: 12965,
    newCustomers: 234,
    fleetCustomers: 156,
    individualCustomers: 14523,
    corporateCustomers: 1168,
    averageSpend: 2450.75,
    loyaltyMembers: 8965,
    topTierCustomers: 45
  };

  // Customer segments data
  const customers = [
    {
      id: 'CUST-2025-001',
      name: 'Kwame Nkrumah Transport Ltd',
      type: 'fleet',
      category: 'Corporate',
      phone: '+233-24-123-4567',
      email: 'info@knkrumahtransport.com',
      location: 'Accra',
      registrationDate: '2023-03-15',
      totalSpent: 156780.50,
      monthlySpend: 12340.75,
      fuelPreference: 'Diesel (AGO)',
      paymentMethod: 'Credit',
      creditLimit: 50000.00,
      creditUsed: 12500.00,
      lastTransaction: '2025-01-12 14:30:00',
      loyaltyPoints: 15678,
      tier: 'Gold',
      status: 'active'
    },
    {
      id: 'CUST-2025-002',
      name: 'Ama Serwaa',
      type: 'individual',
      category: 'Individual',
      phone: '+233-20-987-6543',
      email: 'amaserwaa@email.com',
      location: 'Kumasi',
      registrationDate: '2024-08-22',
      totalSpent: 8450.25,
      monthlySpend: 675.50,
      fuelPreference: 'Petrol (95)',
      paymentMethod: 'Mobile Money',
      creditLimit: 0,
      creditUsed: 0,
      lastTransaction: '2025-01-11 09:15:00',
      loyaltyPoints: 845,
      tier: 'Silver',
      status: 'active'
    },
    {
      id: 'CUST-2025-003',
      name: 'Ghana Commercial Bank',
      type: 'corporate',
      category: 'Corporate',
      phone: '+233-30-276-4000',
      email: 'fleetmanager@gcb.com.gh',
      location: 'Accra',
      registrationDate: '2022-01-10',
      totalSpent: 485960.00,
      monthlySpend: 38750.00,
      fuelPreference: 'Mixed',
      paymentMethod: 'Bank Transfer',
      creditLimit: 100000.00,
      creditUsed: 35000.00,
      lastTransaction: '2025-01-13 16:45:00',
      loyaltyPoints: 48596,
      tier: 'Platinum',
      status: 'active'
    },
    {
      id: 'CUST-2025-004',
      name: 'Kojo Mensah',
      type: 'individual',
      category: 'Individual',
      phone: '+233-26-555-7890',
      email: 'kojomensah@gmail.com',
      location: 'Takoradi',
      registrationDate: '2024-11-30',
      totalSpent: 1250.75,
      monthlySpend: 625.38,
      fuelPreference: 'Petrol (91)',
      paymentMethod: 'Cash',
      creditLimit: 0,
      creditUsed: 0,
      lastTransaction: '2025-01-08 12:20:00',
      loyaltyPoints: 125,
      tier: 'Bronze',
      status: 'inactive'
    }
  ];

  // Customer acquisition trend
  const acquisitionTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'New Customers',
      data: [120, 145, 189, 156, 178, 203, 187, 234, 201, 198, 167, 234],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Customer type distribution
  const customerTypeData = {
    labels: ['Individual', 'Fleet', 'Corporate', 'Government'],
    datasets: [{
      data: [14523, 156, 1168, 123],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    }]
  };

  // Top customers by spend
  const topCustomersData = {
    labels: ['GCB Fleet', 'Nkrumah Transport', 'SSNIT Motors', 'Tema Oil Refinery', 'VIP Transport'],
    datasets: [{
      label: 'Monthly Spend (₵1000s)',
      data: [387, 123, 87, 76, 65],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: '#8B5CF6',
      borderWidth: 1
    }]
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'fleet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8m-8 0H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2h-5" />
          </svg>
        );
      case 'corporate':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              Customer Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage customer relationships and analyze customer behavior across Ghana
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Add New Customer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Import Customers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Export Report
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-600">{customerMetrics.totalCustomers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                  <p className="text-2xl font-bold text-green-600">{customerMetrics.activeCustomers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                  <p className="text-2xl font-bold text-purple-600">{customerMetrics.newCustomers}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Spend</p>
                  <p className="text-2xl font-bold text-orange-600">₵{customerMetrics.averageSpend.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loyalty Members</p>
                  <p className="text-2xl font-bold text-pink-600">{customerMetrics.loyaltyMembers.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Acquisition Trend</h3>
              <LineChart data={acquisitionTrendData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Type Distribution</h3>
              <PieChart data={customerTypeData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Top Customers Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Customers by Monthly Spend</h3>
            <BarChart data={topCustomersData} height={400} />
          </Card>
        </motion.div>

        {/* Customer Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Customer Database</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <select 
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedCustomerType}
                  onChange={(e) => setSelectedCustomerType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="fleet">Fleet</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Monthly Spend</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Loyalty Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Credit Usage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            customer.type === 'fleet' ? 'bg-blue-100 text-blue-600' :
                            customer.type === 'corporate' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {getCustomerTypeIcon(customer.type)}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-sm">{customer.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p>{customer.phone}</p>
                          <p className="text-gray-600 dark:text-gray-400">{customer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{customer.location}</td>
                      <td className="py-4 px-4 font-medium">₵{customer.totalSpent.toLocaleString()}</td>
                      <td className="py-4 px-4 font-medium">₵{customer.monthlySpend.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                          {customer.tier}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {customer.creditLimit > 0 ? (
                          <div className="text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(customer.creditUsed / customer.creditLimit) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs">{Math.round((customer.creditUsed / customer.creditLimit) * 100)}%</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              ₵{customer.creditUsed.toLocaleString()} / ₵{customer.creditLimit.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Cash Only</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Profile"
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
                            title="Edit Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Transaction History"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

export default CustomerManagement;