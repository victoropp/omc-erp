import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface Station {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  location: {
    latitude: number;
    longitude: number;
    region: string;
  };
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  status: string;
  isActive: boolean;
  tankCount: number;
  pumpCount: number;
  totalCapacity: number;
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

interface Tank {
  id: string;
  stationId: string;
  tankNumber: string;
  fuelType: string;
  tankType: string;
  capacity: number;
  currentVolume: number;
  reservedVolume: number;
  minimumLevel: number;
  maximumLevel: number;
  lastCalibrationDate: string;
  status: string;
  sensorId?: string;
  isMonitored: boolean;
}

interface Pump {
  id: string;
  stationId: string;
  tankId: string;
  pumpNumber: string;
  pumpType: string;
  brand: string;
  model: string;
  serialNumber: string;
  nozzleCount: number;
  status: string;
  isOperational: boolean;
  currentTotalizer: number;
  lastCalibrationDate: string;
  calibrationDueDate: string;
}

const StationManagement: NextPage = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stations' | 'tanks' | 'pumps'>('stations');
  
  // Modal states
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isTankModalOpen, setIsTankModalOpen] = useState(false);
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form data states
  const [stationFormData, setStationFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    region: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    operatingHoursStart: '06:00',
    operatingHoursEnd: '22:00',
    latitude: '',
    longitude: '',
  });

  const [tankFormData, setTankFormData] = useState({
    tankNumber: '',
    fuelType: 'PMS',
    tankType: 'underground',
    capacity: '',
    minimumLevel: '1000',
    maximumLevel: '',
    sensorId: '',
    isMonitored: false,
  });

  const [pumpFormData, setPumpFormData] = useState({
    tankId: '',
    pumpNumber: '',
    pumpType: 'dispensing',
    brand: '',
    model: '',
    serialNumber: '',
    nozzleCount: '1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setStations(sampleStations);
      setTanks(sampleTanks);
      setPumps(samplePumps);
    } catch (error) {
      toast.error('Failed to load station data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Station created successfully');
      setIsStationModalOpen(false);
      resetStationForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create station');
    }
  };

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Tank created successfully');
      setIsTankModalOpen(false);
      resetTankForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create tank');
    }
  };

  const handleCreatePump = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Pump created successfully');
      setIsPumpModalOpen(false);
      resetPumpForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create pump');
    }
  };

  const resetStationForm = () => {
    setStationFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      region: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      operatingHoursStart: '06:00',
      operatingHoursEnd: '22:00',
      latitude: '',
      longitude: '',
    });
    setIsEditMode(false);
  };

  const resetTankForm = () => {
    setTankFormData({
      tankNumber: '',
      fuelType: 'PMS',
      tankType: 'underground',
      capacity: '',
      minimumLevel: '1000',
      maximumLevel: '',
      sensorId: '',
      isMonitored: false,
    });
  };

  const resetPumpForm = () => {
    setPumpFormData({
      tankId: '',
      pumpNumber: '',
      pumpType: 'dispensing',
      brand: '',
      model: '',
      serialNumber: '',
      nozzleCount: '1',
    });
  };

  const openEditStation = (station: Station) => {
    setSelectedStation(station);
    setStationFormData({
      name: station.name,
      code: station.code,
      address: station.address,
      phone: station.phone,
      email: station.email,
      region: station.location.region,
      managerName: station.managerName,
      managerPhone: station.managerPhone,
      managerEmail: station.managerEmail,
      operatingHoursStart: station.operatingHoursStart,
      operatingHoursEnd: station.operatingHoursEnd,
      latitude: station.location.latitude.toString(),
      longitude: station.location.longitude.toString(),
    });
    setIsEditMode(true);
    setIsStationModalOpen(true);
  };

  // Options for dropdowns
  const ghanaRegions = [
    { value: 'Greater Accra', label: 'Greater Accra' },
    { value: 'Ashanti', label: 'Ashanti' },
    { value: 'Western', label: 'Western' },
    { value: 'Eastern', label: 'Eastern' },
    { value: 'Central', label: 'Central' },
    { value: 'Northern', label: 'Northern' },
    { value: 'Upper East', label: 'Upper East' },
    { value: 'Upper West', label: 'Upper West' },
    { value: 'Volta', label: 'Volta' },
    { value: 'Brong Ahafo', label: 'Brong Ahafo' },
  ];

  const fuelTypes = [
    { value: 'PMS', label: 'Petrol (PMS)' },
    { value: 'AGO', label: 'Diesel (AGO)' },
    { value: 'LPG', label: 'LPG' },
    { value: 'KEROSENE', label: 'Kerosene' },
  ];

  const tankTypes = [
    { value: 'underground', label: 'Underground' },
    { value: 'overground', label: 'Overground' },
    { value: 'mobile', label: 'Mobile' },
  ];

  // Table columns
  const stationColumns = [
    { key: 'code' as keyof Station, header: 'Code', width: '10%', sortable: true },
    { key: 'name' as keyof Station, header: 'Station Name', width: '20%', sortable: true },
    { key: 'address' as keyof Station, header: 'Address', width: '25%' },
    { key: 'managerName' as keyof Station, header: 'Manager', width: '15%' },
    { key: 'status' as keyof Station, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'tankCount' as keyof Station, header: 'Tanks', width: '8%' },
    { key: 'pumpCount' as keyof Station, header: 'Pumps', width: '8%' },
    { key: 'id' as keyof Station, header: 'Actions', width: '12%',
      render: (value: string, row: Station) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEditStation(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const tankColumns = [
    { key: 'tankNumber' as keyof Tank, header: 'Tank #', width: '10%', sortable: true },
    { key: 'fuelType' as keyof Tank, header: 'Fuel Type', width: '12%' },
    { key: 'capacity' as keyof Tank, header: 'Capacity (L)', width: '12%',
      render: (value: number) => value.toLocaleString()
    },
    { key: 'currentVolume' as keyof Tank, header: 'Current Volume', width: '15%',
      render: (value: number, row: Tank) => (
        <div>
          <div className="text-sm font-medium">{value.toLocaleString()}L</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(value / row.capacity) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    { key: 'status' as keyof Tank, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'isMonitored' as keyof Tank, header: 'Monitoring', width: '12%',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {value ? 'IoT Enabled' : 'Manual'}
        </span>
      )
    },
    { key: 'id' as keyof Tank, header: 'Actions', width: '12%',
      render: (value: string) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const pumpColumns = [
    { key: 'pumpNumber' as keyof Pump, header: 'Pump #', width: '10%', sortable: true },
    { key: 'brand' as keyof Pump, header: 'Brand/Model', width: '15%',
      render: (value: string, row: Pump) => `${value} ${row.model}`
    },
    { key: 'nozzleCount' as keyof Pump, header: 'Nozzles', width: '10%' },
    { key: 'currentTotalizer' as keyof Pump, header: 'Totalizer', width: '15%',
      render: (value: number) => `${value.toLocaleString()}L`
    },
    { key: 'status' as keyof Pump, header: 'Status', width: '12%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'calibrationDueDate' as keyof Pump, header: 'Next Calibration', width: '15%',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'id' as keyof Pump, header: 'Actions', width: '12%',
      render: (value: string) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const tabs = [
    { id: 'stations', label: 'Stations', count: stations.length },
    { id: 'tanks', label: 'Tanks', count: tanks.length },
    { id: 'pumps', label: 'Pumps', count: pumps.length },
  ];

  // Sample data
  const sampleStations: Station[] = [
    {
      id: '1',
      name: 'Tema Main Station',
      code: 'TM-001',
      address: 'Tema Port Road, Tema',
      phone: '+233-303-202-123',
      email: 'tema.main@omc.com.gh',
      location: { latitude: 5.6167, longitude: -0.0167, region: 'Greater Accra' },
      managerName: 'Kwame Asante',
      managerPhone: '+233-244-123-456',
      managerEmail: 'kwame.asante@omc.com.gh',
      operatingHoursStart: '06:00',
      operatingHoursEnd: '22:00',
      status: 'active',
      isActive: true,
      tankCount: 6,
      pumpCount: 12,
      totalCapacity: 180000,
      facilities: ['ATM', 'Shop', 'Car Wash', 'Restaurant'],
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-12T14:30:00Z',
    },
    {
      id: '2',
      name: 'Accra Central Station',
      code: 'AC-002',
      address: 'Ring Road Central, Accra',
      phone: '+233-302-245-678',
      email: 'accra.central@omc.com.gh',
      location: { latitude: 5.6037, longitude: -0.1870, region: 'Greater Accra' },
      managerName: 'Ama Serwaa',
      managerPhone: '+233-244-234-567',
      managerEmail: 'ama.serwaa@omc.com.gh',
      operatingHoursStart: '05:30',
      operatingHoursEnd: '23:00',
      status: 'active',
      isActive: true,
      tankCount: 4,
      pumpCount: 8,
      totalCapacity: 120000,
      facilities: ['ATM', 'Shop', 'Restaurant'],
      createdAt: '2023-03-20T09:15:00Z',
      updatedAt: '2024-01-10T16:45:00Z',
    },
  ];

  const sampleTanks: Tank[] = [
    {
      id: '1',
      stationId: '1',
      tankNumber: 'T-001',
      fuelType: 'PMS',
      tankType: 'underground',
      capacity: 30000,
      currentVolume: 25000,
      reservedVolume: 2000,
      minimumLevel: 5000,
      maximumLevel: 29000,
      lastCalibrationDate: '2023-12-15',
      status: 'active',
      sensorId: 'ATG-001-T1',
      isMonitored: true,
    },
    {
      id: '2',
      stationId: '1',
      tankNumber: 'T-002',
      fuelType: 'AGO',
      tankType: 'underground',
      capacity: 30000,
      currentVolume: 18000,
      reservedVolume: 1500,
      minimumLevel: 5000,
      maximumLevel: 29000,
      lastCalibrationDate: '2023-12-15',
      status: 'active',
      sensorId: 'ATG-001-T2',
      isMonitored: true,
    },
  ];

  const samplePumps: Pump[] = [
    {
      id: '1',
      stationId: '1',
      tankId: '1',
      pumpNumber: 'P-001',
      pumpType: 'dispensing',
      brand: 'Wayne',
      model: 'Helix 6000',
      serialNumber: 'WH6000-001',
      nozzleCount: 2,
      status: 'active',
      isOperational: true,
      currentTotalizer: 1250000,
      lastCalibrationDate: '2024-01-05',
      calibrationDueDate: '2024-07-05',
    },
    {
      id: '2',
      stationId: '1',
      tankId: '2',
      pumpNumber: 'P-002',
      pumpType: 'dispensing',
      brand: 'Gilbarco',
      model: 'Encore 700S',
      serialNumber: 'GB700S-002',
      nozzleCount: 2,
      status: 'active',
      isOperational: true,
      currentTotalizer: 980000,
      lastCalibrationDate: '2024-01-08',
      calibrationDueDate: '2024-07-08',
    },
  ];

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Station Management
            </h1>
            <p className="text-dark-400 mt-2">
              Comprehensive station, tank, and pump management
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => {
                if (activeTab === 'stations') setIsStationModalOpen(true);
                if (activeTab === 'tanks') setIsTankModalOpen(true);
                if (activeTab === 'pumps') setIsPumpModalOpen(true);
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Stations</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{stations.length}</p>
              <p className="text-sm text-green-400">{stations.filter(s => s.isActive).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Tanks</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{tanks.length}</p>
              <p className="text-sm text-green-400">{tanks.filter(t => t.status === 'active').length} operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Pumps</h3>
              <p className="text-3xl font-bold text-purple-400 mb-1">{pumps.length}</p>
              <p className="text-sm text-green-400">{pumps.filter(p => p.isOperational).length} operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Capacity</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">
                {stations.reduce((sum, s) => sum + s.totalCapacity, 0).toLocaleString()}L
              </p>
              <p className="text-sm text-dark-400">Combined storage</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-dark-600 text-dark-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'stations' && (
            <Card>
              <CardHeader title="Station Management" />
              <CardContent>
                <Table
                  data={stations}
                  columns={stationColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: stations.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'tanks' && (
            <Card>
              <CardHeader title="Tank Management" />
              <CardContent>
                <Table
                  data={tanks}
                  columns={tankColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: tanks.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'pumps' && (
            <Card>
              <CardHeader title="Pump Management" />
              <CardContent>
                <Table
                  data={pumps}
                  columns={pumpColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: pumps.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Station Modal */}
        <FormModal
          isOpen={isStationModalOpen}
          onClose={() => {
            setIsStationModalOpen(false);
            resetStationForm();
          }}
          onSubmit={handleCreateStation}
          title={isEditMode ? 'Edit Station' : 'Create New Station'}
          submitText={isEditMode ? 'Update Station' : 'Create Station'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Station Name"
              placeholder="Enter station name"
              value={stationFormData.name}
              onChange={(e) => setStationFormData({ ...stationFormData, name: e.target.value })}
              required
            />
            <Input
              label="Station Code"
              placeholder="ST-001"
              value={stationFormData.code}
              onChange={(e) => setStationFormData({ ...stationFormData, code: e.target.value })}
              required
            />
          </div>

          <Input
            label="Address"
            placeholder="Full station address"
            value={stationFormData.address}
            onChange={(e) => setStationFormData({ ...stationFormData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+233-XXX-XXX-XXX"
              value={stationFormData.phone}
              onChange={(e) => setStationFormData({ ...stationFormData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="station@omc.com.gh"
              value={stationFormData.email}
              onChange={(e) => setStationFormData({ ...stationFormData, email: e.target.value })}
            />
          </div>

          <Select
            label="Region"
            options={ghanaRegions}
            value={stationFormData.region}
            onChange={(value) => setStationFormData({ ...stationFormData, region: value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              placeholder="5.6167"
              value={stationFormData.latitude}
              onChange={(e) => setStationFormData({ ...stationFormData, latitude: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              placeholder="-0.0167"
              value={stationFormData.longitude}
              onChange={(e) => setStationFormData({ ...stationFormData, longitude: e.target.value })}
            />
          </div>

          <div className="border-t border-dark-600 pt-4 mt-4">
            <h4 className="text-lg font-medium text-white mb-4">Manager Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Manager Name"
                placeholder="Station manager name"
                value={stationFormData.managerName}
                onChange={(e) => setStationFormData({ ...stationFormData, managerName: e.target.value })}
              />
              <Input
                label="Manager Phone"
                placeholder="+233-XXX-XXX-XXX"
                value={stationFormData.managerPhone}
                onChange={(e) => setStationFormData({ ...stationFormData, managerPhone: e.target.value })}
              />
            </div>
            <Input
              label="Manager Email"
              type="email"
              placeholder="manager@omc.com.gh"
              value={stationFormData.managerEmail}
              onChange={(e) => setStationFormData({ ...stationFormData, managerEmail: e.target.value })}
            />
          </div>

          <div className="border-t border-dark-600 pt-4 mt-4">
            <h4 className="text-lg font-medium text-white mb-4">Operating Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                value={stationFormData.operatingHoursStart}
                onChange={(e) => setStationFormData({ ...stationFormData, operatingHoursStart: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={stationFormData.operatingHoursEnd}
                onChange={(e) => setStationFormData({ ...stationFormData, operatingHoursEnd: e.target.value })}
              />
            </div>
          </div>
        </FormModal>

        {/* Tank Modal */}
        <FormModal
          isOpen={isTankModalOpen}
          onClose={() => {
            setIsTankModalOpen(false);
            resetTankForm();
          }}
          onSubmit={handleCreateTank}
          title="Create New Tank"
          submitText="Create Tank"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tank Number"
              placeholder="T-001"
              value={tankFormData.tankNumber}
              onChange={(e) => setTankFormData({ ...tankFormData, tankNumber: e.target.value })}
              required
            />
            <Select
              label="Fuel Type"
              options={fuelTypes}
              value={tankFormData.fuelType}
              onChange={(value) => setTankFormData({ ...tankFormData, fuelType: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tank Type"
              options={tankTypes}
              value={tankFormData.tankType}
              onChange={(value) => setTankFormData({ ...tankFormData, tankType: value })}
              required
            />
            <Input
              label="Capacity (Liters)"
              type="number"
              placeholder="30000"
              value={tankFormData.capacity}
              onChange={(e) => setTankFormData({ ...tankFormData, capacity: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Level (Liters)"
              type="number"
              placeholder="1000"
              value={tankFormData.minimumLevel}
              onChange={(e) => setTankFormData({ ...tankFormData, minimumLevel: e.target.value })}
              required
            />
            <Input
              label="Maximum Level (Liters)"
              type="number"
              placeholder="29000"
              value={tankFormData.maximumLevel}
              onChange={(e) => setTankFormData({ ...tankFormData, maximumLevel: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sensor ID (Optional)"
              placeholder="ATG-001-T1"
              value={tankFormData.sensorId}
              onChange={(e) => setTankFormData({ ...tankFormData, sensorId: e.target.value })}
            />
            <div className="flex items-center space-x-2 pt-7">
              <input
                type="checkbox"
                id="isMonitored"
                checked={tankFormData.isMonitored}
                onChange={(e) => setTankFormData({ ...tankFormData, isMonitored: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isMonitored" className="text-sm text-white">
                IoT Monitoring Enabled
              </label>
            </div>
          </div>
        </FormModal>

        {/* Pump Modal */}
        <FormModal
          isOpen={isPumpModalOpen}
          onClose={() => {
            setIsPumpModalOpen(false);
            resetPumpForm();
          }}
          onSubmit={handleCreatePump}
          title="Create New Pump"
          submitText="Create Pump"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tank"
              options={tanks.map(tank => ({
                value: tank.id,
                label: `${tank.tankNumber} (${tank.fuelType})`
              }))}
              value={pumpFormData.tankId}
              onChange={(value) => setPumpFormData({ ...pumpFormData, tankId: value })}
              required
            />
            <Input
              label="Pump Number"
              placeholder="P-001"
              value={pumpFormData.pumpNumber}
              onChange={(e) => setPumpFormData({ ...pumpFormData, pumpNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Brand"
              placeholder="Wayne, Gilbarco, etc."
              value={pumpFormData.brand}
              onChange={(e) => setPumpFormData({ ...pumpFormData, brand: e.target.value })}
              required
            />
            <Input
              label="Model"
              placeholder="Helix 6000"
              value={pumpFormData.model}
              onChange={(e) => setPumpFormData({ ...pumpFormData, model: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Serial Number"
              placeholder="WH6000-001"
              value={pumpFormData.serialNumber}
              onChange={(e) => setPumpFormData({ ...pumpFormData, serialNumber: e.target.value })}
              required
            />
            <Input
              label="Number of Nozzles"
              type="number"
              min="1"
              max="4"
              value={pumpFormData.nozzleCount}
              onChange={(e) => setPumpFormData({ ...pumpFormData, nozzleCount: e.target.value })}
              required
            />
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default StationManagement;