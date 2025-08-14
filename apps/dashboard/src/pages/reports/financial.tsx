import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const FinancialReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedCurrency, setSelectedCurrency] = useState('GHS');

  // Financial metrics
  const financialMetrics = {
    totalRevenue: 285674932.50,
    totalCosts: 237456789.25,
    grossProfit: 48218143.25,
    netProfit: 38574521.75,
    grossMargin: 16.89,
    netMargin: 13.51,
    operatingExpenses: 9643621.50,
    ebitda: 42156789.50,
    totalAssets: 456789234.75,
    totalLiabilities: 298765432.50,
    equity: 158023802.25,
    roa: 8.45,
    roe: 24.41,
    currentRatio: 1.85,
    quickRatio: 1.32,
    debtToEquity: 1.89,
    cashFlow: 35678912.25
  };

  // Revenue vs Profit trend
  const revenueProfitData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
    datasets: [
      {
        label: 'Revenue (₵M)',
        data: [52.4, 58.9, 61.2, 67.8, 71.5],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Net Profit (₵M)',
        data: [6.8, 7.9, 8.4, 9.6, 10.2],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      }
    ]
  };

  // Cost breakdown analysis
  const costBreakdownData = {
    labels: ['Cost of Goods Sold', 'Operating Expenses', 'Administrative', 'Marketing', 'Interest', 'Other'],
    datasets: [{
      data: [78.5, 12.3, 5.2, 2.1, 1.4, 0.5],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }]
  };

  // Monthly cash flow
  const cashFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Operating Cash Flow (₵M)',
        data: [3.2, 2.8, 4.1, 3.7, 4.5, 5.2, 4.8, 5.6, 4.9, 5.1, 4.3, 3.9],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981'
      },
      {
        label: 'Free Cash Flow (₵M)',
        data: [2.1, 1.7, 2.9, 2.4, 3.2, 3.8, 3.5, 4.1, 3.6, 3.7, 3.0, 2.6],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6'
      }
    ]
  };

  // Financial ratios comparison
  const ratiosData = {
    labels: ['Current Ratio', 'Quick Ratio', 'Debt/Equity', 'ROA %', 'ROE %', 'Gross Margin %'],
    datasets: [{
      label: '2025 Actual',
      data: [1.85, 1.32, 1.89, 8.45, 24.41, 16.89],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3B82F6',
      borderWidth: 1
    }, {
      label: '2024 Actual',
      data: [1.72, 1.28, 2.15, 7.89, 22.3, 15.6],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10B981',
      borderWidth: 1
    }]
  };

  // Income statement data
  const incomeStatementData = [
    { 
      item: 'Revenue',
      q1_2024: 52400000,
      q2_2024: 58900000,
      q3_2024: 61200000,
      q4_2024: 67800000,
      q1_2025: 71500000,
      change: 5.5
    },
    { 
      item: 'Cost of Goods Sold',
      q1_2024: 41120000,
      q2_2024: 46210000,
      q3_2024: 47940000,
      q4_2024: 53124000,
      q1_2025: 56075000,
      change: 5.5
    },
    { 
      item: 'Gross Profit',
      q1_2024: 11280000,
      q2_2024: 12690000,
      q3_2024: 13260000,
      q4_2024: 14676000,
      q1_2025: 15425000,
      change: 5.1
    },
    { 
      item: 'Operating Expenses',
      q1_2024: 6288000,
      q2_2024: 7068000,
      q3_2024: 7344000,
      q4_2024: 8136000,
      q1_2025: 8580000,
      change: 5.5
    },
    { 
      item: 'Net Profit',
      q1_2024: 6800000,
      q2_2024: 7900000,
      q3_2024: 8400000,
      q4_2024: 9600000,
      q1_2025: 10200000,
      change: 6.3
    }
  ];

  // Balance sheet data
  const balanceSheetData = [
    {
      category: 'Assets',
      items: [
        { item: 'Current Assets', amount: 125678934.50, percentage: 27.5 },
        { item: 'Fixed Assets', amount: 298765432.25, percentage: 65.4 },
        { item: 'Intangible Assets', amount: 23456789.00, percentage: 5.1 },
        { item: 'Other Assets', amount: 8888079.00, percentage: 2.0 }
      ]
    },
    {
      category: 'Liabilities & Equity',
      items: [
        { item: 'Current Liabilities', amount: 89765432.50, percentage: 19.6 },
        { item: 'Long-term Liabilities', amount: 209000000.00, percentage: 45.8 },
        { item: 'Total Equity', amount: 158023802.25, percentage: 34.6 }
      ]
    }
  ];

  // Key financial ratios over time
  const keyRatiosData = [
    { ratio: 'Gross Profit Margin', current: 16.89, previous: 15.60, industry: 18.2, target: 20.0 },
    { ratio: 'Net Profit Margin', current: 13.51, previous: 12.35, industry: 14.8, target: 16.0 },
    { ratio: 'Return on Assets (ROA)', current: 8.45, previous: 7.89, industry: 9.2, target: 10.0 },
    { ratio: 'Return on Equity (ROE)', current: 24.41, previous: 22.30, industry: 26.5, target: 28.0 },
    { ratio: 'Current Ratio', current: 1.85, previous: 1.72, industry: 1.90, target: 2.00 },
    { ratio: 'Debt-to-Equity', current: 1.89, previous: 2.15, industry: 1.75, target: 1.50 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('GHS', '₵');
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount).replace('GHS', '₵');
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  };

  const getRatioStatus = (current: number, target: number, isInverse = false) => {
    const threshold = 0.05; // 5% threshold
    if (isInverse) {
      if (current <= target * (1 + threshold)) return 'excellent';
      if (current <= target * (1 + 2 * threshold)) return 'good';
      return 'needs_improvement';
    } else {
      if (current >= target * (1 - threshold)) return 'excellent';
      if (current >= target * (1 - 2 * threshold)) return 'good';
      return 'needs_improvement';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive financial analysis and performance reports for Ghana OMC operations
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <select 
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Export Financial Statements
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Generate Audit Report
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
            <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Report Type</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="comprehensive">Comprehensive Report</option>
                  <option value="income_statement">Income Statement</option>
                  <option value="balance_sheet">Balance Sheet</option>
                  <option value="cash_flow">Cash Flow Statement</option>
                  <option value="ratios">Financial Ratios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Financial Year</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Currency</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="GHS">Ghana Cedi (₵)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors"
                >
                  Generate Report
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    {getChangeIcon(12.5)}
                    <span className="text-xs ml-1 text-green-600">+12.5% YoY</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.netProfit)}</p>
                  <div className="flex items-center mt-1">
                    {getChangeIcon(15.8)}
                    <span className="text-xs ml-1 text-green-600">+15.8% YoY</span>
                  </div>
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
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Margin</p>
                  <p className="text-2xl font-bold text-purple-600">{financialMetrics.grossMargin}%</p>
                  <div className="flex items-center mt-1">
                    {getChangeIcon(1.29)}
                    <span className="text-xs ml-1 text-green-600">+1.29%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ROE</p>
                  <p className="text-2xl font-bold text-orange-600">{financialMetrics.roe}%</p>
                  <div className="flex items-center mt-1">
                    {getChangeIcon(2.11)}
                    <span className="text-xs ml-1 text-green-600">+2.11%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
              <h3 className="text-lg font-semibold mb-4">Revenue vs Net Profit Trend</h3>
              <LineChart data={revenueProfitData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cost Structure Analysis</h3>
              <PieChart data={costBreakdownData} height={300} />
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
              <BarChart data={cashFlowData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Ratios Comparison</h3>
              <BarChart data={ratiosData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Income Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Income Statement Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Item</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Q1 2024</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Q2 2024</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Q3 2024</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Q4 2024</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Q1 2025</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeStatementData.map((item, index) => (
                    <motion.tr
                      key={item.item}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{item.item}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(item.q1_2024)}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(item.q2_2024)}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(item.q3_2024)}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(item.q4_2024)}</td>
                      <td className="py-4 px-4 text-right font-bold">{formatCurrency(item.q1_2025)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end">
                          {getChangeIcon(item.change)}
                          <span className={`ml-1 font-medium ${getChangeColor(item.change)}`}>
                            +{item.change}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Balance Sheet Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Balance Sheet Summary</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {balanceSheetData.map((section, sectionIndex) => (
                <div key={section.category}>
                  <h4 className="text-md font-semibold mb-4 text-primary-600">{section.category}</h4>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="font-medium">{item.item}</span>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.amount)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.percentage}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Key Financial Ratios Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Financial Ratios Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ratio</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Previous</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Industry Avg</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Target</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keyRatiosData.map((ratio, index) => {
                    const status = getRatioStatus(ratio.current, ratio.target, ratio.ratio === 'Debt-to-Equity');
                    return (
                      <motion.tr
                        key={ratio.ratio}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium">{ratio.ratio}</td>
                        <td className="py-4 px-4 text-center font-bold">{ratio.current.toFixed(2)}%</td>
                        <td className="py-4 px-4 text-center">{ratio.previous.toFixed(2)}%</td>
                        <td className="py-4 px-4 text-center">{ratio.industry.toFixed(2)}%</td>
                        <td className="py-4 px-4 text-center">{ratio.target.toFixed(2)}%</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.replace('_', ' ')}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default FinancialReports;