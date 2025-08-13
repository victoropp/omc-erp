import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  DollarSign,
  Truck,
  Droplet,
  Target,
  Globe,
  Brain,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  Settings,
  RefreshCw,
  Download,
  Maximize2,
} from 'lucide-react';
import { Line, Bar, Pie, Radar, Scatter, Area } from 'react-chartjs-2';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAnalytics } from '@/hooks/useAnalytics';
import { KPICard } from '@/components/executive/KPICard';
import { PredictiveInsights } from '@/components/executive/PredictiveInsights';
import { RiskMatrix } from '@/components/executive/RiskMatrix';
import { GeographicHeatmap } from '@/components/executive/GeographicHeatmap';
import { AIRecommendations } from '@/components/executive/AIRecommendations';
import { WhatIfSimulator } from '@/components/executive/WhatIfSimulator';
import { CompetitorAnalysis } from '@/components/executive/CompetitorAnalysis';
import { RealTimeAlerts } from '@/components/executive/RealTimeAlerts';

/**
 * World-Class Executive Intelligence Dashboard
 * Rivals SAP Analytics Cloud, Oracle Analytics Cloud, and Microsoft Power BI
 * Optimized for Ghana OMC Operations
 */
export default function ExecutiveDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  
  const ws = useWebSocket('ws://localhost:3008/executive');
  const analytics = useAnalytics();

  // Real-time KPI data
  const [kpiData, setKpiData] = useState({
    revenue: { value: 0, change: 0, trend: [], target: 0 },
    volume: { value: 0, change: 0, trend: [], target: 0 },
    margin: { value: 0, change: 0, trend: [], target: 0 },
    efficiency: { value: 0, change: 0, trend: [], target: 0 },
    compliance: { value: 0, change: 0, trend: [], target: 0 },
    customerSatisfaction: { value: 0, change: 0, trend: [], target: 0 },
  });

  // AI-powered predictions
  const [predictions, setPredictions] = useState({
    demandForecast: { next7Days: [], confidence: 0 },
    revenueProjection: { monthly: [], quarterly: [], confidence: 0 },
    riskAssessment: { risks: [], mitigations: [] },
    opportunities: { identified: [], potentialValue: 0 },
  });

  // WebSocket real-time updates
  useEffect(() => {
    if (ws) {
      ws.on('kpi:update', (data) => setKpiData(data));
      ws.on('prediction:update', (data) => setPredictions(data));
      ws.on('alert:critical', (alert) => handleCriticalAlert(alert));
    }
  }, [ws]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDashboard();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshDashboard = async () => {
    await analytics.refreshExecutiveMetrics(selectedTimeRange);
  };

  const handleCriticalAlert = (alert: any) => {
    // Handle critical alerts with immediate notification
    console.error('Critical Alert:', alert);
  };

  // Ghana-specific OMC metrics
  const ghanaMetrics = useMemo(() => ({
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8"
      >
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
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-slate-800/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-slate-700"
            >
              <option value="1d">Today</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">Quarter</option>
              <option value="365d">Year</option>
            </select>

            {/* AI Toggle */}
            <button
              onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                aiInsightsEnabled
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-slate-800/50 text-gray-400'
              }`}
            >
              <Brain className="w-4 h-4" />
              AI Insights
            </button>

            {/* Refresh */}
            <button
              onClick={refreshDashboard}
              className="p-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Export */}
            <button className="p-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700/50 transition-all">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Critical KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard
          title="Daily Revenue"
          value={`GHS ${(kpiData.revenue.value / 1000000).toFixed(2)}M`}
          change={kpiData.revenue.change}
          icon={DollarSign}
          trend={kpiData.revenue.trend}
          target={kpiData.revenue.target}
          color="green"
        />
        <KPICard
          title="Volume Sold"
          value={`${(kpiData.volume.value / 1000).toFixed(1)}K L`}
          change={kpiData.volume.change}
          icon={Droplet}
          trend={kpiData.volume.trend}
          target={kpiData.volume.target}
          color="blue"
        />
        <KPICard
          title="Gross Margin"
          value={`${kpiData.margin.value.toFixed(1)}%`}
          change={kpiData.margin.change}
          icon={TrendingUp}
          trend={kpiData.margin.trend}
          target={kpiData.margin.target}
          color="purple"
        />
        <KPICard
          title="Fleet Efficiency"
          value={`${kpiData.efficiency.value.toFixed(1)}%`}
          change={kpiData.efficiency.change}
          icon={Truck}
          trend={kpiData.efficiency.trend}
          target={kpiData.efficiency.target}
          color="yellow"
        />
        <KPICard
          title="Compliance Score"
          value={`${kpiData.compliance.value.toFixed(1)}%`}
          change={kpiData.compliance.change}
          icon={Shield}
          trend={kpiData.compliance.trend}
          target={100}
          color="cyan"
        />
        <KPICard
          title="Customer NPS"
          value={kpiData.customerSatisfaction.value.toFixed(0)}
          change={kpiData.customerSatisfaction.change}
          icon={Target}
          trend={kpiData.customerSatisfaction.trend}
          target={kpiData.customerSatisfaction.target}
          color="pink"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Revenue & Volume Trends */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Revenue & Volume Analysis</h2>
              <button
                onClick={() => setFullscreenWidget('revenue')}
                className="p-1 hover:bg-slate-800 rounded"
              >
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="h-80">
              <Line
                data={{
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
                }}
                options={{
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
                }}
              />
            </div>
          </motion.div>

          {/* Geographic Performance Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Geographic Performance</h2>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Live Station Data</span>
              </div>
            </div>
            
            <GeographicHeatmap
              data={ghanaMetrics}
              selectedMetric={selectedMetric}
              onStationClick={(station) => console.log('Station clicked:', station)}
            />
          </motion.div>

          {/* Predictive Analytics */}
          {aiInsightsEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI-Powered Predictions
                </h2>
                <span className="text-xs text-purple-400">95% Accuracy</span>
              </div>
              
              <PredictiveInsights
                predictions={predictions}
                timeRange={selectedTimeRange}
                onScenarioRun={(scenario) => console.log('Running scenario:', scenario)}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column - Insights & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Critical Alerts
            </h2>
            
            <RealTimeAlerts
              alerts={[
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
              ]}
              onActionClick={(alert) => console.log('Alert action:', alert)}
            />
          </motion.div>

          {/* AI Recommendations */}
          {aiInsightsEnabled && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                AI Recommendations
              </h2>
              
              <AIRecommendations
                recommendations={[
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
                ]}
                onImplement={(rec) => console.log('Implementing:', rec)}
              />
            </motion.div>
          )}

          {/* Risk Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment</h2>
            
            <RiskMatrix
              risks={[
                { name: 'Forex Exposure', probability: 0.7, impact: 0.8 },
                { name: 'Supply Chain', probability: 0.3, impact: 0.6 },
                { name: 'Regulatory', probability: 0.2, impact: 0.9 },
                { name: 'Competition', probability: 0.5, impact: 0.5 },
                { name: 'Operational', probability: 0.4, impact: 0.4 },
              ]}
              onRiskClick={(risk) => console.log('Risk clicked:', risk)}
            />
          </motion.div>

          {/* Competitor Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Market Position</h2>
            
            <CompetitorAnalysis
              marketData={ghanaMetrics.marketShare}
              onCompetitorClick={(competitor) => console.log('Competitor:', competitor)}
            />
          </motion.div>
        </div>
      </div>

      {/* What-If Simulator Modal */}
      <AnimatePresence>
        {fullscreenWidget === 'simulator' && (
          <WhatIfSimulator
            onClose={() => setFullscreenWidget(null)}
            onRunScenario={(scenario) => console.log('Running scenario:', scenario)}
          />
        )}
      </AnimatePresence>

      {/* Ghana-Specific Compliance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
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
      </motion.div>
    </div>
  );
}