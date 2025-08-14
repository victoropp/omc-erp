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

interface UPPFClaim {
  id: string;
  claimNumber: string;
  route: string;
  dealer: string;
  station: string;
  fuelType: 'PMS' | 'AGO' | 'LPG' | 'KERO';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  uppfRate: number;
  uppfAmount: number;
  status: 'draft' | 'submitted' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';
  submittedDate: string;
  approvedDate?: string;
  paidDate?: string;
  region: string;
  vehicleNumber: string;
  driverName: string;
  documents: string[];
  notes?: string;
}

const UPPFClaimsManagement: NextPage = () => {
  const [claims] = useState<UPPFClaim[]>([
    {
      id: '1',
      claimNumber: 'UPPF-2025-001234',
      route: 'TEMA-KUMASI-001',
      dealer: 'Golden Star Petroleum',
      station: 'Achimota Shell',
      fuelType: 'PMS',
      quantity: 15000,
      unitPrice: 14.85,
      totalAmount: 222750.00,
      uppfRate: 8.333,
      uppfAmount: 125000.00,
      status: 'pending',
      submittedDate: '2025-01-13',
      region: 'Greater Accra',
      vehicleNumber: 'GE-4578-22',
      driverName: 'Kwame Asante',
      documents: ['delivery_note.pdf', 'waybill.pdf', 'gps_log.pdf'],
      notes: 'Standard delivery to Kumasi region'
    },
    {
      id: '2',
      claimNumber: 'UPPF-2025-001233',
      route: 'ACCRA-TAMALE-002',
      dealer: 'Allied Oil Company',
      station: 'Tema Oil Refinery',
      fuelType: 'AGO',
      quantity: 12000,
      unitPrice: 15.20,
      totalAmount: 182400.00,
      uppfRate: 5.208,
      uppfAmount: 62500.00,
      status: 'approved',
      submittedDate: '2025-01-12',
      approvedDate: '2025-01-13',
      region: 'Northern Region',
      vehicleNumber: 'NR-2345-21',
      driverName: 'Abdul Rahman',
      documents: ['delivery_note.pdf', 'waybill.pdf', 'gps_log.pdf', 'approval_letter.pdf']
    },
    {
      id: '3',
      claimNumber: 'UPPF-2025-001232',
      route: 'TAKORADI-WA-001',
      dealer: 'Star Oil Ltd',
      station: 'Takoradi Main Depot',
      fuelType: 'PMS',
      quantity: 14000,
      unitPrice: 14.85,
      totalAmount: 207900.00,
      uppfRate: 7.857,
      uppfAmount: 110000.00,
      status: 'under_review',
      submittedDate: '2025-01-12',
      region: 'Upper West',
      vehicleNumber: 'UW-1234-22',
      driverName: 'Joseph Mensah',
      documents: ['delivery_note.pdf', 'waybill.pdf'],
      notes: 'Missing GPS log - requested'
    },
    {
      id: '4',
      claimNumber: 'UPPF-2025-001231',
      route: 'ACCRA-BOLGA-003',
      dealer: 'Total Ghana',
      station: 'Achimota Total',
      fuelType: 'AGO',
      quantity: 18000,
      unitPrice: 15.20,
      totalAmount: 273600.00,
      uppfRate: 6.944,
      uppfAmount: 125000.00,
      status: 'paid',
      submittedDate: '2025-01-10',
      approvedDate: '2025-01-11',
      paidDate: '2025-01-12',
      region: 'Upper East',
      vehicleNumber: 'UE-5678-21',
      driverName: 'Isaac Dawuda',
      documents: ['delivery_note.pdf', 'waybill.pdf', 'gps_log.pdf', 'approval_letter.pdf', 'payment_voucher.pdf']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<UPPFClaim | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.dealer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesRegion = regionFilter === 'all' || claim.region === regionFilter;
      const matchesFuelType = fuelTypeFilter === 'all' || claim.fuelType === fuelTypeFilter;
      
      return matchesSearch && matchesStatus && matchesRegion && matchesFuelType;
    });
  }, [claims, searchTerm, statusFilter, regionFilter, fuelTypeFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
      submitted: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      under_review: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      approved: 'text-green-400 bg-green-400/10 border-green-400/30',
      rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
      paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewClaim = (claim: UPPFClaim) => {
    setSelectedClaim(claim);
    setShowClaimModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' }
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'Greater Accra', label: 'Greater Accra' },
    { value: 'Ashanti Region', label: 'Ashanti' },
    { value: 'Northern Region', label: 'Northern' },
    { value: 'Western Region', label: 'Western' },
    { value: 'Eastern Region', label: 'Eastern' },
    { value: 'Central Region', label: 'Central' },
    { value: 'Volta Region', label: 'Volta' },
    { value: 'Upper East', label: 'Upper East' },
    { value: 'Upper West', label: 'Upper West' },
    { value: 'Brong Ahafo', label: 'Brong Ahafo' }
  ];

  const fuelTypeOptions = [
    { value: 'all', label: 'All Fuel Types' },
    { value: 'PMS', label: 'Petrol (PMS)' },
    { value: 'AGO', label: 'Diesel (AGO)' },
    { value: 'LPG', label: 'Gas (LPG)' },
    { value: 'KERO', label: 'Kerosene' }
  ];

  const tableColumns = [
    { key: 'claimNumber', label: 'Claim Number' },
    { key: 'route', label: 'Route' },
    { key: 'dealer', label: 'Dealer' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'quantity', label: 'Quantity (L)' },
    { key: 'uppfAmount', label: 'UPPF Amount (₵)' },
    { key: 'status', label: 'Status' },
    { key: 'submittedDate', label: 'Submitted' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = filteredClaims.map(claim => ({
    claimNumber: claim.claimNumber,
    route: claim.route,
    dealer: claim.dealer,
    fuelType: claim.fuelType,
    quantity: claim.quantity.toLocaleString(),
    uppfAmount: `₵${claim.uppfAmount.toLocaleString()}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
        {getStatusText(claim.status)}
      </span>
    ),
    submittedDate: claim.submittedDate,
    actions: (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewClaim(claim)}
        >
          View
        </Button>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
    )
  }));

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
              UPPF Claims Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage and track Under-Recovery of Petroleum Pricing Fund claims
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Export Claims
            </Button>
            <Button variant="primary">
              New Claim
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Claims</p>
                  <p className="text-2xl font-bold text-white">{filteredClaims.length}</p>
                </div>
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Pending Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₵{filteredClaims
                      .filter(c => ['pending', 'under_review'].includes(c.status))
                      .reduce((sum, c) => sum + c.uppfAmount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-dark-400 mb-1">Approved Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₵{filteredClaims
                      .filter(c => c.status === 'approved')
                      .reduce((sum, c) => sum + c.uppfAmount, 0)
                      .toLocaleString()}
                  </p>
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
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₵{filteredClaims
                      .filter(c => c.status === 'paid')
                      .reduce((sum, c) => sum + c.uppfAmount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                  placeholder="Search claims..."
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
                  options={regionOptions}
                  value={regionFilter}
                  onChange={(value) => setRegionFilter(value)}
                  placeholder="Filter by region"
                />
              </div>
              <div>
                <Select
                  options={fuelTypeOptions}
                  value={fuelTypeFilter}
                  onChange={(value) => setFuelTypeFilter(value)}
                  placeholder="Filter by fuel type"
                />
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Claims Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Claims List</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-dark-400">
                  Showing {filteredClaims.length} of {claims.length} claims
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

        {/* Claim Detail Modal */}
        <Modal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          title="Claim Details"
        >
          {selectedClaim && (
            <div className="space-y-6">
              {/* Claim Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedClaim.claimNumber}</h3>
                  <p className="text-dark-400">{selectedClaim.route}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedClaim.status)}`}>
                  {getStatusText(selectedClaim.status)}
                </span>
              </div>

              {/* Claim Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Dealer</label>
                    <p className="text-white">{selectedClaim.dealer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Station</label>
                    <p className="text-white">{selectedClaim.station}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Region</label>
                    <p className="text-white">{selectedClaim.region}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Vehicle Number</label>
                    <p className="text-white">{selectedClaim.vehicleNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Driver</label>
                    <p className="text-white">{selectedClaim.driverName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Fuel Type</label>
                    <p className="text-white">{selectedClaim.fuelType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Quantity</label>
                    <p className="text-white">{selectedClaim.quantity.toLocaleString()} L</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Unit Price</label>
                    <p className="text-white">₵{selectedClaim.unitPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">UPPF Rate</label>
                    <p className="text-white">₵{selectedClaim.uppfRate.toFixed(3)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">UPPF Amount</label>
                    <p className="text-white font-bold">₵{selectedClaim.uppfAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className="text-sm font-medium text-dark-400 mb-2 block">Documents</label>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.documents.map((doc, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm border border-primary-500/30"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedClaim.notes && (
                <div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Notes</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedClaim.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setShowClaimModal(false)}>
                  Close
                </Button>
                {selectedClaim.status === 'pending' && (
                  <>
                    <Button variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                      Reject
                    </Button>
                    <Button variant="primary">
                      Approve
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

export default UPPFClaimsManagement;