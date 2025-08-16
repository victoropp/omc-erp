import React from 'react';
import { ChartData } from '@/types';
interface BarChartProps {
    data: ChartData;
    title?: string;
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    horizontal?: boolean;
    animate?: boolean;
    stacked?: boolean;
}
export declare function BarChart({ data, title, height, showLegend, showGrid, horizontal, animate, stacked, }: BarChartProps): React.JSX.Element;
export declare function SalesBarChart({ data, ...props }: Omit<BarChartProps, 'title'>): React.JSX.Element;
export declare function MonthlyRevenueChart({ data, ...props }: Omit<BarChartProps, 'title'>): React.JSX.Element;
export declare function RegionalSalesChart({ data, ...props }: Omit<BarChartProps, 'title'>): React.JSX.Element;
export declare function FuelTypeChart({ data, ...props }: Omit<BarChartProps, 'title'>): React.JSX.Element;
export {};
//# sourceMappingURL=BarChart.d.ts.map