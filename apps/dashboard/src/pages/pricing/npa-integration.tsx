import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart, BarChart, PieChart, RealTimeChart } from '@/components/charts';
import { regulatoryService, wsService } from '@/services/api';
import { toast } from 'react-hot-toast';

const NPAIntegrationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [npaData, setNpaData] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState({});
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // Mock NPA integration data
  const mockData = {
    overview: {
      totalSubmissions: 156,
      pendingSubmissions: 3,
      complianceRate: 99.2,
      lastSync: '2025-01-13 09:45:00'
    },
    submissions: [
      {
        id: 'NPA-2025-001-052',
        type: 'UPPF Claim',
        status: 'submitted',
        submissionDate: '2025-01-13 08:30:00',
        amount: 450750.50,
        product: 'Petrol (95 Octane)',
        window: 'Window-2025-001',
        npaResponse: 'Accepted',
        responseDate: '2025-01-13 09:15:00'
      },
      {
        id: 'NPA-2025-001-051',
        type: 'Price Window',
        status: 'approved',
        submissionDate: '2025-01-12 18:00:00',
        amount: 0,
        product: 'All Products',
        window: 'Window-2025-001',
        npaResponse: 'Approved',
        responseDate: '2025-01-12 19:30:00'
      },
      {
        id: 'NPA-2025-001-050',
        type: 'UPPF Claim',
        status: 'pending',
        submissionDate: '2025-01-12 16:45:00',
        amount: 327890.25,
        product: 'Diesel (AGO)',
        window: 'Window-2024-052',
        npaResponse: 'Under Review',
        responseDate: null
      },
      {
        id: 'NPA-2025-001-049',
        type: 'Compliance Report',
        status: 'rejected',
        submissionDate: '2025-01-11 14:20:00',
        amount: 0,
        product: 'N/A',
        window: 'N/A',
        npaResponse: 'Documentation Incomplete',
        responseDate: '2025-01-11 16:00:00'
      }
    ],
    compliance: {
      uppfCompliance: 98.5,
      priceWindowCompliance: 100,
      reportingCompliance: 99.2,
      documentationCompliance: 96.8
    },
    submissionTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Submissions',
        data: [23, 28, 25, 31, 29, 26],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    responseTime: {
      labels: ['UPPF Claims', 'Price Windows', 'Reports', 'Amendments'],
      datasets: [{
        label: 'Avg Response Time (hours)',
        data: [4.2, 1.8, 6.5, 3.1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }]
    },
    statusDistribution: {
      labels: ['Approved', 'Pending', 'Under Review', 'Rejected'],
      datasets: [{
        data: [82, 8, 7, 3],
        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
      }]
    }
  };

  useEffect(() => {
    loadNPAData();
    
    // Setup WebSocket for real-time NPA updates
    wsService.connect();
    
    return () => {
      wsService.disconnect();
    };
  }, []);

  const loadNPAData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNpaData(mockData.overview);
      setSubmissions(mockData.submissions);
      setComplianceStatus(mockData.compliance);
      
      toast.success('NPA data loaded successfully');
    } catch (error) {
      toast.error('Failed to load NPA data');
      console.error('NPA loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithNPA = async () => {
    try {
      toast.loading('Synchronizing with NPA systems...');
      
      // Simulate NPA sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('NPA synchronization completed');
      await loadNPAData();
    } catch (error) {
      toast.error('NPA synchronization failed');
    }
  };

  const submitUPPFClaim = async () => {
    try {
      toast.loading('Submitting UPPF claim to NPA...');
      
      // Simulate UPPF submission
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast.success('UPPF claim submitted successfully');
      await loadNPAData();
    } catch (error) {
      toast.error('UPPF submission failed');
    }
  };

  const downloadComplianceReport = async () => {
    try {
      toast.loading('Generating compliance report...');
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Compliance report downloaded');
    } catch (error) {
      toast.error('Report generation failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'submitted':
      case 'accepted':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'pending':
      case 'under review':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'rejected':
      case 'failed':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
          />
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              NPA Integration Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              National Petroleum Authority integration and compliance monitoring
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={syncWithNPA}
              className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Sync with NPA
            </button>
            
            <button
              onClick={submitUPPFClaim}
              className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Submit UPPF
            </button>
            
            <button
              onClick={downloadComplianceReport}
              className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Download Report
            </button>
          </div>
        </motion.div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Total Submissions', 
              value: mockData.overview.totalSubmissions, 
              color: 'text-blue-500', 
              icon: '📊',
              change: '+12 this month'
            },
            { 
              title: 'Pending', 
              value: mockData.overview.pendingSubmissions, 
              color: 'text-yellow-500', 
              icon: '⏳',
              change: '-2 from last week'
            },
            { 
              title: 'Compliance Rate', 
              value: `${mockData.overview.complianceRate}%`, 
              color: 'text-green-500', 
              icon: '✅',
              change: '+0.3% this quarter'
            },
            { 
              title: 'Last Sync', 
              value: '09:45', 
              color: 'text-purple-500', 
              icon: '🔄',
              change: 'Auto sync enabled'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.change}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Real-time Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <CardHeader 
              title="NPA System Status" 
              subtitle="Real-time connection and service status"
              action={
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 font-medium">Connected</span>
                </div>
              }
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg glass border border-white/20">
                  <div className="text-2xl mb-2">🌐</div>
                  <h4 className="font-semibold text-white">API Gateway</h4>
                  <p className="text-green-400 text-sm">Online</p>
                  <p className="text-xs text-gray-400">Response: 245ms</p>
                </div>
                
                <div className="text-center p-4 rounded-lg glass border border-white/20">
                  <div className="text-2xl mb-2">📋</div>
                  <h4 className="font-semibold text-white">UPPF Service</h4>
                  <p className="text-green-400 text-sm">Operational</p>
                  <p className="text-xs text-gray-400">Processing claims</p>
                </div>
                
                <div className="text-center p-4 rounded-lg glass border border-white/20">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-white">Reporting Portal</h4>
                  <p className="text-green-400 text-sm">Available</p>
                  <p className="text-xs text-gray-400">Last update: 5 min ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submission Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader title="Submission Trends" subtitle="Monthly NPA submissions over time" />
              <CardContent>
                <LineChart data={mockData.submissionTrends} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Response Time Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <CardHeader title="NPA Response Times" subtitle="Average processing time by submission type" />
              <CardContent>
                <BarChart data={mockData.responseTime} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Compliance Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <CardHeader title="Compliance Status" subtitle="Current compliance rates by category" />
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'UPPF Compliance', value: mockData.compliance.uppfCompliance, color: 'bg-green-500' },
                    { label: 'Price Window Compliance', value: mockData.compliance.priceWindowCompliance, color: 'bg-blue-500' },
                    { label: 'Reporting Compliance', value: mockData.compliance.reportingCompliance, color: 'bg-purple-500' },
                    { label: 'Documentation', value: mockData.compliance.documentationCompliance, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={`h-2 rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <CardHeader title="Submission Status Distribution" subtitle="Current status breakdown" />
              <CardContent>
                <PieChart data={mockData.statusDistribution} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <CardHeader title="Recent NPA Submissions" subtitle="Latest submissions and their status" />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Submission ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">NPA Response</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, index) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-white">{submission.id}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                            {submission.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{submission.product}</td>
                        <td className="py-3 px-4 text-white">
                          {submission.amount > 0 ? `₵${submission.amount.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{submission.npaResponse}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{submission.submissionDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
                              View
                            </button>
                            {submission.status === 'pending' && (
                              <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors">
                                Track
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Integration Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="p-6">
            <CardHeader title="Integration Settings" subtitle="Configure NPA integration parameters" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Auto-Sync Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-300">Auto-submit UPPF claims</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-300">Real-time price sync</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-300">Compliance monitoring</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-4">Notification Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-300">Email alerts on submission status</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-gray-300">SMS for critical issues</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-300">Daily summary reports</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default NPAIntegrationDashboard;