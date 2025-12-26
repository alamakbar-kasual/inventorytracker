import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaterialWithSkus } from "@shared/schema";
import { 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Calendar,
  User,
  Hash
} from "lucide-react";
import { format } from "date-fns";

interface MaterialListViewProps {
  materials: MaterialWithSkus[];
  onEdit: (material: MaterialWithSkus) => void;
  onDelete: (id: number) => void;
}

export function MaterialListView({ materials, onEdit, onDelete }: MaterialListViewProps) {
  const getStockStatus = (material: MaterialWithSkus) => {
    if (material.quantity <= 0) {
      return { status: "out", color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20", icon: AlertTriangle };
    } else if (material.quantity <= (material.minStockLevel || 10)) {
      return { status: "low", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", icon: Clock };
    } else {
      return { status: "good", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle };
    }
  };

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No materials found</p>
        <p className="text-sm">Add your first material to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => {
        const stockStatus = getStockStatus(material);
        const StatusIcon = stockStatus.icon;
        
        return (
          <div 
            key={material.id}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stockStatus.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${stockStatus.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{material.name}</h3>
                  {material.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(material)}
                  title="Edit material"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(material.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete material"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Stock</p>
                  <p className="font-medium">{material.quantity} {material.unit}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {material.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">SKU</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {material.skus?.[0]?.sku || 'No SKU'}
                  </code>
                </div>
              </div>
              
              {material.supplierName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Supplier</p>
                    <p className="font-medium">{material.supplierName}</p>
                  </div>
                </div>
              )}
              
              {material.dateOfPurchase && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Purchased</p>
                    <p className="font-medium">
                      {format(new Date(material.dateOfPurchase), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="text-gray-500">Min Stock: {material.minStockLevel || 10}</div>
              </div>
            </div>
            
            {material.usageForProduct && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Used for:</strong> {material.usageForProduct}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}