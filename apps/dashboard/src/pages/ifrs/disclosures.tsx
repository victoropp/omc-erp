import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { regulatoryService, financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface DisclosureRequirement {
  id: string;
  standard: string;
  section: string;
  requirementCode: string;
  title: string;
  description: string;
  category: 'quantitative' | 'qualitative' | 'tabular' | 'narrative';
  mandatory: boolean;
  applicableConditions: string[];
  status: 'complete' | 'incomplete' | 'not-applicable' | 'under-review';
  lastUpdated: string;
  reviewDue: string;
  automationStatus: 'fully-automated' | 'partially-automated' | 'manual';
  dataSource: string;
}

interface DisclosureNote {
  id: string;
  noteNumber: string;
  title: string;
  standard: string;
  category: string;
  content: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
  status: 'draft' | 'under-review' | 'approved' | 'published';
  wordCount: number;
  completeness: number;
  linkedRequirements: string[];
  attachments: string[];
}

interface DisclosureChecklist {
  id: string;
  reportingPeriod: string;
  totalRequirements: number;
  completedRequirements: number;
  mandatoryRequirements: number;
  completedMandatory: number;
  overallCompleteness: number;
  lastUpdated: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewer: string;
  issues: string[];
}

interface QualitativeAssessment {
  id: string;
  aspectName: string;
  category: 'clarity' | 'completeness' | 'consistency' | 'relevance' | 'accuracy';
  score: number;
  maxScore: number;
  feedback: string;
  assessmentDate: string;
  assessor: string;
  improvementSuggestions: string[];
}

const DisclosuresPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [disclosureRequirements, setDisclosureRequirements] = useState<DisclosureRequirement[]>([]);
  const [disclosureNotes, setDisclosureNotes] = useState<DisclosureNote[]>([]);
  const [disclosureChecklist, setDisclosureChecklist] = useState<DisclosureChecklist | null>(null);
  const [qualitativeAssessments, setQualitativeAssessments] = useState<QualitativeAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data - replace with actual API calls
  const sampleRequirementsData: DisclosureRequirement[] = [
    {
      id: 'REQ-001',
      standard: 'IFRS-15',
      section: '114',
      requirementCode: 'IFRS15.114',
      title: 'Revenue from contracts with customers - General disclosure',
      description: 'Entity shall disclose sufficient information to enable users to understand the nature, amount, timing and uncertainty of revenue and cash flows.',
      category: 'narrative',
      mandatory: true,
      applicableConditions: ['Has customer contracts'],
      status: 'complete',
      lastUpdated: '2025-01-15',
      reviewDue: '2025-02-15',
      automationStatus: 'partially-automated',
      dataSource: 'Revenue Recognition System'
    },
    {
      id: 'REQ-002',
      standard: 'IFRS-9',
      section: '42G',
      requirementCode: 'IFRS9.42G',
      title: 'Expected credit losses - Credit risk exposure',
      description: 'Entity shall explain how it determined the loss allowance and provide quantitative and qualitative information about credit risk.',
      category: 'quantitative',
      mandatory: true,
      applicableConditions: ['Has financial assets subject to ECL'],
      status: 'under-review',
      lastUpdated: '2025-01-12',
      reviewDue: '2025-01-20',
      automationStatus: 'partially-automated',
      dataSource: 'Credit Risk System'
    },
    {
      id: 'REQ-003',
      standard: 'IFRS-16',
      section: '58',
      requirementCode: 'IFRS16.58',
      title: 'Leases - Lessee disclosure table',
      description: 'Lessee shall provide maturity analysis of lease liabilities showing undiscounted cash flows.',
      category: 'tabular',
      mandatory: true,
      applicableConditions: ['Has lease arrangements'],
      status: 'complete',
      lastUpdated: '2025-01-14',
      reviewDue: '2025-02-14',
      automationStatus: 'fully-automated',
      dataSource: 'Lease Management System'
    },
    {
      id: 'REQ-004',
      standard: 'IAS-36',
      section: '134',
      requirementCode: 'IAS36.134',
      title: 'Impairment - Key assumptions for CGU recoverable amount',
      description: 'Entity shall disclose key assumptions used to determine recoverable amount of cash-generating units containing goodwill.',
      category: 'qualitative',
      mandatory: false,
      applicableConditions: ['Has goodwill', 'Impairment test performed'],
      status: 'incomplete',
      lastUpdated: '2025-01-08',
      reviewDue: '2025-01-25',
      automationStatus: 'manual',
      dataSource: 'Manual Input Required'
    }
  ];

  const sampleNotesData: DisclosureNote[] = [
    {
      id: 'NOTE-001',
      noteNumber: '3.1',
      title: 'Revenue Recognition',
      standard: 'IFRS-15',
      category: 'Revenue',
      content: 'The Group recognizes revenue from contracts with customers when control of goods or services is transferred to the customer...',
      lastModified: '2025-01-15',
      modifiedBy: 'Finance Team',
      version: 3,
      status: 'approved',
      wordCount: 847,
      completeness: 95,
      linkedRequirements: ['REQ-001'],
      attachments: ['revenue_analysis_2025.pdf']
    },
    {
      id: 'NOTE-002',
      noteNumber: '3.2',
      title: 'Expected Credit Losses',
      standard: 'IFRS-9',
      category: 'Financial Instruments',
      content: 'The Group applies the expected credit loss model to trade receivables and contract assets...',
      lastModified: '2025-01-12',
      modifiedBy: 'Risk Management',
      version: 2,
      status: 'under-review',
      wordCount: 623,
      completeness: 78,
      linkedRequirements: ['REQ-002'],
      attachments: ['ecl_methodology.pdf', 'credit_risk_analysis.xlsx']
    },
    {
      id: 'NOTE-003',
      noteNumber: '3.3',
      title: 'Leases',
      standard: 'IFRS-16',
      category: 'Leases',
      content: 'The Group leases various properties, vehicles and equipment under non-cancellable lease agreements...',
      lastModified: '2025-01-14',
      modifiedBy: 'Property Team',
      version: 1,
      status: 'approved',
      wordCount: 1205,
      completeness: 100,
      linkedRequirements: ['REQ-003'],
      attachments: ['lease_schedule.xlsx']
    }
  ];

  const sampleChecklistData: DisclosureChecklist = {
    id: 'CHK-2025-01',
    reportingPeriod: '2025-01',
    totalRequirements: 47,
    completedRequirements: 38,
    mandatoryRequirements: 35,
    completedMandatory: 32,
    overallCompleteness: 80.9,
    lastUpdated: '2025-01-15',
    approvalStatus: 'pending',
    reviewer: 'External Auditor',
    issues: [
      'IAS 36 impairment disclosures incomplete',
      'IFRS 9 credit risk disclosures under review',
      'Revenue contract modifications need additional detail'
    ]
  };

  const sampleQualitativeData: QualitativeAssessment[] = [
    {
      id: 'QA-001',
      aspectName: 'Revenue Recognition Note',
      category: 'clarity',
      score: 4.5,
      maxScore: 5.0,
      feedback: 'Clear explanation of performance obligations and timing',
      assessmentDate: '2025-01-15',
      assessor: 'External Auditor',
      improvementSuggestions: ['Add more specific examples', 'Include judgment areas']
    },
    {
      id: 'QA-002',
      aspectName: 'Credit Risk Disclosures',
      category: 'completeness',
      score: 3.2,
      maxScore: 5.0,
      feedback: 'Missing quantitative analysis of credit concentrations',
      assessmentDate: '2025-01-12',
      assessor: 'Risk Committee',
      improvementSuggestions: ['Add geographic analysis', 'Include aging analysis', 'Provide forward-looking information']
    }
  ];

  useEffect(() => {
    loadDisclosureData();
  }, [selectedPeriod]);

  const loadDisclosureData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      // const [requirements, notes, checklist, assessments] = await Promise.all([
      //   regulatoryService.get('/ifrs/disclosure-requirements'),
      //   financialService.get('/disclosures/notes'),
      //   regulatoryService.get('/ifrs/disclosure-checklist'),
      //   regulatoryService.get('/ifrs/qualitative-assessments')
      // ]);
      
      setDisclosureRequirements(sampleRequirementsData);
      setDisclosureNotes(sampleNotesData);
      setDisclosureChecklist(sampleChecklistData);
      setQualitativeAssessments(sampleQualitativeData);
    } catch (error) {
      toast.error('Failed to load disclosure data');
      console.error('Error loading disclosure data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const completenessRate = disclosureChecklist ? disclosureChecklist.overallCompleteness : 0;
  const mandatoryCompletionRate = disclosureChecklist ? (disclosureChecklist.completedMandatory / disclosureChecklist.mandatoryRequirements) * 100 : 0;
  const automationRate = disclosureRequirements.filter(r => r.automationStatus === 'fully-automated').length / disclosureRequirements.length * 100;
  const avgQualityScore = qualitativeAssessments.reduce((sum, qa) => sum + (qa.score / qa.maxScore), 0) / qualitativeAssessments.length * 100;

  // Chart data
  const requirementsByCategory = {
    labels: ['Quantitative', 'Qualitative', 'Tabular', 'Narrative'],
    datasets: [{
      data: [
        disclosureRequirements.filter(r => r.category === 'quantitative').length,
        disclosureRequirements.filter(r => r.category === 'qualitative').length,
        disclosureRequirements.filter(r => r.category === 'tabular').length,
        disclosureRequirements.filter(r => r.category === 'narrative').length
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
    }]
  };

  const completionStatusData = {
    labels: ['Complete', 'Under Review', 'Incomplete', 'Not Applicable'],
    datasets: [{
      data: [
        disclosureRequirements.filter(r => r.status === 'complete').length,
        disclosureRequirements.filter(r => r.status === 'under-review').length,
        disclosureRequirements.filter(r => r.status === 'incomplete').length,
        disclosureRequirements.filter(r => r.status === 'not-applicable').length
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
    }]
  };

  const qualityTrend = {
    labels: ['Dec 2024', 'Jan 2025', 'Feb 2025 (Proj)', 'Mar 2025 (Proj)', 'Apr 2025 (Proj)'],
    datasets: [{
      label: 'Average Quality Score (%)',
      data: [75, 78, 82, 85, 87],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    }]
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'under-review':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'incomplete':
      case 'draft':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'not-applicable':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'published':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAutomationColor = (automation: string) => {
    switch (automation) {
      case 'fully-automated':
        return 'text-green-600';
      case 'partially-automated':
        return 'text-yellow-600';
      case 'manual':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleGenerateDisclosures = async () => {
    try {
      // await regulatoryService.post('/ifrs/generate-disclosures');
      toast.success('Disclosure notes generated successfully');
      loadDisclosureData();
    } catch (error) {
      toast.error('Failed to generate disclosures');
    }
  };

  const handleValidateDisclosures = async () => {
    try {
      // await regulatoryService.post('/ifrs/validate-disclosures');
      toast.success('Disclosure validation completed');
      loadDisclosureData();
    } catch (error) {
      toast.error('Failed to validate disclosures');
    }
  };

  return (
    <FuturisticDashboardLayout
      title="Financial Disclosures Management"
      subtitle="IFRS Disclosure Requirements & Note Generation"
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
              <div className={`w-3 h-3 rounded-full ${completenessRate >= 90 ? 'bg-green-500' : completenessRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Disclosure Completeness: {formatPercentage(completenessRate)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleValidateDisclosures}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Validate Disclosures
            </button>
            <button
              onClick={handleGenerateDisclosures}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Generate Notes
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
                    Disclosure Completeness
                  </p>
                  <p className={`text-3xl font-bold ${completenessRate >= 90 ? 'text-green-600' : completenessRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercentage(completenessRate)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${completenessRate >= 90 ? 'bg-green-100 dark:bg-green-900' : completenessRate >= 75 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${completenessRate >= 90 ? 'text-green-600' : completenessRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {disclosureChecklist?.completedRequirements} of {disclosureChecklist?.totalRequirements} Requirements
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
                    Mandatory Completion
                  </p>
                  <p className={`text-3xl font-bold ${mandatoryCompletionRate >= 100 ? 'text-green-600' : mandatoryCompletionRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercentage(mandatoryCompletionRate)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${mandatoryCompletionRate >= 100 ? 'bg-green-100 dark:bg-green-900' : mandatoryCompletionRate >= 90 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${mandatoryCompletionRate >= 100 ? 'text-green-600' : mandatoryCompletionRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {disclosureChecklist?.completedMandatory} of {disclosureChecklist?.mandatoryRequirements} Mandatory
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
                    Automation Rate
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
                Fully Automated Disclosures
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
                    Quality Score
                  </p>
                  <p className={`text-3xl font-bold ${avgQualityScore >= 85 ? 'text-green-600' : avgQualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercentage(avgQualityScore)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${avgQualityScore >= 85 ? 'bg-green-100 dark:bg-green-900' : avgQualityScore >= 70 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <svg className={`w-6 h-6 ${avgQualityScore >= 85 ? 'text-green-600' : avgQualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Average Quality Assessment
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'requirements', label: 'Requirements' },
              { id: 'notes', label: 'Disclosure Notes' },
              { id: 'quality', label: 'Quality Assessment' },
              { id: 'checklist', label: 'Checklist' }
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
                <CardHeader title="Requirements by Category" />
                <PieChart data={requirementsByCategory} height={250} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Requirements</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {disclosureRequirements.length}
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
                <CardHeader title="Completion Status" />
                <PieChart data={completionStatusData} height={250} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(completenessRate)}
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
                <CardHeader title="Quality Improvement Trend" />
                <LineChart data={qualityTrend} height={250} />
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Quality</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(avgQualityScore)}
                  </div>
                  <div className="text-xs text-green-600">↗ +3.2% improvement</div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {selectedTab === 'requirements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="IFRS Disclosure Requirements" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standard</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Mandatory</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Automation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Review Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disclosureRequirements.map((req, index) => (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-blue-600">{req.requirementCode}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {req.standard}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={req.title}>
                          {req.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.category === 'quantitative' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            req.category === 'qualitative' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            req.category === 'tabular' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {req.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {req.mandatory ? (
                            <span className="text-red-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium ${getAutomationColor(req.automationStatus)}`}>
                            {req.automationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(req.reviewDue).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'notes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Disclosure Notes" />
              <div className="space-y-4">
                {disclosureNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-blue-600">
                          Note {note.noteNumber}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {note.standard}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                          {note.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Completeness: 
                          <span className={`ml-1 font-medium ${note.completeness >= 90 ? 'text-green-600' : note.completeness >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {note.completeness}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          v{note.version}
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {note.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {note.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div>
                        <span>Words: {note.wordCount} | </span>
                        <span>Modified by: {note.modifiedBy} | </span>
                        <span>{new Date(note.lastModified).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        {note.attachments.map((attachment, i) => (
                          <span key={i} className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            📎 {attachment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'quality' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Qualitative Assessment Results" />
              <div className="space-y-4">
                {qualitativeAssessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {assessment.aspectName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.category === 'clarity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          assessment.category === 'completeness' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          assessment.category === 'consistency' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          assessment.category === 'relevance' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {assessment.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl font-bold">
                          <span className={`${
                            (assessment.score / assessment.maxScore) >= 0.8 ? 'text-green-600' :
                            (assessment.score / assessment.maxScore) >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {assessment.score.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">/{assessment.maxScore}</span>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              (assessment.score / assessment.maxScore) >= 0.8 ? 'bg-green-500' :
                              (assessment.score / assessment.maxScore) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{width: `${(assessment.score / assessment.maxScore) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium">Feedback:</span> {assessment.feedback}
                    </p>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Improvement Suggestions:</span>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {assessment.improvementSuggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Assessed by: {assessment.assessor}</span>
                      <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'checklist' && disclosureChecklist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader 
                title="Disclosure Completion Checklist"
                action={
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(disclosureChecklist.approvalStatus)}`}>
                    {disclosureChecklist.approvalStatus}
                  </span>
                }
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {disclosureChecklist.totalRequirements}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Requirements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {disclosureChecklist.completedRequirements}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {disclosureChecklist.mandatoryRequirements}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mandatory</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(disclosureChecklist.overallCompleteness)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {disclosureChecklist.completedRequirements} / {disclosureChecklist.totalRequirements}
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-4 rounded-full ${
                      disclosureChecklist.overallCompleteness >= 90 ? 'bg-green-500' :
                      disclosureChecklist.overallCompleteness >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{width: `${disclosureChecklist.overallCompleteness}%`}}
                  ></div>
                </div>
              </div>
              
              {disclosureChecklist.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Outstanding Issues</h4>
                  <div className="space-y-2">
                    {disclosureChecklist.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-red-700 dark:text-red-200">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between items-center">
                  <span>Reviewer: {disclosureChecklist.reviewer}</span>
                  <span>Last Updated: {new Date(disclosureChecklist.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DisclosuresPage;