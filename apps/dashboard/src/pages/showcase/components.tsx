import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal, Badge, NotificationSystem } from '@/components/ui';
import { RealTimeRevenueChart, RealTimeSalesChart, RealTimeTransactionChart } from '@/components/charts';
import { ClaimsTable, TransactionTable } from '@/components/tables';
import { DealerOnboardingWizard } from '@/components/forms';
import { useAuthStore } from '@/stores/auth.store';

const ComponentsShowcase: NextPage = () => {
  const { user } = useAuthStore();
  const [currentDemo, setCurrentDemo] = useState<string>('overview');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const demoSections = [
    {
      id: 'overview',
      title: 'Real-time Dashboard',
      description: 'Live charts with WebSocket integration and automatic updates',
    },
    {
      id: 'tables',
      title: 'Data Tables',
      description: 'Advanced tables with sorting, filtering, pagination, and bulk actions',
    },
    {
      id: 'forms',
      title: 'Form Wizards',
      description: 'Multi-step forms with validation and real-time feedback',
    },
    {
      id: 'notifications',
      title: 'Notification System',
      description: 'Real-time notifications with WebSocket integration',
    },
  ];

  const renderDemoContent = () => {
    switch (currentDemo) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RealTimeRevenueChart 
                height={300}
                refreshInterval={5000}
                enableWebSocket={true}
              />
              <RealTimeSalesChart 
                height={300}
                refreshInterval={5000}
              />
            </div>
            <div className="w-full">
              <RealTimeTransactionChart 
                height={350}
                refreshInterval={5000}
                enableWebSocket={true}
              />
            </div>
            
            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Live Transactions', value: '1,247', change: '+15', color: 'green' },
                { title: 'Active Stations', value: '247', change: '+2', color: 'blue' },
                { title: 'Fuel Sales', value: '15.2M L', change: '+8.5%', color: 'purple' },
                { title: 'Revenue', value: 'GHS 45.2M', change: '+12.5%', color: 'yellow' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-dark-400 mb-1">{stat.title}</div>
                      <div className="text-xs text-green-400">{stat.change}</div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'tables':
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader title="UPPF Claims Management" />
              <CardContent>
                <ClaimsTable showActions={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Live Transactions" />
              <CardContent>
                <TransactionTable showActions={true} maxRecords={50} />
              </CardContent>
            </Card>
          </div>
        );

      case 'forms':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Form Demo Cards */}
              <Card className="cursor-pointer hover:shadow-xl transition-shadow" 
                    onClick={() => setOnboardingOpen(true)}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dealer Onboarding</h3>
                  <p className="text-dark-400 text-sm mb-4">6-step wizard with validation</p>
                  <Badge variant="primary">Interactive Demo</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-xl transition-shadow" 
                    onClick={() => setModalOpen(true)}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">UPPF Claims</h3>
                  <p className="text-dark-400 text-sm mb-4">4-step claim submission</p>
                  <Badge variant="success">Form Wizard</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pricing Windows</h3>
                  <p className="text-dark-400 text-sm mb-4">Price management forms</p>
                  <Badge variant="warning">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Form Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Form Features" />
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Real-time validation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Step-by-step wizard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">File upload handling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Auto-save functionality</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Dynamic field validation</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Integration Features" />
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">API integration ready</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">Error handling & retry</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">Progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">Mobile responsive</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white">Accessibility compliant</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader title="Notification Types" />
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { type: 'success', title: 'Transaction Complete', message: 'Payment of GHS 1,250 processed successfully' },
                      { type: 'warning', title: 'Low Inventory', message: 'Tema Station: PMS level at 15%' },
                      { type: 'error', title: 'System Alert', message: 'Payment gateway connection failed' },
                      { type: 'info', title: 'Price Update', message: 'New pricing window activated' },
                    ].map((notif, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        notif.type === 'success' ? 'bg-green-500/10 border-green-500' :
                        notif.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                        notif.type === 'error' ? 'bg-red-500/10 border-red-500' :
                        'bg-blue-500/10 border-blue-500'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            notif.type === 'success' ? 'bg-green-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            notif.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{notif.title}</p>
                            <p className="text-dark-400 text-xs mt-1">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Real-time Features" />
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">WebSocket connection active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">Push notifications enabled</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">Auto-reconnection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">Message queuing</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-dark-700">
                    <p className="text-sm text-dark-400 mb-3">Notification Categories:</p>
                    <div className="space-y-2">
                      {[
                        'Transaction Updates',
                        'Inventory Alerts',
                        'UPPF Claim Status',
                        'System Maintenance',
                        'Compliance Alerts',
                        'Price Changes',
                      ].map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-white text-sm">{category}</span>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Components Showcase
            </h1>
            <p className="text-dark-400 mt-2">
              Live demonstration of integrated UI components with real-time functionality
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationSystem enableWebSocket={true} />
            <Button variant="primary" size="sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Live Demo
            </Button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {demoSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentDemo(section.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentDemo === section.id
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Current Demo Description */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {demoSections.find(s => s.id === currentDemo)?.title}
                </h3>
                <p className="text-dark-400 text-sm">
                  {demoSections.find(s => s.id === currentDemo)?.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <motion.div
          key={currentDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderDemoContent()}
        </motion.div>

        {/* Modals */}
        <DealerOnboardingWizard
          isOpen={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={(data) => {
            console.log('Demo completed:', data);
            setOnboardingOpen(false);
          }}
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="UPPF Claims Demo"
        >
          <div className="p-6">
            <p className="text-white mb-4">
              This would open the UPPF claims creation wizard with the same functionality as the dealer onboarding process.
            </p>
            <p className="text-dark-400 text-sm">
              Features include step-by-step validation, file uploads, auto-calculations, and GPS validation.
            </p>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default ComponentsShowcase;