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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Select_1 = require("@/components/ui/Select");
const Input_1 = require("@/components/ui/Input");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const link_1 = __importDefault(require("next/link"));
const ReportsOverview = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [reports, setReports] = (0, react_1.useState)([]);
    const [templates, setTemplates] = (0, react_1.useState)([]);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedType, setSelectedType] = (0, react_1.useState)('all');
    const [selectedStatus, setSelectedStatus] = (0, react_1.useState)('all');
    const [showScheduleModal, setShowScheduleModal] = (0, react_1.useState)(false);
    const reportTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'sales', label: 'Sales Reports' },
        { value: 'inventory', label: 'Inventory Reports' },
        { value: 'financial', label: 'Financial Reports' },
        { value: 'regulatory', label: 'Regulatory Reports' },
        { value: 'operational', label: 'Operational Reports' }
    ];
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'available', label: 'Available' },
        { value: 'generating', label: 'Generating' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'error', label: 'Error' }
    ];
    (0, react_1.useEffect)(() => {
        fetchReportsData();
    }, []);
    const fetchReportsData = async () => {
        try {
            setLoading(true);
            // Fetch reports and templates
            const [reportsResponse, templatesResponse] = await Promise.all([
                api_1.reportsService.getScheduledReports(),
                api_1.reportsService.getReportTemplates()
            ]);
            setReports(reportsResponse.data || mockReports);
            setTemplates(templatesResponse.data || mockTemplates);
        }
        catch (error) {
            console.error('Error fetching reports data:', error);
            // Use mock data for development
            setReports(mockReports);
            setTemplates(mockTemplates);
        }
        finally {
            setLoading(false);
        }
    };
    const mockReports = [
        {
            id: '1',
            name: 'Daily Sales Summary',
            type: 'sales',
            description: 'Daily overview of sales performance across all stations',
            frequency: 'daily',
            format: 'pdf',
            lastGenerated: '2025-01-14T08:00:00Z',
            status: 'available',
            size: '2.4 MB',
            automated: true,
            recipients: ['manager@omc.com', 'sales@omc.com']
        },
        {
            id: '2',
            name: 'Monthly Financial Statements',
            type: 'financial',
            description: 'Comprehensive monthly financial performance report',
            frequency: 'monthly',
            format: 'xlsx',
            lastGenerated: '2025-01-01T00:00:00Z',
            status: 'available',
            size: '5.8 MB',
            automated: true,
            recipients: ['cfo@omc.com', 'finance@omc.com']
        },
        {
            id: '3',
            name: 'Inventory Status Report',
            type: 'inventory',
            description: 'Current inventory levels and stock alerts',
            frequency: 'weekly',
            format: 'pdf',
            lastGenerated: '2025-01-13T06:00:00Z',
            status: 'available',
            size: '1.9 MB',
            automated: true,
            recipients: ['operations@omc.com']
        },
        {
            id: '4',
            name: 'NPA Compliance Report',
            type: 'regulatory',
            description: 'Monthly regulatory compliance submission to NPA',
            frequency: 'monthly',
            format: 'pdf',
            lastGenerated: '2025-01-01T00:00:00Z',
            status: 'generating',
            automated: true,
            recipients: ['compliance@omc.com', 'legal@omc.com']
        },
        {
            id: '5',
            name: 'Quarterly Performance Analysis',
            type: 'operational',
            description: 'Detailed quarterly operational performance metrics',
            frequency: 'quarterly',
            format: 'xlsx',
            lastGenerated: '2024-10-01T00:00:00Z',
            status: 'scheduled',
            size: '12.5 MB',
            automated: true,
            recipients: ['ceo@omc.com', 'operations@omc.com']
        }
    ];
    const mockTemplates = [
        {
            id: '1',
            name: 'Sales Performance Template',
            category: 'Sales',
            description: 'Comprehensive sales analysis with KPIs and trends',
            fields: ['Revenue', 'Volume', 'Customer Metrics', 'Product Performance'],
            customizable: true
        },
        {
            id: '2',
            name: 'Financial Dashboard Template',
            category: 'Financial',
            description: 'Executive financial summary with key ratios',
            fields: ['P&L', 'Balance Sheet', 'Cash Flow', 'Financial Ratios'],
            customizable: true
        },
        {
            id: '3',
            name: 'Inventory Management Template',
            category: 'Inventory',
            description: 'Stock levels, turnover, and optimization insights',
            fields: ['Stock Levels', 'Turnover Rates', 'Alerts', 'Forecasting'],
            customizable: false
        },
        {
            id: '4',
            name: 'Regulatory Compliance Template',
            category: 'Regulatory',
            description: 'Standard compliance reporting for regulatory bodies',
            fields: ['Compliance Status', 'Violations', 'Corrective Actions'],
            customizable: false
        }
    ];
    const handleGenerateReport = async (reportId) => {
        try {
            react_hot_toast_1.toast.loading('Generating report...');
            // Update report status
            setReports(prev => prev.map(report => report.id === reportId
                ? { ...report, status: 'generating' }
                : report));
            // Simulate report generation
            setTimeout(() => {
                setReports(prev => prev.map(report => report.id === reportId
                    ? {
                        ...report,
                        status: 'available',
                        lastGenerated: new Date().toISOString(),
                        size: `${(Math.random() * 10 + 1).toFixed(1)} MB`
                    }
                    : report));
                react_hot_toast_1.toast.dismiss();
                react_hot_toast_1.toast.success('Report generated successfully');
            }, 3000);
        }
        catch (error) {
            react_hot_toast_1.toast.dismiss();
            react_hot_toast_1.toast.error('Failed to generate report');
        }
    };
    const handleDownloadReport = async (report) => {
        try {
            // Simulate download
            react_hot_toast_1.toast.success(`Downloading ${report.name}`);
            // Create a mock download
            const element = document.createElement('a');
            element.href = '#';
            element.download = `${report.name.replace(/\s+/g, '_')}.${report.format}`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to download report');
        }
    };
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'available': return 'success';
            case 'generating': return 'warning';
            case 'scheduled': return 'primary';
            case 'error': return 'danger';
            default: return 'secondary';
        }
    };
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'sales': return 'primary';
            case 'financial': return 'success';
            case 'inventory': return 'warning';
            case 'regulatory': return 'danger';
            case 'operational': return 'secondary';
            default: return 'outline';
        }
    };
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || report.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Reports Overview" subtitle="Comprehensive business reporting and analytics">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Reports Overview" subtitle="Comprehensive business reporting and analytics">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input_1.Input type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            
            <div className="flex gap-2">
              <Select_1.Select value={selectedType} onChange={(value) => setSelectedType(value)} options={reportTypes} className="w-40"/>
              <Select_1.Select value={selectedStatus} onChange={(value) => setSelectedStatus(value)} options={statusOptions} className="w-32"/>
            </div>
          </div>

          <div className="flex gap-2">
            <Button_1.Button variant="outline" onClick={() => setShowScheduleModal(true)}>
              Schedule Report
            </Button_1.Button>
            <Button_1.Button>
              Create Custom Report
            </Button_1.Button>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <link_1.default href="/reports/sales">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Sales Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue and sales analytics</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/reports/inventory">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Inventory Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stock and inventory analysis</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/reports/financial">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Financial Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Financial statements and analysis</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/reports/regulatory">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Regulatory Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compliance and regulatory filings</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>
        </div>

        {/* Recent Reports */}
        <Card_1.Card>
          <Card_1.CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredReports.length} of {reports.length} reports
                </p>
              </div>
            </div>
          </Card_1.CardHeader>
          <Card_1.CardContent>
            <div className="space-y-4">
              {filteredReports.map((report, index) => (<framer_motion_1.motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{report.name}</h4>
                      <ui_1.Badge variant={getTypeBadgeColor(report.type)}>
                        {report.type}
                      </ui_1.Badge>
                      <ui_1.Badge variant={getStatusBadgeColor(report.status)}>
                        {report.status}
                      </ui_1.Badge>
                      {report.automated && (<ui_1.Badge variant="outline">Automated</ui_1.Badge>)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Frequency: {report.frequency}</span>
                      <span>Format: {report.format.toUpperCase()}</span>
                      {report.size && <span>Size: {report.size}</span>}
                      <span>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {report.status === 'available' && (<Button_1.Button size="sm" variant="outline" onClick={() => handleDownloadReport(report)}>
                        Download
                      </Button_1.Button>)}
                    <Button_1.Button size="sm" variant="ghost" onClick={() => handleGenerateReport(report.id)} disabled={report.status === 'generating'}>
                      {report.status === 'generating' ? 'Generating...' : 'Generate'}
                    </Button_1.Button>
                  </div>
                </framer_motion_1.motion.div>))}
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Report Templates */}
        <Card_1.Card>
          <Card_1.CardHeader>
            <h3 className="text-lg font-semibold">Report Templates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pre-built templates for common reporting needs
            </p>
          </Card_1.CardHeader>
          <Card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (<framer_motion_1.motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card_1.Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.customizable && (<ui_1.Badge variant="outline" className="text-xs">Customizable</ui_1.Badge>)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Included Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field) => (<span key={field} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                            {field}
                          </span>))}
                      </div>
                    </div>
                    <Button_1.Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button_1.Button>
                  </Card_1.Card>
                </framer_motion_1.motion.div>))}
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Reports', value: reports.length, color: 'blue' },
            { title: 'Automated Reports', value: reports.filter(r => r.automated).length, color: 'green' },
            { title: 'Available Reports', value: reports.filter(r => r.status === 'available').length, color: 'purple' },
            { title: 'Scheduled Reports', value: reports.filter(r => r.status === 'scheduled').length, color: 'orange' }
        ].map((stat, index) => (<framer_motion_1.motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
              <Card_1.Card className="p-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ReportsOverview;
//# sourceMappingURL=index.js.map