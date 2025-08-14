import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';

interface Settlement {
  id: string;
  settlementNumber: string;
  batchNumber: string;
  periodStart: string;
  periodEnd: string;
  totalClaims: number;
  approvedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentDate?: string;
  paymentMethod: 'bank_transfer' | 'cheque' | 'electronic_funds';
  bankReference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  processedBy: string;
  authorizedBy?: string;
  settledDate?: string;
  beneficiaries: number;
  notes?: string;
}

interface SettlementTransaction {
  id: string;
  settlementId: string;
  claimNumber: string;
  dealer: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  paymentDate?: string;
  failureReason?: string;
}

const UPPFSettlements: NextPage = () => {
  const [settlements] = useState<Settlement[]>([
    {
      id: '1',
      settlementNumber: 'SET-2025-001',
      batchNumber: 'REC-2025-001',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-07',
      totalClaims: 42,
      approvedAmount: 1180000,
      paidAmount: 1150000,
      outstandingAmount: 30000,
      paymentDate: '2025-01-10',
      paymentMethod: 'bank_transfer',
      bankReference: 'TXN-20250110-001',
      status: 'partial',
      processedBy: 'Sarah Johnson',
      authorizedBy: 'Michael Brown',
      settledDate: '2025-01-10',
      beneficiaries: 8,
      notes: 'Partial settlement - 3 claims pending documentation'
    },
    {
      id: '2',
      settlementNumber: 'SET-2025-002',
      batchNumber: 'REC-2025-002',
      periodStart: '2025-01-08',
      periodEnd: '2025-01-14',
      totalClaims: 48,
      approvedAmount: 1350000,
      paidAmount: 1350000,
      outstandingAmount: 0,
      paymentDate: '2025-01-17',
      paymentMethod: 'electronic_funds',
      bankReference: 'EFT-20250117-002',
      status: 'completed',
      processedBy: 'David Wilson',
      authorizedBy: 'Michael Brown',
      settledDate: '2025-01-17',
      beneficiaries: 12,
      notes: 'Full settlement completed successfully'
    },
    {
      id: '3',
      settlementNumber: 'SET-2025-003',
      batchNumber: 'REC-2025-003',
      periodStart: '2025-01-15',
      periodEnd: '2025-01-21',
      totalClaims: 36,
      approvedAmount: 920000,
      paidAmount: 0,
      outstandingAmount: 920000,
      paymentMethod: 'bank_transfer',
      status: 'processing',
      processedBy: 'Emily Davis',
      beneficiaries: 9,
      notes: 'Pending final authorization'
    },
    {
      id: '4',
      settlementNumber: 'SET-2025-004',
      batchNumber: 'REC-2025-004',
      periodStart: '2025-01-22',
      periodEnd: '2025-01-28',
      totalClaims: 55,
      approvedAmount: 1420000,
      paidAmount: 0,
      outstandingAmount: 1420000,
      paymentMethod: 'electronic_funds',
      status: 'pending',
      processedBy: 'Robert Martinez',
      beneficiaries: 14,
      notes: 'Awaiting reconciliation completion'
    }
  ]);

  const [settlementTransactions] = useState<SettlementTransaction[]>([
    {
      id: '1',
      settlementId: '1',
      claimNumber: 'UPPF-2025-001234',
      dealer: 'Golden Star Petroleum',
      amount: 125000,
      status: 'paid',
      paymentReference: 'PAY-001234',
      paymentDate: '2025-01-10'
    },
    {
      id: '2',
      settlementId: '1',
      claimNumber: 'UPPF-2025-001235',
      dealer: 'Allied Oil Company',
      amount: 62500,
      status: 'paid',
      paymentReference: 'PAY-001235',
      paymentDate: '2025-01-10'
    },
    {
      id: '3',
      settlementId: '1',
      claimNumber: 'UPPF-2025-001236',
      dealer: 'Star Oil Ltd',
      amount: 110000,
      status: 'pending',
      failureReason: 'Missing bank details'
    },
    {
      id: '4',
      settlementId: '2',
      claimNumber: 'UPPF-2025-001237',
      dealer: 'Total Ghana',
      amount: 125000,
      status: 'paid',
      paymentReference: 'PAY-001237',
      paymentDate: '2025-01-17'
    }
  ]);

  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSettlements = useMemo(() => {
    return settlements.filter(settlement => {
      const matchesSearch = settlement.settlementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          settlement.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          settlement.processedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || settlement.paymentMethod === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [settlements, searchTerm, statusFilter, methodFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      completed: 'text-green-400 bg-green-400/10 border-green-400/30',
      failed: 'text-red-400 bg-red-400/10 border-red-400/30',
      partial: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
      paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      electronic_funds: 'Electronic Funds Transfer'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' }
  ];

  const methodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'electronic_funds', label: 'Electronic Funds' }
  ];

  const tableColumns = [
    { key: 'settlementNumber', label: 'Settlement Number' },
    { key: 'batchNumber', label: 'Batch' },
    { key: 'period', label: 'Period' },
    { key: 'amounts', label: 'Amounts (₵)' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Status' },
    { key: 'beneficiaries', label: 'Beneficiaries' },
    { key: 'processedBy', label: 'Processed By' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = filteredSettlements.map(settlement => ({
    settlementNumber: settlement.settlementNumber,
    batchNumber: settlement.batchNumber,
    period: `${settlement.periodStart} to ${settlement.periodEnd}`,
    amounts: (
      <div className="text-sm">
        <div>Approved: ₵{settlement.approvedAmount.toLocaleString()}</div>
        <div>Paid: ₵{settlement.paidAmount.toLocaleString()}</div>
        {settlement.outstandingAmount > 0 && (
          <div className="text-orange-400">Outstanding: ₵{settlement.outstandingAmount.toLocaleString()}</div>
        )}
      </div>
    ),
    paymentMethod: getPaymentMethodText(settlement.paymentMethod),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(settlement.status)}`}>
        {getStatusText(settlement.status)}
      </span>
    ),
    beneficiaries: settlement.beneficiaries,
    processedBy: settlement.processedBy,
    actions: (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setSelectedSettlement(settlement);
            setShowSettlementModal(true);
          }}
        >
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setSelectedSettlement(settlement);
            setShowTransactionsModal(true);
          }}
        >
          Transactions
        </Button>
        {settlement.status === 'pending' && (
          <Button variant="primary" size="sm">
            Process
          </Button>
        )}
      </div>
    )
  }));

  const totalApprovedAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.approvedAmount, 0);
  const totalPaidAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.paidAmount, 0);
  const totalOutstandingAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.outstandingAmount, 0);
  const totalBeneficiaries = filteredSettlements.reduce((sum, settlement) => sum + settlement.beneficiaries, 0);

  const getSettlementTransactions = (settlementId: string) => {
    return settlementTransactions.filter(txn => txn.settlementId === settlementId);
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              UPPF Settlements
            </h1>
            <p className="text-dark-400 mt-2">
              Manage settlement payments for approved UPPF claims
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Export Settlements
            </Button>
            <Button variant="outline">
              Payment Report
            </Button>
            <Button variant="primary">
              New Settlement
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Approved</p>
                  <p className="text-2xl font-bold text-white">₵{totalApprovedAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-white">₵{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-white">₵{totalOutstandingAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Beneficiaries</p>
                  <p className="text-2xl font-bold text-white">{totalBeneficiaries}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Search settlements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  placeholder="Filter by status"
                />
              </div>
              <div>
                <Select
                  options={methodOptions}
                  value={methodFilter}
                  onChange={(value) => setMethodFilter(value)}
                  placeholder="Filter by method"
                />
              </div>
              <div className="md:col-span-2">
                <Button variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Settlements Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Settlements</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-dark-400">
                  Showing {filteredSettlements.length} of {settlements.length} settlements
                </span>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </Button>
              </div>
            </div>
            
            <Table
              columns={tableColumns}
              data={tableData}
              className="w-full"
            />
          </Card>
        </motion.div>

        {/* Settlement Detail Modal */}
        <Modal
          isOpen={showSettlementModal}
          onClose={() => setShowSettlementModal(false)}
          title="Settlement Details"
        >
          {selectedSettlement && (
            <div className="space-y-6">
              {/* Settlement Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSettlement.settlementNumber}</h3>
                  <p className="text-dark-400">{selectedSettlement.batchNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSettlement.status)}`}>
                  {getStatusText(selectedSettlement.status)}
                </span>
              </div>

              {/* Settlement Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Period</label>
                    <p className="text-white">{selectedSettlement.periodStart} to {selectedSettlement.periodEnd}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Total Claims</label>
                    <p className="text-white">{selectedSettlement.totalClaims}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Approved Amount</label>
                    <p className="text-white">₵{selectedSettlement.approvedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Paid Amount</label>
                    <p className="text-white">₵{selectedSettlement.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Outstanding Amount</label>
                    <p className="text-white">₵{selectedSettlement.outstandingAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Payment Method</label>
                    <p className="text-white">{getPaymentMethodText(selectedSettlement.paymentMethod)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Beneficiaries</label>
                    <p className="text-white">{selectedSettlement.beneficiaries}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Processed By</label>
                    <p className="text-white">{selectedSettlement.processedBy}</p>
                  </div>
                  {selectedSettlement.authorizedBy && (
                    <div>
                      <label className="text-sm font-medium text-dark-400">Authorized By</label>
                      <p className="text-white">{selectedSettlement.authorizedBy}</p>
                    </div>
                  )}
                  {selectedSettlement.paymentDate && (
                    <div>
                      <label className="text-sm font-medium text-dark-400">Payment Date</label>
                      <p className="text-white">{selectedSettlement.paymentDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedSettlement.bankReference && (
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Bank Reference</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedSettlement.bankReference}
                  </p>
                </div>
              )}

              {selectedSettlement.notes && (
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Notes</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedSettlement.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowSettlementModal(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  View Transactions
                </Button>
                <Button variant="outline">
                  Export Report
                </Button>
                {selectedSettlement.status === 'pending' && (
                  <Button variant="primary">
                    Process Settlement
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Transactions Modal */}
        <Modal
          isOpen={showTransactionsModal}
          onClose={() => setShowTransactionsModal(false)}
          title="Settlement Transactions"
        >
          {selectedSettlement && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSettlement.settlementNumber}</h3>
                  <p className="text-dark-400">Settlement Transactions</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSettlement.status)}`}>
                  {getStatusText(selectedSettlement.status)}
                </span>
              </div>

              <div className="space-y-4">
                {getSettlementTransactions(selectedSettlement.id).map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-dark-900/50 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{transaction.claimNumber}</h4>
                        <p className="text-dark-400">{transaction.dealer}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-dark-400">Amount</label>
                        <p className="text-white font-medium">₵{transaction.amount.toLocaleString()}</p>
                      </div>
                      {transaction.paymentReference && (
                        <div>
                          <label className="text-dark-400">Payment Reference</label>
                          <p className="text-white">{transaction.paymentReference}</p>
                        </div>
                      )}
                      {transaction.paymentDate && (
                        <div>
                          <label className="text-dark-400">Payment Date</label>
                          <p className="text-white">{transaction.paymentDate}</p>
                        </div>
                      )}
                      {transaction.failureReason && (
                        <div>
                          <label className="text-dark-400">Failure Reason</label>
                          <p className="text-red-400">{transaction.failureReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowTransactionsModal(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  Export Transactions
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default UPPFSettlements;