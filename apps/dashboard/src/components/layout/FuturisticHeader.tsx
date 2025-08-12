import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { SearchCommand } from '../ui/SearchCommand';
import { NotificationCenter } from '../ui/NotificationCenter';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FuturisticHeaderProps {
  onMenuClick: () => void;
}

export function FuturisticHeader({ onMenuClick }: FuturisticHeaderProps) {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock system status updates
  useEffect(() => {
    const statusTimer = setInterval(() => {
      setSystemStatus(Math.random() > 0.1 ? 'online' : 'warning');
    }, 30000);
    return () => clearInterval(statusTimer);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass border-b border-white/10 backdrop-blur-xl"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Mobile menu + Breadcrumb */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl glass border border-white/10 text-white 
                       hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>

            {/* Real-time system status */}
            <motion.div
              animate={{ scale: systemStatus === 'warning' ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: systemStatus === 'warning' ? Infinity : 0 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-2 h-2 rounded-full ${
                systemStatus === 'online' ? 'bg-green-400' : 
                systemStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-white hidden md:inline">
                System {systemStatus}
              </span>
            </motion.div>

            {/* Current pricing window indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center space-x-2 glass rounded-lg px-3 py-1 border border-secondary-500/30"
            >
              <div className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
              <span className="text-sm text-secondary-400 font-medium">2025W03 Active</span>
            </motion.div>
          </div>

          {/* Center section - Search and quick actions */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <SearchCommand />
          </div>

          {/* Right section - Time, notifications, profile */}
          <div className="flex items-center space-x-4">
            {/* Ghana time display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex flex-col items-end"
            >
              <div className="text-sm font-mono text-white">
                {currentTime.toLocaleTimeString('en-GB', { 
                  timeZone: 'Africa/Accra',
                  hour12: false 
                })}
              </div>
              <div className="text-xs text-dark-400">
                {currentTime.toLocaleDateString('en-GB', { 
                  timeZone: 'Africa/Accra',
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })} • GMT
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="flex items-center space-x-2">
              {/* Emergency alert button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl glass border border-red-500/30 text-red-400 
                         hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                title="Emergency Protocols"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.button>

              {/* Quick fuel status */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl glass border border-secondary-500/30 text-secondary-400 
                         hover:bg-secondary-500/20 hover:text-secondary-300 transition-all duration-300"
                title="Fuel Levels Overview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>

            {/* Notification center */}
            <NotificationCenter />

            {/* User profile dropdown */}
            <UserProfileDropdown />
          </div>
        </div>

        {/* Mobile search bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:hidden mt-4"
        >
          <SearchCommand />
        </motion.div>
      </div>
    </motion.header>
  );
}

// User profile dropdown component
function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl glass border border-white/10 
                 hover:bg-white/10 transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-dark-400">
            {user?.role?.replace('_', ' ').toLowerCase()}
          </div>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-4 h-4 text-dark-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-64 glass rounded-2xl border border-white/10 shadow-xl z-20"
            >
              <div className="p-4">
                {/* User info header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-dark-400">{user?.email}</div>
                    <div className="text-xs text-secondary-400">
                      {user?.role?.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-4 space-y-2">
                  <ProfileMenuItem 
                    icon="👤" 
                    label="My Profile" 
                    onClick={() => setIsOpen(false)} 
                  />
                  <ProfileMenuItem 
                    icon="⚙️" 
                    label="Account Settings" 
                    onClick={() => setIsOpen(false)} 
                  />
                  <ProfileMenuItem 
                    icon="🔔" 
                    label="Notification Preferences" 
                    onClick={() => setIsOpen(false)} 
                  />
                  <ProfileMenuItem 
                    icon="🛡️" 
                    label="Security & Privacy" 
                    onClick={() => setIsOpen(false)} 
                  />
                  <ProfileMenuItem 
                    icon="❓" 
                    label="Help & Support" 
                    onClick={() => setIsOpen(false)} 
                  />
                </div>

                {/* Logout button */}
                <div className="pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl 
                             bg-red-500/20 border border-red-500/30 text-red-400 
                             hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Profile menu item component
interface ProfileMenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function ProfileMenuItem({ icon, label, onClick }: ProfileMenuItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl 
               text-dark-400 hover:text-white hover:bg-white/10 transition-all duration-300"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}