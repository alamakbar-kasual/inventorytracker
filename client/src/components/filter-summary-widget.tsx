import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, RotateCcw, TrendingDown, Clock, Package, Building } from "lucide-react";
import { FilterOptions, SortOptions } from "@/components/advanced-filters";

interface FilterSummaryWidgetProps {
  filters: FilterOptions;
  sortBy: SortOptions;
  totalMaterials: number;
  filteredCount: number;
  onClearFilter: (key: keyof FilterOptions) => void;
  onClearAll: () => void;
}

export function FilterSummaryWidget({
  filters,
  sortBy,
  totalMaterials,
  filteredCount,
  onClearFilter,
  onClearAll,
}: FilterSummaryWidgetProps) {
  const getFilterIcon = (key: keyof FilterOptions) => {
    switch (key) {
      case "category":
        return Package;
      case "stockLevel":
        return TrendingDown;
      case "supplier":
        return Building;
      case "dateRange":
        return Clock;
      default:
        return Package;
    }
  };

  const getFilterLabel = (key: keyof FilterOptions, value: string) => {
    switch (key) {
      case "category":
        return `Category: ${value}`;
      case "stockLevel":
        return `Stock: ${value.replace(/([A-Z])/g, " $1").toLowerCase()}`;
      case "supplier":
        return `Supplier: ${value}`;
      case "dateRange":
        return `Date: ${value.replace(/(\d+)/, "$1 ")}`;
      case "minQuantity":
        return `Min: ${value}`;
      case "maxQuantity":
        return `Max: ${value}`;
      default:
        return value;
    }
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.category && filters.category !== "all") 
      active.push({ key: "category" as keyof FilterOptions, value: filters.category });
    if (filters.stockLevel && filters.stockLevel !== "all") 
      active.push({ key: "stockLevel" as keyof FilterOptions, value: filters.stockLevel });
    if (filters.supplier && filters.supplier !== "all") 
      active.push({ key: "supplier" as keyof FilterOptions, value: filters.supplier });
    if (filters.dateRange && filters.dateRange !== "all") 
      active.push({ key: "dateRange" as keyof FilterOptions, value: filters.dateRange });
    if (filters.minQuantity) 
      active.push({ key: "minQuantity" as keyof FilterOptions, value: filters.minQuantity });
    if (filters.maxQuantity) 
      active.push({ key: "maxQuantity" as keyof FilterOptions, value: filters.maxQuantity });
    return active;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;
  const hasCustomSort = sortBy.field !== "name" || sortBy.direction !== "asc";

  if (!hasActiveFilters && !hasCustomSort) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Showing {filteredCount} of {totalMaterials} materials
            </div>
            {filteredCount < totalMaterials && (
              <Badge variant="secondary" className="text-xs">
                {Math.round((filteredCount / totalMaterials) * 100)}% filtered
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>

        <div className="space-y-2">
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300 self-center">
                Filters:
              </span>
              {activeFilters.map((filter) => {
                const Icon = getFilterIcon(filter.key);
                return (
                  <Badge 
                    key={filter.key} 
                    variant="outline" 
                    className="gap-1 bg-white dark:bg-gray-800 border-blue-300 text-blue-800 dark:text-blue-200"
                  >
                    <Icon className="w-3 h-3" />
                    {getFilterLabel(filter.key, filter.value)}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => onClearFilter(filter.key)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Sort Status */}
          {hasCustomSort && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Sort:
              </span>
              <Badge variant="outline" className="bg-white dark:bg-gray-800 border-blue-300 text-blue-800 dark:text-blue-200">
                {sortBy.field.charAt(0).toUpperCase() + sortBy.field.slice(1)} ({sortBy.direction === "asc" ? "↑" : "↓"})
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}