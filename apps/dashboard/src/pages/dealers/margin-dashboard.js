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
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const recharts_1 = require("recharts");
const date_fns_1 = require("date-fns");
const DealerMarginDashboard = () => {
    const [selectedStation, setSelectedStation] = (0, react_1.useState)('');
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('30');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    // Dashboard data
    const [marginMetrics, setMarginMetrics] = (0, react_1.useState)(null);
    const [loanSummary, setLoanSummary] = (0, react_1.useState)(null);
    const [settlementSummary, setSettlementSummary] = (0, react_1.useState)(null);
    const [marginTrends, setMarginTrends] = (0, react_1.useState)([]);
    const [productMix, setProductMix] = (0, react_1.useState)([]);
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    // Mock data - in real implementation, this would come from API calls
    (0, react_1.useEffect)(() => {
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
        const trends = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            trends.push({
                date: (0, date_fns_1.format)(date, 'MMM dd'),
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
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'IMPROVING': return <icons_material_1.TrendingUp color="success"/>;
            case 'DECLINING': return <icons_material_1.TrendingDown color="error"/>;
            default: return <icons_material_1.TrendingFlat color="action"/>;
        }
    };
    const getPerformanceColor = (rating) => {
        switch (rating) {
            case 'EXCELLENT': return 'success';
            case 'GOOD': return 'info';
            case 'SATISFACTORY': return 'warning';
            default: return 'error';
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
        }).format(amount);
    };
    const formatNumber = (num, decimals = 0) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    };
    const pieColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    if (loading && !marginMetrics) {
        return (<material_1.Box sx={{ p: 3 }}>
        <material_1.Skeleton variant="rectangular" height={200} sx={{ mb: 2 }}/>
        <material_1.Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (<material_1.Grid item xs={12} sm={6} md={3} key={index}>
              <material_1.Skeleton variant="rectangular" height={120}/>
            </material_1.Grid>))}
        </material_1.Grid>
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Header */}
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <material_1.Typography variant="h4" component="h1" fontWeight="bold">
          Dealer Margin Dashboard
        </material_1.Typography>
        <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <material_1.FormControl size="small" sx={{ minWidth: 200 }}>
            <material_1.InputLabel>Station</material_1.InputLabel>
            <material_1.Select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} label="Station">
              <material_1.MenuItem value="">All Stations</material_1.MenuItem>
              <material_1.MenuItem value="ST-001">Station Alpha - Accra</material_1.MenuItem>
              <material_1.MenuItem value="ST-002">Station Beta - Kumasi</material_1.MenuItem>
              <material_1.MenuItem value="ST-003">Station Gamma - Tamale</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>
          
          <material_1.FormControl size="small" sx={{ minWidth: 120 }}>
            <material_1.InputLabel>Period</material_1.InputLabel>
            <material_1.Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} label="Period">
              <material_1.MenuItem value="7">7 Days</material_1.MenuItem>
              <material_1.MenuItem value="30">30 Days</material_1.MenuItem>
              <material_1.MenuItem value="90">90 Days</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>

          <material_1.Tooltip title="Refresh data">
            <material_1.IconButton onClick={handleRefresh} disabled={refreshing}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Button startIcon={<icons_material_1.Download />} variant="outlined" size="small">
            Export
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {/* Alerts */}
      {alerts.map((alert, index) => (<material_1.Alert severity={alert.type} sx={{ mb: 2 }} key={index}>
          {alert.message}
        </material_1.Alert>))}

      {/* Key Metrics Cards */}
      <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <material_1.Box>
                  <material_1.Typography color="textSecondary" gutterBottom variant="body2">
                    Total Margin Earned
                  </material_1.Typography>
                  <material_1.Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(marginMetrics?.totalMarginEarned || 0)}
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(marginMetrics?.marginTrend || 'STABLE')}
                    <material_1.Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      {marginMetrics?.marginTrend}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>
                <icons_material_1.Assessment color="primary" sx={{ fontSize: 40 }}/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <material_1.Box>
                  <material_1.Typography color="textSecondary" gutterBottom variant="body2">
                    Margin per Litre
                  </material_1.Typography>
                  <material_1.Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(marginMetrics?.averageMarginPerLitre || 0)}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" color="text.secondary">
                    Efficiency: {marginMetrics?.marginEfficiency.toFixed(1)}%
                  </material_1.Typography>
                </material_1.Box>
                <icons_material_1.Timeline color="secondary" sx={{ fontSize: 40 }}/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <material_1.Box>
                  <material_1.Typography color="textSecondary" gutterBottom variant="body2">
                    Outstanding Loans
                  </material_1.Typography>
                  <material_1.Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(loanSummary?.totalOutstanding || 0)}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" color="text.secondary">
                    {loanSummary?.activeLoans} active loans
                  </material_1.Typography>
                </material_1.Box>
                <icons_material_1.AccountBalance color="warning" sx={{ fontSize: 40 }}/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <material_1.Box>
                  <material_1.Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Payments
                  </material_1.Typography>
                  <material_1.Typography variant="h5" component="div" fontWeight="bold">
                    {formatCurrency(settlementSummary?.totalNetPayable || 0)}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" color="text.secondary">
                    {settlementSummary?.pendingSettlements} settlements
                  </material_1.Typography>
                </material_1.Box>
                <icons_material_1.Payment color="info" sx={{ fontSize: 40 }}/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>

      <material_1.Grid container spacing={3}>
        {/* Margin Trends Chart */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <material_1.Typography variant="h6" component="h2">
                  Daily Margin Trends
                </material_1.Typography>
                <material_1.Chip label={marginMetrics?.performanceRating} color={getPerformanceColor(marginMetrics?.performanceRating || 'SATISFACTORY')} size="small"/>
              </material_1.Box>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.LineChart data={marginTrends}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Line type="monotone" dataKey="margin" stroke="#8884d8" name="Daily Margin (GHS)"/>
                  <recharts_1.Line type="monotone" dataKey="benchmark" stroke="#82ca9d" strokeDasharray="5 5" name="Benchmark"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Product Mix */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Product Mix by Volume
              </material_1.Typography>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.PieChart>
                  <recharts_1.Pie data={productMix} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name} ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="volume">
                    {productMix.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]}/>))}
                  </recharts_1.Pie>
                  <recharts_1.Tooltip />
                </recharts_1.PieChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Volume vs Margin Performance */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Volume vs Margin Performance
              </material_1.Typography>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={marginTrends.slice(-7)}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="date"/>
                  <recharts_1.YAxis yAxisId="left"/>
                  <recharts_1.YAxis yAxisId="right" orientation="right"/>
                  <recharts_1.Tooltip />
                  <recharts_1.Legend />
                  <recharts_1.Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume (L)"/>
                  <recharts_1.Bar yAxisId="right" dataKey="margin" fill="#82ca9d" name="Margin (GHS)"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Performance Summary */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Performance Summary
              </material_1.Typography>
              <material_1.Grid container spacing={2}>
                <material_1.Grid item xs={6}>
                  <material_1.Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <material_1.Typography variant="h4" color="primary" fontWeight="bold">
                      {formatNumber(marginMetrics?.totalLitresSold || 0)}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="textSecondary">
                      Total Litres Sold
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={6}>
                  <material_1.Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <material_1.Typography variant="h4" color="secondary" fontWeight="bold">
                      {marginMetrics?.operationalDays}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="textSecondary">
                      Operational Days
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={6}>
                  <material_1.Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <material_1.Typography variant="h4" color="success.main" fontWeight="bold">
                      {loanSummary?.paymentReliability.toFixed(1)}%
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="textSecondary">
                      Payment Reliability
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={6}>
                  <material_1.Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <material_1.Typography variant="h4" color="warning.main" fontWeight="bold">
                      {formatCurrency((marginMetrics?.totalMarginEarned || 0) / (marginMetrics?.operationalDays || 1))}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="textSecondary">
                      Avg Daily Margin
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Recent Activity */}
        <material_1.Grid item xs={12}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Recent Activity
              </material_1.Typography>
              <material_1.Grid container spacing={2}>
                <material_1.Grid item xs={12} md={4}>
                  <material_1.Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
                    <material_1.Typography variant="subtitle1" fontWeight="bold">
                      Latest Settlement
                    </material_1.Typography>
                    <material_1.Typography variant="body2">
                      {formatCurrency(settlementSummary?.averageSettlementAmount || 0)}
                    </material_1.Typography>
                    <material_1.Typography variant="caption">
                      {(0, date_fns_1.format)(settlementSummary?.lastSettlementDate || new Date(), 'MMM dd, yyyy')}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={12} md={4}>
                  <material_1.Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, color: 'warning.contrastText' }}>
                    <material_1.Typography variant="subtitle1" fontWeight="bold">
                      Next Loan Payment
                    </material_1.Typography>
                    <material_1.Typography variant="body2">
                      {formatCurrency(loanSummary?.monthlyObligations || 0)}
                    </material_1.Typography>
                    <material_1.Typography variant="caption">
                      Due: {(0, date_fns_1.format)(loanSummary?.nextPaymentDue || new Date(), 'MMM dd, yyyy')}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
                <material_1.Grid item xs={12} md={4}>
                  <material_1.Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
                    <material_1.Typography variant="subtitle1" fontWeight="bold">
                      Performance Rating
                    </material_1.Typography>
                    <material_1.Typography variant="body2">
                      {marginMetrics?.performanceRating}
                    </material_1.Typography>
                    <material_1.Typography variant="caption">
                      Based on 30-day performance
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = DealerMarginDashboard;
//# sourceMappingURL=margin-dashboard.js.map