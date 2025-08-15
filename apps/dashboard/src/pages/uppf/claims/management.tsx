import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DailyDeliveryTable } from '@/components/tables/DailyDeliveryTable';
import { pricingService } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { format, subDays } from 'date-fns';

// Enhanced interfaces for UPPF Claims Management
interface UPPFClaim {
  id: string;
  claimNumber: string;
  windowId: string;
  dealerId: string;
  dealerName: string;
  routeId: string;
  routeName: string;
  depotName: string;
  stationName: string;
  productType: string;
  volumeLitres: number;
  kmBeyondEqualisation: number;
  baseAmount: number;
  bonuses: {
    routeEfficiency: number;
    compliance: number;
  };
  totalAmount: number;
  status: 'draft' | 'ready_to_submit' | 'submitted' | 'under_review' | 'approved' | 'settled' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  qualityScore: number;
  riskScore: number;
  gpsConfidence: number;
  evidenceScore: number;
  automationLevel: 'full' | 'partial' | 'manual';
  blockchainVerified: boolean;
  threeWayReconciled: boolean;
  createdDate: string;
  submissionDate?: string;
  approvalDate?: string;
  settlementDate?: string;
  processingDays?: number;
  evidenceLinks: {
    waybill: string;
    gpsTrace: string;
    grn: string;
    tankDips: string;
    weighbridge: string;
    qualityCertificate?: string;
  };
  anomalies: ClaimAnomaly[];
  recommendations: string[];
  auditTrail: AuditEntry[];
  metadata: any;
}

interface ClaimAnomaly {
  type: 'GPS_DEVIATION' | 'VOLUME_VARIANCE' | 'TIME_ANOMALY' | 'ROUTE_CHANGE' | 'DOCUMENTATION_ISSUE';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  resolved: boolean;
  resolution?: string;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

interface ClaimFilters {
  status: string[];
  priority: string[];
  automationLevel: string[];
  productType: string[];
  dealerId: string;
  routeId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  amountRange: {
    min: number;
    max: number;
  };
  qualityScore: {
    min: number;
    max: number;
  };
  hasAnomalies: boolean;
  blockchainVerified: boolean;
  searchTerm: string;
}

interface ClaimStatistics {
  total: number;
  byStatus: { [key: string]: number };
  byPriority: { [key: string]: number };
  byAutomationLevel: { [key: string]: number };
  averageProcessingTime: number;
  totalValue: number;
  successRate: number;
  automationRate: number;
  qualityMetrics: {
    averageQualityScore: number;
    averageRiskScore: number;
    blockchainVerificationRate: number;
  };
}

const UPPFClaimsManagement = () => {
  // State management
  const [claims, setClaims] = useState<UPPFClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<UPPFClaim[]>([]);
  const [statistics, setStatistics] = useState<ClaimStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<UPPFClaim | null>(null);
  
  // Modal states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showBulkActionModal, setBulkActionModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateClaimModal, setShowCreateClaimModal] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<ClaimFilters>({
    status: [],
    priority: [],
    automationLevel: [],
    productType: [],
    dealerId: '',
    routeId: '',
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
    },
    amountRange: {
      min: 0,
      max: 1000000,
    },
    qualityScore: {
      min: 0,
      max: 100,
    },
    hasAnomalies: false,
    blockchainVerified: false,
    searchTerm: '',
  });
  
  // Real-time updates
  const { lastMessage, isConnected } = useWebSocket('/ws/uppf-claims', {
    onMessage: handleRealTimeUpdate,
  });

  // Effects
  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, filters]);

  // Real-time update handler
  const handleRealTimeUpdate = (message: any) => {
    switch (message.type) {
      case 'claim_created':
        handleClaimCreated(message.data);
        break;
      case 'claim_updated':
        handleClaimUpdated(message.data);
        break;
      case 'bulk_action_completed':
        handleBulkActionCompleted(message.data);
        break;
      case 'anomaly_detected':
        handleAnomalyDetected(message.data);
        break;
    }
  };

  const handleClaimCreated = (claimData: UPPFClaim) => {
    setClaims(prev => [claimData, ...prev]);
    toast.success(`New UPPF claim created: ${claimData.claimNumber}`);
  };

  const handleClaimUpdated = (claimData: UPPFClaim) => {
    setClaims(prev => prev.map(claim => 
      claim.id === claimData.id ? { ...claim, ...claimData } : claim
    ));
    updateStatistics();
  };

  const handleBulkActionCompleted = (data: any) => {
    toast.success(`Bulk action completed: ${data.action} applied to ${data.count} claims`);
    loadClaims(); // Refresh data
  };

  const handleAnomalyDetected = (data: any) => {
    setClaims(prev => prev.map(claim => 
      claim.id === data.claimId 
        ? { ...claim, anomalies: [...claim.anomalies, data.anomaly] }
        : claim
    ));
    toast.error(`Anomaly detected in claim ${data.claimNumber}: ${data.anomaly.description}`);
  };

  // Data loading
  const loadClaims = async () => {
    try {
      setLoading(true);
      const [claimsData, statsData] = await Promise.all([
        pricingService.getUPPFClaims({
          includeDetails: true,
          includeAuditTrail: true,
          includeAnomalies: true,
        }),
        pricingService.getUPPFClaimsStatistics(filters.dateRange),
      ]);

      setClaims(claimsData || generateSampleClaims());
      setStatistics(statsData || calculateStatistics(claimsData || []));
    } catch (error) {
      console.error('Error loading UPPF claims:', error);
      toast.error('Failed to load UPPF claims');
      // Load sample data as fallback
      const sampleClaims = generateSampleClaims();
      setClaims(sampleClaims);
      setStatistics(calculateStatistics(sampleClaims));
    } finally {
      setLoading(false);
    }
  };

  // Filter application
  const applyFilters = () => {
    let filtered = [...claims];

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(claim => filters.status.includes(claim.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(claim => filters.priority.includes(claim.priority));
    }

    // Automation level filter
    if (filters.automationLevel.length > 0) {
      filtered = filtered.filter(claim => filters.automationLevel.includes(claim.automationLevel));
    }

    // Product type filter
    if (filters.productType.length > 0) {
      filtered = filtered.filter(claim => filters.productType.includes(claim.productType));
    }

    // Dealer filter
    if (filters.dealerId) {
      filtered = filtered.filter(claim => claim.dealerId === filters.dealerId);
    }

    // Route filter
    if (filters.routeId) {
      filtered = filtered.filter(claim => claim.routeId === filters.routeId);
    }

    // Date range filter
    filtered = filtered.filter(claim => {
      const claimDate = new Date(claim.createdDate);
      return claimDate >= filters.dateRange.start && claimDate <= filters.dateRange.end;
    });

    // Amount range filter
    filtered = filtered.filter(claim => 
      claim.totalAmount >= filters.amountRange.min && 
      claim.totalAmount <= filters.amountRange.max
    );

    // Quality score filter
    filtered = filtered.filter(claim => 
      claim.qualityScore >= filters.qualityScore.min && 
      claim.qualityScore <= filters.qualityScore.max
    );

    // Anomalies filter
    if (filters.hasAnomalies) {
      filtered = filtered.filter(claim => claim.anomalies.length > 0);
    }

    // Blockchain verification filter
    if (filters.blockchainVerified) {
      filtered = filtered.filter(claim => claim.blockchainVerified);
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchLower) ||
        claim.dealerName.toLowerCase().includes(searchLower) ||
        claim.routeName.toLowerCase().includes(searchLower) ||
        claim.stationName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredClaims(filtered);
  };

  // Actions
  const handleClaimAction = async (action: string, claimIds: string[]) => {
    try {
      await pricingService.performUPPFClaimAction({
        action,
        claimIds,
        performedBy: 'current_user', // Replace with actual user
      });

      toast.success(`${action} action completed for ${claimIds.length} claim(s)`);
      loadClaims(); // Refresh data
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to perform ${action}`);
    }
  };

  const handleBulkSubmit = () => {
    const readyClaims = selectedClaims.filter(id => {
      const claim = claims.find(c => c.id === id);
      return claim && claim.status === 'ready_to_submit';
    });

    if (readyClaims.length === 0) {
      toast.error('No claims ready for submission selected');
      return;
    }

    handleClaimAction('submit', readyClaims);
    setSelectedClaims([]);
  };

  const handleBulkApprove = () => {
    const approvableClaims = selectedClaims.filter(id => {
      const claim = claims.find(c => c.id === id);
      return claim && ['submitted', 'under_review'].includes(claim.status);
    });

    if (approvableClaims.length === 0) {
      toast.error('No approvable claims selected');
      return;
    }

    handleClaimAction('approve', approvableClaims);
    setSelectedClaims([]);
  };

  const handleExport = () => {
    const dataToExport = filteredClaims.map(claim => ({
      'Claim Number': claim.claimNumber,
      'Dealer': claim.dealerName,
      'Route': claim.routeName,
      'Product': claim.productType,
      'Volume (L)': claim.volumeLitres,
      'Amount (GHS)': claim.totalAmount,
      'Status': claim.status,
      'Quality Score': claim.qualityScore,
      'Created Date': claim.createdDate,
    }));

    // Convert to CSV and download
    const csv = convertToCSV(dataToExport);
    downloadCSV(csv, `uppf-claims-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Claims data exported successfully');
  };

  // Utility functions
  const generateSampleClaims = (): UPPFClaim[] => {
    return [
      {
        id: 'claim-001',
        claimNumber: 'UPPF-20250815-000001',
        windowId: 'W2025-16',
        dealerId: 'DEALER-001',
        dealerName: 'Ghana Fuel Ltd',
        routeId: 'ROUTE-001',
        routeName: 'Tema - Kumasi',
        depotName: 'Tema Oil Depot',
        stationName: 'Kumasi Central Station',
        productType: 'PMS',
        volumeLitres: 36000,
        kmBeyondEqualisation: 125,
        baseAmount: 43000.00,
        bonuses: { routeEfficiency: 1230.50, compliance: 1000.00 },
        totalAmount: 45230.50,
        status: 'approved',
        priority: 'high',
        qualityScore: 95,
        riskScore: 15,
        gpsConfidence: 98,
        evidenceScore: 92,
        automationLevel: 'full',
        blockchainVerified: true,
        threeWayReconciled: true,
        createdDate: '2025-01-10',
        submissionDate: '2025-01-11',
        approvalDate: '2025-01-14',
        processingDays: 4,
        evidenceLinks: {
          waybill: 'waybill-001.pdf',
          gpsTrace: 'gps-trace-001.json',
          grn: 'grn-001.pdf',
          tankDips: 'tank-dips-001.pdf',
          weighbridge: 'weighbridge-001.pdf',
          qualityCertificate: 'quality-cert-001.pdf',
        },
        anomalies: [],
        recommendations: [
          'Excellent performance - use as benchmark',
          'Consider route optimization for future deliveries'
        ],
        auditTrail: [
          {
            timestamp: '2025-01-10T08:00:00Z',
            action: 'Claim Created',
            user: 'System Auto-Generation',
            details: 'Claim automatically generated from delivery completion',
          },
          {
            timestamp: '2025-01-11T09:15:00Z',
            action: 'Status Changed',
            user: 'Operations Manager',
            details: 'Status changed from ready_to_submit to submitted',
            oldValue: 'ready_to_submit',
            newValue: 'submitted',
          },
          {
            timestamp: '2025-01-14T14:30:00Z',
            action: 'Approved',
            user: 'Finance Manager',
            details: 'Claim approved after verification',
            oldValue: 'under_review',
            newValue: 'approved',
          },
        ],
        metadata: {
          gpsValidation: {
            confidence: 98,
            anomaliesDetected: 0,
            routeEfficiency: 94,
          },
          blockchainHash: '0x1234567890abcdef',
          aiValidation: {
            score: 95,
            confidence: 98,
          },
        },
      },
      // Add more sample claims...
    ];
  };

  const calculateStatistics = (claimsData: UPPFClaim[]): ClaimStatistics => {
    const total = claimsData.length;
    const byStatus = claimsData.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const byPriority = claimsData.reduce((acc, claim) => {
      acc[claim.priority] = (acc[claim.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const byAutomationLevel = claimsData.reduce((acc, claim) => {
      acc[claim.automationLevel] = (acc[claim.automationLevel] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const settledClaims = claimsData.filter(c => c.status === 'settled');
    const avgProcessingTime = settledClaims.length > 0 
      ? settledClaims.reduce((sum, c) => sum + (c.processingDays || 0), 0) / settledClaims.length
      : 0;

    const totalValue = claimsData.reduce((sum, c) => sum + c.totalAmount, 0);
    const successRate = total > 0 ? (settledClaims.length / total) * 100 : 0;
    const automationRate = total > 0 ? (byAutomationLevel.full || 0) / total * 100 : 0;

    const avgQualityScore = total > 0 
      ? claimsData.reduce((sum, c) => sum + c.qualityScore, 0) / total 
      : 0;
    
    const avgRiskScore = total > 0 
      ? claimsData.reduce((sum, c) => sum + c.riskScore, 0) / total 
      : 0;
    
    const blockchainVerificationRate = total > 0 
      ? claimsData.filter(c => c.blockchainVerified).length / total * 100 
      : 0;

    return {
      total,
      byStatus,
      byPriority,
      byAutomationLevel,
      averageProcessingTime: avgProcessingTime,
      totalValue,
      successRate,
      automationRate,
      qualityMetrics: {
        averageQualityScore: avgQualityScore,
        averageRiskScore: avgRiskScore,
        blockchainVerificationRate,
      },
    };
  };

  const updateStatistics = () => {
    if (claims.length > 0) {
      setStatistics(calculateStatistics(claims));
    }
  };

  const convertToCSV = (data: any[]): string => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'ready_to_submit': return 'blue';
      case 'submitted': return 'yellow';
      case 'under_review': return 'orange';
      case 'approved': return 'green';
      case 'settled': return 'blue';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <FuturisticDashboardLayout title="UPPF Claims Management" subtitle="Comprehensive Claims Processing and Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </FuturisticDashboardLayout>
    );
  }

  return (
    <FuturisticDashboardLayout title="UPPF Claims Management" subtitle="Comprehensive Claims Processing and Analytics">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge 
              variant={isConnected ? 'success' : 'error'}
              className="flex items-center space-x-1"
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Real-time Connected' : 'Connection Lost'}</span>
            </Badge>
            
            <span className="text-sm text-gray-500">
              Showing {filteredClaims.length} of {claims.length} claims
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
            >
              🔍 Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              📊 Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateClaimModal(true)}
            >
              ➕ New Claim
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
                </div>
                <div className="text-blue-500">📋</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₵{statistics.totalValue.toLocaleString()}</p>
                </div>
                <div className="text-green-500">💰</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.successRate.toFixed(1)}%</p>
                </div>
                <div className="text-purple-500">📈</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Automation Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">{statistics.automationRate.toFixed(1)}%</p>
                </div>
                <div className="text-indigo-500">🤖</div>
              </div>
            </Card>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedClaims.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedClaims.length} claim(s) selected
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkSubmit}>
                  Submit Selected
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkApprove}>
                  Approve Selected
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedClaims([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Claims Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClaims(filteredClaims.map(c => c.id));
                        } else {
                          setSelectedClaims([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Claim</th>
                  <th className="text-left py-3 px-4 font-medium">Route</th>
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Quality</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredClaims.map((claim, index) => (
                    <motion.tr
                      key={claim.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClaims(prev => [...prev, claim.id]);
                            } else {
                              setSelectedClaims(prev => prev.filter(id => id !== claim.id));
                            }
                          }}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{claim.claimNumber}</span>
                          <span className="text-xs text-gray-500">{claim.dealerName}</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge variant={getPriorityColor(claim.priority)} className="text-xs">
                              {claim.priority}
                            </Badge>
                            {claim.blockchainVerified && (
                              <Tooltip content="Blockchain Verified">
                                <span className="text-blue-500 text-xs">🔗</span>
                              </Tooltip>
                            )}
                            {claim.anomalies.length > 0 && (
                              <Tooltip content={`${claim.anomalies.length} anomalies detected`}>
                                <span className="text-yellow-500 text-xs">⚠️</span>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm">{claim.routeName}</span>
                          <span className="text-xs text-gray-500">
                            {claim.kmBeyondEqualisation}km beyond equalisation
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{claim.productType}</span>
                          <span className="text-xs text-gray-500">
                            {claim.volumeLitres.toLocaleString()}L
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">₵{claim.totalAmount.toLocaleString()}</span>
                          {(claim.bonuses.routeEfficiency > 0 || claim.bonuses.compliance > 0) && (
                            <span className="text-xs text-green-600">
                              +₵{(claim.bonuses.routeEfficiency + claim.bonuses.compliance).toFixed(0)} bonus
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Tooltip content={`Quality: ${claim.qualityScore}%, Risk: ${claim.riskScore}%`}>
                            <div className={`w-3 h-3 rounded-full ${
                              claim.qualityScore >= 90 ? 'bg-green-500' :
                              claim.qualityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </Tooltip>
                          <Badge variant={claim.automationLevel === 'full' ? 'success' : 'warning'} className="text-xs">
                            {claim.automationLevel}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(claim.status)} className="text-xs">
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowClaimModal(true);
                            }}
                          >
                            View
                          </Button>
                          {claim.status === 'ready_to_submit' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClaimAction('submit', [claim.id])}
                            >
                              Submit
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Claim Detail Modal */}
        <AnimatePresence>
          {showClaimModal && selectedClaim && (
            <Modal
              isOpen={showClaimModal}
              onClose={() => {
                setShowClaimModal(false);
                setSelectedClaim(null);
              }}
              title="Claim Details"
              size="large"
            >
              <div className="space-y-6">
                {/* Claim Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedClaim.claimNumber}</h3>
                    <p className="text-gray-600">{selectedClaim.dealerName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedClaim.automationLevel === 'full' ? 'success' : 'warning'}>
                      {selectedClaim.automationLevel} automation
                    </Badge>
                    {selectedClaim.blockchainVerified && (
                      <Badge variant="info">Blockchain Verified</Badge>
                    )}
                  </div>
                </div>
                
                {/* Claim Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Route</label>
                    <p className="font-medium">{selectedClaim.routeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product Type</label>
                    <p className="font-medium">{selectedClaim.productType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Volume</label>
                    <p className="font-medium">{selectedClaim.volumeLitres.toLocaleString()}L</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">KM Beyond Equalisation</label>
                    <p className="font-medium">{selectedClaim.kmBeyondEqualisation}km</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Base Amount</label>
                    <p className="font-medium">₵{selectedClaim.baseAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="font-medium text-green-600">₵{selectedClaim.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Quality Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedClaim.qualityScore}%</div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedClaim.gpsConfidence}%</div>
                    <div className="text-sm text-gray-600">GPS Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedClaim.evidenceScore}%</div>
                    <div className="text-sm text-gray-600">Evidence Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedClaim.riskScore}%</div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                  </div>
                </div>
                
                {/* Anomalies */}
                {selectedClaim.anomalies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Anomalies Detected</h4>
                    <div className="space-y-2">
                      {selectedClaim.anomalies.map((anomaly, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            anomaly.severity === 'critical' ? 'bg-red-500' :
                            anomaly.severity === 'high' ? 'bg-orange-500' :
                            anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{anomaly.type.replace('_', ' ')}</span>
                              <Badge variant={anomaly.resolved ? 'success' : 'warning'} className="text-xs">
                                {anomaly.resolved ? 'Resolved' : 'Open'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{anomaly.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Detected: {format(new Date(anomaly.detectedAt), 'PPp')}
                            </p>
                            {anomaly.resolution && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                Resolution: {anomaly.resolution}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommendations */}
                {selectedClaim.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-1">
                      {selectedClaim.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Audit Trail */}
                <div>
                  <h4 className="font-medium mb-2">Audit Trail</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedClaim.auditTrail.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <span className="text-xs text-gray-500">{entry.user}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.details}</p>
                          <p className="text-xs text-gray-500">{format(new Date(entry.timestamp), 'PPp')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default UPPFClaimsManagement;