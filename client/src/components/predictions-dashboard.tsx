import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Package, 
  Zap,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InventoryPrediction, PredictionInsights } from "@shared/prediction-types";
import { format } from "date-fns";

export function PredictionsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch predictions
  const { data: predictions = [], isLoading: predictionsLoading, refetch: refetchPredictions } = useQuery<InventoryPrediction[]>({
    queryKey: ["/api/predictions"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch insights
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery<PredictionInsights>({
    queryKey: ["/api/prediction-insights"],
    refetchInterval: 5 * 60 * 1000,
  });

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 dark:text-red-300';
      case 'high': return 'text-orange-700 dark:text-orange-300';
      case 'medium': return 'text-yellow-700 dark:text-yellow-300';
      case 'low': return 'text-green-700 dark:text-green-300';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const handleRefresh = () => {
    refetchPredictions();
    refetchInsights();
  };

  if (predictionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Analyzing inventory patterns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Inventory Predictions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Intelligent forecasting and stock optimization
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Key Metrics */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 glassmorphism dark:glassmorphism-dark">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.totalMaterials}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Materials</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glassmorphism dark:glassmorphism-dark">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.criticalMaterials}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Need Attention</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glassmorphism dark:glassmorphism-dark">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.averageStockDays}d</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Stock Days</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glassmorphism dark:glassmorphism-dark">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.usageTrends.increasing}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trending Up</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risks">Top Risks</TabsTrigger>
          <TabsTrigger value="reorders">Reorder Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Materials */}
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Critical Materials
              </h3>
              <div className="space-y-3">
                {predictions
                  .filter(p => p.criticalityLevel === 'critical' || p.criticalityLevel === 'high')
                  .slice(0, 5)
                  .map((prediction) => (
                    <div key={prediction.materialId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCriticalityColor(prediction.criticalityLevel)}`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{prediction.materialName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prediction.currentStock} units • {prediction.daysUntilEmpty || '∞'} days left
                          </p>
                        </div>
                      </div>
                      {getTrendIcon(prediction.usageTrend)}
                    </div>
                  ))}
              </div>
            </Card>

            {/* Usage Trends */}
            <Card className="p-6 glassmorphism dark:glassmorphism-dark">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Usage Trends
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-gray-900 dark:text-white">Increasing Usage</span>
                  </div>
                  <Badge variant="secondary">{insights?.usageTrends.increasing || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-gray-900 dark:text-white">Decreasing Usage</span>
                  </div>
                  <Badge variant="secondary">{insights?.usageTrends.decreasing || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                    <span className="text-gray-900 dark:text-white">Stable Usage</span>
                  </div>
                  <Badge variant="secondary">{insights?.usageTrends.stable || 0}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card className="p-6 glassmorphism dark:glassmorphism-dark">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              High Risk Materials
            </h3>
            <div className="space-y-4">
              {predictions
                .filter(p => p.criticalityLevel === 'critical' || p.criticalityLevel === 'high')
                .map((prediction) => (
                  <div key={prediction.materialId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{prediction.materialName}</h4>
                        <Badge className={getCriticalityTextColor(prediction.criticalityLevel)}>
                          {prediction.criticalityLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(prediction.usageTrend)}
                        <Badge variant="outline">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Stock</p>
                        <p className="font-medium text-gray-900 dark:text-white">{prediction.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Days Left</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.daysUntilEmpty || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Daily Usage</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.averageDailyUsage.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Predicted Empty</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.predictedRunOutDate 
                            ? format(new Date(prediction.predictedRunOutDate), 'MMM dd')
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reorders" className="space-y-4">
          <Card className="p-6 glassmorphism dark:glassmorphism-dark">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reorder Recommendations
            </h3>
            <div className="space-y-4">
              {predictions
                .filter(p => p.recommendedReorderQuantity && p.recommendedReorderDate)
                .slice(0, 10)
                .map((prediction) => (
                  <div key={prediction.materialId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">{prediction.materialName}</h4>
                      </div>
                      <Badge className={getCriticalityTextColor(prediction.criticalityLevel)}>
                        {prediction.criticalityLevel}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Recommended Quantity</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.recommendedReorderQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Reorder By</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.recommendedReorderDate 
                            ? format(new Date(prediction.recommendedReorderDate), 'MMM dd, yyyy')
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Days Until Reorder</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prediction.recommendedReorderDate 
                            ? Math.max(0, Math.ceil((new Date(prediction.recommendedReorderDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}