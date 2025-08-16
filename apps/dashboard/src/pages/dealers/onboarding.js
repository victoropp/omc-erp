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
const DealerOnboarding = () => {
    const [activeView, setActiveView] = (0, react_1.useState)('overview');
    const [selectedApplication, setSelectedApplication] = (0, react_1.useState)(null);
    // Sample onboarding data
    const onboardingMetrics = {
        totalApplications: 23,
        pendingApplications: 8,
        approvedThisMonth: 4,
        rejectedThisMonth: 2,
        averageProcessingTime: 14.5,
        approvalRate: 78.3,
    };
    const pendingApplications = [
        {
            id: 'ONB-2025-008',
            applicantName: 'Kwame Asante',
            stationName: 'Asante Fuel Station',
            location: 'Obuasi, Ashanti',
            applicationDate: '2025-01-08',
            stage: 'verification',
            status: 'in_review',
            completionPercentage: 65,
            assignedOfficer: 'Sarah Mensah',
            documents: {
                businessRegistration: true,
                taxClearance: true,
                bankStatements: false,
                siteInspection: true,
                environmentalPermit: false,
                fireServiceCertificate: false,
            },
            riskScore: 7.2,
            estimatedLoanAmount: 180000,
        },
        {
            id: 'ONB-2025-007',
            applicantName: 'Grace Osei',
            stationName: 'Northern Energy Hub',
            location: 'Bolgatanga, Upper East',
            applicationDate: '2025-01-05',
            stage: 'financial_assessment',
            status: 'in_review',
            completionPercentage: 80,
            assignedOfficer: 'David Ankrah',
            documents: {
                businessRegistration: true,
                taxClearance: true,
                bankStatements: true,
                siteInspection: true,
                environmentalPermit: true,
                fireServiceCertificate: false,
            },
            riskScore: 5.8,
            estimatedLoanAmount: 220000,
        },
        {
            id: 'ONB-2025-006',
            applicantName: 'Emmanuel Boateng',
            stationName: 'Coastal Petroleum Services',
            location: 'Elmina, Central',
            applicationDate: '2025-01-03',
            stage: 'documentation',
            status: 'pending',
            completionPercentage: 35,
            assignedOfficer: 'Joyce Addo',
            documents: {
                businessRegistration: true,
                taxClearance: false,
                bankStatements: false,
                siteInspection: false,
                environmentalPermit: false,
                fireServiceCertificate: false,
            },
            riskScore: 8.5,
            estimatedLoanAmount: 150000,
        },
    ];
    const onboardingStages = [
        { name: 'Documentation', key: 'documentation', color: 'blue' },
        { name: 'Verification', key: 'verification', color: 'yellow' },
        { name: 'Financial Assessment', key: 'financial_assessment', color: 'orange' },
        { name: 'Approval', key: 'approval', color: 'purple' },
        { name: 'Completed', key: 'completed', color: 'green' },
    ];
    const requiredDocuments = [
        { key: 'businessRegistration', name: 'Business Registration Certificate', critical: true },
        { key: 'taxClearance', name: 'Tax Clearance Certificate', critical: true },
        { key: 'bankStatements', name: 'Bank Statements (6 months)', critical: true },
        { key: 'siteInspection', name: 'Site Inspection Report', critical: true },
        { key: 'environmentalPermit', name: 'Environmental Impact Permit', critical: false },
        { key: 'fireServiceCertificate', name: 'Fire Service Certificate', critical: false },
    ];
    const getStageColor = (stage) => {
        const stageObj = onboardingStages.find(s => s.key === stage);
        return stageObj?.color || 'gray';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'in_review': return 'yellow';
            case 'completed': return 'blue';
            default: return 'gray';
        }
    };
    const NewApplicationForm = () => {
        const [formData, setFormData] = (0, react_1.useState)({
            applicantName: '',
            stationName: '',
            location: '',
            phoneNumber: '',
            email: '',
            businessType: '',
            estimatedInvestment: '',
        });
        const handleSubmit = (e) => {
            e.preventDefault();
            // Handle form submission
            console.log('Form submitted:', formData);
            setActiveView('applications');
        };
        return (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <Card_1.Card className="p-6">
          <h3 className="text-xl font-bold mb-6">New Dealer Application</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Applicant Name</label>
                <Input_1.Input value={formData.applicantName} onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))} placeholder="Full name of applicant" required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Station Name</label>
                <Input_1.Input value={formData.stationName} onChange={(e) => setFormData(prev => ({ ...prev, stationName: e.target.value }))} placeholder="Proposed station name" required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input_1.Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="City, Region" required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input_1.Input value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} placeholder="+233 XX XXX XXXX" required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input_1.Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="contact@example.com" required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <Select_1.Select value={formData.businessType} onChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))} placeholder="Select business type" options={[
                { value: 'new_station', label: 'New Filling Station' },
                { value: 'existing_station', label: 'Existing Station Conversion' },
                { value: 'franchise', label: 'Franchise Operation' },
            ]} required/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Estimated Initial Investment</label>
                <Input_1.Input type="number" value={formData.estimatedInvestment} onChange={(e) => setFormData(prev => ({ ...prev, estimatedInvestment: e.target.value }))} placeholder="Amount in GHS" required/>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button_1.Button type="button" variant="outline" onClick={() => setActiveView('applications')}>
                Cancel
              </Button_1.Button>
              <Button_1.Button type="submit">
                Submit Application
              </Button_1.Button>
            </div>
          </form>
        </Card_1.Card>
      </framer_motion_1.motion.div>);
    };
    const ApplicationDetails = ({ application }) => (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      {/* Application Header */}
      <Card_1.Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">{application.stationName}</h3>
            <p className="text-gray-600 dark:text-gray-400">{application.applicantName} • {application.location}</p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block mb-2 ${getStatusColor(application.status) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            getStatusColor(application.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                getStatusColor(application.status) === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
              {application.status.replace('_', ' ')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {application.completionPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <framer_motion_1.motion.div className="bg-blue-600 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${application.completionPercentage}%` }} transition={{ duration: 1 }}/>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between items-center">
          {onboardingStages.map((stage, index) => (<div key={stage.key} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${application.stage === stage.key ? `bg-${stage.color}-600 text-white` :
                index < onboardingStages.findIndex(s => s.key === application.stage) ?
                    'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {index < onboardingStages.findIndex(s => s.key === application.stage) ? (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>) : (<span className="text-xs">{index + 1}</span>)}
              </div>
              <span className="text-xs mt-1 text-center">{stage.name}</span>
            </div>))}
        </div>
      </Card_1.Card>

      {/* Application Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Checklist */}
        <Card_1.Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Required Documents</h4>
          <div className="space-y-3">
            {requiredDocuments.map((doc) => (<div key={doc.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${application.documents[doc.key] ?
                'bg-green-600' : 'bg-gray-300'}`}>
                    {application.documents[doc.key] && (<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>)}
                  </div>
                  <span className="text-sm font-medium">{doc.name}</span>
                  {doc.critical && (<span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Critical</span>)}
                </div>
                {!application.documents[doc.key] && (<Button_1.Button size="sm" variant="outline">Upload</Button_1.Button>)}
              </div>))}
          </div>
        </Card_1.Card>

        {/* Risk Assessment & Financial Info */}
        <Card_1.Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Assessment Details</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Risk Score</span>
              <div className="flex items-center space-x-2">
                <span className={`font-bold ${application.riskScore <= 5 ? 'text-green-600' :
            application.riskScore <= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {application.riskScore}/10
                </span>
                <div className={`w-3 h-3 rounded-full ${application.riskScore <= 5 ? 'bg-green-600' :
            application.riskScore <= 7 ? 'bg-yellow-600' : 'bg-red-600'}`}/>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Estimated Loan Amount</span>
              <span className="font-bold">₵{application.estimatedLoanAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Assigned Officer</span>
              <span className="font-medium">{application.assignedOfficer}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Application Date</span>
              <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <Button_1.Button className="w-full" disabled={application.completionPercentage < 100}>
              Approve Application
            </Button_1.Button>
            <Button_1.Button variant="outline" className="w-full">
              Request Additional Information
            </Button_1.Button>
            <Button_1.Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              Reject Application
            </Button_1.Button>
          </div>
        </Card_1.Card>
      </div>

      {/* Activity Timeline */}
      <Card_1.Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Activity Timeline</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">Application Submitted</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Initial application received and assigned to {application.assignedOfficer}
              </p>
              <p className="text-xs text-gray-500">{new Date(application.applicationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card_1.Card>
    </framer_motion_1.motion.div>);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Dealer Onboarding" subtitle="Streamlined dealer application and approval process">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Card_1.Card className="p-1">
          <div className="flex space-x-1">
            {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'applications', label: 'Applications', icon: '📋' },
            { key: 'new_application', label: 'New Application', icon: '➕' },
        ].map((tab) => (<button key={tab.key} onClick={() => setActiveView(tab.key)} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${activeView === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>))}
          </div>
        </Card_1.Card>

        <framer_motion_1.AnimatePresence mode="wait">
          {activeView === 'overview' && (<framer_motion_1.motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{onboardingMetrics.totalApplications}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{onboardingMetrics.pendingApplications}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{onboardingMetrics.approvedThisMonth}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved This Month</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{onboardingMetrics.rejectedThisMonth}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rejected This Month</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{onboardingMetrics.averageProcessingTime}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Days</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{onboardingMetrics.approvalRate}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
                  </div>
                </Card_1.Card>
              </div>

              {/* Stage Distribution */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Applications by Stage</h3>
                <div className="grid grid-cols-5 gap-4">
                  {onboardingStages.map((stage) => (<div key={stage.key} className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-${stage.color}-100 dark:bg-${stage.color}-900 flex items-center justify-center mb-2`}>
                        <span className={`text-2xl font-bold text-${stage.color}-600`}>
                          {pendingApplications.filter(app => app.stage === stage.key).length}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{stage.name}</p>
                    </div>))}
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>)}

          {activeView === 'applications' && !selectedApplication && (<framer_motion_1.motion.div key="applications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card_1.Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Pending Applications</h3>
                  <Button_1.Button onClick={() => setActiveView('new_application')}>
                    New Application
                  </Button_1.Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Application</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Applicant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Progress</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Officer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApplications.map((application, index) => (<framer_motion_1.motion.tr key={application.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{application.stationName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{application.id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{application.applicantName}</td>
                          <td className="py-3 px-4 text-sm">{application.location}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStageColor(application.stage)}-100 text-${getStageColor(application.stage)}-800`}>
                              {application.stage.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${application.completionPercentage}%` }}/>
                              </div>
                              <span className="text-xs">{application.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${application.riskScore <= 5 ? 'text-green-600' :
                    application.riskScore <= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {application.riskScore}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{application.assignedOfficer}</td>
                          <td className="py-3 px-4">
                            <Button_1.Button size="sm" variant="outline" onClick={() => setSelectedApplication(application)}>
                              Review
                            </Button_1.Button>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>)}

          {activeView === 'applications' && selectedApplication && (<div className="space-y-4">
              <Button_1.Button variant="outline" onClick={() => setSelectedApplication(null)} className="mb-4">
                ← Back to Applications
              </Button_1.Button>
              <ApplicationDetails application={selectedApplication}/>
            </div>)}

          {activeView === 'new_application' && (<NewApplicationForm />)}
        </framer_motion_1.AnimatePresence>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DealerOnboarding;
//# sourceMappingURL=onboarding.js.map