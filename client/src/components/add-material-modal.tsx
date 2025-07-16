import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMaterialSchema, categories, type InsertMaterial, type Material } from "@shared/schema";
import { z } from "zod";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertMaterial) => void;
  editingMaterial?: Material;
}

const formSchema = insertMaterialSchema.extend({
  minStockLevel: z.coerce.number().min(0).default(10),
  quantity: z.coerce.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

export function AddMaterialModal({ isOpen, onClose, onSubmit, editingMaterial }: AddMaterialModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingMaterial ? {
      name: editingMaterial.name,
      description: editingMaterial.description || "",
      category: editingMaterial.category,
      quantity: editingMaterial.quantity,
      unit: editingMaterial.unit,
      sku: editingMaterial.sku,
      minStockLevel: editingMaterial.minStockLevel || 10,
    } : {
      name: "",
      description: "",
      category: "",
      quantity: 0,
      unit: "",
      sku: "",
      minStockLevel: 10,
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to submit material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSKU = () => {
    const category = form.watch("category");
    const name = form.watch("name");
    
    if (category && name) {
      const categoryPrefix = category.substring(0, 3).toUpperCase();
      const namePrefix = name.substring(0, 3).toUpperCase();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const sku = `${categoryPrefix}-${namePrefix}-${random}`;
      form.setValue("sku", sku);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism dark:glassmorphism-dark max-w-md mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {editingMaterial ? "Edit Material" : "Add New Material"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Material Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter material name"
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
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
                  <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter material description"
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Unit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="meters"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Minimum Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="10"
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">SKU</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Auto-generated"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSKU}
                className="mt-6"
              >
                Generate
              </Button>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isSubmitting ? "Saving..." : editingMaterial ? "Update" : "Add Material"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
