"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineChart = LineChart;
exports.RevenueChart = RevenueChart;
exports.SalesChart = SalesChart;
exports.TrafficChart = TrafficChart;
const react_1 = __importDefault(require("react"));
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
function LineChart({ data, title, height = 400, showLegend = true, showGrid = true, fill = false, tension = 0.4, animate = true, }) {
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
                            // Format numbers with commas and appropriate precision
                            label += new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            }).format(context.parsed.y);
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
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
                },
                border: {
                    display: false,
                },
            },
            y: {
                display: true,
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
                    callback: function (value) {
                        // Format y-axis labels with appropriate units
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value.toString();
                    },
                },
                border: {
                    display: false,
                },
            },
        },
        elements: {
            line: {
                tension,
                borderWidth: 3,
            },
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };
    // Enhance data with theme-appropriate colors and fill options
    const enhancedData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            fill: fill ? 'origin' : false,
            backgroundColor: fill
                ? dataset.backgroundColor || `rgba(59, 130, 246, 0.1)`
                : dataset.backgroundColor,
            borderColor: dataset.borderColor || [
                '#3b82f6', // Blue
                '#ef4444', // Red
                '#10b981', // Green
                '#f59e0b', // Amber
                '#8b5cf6', // Violet
                '#ec4899', // Pink
                '#06b6d4', // Cyan
                '#84cc16', // Lime
            ][index % 8],
            pointBackgroundColor: dataset.borderColor || '#ffffff',
            pointBorderColor: dataset.borderColor || [
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
            ][index % 8],
            pointHoverBackgroundColor: dataset.borderColor || [
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
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
      <react_chartjs_2_1.Line data={enhancedData} options={options}/>
    </framer_motion_1.motion.div>);
}
// Specialized line chart components
function RevenueChart({ data, ...props }) {
    return (<LineChart data={data} title="Revenue Overview" fill={true} tension={0.4} {...props}/>);
}
function SalesChart({ data, ...props }) {
    return (<LineChart data={data} title="Sales Performance" tension={0.3} {...props}/>);
}
function TrafficChart({ data, ...props }) {
    return (<LineChart data={data} title="Website Traffic" fill={true} showGrid={false} {...props}/>);
}
//# sourceMappingURL=LineChart.js.map