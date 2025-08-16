"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const charts_1 = require("@/components/charts");
const react_hot_toast_1 = require("react-hot-toast");
const ReportingPage = () => {
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('2025-01');
    const [reportTemplates, setReportTemplates] = (0, react_1.useState)([]);
    const [reportGenerations, setReportGenerations] = (0, react_1.useState)([]);
    const [scheduledReports, setScheduledReports] = (0, react_1.useState)([]);
    const [reportMetrics, setReportMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)('overview');
    // Sample data - replace with actual API calls
    const sampleTemplatesData = [
        {
            id: 'TPL-001',
            name: 'IFRS Financial Statements',
            type: 'financial-statements',
            standard: 'IFRS',
            description: 'Complete set of IFRS-compliant financial statements including balance sheet, income statement, cash flow statement, and equity changes.',
            lastUsed: '2025-01-15',
            frequency: 'quarterly',
            status: 'active',
            automation: 'fully-automated',
            sections: 5,
            estimatedTime: 45,
            outputFormats: ['PDF', 'Excel', 'Word']
        },
        {
            id: 'TPL-002',
            name: 'Revenue Recognition Disclosures',
            type: 'disclosure-notes',
            standard: 'IFRS-15',
            description: 'Detailed disclosure notes for revenue recognition including contract assets, liabilities, and performance obligations.',
            lastUsed: '2025-01-12',
            frequency: 'quarterly',
            status: 'active',
            automation: 'semi-automated',
            sections: 8,
            estimatedTime: 120,
            outputFormats: ['PDF', 'Word']
        },
        {
            id: 'TPL-003',
            name: 'NPA Regulatory Filing',
            type: 'regulatory-filing',
            standard: 'NPA-Ghana',
            description: 'Monthly regulatory filing for National Petroleum Authority compliance including pricing, sales, and inventory data.',
            lastUsed: '2025-01-10',
            frequency: 'monthly',
            status: 'active',
            automation: 'fully-automated',
            sections: 12,
            estimatedTime: 30,
            outputFormats: ['PDF', 'XML', 'Excel']
        },
        {
            id: 'TPL-004',
            name: 'Expected Credit Loss Report',
            type: 'management-report',
            standard: 'IFRS-9',
            description: 'Management report on expected credit losses including methodology, assumptions, and scenario analysis.',
            lastUsed: '2025-01-08',
            frequency: 'monthly',
            status: 'active',
            automation: 'semi-automated',
            sections: 6,
            estimatedTime: 90,
            outputFormats: ['PDF', 'Excel', 'PowerPoint']
        },
        {
            id: 'TPL-005',
            name: 'Lease Accounting Summary',
            type: 'management-report',
            standard: 'IFRS-16',
            description: 'Summary of lease obligations, right-of-use assets, and lease expense analysis.',
            lastUsed: '2025-01-14',
            frequency: 'quarterly',
            status: 'active',
            automation: 'fully-automated',
            sections: 4,
            estimatedTime: 25,
            outputFormats: ['PDF', 'Excel']
        }
    ];
    const sampleGenerationsData = [
        {
            id: 'GEN-001',
            templateId: 'TPL-001',
            templateName: 'IFRS Financial Statements',
            reportingPeriod: '2024-Q4',
            generatedAt: '2025-01-15T10:30:00Z',
            generatedBy: 'System Automation',
            status: 'completed',
            fileSize: '2.4 MB',
            pageCount: 47,
            outputFormat: 'PDF',
            reviewedBy: 'CFO Office',
            reviewDate: '2025-01-15T14:20:00Z',
            downloadCount: 15,
            issues: []
        },
        {
            id: 'GEN-002',
            templateId: 'TPL-002',
            templateName: 'Revenue Recognition Disclosures',
            reportingPeriod: '2024-Q4',
            generatedAt: '2025-01-12T09:15:00Z',
            generatedBy: 'Finance Team',
            status: 'pending-review',
            fileSize: '1.8 MB',
            pageCount: 23,
            outputFormat: 'PDF',
            downloadCount: 3,
            issues: ['Missing contract modification details', 'Variable consideration assumptions need review']
        },
        {
            id: 'GEN-003',
            templateId: 'TPL-003',
            templateName: 'NPA Regulatory Filing',
            reportingPeriod: '2025-01',
            generatedAt: '2025-01-10T08:00:00Z',
            generatedBy: 'System Automation',
            status: 'completed',
            fileSize: '0.8 MB',
            pageCount: 12,
            outputFormat: 'XML',
            reviewedBy: 'Regulatory Team',
            reviewDate: '2025-01-10T09:30:00Z',
            downloadCount: 8,
            issues: []
        },
        {
            id: 'GEN-004',
            templateId: 'TPL-004',
            templateName: 'Expected Credit Loss Report',
            reportingPeriod: '2025-01',
            generatedAt: '2025-01-08T11:45:00Z',
            generatedBy: 'Risk Team',
            status: 'failed',
            fileSize: '',
            pageCount: 0,
            outputFormat: 'PDF',
            downloadCount: 0,
            issues: ['Data source connectivity error', 'ECL model calculation timeout']
        }
    ];
    const sampleScheduledData = [
        {
            id: 'SCH-001',
            templateId: 'TPL-003',
            templateName: 'NPA Regulatory Filing',
            schedule: '1st of every month at 8:00 AM',
            nextRun: '2025-02-01T08:00:00Z',
            lastRun: '2025-01-01T08:00:00Z',
            status: 'active',
            recipients: ['regulatory@company.com', 'cfo@company.com'],
            outputFormat: 'XML',
            deliveryMethod: 'both'
        },
        {
            id: 'SCH-002',
            templateId: 'TPL-004',
            templateName: 'Expected Credit Loss Report',
            schedule: '5th of every month at 10:00 AM',
            nextRun: '2025-02-05T10:00:00Z',
            lastRun: '2025-01-05T10:00:00Z',
            status: 'active',
            recipients: ['risk@company.com', 'audit@company.com'],
            outputFormat: 'PDF',
            deliveryMethod: 'email'
        },
        {
            id: 'SCH-003',
            templateId: 'TPL-001',
            templateName: 'IFRS Financial Statements',
            schedule: 'Quarterly on 15th at 2:00 PM',
            nextRun: '2025-04-15T14:00:00Z',
            lastRun: '2025-01-15T14:00:00Z',
            status: 'active',
            recipients: ['board@company.com', 'investors@company.com'],
            outputFormat: 'PDF',
            deliveryMethod: 'system'
        }
    ];
    const sampleMetricsData = {
        totalReportsGenerated: 1247,
        automationRate: 78.5,
        averageGenerationTime: 67,
        errorRate: 2.3,
        userSatisfactionScore: 4.6,
        complianceRate: 97.8,
        onTimeDelivery: 94.2
    };
    (0, react_1.useEffect)(() => {
        loadReportingData();
    }, [selectedPeriod]);
    const loadReportingData = async () => {
        try {
            setLoading(true);
            // Replace with actual API calls
            // const [templates, generations, scheduled, metrics] = await Promise.all([
            //   regulatoryService.get('/ifrs/report-templates'),
            //   regulatoryService.get('/ifrs/report-generations'),
            //   regulatoryService.get('/ifrs/scheduled-reports'),
            //   regulatoryService.get('/ifrs/report-metrics')
            // ]);
            setReportTemplates(sampleTemplatesData);
            setReportGenerations(sampleGenerationsData);
            setScheduledReports(sampleScheduledData);
            setReportMetrics(sampleMetricsData);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load reporting data');
            console.error('Error loading reporting data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Chart data
    const reportsByType = {
        labels: ['Financial Statements', 'Disclosure Notes', 'Regulatory Filing', 'Management Report', 'Audit Report'],
        datasets: [{
                data: [
                    reportTemplates.filter(t => t.type === 'financial-statements').length,
                    reportTemplates.filter(t => t.type === 'disclosure-notes').length,
                    reportTemplates.filter(t => t.type === 'regulatory-filing').length,
                    reportTemplates.filter(t => t.type === 'management-report').length,
                    reportTemplates.filter(t => t.type === 'audit-report').length
                ],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
            }]
    };
    const generationTrend = {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb (Proj)'],
        datasets: [{
                label: 'Reports Generated',
                data: [87, 94, 112, 98, 105],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
    };
    const automationDistribution = {
        labels: ['Fully Automated', 'Semi-Automated', 'Manual'],
        datasets: [{
                data: [
                    reportTemplates.filter(t => t.automation === 'fully-automated').length,
                    reportTemplates.filter(t => t.automation === 'semi-automated').length,
                    reportTemplates.filter(t => t.automation === 'manual').length
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
            }]
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'in-progress':
            case 'pending-review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'paused':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'archived':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getAutomationColor = (automation) => {
        switch (automation) {
            case 'fully-automated':
                return 'text-green-600';
            case 'semi-automated':
                return 'text-yellow-600';
            case 'manual':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };
    const handleGenerateReport = async (templateId) => {
        try {
            // await regulatoryService.post(`/ifrs/generate-report/${templateId}`);
            react_hot_toast_1.toast.success('Report generation started');
            loadReportingData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to generate report');
        }
    };
    const handleScheduleReport = async (templateId) => {
        try {
            // await regulatoryService.post(`/ifrs/schedule-report/${templateId}`);
            react_hot_toast_1.toast.success('Report scheduled successfully');
            loadReportingData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to schedule report');
        }
    };
    const formatPercentage = (value) => `${value.toFixed(1)}%`;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="IFRS Reporting Interface" subtitle="Automated Report Generation & Compliance Reporting">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              <option value="2025-01">January 2025</option>
              <option value="2024-12">December 2024</option>
              <option value="2024-11">November 2024</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${reportMetrics && reportMetrics.automationRate >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Automation Rate: {reportMetrics ? formatPercentage(reportMetrics.automationRate) : 'Loading...'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={() => handleGenerateReport('bulk')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Bulk Generate
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              New Template
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {reportMetrics && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reports Generated
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {reportMetrics.totalReportsGenerated.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  This Period
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Automation Rate
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatPercentage(reportMetrics.automationRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Fully + Semi Automated
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Generation Time
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {reportMetrics.averageGenerationTime}m
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Per Report
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Compliance Rate
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {formatPercentage(reportMetrics.complianceRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Standards Compliant
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>
          </div>)}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
            { id: 'overview', label: 'Overview' },
            { id: 'templates', label: 'Report Templates' },
            { id: 'generations', label: 'Recent Generations' },
            { id: 'scheduled', label: 'Scheduled Reports' },
            { id: 'builder', label: 'Report Builder' }
        ].map((tab) => (<button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'}`}>
                {tab.label}
              </button>))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Reports by Type"/>
                <charts_1.PieChart data={reportsByType} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Templates</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {reportTemplates.length}
                  </div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Generation Trend"/>
                <charts_1.LineChart data={generationTrend} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                  <div className="text-2xl font-bold text-green-600">
                    {reportGenerations.length}
                  </div>
                  <div className="text-xs text-green-600">↗ +12% from last month</div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Automation Distribution"/>
                <charts_1.PieChart data={automationDistribution} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Automation Rate</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {reportMetrics ? formatPercentage(reportMetrics.automationRate) : 'N/A'}
                  </div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>
          </div>)}

        {selectedTab === 'templates' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Report Templates"/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Template Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standard</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Frequency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Automation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Est. Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Used</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportTemplates.map((template, index) => (<framer_motion_1.motion.tr key={template.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium">{template.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {template.type.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {template.standard}
                          </span>
                        </td>
                        <td className="py-3 px-4">{template.frequency}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium ${getAutomationColor(template.automation)}`}>
                            {template.automation.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">{template.estimatedTime}m</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(template.lastUsed).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button onClick={() => handleGenerateReport(template.id)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Generate
                            </button>
                            <button onClick={() => handleScheduleReport(template.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Schedule
                            </button>
                          </div>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'generations' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Recent Report Generations"/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Report Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Generated</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Generated By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">File Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Pages</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Downloads</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportGenerations.map((generation, index) => (<framer_motion_1.motion.tr key={generation.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium">{generation.templateName}</td>
                        <td className="py-3 px-4">{generation.reportingPeriod}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(generation.generatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">{generation.generatedBy}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generation.status)}`}>
                            {generation.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{generation.fileSize}</td>
                        <td className="py-3 px-4 text-sm">{generation.pageCount}</td>
                        <td className="py-3 px-4 text-sm">{generation.downloadCount}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {generation.status === 'completed' && (<button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Download
                              </button>)}
                            {generation.issues.length > 0 && (<button className="px-3 py-1 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                View Issues
                              </button>)}
                          </div>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'scheduled' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Scheduled Reports"/>
              <div className="space-y-4">
                {scheduledReports.map((scheduled, index) => (<framer_motion_1.motion.div key={scheduled.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {scheduled.templateName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheduled.status)}`}>
                          {scheduled.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                          Pause
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                        <div className="font-medium">{scheduled.schedule}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Next Run:</span>
                        <div className="font-medium">
                          {new Date(scheduled.nextRun).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Output:</span>
                        <div className="font-medium">{scheduled.outputFormat}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                        <div className="font-medium">{scheduled.deliveryMethod}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recipients: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scheduled.recipients.map((recipient, i) => (<span key={i} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {recipient}
                          </span>))}
                      </div>
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'builder' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Report Builder"/>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Report Builder Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Create custom reports with our drag-and-drop report builder. 
                  Design complex financial statements, disclosure notes, and regulatory filings 
                  with automated data integration and IFRS compliance validation.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Request Early Access
                  </button>
                  <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ReportingPage;
//# sourceMappingURL=reporting.js.map