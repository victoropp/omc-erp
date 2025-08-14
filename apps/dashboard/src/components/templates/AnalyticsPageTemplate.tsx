import React from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { RealTimeChart } from '@/components/charts/RealTimeChart';
import Link from 'next/link';

/**
 * Universal Analytics Page Template
 * Eliminates duplicate layout and structure patterns across all analytics pages
 */

export interface KPICard {
  title: string;
  value: string | number;
  growth?: number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie' | 'realtime';
  data: any;
  height?: number;
  delay?: number;
  span?: 1 | 2 | 3; // Grid column span
  config?: any;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export interface ActionButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick: () => void;
  disabled?: boolean;
}

export interface QuickActionCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export interface InsightCard {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface AnalyticsPageTemplateProps {
  title: string;
  subtitle: string;
  
  // Status indicators
  isRealTime?: boolean;
  lastUpdated?: Date;
  
  // Loading states
  loading?: boolean;
  refreshing?: boolean;
  
  // Filters and controls
  filters?: FilterOption[];
  actions?: ActionButton[];
  
  // Data sections
  kpis?: KPICard[];
  charts?: ChartSection[];
  insights?: InsightCard[];
  quickActions?: QuickActionCard[];
  
  // Real-time features
  realTimeEndpoint?: string;
  realTimeUpdateInterval?: number;
  
  // Export functionality
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  onRefresh?: () => void;
  
  // Custom content slots
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

export const AnalyticsPageTemplate: React.FC<AnalyticsPageTemplateProps> = ({
  title,
  subtitle,
  isRealTime = false,
  lastUpdated,
  loading = false,
  refreshing = false,
  filters = [],
  actions = [],
  kpis = [],
  charts = [],
  insights = [],
  quickActions = [],
  realTimeEndpoint,
  realTimeUpdateInterval = 30000,
  onExport,
  onRefresh,
  headerContent,
  footerContent,
  sidebarContent,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-GH').format(number);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getKPIIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '💰': <span className="text-2xl">💰</span>,
      '📊': <span className="text-2xl">📊</span>,
      '🛒': <span className="text-2xl">🛒</span>,
      '👥': <span className="text-2xl">👥</span>,
      '📦': <span className="text-2xl">📦</span>,
      '📈': <span className="text-2xl">📈</span>,
      '⚡': <span className="text-2xl">⚡</span>,
      '🎯': <span className="text-2xl">🎯</span>,
      '🏆': <span className="text-2xl">🏆</span>,
    };
    
    return iconMap[icon] || <span className="text-2xl">{icon}</span>;
  };

  const getInsightIcon = (type: InsightCard['type']) => {
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };
    return icons[type];
  };

  const getInsightColors = (type: InsightCard['type']) => {
    const colors = {
      success: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
      info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
      error: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
    };
    return colors[type];
  };

  const renderChart = (chart: ChartSection) => {
    switch (chart.type) {
      case 'line':
        return <LineChart data={chart.data} height={chart.height} {...(chart.config || {})} />;
      case 'bar':
        return <BarChart data={chart.data} height={chart.height} {...(chart.config || {})} />;
      case 'pie':
        return <PieChart data={chart.data} height={chart.height} {...(chart.config || {})} />;
      case 'realtime':
        return (
          <RealTimeChart 
            endpoint={realTimeEndpoint || '/analytics/live'}
            height={chart.height || 300}
            updateInterval={realTimeUpdateInterval}
            {...(chart.config || {})}
          />
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const getGridColsClass = (span: number = 1) => {
    const spanClasses = {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2', 
      3: 'lg:col-span-3',
    };
    return spanClasses[span as keyof typeof spanClasses] || 'lg:col-span-1';
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title={title} subtitle={subtitle}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout title={title} subtitle={subtitle}>
      <div className="space-y-6">
        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            {isRealTime && (
              <Badge variant="success">● Live Updates</Badge>
            )}
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                className="w-40"
              />
            ))}
            
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                disabled={action.disabled || refreshing}
              >
                {refreshing && action.label === 'Refresh' ? 'Refreshing...' : action.label}
              </Button>
            ))}

            {onExport && (
              <div className="relative group">
                <Button variant="outline">Export</Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => onExport('csv')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => onExport('excel')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => onExport('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {headerContent}
        </motion.div>

        {/* KPI Cards */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getKPIIcon(kpi.icon)}
                    {kpi.growth !== undefined && (
                      <span className={`text-sm font-medium ${
                        kpi.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(kpi.growth)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                    <p className={`text-2xl font-bold text-${kpi.color}-600`}>
                      {typeof kpi.value === 'number' && kpi.title.toLowerCase().includes('currency') 
                        ? formatCurrency(kpi.value)
                        : typeof kpi.value === 'number'
                        ? formatNumber(kpi.value)
                        : kpi.value
                      }
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        {charts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart, index) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (chart.delay || 0) + (index * 0.1) }}
                className={getGridColsClass(chart.span)}
              >
                <Card className="p-6">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{chart.title}</h3>
                    {chart.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{chart.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Insights Section */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automated analytics and recommendations</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getInsightColors(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getInsightIcon(insight.type)}</span>
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm mt-1">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${action.color}-100 dark:bg-${action.color}-900 rounded-lg flex items-center justify-center`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {sidebarContent}
        {footerContent}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default AnalyticsPageTemplate;