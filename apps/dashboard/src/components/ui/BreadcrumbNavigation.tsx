import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { NavigationIcons } from './NavigationIcons';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

// Navigation mapping for automatic breadcrumb generation
const navigationMap: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  '/dashboard': { label: 'Dashboard', icon: NavigationIcons.Dashboard },
  '/dashboard/executive': { label: 'Executive Dashboard', icon: NavigationIcons.Analytics },
  '/dashboard/operational': { label: 'Operational Dashboard', icon: NavigationIcons.Management },
  '/dashboard/integrated': { label: 'Integrated Dashboard', icon: NavigationIcons.Analytics },
  '/uppf': { label: 'UPPF Management', icon: NavigationIcons.UPPF },
  '/uppf/dashboard': { label: 'UPPF Dashboard', icon: NavigationIcons.Dashboard },
  '/uppf/claims': { label: 'Claims Management', icon: NavigationIcons.Claims },
  '/uppf/claims/create': { label: 'Create Claim', icon: NavigationIcons.Claims },
  '/uppf/gps-tracking': { label: 'GPS Tracking', icon: NavigationIcons.GPS },
  '/uppf/routes': { label: 'Route Management', icon: NavigationIcons.Routes },
  '/uppf/reconciliation': { label: 'Reconciliation', icon: NavigationIcons.Reconciliation },
  '/uppf/settlements': { label: 'Settlements', icon: NavigationIcons.Settlements },
  '/uppf/analytics': { label: 'Analytics', icon: NavigationIcons.Analytics },
  '/uppf/automation': { label: 'Automation', icon: NavigationIcons.Automation },
  '/uppf/npa-submission': { label: 'NPA Submission', icon: NavigationIcons.Reports },
  '/pricing': { label: 'Pricing Management', icon: NavigationIcons.Pricing },
  '/pricing/dashboard': { label: 'Pricing Dashboard', icon: NavigationIcons.Dashboard },
  '/pricing/build-up': { label: 'Price Build-Up', icon: NavigationIcons.Calculator },
  '/pricing/windows': { label: 'Pricing Windows', icon: NavigationIcons.Windows },
  '/pricing/calculator': { label: 'Price Calculator', icon: NavigationIcons.Calculator },
  '/pricing/components': { label: 'PBU Components', icon: NavigationIcons.Components },
  '/pricing/analytics': { label: 'Analytics', icon: NavigationIcons.Analytics },
  '/pricing/reports': { label: 'Reports', icon: NavigationIcons.Reports },
  '/pricing/automation': { label: 'Automation', icon: NavigationIcons.Automation },
  '/pricing/npa-integration': { label: 'NPA Integration', icon: NavigationIcons.Management },
  '/pricing/variance': { label: 'Variance Analysis', icon: NavigationIcons.Analytics },
  '/pricing/settlements': { label: 'Settlements', icon: NavigationIcons.Settlements },
  '/dealers': { label: 'Dealer Management', icon: NavigationIcons.Dealers },
  '/dealers/dashboard': { label: 'Dealer Dashboard', icon: NavigationIcons.Dashboard },
  '/dealers/onboarding': { label: 'Dealer Onboarding', icon: NavigationIcons.Onboarding },
  '/dealers/performance': { label: 'Performance Tracking', icon: NavigationIcons.Performance },
  '/dealers/loans': { label: 'Loan Management', icon: NavigationIcons.Loans },
  '/dealers/credit': { label: 'Credit Assessment', icon: NavigationIcons.Credit },
  '/dealers/settlements': { label: 'Settlements', icon: NavigationIcons.Settlements },
  '/dealers/compliance': { label: 'Compliance Monitoring', icon: NavigationIcons.Compliance },
  '/dealers/analytics': { label: 'Analytics', icon: NavigationIcons.Analytics },
  '/dealers/management': { label: 'Management', icon: NavigationIcons.Management },
  '/dealers/reports': { label: 'Reports', icon: NavigationIcons.Reports },
  '/ifrs': { label: 'IFRS Compliance', icon: NavigationIcons.IFRS },
  '/ifrs/dashboard': { label: 'IFRS Dashboard', icon: NavigationIcons.Dashboard },
  '/ifrs/revenue-recognition': { label: 'Revenue Recognition', icon: NavigationIcons.RevenueRecognition },
  '/ifrs/expected-credit-loss': { label: 'Expected Credit Loss', icon: NavigationIcons.Credit },
  '/ifrs/lease-accounting': { label: 'Lease Accounting', icon: NavigationIcons.Management },
  '/ifrs/asset-impairment': { label: 'Asset Impairment', icon: NavigationIcons.Analytics },
  '/ifrs/compliance': { label: 'Compliance', icon: NavigationIcons.Compliance },
  '/ifrs/disclosures': { label: 'Disclosures', icon: NavigationIcons.Reports },
  '/ifrs/reporting': { label: 'Reporting', icon: NavigationIcons.Reports },
  '/ifrs/analytics': { label: 'Analytics', icon: NavigationIcons.Analytics },
  '/stations': { label: 'Stations', icon: NavigationIcons.Stations },
  '/stations/management': { label: 'Station Management', icon: NavigationIcons.Management },
  '/transactions': { label: 'Transactions', icon: NavigationIcons.Transactions },
  '/customers': { label: 'Customers', icon: NavigationIcons.Customers },
  '/inventory': { label: 'Inventory', icon: NavigationIcons.Inventory },
  '/financial': { label: 'Financial', icon: NavigationIcons.Financial },
  '/financial/chart-of-accounts': { label: 'Chart of Accounts', icon: NavigationIcons.Management },
  '/financial/general-ledger': { label: 'General Ledger', icon: NavigationIcons.GeneralLedger },
  '/financial/journal-entries': { label: 'Journal Entries', icon: NavigationIcons.JournalEntries },
  '/financial/trial-balance': { label: 'Trial Balance', icon: NavigationIcons.Analytics },
  '/financial/accounts-payable': { label: 'Accounts Payable', icon: NavigationIcons.Financial },
  '/financial/accounts-receivable': { label: 'Accounts Receivable', icon: NavigationIcons.Financial },
  '/financial/bank-reconciliation': { label: 'Bank Reconciliation', icon: NavigationIcons.Reconciliation },
  '/financial/financial-statements': { label: 'Financial Statements', icon: NavigationIcons.Reports },
  '/financial/cost-centers': { label: 'Cost Centers', icon: NavigationIcons.Management },
  '/financial/budget-management': { label: 'Budget Management', icon: NavigationIcons.Management },
  '/financial/tax-management': { label: 'Tax Management', icon: NavigationIcons.Management },
  '/hr': { label: 'Human Resources', icon: NavigationIcons.HumanResources },
  '/hr/employees': { label: 'Employees', icon: NavigationIcons.Employees },
  '/hr/payroll': { label: 'Payroll', icon: NavigationIcons.Payroll },
  '/hr/leave-management': { label: 'Leave Management', icon: NavigationIcons.Management },
  '/hr/performance': { label: 'Performance', icon: NavigationIcons.Performance },
  '/hr/training': { label: 'Training', icon: NavigationIcons.Management },
  '/hr/recruitment': { label: 'Recruitment', icon: NavigationIcons.Management },
  '/fleet': { label: 'Fleet Management', icon: NavigationIcons.Fleet },
  '/fleet/vehicles': { label: 'Vehicles', icon: NavigationIcons.Vehicles },
  '/fleet/drivers': { label: 'Drivers', icon: NavigationIcons.Employees },
  '/fleet/maintenance': { label: 'Maintenance', icon: NavigationIcons.Maintenance },
  '/fleet/gps-tracking': { label: 'GPS Tracking', icon: NavigationIcons.GPS },
  '/fleet/deliveries': { label: 'Deliveries', icon: NavigationIcons.Management },
  '/procurement': { label: 'Procurement', icon: NavigationIcons.Procurement },
  '/procurement/purchase-orders': { label: 'Purchase Orders', icon: NavigationIcons.PurchaseOrders },
  '/procurement/create-po': { label: 'Create Purchase Order', icon: NavigationIcons.PurchaseOrders },
  '/suppliers': { label: 'Suppliers', icon: NavigationIcons.Suppliers },
  '/suppliers/create': { label: 'Create Supplier', icon: NavigationIcons.Suppliers },
  '/suppliers/contracts': { label: 'Contracts', icon: NavigationIcons.Management },
  '/suppliers/performance': { label: 'Performance', icon: NavigationIcons.Performance },
  '/products': { label: 'Products', icon: NavigationIcons.Products },
  '/products/create': { label: 'Create Product', icon: NavigationIcons.Products },
  '/products/categories': { label: 'Categories', icon: NavigationIcons.Categories },
  '/analytics': { label: 'Analytics', icon: NavigationIcons.Analytics },
  '/analytics/ai-insights': { label: 'AI Insights', icon: NavigationIcons.Analytics },
  '/analytics/financial': { label: 'Financial Analytics', icon: NavigationIcons.Financial },
  '/analytics/operational': { label: 'Operational Analytics', icon: NavigationIcons.Management },
  '/analytics/sales': { label: 'Sales Analytics', icon: NavigationIcons.Analytics },
  '/analytics/inventory': { label: 'Inventory Analytics', icon: NavigationIcons.Inventory },
  '/reports': { label: 'Reports', icon: NavigationIcons.Reports },
  '/reports/sales': { label: 'Sales Reports', icon: NavigationIcons.Reports },
  '/reports/inventory': { label: 'Inventory Reports', icon: NavigationIcons.Inventory },
  '/reports/financial': { label: 'Financial Reports', icon: NavigationIcons.Financial },
  '/reports/regulatory': { label: 'Regulatory Reports', icon: NavigationIcons.Compliance },
  '/admin': { label: 'Administration', icon: NavigationIcons.Admin },
  '/admin/configuration': { label: 'System Configuration', icon: NavigationIcons.Settings },
  '/admin/users': { label: 'Users', icon: NavigationIcons.Users },
  '/admin/roles': { label: 'Roles', icon: NavigationIcons.Roles },
  '/admin/audit-logs': { label: 'Audit Logs', icon: NavigationIcons.AuditLogs },
  '/admin/system-health': { label: 'System Health', icon: NavigationIcons.SystemHealth },
  '/settings': { label: 'Settings', icon: NavigationIcons.Settings },
  '/settings/general': { label: 'General Settings', icon: NavigationIcons.Settings },
  '/settings/notifications': { label: 'Notifications', icon: NavigationIcons.Management },
  '/settings/security': { label: 'Security', icon: NavigationIcons.Admin },
  '/settings/integrations': { label: 'Integrations', icon: NavigationIcons.Management },
  '/settings/backup': { label: 'Backup', icon: NavigationIcons.Management },
};

export function BreadcrumbNavigation({ items, showHome = true }: BreadcrumbNavigationProps) {
  const router = useRouter();
  const { actualTheme } = useTheme();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/dashboard',
        icon: NavigationIcons.Dashboard
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
      } else {
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

  if (breadcrumbs.length <= 1) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-2 px-6 py-3 border-b transition-colors duration-300 ${
        actualTheme === 'dark' ? 'border-white/10 bg-dark-800/50' : 'border-gray-200 bg-white/50'
      }`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <NavigationIcons.Breadcrumb 
                  className={`w-4 h-4 mx-2 transition-colors duration-300 ${
                    actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400'
                  }`} 
                />
              )}
              
              {isLast ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent className="w-4 h-4" />
                  )}
                  <span>{item.label}</span>
                </motion.span>
              ) : (
                <Link href={item.href}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 hover:underline ${
                      actualTheme === 'dark' 
                        ? 'text-dark-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <span>{item.label}</span>
                  </motion.span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}