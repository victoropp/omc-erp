import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartData } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  showLegend?: boolean;
  animate?: boolean;
  variant?: 'pie' | 'doughnut';
  cutout?: string;
}

export function PieChart({
  data,
  title,
  height = 400,
  showLegend = true,
  animate = true,
  variant = 'pie',
  cutout = variant === 'doughnut' ? '60%' : '0%',
}: PieChartProps) {
  const { actualTheme } = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    } : false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          color: actualTheme === 'dark' ? '#ffffff' : '#374151',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
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
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const currentValue = dataset.data[context.dataIndex];
            const percentage = ((currentValue / total) * 100).toFixed(1);
            
            return `${context.label}: ${new Intl.NumberFormat('en-US').format(currentValue)} (${percentage}%)`;
          },
        },
      },
    },
    cutout,
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
      },
    },
  };

  // Enhanced data with beautiful colors
  const colorPalette = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#f43f5e', // Rose
  ];

  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || colorPalette.slice(0, data.labels?.length || 0),
      borderColor: dataset.borderColor || colorPalette.slice(0, data.labels?.length || 0),
      hoverBorderWidth: 4,
      hoverOffset: 8,
    })),
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const ChartComponent = variant === 'doughnut' ? Doughnut : Pie;

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? 'hidden' : 'visible'}
      animate="visible"
      className="w-full"
      style={{ height }}
    >
      <ChartComponent data={enhancedData} options={options} />
    </motion.div>
  );
}

// Doughnut chart component
export function DoughnutChart(props: Omit<PieChartProps, 'variant'>) {
  return <PieChart {...props} variant="doughnut" />;
}

// Specialized pie chart components
export function FuelDistributionChart({ data, ...props }: Omit<PieChartProps, 'title'>) {
  return (
    <PieChart
      data={data}
      title="Fuel Type Distribution"
      variant="doughnut"
      {...props}
    />
  );
}

export function PaymentMethodChart({ data, ...props }: Omit<PieChartProps, 'title'>) {
  return (
    <PieChart
      data={data}
      title="Payment Methods"
      variant="doughnut"
      {...props}
    />
  );
}

export function RegionDistributionChart({ data, ...props }: Omit<PieChartProps, 'title'>) {
  return (
    <PieChart
      data={data}
      title="Sales by Region"
      {...props}
    />
  );
}

export function CustomerTypeChart({ data, ...props }: Omit<PieChartProps, 'title'>) {
  return (
    <PieChart
      data={data}
      title="Customer Types"
      variant="doughnut"
      cutout="50%"
      {...props}
    />
  );
}