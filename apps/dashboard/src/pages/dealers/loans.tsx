import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LineChart, BarChart, PieChart } from '@/components/charts';

interface DealerLoan {
  id: string;
  loanId: string;
  dealerName: string;
  stationName: string;
  principalAmount: number;
  interestRate: number;
  tenorMonths: number;
  repaymentFrequency: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  outstandingBalance: number;
  totalPaid: number;
  totalInterestPaid: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  installmentAmount: number;
  daysPastDue: number;
  penaltyAmount: number;
  autoDeductionEnabled: boolean;
  maxDeductionPercentage: number;
  startDate: string;
  maturityDate: string;
  riskGrade: 'A' | 'B' | 'C' | 'D';
  collateralValue: number;
  loanToValueRatio: number;
}

interface LoanPayment {
  id: string;
  loanId: string;
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentMethod: 'auto_deduction' | 'manual_payment' | 'settlement_offset';
  reference: string;
  status: 'completed' | 'pending' | 'failed';
}

interface AmortizationSchedule {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  outstandingBalance: number;
  status: 'pending' | 'paid' | 'overdue';
}

const DealerLoans = () => {
  const [activeView, setActiveView] = useState<'overview' | 'loans' | 'payments' | 'new_loan' | 'calculator'>('overview');
  const [selectedLoan, setSelectedLoan] = useState<DealerLoan | null>(null);
  const [showAmortization, setShowAmortization] = useState(false);

  // Sample loan data
  const loanMetrics = {
    totalLoans: 28,
    activeLoans: 24,
    completedLoans: 89,
    overdueLoans: 4,
    totalPortfolio: 8750000,
    outstandingAmount: 5420000,
    totalInterestEarned: 1250000,
    averageInterestRate: 18.5,
    portfolioAtRisk: 340000,
    collectionRate: 94.2,
    averageLoanSize: 312500,
    defaultRate: 2.8,
  };

  const dealerLoans: DealerLoan[] = [
    {
      id: '1',
      loanId: 'DL-2024-001',
      dealerName: 'Kwame Asante',
      stationName: 'Asante Fuel Station',
      principalAmount: 500000,
      interestRate: 18.5,
      tenorMonths: 24,
      repaymentFrequency: 'monthly',
      status: 'active',
      outstandingBalance: 350000,
      totalPaid: 150000,
      totalInterestPaid: 25000,
      lastPaymentDate: '2024-12-15',
      nextPaymentDate: '2025-01-15',
      installmentAmount: 25416.67,
      daysPastDue: 0,
      penaltyAmount: 0,
      autoDeductionEnabled: true,
      maxDeductionPercentage: 80,
      startDate: '2024-01-15',
      maturityDate: '2026-01-15',
      riskGrade: 'A',
      collateralValue: 750000,
      loanToValueRatio: 66.67,
    },
    {
      id: '2',
      loanId: 'DL-2024-002',
      dealerName: 'Grace Osei',
      stationName: 'Northern Energy Hub',
      principalAmount: 300000,
      interestRate: 19.0,
      tenorMonths: 18,
      repaymentFrequency: 'monthly',
      status: 'overdue',
      outstandingBalance: 180000,
      totalPaid: 120000,
      totalInterestPaid: 18000,
      lastPaymentDate: '2024-11-20',
      nextPaymentDate: '2024-12-20',
      installmentAmount: 19533.33,
      daysPastDue: 24,
      penaltyAmount: 3600,
      autoDeductionEnabled: true,
      maxDeductionPercentage: 70,
      startDate: '2024-06-20',
      maturityDate: '2025-12-20',
      riskGrade: 'C',
      collateralValue: 450000,
      loanToValueRatio: 66.67,
    },
    {
      id: '3',
      loanId: 'DL-2024-003',
      dealerName: 'Emmanuel Boateng',
      stationName: 'Coastal Petroleum Services',
      principalAmount: 400000,
      interestRate: 17.5,
      tenorMonths: 36,
      repaymentFrequency: 'monthly',
      status: 'active',
      outstandingBalance: 320000,
      totalPaid: 80000,
      totalInterestPaid: 12000,
      lastPaymentDate: '2024-12-10',
      nextPaymentDate: '2025-01-10',
      installmentAmount: 14285.71,
      daysPastDue: 0,
      penaltyAmount: 0,
      autoDeductionEnabled: true,
      maxDeductionPercentage: 75,
      startDate: '2024-10-10',
      maturityDate: '2027-10-10',
      riskGrade: 'B',
      collateralValue: 600000,
      loanToValueRatio: 66.67,
    }
  ];

  const recentPayments: LoanPayment[] = [
    {
      id: '1',
      loanId: 'DL-2024-001',
      paymentDate: '2024-12-15',
      principalAmount: 20000,
      interestAmount: 5416.67,
      penaltyAmount: 0,
      totalAmount: 25416.67,
      paymentMethod: 'auto_deduction',
      reference: 'PAY-2024-1215-001',
      status: 'completed',
    },
    {
      id: '2',
      loanId: 'DL-2024-003',
      paymentDate: '2024-12-10',
      principalAmount: 11785.71,
      interestAmount: 2500,
      penaltyAmount: 0,
      totalAmount: 14285.71,
      paymentMethod: 'settlement_offset',
      reference: 'PAY-2024-1210-003',
      status: 'completed',
    },
    {
      id: '3',
      loanId: 'DL-2024-002',
      paymentDate: '2024-12-20',
      principalAmount: 0,
      interestAmount: 0,
      penaltyAmount: 0,
      totalAmount: 19533.33,
      paymentMethod: 'auto_deduction',
      reference: 'PAY-2024-1220-002',
      status: 'failed',
    }
  ];

  // Calculate amortization schedule
  const calculateAmortizationSchedule = (loan: DealerLoan): AmortizationSchedule[] => {
    const monthlyRate = loan.interestRate / 100 / 12;
    const numPayments = loan.tenorMonths;
    const monthlyPayment = loan.principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    let balance = loan.principalAmount;
    const schedule: AmortizationSchedule[] = [];
    
    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      const dueDate = new Date(loan.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principalAmount: Math.round(principalPayment * 100) / 100,
        interestAmount: Math.round(interestPayment * 100) / 100,
        totalAmount: Math.round(monthlyPayment * 100) / 100,
        outstandingBalance: Math.max(0, Math.round(balance * 100) / 100),
        status: dueDate < new Date() ? 'paid' : 'pending',
      });
    }
    
    return schedule;
  };

  // Chart data
  const portfolioTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Portfolio Size (₵M)',
      data: [7.2, 7.8, 8.1, 8.4, 8.6, 8.8],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const riskDistributionData = {
    labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D'],
    datasets: [{
      data: [12, 10, 5, 1],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    }]
  };

  const repaymentStatusData = {
    labels: ['Current', 'Overdue (1-30)', 'Overdue (31-60)', 'Overdue (60+)'],
    datasets: [{
      label: 'Number of Loans',
      data: [20, 3, 1, 0],
      backgroundColor: '#8B5CF6'
    }]
  };

  const LoanCalculator = () => {
    const [calcData, setCalcData] = useState({
      principal: '',
      interestRate: '',
      tenor: '',
      frequency: 'monthly',
    });

    const [calculationResults, setCalculationResults] = useState<any>(null);

    const calculateLoan = () => {
      const principal = parseFloat(calcData.principal);
      const annualRate = parseFloat(calcData.interestRate) / 100;
      const tenor = parseInt(calcData.tenor);
      
      let paymentFrequency = 12; // monthly
      if (calcData.frequency === 'weekly') paymentFrequency = 52;
      if (calcData.frequency === 'daily') paymentFrequency = 365;
      
      const periodRate = annualRate / paymentFrequency;
      const numPayments = tenor * (paymentFrequency / 12);
      
      const monthlyPayment = principal * (periodRate * Math.pow(1 + periodRate, numPayments)) / (Math.pow(1 + periodRate, numPayments) - 1);
      const totalPayment = monthlyPayment * numPayments;
      const totalInterest = totalPayment - principal;
      
      setCalculationResults({
        installmentAmount: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        numPayments: numPayments,
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Loan Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Principal Amount (₵)</label>
                <Input
                  type="number"
                  value={calcData.principal}
                  onChange={(e) => setCalcData(prev => ({ ...prev, principal: e.target.value }))}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Annual Interest Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcData.interestRate}
                  onChange={(e) => setCalcData(prev => ({ ...prev, interestRate: e.target.value }))}
                  placeholder="18.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tenor (Months)</label>
                <Input
                  type="number"
                  value={calcData.tenor}
                  onChange={(e) => setCalcData(prev => ({ ...prev, tenor: e.target.value }))}
                  placeholder="24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Repayment Frequency</label>
                <Select
                  value={calcData.frequency}
                  onChange={(value) => setCalcData(prev => ({ ...prev, frequency: value }))}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                />
              </div>
              <Button onClick={calculateLoan} className="w-full">
                Calculate
              </Button>
            </div>
            
            {calculationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold">Calculation Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">Installment Amount</span>
                    <span className="font-bold text-blue-600">₵{calculationResults.installmentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">Total Interest</span>
                    <span className="font-bold text-orange-600">₵{calculationResults.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">Total Payment</span>
                    <span className="font-bold text-green-600">₵{calculationResults.totalPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">Number of Payments</span>
                    <span className="font-bold">{calculationResults.numPayments}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const LoanDetails = ({ loan }: { loan: DealerLoan }) => {
    const amortizationSchedule = calculateAmortizationSchedule(loan);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Loan Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{loan.stationName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{loan.dealerName} • {loan.loanId}</p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block mb-2 ${
                loan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                loan.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                loan.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {loan.status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Risk Grade: {loan.riskGrade}
              </div>
            </div>
          </div>

          {/* Loan Progress */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <motion.div
              className="bg-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((loan.principalAmount - loan.outstandingBalance) / loan.principalAmount) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Paid: ₵{loan.totalPaid.toLocaleString()}</span>
            <span>Outstanding: ₵{loan.outstandingBalance.toLocaleString()}</span>
          </div>
        </Card>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Details */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Financial Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Principal Amount</span>
                <span className="font-medium">₵{loan.principalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                <span className="font-medium">{loan.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tenor</span>
                <span className="font-medium">{loan.tenorMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monthly Installment</span>
                <span className="font-medium">₵{loan.installmentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Interest Paid</span>
                <span className="font-medium">₵{loan.totalInterestPaid.toLocaleString()}</span>
              </div>
              {loan.penaltyAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">Penalty Amount</span>
                  <span className="font-medium text-red-600">₵{loan.penaltyAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Repayment Settings */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Repayment Settings</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frequency</span>
                <span className="font-medium capitalize">{loan.repaymentFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Auto Deduction</span>
                <span className={`font-medium ${loan.autoDeductionEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {loan.autoDeductionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max Deduction %</span>
                <span className="font-medium">{loan.maxDeductionPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Payment</span>
                <span className="font-medium">{new Date(loan.lastPaymentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Next Payment Due</span>
                <span className="font-medium">{new Date(loan.nextPaymentDate).toLocaleDateString()}</span>
              </div>
              {loan.daysPastDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">Days Past Due</span>
                  <span className="font-medium text-red-600">{loan.daysPastDue} days</span>
                </div>
              )}
            </div>
          </Card>

          {/* Collateral Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Collateral & Risk</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Collateral Value</span>
                <span className="font-medium">₵{loan.collateralValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Loan to Value Ratio</span>
                <span className="font-medium">{loan.loanToValueRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk Grade</span>
                <span className={`font-bold px-2 py-1 rounded ${
                  loan.riskGrade === 'A' ? 'bg-green-100 text-green-800' :
                  loan.riskGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                  loan.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Grade {loan.riskGrade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                <span className="font-medium">{new Date(loan.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Maturity Date</span>
                <span className="font-medium">{new Date(loan.maturityDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button>Record Payment</Button>
            <Button variant="outline">Restructure Loan</Button>
            <Button variant="outline" onClick={() => setShowAmortization(!showAmortization)}>
              {showAmortization ? 'Hide' : 'View'} Amortization Schedule
            </Button>
            <Button variant="outline">Generate Statement</Button>
            <Button variant="outline">Update Settings</Button>
          </div>
        </Card>

        {/* Amortization Schedule */}
        <AnimatePresence>
          {showAmortization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Amortization Schedule</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2 px-3">#</th>
                        <th className="text-left py-2 px-3">Due Date</th>
                        <th className="text-left py-2 px-3">Principal</th>
                        <th className="text-left py-2 px-3">Interest</th>
                        <th className="text-left py-2 px-3">Total Payment</th>
                        <th className="text-left py-2 px-3">Balance</th>
                        <th className="text-left py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.slice(0, 12).map((payment) => (
                        <tr key={payment.installmentNumber} className="border-b dark:border-gray-700">
                          <td className="py-2 px-3">{payment.installmentNumber}</td>
                          <td className="py-2 px-3">{new Date(payment.dueDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3">₵{payment.principalAmount.toLocaleString()}</td>
                          <td className="py-2 px-3">₵{payment.interestAmount.toLocaleString()}</td>
                          <td className="py-2 px-3 font-medium">₵{payment.totalAmount.toLocaleString()}</td>
                          <td className="py-2 px-3">₵{payment.outstandingBalance.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                              payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {amortizationSchedule.length > 12 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      View All {amortizationSchedule.length} Payments
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <FuturisticDashboardLayout title="Dealer Loans Management" subtitle="Automated loan processing, tracking, and repayment management">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Card className="p-1">
          <div className="flex space-x-1">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'loans', label: 'Loans Portfolio', icon: '💰' },
              { key: 'payments', label: 'Payments', icon: '💳' },
              { key: 'calculator', label: 'Calculator', icon: '🧮' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as typeof activeView)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeView === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio</p>
                      <p className="text-3xl font-bold text-blue-600">₵{(loanMetrics.totalPortfolio / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{loanMetrics.totalLoans} active loans</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                      <p className="text-3xl font-bold text-orange-600">₵{(loanMetrics.outstandingAmount / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-red-600 dark:text-red-400">{loanMetrics.overdueLoans} overdue</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interest Earned</p>
                      <p className="text-3xl font-bold text-green-600">₵{(loanMetrics.totalInterestEarned / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Avg {loanMetrics.averageInterestRate}% rate</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collection Rate</p>
                      <p className="text-3xl font-bold text-purple-600">{loanMetrics.collectionRate}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{loanMetrics.defaultRate}% default rate</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Trend</h3>
                  <LineChart data={portfolioTrendData} height={250} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
                  <PieChart data={riskDistributionData} height={250} />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Repayment Status</h3>
                  <BarChart data={repaymentStatusData} height={250} />
                </Card>
              </div>
            </motion.div>
          )}

          {activeView === 'loans' && !selectedLoan && (
            <motion.div
              key="loans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Loan Portfolio</h3>
                  <Button>New Loan Application</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Loan ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Principal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Outstanding</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerLoans.map((loan, index) => (
                        <motion.tr
                          key={loan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">{loan.loanId}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{loan.stationName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{loan.dealerName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">₵{loan.principalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold">₵{loan.outstandingBalance.toLocaleString()}</td>
                          <td className="py-3 px-4">{loan.interestRate}%</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              loan.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              loan.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(loan.nextPaymentDate).toLocaleDateString()}
                            {loan.daysPastDue > 0 && (
                              <div className="text-red-600 text-xs">{loan.daysPastDue} days overdue</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              loan.riskGrade === 'A' ? 'bg-green-100 text-green-800' :
                              loan.riskGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                              loan.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {loan.riskGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLoan(loan)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeView === 'loans' && selectedLoan && (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setSelectedLoan(null)}
                className="mb-4"
              >
                ← Back to Loans
              </Button>
              <LoanDetails loan={selectedLoan} />
            </div>
          )}

          {activeView === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Payments</h3>
                  <Button>Record Payment</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Loan ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Principal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Interest</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Penalty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Method</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Reference</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment, index) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-medium">{payment.loanId}</td>
                          <td className="py-3 px-4">₵{payment.principalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">₵{payment.interestAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {payment.penaltyAmount > 0 ? `₵${payment.penaltyAmount.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-4 font-bold">₵{payment.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm">
                            {payment.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="py-3 px-4 text-sm">{payment.reference}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeView === 'calculator' && <LoanCalculator />}
        </AnimatePresence>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DealerLoans;