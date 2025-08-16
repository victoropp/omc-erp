import React from 'react';
import { ChartData } from '@/types';
interface PieChartProps {
    data: ChartData;
    title?: string;
    height?: number;
    showLegend?: boolean;
    animate?: boolean;
    variant?: 'pie' | 'doughnut';
    cutout?: string;
}
export declare function PieChart({ data, title, height, showLegend, animate, variant, cutout, }: PieChartProps): React.JSX.Element;
export declare function DoughnutChart(props: Omit<PieChartProps, 'variant'>): React.JSX.Element;
export declare function FuelDistributionChart({ data, ...props }: Omit<PieChartProps, 'title'>): React.JSX.Element;
export declare function PaymentMethodChart({ data, ...props }: Omit<PieChartProps, 'title'>): React.JSX.Element;
export declare function RegionDistributionChart({ data, ...props }: Omit<PieChartProps, 'title'>): React.JSX.Element;
export declare function CustomerTypeChart({ data, ...props }: Omit<PieChartProps, 'title'>): React.JSX.Element;
export {};
//# sourceMappingURL=PieChart.d.ts.map