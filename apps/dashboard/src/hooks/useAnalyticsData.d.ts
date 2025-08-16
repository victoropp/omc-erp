/**
 * Universal Analytics Data Hook
 * Eliminates duplicate data fetching logic across all analytics pages
 */
export interface AnalyticsFilters {
    period: string;
    dateRange?: string;
    product?: string;
    region?: string;
    dealer?: string;
    status?: string;
    route?: string;
}
export interface BaseAnalyticsData {
    summary: {
        totalValue: number;
        growth: number;
        count: number;
        averageValue: number;
    };
    trends: {
        labels: string[];
        datasets: any[];
    };
    breakdown: {
        byCategory: any;
        byRegion: any;
        byPeriod: any;
    };
    insights: {
        topPerformer: string;
        growthOpportunity: string;
        riskArea: string;
        recommendation: string;
    };
    realTimeMetrics?: any;
    kpis?: Record<string, number>;
}
export interface UseAnalyticsDataOptions {
    endpoint: string;
    filters: AnalyticsFilters;
    realTimeUpdates?: boolean;
    autoRefresh?: number;
    mockDataGenerator?: () => BaseAnalyticsData;
}
export declare function useAnalyticsData({ endpoint, filters, realTimeUpdates, autoRefresh, mockDataGenerator, }: UseAnalyticsDataOptions): {
    data: BaseAnalyticsData | null;
    loading: boolean;
    refreshing: boolean;
    lastUpdated: Date;
    fetchAnalyticsData: (showLoading?: boolean) => Promise<void>;
    refreshData: () => Promise<void>;
    exportData: (format: "csv" | "excel" | "pdf") => Promise<void>;
};
export declare const generateDefaultMockData: (period: string) => BaseAnalyticsData;
//# sourceMappingURL=useAnalyticsData.d.ts.map