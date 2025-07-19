import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Material {
  id: number;
  name: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  category: string;
}

interface HomeStockChartProps {
  materials: Material[];
}

export function HomeStockChart({ materials }: HomeStockChartProps) {
  // Calculate stock level categories
  const stockCategories = materials.reduce(
    (acc, material) => {
      const stockPercentage = (material.quantity / (material.maxStock || 100)) * 100;
      if (stockPercentage <= 20) {
        acc.critical++;
      } else if (stockPercentage <= 50) {
        acc.low++;
      } else if (stockPercentage <= 80) {
        acc.normal++;
      } else {
        acc.high++;
      }
      return acc;
    },
    { critical: 0, low: 0, normal: 0, high: 0 }
  );

  // Prepare chart data
  const chartData = {
    labels: ['Critical', 'Low', 'Normal', 'High'],
    datasets: [
      {
        data: [stockCategories.critical, stockCategories.low, stockCategories.normal, stockCategories.high],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red for critical
          'rgba(245, 158, 11, 0.8)',  // amber for low
          'rgba(34, 197, 94, 0.8)',   // green for normal
          'rgba(59, 130, 246, 0.8)',  // blue for high
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${value} materials (${percentage}%)`;
          },
        },
      },
    },
  };

  // Category breakdown for quick stats
  const categoryBreakdown = materials.reduce((acc, material) => {
    acc[material.category] = (acc[material.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Stock Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="h-48">
              <Doughnut data={chartData} options={options} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Materials</span>
                  <span className="font-semibold">{materials.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400">Need Attention</span>
                  <span className="font-semibold text-red-600">{stockCategories.critical + stockCategories.low}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Well Stocked</span>
                  <span className="font-semibold text-green-600">{stockCategories.normal + stockCategories.high}</span>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            {topCategories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Top Categories</h4>
                <div className="space-y-1">
                  {topCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {category}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="font-bold text-red-600">{stockCategories.critical}</div>
                <div className="text-red-500">Critical</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="font-bold text-orange-600">{stockCategories.low}</div>
                <div className="text-orange-500">Low</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}