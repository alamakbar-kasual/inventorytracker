import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Package, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomNav } from "@/components/bottom-nav";
import type { MaterialWithSkus } from "@shared/schema";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("finance");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Simple filtering without complex memoization
  let filteredMaterials = materials;
  if (filterCategory !== "all") {
    filteredMaterials = materials.filter(m => m.category === filterCategory);
  }

  // Simple sorting
  if (sortBy === "price") {
    filteredMaterials = [...filteredMaterials].sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
  } else if (sortBy === "quantity") {
    filteredMaterials = [...filteredMaterials].sort((a, b) => b.quantity - a.quantity);
  } else {
    filteredMaterials = [...filteredMaterials].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Calculate financial metrics
  const financialMetrics = {
    totalValue: filteredMaterials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
    averageValue: filteredMaterials.length > 0 ? filteredMaterials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0) / filteredMaterials.length : 0,
    lowStockValue: filteredMaterials.filter((m: MaterialWithSkus) => m.quantity <= (m.minStockLevel || 10)).reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
  };

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

  // Get unique categories for filter
  const categories = [...new Set(materials.map(m => m.category))].sort();

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
        {/* Simple Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Quick Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
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

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price (High to Low)</SelectItem>
                    <SelectItem value="quantity">Quantity (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterCategory !== "all" && (
              <div className="mt-4">
                <Badge variant="outline">
                  Showing {filteredMaterials.length} materials in {filterCategory}
                </Badge>
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

        {/* Material Valuation List */}
        <Card>
          <CardHeader>
            <CardTitle>Material Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{materials.length === 0 ? "No materials found" : "No materials match your filters"}</p>
                </div>
              ) : (
                filteredMaterials.map((material: MaterialWithSkus) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}