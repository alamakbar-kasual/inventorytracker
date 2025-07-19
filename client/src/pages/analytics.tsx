import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/bottom-nav";
import { NotificationThresholdModal } from "@/components/notification-threshold-modal";
import {
  StockLevelsChart,
  UsageTrendsChart,
  StockVsUsageChart,
  ConsumptionRateChart,
} from "@/components/analytics-charts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Bell,
  Package,
  BarChart3,
  Calendar,
  Target,
  Activity,
  ArrowLeft,
  Settings,
  LineChart
} from "lucide-react";
import { Material, MaterialConsumption } from "@shared/schema";
import { format, subDays, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  materials: Material[];
  consumption: MaterialConsumption[];
  stats: {
    totalItems: number;
    lowStock: number;
    categories: number;
  };
}

interface MaterialAnalytics {
  material: Material;
  totalConsumed: number;
  avgDailyConsumption: number;
  daysUntilEmpty: number;
  trend: 'up' | 'down' | 'stable';
  stockLevel: 'critical' | 'low' | 'normal' | 'high';
  projectedRestockDate: Date | null;
}

interface NotificationThreshold {
  id: string;
  materialId: number;
  materialName: string;
  threshold: number;
  userEmail: string;
  alertType: "low_stock" | "critical_stock" | "usage_spike";
  isActive: boolean;
}

export default function AnalyticsPage() {
  const [notificationsSent, setNotificationsSent] = useState<Set<number>>(new Set());
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [notificationThresholds, setNotificationThresholds] = useState<NotificationThreshold[]>([]);
  const { toast } = useToast();

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setLocation("/");
    }
  };

  // Handle notification threshold management
  const handleThresholdAdd = (threshold: Omit<NotificationThreshold, 'id'>) => {
    const newThreshold = {
      ...threshold,
      id: `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setNotificationThresholds(prev => [...prev, newThreshold]);
  };

  const handleThresholdRemove = (id: string) => {
    setNotificationThresholds(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Threshold Removed",
      description: "Notification threshold has been removed.",
    });
  };

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const [materialsRes, consumptionRes, statsRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/consumption'),
        fetch('/api/stats')
      ]);
      
      const materials = await materialsRes.json();
      const consumption = await consumptionRes.json();
      const stats = await statsRes.json();
      
      return { materials, consumption, stats };
    }
  });

  // Check if any thresholds are triggered
  const checkTriggeredThresholds = () => {
    if (!analyticsData) return [];
    
    return notificationThresholds.filter(threshold => {
      const material = analyticsData.materials.find(m => m.id === threshold.materialId);
      if (!material) return false;
      
      switch (threshold.alertType) {
        case "low_stock":
          return material.quantity <= threshold.threshold;
        case "critical_stock":
          return material.quantity <= threshold.threshold;
        case "usage_spike":
          const dailyUsage = analyticsData.materials.find(m => m.id === material.id)?.quantity || 0;
          return dailyUsage >= threshold.threshold;
        default:
          return false;
      }
    });
  };

  const triggeredThresholds = checkTriggeredThresholds();

  const materialAnalytics = useMemo(() => {
    if (!analyticsData) return [];

    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);
    
    return analyticsData.materials.map((material): MaterialAnalytics => {
      const materialConsumption = analyticsData.consumption.filter(
        c => c.materialId === material.id
      );

      // Calculate consumption metrics
      const totalConsumed = materialConsumption.reduce(
        (sum, c) => sum + (c.quantityUsed * c.quantityProduced), 0
      );

      const recentConsumption = materialConsumption.filter(c => 
        isWithinInterval(new Date(c.consumedAt), { 
          start: thirtyDaysAgo, 
          end: new Date() 
        })
      );

      const veryRecentConsumption = materialConsumption.filter(c =>
        isWithinInterval(new Date(c.consumedAt), {
          start: sevenDaysAgo,
          end: new Date()
        })
      );

      const avgDailyConsumption = recentConsumption.length > 0 
        ? recentConsumption.reduce((sum, c) => sum + (c.quantityUsed * c.quantityProduced), 0) / 30
        : 0;

      const recentAvgDaily = veryRecentConsumption.length > 0
        ? veryRecentConsumption.reduce((sum, c) => sum + (c.quantityUsed * c.quantityProduced), 0) / 7
        : 0;

      // Determine trend
      const trend: 'up' | 'down' | 'stable' = recentAvgDaily > avgDailyConsumption * 1.2 ? 'up' 
        : recentAvgDaily < avgDailyConsumption * 0.8 ? 'down' 
        : 'stable';

      // Calculate days until empty
      const daysUntilEmpty = avgDailyConsumption > 0 
        ? Math.ceil(material.quantity / avgDailyConsumption)
        : Infinity;

      // Determine stock level
      const stockPercentage = (material.quantity / (material.minStockLevel || 10)) * 100;
      const stockLevel: 'critical' | 'low' | 'normal' | 'high' = 
        material.quantity <= (material.minStockLevel || 10) * 0.5 ? 'critical'
        : material.quantity <= (material.minStockLevel || 10) ? 'low'
        : stockPercentage < 200 ? 'normal'
        : 'high';

      // Project restock date (when stock will hit minimum)
      const projectedRestockDate = avgDailyConsumption > 0 && daysUntilEmpty < Infinity
        ? new Date(Date.now() + (daysUntilEmpty - 7) * 24 * 60 * 60 * 1000) // 7 days before empty
        : null;

      return {
        material,
        totalConsumed,
        avgDailyConsumption,
        daysUntilEmpty,
        trend,
        stockLevel,
        projectedRestockDate
      };
    });
  }, [analyticsData]);

  const criticalItems = materialAnalytics.filter(m => m.stockLevel === 'critical');
  const lowStockItems = materialAnalytics.filter(m => m.stockLevel === 'low');
  const upwardTrendItems = materialAnalytics.filter(m => m.trend === 'up');

  const sendNotification = (materialId: number, materialName: string, level: string) => {
    setNotificationsSent(prev => new Set(prev).add(materialId));
    // In a real app, this would send actual notifications
    alert(`🔔 Stock Alert: ${materialName} is ${level}!`);
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      case 'normal': return 'default';
      case 'high': return 'outline';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/")}
              className="rounded-xl border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Detailed inventory analysis and projections</p>
            </div>
          </div>
          <Button
            onClick={() => setThresholdModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="h-4 w-4" />
            Notifications ({notificationThresholds.length})
          </Button>
        </div>

        {/* Triggered Thresholds Alert */}
        {triggeredThresholds.length > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">
              {triggeredThresholds.length} Threshold(s) Triggered
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {triggeredThresholds.map(t => (
                <div key={t.id} className="mt-1">
                  • {t.materialName} - {t.alertType.replace('_', ' ')} threshold reached ({t.userEmail})
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Critical Alerts */}
        {criticalItems.length > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">Critical Stock Levels</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {criticalItems.length} items are critically low on stock and need immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Across {analyticsData.stats.categories} categories</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
              <p className="text-xs text-muted-foreground">Need immediate restock</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Bell className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Below minimum threshold</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Demand</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{upwardTrendItems.length}</div>
              <p className="text-xs text-muted-foreground">Increasing usage trend</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="trends">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Material Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialAnalytics.slice(0, 10).map((analytics) => (
                    <div key={analytics.material.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{analytics.material.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {analytics.material.quantity} {analytics.material.unit} remaining
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStockLevelColor(analytics.stockLevel)}>
                            {analytics.stockLevel}
                          </Badge>
                          {getTrendIcon(analytics.trend)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Daily Usage</p>
                          <p className="font-medium">{analytics.avgDailyConsumption.toFixed(2)} {analytics.material.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Consumed</p>
                          <p className="font-medium">{analytics.totalConsumed} {analytics.material.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Days Until Empty</p>
                          <p className="font-medium">
                            {analytics.daysUntilEmpty === Infinity ? '∞' : `${analytics.daysUntilEmpty} days`}
                          </p>
                        </div>
                      </div>

                      <Progress 
                        value={Math.min((analytics.material.quantity / (analytics.material.minStockLevel || 10)) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Stock Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...criticalItems, ...lowStockItems].map((analytics) => (
                    <div key={analytics.material.id} className={`border rounded-lg p-4 ${
                      analytics.stockLevel === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 
                      'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {analytics.material.name}
                            <Badge variant={getStockLevelColor(analytics.stockLevel)}>
                              {analytics.stockLevel}
                            </Badge>
                          </h3>
                          <p className="text-sm mt-1">
                            Current: {analytics.material.quantity} {analytics.material.unit} | 
                            Min: {analytics.material.minStockLevel} {analytics.material.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            At current usage rate: {analytics.daysUntilEmpty === Infinity ? 'No recent usage' : `${analytics.daysUntilEmpty} days until empty`}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={analytics.stockLevel === 'critical' ? 'destructive' : 'secondary'}
                          onClick={() => sendNotification(
                            analytics.material.id, 
                            analytics.material.name, 
                            analytics.stockLevel
                          )}
                          disabled={notificationsSent.has(analytics.material.id)}
                        >
                          {notificationsSent.has(analytics.material.id) ? 'Notified' : 'Send Alert'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {criticalItems.length === 0 && lowStockItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>All stock levels are healthy!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Restock Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialAnalytics
                    .filter(a => a.projectedRestockDate && a.projectedRestockDate > new Date())
                    .sort((a, b) => (a.projectedRestockDate?.getTime() || 0) - (b.projectedRestockDate?.getTime() || 0))
                    .slice(0, 10)
                    .map((analytics) => (
                      <div key={analytics.material.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{analytics.material.name}</h3>
                            <p className="text-sm text-gray-600">
                              Supplier: {analytics.material.supplierName || 'Not specified'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {analytics.projectedRestockDate && format(analytics.projectedRestockDate, 'MMM dd')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Current Stock</p>
                            <p className="font-medium">{analytics.material.quantity} {analytics.material.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Recommended Order</p>
                            <p className="font-medium">
                              {Math.ceil(analytics.avgDailyConsumption * 60)} {analytics.material.unit}
                              <span className="text-gray-400 ml-1">(60-day supply)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {materialAnalytics.filter(a => a.projectedRestockDate && a.projectedRestockDate > new Date()).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No immediate restocking needed based on current usage patterns.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">Increasing Usage (High Priority)</h3>
                    <div className="space-y-2">
                      {upwardTrendItems.map((analytics) => (
                        <div key={analytics.material.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                          <div>
                            <p className="font-medium">{analytics.material.name}</p>
                            <p className="text-sm text-gray-600">
                              Usage increased by {Math.round(((analytics.avgDailyConsumption - (analytics.totalConsumed / 30)) / (analytics.totalConsumed / 30)) * 100)}%
                            </p>
                          </div>
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">Decreasing Usage</h3>
                    <div className="space-y-2">
                      {materialAnalytics.filter(m => m.trend === 'down').map((analytics) => (
                        <div key={analytics.material.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div>
                            <p className="font-medium">{analytics.material.name}</p>
                            <p className="text-sm text-gray-600">
                              Usage decreased - consider reducing next order
                            </p>
                          </div>
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600">Stable Usage</h3>
                    <div className="space-y-2">
                      {materialAnalytics.filter(m => m.trend === 'stable').map((analytics) => (
                        <div key={analytics.material.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{analytics.material.name}</p>
                            <p className="text-sm text-gray-600">
                              Consistent usage pattern - {analytics.avgDailyConsumption.toFixed(2)} {analytics.material.unit}/day
                            </p>
                          </div>
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Levels Distribution */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Stock Levels Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <StockLevelsChart materials={analyticsData.materials} />
                  </div>
                </CardContent>
              </Card>

              {/* Usage Trends */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Usage Trends (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <UsageTrendsChart materials={analyticsData.materials} consumptionData={analyticsData.consumption} />
                  </div>
                </CardContent>
              </Card>

              {/* Stock vs Usage */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Current Stock vs. 30-Day Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <StockVsUsageChart materials={analyticsData.materials} consumptionData={analyticsData.consumption} />
                  </div>
                </CardContent>
              </Card>

              {/* Production Efficiency */}
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Production Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ConsumptionRateChart materials={analyticsData.materials} consumptionData={analyticsData.consumption} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Insights */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle>Chart Insights & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Stock Distribution</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Visual overview of materials by stock level categories to identify immediate priorities.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Usage Patterns</h4>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Track consumption trends over the last 7 days to predict future needs.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Stock vs Usage</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Compare current inventory levels with recent consumption to identify risks.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Efficiency</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Monitor production efficiency ratios to optimize material usage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notification Threshold Modal */}
        <NotificationThresholdModal
          open={thresholdModalOpen}
          onOpenChange={setThresholdModalOpen}
          materials={analyticsData.materials}
          existingThresholds={notificationThresholds}
          onThresholdAdd={handleThresholdAdd}
          onThresholdRemove={handleThresholdRemove}
        />

        {/* Bottom Navigation */}
        <div className="pb-20">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
}