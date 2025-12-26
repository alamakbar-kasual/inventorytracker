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
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MaterialCompactViewProps {
  materials: MaterialWithSkus[];
  onEdit: (material: MaterialWithSkus) => void;
  onDelete: (id: number) => void;
}

export function MaterialCompactView({ materials, onEdit, onDelete }: MaterialCompactViewProps) {
  const getStockStatus = (material: MaterialWithSkus) => {
    if (material.quantity <= 0) {
      return { status: "out", color: "text-red-500", icon: AlertTriangle };
    } else if (material.quantity <= (material.minStockLevel || 10)) {
      return { status: "low", color: "text-yellow-600", icon: Clock };
    } else {
      return { status: "good", color: "text-green-600", icon: CheckCircle };
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
    <div className="space-y-2">
      {materials.map((material) => {
        const stockStatus = getStockStatus(material);
        const StatusIcon = stockStatus.icon;
        
        return (
          <div 
            key={material.id}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border rounded-lg p-3 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusIcon className={`w-4 h-4 ${stockStatus.color} flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{material.name}</h3>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {material.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{material.quantity} {material.unit}</span>
                    <span>SKU: {material.skus?.[0]?.sku || 'No SKU'}</span>
                    {material.supplierName && (
                      <span className="hidden sm:inline">Supplier: {material.supplierName}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(material)}
                    title="Edit material"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(material.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Mobile dropdown menu */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(material)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(material.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            {/* Additional details for wider screens */}
            {(material.description || material.usageForProduct) && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 hidden lg:block">
                {material.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {material.description}
                  </p>
                )}
                {material.usageForProduct && (
                  <p className="text-sm text-gray-500">
                    <strong>Used for:</strong> {material.usageForProduct}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}