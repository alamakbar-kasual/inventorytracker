import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaterialWithSkus } from "@shared/schema";
import { Edit, Trash2, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface MaterialTableViewProps {
  materials: MaterialWithSkus[];
  onEdit: (material: MaterialWithSkus) => void;
  onDelete: (id: number) => void;
}

export function MaterialTableView({ materials, onEdit, onDelete }: MaterialTableViewProps) {
  const [sortField, setSortField] = useState<keyof MaterialWithSkus>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof MaterialWithSkus) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedMaterials = [...materials].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getStockStatus = (material: MaterialWithSkus) => {
    if (material.quantity <= 0) {
      return { status: "out", color: "bg-red-500 text-white", icon: AlertTriangle };
    } else if (material.quantity <= (material.minStockLevel || 10)) {
      return { status: "low", color: "bg-yellow-500 text-white", icon: Clock };
    } else {
      return { status: "good", color: "bg-green-500 text-white", icon: CheckCircle };
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof Material; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          <span className="text-xs text-gray-500">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
            <SortableHeader field="name">Material</SortableHeader>
            <SortableHeader field="category">Category</SortableHeader>
            <SortableHeader field="quantity">Stock</SortableHeader>
            <TableHead>Status</TableHead>
            <SortableHeader field="sku">SKU</SortableHeader>
            <SortableHeader field="supplierName">Supplier</SortableHeader>
            <SortableHeader field="dateOfPurchase">Purchase Date</SortableHeader>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMaterials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No materials found</p>
                <p className="text-sm">Add your first material to get started</p>
              </TableCell>
            </TableRow>
          ) : (
            sortedMaterials.map((material) => {
              const stockStatus = getStockStatus(material);
              const StatusIcon = stockStatus.icon;
              
              return (
                <TableRow 
                  key={material.id} 
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{material.name}</div>
                      {material.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          {material.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {material.category}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {material.quantity} {material.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {material.minStockLevel || 10}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={`${stockStatus.color} flex items-center gap-1 w-fit`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{stockStatus.status}</span>
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {material.sku}
                    </code>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {material.supplierName || "—"}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {material.dateOfPurchase 
                        ? format(new Date(material.dateOfPurchase), "MMM dd, yyyy")
                        : "—"
                      }
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(material)}
                        title="Edit material"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(material.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete material"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}