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
exports.default = ExecutiveDashboard;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const react_chartjs_2_1 = require("react-chartjs-2");
const useWebSocket_1 = require("@/hooks/useWebSocket");
const useAnalytics_1 = require("@/hooks/useAnalytics");
const KPICard_1 = require("@/components/executive/KPICard");
const PredictiveInsights_1 = require("@/components/executive/PredictiveInsights");
const RiskMatrix_1 = require("@/components/executive/RiskMatrix");
const GeographicHeatmap_1 = require("@/components/executive/GeographicHeatmap");
const AIRecommendations_1 = require("@/components/executive/AIRecommendations");
const WhatIfSimulator_1 = require("@/components/executive/WhatIfSimulator");
const CompetitorAnalysis_1 = require("@/components/executive/CompetitorAnalysis");
const RealTimeAlerts_1 = require("@/components/executive/RealTimeAlerts");
/**
 * World-Class Executive Intelligence Dashboard
 * Rivals SAP Analytics Cloud, Oracle Analytics Cloud, and Microsoft Power BI
 * Optimized for Ghana OMC Operations
 */
function ExecutiveDashboard() {
    const [selectedTimeRange, setSelectedTimeRange] = (0, react_1.useState)('7d');
    const [selectedMetric, setSelectedMetric] = (0, react_1.useState)('revenue');
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(30000); // 30 seconds
    const [fullscreenWidget, setFullscreenWidget] = (0, react_1.useState)(null);
    const [aiInsightsEnabled, setAiInsightsEnabled] = (0, react_1.useState)(true);
    const ws = (0, useWebSocket_1.useWebSocket)('ws://localhost:3008/executive');
    const analytics = (0, useAnalytics_1.useAnalytics)();
    // Real-time KPI data
    const [kpiData, setKpiData] = (0, react_1.useState)({
        revenue: { value: 0, change: 0, trend: [], target: 0 },
        volume: { value: 0, change: 0, trend: [], target: 0 },
        margin: { value: 0, change: 0, trend: [], target: 0 },
        efficiency: { value: 0, change: 0, trend: [], target: 0 },
        compliance: { value: 0, change: 0, trend: [], target: 0 },
        customerSatisfaction: { value: 0, change: 0, trend: [], target: 0 },
    });
    // AI-powered predictions
    const [predictions, setPredictions] = (0, react_1.useState)({
        demandForecast: { next7Days: [], confidence: 0 },
        revenueProjection: { monthly: [], quarterly: [], confidence: 0 },
        riskAssessment: { risks: [], mitigations: [] },
        opportunities: { identified: [], potentialValue: 0 },
    });
    // WebSocket real-time updates
    (0, react_1.useEffect)(() => {
        if (ws) {
            ws.on('kpi:update', (data) => setKpiData(data));
            ws.on('prediction:update', (data) => setPredictions(data));
            ws.on('alert:critical', (alert) => handleCriticalAlert(alert));
        }
    }, [ws]);
    // Auto-refresh
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            refreshDashboard();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);
    const refreshDashboard = async () => {
        await analytics.refreshExecutiveMetrics(selectedTimeRange);
    };
    const handleCriticalAlert = (alert) => {
        // Handle critical alerts with immediate notification
        console.error('Critical Alert:', alert);
    };
    // Ghana-specific OMC metrics
    const ghanaMetrics = (0, react_1.useMemo)(() => ({
        uppfCompliance: {
            submissions: kpiData.compliance.value,
            pendingClaims: 12,
            approvedAmount: 2450000,
            rejectionRate: 2.3,
        },
        npaCompliance: {
            reportingScore: 98.5,
            licenseStatus: 'Active',
            lastInspection: '2025-01-10',
            violations: 0,
        },
        forexExposure: {
            currentExposure: 5200000,
            hedgedPercentage: 75,
            exchangeRate: 15.2,
            sensitivity: -320000,
        },
        marketShare: {
            current: 8.2,
            change: 0.3,
            position: 4,
            competitors: [
                { name: 'GOIL', share: 13.2 },
                { name: 'Star Oil', share: 8.5 },
                { name: 'Shell', share: 8.2 },
                { name: 'TotalEnergies', share: 6.8 },
            ],
        },
    }), [kpiData]);
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"/>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"/>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"/>
        </div>
      </div>

      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Executive Intelligence Center
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time insights powered by AI • Ghana OMC Operations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)} className="bg-slate-800/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-slate-700">
              <option value="1d">Today</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">Quarter</option>
              <option value="365d">Year</option>
            </select>

            {/* AI Toggle */}
            <button onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${aiInsightsEnabled
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
            : 'bg-slate-800/50 text-gray-400'}`}>
              <lucide_react_1.Brain className="w-4 h-4"/>
              AI Insights
            </button>

            {/* Refresh */}
            <button onClick={refreshDashboard} className="p-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700/50 transition-all">
              <lucide_react_1.RefreshCw className="w-4 h-4"/>
            </button>

            {/* Export */}
            <button className="p-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700/50 transition-all">
              <lucide_react_1.Download className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </framer_motion_1.motion.div>

      {/* Critical KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard_1.KPICard title="Daily Revenue" value={`GHS ${(kpiData.revenue.value / 1000000).toFixed(2)}M`} change={kpiData.revenue.change} icon={lucide_react_1.DollarSign} trend={kpiData.revenue.trend} target={kpiData.revenue.target} color="green"/>
        <KPICard_1.KPICard title="Volume Sold" value={`${(kpiData.volume.value / 1000).toFixed(1)}K L`} change={kpiData.volume.change} icon={lucide_react_1.Droplet} trend={kpiData.volume.trend} target={kpiData.volume.target} color="blue"/>
        <KPICard_1.KPICard title="Gross Margin" value={`${kpiData.margin.value.toFixed(1)}%`} change={kpiData.margin.change} icon={lucide_react_1.TrendingUp} trend={kpiData.margin.trend} target={kpiData.margin.target} color="purple"/>
        <KPICard_1.KPICard title="Fleet Efficiency" value={`${kpiData.efficiency.value.toFixed(1)}%`} change={kpiData.efficiency.change} icon={lucide_react_1.Truck} trend={kpiData.efficiency.trend} target={kpiData.efficiency.target} color="yellow"/>
        <KPICard_1.KPICard title="Compliance Score" value={`${kpiData.compliance.value.toFixed(1)}%`} change={kpiData.compliance.change} icon={lucide_react_1.Shield} trend={kpiData.compliance.trend} target={100} color="cyan"/>
        <KPICard_1.KPICard title="Customer NPS" value={kpiData.customerSatisfaction.value.toFixed(0)} change={kpiData.customerSatisfaction.change} icon={lucide_react_1.Target} trend={kpiData.customerSatisfaction.trend} target={kpiData.customerSatisfaction.target} color="pink"/>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Revenue & Volume Trends */}
          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Revenue & Volume Analysis</h2>
              <button onClick={() => setFullscreenWidget('revenue')} className="p-1 hover:bg-slate-800 rounded">
                <lucide_react_1.Maximize2 className="w-4 h-4 text-gray-400"/>
              </button>
            </div>
            
            <div className="h-80">
              <react_chartjs_2_1.Line data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Revenue (GHS)',
                    data: [2.1, 2.3, 2.2, 2.5, 2.4, 2.6, 2.8],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    yAxisID: 'y',
                },
                {
                    label: 'Volume (Liters)',
                    data: [45000, 48000, 46000, 52000, 50000, 54000, 58000],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y1',
                },
            ],
        }} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'white' },
                },
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: 'white' },
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' },
                },
            },
        }}/>
            </div>
          </framer_motion_1.motion.div>

          {/* Geographic Performance Map */}
          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Geographic Performance</h2>
              <div className="flex items-center gap-2">
                <lucide_react_1.Map className="w-4 h-4 text-gray-400"/>
                <span className="text-sm text-gray-400">Live Station Data</span>
              </div>
            </div>
            
            <GeographicHeatmap_1.GeographicHeatmap data={ghanaMetrics} selectedMetric={selectedMetric} onStationClick={(station) => console.log('Station clicked:', station)}/>
          </framer_motion_1.motion.div>

          {/* Predictive Analytics */}
          {aiInsightsEnabled && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <lucide_react_1.Brain className="w-5 h-5 text-purple-400"/>
                  AI-Powered Predictions
                </h2>
                <span className="text-xs text-purple-400">95% Accuracy</span>
              </div>
              
              <PredictiveInsights_1.PredictiveInsights predictions={predictions} timeRange={selectedTimeRange} onScenarioRun={(scenario) => console.log('Running scenario:', scenario)}/>
            </framer_motion_1.motion.div>)}
        </div>

        {/* Right Column - Insights & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Alerts */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="w-5 h-5 text-yellow-400"/>
              Critical Alerts
            </h2>
            
            <RealTimeAlerts_1.RealTimeAlerts alerts={[
            {
                id: '1',
                type: 'critical',
                title: 'Low Tank Level - Accra Station 3',
                message: 'Diesel tank at 12% capacity',
                timestamp: new Date(),
                action: 'Schedule delivery',
            },
            {
                id: '2',
                type: 'warning',
                title: 'UPPF Claim Pending',
                message: '5 claims awaiting submission',
                timestamp: new Date(),
                action: 'Review claims',
            },
            {
                id: '3',
                type: 'info',
                title: 'Price Window Update',
                message: 'New NPA pricing effective tomorrow',
                timestamp: new Date(),
                action: 'View details',
            },
        ]} onActionClick={(alert) => console.log('Alert action:', alert)}/>
          </framer_motion_1.motion.div>

          {/* AI Recommendations */}
          {aiInsightsEnabled && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <lucide_react_1.Zap className="w-5 h-5 text-yellow-400"/>
                AI Recommendations
              </h2>
              
              <AIRecommendations_1.AIRecommendations recommendations={[
                {
                    id: '1',
                    priority: 'high',
                    category: 'revenue',
                    title: 'Optimize Tema Route Pricing',
                    description: 'Increase margin by 2.3% through dynamic pricing',
                    impact: '+GHS 125,000/month',
                    confidence: 0.92,
                },
                {
                    id: '2',
                    priority: 'medium',
                    category: 'efficiency',
                    title: 'Reschedule Fleet Maintenance',
                    description: 'Predictive maintenance can reduce downtime by 30%',
                    impact: 'Save 15 hours/week',
                    confidence: 0.88,
                },
                {
                    id: '3',
                    priority: 'high',
                    category: 'risk',
                    title: 'Hedge Forex Exposure',
                    description: 'USD exposure at critical level, hedge 40% immediately',
                    impact: 'Protect GHS 2.1M',
                    confidence: 0.95,
                },
            ]} onImplement={(rec) => console.log('Implementing:', rec)}/>
            </framer_motion_1.motion.div>)}

          {/* Risk Matrix */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment</h2>
            
            <RiskMatrix_1.RiskMatrix risks={[
            { name: 'Forex Exposure', probability: 0.7, impact: 0.8 },
            { name: 'Supply Chain', probability: 0.3, impact: 0.6 },
            { name: 'Regulatory', probability: 0.2, impact: 0.9 },
            { name: 'Competition', probability: 0.5, impact: 0.5 },
            { name: 'Operational', probability: 0.4, impact: 0.4 },
        ]} onRiskClick={(risk) => console.log('Risk clicked:', risk)}/>
          </framer_motion_1.motion.div>

          {/* Competitor Analysis */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Market Position</h2>
            
            <CompetitorAnalysis_1.CompetitorAnalysis marketData={ghanaMetrics.marketShare} onCompetitorClick={(competitor) => console.log('Competitor:', competitor)}/>
          </framer_motion_1.motion.div>
        </div>
      </div>

      {/* What-If Simulator Modal */}
      <framer_motion_1.AnimatePresence>
        {fullscreenWidget === 'simulator' && (<WhatIfSimulator_1.WhatIfSimulator onClose={() => setFullscreenWidget(null)} onRunScenario={(scenario) => console.log('Running scenario:', scenario)}/>)}
      </framer_motion_1.AnimatePresence>

      {/* Ghana-Specific Compliance Dashboard */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* UPPF Compliance */}
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-800">
          <h3 className="text-lg font-semibold text-white mb-3">UPPF Compliance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Submissions</span>
              <span className="text-white font-semibold">{ghanaMetrics.uppfCompliance.submissions}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pending Claims</span>
              <span className="text-yellow-400 font-semibold">{ghanaMetrics.uppfCompliance.pendingClaims}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Approved</span>
              <span className="text-green-400 font-semibold">GHS {(ghanaMetrics.uppfCompliance.approvedAmount / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>

        {/* NPA Compliance */}
        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-800">
          <h3 className="text-lg font-semibold text-white mb-3">NPA Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Reporting</span>
              <span className="text-white font-semibold">{ghanaMetrics.npaCompliance.reportingScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">License</span>
              <span className="text-green-400 font-semibold">{ghanaMetrics.npaCompliance.licenseStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Violations</span>
              <span className="text-green-400 font-semibold">{ghanaMetrics.npaCompliance.violations}</span>
            </div>
          </div>
        </div>

        {/* Forex Exposure */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800">
          <h3 className="text-lg font-semibold text-white mb-3">Forex Exposure</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Exposure</span>
              <span className="text-white font-semibold">USD {(ghanaMetrics.forexExposure.currentExposure / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hedged</span>
              <span className="text-green-400 font-semibold">{ghanaMetrics.forexExposure.hedgedPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="text-white font-semibold">{ghanaMetrics.forexExposure.exchangeRate}</span>
            </div>
          </div>
        </div>

        {/* Market Share */}
        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-800">
          <h3 className="text-lg font-semibold text-white mb-3">Market Position</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Share</span>
              <span className="text-white font-semibold">{ghanaMetrics.marketShare.current}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position</span>
              <span className="text-white font-semibold">#{ghanaMetrics.marketShare.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Change</span>
              <span className={`font-semibold ${ghanaMetrics.marketShare.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {ghanaMetrics.marketShare.change > 0 ? '+' : ''}{ghanaMetrics.marketShare.change}%
              </span>
            </div>
          </div>
        </div>
      </framer_motion_1.motion.div>
    </div>);
}
//# sourceMappingURL=index.js.map