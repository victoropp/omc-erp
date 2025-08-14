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

interface ReconciliationRecord {
  id: string;
  batchNumber: string;
  periodStart: string;
  periodEnd: string;
  claimsSubmitted: number;
  claimsApproved: number;
  totalClaimedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'disputed';
  reconciliationDate: string;
  reconciler: string;
  npaReference?: string;
  discrepancies: number;
  notes?: string;
}

interface ReconciliationDiscrepancy {
  id: string;
  claimId: string;
  claimNumber: string;
  type: 'amount_mismatch' | 'missing_document' | 'rate_variance' | 'calculation_error';
  description: string;
  expectedAmount: number;
  actualAmount: number;
  variance: number;
  status: 'open' | 'resolved' | 'pending_review';
  createdDate: string;
  resolvedDate?: string;
}

const UPPFReconciliation: NextPage = () => {
  const [reconciliationRecords] = useState<ReconciliationRecord[]>([
    {
      id: '1',
      batchNumber: 'REC-2025-001',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-07',
      claimsSubmitted: 45,
      claimsApproved: 42,
      totalClaimedAmount: 1250000,
      approvedAmount: 1180000,
      paidAmount: 1150000,
      outstandingAmount: 30000,
      status: 'completed',
      reconciliationDate: '2025-01-08',
      reconciler: 'John Doe',
      npaReference: 'NPA-REF-2025-001',
      discrepancies: 3,
      notes: 'Weekly reconciliation completed with minor discrepancies'
    },
    {
      id: '2',
      batchNumber: 'REC-2025-002',
      periodStart: '2025-01-08',
      periodEnd: '2025-01-14',
      claimsSubmitted: 52,
      claimsApproved: 48,
      totalClaimedAmount: 1420000,
      approvedAmount: 1350000,
      paidAmount: 0,
      outstandingAmount: 1350000,
      status: 'in_progress',
      reconciliationDate: '2025-01-15',
      reconciler: 'Jane Smith',
      discrepancies: 4,
      notes: 'Ongoing reconciliation - payment pending'
    },
    {
      id: '3',
      batchNumber: 'REC-2025-003',
      periodStart: '2025-01-15',
      periodEnd: '2025-01-21',
      claimsSubmitted: 38,
      claimsApproved: 36,
      totalClaimedAmount: 985000,
      approvedAmount: 920000,
      paidAmount: 0,
      outstandingAmount: 920000,
      status: 'disputed',
      reconciliationDate: '2025-01-22',
      reconciler: 'Michael Johnson',
      discrepancies: 8,
      notes: 'Multiple rate variances identified - under review'
    }
  ]);

  const [discrepancies] = useState<ReconciliationDiscrepancy[]>([
    {
      id: '1',
      claimId: '1',
      claimNumber: 'UPPF-2025-001234',
      type: 'amount_mismatch',
      description: 'UPPF amount calculation differs from submitted amount',
      expectedAmount: 125000,
      actualAmount: 122500,
      variance: -2500,
      status: 'resolved',
      createdDate: '2025-01-08',
      resolvedDate: '2025-01-08'
    },
    {
      id: '2',
      claimId: '2',
      claimNumber: 'UPPF-2025-001235',
      type: 'rate_variance',
      description: 'UPPF rate applied differs from official rate',
      expectedAmount: 62500,
      actualAmount: 65000,
      variance: 2500,
      status: 'open',
      createdDate: '2025-01-15'
    },
    {
      id: '3',
      claimId: '3',
      claimNumber: 'UPPF-2025-001236',
      type: 'missing_document',
      description: 'GPS tracking log missing from claim documentation',
      expectedAmount: 110000,
      actualAmount: 110000,
      variance: 0,
      status: 'pending_review',
      createdDate: '2025-01-20'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<ReconciliationDiscrepancy | null>(null);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'discrepancies'>('records');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    return reconciliationRecords.filter(record => {
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesPeriod = periodFilter === 'all' || record.periodStart.includes(periodFilter);
      return matchesStatus && matchesPeriod;
    });
  }, [reconciliationRecords, statusFilter, periodFilter]);

  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter(discrepancy => {
      return statusFilter === 'all' || discrepancy.status === statusFilter;
    });
  }, [discrepancies, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      completed: 'text-green-400 bg-green-400/10 border-green-400/30',
      disputed: 'text-red-400 bg-red-400/10 border-red-400/30',
      open: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
      resolved: 'text-green-400 bg-green-400/10 border-green-400/30',
      pending_review: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDiscrepancyTypeColor = (type: string) => {
    const colors = {
      amount_mismatch: 'text-red-400 bg-red-400/10',
      missing_document: 'text-yellow-400 bg-yellow-400/10',
      rate_variance: 'text-orange-400 bg-orange-400/10',
      calculation_error: 'text-purple-400 bg-purple-400/10'
    };
    return colors[type as keyof typeof colors] || colors.amount_mismatch;
  };

  const getDiscrepancyTypeText = (type: string) => {
    const texts = {
      amount_mismatch: 'Amount Mismatch',
      missing_document: 'Missing Document',
      rate_variance: 'Rate Variance',
      calculation_error: 'Calculation Error'
    };
    return texts[type as keyof typeof texts] || type;
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'disputed', label: 'Disputed' }
  ];

  const discrepancyStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'pending_review', label: 'Pending Review' }
  ];

  const periodOptions = [
    { value: 'all', label: 'All Periods' },
    { value: '2025-01', label: 'January 2025' },
    { value: '2024-12', label: 'December 2024' },
    { value: '2024-11', label: 'November 2024' }
  ];

  const reconciliationTableColumns = [
    { key: 'batchNumber', label: 'Batch Number' },
    { key: 'period', label: 'Period' },
    { key: 'claims', label: 'Claims' },
    { key: 'amounts', label: 'Amounts (₵)' },
    { key: 'discrepancies', label: 'Discrepancies' },
    { key: 'status', label: 'Status' },
    { key: 'reconciler', label: 'Reconciler' },
    { key: 'actions', label: 'Actions' }
  ];

  const reconciliationTableData = filteredRecords.map(record => ({
    batchNumber: record.batchNumber,
    period: `${record.periodStart} to ${record.periodEnd}`,
    claims: `${record.claimsApproved}/${record.claimsSubmitted}`,
    amounts: (
      <div className="text-sm">
        <div>Claimed: ₵{record.totalClaimedAmount.toLocaleString()}</div>
        <div>Approved: ₵{record.approvedAmount.toLocaleString()}</div>
        <div>Paid: ₵{record.paidAmount.toLocaleString()}</div>
      </div>
    ),
    discrepancies: record.discrepancies,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
        {getStatusText(record.status)}
      </span>
    ),
    reconciler: record.reconciler,
    actions: (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setSelectedRecord(record);
            setShowRecordModal(true);
          }}
        >
          View
        </Button>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </div>
    )
  }));

  const discrepancyTableColumns = [
    { key: 'claimNumber', label: 'Claim Number' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'amounts', label: 'Expected/Actual' },
    { key: 'variance', label: 'Variance (₵)' },
    { key: 'status', label: 'Status' },
    { key: 'createdDate', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const discrepancyTableData = filteredDiscrepancies.map(discrepancy => ({
    claimNumber: discrepancy.claimNumber,
    type: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getDiscrepancyTypeColor(discrepancy.type)}`}>
        {getDiscrepancyTypeText(discrepancy.type)}
      </span>
    ),
    description: discrepancy.description,
    amounts: (
      <div className="text-sm">
        <div>Expected: ₵{discrepancy.expectedAmount.toLocaleString()}</div>
        <div>Actual: ₵{discrepancy.actualAmount.toLocaleString()}</div>
      </div>
    ),
    variance: (
      <span className={`font-medium ${discrepancy.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {discrepancy.variance >= 0 ? '+' : ''}₵{discrepancy.variance.toLocaleString()}
      </span>
    ),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(discrepancy.status)}`}>
        {getStatusText(discrepancy.status)}
      </span>
    ),
    createdDate: discrepancy.createdDate,
    actions: (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setSelectedDiscrepancy(discrepancy);
            setShowDiscrepancyModal(true);
          }}
        >
          View
        </Button>
        {discrepancy.status === 'open' && (
          <Button variant="outline" size="sm">
            Resolve
          </Button>
        )}
      </div>
    )
  }));

  const totalClaimedAmount = filteredRecords.reduce((sum, record) => sum + record.totalClaimedAmount, 0);
  const totalApprovedAmount = filteredRecords.reduce((sum, record) => sum + record.approvedAmount, 0);
  const totalPaidAmount = filteredRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const totalOutstandingAmount = filteredRecords.reduce((sum, record) => sum + record.outstandingAmount, 0);

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
              UPPF Reconciliation
            </h1>
            <p className="text-dark-400 mt-2">
              Reconcile UPPF claims with payments and identify discrepancies
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Generate Report
            </Button>
            <Button variant="outline">
              Export Data
            </Button>
            <Button variant="primary">
              New Reconciliation
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Claimed</p>
                  <p className="text-2xl font-bold text-white">₵{totalClaimedAmount.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Approved Amount</p>
                  <p className="text-2xl font-bold text-white">₵{totalApprovedAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold text-white">₵{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex space-x-1 bg-dark-800/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'records' 
                  ? 'bg-gradient-primary text-white shadow-glow-primary' 
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Reconciliation Records
            </button>
            <button
              onClick={() => setActiveTab('discrepancies')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'discrepancies' 
                  ? 'bg-gradient-primary text-white shadow-glow-primary' 
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Discrepancies ({discrepancies.filter(d => d.status === 'open').length})
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select
                  options={activeTab === 'records' ? statusOptions : discrepancyStatusOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  placeholder="Filter by status"
                />
              </div>
              {activeTab === 'records' && (
                <div>
                  <Select
                    options={periodOptions}
                    value={periodFilter}
                    onChange={(value) => setPeriodFilter(value)}
                    placeholder="Filter by period"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Button variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Table Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {activeTab === 'records' ? 'Reconciliation Records' : 'Discrepancies'}
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-dark-400">
                    Showing {activeTab === 'records' ? filteredRecords.length : filteredDiscrepancies.length} items
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
                columns={activeTab === 'records' ? reconciliationTableColumns : discrepancyTableColumns}
                data={activeTab === 'records' ? reconciliationTableData : discrepancyTableData}
                className="w-full"
              />
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Reconciliation Record Modal */}
        <Modal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          title="Reconciliation Details"
        >
          {selectedRecord && (
            <div className="space-y-6">
              {/* Record Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRecord.batchNumber}</h3>
                  <p className="text-dark-400">{selectedRecord.periodStart} to {selectedRecord.periodEnd}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRecord.status)}`}>
                  {getStatusText(selectedRecord.status)}
                </span>
              </div>

              {/* Record Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Claims Submitted</label>
                    <p className="text-white">{selectedRecord.claimsSubmitted}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Claims Approved</label>
                    <p className="text-white">{selectedRecord.claimsApproved}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Total Claimed Amount</label>
                    <p className="text-white">₵{selectedRecord.totalClaimedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Approved Amount</label>
                    <p className="text-white">₵{selectedRecord.approvedAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Paid Amount</label>
                    <p className="text-white">₵{selectedRecord.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Outstanding Amount</label>
                    <p className="text-white">₵{selectedRecord.outstandingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Discrepancies</label>
                    <p className="text-white">{selectedRecord.discrepancies}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Reconciler</label>
                    <p className="text-white">{selectedRecord.reconciler}</p>
                  </div>
                </div>
              </div>

              {selectedRecord.npaReference && (
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">NPA Reference</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedRecord.npaReference}
                  </p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Notes</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowRecordModal(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  Export Report
                </Button>
                {selectedRecord.status === 'in_progress' && (
                  <Button variant="primary">
                    Complete Reconciliation
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Discrepancy Modal */}
        <Modal
          isOpen={showDiscrepancyModal}
          onClose={() => setShowDiscrepancyModal(false)}
          title="Discrepancy Details"
        >
          {selectedDiscrepancy && (
            <div className="space-y-6">
              {/* Discrepancy Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDiscrepancy.claimNumber}</h3>
                  <p className="text-dark-400">{getDiscrepancyTypeText(selectedDiscrepancy.type)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDiscrepancy.status)}`}>
                  {getStatusText(selectedDiscrepancy.status)}
                </span>
              </div>

              {/* Discrepancy Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Description</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedDiscrepancy.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Expected Amount</label>
                    <p className="text-white">₵{selectedDiscrepancy.expectedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Actual Amount</label>
                    <p className="text-white">₵{selectedDiscrepancy.actualAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-dark-400">Variance</label>
                  <p className={`text-lg font-bold ${selectedDiscrepancy.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedDiscrepancy.variance >= 0 ? '+' : ''}₵{selectedDiscrepancy.variance.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Created Date</label>
                    <p className="text-white">{selectedDiscrepancy.createdDate}</p>
                  </div>
                  {selectedDiscrepancy.resolvedDate && (
                    <div>
                      <label className="text-sm font-medium text-dark-400">Resolved Date</label>
                      <p className="text-white">{selectedDiscrepancy.resolvedDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowDiscrepancyModal(false)}>
                  Close
                </Button>
                {selectedDiscrepancy.status === 'open' && (
                  <>
                    <Button variant="outline" className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10">
                      Request Review
                    </Button>
                    <Button variant="primary">
                      Mark as Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default UPPFReconciliation;