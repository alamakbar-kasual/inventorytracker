import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Package, 
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ShoppingCart,
  Layers,
  ArrowUpDown,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { InventoryPrediction, PredictionInsights } from "@shared/prediction-types";
import type { MaterialWithSkus } from "@shared/schema";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";

interface StockMovementStats {
  totalInbound: number;
  totalOutbound: number;
  avgDailyInbound: number;
  avgDailyOutbound: number;
  netChange: number;
  daysAnalyzed: number;
  dailyMovements: { date: string; totalInbound: number; totalOutbound: number }[];
}

interface ProductMovementStats {
  productId: number;
  productName: string;
  sku: string;
  thumbnailUrl: string | null;
  totalInbound: number;
  totalOutbound: number;
  netChange: number;
  priority: 'high' | 'normal';
  lastMovementAt: string | null;
}

interface ProductRestockData {
  productId: number;
  productName: string;
  thumbnailUrl: string | null;
  sizes: {
    size: string;
    sku: string;
    currentStock: number;
    restockQty: number;
  }[];
  totalCurrentStock: number;
  totalRestockQty: number;
  priority: 'critical' | 'low' | 'normal';
}

type PriorityFilter = "all" | "critical" | "high" | "medium" | "low";
type SortOption = "priority" | "daysLeft" | "quantity" | "reorderDate" | "name";
type DateFilter = "all" | "week" | "twoWeeks" | "month" | "custom";

interface FilterState {
  search: string;
  priority: PriorityFilter;
  category: string;
  dateFilter: DateFilter;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
}

export function PredictionsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("restock");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    priority: "all",
    category: "all",
    dateFilter: "all",
    sortBy: "priority",
    sortOrder: "asc",
  });

  const { data: predictions = [], isLoading: predictionsLoading, refetch: refetchPredictions } = useQuery<InventoryPrediction[]>({
    queryKey: ["/api/predictions"],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery<PredictionInsights>({
    queryKey: ["/api/prediction-insights"],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: materials = [] } = useQuery<MaterialWithSkus[]>({
    queryKey: ["/api/materials"],
  });

  const { data: stockMovementStats, isLoading: movementStatsLoading, refetch: refetchMovementStats } = useQuery<StockMovementStats>({
    queryKey: ["/api/stock-movement-stats"],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: productMovementStats = [], isLoading: productMovementLoading, refetch: refetchProductMovements } = useQuery<ProductMovementStats[]>({
    queryKey: ["/api/stock-movement-stats/products"],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: productRestockData = [], isLoading: restockLoading } = useQuery<ProductRestockData[]>({
    queryKey: ["/api/product-restock"],
    refetchInterval: 5 * 60 * 1000,
  });

  const categories = useMemo(() => {
    const cats = new Set(materials.map(m => m.category));
    return ["all", ...Array.from(cats)];
  }, [materials]);

  const materialCategoryMap = useMemo(() => {
    const map = new Map<number, { category: string; skus: string[]; supplier?: string | null }>();
    materials.forEach(m => {
      map.set(m.id, {
        category: m.category,
        skus: m.skus?.map(s => s.sku) || [],
        supplier: m.supplierName
      });
    });
    return map;
  }, [materials]);

  const filteredAndSortedPredictions = useMemo(() => {
    let result = [...predictions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => {
        const materialInfo = materialCategoryMap.get(p.materialId);
        const skuMatch = materialInfo?.skus.some(sku => sku.toLowerCase().includes(searchLower));
        return p.materialName.toLowerCase().includes(searchLower) || skuMatch;
      });
    }

    if (filters.priority !== "all") {
      result = result.filter(p => p.criticalityLevel === filters.priority);
    }

    if (filters.category !== "all") {
      result = result.filter(p => {
        const materialInfo = materialCategoryMap.get(p.materialId);
        return materialInfo?.category === filters.category;
      });
    }

    if (filters.dateFilter !== "all") {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (filters.dateFilter) {
        case "week":
          cutoffDate = addDays(now, 7);
          break;
        case "twoWeeks":
          cutoffDate = addDays(now, 14);
          break;
        case "month":
          cutoffDate = addDays(now, 30);
          break;
        default:
          cutoffDate = addDays(now, 365);
      }

      result = result.filter(p => {
        if (!p.recommendedReorderDate) return filters.dateFilter === "all";
        const reorderDate = new Date(p.recommendedReorderDate);
        return isBefore(reorderDate, cutoffDate);
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "priority":
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.criticalityLevel] - priorityOrder[b.criticalityLevel];
          break;
        case "daysLeft":
          comparison = (a.daysUntilEmpty || 999) - (b.daysUntilEmpty || 999);
          break;
        case "quantity":
          comparison = a.currentStock - b.currentStock;
          break;
        case "reorderDate":
          const aDate = a.recommendedReorderDate ? new Date(a.recommendedReorderDate).getTime() : Infinity;
          const bDate = b.recommendedReorderDate ? new Date(b.recommendedReorderDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case "name":
          comparison = a.materialName.localeCompare(b.materialName);
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [predictions, filters, materialCategoryMap]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.dateFilter !== "all") count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      priority: "all",
      category: "all",
      dateFilter: "all",
      sortBy: "priority",
      sortOrder: "asc",
    });
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />;
    }
  };

  const handleRefresh = () => {
    refetchPredictions();
    refetchInsights();
    refetchMovementStats();
    refetchProductMovements();
  };

  if (predictionsLoading || insightsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        <span className="text-gray-600 dark:text-gray-400">Analyzing inventory patterns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Restock Predictions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Smart restocking suggestions based on usage patterns
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          data-testid="button-refresh-predictions"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {insights && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 sm:p-4" data-testid="card-total-materials">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{insights.totalMaterials}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Materials</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4" data-testid="card-critical-materials">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{insights.criticalMaterials}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Need Restock</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4" data-testid="card-avg-stock-days">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{insights.averageStockDays}d</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Avg Stock Days</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4" data-testid="card-trending-up">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.usageTrends.increasing}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">High Demand</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search materials or SKUs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              data-testid="input-search-predictions"
            />
          </div>
          <Button
            variant={filtersOpen ? "secondary" : "outline"}
            size="icon"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="relative shrink-0"
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(value: PriorityFilter) => setFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Reorder Within</label>
                <Select
                  value={filters.dateFilter}
                  onValueChange={(value: DateFilter) => setFilters(prev => ({ ...prev, dateFilter: value }))}
                >
                  <SelectTrigger data-testid="select-date-filter">
                    <SelectValue placeholder="Any Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Date</SelectItem>
                    <SelectItem value="week">Next 7 Days</SelectItem>
                    <SelectItem value="twoWeeks">Next 14 Days</SelectItem>
                    <SelectItem value="month">Next 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: SortOption) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="daysLeft">Days Left</SelectItem>
                    <SelectItem value="quantity">Current Stock</SelectItem>
                    <SelectItem value="reorderDate">Reorder Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedPredictions.length} of {predictions.length} materials
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="restock" data-testid="tab-restock">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Restock
          </TabsTrigger>
          <TabsTrigger value="movements" data-testid="tab-movements">
            <Activity className="w-4 h-4 mr-2" />
            Movements
          </TabsTrigger>
          <TabsTrigger value="byCategory" data-testid="tab-category">
            <Layers className="w-4 h-4 mr-2" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restock" className="space-y-4 mt-4">
          {restockLoading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-12 h-12 mx-auto text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Loading restock data...</p>
            </Card>
          ) : productRestockData.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add products and stock movements to see restock recommendations
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {productRestockData.map((product) => (
                <Card 
                  key={product.productId} 
                  className="p-4 hover:shadow-md transition-shadow"
                  data-testid={`card-restock-${product.productId}`}
                >
                  <div className="flex items-start gap-4">
                    {product.thumbnailUrl ? (
                      <img 
                        src={product.thumbnailUrl} 
                        alt={product.productName}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                        data-testid={`img-product-${product.productId}`}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {product.productName}
                          </h4>
                          <Badge 
                            variant={product.priority === 'critical' ? 'destructive' : product.priority === 'low' ? 'secondary' : 'outline'}
                            data-testid={`badge-priority-${product.productId}`}
                          >
                            {product.priority === 'critical' ? 'Critical' : product.priority === 'low' ? 'Low Stock' : 'Normal'}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {product.totalCurrentStock} units
                          </span>
                          {product.totalRestockQty > 0 && (
                            <Badge variant="default" className="bg-green-600">
                              +{product.totalRestockQty} needed
                            </Badge>
                          )}
                        </div>
                        {(product.priority === 'critical' || product.priority === 'low' || product.totalRestockQty > 0) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto sm:ml-auto border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            onClick={() => {
                              const sizesNeedingRestock = product.sizes
                                .filter(s => s.restockQty > 0)
                                .map(s => `${s.size}: +${s.restockQty}`)
                                .join(', ');
                              toast({
                                title: "Team Notified",
                                description: `Restock alert sent for ${product.productName}. ${sizesNeedingRestock ? `Sizes needed: ${sizesNeedingRestock}` : 'AI predicts low stock soon.'}`,
                              });
                            }}
                            data-testid={`button-notify-${product.productId}`}
                          >
                            <Bell className="w-4 h-4 mr-1" />
                            Notify Team
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                          const sizeData = product.sizes.find(s => s.size === size);
                          return (
                            <div 
                              key={size}
                              className={`rounded-lg p-3 text-center ${
                                sizeData ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-gray-100/50 dark:bg-gray-900/30'
                              }`}
                              data-testid={`size-${product.productId}-${size}`}
                            >
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{size}</p>
                              {sizeData ? (
                                <>
                                  <p className={`font-bold text-lg ${
                                    sizeData.currentStock < 20 ? 'text-red-600' : 
                                    sizeData.currentStock < 50 ? 'text-orange-600' : 
                                    'text-gray-900 dark:text-white'
                                  }`}>
                                    {sizeData.currentStock}
                                  </p>
                                  {sizeData.restockQty > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      +{sizeData.restockQty}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-gray-400 dark:text-gray-600 text-sm">-</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4" data-testid="card-total-inbound">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ArrowDownToLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Inbound</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stockMovementStats?.totalInbound || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-total-outbound">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <ArrowUpFromLine className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Outbound</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {stockMovementStats?.totalOutbound || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-avg-daily-inbound">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Daily In</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {stockMovementStats?.avgDailyInbound?.toFixed(1) || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-avg-daily-outbound">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Daily Out</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {stockMovementStats?.avgDailyOutbound?.toFixed(1) || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4" data-testid="card-net-change">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Net Stock Change</h3>
              <Badge variant={stockMovementStats?.netChange != null && stockMovementStats.netChange >= 0 ? "default" : "destructive"}>
                {stockMovementStats?.netChange != null && stockMovementStats.netChange >= 0 ? '+' : ''}{stockMovementStats?.netChange ?? 0}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on {stockMovementStats?.daysAnalyzed || 0} days of data
            </p>
          </Card>

          <Card className="p-4" data-testid="card-daily-movement-chart">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Stock Movement</h3>
            {movementStatsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : stockMovementStats?.dailyMovements && stockMovementStats.dailyMovements.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">Inbound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">Outbound</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {stockMovementStats.dailyMovements.slice(-30).map((day, idx) => {
                      const maxValue = Math.max(
                        ...stockMovementStats.dailyMovements.map(d => Math.max(d.totalInbound, d.totalOutbound))
                      ) || 1;
                      const inboundHeight = (day.totalInbound / maxValue) * 100;
                      const outboundHeight = (day.totalOutbound / maxValue) * 100;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 w-8" title={`${day.date}: In: ${day.totalInbound}, Out: ${day.totalOutbound}`}>
                          <div className="flex gap-0.5 h-24 items-end">
                            <div 
                              className="w-3 bg-green-500 rounded-t"
                              style={{ height: `${Math.max(inboundHeight, 2)}%` }}
                            />
                            <div 
                              className="w-3 bg-red-500 rounded-t"
                              style={{ height: `${Math.max(outboundHeight, 2)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <p>No movement data available</p>
              </div>
            )}
          </Card>

          <Card className="p-4" data-testid="card-ai-baseline">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Prediction Baseline</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Based on inbound/outbound patterns</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Daily Consumption Rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stockMovementStats?.avgDailyOutbound?.toFixed(1) || 0} units/day
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Daily Replenishment Rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stockMovementStats?.avgDailyInbound?.toFixed(1) || 0} units/day
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Stock Velocity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stockMovementStats?.avgDailyInbound && stockMovementStats?.avgDailyOutbound 
                    ? ((stockMovementStats.avgDailyInbound / (stockMovementStats.avgDailyOutbound || 1)) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Trend Direction</p>
                <p className={`text-lg font-bold ${
                  stockMovementStats?.netChange && stockMovementStats.netChange > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : stockMovementStats?.netChange && stockMovementStats.netChange < 0 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stockMovementStats?.netChange && stockMovementStats.netChange > 0 
                    ? 'Growing' 
                    : stockMovementStats?.netChange && stockMovementStats.netChange < 0 
                      ? 'Declining'
                      : 'Stable'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-product-movements">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Product Movement Details</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inbound (replenishment) vs Outbound (orders)</p>
                </div>
              </div>
            </div>

            {productMovementLoading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : productMovementStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <p>No product movement data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productMovementStats.map((product, idx) => (
                  <div 
                    key={`${product.productId}-${product.sku}-${idx}`}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    data-testid={`product-movement-${product.sku}`}
                  >
                    <div className="shrink-0">
                      {product.thumbnailUrl ? (
                        <img 
                          src={product.thumbnailUrl} 
                          alt={product.productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {product.productName}
                        </h4>
                        {product.priority === 'high' && (
                          <Badge variant="destructive" className="shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            High Demand
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {product.sku}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowDownToLine className="w-4 h-4" />
                          <span className="font-bold">{product.totalInbound}</span>
                        </div>
                        <p className="text-xs text-gray-500">Inbound</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <ArrowUpFromLine className="w-4 h-4" />
                          <span className="font-bold">{product.totalOutbound}</span>
                        </div>
                        <p className="text-xs text-gray-500">Outbound</p>
                      </div>

                      <div className="text-center">
                        <Badge variant={product.netChange >= 0 ? "default" : "destructive"}>
                          {product.netChange >= 0 ? '+' : ''}{product.netChange}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Net</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="byCategory" className="space-y-4 mt-4">
          {categories.filter(c => c !== "all").map(category => {
            const categoryPredictions = filteredAndSortedPredictions.filter(p => {
              const materialInfo = materialCategoryMap.get(p.materialId);
              return materialInfo?.category === category;
            });

            if (categoryPredictions.length === 0) return null;

            const criticalCount = categoryPredictions.filter(p => 
              p.criticalityLevel === 'critical' || p.criticalityLevel === 'high'
            ).length;

            const totalRestock = categoryPredictions.reduce(
              (sum, p) => sum + (p.recommendedReorderQuantity || 0), 0
            );

            return (
              <Card key={category} className="p-4" data-testid={`card-category-${category}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
                      <p className="text-xs text-gray-500">{categoryPredictions.length} materials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {criticalCount > 0 && (
                      <Badge variant="destructive">{criticalCount} urgent</Badge>
                    )}
                    <Badge variant="secondary">+{totalRestock} to restock</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {categoryPredictions.slice(0, 5).map(prediction => (
                    <div 
                      key={prediction.materialId}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${getCriticalityColor(prediction.criticalityLevel)}`} />
                        <span className="truncate">{prediction.materialName}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-gray-500">{prediction.currentStock} in stock</span>
                        <span className="text-green-600 font-medium">
                          +{prediction.recommendedReorderQuantity || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                  {categoryPredictions.length > 5 && (
                    <p className="text-xs text-center text-gray-500 pt-2">
                      +{categoryPredictions.length - 5} more materials
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4" data-testid="card-trend-increasing">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Increasing Demand</h3>
                  <p className="text-xs text-gray-500">{insights?.usageTrends.increasing || 0} materials</p>
                </div>
              </div>
              <div className="space-y-2">
                {filteredAndSortedPredictions
                  .filter(p => p.usageTrend === 'increasing')
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.materialId} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.materialName}</span>
                      <span className="text-red-600 font-medium shrink-0 ml-2">
                        {p.averageDailyUsage.toFixed(1)}/day
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-4" data-testid="card-trend-decreasing">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Decreasing Demand</h3>
                  <p className="text-xs text-gray-500">{insights?.usageTrends.decreasing || 0} materials</p>
                </div>
              </div>
              <div className="space-y-2">
                {filteredAndSortedPredictions
                  .filter(p => p.usageTrend === 'decreasing')
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.materialId} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.materialName}</span>
                      <span className="text-green-600 font-medium shrink-0 ml-2">
                        {p.averageDailyUsage.toFixed(1)}/day
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-4" data-testid="card-trend-stable">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <ArrowUpDown className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Stable Demand</h3>
                  <p className="text-xs text-gray-500">{insights?.usageTrends.stable || 0} materials</p>
                </div>
              </div>
              <div className="space-y-2">
                {filteredAndSortedPredictions
                  .filter(p => p.usageTrend === 'stable')
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.materialId} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.materialName}</span>
                      <span className="text-gray-600 font-medium shrink-0 ml-2">
                        {p.averageDailyUsage.toFixed(1)}/day
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {insights && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Usage Distribution</h3>
              <div className="flex items-center gap-2 h-8">
                <div 
                  className="h-full bg-red-500 rounded-l-lg transition-all"
                  style={{ width: `${(insights.usageTrends.increasing / insights.totalMaterials) * 100}%` }}
                  title={`Increasing: ${insights.usageTrends.increasing}`}
                />
                <div 
                  className="h-full bg-gray-400 transition-all"
                  style={{ width: `${(insights.usageTrends.stable / insights.totalMaterials) * 100}%` }}
                  title={`Stable: ${insights.usageTrends.stable}`}
                />
                <div 
                  className="h-full bg-green-500 rounded-r-lg transition-all"
                  style={{ width: `${(insights.usageTrends.decreasing / insights.totalMaterials) * 100}%` }}
                  title={`Decreasing: ${insights.usageTrends.decreasing}`}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded" /> Increasing ({insights.usageTrends.increasing})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded" /> Stable ({insights.usageTrends.stable})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded" /> Decreasing ({insights.usageTrends.decreasing})
                </span>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
