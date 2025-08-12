import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/shared';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

interface FuturisticSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Navigation icons as React components
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
);

const StationsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const TransactionsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const PricingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UppfIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const CustomersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const InventoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function FuturisticSidebar({ isOpen, onClose }: FuturisticSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { actualTheme } = useTheme();

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: DashboardIcon,
    },
    {
      name: 'Stations',
      href: '/stations',
      icon: StationsIcon,
      badge: '12',
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: TransactionsIcon,
      badge: 'Live',
    },
    {
      name: 'Pricing & UPPF',
      href: '/pricing',
      icon: PricingIcon,
      children: [
        { name: 'Price Windows', href: '/pricing/windows', icon: PricingIcon },
        { name: 'PBU Components', href: '/pricing/components', icon: PricingIcon },
        { name: 'UPPF Claims', href: '/pricing/uppf-claims', icon: UppfIcon, badge: '3' },
        { name: 'Dealer Settlements', href: '/pricing/settlements', icon: TransactionsIcon },
      ],
      roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.ACCOUNTANT],
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: CustomersIcon,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: InventoryIcon,
      badge: '!',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ReportsIcon,
      children: [
        { name: 'Sales Reports', href: '/reports/sales', icon: ReportsIcon },
        { name: 'Inventory Reports', href: '/reports/inventory', icon: InventoryIcon },
        { name: 'Financial Reports', href: '/reports/financial', icon: TransactionsIcon },
        { name: 'Regulatory Reports', href: '/reports/regulatory', icon: SettingsIcon },
      ],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
      roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role as UserRole)
  );

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return router.pathname === '/dashboard';
    return router.pathname.startsWith(href);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:left-0 lg:top-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Theme-aware Glassmorphism sidebar container */}
        <div className={`flex h-full flex-col glass border-r transition-colors duration-300 ${
          actualTheme === 'dark' 
            ? 'border-white/10' 
            : 'border-gray-200'
        }`}>
          {/* Brand header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex h-20 items-center justify-between px-6 border-b transition-colors duration-300 ${
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">G</span>
              </motion.div>
              <div>
                <h1 className={`text-xl font-display font-bold transition-colors duration-300 ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Ghana OMC
                </h1>
                <p className={`text-xs transition-colors duration-300 ${
                  actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
                }`}>ERP System</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                actualTheme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>

          {/* User profile section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-6 border-b transition-colors duration-300 ${
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={`text-xs truncate transition-colors duration-300 ${
                  actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
                }`}>
                  {user?.role?.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <NavigationItem 
                  item={item} 
                  isActive={isActiveRoute(item.href)}
                  depth={0}
                />
              </motion.div>
            ))}
          </nav>

          {/* Footer actions */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`p-6 border-t space-y-4 transition-colors duration-300 ${
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            {/* Theme toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            
            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                       rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 
                       hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual navigation item component
interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  depth: number;
}

function NavigationItem({ item, isActive, depth }: NavigationItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const { actualTheme } = useTheme();

  const baseClasses = `
    group flex items-center justify-between w-full px-4 py-3 rounded-xl
    text-left transition-all duration-300 transform hover:scale-[1.02]
    ${depth > 0 ? 'ml-4 text-sm' : 'text-base'}
  `;

  const activeClasses = `
    bg-gradient-primary text-white shadow-glow-primary
  `;

  const inactiveClasses = actualTheme === 'dark' 
    ? `text-dark-400 hover:text-white hover:bg-white/10`
    : `text-gray-600 hover:text-gray-800 hover:bg-gray-200`;

  const ItemContent = () => (
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium truncate">{item.name}</span>
      {item.badge && (
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            px-2 py-1 text-xs font-bold rounded-full
            ${item.badge === '!' ? 'bg-red-500 text-white' : 
              item.badge === 'Live' ? 'bg-green-500 text-white' :
              'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'}
          `}
        >
          {item.badge}
        </motion.span>
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
          <ItemContent />
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="py-2 space-y-1">
                {item.children?.map(child => {
                  const router = useRouter();
                  return (
                    <NavigationItem
                      key={child.name}
                      item={child}
                      isActive={child.href === router.pathname}
                      depth={depth + 1}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <motion.button
        whileHover={{ x: 4 }}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        <ItemContent />
      </motion.button>
    </Link>
  );
}