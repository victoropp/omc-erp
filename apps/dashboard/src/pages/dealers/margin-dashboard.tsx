import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh,
  Download,
  FilterList,
  Assessment,
  AccountBalance,
  Payment,
  Timeline,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DealerMarginMetrics {
  totalMarginEarned: number;
  averageMarginPerLitre: number;
  marginEfficiency: number;
  totalLitresSold: number;
  operationalDays: number;
  performanceRating: string;
  marginTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

interface LoanSummary {
  activeLoans: number;
  totalOutstanding: number;
  monthlyObligations: number;
  paymentReliability: number;
  nextPaymentDue: Date;
  loanPerformance: 'GOOD' | 'SATISFACTORY' | 'POOR';
}

interface SettlementSummary {
  pendingSettlements: number;
  approvedSettlements: number;
  paidSettlements: number;
  totalNetPayable: number;
  averageSettlementAmount: number;
  lastSettlementDate: Date;
}

interface MarginTrend {
  date: string;
  margin: number;
  volume: number;
  efficiency: number;
  benchmark: number;
}

interface ProductMix {
  product: string;
  volume: number;
  margin: number;
  percentage: number;
}

const DealerMarginDashboard: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Dashboard data
  const [marginMetrics, setMarginMetrics] = useState<DealerMarginMetrics | null>(null);
  const [loanSummary, setLoanSummary] = useState<LoanSummary | null>(null);
  const [settlementSummary, setSettlementSummary] = useState<SettlementSummary | null>(null);
  const [marginTrends, setMarginTrends] = useState<MarginTrend[]>([]);
  const [productMix, setProductMix] = useState<ProductMix[]>([]);
  const [alerts, setAlerts] = useState<Array<{ type: 'success' | 'warning' | 'error' | 'info'; message: string }>>([]);

  // Mock data - in real implementation, this would come from API calls
  useEffect(() => {
    loadDashboardData();
  }, [selectedStation, selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - replace with actual API calls
    setMarginMetrics({
      totalMarginEarned: 125000,
      averageMarginPerLitre: 0.34,
      marginEfficiency: 94.2,
      totalLitresSold: 367500,
      operationalDays: 28,
      performanceRating: 'EXCELLENT',
      marginTrend: 'IMPROVING',
    });

    setLoanSummary({
      activeLoans: 2,
      totalOutstanding: 85000,
      monthlyObligations: 8500,
      paymentReliability: 96.7,
      nextPaymentDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      loanPerformance: 'GOOD',
    });

    setSettlementSummary({
      pendingSettlements: 1,
      approvedSettlements: 2,
      paidSettlements: 26,
      totalNetPayable: 45000,
      averageSettlementAmount: 15000,
      lastSettlementDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Generate mock trend data
    const trends: MarginTrend[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: format(date, 'MMM dd'),
        margin: 4000 + Math.random() * 2000,
        volume: 12000 + Math.random() * 3000,
        efficiency: 90 + Math.random() * 8,
        benchmark: 4200,
      });
    }
    setMarginTrends(trends);

    // Mock product mix data
    setProductMix([
      { product: 'PMS', volume: 245000, margin: 85750, percentage: 66.7 },
      { product: 'AGO', volume: 98000, margin: 29400, percentage: 26.7 },
      { product: 'LPG', volume: 24500, margin: 9800, percentage: 6.6 },
    ]);

    // Mock alerts
    setAlerts([
      { type: 'success', message: 'Margin efficiency improved by 2.3% compared to last month' },
      { type: 'warning', message: 'Loan payment due in 5 days - GHS 8,500' },
      { type: 'info', message: 'New settlement statement available for download' },
    ]);

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp color="success" />;
      case 'DECLINING': return <TrendingDown color="error" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT': return 'success';
      case 'GOOD': return 'info';
      case 'SATISFACTORY': return 'warning';
      default: return 'error';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const pieColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  if (loading && !marginMetrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dealer Margin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Station</InputLabel>
            <Select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              label="Station"
            >
              <MenuItem value="">All Stations</MenuItem>
              <MenuItem value="ST-001">Station Alpha - Accra</MenuItem>
              <MenuItem value="ST-002">Station Beta - Kumasi</MenuItem>
              <MenuItem value="ST-003">Station Gamma - Tamale</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="7">7 Days</MenuItem>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert severity={alert.type} sx={{ mb: 2 }} key={index}>
          {alert.message}
        </Alert>
      ))}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Margin Earned
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(marginMetrics?.totalMarginEarned || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(marginMetrics?.marginTrend || 'STABLE')}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      {marginMetrics?.marginTrend}
                    </Typography>
                  </Box>
                </Box>
                <Assessment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Margin per Litre
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(marginMetrics?.averageMarginPerLitre || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency: {marginMetrics?.marginEfficiency.toFixed(1)}%
                  </Typography>
                </Box>
                <Timeline color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Outstanding Loans
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(loanSummary?.totalOutstanding || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {loanSummary?.activeLoans} active loans
                  </Typography>
                </Box>
                <AccountBalance color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Payments
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(settlementSummary?.totalNetPayable || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {settlementSummary?.pendingSettlements} settlements
                  </Typography>
                </Box>
                <Payment color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Margin Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Daily Margin Trends
                </Typography>
                <Chip
                  label={marginMetrics?.performanceRating}
                  color={getPerformanceColor(marginMetrics?.performanceRating || 'SATISFACTORY') as any}
                  size="small"
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marginTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="margin" stroke="#8884d8" name="Daily Margin (GHS)" />
                  <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" strokeDasharray="5 5" name="Benchmark" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Mix */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Product Mix by Volume
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productMix}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="volume"
                  >
                    {productMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Volume vs Margin Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Volume vs Margin Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marginTrends.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume (L)" />
                  <Bar yAxisId="right" dataKey="margin" fill="#82ca9d" name="Margin (GHS)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Performance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {formatNumber(marginMetrics?.totalLitresSold || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Litres Sold
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h4" color="secondary" fontWeight="bold">
                      {marginMetrics?.operationalDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Operational Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {loanSummary?.paymentReliability.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Payment Reliability
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {formatCurrency((marginMetrics?.totalMarginEarned || 0) / (marginMetrics?.operationalDays || 1))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Daily Margin
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Latest Settlement
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(settlementSummary?.averageSettlementAmount || 0)}
                    </Typography>
                    <Typography variant="caption">
                      {format(settlementSummary?.lastSettlementDate || new Date(), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, color: 'warning.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Next Loan Payment
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(loanSummary?.monthlyObligations || 0)}
                    </Typography>
                    <Typography variant="caption">
                      Due: {format(loanSummary?.nextPaymentDue || new Date(), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Performance Rating
                    </Typography>
                    <Typography variant="body2">
                      {marginMetrics?.performanceRating}
                    </Typography>
                    <Typography variant="caption">
                      Based on 30-day performance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DealerMarginDashboard;