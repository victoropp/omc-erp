import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const IFRSDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');

  // IFRS Compliance Metrics
  const complianceMetrics = {
    overallComplianceRate: 94.2,
    totalRevenueRecognized: 158742693.50,
    pendingRevenueRecognition: 12847593.25,
    automaticJournalEntries: 1247,
    manualAdjustments: 23,
    totalCompliantTransactions: 15643,
    nonCompliantTransactions: 97,
    auditTrailEntries: 24587,
    ifrs15Compliance: 96.8,
    ifrs9Compliance: 92.3,
    ifrs16Compliance: 98.1,
    expectedCreditLoss: 2847593.75,
    leaseObligations: 15847293.25
  };

  // Recent Compliance Issues
  const complianceIssues = [
    {
      id: 'IFRS-2025-001',
      standard: 'IFRS 15',
      severity: 'HIGH',
      description: 'Revenue recognition timing discrepancy for bulk fuel contracts',
      amount: 847593.50,
      status: 'Under Review',
      date: '2025-01-10',
      automatedCorrection: false
    },
    {
      id: 'IFRS-2025-002',
      standard: 'IFRS 9',
      severity: 'MEDIUM',
      description: 'Expected credit loss calculation needs manual adjustment',
      amount: 125847.25,
      status: 'Pending Approval',
      date: '2025-01-09',
      automatedCorrection: true
    },
    {
      id: 'IFRS-2025-003',
      standard: 'IFRS 16',
      severity: 'LOW',
      description: 'Lease payment classification requires verification',
      amount: 45230.75,
      status: 'Auto-Corrected',
      date: '2025-01-08',
      automatedCorrection: true
    }
  ];

  // Revenue Recognition Status
  const revenueRecognitionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Point in Time Recognition',
        data: [12500000, 13200000, 14800000, 13900000, 15200000, 16100000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Over Time Recognition',
        data: [8500000, 9200000, 8900000, 9700000, 10100000, 10800000],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Compliance Trends
  const complianceTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Compliance Rate %',
      data: [92.5, 94.1, 93.8, 94.2],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    }]
  };

  // Automated Journal Entries by Standard
  const journalEntriesData = {
    labels: ['IFRS 15', 'IFRS 9', 'IFRS 16', 'IAS 2', 'IAS 36', 'Others'],
    datasets: [{
      data: [45, 25, 15, 8, 5, 2],
      backgroundColor: [
        '#3B82F6',
        '#10B981', 
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
        '#6B7280'
      ]
    }]
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Auto-Corrected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Under Review':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Pending Approval':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <FuturisticDashboardLayout 
      title="IFRS Compliance Dashboard" 
      subtitle="International Financial Reporting Standards Automation & Monitoring"
    >
      <div className="space-y-6">
        {/* Period Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Reporting Period:
            </label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="2025-01">January 2025</option>
              <option value="2024-12">December 2024</option>
              <option value="2024-11">November 2024</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Real-time Compliance Monitoring Active
            </span>
          </div>
        </div>

        {/* Key Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overall Compliance
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {complianceMetrics.overallComplianceRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Target: 95% | Trend: ↗ +1.4%
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenue Recognized
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(complianceMetrics.totalRevenueRecognized)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                IFRS 15 Compliant: {complianceMetrics.ifrs15Compliance}%
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Auto Journal Entries
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {complianceMetrics.automaticJournalEntries}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Manual Adjustments: {complianceMetrics.manualAdjustments}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Audit Trail Entries
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {complianceMetrics.auditTrailEntries}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                100% Traceable & Verified
              </div>
            </Card>
          </motion.div>
        </div>

        {/* IFRS Standards Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                IFRS Standards Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">IFRS 15</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Recognition</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{complianceMetrics.ifrs15Compliance}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: `${complianceMetrics.ifrs15Compliance}%`}}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">IFRS 9</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Financial Instruments</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600">{complianceMetrics.ifrs9Compliance}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-yellow-500 rounded-full" style={{width: `${complianceMetrics.ifrs9Compliance}%`}}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">IFRS 16</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leases</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{complianceMetrics.ifrs16Compliance}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: `${complianceMetrics.ifrs16Compliance}%`}}></div>
                    </div>
                  </div>
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
              <h3 className="text-lg font-semibold mb-4">Revenue Recognition Trends</h3>
              <LineChart data={revenueRecognitionData} height={200} />
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Point in Time</div>
                  <div className="text-lg font-bold text-blue-600">₵92.7M</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Over Time</div>
                  <div className="text-lg font-bold text-green-600">₵58.2M</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Automated Journal Distribution</h3>
              <PieChart data={journalEntriesData} height={200} />
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total This Period</div>
                <div className="text-2xl font-bold text-purple-600">{complianceMetrics.automaticJournalEntries}</div>
                <div className="text-xs text-green-600">98.2% Automated</div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Compliance Issues Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Active Compliance Issues
              </h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Export Report
                </button>
                <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Auto-Fix Available
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Issue ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standard</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Auto-Fix</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceIssues.map((issue, index) => (
                    <motion.tr
                      key={issue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-blue-600">{issue.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {issue.standard}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate" title={issue.description}>
                          {issue.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(issue.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {issue.automatedCorrection ? (
                          <span className="text-green-600 text-xs">
                            <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Manual</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{issue.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Compliance Trend & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Compliance Trend</h3>
              <LineChart data={complianceTrendData} height={200} />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current</div>
                  <div className="text-lg font-bold text-green-600">94.2%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Target</div>
                  <div className="text-lg font-bold text-blue-600">95.0%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Trend</div>
                  <div className="text-lg font-bold text-green-600">+1.4%</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <div className="font-medium text-blue-600">Generate IFRS Compliance Report</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Export detailed compliance analysis</div>
                </button>
                <button className="w-full p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <div className="font-medium text-green-600">Run Automated Corrections</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Fix {complianceIssues.filter(i => i.automatedCorrection).length} auto-correctable issues</div>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <div className="font-medium text-purple-600">Schedule Audit Trail Export</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Export {complianceMetrics.auditTrailEntries} audit entries</div>
                </button>
                <button className="w-full p-3 text-left bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                  <div className="font-medium text-orange-600">Review Manual Adjustments</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{complianceMetrics.manualAdjustments} adjustments need review</div>
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default IFRSDashboard;