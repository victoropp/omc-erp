import { ChartOptions } from 'chart.js';
/**
 * Shared chart options utility to eliminate duplicate configuration
 * across all chart components (LineChart, BarChart, PieChart, etc.)
 */
export interface ChartTheme {
    isDark: boolean;
    colors: {
        text: string;
        subtext: string;
        grid: string;
        background: string;
        tooltip: {
            background: string;
            border: string;
        };
    };
}
export declare const getChartTheme: (isDark: boolean) => ChartTheme;
export declare const DEFAULT_COLORS: string[];
export declare const formatAxisValue: (value: number) => string;
export declare const formatTooltipValue: (value: number) => string;
export interface BaseChartConfig {
    title?: string;
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
}
export declare const getBaseChartOptions: (config: BaseChartConfig, theme: ChartTheme, chartType: "line" | "bar" | "pie" | "area" | "scatter" | "bubble" | "radar" | "polarArea" | "doughnut" | "horizontalBar" | "stackedBar") => Partial<ChartOptions>;
export declare const enhanceDatasetColors: (datasets: any[], colors?: string[]) => any[];
//# sourceMappingURL=chartOptions.d.ts.map