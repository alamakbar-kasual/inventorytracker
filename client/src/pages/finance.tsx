import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Package, AlertTriangle, Filter, ArrowUpDown, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import type { MaterialWithSkus } from "@shared/schema";

export default function Finance() {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Filter states
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and suppliers
  const categories = [...new Set(materials.map(m => m.category))].sort();
  const suppliers = [...new Set(materials.map(m => m.supplierName).filter(Boolean))].sort();

  // Apply filters and sorting
  let filteredMaterials = materials;
  
  if (filterCategory !== "all") {
    filteredMaterials = filteredMaterials.filter(m => m.category === filterCategory);
  }
  
  if (filterSupplier !== "all") {
    filteredMaterials = filteredMaterials.filter(m => m.supplierName === filterSupplier);
  }
  
  if (minPrice) {
    filteredMaterials = filteredMaterials.filter(m => (m.unitPrice || 0) >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filteredMaterials = filteredMaterials.filter(m => (m.unitPrice || 0) <= parseInt(maxPrice));
  }

  // Sort materials
  filteredMaterials = [...filteredMaterials].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "price":
        compareValue = (a.unitPrice || 0) - (b.unitPrice || 0);
        break;
      case "value":
        compareValue = (a.totalValue || 0) - (b.totalValue || 0);
        break;
      case "quantity":
        compareValue = a.quantity - b.quantity;
        break;
      default:
        compareValue = 0;
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  // Calculate metrics
  const metrics = {
    totalValue: filteredMaterials.reduce((sum, m) => sum + (m.totalValue || 0), 0),
    averageValue: filteredMaterials.length > 0 
      ? filteredMaterials.reduce((sum, m) => sum + (m.totalValue || 0), 0) / filteredMaterials.length 
      : 0,
    lowStockValue: filteredMaterials
      .filter(m => m.quantity <= (m.minStockLevel || 10))
      .reduce((sum, m) => sum + (m.totalValue || 0), 0),
    highValueItems: filteredMaterials.filter(m => (m.totalValue || 0) > 1000000).length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const clearFilters = () => {
    setFilterCategory("all");
    setFilterSupplier("all");
    setMinPrice("");
    setMaxPrice("");
  };

  const activeFiltersCount = [
    filterCategory !== "all",
    filterSupplier !== "all",
    minPrice !== "",
    maxPrice !== ""
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">
            <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <BottomNav activeTab="finance" onTabChange={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track inventory value and costs</p>
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Options</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <Label>Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Supplier</Label>
                    <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliers.map(sup => (
                          <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label>Price Range (IDR)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Average Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.averageValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Low Stock Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.lowStockValue)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">High Value Items</p>
                  <p className="text-2xl font-bold">{metrics.highValueItems}</p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sort Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              {[
                { value: "name", label: "Name" },
                { value: "price", label: "Unit Price" },
                { value: "value", label: "Total Value" },
                { value: "quantity", label: "Quantity" }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (sortBy === option.value) {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy(option.value);
                      setSortOrder("asc");
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  {option.label}
                  {sortBy === option.value && (
                    <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              ))}
            </div>
            
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
                {filterCategory !== "all" && (
                  <Badge variant="secondary">{filterCategory}</Badge>
                )}
                {filterSupplier !== "all" && (
                  <Badge variant="secondary">{filterSupplier}</Badge>
                )}
                {minPrice && (
                  <Badge variant="secondary">Min: {formatCurrency(parseInt(minPrice))}</Badge>
                )}
                {maxPrice && (
                  <Badge variant="secondary">Max: {formatCurrency(parseInt(maxPrice))}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Material Valuation</span>
              <Badge variant="outline">
                {filteredMaterials.length} of {materials.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No materials match your filters</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <div 
                    key={material.id} 
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {material.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {material.category}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                            <span className="ml-2 font-medium">{material.quantity} {material.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                            <span className="ml-2 font-medium">{material.supplierName || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                            <span className="ml-2 font-medium">{formatCurrency(material.unitPrice || 0)}</span>
                          </div>
                          {material.dateOfPurchase && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Purchased:</span>
                              <span className="ml-2 font-medium">
                                {format(new Date(material.dateOfPurchase), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(material.totalValue || 0)}
                        </p>
                        {material.quantity <= (material.minStockLevel || 10) && (
                          <Badge variant="destructive" className="mt-2">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav activeTab="finance" onTabChange={() => {}} />
    </div>
  );
}