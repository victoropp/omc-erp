import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';

const RegulatoryReports = () => {
  const [selectedReportType, setSelectedReportType] = useState('npa_monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [submissionStatus, setSubmissionStatus] = useState('all');

  // Regulatory compliance metrics
  const complianceMetrics = {
    npaComplianceRate: 98.7,
    epaComplianceRate: 96.5,
    gsdComplianceRate: 99.2,
    uppfSubmissionsCompleted: 45,
    uppfSubmissionsPending: 3,
    totalReportsSubmitted: 156,
    overduereports: 2,
    auditScore: 94.8,
    violationsCount: 1,
    correctiveActionsOpen: 3,
    regulatoryFines: 0,
    licenseRenewalsDue: 2
  };

  // NPA reporting compliance data
  const npaComplianceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Submissions on Time (%)',
        data: [100, 95, 98, 100, 97, 100, 98, 100, 96, 99, 100, 98],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Data Accuracy (%)',
        data: [98, 97, 99, 98, 99, 97, 99, 100, 98, 99, 97, 99],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Regulatory body compliance breakdown
  const regulatoryBodyData = {
    labels: ['NPA Reports', 'EPA Submissions', 'GSD Compliance', 'Tax Authority', 'Bank of Ghana', 'Other'],
    datasets: [{
      data: [35, 25, 20, 12, 5, 3],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }]
  };

  // UPPF claims processing timeline
  const uppfProcessingData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Claims Submitted',
        data: [12, 15, 18, 14],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6'
      },
      {
        label: 'Claims Approved',
        data: [10, 14, 16, 13],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981'
      },
      {
        label: 'Claims Settled',
        data: [8, 12, 14, 11],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8B5CF6'
      }
    ]
  };

  // Regulatory reports schedule
  const reportingSchedule = [
    {
      report: 'NPA Monthly Sales Report',
      regulatoryBody: 'National Petroleum Authority',
      frequency: 'Monthly',
      nextDueDate: '2025-02-05',
      status: 'pending',
      lastSubmitted: '2025-01-05',
      completionRate: 100,
      priority: 'high'
    },
    {
      report: 'UPPF Claims Summary',
      regulatoryBody: 'National Petroleum Authority',
      frequency: 'Weekly',
      nextDueDate: '2025-01-20',
      status: 'submitted',
      lastSubmitted: '2025-01-13',
      completionRate: 100,
      priority: 'high'
    },
    {
      report: 'EPA Environmental Impact',
      regulatoryBody: 'Environmental Protection Agency',
      frequency: 'Quarterly',
      nextDueDate: '2025-04-01',
      status: 'in_progress',
      lastSubmitted: '2024-10-01',
      completionRate: 75,
      priority: 'medium'
    },
    {
      report: 'GSD Standards Compliance',
      regulatoryBody: 'Ghana Standards Authority',
      frequency: 'Bi-Annual',
      nextDueDate: '2025-07-01',
      status: 'upcoming',
      lastSubmitted: '2024-07-01',
      completionRate: 100,
      priority: 'medium'
    },
    {
      report: 'VAT Returns',
      regulatoryBody: 'Ghana Revenue Authority',
      frequency: 'Monthly',
      nextDueDate: '2025-02-15',
      status: 'overdue',
      lastSubmitted: '2024-12-15',
      completionRate: 95,
      priority: 'critical'
    }
  ];

  // License and permit tracking
  const licensesPermits = [
    {
      type: 'Petroleum Retail License',
      authority: 'National Petroleum Authority',
      currentExpiry: '2025-12-31',
      renewalDue: '2025-10-31',
      status: 'active',
      stations: ['Accra Central', 'Kumasi Highway', 'Takoradi Port'],
      cost: 50000.00
    },
    {
      type: 'Environmental Permit',
      authority: 'Environmental Protection Agency',
      currentExpiry: '2026-06-30',
      renewalDue: '2026-04-30',
      status: 'active',
      stations: ['All Stations'],
      cost: 25000.00
    },
    {
      type: 'Fire Safety Certificate',
      authority: 'Ghana National Fire Service',
      currentExpiry: '2025-03-31',
      renewalDue: '2025-01-31',
      status: 'renewal_due',
      stations: ['Tamale North'],
      cost: 5000.00
    },
    {
      type: 'Business Operating Permit',
      authority: 'Local Assembly',
      currentExpiry: '2025-08-15',
      renewalDue: '2025-06-15',
      status: 'active',
      stations: ['Cape Coast Station'],
      cost: 8000.00
    }
  ];

  // Compliance issues and corrective actions
  const complianceIssues = [
    {
      issue: 'Fuel Quality Test Results Below Standard',
      severity: 'high',
      regulatoryBody: 'Ghana Standards Authority',
      station: 'Ho Station',
      dateIdentified: '2025-01-08',
      dueDate: '2025-01-22',
      status: 'in_progress',
      correctiveAction: 'Replace fuel batch and implement enhanced quality control',
      assignedTo: 'Quality Control Manager',
      estimatedCost: 15000.00
    },
    {
      issue: 'Late UPPF Claim Submission',
      severity: 'medium',
      regulatoryBody: 'National Petroleum Authority',
      station: 'Kumasi Highway',
      dateIdentified: '2025-01-05',
      dueDate: '2025-01-15',
      status: 'resolved',
      correctiveAction: 'Updated submission process and staff training',
      assignedTo: 'Operations Manager',
      estimatedCost: 2000.00
    },
    {
      issue: 'Fire Safety Equipment Calibration Overdue',
      severity: 'medium',
      regulatoryBody: 'Ghana National Fire Service',
      station: 'Tamale North',
      dateIdentified: '2024-12-20',
      dueDate: '2025-01-30',
      status: 'open',
      correctiveAction: 'Schedule professional calibration service',
      assignedTo: 'Maintenance Team',
      estimatedCost: 3500.00
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount).replace('GHS', '₵');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'renewal_due': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'upcoming': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getComplianceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
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
              Regulatory Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive regulatory compliance tracking and reporting for Ghana petroleum industry
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <select 
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="current">Current Period</option>
              <option value="previous">Previous Period</option>
              <option value="ytd">Year to Date</option>
              <option value="custom">Custom Range</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Submit to NPA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Export Compliance Report
            </motion.button>
          </div>
        </motion.div>

        {/* Alert for Overdue Reports */}
        {complianceMetrics.overduereports > 0 && (
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
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Urgent: Overdue Regulatory Reports</h3>
                    <p className="text-red-700 dark:text-red-300">
                      {complianceMetrics.overduereports} regulatory reports are overdue and require immediate attention
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  View Overdue
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Report Type</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                >
                  <option value="npa_monthly">NPA Monthly Report</option>
                  <option value="uppf_claims">UPPF Claims Report</option>
                  <option value="epa_environmental">EPA Environmental Report</option>
                  <option value="gsd_compliance">GSD Compliance Report</option>
                  <option value="tax_returns">Tax Returns</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Compliance Status</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="compliant">Compliant</option>
                  <option value="pending">Pending Action</option>
                  <option value="overdue">Overdue</option>
                  <option value="non_compliant">Non-Compliant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Submission Status</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={submissionStatus}
                  onChange={(e) => setSubmissionStatus(e.target.value)}
                >
                  <option value="all">All Submissions</option>
                  <option value="submitted">Submitted</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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

        {/* Key Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NPA Compliance</p>
                  <p className={`text-3xl font-bold ${getComplianceRateColor(complianceMetrics.npaComplianceRate)}`}>
                    {complianceMetrics.npaComplianceRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EPA Compliance</p>
                  <p className={`text-3xl font-bold ${getComplianceRateColor(complianceMetrics.epaComplianceRate)}`}>
                    {complianceMetrics.epaComplianceRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">UPPF Submissions</p>
                  <p className="text-3xl font-bold text-purple-600">{complianceMetrics.uppfSubmissionsCompleted}</p>
                  <p className="text-xs text-orange-600 mt-1">{complianceMetrics.uppfSubmissionsPending} pending</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit Score</p>
                  <p className="text-3xl font-bold text-orange-600">{complianceMetrics.auditScore}%</p>
                  <p className="text-xs text-red-600 mt-1">{complianceMetrics.violationsCount} violations</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
              <h3 className="text-lg font-semibold mb-4">NPA Compliance Trends</h3>
              <LineChart data={npaComplianceData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Regulatory Body Reports Distribution</h3>
              <PieChart data={regulatoryBodyData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* UPPF Processing Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">UPPF Claims Processing Timeline</h3>
            <BarChart data={uppfProcessingData} height={400} />
          </Card>
        </motion.div>

        {/* Regulatory Reporting Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Regulatory Reporting Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Report</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Regulatory Body</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Completion</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportingSchedule.map((report, index) => (
                    <motion.tr
                      key={report.report}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{report.report}</td>
                      <td className="py-4 px-4 text-sm">{report.regulatoryBody}</td>
                      <td className="py-4 px-4">{report.frequency}</td>
                      <td className="py-4 px-4">
                        <span className={new Date(report.nextDueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {new Date(report.nextDueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${report.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{report.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(report.priority)}
                          <span className="text-sm capitalize">{report.priority}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Report"
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
                            title="Submit Report"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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

        {/* Licenses and Permits Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Licenses and Permits Tracking</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">License/Permit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Authority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Expiry Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Renewal Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {licensesPermits.map((license, index) => (
                    <motion.tr
                      key={license.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">{license.type}</td>
                      <td className="py-4 px-4 text-sm">{license.authority}</td>
                      <td className="py-4 px-4">
                        {new Date(license.currentExpiry).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={new Date(license.renewalDue) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {new Date(license.renewalDue).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                          {license.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium">{formatCurrency(license.cost)}</td>
                      <td className="py-4 px-4 text-sm">
                        {Array.isArray(license.stations) ? license.stations.slice(0, 2).join(', ') : license.stations}
                        {Array.isArray(license.stations) && license.stations.length > 2 && ` +${license.stations.length - 2} more`}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Compliance Issues and Corrective Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Issues and Corrective Actions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Issue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Station</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Est. Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceIssues.map((issue, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{issue.issue}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{issue.correctiveAction}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">{issue.station}</td>
                      <td className="py-4 px-4">
                        <span className={new Date(issue.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">{issue.assignedTo}</td>
                      <td className="py-4 px-4 font-medium">{formatCurrency(issue.estimatedCost)}</td>
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
                            title="Update Status"
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

export default RegulatoryReports;