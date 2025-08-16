"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuturisticSidebar = FuturisticSidebar;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const link_1 = __importDefault(require("next/link"));
const router_1 = require("next/router");
const auth_store_1 = require("@/stores/auth.store");
const shared_1 = require("@/types/shared");
const ThemeToggle_1 = require("@/components/ui/ThemeToggle");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const NavigationIcons_1 = require("@/components/ui/NavigationIcons");
const NavigationSearch_1 = require("@/components/ui/NavigationSearch");
function FuturisticSidebar({ isOpen, onClose }) {
    const router = (0, router_1.useRouter)();
    const { user, logout } = (0, auth_store_1.useAuthStore)();
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [isSearchOpen, setIsSearchOpen] = (0, react_1.useState)(false);
    // Global keyboard shortcuts
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            // Cmd/Ctrl + K to open search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
    const navigation = [
        // EXECUTIVE OVERVIEW
        {
            name: 'Dashboard Overview',
            href: '/dashboard',
            icon: NavigationIcons_1.NavigationIcons.Dashboard,
            children: [
                { name: 'Executive Dashboard', href: '/dashboard/executive', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Operational Dashboard', href: '/dashboard/operational', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Integrated Dashboard', href: '/dashboard/integrated', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Dashboard Stats', href: '/dashboard/dashboard-stats', icon: NavigationIcons_1.NavigationIcons.Performance },
            ],
        },
        // CORE BUSINESS OPERATIONS
        {
            name: 'UPPF Management',
            href: '/uppf',
            icon: NavigationIcons_1.NavigationIcons.UPPF,
            badge: 'Live',
            children: [
                { name: 'UPPF Dashboard', href: '/uppf/dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
                { name: 'Claims Management', href: '/uppf/claims', icon: NavigationIcons_1.NavigationIcons.Claims, badge: '3' },
                { name: 'Create Claim', href: '/uppf/claims/create', icon: NavigationIcons_1.NavigationIcons.Claims },
                { name: 'GPS Tracking', href: '/uppf/gps-tracking', icon: NavigationIcons_1.NavigationIcons.GPS },
                { name: 'Route Management', href: '/uppf/routes', icon: NavigationIcons_1.NavigationIcons.Routes },
                { name: 'Reconciliation', href: '/uppf/reconciliation', icon: NavigationIcons_1.NavigationIcons.Reconciliation },
                { name: 'Settlements', href: '/uppf/settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
                { name: 'Analytics', href: '/uppf/analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Automation', href: '/uppf/automation', icon: NavigationIcons_1.NavigationIcons.Automation },
                { name: 'NPA Submission', href: '/uppf/npa-submission', icon: NavigationIcons_1.NavigationIcons.Reports },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.ACCOUNTANT],
        },
        {
            name: 'Pricing Management',
            href: '/pricing',
            icon: NavigationIcons_1.NavigationIcons.Pricing,
            children: [
                { name: 'Pricing Dashboard', href: '/pricing/dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
                { name: 'Price Build-Up', href: '/pricing/build-up', icon: NavigationIcons_1.NavigationIcons.Calculator },
                { name: 'Pricing Windows', href: '/pricing/windows', icon: NavigationIcons_1.NavigationIcons.Windows },
                { name: 'Price Calculator', href: '/pricing/calculator', icon: NavigationIcons_1.NavigationIcons.Calculator },
                { name: 'PBU Components', href: '/pricing/components', icon: NavigationIcons_1.NavigationIcons.Components },
                { name: 'Analytics', href: '/pricing/analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Reports', href: '/pricing/reports', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Automation', href: '/pricing/automation', icon: NavigationIcons_1.NavigationIcons.Automation },
                { name: 'NPA Integration', href: '/pricing/npa-integration', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Variance Analysis', href: '/pricing/variance', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Settlements', href: '/pricing/settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.ACCOUNTANT],
        },
        // PARTNER & RELATIONSHIP MANAGEMENT
        {
            name: 'Dealer Management',
            href: '/dealers',
            icon: NavigationIcons_1.NavigationIcons.Dealers,
            badge: '15',
            children: [
                { name: 'Dealer Dashboard', href: '/dealers/dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
                { name: 'Dealer Onboarding', href: '/dealers/onboarding', icon: NavigationIcons_1.NavigationIcons.Onboarding },
                { name: 'Performance Tracking', href: '/dealers/performance', icon: NavigationIcons_1.NavigationIcons.Performance },
                { name: 'Loan Management', href: '/dealers/loans', icon: NavigationIcons_1.NavigationIcons.Loans },
                { name: 'Credit Assessment', href: '/dealers/credit', icon: NavigationIcons_1.NavigationIcons.Credit },
                { name: 'Settlements', href: '/dealers/settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
                { name: 'Compliance Monitoring', href: '/dealers/compliance', icon: NavigationIcons_1.NavigationIcons.Compliance },
                { name: 'Analytics', href: '/dealers/analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Management', href: '/dealers/management', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Reports', href: '/dealers/reports', icon: NavigationIcons_1.NavigationIcons.Reports },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.ACCOUNTANT],
        },
        {
            name: 'Customers',
            href: '/customers',
            icon: NavigationIcons_1.NavigationIcons.Customers,
        },
        // SUPPLY CHAIN & PROCUREMENT
        {
            name: 'Procurement',
            href: '/procurement',
            icon: NavigationIcons_1.NavigationIcons.Procurement,
            children: [
                { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders },
                { name: 'Create Purchase Order', href: '/procurement/create-po', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN],
        },
        {
            name: 'Suppliers',
            href: '/suppliers',
            icon: NavigationIcons_1.NavigationIcons.Suppliers,
            children: [
                { name: 'Supplier List', href: '/suppliers', icon: NavigationIcons_1.NavigationIcons.Suppliers },
                { name: 'Create Supplier', href: '/suppliers/create', icon: NavigationIcons_1.NavigationIcons.Suppliers },
                { name: 'Supplier Contracts', href: '/suppliers/contracts', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Performance Tracking', href: '/suppliers/performance', icon: NavigationIcons_1.NavigationIcons.Performance },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN],
        },
        // INVENTORY & OPERATIONS
        {
            name: 'Products & Catalog',
            href: '/products',
            icon: NavigationIcons_1.NavigationIcons.Products,
            children: [
                { name: 'Product List', href: '/products', icon: NavigationIcons_1.NavigationIcons.Products },
                { name: 'Create Product', href: '/products/create', icon: NavigationIcons_1.NavigationIcons.Products },
                { name: 'Product Categories', href: '/products/categories', icon: NavigationIcons_1.NavigationIcons.Categories },
                { name: 'Pricing Rules', href: '/products/pricing-rules', icon: NavigationIcons_1.NavigationIcons.Pricing },
            ],
        },
        {
            name: 'Inventory Management',
            href: '/inventory',
            icon: NavigationIcons_1.NavigationIcons.Inventory,
            badge: '!',
        },
        {
            name: 'Stations & Locations',
            href: '/stations',
            icon: NavigationIcons_1.NavigationIcons.Stations,
            badge: '12',
            children: [
                { name: 'Station Overview', href: '/stations', icon: NavigationIcons_1.NavigationIcons.Stations },
                { name: 'Station Management', href: '/stations/management', icon: NavigationIcons_1.NavigationIcons.Management },
            ],
        },
        {
            name: 'Transactions',
            href: '/transactions',
            icon: NavigationIcons_1.NavigationIcons.Transactions,
            badge: 'Live',
        },
        // FLEET & LOGISTICS
        {
            name: 'Fleet Management',
            href: '/fleet',
            icon: NavigationIcons_1.NavigationIcons.Fleet,
            children: [
                { name: 'Fleet Overview', href: '/fleet', icon: NavigationIcons_1.NavigationIcons.Fleet },
                { name: 'Vehicles', href: '/fleet/vehicles', icon: NavigationIcons_1.NavigationIcons.Vehicles },
                { name: 'Drivers', href: '/fleet/drivers', icon: NavigationIcons_1.NavigationIcons.Employees },
                { name: 'Maintenance', href: '/fleet/maintenance', icon: NavigationIcons_1.NavigationIcons.Maintenance },
                { name: 'GPS Tracking', href: '/fleet/gps-tracking', icon: NavigationIcons_1.NavigationIcons.GPS },
                { name: 'Deliveries', href: '/fleet/deliveries', icon: NavigationIcons_1.NavigationIcons.Management },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN],
        },
        // DAILY DELIVERY MANAGEMENT
        {
            name: 'Daily Deliveries',
            href: '/daily-deliveries',
            icon: NavigationIcons_1.NavigationIcons.Management,
            badge: 'New',
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.STATION_MANAGER],
        },
        // FINANCIAL MANAGEMENT
        {
            name: 'Financial Management',
            href: '/financial',
            icon: NavigationIcons_1.NavigationIcons.Financial,
            children: [
                { name: 'Chart of Accounts', href: '/financial/chart-of-accounts', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'General Ledger', href: '/financial/general-ledger', icon: NavigationIcons_1.NavigationIcons.GeneralLedger },
                { name: 'Journal Entries', href: '/financial/journal-entries', icon: NavigationIcons_1.NavigationIcons.JournalEntries },
                { name: 'Trial Balance', href: '/financial/trial-balance', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Accounts Payable', href: '/financial/accounts-payable', icon: NavigationIcons_1.NavigationIcons.Financial },
                { name: 'Accounts Receivable', href: '/financial/accounts-receivable', icon: NavigationIcons_1.NavigationIcons.Financial },
                { name: 'Bank Reconciliation', href: '/financial/bank-reconciliation', icon: NavigationIcons_1.NavigationIcons.Reconciliation },
                { name: 'Financial Statements', href: '/financial/financial-statements', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Cost Centers', href: '/financial/cost-centers', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Budget Management', href: '/financial/budget-management', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Tax Management', href: '/financial/tax-management', icon: NavigationIcons_1.NavigationIcons.Management },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.ACCOUNTANT],
        },
        {
            name: 'IFRS Compliance',
            href: '/ifrs',
            icon: NavigationIcons_1.NavigationIcons.IFRS,
            children: [
                { name: 'IFRS Dashboard', href: '/ifrs/dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
                { name: 'Revenue Recognition', href: '/ifrs/revenue-recognition', icon: NavigationIcons_1.NavigationIcons.RevenueRecognition },
                { name: 'Expected Credit Loss', href: '/ifrs/expected-credit-loss', icon: NavigationIcons_1.NavigationIcons.Credit },
                { name: 'Lease Accounting', href: '/ifrs/lease-accounting', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Asset Impairment', href: '/ifrs/asset-impairment', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Compliance', href: '/ifrs/compliance', icon: NavigationIcons_1.NavigationIcons.Compliance },
                { name: 'Disclosures', href: '/ifrs/disclosures', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Reporting', href: '/ifrs/reporting', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Analytics', href: '/ifrs/analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN, shared_1.UserRole.ACCOUNTANT],
        },
        // HUMAN RESOURCES
        {
            name: 'Human Resources',
            href: '/hr',
            icon: NavigationIcons_1.NavigationIcons.HumanResources,
            children: [
                { name: 'HR Overview', href: '/hr', icon: NavigationIcons_1.NavigationIcons.HumanResources },
                { name: 'Employees', href: '/hr/employees', icon: NavigationIcons_1.NavigationIcons.Employees },
                { name: 'Payroll', href: '/hr/payroll', icon: NavigationIcons_1.NavigationIcons.Payroll },
                { name: 'Leave Management', href: '/hr/leave-management', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Performance Management', href: '/hr/performance', icon: NavigationIcons_1.NavigationIcons.Performance },
                { name: 'Training & Development', href: '/hr/training', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Recruitment', href: '/hr/recruitment', icon: NavigationIcons_1.NavigationIcons.Management },
            ],
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN],
        },
        // ANALYTICS & INSIGHTS
        {
            name: 'Analytics & Insights',
            href: '/analytics',
            icon: NavigationIcons_1.NavigationIcons.Analytics,
            children: [
                { name: 'Analytics Overview', href: '/analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'AI Insights', href: '/analytics/ai-insights', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Financial Analytics', href: '/analytics/financial', icon: NavigationIcons_1.NavigationIcons.Financial },
                { name: 'Operational Analytics', href: '/analytics/operational', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Sales Analytics', href: '/analytics/sales', icon: NavigationIcons_1.NavigationIcons.Analytics },
                { name: 'Inventory Analytics', href: '/analytics/inventory', icon: NavigationIcons_1.NavigationIcons.Inventory },
            ],
        },
        // REPORTING
        {
            name: 'Reports',
            href: '/reports',
            icon: NavigationIcons_1.NavigationIcons.Reports,
            children: [
                { name: 'Reports Overview', href: '/reports', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Sales Reports', href: '/reports/sales', icon: NavigationIcons_1.NavigationIcons.Reports },
                { name: 'Inventory Reports', href: '/reports/inventory', icon: NavigationIcons_1.NavigationIcons.Inventory },
                { name: 'Financial Reports', href: '/reports/financial', icon: NavigationIcons_1.NavigationIcons.Financial },
                { name: 'Regulatory Reports', href: '/reports/regulatory', icon: NavigationIcons_1.NavigationIcons.Compliance },
            ],
        },
        // ADMINISTRATION
        {
            name: 'Administration',
            href: '/admin',
            icon: NavigationIcons_1.NavigationIcons.Admin,
            roles: [shared_1.UserRole.SUPER_ADMIN, shared_1.UserRole.COMPANY_ADMIN],
            children: [
                { name: 'System Configuration', href: '/admin/configuration', icon: NavigationIcons_1.NavigationIcons.Settings },
                { name: 'User Management', href: '/admin/users', icon: NavigationIcons_1.NavigationIcons.Users },
                { name: 'Roles & Permissions', href: '/admin/roles', icon: NavigationIcons_1.NavigationIcons.Roles },
                { name: 'Audit Logs', href: '/admin/audit-logs', icon: NavigationIcons_1.NavigationIcons.AuditLogs },
                { name: 'System Health', href: '/admin/system-health', icon: NavigationIcons_1.NavigationIcons.SystemHealth },
            ],
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: NavigationIcons_1.NavigationIcons.Settings,
            children: [
                { name: 'General Settings', href: '/settings/general', icon: NavigationIcons_1.NavigationIcons.Settings },
                { name: 'Notifications', href: '/settings/notifications', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Security Settings', href: '/settings/security', icon: NavigationIcons_1.NavigationIcons.Admin },
                { name: 'Integrations', href: '/settings/integrations', icon: NavigationIcons_1.NavigationIcons.Management },
                { name: 'Backup & Restore', href: '/settings/backup', icon: NavigationIcons_1.NavigationIcons.Management },
            ],
        },
    ];
    const filteredNavigation = navigation.filter(item => !item.roles || item.roles.includes(user?.role));
    const isActiveRoute = (href) => {
        if (href === '/dashboard')
            return router.pathname === '/dashboard';
        return router.pathname.startsWith(href);
    };
    return (<framer_motion_1.AnimatePresence mode="wait">
      <framer_motion_1.motion.div initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={`
          fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:left-0 lg:top-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        {/* Theme-aware Glassmorphism sidebar container */}
        <div className={`flex h-full flex-col glass border-r transition-colors duration-300 ${actualTheme === 'dark'
            ? 'border-white/10'
            : 'border-gray-200'}`}>
          {/* Brand header */}
          <framer_motion_1.motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`flex h-20 items-center justify-between px-6 border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </framer_motion_1.motion.div>
              <div>
                <h1 className={`text-xl font-display font-bold transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Ghana OMC
                </h1>
                <p className={`text-xs transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'}`}>ERP System</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </framer_motion_1.motion.button>
          </framer_motion_1.motion.div>

          {/* Search Section */}
          <framer_motion_1.motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className={`p-4 border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsSearchOpen(true)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${actualTheme === 'dark'
            ? 'bg-white/5 border border-white/10 text-dark-400 hover:bg-white/10 hover:text-white'
            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}>
              <NavigationIcons_1.NavigationIcons.Search className="w-5 h-5"/>
              <span className="text-sm font-medium">Search navigation...</span>
              <div className={`ml-auto px-2 py-1 text-xs rounded border transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/20 text-dark-400' : 'border-gray-300 text-gray-500'}`}>
                ⌘K
              </div>
            </framer_motion_1.motion.button>
          </framer_motion_1.motion.div>

          {/* User profile section */}
          <framer_motion_1.motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`p-6 border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={`text-xs truncate transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'}`}>
                  {user?.role?.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <framer_motion_1.motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-3 h-3 bg-green-400 rounded-full"/>
            </div>
          </framer_motion_1.motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item, index) => (<framer_motion_1.motion.div key={item.name} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + index * 0.1 }}>
                <NavigationItem item={item} isActive={isActiveRoute(item.href)} depth={0}/>
              </framer_motion_1.motion.div>))}
          </nav>

          {/* Footer actions */}
          <framer_motion_1.motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className={`p-6 border-t space-y-4 transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            {/* Theme toggle */}
            <div className="flex justify-center">
              <ThemeToggle_1.ThemeToggle />
            </div>
            
            {/* Logout button */}
            <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                       rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 
                       hover:bg-red-500/30 hover:text-red-300 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="font-medium">Logout</span>
            </framer_motion_1.motion.button>
          </framer_motion_1.motion.div>
        </div>
      </framer_motion_1.motion.div>
      
      {/* Navigation Search Modal */}
      <NavigationSearch_1.NavigationSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}/>
    </framer_motion_1.AnimatePresence>);
}
function NavigationItem({ item, isActive, depth }) {
    const [isExpanded, setIsExpanded] = react_1.default.useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
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
    const ItemContent = () => (<div className="flex items-center space-x-3 flex-1 min-w-0">
      <item.icon className="w-5 h-5 flex-shrink-0"/>
      <span className="font-medium truncate">{item.name}</span>
      {item.badge && (<framer_motion_1.motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`
            px-2 py-1 text-xs font-bold rounded-full
            ${item.badge === '!' ? 'bg-red-500 text-white' :
                item.badge === 'Live' ? 'bg-green-500 text-white' :
                    'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'}
          `}>
          {item.badge}
        </framer_motion_1.motion.span>)}
    </div>);
    if (hasChildren) {
        return (<div>
        <button onClick={() => setIsExpanded(!isExpanded)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <ItemContent />
          <framer_motion_1.motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </framer_motion_1.motion.svg>
        </button>
        
        <framer_motion_1.AnimatePresence>
          {isExpanded && (<framer_motion_1.motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="py-2 space-y-1">
                {item.children?.map(child => {
                    const router = (0, router_1.useRouter)();
                    return (<NavigationItem key={child.name} item={child} isActive={child.href === router.pathname} depth={depth + 1}/>);
                })}
              </div>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </div>);
    }
    return (<link_1.default href={item.href}>
      <framer_motion_1.motion.button whileHover={{ x: 4 }} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        <ItemContent />
      </framer_motion_1.motion.button>
    </link_1.default>);
}
//# sourceMappingURL=FuturisticSidebar.js.map