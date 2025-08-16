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
const index_1 = require("@/components/ui/index");
const Modal_1 = require("@/components/ui/Modal");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const NPASubmission = () => {
    const [submissions, setSubmissions] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showSubmissionModal, setShowSubmissionModal] = (0, react_1.useState)(false);
    const [showDetailsModal, setShowDetailsModal] = (0, react_1.useState)(false);
    const [selectedSubmission, setSelectedSubmission] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [dateFilter, setDateFilter] = (0, react_1.useState)('30days');
    const [realTimeUpdates, setRealTimeUpdates] = (0, react_1.useState)(true);
    const [newSubmission, setNewSubmission] = (0, react_1.useState)({
        claimId: '',
        dealerName: '',
        route: '',
        transportDate: '',
        claimAmount: 0,
        documents: []
    });
    const [uploadingFiles, setUploadingFiles] = (0, react_1.useState)({});
    // Fetch NPA submissions data
    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                dateRange: dateFilter
            };
            const [submissionsData, statsData] = await Promise.all([
                api_1.regulatoryService.get(`/npa/submissions?${new URLSearchParams(params).toString()}`),
                api_1.regulatoryService.get('/npa/submission-stats')
            ]);
            setSubmissions(submissionsData.submissions || []);
            setStats(statsData);
        }
        catch (error) {
            console.error('Error fetching NPA submissions:', error);
            react_hot_toast_1.toast.error('Failed to load NPA submissions');
        }
        finally {
            setLoading(false);
        }
    };
    // Real-time updates via WebSocket
    (0, react_1.useEffect)(() => {
        if (realTimeUpdates) {
            api_1.wsService.connect();
            const handleNPAUpdate = (data) => {
                if (data.type === 'npa_submission_update') {
                    setSubmissions(prev => prev.map(sub => sub.id === data.payload.id ? { ...sub, ...data.payload } : sub));
                    react_hot_toast_1.toast.success(`Submission ${data.payload.submissionId} status updated: ${data.payload.status}`);
                }
            };
            api_1.wsService.send({ type: 'subscribe', channel: 'npa_submissions' });
            return () => {
                api_1.wsService.send({ type: 'unsubscribe', channel: 'npa_submissions' });
                api_1.wsService.disconnect();
            };
        }
    }, [realTimeUpdates]);
    (0, react_1.useEffect)(() => {
        fetchSubmissions();
    }, [searchTerm, statusFilter, dateFilter]);
    // Create new NPA submission
    const createSubmission = async () => {
        try {
            const submissionData = {
                ...newSubmission,
                transportDate: new Date(newSubmission.transportDate).toISOString()
            };
            await api_1.regulatoryService.post('/npa/submissions', submissionData);
            react_hot_toast_1.toast.success('NPA submission created successfully');
            setShowSubmissionModal(false);
            setNewSubmission({
                claimId: '',
                dealerName: '',
                route: '',
                transportDate: '',
                claimAmount: 0,
                documents: []
            });
            fetchSubmissions();
        }
        catch (error) {
            console.error('Error creating submission:', error);
            react_hot_toast_1.toast.error('Failed to create NPA submission');
        }
    };
    // Submit to NPA
    const submitToNPA = async (submissionId) => {
        try {
            await api_1.regulatoryService.post(`/npa/submissions/${submissionId}/submit`);
            react_hot_toast_1.toast.success('Submission sent to NPA successfully');
            fetchSubmissions();
        }
        catch (error) {
            console.error('Error submitting to NPA:', error);
            react_hot_toast_1.toast.error('Failed to submit to NPA');
        }
    };
    // Upload document
    const uploadDocument = async (submissionId, file, documentType) => {
        try {
            setUploadingFiles(prev => ({ ...prev, [documentType]: true }));
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', documentType);
            await api_1.regulatoryService.post(`/npa/submissions/${submissionId}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            react_hot_toast_1.toast.success('Document uploaded successfully');
            fetchSubmissions();
        }
        catch (error) {
            console.error('Error uploading document:', error);
            react_hot_toast_1.toast.error('Failed to upload document');
        }
        finally {
            setUploadingFiles(prev => ({ ...prev, [documentType]: false }));
        }
    };
    // Validate submission
    const validateSubmission = async (submissionId) => {
        try {
            await api_1.regulatoryService.post(`/npa/submissions/${submissionId}/validate`);
            react_hot_toast_1.toast.success('Submission validation initiated');
            fetchSubmissions();
        }
        catch (error) {
            console.error('Error validating submission:', error);
            react_hot_toast_1.toast.error('Failed to validate submission');
        }
    };
    // Check NPA status
    const checkNPAStatus = async (submissionId) => {
        try {
            const response = await api_1.regulatoryService.get(`/npa/submissions/${submissionId}/status`);
            react_hot_toast_1.toast.success('Status updated from NPA');
            fetchSubmissions();
        }
        catch (error) {
            console.error('Error checking NPA status:', error);
            react_hot_toast_1.toast.error('Failed to check NPA status');
        }
    };
    // Filter submissions
    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.route.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'submitted': return 'primary';
            case 'under_review': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'paid': return 'success';
            default: return 'secondary';
        }
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="NPA Submission Interface" subtitle="National Petroleum Authority Claims Submission Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="NPA Submission Interface" subtitle="National Petroleum Authority Claims Submission Portal">
      <div className="space-y-6">
        {/* NPA Submission Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-blue-700">{stats?.totalSubmissions || 0}</p>
                  <p className="text-xs text-blue-500 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-700">{stats?.pendingReview || 0}</p>
                  <p className="text-xs text-yellow-500 mt-1">Awaiting NPA review</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approval Rate</p>
                  <p className="text-3xl font-bold text-green-700">{stats?.approvalRate || 0}%</p>
                  <p className="text-xs text-green-500 mt-1">Last 30 days</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Approved</p>
                  <p className="text-3xl font-bold text-purple-700">₵{stats?.totalAmountApproved?.toLocaleString() || 0}</p>
                  <p className="text-xs text-purple-500 mt-1">Amount approved</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Controls & Real-time Status */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card_1.Card className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-4">
                <index_1.Badge variant={realTimeUpdates ? 'success' : 'secondary'}>
                  {realTimeUpdates ? '● Live NPA Updates' : '○ Manual Refresh'}
                </index_1.Badge>
                <Button_1.Button variant="outline" size="sm" onClick={() => setRealTimeUpdates(!realTimeUpdates)}>
                  {realTimeUpdates ? 'Disable' : 'Enable'} Real-time
                </Button_1.Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Input_1.Input placeholder="Search submissions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1"/>
                
                <Select_1.Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'all', label: 'All Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'paid', label: 'Paid' }
        ]} className="min-w-[200px]"/>
                
                <Select_1.Select value={dateFilter} onChange={setDateFilter} options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: '90days', label: 'Last 90 Days' },
            { value: '1year', label: 'Last Year' }
        ]} className="min-w-[150px]"/>
              </div>
              
              <Button_1.Button onClick={() => setShowSubmissionModal(true)}>
                New Submission
              </Button_1.Button>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Submissions Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">NPA Submissions</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Submission ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, index) => (<framer_motion_1.motion.tr key={submission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{submission.submissionId}</p>
                          <p className="text-sm text-gray-500">Claim: {submission.claimId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{submission.dealerName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p>{submission.route}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(submission.transportDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">₵{submission.claimAmount.toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <index_1.Badge variant={getStatusColor(submission.status)}>
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </index_1.Badge>
                        {submission.validationResults?.some(v => v.status === 'failed') && (<p className="text-xs text-red-500 mt-1">Validation issues</p>)}
                      </td>
                      <td className="py-3 px-4">
                        {submission.submissionDate ? (<p className="text-sm">
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </p>) : (<p className="text-sm text-gray-500">Not submitted</p>)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => {
                setSelectedSubmission(submission);
                setShowDetailsModal(true);
            }} className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
                            View
                          </button>
                          
                          {submission.status === 'draft' && (<button onClick={() => submitToNPA(submission.id)} className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200">
                              Submit
                            </button>)}
                          
                          {['submitted', 'under_review'].includes(submission.status) && (<button onClick={() => checkNPAStatus(submission.id)} className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200">
                              Check Status
                            </button>)}
                          
                          <button onClick={() => validateSubmission(submission.id)} className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200">
                            Validate
                          </button>
                        </div>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* New Submission Modal */}
        <Modal_1.Modal isOpen={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} title="Create New NPA Submission" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input_1.Input label="Claim ID" value={newSubmission.claimId} onChange={(e) => setNewSubmission({ ...newSubmission, claimId: e.target.value })} placeholder="UPPF-2025-001"/>
              
              <Input_1.Input label="Dealer Name" value={newSubmission.dealerName} onChange={(e) => setNewSubmission({ ...newSubmission, dealerName: e.target.value })} placeholder="Ghana Oil Depot"/>
              
              <Input_1.Input label="Route" value={newSubmission.route} onChange={(e) => setNewSubmission({ ...newSubmission, route: e.target.value })} placeholder="Tema - Kumasi"/>
              
              <Input_1.Input label="Transport Date" type="date" value={newSubmission.transportDate} onChange={(e) => setNewSubmission({ ...newSubmission, transportDate: e.target.value })}/>
              
              <Input_1.Input label="Claim Amount (₵)" type="number" value={newSubmission.claimAmount} onChange={(e) => setNewSubmission({ ...newSubmission, claimAmount: Number(e.target.value) })} placeholder="0.00"/>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Required Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
            { type: 'gps_data', label: 'GPS Tracking Data' },
            { type: 'waybill', label: 'Waybill' },
            { type: 'delivery_note', label: 'Delivery Note' },
            { type: 'fuel_receipt', label: 'Fuel Receipt' },
            { type: 'transport_permit', label: 'Transport Permit' }
        ].map(({ type, label }) => (<div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{label}</span>
                    <input type="file" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    // Handle file upload logic here
                    console.log(`Uploading ${type}:`, file);
                }
            }} className="text-xs" accept=".pdf,.jpg,.jpeg,.png,.xlsx"/>
                  </div>))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button_1.Button variant="outline" onClick={() => setShowSubmissionModal(false)}>
                Cancel
              </Button_1.Button>
              <Button_1.Button onClick={createSubmission}>
                Create Submission
              </Button_1.Button>
            </div>
          </div>
        </Modal_1.Modal>

        {/* Submission Details Modal */}
        <Modal_1.Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`Submission Details - ${selectedSubmission?.submissionId}`} size="xl">
          {selectedSubmission && (<div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Claim ID:</strong> {selectedSubmission.claimId}</p>
                    <p><strong>Dealer:</strong> {selectedSubmission.dealerName}</p>
                    <p><strong>Route:</strong> {selectedSubmission.route}</p>
                    <p><strong>Amount:</strong> ₵{selectedSubmission.claimAmount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Current Status:</strong> 
                      <index_1.Badge variant={getStatusColor(selectedSubmission.status)} className="ml-2">
                        {selectedSubmission.status.replace('_', ' ').toUpperCase()}
                      </index_1.Badge>
                    </p>
                    <p><strong>NPA Response Code:</strong> {selectedSubmission.npaResponseCode || 'N/A'}</p>
                    <p><strong>Submission Date:</strong> {selectedSubmission.submissionDate ? new Date(selectedSubmission.submissionDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Review Date:</strong> {selectedSubmission.reviewDate ? new Date(selectedSubmission.reviewDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Validation Results */}
              {selectedSubmission.validationResults?.length > 0 && (<div>
                  <h4 className="font-medium mb-3">Validation Results</h4>
                  <div className="space-y-2">
                    {selectedSubmission.validationResults.map((result) => (<div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{result.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                        <index_1.Badge variant={result.status === 'passed' ? 'success' :
                        result.status === 'failed' ? 'danger' : 'warning'}>
                          {result.status}
                        </index_1.Badge>
                      </div>))}
                  </div>
                </div>)}

              {/* Documents */}
              <div>
                <h4 className="font-medium mb-3">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSubmission.documents?.map((doc) => (<div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <index_1.Badge variant={doc.verified ? 'success' : 'warning'}>
                          {doc.verified ? 'Verified' : 'Pending'}
                        </index_1.Badge>
                        <button onClick={() => window.open(doc.fileUrl, '_blank')} className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                      </div>
                    </div>))}
                </div>
              </div>

              {/* Review Comments */}
              {selectedSubmission.reviewComments && (<div>
                  <h4 className="font-medium mb-2">NPA Review Comments</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedSubmission.reviewComments}</p>
                  </div>
                </div>)}
            </div>)}
        </Modal_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = NPASubmission;
//# sourceMappingURL=npa-submission.js.map