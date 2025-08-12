import React, { ReactNode, useState, useEffect } from 'react';
import { FuturisticSidebar } from './FuturisticSidebar';
import { FuturisticHeader } from './FuturisticHeader';
import { FuturisticBackground } from './FuturisticBackground';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '../ui/LoadingScreen';

interface FuturisticDashboardLayoutProps {
  children: ReactNode;
}

export function FuturisticDashboardLayout({ children }: FuturisticDashboardLayoutProps) {
  const { user, isLoading } = useAuthStore();
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading state
  if (!isClient || isLoading) {
    return <LoadingScreen />;
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-12 border border-white/10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary"
            />
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Ghana OMC ERP
            </h1>
            <p className="text-dark-400 text-lg">Initializing secure connection...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      actualTheme === 'dark' 
        ? 'bg-dark-900' 
        : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white'
    }`}>
      {/* Futuristic background with animated particles */}
      <FuturisticBackground />
      
      {/* Enhanced theme-aware toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: `glass border transition-colors duration-300 ${
            actualTheme === 'dark' 
              ? 'border-white/20 text-white' 
              : 'border-gray-300 text-gray-800'
          }`,
          style: {
            background: actualTheme === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            border: actualTheme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid rgba(0, 0, 0, 0.15)',
            color: actualTheme === 'dark' ? 'white' : '#374151',
            boxShadow: actualTheme === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
          },
        }}
      />
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <FuturisticSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </AnimatePresence>
      
      {/* Main content area */}
      <div className="lg:ml-80">
        {/* Futuristic header */}
        <FuturisticHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content with glassmorphism container */}
        <main className="py-8 px-6 relative min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {/* Theme-aware Glassmorphism content wrapper */}
            <div className={`glass rounded-3xl p-8 min-h-[calc(100vh-8rem)] transition-all duration-300 ${
              actualTheme === 'dark' 
                ? 'border-white/10' 
                : 'border-gray-300 shadow-lg'
            }`}>
              {children}
            </div>
          </motion.div>
          
          {/* Floating action elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="fixed bottom-8 right-8 z-50"
          >
            {/* Quick actions floating menu */}
            <div className="flex flex-col space-y-4">
              {/* Emergency stop button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-red-500/20 glass border border-red-500/30 
                         flex items-center justify-center text-red-400 hover:text-red-300 
                         hover:bg-red-500/30 transition-all duration-300"
                title="Emergency Operations"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.button>
              
              {/* Quick fuel status button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-secondary-500/20 glass border border-secondary-500/30 
                         flex items-center justify-center text-secondary-400 hover:text-secondary-300 
                         hover:bg-secondary-500/30 transition-all duration-300"
                title="Fuel Status Overview"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default FuturisticDashboardLayout;