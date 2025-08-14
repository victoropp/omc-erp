// Consolidated Universal Chart Components
export {
  UniversalChart,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  DoughnutChart,
  HorizontalBarChart,
  StackedBarChart,
  RadarChart,
  RevenueChart,
  SalesChart,
  ProductDistributionChart,
  RegionalSalesChart,
  MonthlyComparisonChart,
} from './UniversalChart';

// Real-time Charts
export { RealTimeChart } from './RealTimeChart';

// Legacy exports for backward compatibility - DEPRECATED
// TODO: Remove these after updating all usage to UniversalChart
export { TrafficChart } from './LineChart';
export { SalesBarChart, MonthlyRevenueChart, FuelTypeChart } from './BarChart';
export { FuelDistributionChart, PaymentMethodChart, RegionDistributionChart, CustomerTypeChart } from './PieChart';
export { RealTimeRevenueChart, RealTimeSalesChart, RealTimeTransactionChart } from './RealTimeChart';
