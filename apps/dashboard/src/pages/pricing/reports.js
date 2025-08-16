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
const PricingReports = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedReport, setSelectedReport] = (0, react_1.useState)('pricing-summary');
    const [reportFilters, setReportFilters] = (0, react_1.useState)({
        dateRange: '30d',
        product: 'all',
        region: 'all',
        format: 'detailed'
    });
    const [reports, setReports] = (0, react_1.useState)({
        pricingSummary: [],
        performanceAnalysis: [],
        complianceReport: [],
        marginAnalysis: []
    });
    // Mock report data
    const mockReports = {
        pricingSummary: {
            summary: {
                totalWindows: 12,
                activePrices: 8,
                avgMargin: 15.7,
                complianceRate: 98.5
            },
            priceChanges: [
                {
                    date: '2025-01-10',
                    product: 'Petrol (95 Octane)',
                    oldPrice: 15.33,
                    newPrice: 15.45,
                    change: '+0.12',
                    reason: 'Crude oil price increase',
                    window: 'Window-2025-001'
                },
                {
                    date: '2025-01-10',
                    product: 'Diesel (AGO)',
                    oldPrice: 14.97,
                    newPrice: 14.89,
                    change: '-0.08',
                    reason: 'Exchange rate adjustment',
                    window: 'Window-2025-001'
                },
                {
                    date: '2025-01-08',
                    product: 'Kerosene (DPK)',
                    oldPrice: 13.62,
                    newPrice: 13.67,
                    change: '+0.05',
                    reason: 'Supply adjustment',
                    window: 'Window-2025-001'
                }
            ],
            chartData: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                        label: 'Average Price',
                        data: [14.85, 15.02, 15.18, 15.33],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
            }
        },
        performanceAnalysis: {
            metrics: {
                revenueImpact: 2.3,
                marginOptimization: 94.2,
                priceAccuracy: 99.1,
                timeToMarket: 4.2
            },
            marginDistribution: {
                labels: ['Petrol', 'Diesel', 'Kerosene', 'LPG'],
                datasets: [{
                        label: 'Margin %',
                        data: [15.7, 14.2, 16.8, 18.5],
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
                    }]
            },
            revenueImpact: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                        label: 'Revenue Impact (%)',
                        data: [1.2, 2.8, 1.9, 3.1, 2.3, 1.7],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
            }
        },
        complianceReport: {
            status: {
                npaCompliance: 100,
                uppfCompliance: 98.5,
                regulatoryFiling: 100,
                documentationComplete: 96.8
            },
            issues: [
                {
                    type: 'Warning',
                    description: 'UPPF claim submission pending for Window-2024-052',
                    severity: 'Medium',
                    dueDate: '2025-01-15'
                },
                {
                    type: 'Info',
                    description: 'Quarterly regulatory report due in 5 days',
                    severity: 'Low',
                    dueDate: '2025-01-18'
                }
            ]
        }
    };
    (0, react_1.useEffect)(() => {
        loadReports();
    }, [reportFilters, selectedReport]);
    const loadReports = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setReports(mockReports);
            react_hot_toast_1.toast.success('Reports loaded successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load reports');
            console.error('Reports loading error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateReport = async () => {
        try {
            react_hot_toast_1.toast.loading('Generating comprehensive report...');
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 3000));
            react_hot_toast_1.toast.success('Report generated successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Report generation failed');
        }
    };
    const exportReport = async (format) => {
        try {
            react_hot_toast_1.toast.loading(`Exporting report as ${format.toUpperCase()}...`);
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success(`Report exported as ${format.toUpperCase()}`);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Export failed');
        }
    };
    const scheduleReport = async () => {
        try {
            react_hot_toast_1.toast.loading('Setting up automated report schedule...');
            // Simulate scheduling
            await new Promise(resolve => setTimeout(resolve, 1500));
            react_hot_toast_1.toast.success('Report scheduled successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Scheduling failed');
        }
    };
    const reportTypes = [
        { id: 'pricing-summary', label: 'Pricing Summary', icon: '📊' },
        { id: 'performance-analysis', label: 'Performance Analysis', icon: '📈' },
        { id: 'compliance-report', label: 'Compliance Report', icon: '✅' },
        { id: 'margin-analysis', label: 'Margin Analysis', icon: '💰' },
        { id: 'variance-report', label: 'Variance Report', icon: '📉' },
        { id: 'settlement-report', label: 'Settlement Report', icon: '🏦' }
    ];
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"/>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    const renderPricingSummaryReport = () => (<div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { title: 'Total Windows', value: mockReports.pricingSummary.summary.totalWindows, color: 'text-blue-500' },
            { title: 'Active Prices', value: mockReports.pricingSummary.summary.activePrices, color: 'text-green-500' },
            { title: 'Avg Margin', value: `${mockReports.pricingSummary.summary.avgMargin}%`, color: 'text-purple-500' },
            { title: 'Compliance Rate', value: `${mockReports.pricingSummary.summary.complianceRate}%`, color: 'text-orange-500' }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>))}
      </div>

      {/* Price Trend Chart */}
      <Card_1.Card className="p-6">
        <Card_1.CardHeader title="Price Trend Analysis" subtitle="Weekly average pricing trends"/>
        <Card_1.CardContent>
          <charts_1.LineChart data={mockReports.pricingSummary.chartData} height={300}/>
        </Card_1.CardContent>
      </Card_1.Card>

      {/* Recent Price Changes Table */}
      <Card_1.Card className="p-6">
        <Card_1.CardHeader title="Recent Price Changes" subtitle="Latest pricing updates and adjustments"/>
        <Card_1.CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Old Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">New Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Window</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Reason</th>
                </tr>
              </thead>
              <tbody>
                {mockReports.pricingSummary.priceChanges.map((change, index) => (<framer_motion_1.motion.tr key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">{change.date}</td>
                    <td className="py-3 px-4 font-medium">{change.product}</td>
                    <td className="py-3 px-4">₵{change.oldPrice}</td>
                    <td className="py-3 px-4 font-bold">₵{change.newPrice}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${change.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {change.change}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{change.window}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{change.reason}</td>
                  </framer_motion_1.motion.tr>))}
              </tbody>
            </table>
          </div>
        </Card_1.CardContent>
      </Card_1.Card>
    </div>);
    const renderPerformanceAnalysisReport = () => (<div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { title: 'Revenue Impact', value: `+${mockReports.performanceAnalysis.metrics.revenueImpact}%`, color: 'text-green-500' },
            { title: 'Margin Optimization', value: `${mockReports.performanceAnalysis.metrics.marginOptimization}%`, color: 'text-blue-500' },
            { title: 'Price Accuracy', value: `${mockReports.performanceAnalysis.metrics.priceAccuracy}%`, color: 'text-purple-500' },
            { title: 'Time to Market', value: `${mockReports.performanceAnalysis.metrics.timeToMarket}h`, color: 'text-orange-500' }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Distribution */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Margin Distribution" subtitle="Profit margins by product category"/>
          <Card_1.CardContent>
            <charts_1.BarChart data={mockReports.performanceAnalysis.marginDistribution} height={300}/>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Revenue Impact */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Revenue Impact Over Time" subtitle="Pricing strategy revenue impact"/>
          <Card_1.CardContent>
            <charts_1.LineChart data={mockReports.performanceAnalysis.revenueImpact} height={300}/>
          </Card_1.CardContent>
        </Card_1.Card>
      </div>
    </div>);
    const renderComplianceReport = () => (<div className="space-y-6">
      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { title: 'NPA Compliance', value: `${mockReports.complianceReport.status.npaCompliance}%`, color: 'text-green-500' },
            { title: 'UPPF Compliance', value: `${mockReports.complianceReport.status.uppfCompliance}%`, color: 'text-blue-500' },
            { title: 'Regulatory Filing', value: `${mockReports.complianceReport.status.regulatoryFiling}%`, color: 'text-purple-500' },
            { title: 'Documentation', value: `${mockReports.complianceReport.status.documentationComplete}%`, color: 'text-orange-500' }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>))}
      </div>

      {/* Compliance Issues */}
      <Card_1.Card className="p-6">
        <Card_1.CardHeader title="Compliance Issues & Alerts" subtitle="Outstanding compliance matters"/>
        <Card_1.CardContent>
          <div className="space-y-4">
            {mockReports.complianceReport.issues.map((issue, index) => (<framer_motion_1.motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-lg border ${issue.severity === 'High' ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                issue.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' :
                    'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-semibold ${issue.severity === 'High' ? 'text-red-800 dark:text-red-400' :
                issue.severity === 'Medium' ? 'text-yellow-800 dark:text-yellow-400' :
                    'text-blue-800 dark:text-blue-400'}`}>
                      {issue.type}
                    </h4>
                    <p className={`text-sm mt-1 ${issue.severity === 'High' ? 'text-red-700 dark:text-red-300' :
                issue.severity === 'Medium' ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-blue-700 dark:text-blue-300'}`}>
                      {issue.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${issue.severity === 'High' ? 'bg-red-200 text-red-800' :
                issue.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'}`}>
                      {issue.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Due: {issue.dueDate}</p>
                  </div>
                </div>
              </framer_motion_1.motion.div>))}
          </div>
        </Card_1.CardContent>
      </Card_1.Card>
    </div>);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Pricing Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive pricing analysis and regulatory reports
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button onClick={generateReport} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Generate Report
            </button>
            
            <button onClick={scheduleReport} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Schedule
            </button>
            
            <div className="relative group">
              <button className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
                Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-white/20 bg-white/10 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button onClick={() => exportReport('pdf')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-lg">
                  Export as PDF
                </button>
                <button onClick={() => exportReport('excel')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10">
                  Export as Excel
                </button>
                <button onClick={() => exportReport('csv')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg">
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </framer_motion_1.motion.div>

        {/* Report Type Selection */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Report Type" subtitle="Select the type of report to generate"/>
          <Card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {reportTypes.map((type) => (<framer_motion_1.motion.button key={type.id} onClick={() => setSelectedReport(type.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-4 rounded-lg border transition-all ${selectedReport === type.id
                ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}>
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <p className="text-sm font-medium">{type.label}</p>
                </framer_motion_1.motion.button>))}
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Filters */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Report Filters" subtitle="Customize your report parameters"/>
          <Card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Date Range
                </label>
                <select value={reportFilters.dateRange} onChange={(e) => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Product
                </label>
                <select value={reportFilters.product} onChange={(e) => setReportFilters(prev => ({ ...prev, product: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Products</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="kerosene">Kerosene</option>
                  <option value="lpg">LPG</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Region
                </label>
                <select value={reportFilters.region} onChange={(e) => setReportFilters(prev => ({ ...prev, region: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Regions</option>
                  <option value="accra">Greater Accra</option>
                  <option value="kumasi">Ashanti</option>
                  <option value="takoradi">Western</option>
                  <option value="tamale">Northern</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Format
                </label>
                <select value={reportFilters.format} onChange={(e) => setReportFilters(prev => ({ ...prev, format: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="detailed">Detailed</option>
                  <option value="summary">Summary</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Report Content */}
        <framer_motion_1.motion.div key={selectedReport} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {selectedReport === 'pricing-summary' && renderPricingSummaryReport()}
          {selectedReport === 'performance-analysis' && renderPerformanceAnalysisReport()}
          {selectedReport === 'compliance-report' && renderComplianceReport()}
          {(selectedReport === 'margin-analysis' || selectedReport === 'variance-report' || selectedReport === 'settlement-report') && (<Card_1.Card className="p-6">
              <Card_1.CardHeader title="Report Coming Soon" subtitle="This report type is being developed"/>
              <Card_1.CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-semibold mb-2">Report Under Development</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This report type will be available in the next release
                  </p>
                </div>
              </Card_1.CardContent>
            </Card_1.Card>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PricingReports;
//# sourceMappingURL=reports.js.map