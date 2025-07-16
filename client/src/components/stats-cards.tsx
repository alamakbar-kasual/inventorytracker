import { Card } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalItems: number;
    lowStock: number;
    categories: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="glassmorphism dark:glassmorphism-dark p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalItems}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="glassmorphism dark:glassmorphism-dark p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
            <p className="text-2xl font-bold text-red-500">
              {stats.lowStock}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );
}
