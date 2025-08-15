import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal, Button, Badge, Input } from '@/components/ui';
import { dailyDeliveryService } from '@/services/api';
import { DailyDelivery } from '@/types';
import { toast } from 'react-hot-toast';

interface ApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: DailyDelivery | null;
  onApproval: (deliveryId: string, approved: boolean, comments?: string) => void;
}

interface ApprovalHistory {
  id: string;
  level: number;
  approverName: string;
  approverRole: string;
  action: 'approved' | 'rejected' | 'pending';
  comments?: string;
  timestamp: string;
}

interface ApprovalLevel {
  level: number;
  name: string;
  description: string;
  requiredRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  isOpen,
  onClose,
  delivery,
  onApproval
}) => {
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isOpen && delivery) {
      loadApprovalData();
    }
  }, [isOpen, delivery]);

  const loadApprovalData = async () => {
    if (!delivery) return;

    try {
      setLoading(true);
      const history = await dailyDeliveryService.getApprovalHistory(delivery.id);
      setApprovalHistory(history || generateMockApprovalHistory());
      setApprovalLevels(generateApprovalLevels(delivery.approvalStatus.level));
    } catch (error) {
      console.error('Failed to load approval data:', error);
      setApprovalHistory(generateMockApprovalHistory());
      setApprovalLevels(generateApprovalLevels(delivery.approvalStatus.level));
    } finally {
      setLoading(false);
    }
  };

  const generateMockApprovalHistory = (): ApprovalHistory[] => [
    {
      id: '1',
      level: 1,
      approverName: 'John Doe',
      approverRole: 'Operations Supervisor',
      action: 'approved',
      comments: 'All compliance checks passed. Volume and pricing verified.',
      timestamp: '2024-01-13T08:15:00Z'
    },
    {
      id: '2',
      level: 2,
      approverName: 'Jane Smith',
      approverRole: 'Finance Manager',
      action: 'pending',
      timestamp: '2024-01-13T08:30:00Z'
    }
  ];

  const generateApprovalLevels = (currentLevel: number): ApprovalLevel[] => [
    {
      level: 1,
      name: 'Operations Review',
      description: 'Initial compliance and operational feasibility check',
      requiredRole: 'Operations Supervisor',
      status: currentLevel >= 1 ? 'approved' : 'pending'
    },
    {
      level: 2,
      name: 'Financial Approval',
      description: 'Financial validation and pricing verification',
      requiredRole: 'Finance Manager',
      status: currentLevel >= 2 ? 'approved' : currentLevel === 1 ? 'pending' : 'pending'
    },
    {
      level: 3,
      name: 'Regulatory Compliance',
      description: 'Final regulatory and compliance verification',
      requiredRole: 'Compliance Officer',
      status: currentLevel >= 3 ? 'approved' : currentLevel === 2 ? 'pending' : 'pending'
    },
    {
      level: 4,
      name: 'Executive Approval',
      description: 'Final executive sign-off for high-value deliveries',
      requiredRole: 'General Manager',
      status: currentLevel >= 4 ? 'approved' : currentLevel === 3 ? 'pending' : 'pending'
    }
  ];

  const handleApprove = async () => {
    if (!delivery) return;

    try {
      setLoading(true);
      await onApproval(delivery.id, true, comments);
      toast.success('Delivery approved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to approve delivery:', error);
      toast.error('Failed to approve delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!delivery) return;

    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      await onApproval(delivery.id, false, rejectReason);
      toast.success('Delivery rejected');
      onClose();
    } catch (error) {
      console.error('Failed to reject delivery:', error);
      toast.error('Failed to reject delivery');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getLevelStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        );
    }
  };

  if (!delivery) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approval Workflow" size="xl">
      <div className="space-y-8">
        {/* Delivery Summary */}
        <div className="p-6 bg-dark-800 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Delivery Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">PSA Number:</span>
              <span className="ml-2 text-white font-medium">{delivery.psaNumber}</span>
            </div>
            <div>
              <span className="text-dark-400">Customer:</span>
              <span className="ml-2 text-white font-medium">{delivery.customerName}</span>
            </div>
            <div>
              <span className="text-dark-400">Supplier:</span>
              <span className="ml-2 text-white font-medium">{delivery.supplier.name}</span>
            </div>
            <div>
              <span className="text-dark-400">Product:</span>
              <span className="ml-2 text-white font-medium capitalize">
                {delivery.product.type} - {delivery.product.grade}
              </span>
            </div>
            <div>
              <span className="text-dark-400">Quantity:</span>
              <span className="ml-2 text-white font-medium">
                {delivery.product.quantity.toLocaleString()} {delivery.product.unit}
              </span>
            </div>
            <div>
              <span className="text-dark-400">Total Value:</span>
              <span className="ml-2 text-green-400 font-medium">
                {delivery.currency} {delivery.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Workflow Progress */}
        <div>
          <h3 className="text-lg font-medium text-white mb-6">Approval Progress</h3>
          <div className="space-y-4">
            {approvalLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4"
              >
                {getLevelStatusIcon(level.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{level.name}</h4>
                    <Badge variant={getStatusColor(level.status)} className="capitalize">
                      {level.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{level.description}</p>
                  <p className="text-xs text-dark-500">Required Role: {level.requiredRole}</p>
                </div>
                {index < approvalLevels.length - 1 && (
                  <div className="absolute left-4 w-px h-12 bg-dark-600 mt-8"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Approval History */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Approval History</h3>
          <div className="space-y-4">
            {approvalHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-white">{item.approverName}</span>
                    <span className="ml-2 text-sm text-dark-400">({item.approverRole})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(item.action)} className="capitalize">
                      {item.action}
                    </Badge>
                    <span className="text-xs text-dark-400">
                      Level {item.level}
                    </span>
                  </div>
                </div>
                {item.comments && (
                  <p className="text-sm text-dark-300 mb-2">"{item.comments}"</p>
                )}
                <p className="text-xs text-dark-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="p-6 bg-dark-800 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Compliance Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded">
              <span className="text-dark-400">NPA Compliance:</span>
              <Badge variant={delivery.compliance.npaCompliant ? 'success' : 'danger'}>
                {delivery.compliance.npaCompliant ? 'Compliant' : 'Non-Compliant'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded">
              <span className="text-dark-400">GRA Compliance:</span>
              <Badge variant={delivery.compliance.graCompliant ? 'success' : 'danger'}>
                {delivery.compliance.graCompliant ? 'Compliant' : 'Non-Compliant'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded">
              <span className="text-dark-400">EPA Compliance:</span>
              <Badge variant={delivery.compliance.epaCompliant ? 'success' : 'danger'}>
                {delivery.compliance.epaCompliant ? 'Compliant' : 'Non-Compliant'}
              </Badge>
            </div>
          </div>
          <div className="mt-4 p-3 bg-dark-700 rounded">
            <span className="text-dark-400">Local Content:</span>
            <span className="ml-2 text-blue-400 font-medium">
              {delivery.compliance.localContentPercentage}%
            </span>
          </div>
        </div>

        {/* Current User Actions */}
        {delivery.status === 'submitted' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Your Action Required</h3>
            
            {/* Approve Section */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="font-medium text-green-400 mb-3">Approve Delivery</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Approval Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add comments for approval (optional)..."
                  />
                </div>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Approve Delivery'}
                </Button>
              </div>
            </div>

            {/* Reject Section */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-red-400">Reject Delivery</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectReason(!showRejectReason)}
                >
                  {showRejectReason ? 'Cancel' : 'Reject'}
                </Button>
              </div>
              
              {showRejectReason && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm text-dark-400 mb-2">Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Please provide a detailed reason for rejection..."
                      required
                    />
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={loading || !rejectReason.trim()}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Confirm Rejection'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Close Button for View-Only Mode */}
        {delivery.status !== 'submitted' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};