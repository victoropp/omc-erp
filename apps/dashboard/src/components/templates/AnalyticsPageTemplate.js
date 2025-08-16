"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsPageTemplate = void 0;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Select_1 = require("@/components/ui/Select");
const ui_1 = require("@/components/ui");
const charts_1 = require("@/components/charts");
const RealTimeChart_1 = require("@/components/charts/RealTimeChart");
const link_1 = __importDefault(require("next/link"));
const AnalyticsPageTemplate = ({ title, subtitle, isRealTime = false, lastUpdated, loading = false, refreshing = false, filters = [], actions = [], kpis = [], charts = [], insights = [], quickActions = [], realTimeEndpoint, realTimeUpdateInterval = 30000, onExport, onRefresh, headerContent, footerContent, sidebarContent, }) => {
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
    const getKPIIcon = (icon) => {
        const iconMap = {
            '💰': <span className="text-2xl">💰</span>,
            '📊': <span className="text-2xl">📊</span>,
            '🛒': <span className="text-2xl">🛒</span>,
            '👥': <span className="text-2xl">👥</span>,
            '📦': <span className="text-2xl">📦</span>,
            '📈': <span className="text-2xl">📈</span>,
            '⚡': <span className="text-2xl">⚡</span>,
            '🎯': <span className="text-2xl">🎯</span>,
            '🏆': <span className="text-2xl">🏆</span>,
        };
        return iconMap[icon] || <span className="text-2xl">{icon}</span>;
    };
    const getInsightIcon = (type) => {
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
        };
        return icons[type];
    };
    const getInsightColors = (type) => {
        const colors = {
            success: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
            info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
            warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
            error: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
        };
        return colors[type];
    };
    const renderChart = (chart) => {
        switch (chart.type) {
            case 'line':
                return <charts_1.LineChart data={chart.data} height={chart.height} {...(chart.config || {})}/>;
            case 'bar':
                return <charts_1.BarChart data={chart.data} height={chart.height} {...(chart.config || {})}/>;
            case 'pie':
                return <charts_1.PieChart data={chart.data} height={chart.height} {...(chart.config || {})}/>;
            case 'realtime':
                return (<RealTimeChart_1.RealTimeChart endpoint={realTimeEndpoint || '/analytics/live'} height={chart.height || 300} updateInterval={realTimeUpdateInterval} {...(chart.config || {})}/>);
            default:
                return <div>Unsupported chart type</div>;
        }
    };
    const getGridColsClass = (span = 1) => {
        const spanClasses = {
            1: 'lg:col-span-1',
            2: 'lg:col-span-2',
            3: 'lg:col-span-3',
        };
        return spanClasses[span] || 'lg:col-span-1';
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title={title} subtitle={subtitle}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title={title} subtitle={subtitle}>
      <div className="space-y-6">
        {/* Header Controls */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            {isRealTime && (<ui_1.Badge variant="success">● Live Updates</ui_1.Badge>)}
            {lastUpdated && (<span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>)}
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (<Select_1.Select key={filter.key} value={filter.value} onChange={filter.onChange} options={filter.options} className="w-40"/>))}
            
            {actions.map((action, index) => (<Button_1.Button key={index} variant={action.variant || 'outline'} onClick={action.onClick} disabled={action.disabled || refreshing}>
                {refreshing && action.label === 'Refresh' ? 'Refreshing...' : action.label}
              </Button_1.Button>))}

            {onExport && (<div className="relative group">
                <Button_1.Button variant="outline">Export</Button_1.Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button onClick={() => onExport('csv')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                    Export as CSV
                  </button>
                  <button onClick={() => onExport('excel')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Export as Excel
                  </button>
                  <button onClick={() => onExport('pdf')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">
                    Export as PDF
                  </button>
                </div>
              </div>)}
          </div>

          {headerContent}
        </framer_motion_1.motion.div>

        {/* KPI Cards */}
        {kpis.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi, index) => (<framer_motion_1.motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card_1.Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getKPIIcon(kpi.icon)}
                    {kpi.growth !== undefined && (<span className={`text-sm font-medium ${kpi.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(kpi.growth)}
                      </span>)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                    <p className={`text-2xl font-bold text-${kpi.color}-600`}>
                      {typeof kpi.value === 'number' && kpi.title.toLowerCase().includes('currency')
                    ? formatCurrency(kpi.value)
                    : typeof kpi.value === 'number'
                        ? formatNumber(kpi.value)
                        : kpi.value}
                    </p>
                  </div>
                </Card_1.Card>
              </framer_motion_1.motion.div>))}
          </div>)}

        {/* Charts Grid */}
        {charts.length > 0 && (<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart, index) => (<framer_motion_1.motion.div key={chart.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (chart.delay || 0) + (index * 0.1) }} className={getGridColsClass(chart.span)}>
                <Card_1.Card className="p-6">
                  <Card_1.CardHeader>
                    <h3 className="text-lg font-semibold">{chart.title}</h3>
                    {chart.subtitle && (<p className="text-sm text-gray-600 dark:text-gray-400">{chart.subtitle}</p>)}
                  </Card_1.CardHeader>
                  <Card_1.CardContent>
                    {renderChart(chart)}
                  </Card_1.CardContent>
                </Card_1.Card>
              </framer_motion_1.motion.div>))}
          </div>)}

        {/* Insights Section */}
        {insights.length > 0 && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automated analytics and recommendations</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => (<div key={index} className={`p-4 rounded-lg border ${getInsightColors(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getInsightIcon(insight.type)}</span>
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </div>))}
                </div>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {/* Quick Actions */}
        {quickActions.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (<link_1.default key={index} href={action.href}>
                <Card_1.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${action.color}-100 dark:bg-${action.color}-900 rounded-lg flex items-center justify-center`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                  </div>
                </Card_1.Card>
              </link_1.default>))}
          </div>)}

        {sidebarContent}
        {footerContent}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.AnalyticsPageTemplate = AnalyticsPageTemplate;
exports.default = exports.AnalyticsPageTemplate;
//# sourceMappingURL=AnalyticsPageTemplate.js.map