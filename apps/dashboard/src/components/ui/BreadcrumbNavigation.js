"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbNavigation = BreadcrumbNavigation;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
const router_1 = require("next/router");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const NavigationIcons_1 = require("./NavigationIcons");
// Navigation mapping for automatic breadcrumb generation
const navigationMap = {
    '/dashboard': { label: 'Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
    '/dashboard/executive': { label: 'Executive Dashboard', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/dashboard/operational': { label: 'Operational Dashboard', icon: NavigationIcons_1.NavigationIcons.Management },
    '/dashboard/integrated': { label: 'Integrated Dashboard', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/uppf': { label: 'UPPF Management', icon: NavigationIcons_1.NavigationIcons.UPPF },
    '/uppf/dashboard': { label: 'UPPF Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
    '/uppf/claims': { label: 'Claims Management', icon: NavigationIcons_1.NavigationIcons.Claims },
    '/uppf/claims/create': { label: 'Create Claim', icon: NavigationIcons_1.NavigationIcons.Claims },
    '/uppf/gps-tracking': { label: 'GPS Tracking', icon: NavigationIcons_1.NavigationIcons.GPS },
    '/uppf/routes': { label: 'Route Management', icon: NavigationIcons_1.NavigationIcons.Routes },
    '/uppf/reconciliation': { label: 'Reconciliation', icon: NavigationIcons_1.NavigationIcons.Reconciliation },
    '/uppf/settlements': { label: 'Settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
    '/uppf/analytics': { label: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/uppf/automation': { label: 'Automation', icon: NavigationIcons_1.NavigationIcons.Automation },
    '/uppf/npa-submission': { label: 'NPA Submission', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/pricing': { label: 'Pricing Management', icon: NavigationIcons_1.NavigationIcons.Pricing },
    '/pricing/dashboard': { label: 'Pricing Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
    '/pricing/build-up': { label: 'Price Build-Up', icon: NavigationIcons_1.NavigationIcons.Calculator },
    '/pricing/windows': { label: 'Pricing Windows', icon: NavigationIcons_1.NavigationIcons.Windows },
    '/pricing/calculator': { label: 'Price Calculator', icon: NavigationIcons_1.NavigationIcons.Calculator },
    '/pricing/components': { label: 'PBU Components', icon: NavigationIcons_1.NavigationIcons.Components },
    '/pricing/analytics': { label: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/pricing/reports': { label: 'Reports', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/pricing/automation': { label: 'Automation', icon: NavigationIcons_1.NavigationIcons.Automation },
    '/pricing/npa-integration': { label: 'NPA Integration', icon: NavigationIcons_1.NavigationIcons.Management },
    '/pricing/variance': { label: 'Variance Analysis', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/pricing/settlements': { label: 'Settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
    '/dealers': { label: 'Dealer Management', icon: NavigationIcons_1.NavigationIcons.Dealers },
    '/dealers/dashboard': { label: 'Dealer Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
    '/dealers/onboarding': { label: 'Dealer Onboarding', icon: NavigationIcons_1.NavigationIcons.Onboarding },
    '/dealers/performance': { label: 'Performance Tracking', icon: NavigationIcons_1.NavigationIcons.Performance },
    '/dealers/loans': { label: 'Loan Management', icon: NavigationIcons_1.NavigationIcons.Loans },
    '/dealers/credit': { label: 'Credit Assessment', icon: NavigationIcons_1.NavigationIcons.Credit },
    '/dealers/settlements': { label: 'Settlements', icon: NavigationIcons_1.NavigationIcons.Settlements },
    '/dealers/compliance': { label: 'Compliance Monitoring', icon: NavigationIcons_1.NavigationIcons.Compliance },
    '/dealers/analytics': { label: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/dealers/management': { label: 'Management', icon: NavigationIcons_1.NavigationIcons.Management },
    '/dealers/reports': { label: 'Reports', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/ifrs': { label: 'IFRS Compliance', icon: NavigationIcons_1.NavigationIcons.IFRS },
    '/ifrs/dashboard': { label: 'IFRS Dashboard', icon: NavigationIcons_1.NavigationIcons.Dashboard },
    '/ifrs/revenue-recognition': { label: 'Revenue Recognition', icon: NavigationIcons_1.NavigationIcons.RevenueRecognition },
    '/ifrs/expected-credit-loss': { label: 'Expected Credit Loss', icon: NavigationIcons_1.NavigationIcons.Credit },
    '/ifrs/lease-accounting': { label: 'Lease Accounting', icon: NavigationIcons_1.NavigationIcons.Management },
    '/ifrs/asset-impairment': { label: 'Asset Impairment', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/ifrs/compliance': { label: 'Compliance', icon: NavigationIcons_1.NavigationIcons.Compliance },
    '/ifrs/disclosures': { label: 'Disclosures', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/ifrs/reporting': { label: 'Reporting', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/ifrs/analytics': { label: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/stations': { label: 'Stations', icon: NavigationIcons_1.NavigationIcons.Stations },
    '/stations/management': { label: 'Station Management', icon: NavigationIcons_1.NavigationIcons.Management },
    '/transactions': { label: 'Transactions', icon: NavigationIcons_1.NavigationIcons.Transactions },
    '/customers': { label: 'Customers', icon: NavigationIcons_1.NavigationIcons.Customers },
    '/inventory': { label: 'Inventory', icon: NavigationIcons_1.NavigationIcons.Inventory },
    '/financial': { label: 'Financial', icon: NavigationIcons_1.NavigationIcons.Financial },
    '/financial/chart-of-accounts': { label: 'Chart of Accounts', icon: NavigationIcons_1.NavigationIcons.Management },
    '/financial/general-ledger': { label: 'General Ledger', icon: NavigationIcons_1.NavigationIcons.GeneralLedger },
    '/financial/journal-entries': { label: 'Journal Entries', icon: NavigationIcons_1.NavigationIcons.JournalEntries },
    '/financial/trial-balance': { label: 'Trial Balance', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/financial/accounts-payable': { label: 'Accounts Payable', icon: NavigationIcons_1.NavigationIcons.Financial },
    '/financial/accounts-receivable': { label: 'Accounts Receivable', icon: NavigationIcons_1.NavigationIcons.Financial },
    '/financial/bank-reconciliation': { label: 'Bank Reconciliation', icon: NavigationIcons_1.NavigationIcons.Reconciliation },
    '/financial/financial-statements': { label: 'Financial Statements', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/financial/cost-centers': { label: 'Cost Centers', icon: NavigationIcons_1.NavigationIcons.Management },
    '/financial/budget-management': { label: 'Budget Management', icon: NavigationIcons_1.NavigationIcons.Management },
    '/financial/tax-management': { label: 'Tax Management', icon: NavigationIcons_1.NavigationIcons.Management },
    '/hr': { label: 'Human Resources', icon: NavigationIcons_1.NavigationIcons.HumanResources },
    '/hr/employees': { label: 'Employees', icon: NavigationIcons_1.NavigationIcons.Employees },
    '/hr/payroll': { label: 'Payroll', icon: NavigationIcons_1.NavigationIcons.Payroll },
    '/hr/leave-management': { label: 'Leave Management', icon: NavigationIcons_1.NavigationIcons.Management },
    '/hr/performance': { label: 'Performance', icon: NavigationIcons_1.NavigationIcons.Performance },
    '/hr/training': { label: 'Training', icon: NavigationIcons_1.NavigationIcons.Management },
    '/hr/recruitment': { label: 'Recruitment', icon: NavigationIcons_1.NavigationIcons.Management },
    '/fleet': { label: 'Fleet Management', icon: NavigationIcons_1.NavigationIcons.Fleet },
    '/fleet/vehicles': { label: 'Vehicles', icon: NavigationIcons_1.NavigationIcons.Vehicles },
    '/fleet/drivers': { label: 'Drivers', icon: NavigationIcons_1.NavigationIcons.Employees },
    '/fleet/maintenance': { label: 'Maintenance', icon: NavigationIcons_1.NavigationIcons.Maintenance },
    '/fleet/gps-tracking': { label: 'GPS Tracking', icon: NavigationIcons_1.NavigationIcons.GPS },
    '/fleet/deliveries': { label: 'Deliveries', icon: NavigationIcons_1.NavigationIcons.Management },
    '/procurement': { label: 'Procurement', icon: NavigationIcons_1.NavigationIcons.Procurement },
    '/procurement/purchase-orders': { label: 'Purchase Orders', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders },
    '/procurement/create-po': { label: 'Create Purchase Order', icon: NavigationIcons_1.NavigationIcons.PurchaseOrders },
    '/suppliers': { label: 'Suppliers', icon: NavigationIcons_1.NavigationIcons.Suppliers },
    '/suppliers/create': { label: 'Create Supplier', icon: NavigationIcons_1.NavigationIcons.Suppliers },
    '/suppliers/contracts': { label: 'Contracts', icon: NavigationIcons_1.NavigationIcons.Management },
    '/suppliers/performance': { label: 'Performance', icon: NavigationIcons_1.NavigationIcons.Performance },
    '/products': { label: 'Products', icon: NavigationIcons_1.NavigationIcons.Products },
    '/products/create': { label: 'Create Product', icon: NavigationIcons_1.NavigationIcons.Products },
    '/products/categories': { label: 'Categories', icon: NavigationIcons_1.NavigationIcons.Categories },
    '/analytics': { label: 'Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/analytics/ai-insights': { label: 'AI Insights', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/analytics/financial': { label: 'Financial Analytics', icon: NavigationIcons_1.NavigationIcons.Financial },
    '/analytics/operational': { label: 'Operational Analytics', icon: NavigationIcons_1.NavigationIcons.Management },
    '/analytics/sales': { label: 'Sales Analytics', icon: NavigationIcons_1.NavigationIcons.Analytics },
    '/analytics/inventory': { label: 'Inventory Analytics', icon: NavigationIcons_1.NavigationIcons.Inventory },
    '/reports': { label: 'Reports', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/reports/sales': { label: 'Sales Reports', icon: NavigationIcons_1.NavigationIcons.Reports },
    '/reports/inventory': { label: 'Inventory Reports', icon: NavigationIcons_1.NavigationIcons.Inventory },
    '/reports/financial': { label: 'Financial Reports', icon: NavigationIcons_1.NavigationIcons.Financial },
    '/reports/regulatory': { label: 'Regulatory Reports', icon: NavigationIcons_1.NavigationIcons.Compliance },
    '/admin': { label: 'Administration', icon: NavigationIcons_1.NavigationIcons.Admin },
    '/admin/configuration': { label: 'System Configuration', icon: NavigationIcons_1.NavigationIcons.Settings },
    '/admin/users': { label: 'Users', icon: NavigationIcons_1.NavigationIcons.Users },
    '/admin/roles': { label: 'Roles', icon: NavigationIcons_1.NavigationIcons.Roles },
    '/admin/audit-logs': { label: 'Audit Logs', icon: NavigationIcons_1.NavigationIcons.AuditLogs },
    '/admin/system-health': { label: 'System Health', icon: NavigationIcons_1.NavigationIcons.SystemHealth },
    '/settings': { label: 'Settings', icon: NavigationIcons_1.NavigationIcons.Settings },
    '/settings/general': { label: 'General Settings', icon: NavigationIcons_1.NavigationIcons.Settings },
    '/settings/notifications': { label: 'Notifications', icon: NavigationIcons_1.NavigationIcons.Management },
    '/settings/security': { label: 'Security', icon: NavigationIcons_1.NavigationIcons.Admin },
    '/settings/integrations': { label: 'Integrations', icon: NavigationIcons_1.NavigationIcons.Management },
    '/settings/backup': { label: 'Backup', icon: NavigationIcons_1.NavigationIcons.Management },
};
function BreadcrumbNavigation({ items, showHome = true }) {
    const router = (0, router_1.useRouter)();
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const generateBreadcrumbs = () => {
        if (items)
            return items;
        const pathSegments = router.asPath.split('/').filter(Boolean);
        const breadcrumbs = [];
        if (showHome) {
            breadcrumbs.push({
                label: 'Home',
                href: '/dashboard',
                icon: NavigationIcons_1.NavigationIcons.Dashboard
            });
        }
        let currentPath = '';
        pathSegments.forEach((segment) => {
            currentPath += `/${segment}`;
            const navItem = navigationMap[currentPath];
            if (navItem) {
                breadcrumbs.push({
                    label: navItem.label,
                    href: currentPath,
                    icon: navItem.icon
                });
            }
            else {
                // Fallback for dynamic routes or unmapped routes
                breadcrumbs.push({
                    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                    href: currentPath
                });
            }
        });
        return breadcrumbs;
    };
    const breadcrumbs = generateBreadcrumbs();
    if (breadcrumbs.length <= 1)
        return null;
    return (<framer_motion_1.motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex items-center space-x-2 px-6 py-3 border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10 bg-dark-800/50' : 'border-gray-200 bg-white/50'}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const IconComponent = item.icon;
            return (<li key={item.href} className="flex items-center">
              {index > 0 && (<NavigationIcons_1.NavigationIcons.Breadcrumb className={`w-4 h-4 mx-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400'}`}/>)}
              
              {isLast ? (<framer_motion_1.motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {IconComponent && (<IconComponent className="w-4 h-4"/>)}
                  <span>{item.label}</span>
                </framer_motion_1.motion.span>) : (<link_1.default href={item.href}>
                  <framer_motion_1.motion.span whileHover={{ scale: 1.05 }} className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 hover:underline ${actualTheme === 'dark'
                        ? 'text-dark-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'}`}>
                    {IconComponent && (<IconComponent className="w-4 h-4"/>)}
                    <span>{item.label}</span>
                  </framer_motion_1.motion.span>
                </link_1.default>)}
            </li>);
        })}
      </ol>
    </framer_motion_1.motion.nav>);
}
//# sourceMappingURL=BreadcrumbNavigation.js.map