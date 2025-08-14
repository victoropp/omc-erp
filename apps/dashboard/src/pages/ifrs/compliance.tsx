import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { regulatoryService, complianceService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface ComplianceMetric {
  id: string;
  standard: string;
  standardName: string;
  complianceRate: number;
  target: number;
  status: 'compliant' | 'non-compliant' | 'warning' | 'under-review';
  lastAssessment: string;
  nextAssessment: string;
  criticalIssues: number;
  automationLevel: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComplianceRule {
  id: string;
  standard: string;
  ruleCode: string;
  description: string;
  automatedCheck: boolean;
  lastChecked: string;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  exceptions: number;
  remediation: string;
}

interface AuditTrail {
  id: string;
  timestamp: string;
  standard: string;
  action: 'assessment' | 'correction' | 'exception' | 'approval';
  user: string;
  description: string;
  beforeValue: any;
  afterValue: any;
  automated: boolean;
}

interface ControlFramework {
  id: string;
  controlName: string;
  category: 'preventive' | 'detective' | 'corrective';
  standards: string[];
  effectiveness: number;
  lastTested: string;
  deficiencies: string[];
  status: 'effective' | 'deficient' | 'not-tested';
}

const CompliancePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [controlFramework, setControlFramework] = useState<ControlFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data - replace with actual API calls
  const sampleMetricsData: ComplianceMetric[] = [
    {
      id: 'IFRS-15',
      standard: 'IFRS-15',
      standardName: 'Revenue from Contracts with Customers',
      complianceRate: 96.8,
      target: 95.0,
      status: 'compliant',
      lastAssessment: '2025-01-15',
      nextAssessment: '2025-02-15',
      criticalIssues: 0,
      automationLevel: 92,
      riskLevel: 'low'
    },
    {
      id: 'IFRS-9',
      standard: 'IFRS-9',
      standardName: 'Financial Instruments',
      complianceRate: 92.3,
      target: 95.0,
      status: 'warning',
      lastAssessment: '2025-01-12',
      nextAssessment: '2025-02-12',
      criticalIssues: 2,
      automationLevel: 85,
      riskLevel: 'medium'
    },
    {
      id: 'IFRS-16',
      standard: 'IFRS-16',
      standardName: 'Leases',
      complianceRate: 98.1,
      target: 95.0,
      status: 'compliant',
      lastAssessment: '2025-01-10',
      nextAssessment: '2025-02-10',
      criticalIssues: 0,
      automationLevel: 95,
      riskLevel: 'low'
    },
    {
      id: 'IAS-36',
      standard: 'IAS-36',
      standardName: 'Impairment of Assets',
      complianceRate: 89.5,
      target: 90.0,
      status: 'non-compliant',
      lastAssessment: '2025-01-08',
      nextAssessment: '2025-02-08',
      criticalIssues: 3,
      automationLevel: 78,
      riskLevel: 'high'
    },
    {
      id: 'IAS-2',
      standard: 'IAS-2',
      standardName: 'Inventories',
      complianceRate: 94.2,
      target: 92.0,
      status: 'compliant',
      lastAssessment: '2025-01-14',
      nextAssessment: '2025-02-14',
      criticalIssues: 1,
      automationLevel: 88,
      riskLevel: 'low'
    }
  ];

  const sampleRulesData: ComplianceRule[] = [
    {
      id: 'IFRS15-001',
      standard: 'IFRS-15',
      ruleCode: 'REV-001',
      description: 'Revenue recognition must occur at point of transfer of control',
      automatedCheck: true,
      lastChecked: '2025-01-15',
      status: 'pass',
      exceptions: 0,
      remediation: 'N/A - Compliant'
    },
    {
      id: 'IFRS9-001',
      standard: 'IFRS-9',
      ruleCode: 'ECL-001',
      description: 'Expected Credit Loss calculation methodology must be consistent',
      automatedCheck: true,
      lastChecked: '2025-01-14',
      status: 'warning',
      exceptions: 2,
      remediation: 'Review calculation parameters for consistency'
    },
    {
      id: 'IAS36-001',
      standard: 'IAS-36',
      ruleCode: 'IMP-001',
      description: 'Impairment testing required when indicators present',
      automatedCheck: false,
      lastChecked: '2025-01-10',
      status: 'fail',
      exceptions: 3,
      remediation: 'Conduct impairment tests for flagged assets'
    }
  ];

  const sampleAuditData: AuditTrail[] = [
    {
      id: 'AUDIT-001',
      timestamp: '2025-01-15T10:30:00Z',
      standard: 'IFRS-15',
      action: 'correction',
      user: 'System Automation',
      description: 'Automated revenue recognition adjustment',
      beforeValue: { amount: 125000, timing: 'immediate' },
      afterValue: { amount: 125000, timing: 'over-time' },
      automated: true
    },
    {
      id: 'AUDIT-002',
      timestamp: '2025-01-14T15:45:00Z',
      standard: 'IFRS-9',
      action: 'exception',
      user: 'Jane Smith (CFO)',
      description: 'Manual override of ECL calculation',
      beforeValue: { ecl: 250000 },
      afterValue: { ecl: 275000 },
      automated: false
    },
    {
      id: 'AUDIT-003',
      timestamp: '2025-01-12T09:15:00Z',
      standard: 'IAS-36',
      action: 'assessment',
      user: 'External Auditor',
      description: 'Annual impairment assessment completed',
      beforeValue: null,
      afterValue: { status: 'completed', findings: 3 },
      automated: false
    }
  ];

  const sampleControlsData: ControlFramework[] = [
    {
      id: 'CTRL-001',
      controlName: 'Automated Revenue Recognition',
      category: 'preventive',
      standards: ['IFRS-15'],
      effectiveness: 95,
      lastTested: '2025-01-10',
      deficiencies: [],
      status: 'effective'
    },
    {
      id: 'CTRL-002',
      controlName: 'Three-way Reconciliation',
      category: 'detective',
      standards: ['IFRS-9', 'IAS-2'],
      effectiveness: 88,
      lastTested: '2025-01-08',
      deficiencies: ['Manual intervention required for complex transactions'],
      status: 'deficient'
    },
    {
      id: 'CTRL-003',
      controlName: 'Impairment Indicator Monitoring',
      category: 'detective',
      standards: ['IAS-36'],
      effectiveness: 75,
      lastTested: '2025-01-05',
      deficiencies: ['Limited automation', 'Requires manual review'],
      status: 'deficient'
    }
  ];

  useEffect(() => {
    loadComplianceData();
  }, [selectedPeriod]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      // const [metrics, rules, audit, controls] = await Promise.all([
      //   regulatoryService.get('/ifrs/compliance-metrics'),
      //   complianceService.getRules(),
      //   complianceService.getAuditTrail(),
      //   complianceService.getControlFramework()
      // ]);
      
      setComplianceMetrics(sampleMetricsData);
      setComplianceRules(sampleRulesData);
      setAuditTrail(sampleAuditData);
      setControlFramework(sampleControlsData);
    } catch (error) {
      toast.error('Failed to load compliance data');
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallComplianceRate = complianceMetrics.reduce((sum, metric) => sum + metric.complianceRate, 0) / complianceMetrics.length;
  const criticalIssues = complianceMetrics.reduce((sum, metric) => sum + metric.criticalIssues, 0);
  const automationRate = complianceMetrics.reduce((sum, metric) => sum + metric.automationLevel, 0) / complianceMetrics.length;
  const highRiskStandards = complianceMetrics.filter(m => m.riskLevel === 'high').length;

  // Chart data
  const complianceByStandard = {
    labels: complianceMetrics.map(m => m.standard),
    datasets: [{
      label: 'Compliance Rate (%)',
      data: complianceMetrics.map(m => m.complianceRate),
      backgroundColor: complianceMetrics.map(m => 
        m.status === 'compliant' ? '#10B981' :
        m.status === 'warning' ? '#F59E0B' : '#EF4444'
      ),
      borderColor: '#374151',
      borderWidth: 1
    }]
  };

  const riskDistribution = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [
        complianceMetrics.filter(m => m.riskLevel === 'low').length,
        complianceMetrics.filter(m => m.riskLevel === 'medium').length,
        complianceMetrics.filter(m => m.riskLevel === 'high').length
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
    }]
  };

  const complianceTrend = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb (Proj)'],
    datasets: [{
      label: 'Overall Compliance Rate',
      data: [92.1, 93.5, 92.8, 94.2, 95.0],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'non-compliant':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleRunComplianceCheck = async () => {
    try {
      // await complianceService.runComplianceCheck();
      toast.success('Compliance check initiated');
      loadComplianceData();
    } catch (error) {
      toast.error('Failed to run compliance check');
    }
  };

  const handleGenerateReport = async () => {
    try {
      // await regulatoryService.generateComplianceReport();
      toast.success('Compliance report generated');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  return (
    <FuturisticDashboardLayout
      title="IFRS Compliance Dashboard"
      subtitle="Comprehensive Compliance Monitoring & Risk Management"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="2025-01">January 2025</option>
              <option value="2024-12">December 2024</option>
              <option value="2024-11">November 2024</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${overallComplianceRate >= 95 ? 'bg-green-500' : overallComplianceRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Compliance Status: {overallComplianceRate >= 95 ? 'Excellent' : overallComplianceRate >= 90 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRunComplianceCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Run Compliance Check
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Generate Report
            </button>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overall Compliance
                  </p>
                  <p className={`text-3xl font-bold ${overallComplianceRate >= 95 ? 'text-green-600' : overallComplianceRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercentage(overallComplianceRate)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${overallComplianceRate >= 95 ? 'bg-green-100 dark:bg-green-900' : overallComplianceRate >= 90 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${overallComplianceRate >= 95 ? 'text-green-600' : overallComplianceRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Target: 95% | Standards: {complianceMetrics.length}
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
                    Critical Issues
                  </p>
                  <p className={`text-3xl font-bold ${criticalIssues === 0 ? 'text-green-600' : criticalIssues <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {criticalIssues}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${criticalIssues === 0 ? 'bg-green-100 dark:bg-green-900' : criticalIssues <= 2 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${criticalIssues === 0 ? 'text-green-600' : criticalIssues <= 2 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Require Immediate Attention
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
                    Automation Level
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatPercentage(automationRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Automated Compliance Checks
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
                    High Risk Standards
                  </p>
                  <p className={`text-3xl font-bold ${highRiskStandards === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {highRiskStandards}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${highRiskStandards === 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${highRiskStandards === 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Requiring Priority Review
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'standards', label: 'IFRS Standards' },
              { id: 'rules', label: 'Compliance Rules' },
              { id: 'controls', label: 'Control Framework' },
              { id: 'audit', label: 'Audit Trail' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <CardHeader title="Compliance by Standard" />
                <BarChart data={complianceByStandard} height={250} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <CardHeader title="Risk Distribution" />
                <PieChart data={riskDistribution} height={250} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Standards Monitored</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceMetrics.length}
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
                <CardHeader title="Compliance Trend" />
                <LineChart data={complianceTrend} height={250} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Target</div>
                  <div className="text-2xl font-bold text-green-600">95.0%</div>
                  <div className="text-xs text-green-600">↗ +1.8% from last month</div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {selectedTab === 'standards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="IFRS Standards Compliance Status" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standard</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Compliance Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Critical Issues</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Automation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk Level</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceMetrics.map((metric, index) => (
                      <motion.tr
                        key={metric.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-blue-600">{metric.standard}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={metric.standardName}>
                          {metric.standardName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`font-bold ${metric.complianceRate >= metric.target ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(metric.complianceRate)}
                            </span>
                            <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${metric.complianceRate >= metric.target ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{width: `${metric.complianceRate}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatPercentage(metric.target)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                            {metric.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${metric.criticalIssues === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.criticalIssues}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-purple-600 font-medium">
                            {formatPercentage(metric.automationLevel)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${getRiskColor(metric.riskLevel)}`}>
                            {metric.riskLevel.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(metric.nextAssessment).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'rules' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Compliance Rules Status" />
              <div className="space-y-4">
                {complianceRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {rule.standard}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {rule.ruleCode}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {rule.automatedCheck && (
                          <span className="text-green-600 text-xs">
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Automated
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Last checked: {new Date(rule.lastChecked).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {rule.description}
                    </h4>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Exceptions: </span>
                        <span className={`font-medium ${rule.exceptions === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rule.exceptions}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Remediation: {rule.remediation}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'controls' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Internal Control Framework" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Control Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standards</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Effectiveness</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Tested</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Deficiencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlFramework.map((control, index) => (
                      <motion.tr
                        key={control.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{control.controlName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            control.category === 'preventive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            control.category === 'detective' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {control.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {control.standards.map((standard) => (
                              <span key={standard} className="px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {standard}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`font-bold ${control.effectiveness >= 90 ? 'text-green-600' : control.effectiveness >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {formatPercentage(control.effectiveness)}
                            </span>
                            <div className="ml-2 w-12 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${control.effectiveness >= 90 ? 'bg-green-500' : control.effectiveness >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{width: `${control.effectiveness}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(control.lastTested).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}>
                            {control.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {control.deficiencies.length === 0 ? (
                            <span className="text-green-600">None</span>
                          ) : (
                            <div className="max-w-xs">
                              {control.deficiencies.map((deficiency, i) => (
                                <div key={i} className="text-red-600 text-xs truncate" title={deficiency}>
                                  • {deficiency}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Compliance Audit Trail" />
              <div className="space-y-4">
                {auditTrail.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {entry.standard}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.action === 'correction' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          entry.action === 'exception' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          entry.action === 'assessment' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {entry.action}
                        </span>
                        {entry.automated && (
                          <span className="text-green-600 text-xs">
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Automated
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {entry.description}
                    </h4>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">User:</span> {entry.user}
                    </div>
                    
                    {entry.beforeValue && entry.afterValue && (
                      <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Before:</span>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">
                            {JSON.stringify(entry.beforeValue, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">After:</span>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">
                            {JSON.stringify(entry.afterValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default CompliancePage;