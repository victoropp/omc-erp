import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { regulatoryService, financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface ComplianceTrend {
  period: string;
  overallCompliance: number;
  ifrs15Compliance: number;
  ifrs9Compliance: number;
  ifrs16Compliance: number;
  ias36Compliance: number;
  automationRate: number;
  manualAdjustments: number;
  riskScore: number;
}

interface FinancialImpactMetric {
  id: string;
  standard: string;
  impactType: 'revenue' | 'asset' | 'liability' | 'equity' | 'expense';
  impactAmount: number;
  previousAmount: number;
  variance: number;
  variancePercentage: number;
  description: string;
  period: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PredictiveInsight {
  id: string;
  category: 'compliance' | 'financial-impact' | 'operational' | 'regulatory';
  title: string;
  description: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  dataPoints: number[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'compliance' | 'efficiency' | 'risk' | 'automation';
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
  };
}

interface BenchmarkData {
  category: string;
  ourPerformance: number;
  industryAverage: number;
  bestPractice: number;
  gap: number;
  ranking: string;
}

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [timeRange, setTimeRange] = useState('12-months');
  const [complianceTrends, setComplianceTrends] = useState<ComplianceTrend[]>([]);
  const [financialImpacts, setFinancialImpacts] = useState<FinancialImpactMetric[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data - replace with actual API calls
  const sampleTrendsData: ComplianceTrend[] = [
    {
      period: '2024-07',
      overallCompliance: 91.2,
      ifrs15Compliance: 93.5,
      ifrs9Compliance: 88.7,
      ifrs16Compliance: 95.2,
      ias36Compliance: 86.8,
      automationRate: 72.3,
      manualAdjustments: 47,
      riskScore: 2.3
    },
    {
      period: '2024-08',
      overallCompliance: 92.1,
      ifrs15Compliance: 94.2,
      ifrs9Compliance: 89.5,
      ifrs16Compliance: 96.1,
      ias36Compliance: 87.6,
      automationRate: 75.1,
      manualAdjustments: 42,
      riskScore: 2.1
    },
    {
      period: '2024-09',
      overallCompliance: 91.8,
      ifrs15Compliance: 93.8,
      ifrs9Compliance: 88.9,
      ifrs16Compliance: 96.8,
      ias36Compliance: 87.2,
      automationRate: 76.8,
      manualAdjustments: 38,
      riskScore: 2.2
    },
    {
      period: '2024-10',
      overallCompliance: 93.4,
      ifrs15Compliance: 95.1,
      ifrs9Compliance: 90.8,
      ifrs16Compliance: 97.2,
      ias36Compliance: 88.5,
      automationRate: 78.9,
      manualAdjustments: 34,
      riskScore: 1.9
    },
    {
      period: '2024-11',
      overallCompliance: 93.7,
      ifrs15Compliance: 95.8,
      ifrs9Compliance: 91.2,
      ifrs16Compliance: 97.8,
      ias36Compliance: 89.1,
      automationRate: 81.2,
      manualAdjustments: 31,
      riskScore: 1.8
    },
    {
      period: '2024-12',
      overallCompliance: 94.2,
      ifrs15Compliance: 96.3,
      ifrs9Compliance: 92.1,
      ifrs16Compliance: 98.1,
      ias36Compliance: 89.8,
      automationRate: 83.7,
      manualAdjustments: 28,
      riskScore: 1.7
    },
    {
      period: '2025-01',
      overallCompliance: 94.8,
      ifrs15Compliance: 96.8,
      ifrs9Compliance: 92.6,
      ifrs16Compliance: 98.4,
      ias36Compliance: 90.5,
      automationRate: 85.3,
      manualAdjustments: 25,
      riskScore: 1.5
    }
  ];

  const sampleImpactData: FinancialImpactMetric[] = [
    {
      id: 'FIM-001',
      standard: 'IFRS-15',
      impactType: 'revenue',
      impactAmount: 158742693.50,
      previousAmount: 147638291.25,
      variance: 11104402.25,
      variancePercentage: 7.52,
      description: 'Revenue recognition timing adjustments for long-term contracts',
      period: '2025-01',
      riskLevel: 'low'
    },
    {
      id: 'FIM-002',
      standard: 'IFRS-9',
      impactType: 'asset',
      impactAmount: 2847593.75,
      previousAmount: 3247851.50,
      variance: -400257.75,
      variancePercentage: -12.33,
      description: 'Expected credit loss provision adjustments',
      period: '2025-01',
      riskLevel: 'medium'
    },
    {
      id: 'FIM-003',
      standard: 'IFRS-16',
      impactType: 'asset',
      impactAmount: 2972000.00,
      previousAmount: 2842750.00,
      variance: 129250.00,
      variancePercentage: 4.55,
      description: 'Right-of-use asset recognition for new leases',
      period: '2025-01',
      riskLevel: 'low'
    },
    {
      id: 'FIM-004',
      standard: 'IFRS-16',
      impactType: 'liability',
      impactAmount: 2972000.00,
      previousAmount: 2842750.00,
      variance: 129250.00,
      variancePercentage: 4.55,
      description: 'Lease liability recognition for new agreements',
      period: '2025-01',
      riskLevel: 'low'
    },
    {
      id: 'FIM-005',
      standard: 'IAS-36',
      impactType: 'asset',
      impactAmount: 4300000.00,
      previousAmount: 1500000.00,
      variance: 2800000.00,
      variancePercentage: 186.67,
      description: 'Impairment losses on goodwill and equipment',
      period: '2025-01',
      riskLevel: 'high'
    }
  ];

  const sampleInsightsData: PredictiveInsight[] = [
    {
      id: 'PI-001',
      category: 'compliance',
      title: 'IFRS 9 Compliance Trajectory',
      description: 'Expected credit loss compliance is trending upward but may face challenges in Q2 2025 due to portfolio growth.',
      prediction: 'IFRS 9 compliance rate expected to reach 94.5% by Q2 2025, but could drop to 91.2% if current growth trend continues without process improvements.',
      confidence: 87,
      timeframe: '3-6 months',
      impactLevel: 'medium',
      recommendedActions: [
        'Enhance automated ECL calculation processes',
        'Implement real-time portfolio monitoring',
        'Increase frequency of model validation',
        'Strengthen data quality controls'
      ],
      dataPoints: [92.6, 93.1, 93.8, 94.5, 91.2, 90.8],
      trend: 'volatile'
    },
    {
      id: 'PI-002',
      category: 'financial-impact',
      title: 'Revenue Recognition Impact',
      description: 'Revenue adjustments under IFRS 15 are stabilizing, with predictable patterns emerging for contract modifications.',
      prediction: 'Monthly revenue adjustments expected to stabilize between ₵8M-₵12M, with seasonal peaks in Q4.',
      confidence: 92,
      timeframe: '6-12 months',
      impactLevel: 'low',
      recommendedActions: [
        'Implement contract modification tracking',
        'Automate performance obligation analysis',
        'Enhance revenue forecasting models'
      ],
      dataPoints: [11.1, 10.8, 9.7, 8.9, 9.2, 10.4],
      trend: 'stable'
    },
    {
      id: 'PI-003',
      category: 'operational',
      title: 'Automation Efficiency Gains',
      description: 'Current automation trajectory suggests significant efficiency improvements, but manual intervention bottlenecks persist.',
      prediction: 'Automation rate could reach 92% by end of 2025, reducing manual adjustments by 60% and improving accuracy by 15%.',
      confidence: 89,
      timeframe: '9-12 months',
      impactLevel: 'high',
      recommendedActions: [
        'Invest in advanced automation tools',
        'Implement machine learning for anomaly detection',
        'Automate exception handling workflows',
        'Enhance integration between systems'
      ],
      dataPoints: [85.3, 87.1, 88.9, 90.2, 91.5, 92.0],
      trend: 'increasing'
    },
    {
      id: 'PI-004',
      category: 'regulatory',
      title: 'Regulatory Change Impact',
      description: 'Upcoming IFRS amendments and local regulatory changes may significantly impact compliance requirements.',
      prediction: 'New IFRS 17 implementation and NPA regulation updates expected to require 40% increase in compliance monitoring by Q3 2025.',
      confidence: 95,
      timeframe: '6-9 months',
      impactLevel: 'critical',
      recommendedActions: [
        'Establish IFRS 17 implementation team',
        'Conduct gap analysis for new requirements',
        'Upgrade compliance monitoring systems',
        'Plan staff training and development'
      ],
      dataPoints: [100, 115, 125, 135, 140, 145],
      trend: 'increasing'
    }
  ];

  const sampleMetricsData: AnalyticsMetric[] = [
    {
      id: 'AM-001',
      name: 'Overall Compliance Rate',
      value: 94.8,
      target: 95.0,
      unit: '%',
      trend: 'up',
      trendPercentage: 2.3,
      category: 'compliance',
      thresholds: { excellent: 95, good: 90, warning: 85 }
    },
    {
      id: 'AM-002',
      name: 'Automation Efficiency',
      value: 85.3,
      target: 90.0,
      unit: '%',
      trend: 'up',
      trendPercentage: 8.7,
      category: 'efficiency',
      thresholds: { excellent: 90, good: 80, warning: 70 }
    },
    {
      id: 'AM-003',
      name: 'Risk Score',
      value: 1.5,
      target: 2.0,
      unit: '/5',
      trend: 'down',
      trendPercentage: -11.8,
      category: 'risk',
      thresholds: { excellent: 1.5, good: 2.0, warning: 3.0 }
    },
    {
      id: 'AM-004',
      name: 'Manual Adjustments',
      value: 25,
      target: 20,
      unit: 'count',
      trend: 'down',
      trendPercentage: -16.7,
      category: 'efficiency',
      thresholds: { excellent: 20, good: 30, warning: 40 }
    }
  ];

  const sampleBenchmarkData: BenchmarkData[] = [
    {
      category: 'IFRS Compliance Rate',
      ourPerformance: 94.8,
      industryAverage: 91.2,
      bestPractice: 97.5,
      gap: 2.7,
      ranking: 'Above Average'
    },
    {
      category: 'Automation Level',
      ourPerformance: 85.3,
      industryAverage: 78.9,
      bestPractice: 95.2,
      gap: 9.9,
      ranking: 'Above Average'
    },
    {
      category: 'Processing Time',
      ourPerformance: 67,
      industryAverage: 89,
      bestPractice: 45,
      gap: -22,
      ranking: 'Leading'
    },
    {
      category: 'Error Rate',
      ourPerformance: 2.3,
      industryAverage: 4.1,
      bestPractice: 1.2,
      gap: -1.1,
      ranking: 'Above Average'
    }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      // const [trends, impacts, insights, metrics, benchmarks] = await Promise.all([
      //   regulatoryService.get('/ifrs/analytics/trends'),
      //   regulatoryService.get('/ifrs/analytics/financial-impacts'),
      //   regulatoryService.get('/ifrs/analytics/predictive-insights'),
      //   regulatoryService.get('/ifrs/analytics/metrics'),
      //   regulatoryService.get('/ifrs/analytics/benchmarks')
      // ]);
      
      setComplianceTrends(sampleTrendsData);
      setFinancialImpacts(sampleImpactData);
      setPredictiveInsights(sampleInsightsData);
      setAnalyticsMetrics(sampleMetricsData);
      setBenchmarkData(sampleBenchmarkData);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const complianceTrendChart = {
    labels: complianceTrends.map(t => t.period),
    datasets: [
      {
        label: 'Overall Compliance',
        data: complianceTrends.map(t => t.overallCompliance),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'IFRS 15',
        data: complianceTrends.map(t => t.ifrs15Compliance),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'IFRS 9',
        data: complianceTrends.map(t => t.ifrs9Compliance),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      },
      {
        label: 'IFRS 16',
        data: complianceTrends.map(t => t.ifrs16Compliance),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const financialImpactChart = {
    labels: financialImpacts.map(fi => fi.standard),
    datasets: [{
      label: 'Financial Impact (₵M)',
      data: financialImpacts.map(fi => fi.impactAmount / 1000000),
      backgroundColor: financialImpacts.map(fi => 
        fi.riskLevel === 'high' ? '#EF4444' :
        fi.riskLevel === 'medium' ? '#F59E0B' : '#10B981'
      ),
      borderColor: '#374151',
      borderWidth: 1
    }]
  };

  const automationTrendChart = {
    labels: complianceTrends.map(t => t.period),
    datasets: [
      {
        label: 'Automation Rate (%)',
        data: complianceTrends.map(t => t.automationRate),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Manual Adjustments',
        data: complianceTrends.map(t => t.manualAdjustments),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getMetricColor = (metric: AnalyticsMetric) => {
    if (metric.value >= metric.thresholds.excellent) return 'text-green-600';
    if (metric.value >= metric.thresholds.good) return 'text-blue-600';
    if (metric.value >= metric.thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>;
      case 'decreasing':
        return <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>;
      case 'stable':
        return <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const handleGenerateInsights = async () => {
    try {
      // await regulatoryService.post('/ifrs/analytics/generate-insights');
      toast.success('Predictive insights updated');
      loadAnalyticsData();
    } catch (error) {
      toast.error('Failed to generate insights');
    }
  };

  const handleExportAnalytics = async () => {
    try {
      // await regulatoryService.post('/ifrs/analytics/export');
      toast.success('Analytics report exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  return (
    <FuturisticDashboardLayout
      title="IFRS Analytics & Trends"
      subtitle="Advanced Analytics, Predictive Insights & Compliance Intelligence"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="2025-01">January 2025</option>
              <option value="2024-12">December 2024</option>
              <option value="2024-11">November 2024</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="6-months">Last 6 Months</option>
              <option value="12-months">Last 12 Months</option>
              <option value="24-months">Last 24 Months</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Analytics Engine Active
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateInsights}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Insights
            </button>
            <button
              onClick={handleExportAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Analytics
            </button>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.name}
                    </p>
                    <p className={`text-2xl font-bold ${getMetricColor(metric)}`}>
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {metric.trend === 'up' ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    ) : metric.trend === 'down' ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <span className={`${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '' : ''}{metric.trendPercentage.toFixed(1)}%
                  </span>
                  {' | Target: '}{metric.target}{metric.unit}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Trend Overview' },
              { id: 'financial', label: 'Financial Impact' },
              { id: 'predictive', label: 'Predictive Insights' },
              { id: 'benchmarking', label: 'Industry Benchmarking' },
              { id: 'automation', label: 'Automation Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <CardHeader title="IFRS Compliance Trends" />
                <LineChart data={complianceTrendChart} height={350} />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Overall</div>
                    <div className="text-lg font-bold text-blue-600">94.8%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Best Standard</div>
                    <div className="text-lg font-bold text-green-600">IFRS 16: 98.4%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Improvement Area</div>
                    <div className="text-lg font-bold text-orange-600">IAS 36: 90.5%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">6-Month Trend</div>
                    <div className="text-lg font-bold text-green-600">+3.6% ↗</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {selectedTab === 'financial' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <CardHeader title="Financial Impact Analysis" />
                <BarChart data={financialImpactChart} height={300} />
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <CardHeader title="Detailed Financial Impact Breakdown" />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Standard</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Impact Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Previous Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Variance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialImpacts.map((impact, index) => (
                        <motion.tr
                          key={impact.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-blue-600">{impact.standard}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {impact.impactType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{formatCurrency(impact.impactAmount)}</td>
                          <td className="py-3 px-4">{formatCurrency(impact.previousAmount)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${impact.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {impact.variance >= 0 ? '+' : ''}{formatCurrency(impact.variance)}
                              <br />
                              <span className="text-xs">
                                ({impact.variancePercentage >= 0 ? '+' : ''}{impact.variancePercentage.toFixed(2)}%)
                              </span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(impact.riskLevel)}`}>
                              {impact.riskLevel.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate" title={impact.description}>
                            {impact.description}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {selectedTab === 'predictive' && (
          <div className="space-y-6">
            {predictiveInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impactLevel)}`}>
                        {insight.impactLevel.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {insight.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(insight.trend)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Prediction ({insight.timeframe})</h4>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      {insight.prediction}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Actions</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {insight.recommendedActions.map((action, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'benchmarking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Industry Benchmarking Analysis" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Our Performance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Industry Average</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Best Practice</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Gap to Best</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Market Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkData.map((benchmark, index) => (
                      <motion.tr
                        key={benchmark.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{benchmark.category}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            benchmark.ourPerformance > benchmark.industryAverage ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {benchmark.ourPerformance}{benchmark.category.includes('Rate') || benchmark.category.includes('Level') ? '%' : benchmark.category.includes('Time') ? 'min' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{benchmark.industryAverage}{benchmark.category.includes('Rate') || benchmark.category.includes('Level') ? '%' : benchmark.category.includes('Time') ? 'min' : ''}</td>
                        <td className="py-3 px-4 font-medium text-blue-600">{benchmark.bestPractice}{benchmark.category.includes('Rate') || benchmark.category.includes('Level') ? '%' : benchmark.category.includes('Time') ? 'min' : ''}</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${benchmark.gap < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {benchmark.gap > 0 ? '+' : ''}{benchmark.gap}{benchmark.category.includes('Rate') || benchmark.category.includes('Level') ? '%' : benchmark.category.includes('Time') ? 'min' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            benchmark.ranking === 'Leading' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            benchmark.ranking === 'Above Average' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {benchmark.ranking}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader title="Automation Efficiency Analytics" />
              <LineChart 
                data={automationTrendChart} 
                height={350}
                options={{
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: { display: true, text: 'Automation Rate (%)' }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: { display: true, text: 'Manual Adjustments' },
                      grid: { drawOnChartArea: false }
                    }
                  }
                }}
              />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Automation</div>
                  <div className="text-2xl font-bold text-purple-600">85.3%</div>
                  <div className="text-xs text-green-600">↗ +8.7% from 6 months ago</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Manual Adjustments</div>
                  <div className="text-2xl font-bold text-orange-600">25</div>
                  <div className="text-xs text-green-600">↓ -46.8% reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projected Target</div>
                  <div className="text-2xl font-bold text-blue-600">92.0%</div>
                  <div className="text-xs text-blue-600">By December 2025</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default AnalyticsPage;