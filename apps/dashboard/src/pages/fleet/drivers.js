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
const DriversPage = () => {
    const [drivers, setDrivers] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedDriver, setSelectedDriver] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [showAssignmentModal, setShowAssignmentModal] = (0, react_1.useState)(false);
    const [assignmentDriver, setAssignmentDriver] = (0, react_1.useState)(null);
    const [driverForm, setDriverForm] = (0, react_1.useState)({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseClass: 'C',
        licenseExpiry: '',
        dateOfBirth: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        status: 'active',
        experience: 0,
        hireDate: new Date().toISOString().split('T')[0]
    });
    (0, react_1.useEffect)(() => {
        loadDrivers();
        loadVehicles();
    }, []);
    const loadDrivers = async () => {
        try {
            setLoading(true);
            const data = await api_1.fleetService.getDrivers();
            setDrivers(data || generateMockDriverData());
        }
        catch (error) {
            console.error('Failed to load drivers:', error);
            setDrivers(generateMockDriverData());
            react_hot_toast_1.toast.error('Failed to load drivers data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadVehicles = async () => {
        try {
            const data = await api_1.fleetService.getVehicles();
            setVehicles(data || []);
        }
        catch (error) {
            console.error('Failed to load vehicles:', error);
        }
    };
    const generateMockDriverData = () => [
        {
            id: 'd1',
            employeeId: 'EMP001',
            firstName: 'Kwame',
            lastName: 'Asante',
            email: 'kwame.asante@company.com',
            phone: '+233-24-567-8901',
            licenseNumber: 'DL-12345-GH',
            licenseClass: 'CE',
            licenseExpiry: '2025-08-15',
            dateOfBirth: '1985-03-20',
            address: '123 Independence Avenue, Accra, Ghana',
            emergencyContact: {
                name: 'Ama Asante',
                phone: '+233-20-111-2222',
                relationship: 'Wife'
            },
            status: 'active',
            assignedVehicle: {
                id: '1',
                plateNumber: 'GH-4567-23',
                type: 'tanker'
            },
            hireDate: '2020-01-15',
            experience: 8,
            rating: 4.8,
            totalDeliveries: 1247,
            accidents: 0,
            violations: 1,
            documents: {
                license: true,
                medicalCertificate: true,
                criminalCheck: true,
                proofOfAddress: true
            },
            performance: {
                deliverySuccess: 98.5,
                fuelEfficiency: 92.3,
                punctuality: 96.8,
                safetyScore: 97.2
            },
            createdAt: '2020-01-15T09:00:00Z',
            updatedAt: '2024-01-10T14:30:00Z'
        },
        {
            id: 'd2',
            employeeId: 'EMP002',
            firstName: 'Akosua',
            lastName: 'Mensa',
            email: 'akosua.mensa@company.com',
            phone: '+233-20-345-6789',
            licenseNumber: 'DL-67890-GH',
            licenseClass: 'C',
            licenseExpiry: '2024-12-31',
            dateOfBirth: '1988-07-12',
            address: '456 Ring Road East, Accra, Ghana',
            emergencyContact: {
                name: 'Kofi Mensa',
                phone: '+233-24-333-4444',
                relationship: 'Brother'
            },
            status: 'active',
            assignedVehicle: {
                id: '2',
                plateNumber: 'GH-7890-23',
                type: 'delivery'
            },
            hireDate: '2021-06-01',
            experience: 6,
            rating: 4.6,
            totalDeliveries: 892,
            accidents: 1,
            violations: 0,
            documents: {
                license: true,
                medicalCertificate: false,
                criminalCheck: true,
                proofOfAddress: true
            },
            performance: {
                deliverySuccess: 96.2,
                fuelEfficiency: 89.7,
                punctuality: 94.1,
                safetyScore: 93.8
            },
            createdAt: '2021-06-01T10:00:00Z',
            updatedAt: '2024-01-05T16:45:00Z'
        },
        {
            id: 'd3',
            employeeId: 'EMP003',
            firstName: 'Kofi',
            lastName: 'Mensah',
            email: 'kofi.mensah@company.com',
            phone: '+233-24-123-4567',
            licenseNumber: 'DL-11111-GH',
            licenseClass: 'B',
            licenseExpiry: '2025-06-30',
            dateOfBirth: '1990-11-05',
            address: '789 Spintex Road, Accra, Ghana',
            emergencyContact: {
                name: 'Efua Mensah',
                phone: '+233-20-555-6666',
                relationship: 'Mother'
            },
            status: 'active',
            assignedVehicle: {
                id: '3',
                plateNumber: 'GH-1234-24',
                type: 'service'
            },
            hireDate: '2022-03-15',
            experience: 4,
            rating: 4.4,
            totalDeliveries: 456,
            accidents: 0,
            violations: 2,
            documents: {
                license: true,
                medicalCertificate: true,
                criminalCheck: true,
                proofOfAddress: false
            },
            performance: {
                deliverySuccess: 95.8,
                fuelEfficiency: 88.2,
                punctuality: 91.5,
                safetyScore: 89.6
            },
            createdAt: '2022-03-15T08:30:00Z',
            updatedAt: '2024-01-08T12:15:00Z'
        }
    ];
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const handleCreateDriver = () => {
        setIsEditMode(false);
        setDriverForm({
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            licenseNumber: '',
            licenseClass: 'C',
            licenseExpiry: '',
            dateOfBirth: '',
            address: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
            status: 'active',
            experience: 0,
            hireDate: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };
    const handleEditDriver = (driver) => {
        setIsEditMode(true);
        setSelectedDriver(driver);
        setDriverForm({
            employeeId: driver.employeeId,
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            licenseClass: driver.licenseClass,
            licenseExpiry: driver.licenseExpiry,
            dateOfBirth: driver.dateOfBirth,
            address: driver.address,
            emergencyContactName: driver.emergencyContact.name,
            emergencyContactPhone: driver.emergencyContact.phone,
            emergencyContactRelationship: driver.emergencyContact.relationship,
            status: driver.status,
            experience: driver.experience,
            hireDate: driver.hireDate
        });
        setIsModalOpen(true);
    };
    const handleSaveDriver = async () => {
        try {
            const driverData = {
                ...driverForm,
                emergencyContact: {
                    name: driverForm.emergencyContactName,
                    phone: driverForm.emergencyContactPhone,
                    relationship: driverForm.emergencyContactRelationship
                }
            };
            if (isEditMode && selectedDriver) {
                await api_1.fleetService.updateDriver(selectedDriver.id, driverData);
                react_hot_toast_1.toast.success('Driver updated successfully');
            }
            else {
                await api_1.fleetService.createDriver(driverData);
                react_hot_toast_1.toast.success('Driver created successfully');
            }
            setIsModalOpen(false);
            loadDrivers();
        }
        catch (error) {
            console.error('Failed to save driver:', error);
            react_hot_toast_1.toast.error('Failed to save driver');
        }
    };
    const handleAssignVehicle = async (driverId, vehicleId) => {
        try {
            await api_1.fleetService.assignDriver(driverId, vehicleId);
            react_hot_toast_1.toast.success('Driver assigned successfully');
            setShowAssignmentModal(false);
            loadDrivers();
        }
        catch (error) {
            console.error('Failed to assign driver:', error);
            react_hot_toast_1.toast.error('Failed to assign driver');
        }
    };
    const handleUnassignDriver = async (driverId) => {
        try {
            await api_1.fleetService.unassignDriver(driverId);
            react_hot_toast_1.toast.success('Driver unassigned successfully');
            loadDrivers();
        }
        catch (error) {
            console.error('Failed to unassign driver:', error);
            react_hot_toast_1.toast.error('Failed to unassign driver');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'suspended': return 'danger';
            case 'on-leave': return 'warning';
            default: return 'default';
        }
    };
    const getRatingStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (<svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-dark-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>));
    };
    const availableVehicles = vehicles.filter(vehicle => !drivers.some(driver => driver.assignedVehicle?.id === vehicle.id));
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Driver Management</h1>
            <p className="text-dark-400 mt-2">
              Manage drivers, assignments, and track performance metrics
            </p>
          </div>
          
          <ui_1.Button variant="primary" onClick={handleCreateDriver}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Driver
          </ui_1.Button>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Drivers</p>
                  <p className="text-2xl font-bold text-white">{drivers.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Active Drivers</p>
                  <p className="text-2xl font-bold text-white">
                    {drivers.filter(d => d.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Average Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Assigned Vehicles</p>
                  <p className="text-2xl font-bold text-white">
                    {drivers.filter(d => d.assignedVehicle).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Filters and Search */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search by name, employee ID, or license number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'on-leave', label: 'On Leave' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Drivers Table */}
        <ui_1.Card>
          <ui_1.CardHeader title="Fleet Drivers"/>
          <ui_1.CardContent>
            {loading ? (<div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>) : (<ui_1.Table headers={[
                { key: 'driver', label: 'Driver' },
                { key: 'license', label: 'License' },
                { key: 'status', label: 'Status' },
                { key: 'vehicle', label: 'Assigned Vehicle' },
                { key: 'performance', label: 'Performance' },
                { key: 'rating', label: 'Rating' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredDrivers.map(driver => ({
                driver: (<div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{driver.firstName} {driver.lastName}</p>
                        <p className="text-sm text-dark-400">{driver.employeeId} | {driver.phone}</p>
                      </div>
                    </div>),
                license: (<div>
                      <p className="text-white font-medium">{driver.licenseNumber}</p>
                      <p className="text-sm text-dark-400">Class {driver.licenseClass}</p>
                      <p className="text-xs text-dark-500">Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}</p>
                    </div>),
                status: (<ui_1.Badge variant={getStatusColor(driver.status)} className="capitalize">
                      {driver.status.replace('-', ' ')}
                    </ui_1.Badge>),
                vehicle: driver.assignedVehicle ? (<div>
                      <p className="text-white font-medium">{driver.assignedVehicle.plateNumber}</p>
                      <p className="text-sm text-dark-400 capitalize">{driver.assignedVehicle.type}</p>
                    </div>) : (<ui_1.Button variant="outline" size="sm" onClick={() => {
                        setAssignmentDriver(driver);
                        setShowAssignmentModal(true);
                    }}>
                      Assign Vehicle
                    </ui_1.Button>),
                performance: (<div className="text-sm">
                      <p className="text-white">{driver.totalDeliveries} deliveries</p>
                      <p className="text-green-400">{driver.performance.deliverySuccess}% success</p>
                      <p className="text-red-400">{driver.accidents} accidents</p>
                    </div>),
                rating: (<div className="flex items-center space-x-2">
                      <div className="flex">{getRatingStars(driver.rating)}</div>
                      <span className="text-white text-sm">{driver.rating.toFixed(1)}</span>
                    </div>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm" onClick={() => handleEditDriver(driver)}>
                        Edit
                      </ui_1.Button>
                      {driver.assignedVehicle && (<ui_1.Button variant="outline" size="sm" onClick={() => handleUnassignDriver(driver.id)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-500/20">
                          Unassign
                        </ui_1.Button>)}
                    </div>)
            }))}/>)}
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Driver Form Modal */}
        <ui_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Driver' : 'Add New Driver'}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Employee ID" type="text" value={driverForm.employeeId} onChange={(e) => setDriverForm({ ...driverForm, employeeId: e.target.value })} placeholder="e.g., EMP001" required/>
              
              <ui_1.Select label="Status" value={driverForm.status} onChange={(value) => setDriverForm({ ...driverForm, status: value })} options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'on-leave', label: 'On Leave' }
        ]} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="First Name" type="text" value={driverForm.firstName} onChange={(e) => setDriverForm({ ...driverForm, firstName: e.target.value })} required/>
              
              <ui_1.Input label="Last Name" type="text" value={driverForm.lastName} onChange={(e) => setDriverForm({ ...driverForm, lastName: e.target.value })} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Email" type="email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} required/>
              
              <ui_1.Input label="Phone" type="tel" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Input label="License Number" type="text" value={driverForm.licenseNumber} onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} required/>
              
              <ui_1.Select label="License Class" value={driverForm.licenseClass} onChange={(value) => setDriverForm({ ...driverForm, licenseClass: value })} options={[
            { value: 'A', label: 'Class A' },
            { value: 'B', label: 'Class B' },
            { value: 'C', label: 'Class C' },
            { value: 'CE', label: 'Class CE' },
            { value: 'D', label: 'Class D' }
        ]} required/>
              
              <ui_1.Input label="License Expiry" type="date" value={driverForm.licenseExpiry} onChange={(e) => setDriverForm({ ...driverForm, licenseExpiry: e.target.value })} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Date of Birth" type="date" value={driverForm.dateOfBirth} onChange={(e) => setDriverForm({ ...driverForm, dateOfBirth: e.target.value })} required/>
              
              <ui_1.Input label="Years of Experience" type="number" value={driverForm.experience} onChange={(e) => setDriverForm({ ...driverForm, experience: parseInt(e.target.value) || 0 })} min="0" required/>
            </div>

            <ui_1.Input label="Address" type="text" value={driverForm.address} onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })} required/>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ui_1.Input label="Contact Name" type="text" value={driverForm.emergencyContactName} onChange={(e) => setDriverForm({ ...driverForm, emergencyContactName: e.target.value })} required/>
                
                <ui_1.Input label="Contact Phone" type="tel" value={driverForm.emergencyContactPhone} onChange={(e) => setDriverForm({ ...driverForm, emergencyContactPhone: e.target.value })} required/>
                
                <ui_1.Input label="Relationship" type="text" value={driverForm.emergencyContactRelationship} onChange={(e) => setDriverForm({ ...driverForm, emergencyContactRelationship: e.target.value })} placeholder="e.g., Wife, Brother" required/>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveDriver}>
                {isEditMode ? 'Update Driver' : 'Create Driver'}
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>

        {/* Vehicle Assignment Modal */}
        <ui_1.Modal isOpen={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title="Assign Vehicle to Driver">
          <div className="space-y-6">
            {assignmentDriver && (<div className="p-4 bg-dark-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Driver Information</h3>
                <p className="text-dark-400">
                  {assignmentDriver.firstName} {assignmentDriver.lastName} ({assignmentDriver.employeeId})
                </p>
                <p className="text-dark-400">License: {assignmentDriver.licenseNumber} (Class {assignmentDriver.licenseClass})</p>
              </div>)}

            <div>
              <h3 className="font-medium text-white mb-4">Available Vehicles</h3>
              <div className="space-y-2">
                {availableVehicles.length > 0 ? availableVehicles.map(vehicle => (<div key={vehicle.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{vehicle.plateNumber}</p>
                      <p className="text-dark-400 capitalize">{vehicle.make} {vehicle.model} - {vehicle.type}</p>
                    </div>
                    <ui_1.Button variant="primary" size="sm" onClick={() => assignmentDriver && handleAssignVehicle(assignmentDriver.id, vehicle.id)}>
                      Assign
                    </ui_1.Button>
                  </div>)) : (<p className="text-dark-400 text-center py-8">No available vehicles to assign</p>)}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setShowAssignmentModal(false)}>
                Cancel
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DriversPage;
//# sourceMappingURL=drivers.js.map