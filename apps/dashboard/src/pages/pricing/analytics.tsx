import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart, RealTimeChart } from '@/components/charts';
import { pricingService, wsService } from '@/services/api';
import { toast } from 'react-hot-toast';

const PricingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    priceVolatility: [],
    trendAnalysis: [],
    marginAnalysis: [],
    competitivePosition: [],
    realTimeData: []
  });
  
  const [filters, setFilters] = useState({
    product: 'all',
    region: 'all',
    period: '7d'
  });

  // Mock data for demonstration
  const mockAnalytics = {
    keyMetrics: {
      volatilityIndex: 2.3,
      avgPriceChange: 0.12,
      marginStability: 94.5,
      competitiveScore: 87.2
    },
    priceVolatility: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Price Volatility Index',
        data: [2.1, 2.5, 2.8, 2.3, 1.9, 2.0, 2.3],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    },
    marginAnalysis: {
      labels: ['Petrol', 'Diesel', 'Kerosene', 'LPG'],
      datasets: [{
        label: 'Margin %',
        data: [15.7, 14.2, 16.8, 18.5],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }]
    },
    trendAnalysis: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average Price',
          data: [14.20, 14.45, 14.80, 15.10, 15.45, 15.32],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Competitor Average',
          data: [14.35, 14.52, 14.95, 15.25, 15.58, 15.40],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Setup WebSocket for real-time updates
    wsService.connect();
    
    return () => {
      wsService.disconnect();
    };
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics(mockAnalytics);
      toast.success('Analytics data loaded successfully');
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      toast.loading('Exporting analytics data...');
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
          />
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Pricing Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advanced pricing insights and trend analysis
            </p>
          </div>
          
          <div className="flex space-x-4">
            {/* Filters */}
            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
                Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-white/20 bg-white/10 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportAnalytics('csv')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-lg"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => exportAnalytics('excel')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => exportAnalytics('pdf')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Volatility Index', 
              value: mockAnalytics.keyMetrics.volatilityIndex, 
              suffix: '', 
              color: 'text-purple-500',
              icon: '📊'
            },
            { 
              title: 'Avg Price Change', 
              value: mockAnalytics.keyMetrics.avgPriceChange, 
              suffix: '%', 
              color: 'text-green-500',
              icon: '📈'
            },
            { 
              title: 'Margin Stability', 
              value: mockAnalytics.keyMetrics.marginStability, 
              suffix: '%', 
              color: 'text-blue-500',
              icon: '🎯'
            },
            { 
              title: 'Competitive Score', 
              value: mockAnalytics.keyMetrics.competitiveScore, 
              suffix: '%', 
              color: 'text-orange-500',
              icon: '🏆'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}{metric.suffix}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Volatility Chart */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader 
                title="Price Volatility Trend"
                subtitle="Daily price volatility index over time"
              />
              <CardContent>
                <LineChart data={mockAnalytics.priceVolatility} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Margin Analysis */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader 
                title="Margin Analysis"
                subtitle="Profit margins by product category"
              />
              <CardContent>
                <BarChart data={mockAnalytics.marginAnalysis} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Competitive Analysis */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <CardHeader 
              title="Competitive Price Analysis"
              subtitle="Your pricing vs competitor average"
            />
            <CardContent>
              <LineChart data={mockAnalytics.trendAnalysis} height={400} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Panel */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <CardHeader 
              title="AI-Powered Insights"
              subtitle="Automated analytics and recommendations"
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-400">
                      Optimal Pricing Opportunity
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Consider increasing Diesel margins by 0.8% based on market conditions
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                      Market Trend Alert
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Kerosene demand showing 15% increase - adjust inventory accordingly
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-400">
                      Competitive Risk
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Petrol prices 2.3% above market average - monitor competitor response
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400">
                      Automation Suggestion
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Enable dynamic pricing for LPG to optimize margins automatically
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default PricingAnalytics;