import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

export function BarChart({
  data,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
  horizontal = false,
  animate = true,
  stacked = false,
}: BarChartProps) {
  const { actualTheme } = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    animation: animate ? {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    } : false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: actualTheme === 'dark' ? '#ffffff' : '#374151',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: actualTheme === 'dark' ? '#ffffff' : '#111827',
        font: {
          size: 16,
          weight: '600' as const,
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: actualTheme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: actualTheme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: actualTheme === 'dark' ? '#d1d5db' : '#6b7280',
        borderColor: actualTheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600' as const,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(horizontal ? context.parsed.x : context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        stacked,
        grid: {
          display: showGrid,
          color: actualTheme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
          drawBorder: false,
        },
        ticks: {
          color: actualTheme === 'dark' ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          padding: 8,
          callback: horizontal ? function(value: any) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toString();
          } : undefined,
        },
        border: {
          display: false,
        },
      },
      y: {
        display: true,
        stacked,
        grid: {
          display: showGrid,
          color: actualTheme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
          drawBorder: false,
        },
        ticks: {
          color: actualTheme === 'dark' ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          padding: 8,
          callback: !horizontal ? function(value: any) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toString();
          } : undefined,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Enhanced data with theme-appropriate colors
  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(139, 92, 246, 0.8)',   // Violet
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(6, 182, 212, 0.8)',    // Cyan
        'rgba(132, 204, 22, 0.8)',   // Lime
      ][index % 8],
      borderColor: dataset.borderColor || [
        'rgba(59, 130, 246, 1)',     // Blue
        'rgba(239, 68, 68, 1)',      // Red
        'rgba(16, 185, 129, 1)',     // Green
        'rgba(245, 158, 11, 1)',     // Amber
        'rgba(139, 92, 246, 1)',     // Violet
        'rgba(236, 72, 153, 1)',     // Pink
        'rgba(6, 182, 212, 1)',      // Cyan
        'rgba(132, 204, 22, 1)',     // Lime
      ][index % 8],
      borderWidth: 2,
      hoverBackgroundColor: dataset.backgroundColor || [
        'rgba(59, 130, 246, 0.9)',
        'rgba(239, 68, 68, 0.9)',
        'rgba(16, 185, 129, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(139, 92, 246, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(6, 182, 212, 0.9)',
        'rgba(132, 204, 22, 0.9)',
      ][index % 8],
    })),
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
      <Bar data={enhancedData} options={options} />
    </motion.div>
  );
}

// Specialized bar chart components
export function SalesBarChart({ data, ...props }: Omit<BarChartProps, 'title'>) {
  return (
    <BarChart
      data={data}
      title="Sales by Category"
      {...props}
    />
  );
}

export function MonthlyRevenueChart({ data, ...props }: Omit<BarChartProps, 'title'>) {
  return (
    <BarChart
      data={data}
      title="Monthly Revenue"
      stacked={true}
      {...props}
    />
  );
}

export function RegionalSalesChart({ data, ...props }: Omit<BarChartProps, 'title'>) {
  return (
    <BarChart
      data={data}
      title="Sales by Region"
      horizontal={true}
      {...props}
    />
  );
}

export function FuelTypeChart({ data, ...props }: Omit<BarChartProps, 'title'>) {
  return (
    <BarChart
      data={data}
      title="Fuel Sales by Type"
      {...props}
    />
  );
}