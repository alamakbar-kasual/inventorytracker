import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Package, Tag, X } from "lucide-react";
import { 
  insertMaterialSkuSchema, 
  updateMaterialSkuSchema, 
  type MaterialSku,
  type InsertMaterialSku,
  type UpdateMaterialSku 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface SkuManagementProps {
  materialId: number;
  materialName: string;
  existingSkus?: MaterialSku[];
}

export function SkuManagement({ materialId, materialName, existingSkus = [] }: SkuManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<MaterialSku | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch material SKUs
  const { data: skus = existingSkus, isLoading } = useQuery({
    queryKey: [`/api/materials/${materialId}/skus`],
    initialData: existingSkus,
  });

  // Add SKU mutation
  const addSkuMutation = useMutation({
    mutationFn: async (data: InsertMaterialSku) => {
      return await apiRequest(`/api/materials/${materialId}/skus`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/materials/${materialId}/skus`] });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsAddDialogOpen(false);
      toast({
        title: "SKU Added",
        description: "Material SKU has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update SKU mutation
  const updateSkuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMaterialSku }) => {
      return await apiRequest(`/api/material-skus/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/materials/${materialId}/skus`] });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setEditingSku(null);
      toast({
        title: "SKU Updated",
        description: "Material SKU has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete SKU mutation
  const deleteSkuMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/material-skus/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/materials/${materialId}/skus`] });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "SKU Deleted",
        description: "Material SKU has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SKU Management</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            SKU Management for {materialName}
          </h3>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add SKU
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New SKU</DialogTitle>
            </DialogHeader>
            <SkuForm
              onSubmit={(data) => addSkuMutation.mutate(data)}
              isLoading={addSkuMutation.isPending}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {skus.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No SKUs defined for this material</p>
          <p className="text-sm">Add your first SKU to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {skus.map((sku) => (
            <div
              key={sku.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <Badge variant={sku.isActive ? "default" : "secondary"}>
                  {sku.sku}
                </Badge>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {sku.description || "No description"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sku.isActive ? "Active" : "Inactive"} • Added {new Date(sku.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSku(sku)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteSkuMutation.mutate(sku.id)}
                  disabled={deleteSkuMutation.isPending}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSku && (
        <Dialog open={true} onOpenChange={() => setEditingSku(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit SKU: {editingSku.sku}</DialogTitle>
            </DialogHeader>
            <SkuForm
              initialData={editingSku}
              onSubmit={(data) => updateSkuMutation.mutate({ id: editingSku.id, data })}
              isLoading={updateSkuMutation.isPending}
              onCancel={() => setEditingSku(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface SkuFormProps {
  initialData?: MaterialSku;
  onSubmit: (data: InsertMaterialSku | UpdateMaterialSku) => void;
  isLoading: boolean;
  onCancel: () => void;
}

function SkuForm({ initialData, onSubmit, isLoading, onCancel }: SkuFormProps) {
  const form = useForm<InsertMaterialSku | UpdateMaterialSku>({
    resolver: zodResolver(initialData ? updateMaterialSkuSchema : insertMaterialSkuSchema),
    defaultValues: {
      sku: initialData?.sku || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., FABRIC-001, BTN-GOLD-12MM"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this SKU variant..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Enable this SKU for inventory tracking
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update SKU" : "Add SKU"}
          </Button>
        </div>
      </form>
    </Form>
  );
}