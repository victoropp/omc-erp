import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui';
import { LineChart, BarChart, PieChart, RealTimeChart } from '@/components/charts';
import { crmService, operationsService, pricingService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface DealerAnalytics {
  dealerId: string;
  dealerName: string;
  location: string;
  region: string;
  performanceMetrics: {
    monthlyRevenue: number;
    monthlyVolume: number;
    marginCompliance: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
    profitability: number;
  };
  trendsData: {
    revenue: number[];
    volume: number[];
    transactions: number[];
    customers: number[];
  };
  rankings: {
    revenueRank: number;
    volumeRank: number;
    complianceRank: number;
    efficiencyRank: number;
  };
  forecasts: {
    predictedRevenue: number;
    predictedVolume: number;
    growthRate: number;
    riskScore: number;
  };
}

interface RegionalAnalytics {
  region: string;
  dealerCount: number;
  totalRevenue: number;
  totalVolume: number;
  averageMargin: number;
  topPerformer: string;
  growthRate: number;
  marketShare: number;
}

interface ProductAnalytics {
  product: 'PETROL' | 'DIESEL' | 'KEROSENE' | 'LPG';
  totalVolume: number;
  totalRevenue: number;
  averagePrice: number;
  marginPercentage: number;
  demandTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  seasonality: number[];
  topDealers: string[];
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  retentionRate: number;
  averageTransactionValue: number;
  customerSegments: {
    individual: number;
    corporate: number;
    government: number;
  };
  loyaltyData: {
    enrolled: number;
    active: number;
    pointsRedeemed: number;
  };
}

const DealerAnalytics = () => {
  const [dealerAnalytics, setDealerAnalytics] = useState<DealerAnalytics[]>([]);
  const [regionalAnalytics, setRegionalAnalytics] = useState<RegionalAnalytics[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30_DAYS');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedMetric, setSelectedMetric] = useState('REVENUE');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    // Set up real-time data updates
    const interval = setInterval(() => {
      updateRealtimeData();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedPeriod, selectedRegion]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - would come from API
      const mockDealerAnalytics: DealerAnalytics[] = [
        {
          dealerId: 'DLR-001',
          dealerName: 'Accra Central Fuel Station',
          location: 'Accra, Greater Accra',
          region: 'Greater Accra',
          performanceMetrics: {
            monthlyRevenue: 1250000,
            monthlyVolume: 45000,
            marginCompliance: 98.5,
            customerSatisfaction: 4.7,
            operationalEfficiency: 92.3,
            profitability: 18.2
          },
          trendsData: {
            revenue: [950000, 1050000, 1150000, 1200000, 1250000, 1300000],
            volume: [38000, 41000, 43000, 44000, 45000, 46000],
            transactions: [1200, 1350, 1450, 1480, 1520, 1580],
            customers: [850, 920, 980, 1020, 1050, 1080]
          },
          rankings: {
            revenueRank: 1,
            volumeRank: 2,
            complianceRank: 1,
            efficiencyRank: 3
          },
          forecasts: {
            predictedRevenue: 1380000,
            predictedVolume: 48000,
            growthRate: 8.5,
            riskScore: 15
          }
        },
        {
          dealerId: 'DLR-002',
          dealerName: 'Kumasi North Petroleum',
          location: 'Kumasi, Ashanti',
          region: 'Ashanti',
          performanceMetrics: {
            monthlyRevenue: 980000,
            monthlyVolume: 38000,
            marginCompliance: 95.2,
            customerSatisfaction: 4.5,
            operationalEfficiency: 89.1,
            profitability: 16.8
          },
          trendsData: {
            revenue: [820000, 890000, 920000, 950000, 980000, 1010000],
            volume: [32000, 34000, 36000, 37000, 38000, 39000],
            transactions: [980, 1080, 1150, 1200, 1250, 1300],
            customers: [720, 780, 820, 850, 880, 900]
          },
          rankings: {
            revenueRank: 2,
            volumeRank: 3,
            complianceRank: 3,
            efficiencyRank: 5
          },
          forecasts: {
            predictedRevenue: 1050000,
            predictedVolume: 40000,
            growthRate: 6.2,
            riskScore: 22
          }
        }
      ];

      const mockRegionalAnalytics: RegionalAnalytics[] = [
        {
          region: 'Greater Accra',
          dealerCount: 12,
          totalRevenue: 8500000,
          totalVolume: 320000,
          averageMargin: 12.8,
          topPerformer: 'Accra Central Fuel Station',
          growthRate: 7.2,
          marketShare: 35.5
        },
        {
          region: 'Ashanti',
          dealerCount: 10,
          totalRevenue: 6800000,
          totalVolume: 280000,
          averageMargin: 11.9,
          topPerformer: 'Kumasi North Petroleum',
          growthRate: 5.8,
          marketShare: 28.4
        },
        {
          region: 'Western',
          dealerCount: 8,
          totalRevenue: 4200000,
          totalVolume: 190000,
          averageMargin: 12.1,
          topPerformer: 'Takoradi Port Fuel',
          growthRate: 4.3,
          marketShare: 17.6
        }
      ];

      const mockProductAnalytics: ProductAnalytics[] = [
        {
          product: 'PETROL',
          totalVolume: 450000,
          totalRevenue: 18500000,
          averagePrice: 6.85,
          marginPercentage: 12.5,
          demandTrend: 'INCREASING',
          seasonality: [0.95, 0.98, 1.02, 1.05, 1.08, 1.12],
          topDealers: ['Accra Central Fuel Station', 'Kumasi North Petroleum']
        },
        {
          product: 'DIESEL',
          totalVolume: 380000,
          totalRevenue: 14200000,
          averagePrice: 6.20,
          marginPercentage: 11.8,
          demandTrend: 'STABLE',
          seasonality: [1.00, 1.02, 0.98, 0.96, 1.04, 1.08],
          topDealers: ['Takoradi Port Fuel', 'Cape Coast Energy Hub']
        },
        {
          product: 'KEROSENE',
          totalVolume: 45000,
          totalRevenue: 1800000,
          averagePrice: 5.50,
          marginPercentage: 13.2,
          demandTrend: 'DECREASING',
          seasonality: [1.15, 1.08, 0.92, 0.88, 0.95, 1.02],
          topDealers: ['Ho Central Filling Station', 'Tamale Highway Service']
        }
      ];

      const mockCustomerAnalytics: CustomerAnalytics = {
        totalCustomers: 45600,
        newCustomers: 2840,
        retentionRate: 87.3,
        averageTransactionValue: 285,
        customerSegments: {
          individual: 38500,
          corporate: 5800,
          government: 1300
        },
        loyaltyData: {
          enrolled: 12800,
          active: 9600,
          pointsRedeemed: 185000
        }
      };

      setDealerAnalytics(mockDealerAnalytics);
      setRegionalAnalytics(mockRegionalAnalytics);
      setProductAnalytics(mockProductAnalytics);
      setCustomerAnalytics(mockCustomerAnalytics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  const updateRealtimeData = () => {
    // Simulate real-time data updates
    const newData = {
      timestamp: new Date().toISOString(),
      revenue: Math.random() * 50000 + 200000,
      volume: Math.random() * 2000 + 8000,
      transactions: Math.random() * 50 + 150
    };
    setRealtimeData(prev => [...prev.slice(-20), newData]);
  };

  const analyticsMetrics = {
    totalRevenue: dealerAnalytics.reduce((sum, dealer) => sum + dealer.performanceMetrics.monthlyRevenue, 0),
    totalVolume: dealerAnalytics.reduce((sum, dealer) => sum + dealer.performanceMetrics.monthlyVolume, 0),
    averageMarginCompliance: dealerAnalytics.reduce((sum, dealer) => sum + dealer.performanceMetrics.marginCompliance, 0) / dealerAnalytics.length,
    averageCustomerSatisfaction: dealerAnalytics.reduce((sum, dealer) => sum + dealer.performanceMetrics.customerSatisfaction, 0) / dealerAnalytics.length,
    totalDealers: dealerAnalytics.length,
    topPerformer: dealerAnalytics.sort((a, b) => b.performanceMetrics.monthlyRevenue - a.performanceMetrics.monthlyRevenue)[0]?.dealerName
  };

  // Chart data
  const revenueComparisonData = {
    labels: dealerAnalytics.map(d => d.dealerName.substring(0, 15) + '...'),
    datasets: [{
      label: 'Monthly Revenue (₵)',
      data: dealerAnalytics.map(d => d.performanceMetrics.monthlyRevenue),
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
      borderWidth: 1
    }]
  };

  const regionalPerformanceData = {
    labels: regionalAnalytics.map(r => r.region),
    datasets: [
      {
        label: 'Revenue (₵M)',
        data: regionalAnalytics.map(r => r.totalRevenue / 1000000),
        backgroundColor: '#10B981'
      },
      {
        label: 'Volume (000L)',
        data: regionalAnalytics.map(r => r.totalVolume / 1000),
        backgroundColor: '#F59E0B'
      }
    ]
  };

  const productMixData = {
    labels: productAnalytics.map(p => p.product),
    datasets: [{
      data: productAnalytics.map(p => p.totalVolume),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: dealerAnalytics.map((dealer, index) => ({
      label: dealer.dealerName,
      data: dealer.trendsData.revenue.map(r => r / 1000000),
      borderColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index],
      backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(139, 92, 246, 0.1)'][index],
      tension: 0.4
    }))
  };

  const customerSegmentData = customerAnalytics ? {
    labels: ['Individual', 'Corporate', 'Government'],
    datasets: [{
      data: [
        customerAnalytics.customerSegments.individual,
        customerAnalytics.customerSegments.corporate,
        customerAnalytics.customerSegments.government
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null;

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Dealer Analytics" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Dealer Analytics & Insights" 
      subtitle="Advanced analytics and business intelligence for dealer performance optimization"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex flex-wrap items-center space-x-4 space-y-2">
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                options={[
                  { value: '7_DAYS', label: 'Last 7 Days' },
                  { value: '30_DAYS', label: 'Last 30 Days' },
                  { value: '90_DAYS', label: 'Last 90 Days' },
                  { value: '1_YEAR', label: 'Last Year' }
                ]}
                className="min-w-40"
              />
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Regions' },
                  { value: 'Greater_Accra', label: 'Greater Accra' },
                  { value: 'Ashanti', label: 'Ashanti' },
                  { value: 'Western', label: 'Western' }
                ]}
                className="min-w-40"
              />
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                options={[
                  { value: 'REVENUE', label: 'Revenue' },
                  { value: 'VOLUME', label: 'Volume' },
                  { value: 'MARGIN', label: 'Margin' },
                  { value: 'EFFICIENCY', label: 'Efficiency' }
                ]}
                className="min-w-40"
              />
              <Button variant="outline" onClick={loadAnalyticsData}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-blue-600">₵{(analyticsMetrics.totalRevenue / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-green-600 font-medium">+12.5% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                  <p className="text-3xl font-bold text-green-600">{(analyticsMetrics.totalVolume / 1000).toFixed(0)}K L</p>
                  <p className="text-xs text-green-600 font-medium">+8.3% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Compliance</p>
                  <p className="text-3xl font-bold text-purple-600">{analyticsMetrics.averageMarginCompliance.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 font-medium">+1.2% vs last period</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">{analyticsMetrics.averageCustomerSatisfaction.toFixed(1)}/5</p>
                  <p className="text-xs text-yellow-600 font-medium">+0.2 vs last period</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Dealers</p>
                  <p className="text-3xl font-bold text-indigo-600">{analyticsMetrics.totalDealers}</p>
                  <p className="text-xs text-indigo-600 font-medium">+2 new this month</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Performer</p>
                  <p className="text-lg font-bold text-emerald-600 leading-tight">{analyticsMetrics.topPerformer?.substring(0, 12)}...</p>
                  <p className="text-xs text-emerald-600 font-medium">Leading in revenue</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3l1.53 3.09L17 6.72l-1.17 2.73L17 12l-3.47-.73L12 14l-1.53-2.73L7 12l1.17-2.55L7 6.72l3.47.37L12 3z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Real-time Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Real-time Performance</h3>
              <Badge variant="success">LIVE</Badge>
            </div>
            {realtimeData.length > 0 && (
              <RealTimeChart
                data={realtimeData}
                height={200}
                valueKey="revenue"
                label="Revenue (₵)"
                color="#3B82F6"
              />
            )}
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <div className="flex space-x-4 border-b mb-4">
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('overview')}
              >
                Overview
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'performance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('performance')}
              >
                Performance
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'regional' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('regional')}
              >
                Regional
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('products')}
              >
                Products
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'customers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('customers')}
              >
                Customers
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'forecasts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('forecasts')}
              >
                Forecasts
              </button>
            </div>

            {selectedTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Revenue Comparison</h4>
                  <BarChart data={revenueComparisonData} height={300} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Performance Trends</h4>
                  <LineChart data={performanceTrendData} height={300} />
                </div>
              </div>
            )}

            {selectedTab === 'performance' && (
              <div>
                <h4 className="text-lg font-semibold mb-6">Dealer Performance Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Volume</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Compliance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Satisfaction</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Efficiency</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Profitability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerAnalytics.map((dealer, index) => (
                        <motion.tr
                          key={dealer.dealerId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{dealer.dealerName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{dealer.location}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold">₵{dealer.performanceMetrics.monthlyRevenue.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">{dealer.performanceMetrics.monthlyVolume.toLocaleString()}L</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="font-medium">{dealer.performanceMetrics.marginCompliance.toFixed(1)}%</span>
                              <div className={`w-2 h-2 rounded-full ml-2 ${
                                dealer.performanceMetrics.marginCompliance >= 95 ? 'bg-green-500' : 
                                dealer.performanceMetrics.marginCompliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="font-medium">{dealer.performanceMetrics.customerSatisfaction.toFixed(1)}</span>
                              <span className="text-yellow-500 ml-1">★</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{dealer.performanceMetrics.operationalEfficiency.toFixed(1)}%</td>
                          <td className="py-3 px-4 font-bold text-green-600">{dealer.performanceMetrics.profitability.toFixed(1)}%</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'regional' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Regional Performance</h4>
                    <BarChart data={regionalPerformanceData} height={300} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Regional Summary</h4>
                    <div className="space-y-4">
                      {regionalAnalytics.map((region, index) => (
                        <motion.div
                          key={region.region}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">{region.region}</h5>
                            <Badge variant="outline">{region.dealerCount} dealers</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Revenue</p>
                              <p className="font-bold">₵{(region.totalRevenue / 1000000).toFixed(1)}M</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Growth Rate</p>
                              <p className={`font-bold ${region.growthRate >= 5 ? 'text-green-600' : 'text-orange-600'}`}>
                                {region.growthRate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Market Share</p>
                              <p className="font-bold">{region.marketShare.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Top Performer</p>
                              <p className="font-bold text-blue-600">{region.topPerformer}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'products' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Product Mix</h4>
                    <PieChart data={productMixData} height={300} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Product Performance</h4>
                    <div className="space-y-4">
                      {productAnalytics.map((product, index) => (
                        <motion.div
                          key={product.product}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">{product.product}</h5>
                            <Badge variant={product.demandTrend === 'INCREASING' ? 'success' : product.demandTrend === 'STABLE' ? 'primary' : 'warning'}>
                              {product.demandTrend}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Volume</p>
                              <p className="font-bold">{product.totalVolume.toLocaleString()}L</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg Price</p>
                              <p className="font-bold">₵{product.averagePrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Margin</p>
                              <p className="font-bold text-green-600">{product.marginPercentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'customers' && customerAnalytics && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Customer Segments</h4>
                    <PieChart data={customerSegmentData} height={300} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Customer Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-blue-600">{customerAnalytics.totalCustomers.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-gray-600">New This Month</p>
                        <p className="text-2xl font-bold text-green-600">{customerAnalytics.newCustomers.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600">Retention Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{customerAnalytics.retentionRate.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm text-gray-600">Avg Transaction</p>
                        <p className="text-2xl font-bold text-orange-600">₵{customerAnalytics.averageTransactionValue}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 border rounded-lg">
                      <h5 className="font-semibold mb-2">Loyalty Program</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Enrolled</p>
                          <p className="font-bold">{customerAnalytics.loyaltyData.enrolled.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Active</p>
                          <p className="font-bold">{customerAnalytics.loyaltyData.active.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Points Redeemed</p>
                          <p className="font-bold">{customerAnalytics.loyaltyData.pointsRedeemed.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'forecasts' && (
              <div>
                <h4 className="text-lg font-semibold mb-6">AI-Powered Forecasts & Predictions</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dealerAnalytics.map((dealer, index) => (
                    <motion.div
                      key={dealer.dealerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="p-6 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold">{dealer.dealerName}</h5>
                        <Badge variant={dealer.forecasts.riskScore < 20 ? 'success' : dealer.forecasts.riskScore < 40 ? 'warning' : 'danger'}>
                          {dealer.forecasts.riskScore < 20 ? 'Low Risk' : dealer.forecasts.riskScore < 40 ? 'Medium Risk' : 'High Risk'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-xs text-gray-600">Predicted Revenue</p>
                          <p className="text-lg font-bold text-blue-600">₵{dealer.forecasts.predictedRevenue.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+{dealer.forecasts.growthRate.toFixed(1)}% growth</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="text-xs text-gray-600">Predicted Volume</p>
                          <p className="text-lg font-bold text-green-600">{dealer.forecasts.predictedVolume.toLocaleString()}L</p>
                          <p className="text-xs text-gray-600">Next month</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Risk Factors:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Market competition level: {dealer.forecasts.riskScore > 30 ? 'High' : 'Moderate'}</li>
                          <li>• Seasonal demand variation: Normal</li>
                          <li>• Operational efficiency: {dealer.performanceMetrics.operationalEfficiency > 90 ? 'Excellent' : 'Good'}</li>
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Report</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Schedule Briefing</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                </svg>
                <span>Configure KPIs</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13.5 6H4a2 2 0 00-2 2v8a2 2 0 002 2h5.5m0 0L13 14h-1.5v4.5z" />
                </svg>
                <span>AI Insights</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DealerAnalytics;