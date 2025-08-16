"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarChart = BarChart;
exports.SalesBarChart = SalesBarChart;
exports.MonthlyRevenueChart = MonthlyRevenueChart;
exports.RegionalSalesChart = RegionalSalesChart;
exports.FuelTypeChart = FuelTypeChart;
const react_1 = __importDefault(require("react"));
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
function BarChart({ data, title, height = 400, showLegend = true, showGrid = true, horizontal = false, animate = true, stacked = false, }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        animation: animate ? {
            duration: 1000,
            easing: 'easeInOutQuart',
        } : {
            duration: 0,
        },
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
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
                    callback: horizontal ? function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        else if (value >= 1000) {
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
                    callback: !horizontal ? function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        else if (value >= 1000) {
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
            mode: 'index',
        },
    };
    // Enhanced data with theme-appropriate colors
    const enhancedData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || [
                'rgba(59, 130, 246, 0.8)', // Blue
                'rgba(239, 68, 68, 0.8)', // Red
                'rgba(16, 185, 129, 0.8)', // Green
                'rgba(245, 158, 11, 0.8)', // Amber
                'rgba(139, 92, 246, 0.8)', // Violet
                'rgba(236, 72, 153, 0.8)', // Pink
                'rgba(6, 182, 212, 0.8)', // Cyan
                'rgba(132, 204, 22, 0.8)', // Lime
            ][index % 8],
            borderColor: dataset.borderColor || [
                'rgba(59, 130, 246, 1)', // Blue
                'rgba(239, 68, 68, 1)', // Red
                'rgba(16, 185, 129, 1)', // Green
                'rgba(245, 158, 11, 1)', // Amber
                'rgba(139, 92, 246, 1)', // Violet
                'rgba(236, 72, 153, 1)', // Pink
                'rgba(6, 182, 212, 1)', // Cyan
                'rgba(132, 204, 22, 1)', // Lime
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
    return (<framer_motion_1.motion.div variants={containerVariants} initial={animate ? 'hidden' : 'visible'} animate="visible" className="w-full" style={{ height }}>
      <react_chartjs_2_1.Bar data={enhancedData} options={options}/>
    </framer_motion_1.motion.div>);
}
// Specialized bar chart components
function SalesBarChart({ data, ...props }) {
    return (<BarChart data={data} title="Sales by Category" {...props}/>);
}
function MonthlyRevenueChart({ data, ...props }) {
    return (<BarChart data={data} title="Monthly Revenue" stacked={true} {...props}/>);
}
function RegionalSalesChart({ data, ...props }) {
    return (<BarChart data={data} title="Sales by Region" horizontal={true} {...props}/>);
}
function FuelTypeChart({ data, ...props }) {
    return (<BarChart data={data} title="Fuel Sales by Type" {...props}/>);
}
//# sourceMappingURL=BarChart.js.map