import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { PieChart, BarChart, LineChart } from '@/components/charts';
import Link from 'next/link';

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  separations: number;
  averageTenure: number;
  vacancyRate: number;
  turnoverRate: number;
  absenteeismRate: number;
  
  departmentBreakdown: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  leaveMetrics: {
    totalLeaveRequests: number;
    pendingApprovals: number;
    averageLeaveDays: number;
    leaveUtilizationRate: number;
  };
  
  trainingMetrics: {
    totalTrainingHours: number;
    completedTrainings: number;
    complianceTrainingRate: number;
    averageTrainingCost: number;
  };
  
  performanceMetrics: {
    completedReviews: number;
    averageRating: number;
    highPerformers: number;
    improvementRequired: number;
  };
}

const HRDashboardPage: NextPage = () => {
  const [metrics, setMetrics] = useState<HRMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHRMetrics();
  }, []);

  const loadHRMetrics = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from the HR service
      // const data = await hrService.getHRAnalytics();
      setMetrics(sampleMetrics);
    } catch (error) {
      console.error('Failed to load HR metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const hrModules = [
    {
      title: 'Employee Management',
      description: 'Manage employee records, profiles, and lifecycle',
      icon: '👥',
      href: '/hr/employees',
      count: 247,
      color: 'blue'
    },
    {
      title: 'Leave Management',
      description: 'Handle leave requests, approvals, and tracking',
      icon: '🏖️',
      href: '/hr/leave',
      count: 18,
      color: 'green'
    },
    {
      title: 'Performance Reviews',
      description: 'Conduct performance evaluations and appraisals',
      icon: '📊',
      href: '/hr/performance',
      count: 45,
      color: 'purple'
    },
    {
      title: 'Training & Development',
      description: 'Manage training programs and certifications',
      icon: '🎓',
      href: '/hr/training',
      count: 32,
      color: 'orange'
    },
    {
      title: 'Payroll Management',
      description: 'Process payroll, benefits, and compensation',
      icon: '💰',
      href: '/hr/payroll',
      count: 247,
      color: 'red'
    },
    {
      title: 'Recruitment',
      description: 'Manage job postings, applications, and hiring',
      icon: '🎯',
      href: '/hr/recruitment',
      count: 12,
      color: 'indigo'
    },
    {
      title: 'Compliance & Reports',
      description: 'Generate HR reports and ensure compliance',
      icon: '📋',
      href: '/hr/compliance',
      count: 8,
      color: 'gray'
    },
    {
      title: 'Organization Chart',
      description: 'Visualize organizational structure',
      icon: '🏢',
      href: '/hr/org-chart',
      count: 0,
      color: 'pink'
    }
  ];

  // Sample data for demonstration
  const sampleMetrics: HRMetrics = {
    totalEmployees: 247,
    activeEmployees: 235,
    newHires: 18,
    separations: 7,
    averageTenure: 1285, // in days
    vacancyRate: 4.9,
    turnoverRate: 8.2,
    absenteeismRate: 3.1,
    
    departmentBreakdown: [
      { department: 'Operations', count: 85, percentage: 34.4 },
      { department: 'Sales & Marketing', count: 42, percentage: 17.0 },
      { department: 'Technical Services', count: 38, percentage: 15.4 },
      { department: 'Finance', count: 28, percentage: 11.3 },
      { department: 'Human Resources', count: 22, percentage: 8.9 },
      { department: 'IT', count: 18, percentage: 7.3 },
      { department: 'Legal & Compliance', count: 14, percentage: 5.7 },
    ],
    
    statusBreakdown: [
      { status: 'Active', count: 235, percentage: 95.1 },
      { status: 'On Leave', count: 8, percentage: 3.2 },
      { status: 'Probation', count: 4, percentage: 1.6 },
    ],
    
    leaveMetrics: {
      totalLeaveRequests: 156,
      pendingApprovals: 18,
      averageLeaveDays: 12.5,
      leaveUtilizationRate: 78.3,
    },
    
    trainingMetrics: {
      totalTrainingHours: 2847,
      completedTrainings: 142,
      complianceTrainingRate: 96.8,
      averageTrainingCost: 1250,
    },
    
    performanceMetrics: {
      completedReviews: 198,
      averageRating: 3.7,
      highPerformers: 52,
      improvementRequired: 15,
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
      red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
      indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400',
      gray: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400',
      pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading || !metrics) {
    return (
      <FuturisticDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Human Resources Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Employee management and organizational insights
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </Button>
            <Link href="/hr/employees/new">
              <Button variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Employee
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-primary-400 mb-1">{metrics.totalEmployees}</p>
                <p className="text-sm text-green-400">↑ {metrics.newHires - metrics.separations} net growth</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Active Employees</h3>
                <p className="text-3xl font-bold text-green-400 mb-1">{metrics.activeEmployees}</p>
                <p className="text-sm text-dark-400">
                  {((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(1)}% active rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Average Tenure</h3>
                <p className="text-3xl font-bold text-blue-400 mb-1">
                  {Math.round(metrics.averageTenure / 365)} years
                </p>
                <p className="text-sm text-green-400">High retention</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Turnover Rate</h3>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{metrics.turnoverRate}%</p>
                <p className="text-sm text-green-400">Below industry average</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* HR Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hrModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={module.href}>
                <Card className={`glass-card hover:scale-105 transform transition-all duration-300 cursor-pointer bg-gradient-to-r ${getColorClasses(module.color)} border`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{module.icon}</div>
                      {module.count > 0 && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 ${getColorClasses(module.color)}`}>
                          {module.count}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{module.title}</h3>
                    <p className="text-sm text-dark-300 leading-relaxed">{module.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader title="Department Distribution" />
              <CardContent>
                <PieChart 
                  data={metrics.departmentBreakdown.map(d => ({
                    name: d.department,
                    value: d.count,
                    percentage: d.percentage
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader title="Employee Status" />
              <CardContent>
                <BarChart 
                  data={metrics.statusBreakdown.map(s => ({
                    name: s.status,
                    value: s.count
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader title="Leave Management" />
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Total Requests</span>
                  <span className="font-semibold text-white">{metrics.leaveMetrics.totalLeaveRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Pending Approval</span>
                  <span className="font-semibold text-yellow-400">{metrics.leaveMetrics.pendingApprovals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Avg Leave Days</span>
                  <span className="font-semibold text-blue-400">{metrics.leaveMetrics.averageLeaveDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Utilization Rate</span>
                  <span className="font-semibold text-green-400">{metrics.leaveMetrics.leaveUtilizationRate}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader title="Training & Development" />
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Total Hours</span>
                  <span className="font-semibold text-white">{metrics.trainingMetrics.totalTrainingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Completed</span>
                  <span className="font-semibold text-green-400">{metrics.trainingMetrics.completedTrainings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Compliance Rate</span>
                  <span className="font-semibold text-green-400">{metrics.trainingMetrics.complianceTrainingRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Avg Cost</span>
                  <span className="font-semibold text-blue-400">GHS {metrics.trainingMetrics.averageTrainingCost}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader title="Performance Reviews" />
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Completed Reviews</span>
                  <span className="font-semibold text-white">{metrics.performanceMetrics.completedReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Average Rating</span>
                  <span className="font-semibold text-blue-400">{metrics.performanceMetrics.averageRating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">High Performers</span>
                  <span className="font-semibold text-green-400">{metrics.performanceMetrics.highPerformers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Need Improvement</span>
                  <span className="font-semibold text-red-400">{metrics.performanceMetrics.improvementRequired}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader title="Recent HR Activities" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">New employee onboarded</p>
                    <p className="text-sm text-dark-400">Sarah Mensah joined Technical Services team</p>
                  </div>
                  <span className="text-sm text-dark-400">2 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Leave request submitted</p>
                    <p className="text-sm text-dark-400">12 employees submitted annual leave requests</p>
                  </div>
                  <span className="text-sm text-dark-400">4 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Performance reviews completed</p>
                    <p className="text-sm text-dark-400">Q4 2023 performance reviews finalized</p>
                  </div>
                  <span className="text-sm text-dark-400">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default HRDashboardPage;