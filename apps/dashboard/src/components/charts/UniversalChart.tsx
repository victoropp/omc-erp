import React from 'react';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getBaseChartOptions, getChartTheme, enhanceDatasetColors, BaseChartConfig } from '@/utils/chartOptions';
import { ChartData } from '@/types';

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Universal Chart Component
 * Consolidates all chart types into a single component to eliminate duplication
 */

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'doughnut' 
  | 'radar' 
  | 'polarArea' 
  | 'scatter' 
  | 'bubble'
  | 'area'
  | 'horizontalBar'
  | 'stackedBar';

export interface UniversalChartProps extends BaseChartConfig {
  type: ChartType;
  data: ChartData;
  
  // Chart-specific options
  fill?: boolean;
  tension?: number;
  horizontal?: boolean;
  stacked?: boolean;
  cutout?: string | number; // For doughnut charts
  
  // Styling
  colors?: string[];
  gradients?: boolean;
  
  // Interaction
  onChartClick?: (event: any, elements: any[]) => void;
  onHover?: (event: any, elements: any[]) => void;
  
  // Animation
  animationDuration?: number;
  animationEasing?: string;
  
  // Custom options override
  customOptions?: any;
}

export const UniversalChart: React.FC<UniversalChartProps> = ({
  type,
  data,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  animate = true,
  fill = false,
  tension = 0.4,
  horizontal = false,
  stacked = false,
  cutout,
  colors,
  gradients = false,
  onChartClick,
  onHover,
  animationDuration = 1000,
  animationEasing = 'easeInOutQuart',
  customOptions = {},
}) => {
  const { actualTheme } = useTheme();
  const theme = getChartTheme(actualTheme === 'dark');

  // Determine actual chart type for Chart.js
  const getActualChartType = (): ChartType => {
    switch (type) {
      case 'area':
        return 'line';
      case 'horizontalBar':
        return 'bar';
      case 'stackedBar':
        return 'bar';
      default:
        return type;
    }
  };

  const actualChartType = getActualChartType();

  // Build chart options
  const baseOptions = getBaseChartOptions(
    { title, height, showLegend, showGrid, animate },
    theme,
    actualChartType
  );

  // Enhance options based on chart type
  const enhancedOptions = {
    ...baseOptions,
    indexAxis: (type === 'horizontalBar' || horizontal) ? 'y' as const : 'x' as const,
    animation: animate ? {
      duration: animationDuration,
      easing: animationEasing as any,
    } : false,
    onClick: onChartClick,
    onHover,
    scales: actualChartType === 'pie' || actualChartType === 'doughnut' ? undefined : {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales?.x,
        stacked: stacked,
      },
      y: {
        ...baseOptions.scales?.y,
        stacked: stacked,
      },
    },
    elements: {
      ...baseOptions.elements,
      line: actualChartType === 'line' ? {
        tension,
        borderWidth: 3,
      } : undefined,
      bar: actualChartType === 'bar' ? {
        borderRadius: 6,
        borderSkipped: false,
      } : undefined,
      arc: (actualChartType === 'pie' || actualChartType === 'doughnut') ? {
        borderWidth: 2,
        hoverBorderWidth: 4,
      } : undefined,
    },
    // Doughnut specific options
    cutout: (type === 'doughnut' && cutout !== undefined) ? cutout : undefined,
    ...customOptions,
  };

  // Enhance data with proper styling
  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const baseDataset = {
        ...dataset,
        fill: (type === 'area' || fill) ? 'origin' : false,
      };

      // Apply color enhancements
      if (colors) {
        return enhanceDatasetColors([baseDataset], colors)[0];
      } else {
        return enhanceDatasetColors([baseDataset])[0];
      }
    }),
  };

  // Render the appropriate chart component
  const renderChart = () => {
    const commonProps = {
      data: enhancedData,
      options: enhancedOptions,
    };

    switch (actualChartType) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'radar':
        return <Radar {...commonProps} />;
      case 'polarArea':
        return <PolarArea {...commonProps} />;
      case 'scatter':
        return <Scatter {...commonProps} />;
      case 'bubble':
        return <Bubble {...commonProps} />;
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? 'hidden' : 'visible'}
      animate="visible"
      className="w-full"
      style={{ height }}
    >
      {renderChart()}
    </motion.div>
  );
};

// Convenience wrapper components for common chart types
export const LineChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="line" {...props} />
);

export const BarChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="bar" {...props} />
);

export const PieChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="pie" {...props} />
);

export const AreaChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="area" fill={true} {...props} />
);

export const DoughnutChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="doughnut" cutout="60%" {...props} />
);

export const HorizontalBarChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="horizontalBar" {...props} />
);

export const StackedBarChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="stackedBar" stacked={true} {...props} />
);

export const RadarChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart type="radar" {...props} />
);

// Specialized chart components for specific use cases
export const RevenueChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>> = (props) => (
  <UniversalChart type="area" title="Revenue Overview" fill={true} {...props} />
);

export const SalesChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>> = (props) => (
  <UniversalChart type="line" title="Sales Performance" {...props} />
);

export const ProductDistributionChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>> = (props) => (
  <UniversalChart type="pie" title="Product Distribution" {...props} />
);

export const RegionalSalesChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>> = (props) => (
  <UniversalChart type="horizontalBar" title="Sales by Region" {...props} />
);

export const MonthlyComparisonChart: React.FC<Omit<UniversalChartProps, 'type' | 'title'>> = (props) => (
  <UniversalChart type="stackedBar" title="Monthly Comparison" stacked={true} {...props} />
);

export default UniversalChart;