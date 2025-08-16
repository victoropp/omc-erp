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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const PriceVarianceAnalysis = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [varianceData, setVarianceData] = (0, react_1.useState)({});
    const [analysisFilters, setAnalysisFilters] = (0, react_1.useState)({
        period: '30d',
        product: 'all',
        threshold: 2.0,
        region: 'all'
    });
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    // Mock variance analysis data
    const mockData = {
        summary: {
            avgVariance: 2.3,
            maxVariance: 5.7,
            varianceCount: 12,
            alertsTriggered: 3
        },
        varianceByProduct: [
            {
                product: 'Petrol (95 Octane)',
                expected: 15.45,
                actual: 15.52,
                variance: 0.45,
                variancePercent: 0.45,
                threshold: 2.0,
                status: 'normal',
                trend: 'stable'
            },
            {
                product: 'Diesel (AGO)',
                expected: 14.89,
                actual: 15.25,
                variance: 0.36,
                variancePercent: 2.42,
                threshold: 2.0,
                status: 'warning',
                trend: 'increasing'
            },
            {
                product: 'Kerosene (DPK)',
                expected: 13.67,
                actual: 14.45,
                variance: 0.78,
                variancePercent: 5.71,
                threshold: 2.0,
                status: 'critical',
                trend: 'volatile'
            },
            {
                product: 'LPG',
                expected: 12.30,
                actual: 12.18,
                variance: -0.12,
                variancePercent: -0.98,
                threshold: 2.0,
                status: 'normal',
                trend: 'decreasing'
            }
        ],
        historicalVariance: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Petrol Variance %',
                    data: [1.2, 0.8, 1.5, 0.45],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Diesel Variance %',
                    data: [2.1, 1.8, 2.9, 2.42],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Kerosene Variance %',
                    data: [3.2, 4.1, 4.8, 5.71],
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        varianceDistribution: {
            labels: ['0-1%', '1-2%', '2-3%', '3-5%', '5%+'],
            datasets: [{
                    label: 'Frequency',
                    data: [45, 32, 15, 6, 2],
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
                }]
        },
        rootCauseAnalysis: {
            labels: ['Crude Oil Price', 'Exchange Rate', 'Supply Chain', 'Regulatory', 'Market Forces'],
            datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                }]
        },
        alerts: [
            {
                id: 1,
                product: 'Kerosene (DPK)',
                severity: 'critical',
                message: 'Price variance exceeded 5% threshold',
                variance: 5.71,
                timestamp: '2025-01-13 09:30:00',
                status: 'active',
                action: 'Investigate supply chain disruption'
            },
            {
                id: 2,
                product: 'Diesel (AGO)',
                severity: 'warning',
                message: 'Price variance above 2% threshold',
                variance: 2.42,
                timestamp: '2025-01-13 08:15:00',
                status: 'acknowledged',
                action: 'Monitor crude oil price movements'
            },
            {
                id: 3,
                product: 'Petrol (95 Octane)',
                severity: 'info',
                message: 'Price stability maintained',
                variance: 0.45,
                timestamp: '2025-01-13 07:00:00',
                status: 'resolved',
                action: 'Continue monitoring'
            }
        ]
    };
    (0, react_1.useEffect)(() => {
        loadVarianceData();
        // Setup WebSocket for real-time variance updates
        api_1.wsService.connect();
        return () => {
            api_1.wsService.disconnect();
        };
    }, [analysisFilters]);
    const loadVarianceData = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setVarianceData(mockData);
            setAlerts(mockData.alerts);
            react_hot_toast_1.toast.success('Variance analysis loaded successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load variance data');
            console.error('Variance loading error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const exportVarianceReport = async (format) => {
        try {
            react_hot_toast_1.toast.loading(`Exporting variance report as ${format.toUpperCase()}...`);
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success(`Variance report exported as ${format.toUpperCase()}`);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Export failed');
        }
    };
    const acknowledgeAlert = async (alertId) => {
        try {
            const updatedAlerts = alerts.map(alert => alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert);
            setAlerts(updatedAlerts);
            react_hot_toast_1.toast.success('Alert acknowledged');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to acknowledge alert');
        }
    };
    const runVarianceAnalysis = async () => {
        try {
            react_hot_toast_1.toast.loading('Running comprehensive variance analysis...');
            // Simulate analysis
            await new Promise(resolve => setTimeout(resolve, 3000));
            react_hot_toast_1.toast.success('Variance analysis completed');
            await loadVarianceData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Analysis failed');
        }
    };
    const getVarianceColor = (variance, threshold) => {
        const absVariance = Math.abs(variance);
        if (absVariance >= threshold * 2)
            return 'text-red-500';
        if (absVariance >= threshold)
            return 'text-yellow-500';
        return 'text-green-500';
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'critical':
                return 'px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded text-xs font-medium';
            case 'warning':
                return 'px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs font-medium';
            case 'normal':
                return 'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs font-medium';
            default:
                return 'px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 rounded text-xs font-medium';
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'volatile': return '🌊';
            case 'stable': return '➡️';
            default: return '➡️';
        }
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"/>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Price Variance Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advanced price variance monitoring and root cause analysis
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button onClick={runVarianceAnalysis} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Run Analysis
            </button>
            
            <div className="relative group">
              <button className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
                Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-white/20 bg-white/10 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button onClick={() => exportVarianceReport('csv')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-lg">
                  Export as CSV
                </button>
                <button onClick={() => exportVarianceReport('excel')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10">
                  Export as Excel
                </button>
                <button onClick={() => exportVarianceReport('pdf')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg">
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </framer_motion_1.motion.div>

        {/* Analysis Filters */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Analysis Filters" subtitle="Configure variance analysis parameters"/>
          <Card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Time Period
                </label>
                <select value={analysisFilters.period} onChange={(e) => setAnalysisFilters(prev => ({ ...prev, period: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Product
                </label>
                <select value={analysisFilters.product} onChange={(e) => setAnalysisFilters(prev => ({ ...prev, product: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Products</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="kerosene">Kerosene</option>
                  <option value="lpg">LPG</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Variance Threshold (%)
                </label>
                <input type="number" step="0.1" value={analysisFilters.threshold} onChange={(e) => setAnalysisFilters(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Region
                </label>
                <select value={analysisFilters.region} onChange={(e) => setAnalysisFilters(prev => ({ ...prev, region: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Regions</option>
                  <option value="accra">Greater Accra</option>
                  <option value="kumasi">Ashanti</option>
                  <option value="takoradi">Western</option>
                  <option value="tamale">Northern</option>
                </select>
              </div>
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
                title: 'Avg Variance',
                value: `${mockData.summary.avgVariance}%`,
                color: 'text-blue-500',
                icon: '📊',
                change: '-0.3% from last week'
            },
            {
                title: 'Max Variance',
                value: `${mockData.summary.maxVariance}%`,
                color: 'text-red-500',
                icon: '⚠️',
                change: '+1.2% this month'
            },
            {
                title: 'Variance Events',
                value: mockData.summary.varianceCount,
                color: 'text-yellow-500',
                icon: '📈',
                change: '2 more than last period'
            },
            {
                title: 'Active Alerts',
                value: mockData.summary.alertsTriggered,
                color: 'text-orange-500',
                icon: '🚨',
                change: '1 critical alert'
            }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card_1.Card className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.change}
                </p>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Current Variance Status */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Current Variance Status" subtitle="Real-time variance analysis by product"/>
            <Card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Expected</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actual</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Variance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">% Variance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trend</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.varianceByProduct.map((item, index) => (<framer_motion_1.motion.tr key={item.product} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{item.product}</td>
                        <td className="py-3 px-4 text-gray-300">₵{item.expected}</td>
                        <td className="py-3 px-4 font-bold text-white">₵{item.actual}</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${getVarianceColor(item.variancePercent, item.threshold)}`}>
                            {item.variance > 0 ? '+' : ''}₵{item.variance.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${getVarianceColor(item.variancePercent, item.threshold)}`}>
                            {item.variance > 0 ? '+' : ''}{item.variancePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={getStatusBadge(item.status)}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-2xl">
                          {getTrendIcon(item.trend)}
                        </td>
                        <td className="py-3 px-4">
                          <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors mr-2">
                            Analyze
                          </button>
                          {item.status === 'critical' && (<button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors">
                              Alert
                            </button>)}
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Variance Trends */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Historical Variance Trends" subtitle="Product variance over time"/>
              <Card_1.CardContent>
                <charts_1.LineChart data={mockData.historicalVariance} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Variance Distribution */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Variance Distribution" subtitle="Frequency distribution of variance ranges"/>
              <Card_1.CardContent>
                <charts_1.BarChart data={mockData.varianceDistribution} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Root Cause Analysis */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Root Cause Analysis" subtitle="Primary factors contributing to price variance"/>
            <Card_1.CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <charts_1.PieChart data={mockData.rootCauseAnalysis} height={300}/>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-white mb-4">Contributing Factors</h4>
                  {[
            { factor: 'Crude Oil Price Volatility', impact: 35, color: 'bg-blue-500' },
            { factor: 'Exchange Rate Fluctuation', impact: 25, color: 'bg-green-500' },
            { factor: 'Supply Chain Disruption', impact: 20, color: 'bg-yellow-500' },
            { factor: 'Regulatory Changes', impact: 15, color: 'bg-red-500' },
            { factor: 'Market Competition', impact: 5, color: 'bg-purple-500' }
        ].map((item, index) => (<div key={item.factor} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.factor}</span>
                        <span className="text-white font-medium">{item.impact}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <framer_motion_1.motion.div initial={{ width: 0 }} animate={{ width: `${item.impact}%` }} transition={{ duration: 1, delay: index * 0.2 }} className={`h-2 rounded-full ${item.color}`}/>
                      </div>
                    </div>))}
                </div>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Variance Alerts */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Variance Alerts" subtitle="Active alerts and notifications"/>
            <Card_1.CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => (<framer_motion_1.motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                alert.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' :
                    'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {alert.product}
                          </span>
                          <span className={`font-bold ${alert.severity === 'critical' ? 'text-red-600' :
                alert.severity === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'}`}>
                            {alert.variance}%
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{alert.message}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Recommended Action: {alert.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {alert.timestamp}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (<button onClick={() => acknowledgeAlert(alert.id)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
                            Acknowledge
                          </button>)}
                        <button className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PriceVarianceAnalysis;
//# sourceMappingURL=variance.js.map