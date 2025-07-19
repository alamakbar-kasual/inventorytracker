import { db } from './db';
import { materialConsumption, materials, materialSkus } from '@shared/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';
import type { InventoryPrediction, UsagePattern, PredictionInsights, AdvancedPrediction } from '@shared/prediction-types';

export class InventoryPredictionService {
  // Calculate basic inventory predictions based on consumption history
  async calculatePredictions(): Promise<InventoryPrediction[]> {
    try {
      // Get all materials with consumption data from last 90 days
      const materialsData = await db
        .select({
          id: materials.id,
          name: materials.name,
          quantity: materials.quantity,
          unit: materials.unit,
          minStockLevel: materials.minStockLevel,
          category: materials.category,
        })
        .from(materials);

      const predictions: InventoryPrediction[] = [];

      for (const material of materialsData) {
        // Get consumption history for this material (last 90 days)
        const consumptionHistory = await db
          .select({
            quantity: materialConsumption.quantityUsed,
            date: materialConsumption.dateUsed,
          })
          .from(materialConsumption)
          .where(
            eq(materialConsumption.materialId, material.id)
          )
          .orderBy(desc(materialConsumption.dateUsed))
          .limit(100);

        const prediction = this.calculateMaterialPrediction(material, consumptionHistory);
        predictions.push(prediction);
      }

      return predictions.sort((a, b) => {
        // Sort by criticality and days until empty
        if (a.criticalityLevel !== b.criticalityLevel) {
          const criticalityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return criticalityOrder[a.criticalityLevel] - criticalityOrder[b.criticalityLevel];
        }
        return (a.daysUntilEmpty || 999) - (b.daysUntilEmpty || 999);
      });
    } catch (error) {
      console.error('Error calculating predictions:', error);
      return [];
    }
  }

  private calculateMaterialPrediction(
    material: any,
    consumptionHistory: { quantity: number; date: Date }[]
  ): InventoryPrediction {
    if (consumptionHistory.length === 0) {
      return {
        materialId: material.id,
        materialName: material.name,
        currentStock: material.quantity,
        averageDailyUsage: 0,
        usageTrend: 'stable',
        confidence: 0.1,
        criticalityLevel: 'low',
      };
    }

    // Calculate average daily usage
    const totalUsage = consumptionHistory.reduce((sum, record) => sum + record.quantity, 0);
    const daysSpanned = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - new Date(consumptionHistory[consumptionHistory.length - 1].date).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );
    
    const averageDailyUsage = totalUsage / daysSpanned;

    // Calculate trend (comparing first half vs second half of data)
    const midPoint = Math.floor(consumptionHistory.length / 2);
    const recentUsage = consumptionHistory.slice(0, midPoint).reduce((sum, r) => sum + r.quantity, 0) / midPoint;
    const olderUsage = consumptionHistory.slice(midPoint).reduce((sum, r) => sum + r.quantity, 0) / (consumptionHistory.length - midPoint);
    
    let usageTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentUsage > olderUsage * 1.2) {
      usageTrend = 'increasing';
    } else if (recentUsage < olderUsage * 0.8) {
      usageTrend = 'decreasing';
    }

    // Calculate confidence based on data consistency
    const usageVariance = this.calculateVariance(consumptionHistory.map(r => r.quantity));
    const confidence = Math.max(0.1, Math.min(0.95, 1 - (usageVariance / (averageDailyUsage + 1))));

    // Predict run-out date
    let daysUntilEmpty: number | undefined;
    let predictedRunOutDate: Date | undefined;
    
    if (averageDailyUsage > 0) {
      const adjustedUsage = usageTrend === 'increasing' ? averageDailyUsage * 1.2 : 
                            usageTrend === 'decreasing' ? averageDailyUsage * 0.8 : averageDailyUsage;
      daysUntilEmpty = Math.floor(material.quantity / adjustedUsage);
      predictedRunOutDate = new Date();
      predictedRunOutDate.setDate(predictedRunOutDate.getDate() + daysUntilEmpty);
    }

    // Determine criticality
    const criticalityLevel = this.calculateCriticality(material, daysUntilEmpty, usageTrend);

    // Calculate reorder suggestions
    const { recommendedReorderQuantity, recommendedReorderDate } = this.calculateReorderSuggestion(
      material,
      averageDailyUsage,
      usageTrend,
      daysUntilEmpty
    );

    return {
      materialId: material.id,
      materialName: material.name,
      currentStock: material.quantity,
      predictedRunOutDate,
      daysUntilEmpty,
      averageDailyUsage,
      usageTrend,
      confidence,
      recommendedReorderQuantity,
      recommendedReorderDate,
      criticalityLevel,
    };
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private calculateCriticality(
    material: any,
    daysUntilEmpty?: number,
    usageTrend: string = 'stable'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const minStockDays = 14; // Assume 2 weeks minimum stock
    
    if (!daysUntilEmpty) return 'low';
    
    if (daysUntilEmpty <= 7) return 'critical';
    if (daysUntilEmpty <= 14) return 'high';
    if (daysUntilEmpty <= 30 && usageTrend === 'increasing') return 'high';
    if (daysUntilEmpty <= 30) return 'medium';
    
    return 'low';
  }

  private calculateReorderSuggestion(
    material: any,
    averageDailyUsage: number,
    usageTrend: string,
    daysUntilEmpty?: number
  ): { recommendedReorderQuantity?: number; recommendedReorderDate?: Date } {
    if (averageDailyUsage === 0) return {};

    // Calculate recommended reorder quantity (30-60 days worth)
    const trendMultiplier = usageTrend === 'increasing' ? 1.3 : 
                          usageTrend === 'decreasing' ? 0.8 : 1.0;
    const recommendedReorderQuantity = Math.ceil(averageDailyUsage * 45 * trendMultiplier);

    // Calculate recommended reorder date (when stock hits 2 weeks worth)
    let recommendedReorderDate: Date | undefined;
    if (daysUntilEmpty && daysUntilEmpty > 14) {
      recommendedReorderDate = new Date();
      recommendedReorderDate.setDate(recommendedReorderDate.getDate() + (daysUntilEmpty - 14));
    }

    return { recommendedReorderQuantity, recommendedReorderDate };
  }

  // Generate insights summary
  async generateInsights(): Promise<PredictionInsights> {
    const predictions = await this.calculatePredictions();
    
    const criticalMaterials = predictions.filter(p => p.criticalityLevel === 'critical' || p.criticalityLevel === 'high').length;
    const averageStockDays = predictions
      .filter(p => p.daysUntilEmpty)
      .reduce((sum, p) => sum + (p.daysUntilEmpty || 0), 0) / predictions.filter(p => p.daysUntilEmpty).length;

    const topRisks = predictions
      .filter(p => p.criticalityLevel === 'critical' || p.criticalityLevel === 'high')
      .slice(0, 5);

    const reorderSuggestions = predictions
      .filter(p => p.recommendedReorderDate && p.recommendedReorderQuantity)
      .slice(0, 10);

    const usageTrends = {
      increasing: predictions.filter(p => p.usageTrend === 'increasing').length,
      decreasing: predictions.filter(p => p.usageTrend === 'decreasing').length,
      stable: predictions.filter(p => p.usageTrend === 'stable').length,
    };

    return {
      totalMaterials: predictions.length,
      criticalMaterials,
      averageStockDays: Math.round(averageStockDays) || 0,
      topRisks,
      reorderSuggestions,
      usageTrends,
    };
  }

  // Get usage patterns for a specific material
  async getUsagePatterns(materialId: number): Promise<UsagePattern[]> {
    const consumptionData = await db
      .select({
        quantity: materialConsumption.quantityUsed,
        date: materialConsumption.dateUsed,
      })
      .from(materialConsumption)
      .where(eq(materialConsumption.materialId, materialId))
      .orderBy(desc(materialConsumption.dateUsed));

    const patterns: UsagePattern[] = [];
    
    // Weekly pattern
    const weeklyUsage = this.calculatePeriodPattern(consumptionData, 'week');
    if (weeklyUsage.length > 0) {
      patterns.push({
        materialId,
        period: 'weekly',
        averageUsage: weeklyUsage.reduce((sum, w) => sum + w, 0) / weeklyUsage.length,
        peakUsage: Math.max(...weeklyUsage),
        lowUsage: Math.min(...weeklyUsage),
        volatility: this.calculateVariance(weeklyUsage),
      });
    }

    return patterns;
  }

  private calculatePeriodPattern(data: { quantity: number; date: Date }[], period: 'week' | 'month'): number[] {
    const usage: number[] = [];
    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    
    if (data.length === 0) return usage;
    
    const startDate = new Date(data[data.length - 1].date);
    const endDate = new Date(data[0].date);
    
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const periodEnd = new Date(currentDate.getTime() + periodMs);
      const periodUsage = data
        .filter(d => new Date(d.date) >= currentDate && new Date(d.date) < periodEnd)
        .reduce((sum, d) => sum + d.quantity, 0);
      
      usage.push(periodUsage);
      currentDate = periodEnd;
    }
    
    return usage;
  }
}

export const predictionService = new InventoryPredictionService();