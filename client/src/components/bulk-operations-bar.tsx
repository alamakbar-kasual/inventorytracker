import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Edit, 
  Trash2, 
  Download, 
  Package,
  Tag,
  Factory,
  Calendar,
  CheckSquare,
  Square
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@shared/schema";
import { MaterialWithSkus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected: boolean;
  onBulkUpdate: (updates: any) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkExport: () => void;
  selectedMaterials: MaterialWithSkus[];
}

export function BulkOperationsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  onBulkUpdate,
  onBulkDelete,
  onBulkExport,
  selectedMaterials,
}: BulkOperationsBarProps) {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({
    category: "",
    minStockLevel: "",
    supplierName: "",
    unit: "",
  });

  if (selectedCount === 0) return null;

  const handleBulkEdit = async () => {
    const updates: any = {};
    if (bulkUpdates.category) updates.category = bulkUpdates.category;
    if (bulkUpdates.minStockLevel) updates.minStockLevel = parseInt(bulkUpdates.minStockLevel);
    if (bulkUpdates.supplierName) updates.supplierName = bulkUpdates.supplierName;
    if (bulkUpdates.unit) updates.unit = bulkUpdates.unit;

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes",
        description: "Please select at least one field to update",
        variant: "destructive",
      });
      return;
    }

    await onBulkUpdate(updates);
    setIsEditModalOpen(false);
    setBulkUpdates({
      category: "",
      minStockLevel: "",
      supplierName: "",
      unit: "",
    });
  };

  const handleBulkDelete = async () => {
    await onBulkDelete();
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-in slide-in-from-bottom-2">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
                className="text-white hover:bg-white/20"
              >
                {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </Button>
              <span className="font-medium">
                {selectedCount} of {totalCount} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Edit className="w-4 h-4 mr-2" />
                    Bulk Edit
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Tag className="w-4 h-4 mr-2" />
                    Edit Properties
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onBulkExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedCount})
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClearSelection}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedCount} Materials</DialogTitle>
            <DialogDescription>
              Leave fields empty to keep current values unchanged.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="bulk-category">Category</Label>
              <Select value={bulkUpdates.category} onValueChange={(value) => setBulkUpdates({...bulkUpdates, category: value})}>
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Keep current categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-supplier">Supplier Name</Label>
              <Input
                id="bulk-supplier"
                placeholder="Keep current suppliers"
                value={bulkUpdates.supplierName}
                onChange={(e) => setBulkUpdates({...bulkUpdates, supplierName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="bulk-min-stock">Minimum Stock Level</Label>
              <Input
                id="bulk-min-stock"
                type="number"
                placeholder="Keep current levels"
                value={bulkUpdates.minStockLevel}
                onChange={(e) => setBulkUpdates({...bulkUpdates, minStockLevel: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="bulk-unit">Unit</Label>
              <Input
                id="bulk-unit"
                placeholder="Keep current units"
                value={bulkUpdates.unit}
                onChange={(e) => setBulkUpdates({...bulkUpdates, unit: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Update {selectedCount} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} materials? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Materials to be deleted:
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 max-h-32 overflow-y-auto">
                {selectedMaterials.slice(0, 5).map((material) => (
                  <li key={material.id}>• {material.name}</li>
                ))}
                {selectedMaterials.length > 5 && (
                  <li className="font-medium">... and {selectedMaterials.length - 5} more</li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedCount} Materials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}