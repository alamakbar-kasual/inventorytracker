import { useMemo } from "react";
import { MaterialWithSkus } from "@shared/schema";
import { Search, Filter, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchResultsSummaryProps {
  materials: MaterialWithSkus[];
  filteredMaterials: MaterialWithSkus[];
  searchQuery: string;
  selectedCategory: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
}

export function SearchResultsSummary({
  materials,
  filteredMaterials,
  searchQuery,
  selectedCategory,
  onClearSearch,
  onClearCategory
}: SearchResultsSummaryProps) {
  const stats = useMemo(() => {
    const total = materials.length;
    const found = filteredMaterials.length;
    const lowStock = filteredMaterials.filter(m => m.quantity <= (m.minStockLevel || 10)).length;
    const categories = new Set(filteredMaterials.map(m => m.category)).size;
    const inStock = filteredMaterials.filter(m => m.quantity > 0).length;

    return {
      total,
      found,
      lowStock,
      categories,
      inStock
    };
  }, [materials, filteredMaterials]);

  // Don't show summary if no search/filter is active
  if (!searchQuery && selectedCategory === 'all') {
    return null;
  }

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Search className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Search Results
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Found {stats.found} of {stats.total} materials
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {searchQuery && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearSearch}
              className="text-xs h-7"
            >
              Clear search
            </Button>
          )}
          {selectedCategory !== 'all' && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearCategory}
              className="text-xs h-7"
            >
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Package className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {stats.found}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Found</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {stats.inStock}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">In Stock</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {stats.lowStock}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Low Stock</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Filter className="w-3 h-3 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {stats.categories}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Categories</p>
        </div>
      </div>

      {/* No results message */}
      {stats.found === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                No materials found
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Try adjusting your search terms or category filters
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}