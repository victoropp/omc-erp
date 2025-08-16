import { DatabaseService } from '../services/database.service';
export interface ForecastRequest {
    stationId?: string;
    productType: string;
    horizon: number;
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
    includeConfidenceInterval: boolean;
    externalFactors?: {
        weather?: boolean;
        events?: boolean;
        holidays?: boolean;
        economicIndicators?: boolean;
        competitorPricing?: boolean;
    };
}
export interface ForecastResult {
    stationId?: string;
    productType: string;
    predictions: Array<{
        timestamp: Date;
        value: number;
        lowerBound?: number;
        upperBound?: number;
        confidence?: number;
    }>;
    accuracy: {
        mape: number;
        rmse: number;
        mae: number;
        r2: number;
    };
    metadata: {
        modelUsed: string[];
        trainingDataPoints: number;
        generatedAt: Date;
        horizon: number;
        granularity: string;
    };
}
/**
 * Enterprise-grade Forecasting Engine
 * Implements multiple state-of-the-art models with ensemble methods
 */
export declare class ForecastingEngine {
    private dbService;
    private lstmModel;
    private prophetModel;
    private arimaModel;
    private xgboostModel;
    private ensembleModel;
    private featureEngineering;
    private dataPreprocessor;
    private modelEvaluator;
    private modelsReady;
    constructor(dbService: DatabaseService);
    private initializeModels;
    /**
     * Generate demand forecast with 95% accuracy target
     */
    generateForecast(request: ForecastRequest): Promise<ForecastResult>;
    /**
     * Real-time adaptive learning
     */
    updateModelsWithActuals(stationId: string, productType: string, actuals: Array<{
        timestamp: Date;
        value: number;
    }>): Promise<void>;
    /**
     * Anomaly detection in demand patterns
     */
    detectAnomalies(stationId: string, productType: string, threshold?: number): Promise<Array<{
        timestamp: Date;
        value: number;
        anomalyScore: number;
    }>>;
    /**
     * What-if scenario analysis
     */
    runScenarioAnalysis(baseRequest: ForecastRequest, scenarios: Array<{
        name: string;
        adjustments: {
            priceChange?: number;
            competitorPriceChange?: number;
            eventImpact?: string;
            weatherCondition?: string;
        };
    }>): Promise<Array<{
        scenario: string;
        forecast: ForecastResult;
    }>>;
    /**
     * Multi-product cannibalization analysis
     */
    analyzeCannibalization(stationId: string, products: string[]): Promise<{
        crossElasticities: Record<string, Record<string, number>>;
        substitutionPatterns: Array<{
            from: string;
            to: string;
            rate: number;
        }>;
    }>;
    /**
     * Seasonal decomposition
     */
    decomposeTimeSeries(stationId: string, productType: string): Promise<{
        trend: number[];
        seasonal: number[];
        residual: number[];
        seasonalPeriod: number;
    }>;
    /**
     * Get model performance metrics
     */
    getModelStatus(): Promise<{
        models: Array<{
            name: string;
            status: string;
            lastTrained: Date;
            accuracy: number;
            nextRetraining: Date;
        }>;
    }>;
    private fetchHistoricalData;
    private loadPretrainedModels;
    private postProcessPredictions;
    private calculateConfidenceIntervals;
    private evaluateAccuracy;
    private storeForecast;
    private calculatePredictionErrors;
    private triggerIncrementalLearning;
    private sendAnomalyAlert;
    private applyScenarioAdjustments;
    private fetchMultiProductSales;
    private calculateCrossElasticities;
    private mineSubstitutionPatterns;
}
//# sourceMappingURL=forecasting-engine.d.ts.map