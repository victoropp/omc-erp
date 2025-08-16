"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieChart = PieChart;
exports.DoughnutChart = DoughnutChart;
exports.FuelDistributionChart = FuelDistributionChart;
exports.PaymentMethodChart = PaymentMethodChart;
exports.RegionDistributionChart = RegionDistributionChart;
exports.CustomerTypeChart = CustomerTypeChart;
const react_1 = __importDefault(require("react"));
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
chart_js_1.Chart.register(chart_js_1.ArcElement, chart_js_1.Tooltip, chart_js_1.Legend);
function PieChart({ data, title, height = 400, showLegend = true, animate = true, variant = 'pie', cutout = variant === 'doughnut' ? '60%' : '0%', }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: animate ? {
            duration: 1000,
            easing: 'easeInOutQuart',
        } : {
            duration: 0,
        },
        plugins: {
            legend: {
                display: showLegend,
                position: 'right',
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
                    weight: 600,
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
                    weight: 600,
                    family: "'Inter', sans-serif",
                },
                bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif",
                },
                callbacks: {
                    label: function (context) {
                        const dataset = context.dataset;
                        const total = dataset.data.reduce((sum, value) => sum + value, 0);
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
    const ChartComponent = variant === 'doughnut' ? react_chartjs_2_1.Doughnut : react_chartjs_2_1.Pie;
    return (<framer_motion_1.motion.div variants={containerVariants} initial={animate ? 'hidden' : 'visible'} animate="visible" className="w-full" style={{ height }}>
      <ChartComponent data={enhancedData} options={options}/>
    </framer_motion_1.motion.div>);
}
// Doughnut chart component
function DoughnutChart(props) {
    return <PieChart {...props} variant="doughnut"/>;
}
// Specialized pie chart components
function FuelDistributionChart({ data, ...props }) {
    return (<PieChart data={data} title="Fuel Type Distribution" variant="doughnut" {...props}/>);
}
function PaymentMethodChart({ data, ...props }) {
    return (<PieChart data={data} title="Payment Methods" variant="doughnut" {...props}/>);
}
function RegionDistributionChart({ data, ...props }) {
    return (<PieChart data={data} title="Sales by Region" {...props}/>);
}
function CustomerTypeChart({ data, ...props }) {
    return (<PieChart data={data} title="Customer Types" variant="doughnut" cutout="50%" {...props}/>);
}
//# sourceMappingURL=PieChart.js.map