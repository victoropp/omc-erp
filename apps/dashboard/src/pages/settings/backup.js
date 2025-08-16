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
const ui_1 = require("@/components/ui");
const react_hot_toast_1 = require("react-hot-toast");
const BackupSettings = () => {
    const [backupJobs, setBackupJobs] = (0, react_1.useState)([]);
    const [backupFiles, setBackupFiles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasChanges, setHasChanges] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('jobs');
    const [restoreFile, setRestoreFile] = (0, react_1.useState)('');
    const [verifyingBackup, setVerifyingBackup] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadBackupData();
    }, []);
    const loadBackupData = async () => {
        try {
            setLoading(true);
            setBackupJobs(sampleBackupJobs);
            setBackupFiles(sampleBackupFiles);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load backup data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleJobToggle = (jobId) => {
        setBackupJobs(prev => prev.map(job => job.id === jobId
            ? { ...job, enabled: !job.enabled }
            : job));
        setHasChanges(true);
    };
    const handleRunBackup = async (jobId) => {
        try {
            setLoading(true);
            setBackupJobs(prev => prev.map(job => job.id === jobId
                ? { ...job, status: 'running' }
                : job));
            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 3000));
            setBackupJobs(prev => prev.map(job => job.id === jobId
                ? {
                    ...job,
                    status: 'completed',
                    lastRun: new Date().toISOString(),
                    nextRun: getNextRunTime(job.frequency),
                    size: Math.floor(Math.random() * 500) + 100, // MB
                    duration: Math.floor(Math.random() * 300) + 60, // seconds
                }
                : job));
            react_hot_toast_1.toast.success('Backup completed successfully');
        }
        catch (error) {
            setBackupJobs(prev => prev.map(job => job.id === jobId
                ? { ...job, status: 'failed' }
                : job));
            react_hot_toast_1.toast.error('Backup failed');
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerifyBackup = async (fileId) => {
        try {
            setVerifyingBackup(fileId);
            // Simulate verification process
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success('Backup file verification successful');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Backup verification failed');
        }
        finally {
            setVerifyingBackup(null);
        }
    };
    const handleRestoreBackup = async () => {
        if (!restoreFile) {
            react_hot_toast_1.toast.error('Please select a backup file to restore');
            return;
        }
        if (!confirm('Are you sure you want to restore from this backup? This will replace all current data.')) {
            return;
        }
        try {
            setLoading(true);
            // Simulate restore process
            await new Promise(resolve => setTimeout(resolve, 5000));
            react_hot_toast_1.toast.success('System restored successfully from backup');
            setRestoreFile('');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Restore operation failed');
        }
        finally {
            setLoading(false);
        }
    };
    const getNextRunTime = (frequency) => {
        const now = new Date();
        switch (frequency) {
            case 'daily':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
            default:
                return '';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'running': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        else {
            return `${remainingSeconds}s`;
        }
    };
    // Sample data
    const sampleBackupJobs = [
        {
            id: '1',
            name: 'Daily Full System Backup',
            type: 'full',
            frequency: 'daily',
            schedule: '0 2 * * *', // Daily at 2 AM
            enabled: true,
            lastRun: '2024-01-13T02:00:00Z',
            nextRun: '2024-01-14T02:00:00Z',
            status: 'completed',
            size: 245,
            duration: 1200,
            retention: 30,
            destination: 'AWS S3 - omc-backups/daily',
        },
        {
            id: '2',
            name: 'Hourly Transaction Backup',
            type: 'incremental',
            frequency: 'daily', // Runs multiple times per day
            schedule: '0 * * * *', // Every hour
            enabled: true,
            lastRun: '2024-01-13T18:00:00Z',
            nextRun: '2024-01-13T19:00:00Z',
            status: 'completed',
            size: 12,
            duration: 45,
            retention: 7,
            destination: 'Local Storage - /backups/incremental',
        },
        {
            id: '3',
            name: 'Weekly Configuration Backup',
            type: 'differential',
            frequency: 'weekly',
            schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
            enabled: true,
            lastRun: '2024-01-07T03:00:00Z',
            nextRun: '2024-01-14T03:00:00Z',
            status: 'completed',
            size: 5,
            duration: 120,
            retention: 90,
            destination: 'Google Cloud Storage - gs://omc-config-backups',
        },
        {
            id: '4',
            name: 'Monthly Archive Backup',
            type: 'full',
            frequency: 'monthly',
            schedule: '0 1 1 * *', // First day of month at 1 AM
            enabled: true,
            lastRun: '2024-01-01T01:00:00Z',
            nextRun: '2024-02-01T01:00:00Z',
            status: 'completed',
            size: 890,
            duration: 3600,
            retention: 365,
            destination: 'AWS Glacier - omc-archives',
        },
        {
            id: '5',
            name: 'Emergency Manual Backup',
            type: 'full',
            frequency: 'manual',
            enabled: true,
            status: 'idle',
            retention: 14,
            destination: 'Local Storage - /backups/manual',
        },
    ];
    const sampleBackupFiles = [
        {
            id: '1',
            jobId: '1',
            filename: 'omc-erp-full-20240113-020000.sql.gz',
            type: 'full',
            size: 245 * 1024 * 1024,
            createdAt: '2024-01-13T02:00:00Z',
            status: 'active',
            location: 'AWS S3',
            checksum: 'sha256:a1b2c3d4e5f6...',
        },
        {
            id: '2',
            jobId: '2',
            filename: 'omc-erp-incr-20240113-180000.sql',
            type: 'incremental',
            size: 12 * 1024 * 1024,
            createdAt: '2024-01-13T18:00:00Z',
            status: 'active',
            location: 'Local Storage',
            checksum: 'sha256:f6e5d4c3b2a1...',
        },
        {
            id: '3',
            jobId: '1',
            filename: 'omc-erp-full-20240112-020000.sql.gz',
            type: 'full',
            size: 238 * 1024 * 1024,
            createdAt: '2024-01-12T02:00:00Z',
            status: 'active',
            location: 'AWS S3',
            checksum: 'sha256:b2c3d4e5f6a1...',
        },
        {
            id: '4',
            jobId: '3',
            filename: 'omc-erp-config-20240107-030000.tar.gz',
            type: 'differential',
            size: 5 * 1024 * 1024,
            createdAt: '2024-01-07T03:00:00Z',
            status: 'active',
            location: 'Google Cloud',
            checksum: 'sha256:c3d4e5f6a1b2...',
        },
        {
            id: '5',
            jobId: '4',
            filename: 'omc-erp-archive-20240101-010000.sql.gz',
            type: 'full',
            size: 890 * 1024 * 1024,
            createdAt: '2024-01-01T01:00:00Z',
            status: 'archived',
            location: 'AWS Glacier',
            checksum: 'sha256:d4e5f6a1b2c3...',
        },
    ];
    const activeJobs = backupJobs.filter(job => job.enabled).length;
    const totalBackupSize = backupFiles.reduce((sum, file) => sum + file.size, 0);
    const successfulBackups = backupJobs.filter(job => job.status === 'completed').length;
    const recentBackups = backupFiles.filter(file => new Date(file.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Backup & Restore
            </h1>
            <p className="text-dark-400 mt-2">
              Manage system backups and data recovery operations
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Backup Logs
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Backup
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Jobs</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{activeJobs}</p>
              <p className="text-sm text-green-400">of {backupJobs.length} configured</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Backup Size</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {formatFileSize(totalBackupSize).split(' ')[0]}
              </p>
              <p className="text-sm text-dark-400">{formatFileSize(totalBackupSize).split(' ')[1]}</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Success Rate</h3>
              <p className={`text-3xl font-bold mb-1 ${successfulBackups === backupJobs.length ? 'text-green-400' : 'text-yellow-400'}`}>
                {Math.round((successfulBackups / backupJobs.length) * 100)}%
              </p>
              <p className="text-sm text-dark-400">{successfulBackups} successful</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Recent Backups</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{recentBackups}</p>
              <p className="text-sm text-dark-400">Last 7 days</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { id: 'jobs', label: 'Backup Jobs', count: backupJobs.length },
            { id: 'files', label: 'Backup Files', count: backupFiles.length },
            { id: 'settings', label: 'Settings', count: 0 },
            { id: 'restore', label: 'Restore', count: 0 },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
              {tab.count > 0 && (<span className="ml-2 px-2 py-0.5 bg-dark-600 rounded-full text-xs">
                  {tab.count}
                </span>)}
            </button>))}
        </div>

        {/* Tab Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'jobs' && (<div className="space-y-4">
              {backupJobs.map((job) => (<ui_1.Card key={job.id}>
                  <ui_1.CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold">{job.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                            {job.status.toUpperCase()}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                            {job.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-dark-400">Frequency</p>
                            <p className="text-white capitalize">{job.frequency}</p>
                          </div>
                          <div>
                            <p className="text-dark-400">Destination</p>
                            <p className="text-white">{job.destination}</p>
                          </div>
                          <div>
                            <p className="text-dark-400">Retention</p>
                            <p className="text-white">{job.retention} days</p>
                          </div>
                          <div>
                            <p className="text-dark-400">Size</p>
                            <p className="text-white">
                              {job.size ? formatFileSize(job.size * 1024 * 1024) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {job.lastRun && (<div className="mt-3 text-xs text-dark-500">
                            Last run: {new Date(job.lastRun).toLocaleString()}
                            {job.duration && ` (${formatDuration(job.duration)})`}
                            {job.nextRun && (<span className="ml-4">
                                Next run: {new Date(job.nextRun).toLocaleString()}
                              </span>)}
                          </div>)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-dark-400 text-sm">Enabled</span>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleJobToggle(job.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${job.enabled ? 'bg-primary-500' : 'bg-dark-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${job.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                          </framer_motion_1.motion.button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <ui_1.Button variant="outline" size="sm" onClick={() => handleRunBackup(job.id)} disabled={job.status === 'running' || loading}>
                            {job.status === 'running' ? 'Running...' : 'Run Now'}
                          </ui_1.Button>
                          <ui_1.Button variant="ghost" size="sm">
                            Configure
                          </ui_1.Button>
                        </div>
                      </div>
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>))}
            </div>)}

          {activeTab === 'files' && (<ui_1.Card>
              <ui_1.CardHeader title="Backup Files"/>
              <ui_1.CardContent>
                <div className="space-y-3">
                  {backupFiles.map((file) => (<div key={file.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{file.filename}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${file.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    file.status === 'archived' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'}`}>
                            {file.status.toUpperCase()}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                            {file.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-dark-400">
                          <div>
                            <span>Size: </span>
                            <span className="text-white">{formatFileSize(file.size)}</span>
                          </div>
                          <div>
                            <span>Location: </span>
                            <span className="text-white">{file.location}</span>
                          </div>
                          <div>
                            <span>Created: </span>
                            <span className="text-white">{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span>Checksum: </span>
                            <span className="text-white font-mono text-xs">
                              {file.checksum.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <ui_1.Button variant="outline" size="sm" onClick={() => handleVerifyBackup(file.id)} disabled={verifyingBackup === file.id}>
                          {verifyingBackup === file.id ? 'Verifying...' : 'Verify'}
                        </ui_1.Button>
                        <ui_1.Button variant="ghost" size="sm">
                          Download
                        </ui_1.Button>
                        <ui_1.Button variant="ghost" size="sm">
                          Delete
                        </ui_1.Button>
                      </div>
                    </div>))}
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'settings' && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="General Backup Settings"/>
                <ui_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Default Retention Period (days)
                      </label>
                      <ui_1.Input type="number" defaultValue="30" min="1" max="365"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Compression Level (1-9)
                      </label>
                      <ui_1.Input type="number" defaultValue="6" min="1" max="9"/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Default Backup Location
                    </label>
                    <ui_1.Input defaultValue="/var/backups/omc-erp" placeholder="Enter backup path"/>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Backup Options</h4>
                    {[
                { key: 'encryptBackups', label: 'Encrypt backup files', description: 'Use AES-256 encryption for backup files' },
                { key: 'verifyIntegrity', label: 'Verify backup integrity', description: 'Automatically verify checksums after backup' },
                { key: 'notifyOnCompletion', label: 'Email notifications', description: 'Send email notifications when backups complete' },
                { key: 'pauseOnError', label: 'Pause on error', description: 'Pause scheduled backups if errors occur' },
            ].map((setting) => (<div key={setting.key} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{setting.label}</p>
                          <p className="text-dark-400 text-sm">{setting.description}</p>
                        </div>
                        <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 transition-colors">
                          <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform"/>
                        </framer_motion_1.motion.button>
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
              
              <ui_1.Card>
                <ui_1.CardHeader title="Storage Destinations"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    {[
                { name: 'Local Storage', type: 'local', path: '/var/backups', status: 'connected' },
                { name: 'AWS S3', type: 's3', path: 'omc-backups', status: 'connected' },
                { name: 'Google Cloud Storage', type: 'gcs', path: 'gs://omc-backups', status: 'connected' },
                { name: 'Azure Blob Storage', type: 'azure', path: 'omc-backups', status: 'disconnected' },
            ].map((destination, index) => (<div key={index} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${destination.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}/>
                          <div>
                            <p className="text-white font-medium">{destination.name}</p>
                            <p className="text-dark-400 text-sm">{destination.path}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${destination.status === 'connected'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'}`}>
                            {destination.status.toUpperCase()}
                          </span>
                          <ui_1.Button variant="ghost" size="sm">
                            Configure
                          </ui_1.Button>
                        </div>
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {activeTab === 'restore' && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="System Restore"/>
                <ui_1.CardContent className="space-y-6">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-red-400 font-medium text-sm">Warning: Data Restoration</p>
                        <p className="text-dark-300 text-sm mt-1">
                          Restoring from a backup will replace all current system data. This action cannot be undone. 
                          Please ensure you have a recent backup before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Select Backup File to Restore
                    </label>
                    <ui_1.Select options={[
                { value: '', label: 'Choose a backup file...' },
                ...backupFiles
                    .filter(file => file.status === 'active')
                    .map(file => ({
                    value: file.id,
                    label: `${file.filename} (${formatFileSize(file.size)}) - ${new Date(file.createdAt).toLocaleDateString()}`
                }))
            ]} value={restoreFile} onChange={setRestoreFile}/>
                  </div>
                  
                  {restoreFile && (<div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">Restore Preview</h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                    const file = backupFiles.find(f => f.id === restoreFile);
                    return file ? (<>
                              <div className="flex justify-between">
                                <span className="text-dark-400">File:</span>
                                <span className="text-white font-mono">{file.filename}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-dark-400">Type:</span>
                                <span className="text-white capitalize">{file.type} backup</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-dark-400">Size:</span>
                                <span className="text-white">{formatFileSize(file.size)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-dark-400">Created:</span>
                                <span className="text-white">{new Date(file.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-dark-400">Location:</span>
                                <span className="text-white">{file.location}</span>
                              </div>
                            </>) : null;
                })()}
                      </div>
                    </div>)}
                  
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-dark-400 text-sm">
                      {restoreFile
                ? 'Ready to restore. This process may take several minutes.'
                : 'Please select a backup file to continue.'}
                    </p>
                    <ui_1.Button variant="primary" onClick={handleRestoreBackup} disabled={!restoreFile || loading} className="bg-red-600 hover:bg-red-700">
                      {loading ? 'Restoring...' : 'Start Restore'}
                    </ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
              
              <ui_1.Card>
                <ui_1.CardHeader title="Point-in-Time Recovery"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    <p className="text-dark-400 text-sm">
                      Restore your system to a specific point in time using transaction logs and incremental backups.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Recovery Date
                        </label>
                        <ui_1.Input type="date" defaultValue="2024-01-13"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Recovery Time
                        </label>
                        <ui_1.Input type="time" defaultValue="18:00"/>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <ui_1.Button variant="outline">
                        Start Point-in-Time Recovery
                      </ui_1.Button>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = BackupSettings;
//# sourceMappingURL=backup.js.map