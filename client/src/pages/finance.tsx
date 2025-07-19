import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Package, AlertTriangle, Filter, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import type { MaterialWithSkus } from "@shared/schema";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("finance");
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
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

  // Apply filters and sorting
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = [...materials];
    
    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    
    // Supplier filter
    if (filterSupplier !== "all") {
      filtered = filtered.filter(m => m.supplierName === filterSupplier);
    }
    
    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(m => (m.unitPrice || 0) >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(m => (m.unitPrice || 0) <= parseInt(priceRange.max));
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(m => {
        if (!m.dateOfPurchase) return false;
        const purchaseDate = new Date(m.dateOfPurchase);
        if (dateFrom && dateTo) {
          return purchaseDate >= dateFrom && purchaseDate <= dateTo;
        } else if (dateFrom) {
          return purchaseDate >= dateFrom;
        } else if (dateTo) {
          return purchaseDate <= dateTo;
        }
        return true;
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "unitPrice":
          aValue = a.unitPrice || 0;
          bValue = b.unitPrice || 0;
          break;
        case "totalValue":
          aValue = a.totalValue || 0;
          bValue = b.totalValue || 0;
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
  }, [materials, filterCategory, filterSupplier, priceRange, dateFrom, dateTo, sortBy, sortOrder]);

  // Calculate financial metrics based on filtered materials
  const financialMetrics = useMemo(() => {
    return {
      totalValue: filteredAndSortedMaterials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
      totalItems: filteredAndSortedMaterials.reduce((sum: number, material: MaterialWithSkus) => sum + material.quantity, 0),
      averageValue: filteredAndSortedMaterials.length > 0 ? filteredAndSortedMaterials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0) / filteredAndSortedMaterials.length : 0,
      lowStockValue: filteredAndSortedMaterials.filter((m: MaterialWithSkus) => m.quantity <= (m.minStockLevel || 10)).reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
      filteredCount: filteredAndSortedMaterials.length,
      totalCount: materials.length,
    };
  }, [filteredAndSortedMaterials, materials.length]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents);
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

  if (materialsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading financial data...</p>
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
          <p className="text-gray-600 dark:text-gray-300">Material cost tracking and inventory valuation</p>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Sort
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom ? format(dateFrom, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">To Date</Label>
                <Input
                  type="date"
                  value={dateTo ? format(dateTo, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div>
                <Label className="text-sm font-medium">Supplier</Label>
                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium">Min Price (IDR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Max Price (IDR)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Sort by:</Label>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange("name")}
                  className="flex items-center gap-1"
                >
                  Name <ArrowUpDown className="w-3 h-3" />
                </Button>
                <Button
                  variant={sortBy === "unitPrice" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange("unitPrice")}
                  className="flex items-center gap-1"
                >
                  Price <ArrowUpDown className="w-3 h-3" />
                </Button>
                <Button
                  variant={sortBy === "totalValue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange("totalValue")}
                  className="flex items-center gap-1"
                >
                  Total Value <ArrowUpDown className="w-3 h-3" />
                </Button>
                <Button
                  variant={sortBy === "quantity" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange("quantity")}
                  className="flex items-center gap-1"
                >
                  Quantity <ArrowUpDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filterCategory !== "all" || filterSupplier !== "all" || priceRange.min || priceRange.max || dateFrom || dateTo) && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Badge variant="secondary">
                  Showing {financialMetrics.filteredCount} of {financialMetrics.totalCount} materials
                </Badge>
                {filterCategory !== "all" && (
                  <Badge variant="outline">Category: {filterCategory}</Badge>
                )}
                {filterSupplier !== "all" && (
                  <Badge variant="outline">Supplier: {filterSupplier}</Badge>
                )}
                {priceRange.min && (
                  <Badge variant="outline">Min: Rp {parseInt(priceRange.min).toLocaleString()}</Badge>
                )}
                {priceRange.max && (
                  <Badge variant="outline">Max: Rp {parseInt(priceRange.max).toLocaleString()}</Badge>
                )}
                {dateFrom && (
                  <Badge variant="outline">From: {format(dateFrom, "MMM dd, yyyy")}</Badge>
                )}
                {dateTo && (
                  <Badge variant="outline">To: {format(dateTo, "MMM dd, yyyy")}</Badge>
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
              {filteredAndSortedMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{materials.length === 0 ? "No materials found" : "No materials match your filters"}</p>
                </div>
              ) : (
                filteredAndSortedMaterials.map((material: MaterialWithSkus) => (
                <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
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