import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { pricingService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface PricingMetrics {
  totalProducts: number;
  activePricingWindows: number;
  averageMargin: number;
  todaysPriceChanges: number;
  totalPBUComponents: number;
  monthlyVariance: number;
  settlementsPending: number;
  automationRate: number;
}

interface PriceUpdate {
  product: string;
  exPump: number;
  change: string;
  window: string;
  effective: string;
}

const PricingDashboard = () => {
  const [pricingMetrics, setPricingMetrics] = useState<PricingMetrics | null>(null);
  const [recentPriceUpdates, setRecentPriceUpdates] = useState<PriceUpdate[]>([]);
  const [priceVarianceData, setPriceVarianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pricing data from multiple endpoints
      const [priceWindows, pbuComponents, settlements] = await Promise.all([
        pricingService.getPriceWindows(),
        pricingService.getPBUComponents(),
        pricingService.getDealerSettlements()
      ]);

      // Process the data to create metrics
      const processedMetrics = processPricingMetrics(priceWindows, pbuComponents, settlements);
      setPricingMetrics(processedMetrics);
      
      // Process recent price updates
      const updates = processRecentPriceUpdates(priceWindows);
      setRecentPriceUpdates(updates);
      
      // Process price variance trend
      const varianceData = processPriceVarianceTrend(priceWindows);
      setPriceVarianceData(varianceData);

      toast.success('Pricing data loaded successfully');
    } catch (error) {
      console.error('Error loading pricing data:', error);
      setError('Failed to load pricing data');
      toast.error('Failed to load pricing data');
      
      // Fallback to sample data
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const processPricingMetrics = (priceWindows: any[], pbuComponents: any[], settlements: any[]): PricingMetrics => {
    const activePricingWindows = priceWindows.filter(w => w.status === 'active').length;
    const totalPBUComponents = pbuComponents.length;
    const settlementsPending = settlements.filter(s => s.status === 'pending').length;
    
    // Calculate average margin from PBU components
    const averageMargin = pbuComponents.reduce((sum, c) => sum + (c.margin || 0), 0) / Math.max(pbuComponents.length, 1);
    
    return {
      totalProducts: 8, // This would be determined from actual product data
      activePricingWindows,
      averageMargin,
      todaysPriceChanges: priceWindows.filter(w => 
        new Date(w.effectiveDate).toDateString() === new Date().toDateString()
      ).length,
      totalPBUComponents,
      monthlyVariance: 2.3, // This would be calculated from historical price data
      settlementsPending,
      automationRate: 94.2 // This would come from system metrics
    };
  };

  const processRecentPriceUpdates = (priceWindows: any[]): PriceUpdate[] => {
    return priceWindows
      .filter(w => w.status === 'active')
      .slice(0, 5)
      .map(window => ({
        product: window.productName || 'Unknown Product',
        exPump: window.exPumpPrice || 0,
        change: window.priceChange || '+0.00',
        window: window.windowId || window.id,
        effective: window.effectiveDate || new Date().toISOString()
      }));
  };

  const processPriceVarianceTrend = (priceWindows: any[]) => {
    // Group by month and calculate variance
    const monthlyVariances = priceWindows.reduce((acc, window) => {
      const month = new Date(window.effectiveDate || new Date()).toLocaleDateString('en', { month: 'short' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(window.variance || 0);
      return acc;
    }, {});

    // Calculate average variance per month
    const processedData = Object.keys(monthlyVariances).map(month => {
      const variances = monthlyVariances[month];
      const avgVariance = variances.reduce((sum: number, v: number) => sum + v, 0) / variances.length;
      return { month, variance: avgVariance };
    });

    return {
      labels: processedData.map(d => d.month),
      datasets: [{
        label: 'Price Variance %',
        data: processedData.map(d => d.variance),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    };
  };

  const loadSampleData = () => {
    // Fallback sample data
    setPricingMetrics({
      totalProducts: 8,
      activePricingWindows: 3,
      averageMargin: 15.7,
      todaysPriceChanges: 2,
      totalPBUComponents: 12,
      monthlyVariance: 2.3,
      settlementsPending: 5,
      automationRate: 94.2
    });

    setRecentPriceUpdates([
      {
        product: 'Petrol (95 Octane)',
        exPump: 15.45,
        change: '+0.12',
        window: 'Window-2025-001',
        effective: '2025-01-10 06:00'
      },
      {
        product: 'Diesel (AGO)',
        exPump: 14.89,
        change: '-0.08',
        window: 'Window-2025-001',
        effective: '2025-01-10 06:00'
      },
      {
        product: 'Kerosene (DPK)',
        exPump: 13.67,
        change: '+0.05',
        window: 'Window-2025-001',
        effective: '2025-01-10 06:00'
      }
    ]);

    setPriceVarianceData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Price Variance %',
        data: [1.2, 2.8, 1.9, 3.1, 2.3, 1.7],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    });
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Pricing Management Dashboard" subtitle="Price Build-Up & Window Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  if (error && !pricingMetrics) {
    return (
      <FuturisticDashboardLayout title="Pricing Management Dashboard" subtitle="Price Build-Up & Window Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadPricingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout title="Pricing Management Dashboard" subtitle="Price Build-Up & Window Management">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-3xl font-bold text-blue-600">{pricingMetrics?.totalProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Windows</p>
                  <p className="text-3xl font-bold text-green-600">{pricingMetrics?.activePricingWindows || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Margin</p>
                  <p className="text-3xl font-bold text-purple-600">{pricingMetrics?.averageMargin?.toFixed(1) || '0'}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Automation Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{pricingMetrics?.automationRate?.toFixed(1) || '0'}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Price Variance Trend</h3>
              {priceVarianceData ? (
                <LineChart data={priceVarianceData} height={300} />
              ) : (
                <div className="flex items-center justify-center h-72">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">PBU Components Distribution</h3>
              <PieChart 
                data={{
                  labels: ['Ex-Refinery', 'Taxes & Levies', 'Regulatory Margins', 'OMC Margin', 'Dealer Margin'],
                  datasets: [{
                    data: [65, 15, 12, 5, 3],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                  }]
                }}
                height={300}
              />
            </Card>
          </motion.div>
        </div>

        {/* Recent Price Updates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Price Updates</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ex-Pump Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Change</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Window</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Effective</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPriceUpdates.length > 0 ? recentPriceUpdates.map((update, index) => (
                    <motion.tr
                      key={update.product}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{update.product}</td>
                      <td className="py-3 px-4 font-bold">₵{update.exPump.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          update.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {update.change}
                        </span>
                      </td>
                      <td className="py-3 px-4">{update.window}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(update.effective).toLocaleString()}
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                            Loading price updates...
                          </div>
                        ) : (
                          'No recent price updates found'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default PricingDashboard;