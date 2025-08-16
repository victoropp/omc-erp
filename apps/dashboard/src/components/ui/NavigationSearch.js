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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationSearch = NavigationSearch;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const router_1 = require("next/router");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const NavigationIcons_1 = require("./NavigationIcons");
// Comprehensive searchable navigation items
const searchableItems = [
    // Dashboard
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', category: 'Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard, keywords: ['main', 'home', 'overview'] },
    { id: 'executive-dashboard', label: 'Executive Dashboard', href: '/dashboard/executive', category: 'Dashboard', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['executive', 'summary', 'kpi'] },
    { id: 'operational-dashboard', label: 'Operational Dashboard', href: '/dashboard/operational', category: 'Dashboard', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['operations', 'daily'] },
    { id: 'integrated-dashboard', label: 'Integrated Dashboard', href: '/dashboard/integrated', category: 'Dashboard', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['integrated', 'combined'] },
    // UPPF Management
    { id: 'uppf', label: 'UPPF Management', href: '/uppf', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.UPPF, keywords: ['uppf', 'petroleum', 'claims'] },
    { id: 'uppf-dashboard', label: 'UPPF Dashboard', href: '/uppf/dashboard', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Dashboard, keywords: ['uppf', 'overview'] },
    { id: 'claims-management', label: 'Claims Management', href: '/uppf/claims', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Claims, keywords: ['claims', 'submissions'] },
    { id: 'create-claim', label: 'Create Claim', href: '/uppf/claims/create', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Claims, keywords: ['new', 'create', 'submit'] },
    { id: 'gps-tracking', label: 'GPS Tracking', href: '/uppf/gps-tracking', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.GPS, keywords: ['gps', 'tracking', 'location'] },
    { id: 'route-management', label: 'Route Management', href: '/uppf/routes', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Routes, keywords: ['routes', 'planning'] },
    { id: 'uppf-reconciliation', label: 'UPPF Reconciliation', href: '/uppf/reconciliation', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Reconciliation, keywords: ['reconciliation', 'matching'] },
    { id: 'uppf-settlements', label: 'UPPF Settlements', href: '/uppf/settlements', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Settlements, keywords: ['settlements', 'payments'] },
    { id: 'uppf-analytics', label: 'UPPF Analytics', href: '/uppf/analytics', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['analytics', 'reports'] },
    { id: 'uppf-automation', label: 'UPPF Automation', href: '/uppf/automation', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Automation, keywords: ['automation', 'automated'] },
    { id: 'npa-submission', label: 'NPA Submission', href: '/uppf/npa-submission', category: 'UPPF', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['npa', 'submission'] },
    // Pricing Management
    { id: 'pricing', label: 'Pricing Management', href: '/pricing', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Pricing, keywords: ['pricing', 'costs'] },
    { id: 'pricing-dashboard', label: 'Pricing Dashboard', href: '/pricing/dashboard', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Dashboard, keywords: ['pricing', 'overview'] },
    { id: 'price-buildup', label: 'Price Build-Up', href: '/pricing/build-up', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Calculator, keywords: ['buildup', 'calculation'] },
    { id: 'pricing-windows', label: 'Pricing Windows', href: '/pricing/windows', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Windows, keywords: ['windows', 'periods'] },
    { id: 'price-calculator', label: 'Price Calculator', href: '/pricing/calculator', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Calculator, keywords: ['calculator', 'compute'] },
    { id: 'pbu-components', label: 'PBU Components', href: '/pricing/components', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Components, keywords: ['components', 'pbu'] },
    { id: 'pricing-analytics', label: 'Pricing Analytics', href: '/pricing/analytics', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['analytics', 'analysis'] },
    { id: 'pricing-reports', label: 'Pricing Reports', href: '/pricing/reports', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['reports', 'documentation'] },
    { id: 'pricing-automation', label: 'Pricing Automation', href: '/pricing/automation', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Automation, keywords: ['automation', 'automated'] },
    { id: 'pricing-npa-integration', label: 'NPA Integration', href: '/pricing/npa-integration', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['npa', 'integration'] },
    { id: 'variance-analysis', label: 'Variance Analysis', href: '/pricing/variance', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['variance', 'analysis'] },
    { id: 'pricing-settlements', label: 'Pricing Settlements', href: '/pricing/settlements', category: 'Pricing', icon: NavigationIcons_1.NavigationIcons.Settlements, keywords: ['settlements', 'payments'] },
    // Dealer Management
    { id: 'dealers', label: 'Dealer Management', href: '/dealers', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Dealers, keywords: ['dealers', 'partners'] },
    { id: 'dealer-dashboard', label: 'Dealer Dashboard', href: '/dealers/dashboard', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Dashboard, keywords: ['dealers', 'overview'] },
    { id: 'dealer-onboarding', label: 'Dealer Onboarding', href: '/dealers/onboarding', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Onboarding, keywords: ['onboarding', 'registration'] },
    { id: 'dealer-performance', label: 'Performance Tracking', href: '/dealers/performance', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Performance, keywords: ['performance', 'tracking'] },
    { id: 'loan-management', label: 'Loan Management', href: '/dealers/loans', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Loans, keywords: ['loans', 'financing'] },
    { id: 'credit-assessment', label: 'Credit Assessment', href: '/dealers/credit', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Credit, keywords: ['credit', 'assessment'] },
    { id: 'dealer-settlements', label: 'Dealer Settlements', href: '/dealers/settlements', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Settlements, keywords: ['settlements', 'payments'] },
    { id: 'compliance-monitoring', label: 'Compliance Monitoring', href: '/dealers/compliance', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Compliance, keywords: ['compliance', 'monitoring'] },
    { id: 'dealer-analytics', label: 'Dealer Analytics', href: '/dealers/analytics', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['analytics', 'insights'] },
    { id: 'dealer-management', label: 'Dealer Management', href: '/dealers/management', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['management', 'administration'] },
    { id: 'dealer-reports', label: 'Dealer Reports', href: '/dealers/reports', category: 'Dealers', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['reports', 'documentation'] },
    // IFRS Compliance
    { id: 'ifrs', label: 'IFRS Compliance', href: '/ifrs', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.IFRS, keywords: ['ifrs', 'compliance', 'accounting'] },
    { id: 'ifrs-dashboard', label: 'IFRS Dashboard', href: '/ifrs/dashboard', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Dashboard, keywords: ['ifrs', 'overview'] },
    { id: 'revenue-recognition', label: 'Revenue Recognition', href: '/ifrs/revenue-recognition', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.RevenueRecognition, keywords: ['revenue', 'recognition'] },
    { id: 'expected-credit-loss', label: 'Expected Credit Loss', href: '/ifrs/expected-credit-loss', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Credit, keywords: ['credit', 'loss', 'ecl'] },
    { id: 'lease-accounting', label: 'Lease Accounting', href: '/ifrs/lease-accounting', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['lease', 'accounting'] },
    { id: 'asset-impairment', label: 'Asset Impairment', href: '/ifrs/asset-impairment', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['asset', 'impairment'] },
    { id: 'ifrs-compliance', label: 'IFRS Compliance', href: '/ifrs/compliance', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Compliance, keywords: ['compliance', 'standards'] },
    { id: 'ifrs-disclosures', label: 'IFRS Disclosures', href: '/ifrs/disclosures', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['disclosures', 'reporting'] },
    { id: 'ifrs-reporting', label: 'IFRS Reporting', href: '/ifrs/reporting', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['reporting', 'statements'] },
    { id: 'ifrs-analytics', label: 'IFRS Analytics', href: '/ifrs/analytics', category: 'IFRS', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['analytics', 'analysis'] },
    // Financial Management
    { id: 'financial', label: 'Financial Management', href: '/financial', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Financial, keywords: ['financial', 'accounting'] },
    { id: 'chart-of-accounts', label: 'Chart of Accounts', href: '/financial/chart-of-accounts', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['chart', 'accounts', 'coa'] },
    { id: 'general-ledger', label: 'General Ledger', href: '/financial/general-ledger', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.GeneralLedger, keywords: ['ledger', 'general'] },
    { id: 'journal-entries', label: 'Journal Entries', href: '/financial/journal-entries', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.JournalEntries, keywords: ['journal', 'entries'] },
    { id: 'trial-balance', label: 'Trial Balance', href: '/financial/trial-balance', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['trial', 'balance'] },
    { id: 'accounts-payable', label: 'Accounts Payable', href: '/financial/accounts-payable', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Financial, keywords: ['payable', 'ap'] },
    { id: 'accounts-receivable', label: 'Accounts Receivable', href: '/financial/accounts-receivable', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Financial, keywords: ['receivable', 'ar'] },
    { id: 'bank-reconciliation', label: 'Bank Reconciliation', href: '/financial/bank-reconciliation', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Reconciliation, keywords: ['bank', 'reconciliation'] },
    { id: 'financial-statements', label: 'Financial Statements', href: '/financial/financial-statements', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['statements', 'financial'] },
    { id: 'cost-centers', label: 'Cost Centers', href: '/financial/cost-centers', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['cost', 'centers'] },
    { id: 'budget-management', label: 'Budget Management', href: '/financial/budget-management', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['budget', 'planning'] },
    { id: 'tax-management', label: 'Tax Management', href: '/financial/tax-management', category: 'Financial', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['tax', 'vat'] },
    // Human Resources
    { id: 'hr', label: 'Human Resources', href: '/hr', category: 'HR', icon: NavigationIcons_1.NavigationIcons.HumanResources, keywords: ['hr', 'human', 'resources'] },
    { id: 'employees', label: 'Employees', href: '/hr/employees', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Employees, keywords: ['employees', 'staff'] },
    { id: 'payroll', label: 'Payroll', href: '/hr/payroll', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Payroll, keywords: ['payroll', 'salary'] },
    { id: 'leave-management', label: 'Leave Management', href: '/hr/leave-management', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['leave', 'vacation'] },
    { id: 'hr-performance', label: 'Performance Management', href: '/hr/performance', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Performance, keywords: ['performance', 'appraisal'] },
    { id: 'training', label: 'Training', href: '/hr/training', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['training', 'development'] },
    { id: 'recruitment', label: 'Recruitment', href: '/hr/recruitment', category: 'HR', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['recruitment', 'hiring'] },
    // Fleet Management
    { id: 'fleet', label: 'Fleet Management', href: '/fleet', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.Fleet, keywords: ['fleet', 'vehicles'] },
    { id: 'vehicles', label: 'Vehicles', href: '/fleet/vehicles', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.Vehicles, keywords: ['vehicles', 'trucks'] },
    { id: 'drivers', label: 'Drivers', href: '/fleet/drivers', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.Employees, keywords: ['drivers', 'operators'] },
    { id: 'maintenance', label: 'Maintenance', href: '/fleet/maintenance', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.Maintenance, keywords: ['maintenance', 'service'] },
    { id: 'fleet-gps', label: 'Fleet GPS Tracking', href: '/fleet/gps-tracking', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.GPS, keywords: ['gps', 'tracking', 'fleet'] },
    { id: 'deliveries', label: 'Deliveries', href: '/fleet/deliveries', category: 'Fleet', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['deliveries', 'shipments'] },
    // Procurement
    { id: 'procurement', label: 'Procurement', href: '/procurement', category: 'Procurement', icon: NavigationIcons_1.NavigationIcons.Procurement, keywords: ['procurement', 'purchasing'] },
    { id: 'purchase-orders', label: 'Purchase Orders', href: '/procurement/purchase-orders', category: 'Procurement', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders, keywords: ['purchase', 'orders', 'po'] },
    { id: 'create-po', label: 'Create Purchase Order', href: '/procurement/create-po', category: 'Procurement', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders, keywords: ['create', 'new', 'purchase'] },
    // Suppliers
    { id: 'suppliers', label: 'Suppliers', href: '/suppliers', category: 'Suppliers', icon: NavigationIcons_1.NavigationIcons.Suppliers, keywords: ['suppliers', 'vendors'] },
    { id: 'create-supplier', label: 'Create Supplier', href: '/suppliers/create', category: 'Suppliers', icon: NavigationIcons_1.NavigationIcons.Suppliers, keywords: ['create', 'new', 'supplier'] },
    { id: 'supplier-contracts', label: 'Supplier Contracts', href: '/suppliers/contracts', category: 'Suppliers', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['contracts', 'agreements'] },
    { id: 'supplier-performance', label: 'Supplier Performance', href: '/suppliers/performance', category: 'Suppliers', icon: NavigationIcons_1.NavigationIcons.Performance, keywords: ['performance', 'evaluation'] },
    // Products
    { id: 'products', label: 'Products', href: '/products', category: 'Products', icon: NavigationIcons_1.NavigationIcons.Products, keywords: ['products', 'catalog'] },
    { id: 'create-product', label: 'Create Product', href: '/products/create', category: 'Products', icon: NavigationIcons_1.NavigationIcons.Products, keywords: ['create', 'new', 'product'] },
    { id: 'product-categories', label: 'Product Categories', href: '/products/categories', category: 'Products', icon: NavigationIcons_1.NavigationIcons.Categories, keywords: ['categories', 'classification'] },
    // Analytics
    { id: 'analytics', label: 'Analytics', href: '/analytics', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['analytics', 'insights'] },
    { id: 'ai-insights', label: 'AI Insights', href: '/analytics/ai-insights', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['ai', 'insights', 'artificial'] },
    { id: 'financial-analytics', label: 'Financial Analytics', href: '/analytics/financial', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Financial, keywords: ['financial', 'analytics'] },
    { id: 'operational-analytics', label: 'Operational Analytics', href: '/analytics/operational', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['operational', 'analytics'] },
    { id: 'sales-analytics', label: 'Sales Analytics', href: '/analytics/sales', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics, keywords: ['sales', 'analytics'] },
    { id: 'inventory-analytics', label: 'Inventory Analytics', href: '/analytics/inventory', category: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Inventory, keywords: ['inventory', 'analytics'] },
    // Others
    { id: 'stations', label: 'Stations', href: '/stations', category: 'Operations', icon: NavigationIcons_1.NavigationIcons.Stations, keywords: ['stations', 'locations'] },
    { id: 'station-management', label: 'Station Management', href: '/stations/management', category: 'Operations', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['station', 'management'] },
    { id: 'transactions', label: 'Transactions', href: '/transactions', category: 'Operations', icon: NavigationIcons_1.NavigationIcons.Transactions, keywords: ['transactions', 'sales'] },
    { id: 'customers', label: 'Customers', href: '/customers', category: 'Operations', icon: NavigationIcons_1.NavigationIcons.Customers, keywords: ['customers', 'clients'] },
    { id: 'inventory', label: 'Inventory', href: '/inventory', category: 'Operations', icon: NavigationIcons_1.NavigationIcons.Inventory, keywords: ['inventory', 'stock'] },
    // Reports
    { id: 'reports', label: 'Reports', href: '/reports', category: 'Reports', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['reports', 'documentation'] },
    { id: 'sales-reports', label: 'Sales Reports', href: '/reports/sales', category: 'Reports', icon: NavigationIcons_1.NavigationIcons.Reports, keywords: ['sales', 'reports'] },
    { id: 'inventory-reports', label: 'Inventory Reports', href: '/reports/inventory', category: 'Reports', icon: NavigationIcons_1.NavigationIcons.Inventory, keywords: ['inventory', 'reports'] },
    { id: 'financial-reports', label: 'Financial Reports', href: '/reports/financial', category: 'Reports', icon: NavigationIcons_1.NavigationIcons.Financial, keywords: ['financial', 'reports'] },
    { id: 'regulatory-reports', label: 'Regulatory Reports', href: '/reports/regulatory', category: 'Reports', icon: NavigationIcons_1.NavigationIcons.Compliance, keywords: ['regulatory', 'compliance'] },
    // Administration
    { id: 'admin', label: 'Administration', href: '/admin', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.Admin, keywords: ['admin', 'administration'] },
    { id: 'system-configuration', label: 'System Configuration', href: '/admin/configuration', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.Settings, keywords: ['configuration', 'settings'] },
    { id: 'users', label: 'Users', href: '/admin/users', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.Users, keywords: ['users', 'accounts'] },
    { id: 'roles', label: 'Roles', href: '/admin/roles', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.Roles, keywords: ['roles', 'permissions'] },
    { id: 'audit-logs', label: 'Audit Logs', href: '/admin/audit-logs', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.AuditLogs, keywords: ['audit', 'logs', 'history'] },
    { id: 'system-health', label: 'System Health', href: '/admin/system-health', category: 'Administration', icon: NavigationIcons_1.NavigationIcons.SystemHealth, keywords: ['health', 'status', 'monitoring'] },
    // Settings
    { id: 'settings', label: 'Settings', href: '/settings', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Settings, keywords: ['settings', 'preferences'] },
    { id: 'general-settings', label: 'General Settings', href: '/settings/general', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Settings, keywords: ['general', 'settings'] },
    { id: 'notifications', label: 'Notifications', href: '/settings/notifications', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['notifications', 'alerts'] },
    { id: 'security-settings', label: 'Security Settings', href: '/settings/security', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Admin, keywords: ['security', 'password'] },
    { id: 'integrations', label: 'Integrations', href: '/settings/integrations', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['integrations', 'api'] },
    { id: 'backup', label: 'Backup', href: '/settings/backup', category: 'Settings', icon: NavigationIcons_1.NavigationIcons.Management, keywords: ['backup', 'restore'] },
];
function NavigationSearch({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filteredItems, setFilteredItems] = (0, react_1.useState)([]);
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(0);
    const searchInputRef = (0, react_1.useRef)(null);
    const router = (0, router_1.useRouter)();
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    (0, react_1.useEffect)(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);
    (0, react_1.useEffect)(() => {
        if (!searchQuery.trim()) {
            setFilteredItems([]);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = searchableItems.filter(item => {
            const labelMatch = item.label.toLowerCase().includes(query);
            const categoryMatch = item.category.toLowerCase().includes(query);
            const keywordMatch = item.keywords?.some(keyword => keyword.toLowerCase().includes(query));
            const descriptionMatch = item.description?.toLowerCase().includes(query);
            return labelMatch || categoryMatch || keywordMatch || descriptionMatch;
        }).slice(0, 8); // Limit to 8 results for better UX
        setFilteredItems(filtered);
        setSelectedIndex(0);
    }, [searchQuery]);
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex]);
        }
    };
    const handleItemSelect = (item) => {
        router.push(item.href);
        onClose();
        setSearchQuery('');
    };
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
    if (!isOpen)
        return null;
    return (<framer_motion_1.AnimatePresence>
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.2 }} className="mx-auto mt-16 max-w-2xl px-4" onClick={e => e.stopPropagation()}>
          <div className={`rounded-xl border shadow-2xl backdrop-blur-lg transition-colors duration-300 ${actualTheme === 'dark'
            ? 'border-white/10 bg-dark-800/90'
            : 'border-gray-200 bg-white/90'}`}>
            {/* Search Input */}
            <div className="flex items-center p-4">
              <NavigationIcons_1.NavigationIcons.Search className={`w-5 h-5 mr-3 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400'}`}/>
              <input ref={searchInputRef} type="text" placeholder="Search navigation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} className={`flex-1 bg-transparent text-lg placeholder-gray-400 outline-none transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}/>
              <button onClick={onClose} className={`ml-3 p-1 rounded-md transition-colors duration-300 ${actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-white/10'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Search Results */}
            {filteredItems.length > 0 && (<div className={`border-t transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="max-h-96 overflow-y-auto p-2">
                  {Object.entries(groupedItems).map(([category, items]) => (<div key={category} className="mb-4 last:mb-0">
                      <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                        {category}
                      </div>
                      {items.map((item, index) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const IconComponent = item.icon;
                    return (<framer_motion_1.motion.button key={item.id} whileHover={{ scale: 1.02 }} onClick={() => handleItemSelect(item)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${selectedIndex === globalIndex
                            ? actualTheme === 'dark'
                                ? 'bg-gradient-primary text-white'
                                : 'bg-primary-500 text-white'
                            : actualTheme === 'dark'
                                ? 'text-dark-200 hover:bg-white/10'
                                : 'text-gray-700 hover:bg-gray-100'}`}>
                            {IconComponent && (<IconComponent className="w-5 h-5 flex-shrink-0"/>)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.label}</div>
                              {item.description && (<div className={`text-xs truncate mt-1 ${selectedIndex === globalIndex
                                ? 'text-white/80'
                                : actualTheme === 'dark'
                                    ? 'text-dark-400'
                                    : 'text-gray-500'}`}>
                                  {item.description}
                                </div>)}
                            </div>
                            <div className={`text-xs transition-colors duration-200 ${selectedIndex === globalIndex
                            ? 'text-white/60'
                            : actualTheme === 'dark'
                                ? 'text-dark-400'
                                : 'text-gray-400'}`}>
                              ⏎
                            </div>
                          </framer_motion_1.motion.button>);
                })}
                    </div>))}
                </div>
              </div>)}

            {/* No Results */}
            {searchQuery && filteredItems.length === 0 && (<div className={`p-8 text-center transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                <NavigationIcons_1.NavigationIcons.Search className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <div className="text-lg font-medium mb-2">No results found</div>
                <div className="text-sm">Try different keywords or browse the navigation menu</div>
              </div>)}

            {/* Search Tips */}
            {!searchQuery && (<div className={`p-8 text-center transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                <NavigationIcons_1.NavigationIcons.Search className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <div className="text-lg font-medium mb-2">Search Navigation</div>
                <div className="text-sm space-y-1">
                  <div>Type to search for pages, features, and functions</div>
                  <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
                    <span>↑↓ Navigate</span>
                    <span>⏎ Select</span>
                    <span>Esc Close</span>
                  </div>
                </div>
              </div>)}
          </div>
        </framer_motion_1.motion.div>
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>);
}
//# sourceMappingURL=NavigationSearch.js.map