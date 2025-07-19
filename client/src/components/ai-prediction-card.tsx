import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import type { InventoryPrediction } from "@shared/prediction-types";

interface AiPredictionCardProps {
  materialId: number;
  materialName: string;
}

export function AiPredictionCard({ materialId, materialName }: AiPredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get prediction for this specific material
  const { data: predictions, isLoading } = useQuery<InventoryPrediction[]>({
    queryKey: ["/api/predictions"],
    select: (data) => data.filter(p => p.materialId === materialId),
  });

  const prediction = predictions?.[0];

  if (isLoading) {
    return (
      <Card className="p-3 glassmorphism dark:glassmorphism-dark animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return null;
  }

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'decreasing': return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Card className="glassmorphism dark:glassmorphism-dark overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">AI Prediction</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>

        {/* Quick Summary */}
        <div className="flex items-center space-x-2 mb-2">
          <Badge className={`text-xs px-2 py-0.5 ${getCriticalityColor(prediction.criticalityLevel)}`}>
            {prediction.criticalityLevel}
          </Badge>
          <div className="flex items-center space-x-1">
            {getTrendIcon(prediction.usageTrend)}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {prediction.usageTrend}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(prediction.confidence * 100)}% confidence
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Days left</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {prediction.daysUntilEmpty || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Daily usage</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {prediction.averageDailyUsage.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {prediction.predictedRunOutDate && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expected empty</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {new Date(prediction.predictedRunOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {prediction.recommendedReorderQuantity && (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Recommended reorder</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {prediction.recommendedReorderQuantity} units
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}