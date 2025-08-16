"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyComparisonChart = exports.RegionalSalesChart = exports.ProductDistributionChart = exports.SalesChart = exports.RevenueChart = exports.RadarChart = exports.StackedBarChart = exports.HorizontalBarChart = exports.DoughnutChart = exports.AreaChart = exports.PieChart = exports.BarChart = exports.LineChart = exports.UniversalChart = void 0;
const react_1 = __importDefault(require("react"));
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const chartOptions_1 = require("@/utils/chartOptions");
// Register all Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.RadialLinearScale, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
const UniversalChart = ({ type, data, title, height = 400, showLegend = true, showGrid = true, animate = true, fill = false, tension = 0.4, horizontal = false, stacked = false, cutout, colors, gradients = false, onChartClick, onHover, animationDuration = 1000, animationEasing = 'easeInOutQuart', customOptions = {}, }) => {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const theme = (0, chartOptions_1.getChartTheme)(actualTheme === 'dark');
    // Determine actual chart type for Chart.js
    const getActualChartType = () => {
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
    const baseOptions = (0, chartOptions_1.getBaseChartOptions)({ title, height, showLegend, showGrid, animate }, theme, actualChartType);
    // Enhance options based on chart type
    const enhancedOptions = {
        ...baseOptions,
        indexAxis: (type === 'horizontalBar' || horizontal) ? 'y' : 'x',
        animation: animate ? {
            duration: animationDuration,
            easing: animationEasing,
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
                return (0, chartOptions_1.enhanceDatasetColors)([baseDataset], colors)[0];
            }
            else {
                return (0, chartOptions_1.enhanceDatasetColors)([baseDataset])[0];
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
                return <react_chartjs_2_1.Line {...commonProps}/>;
            case 'bar':
                return <react_chartjs_2_1.Bar {...commonProps}/>;
            case 'pie':
                return <react_chartjs_2_1.Pie {...commonProps}/>;
            case 'doughnut':
                return <react_chartjs_2_1.Doughnut {...commonProps}/>;
            case 'radar':
                return <react_chartjs_2_1.Radar {...commonProps}/>;
            case 'polarArea':
                return <react_chartjs_2_1.PolarArea {...commonProps}/>;
            case 'scatter':
                return <react_chartjs_2_1.Scatter {...commonProps}/>;
            case 'bubble':
                return <react_chartjs_2_1.Bubble {...commonProps}/>;
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
    return (<framer_motion_1.motion.div variants={containerVariants} initial={animate ? 'hidden' : 'visible'} animate="visible" className="w-full" style={{ height }}>
      {renderChart()}
    </framer_motion_1.motion.div>);
};
exports.UniversalChart = UniversalChart;
// Convenience wrapper components for common chart types
const LineChart = (props) => (<exports.UniversalChart type="line" {...props}/>);
exports.LineChart = LineChart;
const BarChart = (props) => (<exports.UniversalChart type="bar" {...props}/>);
exports.BarChart = BarChart;
const PieChart = (props) => (<exports.UniversalChart type="pie" {...props}/>);
exports.PieChart = PieChart;
const AreaChart = (props) => (<exports.UniversalChart type="area" fill={true} {...props}/>);
exports.AreaChart = AreaChart;
const DoughnutChart = (props) => (<exports.UniversalChart type="doughnut" cutout="60%" {...props}/>);
exports.DoughnutChart = DoughnutChart;
const HorizontalBarChart = (props) => (<exports.UniversalChart type="horizontalBar" {...props}/>);
exports.HorizontalBarChart = HorizontalBarChart;
const StackedBarChart = (props) => (<exports.UniversalChart type="stackedBar" stacked={true} {...props}/>);
exports.StackedBarChart = StackedBarChart;
const RadarChart = (props) => (<exports.UniversalChart type="radar" {...props}/>);
exports.RadarChart = RadarChart;
// Specialized chart components for specific use cases
const RevenueChart = (props) => (<exports.UniversalChart type="area" title="Revenue Overview" fill={true} {...props}/>);
exports.RevenueChart = RevenueChart;
const SalesChart = (props) => (<exports.UniversalChart type="line" title="Sales Performance" {...props}/>);
exports.SalesChart = SalesChart;
const ProductDistributionChart = (props) => (<exports.UniversalChart type="pie" title="Product Distribution" {...props}/>);
exports.ProductDistributionChart = ProductDistributionChart;
const RegionalSalesChart = (props) => (<exports.UniversalChart type="horizontalBar" title="Sales by Region" {...props}/>);
exports.RegionalSalesChart = RegionalSalesChart;
const MonthlyComparisonChart = (props) => (<exports.UniversalChart type="stackedBar" title="Monthly Comparison" stacked={true} {...props}/>);
exports.MonthlyComparisonChart = MonthlyComparisonChart;
exports.default = exports.UniversalChart;
//# sourceMappingURL=UniversalChart.js.map