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
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Select_1 = require("@/components/ui/Select");
const Table_1 = require("@/components/ui/Table");
const DealerPerformance = () => {
    const [performanceData] = (0, react_1.useState)([
        {
            id: '1',
            dealerName: 'Golden Star Petroleum',
            region: 'Greater Accra',
            salesVolume: 2500000,
            targetVolume: 2200000,
            revenue: 37500000,
            marketShare: 18.5,
            customerSatisfaction: 4.2,
            paymentScore: 95,
            complianceScore: 92,
            overallRating: 'excellent',
            lastUpdated: '2025-01-13'
        },
        {
            id: '2',
            dealerName: 'Allied Oil Company',
            region: 'Northern',
            salesVolume: 1800000,
            targetVolume: 2000000,
            revenue: 27000000,
            marketShare: 15.2,
            customerSatisfaction: 3.8,
            paymentScore: 88,
            complianceScore: 85,
            overallRating: 'good',
            lastUpdated: '2025-01-12'
        },
        {
            id: '3',
            dealerName: 'Star Oil Ltd',
            region: 'Upper West',
            salesVolume: 1200000,
            targetVolume: 1500000,
            revenue: 18000000,
            marketShare: 12.8,
            customerSatisfaction: 3.5,
            paymentScore: 82,
            complianceScore: 78,
            overallRating: 'fair',
            lastUpdated: '2025-01-11'
        }
    ]);
    const [regionFilter, setRegionFilter] = (0, react_1.useState)('all');
    const [ratingFilter, setRatingFilter] = (0, react_1.useState)('all');
    const filteredData = (0, react_1.useMemo)(() => {
        return performanceData.filter(dealer => {
            const matchesRegion = regionFilter === 'all' || dealer.region === regionFilter;
            const matchesRating = ratingFilter === 'all' || dealer.overallRating === ratingFilter;
            return matchesRegion && matchesRating;
        });
    }, [performanceData, regionFilter, ratingFilter]);
    const getRatingColor = (rating) => {
        const colors = {
            excellent: 'text-green-400 bg-green-400/10 border-green-400/30',
            good: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
            fair: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
            poor: 'text-red-400 bg-red-400/10 border-red-400/30'
        };
        return colors[rating];
    };
    const regionOptions = [
        { value: 'all', label: 'All Regions' },
        { value: 'Greater Accra', label: 'Greater Accra' },
        { value: 'Northern', label: 'Northern' },
        { value: 'Upper West', label: 'Upper West' },
        { value: 'Ashanti', label: 'Ashanti' }
    ];
    const ratingOptions = [
        { value: 'all', label: 'All Ratings' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' }
    ];
    const tableColumns = [
        { key: 'dealerName', label: 'Dealer Name' },
        { key: 'region', label: 'Region' },
        { key: 'performance', label: 'Sales Performance' },
        { key: 'marketShare', label: 'Market Share (%)' },
        { key: 'scores', label: 'Scores' },
        { key: 'overallRating', label: 'Overall Rating' },
        { key: 'actions', label: 'Actions' }
    ];
    const tableData = filteredData.map(dealer => ({
        dealerName: dealer.dealerName,
        region: dealer.region,
        performance: (<div className="text-sm">
        <div>Volume: {(dealer.salesVolume / 1000000).toFixed(1)}M L</div>
        <div>Target: {(dealer.targetVolume / 1000000).toFixed(1)}M L</div>
        <div className={`${dealer.salesVolume >= dealer.targetVolume ? 'text-green-400' : 'text-yellow-400'}`}>
          {((dealer.salesVolume / dealer.targetVolume) * 100).toFixed(0)}% of target
        </div>
      </div>),
        marketShare: `${dealer.marketShare.toFixed(1)}%`,
        scores: (<div className="text-sm">
        <div>Payment: {dealer.paymentScore}%</div>
        <div>Compliance: {dealer.complianceScore}%</div>
        <div>Satisfaction: {dealer.customerSatisfaction.toFixed(1)}/5</div>
      </div>),
        overallRating: (<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRatingColor(dealer.overallRating)}`}>
        {dealer.overallRating.toUpperCase()}
      </span>),
        actions: (<div className="flex space-x-2">
        <Button_1.Button variant="outline" size="sm">View Details</Button_1.Button>
        <Button_1.Button variant="outline" size="sm">Generate Report</Button_1.Button>
      </div>)
    }));
    const totalRevenue = filteredData.reduce((sum, dealer) => sum + dealer.revenue, 0);
    const avgPerformance = filteredData.reduce((sum, dealer) => sum + (dealer.salesVolume / dealer.targetVolume), 0) / filteredData.length * 100;
    const avgMarketShare = filteredData.reduce((sum, dealer) => sum + dealer.marketShare, 0) / filteredData.length;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-gradient">
            Dealer Performance Tracking
          </h1>
          <p className="text-dark-400 mt-2">
            Monitor and analyze dealer performance metrics and KPIs
          </p>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-white">₵{(totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
            </div>
          </Card_1.Card>

          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Avg Performance</p>
                <p className="text-2xl font-bold text-white">{avgPerformance.toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
          </Card_1.Card>

          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Avg Market Share</p>
                <p className="text-2xl font-bold text-white">{avgMarketShare.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </Card_1.Card>

          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 mb-1">Active Dealers</p>
                <p className="text-2xl font-bold text-white">{filteredData.length}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
          </Card_1.Card>
        </div>

        {/* Filters */}
        <Card_1.Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select_1.Select options={regionOptions} value={regionFilter} onChange={(value) => setRegionFilter(value)} placeholder="Filter by region"/>
            </div>
            <div>
              <Select_1.Select options={ratingOptions} value={ratingFilter} onChange={(value) => setRatingFilter(value)} placeholder="Filter by rating"/>
            </div>
            <div>
              <Button_1.Button variant="outline" className="w-full">Clear Filters</Button_1.Button>
            </div>
          </div>
        </Card_1.Card>

        {/* Performance Table */}
        <Card_1.Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Dealer Performance</h3>
            <Button_1.Button variant="outline">Export Report</Button_1.Button>
          </div>
          <Table_1.Table columns={tableColumns} data={tableData} className="w-full"/>
        </Card_1.Card>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DealerPerformance;
//# sourceMappingURL=performance.js.map