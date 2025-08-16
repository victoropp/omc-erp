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
exports.RealTimeChart = RealTimeChart;
exports.RealTimeRevenueChart = RealTimeRevenueChart;
exports.RealTimeSalesChart = RealTimeSalesChart;
exports.RealTimeTransactionChart = RealTimeTransactionChart;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const index_1 = require("./index");
const api_1 = require("@/services/api");
const ui_1 = require("@/components/ui");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function RealTimeChart({ chartType, title, endpoint, refreshInterval = 30000, // 30 seconds default
height = 300, showRefreshButton = true, enableWebSocket = false, }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdate, setLastUpdate] = (0, react_1.useState)(null);
    const fetchData = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            // Try to fetch real data first
            let response;
            if (endpoint === 'revenue') {
                response = await api_1.dashboardService.getRealTimeMetrics();
            }
            else if (endpoint === 'transactions') {
                response = await api_1.dashboardService.getOperationalDashboard();
            }
            else {
                // Fallback to mock data
                response = generateMockChartData(endpoint);
            }
            setData(response);
            setLastUpdate(new Date());
        }
        catch (err) {
            console.error('Failed to fetch chart data:', err);
            setError('Failed to load data');
            // Use mock data as fallback
            setData(generateMockChartData(endpoint));
            setLastUpdate(new Date());
        }
        finally {
            setLoading(false);
        }
    }, [endpoint]);
    // Initial data load
    (0, react_1.useEffect)(() => {
        fetchData();
    }, [fetchData]);
    // Set up polling for real-time updates
    (0, react_1.useEffect)(() => {
        if (!enableWebSocket && refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval, enableWebSocket]);
    // WebSocket connection for real-time updates
    (0, react_1.useEffect)(() => {
        if (enableWebSocket) {
            api_1.wsService.connect();
            return () => api_1.wsService.disconnect();
        }
    }, [enableWebSocket]);
    const generateMockChartData = (type) => {
        const now = new Date();
        const labels = Array.from({ length: 12 }, (_, i) => {
            const month = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
            return month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        switch (type) {
            case 'revenue':
                return {
                    labels,
                    datasets: [{
                            label: 'Revenue (GHS)',
                            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 2000000) + 2000000),
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 3,
                            fill: true,
                        }],
                };
            case 'sales':
                return {
                    labels: ['PMS', 'AGO', 'LPG', 'KERO', 'IFO'],
                    datasets: [{
                            label: 'Sales Volume (%)',
                            data: [45, 30, 15, 8, 2],
                            backgroundColor: [
                                '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'
                            ],
                        }],
                };
            case 'transactions':
                return {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                            label: 'Daily Transactions',
                            data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000) + 1000),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 2,
                        }],
                };
            default:
                return {
                    labels: ['Data'],
                    datasets: [{
                            label: 'No Data',
                            data: [0],
                            backgroundColor: 'rgba(107, 114, 128, 0.5)',
                        }],
                };
        }
    };
    const renderChart = () => {
        if (!data)
            return null;
        const chartProps = {
            data,
            height,
            animate: true,
            showLegend: chartType !== 'line',
        };
        switch (chartType) {
            case 'line':
                return <index_1.LineChart {...chartProps} fill={true}/>;
            case 'bar':
                return <index_1.BarChart {...chartProps}/>;
            case 'pie':
                return <index_1.DoughnutChart {...chartProps}/>;
            default:
                return <index_1.LineChart {...chartProps}/>;
        }
    };
    return (<ui_1.Card className="relative">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center space-x-2">
            {/* Live indicator */}
            {!loading && !error && (<div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live</span>
              </div>)}
            
            {/* Last update time */}
            {lastUpdate && (<span className="text-xs text-dark-400">
                {lastUpdate.toLocaleTimeString()}
              </span>)}
            
            {/* Refresh button */}
            {showRefreshButton && (<ui_1.Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
                <framer_motion_1.motion.svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={loading ? { rotate: 360 } : {}} transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </framer_motion_1.motion.svg>
              </ui_1.Button>)}
          </div>
        </div>

        {/* Chart content */}
        <div className="relative">
          {loading && (<div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm rounded-lg z-10">
              <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8">
                <svg className="w-full h-full text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </framer_motion_1.motion.div>
            </div>)}

          {error && (<div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
                <ui_1.Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
                  Retry
                </ui_1.Button>
              </div>
            </div>)}

          {!loading && !error && data && renderChart()}
        </div>
      </div>
    </ui_1.Card>);
}
// Specialized real-time chart components
function RealTimeRevenueChart(props) {
    return (<RealTimeChart {...props} chartType="line" endpoint="revenue" title="Live Revenue Tracking"/>);
}
function RealTimeSalesChart(props) {
    return (<RealTimeChart {...props} chartType="pie" endpoint="sales" title="Fuel Sales Distribution"/>);
}
function RealTimeTransactionChart(props) {
    return (<RealTimeChart {...props} chartType="bar" endpoint="transactions" title="Daily Transaction Volume"/>);
}
//# sourceMappingURL=RealTimeChart.js.map