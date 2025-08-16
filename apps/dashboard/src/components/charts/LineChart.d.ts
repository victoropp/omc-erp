import React from 'react';
import { ChartData } from '@/types';
interface LineChartProps {
    data: ChartData;
    title?: string;
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    fill?: boolean;
    tension?: number;
    animate?: boolean;
}
export declare function LineChart({ data, title, height, showLegend, showGrid, fill, tension, animate, }: LineChartProps): React.JSX.Element;
export declare function RevenueChart({ data, ...props }: Omit<LineChartProps, 'title'>): React.JSX.Element;
export declare function SalesChart({ data, ...props }: Omit<LineChartProps, 'title'>): React.JSX.Element;
export declare function TrafficChart({ data, ...props }: Omit<LineChartProps, 'title'>): React.JSX.Element;
export {};
//# sourceMappingURL=LineChart.d.ts.map