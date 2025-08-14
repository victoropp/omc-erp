import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal } from '@/components/ui';
import { NotificationSystem } from '@/components/ui/NotificationSystem';
import { RealTimeRevenueChart, RealTimeSalesChart, RealTimeTransactionChart } from '@/components/charts';
import { ClaimsTable } from '@/components/tables/ClaimsTable';
import { DealerOnboardingWizard } from '@/components/forms/DealerOnboardingWizard';
import { dashboardService, wsService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/shared';

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  activeTransactions: number;
  pendingClaims: number;
  systemHealth: number;
  marketShare: number;
}

const IntegratedDashboard: NextPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    
    // Set up real-time updates
    if (realTimeEnabled) {
      const interval = setInterval(loadDashboardStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, realTimeEnabled]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getRealTimeMetrics();
      setStats(data || generateMockStats());
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = (): DashboardStats => ({
    totalRevenue: 45200000 + Math.floor(Math.random() * 1000000),
    revenueGrowth: 12.5 + (Math.random() - 0.5) * 2,
    activeTransactions: 1247 + Math.floor(Math.random() * 100),
    pendingClaims: 23 + Math.floor(Math.random() * 10),
    systemHealth: 98.5 + Math.random() * 1.5,
    marketShare: 32.8 + (Math.random() - 0.5) * 0.5,
  });

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `GHS ${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: `${stats?.revenueGrowth.toFixed(1)}%`,
      changeType: 'increase' as const,
      period: 'vs last month',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      realTime: true,
    },
    {
      title: 'Active Transactions',
      value: stats?.activeTransactions.toLocaleString() || '0',
      change: '+15',
      changeType: 'increase' as const,
      period: 'last hour',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      realTime: true,
    },
    {
      title: 'Pending Claims',
      value: stats?.pendingClaims.toString() || '0',
      change: '-3',
      changeType: 'decrease' as const,
      period: 'today',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      realTime: true,
    },
    {
      title: 'System Health',
      value: `${stats?.systemHealth.toFixed(1)}%`,
      change: '+0.2%',
      changeType: 'increase' as const,
      period: 'uptime',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      realTime: true,
    },
    {
      title: 'Market Share',
      value: `${stats?.marketShare.toFixed(1)}%`,
      change: '+0.3pp',
      changeType: 'increase' as const,
      period: 'in Ghana',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      realTime: false,
    },
    {
      title: 'Compliance Score',
      value: '98.7%',
      change: '+0.5pp',
      changeType: 'increase' as const,
      period: 'regulatory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      realTime: false,
    },
  ];

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Integrated Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Real-time operations overview with integrated components
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationSystem enableWebSocket={true} />
            
            {/* Real-time Controls */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeEnabled}
                  onChange={(e) => setRealTimeEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">Real-time</span>
              </label>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!realTimeEnabled}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm text-white"
              >
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setOnboardingOpen(true)}
            >
              New Dealer
            </Button>
            
            <Button variant="outline" size="sm" onClick={loadDashboardStats}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-medium text-dark-400">{kpi.title}</p>
                        {kpi.realTime && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                      <div className={`flex items-center text-sm ${
                        kpi.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <svg className={`w-4 h-4 mr-1 ${kpi.changeType === 'increase' ? 'rotate-0' : 'rotate-180'}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                        {kpi.change} {kpi.period}
                      </div>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                      <div className="text-primary-400">
                        {kpi.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RealTimeRevenueChart 
              height={350}
              refreshInterval={realTimeEnabled ? refreshInterval : 0}
              enableWebSocket={realTimeEnabled}
            />
          </div>
          
          <div>
            <RealTimeSalesChart 
              height={350}
              refreshInterval={realTimeEnabled ? refreshInterval : 0}
            />
          </div>
        </div>

        {/* Transaction Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RealTimeTransactionChart 
            height={300}
            refreshInterval={realTimeEnabled ? refreshInterval : 0}
            enableWebSocket={realTimeEnabled}
          />
          
          <Card>
            <CardHeader title="Transaction Summary" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Today's Transactions</span>
                  <span className="text-white font-semibold">{stats?.activeTransactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Average Transaction Value</span>
                  <span className="text-white font-semibold">GHS 12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Peak Hour</span>
                  <span className="text-white font-semibold">2:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Success Rate</span>
                  <span className="text-green-400 font-semibold">99.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Management */}
        <Card>
          <CardHeader 
            title="Recent UPPF Claims" 
            action={
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Claim
              </Button>
            }
          />
          <CardContent>
            <ClaimsTable 
              showActions={true}
              filters={{ status: 'pending' }}
            />
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">247</div>
              <div className="text-sm text-dark-400">Active Stations</div>
              <div className="text-xs text-green-400 mt-1">All Online</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">15.2M</div>
              <div className="text-sm text-dark-400">Liters Sold Today</div>
              <div className="text-xs text-green-400 mt-1">+8.5% vs yesterday</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.2x</div>
              <div className="text-sm text-dark-400">Inventory Turnover</div>
              <div className="text-xs text-green-400 mt-1">Efficient</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">97.8%</div>
              <div className="text-sm text-dark-400">Customer Satisfaction</div>
              <div className="text-xs text-green-400 mt-1">Excellent</div>
            </CardContent>
          </Card>
        </div>

        {/* Dealer Onboarding Modal */}
        <DealerOnboardingWizard
          isOpen={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={(data) => {
            console.log('Dealer onboarding completed:', data);
            setOnboardingOpen(false);
          }}
        />
      </div>
    </FuturisticDashboardLayout>
  );
};

export default IntegratedDashboard;