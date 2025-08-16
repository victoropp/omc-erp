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
exports.ClaimsTable = ClaimsTable;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function ClaimsTable({ showActions = true, onClaimSelect, filters = {} }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [claims, setClaims] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [pagination, setPagination] = (0, react_1.useState)({
        page: 1,
        limit: 25,
        total: 0,
    });
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const [selectedClaims, setSelectedClaims] = (0, react_1.useState)([]);
    const [detailModalOpen, setDetailModalOpen] = (0, react_1.useState)(false);
    const [selectedClaim, setSelectedClaim] = (0, react_1.useState)(null);
    // Load claims data
    const loadClaims = async () => {
        try {
            setLoading(true);
            const response = await api_1.pricingService.getUPPFClaims();
            setClaims(response.data || generateMockClaims());
            setPagination(prev => ({ ...prev, total: response.total || 50 }));
        }
        catch (error) {
            console.error('Failed to load claims:', error);
            // Use mock data as fallback
            setClaims(generateMockClaims());
            setPagination(prev => ({ ...prev, total: 50 }));
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockClaims = () => {
        const statuses = ['pending', 'approved', 'rejected', 'paid'];
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
    (0, react_1.useEffect)(() => {
        loadClaims();
    }, []);
    // Handle sorting
    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };
    // Handle filtering
    const handleFilter = (filters) => {
        // In a real app, this would trigger an API call
        console.log('Applying filters:', filters);
    };
    // Handle pagination
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };
    const handleLimitChange = (limit) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    };
    // Sort and filter data
    const processedData = (0, react_1.useMemo)(() => {
        let filteredData = [...claims];
        // Apply filters
        if (filters.status) {
            filteredData = filteredData.filter(claim => claim.status === filters.status);
        }
        if (filters.dealer) {
            filteredData = filteredData.filter(claim => claim.dealer.toLowerCase().includes(filters.dealer.toLowerCase()));
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
    const columns = [
        {
            key: 'claimNumber',
            header: 'Claim Number',
            sortable: true,
            filterable: true,
            render: (value, row) => (<button onClick={() => {
                    setSelectedClaim(row);
                    setDetailModalOpen(true);
                }} className="text-primary-400 hover:text-primary-300 font-medium">
          {value}
        </button>),
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
            render: (value) => (<ui_1.Badge variant={value === 'PMS' ? 'primary' : value === 'AGO' ? 'secondary' : 'outline'}>
          {value}
        </ui_1.Badge>),
        },
        {
            key: 'quantity',
            header: 'Quantity (L)',
            sortable: true,
            render: (value) => value.toLocaleString(),
        },
        {
            key: 'amount',
            header: 'Amount (₵)',
            sortable: true,
            render: (value) => `₵${value.toLocaleString()}`,
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            filterable: true,
            render: (value) => {
                const variants = {
                    pending: 'warning',
                    approved: 'success',
                    rejected: 'danger',
                    paid: 'primary',
                };
                return (<ui_1.Badge variant={variants[value] || 'outline'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </ui_1.Badge>);
            },
        },
        {
            key: 'submissionDate',
            header: 'Submitted',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];
    if (showActions) {
        columns.push({
            key: 'id',
            header: 'Actions',
            render: (_, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm" onClick={() => {
                    setSelectedClaim(row);
                    setDetailModalOpen(true);
                }}>
            View
          </ui_1.Button>
          {row.status === 'pending' && (<>
              <ui_1.Button variant="outline" size="sm" onClick={() => handleClaimAction(row.id, 'approve')}>
                Approve
              </ui_1.Button>
              <ui_1.Button variant="outline" size="sm" onClick={() => handleClaimAction(row.id, 'reject')}>
                Reject
              </ui_1.Button>
            </>)}
        </div>),
        });
    }
    const handleClaimAction = async (claimId, action) => {
        try {
            if (action === 'approve') {
                await api_1.pricingService.submitUPPFClaim(claimId);
            }
            // Refresh data
            loadClaims();
        }
        catch (error) {
            console.error(`Failed to ${action} claim:`, error);
        }
    };
    return (<div className="space-y-4">
      {/* Table */}
      <ui_1.Table data={processedData} columns={columns} loading={loading} pagination={{
            ...pagination,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
        }} onSort={handleSort} onFilter={handleFilter} onRowClick={onClaimSelect} selection={{
            selectedRows: selectedClaims,
            onSelectionChange: setSelectedClaims,
        }}/>

      {/* Bulk actions */}
      {selectedClaims.length > 0 && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
          <span className="text-white">
            {selectedClaims.length} claim(s) selected
          </span>
          <div className="flex space-x-2">
            <ui_1.Button variant="outline" size="sm">
              Export Selected
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              Bulk Approve
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>)}

      {/* Detail Modal */}
      <ui_1.Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Claim Details" size="2xl">
        {selectedClaim && (<div className="space-y-6">
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
                  <ui_1.Badge variant={selectedClaim.status === 'pending' ? 'warning' :
                selectedClaim.status === 'approved' ? 'success' :
                    selectedClaim.status === 'rejected' ? 'danger' : 'primary'}>
                    {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                  </ui_1.Badge>
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
            
            {selectedClaim.notes && (<div>
                <label className="block text-sm font-medium text-dark-400 mb-1">
                  Notes
                </label>
                <p className="text-white bg-dark-800 p-3 rounded-lg">{selectedClaim.notes}</p>
              </div>)}

            <div className="flex justify-end space-x-3">
              <ui_1.Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </ui_1.Button>
              {selectedClaim.status === 'pending' && (<>
                  <ui_1.Button variant="outline" onClick={() => {
                    handleClaimAction(selectedClaim.id, 'reject');
                    setDetailModalOpen(false);
                }}>
                    Reject
                  </ui_1.Button>
                  <ui_1.Button variant="primary" onClick={() => {
                    handleClaimAction(selectedClaim.id, 'approve');
                    setDetailModalOpen(false);
                }}>
                    Approve
                  </ui_1.Button>
                </>)}
            </div>
          </div>)}
      </ui_1.Modal>
    </div>);
}
//# sourceMappingURL=ClaimsTable.js.map