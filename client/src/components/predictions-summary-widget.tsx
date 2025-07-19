import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Brain, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import type { PredictionInsights } from "@shared/prediction-types";

export function PredictionsSummaryWidget() {
  const [, setLocation] = useLocation();

  const { data: insights, isLoading } = useQuery<PredictionInsights>({
    queryKey: ["/api/prediction-insights"],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="p-4 glassmorphism dark:glassmorphism-dark animate-pulse">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-3/4 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Card className="p-4 glassmorphism dark:glassmorphism-dark">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Predictions</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Inventory Intelligence</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLocation("/predictions")}
          className="text-xs h-7 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          View All
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {insights.criticalMaterials}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {insights.averageStockDays}d
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Stock</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <div className="w-3 h-3 bg-purple-600 rounded-full" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {insights.reorderSuggestions.length}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Reorders</p>
        </div>
      </div>

      {/* Top Risks Preview */}
      {insights.topRisks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Top Risks
          </h4>
          <div className="space-y-1">
            {insights.topRisks.slice(0, 3).map((risk) => (
              <div key={risk.materialId} className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    risk.criticalityLevel === 'critical' ? 'bg-red-500' :
                    risk.criticalityLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-gray-900 dark:text-white truncate">
                    {risk.materialName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {risk.daysUntilEmpty ? `${risk.daysUntilEmpty}d` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Trends Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Usage Trends</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">{insights.usageTrends.increasing}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-700 dark:text-gray-300">{insights.usageTrends.stable}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}