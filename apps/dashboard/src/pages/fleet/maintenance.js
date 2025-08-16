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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const MaintenancePage = () => {
    const [schedules, setSchedules] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedSchedule, setSelectedSchedule] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('scheduled');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [showLogModal, setShowLogModal] = (0, react_1.useState)(false);
    const [maintenanceForm, setMaintenanceForm] = (0, react_1.useState)({
        vehicleId: '',
        type: 'routine',
        description: '',
        scheduledDate: '',
        priority: 'medium',
        costEstimate: 0,
        serviceProvider: '',
        notes: '',
        parts: [{ name: '', quantity: 1, cost: 0, partNumber: '' }]
    });
    const [logForm, setLogForm] = (0, react_1.useState)({
        workPerformed: '',
        partsReplaced: '',
        laborHours: 0,
        cost: 0,
        technician: '',
        quality: 'good',
        warrantyType: 'both',
        warrantyDuration: 6,
        followUpRequired: false,
        followUpDate: '',
        notes: ''
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [schedulesData, vehiclesData] = await Promise.all([
                api_1.fleetService.getMaintenanceSchedules(),
                api_1.fleetService.getVehicles()
            ]);
            setSchedules(schedulesData || generateMockScheduleData());
            setVehicles(vehiclesData || []);
        }
        catch (error) {
            console.error('Failed to load data:', error);
            setSchedules(generateMockScheduleData());
            react_hot_toast_1.toast.error('Failed to load maintenance data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockScheduleData = () => [
        {
            id: 'm1',
            vehicleId: '1',
            vehicle: {
                plateNumber: 'GH-4567-23',
                make: 'Mercedes-Benz',
                model: 'Actros 2545',
                type: 'tanker',
                currentMileage: 125000
            },
            type: 'routine',
            description: 'Engine oil change and filter replacement',
            scheduledDate: '2024-01-20',
            status: 'scheduled',
            priority: 'medium',
            costEstimate: 850,
            serviceProvider: 'Mercedes Service Center',
            parts: [
                { name: 'Engine Oil (15W-40)', quantity: 25, cost: 500, partNumber: 'MB-OIL-15W40' },
                { name: 'Oil Filter', quantity: 1, cost: 120, partNumber: 'MB-OF-2545' }
            ],
            notes: 'Regular maintenance due at 125,000km',
            documents: [],
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-10T09:00:00Z'
        },
        {
            id: 'm2',
            vehicleId: '2',
            vehicle: {
                plateNumber: 'GH-7890-23',
                make: 'Isuzu',
                model: 'NPR 75',
                type: 'delivery',
                currentMileage: 89000
            },
            type: 'repair',
            description: 'Brake system repair and wheel alignment',
            scheduledDate: '2024-01-18',
            status: 'in-progress',
            priority: 'high',
            costEstimate: 1200,
            actualCost: 1350,
            serviceProvider: 'City Auto Repair',
            technician: {
                name: 'John Mensah',
                phone: '+233-24-111-2222'
            },
            parts: [
                { name: 'Brake Pads (Front)', quantity: 1, cost: 300, partNumber: 'ISZ-BP-F75' },
                { name: 'Brake Discs', quantity: 2, cost: 600, partNumber: 'ISZ-BD-75' }
            ],
            notes: 'Customer reported grinding noise when braking',
            documents: [
                { type: 'invoice', filename: 'brake_repair_invoice.pdf', url: '/docs/brake_repair.pdf' }
            ],
            createdAt: '2024-01-15T11:30:00Z',
            updatedAt: '2024-01-18T14:20:00Z'
        },
        {
            id: 'm3',
            vehicleId: '3',
            vehicle: {
                plateNumber: 'GH-1234-24',
                make: 'Toyota',
                model: 'Hilux',
                type: 'service',
                currentMileage: 35000
            },
            type: 'inspection',
            description: 'Annual roadworthiness inspection',
            scheduledDate: '2024-01-25',
            status: 'scheduled',
            priority: 'medium',
            costEstimate: 200,
            serviceProvider: 'DVLA Inspection Center',
            parts: [],
            notes: 'Due for annual roadworthy certificate renewal',
            documents: [],
            createdAt: '2024-01-08T08:00:00Z',
            updatedAt: '2024-01-08T08:00:00Z'
        },
        {
            id: 'm4',
            vehicleId: '1',
            vehicle: {
                plateNumber: 'GH-4567-23',
                make: 'Mercedes-Benz',
                model: 'Actros 2545',
                type: 'tanker',
                currentMileage: 125000
            },
            type: 'preventive',
            description: 'Transmission service and cooling system check',
            scheduledDate: '2024-02-15',
            nextScheduledDate: '2024-08-15',
            status: 'scheduled',
            priority: 'low',
            costEstimate: 1500,
            serviceProvider: 'Mercedes Service Center',
            parts: [
                { name: 'Transmission Fluid', quantity: 12, cost: 720, partNumber: 'MB-TF-ATF' },
                { name: 'Coolant', quantity: 20, cost: 400, partNumber: 'MB-CL-G12' }
            ],
            notes: 'Preventive maintenance to extend vehicle life',
            documents: [],
            createdAt: '2024-01-05T10:00:00Z',
            updatedAt: '2024-01-05T10:00:00Z'
        }
    ];
    const filteredSchedules = schedules.filter(schedule => {
        const matchesSearch = schedule.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.serviceProvider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
        const matchesType = filterType === 'all' || schedule.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });
    const upcomingMaintenance = schedules.filter(s => new Date(s.scheduledDate) > new Date() && s.status === 'scheduled').sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    const overdueMaintenance = schedules.filter(s => new Date(s.scheduledDate) < new Date() && s.status === 'scheduled');
    const handleCreateMaintenance = () => {
        setIsEditMode(false);
        setMaintenanceForm({
            vehicleId: '',
            type: 'routine',
            description: '',
            scheduledDate: '',
            priority: 'medium',
            costEstimate: 0,
            serviceProvider: '',
            notes: '',
            parts: [{ name: '', quantity: 1, cost: 0, partNumber: '' }]
        });
        setIsModalOpen(true);
    };
    const handleEditMaintenance = (schedule) => {
        setIsEditMode(true);
        setSelectedSchedule(schedule);
        setMaintenanceForm({
            vehicleId: schedule.vehicleId,
            type: schedule.type,
            description: schedule.description,
            scheduledDate: schedule.scheduledDate,
            priority: schedule.priority,
            costEstimate: schedule.costEstimate,
            serviceProvider: schedule.serviceProvider,
            notes: schedule.notes || '',
            parts: schedule.parts.length > 0 ? schedule.parts : [{ name: '', quantity: 1, cost: 0, partNumber: '' }]
        });
        setIsModalOpen(true);
    };
    const handleSaveMaintenance = async () => {
        try {
            if (isEditMode && selectedSchedule) {
                await api_1.fleetService.updateMaintenanceSchedule(selectedSchedule.id, maintenanceForm);
                react_hot_toast_1.toast.success('Maintenance schedule updated successfully');
            }
            else {
                await api_1.fleetService.scheduleMaintenancePlan(maintenanceForm);
                react_hot_toast_1.toast.success('Maintenance schedule created successfully');
            }
            setIsModalOpen(false);
            loadData();
        }
        catch (error) {
            console.error('Failed to save maintenance schedule:', error);
            react_hot_toast_1.toast.error('Failed to save maintenance schedule');
        }
    };
    const handleCompleteService = (schedule) => {
        setSelectedSchedule(schedule);
        setLogForm({
            workPerformed: schedule.description,
            partsReplaced: schedule.parts.map(p => p.name).join(', '),
            laborHours: 0,
            cost: schedule.costEstimate,
            technician: schedule.technician?.name || '',
            quality: 'good',
            warrantyType: 'both',
            warrantyDuration: 6,
            followUpRequired: false,
            followUpDate: '',
            notes: ''
        });
        setShowLogModal(true);
    };
    const handleSaveMaintenanceLog = async () => {
        if (!selectedSchedule)
            return;
        try {
            const logData = {
                ...logForm,
                scheduleId: selectedSchedule.id,
                vehicleId: selectedSchedule.vehicleId,
                completedDate: new Date().toISOString(),
                warranty: {
                    type: logForm.warrantyType,
                    duration: logForm.warrantyDuration,
                    expiryDate: new Date(Date.now() + logForm.warrantyDuration * 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            };
            await api_1.fleetService.recordMaintenanceLog(logData);
            react_hot_toast_1.toast.success('Maintenance completed and logged successfully');
            setShowLogModal(false);
            loadData();
        }
        catch (error) {
            console.error('Failed to log maintenance completion:', error);
            react_hot_toast_1.toast.error('Failed to log maintenance completion');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'in-progress': return 'warning';
            case 'completed': return 'success';
            case 'overdue': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'default';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };
    const addPart = () => {
        setMaintenanceForm({
            ...maintenanceForm,
            parts: [...maintenanceForm.parts, { name: '', quantity: 1, cost: 0, partNumber: '' }]
        });
    };
    const removePart = (index) => {
        const newParts = maintenanceForm.parts.filter((_, i) => i !== index);
        setMaintenanceForm({ ...maintenanceForm, parts: newParts });
    };
    const updatePart = (index, field, value) => {
        const newParts = maintenanceForm.parts.map((part, i) => i === index ? { ...part, [field]: value } : part);
        setMaintenanceForm({ ...maintenanceForm, parts: newParts });
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Maintenance Management</h1>
            <p className="text-dark-400 mt-2">
              Schedule and track vehicle maintenance to ensure optimal performance
            </p>
          </div>
          
          <ui_1.Button variant="primary" onClick={handleCreateMaintenance}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Schedule Maintenance
          </ui_1.Button>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Scheduled</p>
                  <p className="text-2xl font-bold text-white">{schedules.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">In Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {schedules.filter(s => s.status === 'in-progress').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Overdue</p>
                  <p className="text-2xl font-bold text-white">{overdueMaintenance.length}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">This Month Cost</p>
                  <p className="text-2xl font-bold text-white">
                    GHS {schedules.reduce((sum, s) => sum + (s.actualCost || s.costEstimate), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Upcoming Maintenance Alert */}
        {upcomingMaintenance.length > 0 && (<ui_1.Card className="border-l-4 border-l-yellow-500">
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white mb-2">Upcoming Maintenance</h3>
                  <p className="text-dark-400">
                    {upcomingMaintenance.length} maintenance{upcomingMaintenance.length > 1 ? 's' : ''} scheduled for this week
                  </p>
                </div>
                <ui_1.Button variant="outline" size="sm">
                  View All
                </ui_1.Button>
              </div>
              <div className="mt-4 space-y-2">
                {upcomingMaintenance.slice(0, 3).map(maintenance => (<div key={maintenance.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{maintenance.vehicle.plateNumber}</p>
                        <p className="text-sm text-dark-400">{maintenance.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
                      <ui_1.Badge variant={getPriorityColor(maintenance.priority)} className="text-xs">
                        {maintenance.priority}
                      </ui_1.Badge>
                    </div>
                  </div>))}
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'scheduled', label: 'Scheduled Maintenance' },
            { key: 'history', label: 'Maintenance History' },
            { key: 'upcoming', label: 'Upcoming Services' }
        ].map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Filters and Search */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search by vehicle, description, or service provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'cancelled', label: 'Cancelled' }
        ]} className="w-full md:w-48"/>
              <ui_1.Select value={filterType} onChange={setFilterType} options={[
            { value: 'all', label: 'All Types' },
            { value: 'routine', label: 'Routine' },
            { value: 'preventive', label: 'Preventive' },
            { value: 'repair', label: 'Repair' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'emergency', label: 'Emergency' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Maintenance Table */}
        <ui_1.Card>
          <ui_1.CardHeader title="Maintenance Schedules"/>
          <ui_1.CardContent>
            {loading ? (<div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>) : (<ui_1.Table headers={[
                { key: 'vehicle', label: 'Vehicle' },
                { key: 'service', label: 'Service Details' },
                { key: 'scheduled', label: 'Scheduled Date' },
                { key: 'status', label: 'Status' },
                { key: 'cost', label: 'Cost' },
                { key: 'provider', label: 'Service Provider' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredSchedules.map(schedule => ({
                vehicle: (<div>
                      <p className="font-medium text-white">{schedule.vehicle.plateNumber}</p>
                      <p className="text-sm text-dark-400">
                        {schedule.vehicle.make} {schedule.vehicle.model}
                      </p>
                      <p className="text-xs text-dark-500">
                        {schedule.vehicle.currentMileage.toLocaleString()}km
                      </p>
                    </div>),
                service: (<div>
                      <div className="flex items-center space-x-2 mb-1">
                        <ui_1.Badge variant="outline" className="text-xs capitalize">
                          {schedule.type}
                        </ui_1.Badge>
                        <ui_1.Badge variant={getPriorityColor(schedule.priority)} className="text-xs">
                          {schedule.priority}
                        </ui_1.Badge>
                      </div>
                      <p className="text-white font-medium">{schedule.description}</p>
                      <p className="text-sm text-dark-400">
                        {schedule.parts.length} part{schedule.parts.length !== 1 ? 's' : ''} required
                      </p>
                    </div>),
                scheduled: (<div>
                      <p className="text-white">{new Date(schedule.scheduledDate).toLocaleDateString()}</p>
                      {schedule.completedDate && (<p className="text-sm text-green-400">
                          Completed: {new Date(schedule.completedDate).toLocaleDateString()}
                        </p>)}
                    </div>),
                status: (<ui_1.Badge variant={getStatusColor(schedule.status)} className="capitalize">
                      {schedule.status.replace('-', ' ')}
                    </ui_1.Badge>),
                cost: (<div>
                      <p className="text-white font-medium">
                        GHS {(schedule.actualCost || schedule.costEstimate).toLocaleString()}
                      </p>
                      {schedule.actualCost && schedule.actualCost !== schedule.costEstimate && (<p className="text-sm text-dark-400">
                          Est: GHS {schedule.costEstimate.toLocaleString()}
                        </p>)}
                    </div>),
                provider: (<div>
                      <p className="text-white">{schedule.serviceProvider}</p>
                      {schedule.technician && (<p className="text-sm text-dark-400">{schedule.technician.name}</p>)}
                    </div>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm" onClick={() => handleEditMaintenance(schedule)}>
                        Edit
                      </ui_1.Button>
                      {schedule.status === 'in-progress' && (<ui_1.Button variant="primary" size="sm" onClick={() => handleCompleteService(schedule)}>
                          Complete
                        </ui_1.Button>)}
                    </div>)
            }))}/>)}
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Maintenance Form Modal */}
        <ui_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Maintenance Schedule' : 'Schedule New Maintenance'}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Select label="Vehicle" value={maintenanceForm.vehicleId} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, vehicleId: value })} options={vehicles.map(v => ({ value: v.id, label: `${v.plateNumber} - ${v.make} ${v.model}` }))} required/>
              
              <ui_1.Select label="Maintenance Type" value={maintenanceForm.type} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, type: value })} options={[
            { value: 'routine', label: 'Routine Maintenance' },
            { value: 'preventive', label: 'Preventive Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'emergency', label: 'Emergency' }
        ]} required/>
            </div>

            <ui_1.Input label="Service Description" type="text" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} placeholder="e.g., Engine oil change and filter replacement" required/>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Input label="Scheduled Date" type="date" value={maintenanceForm.scheduledDate} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })} required/>
              
              <ui_1.Select label="Priority" value={maintenanceForm.priority} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, priority: value })} options={[
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'high', label: 'High Priority' },
            { value: 'critical', label: 'Critical' }
        ]} required/>
              
              <ui_1.Input label="Cost Estimate (GHS)" type="number" value={maintenanceForm.costEstimate} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, costEstimate: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required/>
            </div>

            <ui_1.Input label="Service Provider" type="text" value={maintenanceForm.serviceProvider} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceProvider: e.target.value })} placeholder="e.g., Mercedes Service Center" required/>

            {/* Parts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Required Parts</h3>
                <ui_1.Button variant="outline" size="sm" onClick={addPart}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Part
                </ui_1.Button>
              </div>
              
              <div className="space-y-3">
                {maintenanceForm.parts.map((part, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-dark-700 rounded-lg">
                    <ui_1.Input placeholder="Part name" value={part.name} onChange={(e) => updatePart(index, 'name', e.target.value)} className="md:col-span-2"/>
                    <ui_1.Input placeholder="Quantity" type="number" value={part.quantity} onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)} min="1"/>
                    <ui_1.Input placeholder="Cost (GHS)" type="number" value={part.cost} onChange={(e) => updatePart(index, 'cost', parseFloat(e.target.value) || 0)} min="0" step="0.01"/>
                    <div className="flex items-center">
                      {maintenanceForm.parts.length > 1 && (<ui_1.Button variant="outline" size="sm" onClick={() => removePart(index)} className="text-red-400 border-red-400 hover:bg-red-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </ui_1.Button>)}
                    </div>
                  </div>))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Notes</label>
              <textarea value={maintenanceForm.notes} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Additional notes or special instructions..."/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveMaintenance}>
                {isEditMode ? 'Update Schedule' : 'Schedule Maintenance'}
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>

        {/* Maintenance Log Modal */}
        <ui_1.Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Complete Maintenance Service">
          <div className="space-y-6">
            {selectedSchedule && (<div className="p-4 bg-dark-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Service Information</h3>
                <p className="text-dark-400">
                  Vehicle: {selectedSchedule.vehicle.plateNumber} - {selectedSchedule.description}
                </p>
                <p className="text-dark-400">
                  Scheduled: {new Date(selectedSchedule.scheduledDate).toLocaleDateString()}
                </p>
              </div>)}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Work Performed</label>
              <textarea value={logForm.workPerformed} onChange={(e) => setLogForm({ ...logForm, workPerformed: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Describe the work performed..." required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Labor Hours" type="number" value={logForm.laborHours} onChange={(e) => setLogForm({ ...logForm, laborHours: parseFloat(e.target.value) || 0 })} min="0" step="0.5" required/>
              
              <ui_1.Input label="Actual Cost (GHS)" type="number" value={logForm.cost} onChange={(e) => setLogForm({ ...logForm, cost: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Technician Name" type="text" value={logForm.technician} onChange={(e) => setLogForm({ ...logForm, technician: e.target.value })} required/>
              
              <ui_1.Select label="Service Quality" value={logForm.quality} onChange={(value) => setLogForm({ ...logForm, quality: value })} options={[
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' }
        ]} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Select label="Warranty Type" value={logForm.warrantyType} onChange={(value) => setLogForm({ ...logForm, warrantyType: value })} options={[
            { value: 'parts', label: 'Parts Only' },
            { value: 'labor', label: 'Labor Only' },
            { value: 'both', label: 'Parts & Labor' }
        ]} required/>
              
              <ui_1.Input label="Warranty Duration (months)" type="number" value={logForm.warrantyDuration} onChange={(e) => setLogForm({ ...logForm, warrantyDuration: parseInt(e.target.value) || 0 })} min="0" required/>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={logForm.followUpRequired} onChange={(e) => setLogForm({ ...logForm, followUpRequired: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                <span className="text-dark-400">Follow-up service required</span>
              </label>
              {logForm.followUpRequired && (<ui_1.Input label="Follow-up Date" type="date" value={logForm.followUpDate} onChange={(e) => setLogForm({ ...logForm, followUpDate: e.target.value })} className="mt-3" required/>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Additional Notes</label>
              <textarea value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Any additional notes or observations..."/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setShowLogModal(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveMaintenanceLog}>
                Complete Service
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = MaintenancePage;
//# sourceMappingURL=maintenance.js.map