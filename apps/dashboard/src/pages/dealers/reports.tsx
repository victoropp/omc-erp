import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { crmService, pricingService, financialService, operationsService } from '@/services/api';
import { toast } from 'react-hot-toast';

// Interfaces for report data structures
interface DealerReport {
  dealerId: string;
  dealerName: string;
  region: string;
  reportType: 'PERFORMANCE' | 'SETTLEMENT' | 'COMPLIANCE' | 'LOAN_PORTFOLIO' | 'SALES_REVENUE';
  period: string;
  generatedDate: string;
  status: 'READY' | 'GENERATING' | 'SCHEDULED' | 'ERROR';
  data: any;
}

interface PerformanceReport {
  dealerId: string;
  dealerName: string;
  totalRevenue: number;
  totalVolume: number;
  salesGrowth: number;
  marginCompliance: number;
  customerSatisfaction: number;
  marketShare: number;
  profitability: number;
  kpiScores: {
    sales: number;
    operations: number;
    finance: number;
    customer: number;
  };
  trendData: {
    revenue: number[];
    volume: number[];
    margin: number[];
  };
  benchmarks: {
    industryAverage: number;
    topPerformer: number;
    regionalAverage: number;
  };
}

interface SettlementReport {
  dealerId: string;
  dealerName: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  settlementBreakdown: {
    productSales: number;
    incentives: number;
    deductions: number;
    penalties: number;
    adjustments: number;
  };
  paymentHistory: {
    date: string;
    amount: number;
    method: string;
    status: string;
  }[];
  agingAnalysis: {
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  };
}

interface ComplianceReport {
  dealerId: string;
  dealerName: string;
  overallScore: number;
  marginCompliance: number;
  priceCompliance: number;
  qualityCompliance: number;
  environmentalCompliance: number;
  safetyCompliance: number;
  violations: {
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    date: string;
    status: 'OPEN' | 'RESOLVED' | 'PENDING';
    penalty?: number;
  }[];
  certifications: {
    name: string;
    status: 'VALID' | 'EXPIRED' | 'EXPIRING';
    expiryDate: string;
  }[];
  auditHistory: {
    date: string;
    type: string;
    score: number;
    findings: number;
  }[];
}

interface LoanPortfolioReport {
  dealerId: string;
  dealerName: string;
  totalLoanAmount: number;
  outstandingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  creditScore: number;
  paymentHistory: {
    date: string;
    amount: number;
    principal: number;
    interest: number;
    balance: number;
    status: 'ON_TIME' | 'LATE' | 'MISSED';
  }[];
  riskAssessment: {
    score: number;
    category: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: string[];
  };
  collateral: {
    type: string;
    value: number;
    condition: string;
  }[];
}

interface CustomReportBuilder {
  name: string;
  description: string;
  dataSource: string[];
  metrics: string[];
  filters: {
    dateRange: { start: string; end: string };
    dealers: string[];
    regions: string[];
    products: string[];
  };
  visualizations: {
    type: 'chart' | 'table' | 'metric';
    config: any;
  }[];
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    recipients: string[];
    format: 'PDF' | 'EXCEL' | 'CSV';
  };
}

const DealerReports = () => {
  const [reports, setReports] = useState<DealerReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DealerReport | null>(null);
  const [reportType, setReportType] = useState<string>('ALL');
  const [selectedDealer, setSelectedDealer] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [customReportBuilder, setCustomReportBuilder] = useState<Partial<CustomReportBuilder>>({});
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);

  // Sample data - would come from API
  const performanceData: PerformanceReport[] = [
    {
      dealerId: 'DLR-001',
      dealerName: 'Golden Star Petroleum',
      totalRevenue: 2500000,
      totalVolume: 450000,
      salesGrowth: 12.5,
      marginCompliance: 98.2,
      customerSatisfaction: 4.7,
      marketShare: 18.5,
      profitability: 16.8,
      kpiScores: { sales: 92, operations: 88, finance: 95, customer: 90 },
      trendData: {
        revenue: [2100000, 2200000, 2300000, 2400000, 2500000, 2600000],
        volume: [380000, 400000, 420000, 435000, 450000, 465000],
        margin: [15.2, 15.8, 16.1, 16.5, 16.8, 17.2]
      },
      benchmarks: { industryAverage: 14.5, topPerformer: 19.2, regionalAverage: 16.1 }
    },
    {
      dealerId: 'DLR-002',
      dealerName: 'Allied Oil Company',
      totalRevenue: 1800000,
      totalVolume: 320000,
      salesGrowth: 8.3,
      marginCompliance: 94.5,
      customerSatisfaction: 4.3,
      marketShare: 14.2,
      profitability: 14.2,
      kpiScores: { sales: 85, operations: 82, finance: 88, customer: 86 },
      trendData: {
        revenue: [1650000, 1700000, 1750000, 1775000, 1800000, 1820000],
        volume: [290000, 300000, 310000, 315000, 320000, 325000],
        margin: [13.8, 14.0, 14.1, 14.2, 14.2, 14.3]
      },
      benchmarks: { industryAverage: 14.5, topPerformer: 19.2, regionalAverage: 16.1 }
    }
  ];

  const settlementData: SettlementReport[] = [
    {
      dealerId: 'DLR-001',
      dealerName: 'Golden Star Petroleum',
      totalAmount: 2500000,
      paidAmount: 2350000,
      outstandingAmount: 150000,
      overdueAmount: 25000,
      settlementBreakdown: {
        productSales: 2200000,
        incentives: 180000,
        deductions: -50000,
        penalties: -15000,
        adjustments: 10000
      },
      paymentHistory: [
        { date: '2024-01-15', amount: 500000, method: 'Bank Transfer', status: 'Completed' },
        { date: '2024-01-01', amount: 650000, method: 'Check', status: 'Completed' },
        { date: '2023-12-15', amount: 420000, method: 'Bank Transfer', status: 'Completed' }
      ],
      agingAnalysis: { current: 125000, days30: 15000, days60: 8000, days90Plus: 2000 }
    }
  ];

  const complianceData: ComplianceReport[] = [
    {
      dealerId: 'DLR-001',
      dealerName: 'Golden Star Petroleum',
      overallScore: 94.5,
      marginCompliance: 98.2,
      priceCompliance: 96.8,
      qualityCompliance: 92.3,
      environmentalCompliance: 89.7,
      safetyCompliance: 95.1,
      violations: [
        {
          type: 'Price Variance',
          description: 'Exceeded maximum retail price by 0.02 GHS',
          severity: 'LOW',
          date: '2024-01-10',
          status: 'RESOLVED',
          penalty: 500
        }
      ],
      certifications: [
        { name: 'ISO 9001:2015', status: 'VALID', expiryDate: '2024-12-31' },
        { name: 'HSE Certificate', status: 'EXPIRING', expiryDate: '2024-03-15' }
      ],
      auditHistory: [
        { date: '2024-01-01', type: 'Internal', score: 94, findings: 2 },
        { date: '2023-10-15', type: 'External', score: 92, findings: 4 }
      ]
    }
  ];

  useEffect(() => {
    loadReportsData();
    loadScheduledReports();
  }, [reportType, selectedDealer, selectedRegion, dateRange]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      // Mock API call - would integrate with actual services
      const mockReports: DealerReport[] = [
        {
          dealerId: 'DLR-001',
          dealerName: 'Golden Star Petroleum',
          region: 'Greater Accra',
          reportType: 'PERFORMANCE',
          period: `${dateRange.start} to ${dateRange.end}`,
          generatedDate: new Date().toISOString(),
          status: 'READY',
          data: performanceData[0]
        },
        {
          dealerId: 'DLR-001',
          dealerName: 'Golden Star Petroleum',
          region: 'Greater Accra',
          reportType: 'SETTLEMENT',
          period: `${dateRange.start} to ${dateRange.end}`,
          generatedDate: new Date().toISOString(),
          status: 'READY',
          data: settlementData[0]
        },
        {
          dealerId: 'DLR-001',
          dealerName: 'Golden Star Petroleum',
          region: 'Greater Accra',
          reportType: 'COMPLIANCE',
          period: `${dateRange.start} to ${dateRange.end}`,
          generatedDate: new Date().toISOString(),
          status: 'READY',
          data: complianceData[0]
        }
      ];

      setReports(mockReports);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports data');
      setLoading(false);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const mockScheduled = [
        {
          id: 'SCH-001',
          name: 'Monthly Performance Report',
          type: 'PERFORMANCE',
          frequency: 'MONTHLY',
          nextRun: '2024-02-01',
          recipients: ['manager@company.com', 'finance@company.com'],
          status: 'ACTIVE'
        },
        {
          id: 'SCH-002',
          name: 'Weekly Settlement Summary',
          type: 'SETTLEMENT',
          frequency: 'WEEKLY',
          nextRun: '2024-01-22',
          recipients: ['accounting@company.com'],
          status: 'ACTIVE'
        }
      ];
      setScheduledReports(mockScheduled);
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
    }
  };

  const generateReport = async (type: string, dealerId?: string) => {
    try {
      toast.loading('Generating report...');
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success('Report generated successfully!');
      loadReportsData();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate report');
    }
  };

  const exportReport = async (report: DealerReport, format: 'PDF' | 'EXCEL' | 'CSV') => {
    try {
      toast.loading(`Exporting as ${format}...`);
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock download
      const fileName = `${report.dealerName}_${report.reportType}_${report.period}.${format.toLowerCase()}`;
      const blob = new Blob(['Mock report data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success(`Report exported as ${format}`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export report');
    }
  };

  const scheduleReport = async (config: any) => {
    try {
      toast.loading('Scheduling report...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScheduledReports(prev => [...prev, { ...config, id: `SCH-${Date.now()}`, status: 'ACTIVE' }]);
      toast.dismiss();
      toast.success('Report scheduled successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to schedule report');
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = reportType === 'ALL' || report.reportType === reportType;
      const matchesDealer = selectedDealer === 'ALL' || report.dealerId === selectedDealer;
      const matchesRegion = selectedRegion === 'ALL' || report.region === selectedRegion;
      return matchesType && matchesDealer && matchesRegion;
    });
  }, [reports, reportType, selectedDealer, selectedRegion]);

  // Chart data for overview
  const performanceMetricsData = {
    labels: performanceData.map(d => d.dealerName.substring(0, 12) + '...'),
    datasets: [
      {
        label: 'Profitability %',
        data: performanceData.map(d => d.profitability),
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderWidth: 1
      },
      {
        label: 'Market Share %',
        data: performanceData.map(d => d.marketShare),
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        borderWidth: 1
      }
    ]
  };

  const revenueComparisonData = {
    labels: performanceData.map(d => d.dealerName),
    datasets: [{
      label: 'Revenue (₵)',
      data: performanceData.map(d => d.totalRevenue),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const complianceScoreData = {
    labels: ['Margin', 'Price', 'Quality', 'Environmental', 'Safety'],
    datasets: [{
      label: 'Compliance Score',
      data: complianceData.length > 0 ? [
        complianceData[0].marginCompliance,
        complianceData[0].priceCompliance,
        complianceData[0].qualityCompliance,
        complianceData[0].environmentalCompliance,
        complianceData[0].safetyCompliance
      ] : [0, 0, 0, 0, 0],
      backgroundColor: '#10B981',
      borderColor: '#10B981',
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Dealer Reports" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Comprehensive Dealer Reports" 
      subtitle="Advanced reporting and analytics for dealer performance optimization"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Report Types' },
                  { value: 'PERFORMANCE', label: 'Performance Reports' },
                  { value: 'SETTLEMENT', label: 'Settlement Reports' },
                  { value: 'COMPLIANCE', label: 'Compliance Reports' },
                  { value: 'LOAN_PORTFOLIO', label: 'Loan Portfolio' },
                  { value: 'SALES_REVENUE', label: 'Sales & Revenue' }
                ]}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
              
              <Select
                value={selectedDealer}
                onChange={(e) => setSelectedDealer(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Dealers' },
                  { value: 'DLR-001', label: 'Golden Star Petroleum' },
                  { value: 'DLR-002', label: 'Allied Oil Company' },
                  { value: 'DLR-003', label: 'Star Oil Ltd' }
                ]}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
              
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Regions' },
                  { value: 'Greater Accra', label: 'Greater Accra' },
                  { value: 'Ashanti', label: 'Ashanti' },
                  { value: 'Western', label: 'Western' },
                  { value: 'Northern', label: 'Northern' }
                ]}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
              
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
              
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={() => generateReport('PERFORMANCE')} className="bg-gradient-to-r from-blue-600 to-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </Button>
              <Button variant="outline" onClick={() => setShowCustomBuilder(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                </svg>
                Custom Report Builder
              </Button>
              <Button variant="outline" onClick={loadReportsData}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-100">{filteredReports.length}</p>
                  <p className="text-xs text-blue-300">Ready for export</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-200">Performance Score</p>
                  <p className="text-3xl font-bold text-green-100">
                    {performanceData.length > 0 ? 
                      (performanceData.reduce((sum, d) => sum + d.profitability, 0) / performanceData.length).toFixed(1) 
                      : '0'}%
                  </p>
                  <p className="text-xs text-green-300">Average profitability</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">Compliance Rate</p>
                  <p className="text-3xl font-bold text-purple-100">
                    {complianceData.length > 0 ? complianceData[0].overallScore.toFixed(1) : '0'}%
                  </p>
                  <p className="text-xs text-purple-300">Overall compliance</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-200">Scheduled Reports</p>
                  <p className="text-3xl font-bold text-orange-100">{scheduledReports.length}</p>
                  <p className="text-xs text-orange-300">Active schedules</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              {[
                { id: 'overview', label: 'Overview Analytics', icon: '📊' },
                { id: 'performance', label: 'Performance Reports', icon: '📈' },
                { id: 'settlement', label: 'Settlement Reports', icon: '💰' },
                { id: 'compliance', label: 'Compliance Reports', icon: '✅' },
                { id: 'schedule', label: 'Scheduled Reports', icon: '⏰' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Performance Metrics Comparison</h4>
                      <BarChart data={performanceMetricsData} height={300} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Revenue Distribution</h4>
                      <PieChart data={revenueComparisonData} height={300} />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Recent Report Activity</h4>
                    <div className="space-y-3">
                      {filteredReports.slice(0, 5).map((report, index) => (
                        <motion.div
                          key={report.dealerId + report.reportType}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{report.dealerName}</p>
                              <p className="text-sm text-gray-600">{report.reportType.replace('_', ' ')} Report</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={report.status === 'READY' ? 'success' : 'warning'}>
                              {report.status}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => exportReport(report, 'PDF')}>
                                PDF
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => exportReport(report, 'EXCEL')}>
                                Excel
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {performanceData.map((dealer, index) => (
                      <motion.div
                        key={dealer.dealerId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold">{dealer.dealerName}</h5>
                          <Badge variant="success">
                            {dealer.profitability.toFixed(1)}% Profit
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Revenue:</span>
                            <span className="font-medium">₵{dealer.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Volume:</span>
                            <span className="font-medium">{dealer.totalVolume.toLocaleString()}L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Growth:</span>
                            <span className={`font-medium ${dealer.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {dealer.salesGrowth > 0 ? '+' : ''}{dealer.salesGrowth}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Market Share:</span>
                            <span className="font-medium">{dealer.marketShare.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-gray-600 mb-2">KPI Scores</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Sales</p>
                              <p className="font-bold text-blue-600">{dealer.kpiScores.sales}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Operations</p>
                              <p className="font-bold text-green-600">{dealer.kpiScores.operations}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Finance</p>
                              <p className="font-bold text-purple-600">{dealer.kpiScores.finance}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Customer</p>
                              <p className="font-bold text-orange-600">{dealer.kpiScores.customer}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => generateReport('PERFORMANCE', dealer.dealerId)}
                          >
                            Generate Report
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReport(reports.find(r => r.dealerId === dealer.dealerId && r.reportType === 'PERFORMANCE') || null)}
                          >
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settlement' && (
                <motion.div
                  key="settlement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {settlementData.map((settlement, index) => (
                    <motion.div
                      key={settlement.dealerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="text-xl font-semibold">{settlement.dealerName} - Settlement Report</h5>
                        <div className="flex space-x-2">
                          <Badge variant={settlement.overdueAmount > 0 ? 'warning' : 'success'}>
                            {settlement.overdueAmount > 0 ? 'Has Overdue' : 'Current'}
                          </Badge>
                          <Button size="sm" onClick={() => exportReport(reports.find(r => r.dealerId === settlement.dealerId && r.reportType === 'SETTLEMENT')!, 'PDF')}>
                            Export PDF
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-blue-600">₵{settlement.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">₵{settlement.paidAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600">Outstanding</p>
                          <p className="text-2xl font-bold text-orange-600">₵{settlement.outstandingAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600">Overdue</p>
                          <p className="text-2xl font-bold text-red-600">₵{settlement.overdueAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-semibold mb-3">Settlement Breakdown</h6>
                          <div className="space-y-2">
                            {Object.entries(settlement.settlementBreakdown).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                                <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className={`font-medium ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ₵{Math.abs(value).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold mb-3">Aging Analysis</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                              <span className="text-sm">Current (0-30 days)</span>
                              <span className="font-medium text-green-600">₵{settlement.agingAnalysis.current.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                              <span className="text-sm">31-60 days</span>
                              <span className="font-medium text-yellow-600">₵{settlement.agingAnalysis.days30.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                              <span className="text-sm">61-90 days</span>
                              <span className="font-medium text-orange-600">₵{settlement.agingAnalysis.days60.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                              <span className="text-sm">90+ days</span>
                              <span className="font-medium text-red-600">₵{settlement.agingAnalysis.days90Plus.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h6 className="font-semibold mb-3">Recent Payment History</h6>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Date</th>
                                <th className="text-left py-2">Amount</th>
                                <th className="text-left py-2">Method</th>
                                <th className="text-left py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {settlement.paymentHistory.map((payment, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-2">{new Date(payment.date).toLocaleDateString()}</td>
                                  <td className="py-2 font-medium">₵{payment.amount.toLocaleString()}</td>
                                  <td className="py-2">{payment.method}</td>
                                  <td className="py-2">
                                    <Badge variant="success">{payment.status}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'compliance' && (
                <motion.div
                  key="compliance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {complianceData.map((compliance, index) => (
                    <motion.div
                      key={compliance.dealerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="text-xl font-semibold">{compliance.dealerName} - Compliance Report</h5>
                        <div className="flex items-center space-x-3">
                          <Badge variant={compliance.overallScore >= 90 ? 'success' : compliance.overallScore >= 80 ? 'warning' : 'danger'}>
                            Overall Score: {compliance.overallScore.toFixed(1)}%
                          </Badge>
                          <Button size="sm" onClick={() => exportReport(reports.find(r => r.dealerId === compliance.dealerId && r.reportType === 'COMPLIANCE')!, 'PDF')}>
                            Export Report
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-semibold mb-4">Compliance Scores</h6>
                          <div className="h-64">
                            <div className="space-y-3">
                              {[
                                { label: 'Margin Compliance', value: compliance.marginCompliance, color: 'bg-blue-500' },
                                { label: 'Price Compliance', value: compliance.priceCompliance, color: 'bg-green-500' },
                                { label: 'Quality Compliance', value: compliance.qualityCompliance, color: 'bg-purple-500' },
                                { label: 'Environmental', value: compliance.environmentalCompliance, color: 'bg-yellow-500' },
                                { label: 'Safety Compliance', value: compliance.safetyCompliance, color: 'bg-red-500' }
                              ].map((item) => (
                                <div key={item.label}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <span className="text-sm">{item.value.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${item.color}`}
                                      style={{ width: `${item.value}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold mb-4">Violations & Issues</h6>
                          <div className="space-y-3">
                            {compliance.violations.length > 0 ? compliance.violations.map((violation, idx) => (
                              <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{violation.type}</span>
                                  <Badge variant={
                                    violation.severity === 'CRITICAL' ? 'danger' :
                                    violation.severity === 'HIGH' ? 'warning' : 'outline'
                                  }>
                                    {violation.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{violation.description}</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">{new Date(violation.date).toLocaleDateString()}</span>
                                  <Badge variant={violation.status === 'RESOLVED' ? 'success' : 'warning'}>
                                    {violation.status}
                                  </Badge>
                                </div>
                                {violation.penalty && (
                                  <p className="text-xs text-red-600 mt-1">Penalty: ₵{violation.penalty}</p>
                                )}
                              </div>
                            )) : (
                              <p className="text-sm text-green-600">No violations found</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-semibold mb-3">Certifications</h6>
                          <div className="space-y-2">
                            {compliance.certifications.map((cert, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <span className="text-sm">{cert.name}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={
                                    cert.status === 'VALID' ? 'success' :
                                    cert.status === 'EXPIRING' ? 'warning' : 'danger'
                                  }>
                                    {cert.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{new Date(cert.expiryDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold mb-3">Audit History</h6>
                          <div className="space-y-2">
                            {compliance.auditHistory.map((audit, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <div>
                                  <span className="text-sm font-medium">{audit.type} Audit</span>
                                  <p className="text-xs text-gray-600">{new Date(audit.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{audit.score}%</p>
                                  <p className="text-xs text-gray-600">{audit.findings} findings</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Scheduled Reports</h4>
                    <Button onClick={() => {
                      const config = {
                        name: 'Custom Scheduled Report',
                        type: 'PERFORMANCE',
                        frequency: 'MONTHLY',
                        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        recipients: ['manager@company.com'],
                      };
                      scheduleReport(config);
                    }}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Schedule New Report
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {scheduledReports.map((scheduled, index) => (
                      <motion.div
                        key={scheduled.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold">{scheduled.name}</h5>
                          <Badge variant={scheduled.status === 'ACTIVE' ? 'success' : 'warning'}>
                            {scheduled.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Report Type:</span>
                            <span className="font-medium">{scheduled.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Frequency:</span>
                            <span className="font-medium">{scheduled.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Next Run:</span>
                            <span className="font-medium">{new Date(scheduled.nextRun).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Recipients:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {scheduled.recipients.map((email: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {email}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit Schedule
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Run Now
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="flex flex-col items-center p-6 h-auto bg-gradient-to-r from-blue-600 to-blue-700"
                onClick={() => generateReport('PERFORMANCE')}
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Bulk Export</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto"
                onClick={() => setShowCustomBuilder(true)}
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                </svg>
                <span>Custom Builder</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Schedule Reports</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13.5 6H4a2 2 0 00-2 2v8a2 2 0 002 2h5.5m0 0L13 14h-1.5v4.5z" />
                </svg>
                <span>Email Reports</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DealerReports;