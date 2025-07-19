import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface FilterOptions {
  category: string;
  stockLevel: string;
  supplier: string;
  dateRange: string;
  minQuantity: string;
  maxQuantity: string;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  sortBy: SortOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
  onClearAll: () => void;
  availableCategories: string[];
  availableSuppliers: string[];
}

export function AdvancedFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onClearAll,
  availableCategories,
  availableSuppliers,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateSort = (field: string, direction: "asc" | "desc") => {
    onSortChange({ field, direction });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== "all" && value !== ""
  ).length;

  const getActiveFilters = () => {
    const active = [];
    if (filters.category && filters.category !== "all") active.push({ key: "category", value: filters.category });
    if (filters.stockLevel && filters.stockLevel !== "all") active.push({ key: "stockLevel", value: filters.stockLevel });
    if (filters.supplier && filters.supplier !== "all") active.push({ key: "supplier", value: filters.supplier });
    if (filters.dateRange && filters.dateRange !== "all") active.push({ key: "dateRange", value: filters.dateRange });
    if (filters.minQuantity) active.push({ key: "minQuantity", value: filters.minQuantity });
    if (filters.maxQuantity) active.push({ key: "maxQuantity", value: filters.maxQuantity });
    return active;
  };

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters & Sort
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <Filter className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
                {getActiveFilters().map((filter) => (
                  <Badge key={filter.key} variant="outline" className="gap-1">
                    {filter.key}: {filter.value}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => updateFilter(filter.key as keyof FilterOptions, "")}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Level Filter */}
              <div className="space-y-2">
                <Label>Stock Level</Label>
                <Select value={filters.stockLevel} onValueChange={(value) => updateFilter("stockLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical Stock</SelectItem>
                    <SelectItem value="adequate">Adequate Stock</SelectItem>
                    <SelectItem value="high">High Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={filters.supplier} onValueChange={(value) => updateFilter("supplier", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {availableSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Range Filters */}
              <div className="space-y-2">
                <Label>Min Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minQuantity}
                  onChange={(e) => updateFilter("minQuantity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxQuantity}
                  onChange={(e) => updateFilter("maxQuantity", e.target.value)}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="border-t pt-4">
              <Label className="text-base font-medium">Sort By</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Select value={sortBy.field} onValueChange={(field) => updateSort(field, sortBy.direction)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                      <SelectItem value="stockLevel">Stock Level</SelectItem>
                      <SelectItem value="sku">SKU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select value={sortBy.direction} onValueChange={(direction) => updateSort(sortBy.field, direction as "asc" | "desc")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Direction..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending (A-Z, 1-9)</SelectItem>
                      <SelectItem value="desc">Descending (Z-A, 9-1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="border-t pt-4">
              <Label className="text-base font-medium mb-3 block">Quick Filters</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onFiltersChange({ ...filters, stockLevel: "low" });
                    updateSort("quantity", "asc");
                  }}
                >
                  Low Stock Items
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onFiltersChange({ ...filters, dateRange: "30days" });
                    updateSort("purchaseDate", "desc");
                  }}
                >
                  Recent Purchases
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onFiltersChange({ ...filters, category: "Fabrics" });
                    updateSort("name", "asc");
                  }}
                >
                  Fabrics Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    updateSort("quantity", "desc");
                  }}
                >
                  Highest Stock First
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}