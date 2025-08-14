import React, { useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

interface PBUComponent {
  id: string;
  name: string;
  type: 'tax' | 'levy' | 'margin' | 'cost';
  rate: number;
  unit: 'fixed' | 'percentage';
  applicableFuels: string[];
  status: 'active' | 'inactive';
  lastUpdated: string;
  description: string;
}

const PBUComponents: NextPage = () => {
  const [components] = useState<PBUComponent[]>([
    {
      id: '1',
      name: 'Distribution Margin',
      type: 'margin',
      rate: 0.65,
      unit: 'fixed',
      applicableFuels: ['PMS', 'AGO', 'KERO'],
      status: 'active',
      lastUpdated: '2025-01-10',
      description: 'OMC distribution and marketing margin'
    },
    {
      id: '2',
      name: 'Road Fund Levy',
      type: 'levy',
      rate: 0.18,
      unit: 'fixed',
      applicableFuels: ['PMS', 'AGO', 'KERO'],
      status: 'active',
      lastUpdated: '2025-01-08',
      description: 'Government road maintenance levy'
    },
    {
      id: '3',
      name: 'Energy Sector Recovery Levy',
      type: 'levy',
      rate: 0.20,
      unit: 'fixed',
      applicableFuels: ['PMS', 'AGO'],
      status: 'active',
      lastUpdated: '2025-01-05',
      description: 'Energy sector debt recovery levy'
    },
    {
      id: '4',
      name: 'National Health Insurance Levy',
      type: 'tax',
      rate: 2.5,
      unit: 'percentage',
      applicableFuels: ['PMS', 'AGO', 'KERO', 'LPG'],
      status: 'active',
      lastUpdated: '2024-12-15',
      description: '2.5% of ex-refinery price for NHIL'
    }
  ]);

  const getTypeColor = (type: string) => {
    const colors = {
      tax: 'text-red-400 bg-red-400/10',
      levy: 'text-yellow-400 bg-yellow-400/10',
      margin: 'text-green-400 bg-green-400/10',
      cost: 'text-blue-400 bg-blue-400/10'
    };
    return colors[type as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-400/10 border-green-400/30'
      : 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  const tableColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'type', label: 'Type' },
    { key: 'rate', label: 'Rate' },
    { key: 'applicableFuels', label: 'Applicable Fuels' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = components.map(component => ({
    name: component.name,
    type: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(component.type)}`}>
        {component.type.toUpperCase()}
      </span>
    ),
    rate: `${component.unit === 'percentage' ? component.rate + '%' : '₵' + component.rate.toFixed(3)}`,
    applicableFuels: (
      <div className="flex flex-wrap gap-1">
        {component.applicableFuels.map(fuel => (
          <span key={fuel} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30">
            {fuel}
          </span>
        ))}
      </div>
    ),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(component.status)}`}>
        {component.status.toUpperCase()}
      </span>
    ),
    lastUpdated: component.lastUpdated,
    actions: (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="outline" size="sm">History</Button>
      </div>
    )
  }));

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              PBU Components
            </h1>
            <p className="text-dark-400 mt-2">
              Manage Price Build-Up components including taxes, levies, and margins
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Import Components</Button>
            <Button variant="primary">New Component</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <Table
              columns={tableColumns}
              data={tableData}
              className="w-full"
            />
          </Card>
        </motion.div>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default PBUComponents;