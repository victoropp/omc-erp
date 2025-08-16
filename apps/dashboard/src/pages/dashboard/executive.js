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
const ui_1 = require("@/components/ui");
const charts_1 = require("@/components/charts");
const api_1 = require("@/services/api");
const auth_store_1 = require("@/stores/auth.store");
const shared_1 = require("@/types/shared");
const ExecutiveDashboardPage = () => {
    const { user } = (0, auth_store_1.useAuthStore)();
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        loadDashboardData();
    }, []);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = await api_1.dashboardService.getExecutiveDashboard();
            setMetrics(data);
        }
        catch (error) {
            console.error('Failed to load executive dashboard:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Sample data - replace with actual API data
    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Revenue (GHS)',
                data: [2400000, 2100000, 2800000, 2500000, 3200000, 3800000, 4100000, 3900000, 4300000, 4000000, 3700000, 4500000],
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 3,
            },
        ],
    };
    const profitabilityData = {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        datasets: [
            {
                label: 'Gross Profit',
                data: [1800000, 2100000, 2400000, 2700000],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
            },
            {
                label: 'Net Profit',
                data: [850000, 1200000, 1400000, 1600000],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
            {
                label: 'Operating Expenses',
                data: [950000, 900000, 1000000, 1100000],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
        ],
    };
    const fuelMixData = {
        labels: ['PMS', 'AGO', 'LPG', 'KERO', 'IFO'],
        datasets: [
            {
                label: 'Sales Volume',
                data: [45, 30, 15, 8, 2],
                backgroundColor: [
                    '#3b82f6',
                    '#ef4444',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                ],
            },
        ],
    };
    const regionalPerformanceData = {
        labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Eastern', 'Volta', 'Upper East', 'Upper West', 'Brong Ahafo'],
        datasets: [
            {
                label: 'Revenue (GHS)',
                data: [8500000, 6200000, 4800000, 3900000, 2100000, 3200000, 2800000, 1500000, 1200000, 2900000],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };
    const kpiCards = [
        {
            title: 'Total Revenue',
            value: 'GHS 45.2M',
            change: '+12.5%',
            changeType: 'increase',
            period: 'vs last year',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        </svg>),
        },
        {
            title: 'Net Profit Margin',
            value: '18.5%',
            change: '+2.1pp',
            changeType: 'increase',
            period: 'vs last quarter',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>),
        },
        {
            title: 'Active Stations',
            value: '247',
            change: '+8',
            changeType: 'increase',
            period: 'this month',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>),
        },
        {
            title: 'Market Share',
            value: '32.8%',
            change: '+1.2pp',
            changeType: 'increase',
            period: 'in Ghana',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
        </svg>),
        },
        {
            title: 'Customer Satisfaction',
            value: '94.2%',
            change: '+3.8pp',
            changeType: 'increase',
            period: 'NPS Score',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>),
        },
        {
            title: 'Compliance Score',
            value: '98.7%',
            change: '+0.5pp',
            changeType: 'increase',
            period: 'regulatory',
            icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>),
        },
    ];
    // Only show executive dashboard to authorized users
    if (user?.role !== shared_1.UserRole.SUPER_ADMIN && user?.role !== shared_1.UserRole.COMPANY_ADMIN) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ui_1.Card className="text-center">
            <ui_1.CardContent>
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
              <p className="text-gray-400">You don't have permission to view the Executive Dashboard.</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Executive Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Strategic overview and key performance indicators for Ghana OMC
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Report
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm" onClick={loadDashboardData}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((kpi, index) => (<framer_motion_1.motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <ui_1.Card className="relative overflow-hidden">
                <ui_1.CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-400 mb-2">{kpi.title}</p>
                      <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                      <div className={`flex items-center text-sm ${kpi.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                        <svg className={`w-4 h-4 mr-1 ${kpi.changeType === 'increase' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                        {kpi.change} {kpi.period}
                      </div>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                      <div className="text-primary-400">
                        {kpi.icon}
                      </div>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <ui_1.Card>
            <ui_1.CardHeader title="Revenue Trend"/>
            <ui_1.CardContent>
              <charts_1.LineChart data={revenueData} height={300} showLegend={false}/>
            </ui_1.CardContent>
          </ui_1.Card>

          {/* Profitability Analysis */}
          <ui_1.Card>
            <ui_1.CardHeader title="Quarterly Profitability"/>
            <ui_1.CardContent>
              <charts_1.BarChart data={profitabilityData} height={300}/>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fuel Mix */}
          <ui_1.Card>
            <ui_1.CardHeader title="Fuel Sales Mix"/>
            <ui_1.CardContent>
              <charts_1.PieChart data={fuelMixData} height={250} variant="doughnut"/>
            </ui_1.CardContent>
          </ui_1.Card>

          {/* Regional Performance */}
          <div className="lg:col-span-2">
            <ui_1.Card>
              <ui_1.CardHeader title="Regional Performance" action={<select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm text-white">
                    <option>2024</option>
                    <option>2023</option>
                  </select>}/>
              <ui_1.CardContent>
                <charts_1.BarChart data={regionalPerformanceData} height={250} showLegend={false}/>
              </ui_1.CardContent>
            </ui_1.Card>
          </div>
        </div>

        {/* Strategic Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">15.2M</div>
              <div className="text-sm text-dark-400">Liters Sold</div>
              <div className="text-xs text-green-400 mt-1">+8.5% MoM</div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="text-center">
              <div className="text-3xl font-bold text-secondary-400 mb-2">24.7%</div>
              <div className="text-sm text-dark-400">EBITDA Margin</div>
              <div className="text-xs text-green-400 mt-1">+1.2pp YoY</div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.2x</div>
              <div className="text-sm text-dark-400">Inventory Turnover</div>
              <div className="text-xs text-green-400 mt-1">+0.3x QoQ</div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">97.8%</div>
              <div className="text-sm text-dark-400">Station Uptime</div>
              <div className="text-xs text-green-400 mt-1">+0.5% MoM</div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Strategic Initiatives */}
        <ui_1.Card>
          <ui_1.CardHeader title="Strategic Initiatives & Key Projects"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Digital Transformation</h4>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">75%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Implementing IoT sensors and digital payment systems across all stations</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Sustainability Program</h4>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">60%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Solar panels and eco-friendly infrastructure across 100 stations</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Market Expansion</h4>
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">40%</span>
                </div>
                <p className="text-sm text-dark-400 mb-3">Opening 50 new stations in underserved regions</p>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ExecutiveDashboardPage;
//# sourceMappingURL=executive.js.map