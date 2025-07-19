import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";

export default function Finance() {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const totalValue = materials.reduce((sum, m) => sum + (m.totalValue || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <p>Loading...</p>
        <BottomNav activeTab="finance" onTabChange={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">Finance</h1>
        </div>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-600">{materials.length} materials</p>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {materials.slice(0, 10).map(material => (
                  <div key={material.id} className="p-2 border rounded">
                    <div className="flex justify-between">
                      <span>{material.name}</span>
                      <span>{formatCurrency(material.totalValue || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav activeTab="finance" onTabChange={() => {}} />
    </div>
  );
}