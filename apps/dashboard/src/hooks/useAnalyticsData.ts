import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/api';
import { toast } from 'react-hot-toast';

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
  autoRefresh?: number; // seconds
  mockDataGenerator?: () => BaseAnalyticsData;
}

export function useAnalyticsData({
  endpoint,
  filters,
  realTimeUpdates = false,
  autoRefresh,
  mockDataGenerator,
}: UseAnalyticsDataOptions) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BaseAnalyticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      let analyticsData: BaseAnalyticsData;

      try {
        const response = await analyticsService.get(`${endpoint}?${params.toString()}`);
        analyticsData = response.data;
      } catch (apiError) {
        console.warn(`API call failed for ${endpoint}, using mock data:`, apiError);
        
        if (mockDataGenerator) {
          analyticsData = mockDataGenerator();
        } else {
          analyticsData = generateDefaultMockData(filters.period);
        }
      }

      setData(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      
      // Fallback to mock data
      if (mockDataGenerator) {
        setData(mockDataGenerator());
      } else {
        setData(generateDefaultMockData(filters.period));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.loading(`Exporting analytics as ${format.toUpperCase()}...`);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      params.append('format', format);

      const response = await analyticsService.get(`${endpoint}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${endpoint.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAnalyticsData();
  }, [endpoint, JSON.stringify(filters)]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchAnalyticsData(false);
      }, autoRefresh * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, endpoint, JSON.stringify(filters)]);

  return {
    data,
    loading,
    refreshing,
    lastUpdated,
    fetchAnalyticsData,
    refreshData,
    exportData,
  };
}

// Mock data generators
export const generateDefaultMockData = (period: string): BaseAnalyticsData => {
  const periodMultiplier = getPeriodMultiplier(period);
  
  return {
    summary: {
      totalValue: Math.floor(Math.random() * 1000000) * periodMultiplier,
      growth: Math.random() * 30 - 5, // -5% to 25%
      count: Math.floor(Math.random() * 10000) * periodMultiplier,
      averageValue: Math.floor(Math.random() * 500) + 100,
    },
    trends: generateTrendData(period),
    breakdown: {
      byCategory: generateCategoryData(),
      byRegion: generateRegionData(),
      byPeriod: generatePeriodData(period),
    },
    insights: {
      topPerformer: 'Strong performance in premium fuel segment',
      growthOpportunity: 'Expand lubricants market in Northern region',
      riskArea: 'Inventory levels below optimal threshold',
      recommendation: 'Implement dynamic pricing for peak hours',
    },
  };
};

const getPeriodMultiplier = (period: string): number => {
  switch (period) {
    case '7d': return 0.2;
    case '30d': return 1;
    case '90d': return 3;
    case '1y': return 12;
    default: return 1;
  }
};

const generateTrendData = (period: string) => {
  const dataPoints = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 12 : 12;
  const labels = Array.from({ length: dataPoints }, (_, i) => 
    period === '7d' ? `Day ${i + 1}` :
    period === '30d' ? `${i + 1}` :
    period === '90d' ? `Week ${i + 1}` :
    `Month ${i + 1}`
  );

  return {
    labels,
    datasets: [{
      label: 'Trend',
      data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 1000) + 500),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }]
  };
};

const generateCategoryData = () => ({
  labels: ['Petrol 95', 'Diesel AGO', 'Kerosene DPK', 'Engine Oil', 'LPG', 'Lubricants'],
  datasets: [{
    data: [45, 28, 15, 8, 3, 1],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
  }]
});

const generateRegionData = () => ({
  labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern', 'Others'],
  datasets: [{
    label: 'Sales (GHS)',
    data: [850000, 420000, 380000, 245000, 180000, 125000],
    backgroundColor: '#3B82F6'
  }]
});

const generatePeriodData = (period: string) => {
  const dataPoints = 6;
  const labels = Array.from({ length: dataPoints }, (_, i) => `Period ${i + 1}`);
  
  return {
    labels,
    datasets: [{
      label: 'Value',
      data: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 500) + 200),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }]
  };
};