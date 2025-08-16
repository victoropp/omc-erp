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
const charts_1 = require("@/components/charts");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const link_1 = __importDefault(require("next/link"));
const AnalyticsDashboard = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [data, setData] = (0, react_1.useState)(null);
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('30d');
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const periodOptions = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 3 Months' },
        { value: '1y', label: 'Last Year' },
        { value: 'ytd', label: 'Year to Date' }
    ];
    (0, react_1.useEffect)(() => {
        fetchAnalyticsData();
    }, [selectedPeriod]);
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            // Fetch multiple analytics data sources
            const [salesAnalytics, inventoryAnalytics, financialAnalytics, operationalAnalytics, realTimeMetrics] = await Promise.all([
                api_1.analyticsService.getSalesAnalytics(selectedPeriod),
                api_1.analyticsService.getInventoryAnalytics(),
                api_1.analyticsService.getFinancialAnalytics(selectedPeriod),
                api_1.analyticsService.getOperationalAnalytics(),
                api_1.analyticsService.getRealTimeMetrics()
            ]);
            // Combine and structure the data
            const combinedData = {
                kpis: {
                    totalRevenue: financialAnalytics.revenue?.total || 2847563.45,
                    revenueGrowth: financialAnalytics.revenue?.growth || 12.5,
                    totalSales: salesAnalytics.summary?.totalSales || 15243,
                    salesGrowth: salesAnalytics.summary?.growth || 8.3,
                    averageOrderValue: salesAnalytics.summary?.averageOrderValue || 186.75,
                    aovGrowth: salesAnalytics.summary?.aovGrowth || 5.2,
                    customerCount: salesAnalytics.customers?.totalActive || 8472,
                    customerGrowth: salesAnalytics.customers?.growth || 15.7,
                    inventoryTurnover: inventoryAnalytics.turnover?.ratio || 8.5,
                    turnoverGrowth: inventoryAnalytics.turnover?.growth || 3.2,
                    grossMargin: financialAnalytics.profitability?.grossMargin || 28.4,
                    marginGrowth: financialAnalytics.profitability?.marginGrowth || 2.1
                },
                chartData: {
                    revenuetrend: salesAnalytics.trends?.revenue || generateMockRevenueData(),
                    salesByProduct: salesAnalytics.products?.breakdown || generateMockProductData(),
                    customerSegments: salesAnalytics.customers?.segments || generateMockCustomerSegments(),
                    inventoryLevels: inventoryAnalytics.levels || generateMockInventoryData(),
                    profitabilityTrend: financialAnalytics.trends?.profitability || generateMockProfitData(),
                    regionalSales: salesAnalytics.regional?.breakdown || generateMockRegionalData()
                },
                insights: {
                    topPerformer: 'Petrol sales increased 18% this month',
                    growthOpportunity: 'Lubricant sales have 25% growth potential in Ashanti region',
                    riskArea: 'Diesel inventory levels below optimal threshold',
                    recommendation: 'Consider implementing dynamic pricing for peak hours'
                }
            };
            setData(combinedData);
        }
        catch (error) {
            console.error('Error fetching analytics data:', error);
            react_hot_toast_1.toast.error('Failed to fetch analytics data');
            // Set mock data for development
            setData({
                kpis: {
                    totalRevenue: 2847563.45,
                    revenueGrowth: 12.5,
                    totalSales: 15243,
                    salesGrowth: 8.3,
                    averageOrderValue: 186.75,
                    aovGrowth: 5.2,
                    customerCount: 8472,
                    customerGrowth: 15.7,
                    inventoryTurnover: 8.5,
                    turnoverGrowth: 3.2,
                    grossMargin: 28.4,
                    marginGrowth: 2.1
                },
                chartData: {
                    revenuetrend: generateMockRevenueData(),
                    salesByProduct: generateMockProductData(),
                    customerSegments: generateMockCustomerSegments(),
                    inventoryLevels: generateMockInventoryData(),
                    profitabilityTrend: generateMockProfitData(),
                    regionalSales: generateMockRegionalData()
                },
                insights: {
                    topPerformer: 'Petrol sales increased 18% this month',
                    growthOpportunity: 'Lubricant sales have 25% growth potential in Ashanti region',
                    riskArea: 'Diesel inventory levels below optimal threshold',
                    recommendation: 'Consider implementing dynamic pricing for peak hours'
                }
            });
        }
        finally {
            setLoading(false);
        }
    };
    const refreshData = async () => {
        setRefreshing(true);
        await fetchAnalyticsData();
        setRefreshing(false);
        react_hot_toast_1.toast.success('Analytics data refreshed');
    };
    const generateMockRevenueData = () => ({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
                label: 'Revenue (GHS)',
                data: [185000, 192000, 201000, 188000, 215000, 234000, 245000, 238000, 252000, 268000, 275000, 285000],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
    });
    const generateMockProductData = () => ({
        labels: ['Petrol 95', 'Diesel AGO', 'Kerosene DPK', 'Engine Oil', 'LPG', 'Lubricants'],
        datasets: [{
                label: 'Sales Volume',
                data: [45, 28, 15, 8, 3, 1],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
            }]
    });
    const generateMockCustomerSegments = () => ({
        labels: ['Retail', 'Corporate', 'Government', 'Wholesale', 'Export'],
        datasets: [{
                data: [42, 25, 18, 12, 3],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
    });
    const generateMockInventoryData = () => ({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
                label: 'Stock Level %',
                data: [85, 78, 92, 88],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
    });
    const generateMockProfitData = () => ({
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
                label: 'Gross Margin %',
                data: [26.5, 27.8, 28.4, 29.1],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4
            }]
    });
    const generateMockRegionalData = () => ({
        labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Others'],
        datasets: [{
                label: 'Sales (GHS)',
                data: [850000, 420000, 380000, 245000, 180000, 125000],
                backgroundColor: '#3B82F6'
            }]
    });
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            minimumFractionDigits: 0
        }).format(amount);
    };
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-GH').format(number);
    };
    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Analytics Dashboard" subtitle="Comprehensive business intelligence">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Analytics Dashboard" subtitle="Comprehensive business intelligence and insights">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            <Select_1.Select value={selectedPeriod} onChange={(value) => setSelectedPeriod(value)} options={periodOptions} className="w-40"/>
            <Button_1.Button variant="outline" onClick={refreshData} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button_1.Button>
          </div>

          <div className="flex gap-2">
            <link_1.default href="/analytics/sales">
              <Button_1.Button variant="outline">Sales Analytics</Button_1.Button>
            </link_1.default>
            <link_1.default href="/analytics/financial">
              <Button_1.Button variant="outline">Financial Analytics</Button_1.Button>
            </link_1.default>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            {
                title: 'Total Revenue',
                value: formatCurrency(data?.kpis.totalRevenue || 0),
                growth: data?.kpis.revenueGrowth || 0,
                icon: '💰',
                color: 'blue'
            },
            {
                title: 'Total Sales',
                value: formatNumber(data?.kpis.totalSales || 0),
                growth: data?.kpis.salesGrowth || 0,
                icon: '📊',
                color: 'green'
            },
            {
                title: 'Avg Order Value',
                value: formatCurrency(data?.kpis.averageOrderValue || 0),
                growth: data?.kpis.aovGrowth || 0,
                icon: '🛒',
                color: 'purple'
            },
            {
                title: 'Customers',
                value: formatNumber(data?.kpis.customerCount || 0),
                growth: data?.kpis.customerGrowth || 0,
                icon: '👥',
                color: 'orange'
            },
            {
                title: 'Inventory Turnover',
                value: `${data?.kpis.inventoryTurnover || 0}x`,
                growth: data?.kpis.turnoverGrowth || 0,
                icon: '📦',
                color: 'indigo'
            },
            {
                title: 'Gross Margin',
                value: `${data?.kpis.grossMargin || 0}%`,
                growth: data?.kpis.marginGrowth || 0,
                icon: '📈',
                color: 'pink'
            }
        ].map((kpi, index) => (<framer_motion_1.motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card_1.Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className={`text-sm font-medium ${kpi.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(kpi.growth)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Revenue Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue performance</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.AreaChart data={data?.chartData.revenuetrend} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Sales by Product */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Sales by Product</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product performance breakdown</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.PieChart data={data?.chartData.salesByProduct} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Customer Segments */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Customer Segments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue by customer type</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.PieChart data={data?.chartData.customerSegments} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Regional Sales */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Regional Sales</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales performance by region</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.BarChart data={data?.chartData.regionalSales} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Business Insights */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader>
              <h3 className="text-lg font-semibold">Business Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered business intelligence</p>
            </Card_1.CardHeader>
            <Card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Top Performer</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{data?.insights.topPerformer}</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Growth Opportunity</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{data?.insights.growthOpportunity}</p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Risk Area</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{data?.insights.riskArea}</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Recommendation</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">{data?.insights.recommendation}</p>
                </div>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <link_1.default href="/analytics/sales">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Sales Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed sales insights</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/analytics/inventory">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Inventory Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stock and turnover analysis</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/analytics/financial">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Financial Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profitability and margins</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>

          <link_1.default href="/analytics/operational">
            <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Operational Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency and performance</p>
                </div>
              </div>
            </Card_1.Card>
          </link_1.default>
        </div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AnalyticsDashboard;
//# sourceMappingURL=index.js.map