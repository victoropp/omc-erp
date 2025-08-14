import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, Button, Modal, Badge } from '@/components/ui';
import { pricingService } from '@/services/api';
import { TableColumn, TableProps } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface UPPFClaim {
  id: string;
  claimNumber: string;
  dealer: string;
  route: string;
  fuelType: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submissionDate: string;
  approvalDate?: string;
  notes?: string;
}

interface ClaimsTableProps {
  showActions?: boolean;
  onClaimSelect?: (claim: UPPFClaim) => void;
  filters?: Record<string, any>;
}

export function ClaimsTable({ 
  showActions = true, 
  onClaimSelect,
  filters = {}
}: ClaimsTableProps) {
  const { actualTheme } = useTheme();
  const [claims, setClaims] = useState<UPPFClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UPPFClaim;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<UPPFClaim | null>(null);

  // Load claims data
  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await pricingService.getUPPFClaims() as any;
      setClaims(response.data || generateMockClaims());
      setPagination(prev => ({ ...prev, total: response.total || 50 }));
    } catch (error) {
      console.error('Failed to load claims:', error);
      // Use mock data as fallback
      setClaims(generateMockClaims());
      setPagination(prev => ({ ...prev, total: 50 }));
    } finally {
      setLoading(false);
    }
  };

  const generateMockClaims = (): UPPFClaim[] => {
    const statuses: UPPFClaim['status'][] = ['pending', 'approved', 'rejected', 'paid'];
    const dealers = ['Golden Star Petroleum', 'Allied Oil Company', 'Star Oil Ltd', 'Total Ghana', 'Shell Ghana'];
    const routes = ['TEMA-KUMASI-001', 'ACCRA-TAMALE-002', 'TAKORADI-WA-001'];
    const fuelTypes = ['PMS', 'AGO', 'LPG', 'KERO'];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `claim-${i + 1}`,
      claimNumber: `UPF-2024-${String(i + 1).padStart(4, '0')}`,
      dealer: dealers[Math.floor(Math.random() * dealers.length)],
      route: routes[Math.floor(Math.random() * routes.length)],
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      quantity: Math.floor(Math.random() * 50000) + 10000,
      amount: Math.floor(Math.random() * 500000) + 50000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      approvalDate: Math.random() > 0.5 ? new Date().toISOString().split('T')[0] : undefined,
      notes: Math.random() > 0.7 ? 'Additional documentation required' : undefined,
    }));
  };

  useEffect(() => {
    loadClaims();
  }, []);

  // Handle sorting
  const handleSort = (key: keyof UPPFClaim, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const handleFilter = (filters: Record<string, string>) => {
    // In a real app, this would trigger an API call
    console.log('Applying filters:', filters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    let filteredData = [...claims];

    // Apply filters
    if (filters.status) {
      filteredData = filteredData.filter(claim => claim.status === filters.status);
    }
    if (filters.dealer) {
      filteredData = filteredData.filter(claim => 
        claim.dealer.toLowerCase().includes(filters.dealer.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue != null && bValue != null) {
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return filteredData;
  }, [claims, sortConfig, filters]);

  // Table columns configuration
  const columns: TableColumn<UPPFClaim>[] = [
    {
      key: 'claimNumber',
      header: 'Claim Number',
      sortable: true,
      filterable: true,
      render: (value: string, row: UPPFClaim) => (
        <button
          onClick={() => {
            setSelectedClaim(row);
            setDetailModalOpen(true);
          }}
          className="text-primary-400 hover:text-primary-300 font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      key: 'dealer',
      header: 'Dealer',
      sortable: true,
      filterable: true,
    },
    {
      key: 'route',
      header: 'Route',
      sortable: true,
    },
    {
      key: 'fuelType',
      header: 'Fuel Type',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'PMS' ? 'primary' : value === 'AGO' ? 'secondary' : 'outline'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity (L)',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'amount',
      header: 'Amount (₵)',
      sortable: true,
      render: (value: number) => `₵${value.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value: string) => {
        const variants: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
          pending: 'warning',
          approved: 'success',
          rejected: 'danger',
          paid: 'primary',
        };
        return (
          <Badge variant={variants[value] || 'outline'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'submissionDate',
      header: 'Submitted',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  if (showActions) {
    columns.push({
      key: 'id',
      header: 'Actions',
      render: (_, row: UPPFClaim) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedClaim(row);
              setDetailModalOpen(true);
            }}
          >
            View
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClaimAction(row.id, 'approve')}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClaimAction(row.id, 'reject')}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    });
  }

  const handleClaimAction = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await pricingService.submitUPPFClaim(claimId);
      }
      // Refresh data
      loadClaims();
    } catch (error) {
      console.error(`Failed to ${action} claim:`, error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <Table
        data={processedData}
        columns={columns}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        onSort={handleSort}
        onFilter={handleFilter}
        onRowClick={onClaimSelect}
        selection={{
          selectedRows: selectedClaims,
          onSelectionChange: setSelectedClaims,
        }}
      />

      {/* Bulk actions */}
      {selectedClaims.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg"
        >
          <span className="text-white">
            {selectedClaims.length} claim(s) selected
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Export Selected
            </Button>
            <Button variant="primary" size="sm">
              Bulk Approve
            </Button>
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Claim Details"
        size="2xl"
      >
        {selectedClaim && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Claim Number
                  </label>
                  <p className="text-white font-mono">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Dealer
                  </label>
                  <p className="text-white">{selectedClaim.dealer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Route
                  </label>
                  <p className="text-white">{selectedClaim.route}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Status
                  </label>
                  <Badge 
                    variant={
                      selectedClaim.status === 'pending' ? 'warning' :
                      selectedClaim.status === 'approved' ? 'success' :
                      selectedClaim.status === 'rejected' ? 'danger' : 'primary'
                    }
                  >
                    {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Fuel Type
                  </label>
                  <p className="text-white">{selectedClaim.fuelType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Quantity
                  </label>
                  <p className="text-white">{selectedClaim.quantity.toLocaleString()} L</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Amount
                  </label>
                  <p className="text-white text-xl font-bold">₵{selectedClaim.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Submission Date
                  </label>
                  <p className="text-white">{new Date(selectedClaim.submissionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {selectedClaim.notes && (
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">
                  Notes
                </label>
                <p className="text-white bg-dark-800 p-3 rounded-lg">{selectedClaim.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              {selectedClaim.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClaimAction(selectedClaim.id, 'reject');
                      setDetailModalOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleClaimAction(selectedClaim.id, 'approve');
                      setDetailModalOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}