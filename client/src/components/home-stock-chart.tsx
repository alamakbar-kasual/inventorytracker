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
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Eye,
  ArrowRight,
  ShoppingCart,
  Activity
} from "lucide-react";

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
  onAddMaterial?: () => void;
  onViewAnalytics?: () => void;
}

export function HomeStockChart({ materials, onAddMaterial, onViewAnalytics }: HomeStockChartProps) {
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

  // Get critical and low stock items for quick access
  const criticalMaterials = materials.filter(m => {
    const stockPercentage = (m.quantity / (m.maxStock || 100)) * 100;
    return stockPercentage <= 20;
  });

  const lowStockMaterials = materials.filter(m => {
    const stockPercentage = (m.quantity / (m.maxStock || 100)) * 100;
    return stockPercentage > 20 && stockPercentage <= 50;
  });

  const stockHealth = stockCategories.critical === 0 && stockCategories.low <= 1 ? 'excellent' :
                     stockCategories.critical === 0 && stockCategories.low <= 2 ? 'good' :
                     stockCategories.critical <= 1 ? 'warning' : 'critical';

  const getHealthColor = () => {
    switch (stockHealth) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBg = () => {
    switch (stockHealth) {
      case 'excellent': return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'good': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'warning': return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'critical': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card className={`backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 ${getHealthBg()} transition-all duration-300`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getHealthBg()}`}>
              <Activity className={`h-5 w-5 ${getHealthColor()}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Stock Health Overview</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stockHealth === 'excellent' && "All systems running smoothly"}
                {stockHealth === 'good' && "Mostly healthy with minor attention needed"}
                {stockHealth === 'warning' && "Some materials need restocking soon"}
                {stockHealth === 'critical' && "Immediate action required"}
              </p>
            </div>
          </div>
          <Badge variant={stockHealth === 'critical' ? 'destructive' : stockHealth === 'warning' ? 'secondary' : 'default'}>
            {stockHealth.charAt(0).toUpperCase() + stockHealth.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{materials.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-600">{stockCategories.critical}</div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="text-2xl font-bold text-orange-600">{stockCategories.low}</div>
            <div className="text-sm text-orange-600">Low Stock</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600">{stockCategories.normal + stockCategories.high}</div>
            <div className="text-sm text-green-600">Healthy</div>
          </div>
        </div>

        {/* Critical Items Alert */}
        {(criticalMaterials.length > 0 || lowStockMaterials.length > 0) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Items Needing Attention
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {criticalMaterials.slice(0, 3).map(material => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{material.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {material.quantity} {material.unit} remaining
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                </div>
              ))}
              {lowStockMaterials.slice(0, 2).map(material => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{material.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {material.quantity} {material.unit} remaining
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Low</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onAddMaterial}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
          
          {(criticalMaterials.length > 0 || lowStockMaterials.length > 0) && (
            <Button variant="outline" className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Reorder List
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onViewAnalytics}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Mini Chart */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-2">Stock Distribution</h4>
            <div className="w-24 h-24">
              <Doughnut 
                data={chartData} 
                options={{
                  ...options,
                  plugins: {
                    ...options.plugins,
                    legend: { display: false }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="flex-1 space-y-2 ml-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Critical ({stockCategories.critical})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm">Low ({stockCategories.low})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Normal ({stockCategories.normal})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">High ({stockCategories.high})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}