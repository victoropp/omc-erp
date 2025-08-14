import React, { useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

interface ECLAssessment {
  id: string;
  counterparty: string;
  exposureAmount: number;
  creditRating: string;
  stage: '1' | '2' | '3';
  pd: number; // Probability of Default
  lgd: number; // Loss Given Default
  ead: number; // Exposure at Default
  eclAmount: number;
  lastAssessment: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const ExpectedCreditLoss: NextPage = () => {
  const [eclData] = useState<ECLAssessment[]>([
    {
      id: '1',
      counterparty: 'Golden Star Petroleum',
      exposureAmount: 2500000,
      creditRating: 'BB+',
      stage: '1',
      pd: 2.5,
      lgd: 45,
      ead: 2500000,
      eclAmount: 28125,
      lastAssessment: '2025-01-10',
      riskLevel: 'medium'
    },
    {
      id: '2',
      counterparty: 'Allied Oil Company',
      exposureAmount: 1800000,
      creditRating: 'B+',
      stage: '2',
      pd: 8.2,
      lgd: 55,
      ead: 1800000,
      eclAmount: 81180,
      lastAssessment: '2025-01-08',
      riskLevel: 'high'
    },
    {
      id: '3',
      counterparty: 'Star Oil Ltd',
      exposureAmount: 950000,
      creditRating: 'CCC',
      stage: '3',
      pd: 25.0,
      lgd: 65,
      ead: 950000,
      eclAmount: 154375,
      lastAssessment: '2025-01-05',
      riskLevel: 'critical'
    }
  ]);

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'text-green-400 bg-green-400/10 border-green-400/30',
      medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
      critical: 'text-red-400 bg-red-400/10 border-red-400/30'
    };
    return colors[level as keyof typeof colors];
  };

  const getStageColor = (stage: string) => {
    const colors = {
      '1': 'text-green-400 bg-green-400/10',
      '2': 'text-yellow-400 bg-yellow-400/10',
      '3': 'text-red-400 bg-red-400/10'
    };
    return colors[stage as keyof typeof colors];
  };

  const tableColumns = [
    { key: 'counterparty', label: 'Counterparty' },
    { key: 'exposureAmount', label: 'Exposure (₵)' },
    { key: 'creditRating', label: 'Credit Rating' },
    { key: 'stage', label: 'IFRS Stage' },
    { key: 'parameters', label: 'Risk Parameters' },
    { key: 'eclAmount', label: 'ECL Amount (₵)' },
    { key: 'riskLevel', label: 'Risk Level' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = eclData.map(item => ({
    counterparty: item.counterparty,
    exposureAmount: `₵${item.exposureAmount.toLocaleString()}`,
    creditRating: item.creditRating,
    stage: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(item.stage)}`}>
        Stage {item.stage}
      </span>
    ),
    parameters: (
      <div className="text-sm">
        <div>PD: {item.pd}%</div>
        <div>LGD: {item.lgd}%</div>
        <div>EAD: ₵{item.ead.toLocaleString()}</div>
      </div>
    ),
    eclAmount: `₵${item.eclAmount.toLocaleString()}`,
    riskLevel: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(item.riskLevel)}`}>
        {item.riskLevel.toUpperCase()}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">Review</Button>
        <Button variant="outline" size="sm">Recalculate</Button>
      </div>
    )
  }));

  const totalExposure = eclData.reduce((sum, item) => sum + item.exposureAmount, 0);
  const totalECL = eclData.reduce((sum, item) => sum + item.eclAmount, 0);
  const avgCoverageRatio = (totalECL / totalExposure) * 100;

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-gradient">
            Expected Credit Loss (IFRS 9)
          </h1>
          <p className="text-dark-400 mt-2">
            Monitor and manage expected credit loss calculations under IFRS 9 requirements
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Total Exposure</p>
                <p className="text-2xl font-bold text-white">₵{(totalExposure / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Total ECL</p>
                <p className="text-2xl font-bold text-white">₵{totalECL.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Coverage Ratio</p>
                <p className="text-2xl font-bold text-white">{avgCoverageRatio.toFixed(2)}%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Critical Risk</p>
                <p className="text-2xl font-bold text-white">{eclData.filter(item => item.riskLevel === 'critical').length}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* ECL Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Credit Loss Assessment</h3>
            <div className="flex space-x-3">
              <Button variant="outline">Refresh All</Button>
              <Button variant="primary">New Assessment</Button>
            </div>
          </div>
          <Table
            columns={tableColumns}
            data={tableData}
            className="w-full"
          />
        </Card>

        {/* IFRS 9 Stages Info */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">IFRS 9 Credit Loss Stages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h4 className="text-green-400 font-semibold mb-2">Stage 1</h4>
              <p className="text-sm text-dark-400">
                12-month expected credit losses for performing assets with no significant increase in credit risk.
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <h4 className="text-yellow-400 font-semibold mb-2">Stage 2</h4>
              <p className="text-sm text-dark-400">
                Lifetime expected credit losses for assets with significant increase in credit risk but not credit-impaired.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <h4 className="text-red-400 font-semibold mb-2">Stage 3</h4>
              <p className="text-sm text-dark-400">
                Lifetime expected credit losses for credit-impaired assets with objective evidence of impairment.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default ExpectedCreditLoss;