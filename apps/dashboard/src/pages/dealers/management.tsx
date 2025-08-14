import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { NotificationSystem } from '@/components/ui/NotificationSystem';
import { crmService, operationsService, complianceService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface DealerProfile {
  id: string;
  dealerCode: string;
  businessName: string;
  tradingName: string;
  ownerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  businessDetails: {
    registrationNumber: string;
    taxId: string;
    establishedDate: string;
    businessType: 'sole_proprietorship' | 'partnership' | 'limited_company';
    category: 'retail' | 'commercial' | 'industrial';
    operatingHours: string;
  };
  infrastructure: {
    tankCapacity: {
      petrol: number;
      diesel: number;
      total: number;
    };
    pumps: {
      petrol: number;
      diesel: number;
      total: number;
    };
    facilities: string[];
    equipment: EquipmentItem[];
  };
  financial: {
    creditLimit: number;
    outstanding: number;
    securityDeposit: number;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  compliance: {
    npaLicense: string;
    npaExpiry: string;
    epaPermit: string;
    epaExpiry: string;
    firePermit: string;
    fireExpiry: string;
    businessPermit: string;
    businessExpiry: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  onboardingDate: string;
  lastUpdate: string;
  documents: DealerDocument[];
}

interface EquipmentItem {
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyExpiry: string;
  status: 'operational' | 'maintenance' | 'faulty';
}

interface DealerDocument {
  type: string;
  fileName: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending_review';
  url: string;
}

interface DealerActivity {
  id: string;
  dealerId: string;
  type: 'onboarding' | 'compliance' | 'financial' | 'operational' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'overdue';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const ComprehensiveDealerManagement = () => {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<DealerProfile | null>(null);
  const [dealerActivities, setDealerActivities] = useState<DealerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showNewDealerForm, setShowNewDealerForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadDealersData();
    loadDealerActivities();
  }, []);

  const loadDealersData = async () => {
    try {
      setLoading(true);
      // In production, replace with actual API calls
      const sampleDealers: DealerProfile[] = [
        {
          id: 'DLR-001',
          dealerCode: 'ACC-001',
          businessName: 'Accra Central Fuel Station Ltd',
          tradingName: 'Accra Central Fuel',
          ownerName: 'John Mensah',
          contactPerson: 'John Mensah',
          phone: '+233-244-123-456',
          email: 'john.mensah@accracentral.com',
          address: {
            street: '123 Liberation Road',
            city: 'Accra',
            region: 'Greater Accra',
            country: 'Ghana',
            coordinates: { lat: 5.6037, lng: -0.1870 }
          },
          businessDetails: {
            registrationNumber: 'CS-2019-001234',
            taxId: 'GRA-12345678',
            establishedDate: '2019-03-15',
            businessType: 'limited_company',
            category: 'retail',
            operatingHours: '06:00 - 22:00'
          },
          infrastructure: {
            tankCapacity: {
              petrol: 50000,
              diesel: 30000,
              total: 80000
            },
            pumps: {
              petrol: 6,
              diesel: 4,
              total: 10
            },
            facilities: ['Convenience Store', 'Car Wash', 'ATM', 'Restroom'],
            equipment: [
              {
                type: 'Fuel Pump',
                brand: 'Wayne',
                model: 'Helix 6000',
                serialNumber: 'WH6000-001',
                installDate: '2019-03-20',
                warrantyExpiry: '2024-03-20',
                status: 'operational'
              }
            ]
          },
          financial: {
            creditLimit: 500000,
            outstanding: 250000,
            securityDeposit: 50000,
            bankDetails: {
              bankName: 'Standard Chartered Bank',
              accountNumber: '0123456789',
              accountName: 'Accra Central Fuel Station Ltd'
            }
          },
          compliance: {
            npaLicense: 'NPA-LIC-2019-001',
            npaExpiry: '2025-03-15',
            epaPermit: 'EPA-PERM-2019-001',
            epaExpiry: '2025-03-15',
            firePermit: 'FIRE-CERT-2019-001',
            fireExpiry: '2025-03-15',
            businessPermit: 'BUS-PERM-2019-001',
            businessExpiry: '2025-03-15'
          },
          status: 'active',
          onboardingDate: '2019-03-15T08:00:00Z',
          lastUpdate: '2025-01-12T14:30:00Z',
          documents: [
            {
              type: 'NPA License',
              fileName: 'npa_license_2025.pdf',
              uploadDate: '2025-01-01',
              expiryDate: '2025-12-31',
              status: 'valid',
              url: '/documents/npa_license_2025.pdf'
            }
          ]
        },
        {
          id: 'DLR-002',
          dealerCode: 'KMA-001',
          businessName: 'Kumasi North Petroleum',
          tradingName: 'North Petroleum',
          ownerName: 'Sarah Boateng',
          contactPerson: 'Michael Asante',
          phone: '+233-244-987-654',
          email: 'info@northpetroleum.com',
          address: {
            street: '45 Kejetia Road',
            city: 'Kumasi',
            region: 'Ashanti',
            country: 'Ghana',
            coordinates: { lat: 6.6885, lng: -1.6244 }
          },
          businessDetails: {
            registrationNumber: 'CS-2020-005678',
            taxId: 'GRA-87654321',
            establishedDate: '2020-07-10',
            businessType: 'limited_company',
            category: 'retail',
            operatingHours: '05:30 - 23:00'
          },
          infrastructure: {
            tankCapacity: {
              petrol: 40000,
              diesel: 25000,
              total: 65000
            },
            pumps: {
              petrol: 4,
              diesel: 3,
              total: 7
            },
            facilities: ['Mini Mart', 'Tire Service', 'Restroom'],
            equipment: [
              {
                type: 'Fuel Pump',
                brand: 'Gilbarco',
                model: 'Encore 700S',
                serialNumber: 'GB700-002',
                installDate: '2020-07-15',
                warrantyExpiry: '2025-07-15',
                status: 'operational'
              }
            ]
          },
          financial: {
            creditLimit: 400000,
            outstanding: 320000,
            securityDeposit: 40000,
            bankDetails: {
              bankName: 'GCB Bank',
              accountNumber: '9876543210',
              accountName: 'Kumasi North Petroleum'
            }
          },
          compliance: {
            npaLicense: 'NPA-LIC-2020-045',
            npaExpiry: '2025-07-10',
            epaPermit: 'EPA-PERM-2020-045',
            epaExpiry: '2024-12-31',
            firePermit: 'FIRE-CERT-2020-045',
            fireExpiry: '2025-07-10',
            businessPermit: 'BUS-PERM-2020-045',
            businessExpiry: '2025-07-10'
          },
          status: 'active',
          onboardingDate: '2020-07-10T09:00:00Z',
          lastUpdate: '2025-01-10T11:15:00Z',
          documents: []
        },
        {
          id: 'DLR-003',
          dealerCode: 'TAK-001',
          businessName: 'Takoradi Port Fuel Station',
          tradingName: 'Port Fuel',
          ownerName: 'Emmanuel Kojo',
          contactPerson: 'Emmanuel Kojo',
          phone: '+233-244-555-777',
          email: 'kojo@portfuel.com',
          address: {
            street: '78 Harbour Road',
            city: 'Takoradi',
            region: 'Western',
            country: 'Ghana',
            coordinates: { lat: 4.8845, lng: -1.7554 }
          },
          businessDetails: {
            registrationNumber: 'CS-2018-009876',
            taxId: 'GRA-11223344',
            establishedDate: '2018-11-20',
            businessType: 'sole_proprietorship',
            category: 'commercial',
            operatingHours: '06:00 - 20:00'
          },
          infrastructure: {
            tankCapacity: {
              petrol: 35000,
              diesel: 40000,
              total: 75000
            },
            pumps: {
              petrol: 3,
              diesel: 5,
              total: 8
            },
            facilities: ['Truck Bay', 'Weighbridge', 'Office'],
            equipment: [
              {
                type: 'Fuel Pump',
                brand: 'Bennett',
                model: 'Optimus',
                serialNumber: 'BN-OPT-003',
                installDate: '2018-11-25',
                warrantyExpiry: '2023-11-25',
                status: 'maintenance'
              }
            ]
          },
          financial: {
            creditLimit: 300000,
            outstanding: 285000,
            securityDeposit: 30000,
            bankDetails: {
              bankName: 'Fidelity Bank',
              accountNumber: '1122334455',
              accountName: 'Takoradi Port Fuel Station'
            }
          },
          compliance: {
            npaLicense: 'NPA-LIC-2018-078',
            npaExpiry: '2025-11-20',
            epaPermit: 'EPA-PERM-2018-078',
            epaExpiry: '2024-08-15',
            firePermit: 'FIRE-CERT-2018-078',
            fireExpiry: '2024-11-20',
            businessPermit: 'BUS-PERM-2018-078',
            businessExpiry: '2025-11-20'
          },
          status: 'active',
          onboardingDate: '2018-11-20T10:30:00Z',
          lastUpdate: '2025-01-08T16:45:00Z',
          documents: []
        }
      ];

      setDealers(sampleDealers);
    } catch (error) {
      toast.error('Failed to load dealers data');
      console.error('Error loading dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDealerActivities = async () => {
    try {
      const sampleActivities: DealerActivity[] = [
        {
          id: 'ACT-001',
          dealerId: 'DLR-001',
          type: 'compliance',
          title: 'EPA Permit Renewal',
          description: 'EPA environmental permit expires in 30 days',
          timestamp: '2025-01-12T14:30:00Z',
          status: 'pending',
          assignedTo: 'Compliance Officer',
          priority: 'high'
        },
        {
          id: 'ACT-002',
          dealerId: 'DLR-002',
          type: 'maintenance',
          title: 'Fuel Pump Maintenance',
          description: 'Scheduled maintenance for pump #3',
          timestamp: '2025-01-11T09:15:00Z',
          status: 'completed',
          assignedTo: 'Technical Team',
          priority: 'medium'
        },
        {
          id: 'ACT-003',
          dealerId: 'DLR-003',
          type: 'financial',
          title: 'Credit Limit Review',
          description: 'Review and adjust credit limit based on performance',
          timestamp: '2025-01-10T11:00:00Z',
          status: 'overdue',
          assignedTo: 'Credit Manager',
          priority: 'critical'
        }
      ];

      setDealerActivities(sampleActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleStatusChange = async (dealerId: string, newStatus: string) => {
    try {
      // API call to update dealer status
      toast.success('Dealer status updated successfully');
      loadDealersData();
    } catch (error) {
      toast.error('Failed to update dealer status');
    }
  };

  const handleSaveDealer = async (dealerData: Partial<DealerProfile>) => {
    try {
      if (editMode && selectedDealer) {
        // Update existing dealer
        toast.success('Dealer updated successfully');
      } else {
        // Create new dealer
        toast.success('Dealer created successfully');
      }
      setShowNewDealerForm(false);
      setEditMode(false);
      setSelectedDealer(null);
      loadDealersData();
    } catch (error) {
      toast.error('Failed to save dealer');
    }
  };

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = dealer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.dealerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dealer.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || dealer.address.region === filterRegion;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  // Summary metrics
  const summaryMetrics = {
    totalDealers: dealers.length,
    activeDealers: dealers.filter(d => d.status === 'active').length,
    pendingApproval: dealers.filter(d => d.status === 'pending_approval').length,
    suspendedDealers: dealers.filter(d => d.status === 'suspended').length,
    totalCapacity: dealers.reduce((sum, d) => sum + d.infrastructure.tankCapacity.total, 0),
    totalPumps: dealers.reduce((sum, d) => sum + d.infrastructure.pumps.total, 0),
    totalCreditLimit: dealers.reduce((sum, d) => sum + d.financial.creditLimit, 0),
    totalOutstanding: dealers.reduce((sum, d) => sum + d.financial.outstanding, 0)
  };

  // Chart data
  const statusDistributionData = {
    labels: ['Active', 'Pending Approval', 'Suspended', 'Inactive'],
    datasets: [{
      data: [
        dealers.filter(d => d.status === 'active').length,
        dealers.filter(d => d.status === 'pending_approval').length,
        dealers.filter(d => d.status === 'suspended').length,
        dealers.filter(d => d.status === 'inactive').length
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const regionalDistributionData = {
    labels: ['Greater Accra', 'Ashanti', 'Western', 'Northern'],
    datasets: [{
      data: [
        dealers.filter(d => d.address.region === 'Greater Accra').length,
        dealers.filter(d => d.address.region === 'Ashanti').length,
        dealers.filter(d => d.address.region === 'Western').length,
        dealers.filter(d => d.address.region === 'Northern').length
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  return (
    <FuturisticDashboardLayout 
      title="Comprehensive Dealer Management" 
      subtitle="Complete dealer lifecycle management, operations, and relationship oversight"
    >
      <div className="space-y-6">
        {/* Search, Filters, and Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-4"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search dealers by name, code, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Regions</option>
            <option value="Greater Accra">Greater Accra</option>
            <option value="Ashanti">Ashanti</option>
            <option value="Western">Western</option>
            <option value="Northern">Northern</option>
          </select>
          <Button onClick={() => setShowNewDealerForm(true)}>
            Add New Dealer
          </Button>
        </motion.div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Dealers</p>
                  <p className="text-3xl font-bold text-blue-600">{summaryMetrics.totalDealers}</p>
                  <p className="text-xs text-green-600 font-medium">{summaryMetrics.activeDealers} active</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
                  <p className="text-3xl font-bold text-green-600">{(summaryMetrics.totalCapacity / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 font-medium">Litres capacity</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Credit Exposure</p>
                  <p className="text-3xl font-bold text-purple-600">₵{(summaryMetrics.totalOutstanding / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-purple-600 font-medium">of ₵{(summaryMetrics.totalCreditLimit / 1000000).toFixed(1)}M limit</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Actions</p>
                  <p className="text-3xl font-bold text-orange-600">{dealerActivities.filter(a => a.status === 'pending' || a.status === 'overdue').length}</p>
                  <p className="text-xs text-red-600 font-medium">{dealerActivities.filter(a => a.status === 'overdue').length} overdue</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dealer Status Distribution</h3>
              <PieChart data={statusDistributionData} height={300} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Regional Distribution</h3>
              <PieChart data={regionalDistributionData} height={300} />
            </Card>
          </motion.div>
        </div>

        {/* Dealers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Dealer Directory</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Bulk Actions</Button>
                <Button variant="outline" size="sm">Export</Button>
                <Button variant="outline" size="sm" onClick={loadDealersData}>Refresh</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Capacity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Financial</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Update</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDealers.map((dealer, index) => (
                    <motion.tr
                      key={dealer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{dealer.businessName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{dealer.dealerCode} | {dealer.ownerName}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">{dealer.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{dealer.address.city}</p>
                          <p className="text-gray-600 dark:text-gray-400">{dealer.address.region}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{dealer.infrastructure.tankCapacity.total.toLocaleString()}L</p>
                          <p className="text-gray-600 dark:text-gray-400">{dealer.infrastructure.pumps.total} pumps</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">₵{dealer.financial.outstanding.toLocaleString()}</p>
                          <p className="text-gray-600 dark:text-gray-400">of ₵{dealer.financial.creditLimit.toLocaleString()}</p>
                          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                            <div 
                              className="h-1 bg-blue-500 rounded-full"
                              style={{ width: `${(dealer.financial.outstanding / dealer.financial.creditLimit) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dealer.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          dealer.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          dealer.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {dealer.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(dealer.lastUpdate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedDealer(dealer);
                              setActiveTab('overview');
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDealer(dealer);
                              setEditMode(true);
                              setShowNewDealerForm(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {dealerActivities.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    activity.priority === 'critical' ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' :
                    activity.priority === 'high' ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20' :
                    'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                          activity.type === 'compliance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          activity.type === 'financial' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {activity.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          activity.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {activity.priority}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                        <span>Assigned to: {activity.assignedTo}</span>
                        <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {activity.status}
                      </span>
                      {activity.status !== 'completed' && (
                        <Button size="sm">Update</Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Dealer Details Modal */}
        {selectedDealer && !showNewDealerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDealer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{selectedDealer.businessName}</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setSelectedDealer(null)}>
                      Close
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
                  <button
                    className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`pb-2 px-1 ${activeTab === 'infrastructure' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('infrastructure')}
                  >
                    Infrastructure
                  </button>
                  <button
                    className={`pb-2 px-1 ${activeTab === 'financial' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('financial')}
                  >
                    Financial
                  </button>
                  <button
                    className={`pb-2 px-1 ${activeTab === 'compliance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('compliance')}
                  >
                    Compliance
                  </button>
                  <button
                    className={`pb-2 px-1 ${activeTab === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('documents')}
                  >
                    Documents
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Business Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Dealer Code:</span>
                            <span className="font-medium">{selectedDealer.dealerCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trading Name:</span>
                            <span className="font-medium">{selectedDealer.tradingName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Owner:</span>
                            <span className="font-medium">{selectedDealer.ownerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Business Type:</span>
                            <span className="font-medium">{selectedDealer.businessDetails.businessType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium capitalize">{selectedDealer.businessDetails.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operating Hours:</span>
                            <span className="font-medium">{selectedDealer.businessDetails.operatingHours}</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Phone:</span>
                            <span className="font-medium">{selectedDealer.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="font-medium">{selectedDealer.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Address:</span>
                            <span className="font-medium text-right">
                              {selectedDealer.address.street}<br />
                              {selectedDealer.address.city}, {selectedDealer.address.region}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Registration:</span>
                            <span className="font-medium">{selectedDealer.businessDetails.registrationNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ID:</span>
                            <span className="font-medium">{selectedDealer.businessDetails.taxId}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'infrastructure' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Tank Capacity</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Petrol:</span>
                            <span className="font-medium">{selectedDealer.infrastructure.tankCapacity.petrol.toLocaleString()} L</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Diesel:</span>
                            <span className="font-medium">{selectedDealer.infrastructure.tankCapacity.diesel.toLocaleString()} L</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Total:</span>
                            <span className="font-bold">{selectedDealer.infrastructure.tankCapacity.total.toLocaleString()} L</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Fuel Pumps</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Petrol Pumps:</span>
                            <span className="font-medium">{selectedDealer.infrastructure.pumps.petrol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Diesel Pumps:</span>
                            <span className="font-medium">{selectedDealer.infrastructure.pumps.diesel}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Total Pumps:</span>
                            <span className="font-bold">{selectedDealer.infrastructure.pumps.total}</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 md:col-span-2">
                        <h4 className="font-semibold mb-3">Facilities & Equipment</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-2">Facilities:</p>
                            <ul className="text-sm space-y-1">
                              {selectedDealer.infrastructure.facilities.map((facility, index) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  {facility}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium mb-2">Equipment:</p>
                            <div className="space-y-2">
                              {selectedDealer.infrastructure.equipment.map((equipment, index) => (
                                <div key={index} className="text-sm border rounded p-2">
                                  <p className="font-medium">{equipment.type}</p>
                                  <p className="text-gray-600 dark:text-gray-400">{equipment.brand} {equipment.model}</p>
                                  <p className={`text-xs font-medium ${
                                    equipment.status === 'operational' ? 'text-green-600' :
                                    equipment.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {equipment.status}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'financial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Credit Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Credit Limit:</span>
                            <span className="font-medium">₵{selectedDealer.financial.creditLimit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outstanding:</span>
                            <span className="font-medium">₵{selectedDealer.financial.outstanding.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="font-medium text-green-600">
                              ₵{(selectedDealer.financial.creditLimit - selectedDealer.financial.outstanding).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span className="font-medium">
                              {((selectedDealer.financial.outstanding / selectedDealer.financial.creditLimit) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Security Deposit:</span>
                            <span className="font-bold">₵{selectedDealer.financial.securityDeposit.toLocaleString()}</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Banking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Bank:</span>
                            <span className="font-medium">{selectedDealer.financial.bankDetails.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Name:</span>
                            <span className="font-medium">{selectedDealer.financial.bankDetails.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Number:</span>
                            <span className="font-medium">{selectedDealer.financial.bankDetails.accountNumber}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'compliance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Licenses & Permits</h4>
                        <div className="space-y-3">
                          {[
                            { name: 'NPA License', id: selectedDealer.compliance.npaLicense, expiry: selectedDealer.compliance.npaExpiry },
                            { name: 'EPA Permit', id: selectedDealer.compliance.epaPermit, expiry: selectedDealer.compliance.epaExpiry },
                            { name: 'Fire Certificate', id: selectedDealer.compliance.firePermit, expiry: selectedDealer.compliance.fireExpiry },
                            { name: 'Business Permit', id: selectedDealer.compliance.businessPermit, expiry: selectedDealer.compliance.businessExpiry }
                          ].map((permit, index) => (
                            <div key={index} className="border rounded p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium">{permit.name}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  new Date(permit.expiry) > new Date() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {new Date(permit.expiry) > new Date() ? 'Valid' : 'Expired'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {permit.id}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Expires: {new Date(permit.expiry).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Document Management</h4>
                      {selectedDealer.documents.length > 0 ? (
                        <div className="space-y-3">
                          {selectedDealer.documents.map((doc, index) => (
                            <div key={index} className="border rounded p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{doc.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.fileName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                  {doc.expiryDate && ` | Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.status === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  doc.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {doc.status.replace('_', ' ')}
                                </span>
                                <Button variant="outline" size="sm">View</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <p>No documents uploaded yet</p>
                          <Button className="mt-4">Upload Documents</Button>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <NotificationSystem />
    </FuturisticDashboardLayout>
  );
};

export default ComprehensiveDealerManagement;