import React from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { DashboardStats } from './dashboard-stats';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/shared';

const DashboardPage: NextPage = () => {
  const { user } = useAuthStore();

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
              Dashboard Overview
            </h1>
            <p className="text-dark-400 mt-2">
              Welcome back, {user?.firstName}! Here's what's happening with your fuel stations today.
            </p>
          </div>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass rounded-xl px-6 py-3 text-sm font-medium text-white border border-white/10 
                       hover:bg-white/10 transition-all duration-300"
            >
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-primary text-white rounded-xl px-6 py-3 text-sm font-medium 
                       hover:opacity-90 transition-all duration-300 shadow-glow-primary"
            >
              New Transaction
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <DashboardStats />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PricingStatusCard />
            <RecentTransactionsCard />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <UPPFClaimsCard />
            <StationStatusCard />
            <SystemAlertsCard />
            
            {/* Admin-only System Health */}
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.COMPANY_ADMIN) && (
              <SystemHealthCard />
            )}
          </div>
        </div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DashboardPage;

// Futuristic card components with glassmorphism
function PricingStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-3xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Current Pricing Window</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">2025W03 Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { fuel: 'PMS', price: '₵14.85', change: '+₵0.12' },
          { fuel: 'AGO', price: '₵15.20', change: '+₵0.08' },
          { fuel: 'LPG', price: '₵12.50', change: '-₵0.05' },
          { fuel: 'KERO', price: '₵13.75', change: '+₵0.15' },
        ].map((item, index) => (
          <div key={item.fuel} className="glass rounded-xl p-4 border border-white/10">
            <div className="text-sm text-dark-400 mb-1">{item.fuel}</div>
            <div className="text-lg font-bold text-white">{item.price}</div>
            <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {item.change}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecentTransactionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-3xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Live Transactions</h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30"
        >
          Live
        </motion.div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-center justify-between p-4 glass rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">AC{i}</span>
              </div>
              <div>
                <div className="text-white font-medium">Station ACC-00{i}</div>
                <div className="text-sm text-dark-400">PMS • 45.2L</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">₵672.48</div>
              <div className="text-xs text-dark-400">2 min ago</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function UPPFClaimsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">UPPF Claims</h3>
        <div className="w-8 h-8 bg-secondary-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-dark-400">Pending</span>
          <span className="text-yellow-400 font-medium">₵125K</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">Approved</span>
          <span className="text-green-400 font-medium">₵485K</span>
        </div>
        <div className="flex justify-between">
          <span className="text-dark-400">This Month</span>
          <span className="text-white font-medium">₵610K</span>
        </div>
      </div>
    </motion.div>
  );
}

function StationStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Station Status</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-dark-400">Online</span>
          </div>
          <span className="text-white font-medium">45</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-dark-400">Warning</span>
          </div>
          <span className="text-white font-medium">2</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-dark-400">Offline</span>
          </div>
          <span className="text-white font-medium">0</span>
        </div>
      </div>
    </motion.div>
  );
}

function SystemAlertsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 glass rounded-lg border border-yellow-500/30">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
          <div>
            <div className="text-sm text-white">Low fuel alert</div>
            <div className="text-xs text-dark-400">Station ACC-003 AGO tank</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-3 glass rounded-lg border border-blue-500/30">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
          <div>
            <div className="text-sm text-white">Price update</div>
            <div className="text-xs text-dark-400">New window activated</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SystemHealthCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
      
      <div className="space-y-3">
        {[
          { name: 'API Gateway', status: 'healthy' },
          { name: 'Database', status: 'healthy' },
          { name: 'Payment Gateway', status: 'warning' },
          { name: 'UPPF Service', status: 'healthy' },
        ].map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="text-dark-400 text-sm">{service.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              service.status === 'healthy' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {service.status === 'healthy' ? 'Healthy' : 'Warning'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}