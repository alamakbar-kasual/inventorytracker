import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
}

interface MaterialConsumption {
  id: number;
  materialId: number;
  quantityUsed: number;
  quantityProduced: number;
  consumedAt: string;
}

interface AnalyticsChartsProps {
  materials: Material[];
  consumptionData: MaterialConsumption[];
}

// Stock Levels Doughnut Chart
export function StockLevelsChart({ materials }: { materials: Material[] }) {
  const stockCategories = materials.reduce(
    (acc, material) => {
      const stockPercentage = (material.quantity / material.maxStock) * 100;
      if (stockPercentage <= 20) acc.critical++;
      else if (stockPercentage <= 50) acc.low++;
      else if (stockPercentage <= 80) acc.normal++;
      else acc.high++;
      return acc;
    },
    { critical: 0, low: 0, normal: 0, high: 0 }
  );

  const data = {
    labels: ['Critical Stock', 'Low Stock', 'Normal Stock', 'High Stock'],
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
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} materials (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

// Usage Trends Line Chart
export function UsageTrendsChart({ materials, consumptionData }: AnalyticsChartsProps) {
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, 'MMM dd');
  });

  // Calculate daily usage for each material
  const materialUsage = materials.slice(0, 3).map((material) => {
    const materialConsumption = consumptionData.filter(c => c.materialId === material.id);
    
    const dailyUsage = last7Days.map((_, dayIndex) => {
      const targetDate = subDays(new Date(), 6 - dayIndex);
      const dayConsumption = materialConsumption.filter(c => {
        const consumedDate = parseISO(c.consumedAt);
        return format(consumedDate, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd');
      });
      return dayConsumption.reduce((sum, c) => sum + c.quantityUsed, 0);
    });

    return {
      label: material.name,
      data: dailyUsage,
      borderColor: getColorForMaterial(material.id),
      backgroundColor: getColorForMaterial(material.id, 0.1),
      tension: 0.4,
    };
  });

  const data = {
    labels: last7Days,
    datasets: materialUsage,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Material Usage Trends (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity Used',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

// Stock vs. Usage Bar Chart
export function StockVsUsageChart({ materials, consumptionData }: AnalyticsChartsProps) {
  const materialNames = materials.slice(0, 5).map(m => m.name.split(' ').slice(0, 2).join(' '));
  const currentStock = materials.slice(0, 5).map(m => m.quantity);
  
  // Calculate total usage in last 30 days for each material
  const last30DaysUsage = materials.slice(0, 5).map((material) => {
    const materialConsumption = consumptionData.filter(c => c.materialId === material.id);
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    return materialConsumption
      .filter(c => parseISO(c.consumedAt) >= thirtyDaysAgo)
      .reduce((sum, c) => sum + c.quantityUsed, 0);
  });

  const data = {
    labels: materialNames,
    datasets: [
      {
        label: 'Current Stock',
        data: currentStock,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: '30-Day Usage',
        data: last30DaysUsage,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Current Stock vs. 30-Day Usage',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

// Consumption Rate Chart
export function ConsumptionRateChart({ materials, consumptionData }: AnalyticsChartsProps) {
  // Calculate efficiency (quantity produced / quantity used) for each material
  const efficiencyData = materials.slice(0, 5).map((material) => {
    const materialConsumption = consumptionData.filter(c => c.materialId === material.id);
    
    if (materialConsumption.length === 0) return 0;
    
    const totalUsed = materialConsumption.reduce((sum, c) => sum + c.quantityUsed, 0);
    const totalProduced = materialConsumption.reduce((sum, c) => sum + c.quantityProduced, 0);
    
    return totalUsed > 0 ? (totalProduced / totalUsed) : 0;
  });

  const materialNames = materials.slice(0, 5).map(m => m.name.split(' ').slice(0, 2).join(' '));

  const data = {
    labels: materialNames,
    datasets: [
      {
        label: 'Production Efficiency Ratio',
        data: efficiencyData,
        backgroundColor: efficiencyData.map((ratio) => {
          if (ratio >= 2) return 'rgba(34, 197, 94, 0.8)';   // green for good efficiency
          if (ratio >= 1) return 'rgba(245, 158, 11, 0.8)';  // amber for average
          return 'rgba(239, 68, 68, 0.8)';                   // red for poor
        }),
        borderColor: efficiencyData.map((ratio) => {
          if (ratio >= 2) return 'rgba(34, 197, 94, 1)';
          if (ratio >= 1) return 'rgba(245, 158, 11, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Production Efficiency (Products per Material Unit)',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const ratio = context.parsed.y;
            return `Efficiency: ${ratio.toFixed(2)} products per material unit`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Efficiency Ratio',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

// Helper function to get consistent colors for materials
function getColorForMaterial(materialId: number, alpha: number = 1) {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`,   // blue
    `rgba(16, 185, 129, ${alpha})`,   // emerald
    `rgba(245, 158, 11, ${alpha})`,   // amber
    `rgba(239, 68, 68, ${alpha})`,    // red
    `rgba(168, 85, 247, ${alpha})`,   // purple
    `rgba(236, 72, 153, ${alpha})`,   // pink
  ];
  return colors[materialId % colors.length];
}