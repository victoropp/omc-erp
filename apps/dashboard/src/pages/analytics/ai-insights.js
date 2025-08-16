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
const react_hot_toast_1 = require("react-hot-toast");
const AIInsightsPage = () => {
    const [insights, setInsights] = (0, react_1.useState)([]);
    const [forecastData, setForecastData] = (0, react_1.useState)(null);
    const [fraudData, setFraudData] = (0, react_1.useState)(null);
    const [modelPerformance, setModelPerformance] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [timeRange, setTimeRange] = (0, react_1.useState)('30d');
    (0, react_1.useEffect)(() => {
        loadAIData();
    }, [timeRange, activeTab]);
    const loadAIData = async () => {
        try {
            setLoading(true);
            // In production, these would fetch from AI services
            // const [insightsData, forecastData, fraudData, modelData] = await Promise.all([
            //   aiService.getInsights(timeRange),
            //   aiService.getForecastData(timeRange),
            //   aiService.getFraudDetection(),
            //   aiService.getModelPerformance(),
            // ]);
            setInsights(sampleInsights);
            setForecastData(sampleForecastData);
            setFraudData(sampleFraudData);
            setModelPerformance(sampleModelPerformance);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load AI insights');
        }
        finally {
            setLoading(false);
        }
    };
    const timeRangeOptions = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' },
    ];
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'LOW': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'FORECAST':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"/>
          </svg>);
            case 'ANOMALY':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>);
            case 'RECOMMENDATION':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>);
            case 'ALERT':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-6c0-1.1.9-2 2-2s2 .9 2 2v6z"/>
          </svg>);
            default:
                return null;
        }
    };
    // Sample data for demonstration
    const sampleInsights = [
        {
            id: '1',
            type: 'FORECAST',
            title: 'Fuel Demand Spike Predicted',
            description: 'AI models predict a 25% increase in fuel demand over the next 2 weeks due to upcoming holidays and weather patterns.',
            confidence: 87,
            impact: 'HIGH',
            category: 'Demand Planning',
            generatedAt: '2024-01-28T10:30:00Z',
            dataPoints: [],
            actions: ['Increase inventory levels', 'Alert procurement team', 'Review supplier contracts']
        },
        {
            id: '2',
            type: 'ANOMALY',
            title: 'Unusual Transaction Pattern Detected',
            description: 'Detected irregular transaction patterns at Tema station between 2-4 AM. Potential security concern.',
            confidence: 92,
            impact: 'CRITICAL',
            category: 'Security',
            generatedAt: '2024-01-28T08:15:00Z',
            dataPoints: [],
            actions: ['Review security footage', 'Investigate staff schedules', 'Implement additional monitoring']
        },
        {
            id: '3',
            type: 'RECOMMENDATION',
            title: 'Inventory Optimization Opportunity',
            description: 'Current diesel inventory levels are 40% above optimal. Reducing levels could save GHS 150,000 in carrying costs.',
            confidence: 78,
            impact: 'MEDIUM',
            category: 'Inventory',
            generatedAt: '2024-01-28T06:45:00Z',
            dataPoints: [],
            actions: ['Reduce diesel orders by 30%', 'Increase marketing push', 'Review demand forecasts']
        },
        {
            id: '4',
            type: 'ALERT',
            title: 'Price Volatility Warning',
            description: 'International crude oil prices showing high volatility. Consider hedging strategies for next quarter.',
            confidence: 85,
            impact: 'HIGH',
            category: 'Risk Management',
            generatedAt: '2024-01-28T05:20:00Z',
            dataPoints: [],
            actions: ['Review hedging positions', 'Contact finance team', 'Monitor market conditions']
        },
    ];
    const sampleForecastData = {
        demandForecast: [
            { period: 'Week 1', predicted: 450000, confidence: 87, actual: 445000 },
            { period: 'Week 2', predicted: 520000, confidence: 84 },
            { period: 'Week 3', predicted: 495000, confidence: 82 },
            { period: 'Week 4', predicted: 480000, confidence: 79 },
        ],
        priceForecast: [
            { period: 'Feb 2024', predictedPrice: 6.85, confidence: 78, factors: ['International prices', 'Exchange rate', 'Local demand'] },
            { period: 'Mar 2024', predictedPrice: 7.10, confidence: 72, factors: ['Seasonal demand', 'Supply constraints'] },
            { period: 'Apr 2024', predictedPrice: 6.95, confidence: 68, factors: ['Market stabilization'] },
        ],
        inventoryOptimization: [
            { product: 'Premium Motor Spirit', currentLevel: 2500000, recommendedLevel: 1800000, potentialSavings: 150000 },
            { product: 'Diesel', currentLevel: 3200000, recommendedLevel: 2400000, potentialSavings: 180000 },
            { product: 'Kerosene', currentLevel: 850000, recommendedLevel: 650000, potentialSavings: 45000 },
        ],
    };
    const sampleFraudData = {
        riskScore: 23,
        transactions: [
            {
                id: 'TXN-001234',
                timestamp: '2024-01-28T02:15:00Z',
                amount: 25000,
                riskLevel: 'HIGH',
                flags: ['Off-hours transaction', 'Unusual amount', 'New payment method'],
                details: 'Large fuel purchase during off-hours with new mobile money account'
            },
            {
                id: 'TXN-001235',
                timestamp: '2024-01-28T14:30:00Z',
                amount: 500,
                riskLevel: 'MEDIUM',
                flags: ['Rapid transactions', 'Location anomaly'],
                details: 'Multiple small transactions in different locations within short time'
            },
        ],
        patterns: [
            { pattern: 'Off-hours large transactions', frequency: 12, riskIndicator: 78, description: 'Unusual large transactions during non-business hours' },
            { pattern: 'Rapid location changes', frequency: 8, riskIndicator: 65, description: 'Same payment method used across distant locations quickly' },
            { pattern: 'Round number bias', frequency: 45, riskIndicator: 25, description: 'Unusual frequency of round number transactions' },
        ],
    };
    const sampleModelPerformance = {
        models: [
            { name: 'Demand Forecasting', type: 'Time Series', accuracy: 87.5, lastTrained: '2024-01-25', status: 'ACTIVE', predictions: 1250, errors: 156 },
            { name: 'Price Prediction', type: 'Regression', accuracy: 78.2, lastTrained: '2024-01-20', status: 'ACTIVE', predictions: 890, errors: 194 },
            { name: 'Fraud Detection', type: 'Classification', accuracy: 92.1, lastTrained: '2024-01-27', status: 'ACTIVE', predictions: 2345, errors: 185 },
            { name: 'Inventory Optimization', type: 'Reinforcement Learning', accuracy: 84.7, lastTrained: '2024-01-22', status: 'TRAINING', predictions: 567, errors: 87 },
        ],
        performanceMetrics: {
            totalPredictions: 5052,
            averageAccuracy: 85.6,
            totalModels: 4,
            activeModels: 3,
        },
    };
    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z' },
        { id: 'forecasting', label: 'Forecasting', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { id: 'fraud', label: 'Fraud Detection', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'models', label: 'ML Models', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    ];
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              AI Insights & Analytics
            </h1>
            <p className="text-dark-400 mt-2">
              Machine learning powered business intelligence
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Select options={timeRangeOptions} value={timeRange} onChange={setTimeRange} placeholder="Time Range"/>
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Insights
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh Models
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Navigation Tabs */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (<framer_motion_1.motion.button key={tab.id} whileHover={{ y: -2 }} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon}/>
                </svg>
                <span>{tab.label}</span>
              </framer_motion_1.motion.button>))}
          </nav>
        </div>

        {/* Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && (<div className="space-y-8">
              {/* AI Insights Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Active Models</h3>
                    <p className="text-3xl font-bold text-primary-400 mb-1">{modelPerformance?.performanceMetrics.activeModels}</p>
                    <p className="text-sm text-green-400">Running predictions</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Avg Accuracy</h3>
                    <p className="text-3xl font-bold text-green-400 mb-1">{modelPerformance?.performanceMetrics.averageAccuracy}%</p>
                    <p className="text-sm text-dark-400">Model performance</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Critical Alerts</h3>
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {insights.filter(i => i.impact === 'CRITICAL').length}
                    </p>
                    <p className="text-sm text-dark-400">Require attention</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Predictions Today</h3>
                    <p className="text-3xl font-bold text-blue-400 mb-1">{modelPerformance?.performanceMetrics.totalPredictions}</p>
                    <p className="text-sm text-green-400">↑ 15% from yesterday</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>

              {/* Recent Insights */}
              <ui_1.Card>
                <ui_1.CardHeader title="Recent AI Insights"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    {insights.map((insight) => (<framer_motion_1.motion.div key={insight.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-4 p-4 rounded-lg bg-dark-800/50">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getImpactColor(insight.impact)} border`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{insight.title}</h4>
                              <p className="text-dark-400 mt-1">{insight.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-dark-400">
                                  Confidence: {insight.confidence}%
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)} border`}>
                                  {insight.impact}
                                </span>
                                <span className="text-sm text-dark-500">{insight.category}</span>
                              </div>
                            </div>
                            <ui_1.Button variant="ghost" size="sm">
                              View Details
                            </ui_1.Button>
                          </div>
                          {insight.actions && (<div className="mt-3">
                              <p className="text-sm font-medium text-white mb-2">Recommended Actions:</p>
                              <div className="flex flex-wrap gap-2">
                                {insight.actions.map((action, idx) => (<span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                                    {action}
                                  </span>))}
                              </div>
                            </div>)}
                        </div>
                      </framer_motion_1.motion.div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {activeTab === 'forecasting' && forecastData && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Demand Forecasting"/>
                <ui_1.CardContent>
                  <charts_1.LineChart data={forecastData.demandForecast.map(d => ({
                name: d.period,
                predicted: d.predicted,
                actual: d.actual || 0,
                confidence: d.confidence
            }))}/>
                </ui_1.CardContent>
              </ui_1.Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ui_1.Card>
                  <ui_1.CardHeader title="Price Forecasting"/>
                  <ui_1.CardContent>
                    <div className="space-y-4">
                      {forecastData.priceForecast.map((forecast, idx) => (<div key={idx} className="p-4 rounded-lg bg-dark-800/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">{forecast.period}</span>
                            <span className="text-2xl font-bold text-primary-400">
                              GHS {forecast.predictedPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-dark-400">
                            Confidence: {forecast.confidence}%
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {forecast.factors.map((factor, factorIdx) => (<span key={factorIdx} className="inline-flex px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                {factor}
                              </span>))}
                          </div>
                        </div>))}
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardHeader title="Inventory Optimization"/>
                  <ui_1.CardContent>
                    <div className="space-y-4">
                      {forecastData.inventoryOptimization.map((item, idx) => (<div key={idx} className="p-4 rounded-lg bg-dark-800/50">
                          <h4 className="font-medium text-white mb-2">{item.product}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-dark-400">Current Level:</span>
                              <p className="font-medium text-white">{item.currentLevel.toLocaleString()} L</p>
                            </div>
                            <div>
                              <span className="text-dark-400">Recommended:</span>
                              <p className="font-medium text-green-400">{item.recommendedLevel.toLocaleString()} L</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-dark-400">Potential Savings:</span>
                            <p className="font-bold text-green-400">GHS {item.potentialSavings.toLocaleString()}</p>
                          </div>
                        </div>))}
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>
            </div>)}

          {activeTab === 'fraud' && fraudData && (<div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Risk Score</h3>
                    <p className={`text-3xl font-bold mb-1 ${fraudData.riskScore > 70 ? 'text-red-400' :
                fraudData.riskScore > 40 ? 'text-yellow-400' :
                    'text-green-400'}`}>
                      {fraudData.riskScore}/100
                    </p>
                    <p className="text-sm text-dark-400">Overall system risk</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">High Risk Transactions</h3>
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {fraudData.transactions.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length}
                    </p>
                    <p className="text-sm text-dark-400">Require review</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Risk Patterns</h3>
                    <p className="text-3xl font-bold text-orange-400 mb-1">{fraudData.patterns.length}</p>
                    <p className="text-sm text-dark-400">Identified patterns</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>

              <ui_1.Card>
                <ui_1.CardHeader title="High Risk Transactions"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    {fraudData.transactions.map((transaction) => (<div key={transaction.id} className="p-4 rounded-lg bg-dark-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{transaction.id}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${transaction.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    transaction.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                            {transaction.riskLevel} RISK
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-dark-400">Amount:</span>
                            <p className="font-medium text-white">GHS {transaction.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-dark-400">Timestamp:</span>
                            <p className="font-medium text-white">{new Date(transaction.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-dark-400 text-sm mb-2">{transaction.details}</p>
                        <div className="flex flex-wrap gap-1">
                          {transaction.flags.map((flag, idx) => (<span key={idx} className="inline-flex px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                              {flag}
                            </span>))}
                        </div>
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {activeTab === 'models' && modelPerformance && (<div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Total Models</h3>
                    <p className="text-3xl font-bold text-primary-400 mb-1">{modelPerformance.performanceMetrics.totalModels}</p>
                    <p className="text-sm text-dark-400">Deployed models</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Active Models</h3>
                    <p className="text-3xl font-bold text-green-400 mb-1">{modelPerformance.performanceMetrics.activeModels}</p>
                    <p className="text-sm text-dark-400">Currently running</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Avg Accuracy</h3>
                    <p className="text-3xl font-bold text-blue-400 mb-1">{modelPerformance.performanceMetrics.averageAccuracy}%</p>
                    <p className="text-sm text-green-400">↑ 2.3% this month</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Total Predictions</h3>
                    <p className="text-3xl font-bold text-purple-400 mb-1">
                      {modelPerformance.performanceMetrics.totalPredictions.toLocaleString()}
                    </p>
                    <p className="text-sm text-dark-400">This month</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>

              <ui_1.Card>
                <ui_1.CardHeader title="Model Performance"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    {modelPerformance.models.map((model) => (<div key={model.name} className="p-4 rounded-lg bg-dark-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{model.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${model.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    model.status === 'TRAINING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {model.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-dark-400">Type:</span>
                            <p className="font-medium text-white">{model.type}</p>
                          </div>
                          <div>
                            <span className="text-dark-400">Accuracy:</span>
                            <p className="font-medium text-green-400">{model.accuracy}%</p>
                          </div>
                          <div>
                            <span className="text-dark-400">Predictions:</span>
                            <p className="font-medium text-white">{model.predictions.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-dark-400">Last Trained:</span>
                            <p className="font-medium text-white">{new Date(model.lastTrained).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AIInsightsPage;
//# sourceMappingURL=ai-insights.js.map