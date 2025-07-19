export interface InventoryPrediction {
  materialId: number;
  materialName: string;
  currentStock: number;
  predictedRunOutDate?: Date;
  daysUntilEmpty?: number;
  averageDailyUsage: number;
  usageTrend: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-1 scale
  recommendedReorderQuantity?: number;
  recommendedReorderDate?: Date;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface UsagePattern {
  materialId: number;
  period: 'weekly' | 'monthly' | 'quarterly';
  averageUsage: number;
  peakUsage: number;
  lowUsage: number;
  volatility: number; // coefficient of variation
  seasonality?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface PredictionInsights {
  totalMaterials: number;
  criticalMaterials: number;
  averageStockDays: number;
  topRisks: InventoryPrediction[];
  reorderSuggestions: InventoryPrediction[];
  usageTrends: {
    increasing: number;
    decreasing: number;
    stable: number;
  };
}

export interface AdvancedPrediction {
  materialId: number;
  predictionType: 'demand_forecast' | 'seasonal_trend' | 'supply_optimization' | 'cost_analysis';
  prediction: string;
  confidence: number;
  impactLevel: 'low' | 'medium' | 'high';
  actionItems: string[];
  generatedAt: Date;
}