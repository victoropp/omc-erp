import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { pricingService, regulatoryService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface UPPFMetrics {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  settledClaims: number;
  totalClaimAmount: number;
  averageClaimAmount: number;
  settlementRate: number;
  processingTime: number;
}

interface UPPFClaim {
  id: string;
  route: string;
  amount: number;
  status: 'pending' | 'approved' | 'settled' | 'rejected';
  date: string;
}

const UPPFDashboard = () => {
  const [uppfMetrics, setUppfMetrics] = useState<UPPFMetrics | null>(null);
  const [recentClaims, setRecentClaims] = useState<UPPFClaim[]>([]);
  const [claimsData, setClaimsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUPPFData();
  }, []);

  const loadUPPFData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load UPPF claims and metrics
      const [claims, status] = await Promise.all([
        pricingService.getUPPFClaims(),
        regulatoryService.getUPPFStatus()
      ]);

      // Process claims data for metrics
      const processedMetrics = processClaimsMetrics(claims);
      setUppfMetrics(processedMetrics);
      
      // Set recent claims (latest 10)
      setRecentClaims(claims.slice(0, 10));
      
      // Process claims trend data
      const trendData = processClaimsTrend(claims);
      setClaimsData(trendData);

      toast.success('UPPF data loaded successfully');
    } catch (error) {
      console.error('Error loading UPPF data:', error);
      setError('Failed to load UPPF data');
      toast.error('Failed to load UPPF data');
      
      // Fallback to sample data
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const processClaimsMetrics = (claims: any[]): UPPFMetrics => {
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const approvedClaims = claims.filter(c => c.status === 'approved').length;
    const settledClaims = claims.filter(c => c.status === 'settled').length;
    const totalClaimAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const averageClaimAmount = totalClaims > 0 ? totalClaimAmount / totalClaims : 0;
    const settlementRate = totalClaims > 0 ? (settledClaims / totalClaims) * 100 : 0;
    
    return {
      totalClaims,
      pendingClaims,
      approvedClaims,
      settledClaims,
      totalClaimAmount,
      averageClaimAmount,
      settlementRate,
      processingTime: 4.2 // This would come from the API in real implementation
    };
  };

  const processClaimsTrend = (claims: any[]) => {
    // Group claims by month for trend analysis
    const monthlyData = claims.reduce((acc, claim) => {
      const month = new Date(claim.createdAt || claim.date).toLocaleDateString('en', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Claims Submitted',
        data: Object.values(monthlyData),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };
  };

  const loadSampleData = () => {
    // Fallback sample data
    setUppfMetrics({
      totalClaims: 156,
      pendingClaims: 23,
      approvedClaims: 98,
      settledClaims: 35,
      totalClaimAmount: 2847593.50,
      averageClaimAmount: 18254.45,
      settlementRate: 89.7,
      processingTime: 4.2
    });

    setRecentClaims([
      {
        id: 'UPPF-2025-001',
        route: 'Tema - Kumasi',
        amount: 45230.50,
        status: 'approved',
        date: '2025-01-10'
      },
      {
        id: 'UPPF-2025-002', 
        route: 'Takoradi - Sunyani',
        amount: 32450.75,
        status: 'pending',
        date: '2025-01-09'
      },
      {
        id: 'UPPF-2025-003',
        route: 'Accra - Tamale',
        amount: 67890.25,
        status: 'settled',
        date: '2025-01-08'
      }
    ]);

    setClaimsData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Claims Submitted',
        data: [45, 52, 67, 58, 71, 84],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    });
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="UPPF Management Dashboard" subtitle="Unified Petroleum Pricing Fund Operations">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  if (error && !uppfMetrics) {
    return (
      <FuturisticDashboardLayout title="UPPF Management Dashboard" subtitle="Unified Petroleum Pricing Fund Operations">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadUPPFData}
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
    <FuturisticDashboardLayout title="UPPF Management Dashboard" subtitle="Unified Petroleum Pricing Fund Operations">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Claims</p>
                  <p className="text-3xl font-bold text-blue-600">{uppfMetrics?.totalClaims || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Claims</p>
                  <p className="text-3xl font-bold text-orange-600">{uppfMetrics?.pendingClaims || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">₵{uppfMetrics?.totalClaimAmount?.toLocaleString() || '0'}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Settlement Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{uppfMetrics?.settlementRate?.toFixed(1) || '0'}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
              <h3 className="text-lg font-semibold mb-4">Claims Trend</h3>
              {claimsData ? (
                <LineChart data={claimsData} height={300} />
              ) : (
                <div className="flex items-center justify-center h-72">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
              <h3 className="text-lg font-semibold mb-4">Claims by Status</h3>
              {uppfMetrics ? (
                <PieChart 
                  data={{
                    labels: ['Approved', 'Pending', 'Settled', 'Rejected'],
                    datasets: [{
                      data: [
                        uppfMetrics.approvedClaims, 
                        uppfMetrics.pendingClaims, 
                        uppfMetrics.settledClaims, 
                        Math.max(0, uppfMetrics.totalClaims - uppfMetrics.approvedClaims - uppfMetrics.pendingClaims - uppfMetrics.settledClaims)
                      ],
                      backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
                    }]
                  }}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-72">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Recent Claims Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Claim ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaims.length > 0 ? recentClaims.map((claim, index) => (
                    <motion.tr
                      key={claim.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{claim.id}</td>
                      <td className="py-3 px-4">{claim.route}</td>
                      <td className="py-3 px-4 font-medium">₵{claim.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          claim.status === 'settled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{claim.date}</td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                            Loading claims...
                          </div>
                        ) : (
                          'No recent claims found'
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

export default UPPFDashboard;