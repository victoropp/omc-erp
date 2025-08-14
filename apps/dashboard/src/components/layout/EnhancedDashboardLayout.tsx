import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticSidebar } from './FuturisticSidebar';
import { BreadcrumbNavigation } from '@/components/ui/BreadcrumbNavigation';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  showBreadcrumbs?: boolean;
}

export function EnhancedDashboardLayout({ 
  children, 
  pageTitle,
  showBreadcrumbs = true 
}: EnhancedDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { actualTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      actualTheme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <FuturisticSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 transition-colors duration-300 ${
          actualTheme === 'dark' 
            ? 'bg-dark-800/80 border-white/10' 
            : 'bg-white/80 border-gray-200'
        } backdrop-blur-lg border-b`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                actualTheme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            {pageTitle && (
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-2xl font-bold transition-colors duration-300 ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {pageTitle}
              </motion.h1>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  actualTheme === 'dark' 
                    ? 'text-dark-400 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V12h5v5z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  actualTheme === 'dark' 
                    ? 'text-dark-400 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Quick Actions"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {showBreadcrumbs && <BreadcrumbNavigation />}
        </header>

        {/* Main Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}