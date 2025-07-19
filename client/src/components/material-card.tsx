import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Copy, TriangleAlert, Shirt, Circle, Scissors, Zap, Calendar, User, Ruler, Package, Target } from "lucide-react";
import { MaterialWithSkus } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MaterialCardProps {
  material: MaterialWithSkus;
  onEdit: (material: MaterialWithSkus) => void;
  onDelete: (id: number) => void;
  onDuplicate: (material: MaterialWithSkus) => void;
  onUseMaterial: (material: MaterialWithSkus) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "fabrics":
      return <Shirt className="w-5 h-5 text-white" />;
    case "buttons":
      return <Circle className="w-5 h-5 text-white" />;
    case "threads":
      return <Scissors className="w-5 h-5 text-white" />;
    case "zippers":
      return <Zap className="w-5 h-5 text-white" />;
    default:
      return <Circle className="w-5 h-5 text-white" />;
  }
};

const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case "fabrics":
      return "from-blue-500 to-purple-600";
    case "buttons":
      return "from-green-500 to-teal-600";
    case "threads":
      return "from-red-500 to-pink-600";
    case "zippers":
      return "from-purple-500 to-indigo-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export function MaterialCard({ material, onEdit, onDelete, onDuplicate, onUseMaterial }: MaterialCardProps) {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const isLowStock = material.quantity <= (material.minStockLevel || 10);

  const handleSwipe = () => {
    setIsSwipeActive(true);
    setTimeout(() => setIsSwipeActive(false), 2000);
  };

  return (
    <Card
      className={cn(
        "glassmorphism dark:glassmorphism-dark p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        isLowStock && "border-l-4 border-l-red-500",
        isSwipeActive && "transform -translate-x-20"
      )}
      onClick={handleSwipe}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r", getCategoryGradient(material.category))}>
            {getCategoryIcon(material.category)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {material.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {material.description || "No description"}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {material.category}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {material.skus?.slice(0, 2).map((sku) => (
                  <span key={sku.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {sku.sku}
                  </span>
                ))}
                {material.skus && material.skus.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{material.skus.length - 2}</span>
                )}
                {!material.skus || material.skus.length === 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">No SKUs</span>
                )}
              </div>
            </div>
            
            {/* Enhanced Material Info */}
            <div className="mt-2 space-y-1">
              {material.supplierName && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <User className="w-3 h-3 mr-1" />
                  {material.supplierName}
                </div>
              )}
              
              {material.dateOfPurchase && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(material.dateOfPurchase), 'MMM dd, yyyy')}
                </div>
              )}
              
              {material.totalYards && material.category.toLowerCase() === 'fabrics' && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Ruler className="w-3 h-3 mr-1" />
                  {material.totalYards} yards total
                </div>
              )}
              
              {material.usageForProduct && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Package className="w-3 h-3 mr-1" />
                  For: {material.usageForProduct}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-lg font-bold", isLowStock ? "text-red-500" : "text-gray-900 dark:text-white")}>
            {material.quantity} {material.unit}
          </p>
          <p className={cn("text-sm flex items-center", isLowStock ? "text-red-500" : "text-green-500")}>
            {isLowStock && <TriangleAlert className="w-4 h-4 mr-1" />}
            {isLowStock ? "Low Stock" : "In Stock"}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onUseMaterial(material);
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Target className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(material);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(material);
          }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(material.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
