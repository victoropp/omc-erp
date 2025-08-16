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
const Button_1 = require("@/components/ui/Button");
const Select_1 = require("@/components/ui/Select");
const index_1 = require("@/components/ui/index");
const charts_1 = require("@/components/charts");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const UPPFAnalytics = () => {
    const [analyticsData, setAnalyticsData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [realTimeUpdates, setRealTimeUpdates] = (0, react_1.useState)(true);
    const [searchFilters, setSearchFilters] = (0, react_1.useState)({
        dateRange: '30days',
        status: 'all',
        route: 'all',
        dealer: 'all'
    });
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(new Date());
    // Fetch analytics data
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const params = {
                ...searchFilters,
                includeRealTime: realTimeUpdates
            };
            const data = await api_1.pricingService.get(`/uppf-analytics?${new URLSearchParams(params).toString()}`);
            setAnalyticsData(data);
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error('Error fetching UPPF analytics:', error);
            react_hot_toast_1.toast.error('Failed to load UPPF analytics data');
        }
        finally {
            setLoading(false);
        }
    };
    // Real-time updates via WebSocket
    (0, react_1.useEffect)(() => {
        if (realTimeUpdates) {
            api_1.wsService.connect();
            const handleUPPFUpdate = (data) => {
                if (data.type === 'uppf_analytics_update') {
                    setAnalyticsData(prev => ({
                        ...prev,
                        ...data.payload
                    }));
                    setLastUpdated(new Date());
                }
            };
            // Add event listener for WebSocket messages
            api_1.wsService.send({ type: 'subscribe', channel: 'uppf_analytics' });
            return () => {
                api_1.wsService.send({ type: 'unsubscribe', channel: 'uppf_analytics' });
                api_1.wsService.disconnect();
            };
        }
    }, [realTimeUpdates]);
    // Initial data load
    (0, react_1.useEffect)(() => {
        fetchAnalyticsData();
    }, [searchFilters]);
    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setSearchFilters(prev => ({ ...prev, [key]: value }));
    };
    // Export analytics data
    const exportAnalytics = async (format) => {
        try {
            const response = await api_1.pricingService.get(`/uppf-analytics/export?format=${format}&${new URLSearchParams(searchFilters).toString()}`);
            // Create download link
            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `uppf-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            react_hot_toast_1.toast.success(`Analytics exported as ${format.toUpperCase()}`);
        }
        catch (error) {
            console.error('Export error:', error);
            react_hot_toast_1.toast.error('Failed to export analytics data');
        }
    };
    if (loading || !analyticsData) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="UPPF Analytics" subtitle="Comprehensive UPPF Performance Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="UPPF Analytics" subtitle="Comprehensive UPPF Performance Analytics">
      <div className="space-y-6">
        {/* Real-time Status & Controls */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <index_1.Badge variant={realTimeUpdates ? 'success' : 'secondary'}>
              {realTimeUpdates ? '● Live Updates' : '○ Static View'}
            </index_1.Badge>
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button_1.Button variant="outline" size="sm" onClick={() => setRealTimeUpdates(!realTimeUpdates)}>
              {realTimeUpdates ? 'Disable' : 'Enable'} Real-time
            </Button_1.Button>
            <Button_1.Button variant="outline" size="sm" onClick={() => exportAnalytics('excel')}>
              Export Excel
            </Button_1.Button>
            <Button_1.Button variant="outline" size="sm" onClick={() => exportAnalytics('pdf')}>
              Export PDF
            </Button_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Search & Filter Controls */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select_1.Select label="Date Range" value={searchFilters.dateRange} onChange={(value) => handleFilterChange('dateRange', value)} options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: '90days', label: 'Last 90 Days' },
            { value: '1year', label: 'Last Year' },
            { value: 'custom', label: 'Custom Range' }
        ]}/>
              
              <Select_1.Select label="Status" value={searchFilters.status} onChange={(value) => handleFilterChange('status', value)} options={[
            { value: 'all', label: 'All Status' },
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'settled', label: 'Settled' }
        ]}/>
              
              <Select_1.Select label="Route" value={searchFilters.route} onChange={(value) => handleFilterChange('route', value)} options={[
            { value: 'all', label: 'All Routes' },
            { value: 'accra-kumasi', label: 'Accra - Kumasi' },
            { value: 'tema-tamale', label: 'Tema - Tamale' },
            { value: 'takoradi-sunyani', label: 'Takoradi - Sunyani' }
        ]}/>
              
              <Select_1.Select label="Dealer" value={searchFilters.dealer} onChange={(value) => handleFilterChange('dealer', value)} options={[
            { value: 'all', label: 'All Dealers' },
            { value: 'dealer-001', label: 'Ghana Oil Depot' },
            { value: 'dealer-002', label: 'Tema Energy Hub' },
            { value: 'dealer-003', label: 'Kumasi Fuel Centre' }
        ]}/>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Claims</p>
                  <p className="text-3xl font-bold text-blue-700">{analyticsData.totalClaims.toLocaleString()}</p>
                  <p className="text-xs text-blue-500 mt-1">+12% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Value</p>
                  <p className="text-3xl font-bold text-green-700">₵{analyticsData.totalClaimValue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 mt-1">+8.5% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Settlement Rate</p>
                  <p className="text-3xl font-bold text-purple-700">{analyticsData.settlementRate}%</p>
                  <p className="text-xs text-purple-500 mt-1">+2.1% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Processing Time</p>
                  <p className="text-3xl font-bold text-orange-700">{analyticsData.averageProcessingTime} days</p>
                  <p className="text-xs text-orange-500 mt-1">-0.5 days vs last period</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Claims Trend</h3>
              <charts_1.LineChart data={{
            labels: analyticsData.monthlyTrend?.map(item => item.month) || [],
            datasets: [
                {
                    label: 'Claims Submitted',
                    data: analyticsData.monthlyTrend?.map(item => item.submitted) || [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Claims Approved',
                    data: analyticsData.monthlyTrend?.map(item => item.approved) || [],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }
            ]
        }} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Claims by Route</h3>
              <charts_1.BarChart data={{
            labels: analyticsData.routeAnalysis?.map(route => route.name) || [],
            datasets: [{
                    label: 'Total Claims',
                    data: analyticsData.routeAnalysis?.map(route => route.count) || [],
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6'
                    ]
                }]
        }} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Detailed Analytics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Dealers</h3>
              <div className="space-y-3">
                {analyticsData.dealerPerformance?.map((dealer, index) => (<div key={dealer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{dealer.name}</p>
                        <p className="text-sm text-gray-500">{dealer.claimsCount} claims</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₵{dealer.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{dealer.successRate}% success</p>
                    </div>
                  </div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">NPA Submission Statistics</h3>
              <div className="space-y-4">
                {analyticsData.npaSubmissionStats?.map((stat, index) => (<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{stat.type}</p>
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
                      <index_1.Badge variant={stat.status === 'success' ? 'success' : stat.status === 'pending' ? 'warning' : 'danger'}>
                        {stat.status}
                      </index_1.Badge>
                    </div>
                  </div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Compliance & Audit Overview */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance & Audit Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{analyticsData.complianceMetrics?.compliantClaims || 0}</p>
                <p className="text-sm text-gray-600">Compliant Claims</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.complianceMetrics?.complianceRate || 0}%` }}></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{analyticsData.auditFindings?.length || 0}</p>
                <p className="text-sm text-gray-600">Audit Findings</p>
                <div className="mt-2 flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i < (analyticsData.auditFindings?.filter(f => f.severity === 'high').length || 0)
                ? 'bg-red-500'
                : 'bg-gray-200'}`}/>))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analyticsData.complianceMetrics?.averageScore || 0}%</p>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <charts_1.PieChart data={{
            labels: ['Compliant', 'Non-compliant'],
            datasets: [{
                    data: [
                        analyticsData.complianceMetrics?.averageScore || 0,
                        100 - (analyticsData.complianceMetrics?.averageScore || 0)
                    ],
                    backgroundColor: ['#10B981', '#EF4444']
                }]
        }} height={100}/>
              </div>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = UPPFAnalytics;
//# sourceMappingURL=analytics.js.map