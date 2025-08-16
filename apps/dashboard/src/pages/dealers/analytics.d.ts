import React from 'react';
interface DealerAnalytics {
    dealerId: string;
    dealerName: string;
    location: string;
    region: string;
    performanceMetrics: {
        monthlyRevenue: number;
        monthlyVolume: number;
        marginCompliance: number;
        customerSatisfaction: number;
        operationalEfficiency: number;
        profitability: number;
    };
    trendsData: {
        revenue: number[];
        volume: number[];
        transactions: number[];
        customers: number[];
    };
    rankings: {
        revenueRank: number;
        volumeRank: number;
        complianceRank: number;
        efficiencyRank: number;
    };
    forecasts: {
        predictedRevenue: number;
        predictedVolume: number;
        growthRate: number;
        riskScore: number;
    };
}
declare const DealerAnalytics: () => React.JSX.Element;
export default DealerAnalytics;
//# sourceMappingURL=analytics.d.ts.map