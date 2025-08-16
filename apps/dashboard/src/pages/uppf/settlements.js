"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const Table_1 = require("@/components/ui/Table");
const Modal_1 = require("@/components/ui/Modal");
const UPPFSettlements = () => {
    const [settlements] = (0, react_1.useState)([
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
    const [settlementTransactions] = (0, react_1.useState)([
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
    const [selectedSettlement, setSelectedSettlement] = (0, react_1.useState)(null);
    const [showSettlementModal, setShowSettlementModal] = (0, react_1.useState)(false);
    const [showTransactionsModal, setShowTransactionsModal] = (0, react_1.useState)(false);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [methodFilter, setMethodFilter] = (0, react_1.useState)('all');
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const filteredSettlements = (0, react_1.useMemo)(() => {
        return settlements.filter(settlement => {
            const matchesSearch = settlement.settlementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                settlement.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                settlement.processedBy.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter;
            const matchesMethod = methodFilter === 'all' || settlement.paymentMethod === methodFilter;
            return matchesSearch && matchesStatus && matchesMethod;
        });
    }, [settlements, searchTerm, statusFilter, methodFilter]);
    const getStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
            processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
            completed: 'text-green-400 bg-green-400/10 border-green-400/30',
            failed: 'text-red-400 bg-red-400/10 border-red-400/30',
            partial: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
            paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
        };
        return colors[status] || colors.pending;
    };
    const getStatusText = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    const getPaymentMethodText = (method) => {
        const methods = {
            bank_transfer: 'Bank Transfer',
            cheque: 'Cheque',
            electronic_funds: 'Electronic Funds Transfer'
        };
        return methods[method] || method;
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
        amounts: (<div className="text-sm">
        <div>Approved: ₵{settlement.approvedAmount.toLocaleString()}</div>
        <div>Paid: ₵{settlement.paidAmount.toLocaleString()}</div>
        {settlement.outstandingAmount > 0 && (<div className="text-orange-400">Outstanding: ₵{settlement.outstandingAmount.toLocaleString()}</div>)}
      </div>),
        paymentMethod: getPaymentMethodText(settlement.paymentMethod),
        status: (<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(settlement.status)}`}>
        {getStatusText(settlement.status)}
      </span>),
        beneficiaries: settlement.beneficiaries,
        processedBy: settlement.processedBy,
        actions: (<div className="flex space-x-2">
        <Button_1.Button variant="outline" size="sm" onClick={() => {
                setSelectedSettlement(settlement);
                setShowSettlementModal(true);
            }}>
          View
        </Button_1.Button>
        <Button_1.Button variant="outline" size="sm" onClick={() => {
                setSelectedSettlement(settlement);
                setShowTransactionsModal(true);
            }}>
          Transactions
        </Button_1.Button>
        {settlement.status === 'pending' && (<Button_1.Button variant="primary" size="sm">
            Process
          </Button_1.Button>)}
      </div>)
    }));
    const totalApprovedAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.approvedAmount, 0);
    const totalPaidAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.paidAmount, 0);
    const totalOutstandingAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.outstandingAmount, 0);
    const totalBeneficiaries = filteredSettlements.reduce((sum, settlement) => sum + settlement.beneficiaries, 0);
    const getSettlementTransactions = (settlementId) => {
        return settlementTransactions.filter(txn => txn.settlementId === settlementId);
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              UPPF Settlements
            </h1>
            <p className="text-dark-400 mt-2">
              Manage settlement payments for approved UPPF claims
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button_1.Button variant="outline">
              Export Settlements
            </Button_1.Button>
            <Button_1.Button variant="outline">
              Payment Report
            </Button_1.Button>
            <Button_1.Button variant="primary">
              New Settlement
            </Button_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Approved</p>
                  <p className="text-2xl font-bold text-white">₵{totalApprovedAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-white">₵{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-white">₵{totalOutstandingAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Beneficiaries</p>
                  <p className="text-2xl font-bold text-white">{totalBeneficiaries}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Filters and Search */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card_1.Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input_1.Input placeholder="Search settlements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full"/>
              </div>
              <div>
                <Select_1.Select options={statusOptions} value={statusFilter} onChange={(value) => setStatusFilter(value)} placeholder="Filter by status"/>
              </div>
              <div>
                <Select_1.Select options={methodOptions} value={methodFilter} onChange={(value) => setMethodFilter(value)} placeholder="Filter by method"/>
              </div>
              <div className="md:col-span-2">
                <Button_1.Button variant="outline" className="w-full">
                  Clear Filters
                </Button_1.Button>
              </div>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Settlements Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card_1.Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Settlements</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-dark-400">
                  Showing {filteredSettlements.length} of {settlements.length} settlements
                </span>
                <Button_1.Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export
                </Button_1.Button>
              </div>
            </div>
            
            <Table_1.Table columns={tableColumns} data={tableData} className="w-full"/>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Settlement Detail Modal */}
        <Modal_1.Modal isOpen={showSettlementModal} onClose={() => setShowSettlementModal(false)} title="Settlement Details">
          {selectedSettlement && (<div className="space-y-6">
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
                  {selectedSettlement.authorizedBy && (<div>
                      <label className="text-sm font-medium text-dark-400">Authorized By</label>
                      <p className="text-white">{selectedSettlement.authorizedBy}</p>
                    </div>)}
                  {selectedSettlement.paymentDate && (<div>
                      <label className="text-sm font-medium text-dark-400">Payment Date</label>
                      <p className="text-white">{selectedSettlement.paymentDate}</p>
                    </div>)}
                </div>
              </div>

              {selectedSettlement.bankReference && (<div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Bank Reference</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedSettlement.bankReference}
                  </p>
                </div>)}

              {selectedSettlement.notes && (<div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Notes</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedSettlement.notes}
                  </p>
                </div>)}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button_1.Button variant="outline" onClick={() => setShowSettlementModal(false)}>
                  Close
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  View Transactions
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  Export Report
                </Button_1.Button>
                {selectedSettlement.status === 'pending' && (<Button_1.Button variant="primary">
                    Process Settlement
                  </Button_1.Button>)}
              </div>
            </div>)}
        </Modal_1.Modal>

        {/* Transactions Modal */}
        <Modal_1.Modal isOpen={showTransactionsModal} onClose={() => setShowTransactionsModal(false)} title="Settlement Transactions">
          {selectedSettlement && (<div className="space-y-6">
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
                {getSettlementTransactions(selectedSettlement.id).map((transaction) => (<div key={transaction.id} className="p-4 bg-dark-900/50 rounded-lg border border-white/10">
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
                      {transaction.paymentReference && (<div>
                          <label className="text-dark-400">Payment Reference</label>
                          <p className="text-white">{transaction.paymentReference}</p>
                        </div>)}
                      {transaction.paymentDate && (<div>
                          <label className="text-dark-400">Payment Date</label>
                          <p className="text-white">{transaction.paymentDate}</p>
                        </div>)}
                      {transaction.failureReason && (<div>
                          <label className="text-dark-400">Failure Reason</label>
                          <p className="text-red-400">{transaction.failureReason}</p>
                        </div>)}
                    </div>
                  </div>))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button_1.Button variant="outline" onClick={() => setShowTransactionsModal(false)}>
                  Close
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  Export Transactions
                </Button_1.Button>
              </div>
            </div>)}
        </Modal_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = UPPFSettlements;
//# sourceMappingURL=settlements.js.map