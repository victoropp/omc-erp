import React from 'react';
interface RealTimeChartProps {
    chartType: 'line' | 'bar' | 'pie';
    title: string;
    endpoint: string;
    refreshInterval?: number;
    height?: number;
    showRefreshButton?: boolean;
    enableWebSocket?: boolean;
}
export declare function RealTimeChart({ chartType, title, endpoint, refreshInterval, // 30 seconds default
height, showRefreshButton, enableWebSocket, }: RealTimeChartProps): React.JSX.Element;
export declare function RealTimeRevenueChart(props: Omit<RealTimeChartProps, 'chartType' | 'endpoint'>): React.JSX.Element;
export declare function RealTimeSalesChart(props: Omit<RealTimeChartProps, 'chartType' | 'endpoint'>): React.JSX.Element;
export declare function RealTimeTransactionChart(props: Omit<RealTimeChartProps, 'chartType' | 'endpoint'>): React.JSX.Element;
export {};
//# sourceMappingURL=RealTimeChart.d.ts.map