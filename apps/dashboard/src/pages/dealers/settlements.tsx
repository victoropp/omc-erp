import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { pricingService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Settlement {
  id: string;
  dealerId: string;
  dealerName: string;
  location: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commission: number;
  discounts: number;
  adjustments: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID' | 'DISPUTED' | 'CANCELLED';
  createdDate: string;
  processedDate?: string;
  paymentDate?: string;
  paymentMethod: 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'MOBILE_MONEY';
  bankAccount?: string;
  reference?: string;
  notes?: string;
  fuelTypes: {
    petrol: { volume: number; amount: number };
    diesel: { volume: number; amount: number };
    kerosene: { volume: number; amount: number };
  };
}

interface SettlementBatch {
  id: string;
  name: string;
  period: string;
  totalDealers: number;
  totalAmount: number;
  processedCount: number;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdDate: string;
}

interface PaymentInstruction {
  id: string;
  settlementId: string;
  dealerName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';
}

const DealerSettlements = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settlementBatches, setSettlementBatches] = useState<SettlementBatch[]>([]);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstruction[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [selectedTab, setSelectedTab] = useState('settlements');

  useEffect(() => {
    loadSettlementData();
  }, []);

  const loadSettlementData = async () => {
    setLoading(true);
    try {
      // Mock data - would come from API
      const mockSettlements: Settlement[] = [
        {
          id: 'SETTLE-001',
          dealerId: 'DLR-001',
          dealerName: 'Accra Central Fuel Station',
          location: 'Accra, Greater Accra',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-15',
          grossSales: 1250000,
          commission: 62500,
          discounts: 5000,
          adjustments: -2000,
          netAmount: 55500,
          status: 'PROCESSED',
          createdDate: '2025-01-16',
          processedDate: '2025-01-17',
          paymentDate: '2025-01-18',
          paymentMethod: 'BANK_TRANSFER',
          bankAccount: 'GCB-123456789',
          reference: 'TXN-20250118-001',
          fuelTypes: {
            petrol: { volume: 15000, amount: 900000 },
            diesel: { volume: 8000, amount: 320000 },
            kerosene: { volume: 1000, amount: 30000 }
          }
        },
        {
          id: 'SETTLE-002',
          dealerId: 'DLR-002',
          dealerName: 'Kumasi North Petroleum',
          location: 'Kumasi, Ashanti',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-15',
          grossSales: 980000,
          commission: 49000,
          discounts: 3000,
          adjustments: 1000,
          netAmount: 47000,
          status: 'PENDING',
          createdDate: '2025-01-16',
          paymentMethod: 'BANK_TRANSFER',
          bankAccount: 'ADB-987654321',
          fuelTypes: {
            petrol: { volume: 12000, amount: 720000 },
            diesel: { volume: 6000, amount: 240000 },
            kerosene: { volume: 500, amount: 20000 }
          }
        },
        {
          id: 'SETTLE-003',
          dealerId: 'DLR-003',
          dealerName: 'Takoradi Port Fuel',
          location: 'Takoradi, Western',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-15',
          grossSales: 850000,
          commission: 42500,
          discounts: 4000,
          adjustments: 0,
          netAmount: 38500,
          status: 'DISPUTED',
          createdDate: '2025-01-16',
          paymentMethod: 'CHEQUE',
          notes: 'Dealer disputed commission calculation',
          fuelTypes: {
            petrol: { volume: 10000, amount: 600000 },
            diesel: { volume: 5000, amount: 200000 },
            kerosene: { volume: 1000, amount: 50000 }
          }
        }
      ];

      const mockBatches: SettlementBatch[] = [
        {
          id: 'BATCH-001',
          name: 'January 2025 Bi-Weekly Settlement',
          period: '2025-01-01 to 2025-01-15',
          totalDealers: 45,
          totalAmount: 2250000,
          processedCount: 42,
          status: 'PROCESSING',
          createdBy: 'Finance Manager',
          createdDate: '2025-01-16'
        },
        {
          id: 'BATCH-002',
          name: 'December 2024 Monthly Settlement',
          period: '2024-12-01 to 2024-12-31',
          totalDealers: 43,
          totalAmount: 4100000,
          processedCount: 43,
          status: 'COMPLETED',
          createdBy: 'Finance Manager',
          createdDate: '2025-01-02'
        }
      ];

      const mockPaymentInstructions: PaymentInstruction[] = [
        {
          id: 'PAY-001',
          settlementId: 'SETTLE-001',
          dealerName: 'Accra Central Fuel Station',
          bankName: 'Ghana Commercial Bank',
          accountNumber: '123456789',
          accountName: 'Accra Central Fuel Station Ltd',
          amount: 55500,
          currency: 'GHS',
          reference: 'SETTLE-001-PAY',
          status: 'CONFIRMED'
        },
        {
          id: 'PAY-002',
          settlementId: 'SETTLE-002',
          dealerName: 'Kumasi North Petroleum',
          bankName: 'Agricultural Development Bank',
          accountNumber: '987654321',
          accountName: 'Kumasi North Petroleum Ltd',
          amount: 47000,
          currency: 'GHS',
          reference: 'SETTLE-002-PAY',
          status: 'PENDING'
        }
      ];

      setSettlements(mockSettlements);
      setSettlementBatches(mockBatches);
      setPaymentInstructions(mockPaymentInstructions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settlement data:', error);
      toast.error('Failed to load settlement data');
      setLoading(false);
    }
  };

  const settlementMetrics = {
    totalPendingAmount: settlements.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + s.netAmount, 0),
    totalProcessedAmount: settlements.filter(s => s.status === 'PROCESSED' || s.status === 'PAID').reduce((sum, s) => sum + s.netAmount, 0),
    averageSettlementAmount: settlements.reduce((sum, s) => sum + s.netAmount, 0) / settlements.length,
    pendingCount: settlements.filter(s => s.status === 'PENDING').length,
    processedCount: settlements.filter(s => s.status === 'PROCESSED' || s.status === 'PAID').length,
    disputedCount: settlements.filter(s => s.status === 'DISPUTED').length
  };

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = settlement.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         settlement.dealerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || settlement.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleProcessSettlement = async (settlementId: string) => {
    try {
      // API call to process settlement
      toast.success('Settlement processed successfully');
      loadSettlementData();
    } catch (error) {
      toast.error('Failed to process settlement');
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      // API call to approve payment
      toast.success('Payment approved and sent to bank');
      loadSettlementData();
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleCreateBatch = async () => {
    try {
      // API call to create settlement batch
      toast.success('Settlement batch created successfully');
      setShowBatchModal(false);
      loadSettlementData();
    } catch (error) {
      toast.error('Failed to create settlement batch');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'PENDING': 'warning',
      'PROCESSED': 'primary',
      'PAID': 'success',
      'DISPUTED': 'danger',
      'CANCELLED': 'secondary'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getBatchStatusBadge = (status: string) => {
    const variants = {
      'DRAFT': 'secondary',
      'PROCESSING': 'warning',
      'COMPLETED': 'success',
      'CANCELLED': 'danger'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  // Chart data
  const settlementStatusData = {
    labels: ['Pending', 'Processed', 'Paid', 'Disputed'],
    datasets: [{
      data: [
        settlements.filter(s => s.status === 'PENDING').length,
        settlements.filter(s => s.status === 'PROCESSED').length,
        settlements.filter(s => s.status === 'PAID').length,
        settlements.filter(s => s.status === 'DISPUTED').length
      ],
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const settlementTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Settlement Amount (₵)',
      data: [1200000, 1350000, 1180000, 1420000],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    }]
  };

  const fuelTypeBreakdownData = {
    labels: settlements.map(s => s.dealerName.substring(0, 15) + '...'),
    datasets: [
      {
        label: 'Petrol',
        data: settlements.map(s => s.fuelTypes.petrol.amount),
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Diesel',
        data: settlements.map(s => s.fuelTypes.diesel.amount),
        backgroundColor: '#10B981'
      },
      {
        label: 'Kerosene',
        data: settlements.map(s => s.fuelTypes.kerosene.amount),
        backgroundColor: '#F59E0B'
      }
    ]
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="Dealer Settlements" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout 
      title="Dealer Settlement Processing" 
      subtitle="Automated dealer settlement calculations and payment processing system"
    >
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Amount</p>
                  <p className="text-3xl font-bold text-orange-600">₵{(settlementMetrics.totalPendingAmount / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600 font-medium">{settlementMetrics.pendingCount} settlements</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed Amount</p>
                  <p className="text-3xl font-bold text-green-600">₵{(settlementMetrics.totalProcessedAmount / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-green-600 font-medium">{settlementMetrics.processedCount} completed</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Settlement</p>
                  <p className="text-3xl font-bold text-blue-600">₵{(settlementMetrics.averageSettlementAmount / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-blue-600 font-medium">per dealer</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disputed</p>
                  <p className="text-3xl font-bold text-red-600">{settlementMetrics.disputedCount}</p>
                  <p className="text-xs text-red-600 font-medium">require attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Settlement Status Distribution</h3>
              <PieChart data={settlementStatusData} height={250} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Settlement Trend</h3>
              <LineChart data={settlementTrendData} height={250} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fuel Type Breakdown</h3>
              <BarChart data={fuelTypeBreakdownData} height={250} />
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex space-x-4 border-b mb-4">
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'settlements' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('settlements')}
              >
                Settlements
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'batches' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('batches')}
              >
                Batches
              </button>
              <button
                className={`pb-2 px-1 font-medium ${selectedTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedTab('payments')}
              >
                Payments
              </button>
            </div>

            {selectedTab === 'settlements' && (
              <div>
                {/* Filters and Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Input
                    placeholder="Search settlements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Statuses' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'PROCESSED', label: 'Processed' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'DISPUTED', label: 'Disputed' }
                    ]}
                  />
                  <Select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Periods' },
                      { value: 'THIS_MONTH', label: 'This Month' },
                      { value: 'LAST_MONTH', label: 'Last Month' },
                      { value: 'THIS_QUARTER', label: 'This Quarter' }
                    ]}
                  />
                  <Button onClick={() => setShowSettlementModal(true)}>
                    New Settlement
                  </Button>
                </div>

                {/* Settlements Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Settlement ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Gross Sales</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Commission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Net Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSettlements.map((settlement, index) => (
                        <motion.tr
                          key={settlement.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">{settlement.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{settlement.dealerName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{settlement.location}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(settlement.periodStart).toLocaleDateString()} - {new Date(settlement.periodEnd).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium">₵{settlement.grossSales.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">₵{settlement.commission.toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold">₵{settlement.netAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {getStatusBadge(settlement.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSettlement(settlement);
                                  setShowSettlementModal(true);
                                }}
                              >
                                View
                              </Button>
                              {settlement.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessSettlement(settlement.id)}
                                >
                                  Process
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'batches' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Settlement Batches</h3>
                  <Button onClick={() => setShowBatchModal(true)}>Create New Batch</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Batch ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealers</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Progress</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementBatches.map((batch, index) => (
                        <tr key={batch.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-3 px-4 font-medium">{batch.id}</td>
                          <td className="py-3 px-4">{batch.name}</td>
                          <td className="py-3 px-4 text-sm">{batch.period}</td>
                          <td className="py-3 px-4">{batch.totalDealers}</td>
                          <td className="py-3 px-4 font-bold">₵{batch.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-sm">{batch.processedCount}/{batch.totalDealers}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full ml-2 overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500"
                                  style={{ width: `${(batch.processedCount / batch.totalDealers) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getBatchStatusBadge(batch.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline">View Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Payment Instructions</h3>
                  <Button onClick={() => setShowPaymentModal(true)}>Generate Payments</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Payment ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Bank Details</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Reference</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentInstructions.map((payment, index) => (
                        <tr key={payment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-3 px-4 font-medium">{payment.id}</td>
                          <td className="py-3 px-4">{payment.dealerName}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{payment.bankName}</p>
                              <p className="text-xs text-gray-600">{payment.accountNumber}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold">₵{payment.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm">{payment.reference}</td>
                          <td className="py-3 px-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="py-3 px-4">
                            {payment.status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(payment.id)}
                              >
                                Approve
                              </Button>
                            )}
                            {payment.status === 'CONFIRMED' && (
                              <Button size="sm" variant="outline">View Receipt</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="flex flex-col items-center p-6 h-auto" onClick={() => setShowBatchModal(true)}>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Create Batch</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Process Payments</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Report</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Settlement Details Modal */}
      <Modal
        isOpen={showSettlementModal}
        onClose={() => {
          setShowSettlementModal(false);
          setSelectedSettlement(null);
        }}
        title={selectedSettlement ? 'Settlement Details' : 'New Settlement'}
        size="large"
      >
        <div className="space-y-4">
          {selectedSettlement ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Settlement ID</label>
                <p className="font-medium">{selectedSettlement.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dealer</label>
                <p className="font-semibold">{selectedSettlement.dealerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Period</label>
                <p>{new Date(selectedSettlement.periodStart).toLocaleDateString()} - {new Date(selectedSettlement.periodEnd).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                {getStatusBadge(selectedSettlement.status)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gross Sales</label>
                <p className="text-lg font-bold">₵{selectedSettlement.grossSales.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Commission</label>
                <p className="text-lg font-bold text-green-600">₵{selectedSettlement.commission.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discounts</label>
                <p className="text-lg text-red-600">-₵{selectedSettlement.discounts.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adjustments</label>
                <p className={`text-lg ${selectedSettlement.adjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedSettlement.adjustments >= 0 ? '+' : ''}₵{selectedSettlement.adjustments.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Net Amount</label>
                <p className="text-2xl font-bold text-blue-600">₵{selectedSettlement.netAmount.toLocaleString()}</p>
              </div>
              
              <div className="col-span-2 mt-4">
                <h4 className="font-semibold mb-2">Fuel Type Breakdown</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-sm font-medium">Petrol</p>
                    <p className="text-lg font-bold">{selectedSettlement.fuelTypes.petrol.volume.toLocaleString()}L</p>
                    <p className="text-sm">₵{selectedSettlement.fuelTypes.petrol.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    <p className="text-sm font-medium">Diesel</p>
                    <p className="text-lg font-bold">{selectedSettlement.fuelTypes.diesel.volume.toLocaleString()}L</p>
                    <p className="text-sm">₵{selectedSettlement.fuelTypes.diesel.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    <p className="text-sm font-medium">Kerosene</p>
                    <p className="text-lg font-bold">{selectedSettlement.fuelTypes.kerosene.volume.toLocaleString()}L</p>
                    <p className="text-sm">₵{selectedSettlement.fuelTypes.kerosene.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Select Dealer"
                options={[
                  { value: 'DLR-001', label: 'Accra Central Fuel Station' },
                  { value: 'DLR-002', label: 'Kumasi North Petroleum' }
                ]}
              />
              <Input label="Period Start" type="date" />
              <Input label="Period End" type="date" />
              <Input label="Gross Sales" type="number" placeholder="1000000" />
              <Input label="Commission Rate %" type="number" step="0.1" placeholder="5.0" />
              <Input label="Discounts" type="number" placeholder="5000" />
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSettlementModal(false);
                setSelectedSettlement(null);
              }}
            >
              {selectedSettlement ? 'Close' : 'Cancel'}
            </Button>
            {!selectedSettlement && (
              <Button onClick={() => {
                toast.success('Settlement created successfully');
                setShowSettlementModal(false);
                loadSettlementData();
              }}>
                Create Settlement
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Batch Creation Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="Create Settlement Batch"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Batch Name" placeholder="January 2025 Bi-Weekly Settlement" />
            <Select
              label="Settlement Period"
              options={[
                { value: 'current_month', label: 'Current Month' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'custom', label: 'Custom Period' }
              ]}
            />
            <Input label="Period Start" type="date" />
            <Input label="Period End" type="date" />
            <Select
              label="Include Dealers"
              options={[
                { value: 'all_active', label: 'All Active Dealers' },
                { value: 'specific', label: 'Specific Dealers' },
                { value: 'region', label: 'By Region' }
              ]}
            />
            <Select
              label="Commission Type"
              options={[
                { value: 'standard', label: 'Standard Commission' },
                { value: 'tiered', label: 'Tiered Commission' },
                { value: 'custom', label: 'Custom Rates' }
              ]}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowBatchModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBatch}>
              Create Batch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Generate Payment Instructions"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Settlement Batch"
              options={[
                { value: 'BATCH-001', label: 'January 2025 Bi-Weekly Settlement' },
                { value: 'BATCH-002', label: 'December 2024 Monthly Settlement' }
              ]}
            />
            <Select
              label="Payment Method"
              options={[
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'mobile_money', label: 'Mobile Money' }
              ]}
            />
            <Input label="Payment Date" type="date" />
            <Input label="Reference Prefix" placeholder="SETTLE-2025-" />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Settlements</p>
                <p className="font-bold">42</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-bold">₵2,150,000</p>
              </div>
              <div>
                <p className="text-gray-600">Processing Fee</p>
                <p className="font-bold">₵1,075</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Payment instructions generated successfully');
              setShowPaymentModal(false);
              loadSettlementData();
            }}>
              Generate Payments
            </Button>
          </div>
        </div>
      </Modal>
    </FuturisticDashboardLayout>
  );
};

export default DealerSettlements;