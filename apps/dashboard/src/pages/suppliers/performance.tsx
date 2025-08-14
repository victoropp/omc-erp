import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart, RadarChart } from '@/components/charts';
import Link from 'next/link';

const SupplierPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Performance metrics
  const performanceMetrics = {
    averageRating: 4.3,
    topPerformer: 'Ghana National Petroleum Corporation',
    worstPerformer: 'Delta Logistics Services',
    onTimeDelivery: 94.2,
    qualityCompliance: 96.8,
    costEffectiveness: 89.5,
    responsiveness: 92.1,
    totalAssessments: 287,
    improvementRate: 12.5
  };

  // Sample performance data
  const suppliersPerformanceData = [
    {
      id: 'SUP-2025-001',
      name: 'Ghana National Petroleum Corporation',
      type: 'fuel',
      overallRating: 4.8,
      metrics: {
        quality: 4.9,
        delivery: 4.8,
        price: 4.6,
        responsiveness: 4.9,
        compliance: 4.8,
        innovation: 4.5
      },
      monthlyScores: [4.5, 4.6, 4.7, 4.8, 4.7, 4.8, 4.9, 4.8, 4.9, 4.8, 4.8, 4.8],
      contractsCompleted: 89,
      totalContractValue: 156700000,
      onTimeDeliveries: 96.5,
      defectRate: 0.8,
      reworkRate: 0.5,
      customerSatisfaction: 4.7,
      certificationLevel: 'Platinum',
      riskLevel: 'low',
      improvementTrend: 'positive',
      lastAssessment: '2025-01-10',
      nextReview: '2025-04-10',
      kpis: [
        { metric: 'Quality Score', value: 4.9, target: 4.5, status: 'exceeded' },
        { metric: 'On-Time Delivery', value: 96.5, target: 90.0, status: 'exceeded' },
        { metric: 'Cost Effectiveness', value: 4.6, target: 4.0, status: 'exceeded' },
        { metric: 'Compliance Rate', value: 4.8, target: 4.5, status: 'exceeded' }
      ],
      issues: [],
      strengths: [
        'Consistently high quality products',
        'Excellent delivery performance',
        'Strong regulatory compliance',
        'Proactive communication'
      ]
    },
    {
      id: 'SUP-2025-002',
      name: 'Tema Oil Refinery Limited',
      type: 'fuel',
      overallRating: 4.6,
      metrics: {
        quality: 4.7,
        delivery: 4.5,
        price: 4.8,
        responsiveness: 4.4,
        compliance: 4.6,
        innovation: 4.2
      },
      monthlyScores: [4.3, 4.4, 4.5, 4.6, 4.5, 4.6, 4.7, 4.6, 4.7, 4.6, 4.6, 4.6],
      contractsCompleted: 67,
      totalContractValue: 28450000,
      onTimeDeliveries: 94.2,
      defectRate: 1.2,
      reworkRate: 0.8,
      customerSatisfaction: 4.4,
      certificationLevel: 'Gold',
      riskLevel: 'low',
      improvementTrend: 'positive',
      lastAssessment: '2025-01-08',
      nextReview: '2025-04-08',
      kpis: [
        { metric: 'Quality Score', value: 4.7, target: 4.5, status: 'exceeded' },
        { metric: 'On-Time Delivery', value: 94.2, target: 90.0, status: 'exceeded' },
        { metric: 'Cost Effectiveness', value: 4.8, target: 4.0, status: 'exceeded' },
        { metric: 'Compliance Rate', value: 4.6, target: 4.5, status: 'met' }
      ],
      issues: [
        'Occasional delays in emergency deliveries'
      ],
      strengths: [
        'Competitive pricing',
        'Good product quality',
        'Reliable supply chain',
        'Local presence advantage'
      ]
    },
    {
      id: 'SUP-2025-004',
      name: 'Atlas Engineering Solutions',
      type: 'equipment',
      overallRating: 4.1,
      metrics: {
        quality: 4.3,
        delivery: 3.9,
        price: 4.2,
        responsiveness: 4.0,
        compliance: 4.1,
        innovation: 4.4
      },
      monthlyScores: [3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.2, 4.1, 4.1, 4.1],
      contractsCompleted: 23,
      totalContractValue: 3450000,
      onTimeDeliveries: 89.1,
      defectRate: 2.1,
      reworkRate: 1.5,
      customerSatisfaction: 3.9,
      certificationLevel: 'Silver',
      riskLevel: 'medium',
      improvementTrend: 'stable',
      lastAssessment: '2025-01-05',
      nextReview: '2025-04-05',
      kpis: [
        { metric: 'Quality Score', value: 4.3, target: 4.5, status: 'below' },
        { metric: 'On-Time Delivery', value: 89.1, target: 90.0, status: 'below' },
        { metric: 'Cost Effectiveness', value: 4.2, target: 4.0, status: 'exceeded' },
        { metric: 'Compliance Rate', value: 4.1, target: 4.5, status: 'below' }
      ],
      issues: [
        'Delivery delays in Q3',
        'Quality issues with batch #457',
        'Need better project management'
      ],
      strengths: [
        'Technical expertise',
        'Competitive pricing',
        'Flexible solutions',
        'Good customer service'
      ]
    },
    {
      id: 'SUP-2025-005',
      name: 'SafeGuard Security Services',
      type: 'service',
      overallRating: 3.9,
      metrics: {
        quality: 3.8,
        delivery: 4.0,
        price: 4.1,
        responsiveness: 3.7,
        compliance: 3.9,
        innovation: 3.6
      },
      monthlyScores: [3.6, 3.7, 3.8, 3.9, 3.8, 3.9, 4.0, 3.9, 4.0, 3.9, 3.9, 3.9],
      contractsCompleted: 12,
      totalContractValue: 890000,
      onTimeDeliveries: 87.5,
      defectRate: 3.2,
      reworkRate: 2.8,
      customerSatisfaction: 3.6,
      certificationLevel: 'Bronze',
      riskLevel: 'medium',
      improvementTrend: 'improving',
      lastAssessment: '2025-01-03',
      nextReview: '2025-04-03',
      kpis: [
        { metric: 'Service Quality', value: 3.8, target: 4.5, status: 'below' },
        { metric: 'Response Time', value: 87.5, target: 90.0, status: 'below' },
        { metric: 'Cost Effectiveness', value: 4.1, target: 4.0, status: 'met' },
        { metric: 'Compliance Rate', value: 3.9, target: 4.5, status: 'below' }
      ],
      issues: [
        'Staff turnover affecting service quality',
        'Slow response to incidents',
        'Need better training programs'
      ],
      strengths: [
        'Competitive rates',
        'Local knowledge',
        'Flexible scheduling'
      ]
    },
    {
      id: 'SUP-2025-003',
      name: 'Woodfields Energy Resources',
      type: 'fuel',
      overallRating: 4.3,
      metrics: {
        quality: 4.4,
        delivery: 4.2,
        price: 4.5,
        responsiveness: 4.1,
        compliance: 4.3,
        innovation: 4.0
      },
      monthlyScores: [4.0, 4.1, 4.2, 4.3, 4.2, 4.3, 4.4, 4.3, 4.4, 4.3, 4.3, 4.3],
      contractsCompleted: 34,
      totalContractValue: 8960000,
      onTimeDeliveries: 91.7,
      defectRate: 1.5,
      reworkRate: 1.0,
      customerSatisfaction: 4.2,
      certificationLevel: 'Gold',
      riskLevel: 'low',
      improvementTrend: 'positive',
      lastAssessment: '2025-01-07',
      nextReview: '2025-04-07',
      kpis: [
        { metric: 'Quality Score', value: 4.4, target: 4.5, status: 'below' },
        { metric: 'On-Time Delivery', value: 91.7, target: 90.0, status: 'exceeded' },
        { metric: 'Cost Effectiveness', value: 4.5, target: 4.0, status: 'exceeded' },
        { metric: 'Compliance Rate', value: 4.3, target: 4.5, status: 'below' }
      ],
      issues: [
        'Minor quality variations in recent batches'
      ],
      strengths: [
        'Excellent value for money',
        'Reliable delivery',
        'Good communication',
        'Flexibility in orders'
      ]
    }
  ];

  // Performance trends
  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Average Performance Score',
        data: [4.1, 4.2, 4.3, 4.2, 4.3, 4.4, 4.3, 4.4, 4.5, 4.4, 4.3, 4.3],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Quality Score',
        data: [4.3, 4.4, 4.5, 4.4, 4.5, 4.6, 4.5, 4.6, 4.7, 4.6, 4.5, 4.5],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'On-Time Delivery %',
        data: [89, 91, 92, 91, 93, 94, 92, 94, 95, 94, 93, 94],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };

  // Performance by category
  const categoryPerformanceData = {
    labels: ['Fuel Suppliers', 'Equipment', 'Services', 'Logistics', 'Maintenance'],
    datasets: [{
      label: 'Average Rating',
      data: [4.6, 4.1, 3.9, 4.2, 4.0],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'],
      borderWidth: 2
    }]
  };

  // Top performers
  const topPerformersData = {
    labels: ['GNPC', 'Woodfields', 'TOR Limited', 'Atlas Engineering', 'SafeGuard'],
    datasets: [{
      label: 'Overall Rating',
      data: [4.8, 4.3, 4.6, 4.1, 3.9],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3B82F6',
      borderWidth: 1
    }]
  };

  // KPI distribution
  const kpiDistributionData = {
    labels: ['Exceeded Target', 'Met Target', 'Below Target', 'Critical'],
    datasets: [{
      data: [45, 32, 18, 5],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    }]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPerformanceData(suppliersPerformanceData);
      setLoading(false);
    }, 1000);
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case 'improving':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      case 'declining':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-green-600';
      case 'met': return 'text-blue-600';
      case 'below': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Supplier Performance Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track, analyze, and improve supplier performance across all metrics
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Link href="/suppliers">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
              >
                ← Back to Suppliers
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300"
            >
              Performance Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Export Analytics
            </motion.button>
          </div>
        </motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-3xl font-bold text-green-600">{performanceMetrics.averageRating}/5.0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-blue-600">{performanceMetrics.onTimeDelivery}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Compliance</p>
                  <p className="text-3xl font-bold text-purple-600">{performanceMetrics.qualityCompliance}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement Rate</p>
                  <p className="text-3xl font-bold text-orange-600">+{performanceMetrics.improvementRate}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend Analysis</h3>
              <LineChart data={performanceTrendData} height={350} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance by Category</h3>
              <BarChart data={categoryPerformanceData} height={350} />
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
              <BarChart data={topPerformersData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">KPI Achievement Distribution</h3>
              <PieChart data={kpiDistributionData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Detailed Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Supplier Performance Dashboard</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <select 
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="24months">Last 24 Months</option>
                </select>
                <select 
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="fuel">Fuel Suppliers</option>
                  <option value="equipment">Equipment</option>
                  <option value="service">Services</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Overall Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Quality</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Responsiveness</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Certification</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trend</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Review</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((supplier, index) => (
                    <motion.tr
                      key={supplier.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <Link href={`/suppliers/${supplier.id}/profile`}>
                            <p className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                              {supplier.name}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{supplier.type}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRatingColor(supplier.overallRating)}`}>
                            {supplier.overallRating}/5
                          </span>
                          <div className="flex space-x-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= supplier.overallRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(supplier.metrics.quality / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{supplier.metrics.quality}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(supplier.metrics.delivery / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{supplier.metrics.delivery}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${(supplier.metrics.price / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{supplier.metrics.price}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${(supplier.metrics.responsiveness / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{supplier.metrics.responsiveness}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCertificationColor(supplier.certificationLevel)}`}>
                          {supplier.certificationLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(supplier.improvementTrend)}
                          <span className="text-sm capitalize">{supplier.improvementTrend}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{new Date(supplier.nextReview).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Performance Report"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Schedule Review"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8m-8 0H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2h-5" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default SupplierPerformance;