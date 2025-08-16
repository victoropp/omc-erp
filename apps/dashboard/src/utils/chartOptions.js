"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceDatasetColors = exports.getBaseChartOptions = exports.formatTooltipValue = exports.formatAxisValue = exports.DEFAULT_COLORS = exports.getChartTheme = void 0;
const getChartTheme = (isDark) => ({
    isDark,
    colors: {
        text: isDark ? '#ffffff' : '#111827',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        grid: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
        background: isDark ? '#111827' : '#ffffff',
        tooltip: {
            background: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        },
    },
});
exports.getChartTheme = getChartTheme;
exports.DEFAULT_COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
];
const formatAxisValue = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
};
exports.formatAxisValue = formatAxisValue;
const formatTooltipValue = (value) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};
exports.formatTooltipValue = formatTooltipValue;
const getBaseChartOptions = (config, theme, chartType) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: config.animate ? {
        duration: 1000,
        easing: 'easeInOutQuart',
    } : false,
    plugins: {
        legend: {
            display: config.showLegend ?? true,
            position: 'top',
            labels: {
                color: theme.colors.text,
                font: {
                    size: 12,
                    family: "'Inter', sans-serif",
                },
                padding: 20,
                usePointStyle: true,
            },
        },
        title: {
            display: !!config.title,
            text: config.title,
            color: theme.colors.text,
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
            backgroundColor: theme.colors.tooltip.background,
            titleColor: theme.colors.text,
            bodyColor: theme.colors.subtext,
            borderColor: theme.colors.tooltip.border,
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
                        const value = chartType === 'bar' && context.chart.options.indexAxis === 'y'
                            ? context.parsed.x
                            : context.parsed.y;
                        label += (0, exports.formatTooltipValue)(value);
                    }
                    return label;
                },
            },
        },
    },
    scales: chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar' && chartType !== 'polarArea' ? {
        x: {
            display: true,
            grid: {
                display: config.showGrid ?? true,
                color: theme.colors.grid,
                drawBorder: false,
            },
            ticks: {
                color: theme.colors.subtext,
                font: {
                    size: 11,
                    family: "'Inter', sans-serif",
                },
                padding: 8,
                callback: chartType === 'bar' ? function (value) {
                    return (0, exports.formatAxisValue)(value);
                } : undefined,
            },
            border: {
                display: false,
            },
        },
        y: {
            display: true,
            grid: {
                display: config.showGrid ?? true,
                color: theme.colors.grid,
                drawBorder: false,
            },
            ticks: {
                color: theme.colors.subtext,
                font: {
                    size: 11,
                    family: "'Inter', sans-serif",
                },
                padding: 8,
                callback: chartType === 'line' || chartType === 'area' || chartType === 'bar' ? function (value) {
                    return (0, exports.formatAxisValue)(value);
                } : undefined,
            },
            border: {
                display: false,
            },
        },
    } : undefined,
});
exports.getBaseChartOptions = getBaseChartOptions;
const enhanceDatasetColors = (datasets, colors = exports.DEFAULT_COLORS) => {
    return datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: dataset.borderColor || colors[index % colors.length],
        backgroundColor: dataset.backgroundColor ||
            (dataset.fill ? `${colors[index % colors.length]}33` : `${colors[index % colors.length]}CC`),
        hoverBackgroundColor: dataset.hoverBackgroundColor || `${colors[index % colors.length]}E6`,
    }));
};
exports.enhanceDatasetColors = enhanceDatasetColors;
//# sourceMappingURL=chartOptions.js.map