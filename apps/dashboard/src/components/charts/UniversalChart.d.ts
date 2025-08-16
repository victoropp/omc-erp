import React from 'react';
import { BaseChartConfig } from '@/utils/chartOptions';
import { ChartData } from '@/types';
/**
 * Universal Chart Component
 * Consolidates all chart types into a single component to eliminate duplication
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble' | 'area' | 'horizontalBar' | 'stackedBar';
export interface UniversalChartProps extends BaseChartConfig {
    type: ChartType;
    data: ChartData;
    fill?: boolean;
    tension?: number;
    horizontal?: boolean;
    stacked?: boolean;
    cutout?: string | number;
    colors?: string[];
    gradients?: boolean;
    onChartClick?: (event: any, elements: any[]) => void;
    onHover?: (event: any, elements: any[]) => void;
    animationDuration?: number;
    animationEasing?: string;
    customOptions?: any;
}
export declare const UniversalChart: React.FC<UniversalChartProps>;
export declare const LineChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const BarChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const PieChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const AreaChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const DoughnutChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const HorizontalBarChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const StackedBarChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const RadarChart: React.FC<Omit<UniversalChartProps, 'type'>>;
export declare const RevenueChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>>;
export declare const SalesChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>>;
export declare const ProductDistributionChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>>;
export declare const RegionalSalesChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>>;
export declare const MonthlyComparisonChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>>;
export default UniversalChart;
//# sourceMappingURL=UniversalChart.d.ts.map