import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts';
import { Badge } from '@/components/ui';
import { analyticsService } from '@/services/api';
import { toast } from 'react-hot-toast';

const OperationalAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedStation, setSelectedStation] = useState('all');

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const stationOptions = [
    { value: 'all', label: 'All Stations' },
    { value: 'accra-central', label: 'Accra Central' },
    { value: 'kumasi-main', label: 'Kumasi Main' },
    { value: 'takoradi-harbor', label: 'Takoradi Harbor' },
    { value: 'tamale-north', label: 'Tamale North' }
  ];

  useEffect(() => {
    fetchOperationalData();
  }, [selectedPeriod, selectedStation]);

  const fetchOperationalData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getOperationalAnalytics();
      setData(response);
    } catch (error) {
      console.error('Error fetching operational data:', error);
      // Mock data for development
      setData({
        summary: {
          totalStations: 45,
          activeStations: 43,
          averageUptime: 98.5,
          totalThroughput: 2847563,
          efficiency: 89.2,
          qualityScore: 96.8,
          safetyIncidents: 0,
          maintenanceEvents: 12
        },
        performance: generateMockPerformance(),
        efficiency: generateMockEfficiency(),
        quality: generateMockQuality(),
        maintenance: generateMockMaintenance()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockPerformance = () => ({
    stationPerformance: {
      labels: ['Accra Central', 'Kumasi Main', 'Takoradi Harbor', 'Tamale North', 'Cape Coast', 'Ho Central'],
      datasets: [{
        label: 'Efficiency %',
        data: [95, 92, 88, 85, 90, 87],
        backgroundColor: '#3B82F6'
      }]
    },
    throughputTrend: {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      datasets: [{
        label: 'Daily Throughput (Litres)',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 80000),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }]
    },
    uptimeTrend: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'System Uptime %',
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 5) + 95),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    }
  });

  const generateMockEfficiency = () => ({
    processEfficiency: {
      labels: ['Fuel Loading', 'Quality Check', 'Dispatch', 'Documentation', 'Payment'],
      datasets: [{
        label: 'Efficiency %',
        data: [92, 96, 88, 94, 90],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      }]
    },
    resourceUtilization: {
      labels: ['Pumps', 'Storage Tanks', 'Loading Bays', 'Testing Equipment', 'Vehicles'],
      datasets: [{
        label: 'Utilization %',
        data: [85, 78, 92, 67, 88],
        backgroundColor: '#10B981'
      }]
    },
    wasteMetrics: {
      labels: ['Product Loss', 'Energy Waste', 'Time Waste', 'Material Waste'],
      datasets: [{
        data: [2.1, 5.5, 8.2, 3.7],
        backgroundColor: ['#EF4444', '#F59E0B', '#F97316', '#DC2626']
      }]
    }
  });

  const generateMockQuality = () => ({
    qualityMetrics: {
      labels: ['Purity', 'Density', 'Octane Rating', 'Sulphur Content', 'Water Content'],
      datasets: [{
        label: 'Quality Score %',
        data: [98, 97, 96, 99, 95],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    defectTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Defect Rate %',
        data: [1.2, 0.8, 0.6, 0.4],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }]
    },
    complianceScore: {
      labels: ['NPA Standards', 'EPA Requirements', 'Safety Protocols', 'Quality Assurance'],
      datasets: [{
        data: [98, 96, 100, 97],
        backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
      }]
    }
  });

  const generateMockMaintenance = () => ({
    maintenanceSchedule: {
      labels: ['Preventive', 'Corrective', 'Emergency', 'Scheduled'],
      datasets: [{
        data: [65, 20, 10, 5],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']
      }]
    },
    equipmentHealth: {
      labels: ['Excellent', 'Good', 'Fair', 'Poor'],
      datasets: [{
        data: [45, 35, 15, 5],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      }]
    },
    mttrTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'MTTR (Hours)',
        data: [4.2, 3.8, 3.5, 3.2, 2.9, 2.7],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }]
    }
  });

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-GH').format(number);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'success';
    if (value >= thresholds.warning) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Operational Analytics" subtitle="Operational efficiency and performance metrics">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Operational Analytics" 
      subtitle="Operational efficiency and performance metrics"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Select
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value)}
              options={periodOptions}
              className="w-40"
            />
            <Select
              value={selectedStation}
              onChange={(value) => setSelectedStation(value)}
              options={stationOptions}
              className="w-48"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Operations Report</Button>
            <Button variant="outline">Schedule Maintenance</Button>
          </div>
        </div>

        {/* Key Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Stations',
              value: data?.summary?.totalStations || 0,
              subtitle: `${data?.summary?.activeStations || 0} active`,
              icon: '🏢',
              color: 'blue'
            },
            {
              title: 'Average Uptime',
              value: `${data?.summary?.averageUptime || 0}%`,
              subtitle: 'System availability',
              icon: '⚡',
              color: 'green'
            },
            {
              title: 'Efficiency Score',
              value: `${data?.summary?.efficiency || 0}%`,
              subtitle: 'Overall efficiency',
              icon: '🎯',
              color: 'purple'
            },
            {
              title: 'Quality Score',
              value: `${data?.summary?.qualityScore || 0}%`,
              subtitle: 'Quality compliance',
              icon: '✨',
              color: 'orange'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{metric.icon}</span>
                  <Badge variant={getStatusColor(parseFloat(metric.value), { good: 90, warning: 75 })}>
                    {parseFloat(metric.value) >= 90 ? 'Excellent' : parseFloat(metric.value) >= 75 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p className="text-sm text-gray-500">{metric.subtitle}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Throughput',
              value: formatNumber(data?.summary?.totalThroughput || 0) + ' L',
              color: 'blue'
            },
            {
              title: 'Safety Incidents',
              value: data?.summary?.safetyIncidents || 0,
              color: 'green'
            },
            {
              title: 'Maintenance Events',
              value: data?.summary?.maintenanceEvents || 0,
              color: 'orange'
            },
            {
              title: 'Productivity Index',
              value: '92.5%',
              color: 'purple'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="p-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Performance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Daily Throughput Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fuel dispensing volume</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data?.performance?.throughputTrend} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">System Uptime</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">24-hour availability pattern</p>
              </CardHeader>
              <CardContent>
                <LineChart data={data?.performance?.uptimeTrend} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Station Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Station Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency by location</p>
            </CardHeader>
            <CardContent>
              <BarChart data={data?.performance?.stationPerformance} height={300} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Process Efficiency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Operational process performance</p>
              </CardHeader>
              <CardContent>
                <BarChart data={data?.efficiency?.processEfficiency} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Resource Utilization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Equipment usage rates</p>
              </CardHeader>
              <CardContent>
                <BarChart data={data?.efficiency?.resourceUtilization} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Waste Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Waste reduction opportunities</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.efficiency?.wasteMetrics} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Quality Metrics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product quality parameters</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={data?.quality?.qualityMetrics} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Defect Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quality issues over time</p>
              </CardHeader>
              <CardContent>
                <LineChart data={data?.quality?.defectTrend} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Compliance Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Regulatory compliance</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.quality?.complianceScore} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Maintenance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance type distribution</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.maintenance?.maintenanceSchedule} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Equipment Health</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asset condition status</p>
              </CardHeader>
              <CardContent>
                <PieChart data={data?.maintenance?.equipmentHealth} height={300} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <Card className="p-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">MTTR Trend</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mean time to repair</p>
              </CardHeader>
              <CardContent>
                <LineChart data={data?.maintenance?.mttrTrend} height={300} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Operational Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <Card className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Operational Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Key operational performance indicators</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Top Performers</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Accra Central: 95% efficiency</li>
                    <li>• Kumasi Main: 92% efficiency</li>
                    <li>• Zero safety incidents this month</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Process Improvements</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Reduced MTTR by 35%</li>
                    <li>• Improved fuel loading efficiency</li>
                    <li>• Enhanced quality compliance</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Areas for Improvement</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Optimize dispatch processes</li>
                    <li>• Reduce energy consumption</li>
                    <li>• Improve equipment utilization</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Recommendations</h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Implement predictive maintenance</li>
                    <li>• Automate quality checks</li>
                    <li>• Expand best practices</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default OperationalAnalytics;