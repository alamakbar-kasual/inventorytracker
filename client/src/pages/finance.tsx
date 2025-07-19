import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, RefreshCw, AlertTriangle, Package, Filter, Calendar, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import type { MaterialWithSkus, ActivityLog } from "@shared/schema";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("finance");
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  
  // Date range states
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
  });

  // Get unique categories and suppliers for filters
  const categories = useMemo(() => {
    const cats = materials.map(m => m.category);
    return Array.from(new Set(cats)).sort();
  }, [materials]);

  const suppliers = useMemo(() => {
    const sups = materials.map(m => m.supplierName).filter(Boolean);
    return Array.from(new Set(sups)).sort();
  }, [materials]);

  // Filter and sort materials
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = materials.filter((material: MaterialWithSkus) => {
      // Category filter
      if (filterCategory !== "all" && material.category !== filterCategory) {
        return false;
      }
      
      // Supplier filter
      if (filterSupplier !== "all" && material.supplierName !== filterSupplier) {
        return false;
      }
      
      // Price range filter
      const unitPrice = material.unitPrice || 0;
      if (priceRange.min && unitPrice < parseFloat(priceRange.min) * 100) {
        return false;
      }
      if (priceRange.max && unitPrice > parseFloat(priceRange.max) * 100) {
        return false;
      }
      
      return true;
    });

    // Sort materials
    filtered.sort((a: MaterialWithSkus, b: MaterialWithSkus) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "totalValue":
          aValue = a.totalValue || 0;
          bValue = b.totalValue || 0;
          break;
        case "unitPrice":
          aValue = a.unitPrice || 0;
          bValue = b.unitPrice || 0;
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "supplier":
          aValue = a.supplierName || "";
          bValue = b.supplierName || "";
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === "asc" 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [materials, filterCategory, filterSupplier, priceRange, sortBy, sortOrder]);

  // Filter materials by date range if specified
  const dateFilteredMaterials = useMemo(() => {
    if (!dateFrom && !dateTo) {
      return filteredAndSortedMaterials;
    }

    return filteredAndSortedMaterials.filter((material: MaterialWithSkus) => {
      if (!material.dateOfPurchase) return !dateFrom && !dateTo; // Include materials with no date only if no date filter
      
      const purchaseDate = new Date(material.dateOfPurchase);
      
      if (dateFrom && dateTo) {
        return isWithinInterval(purchaseDate, {
          start: startOfDay(dateFrom),
          end: endOfDay(dateTo)
        });
      } else if (dateFrom) {
        return purchaseDate >= startOfDay(dateFrom);
      } else if (dateTo) {
        return purchaseDate <= endOfDay(dateTo);
      }
      
      return true;
    });
  }, [filteredAndSortedMaterials, dateFrom, dateTo]);

  // Calculate financial metrics based on filtered materials
  const financialMetrics = useMemo(() => {
    const materialsToCalculate = dateFilteredMaterials;
    
    return {
      totalValue: materialsToCalculate.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
      totalItems: materialsToCalculate.reduce((sum: number, material: MaterialWithSkus) => sum + material.quantity, 0),
      averageValue: materialsToCalculate.length > 0 ? materialsToCalculate.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0) / materialsToCalculate.length : 0,
      lowStockValue: materialsToCalculate.filter((m: MaterialWithSkus) => m.quantity <= (m.minStockLevel || 10)).reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
      filteredCount: materialsToCalculate.length,
      totalCount: materials.length,
    };
  }, [dateFilteredMaterials, materials.length]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setFilterCategory("all");
    setFilterSupplier("all");
    setPriceRange({ min: "", max: "" });
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = filterCategory !== "all" || filterSupplier !== "all" || 
    priceRange.min || priceRange.max || dateFrom || dateTo;

  if (materialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <header className="glassmorphism dark:glassmorphism-dark sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Finance Dashboard</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Inventory valuation and financial tracking</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Filter and Sort Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Sort
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Filter */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Date Range:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-gray-500">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div>
                <Label htmlFor="supplier-filter" className="text-sm font-medium">Supplier</Label>
                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium">Price Range ($)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="totalValue-desc">Highest Value</SelectItem>
                    <SelectItem value="totalValue-asc">Lowest Value</SelectItem>
                    <SelectItem value="unitPrice-desc">Highest Price</SelectItem>
                    <SelectItem value="unitPrice-asc">Lowest Price</SelectItem>
                    <SelectItem value="quantity-desc">Most Stock</SelectItem>
                    <SelectItem value="quantity-asc">Least Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Badge variant="secondary">
                  Showing {financialMetrics.filteredCount} of {financialMetrics.totalCount} materials
                </Badge>
                {dateFrom && (
                  <Badge variant="outline">From: {format(dateFrom, "PP")}</Badge>
                )}
                {dateTo && (
                  <Badge variant="outline">To: {format(dateTo, "PP")}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.totalValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.averageValue)}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Value</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(financialMetrics.lowStockValue)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material Valuation Table */}
        <Card>
          <CardHeader>
            <CardTitle>Material Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dateFilteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No materials found matching your criteria</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                dateFilteredMaterials.map((material: MaterialWithSkus) => (
                <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{material.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {material.quantity} {material.unit} • {material.supplierName || "No supplier"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {material.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(material.totalValue || 0)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(material.unitPrice || 0)} per {material.unit}</p>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}