import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { insertMaterialConsumptionSchema, type InsertMaterialConsumption, type Material, type Product, type ProductSku } from "@shared/schema";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Ruler, Package, Scissors } from "lucide-react";

interface MaterialConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertMaterialConsumption) => void;
  material: Material;
}

const formSchema = insertMaterialConsumptionSchema.extend({
  quantityUsed: z.coerce.number().min(0.1),
  quantityProduced: z.coerce.number().min(1).default(1),
});

type FormData = z.infer<typeof formSchema>;

export function MaterialConsumptionModal({ isOpen, onClose, onSubmit, material }: MaterialConsumptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchOnWindowFocus: false,
  });

  // Fetch product SKUs for selected product
  const { data: productSkus = [] } = useQuery<ProductSku[]>({
    queryKey: ["/api/products", selectedProduct, "skus"],
    enabled: !!selectedProduct,
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialId: material.id,
      productSkuId: 0,
      quantityUsed: 0,
      quantityProduced: 1,
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to record consumption:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (value: string) => {
    const productId = parseInt(value);
    setSelectedProduct(productId);
    form.setValue("productSkuId", 0);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism dark:glassmorphism-dark max-w-md mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Use Material for Production
          </DialogTitle>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary">{material.category}</Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {material.name}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4 mr-1" />
            Available: {material.quantity} {material.unit}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Product
                </label>
                <Select onValueChange={handleProductChange}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <FormField
                  control={form.control}
                  name="productSkuId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Size/SKU</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productSkus.map((sku) => (
                            <SelectItem key={sku.id} value={sku.id.toString()}>
                              {sku.size} - {sku.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantityUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Ruler className="w-4 h-4 mr-1" />
                          Per Unit ({material.unit})
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="1.1"
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantityProduced"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Scissors className="w-4 h-4 mr-1" />
                          Items Made
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="5"
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("quantityUsed") && form.watch("quantityProduced") && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Total Usage:</strong> {form.watch("quantityUsed") * form.watch("quantityProduced")} {material.unit}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Remaining:</strong> {material.quantity - (form.watch("quantityUsed") * form.watch("quantityProduced"))} {material.unit}
                  </div>
                </div>
              )}
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
                disabled={isSubmitting || !selectedProduct || !form.watch("productSkuId")}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isSubmitting ? "Recording..." : "Use Material"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}