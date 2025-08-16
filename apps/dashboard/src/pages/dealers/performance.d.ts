import { NextPage } from 'next';
interface DealerPerformance {
    id: string;
    dealerName: string;
    region: string;
    salesVolume: number;
    targetVolume: number;
    revenue: number;
    marketShare: number;
    customerSatisfaction: number;
    paymentScore: number;
    complianceScore: number;
    overallRating: 'excellent' | 'good' | 'fair' | 'poor';
    lastUpdated: string;
}
declare const DealerPerformance: NextPage;
export default DealerPerformance;
//# sourceMappingURL=performance.d.ts.map