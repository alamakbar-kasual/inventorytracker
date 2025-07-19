import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, RefreshCw, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import type { MaterialWithSkus } from "@shared/schema";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("finance");

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Calculate financial metrics
  const financialMetrics = {
    totalValue: materials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
    totalItems: materials.reduce((sum: number, material: MaterialWithSkus) => sum + material.quantity, 0),
    averageValue: materials.length > 0 ? materials.reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0) / materials.length : 0,
    lowStockValue: materials.filter((m: MaterialWithSkus) => m.quantity <= (m.minStockLevel || 10)).reduce((sum: number, material: MaterialWithSkus) => sum + (material.totalValue || 0), 0),
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
              {materials.map((material: MaterialWithSkus) => (
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
              ))}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}