import React from 'react';
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
    span?: 1 | 2 | 3;
    config?: any;
}
export interface FilterOption {
    key: string;
    label: string;
    value: string;
    options: Array<{
        value: string;
        label: string;
    }>;
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
    isRealTime?: boolean;
    lastUpdated?: Date;
    loading?: boolean;
    refreshing?: boolean;
    filters?: FilterOption[];
    actions?: ActionButton[];
    kpis?: KPICard[];
    charts?: ChartSection[];
    insights?: InsightCard[];
    quickActions?: QuickActionCard[];
    realTimeEndpoint?: string;
    realTimeUpdateInterval?: number;
    onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
    onRefresh?: () => void;
    headerContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    sidebarContent?: React.ReactNode;
}
export declare const AnalyticsPageTemplate: React.FC<AnalyticsPageTemplateProps>;
export default AnalyticsPageTemplate;
//# sourceMappingURL=AnalyticsPageTemplate.d.ts.map